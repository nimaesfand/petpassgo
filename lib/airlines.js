// Airlines shown in the trip-questions airline picker. Names must match airline_requirements.airline
// (or an alias below).
export const AIRLINES = [
  "Delta",
  "American Airlines",
  "United",
  "Southwest",
  "JetBlue",
  "Alaska Airlines",
  "Hawaiian Airlines",
  "Frontier",
  "Allegiant",
  "Sun Country",
  "Other / not sure yet",
];

// Hawaiian Airlines now operates under Alaska's certificate and shares Alaska's
// pet and service-animal policies, so it reads Alaska's requirement rows.
const REQUIREMENT_ALIASES = {
  "Hawaiian Airlines": "Alaska Airlines",
};

export function requirementAirline(name) {
  return REQUIREMENT_ALIASES[name] || name;
}
