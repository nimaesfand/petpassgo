import { groupCards } from "./passCards.js";
import { legsFromTrip, requirementQueryTypes, ruleMatchesSegment, segmentPlans, segmentTripType } from "./segments.js";
import { requirementAirline } from "./airlines.js";
import { tripFitWarnings } from "./tripFit.js";

// One answer to "is this an easy trip?", shared by the free preview and the
// server that unlocks easy trips for free. Easy means: a pet (not a service
// dog), in the cabin, inside the US, one airline, and a short list of steps
// with no health papers, forms or permits.
const HEAVY = /HEALTH|VACCIN|FORM|SUBMISSION|PERMIT|IMPORT|CERTIFICATE/;
export const EASY_MAX_STEPS = 5;

// trip: stored-trip shape (origin, destination, airline, second_airline, connecting,
// segments, role = rules role, animal_type, pet_travel, pet_count, travel_date).
export async function loadTripPlan(sb, trip) {
  const airlines = new Set(["Any"]);
  for (const leg of legsFromTrip(trip)) { airlines.add(leg.airline); airlines.add(requirementAirline(leg.airline)); }
  const { data, error } = await sb.from("airline_requirements").select("*")
    .in("airline", [...airlines].filter(Boolean))
    .in("animal_type", [trip.animal_type || "Dog", "Any"])
    .in("role", [trip.role || "Pet", "Any"])
    .in("trip_type", requirementQueryTypes(trip));
  if (error) return null;
  return planFromRows(data || [], trip);
}

// Same plan from rows already loaded (the airline comparison loads them all at once).
export function planFromRows(rows, trip) {
  const plans = segmentPlans(rows, trip);
  const open = plans.flatMap((p) => { const g = groupCards(p.cards, {}); return [...g.first, ...g.general]; });
  return { rows, open };
}

export function isEasyTrip(trip, plan) {
  if (!plan || !plan.rows.length || !plan.open.length) return false;
  if ((trip.role || "Pet") !== "Pet") return false;
  if (trip.pet_travel === "hold") return false;
  if (!trip.airline || /not sure/i.test(trip.airline)) return false;
  const legs = legsFromTrip(trip);
  if (!legs.length || legs.some((l) => segmentTripType(l.origin, l.destination) !== "domestic")) return false;
  if (new Set(legs.map((l) => l.airline)).size > 1) return false;
  // Only blocks that apply to this route count ("no pets to Hawaii" isn't about New York).
  const applies = (r) => legs.some((leg, i) => ruleMatchesSegment(r, leg, trip, i));
  if (plan.rows.some((r) => (r.blocks === "all" || r.blocks === "cabin") && applies(r))) return false;
  const warn = tripFitWarnings({ ...trip, role: trip.role || "Pet" });
  if (warn.some((w) => w.level === "stop")) return false;
  if (plan.open.length > EASY_MAX_STEPS) return false;
  return !plan.open.some((c) => c.dot || HEAVY.test(String(c.category || "").toUpperCase()));
}
