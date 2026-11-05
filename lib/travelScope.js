// Countries a customer can plan right now. Add an ISO code here to turn a
// country back on. Airline rule rows stay in the database either way.
export const ENABLED_COUNTRIES = ["US", "CA", "MX"];

const ENABLED = new Set(ENABLED_COUNTRIES);

export function countryEnabled(code) {
  return ENABLED.has(code);
}

// True when any country outside the U.S., Canada, and Mexico is turned on.
export function farTravelEnabled() {
  return ENABLED_COUNTRIES.some((code) => code !== "US" && code !== "CA" && code !== "MX");
}
