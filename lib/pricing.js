// Single source of truth for prices shown in the UI. Amounts stay as written.
// JOIN_CTA uses PRICES.member without a USD suffix. Other displays add USD.
export const PRICES = { member: "$6.99", memberUnit: "/mo", memberPass: "$19.99", pass: "$49.99", joinToday: "$26.98", savings: "$30" };
export function usd(amount) {
  return `${amount} USD`;
}
export const SITE_LAUNCHED = process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true";
