// A passport made before signing up. Held for 7 days, then it's gone unless kept.
export const DRAFT_DAYS = 7;
export const KEEP_TOKEN_KEY = "ppg_keep_passport_token";

import { ALL_TASK_KEYS, TRAINED_BY, cleanTrainerText } from "./training";

const clip = (v, n) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, n);

// Service dog extras collected by Benny before the reveal (what the DOT form needs,
// plus the signed promise). Picks only; typed trainer text goes through the word filter.
function cleanService(v) {
  if (!v || typeof v !== "object") return null;
  const by = TRAINED_BY.some(([k]) => k === v.trained_by) ? v.trained_by : "";
  const tn = cleanTrainerText(v.trainer_name), tb = cleanTrainerText(v.trainer_business);
  const okTask = new Set(ALL_TASK_KEYS);
  const w = Number(v.weight);
  return {
    weight: w > 0 && w < 300 ? Math.round(w * 10) / 10 : null,
    trained_by: by,
    trainer_name: by === "trainer" && tn.ok ? tn.value : "",
    trainer_business: by && by !== "owner" && tb.ok ? tb.value : "",
    tasks: Array.from(new Set((Array.isArray(v.tasks) ? v.tasks : []).filter((t) => okTask.has(t)))),
    vet_name: clip(v.vet_name, 80),
    vet_phone: clip(v.vet_phone, 30),
    rabies_exp: /^\d{4}-\d{2}-\d{2}$/.test(v.rabies_exp || "") ? v.rabies_exp : "",
    signed_name: clip(v.signed_name, 120),
    attest: v.attest === true,
  };
}

export function cleanDraft(d = {}) {
  const animal = d.animal_type === "Cat" ? "Cat" : "Dog";
  const sex = ["Male", "Female"].includes(d.sex) ? d.sex : "";
  const dob = /^\d{4}-\d{2}-\d{2}$/.test(d.date_of_birth || "") ? d.date_of_birth : "";
  // Only dogs can be service animals on U.S. flights.
  const role = d.role === "Service animal" && animal === "Dog" ? "Service animal" : d.role === "Emotional support animal" ? "Emotional support animal" : "Pet";
  return {
    animal_type: animal,
    role,
    name: clip(d.name, 40),
    breed: clip(d.breed, 60),
    sex,
    date_of_birth: dob,
    handler_name: clip(d.handler_name, 60),
    service: role === "Service animal" ? cleanService(d.service) : null,
  };
}

export const validEmail = (e) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(String(e || "").trim());
