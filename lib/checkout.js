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
