// Countries whose consumers have the 14-day right to withdraw from online
// purchases (EU, EEA, UK, Switzerland). Everyone else skips that consent.
export const WITHDRAWAL_COUNTRIES = new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"]);

export function requestCountry(req) {
  return (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
}

export function needsWithdrawalConsent(req) {
  return WITHDRAWAL_COUNTRIES.has(requestCountry(req));
}
