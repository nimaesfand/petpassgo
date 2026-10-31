// Shared pet profile helpers. Empty values stay hidden in the UI.

export const HOUSING_DOC_TYPES = [
  "Landlord or HOA pet approval",
  "Lease pet addendum",
  "Pet references",
  "Rental pet resume",
  "Renter's pet insurance",
];

export const TRAVEL_DOC_TYPES = ["Vaccination record", "Health certificate", "Training documentation"];

export const DOC_TYPES = [
  "Vaccination record",
  "Health certificate",
  "Training documentation",
  "Microchip registration",
  "Insurance policy",
  "Other",
  ...HOUSING_DOC_TYPES,
];

export function isHousingDoc(type) {
  return HOUSING_DOC_TYPES.includes(type);
}

export function isTravelDoc(type) {
  return TRAVEL_DOC_TYPES.includes(type);
}

export function fmtDob(v) {
  if (!v) return "";
  const d = new Date(`${String(v).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function weightLabel(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "";
  const s = Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
  return `${s} lbs`;
}

export function chipMask(v) {
  const s = String(v || "").replace(/[^0-9A-Za-z]/g, "");
  return s ? `•••• ${s.slice(-4)}` : "";
}

export function roleLabel(role) {
  if (!role || role === "Pet") return "";
  if (/emotional/i.test(role)) return "Emotional support animal";
  if (/service/i.test(role)) return "Service animal";
  return "";
}

export function profilePath(pet) {
  const key = pet?.public_slug || pet?.id;
  return key ? `/id/${key}` : "/id";
}

export function profileUrl(pet) {
  const path = profilePath(pet);
  if (typeof window !== "undefined" && window.location?.origin) return `${window.location.origin}${path}`;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://petpassgo.com").replace(/\/$/, "");
  return `${base}${path}`;
}

export function profileLabel(pet) {
  try {
    const u = new URL(profileUrl(pet));
    return `${u.host}${u.pathname}`;
  } catch {
    return profilePath(pet);
  }
}

export function filled(v) {
  return v != null && String(v).trim() !== "";
}
