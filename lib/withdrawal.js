// EU/UK withdrawal consent. Bump the version if the checkbox wording changes.
// Stored with each checkout so we can show what the buyer agreed to.
export const WITHDRAWAL_POLICY_VERSION = "eu-uk-withdrawal-2026-10-28";

export const WITHDRAWAL_CHECKBOX =
  "Start my access now. I understand I lose my 14-day right to withdraw once it starts.";

export const WITHDRAWAL_BLOCKED =
  "Tick the box to start your access now. Checkout stays closed until you do.";

export const WITHDRAWAL_CONFIRMED =
  "You agreed to start your access now, and you acknowledged that you lose your 14-day right to withdraw once it starts.";

const KEY = "petpassgo_withdrawal_consent";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function consentAccepted(body) {
  return body?.immediate_access_consent === true;
}

// Remember a tick only long enough to finish login, then resume the same checkout.
export function rememberWithdrawalConsent() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: WITHDRAWAL_POLICY_VERSION, at: Date.now() }));
  } catch {}
}

export function takeWithdrawalConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    return saved?.v === WITHDRAWAL_POLICY_VERSION && Date.now() - saved.at < MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function clearWithdrawalConsent() {
  try { localStorage.removeItem(KEY); } catch {}
}
