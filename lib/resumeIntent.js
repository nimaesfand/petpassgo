"use client";
import { startStripe, claimGuestPurchases } from "./checkout";
import { KEEP_TOKEN_KEY } from "./passportDraft";
import { takeWithdrawalConsent } from "./withdrawal";
import { supabase } from "./supabaseClient";

// A free-checklist trip is also saved on the account at sign-up, so it survives
// confirming the email in another browser or app. Put it back for /assessment.
async function restoreTripFromAccount() {
  try {
    if (localStorage.getItem("petpassgo_pending_trip")) return;
    const { data } = await supabase.auth.getUser();
    const t = data?.user?.user_metadata?.pending_trip;
    if (!t || typeof t !== "object" || !t.origin) return;
    localStorage.setItem("petpassgo_pending_trip", JSON.stringify(t));
    localStorage.setItem("petpassgo_purchase_intent", "free");
    await supabase.auth.updateUser({ data: { pending_trip: null } });
  } catch {}
}

const KEY = "petpassgo_checkout_intent";

export function saveCheckoutIntent(intent) {
  try { if (intent) localStorage.setItem(KEY, intent); else localStorage.removeItem(KEY); } catch {}
}

export function hasResumeIntent() {
  try { return !!(localStorage.getItem("petpassgo_pending_trip") || localStorage.getItem(KEY)); } catch { return false; }
}

// After signup, login or an email-confirmation link: continue where the buyer left off.
// Trip purchases (Travel Pass / Join + Pass) resume in /assessment, which opens checkout itself.
let resuming = false;
export async function resumeAfterAuth() {
  if (resuming) return;
  resuming = true;
  // Paid before making an account (closed the tab)? Attach it now.
  const claimed = await claimGuestPurchases();
  await restoreTripFromAccount();
  // Made a passport before signing up? Go back to it so it moves into the account.
  let keep = null;
  try { keep = localStorage.getItem(KEEP_TOKEN_KEY); } catch {}
  if (keep && /^[A-Za-z0-9_-]{20,64}$/.test(keep)) { window.location.href = `/passport/keep?t=${keep}`; return; }
  if (claimed) {
    try { localStorage.removeItem("petpassgo_pending_trip"); localStorage.removeItem(KEY); localStorage.removeItem("petpassgo_purchase_intent"); } catch {}
    window.location.href = "/account?checkout=success";
    return;
  }
  let intent = null;
  try {
    if (localStorage.getItem("petpassgo_pending_trip")) { window.location.href = "/assessment"; return; }
    intent = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
  } catch {}
  if (intent === "membership") {
    // The box was ticked on the email step. A fresh visit shows it again, unticked.
    if (!takeWithdrawalConsent()) { window.location.href = "/join"; return; }
    let tips = false;
    try { tips = localStorage.getItem("petpassgo_marketing_opt_in") === "1"; localStorage.removeItem("petpassgo_marketing_opt_in"); } catch {}
    const err = await startStripe("/api/stripe/checkout", { plan: "membership", immediate_access_consent: true, marketing_opt_in: tips });
    if (!err) return; // redirected to Stripe
    window.location.href = "/account";
    return;
  }
  if (intent === "pass") { window.location.href = "/assessment?plan=pass"; return; }
  // Business owners who signed in from /business go back to their listing.
  try {
    const back = localStorage.getItem("petpassgo_return_to");
    localStorage.removeItem("petpassgo_return_to");
    if (back && back.startsWith("/business")) { window.location.href = back; return; }
  } catch {}
  window.location.href = "/account";
}
