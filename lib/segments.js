// Each flight on a trip keeps its own airline, route, and cabin or hold choice.
// A trip saved before segments existed is still one flight on the original columns.
import { findAirport, routeAllowed, tripTypeForRoute } from "./airports";
import { requirementAirline } from "./airlines";
import { buildPassCards, matchesDestination } from "./passCards";

const KNOWN_SOURCE = {
  United: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html",
  Delta: "https://www.delta.com/us/en/pet-travel/overview",
  "American Airlines": "https://www.aa.com/web/i18n/travel-info/special-assistance/pets.html",
  Southwest: "https://support.southwest.com/helpcenter/s/article/pet-policy",
  JetBlue: "https://www.jetblue.com/help/traveling-with-pets",
  "Alaska Airlines": "https://www.alaskaair.com/content/travel-info/policies/pets-traveling-with-pets",
  "Hawaiian Airlines": "https://www.alaskaair.com/content/travel-info/policies/pets-traveling-with-pets",
  Frontier: "https://www.flyfrontier.com/travel/travel-info/family-pets",
  Allegiant: "https://www.allegiantair.com/traveling-with-pets",
  "Sun Country": "https://assets.ctfassets.net/2aov1ouggrmn/6pjlsMvuaBFa9iE7F3qGFF/91b44685006da079165739c0ff850f42/2026-01-27_Contract_of_Carriage.pdf",
  "Aeroméxico": "https://www.aeromexico.com/es_mx/vuelos-con-mascotas",
  Volaris: "https://cms.volaris.com/en/travel-info/optional-services/fly-with-your-pet/",
};

function day(value) {
  return String(value || "").slice(0, 10);
}

export function rulesRole(role, esa) {
  if (esa || /emotional support|\besa\b/i.test(String(role || ""))) return "Pet";
  return role || "Pet";
}

export function knownSource(airline) {
  return KNOWN_SOURCE[airline] || KNOWN_SOURCE[requirementAirline(airline)] || null;
}

function cleanLeg(leg) {
  if (!leg || typeof leg !== "object") return null;
  const origin = String(leg.origin || "").slice(0, 200);
  const destination = String(leg.destination || "").slice(0, 200);
  const airline = String(leg.airline || "").slice(0, 80);
  if (!origin || !destination || !airline) return null;
  const mode = leg.mode === "hold" || leg.mode === "cabin" ? leg.mode : null;
  return { origin, destination, airline, date: day(leg.date || leg.travel_date), mode, sharedRoute: !!leg.sharedRoute };
}

function modeFor(role, travel) {
  if (role === "Service animal") return null;
  return travel === "hold" || travel === "cabin" ? travel : null;
}

// Stored only for a connection that has a stop. One-flight trips stay on the old columns.
export function segmentsToStore(answers) {
  const a = answers || {};
  if (Array.isArray(a.segments) && a.segments.length > 1) {
    const legs = a.segments.map(cleanLeg).filter(Boolean).slice(0, 3);
    if (legs.length > 1) return legs.map(({ sharedRoute, ...leg }) => leg);
  }
  if (!a.connecting || !a.stop) return null;
  const second = a.second_airline && a.second_airline !== a.airline ? a.second_airline : a.airline;
  const firstMode = modeFor(rulesRole(a.role, a.esa), a.pet_travel);
  const secondMode = a.second_mode === "hold" || a.second_mode === "cabin" ? a.second_mode : firstMode;
  const legs = [
    { origin: a.origin, destination: a.stop, date: day(a.date || a.travel_date), airline: a.airline, mode: firstMode },
    { origin: a.stop, destination: a.destination, date: day(a.second_date || a.date || a.travel_date), airline: second, mode: secondMode },
  ].map(cleanLeg).filter(Boolean);
  return legs.length === 2 ? legs.map(({ sharedRoute, ...leg }) => leg) : null;
}

export function connectionReady(answers) {
  const a = answers || {};
  if (a.connecting !== true) return true;
  if (!a.stop || !routeAllowed(a.origin, a.stop) || !routeAllowed(a.stop, a.destination)) return false;
  if (a.second_date && a.date && a.second_date < a.date) return false;
  return true;
}

export function legsFromTrip(trip) {
  const stored = Array.isArray(trip?.segments) ? trip.segments.map(cleanLeg).filter(Boolean).slice(0, 3) : [];
  if (stored.length > 1) return stored;
  if (trip?.connecting && trip?.second_airline && trip.second_airline !== trip.airline) {
    const mode = modeFor(trip.role, trip.pet_travel);
    const leg = { origin: trip.origin || "", destination: trip.destination || "", date: day(trip.travel_date), mode, sharedRoute: true };
    return [
      { ...leg, airline: trip.airline || "" },
      { ...leg, airline: trip.second_airline },
    ];
  }
  if (!trip?.origin && !trip?.destination && !trip?.airline) return [];
  return [{
    origin: trip?.origin || "",
    destination: trip?.destination || "",
    date: day(trip?.travel_date),
    airline: trip?.airline || "",
    mode: modeFor(trip?.role, trip?.pet_travel),
    sharedRoute: false,
  }];
}

