// Paid Travel Pass cards. Titles are category-locked: a keyword in one
// requirement must not rename a different requirement (e.g. "stowage" is not an age rule).
import { fmt, daysUntil, requirementDueDate, todayPT } from "./travelDates";
import { AIRPORTS, findAirport } from "./airports";
import { PET_RELIEF } from "./petRelief";

const FACT_CATEGORIES = new Set([
  "KENNEL REQUIREMENT",
  "AGE REQUIREMENT",
  "AGE MINIMUM",
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
  "CARGO",
  "LIMITS",
  "IF YOUR PET DOESN'T FIT IN THE CABIN",
  "NO CARGO OR INTERNATIONAL TRAVEL",
  "NO CARGO AVAILABLE",
  "WHAT HAPPENS IF YOU MISS A STEP",
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
  return /encourag|not required|does not require|aren't required|are not required/i.test(`${req.title || ""} ${req.description || ""}`);
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

function blobOf(req) {
  return `${req?.title || ""} ${req?.description || ""}`;
}

// Titles come from the requirement category first. Content keywords only
// split cards that share a category. They never rename a different category.
export function shortTitle(req) {
  if (req?.shortTitle && wordCount(req.shortTitle) <= 6) return req.shortTitle;
  const cat = String(req?.category || "").toUpperCase();
  const blob = blobOf(req);

  if (cat.includes("SEAT")) return "Seat restrictions";
  if (cat.includes("AGE")) return "Age rule";
  if (cat === "PACKING") return "What to pack";
  if (cat === "CONNECTIONS") return "Connecting flights";
  if (cat === "AIRPORT DAY-OF") {
    if (/relief/i.test(blob)) return "Pet relief areas";
    if (/tsa|x-ray|xray/i.test(blob)) return "Empty carrier at TSA";
    return "At the airport";
  }
  if (cat.includes("KENNEL") || cat === "CARRIER") {
    if (/737|\b10 inches tall\b/i.test(blob)) return "737 MAX height";
    return "Carrier fit";
  }
  if (cat.includes("FEE")) {
    if (/hawaii|\$35/i.test(blob)) return "Hawaii pet fee";
    if (/\$0|service dog/i.test(req?.title || "")) return "$0 pet fee";
    return "Pet fee";
  }
  if (cat.includes("BREED")) return "Breed rule";
  if (cat.includes("WEIGHT")) return "Weight limit";
  if (cat.includes("BOOK")) {
    if (/united app/i.test(blob)) return "United app note";
    if (/two pets|2 pets|two seats/i.test(blob)) return "Two pets, two seats";
    if (/^check-?\s?in/i.test(req?.title || "")) return "Check in early";
    return "Reserve your pet";
  }
  if (cat.includes("HEALTH")) {
    if (/screwworm|\bnws\b/i.test(blob)) return "Screwworm check";
    if (/favn/i.test(blob)) return "FAVN rabies test";
    if (/cdc dog import/i.test(blob)) return "CDC dog import";
    if (/senasica/i.test(blob)) return "Mexico arrival check";
    if (/7001/.test(blob)) return "Hawaii health cert";
    if (/vaccin/i.test(blob) && !/health certificate/i.test(blob)) return "Vaccines";
    if (/encourag/i.test(blob)) return "Health docs";
    return "Health certificate";
  }
  if (cat.includes("VACCIN")) return /month|week old|at least/i.test(blob) ? "Age and vaccines" : "Vaccines";
  if (cat.includes("ROUTE")) return "Route limits";
  if (cat.includes("PHONE")) return /accessib/i.test(blob) ? "Accessibility line" : "Phone line";
  if (cat.includes("DAY OF")) return /check-?\s?in|^counters?\b/i.test(req?.title || "") ? "Check in early" : "Travel day steps";
  if (cat.includes("DOESN'T FIT") || cat.includes("NO CARGO") || cat === "CARGO") return "If pet won't fit";
  if (cat === "LIMITS") return "Cabin pet space";
  if (cat.includes("WHAT HAPPENS")) return "If papers are missing";
  if (cat.includes("GOOD TO KNOW")) return /service animal id/i.test(blob) ? "Service animal ID" : "Good to know";
  if (cat.includes("SERVICE")) return "Service animal";
  if ((cat.includes("FORM") || cat.includes("SUBMISSION")) && /relief attestation/i.test(blob) && !/air transportation/i.test(blob)) return "Relief form";
  if ((cat.includes("FORM") || cat.includes("SUBMISSION") || cat.includes("DOT")) && /dot|air transportation/i.test(blob)) return "DOT form";
  if (cat.includes("SUBMISSION")) return "Send the form";
  if (cat.includes("FORM")) return /hawaii|aqs/i.test(blob) ? "Hawaii import form" : "Required form";

  const clipped = String(req?.title || "Trip step").replace(/[—–:].*$/, "").replace(/\s+/g, " ").trim();
  const words = clipped.split(" ").filter(Boolean).slice(0, 4);
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
  if (c.includes("SEAT")) return "💺";
  if (c.includes("FORM") || c.includes("DOT")) return "📄";
  if (c.includes("SUBMISSION")) return "📤";
  if (c.includes("HEALTH")) return "🩺";
  if (c.includes("VACCIN")) return "💉";
  if (c.includes("ROUTE") || c.includes("RESTRICT")) return "🚫";
  if (c.includes("PHONE")) return "☎️";
  if (c.includes("CONNECT")) return "🔁";
  if (c.includes("PACK")) return "🎒";
  if (c.includes("CARGO") || c.includes("FIT")) return "📦";
  return "📌";
}

function iconFor(req) {
  const cat = String(req?.category || "").toUpperCase();
  const blob = `${req?.title || ""} ${cat}`;
  if (cat.includes("SEAT")) return "💺";
  if (/relief/i.test(blob)) return "🌿";
  if (/tsa|x-ray|xray/i.test(blob)) return "🛂";
  if (cat.includes("PACK")) return "🎒";
  if (cat.includes("CONNECT")) return "🔁";
  if (cat.includes("AGE")) return "🗓️";
  return req?.icon || categoryIcon(cat);
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

function trimFiller(s) {
  return String(s || "")
    .replace(/good to know\s*[—–:-]?\s*/gi, "")
    .replace(/this is not a (separate )?task( to mark done)?\.?/gi, "")
    .replace(/not a task to mark done\.?/gi, "")
    .replace(/this (limit|note) is united[’']s,? not a rule for other airlines\.?/gi, "")
    .replace(/this is united[’']s rule, not a blanket rule for other airlines\.?/gi, "")
    .replace(/this height limit is united[’']s rule for that aircraft, not a rule for other airlines\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}

function sameish(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const shorter = x.length < y.length ? x : y;
  const longer = x.length < y.length ? y : x;
  return shorter.length > 40 && longer.includes(shorter);
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

const AIRLINE_HOSTS = [
  [/united/i, "united.com"],
  [/delta/i, "delta.com"],
  [/american/i, "aa.com"],
  [/southwest/i, "southwest.com"],
  [/jetblue/i, "jetblue.com"],
  [/alaska|hawaiian/i, "alaskaair.com"],
  [/frontier/i, "flyfrontier.com"],
  [/allegiant/i, "allegiantair.com"],
  [/sun country/i, "suncountry.com"],
  [/aerom/i, "aeromexico.com"],
  [/volaris/i, "volaris.com"],
  [/viva/i, "vivaaerobus.com"],
];

// A row filed under airline "Any" must not cite a different airline as this trip's rule.
function alignedSource(req, trip) {
  const url = req?.source_url || null;
  if (!url) return null;
  const cat = String(req?.category || "").toUpperCase();
  if (cat === "PACKING" || (cat === "AIRPORT DAY-OF" && /relief/i.test(req?.title || ""))) return null;
  if (String(req?.airline || "") !== "Any") return url;
  const h = host(url);
  const cited = AIRLINE_HOSTS.find(([, name]) => h === name || h.endsWith(`.${name}`) || h.includes(name));
  if (!cited) return url;
  const tripHost = AIRLINE_HOSTS.find(([re]) => re.test(trip?.airline || ""))?.[1];
  if (tripHost && cited[1] === tripHost) return url;
  return null;
}

export function airportOf(label) {
  const found = findAirport(label);
  if (found) return found;
  const bare = String(label || "").trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(bare)) return AIRPORTS.find((a) => a.code === bare) || null;
  return null;
}

export function reliefModel(trip) {
  const ends = [airportOf(trip?.origin), airportOf(trip?.destination)].filter(Boolean);
  const seen = new Set();
  const covered = [];
  const missing = [];
  for (const a of ends) {
    if (seen.has(a.code)) continue;
    seen.add(a.code);
    const data = PET_RELIEF[a.code];
    if (!data) missing.push({ code: a.code, city: a.city });
    else covered.push({
      code: a.code,
      city: a.city,
      source: data.source,
      checked: data.checked,
      areas: data.areas.map((x) => ({ terminal: x.terminal, where: x.where, spot: x.spot })),
    });
  }
  const named = (list) => list.map((a) => `${a.city} (${a.code})`).join(" and ");
  let what = "Pet relief areas for this trip.";
  let why = "";
  if (!ends.length) {
    what = "Add your airports to see pet relief areas.";
  } else if (!covered.length) {
    what = `${named(missing)} ${missing.length > 1 ? "are" : "is"} not in our relief guide yet.`;
    why = "We only list spots from the airport's own site. We won't guess a location.";
  } else {
    what = `Relief areas at ${covered.map((a) => a.code).join(" and ")} are listed on this pass.`;
    why = missing.length
      ? `${named(missing)} ${missing.length > 1 ? "are" : "is"} not in our relief guide yet. We won't guess a spot there.`
      : "Some spots are outside security. If you leave, you and your pet clear TSA again.";
  }
  return { covered, missing, what, why };
}

function connectingCopy(req) {
  const fact = trimFiller(req.description || "");
  return {
    what: "If you change planes, confirm your pet is booked on every flight and leave time for a relief stop.",
    why: [fact, "On a long layover, use a pet relief area before the next flight. If you leave security, you and your pet clear TSA again."].filter(Boolean).join(" "),
  };
}

function shapeCopy(req, trip) {
  const cat = String(req?.category || "").toUpperCase();
  const title = trimFiller(req?.title);
  const description = trimFiller(req?.description);
  let what = trimFiller(req?.what || title);
  let why = trimFiller(req?.why || "");
  if (!why && description && !sameish(description, what)) why = description;
  let source_url = alignedSource(req, trip);
  let relief = null;

  if (cat === "CONNECTIONS") {
    const copy = connectingCopy(req);
    what = copy.what;
    why = copy.why;
  } else if (cat === "PACKING") {
    what = "Pack a collapsible bowl, leash, carrier pads, a familiar cloth, bags, and treats for after security.";
    why = "Bring health papers only when this trip requires them. Don't sedate your pet unless a vet tells you to.";
    source_url = null;
  } else if (cat === "AIRPORT DAY-OF" && /tsa|x-ray|xray/i.test(`${title} ${description}`)) {
    what = "At TSA, take your pet out. The empty carrier goes through the X-ray.";
    why = "Carry your pet through the detector and take the leash off while you hold them. Never send your pet through the X-ray.";
  } else if (cat === "AIRPORT DAY-OF" && /relief/i.test(`${title} ${description}`)) {
    relief = reliefModel(trip);
    what = relief.what;
    why = relief.why;
    source_url = null;
  } else if (cat.includes("SEAT")) {
    what = /does not (clearly )?list|does not publish|confirm when/i.test(`${title} ${description}`)
      ? "Ask which seats allow a cabin pet when you reserve. We won't guess a ban this airline didn't publish."
      : title;
    why = description && !sameish(description, what) ? description : "";
  } else if (cat.includes("AGE")) {
    what = title || "Check the airline's minimum age for your pet.";
    why = description && !sameish(description, what) ? description : "";
  }

  if (why && sameish(why, what)) why = "";
  return { what, why, source_url, relief };
}

function dedupeCards(cards) {
  const out = [];
  for (const card of cards) {
    const hit = out.find((c) => c.shortTitle.toLowerCase() === card.shortTitle.toLowerCase());
    if (!hit) { out.push(card); continue; }
    const sameFact = hit.category === card.category && (sameish(hit.why, card.why) || sameish(hit.what, card.what) || norm(hit.title) === norm(card.title));
    if (sameFact) {
      hit.mergedIds = [...new Set([...(hit.mergedIds || []), ...(card.mergedIds || [])])];
      continue;
    }
    const words = String(card.title || "").replace(/[—–:].*$/, "").split(/\s+/).filter(Boolean).slice(0, 4);
    const alt = words.join(" ");
    card.shortTitle = alt && alt.toLowerCase() !== hit.shortTitle.toLowerCase() && wordCount(alt) <= 6 ? alt : `${card.shortTitle} 2`.trim();
    if (wordCount(card.shortTitle) > 6) card.shortTitle = words.slice(0, 4).join(" ") || card.shortTitle;
    out.push(card);
  }
  return out;
}

// United-only facts from united.com (checked 2026-10-18). Never applied to other airlines.
function unitedSupplements(trip, reqs) {
  if (!isUnited(trip?.airline) || isServiceRole(trip?.role)) return [];
  const src = "https://www.united.com/en/us/fly/travel/traveling-with-pets.html";
  const rows = [
    {
      id: "syn:united-fee",
      airline: "United",
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
      airline: "United",
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
      airline: "United",
      category: "KENNEL REQUIREMENT",
      title: "737 MAX carrier height limit",
      shortTitle: "737 MAX height",
      description: "On a Boeing 737 MAX, United limits the pet carrier to 10 inches tall. Other United aircraft use the standard hard-sided (9 × 17.5 × 12 in) or soft-sided (11 × 18 × 11 in) maximums.",
      source_url: src,
      verified_at: "2026-10-18",
      fact: true,
      status: "complete",
    },
    {
      id: "syn:united-two",
      airline: "United",
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
      airline: "United",
      category: "HEALTH DOCUMENTATION",
      title: "Health certificate encouraged, not required",
      shortTitle: "Health docs",
      description: "For travel within the U.S., United encourages a certificate of health from your vet. It is not required for domestic cabin pets. International flights do require a health and vaccination certificate.",
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
      airline: trip?.airline || "Any",
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
  const due = fact ? null : requirementDueDate({ ...req, dot, dueKind: req.dueKind }, trip);
  const shaped = shapeCopy(req, trip);
  const source = shaped.source_url || null;
  let why = shaped.why;
  if (/alaska|jetblue|hawaiian/i.test(trip?.airline || "") && /service animal id/i.test(`${req.title} ${req.description}`)) {
    why = `${why} This Service Animal ID is free and issued by the airline. It is not a credential you buy.`.trim();
  }
  return {
    ...req,
    mergedIds: req.mergedIds?.length ? req.mergedIds : [req.id].filter(Boolean),
    fact,
    dot,
    shortTitle: shortTitle(req),
    icon: iconFor(req.dot ? { ...req, category: "DOT" } : req),
    what: shaped.what,
    why,
    relief: shaped.relief,
    dueDate: due,
    groupHint: fact ? "know" : passStatus(req) === "verify" ? "confirm" : passStatus(req) === "complete" ? "know" : "first",
    source_url: source,
    sourceHost: source ? host(source) : null,
  };
}

export function buildPassCards(requirements, trip) {
  const raw = [...(requirements || [])].filter((r) => r && r.category !== "ELIGIBILITY NOTE");
  const supplements = [...unitedSupplements(trip, raw), ...serviceSupplements(trip)];
  const all = [...raw, ...supplements];
  const dotRows = all.filter(isDotCluster);
  const rest = all.filter((r) => !isDotCluster(r));
  const cards = dedupeCards(rest.map((r) => present(r, trip)));
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

// Cabin is the Travel Pass default: there is no cargo-trip field. Cargo numbers stay collapsed.
export function cargoTempCopy({ policy, airline = "Your airline", name = "Your pet" }) {
  let detail = `No verified cargo temperature for ${airline}.`;
  if (policy?.min_f != null && policy?.max_f != null) {
    const cold = /acclimation/i.test(policy.summary || "") ? " A forecast near the bottom of that range can require a vet acclimation certificate." : "";
    detail = `${airline}'s verified cargo range is ${policy.min_f}–${policy.max_f}°F.${cold}`;
  } else if (policy?.service_type === "cabin_only") {
    detail = `${airline} does not take pets as cargo.`;
  } else if (policy?.summary) {
    detail = policy.summary;
  }
  return {
    title: "Cargo temperature check",
    lead: `${name} is in the cabin, so this does not apply.`,
    detail,
    sourceUrl: policy?.source_url || null,
    verifiedAt: policy?.verified_at || null,
  };
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

  const deltaRows = [
    { id: "age", airline: "Delta", category: "AGE REQUIREMENT", title: "Pet must be at least 8 weeks old", description: "This is the minimum age for domestic travel. International travel to the U.S. requires dogs to be 6 months old and cats 16 weeks old.", source_url: null },
    { id: "seat", airline: "Delta", category: "SEAT RESTRICTION", title: "No bulkhead, exit-row, or no-stowage seats with a cabin pet", description: "Customers with a pet in the cabin may not select bulkhead seats, emergency exit rows, seats marked \"no stowage\", flat-bed or Delta One seats. The kennel must fit fully under the seat in front of you.", source_url: "https://www.delta.com/us/en/pet-travel/overview" },
    { id: "kennel", airline: "Delta", category: "KENNEL REQUIREMENT", title: "Soft-sided, ventilated kennel that fits under the seat", description: "Delta recommends a soft-sided kennel no larger than 18 x 11 x 11.", source_url: null },
    { id: "conn", airline: "Delta", category: "CONNECTIONS", title: "Connections: allow extra time; Delta Connection pets need 48h confirmation", description: "Delta advises allowing plenty of extra time to change planes with a pet. If transferring from a Delta flight to a Delta Connection flight, the Delta flight must be confirmed at least 48 hours before the Delta Connection departure.", source_url: "https://www.delta.com/content/www/en_US/traveling-with-us/special-travel-needs/pets/pet-travel-options/connection-carriers-and-pet-travel.html" },
    { id: "tsa", airline: "Any", category: "AIRPORT DAY-OF", title: "TSA security: remove pet from carrier; never put the pet through the X-ray", description: "At the TSA checkpoint, remove your pet from the carrier and place the empty carrier through the X-ray.", source_url: "https://www.tsa.gov/travel/frequently-asked-questions/can-i-take-my-pet-through-security-checkpoint" },
    { id: "pack", airline: "Any", category: "PACKING", title: "What to pack for airport and cabin pet travel", description: "Collapsible water bowl, leash, pads.", source_url: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html" },
    { id: "relief", airline: "Any", category: "AIRPORT DAY-OF", title: "Pet relief areas: use airport maps; you may need to exit security and re-clear", description: "Many U.S. airports have designated pet relief areas. Check your airport's official website.", source_url: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html" },
  ];
  const bur = buildPassCards(deltaRows, { airline: "Delta", role: "Pet", animal_type: "Dog", travel_date: "2026-11-20", origin: "Burbank, US (BUR)", destination: "Albany, US (ALB)" });
  const byTitle = (list, re) => list.filter((c) => re.test(c.shortTitle));
  if (byTitle(bur, /^Age rule$/).length !== 1) errors.push("Delta age card missing or duplicated");
  const age = bur.find((c) => c.shortTitle === "Age rule");
  if (age && /bulkhead|exit|stowage/i.test(`${age.what} ${age.why}`)) errors.push("Age rule still shows seat text");
  if (age && !/8 weeks/i.test(`${age.what} ${age.why}`)) errors.push("Age rule missing minimum age");
  const seat = bur.find((c) => c.shortTitle === "Seat restrictions");
  if (!seat) errors.push("missing Seat restrictions");
  if (seat && !/bulkhead|exit|stowage/i.test(`${seat.what} ${seat.why}`)) errors.push("Seat card missing seat rules");
  if (seat && seat.icon === "🗓️") errors.push("seat card still uses the age icon");
  if (seat?.dueDate) errors.push("seat fact got a due date");
  if (byTitle(bur, /Carrier fit/).length !== 1) errors.push(`carrier fit count ${byTitle(bur, /Carrier fit/).length}`);
  const tsa = bur.find((c) => /TSA/i.test(c.shortTitle));
  if (!tsa) errors.push("missing TSA card");
  if (tsa && /Carrier fit/i.test(tsa.shortTitle)) errors.push("TSA card still titled Carrier fit");
  if (tsa && !/empty carrier/i.test(tsa.what) || (tsa && !/x-ray/i.test(tsa.what))) errors.push("TSA what is not the empty-carrier X-ray step");
  if (!bur.some((c) => c.shortTitle === "What to pack")) errors.push("packing title not shortened");
  if (bur.some((c) => /What to pack for/i.test(c.shortTitle))) errors.push("packing title still long");
  const pack = bur.find((c) => c.shortTitle === "What to pack");
  if (pack?.source_url) errors.push("packing still cites another airline");
  const conn = bur.find((c) => c.shortTitle === "Connecting flights");
  if (!conn) errors.push("connections not retitled");
  if (conn?.dueDate) errors.push(`connections still has a due date ${conn?.dueDate}`);
  if (conn && !/change planes|every flight/i.test(conn.what)) errors.push("connections what is not plain");
  if (conn && !/relief/i.test(conn.why)) errors.push("connections missing relief timing");
  if (conn && !/48 hours/i.test(conn.why)) errors.push("connections dropped the Delta 48h fact");
  const relief = bur.find((c) => c.shortTitle === "Pet relief areas");
  if (!relief) errors.push("missing relief card");
  if (relief && /use airport maps/i.test(`${relief.what} ${relief.why}`)) errors.push("relief card still generic");
  if (relief && !/not in our relief guide yet/i.test(`${relief.what} ${relief.why}`)) errors.push("uncovered airports not called out");
  if (relief && /Gate 13|Terminal 1/i.test(JSON.stringify(relief.relief))) errors.push("invented relief spots for uncovered airports");
  const lax = buildPassCards(deltaRows, { airline: "Delta", role: "Pet", animal_type: "Dog", travel_date: "2026-11-20", origin: "Los Angeles, US (LAX)", destination: "San Francisco, US (SFO)" });
  const laxRelief = lax.find((c) => c.shortTitle === "Pet relief areas");
  const spots = JSON.stringify(laxRelief?.relief || {});
  if (!/Gate 13/.test(spots) || !/Harvey Milk/.test(spots)) errors.push("covered airports missing real relief spots");
  if (laxRelief?.source_url) errors.push("relief card still uses a generic airline source");
  const titlesBur = bur.map((c) => c.shortTitle);
  const dupes = titlesBur.filter((t, i) => titlesBur.indexOf(t) !== i);
  if (dupes.length) errors.push(`duplicate titles: ${dupes.join(", ")}`);
  if (titlesBur.some((t) => wordCount(t) > 6)) errors.push("bur title over 6 words");

  const unitedRows = [
    ...deltaRows.filter((r) => r.airline === "Any"),
    { id: "uage", airline: "United", category: "AGE REQUIREMENT", title: "Pet must be at least 2 months old", description: "This is the minimum for domestic travel." },
    { id: "useat", airline: "United", category: "SEAT RESTRICTION", title: "No exit row, Premium Plus, or front-row seats with a cabin pet", description: "You cannot sit with a pet in an emergency exit row.", source_url: "https://www.united.com/en/us/fly/travel/traveling-with-pets.html" },
    { id: "umax", airline: "United", category: "KENNEL REQUIREMENT", title: "737 MAX: carrier no more than 10 inches tall", description: "If the flight is on a Boeing 737 MAX, United limits the pet carrier to 10 inches tall." },
    { id: "ukennel", airline: "United", category: "KENNEL REQUIREMENT", title: "Soft-sided carrier, max 18 x 11 x 11", description: "Hard-sided carriers accepted up to 17.5 x 12 x 9." },
    { id: "uconn", airline: "United", category: "CONNECTIONS", title: "Connections on partners: confirm each airline's pet policy", description: "United says you can take pets on flights operated by United or United Express when the destination allows pets. If you travel on multiple airlines, check each airline's pet policy." },
    { id: "uweight", airline: "United", category: "WEIGHT LIMIT", title: "No set weight limit — your pet must fit in the carrier under the seat", description: "The carrier has to fit under the seat." },
  ];
  const udev = buildPassCards(unitedRows, { ...trip, origin: "San Francisco, US (SFO)", destination: "Newark, US (EWR)" });
  if (udev.filter((c) => c.shortTitle === "Carrier fit").length !== 1) errors.push("United carrier fit not singular");
  if (!udev.some((c) => c.shortTitle === "737 MAX height")) errors.push("United 737 card mis-titled");
  if (udev.filter((c) => /Carrier fit|Empty carrier at TSA/.test(c.shortTitle)).length !== 2) errors.push("United TSA and carrier not distinct");
  if (udev.some((c) => c.shortTitle === "Weight limit" && /Carrier fit/.test(c.shortTitle))) errors.push("weight became carrier");
  const uTitles = udev.map((c) => c.shortTitle);
  if (uTitles.filter((t, i) => uTitles.indexOf(t) !== i).length) errors.push(`United duplicate titles ${uTitles.filter((t, i) => uTitles.indexOf(t) !== i).join(", ")}`);
  const uconn = udev.find((c) => c.shortTitle === "Connecting flights");
  if (uconn && !/United Express|partner/i.test(uconn.why)) errors.push("United connection fact dropped");

  const cargo = cargoTempCopy({
    name: "Milo",
    airline: "Delta",
    policy: { service_type: "limits", min_f: 20, max_f: 80, summary: "Delta Cargo live-animal ground limit is 20-80°F; a forecast of 20-45°F requires a Certificate of Acclimation.", source_url: "https://www.deltacargo.com/Cargo/catalog/temperature-guidelines", verified_at: "2026-10-16" },
  });
  if (cargo.title !== "Cargo temperature check") errors.push("cargo title");
  if (!/Milo is in the cabin/.test(cargo.lead)) errors.push("cargo lead is not cabin-first");
  if (!/20–80/.test(cargo.detail)) errors.push("cargo detail dropped 20-80");
  if (/could refuse|Heads up/i.test(cargo.lead)) errors.push("cargo lead still scary");

  const trap = shortTitle({ category: "SEAT RESTRICTION", title: "No bulkhead, exit-row, or no-stowage seats with a cabin pet" });
  if (trap !== "Seat restrictions") errors.push(`stowage trap titled ${trap}`);
  const bag = shortTitle({ category: "IF YOUR PET DOESN'T FIT IN THE CABIN", title: "Alaska still offers checked-baggage and cargo options" });
  if (/Age rule/.test(bag)) errors.push("baggage titled Age rule");
  return errors;
}
