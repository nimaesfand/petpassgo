// Promo email preference. Nothing here sends mail. Consent is stored only.

export const MARKETING_LABEL = "Send me pet travel tips and deals";
export const MARKETING_SOURCES = ["signup", "join", "checkout", "account", "unsubscribe"];

export function marketingSourceForPlan(plan) {
  if (plan === "membership" || plan === "join") return "join";
  return "checkout";
}
