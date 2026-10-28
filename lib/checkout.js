"use client";
import { supabase } from "./supabaseClient";
import { getAttribution } from "./analytics";

// Starts a Stripe Checkout (or billing portal) session. Returns an error message, or redirects.
export async function startStripe(path, body) {
  const { data: s } = await supabase.auth.getSession();
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ ...(body || {}), attribution: getAttribution() }) });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.url) { window.location.href = j.url; return null; }
  return j.error || "Checkout isn't available right now. Please try again.";
}

// Pay-first: signed-out checkout. The server first checks the email: an existing account is
// asked to log in (returns { login: true, member }); otherwise we go straight to Stripe.
export async function startGuestCheckout(plan, trip, cancelPath, email, extra) {
  const r = await fetch("/api/stripe/guest-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, trip: trip || null, email, cancel_path: cancelPath || window.location.pathname, attribution: getAttribution(), immediate_access_consent: extra?.immediate_access_consent === true }) });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.action === "login") return { login: true, member: !!j.member };
  if (r.ok && j.url) { window.location.href = j.url; return { redirecting: true }; }
  return { error: j.error || "Checkout isn't available right now. Please try again." };
}

// Attach any pay-first purchases made with this account's email. Safe to call on every sign-in.
export async function claimGuestPurchases() {
  try {
    const { data: s } = await supabase.auth.getSession();
    const t = s?.session?.access_token;
    if (!t) return 0;
    const r = await fetch("/api/claim", { method: "POST", headers: { "x-sb-token": t } });
    const j = await r.json().catch(() => ({}));
    return j.claimed || 0;
  } catch { return 0; }
}
