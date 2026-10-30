// Homepage chooser → Plan my trip. Query params only. Nothing here is saved
// on the trip row, so checkout and the trips table stay unchanged.

export const REGION_CHOICES = [
  { id: "domestic", label: "Domestic", hint: "U.S., Canada and Mexico" },
  { id: "international", label: "International", hint: "Beyond the U.S., Canada and Mexico" },
];

export const PET_CHOICES = [
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
  { id: "service", label: "Service animal" },
  { id: "esa", label: "ESA" },
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
  if (region === "domestic" || region === "international") q.set("region", region);
  if (PET_ANSWERS[pet]) q.set("pet", pet);
  const s = q.toString();
  return s ? `/assessment?${s}` : "/assessment";
}

export function readTripIntent(search) {
  const q = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  const region = q.get("region") === "international" ? "international" : q.get("region") === "domestic" ? "domestic" : "";
  const pet = PET_ANSWERS[q.get("pet")] ? q.get("pet") : "";
  const answers = pet ? { ...PET_ANSWERS[pet] } : {};
  // Dog, cat, and service animal fill both opening questions. ESA still needs dog or cat.
  const step = pet === "dog" || pet === "cat" || pet === "service" ? 2 : 0;
  return { region, pet, answers, step };
}
