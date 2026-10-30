import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

// Official U.S. DOT Service Animal Air Transportation Form, updated September 20, 2024.
// Page: https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals/Air_Transportation_Form
// PDF:  https://www.transportation.gov/sites/dot.gov/files/2024-09/Service%20Animal%20-%20Air%20Transportation%20Form%20FINAL%209.20.24.pdf
// Field names below are the AcroForm names on that fillable PDF (OMB 2105-0576).
// Attestation checkboxes are never set. The handler checks them and signs.
export const DOT_AIR_FORM_PAGE = "https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals/Air_Transportation_Form";
export const DOT_AIR_FORM_PDF = "https://www.transportation.gov/sites/dot.gov/files/2024-09/Service%20Animal%20-%20Air%20Transportation%20Form%20FINAL%209.20.24.pdf";

const AIR_FILE = "dot-service-animal-air-transportation-form.pdf";
const RELIEF_FILE = "dot-service-animal-relief-attestation-form.pdf";

const AIR_CHECKBOXES = [
  "I attest that a service animal is required to accompany me or the passenger with a disability traveling with me in air transportation",
  "I attest that the animal has been individually trained to perform a task to assist with a disability",
  "I attest that the animal has been trained to behave in a public setting",
  "I attest that the animal: (1) Does not have fleas or ticks or a disease that would endanger people or other animals. (2) Is vaccinated for rabies",
  "I understand that: (1)The animal must be under the control of the Handler at all times. (2) A properly trained service animal does not act aggressively by biting, barking, jumping, lunging, or injuring people or animals, and does not urinate or defecate on the aircraft or in the gate area. (3) If the animal shows that it has not been properly trained to behave in public, then the airline may treat the animal as a pet by charging a pet fee and requiring that the animal be transported in a pet carrier, or denying transport",
  "I attest that to the best of my knowledge the animal has not behaved aggressively or caused serious injury to another person or animal",
  "I understand that: (1) The animal must be harnessed, leashed, or tethered at all times in the airport and on the aircraft.(2) If the animal causes damage, then the airline may charge the Handler for the cost to repair it, as long as the airline would also charge passengers without disabilities to repair similar kinds of damage. (3) I am signing an official document of the U.S. Department of Transportation, and if I knowingly make false statements on this document, I can be subject to fines and other penalties",
];

function formPath(name) {
  return path.join(process.cwd(), "lib", "forms", name);
}

function readTemplate(name) {
  return fs.readFileSync(formPath(name));
}

function mmddyyyy(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

function clip(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function setText(form, name, value) {
  const text = clip(value, 180);
  if (!text) return;
  try { form.getTextField(name).setText(text); } catch { /* field missing in this PDF revision */ }
}

export function animalDescription(pet, color) {
  const parts = [];
  if (pet?.breed) parts.push(clip(pet.breed, 60));
  if (pet?.animal_type) parts.push(clip(pet.animal_type, 20));
  if (pet?.sex) parts.push(clip(pet.sex, 20));
  if (pet?.weight_lb) parts.push(`${clip(pet.weight_lb, 8)} lb`);
  const shade = clip(color, 40);
  if (shade) parts.push(shade);
  return parts.filter(Boolean).join(", ");
}

export async function fillAirTransportationForm(values) {
  const pdf = await PDFDocument.load(readTemplate(AIR_FILE));
  const form = pdf.getForm();
  const description = clip(values.description, 360);
  setText(form, "Service Animal Handlers full Name", values.handler);
  setText(form, "Email", values.email);
  setText(form, "Phone", values.phone);
  setText(form, "Animals Name", values.animalName);
  setText(form, "Animals Description (including weight and color)", description.slice(0, 120));
  if (description.length > 120) setText(form, "Description continued", description.slice(120));
  setText(form, "Date vaccination expires in the animal", mmddyyyy(values.rabiesExp));
  setText(form, "Veterinarian's Name", values.vetName);
  setText(form, "Phone (Veterinarian)", values.vetPhone);
  for (const name of AIR_CHECKBOXES) {
    try { if (form.getCheckBox(name).isChecked()) form.getCheckBox(name).uncheck(); } catch { /* leave untouched */ }
  }
  return pdf.save();
}

export async function fillReliefForm(values) {
  const pdf = await PDFDocument.load(readTemplate(RELIEF_FILE));
  const form = pdf.getForm();
  setText(form, "Service Animal Handler's Name", values.handler);
  setText(form, "Phone (Handler)", values.phone);
  setText(form, "Email", values.email);
  setText(form, "Animal's Name", values.animalName);
  setText(form, "[Insert Animal's Name]", values.animalName);
  setText(form, "Estimated Flight Length", values.hours ? `${clip(values.hours, 6)} hours` : "");
  setText(form, "Flight Date", mmddyyyy(values.flightDate));
  setText(form, "Departure Airport", values.origin);
  setText(form, "Arrival Airport", values.destination);
  return pdf.save();
}

export function isServiceTrip(trip) {
  return /service|psychiatric/i.test(trip?.role || "") && /dog/i.test(trip?.animal_type || "dog");
}
