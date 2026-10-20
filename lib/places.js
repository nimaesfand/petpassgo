// US states for the local Lost & found board. Stored as the 2-letter code.
export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"],
  ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"],
  ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
  ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"],
  ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"],
  ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
  ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
  ["OR", "Oregon"], ["PA", "Pennsylvania"], ["PR", "Puerto Rico"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
  ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];
export const stateName = (code) => US_STATES.find(([c]) => c === code)?.[1] || code || "";

export const titleCase = (s) => String(s || "").trim().replace(/\s+/g, " ").toLowerCase().replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());

// "Clark St, Woodland Hills" -> { city: "Woodland Hills" }; "Austin, TX" -> { city: "Austin", state: "TX" }
export function placeFromArea(area) {
  const parts = String(area || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return {};
  let last = parts[parts.length - 1];
  const st = US_STATES.find(([c, n]) => c.toLowerCase() === last.toLowerCase() || n.toLowerCase() === last.toLowerCase());
  if (st) return { state: st[0], city: parts.length >= 2 ? titleCase(parts[parts.length - 2]) : "" };
  return { city: titleCase(last) };
}

let geoPromise = null;
export function visitorArea() {
  if (!geoPromise) geoPromise = fetch("/api/geo").then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return geoPromise;
}

export const lostTitle = (name) => `${name} lost, help locate ${name}`;
