// Stable id for one checkout attempt. The date is part of the key, so the
// same route on another day is a new trip. A second click with the same
// answers reuses the unpaid row instead of inserting another one.

function norm(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkoutKeyFromAnswers(answers) {
  const a = answers || {};
  const round = !!(a.round_trip || a.return_date);
  const parts = [
    norm(a.origin),
    norm(a.destination),
    norm(a.airline),
    String(a.date || a.travel_date || "").slice(0, 10),
    round ? "rt" : "ow",
    round ? String(a.return_date || "").slice(0, 10) : "",
    norm(a.animal || a.animal_type),
    norm(a.role),
    a.psd || a.service_kind === "psd" ? "psd" : "",
    norm(a.flight_number),
    round ? norm(a.return_flight_number) : "",
  ];
  if (a.connecting) parts.push("cx", norm(a.second_airline), norm(a.stop));
  return parts.join("|").slice(0, 240);
}

export function tripToCheckoutAnswers(trip) {
  return {
    origin: trip?.origin,
    destination: trip?.destination,
    airline: trip?.airline,
    date: trip?.travel_date,
    return_date: trip?.return_date,
    round_trip: !!trip?.return_date,
    animal: trip?.animal_type,
    role: trip?.role,
    psd: trip?.service_kind === "psd",
    flight_number: trip?.flight_number,
    return_flight_number: trip?.return_flight_number,
    connecting: trip?.connecting || false,
    second_airline: trip?.second_airline,
    stop: Array.isArray(trip?.segments) && trip.segments[0]?.destination !== trip?.destination ? trip.segments[0]?.destination : "",
    segments: trip?.segments || null,
  };
}
