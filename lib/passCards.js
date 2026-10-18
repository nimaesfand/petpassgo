// Paid Travel Pass cards. Grouping, DOT de-dupe, and due dates live here so the
// checklist and the reminders engine share one calendar (lib/travelDates.js).
import { fmt, daysUntil, requirementDueDate, todayPT } from "./travelDates";

const FACT_CATEGORIES = new Set([
  "KENNEL REQUIREMENT",
  "AGE REQUIREMENT",
  "PET FEE",
  "BREED RESTRICTION",
  "WEIGHT LIMIT",
  "ROUTE RESTRICTION",
  "PHONE SUPPORT",
  "SEAT RESTRICTION",
  "CONNECTIONS",
  "GOOD TO KNOW",
  "AIRPORT DAY-OF",
  "PACKING",
]);

const ACTION_HINT = /BOOKING|REQUIRED FORM|SUBMISSION|WHAT HAPPENS|DAY OF FLIGHT|MISS A STEP/i;
const VERIFY_HINT = /HEALTH|VACCINATION/i;

export function wordCount(s) {
  return String(s || "").trim().split(/\s+/).filter(Boolean).length;
}

export function isServiceRole(role = "") {
  return /service|psychiatric/i.test(role || "");
}

export function isUnited(airline = "") {
  return /united/i.test(airline || "");
}

export function isFactCard(req) {
  if (!req) return false;
  if (req.fact) return true;
  const cat = String(req.category || "").toUpperCase();
  if (FACT_CATEGORIES.has(cat)) return true;
  return /encourag|not required|does not require|good to know|aren't required|are not required/i.test(`${req.title || ""} ${req.description || ""}`);
}

export function passStatus(req) {
  if (req?.status === "attention" || req?.status === "verify" || req?.status === "complete") return req.status;
  const cat = String(req?.category || "");
  if (/WHAT HAPPENS/i.test(cat) || isFactCard(req)) return "complete";
  if (VERIFY_HINT.test(cat)) return "verify";
  if (ACTION_HINT.test(cat)) return "attention";
  return "attention";
}

export function isDotCluster(req) {
  if (req?.dot) return true;
  const blob = `${req?.category || ""} ${req?.title || ""} ${req?.description || ""}`.toLowerCase();
  const cat = String(req?.category || "").toUpperCase();
  if ((cat === "REQUIRED FORM" || cat === "SUBMISSION") && /dot|service animal|air transportation|relief attestation/.test(blob)) return true;
  if (/dot service animal|service animal air transportation form/.test(blob)) return true;
  return false;
}

const SHORT_RULES = [
  [/dot|air transportation form/i, "DOT form"],
  [/relief attestation/i, "Relief form"],
  [/pet fee|\$0|cabin pet fee/i, "Pet fee"],
  [/737|carrier height|kennel|carrier/i, "Carrier fit"],
  [/two pets|2 pets|two seats/i, "Two pets, two seats"],
  [/united app/i, "United app note"],
  [/vaccin/i, "Vaccines"],
  [/health certificate|health doc/i, "Health docs"],
  [/book|reserv/i, "Reserve your pet"],
  [/breed/i, "Breed rule"],
  [/age/i, "Age rule"],
  [/seat/i, "Seat rule"],
  [/rabies/i, "Rabies vaccine"],
  [/screwworm|nws/i, "Screwworm check"],
  [/microchip/i, "Microchip"],
  [/connection/i, "Connections"],
];

export function shortTitle(req) {
  if (req?.shortTitle && wordCount(req.shortTitle) <= 6) return req.shortTitle;
  const blob = `${req?.title || ""} ${req?.category || ""}`;
  for (const [re, label] of SHORT_RULES) {
    if (re.test(blob) && wordCount(label) <= 6) return label;
  }
  const clipped = String(req?.title || "Trip step").replace(/[—–:].*$/, "").replace(/\s+/g, " ").trim();
  const words = clipped.split(" ").filter(Boolean).slice(0, 6);
  return words.join(" ") || "Trip step";
}

