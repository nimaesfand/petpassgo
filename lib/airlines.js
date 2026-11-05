// Airlines shown in the trip-questions airline picker. Names must match airline_requirements.airline
// (or an alias below). To add a carrier, append its exact Supabase name to INTERNATIONAL_AIRLINES.
// The picker and homepage only show carriers whose country is in ENABLED_COUNTRIES.
import { countryEnabled } from "./travelScope";
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
  "Air Canada",
  "Japan Airlines",
];

export const OTHER_AIRLINE = "Other / not sure yet";

const AIRLINE_COUNTRY = {
  "Air Canada": "CA",
  "Aeroméxico": "MX",
  "Volaris": "MX",
  "Viva Aerobus": "MX",
  "Lufthansa": "DE",
  "Air France": "FR",
  "KLM": "NL",
  "British Airways": "GB",
  "Japan Airlines": "JP",
};

export function airlineCountry(name) {
  if (US_AIRLINES.includes(name)) return "US";
  return AIRLINE_COUNTRY[name] || null;
}

export function isAirlineEnabled(name) {
  if (name === OTHER_AIRLINE) return true;
  const country = airlineCountry(name);
  return !!country && countryEnabled(country);
}

export const AIRLINES = [...US_AIRLINES, ...INTERNATIONAL_AIRLINES, OTHER_AIRLINE].filter(isAirlineEnabled);

// Named carriers a customer can pick. Hidden countries stay in the lists above.
export function coveredAirlineNames() {
  return [...US_AIRLINES, ...INTERNATIONAL_AIRLINES].filter(isAirlineEnabled);
}

// Homepage groups. Canada and Mexico are labeled on their own, not as "domestic".
export function homeAirlineGroups() {
  const groups = [];
  const us = US_AIRLINES.filter(isAirlineEnabled);
  const near = INTERNATIONAL_AIRLINES.filter((name) => ["CA", "MX"].includes(airlineCountry(name)) && isAirlineEnabled(name));
  const far = INTERNATIONAL_AIRLINES.filter((name) => !["CA", "MX"].includes(airlineCountry(name)) && isAirlineEnabled(name));
  if (us.length) groups.push({ title: "United States", names: us });
  if (near.length) groups.push({ title: "Canada and Mexico", names: near });
  if (far.length) groups.push({ title: "Other countries", names: far });
  return groups;
}

// Quiz airline picker. `region` is "us", "near", or "international".
export function airlineGroupsForRegion(region) {
  const us = US_AIRLINES.filter(isAirlineEnabled);
  const near = INTERNATIONAL_AIRLINES.filter((name) => ["CA", "MX"].includes(airlineCountry(name)) && isAirlineEnabled(name));
  const far = INTERNATIONAL_AIRLINES.filter((name) => !["CA", "MX"].includes(airlineCountry(name)) && isAirlineEnabled(name));
  const united = ["United States", us, 2];
  const canadaMexico = ["Canada and Mexico", near, 1];
  const other = far.length ? [["Other countries", far, 1]] : [];
  if (region === "near") return [canadaMexico, united, ...other];
  if (region === "international" && far.length) return [...other, united, canadaMexico];
  return [united, canadaMexico, ...other];
}

export function coveredAirlineCount() {
  return coveredAirlineNames().length;
}

export function airlineCoverageHeading() {
  return `${coveredAirlineCount()} airlines. One place.`;
}

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
  [/air canada/i, "Air Canada"],
  [/japan airlines|\bjal\b/i, "Japan Airlines"],
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

const IATA_TO_AIRLINE = {
  AA: "American Airlines", DL: "Delta", UA: "United", WN: "Southwest", B6: "JetBlue",
  AS: "Alaska Airlines", HA: "Hawaiian Airlines", F9: "Frontier", G4: "Allegiant",
  SY: "Sun Country", AM: "Aeroméxico", Y4: "Volaris", VB: "Viva Aerobus",
  LH: "Lufthansa", AF: "Air France", KL: "KLM", BA: "British Airways", AC: "Air Canada", JL: "Japan Airlines",
};

export function airlinePickerName(name, iata) {
  const code = String(iata || "").trim().toUpperCase();
  if (IATA_TO_AIRLINE[code] && AIRLINES.includes(IATA_TO_AIRLINE[code])) return IATA_TO_AIRLINE[code];
  const n = String(name || "").trim();
  if (!n) return "";
  for (const [re, label] of PICKER_PATTERNS) {
    if (re.test(n) && AIRLINES.includes(label)) return label;
  }
  const exact = AIRLINES.find((a) => a.toLowerCase() === n.toLowerCase());
  return exact || OTHER_AIRLINE;
}
