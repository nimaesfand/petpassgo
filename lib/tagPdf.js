import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

// Print-ready QR tag sheet (US Letter). The QR is drawn as vector squares, so it
// prints sharp at any size. Three common round tag sizes, at real size.
const PT = 72; // points per inch
const NAVY = rgb(20 / 255, 33 / 255, 61 / 255);
const GOLD = rgb(242 / 255, 184 / 255, 75 / 255);
const LINE = rgb(0.72, 0.75, 0.8);
const INK = rgb(0.2, 0.24, 0.3);

export const TAG_SIZES = [
  { inches: 1.5, per: 4, rows: 1, label: "1½ inch (38 mm) round tags" },
  { inches: 1.25, per: 5, rows: 1, label: "1¼ inch (32 mm) round tags" },
  { inches: 1, per: 6, rows: 2, label: "1 inch (25 mm) round tags" },
];

function drawQr(page, modules, x, y, side) {
  const n = modules.size;
  const cell = side / n;
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!modules.get(r, c)) { c++; continue; }
      let end = c;
      while (end + 1 < n && modules.get(r, end + 1)) end++;
      // Slight overlap avoids hairline gaps between squares in some viewers.
      page.drawRectangle({ x: x + c * cell, y: y + side - (r + 1) * cell, width: (end - c + 1) * cell + 0.05, height: cell + 0.05, color: NAVY });
      c = end + 1;
    }
  }
}

function centerText(page, font, text, size, cx, y, color = NAVY) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: cx - w / 2, y, size, font, color });
}

export async function buildTagPdf({ url, petName }) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${petName || "Pet"} QR tags`);
  pdf.setCreator("PetPassGo");
  const page = pdf.addPage([8.5 * PT, 11 * PT]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const qr = QRCode.create(url, { errorCorrectionLevel: "Q" }).modules;
  // Quiet zone of 1 module around the code.
  const withQuiet = { size: qr.size + 2, get: (r, c) => r >= 1 && c >= 1 && r <= qr.size && c <= qr.size && qr.get(r - 1, c - 1) };
  const name = String(petName || "").toUpperCase().slice(0, 14);

  const left = 0.6 * PT;
  let top = 11 * PT - 0.6 * PT;
  page.drawText(`${petName || "Your pet"}'s QR tags`, { x: left, y: top - 20, size: 20, font: bold, color: NAVY });
  page.drawText("Print at 100% (Actual size), not \"Fit to page\". Cut along the dashed circles.", { x: left, y: top - 40, size: 10.5, font: reg, color: INK });
  page.drawText("Each code opens your pet's page and lets a finder message you.", { x: left, y: top - 55, size: 10.5, font: reg, color: INK });
  top -= 80;

  for (const t of TAG_SIZES) {
    const d = t.inches * PT;
    const gap = 0.22 * PT;
    page.drawText(t.label, { x: left, y: top - 12, size: 10, font: bold, color: INK });
    top -= 20;
    for (let row = 0; row < t.rows; row++) {
      for (let i = 0; i < t.per; i++) {
        const cx = left + d / 2 + i * (d + gap);
        const cy = top - d / 2;
        page.drawCircle({ x: cx, y: cy, size: d / 2, borderColor: LINE, borderWidth: 0.6, borderDashArray: [3, 2], color: rgb(1, 1, 1) });
        const side = d * 0.62;
        drawQr(page, withQuiet, cx - side / 2, cy - side / 2 + (t.inches >= 1.25 ? d * 0.02 : 0), side);
        if (t.inches >= 1.25) {
          const fs = t.inches >= 1.5 ? 6.5 : 5.5;
          centerText(page, bold, "SCAN ME", fs, cx, cy + side / 2 + d * 0.055, NAVY);
          if (name) centerText(page, bold, name, fs, cx, cy - side / 2 - d * 0.1, NAVY);
        }
      }
      top -= d + gap;
    }
    top -= 4;
  }

  // Footer tips and a small brand mark.
  page.drawRectangle({ x: left, y: 0.62 * PT, width: 14, height: 14, color: NAVY });
  page.drawText("Go", { x: left + 2.2, y: 0.62 * PT + 3.8, size: 7, font: bold, color: GOLD });
  page.drawText("Tip: print on sticker paper or cardstock, then cover with a clear epoxy dome sticker to keep it waterproof.", { x: left + 22, y: 0.62 * PT + 4, size: 9, font: reg, color: INK });
  return pdf.save();
}
