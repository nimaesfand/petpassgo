import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// One-page "records summary" PDF that goes with Share records.
// Vaccines first, with dates and, when the vet confirmed it, who confirmed it.
const PT = 72;
const NAVY = rgb(20 / 255, 33 / 255, 61 / 255);
const GOLD = rgb(242 / 255, 184 / 255, 75 / 255);
const ORANGE = rgb(194 / 255, 65 / 255, 12 / 255);
const GREEN = rgb(47 / 255, 122 / 255, 74 / 255);
const INK = rgb(0.16, 0.2, 0.27);
const MUTED = rgb(0.33, 0.37, 0.43);
const LINE = rgb(0.86, 0.89, 0.93);
const CREAM = rgb(251 / 255, 247 / 255, 238 / 255);

// pdf-lib's standard fonts only cover WinAnsi; drop anything else.
const safe = (v) => String(v ?? "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/•/g, "*").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
const fmt = (d) => {
  if (!d || !/^\d{4}-\d{2}-\d{2}/.test(String(d))) return "";
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

function fit(font, text, size, max) {
  let t = safe(text);
  while (t && font.widthOfTextAtSize(t, size) > max) t = t.slice(0, -2);
  return t !== safe(text) ? `${t.replace(/\s+$/, "")}...` : t;
}

export async function buildRecordsPdf({ pet, owner, records = [], sharedOn }) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${safe(pet.name)} - pet records`);
  pdf.setCreator("PetPassGo");
  const W = 8.5 * PT, H = 11 * PT, M = 0.6 * PT;
  const page = pdf.addPage([W, H]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);

  // Header band
  page.drawRectangle({ x: 0, y: H - 64, width: W, height: 64, color: NAVY });
  page.drawRectangle({ x: 0, y: H - 67, width: W, height: 3, color: GOLD });
  page.drawText("PetPass", { x: M, y: H - 42, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Go", { x: M + bold.widthOfTextAtSize("PetPass", 22), y: H - 42, size: 22, font: bold, color: GOLD });
  const tag = "PET RECORDS";
  page.drawText(tag, { x: W - M - bold.widthOfTextAtSize(tag, 10), y: H - 38, size: 10, font: bold, color: GOLD });

  // Pet card
  let y = H - 100;
  page.drawRectangle({ x: M, y: y - 92, width: W - 2 * M, height: 100, color: CREAM, borderColor: rgb(0.9, 0.86, 0.78), borderWidth: 1 });
  page.drawText(fit(bold, pet.name || "Pet", 24, 300), { x: M + 16, y: y - 26, size: 24, font: bold, color: NAVY });
  const role = pet.role === "Service animal" ? "SERVICE DOG" : pet.role === "Emotional support animal" ? "EMOTIONAL SUPPORT ANIMAL" : "";
  if (role) page.drawText(role, { x: M + 16, y: y - 42, size: 9, font: bold, color: pet.role === "Service animal" ? rgb(0.11, 0.31, 0.85) : rgb(0.76, 0.12, 0.12) });
  const facts = [
    ["Species", pet.animal_type], ["Breed", pet.breed], ["Sex", pet.sex], ["Born", fmt(pet.date_of_birth)],
    ["Microchip", pet.microchip_number], ["Owner", owner], ["Passport no.", pet.passport_no], ["Weight", pet.weight_lb ? `${pet.weight_lb} lb` : ""],
  ].filter(([, v]) => v);
  facts.slice(0, 8).forEach(([k, v], i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + 16 + col * ((W - 2 * M - 32) / 4);
    const yy = y - 60 - row * 26;
    page.drawText(k.toUpperCase(), { x, y: yy, size: 7.5, font: bold, color: MUTED });
    page.drawText(fit(reg, v, 10.5, (W - 2 * M - 40) / 4), { x, y: yy - 12, size: 10.5, font: reg, color: INK });
  });
  y -= 124;

  // Records table
  const sections = [
    ["Vaccines", records.filter((r) => r.kind === "vaccine")],
    ["Medications", records.filter((r) => r.kind === "medication")],
    ["Other records", records.filter((r) => r.kind !== "vaccine" && r.kind !== "medication" && r.kind !== "allergy")],
  ];
  const allergies = records.filter((r) => r.kind === "allergy").map((r) => r.name).filter(Boolean);
  const cols = [M + 6, M + 190, M + 280, M + 370];
  for (const [title, rows] of sections) {
    if (!rows.length) continue;
    if (y < 130) break;
    page.drawText(title, { x: M, y, size: 13, font: bold, color: NAVY });
    y -= 16;
    ["NAME", "GIVEN", "DUE / EXPIRES", "CONFIRMED"].forEach((h, i) => page.drawText(h, { x: cols[i], y, size: 7.5, font: bold, color: MUTED }));
    y -= 6;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE });
    y -= 14;
    for (const r of rows) {
      if (y < 110) break;
      page.drawText(fit(bold, r.name || "-", 10.5, 178), { x: cols[0], y, size: 10.5, font: bold, color: INK });
      page.drawText(fmt(r.date_given) || "-", { x: cols[1], y, size: 10, font: reg, color: INK });
      page.drawText(fmt(r.expires_on) || "-", { x: cols[2], y, size: 10, font: reg, color: INK });
      if (r.verified_at) {
        page.drawText(fit(bold, `Yes - ${[r.verified_by_name, r.verified_by_clinic].filter(Boolean).join(", ")}`, 9, W - M - cols[3]), { x: cols[3], y, size: 9, font: bold, color: GREEN });
      } else {
        page.drawText("Entered by owner", { x: cols[3], y, size: 9, font: reg, color: MUTED });
      }
      y -= 8;
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: LINE });
      y -= 14;
    }
    y -= 8;
  }
  if (!sections.some(([, rows]) => rows.length)) {
    page.drawText("No vaccines or medications have been added yet. See the attached documents.", { x: M, y, size: 11, font: reg, color: INK });
    y -= 20;
  }
  if (allergies.length && y > 100) {
    page.drawText("Allergies", { x: M, y, size: 13, font: bold, color: ORANGE });
    y -= 16;
    page.drawText(fit(reg, allergies.join(", "), 10.5, W - 2 * M), { x: M, y, size: 10.5, font: reg, color: INK });
    y -= 20;
  }

  // Footer
  const foot1 = `Shared by ${owner || "the owner"} on ${sharedOn} through PetPassGo.`;
  const foot2 = "\"Confirmed\" means the pet's vet confirmed that record. Other entries were added by the owner. Original documents are attached to the email.";
  page.drawLine({ start: { x: M, y: 70 }, end: { x: W - M, y: 70 }, thickness: 1, color: LINE });
  page.drawText(fit(reg, foot1, 9, W - 2 * M), { x: M, y: 56, size: 9, font: reg, color: MUTED });
  page.drawText(fit(reg, foot2, 8, W - 2 * M), { x: M, y: 44, size: 8, font: reg, color: MUTED });
  return pdf.save();
}
