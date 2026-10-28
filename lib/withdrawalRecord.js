import { WITHDRAWAL_POLICY_VERSION } from "./withdrawal";

export function consentMetadata(consentId, consentedAt) {
  return {
    withdrawal_consent: "1",
    withdrawal_policy: WITHDRAWAL_POLICY_VERSION,
    withdrawal_consent_at: consentedAt,
    withdrawal_consent_id: consentId,
  };
}

// Written by the server, only after the buyer ticks the box. Service role only.
export async function recordWithdrawalConsent(sb, { userId, email, plan, guestCheckoutId }) {
  const consentedAt = new Date().toISOString();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const { data, error } = await sb.from("withdrawal_consents").insert({
    consented_at: consentedAt,
    user_id: userId || null,
    email: cleanEmail || null,
    plan,
    policy_version: WITHDRAWAL_POLICY_VERSION,
    guest_checkout_id: guestCheckoutId || null,
  }).select("id, consented_at").single();
  if (error) throw error;
  return data;
}

export async function attachConsentSession(sb, consentId, sessionId) {
  if (!consentId || !sessionId) return;
  const { error } = await sb.from("withdrawal_consents").update({ stripe_checkout_session_id: sessionId }).eq("id", consentId);
  if (error) console.error("withdrawal_consent_session", error.code || "update_failed");
}
