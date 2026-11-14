import { PDFDocument } from "pdf-lib";

// Hawaii Dog & Cat Import Form (AQS-279), the official PDF from the Hawaii
// Department of Agriculture and Biosecurity, filled in from the pet and trip.
// We fill in details only. The owner picks the program, signs and dates it.
export const AQS279_PDF = "https://dab.hawaii.gov/ai/files/2024/01/form_AQS279-2024.01.17.pdf";
export const AQS_INFO = "https://dab.hawaii.gov/ai/aqs/aqs-info/";

let cached = null;
async function template() {
  if (cached) return cached;
  const r = await fetch(AQS279_PDF);
  if (!r.ok) throw new Error(`AQS-279 download failed (${r.status})`);
  cached = new Uint8Array(await r.arrayBuffer());
  return cached;
}

function mmddyyyy(iso) {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : "";
}

export function ageText(born, on) {
  if (!born || !on) return "";
  const a = new Date(`${String(born).slice(0, 10)}T12:00:00`), b = new Date(`${String(on).slice(0, 10)}T12:00:00`);
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  if (m < 0) return "";
  return m >= 24 ? `${Math.floor(m / 12)} YRS` : `${m} MOS`;
}

export function splitName(full) {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

// Only boxes whose names say which airport they are. Lihue is left for the owner to tick.
const AIRPORT_BOX = { HNL: "HONOLULUHNL", KOA: "KONAKOA", OGG: "KAHULUIOGG" };

export async function fillHawaiiForm(v) {
  const pdf = await PDFDocument.load(await template(), { ignoreEncryption: true });
  const form = pdf.getForm();
  const set = (name, text) => { if (!text) return; try { form.getTextField(name).setText(String(text).toUpperCase().slice(0, 80)); } catch { /* not in this revision */ } };
  const tick = (name) => { try { form.getCheckBox(name).check(); } catch { /* not in this revision */ } };

  set("1 PLANNED DATE OF ARRIVAL", mmddyyyy(v.arrival));
  set("TOTAL NUMBER of DOGS and CATS ARRIVING in HAWAII on that DATE", v.petCount ? String(v.petCount) : "1");
  set("PET NAME", v.petName);
  set("SPECIESRow1", v.species);
  set("COUNTRY FROMRow1", "USA");
  set("AGERow1", v.age);
  set("MICROCHIP NUMBERRow1", v.chip);
  set("BREED", v.breed);
  set("SEXRow1", v.sex ? v.sex[0] : "");
  set("COLOR", v.color);
  if (AIRPORT_BOX[v.airport]) tick(AIRPORT_BOX[v.airport]);

  set("NAME LAST", v.last);
  set("FIRST", v.first);
  set("NUMBER and STREET", v.street);
  set("CITY", v.city);
  set("STATE_2", v.state);
  set("ZIP", v.zip);
  set("PRIMARY", v.phone);
  set("EMAIL ADDRESS", v.email);
  set("HAWAII ADDRESS", v.hiStreet);
  set("CITY_2", v.hiCity);
  set("ZIP_2", v.hiZip);
  set("Print Name", [v.first, v.last].filter(Boolean).join(" "));

  // The pet name / microchip / owner header repeated on later pages.
  set("PET NAMERow1", v.petName);
  set("PET NAMERow1_2", v.petName);
  set("MICROCHIP NUMBERRow1_2", v.chip);
  set("OWNER LAST NAMERow1", v.last);
  set("PET NAMERow1_3", v.petName);

  return pdf.save();
}
