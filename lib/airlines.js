// Airlines shown in the trip-questions airline picker. Names must match airline_requirements.airline
// (or an alias below). To add a carrier, append its exact Supabase name to the list below.
// Next, once their rules are verified: Air Canada, Japan Airlines.
export const US_AIRLINES = [
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
];

export const INTERNATIONAL_AIRLINES = [
  "Aeroméxico",
  "Volaris",
  "Viva Aerobus",
  "Lufthansa",
  "Air France",
  "KLM",
  "British Airways",
];

export const OTHER_AIRLINE = "Other / not sure yet";

export const AIRLINES = [...US_AIRLINES, ...INTERNATIONAL_AIRLINES, OTHER_AIRLINE];

// Hawaiian Airlines now operates under Alaska's certificate and shares Alaska's
// pet and service-animal policies, so it reads Alaska's requirement rows.
const REQUIREMENT_ALIASES = {
  "Hawaiian Airlines": "Alaska Airlines",
};

export function requirementAirline(name) {
  return REQUIREMENT_ALIASES[name] || name;
}

// Flight-lookup names are not the picker strings. Match the offered airline, or Other.
const PICKER_PATTERNS = [
  [/lufthansa/i, "Lufthansa"],
  [/air france/i, "Air France"],
  [/\bklm\b/i, "KLM"],
  [/british airways/i, "British Airways"],
  [/united/i, "United"],
  [/american/i, "American Airlines"],
  [/delta/i, "Delta"],
  [/southwest/i, "Southwest"],
  [/jetblue|jet blue/i, "JetBlue"],
  [/alaska/i, "Alaska Airlines"],
  [/hawaiian/i, "Hawaiian Airlines"],
  [/frontier/i, "Frontier"],
  [/allegiant/i, "Allegiant"],
  [/sun country/i, "Sun Country"],
  [/aerom/i, "Aeroméxico"],
  [/volaris/i, "Volaris"],
  [/viva/i, "Viva Aerobus"],
];

export function airlinePickerName(name) {
  const n = String(name || "").trim();
  if (!n) return "";
  for (const [re, label] of PICKER_PATTERNS) {
    if (re.test(n) && AIRLINES.includes(label)) return label;
  }
  const exact = AIRLINES.find((a) => a.toLowerCase() === n.toLowerCase());
  return exact || OTHER_AIRLINE;
}
