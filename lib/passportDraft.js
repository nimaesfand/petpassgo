// A passport made before signing up. Held for 7 days, then it's gone unless kept.
export const DRAFT_DAYS = 7;
export const KEEP_TOKEN_KEY = "ppg_keep_passport_token";

const clip = (v, n) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, n);

export function cleanDraft(d = {}) {
  const animal = d.animal_type === "Cat" ? "Cat" : "Dog";
  const sex = ["Male", "Female"].includes(d.sex) ? d.sex : "";
  const dob = /^\d{4}-\d{2}-\d{2}$/.test(d.date_of_birth || "") ? d.date_of_birth : "";
  return {
    animal_type: animal,
    name: clip(d.name, 40),
    breed: clip(d.breed, 60),
    sex,
    date_of_birth: dob,
    handler_name: clip(d.handler_name, 60),
  };
}

export const validEmail = (e) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(String(e || "").trim());
