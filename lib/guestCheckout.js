import { stripe, syncSubscription, receiptFor, isMember, priceId } from "./stripeServer";
import { saveMarketingConsent } from "./marketingServer";
import { marketingSourceForPlan } from "./marketing";

// Pay-first checkout: signed-out buyers pay on Stripe, then create a password on /welcome
// (or log in / sign up later with the same email) and the purchase is attached to the account.

const TRIP_TEXT = ["origin", "destination", "airline", "flight_number", "animal_type", "role", "return_flight_number", "service_kind"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Whitelist the assessment answers into trip columns. Returns null if the trip is unusable.
export function cleanTrip(a) {
  if (!a || typeof a !== "object") return null;
  const t = {
    origin: a.origin, destination: a.destination, airline: a.airline, travel_date: a.date,
    flight_number: a.flight_number || null, animal_type: a.animal, role: a.role,
  };
  if (a.round_trip && a.return_date) { t.return_date = a.return_date; t.return_flight_number = a.return_flight_number || null; }
  if (a.role === "Service animal" && a.psd) t.service_kind = "psd";
  for (const k of TRIP_TEXT) if (t[k] != null) { if (typeof t[k] !== "string") return null; t[k] = t[k].slice(0, 200); }
  if (!t.origin || !t.destination || !t.airline || !DATE.test(String(t.travel_date || ""))) return null;
  if (t.return_date && !DATE.test(String(t.return_date))) delete t.return_date;
  for (const k of ["flight_snapshot", "return_flight_snapshot"]) {
    const v = k === "flight_snapshot" ? a.flight_snapshot : a.return_flight_snapshot;
    if (v && typeof v === "object" && JSON.stringify(v).length < 8000 && (k === "flight_snapshot" || t.return_date)) t[k] = v;
  }
  return t;
}

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

function namesFrom(session) {
  const f = {};
  for (const c of session.custom_fields || []) f[c.key] = (c.text?.value || "").trim().slice(0, 60);
  const full = (session.customer_details?.name || "").trim();
  return { first_name: f.first_name || full.split(" ")[0] || "", last_name: f.last_name || full.split(" ").slice(1).join(" ") || "" };
}

export function isPaid(session) {
  return session?.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
}

function paidFields(session) {
  const n = namesFrom(session);
  const id = (x) => (typeof x === "string" ? x : x?.id || null);
  return {
    stripe_checkout_session_id: session.id,
    stripe_customer_id: id(session.customer),
    stripe_subscription_id: id(session.subscription),
    stripe_payment_intent_id: id(session.payment_intent),
    stripe_invoice_id: id(session.invoice),
    email: (session.customer_details?.email || session.customer_email || "").toLowerCase() || null,
    first_name: n.first_name || null,
    last_name: n.last_name || null,
    amount_cents: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: session.currency || "usd",
    paid_at: new Date().toISOString(),
  };
}

// Save Stripe's paid details on the guest row (idempotent). Returns the row.
async function markPaid(sb, session) {
  const gid = session.metadata?.guest_checkout_id;
  if (!gid) return null;
  const { data: row } = await sb.from("guest_checkouts").select("*").eq("id", gid).maybeSingle();
  if (!row) return null;
  if (row.stripe_checkout_session_id && row.stripe_checkout_session_id !== session.id) return null;
  if (row.paid_at) return row;
  const { data: upd, error } = await sb.from("guest_checkouts").update(paidFields(session)).eq("id", gid).select("*").single();
  if (error) throw error;
  return upd;
}

export async function userIdByEmail(sb, email) {
  if (!email) return null;
  const { data, error } = await sb.rpc("auth_user_id_by_email", { p_email: email });
  if (error) throw error;
  return data || null;
}

// Webhook: a guest paid. Record it; if an account with that email already exists, attach it now.
export async function recordGuestPayment(sb, session) {
  if (!isPaid(session)) return;
  const row = await markPaid(sb, session);
  if (!row || row.claimed_at) return;
  const uid = await userIdByEmail(sb, row.email);
  if (uid) await claimGuestCheckout(sb, row, uid, session);
}

// Retrieve + verify a guest session from Stripe (never trust the client). Returns { session, row } or null.
export async function loadPaidGuestSession(sb, sessionId) {
  if (!SESSION_ID.test(String(sessionId || ""))) return null;
  let session;
  try { session = await stripe().checkout.sessions.retrieve(sessionId); } catch { return null; }
  if (!session.metadata?.guest_checkout_id || !isPaid(session)) return null;
  const row = await markPaid(sb, session);
  if (!row) return null;
  return { session, row };
}

// Attach a paid guest purchase to an account, exactly once.
export async function claimGuestCheckout(sb, row, userId, session) {
  const now = new Date().toISOString();
  const { data: locked } = await sb.from("guest_checkouts").update({ claimed_user_id: userId, claimed_at: now })
    .eq("id", row.id).is("claimed_at", null).select("*").maybeSingle();
  if (!locked) return { already: true };
  try {
    // Safety net: the account is already an active member (e.g. paid as a guest anyway).
    const wasMember = await isMember(sb, userId);
    const customerId = locked.stripe_customer_id;
    if (customerId && wasMember) {
      const { data: existing } = await sb.from("stripe_customers").select("customer_id").eq("user_id", userId).maybeSingle();
      if (!existing) await sb.from("stripe_customers").upsert({ user_id: userId, customer_id: customerId });
      try { await stripe().customers.update(customerId, { metadata: { user_id: userId } }); } catch {}
    } else if (customerId) {
      const { data: existing } = await sb.from("stripe_customers").select("customer_id").eq("user_id", userId).maybeSingle();
      // Membership lives on the new customer, so point the account at it; a pass keeps an existing link.
      if (!existing || (locked.plan !== "pass" && existing.customer_id !== customerId)) {
        const { error } = await sb.from("stripe_customers").upsert({ user_id: userId, customer_id: customerId });
        if (error) throw error;
      }
      try { await stripe().customers.update(customerId, { metadata: { user_id: userId } }); } catch {}
    }
    let tripId = null;
    if (locked.plan !== "membership" && locked.trip) {
      const base = { ...locked.trip, user_id: userId, status: "ready", paid: true, paid_at: locked.paid_at || now, stripe_checkout_session_id: locked.stripe_checkout_session_id };
      let { data: trip, error } = await sb.from("trips").insert(base).select("id").single();
      if (error) {
        const { return_date, return_flight_number, return_flight_snapshot, service_kind, ...lean } = base;
        ({ data: trip, error } = await sb.from("trips").insert(lean).select("id").single());
      }
      if (error) throw error;
      tripId = trip.id;
      try {
        const { data: pets } = await sb.from("pets").select("id,animal_type").eq("user_id", userId);
        const type = locked.trip?.animal_type;
        const same = (pets || []).filter((p) => !type || String(p.animal_type || "").toLowerCase() === String(type).toLowerCase());
        const pick = same.length === 1 ? same[0] : (pets || []).length === 1 ? pets[0] : null;
        if (pick) await sb.from("trips").update({ pet_id: pick.id }).eq("id", tripId);
      } catch {}
      await sb.from("guest_checkouts").update({ claimed_trip_id: tripId }).eq("id", locked.id);
    }
    const { error: pErr } = await sb.from("purchases").insert({
      user_id: userId, trip_id: tripId, kind: locked.plan, amount_cents: locked.amount_cents, currency: locked.currency || "usd",
      stripe_checkout_session_id: locked.stripe_checkout_session_id, stripe_payment_intent_id: locked.stripe_payment_intent_id,
      stripe_invoice_id: locked.stripe_invoice_id, receipt_url: await receiptFor(session || locked),
    });
    if (pErr && pErr.code !== "23505") throw pErr;
    await sb.from("withdrawal_consents").update({ user_id: userId }).eq("guest_checkout_id", locked.id).is("user_id", null);
    if (locked.marketing_opt_in) await saveMarketingConsent(sb, userId, { optIn: true, source: marketingSourceForPlan(locked.plan) });
    if (wasMember) await memberSafetyNet(sb, locked, userId, session);
    else if (locked.stripe_subscription_id) {
      const sub = await stripe().subscriptions.update(locked.stripe_subscription_id, { metadata: { user_id: userId } });
      await syncSubscription(sb, sub, userId);
    }
    return { claimed: true, tripId, plan: locked.plan };
  } catch (e) {
    await sb.from("guest_checkouts").update({ claimed_user_id: null, claimed_at: null }).eq("id", locked.id).is("claimed_trip_id", null);
    throw e;
  }
}

// Signed-in user: claim any paid guest purchases made with their email (closed the tab, etc.).
export async function claimForUser(sb, user) {
  const email = (user?.email || "").toLowerCase();
  if (!email) return [];
  const out = [];
  const seen = new Set();
  // 1) Stripe is the source of truth (works even if the webhook hasn't arrived).
  try {
    const list = await stripe().checkout.sessions.list({ customer_details: { email }, limit: 20 });
    for (const s of list.data) {
      if (!s.metadata?.guest_checkout_id || !isPaid(s)) continue;
      seen.add(s.id);
      const row = await markPaid(sb, s);
      if (row && !row.claimed_at) out.push(await claimGuestCheckout(sb, row, user.id, s));
    }
  } catch (e) { console.error("claim list", e?.message); }
  // 2) Rows recorded by the webhook (email typed with different casing, etc.).
  const { data: rows } = await sb.from("guest_checkouts").select("*").is("claimed_at", null).not("paid_at", "is", null).ilike("email", email);
  for (const row of rows || []) {
    if (seen.has(row.stripe_checkout_session_id)) continue;
    let s = null;
    try { s = await stripe().checkout.sessions.retrieve(row.stripe_checkout_session_id); } catch { continue; }
    if (isPaid(s) && s.metadata?.guest_checkout_id === row.id) out.push(await claimGuestCheckout(sb, row, user.id, s));
  }
  return out.filter((x) => x?.claimed);
}

async function logRefund(sb, row) {
  const { error } = await sb.from("guest_refunds").insert(row);
  if (error) console.error("guest_refunds insert", error.message);
}

// A guest purchase landed on an account that is already an active member:
// - Join + Pass / Membership: cancel the duplicate subscription now and refund its first membership charge (keep the pass).
// - Travel Pass at $49.99: refund the difference to the member price.
// Never throws; failures are logged as manual_review so a person can finish it.
export async function memberSafetyNet(sb, row, userId, session) {
  const base = { guest_checkout_id: row.id, user_id: userId, plan: row.plan };
  try {
    if (row.stripe_subscription_id && (row.plan === "join" || row.plan === "membership")) {
      let canceled = false, cancelErr = null;
      try { await stripe().subscriptions.cancel(row.stripe_subscription_id, { prorate: false }); canceled = true; } catch (e) { cancelErr = e?.message || "cancel failed"; }
      let amount = null, pi = null, refund = null, refundErr = null;
      try {
        const items = await stripe().checkout.sessions.listLineItems(session?.id || row.stripe_checkout_session_id, { limit: 10, expand: ["data.price"] });
        amount = items.data.filter((i) => i.price?.recurring).reduce((n, i) => n + (i.amount_total || 0), 0);
        const invId = row.stripe_invoice_id || (typeof session?.invoice === "string" ? session.invoice : null);
        if (invId) { const inv = await stripe().invoices.retrieve(invId); pi = typeof inv.payment_intent === "string" ? inv.payment_intent : inv.payment_intent?.id || null; }
        if (!pi || !amount) throw new Error("no payment to refund");
        refund = await stripe().refunds.create({ payment_intent: pi, amount, reason: "duplicate", metadata: { guest_checkout_id: row.id, why: "already_member" } }, { idempotencyKey: `dupmember_${row.id}` });
      } catch (e) { refundErr = e?.message || "refund failed"; }
      await logRefund(sb, { ...base, reason: "duplicate_membership", amount_cents: amount, stripe_payment_intent_id: pi, stripe_subscription_id: row.stripe_subscription_id, subscription_canceled: canceled, stripe_refund_id: refund?.id || null, status: refund && canceled ? "refunded" : "manual_review", error: [cancelErr, refundErr].filter(Boolean).join("; ") || null });
      return;
    }
    if (row.plan === "pass") {
      let amount = null, refund = null, err = null;
      const pi = row.stripe_payment_intent_id || (typeof session?.payment_intent === "string" ? session.payment_intent : null);
      try {
        const memberPrice = await stripe().prices.retrieve(await priceId("member_pass"));
        amount = (row.amount_cents ?? session?.amount_total ?? 0) - (memberPrice.unit_amount || 0);
        if (amount <= 0) return;
        if (!pi) throw new Error("no payment to refund");
        refund = await stripe().refunds.create({ payment_intent: pi, amount, reason: "requested_by_customer", metadata: { guest_checkout_id: row.id, why: "member_price_difference" } }, { idempotencyKey: `memberdiff_${row.id}` });
      } catch (e) { err = e?.message || "refund failed"; }
      await logRefund(sb, { ...base, reason: "member_price_difference", amount_cents: amount, stripe_payment_intent_id: pi, stripe_refund_id: refund?.id || null, status: refund ? "refunded" : "manual_review", error: err });
    }
  } catch (e) {
    console.error("member safety net", e?.message);
    await logRefund(sb, { ...base, reason: "safety_net_error", status: "manual_review", error: e?.message || "unknown" });
  }
}
