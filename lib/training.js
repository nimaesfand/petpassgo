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
  ["owner", "I trained them"],
  ["trainer", "A professional trainer"],
  ["program", "A service dog program"],
];

// Specific tasks, grouped. Owners pick; nothing is typed.
export const TASK_GROUPS = [
  { key: "psychiatric", label: "Psychiatric tasks", tasks: [
    ["dpt", "Deep pressure therapy"],
    ["anxiety", "Interrupting anxiety or panic"],
    ["interrupt", "Interrupting PTSD or self-harm behavior"],
    ["ground", "Grounding (nudge, lick, lean)"],
    ["nightmare", "Waking from nightmares"],
    ["roomsearch", "Room search before entering"],
    ["space", "Creating space in crowds"],
    ["exit", "Guiding to an exit"],
    ["medremind", "Medication reminders"],
    ["lights", "Turning on lights"],
  ] },
  { key: "medical", label: "Medical alert tasks", tasks: [
    ["glucose", "Blood sugar alert"],
    ["seizure", "Seizure alert or response"],
    ["cardiac", "Cardiac alert"],
    ["migraine", "Migraine alert"],
    ["allergen", "Allergen detection"],
    ["fetchmeds", "Bringing medication or a phone"],
    ["gethelp", "Getting help"],
  ] },
  { key: "mobility", label: "Mobility tasks", tasks: [
    ["retrieve", "Retrieving dropped items"],
    ["doors", "Opening doors"],
    ["brace", "Balance, bracing or counterbalance"],
    ["buttons", "Pressing buttons"],
  ] },
  { key: "hearing", label: "Hearing and vision tasks", tasks: [
    ["sounds", "Sound alerts (alarms, doorbell, name)"],
    ["obstacles", "Guiding around obstacles"],
    ["findseat", "Finding doors and seats"],
  ] },
  { key: "autism", label: "Autism support tasks", tasks: [
    ["tether", "Tethering to prevent bolting"],
    ["calming", "Calming pressure"],
  ] },
  { key: "other", label: "Other tasks", tasks: [["other", "Other task (describe it on the airline's form)"]] },
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

// Well-known U.S. service and guide dog programs (checked Nov 2026). Never ADI:
// it accredits programs, it doesn't train dogs.
export const PROGRAMS = [
  ["gdb", "Guide Dogs for the Blind"],
  ["seeingeye", "The Seeing Eye"],
  ["gdf", "Guide Dog Foundation"],
  ["vetdogs", "America's VetDogs"],
  ["canine", "Canine Companions"],
  ["neads", "NEADS World Class Service Dogs"],
  ["pwac", "Paws With A Cause"],
  ["dfbl", "Dogs for Better Lives"],
  ["4paws", "4 Paws for Ability"],
  ["fsd", "Freedom Service Dogs of America"],
  ["k9w", "K9s For Warriors"],
  ["leader", "Leader Dogs for the Blind"],
  ["guidingeyes", "Guiding Eyes for the Blind"],
  ["cpl", "Canine Partners for Life"],
  ["candocanines", "Can Do Canines"],
  ["patriotpaws", "Patriot PAWS Service Dogs"],
  ["susquehanna", "Susquehanna Service Dogs"],
  ["gdatlc", "Guide Dogs of America | Tender Loving Canines"],
  ["another", "Another program"],
];

export const PLACES = [
  ...[["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["PR","Puerto Rico"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]],
  ["CANADA", "Canada"], ["MEXICO", "Mexico"], ["OTHER", "Outside North America"],
];

const label = (list, k) => (list.find(([x]) => x === k) || [])[1] || "";
export const placeLabel = (k) => label(PLACES, k);
export const programLabel = (k) => (k && k !== "another" ? label(PROGRAMS, k) : "");
// A typed value from before the pick-lists. Kept, shown to the owner only.
export const legacyTrainer = (t) => (t?.trained_by && t.trained_by !== "owner" && !t.program && String(t.trainer_name || "").trim()) || "";
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

// Who trained them. Public: never a program's name (it would read like an endorsement).
// Owner: the program they picked, or what they typed before the pick-lists.
export function trainedByLine(t, owner = false) {
  if (!t?.trained_by) return "";
  if (t.trained_by === "owner") return "Owner";
  if (t.trained_by === "trainer") return owner && legacyTrainer(t) ? legacyTrainer(t) : "A professional trainer";
  if (owner) return programLabel(t.program) || legacyTrainer(t) || "A service dog program";
  return "Owner says a service dog program trained them";
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
  if (t.trained_by === "trainer") return legacyTrainer(t) || "Professional trainer";
  return programLabel(t.program) || legacyTrainer(t) || "Service dog program";
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
