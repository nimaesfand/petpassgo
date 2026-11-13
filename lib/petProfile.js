// Shared pet profile helpers. Empty values stay hidden in the UI.
import { SITE_URL } from "./site";

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
  return `${SITE_URL}${path}`;
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

// What a pet needs before its passport is "issued" (the stamp moment).
// Microchip stays optional: not every pet has one.
export const PASSPORT_FIELDS = [
  ["name", "Name"],
  ["photo_url", "Photo"],
  ["breed", "Breed"],
  ["date_of_birth", "Date of birth"],
  ["emergency_contact_name", "Emergency contact name"],
  ["emergency_contact_phone", "Emergency contact phone"],
];

export function passportMissing(pet) {
  return PASSPORT_FIELDS.filter(([k]) => !filled(pet?.[k])).map(([, label]) => label);
}

export function passportReady(pet) {
  return passportMissing(pet).length === 0;
}

function mrzText(v) {
  return String(v || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "<")
    .replace(/^<+|<+$/g, "");
}

// Two passport-style machine-readable lines, built from the pet's own details.
// Decorative only: no chip number or contact details go in here.
export function mrzLines(pet, width = 36) {
  const pad = (s) => (s + "<".repeat(width)).slice(0, width);
  const l1 = pad(`P<PPG${mrzText(pet?.name)}<<${mrzText(pet?.breed || pet?.animal_type)}`);
  const no = mrzText(pet?.passport_no).replace(/</g, "");
  const dob = pet?.date_of_birth ? String(pet.date_of_birth).slice(2, 10).replace(/-/g, "") : "";
  const kind = mrzText(pet?.animal_type).slice(0, 3);
  const l2 = pad(`${no}<${kind}<${dob}`);
  return [l1, l2];
}

export function issuedLabel(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}
