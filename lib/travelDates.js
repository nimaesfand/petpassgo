// Date helpers for the dashboard timeline. All dates are calendar dates (YYYY-MM-DD).
export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function daysUntil(iso, today = todayPT()) {
  return Math.round((new Date(iso + "T00:00:00Z") - new Date(today + "T00:00:00Z")) / 86400000);
}
export function fmt(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
export function todayPT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}
// The ONLY place relative flight wording is formed. Always computed from a
// live `today` (America/Los_Angeles) at render/send time — never stored.
// Returns null when there is no flight date.
export function flightPhrase(daysLeft) {
  if (daysLeft == null || Number.isNaN(daysLeft)) return null;
  if (daysLeft > 1) return `Your flight is in ${daysLeft} days`;
  if (daysLeft === 1) return "Your flight is tomorrow";
  if (daysLeft === 0) return "Your flight is today";
  if (daysLeft === -1) return "Your flight was yesterday";
  return `Your flight was ${-daysLeft} days ago`;
}

export function createdDate(trip) {
  if (!trip?.created_at) return null;
  // created_at is a timestamptz; use the calendar day in UTC so it stays stable.
  return trip.created_at.slice(0, 10);
}

// Under DOT rules (14 CFR 382.75), a US airline may require the DOT service animal forms
// up to 48 hours before departure when the ticket was booked more than 48 hours out.
export function serviceFormDeadline(travelDate) {
  return addDays(travelDate, -2);
}

export const REMINDER_OFFSETS = [30, 7, 1];

function destHint(trip) {
  return `${trip.destination || ""} ${trip.origin || ""}`.toLowerCase();
}
function isHawaii(trip) { return /hawaii|honolulu|hnl|oahu|maui|koa|ogg|lih|ito/.test(destHint(trip)); }
function isMexico(trip) { return /mexico|mex|cun|gdl|sjd|pvr|mty/.test(destHint(trip)); }
function isService(trip) { return /service|psychiatric/i.test(trip.role || ""); }

// Bodies change with trip context and how close the flight is (late-booker urgency).
function bodyFor(n, trip, daysLeft) {
  const late = daysLeft != null && daysLeft >= 0 && daysLeft < n;
  if (isService(trip)) {
    if (n === 30) return late
      ? `Confirm your dog's vaccinations are current and start the DOT service animal form now.`
      : "Confirm vaccinations are current and get ready to submit the DOT Service Animal Air Transportation Form (airlines can require it up to 48 hours before departure).";
    if (n === 7) return late
      ? `Submit the DOT form today if ${trip.airline || "your airline"} still accepts it, or bring a completed copy to the airport.`
      : `Submit the DOT Service Animal Air Transportation Form to ${trip.airline || "your airline"} (deadline is typically 48 hours before departure).`;
    return "Pack the completed DOT form(s) and keep paper and digital copies handy at check-in.";
  }
  if (isHawaii(trip)) {
    if (n === 30) return late
      ? `Book a USDA-accredited vet today for the Hawaii health certificate (issued within 14 days of arrival) and confirm FAVN timing.`
      : "Book a USDA-accredited vet. Hawaii needs a health certificate within 14 days of arrival, and the FAVN rabies blood test for the 5-Day-or-Less program can take weeks.";
    if (n === 7) return late
      ? `Get the APHIS Form 7001 issued now (within 14 days of arrival) and confirm AQS-279 was received.`
      : "Confirm the health certificate visit falls within 14 days of arrival and that Hawaii has received your AQS-279 import form.";
    return "Pack the health certificate, rabies certificates and AQS-279 confirmation. Keep paper and digital copies handy.";
  }
  if (isMexico(trip) && /dog/i.test(trip.animal_type || "")) {
    if (n === 30) return late
      ? `Book a USDA-accredited vet today for the New World Screwworm inspection (issued no more than 5 days before arrival).`
      : "Book a USDA-accredited vet for Mexico's New World Screwworm inspection certificate (issued no more than 5 days before arrival).";
    if (n === 7) return late
      ? `Schedule the screwworm inspection so the certificate is issued within 5 days of arrival.`
      : "Schedule the screwworm inspection so the certificate is issued no more than 5 days before arrival in Mexico.";
    return "Pack the screwworm inspection certificate. Airlines check it at check-in.";
  }
  // Default domestic cabin pet: don't invent a health-certificate requirement.
  if (n === 30) return late
    ? `Open your checklist now and finish any booking or document steps that still need action.`
    : "Open your checklist and finish booking and document steps. See Vet visit guidance below for whether a health certificate applies to this trip.";
  if (n === 7) return late
    ? `Confirm carrier fit, reservations and any documents on your checklist today.`
    : "Confirm your pet's reservation, carrier size and any documents on your checklist.";
  return "Pack your documents and carrier. Keep paper and digital copies handy at check-in.";
}

export function reminderSchedule(trip, today = todayPT()) {
  if (!trip?.travel_date) return [];
  const daysLeft = daysUntil(trip.travel_date, today);
  const items = REMINDER_OFFSETS.map((n) => ({
    kind: `d${n}`,
    date: addDays(trip.travel_date, -n),
    offset: n,
    title: `${n} day${n > 1 ? "s" : ""} before your flight`,
    body: bodyFor(n, trip, daysLeft),
  }));
  if (isService(trip)) {
    items.push({
      kind: "dot48",
      date: serviceFormDeadline(trip.travel_date),
      offset: 2,
      title: "DOT service animal form deadline",
      body: daysLeft != null && daysLeft >= 0 && daysLeft < 2
        ? `Submit the DOT form today if ${trip.airline || "your airline"} still accepts it, or bring a completed copy to the airport.`
        : `${trip.airline || "Your airline"} may require the DOT Service Animal Air Transportation Form up to 48 hours before departure. Submit it by this date.`,
    });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

// Classify each reminder for late bookers vs truly passed.
// - do_now: reminder date was already past when the trip was created, and it isn't done
// - passed: became past after the trip was created (or checked off → done)
// - done: related checklist items completed (or user dismissed)
// - upcoming / today: still ahead
export function classifyReminder(item, trip, { done = false, today = todayPT() } = {}) {
  const d = daysUntil(item.date, today);
  const created = createdDate(trip);
  const pastAtCreation = !!(created && item.date < created);
  const flightDays = trip?.travel_date ? daysUntil(trip.travel_date, today) : null;
  if (done) return { state: "done", days: d };
  if (d < 0 && pastAtCreation && flightDays != null && flightDays >= 0) return { state: "do_now", days: d };
  if (d < 0) return { state: "passed", days: d };
  if (d === 0) return { state: "today", days: d };
  return { state: "upcoming", days: d };
}
