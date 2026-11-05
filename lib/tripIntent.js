// Homepage chooser → Plan my trip. Query params only. Nothing here is saved
// on the trip row, so checkout and the trips table stay unchanged.
import { farTravelEnabled } from "./travelScope";

export const REGION_CHOICES = [
  { id: "us", label: "United States", hint: "Flights inside the U.S." },
  { id: "near", label: "Canada and Mexico", hint: "To or from Canada or Mexico" },
  ...(farTravelEnabled() ? [{ id: "international", label: "Other countries", hint: "Beyond the U.S., Canada, and Mexico" }] : []),
];

export function normalizeRegion(region) {
  if (region === "us" || region === "domestic") return "us";
  if (region === "near") return "near";
  if (region === "international" && farTravelEnabled()) return "international";
  return "";
}

export const PET_CHOICES = [
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
  { id: "service", label: "Service Animal" },
  { id: "esa", label: "Emotional Support Animal" },
];

const PET_ANSWERS = {
  dog: { animal: "Dog", role: "Pet", esa: false, psd: false },
  cat: { animal: "Cat", role: "Pet", esa: false, psd: false },
  service: { animal: "Dog", role: "Service animal", esa: false, psd: false },
  esa: { role: "Pet", esa: true, psd: false },
};

export const HOME_INTENT_KEY = "petpassgo_home_intent";

export function writeHomeIntent(region, pet) {
  try {
    if (!region && !pet) sessionStorage.removeItem(HOME_INTENT_KEY);
    else sessionStorage.setItem(HOME_INTENT_KEY, JSON.stringify({ region: region || "", pet: pet || "" }));
  } catch { /* private mode */ }
}

// Same URL the homepage chooser uses. Blank when nothing is selected.
export function readHomeIntentHref() {
  try {
    const raw = sessionStorage.getItem(HOME_INTENT_KEY);
    if (!raw) return "/assessment";
    const saved = JSON.parse(raw);
    return planTripHref(saved.region, saved.pet);
  } catch {
    return "/assessment";
  }
}

export function planTripHref(region, pet) {
  const q = new URLSearchParams();
  const normalized = normalizeRegion(region);
  if (normalized) q.set("region", normalized);
  if (PET_ANSWERS[pet]) q.set("pet", pet);
  const s = q.toString();
  return s ? `/assessment?${s}` : "/assessment";
}

export function readTripIntent(search) {
  const q = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  const region = normalizeRegion(q.get("region"));
  const pet = PET_ANSWERS[q.get("pet")] ? q.get("pet") : "";
  const answers = pet ? { ...PET_ANSWERS[pet] } : {};
  // Dog, cat, and service animal fill both opening questions. ESA still needs dog or cat.
  const step = pet === "dog" || pet === "cat" || pet === "service" ? 2 : 0;
  return { region, pet, answers, step };
}
