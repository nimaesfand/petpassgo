"use client";
import { startStripe, claimGuestPurchases } from "./checkout";

const KEY = "petpassgo_checkout_intent";

export function saveCheckoutIntent(intent) {
  try { if (intent) localStorage.setItem(KEY, intent); else localStorage.removeItem(KEY); } catch {}
}

export function hasResumeIntent() {
  try { return !!(localStorage.getItem("petpassgo_pending_trip") || localStorage.getItem(KEY)); } catch { return false; }
}

// After signup, login or an email-confirmation link: continue where the buyer left off.
// Trip purchases (Travel Pass / Join + Pass) resume in /assessment, which opens checkout itself.
export async function resumeAfterAuth() {
  // Paid before making an account (closed the tab)? Attach it now.
  if (await claimGuestPurchases()) {
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
    const err = await startStripe("/api/stripe/checkout", { plan: "membership" });
    if (!err) return; // redirected to Stripe
    window.location.href = "/account";
    return;
  }
  if (intent === "pass") { window.location.href = "/assessment?plan=pass"; return; }
  window.location.href = "/account";
}
