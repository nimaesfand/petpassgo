// Date helpers for the dashboard timeline. All dates are calendar dates (YYYY-MM-DD).
export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function daysUntil(iso, today = new Date().toISOString().slice(0, 10)) {
  return Math.round((new Date(iso + "T00:00:00Z") - new Date(today + "T00:00:00Z")) / 86400000);
}
export function fmt(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
// Under DOT rules (14 CFR 382.75), a US airline may require the DOT service animal forms
// up to 48 hours before departure when the ticket was booked more than 48 hours out.
export function serviceFormDeadline(travelDate) {
  return addDays(travelDate, -2);
}
export const REMINDER_OFFSETS = [30, 7, 1];
export function reminderSchedule(trip) {
  if (!trip?.travel_date) return [];
  const isService = /service|psychiatric/i.test(trip.role || "");
  const items = REMINDER_OFFSETS.map((n) => ({
    kind: `d${n}`,
    date: addDays(trip.travel_date, -n),
    title: `${n} day${n > 1 ? "s" : ""} before your flight`,
    body:
      n === 30
        ? "Book your vet visit now. Check the health certificate timing in your checklist, since many certificates must be issued within a set window before travel."
        : n === 7
        ? "Confirm your vet appointment falls inside your health certificate window and your rabies vaccination is current through travel."
        : "Pack your documents and carrier. Keep paper and digital copies of every certificate handy at check-in.",
  }));
  if (isService) {
    items.push({
      kind: "dot48",
      date: serviceFormDeadline(trip.travel_date),
      title: "DOT service animal form deadline",
      body: `${trip.airline || "Your airline"} may require the DOT Service Animal Air Transportation Form up to 48 hours before departure. Submit it by this date.`,
    });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
