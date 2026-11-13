"use client";
import QRCode from "qrcode";
import { fmtDob } from "./petProfile";

// Images made in the browser from the passport: a shareable passport card
// (Save image) and a small square photo for the Apple Wallet pass.

const NAVY = "#14213D";
const GOLD = "#F2B84B";
const CREAM = "#FBF7EE";
const MUTED = "#6B7585";

async function bitmapFrom(src) {
  if (!src) return null;
  try {
    const r = await fetch(src, { mode: "cors" });
    if (!r.ok) return null;
    return await createImageBitmap(await r.blob());
  } catch { return null; }
}

// The photo currently shown on the passport, if any.
export function passportPhotoSrc() {
  const img = document.querySelector("[data-pet-passport] .ppg-pp-photo img");
  return img?.currentSrc || img?.src || "";
}

function cover(c, bmp, x, y, w, h) {
  const s = Math.max(w / bmp.width, h / bmp.height);
  const sw = w / s, sh = h / s;
  c.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, x, y, w, h);
}

function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

function statusText(role) {
  if (/service/i.test(role || "")) return ["SERVICE DOG", "#0F766E", "#fff"];
  if (/emotional|esa/i.test(role || "")) return ["SUPPORT ANIMAL", "#6D28D9", "#fff"];
  return ["PET", GOLD, NAVY];
}

export async function savePassportImage(pet, publicUrl) {
  const W = 1200, H = 760;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  c.fillStyle = "#E9EEF5"; c.fillRect(0, 0, W, H);
  rr(c, 30, 30, W - 60, H - 60, 36); c.save(); c.clip();
  c.fillStyle = CREAM; c.fillRect(30, 30, W - 60, H - 60);
  // faint guilloche rings
  c.strokeStyle = "rgba(20,33,61,0.05)"; c.lineWidth = 1;
  for (let r = 20; r < 900; r += 14) { c.beginPath(); c.arc(W, 120, r, 0, Math.PI * 2); c.stroke(); }
  const g = c.createLinearGradient(30, 30, W, 150); g.addColorStop(0, NAVY); g.addColorStop(1, "#22386A");
  c.fillStyle = g; c.fillRect(30, 30, W - 60, 120);
  c.fillStyle = GOLD; c.fillRect(30, 150, W - 60, 5);
  c.fillStyle = "#fff"; c.font = "800 40px system-ui, sans-serif"; c.fillText("PetPass", 70, 98);
  const pw = c.measureText("PetPass").width; c.fillStyle = GOLD; c.fillText("Go", 70 + pw, 98);
  c.font = "800 16px system-ui"; c.fillStyle = GOLD; c.fillText("P E T   P A S S P O R T", 72, 126);
  if (pet.passport_no) {
    c.textAlign = "right"; c.fillStyle = GOLD; c.font = "800 15px system-ui"; c.fillText("PASSPORT NO.", W - 70, 82);
    c.fillStyle = "#fff"; c.font = "700 28px ui-monospace, Menlo, monospace"; c.fillText(pet.passport_no, W - 70, 118); c.textAlign = "left";
  }
  // photo
  const bmp = await bitmapFrom(passportPhotoSrc());
  c.fillStyle = "#fff"; rr(c, 66, 190, 268, 334, 20); c.fill();
  c.save(); rr(c, 76, 200, 248, 314, 14); c.clip();
  if (bmp) cover(c, bmp, 76, 200, 248, 314); else { c.fillStyle = "#E8EEF7"; c.fillRect(76, 200, 248, 314); }
  c.restore(); c.strokeStyle = GOLD; c.lineWidth = 3; rr(c, 66, 190, 268, 334, 20); c.stroke();
  // name + status
  c.fillStyle = MUTED; c.font = "800 15px system-ui"; c.fillText("NAME", 380, 210);
  c.fillStyle = NAVY; c.font = "800 66px system-ui"; c.fillText(String(pet.name || "My pet").slice(0, 16), 376, 270);
  const [st, sbg, sfg] = statusText(pet.role);
  c.font = "800 16px system-ui"; const sw = c.measureText(st).width + 28;
  c.fillStyle = sbg; rr(c, 380, 290, sw, 32, 8); c.fill(); c.fillStyle = sfg; c.fillText(st, 394, 312);
  // fields
  const fields = [
    ["SPECIES", pet.animal_type], ["BREED", pet.breed], ["SEX", pet.sex],
    ["BORN", fmtDob(pet.date_of_birth)], ["WEIGHT", pet.weight_lb ? `${pet.weight_lb} lb` : ""], ["COLOR", pet.color],
  ].filter(([, v]) => v);
  fields.forEach(([k, v], i) => {
    const x = 380 + (i % 3) * 190, y = 380 + Math.floor(i / 3) * 80;
    c.fillStyle = MUTED; c.font = "800 13px system-ui"; c.fillText(k, x, y);
    c.fillStyle = NAVY; c.font = "700 24px system-ui"; c.fillText(String(v).slice(0, 14), x, y + 32);
  });
  // QR
  const url = publicUrl || "";
  if (url) {
    const qr = await QRCode.toDataURL(url, { width: 400, margin: 1, errorCorrectionLevel: "H", color: { dark: NAVY, light: "#ffffff" } });
    const qi = new Image(); await new Promise((res, rej) => { qi.onload = res; qi.onerror = rej; qi.src = qr; });
    c.fillStyle = "#fff"; rr(c, 950, 190, 190, 190, 16); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 3; rr(c, 950, 190, 190, 190, 16); c.stroke();
    c.drawImage(qi, 962, 202, 166, 166);
    c.fillStyle = NAVY; c.font = "800 14px system-ui"; c.textAlign = "center"; c.fillText("SCAN IF FOUND", 1045, 404); c.textAlign = "left";
  }
  // MRZ
  c.fillStyle = "#F1EADA"; rr(c, 66, 600, W - 132, 90, 12); c.fill();
  c.fillStyle = NAVY; c.font = "600 24px ui-monospace, Menlo, monospace";
  const name = String(pet.name || "").toUpperCase().replace(/[^A-Z]/g, "<");
  const breed = String(pet.breed || pet.animal_type || "").toUpperCase().replace(/[^A-Z]/g, "<");
  c.fillText(`P<PPG${name}<<${breed}`.padEnd(48, "<").slice(0, 48), 90, 638);
  c.fillText(`${String(pet.passport_no || "").replace(/[^A-Z0-9]/gi, "")}<${String(pet.animal_type || "").toUpperCase().slice(0, 3)}`.padEnd(48, "<").slice(0, 48), 90, 672);
  c.restore();
  const a = document.createElement("a");
  a.download = `${(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-petpassgo-passport.png`;
  a.href = cv.toDataURL("image/png");
  a.click();
}

// Square PNG of the pet photo for the Wallet pass thumbnail (base64, no prefix).
export async function walletThumbBase64(size = 180) {
  const bmp = await bitmapFrom(passportPhotoSrc());
  if (!bmp) return "";
  const cv = document.createElement("canvas"); cv.width = size; cv.height = size;
  const c = cv.getContext("2d");
  cover(c, bmp, 0, 0, size, size);
  return cv.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
}
