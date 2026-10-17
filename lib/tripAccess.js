// Non-member Travel Pass access rule (single source of truth):
// Pet ID + vault stay open until 7 days after the trip's travel (arrival) date.
// Trips have no return-date field — the questionnaire asks one from/to + one
// travel date — so the end is derived: travel_date + 7 days. A trip with no
// travel date keeps access (we can't derive an end). Members always have access.
export const TRIP_ACCESS_BUFFER_DAYS = 7;

export function addDaysISO(iso, days) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function tripAccessEnd(travelDate) {
  return addDaysISO(travelDate, TRIP_ACCESS_BUFFER_DAYS);
}
export function fmtTripDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
// "Your Pet ID & vault stay open until <date>" for a known travel date.
export function tripAccessCopy(travelDate) {
  const end = tripAccessEnd(travelDate);
  return end ? `Pet ID & vault stay open until ${fmtTripDate(end)} (7 days after your travel date)` : "Pet ID & vault stay open until 7 days after your travel date";
}
