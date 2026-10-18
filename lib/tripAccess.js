// Non-member Travel Pass access rule (single source of truth):
// Pet ID + vault stay open until 7 days after the trip anchor date.
// One-way (the default): anchor is travel_date.
// Round trip is optional. When a return date was volunteered and is later
// than the outbound date, the anchor is return_date. A trip with no dates
// keeps access (we can't derive an end). Members always have access.
export const TRIP_ACCESS_BUFFER_DAYS = 7;

export function addDaysISO(iso, days) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function accessAnchor(travelDate, returnDate) {
  if (returnDate && (!travelDate || returnDate > travelDate)) return returnDate;
  return travelDate || null;
}

export function tripAccessEnd(travelDate, returnDate) {
  return addDaysISO(accessAnchor(travelDate, returnDate), TRIP_ACCESS_BUFFER_DAYS);
}

export function tripAccessOpen(travelDate, returnDate, today) {
  if (!travelDate && !returnDate) return true;
  const end = tripAccessEnd(travelDate, returnDate);
  return !!end && !!today && end >= today;
}

export function fmtTripDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

// "Your Pet ID & vault stay open until <date>" for a known travel date.
export function tripAccessCopy(travelDate, returnDate) {
  const end = tripAccessEnd(travelDate, returnDate);
  if (!end) return "Pet ID & vault stay open until 7 days after you fly. If you add a return date, that window runs until 7 days after you fly back.";
  if (returnDate && travelDate && returnDate > travelDate) return `Pet ID & vault stay open until ${fmtTripDate(end)} (7 days after your return)`;
  return `Pet ID & vault stay open until ${fmtTripDate(end)} (7 days after your travel date)`;
}