export function categoryIcon(category = "") {
  const c = String(category).toUpperCase();
  if (c.includes("BOOK")) return "📞";
  if (c.includes("KENNEL") || c.includes("CARRIER")) return "🧳";
  if (c.includes("FEE")) return "💵";
  if (c.includes("AGE")) return "🗓️";
  if (c.includes("WEIGHT")) return "⚖️";
  if (c.includes("BREED")) return "🐾";
  if (c.includes("FORM") || c.includes("DOT")) return "📄";
  if (c.includes("SUBMISSION")) return "📤";
  if (c.includes("HEALTH")) return "🩺";
  if (c.includes("VACCIN")) return "💉";
  if (c.includes("ROUTE") || c.includes("RESTRICT")) return "🚫";
  if (c.includes("PHONE")) return "☎️";
  if (c.includes("CARGO")) return "📦";
  return "📌";
}

export function dueChip(date, today = todayPT()) {
  if (!date) return { label: "Before you fly", tone: "later", date: null };
  const d = daysUntil(date, today);
  const pretty = fmt(date).replace(/, \d{4}$/, "");
  if (d < 0) return { label: pretty, tone: "overdue", date };
  if (d === 0) return { label: "Due today", tone: "today", date };
  if (d <= 7) return { label: pretty, tone: "soon", date };
  return { label: pretty, tone: "later", date };
}

function norm(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function covered(reqs, needle) {
  const n = norm(needle);
  return (reqs || []).some((r) => {
    const t = norm(`${r.title} ${r.description}`);
    return t.includes(n) || n.includes(norm(r.title).slice(0, 28));
  });
}

function host(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "official page"; }
}

// United-only facts from united.com (checked 2026-10-18). Never applied to other airlines.
function unitedSupplements(trip, reqs) {
  if (!isUnited(trip?.airline) || isServiceRole(trip?.role)) return [];
  const src = "https://www.united.com/en/us/fly/travel/traveling-with-pets.html";
  const rows = [
    {
      id: "syn:united-fee",
      category: "PET FEE",
      title: "Cabin pet fee: $150 each way",
      shortTitle: "Pet fee",
      description: "United charges $150 each way for a cat or dog in the cabin. Add the pet on united.com during booking or in My Trips.",
      source_url: src,
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    },
    {
      id: "syn:united-app",
      category: "BOOKING REQUIREMENT",
      title: "You can't add a pet in the United app",
      shortTitle: "United app note",
      description: "United says you cannot add a pet in the United app. Use united.com (book as “Travel with a pet”, or My Trips) or call United.",
      source_url: src,
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    },
    {
      id: "syn:united-max",
      category: "KENNEL REQUIREMENT",
      title: "737 MAX carrier height limit",
      shortTitle: "737 MAX height",
      description: "On a Boeing 737 MAX, United limits the pet carrier to 10 inches tall. Other United aircraft use the standard hard-sided (9 × 17.5 × 12 in) or soft-sided (11 × 18 × 11 in) maximums. This limit is United’s, not a rule for other airlines.",
      source_url: src,
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    },
    {
      id: "syn:united-two",
      category: "BOOKING REQUIREMENT",
      title: "Two pets means two seats",
      shortTitle: "Two pets, two seats",
      description: "On most United flights you may bring up to 2 pets per person, and you must buy 2 adjacent seats. Some aircraft, including the 737 MAX 8 and MAX 9, allow only one pet per person. Confirm your aircraft when you book.",
      source_url: src,
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    },
    {
      id: "syn:united-health",
      category: "HEALTH DOCUMENTATION",
      title: "Health certificate encouraged, not required",
      shortTitle: "Health docs",
      description: "For travel within the U.S., United encourages a certificate of health from your vet. It is not required for domestic cabin pets. International flights do require a health and vaccination certificate. Good to know — this is not a task to mark done.",
      source_url: src,
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    },
  ];
  return rows.filter((r) => {
    if (r.category === "PET FEE" && reqs.some((x) => String(x.category).toUpperCase() === "PET FEE")) return false;
    if (r.id === "syn:united-health" && reqs.some((x) => /encourag/i.test(`${x.title} ${x.description}`))) return false;
    if (r.id === "syn:united-max" && reqs.some((x) => /737|carrier height/i.test(`${x.title} ${x.description}`))) return false;
    if (r.id === "syn:united-two" && reqs.some((x) => /two pets|2 pets|two seats/i.test(`${x.title} ${x.description}`))) return false;
    if (r.id === "syn:united-app" && reqs.some((x) => /united app/i.test(`${x.title} ${x.description}`))) return false;
    return !covered(reqs, r.title);
  });
}

