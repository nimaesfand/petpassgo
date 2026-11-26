import { createSign } from "crypto";
import { SITE_URL } from "./site.js";
import { statusLine, publicPetUrl } from "./appleWallet.js";
import { thumbUrl } from "./walletData.js";

// Google Wallet twin of the Apple pass (Generic pass). Hidden until configured:
// GOOGLE_WALLET_ENABLED=true, GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SA_EMAIL,
// GOOGLE_WALLET_SA_KEY_BASE64 (base64 of the service account private key PEM).
// Until Google approves publishing access, saved passes are test-only.
function keyPem() {
  const raw = String(process.env.GOOGLE_WALLET_SA_KEY_BASE64 || "").trim();
  if (!raw) return null;
  if (raw.includes("BEGIN ")) return raw.replace(/\\n/g, "\n");
  try { const t = Buffer.from(raw, "base64").toString("utf8"); return t.includes("BEGIN ") ? t : null; } catch { return null; }
}
export function googleConfigured() {
  return process.env.GOOGLE_WALLET_ENABLED === "true" && !!process.env.GOOGLE_WALLET_ISSUER_ID && !!process.env.GOOGLE_WALLET_SA_EMAIL && !!keyPem();
}

const b64url = (v) => Buffer.from(typeof v === "string" ? v : JSON.stringify(v)).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
function jwt(payload) {
  const head = b64url({ alg: "RS256", typ: "JWT" });
  const body = b64url(payload);
  const sig = createSign("RSA-SHA256").update(`${head}.${body}`).sign(keyPem()).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${head}.${body}.${sig}`;
}

const issuer = () => process.env.GOOGLE_WALLET_ISSUER_ID;
const classId = () => `${issuer()}.petpassgo_passport`;
export const objectId = (petId) => `${issuer()}.pet_${String(petId).replace(/-/g, "")}`;
const cap = (v) => String(v || "").trim().replace(/(^|[\s\-'.])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const t = (v) => ({ defaultValue: { language: "en-US", value: String(v) } });

function genericClass() {
  return { id: classId(), classTemplateInfo: { cardTemplateOverride: { cardRowTemplateInfos: [
    { twoItems: { startItem: { firstValue: { fields: [{ fieldPath: "object.textModulesData['status']" }] } }, endItem: { firstValue: { fields: [{ fieldPath: "object.textModulesData['breed']" }] } } } },
    { twoItems: { startItem: { firstValue: { fields: [{ fieldPath: "object.textModulesData['sexborn']" }] } }, endItem: { firstValue: { fields: [{ fieldPath: "object.textModulesData['weight']" }] } } } },
  ] } } };
}

export function genericObject(pet, extras = {}) {
  const url = publicPetUrl(pet.public_slug || pet.id);
  const born = pet.date_of_birth ? new Date(`${String(pet.date_of_birth).slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "";
  const mods = [
    ["status", "STATUS", statusLine(pet)],
    ["breed", "BREED", String(pet.breed || "").replace(/\bMiniature\b/gi, "Mini")],
    ["sexborn", "SEX / BORN", [pet.sex, born].filter(Boolean).join(" · ")],
    ["weight", "WEIGHT", pet.weight_lb ? `${pet.weight_lb} lb` : ""],
    ["rabies", "RABIES", extras.rabies ? [extras.rabies.expires_on ? `Valid to ${extras.rabies.expires_on}` : "On file", extras.rabies.verified_at ? "Vet confirmed" : "Owner-entered"].join(" · ") : ""],
    ["training", "TRAINING", extras.trainingLine || ""],
    ["note", "ABOUT THIS PASS", "A PetPassGo pet passport, not a government document."],
  ].filter(([, , v]) => v).map(([id, header, body]) => ({ id, header, body: String(body).slice(0, 120) }));
  return {
    id: objectId(pet.id),
    classId: classId(),
    state: "ACTIVE",
    hexBackgroundColor: "#14213D",
    cardTitle: t("PetPassGo"),
    subheader: t(pet.passport_no ? `Passport ${pet.passport_no}` : "Pet passport"),
    header: t(cap(pet.name) || "Pet"),
    logo: { sourceUri: { uri: `${SITE_URL}/apple-icon.png` }, contentDescription: t("PetPassGo") },
    ...(pet.photo_url ? { heroImage: { sourceUri: { uri: thumbUrl(pet.id) }, contentDescription: t(cap(pet.name) || "Pet") } } : {}),
    textModulesData: mods,
    linksModuleData: { uris: [{ uri: url, description: "Pet page", id: "page" }] },
    barcode: { type: "QR_CODE", value: url, alternateText: pet.passport_no || "Scan if found" },
  };
}

// "Add to Google Wallet" link: the class and object ride inside the signed JWT.
export function saveUrl(pet, extras) {
  const token = jwt({ iss: process.env.GOOGLE_WALLET_SA_EMAIL, aud: "google", typ: "savetowallet", origins: [SITE_URL], payload: { genericClasses: [genericClass()], genericObjects: [genericObject(pet, extras)] } });
  return `https://pay.google.com/gp/v/save/${token}`;
}

async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt({ iss: process.env.GOOGLE_WALLET_SA_EMAIL, scope: "https://www.googleapis.com/auth/wallet_object.issuer", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3000 });
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
  const j = await r.json().catch(() => ({}));
  return j.access_token || null;
}

// Keep a saved Google pass current. Silently does nothing if it was never saved.
export async function patchGoogleObject(pet, extras) {
  if (!googleConfigured()) return false;
  const token = await accessToken();
  if (!token) return false;
  const obj = genericObject(pet, extras);
  const r = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/genericObject/${encodeURIComponent(obj.id)}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(obj) }).catch(() => null);
  return !!r?.ok;
}