export function segmentTripType(origin, destination) {
  if (!routeAllowed(origin, destination)) return null;
  return tripTypeForRoute(origin, destination);
}

export function requirementQueryTypes(trip) {
  const legs = legsFromTrip(trip);
  const exact = legs.length > 1 && legs.every((leg) => !leg.sharedRoute);
  if (!exact) {
    return tripTypeForRoute(trip?.origin, trip?.destination) === "international" ? ["international", "domestic"] : ["domestic"];
  }
  const types = new Set(legs.map((leg) => segmentTripType(leg.origin, leg.destination)).filter(Boolean));
  return types.size ? [...types] : ["domestic"];
}

function transportKind(rule) {
  const blob = `${rule?.category || ""} ${rule?.title || ""}`.toLowerCase();
  const hold = /\bcargo\b|checked baggage|in the hold|baggage compartment|checked pet/.test(blob);
  const cabin = /\bcabin\b|in-cabin|under the seat|carry-on|seat restriction/.test(blob);
  if (hold && !cabin) return "hold";
  if (cabin && !hold) return "cabin";
  return "either";
}

export function ruleMatchesSegment(rule, segment, trip, index = 0) {
  if (!rule || rule.category === "ELIGIBILITY NOTE") return false;
  if (rule.airline === "Any" && segment?.sharedRoute && index > 0) return false;
  const airline = requirementAirline(segment?.airline);
  if (rule.airline !== "Any" && requirementAirline(rule.airline) !== airline) return false;
  const animal = trip?.animal_type || trip?.animal || "";
  if (rule.animal_type && rule.animal_type !== "Any" && animal && rule.animal_type !== animal) return false;
  const role = rulesRole(trip?.role, trip?.esa);
  if (rule.role && rule.role !== "Any" && rule.role !== role) return false;
  const geo = segmentTripType(segment?.origin, segment?.destination);
  if (!geo) return false;
  if (segment?.sharedRoute) {
    const allowed = geo === "international" ? ["international", "domestic"] : ["domestic"];
    if (!allowed.includes(rule.trip_type)) return false;
  } else if (rule.trip_type !== geo) return false;
  if (!matchesDestination(rule, { origin: segment?.origin, destination: segment?.destination })) return false;
  if (segment?.mode === "cabin" || segment?.mode === "hold") {
    const kind = transportKind(rule);
    if (kind !== "either" && kind !== segment.mode) return false;
  }
  return true;
}

function codeOf(label) {
  return findAirport(label)?.code || String(label || "").trim();
}

export function legLabel(segment, index) {
  const mode = segment?.mode === "hold" ? "Cargo" : segment?.mode === "cabin" ? "Cabin" : "";
  return [`Flight ${index + 1}`, `${codeOf(segment?.origin)} → ${codeOf(segment?.destination)}`, segment?.airline, mode].filter(Boolean).join(" · ");
}

export function segmentPlans(requirements, trip) {
  const legs = legsFromTrip(trip);
  if (!legs.length) return [];
  const single = legs.length === 1 && !legs[0].mode;
  if (single && !segmentTripType(legs[0].origin, legs[0].destination)) {
    return [{ segment: legs[0], label: null, cards: [], resolved: false, reason: "outside", source: null }];
  }
  if (single) {
    const role = rulesRole(trip?.role, trip?.esa);
    const scoped = (requirements || []).filter((rule) => !rule.role || rule.role === "Any" || rule.role === role);
    const cards = buildPassCards(scoped, { ...trip, role });
    return [{ segment: legs[0], label: null, cards, resolved: cards.some((card) => card.source_url && !card.askAirline), reason: null, source: null }];
  }
  return legs.map((segment, index) => {
    const geo = segmentTripType(segment.origin, segment.destination);
    if (!geo) {
      return { segment, label: legLabel(segment, index), cards: [], resolved: false, reason: "outside", source: null };
    }
    const view = {
      ...trip,
      airline: segment.airline,
      origin: segment.origin,
      destination: segment.destination,
      travel_date: segment.date || trip?.travel_date,
      role: rulesRole(trip?.role, trip?.esa),
    };
    const scoped = (requirements || []).filter((rule) => ruleMatchesSegment(rule, segment, trip, index));
    const cards = buildPassCards(scoped, view).filter((card) => card.source_url && !card.askAirline);
    return {
      segment,
      label: legLabel(segment, index),
      cards,
      resolved: cards.length > 0,
      reason: cards.length ? null : "missing",
      source: cards.length ? null : knownSource(segment.airline),
    };
  });
}

export function passReady(progress, plans) {
  if (!progress?.complete) return false;
  return !(plans || []).some((plan) => plan.resolved === false);
}