function serviceSupplements(trip) {
  if (!isServiceRole(trip?.role)) return [];
  const dog = /dog/i.test(trip?.animal_type || "") || !trip?.animal_type;
  const cards = [];
  if (dog) {
    cards.push({
      id: "syn:service-fee",
      category: "PET FEE",
      title: "$0 pet fee for a service dog",
      shortTitle: "$0 pet fee",
      description: "A dog that qualifies as a service animal — including a psychiatric service dog (PSD) — is not charged the airline pet fee on U.S. airlines. Emotional support animals are not service animals.",
      why: "U.S. airlines do not charge a pet fee for a qualified service dog. Confirm your airline still treats the dog as a service animal under the DOT rule before you fly.",
      what: "Confirm the $0 service-dog fee with your airline when you add the dog to the reservation. You still complete the DOT form.",
      source_url: "https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals",
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    });
  }
  return cards;
}

function mergeDot(rows, trip) {
  const form = rows.find((r) => /REQUIRED FORM/i.test(r.category || "")) || rows[0];
  const submission = rows.find((r) => /SUBMISSION/i.test(r.category || ""));
  const link = submission?.submission_link || form.submission_link || form.source_url || null;
  const source = form.source_url || submission?.source_url || "https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals";
  const airline = trip?.airline || "your airline";
  return {
    ...form,
    id: form.id || "syn:dot-form",
    mergedIds: rows.map((r) => r.id).filter(Boolean),
    category: "REQUIRED FORM",
    title: "DOT form",
    shortTitle: "DOT form",
    dot: true,
    fact: false,
    status: "attention",
    dueKind: "dot48",
    description: [form.description, submission && submission !== form ? submission.description : ""].filter(Boolean).join("\n\n"),
    what: `Fill out the official DOT Service Animal Air Transportation Form and send it to ${airline} the way they ask.`,
    why: `If you booked more than 48 hours before departure, ${airline} may require the form up to 48 hours before you fly. It is not an unconditional 48-hour rule. PetPassGo gives you only the official DOT PDFs. We will not check attestation boxes or sign for you. You do not need a separate service-animal letter or certificate.`,
    submission_link: link,
    source_url: source,
    sourceHost: host(source),
    goLabel: submission?.submission_link ? `Send it to ${airline}` : "Official DOT page",
  };
}

function present(req, trip) {
  const fact = isFactCard(req);
  const dot = isDotCluster(req);
  const due = requirementDueDate({ ...req, dot, dueKind: req.dueKind }, trip);
  const source = req.source_url || null;
  let why = req.why || req.description || "";
  const blob = `${req.title} ${req.description}`;
  if (/alaska|jetblue|hawaiian/i.test(trip?.airline || "") && /service animal id/i.test(blob)) {
    why = `${why} This Service Animal ID is free and issued by the airline. It is not a credential you buy.`.trim();
  }
  return {
    ...req,
    mergedIds: req.mergedIds?.length ? req.mergedIds : [req.id].filter(Boolean),
    fact,
    dot,
    shortTitle: shortTitle(req),
    icon: req.icon || categoryIcon(req.dot ? "DOT" : req.category),
    what: req.what || req.title,
    why,
    dueDate: due,
    groupHint: fact ? "know" : passStatus(req) === "verify" ? "confirm" : passStatus(req) === "complete" ? "know" : "first",
    sourceHost: source ? host(source) : null,
  };
}

export function buildPassCards(requirements, trip) {
  const raw = [...(requirements || [])].filter((r) => r && r.category !== "ELIGIBILITY NOTE");
  const supplements = [...unitedSupplements(trip, raw), ...serviceSupplements(trip)];
  const all = [...raw, ...supplements];
  const dotRows = all.filter(isDotCluster);
  const rest = all.filter((r) => !isDotCluster(r));
  const cards = rest.map((r) => present(r, trip));
  if (dotRows.length) cards.unshift(present(mergeDot(dotRows, trip), trip));
  else if (isServiceRole(trip?.role) && /dog/i.test(trip?.animal_type || "dog")) {
    cards.unshift(present(mergeDot([{
      id: "syn:dot-form",
      category: "REQUIRED FORM",
      title: "DOT form",
      description: "U.S. airlines use the official DOT Service Animal Air Transportation Form.",
      source_url: "https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals",
    }], trip), trip));
  }
  return cards;
}

