// Training details and the service dog statement. Everything here is what the owner
// tells us. PetPassGo doesn't certify, register or test any animal.

export const TRAINING_LEVELS = [
  ["house", "House trained"],
  ["crate", "Crate trained"],
  ["leash", "Walks well on a leash"],
  ["obedience", "Basic obedience (sit, stay, come)"],
  ["cgc", "AKC Canine Good Citizen title"],
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
  ["owner", "Owner trained"],
  ["trainer", "Dog trainer"],
  ["program", "Trained in a program"],
];

// Typed trainer name and business. Plain names only: no words that make the dog
// sound certified or officially approved.
const BLOCKED = /\b(official(ly)?|certif\w*|regist\w*|approv\w*|licen[sc]\w*|accredit\w*|verified|government|federal|ada\b|usdr|usa?\s*service\s*dog\s*registr\w*)/i;
export function cleanTrainerText(v, max = 80) {
  const t = String(v || "").replace(/[<>{}\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  if (!t) return { ok: true, value: "" };
  if (BLOCKED.test(t)) return { ok: false, value: t, error: "Please use just the trainer's name and business, without words like certified, registered or official." };
  return { ok: true, value: t };
}

// Specific tasks, grouped. Owners pick; nothing is typed.
export const TASK_GROUPS = [
  { key: "psychiatric", label: "Psychiatric tasks", tasks: [
    ["dpt", "Deep pressure therapy"],
    ["anxiety", "Interrupting anxiety or panic"],
    ["interrupt", "Interrupting self-harm or repetitive behaviors"],
    ["dissociation", "Alerting to dissociation"],
    ["backwatch", "Watching your back in public"],
    ["leadhome", "Leading you home"],
    ["ground", "Grounding (nudge, lick, lean)"],
    ["nightmare", "Waking from nightmares"],
    ["roomsearch", "Room checks before entering"],
    ["space", "Blocking people from crowding you"],
    ["exit", "Guiding to an exit"],
    ["medremind", "Medication reminders"],
  ] },
  { key: "medical", label: "Medical alert tasks", tasks: [
    ["glucose", "Blood sugar alert"],
    ["seizure", "Seizure alert or response"],
    ["cardiac", "Cardiac alert"],
    ["pots", "Low blood pressure or fainting (POTS) alert"],
    ["asthma", "Asthma alert"],
    ["migraine", "Migraine alert"],
    ["allergen", "Allergen detection (peanut, gluten and more)"],
    ["fetchmeds", "Bringing medication or a phone"],
    ["gethelp", "Alerting another person or getting help"],
  ] },
  { key: "mobility", label: "Mobility tasks", tasks: [
    ["retrieve", "Retrieving dropped items"],
    ["doors", "Opening doors"],
    ["brace", "Balance, bracing or counterbalance"],
    ["standup", "Help standing up"],
    ["wheelchair", "Pulling a wheelchair"],
    ["carry", "Carrying items"],
    ["lights", "Turning lights on and off"],
    ["undress", "Helping take off clothes or shoes"],
    ["buttons", "Pressing buttons"],
  ] },
  { key: "hearing", label: "Hearing and vision tasks", tasks: [
    ["sounds", "Sound alerts (alarms, doorbell, name)"],
    ["homesounds", "Alerting to a phone, a baby crying or a timer"],
    ["obstacles", "Guiding around obstacles"],
    ["curbs", "Stopping at curbs and stairs"],
    ["findseat", "Finding doors, seats, elevators or crosswalks"],
  ] },
  { key: "autism", label: "Autism support tasks", tasks: [
    ["tether", "Tethering to prevent bolting"],
    ["calming", "Calming pressure"],
    ["meltdown", "Interrupting meltdowns"],
    ["autismhome", "Leading you home"],
  ] },
  { key: "other", label: "Other tasks", tasks: [["findcar", "Finding the car"], ["other", "Another task not listed"]] },
];
// Older saved tasks were whole groups. They still count, as their group.
const OLD_TASK = { guide: "hearing", hearing: "hearing", mobility: "mobility", medical: "medical", psychiatric: "psychiatric", autism: "autism" };
const TASK_LABEL = Object.fromEntries(TASK_GROUPS.flatMap((g) => g.tasks.map(([k, l]) => [k, l])));
const TASK_GROUP = Object.fromEntries(TASK_GROUPS.flatMap((g) => g.tasks.map(([k]) => [k, g.key])));
export const ALL_TASK_KEYS = [...Object.keys(TASK_LABEL), ...Object.keys(OLD_TASK)];
const groupOf = (k) => TASK_GROUP[k] || OLD_TASK[k] || "";
const groupLabel = (g) => (TASK_GROUPS.find((x) => x.key === g) || {}).label || "";
// Back-compat name used by older imports.
export const SERVICE_TASKS = TASK_GROUPS.map((g) => [g.key, g.label]);

export const PLACES = [
  ...[["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["PR","Puerto Rico"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]],
  ["CANADA", "Canada"], ["MEXICO", "Mexico"], ["OTHER", "Outside North America"],
];

const label = (list, k) => (list.find(([x]) => x === k) || [])[1] || "";
export const placeLabel = (k) => label(PLACES, k);
export const legacyPlace = (t) => (t?.trained_where && !placeLabel(t.trained_where) ? String(t.trained_where) : "");

// Short line for the passport, most advanced level first.
export function trainingSummary(t) {
  const lv = Array.isArray(t?.levels) ? t.levels : [];
  if (!lv.length) return "";
  const order = ["tasks", "public", "cgc", "obedience", "leash", "crate", "house"];
  const short = { tasks: "Task trained", public: "Public access", cgc: "Canine Good Citizen", obedience: "Obedience", leash: "Leash", crate: "Crate", house: "House" };
  const top = order.filter((k) => lv.includes(k)).map((k) => short[k]);
  return top.slice(0, 3).join(", ");
}

// Who trained them: "Owner trained", a dog trainer (name and business), or a
// program (its name, kept in trainer_business; older saves kept it in trainer_name).
export const programName = (t) => String(t?.trainer_business || t?.trainer_name || "").trim();
export function trainedByLine(t) {
  if (!t?.trained_by) return "";
  if (t.trained_by === "owner") return "Owner trained";
  if (t.trained_by === "program") return programName(t) ? `Trained in ${programName(t)}` : "Trained in a program";
  const name = String(t.trainer_name || "").trim(), biz = String(t.trainer_business || "").trim();
  const who = [name, biz && biz !== name ? biz : ""].filter(Boolean).join(", ");
  return who ? `Trained by ${who}` : "Trained by a dog trainer";
}
// Where they trained, only from the dropdown (typed places stay private).
export const whereLine = (t, owner = false) => placeLabel(t?.trained_where) || (owner ? legacyPlace(t) : "");

// Tasks. Owner sees each task; everyone else sees groups only.
export const tasksLine = (tasks) => (tasks || []).map((k) => TASK_LABEL[k] || groupLabel(OLD_TASK[k])).filter(Boolean).join(", ");
export const taskGroupsLine = (tasks) => Array.from(new Set((tasks || []).map(groupOf).filter(Boolean))).map(groupLabel).join(", ");

// What goes in the DOT form's trainer fields.
export function trainerForDot(t, handler = "") {
  if (!t?.trained_by) return "";
  if (t.trained_by === "owner") return handler;
  if (t.trained_by === "program") return programName(t);
  const name = String(t.trainer_name || "").trim(), biz = String(t.trainer_business || "").trim();
  return [name, biz && biz !== name ? biz : ""].filter(Boolean).join(", ");
}

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
