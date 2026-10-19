// Pure helpers for What's Needed Next + private travel stamps. Dates are
// YYYY-MM-DD calendar dates (America/Los_Angeles at call sites); nothing here
// invents a date — every row comes from a stored expires_on.
export function daysBetween(expiresOn, today) {
  if (!expiresOn || !today) return null;
  return Math.round((new Date(`${expiresOn}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 86400000);
}

export function buildUrgencyItems({ healthRecords = [], documents = [], nextTrip = null, today }) {
  const tripEnd = nextTrip?.return_date || nextTrip?.travel_date || null;
  const rows = [];
  const push = (source, id, name, expiresOn, href) => {
    if (!expiresOn) return;
    const days = daysBetween(expiresOn, today);
    if (days == null) return;
    const beforeTripEnd = !!(tripEnd && expiresOn >= today && expiresOn <= tripEnd);
    let bucket = null, rank = 99, tone = "good", label = "";
    if (days < 0) { bucket = "overdue"; rank = 0; tone = "bad"; label = `Overdue · expired ${expiresOn}`; }
    else if (days <= 60) { bucket = "soon"; rank = 1; tone = "warn"; label = days === 0 ? "Expires today" : `Expires in ${days} day${days === 1 ? "" : "s"}`; }
    else if (beforeTripEnd) { bucket = "trip"; rank = 2; tone = "warn"; label = `Expires before your trip ends (${tripEnd})`; }
    if (!bucket) return;
    rows.push({ key: `${source}-${id}`, source, name, expiresOn, days, bucket, rank, tone, label, href, travelBlocking: beforeTripEnd && bucket !== "overdue" });
  };
  (healthRecords || []).forEach((r) => push("health", r.id, r.name, r.expires_on, "#health-passport"));
  (documents || []).forEach((d) => push("document", d.id, d.document_type, d.expires_on, null)); // href filled by caller (per-pet anchor)
  return rows.sort((a, b) => a.rank - b.rank || a.days - b.days || String(a.name).localeCompare(String(b.name)));
}

// A stamp is earned only by a paid trip whose departure date has passed.
// No manual, backdated, or unpaid trips ever reach this list.
export function deriveStamps(trips = [], today) {
  return (trips || [])
    .filter((t) => t && t.paid && t.travel_date && t.travel_date < today)
    .map((t) => ({ id: t.id, origin: t.origin, destination: t.destination, airline: t.airline || "", travelDate: t.travel_date, returnDate: t.return_date || null }))
    .sort((a, b) => String(b.travelDate).localeCompare(String(a.travelDate)));
}

// Trips rarely carry pet_id (legacy rows have none). Mirror the app's existing
// association (TripLive.useTripPet): pet_id match, else the owner's first pet.
export function tripBelongsToPet(trip, petId, firstPetId) {
  if (!trip) return false;
  if (trip.pet_id) return trip.pet_id === petId;
  return !!firstPetId && petId === firstPetId;
}

export const SAMPLE_DOG = {
  name: "Biscuit",
  breed: "Golden Retriever mix",
  rows: [
    { name: "Bordetella", status: "OVERDUE", tone: "bad" },
    { name: "Rabies", status: "EXPIRES SOON", tone: "warn" },
    { name: "DHPP", status: "CURRENT", tone: "good" },
  ],
};