export function cardDone(card, statusMap = {}) {
  if (card.fact) return false;
  const ids = card.mergedIds?.length ? card.mergedIds : [card.id];
  return ids.every((id) => !!statusMap[id]);
}

export function groupCards(cards, statusMap = {}) {
  const first = [];
  const confirm = [];
  const know = [];
  const done = [];
  for (const card of cards) {
    if (cardDone(card, statusMap)) { done.push(card); continue; }
    if (card.fact || card.groupHint === "know") know.push(card);
    else if (card.groupHint === "confirm") confirm.push(card);
    else first.push(card);
  }
  const byDue = (a, b) => String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999"));
  first.sort(byDue);
  confirm.sort(byDue);
  return { first, confirm, know, done };
}

export function passCardSelfCheck(today = "2026-11-01") {
  const errors = [];
  const trip = { airline: "United", role: "Pet", animal_type: "Dog", travel_date: "2026-11-20", origin: "SFO", destination: "EWR" };
  const dotRows = [
    { id: "a", category: "REQUIRED FORM", title: "DOT Service Animal Air Transportation Form", description: "Complete the DOT form.", status: "attention" },
    { id: "b", category: "SUBMISSION", title: "Submit the DOT form to United", description: "Email the form to the airline.", status: "attention", submission_link: "https://www.united.com/en/us/fly/travel/animals/service-animals.html" },
    { id: "c", category: "REQUIRED FORM", title: "ServiceAnimalTrack reminder", description: "DOT service animal form deadline copy.", status: "attention" },
    { id: "d", category: "SUBMISSION", title: "dot48 reminder duplicate", description: "Another DOT service animal submission step.", status: "attention" },
  ];
  const cards = buildPassCards(dotRows, { ...trip, role: "Service animal" });
  const dots = cards.filter((c) => c.dot);
  if (dots.length !== 1) errors.push(`expected 1 DOT card, got ${dots.length}`);
  if (dots[0] && dots[0].dueDate !== "2026-11-18") errors.push(`DOT due ${dots[0]?.dueDate} should be travel-2`);
  if (dots[0] && dots[0].mergedIds.length < 4) errors.push("DOT merge dropped rows");
  if (dots[0] && !/will not check attestation/i.test(dots[0].why)) errors.push("missing differentiator");
  if (dots[0] && !/more than 48 hours/i.test(dots[0].why)) errors.push("DOT wording still unconditional");
  const titles = cards.map((c) => c.shortTitle);
  if (titles.some((t) => wordCount(t) > 6)) errors.push(`title over 6 words: ${titles.filter((t) => wordCount(t) > 6).join(", ")}`);
  const fee = cards.find((c) => c.id === "syn:service-fee" || /\$0/.test(c.shortTitle || ""));
  if (!fee?.fact) errors.push("missing $0 service fee fact");
  const united = buildPassCards([], trip);
  if (!united.some((c) => /737 MAX/.test(c.shortTitle))) errors.push("missing United 737 card");
  if (!united.some((c) => /United app/.test(c.shortTitle))) errors.push("missing United app card");
  if (!united.some((c) => /Health docs/.test(c.shortTitle))) errors.push("missing encouraged health card");
  const delta = buildPassCards([], { ...trip, airline: "Delta" });
  if (delta.some((c) => /737|United app|\$150/.test(`${c.title} ${c.shortTitle}`))) errors.push("United facts leaked onto Delta");
  const groups = groupCards(cards, { a: true, b: true, c: true, d: true });
  if (groups.done.length !== 1 || groups.first.some((c) => c.dot)) errors.push("done stack did not sink the DOT card");
  const chip = dueChip("2026-11-18", today);
  if (chip.tone !== "later") errors.push(`chip tone ${chip.tone}`);
  const overdue = dueChip("2026-10-01", today);
  if (overdue.tone !== "overdue") errors.push("overdue tone");
  if (requirementDueDate({ category: "REQUIRED FORM", title: "DOT form", description: "service animal" }, { travel_date: null })) errors.push("due date invented without a travel date");
  return errors;
}
