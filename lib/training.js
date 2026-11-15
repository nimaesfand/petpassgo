// Training details and the service dog statement. Everything here is what the owner
// tells us. PetPassGo doesn't certify, register or test any animal.

export const TRAINING_LEVELS = [
  ["house", "House trained"],
  ["crate", "Crate trained"],
  ["leash", "Walks well on a leash"],
  ["obedience", "Basic obedience (sit, stay, come)"],
  ["cgc", "AKC Canine Good Citizen"],
  ["public", "Public access trained"],
  ["tasks", "Trained to do tasks for a disability"],
];
// Cats and other pets don't get the dog-only levels.
export const levelsFor = (animal, role) => TRAINING_LEVELS.filter(([k]) => {
  if (animal !== "Dog") return ["house", "crate", "leash"].includes(k);
  if (k === "tasks") return /service/i.test(role || "");
  return true;
});

export const TRAINED_BY = [
  ["owner", "I trained them"],
  ["trainer", "A professional trainer"],
  ["program", "A service dog program"],
];

export const SERVICE_TASKS = [
  ["guide", "Guiding (vision)"],
  ["hearing", "Sound alerts (hearing)"],
  ["mobility", "Mobility and balance"],
  ["medical", "Medical alert or response"],
  ["psychiatric", "Psychiatric tasks"],
  ["autism", "Autism support tasks"],
  ["other", "Other tasks"],
];

const label = (list, k) => (list.find(([x]) => x === k) || [])[1] || "";

// Short line for the passport, most advanced level first.
export function trainingSummary(t) {
  const lv = Array.isArray(t?.levels) ? t.levels : [];
  if (!lv.length) return "";
  const order = ["tasks", "public", "cgc", "obedience", "leash", "crate", "house"];
  const short = { tasks: "Task trained", public: "Public access", cgc: "Canine Good Citizen", obedience: "Obedience", leash: "Leash", crate: "Crate", house: "House" };
  const top = order.filter((k) => lv.includes(k)).map((k) => short[k]);
  return top.slice(0, 3).join(", ");
}

export function trainedByLine(t) {
  if (!t?.trained_by) return "";
  if (t.trained_by === "owner") return "Owner";
  const who = String(t.trainer_name || "").trim();
  return who || label(TRAINED_BY, t.trained_by);
}

export const tasksLine = (tasks) => (tasks || []).map((k) => label(SERVICE_TASKS, k)).filter(Boolean).join(", ");

export const STATEMENT_VERSION = "2026-11-15";

export function statementText({ petName, signedName }) {
  const n = petName || "This dog";
  return [
    `I, ${signedName || "[name]"}, attest that ${n} is a dog individually trained to do work or perform tasks for a person with a disability: me, or the person ${n} travels with.`,
    `${n} is not an emotional support animal, a comfort animal or a pet.`,
    `The training details I gave PetPassGo are true to the best of my knowledge.`,
    `I understand that knowingly misrepresenting an animal as a service animal can break federal and state laws and can lead to fines or other penalties.`,
    `I understand this is my own statement. PetPassGo does not certify, register or test service dogs, and airlines may still ask me to fill out their own forms, like the U.S. DOT Service Animal Air Transportation Form.`,
    `I agree to the PetPassGo Terms.`,
  ].join("\n\n");
}
