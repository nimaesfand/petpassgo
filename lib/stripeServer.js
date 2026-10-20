import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { serviceClient } from "./serverEmail";

export const LOOKUP = { pass: "ppg_travel_pass_4999", member_pass: "ppg_member_pass_1999", membership: "ppg_membership_monthly_699" };
const ENV_PRICE = { pass: "STRIPE_PRICE_PASS", member_pass: "STRIPE_PRICE_MEMBER_PASS", membership: "STRIPE_PRICE_MEMBERSHIP" };

export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  return new Stripe(key);
}

export async function priceId(kind) {
  if (process.env[ENV_PRICE[kind]]) return process.env[ENV_PRICE[kind]];
  const r = await stripe().prices.list({ lookup_keys: [LOOKUP[kind]], active: true, limit: 1 });
  if (!r.data[0]) throw new Error(`price ${kind} missing`);
  return r.data[0].id;
}

export async function userFromReq(req) {
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data } = await sb.auth.getUser(token);
  return data?.user || null;
}

export async function isMember(sb, userId) {
  const { data } = await sb.from("memberships").select("status,current_period_end").eq("user_id", userId).maybeSingle();
  return !!data && data.status === "active" && (!data.current_period_end || new Date(data.current_period_end) > new Date());
}

export async function customerFor(sb, user) {
  const { data } = await sb.from("stripe_customers").select("customer_id").eq("user_id", user.id).maybeSingle();
  if (data?.customer_id) {
    // A saved id can belong to the other Stripe mode (test vs live) or be deleted; then make a fresh one.
    let existing = null;
    try { existing = await stripe().customers.retrieve(data.customer_id); } catch (e) { if (e?.code !== "resource_missing") throw e; }
    if (existing && !existing.deleted) { try { await stripe().customers.update(existing.id, { email: user.email }); } catch {} return existing.id; }
  }
  const mode = (process.env.STRIPE_SECRET_KEY || "").includes("_live_") ? "live" : "test";
  const c = await stripe().customers.create({ email: user.email, metadata: { user_id: user.id } }, { idempotencyKey: `cust_${mode}_${user.id}_${data?.customer_id || "new"}` });
  await sb.from("stripe_customers").upsert({ user_id: user.id, customer_id: c.id });
  return c.id;
}

export function siteUrl(req) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export function mapStatus(s) {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "canceled" || s === "incomplete_expired") return "canceled";
  return null; // incomplete / paused: don't grant
}

export async function userIdForCustomer(sb, customerId) {
  const { data } = await sb.from("stripe_customers").select("user_id").eq("customer_id", customerId).maybeSingle();
  return data?.user_id || null;
}

export async function syncSubscription(sb, sub, userIdHint) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = userIdHint || sub.metadata?.user_id || (await userIdForCustomer(sb, customerId));
  if (!userId) return;
  const status = mapStatus(sub.status);
  if (!status) return;
  const end = sub.current_period_end || sub.items?.data?.[0]?.current_period_end;
  const { error } = await sb.from("memberships").upsert({
    user_id: userId,
    status,
    current_period_end: end ? new Date(end * 1000).toISOString() : null,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function receiptFor(o) {
  try {
    const pi = typeof o.payment_intent === "string" ? o.payment_intent : o.payment_intent?.id;
    if (pi) { const x = await stripe().paymentIntents.retrieve(pi, { expand: ["latest_charge"] }); if (x.latest_charge?.receipt_url) return x.latest_charge.receipt_url; }
    const inv = typeof o.invoice === "string" ? o.invoice : o.invoice?.id;
    if (inv) { const x = await stripe().invoices.retrieve(inv); return x.hosted_invoice_url || null; }
  } catch {}
  return null;
}

export { serviceClient };
