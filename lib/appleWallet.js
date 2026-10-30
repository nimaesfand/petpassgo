import { PKPass } from "passkit-generator";
import { SITE_URL } from "./site.js";
import { solidPng } from "./solidPng.js";

// Apple Wallet pet ID. The button stays hidden until every value below is set.
// APPLE_WALLET_ENABLED must be the string "true".
// APPLE_PASS_TYPE_ID is the Pass Type ID (starts with pass.).
// APPLE_TEAM_ID is the 10-character Apple Team ID.
// APPLE_PASS_CERT_BASE64 is the base64 of the Pass Type ID certificate PEM.
// APPLE_PASS_KEY_BASE64 is the base64 of that certificate's private key PEM.
// APPLE_WWDR_CERT_BASE64 is the base64 of the Apple WWDR intermediate certificate PEM.
// APPLE_PASS_KEY_PASSPHRASE is only needed when the private key is encrypted.

const NAVY = [20, 33, 61];

function pemFrom(name) {
  const raw = String(process.env[name] || "").trim();
  if (!raw) return null;
  if (raw.includes("BEGIN ")) return Buffer.from(raw);
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.toString("utf8").includes("BEGIN ")) return buf;
  } catch { /* not base64 */ }
  return null;
}

export function walletConfigured() {
  if (process.env.APPLE_WALLET_ENABLED !== "true") return false;
  return !!(
    process.env.APPLE_PASS_TYPE_ID &&
    process.env.APPLE_TEAM_ID &&
    pemFrom("APPLE_PASS_CERT_BASE64") &&
    pemFrom("APPLE_PASS_KEY_BASE64") &&
    pemFrom("APPLE_WWDR_CERT_BASE64")
  );
}

export function publicPetUrl(petId) {
  return `${SITE_URL}/id/${petId}`;
}

export async function buildPetPass(pet) {
  const url = publicPetUrl(pet.id);
  const kind = [pet.breed, pet.animal_type].filter(Boolean).join(" · ") || "Pet";
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
    teamIdentifier: process.env.APPLE_TEAM_ID,
    organizationName: "PetPassGo",
    description: "PetPassGo pet ID",
    serialNumber: String(pet.id),
    logoText: "PetPassGo",
    backgroundColor: "rgb(20, 33, 61)",
    foregroundColor: "rgb(255, 255, 255)",
    labelColor: "rgb(242, 184, 75)",
    generic: {
      primaryFields: [{ key: "name", label: "NAME", value: String(pet.name || "Pet").slice(0, 40) }],
      secondaryFields: [{ key: "kind", label: "PET", value: kind.slice(0, 40) }],
      auxiliaryFields: [{ key: "found", label: "IF FOUND", value: "Scan the code. It opens this pet's public page." }],
      backFields: [{ key: "page", label: "PUBLIC PAGE", value: url }],
    },
    barcodes: [{ message: url, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1" }],
  };
  const pass = new PKPass({
    "pass.json": Buffer.from(JSON.stringify(passJson)),
    "icon.png": solidPng(29, 29, NAVY),
    "icon@2x.png": solidPng(58, 58, NAVY),
    "logo.png": solidPng(160, 50, NAVY),
  }, {
    wwdr: pemFrom("APPLE_WWDR_CERT_BASE64"),
    signerCert: pemFrom("APPLE_PASS_CERT_BASE64"),
    signerKey: pemFrom("APPLE_PASS_KEY_BASE64"),
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
  });
  return pass.getAsBuffer();
}
