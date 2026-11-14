import { fmt, addDays } from "./travelDates.js";

// Papers check: the pet's saved records and uploads, held up against this trip's
// rules. Every result is a plain sentence with the dates that matter.
// status: "ok" | "warn" (fix this) | "todo" (not yet, and that's expected) | "missing"

const day = (v) => (v ? String(v).slice(0, 10) : null);

function windowDays(card) {
  const t = `${card?.title || ""} ${card?.deadline_description || ""} ${card?.description || ""}`;
  const m = t.match(/(?:within|no more than)\s+(\d+)\s*days?/i);
  return m ? Number(m[1]) : null;
}

function certLabel(card) {
  const t = `${card?.title || ""}`;
  if (/screwworm/i.test(t)) return card.homeLeg ? "Screwworm certificate for coming home" : "Screwworm certificate";
  return card.homeLeg ? "Health certificate for coming home" : "Health certificate";
}

export function paperCheck({ trip, pet, health = [], docs = [], cards = [], today }) {
  const out = [];
  const go = day(trip?.travel_date);
  const back = day(trip?.return_date);
  const lastDay = back || go;
  const now = day(today) || new Date().toISOString().slice(0, 10);
  const blob = cards.map((c) => `${c.title || ""} ${c.description || ""}`).join(" ");

  // 1. Rabies: needed when any rule for this trip asks for it.
  if (/rabies/i.test(blob)) {
    const fromRecords = health.filter((h) => /rabies/i.test(h.name || "") && h.expires_on).map((h) => ({ until: day(h.expires_on), verified: !!h.verified_at, by: h.verified_by_clinic || h.verified_by_name || "" }));
    const fromDocs = docs.filter((d) => /rabies/i.test(d.document_type || "") && d.expires_on).map((d) => ({ until: day(d.expires_on), verified: false, file: true }));
    const best = [...fromRecords, ...fromDocs].sort((a, b) => String(b.until).localeCompare(String(a.until)))[0];
    if (!best) out.push({ key: "rabies", label: "Rabies certificate", status: "missing", text: "No rabies record yet. Add it with its expiry date, or upload the certificate, so we can check it covers your trip." });
    else if (lastDay && best.until < lastDay) out.push({ key: "rabies", label: "Rabies certificate", status: "warn", text: `Runs out ${fmt(best.until)}, before ${back ? "your flight home" : "your flight"} on ${fmt(lastDay)}. Book a booster before you travel.` });
    else out.push({ key: "rabies", label: "Rabies certificate", status: "ok", verified: best.verified, text: `Valid until ${fmt(best.until)}, so it covers your whole trip.${best.verified ? ` Confirmed by ${best.by || "your vet"}.` : ""}` });
  }

  // 2. Certificates that must be dated inside a window before a flight.
  const windowCards = cards.filter((c) => !c.fact && /certificate|screwworm/i.test(`${c.title || ""}`) && windowDays(c));
  const certDocs = docs.filter((d) => /health certificate|screwworm|airline form/i.test(d.document_type || "") && d.issued_on);
  const seen = new Set();
  for (const c of windowCards) {
    const label = certLabel(c);
    if (seen.has(label)) continue;
    seen.add(label);
    const n = windowDays(c);
    const flight = c.homeLeg ? back : go;
    if (!flight) { out.push({ key: label, label, status: "todo", text: c.homeLeg ? `Must be dated within ${n} days before your flight home. Add your return date to get the exact dates.` : `Must be dated within ${n} days before your flight.` }); continue; }
    const start = addDays(flight, -n);
    const range = `${fmt(start)} and ${fmt(flight)}`;
    const inWindow = certDocs.find((d) => day(d.issued_on) >= start && day(d.issued_on) <= flight);
    const outside = certDocs.filter((d) => !c.homeLeg || day(d.issued_on) > (go || "")).sort((a, b) => String(b.issued_on).localeCompare(String(a.issued_on)))[0];
    if (inWindow) out.push({ key: label, label, status: "ok", text: `Dated ${fmt(inWindow.issued_on)}, inside the ${n}-day window for your ${c.homeLeg ? "flight home" : "flight"}.` });
    else if (outside && !c.homeLeg) out.push({ key: label, label, status: "warn", text: `The one on file is dated ${fmt(outside.issued_on)}. For your ${fmt(flight)} flight it must be dated between ${range}.` });
    else if (now < start) out.push({ key: label, label, status: "todo", text: `Get this between ${range}${c.homeLeg ? ", from a vet at your destination" : ""}. Upload it here when you have it.` });
    else out.push({ key: label, label, status: "missing", text: `Due now: it must be dated between ${range}. Upload it here once your vet signs it.` });
  }

  // 3. Microchip: CDC needs one for every dog coming into the U.S.
  if (/cdc dog import/i.test(blob) && (trip?.animal_type || pet?.animal_type || "Dog") === "Dog") {
    const chip = String(pet?.microchip_number || "").replace(/\s/g, "");
    if (chip) out.push({ key: "chip", label: "Microchip", status: "ok", text: `On file, ending ${chip.slice(-4)}. CDC needs it for coming home.` });
    else out.push({ key: "chip", label: "Microchip", status: "missing", text: "No microchip number on file. CDC needs one that a universal scanner can read to let your dog back into the U.S." });
  }
  const order = { warn: 0, missing: 1, todo: 2, ok: 3 };
  return out.sort((a, b) => order[a.status] - order[b.status]);
}

export function paperCheckSelfCheck() {
  const errors = [];
  const cards = [
    { title: "Mexico: New World Screwworm inspection certificate required", deadline_description: "Issued no more than 5 days before arrival in Mexico", description: "" },
    { title: "Coming home from Mexico: screwworm-free certificate", deadline_description: "Within 5 days before your flight back", homeLeg: true },
    { title: "CDC Dog Import Form", description: "rabies" },
  ];
  const trip = { travel_date: "2026-12-20", return_date: "2026-12-30", animal_type: "Dog" };
  const r = paperCheck({ trip, pet: {}, cards, today: "2026-12-01", docs: [{ document_type: "Health certificate", issued_on: "2026-12-10" }], health: [{ name: "Rabies", expires_on: "2026-12-25" }] });
  const by = Object.fromEntries(r.map((x) => [x.label, x]));
  if (by["Rabies certificate"]?.status !== "warn") errors.push("rabies expiring before return should warn");
  if (by["Screwworm certificate"]?.status !== "warn") errors.push("cert dated Dec 10 for Dec 20 flight should warn");
  if (by["Screwworm certificate for coming home"]?.status !== "todo") errors.push("return cert should be todo before window");
  if (by["Microchip"]?.status !== "missing") errors.push("no chip should be missing");
  const ok = paperCheck({ trip, pet: { microchip_number: "985112345678901" }, cards, today: "2026-12-16", docs: [{ document_type: "Health certificate", issued_on: "2026-12-17" }], health: [{ name: "Rabies", expires_on: "2028-01-01", verified_at: "x", verified_by_clinic: "Bay Vet" }] });
  const ob = Object.fromEntries(ok.map((x) => [x.label, x]));
  if (ob["Screwworm certificate"]?.status !== "ok") errors.push("cert in window should be ok");
  if (ob["Rabies certificate"]?.status !== "ok" || !/Bay Vet/.test(ob["Rabies certificate"].text)) errors.push("verified rabies should be ok and name the clinic");
  return errors;
}
