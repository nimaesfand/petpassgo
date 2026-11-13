import crypto from "crypto";
import forge from "node-forge";
import { SITE_URL } from "./site.js";
import { WALLET_IMAGES } from "./walletImages.js";

// Apple Wallet pet ID. The button stays hidden until every value below is set.
// APPLE_WALLET_ENABLED must be the string "true".
// APPLE_PASS_TYPE_ID is the Pass Type ID (starts with pass.).
// APPLE_TEAM_ID is the 10-character Apple Team ID.
// APPLE_PASS_CERT_BASE64 is the base64 of the Pass Type ID certificate PEM.
// APPLE_PASS_KEY_BASE64 is the base64 of that certificate's private key PEM.
// APPLE_WWDR_CERT_BASE64 is the base64 of the Apple WWDR intermediate certificate PEM.
// APPLE_PASS_KEY_PASSPHRASE is only needed when the private key is encrypted.
//
// The pass is signed here with node-forge. passkit-generator reads a model
// directory with fs.readdir, and that made the route's file trace include
// .next/export-detail.json, which Next deletes. Vercel then failed on lstat.

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

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function zipStore(entries) {
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const localFull = Buffer.concat([local, nameBuf, data]);
    locals.push(localFull);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, nameBuf]));
    offset += localFull.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, eocd]);
}

function privateKeyFromPem(pem, passphrase) {
  const text = pem.toString("utf8");
  if (passphrase) {
    const decrypted = forge.pki.decryptRsaPrivateKey(text, passphrase);
    if (!decrypted) throw new Error("Could not read the Apple pass private key.");
    return decrypted;
  }
  return forge.pki.privateKeyFromPem(text);
}

function signManifest(manifestBuffer, certificates) {
  const signature = forge.pkcs7.createSignedData();
  signature.content = new forge.util.ByteStringBuffer(manifestBuffer);
  const signerCert = forge.pki.certificateFromPem(certificates.signerCert.toString("utf8"));
  const wwdr = forge.pki.certificateFromPem(certificates.wwdr.toString("utf8"));
  const signerKey = privateKeyFromPem(certificates.signerKey, certificates.signerKeyPassphrase);
  signature.addCertificate(wwdr);
  signature.addCertificate(signerCert);
  signature.addSigner({
    key: signerKey,
    certificate: signerCert,
    digestAlgorithm: forge.pki.oids.sha1,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime },
    ],
  });
  signature.sign({ detached: true });
  return Buffer.from(forge.asn1.toDer(signature.toAsn1()).getBytes(), "binary");
}

function fmtDate(v) {
  if (!v) return "";
  const d = new Date(`${String(v).slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function statusLabel(role) {
  if (/service/i.test(role || "")) return "Service dog";
  if (/emotional|esa/i.test(role || "")) return "Support animal";
  return "Pet";
}

const f = (key, label, value) => (value == null || String(value).trim() === "" ? null : { key, label, value: String(value).slice(0, 60) });

// A pet passport in Apple Wallet: same navy and gold as the website passport.
// thumbPng: optional square PNG of the pet photo (Buffer), sent by the browser.
export async function buildPetPass(pet, thumbPng = null) {
  const url = publicPetUrl(pet.id);
  const chip = String(pet.microchip_number || "").replace(/[^0-9A-Za-z]/g, "");
  const files = {
    "pass.json": Buffer.from(JSON.stringify({
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
      teamIdentifier: process.env.APPLE_TEAM_ID,
      organizationName: "PetPassGo",
      description: `${pet.name || "Pet"}'s PetPassGo passport`,
      serialNumber: String(pet.id),
      logoText: "Pet Passport",
      backgroundColor: "rgb(20, 33, 61)",
      foregroundColor: "rgb(255, 255, 255)",
      labelColor: "rgb(242, 184, 75)",
      generic: {
        headerFields: [f("no", "PASSPORT NO.", pet.passport_no)].filter(Boolean),
        primaryFields: [{ key: "name", label: statusLabel(pet.role).toUpperCase(), value: String(pet.name || "Pet").slice(0, 30) }],
        secondaryFields: [f("species", "SPECIES", pet.animal_type), f("breed", "BREED", pet.breed), f("sex", "SEX", pet.sex)].filter(Boolean),
        auxiliaryFields: [f("born", "BORN", fmtDate(pet.date_of_birth)), f("weight", "WEIGHT", pet.weight_lb ? `${pet.weight_lb} lb` : ""), f("color", "COLOR", pet.color)].filter(Boolean).slice(0, 3),
        backFields: [
          f("found", "IF FOUND", "Scan the code on the front. It opens this pet's page so you can message the owner."),
          f("owner", "OWNER", pet.handler_name),
          pet.show_contact_on_public_id ? f("contact", "EMERGENCY CONTACT", [pet.emergency_contact_name, pet.emergency_contact_phone].filter(Boolean).join(" · ")) : null,
          f("trained", "TRAINED", pet.trained == null ? "" : pet.trained ? "Yes" : "Not yet"),
          chip ? f("chip", "MICROCHIP", `Ends in ${chip.slice(-4)}`) : null,
          f("issued", "ISSUED", fmtDate(pet.passport_issued_at)),
          f("page", "PUBLIC PAGE", url),
          f("note", "ABOUT THIS PASS", "A PetPassGo pet passport, not a government document."),
        ].filter(Boolean),
      },
      barcodes: [{ message: url, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1", altText: pet.passport_no || "Scan if found" }],
    })),
    "icon.png": Buffer.from(WALLET_IMAGES.icon, "base64"),
    "icon@2x.png": Buffer.from(WALLET_IMAGES["icon@2x"], "base64"),
    "icon@3x.png": Buffer.from(WALLET_IMAGES["icon@3x"], "base64"),
    "logo.png": Buffer.from(WALLET_IMAGES.logo, "base64"),
    "logo@2x.png": Buffer.from(WALLET_IMAGES["logo@2x"], "base64"),
    "logo@3x.png": Buffer.from(WALLET_IMAGES["logo@3x"], "base64"),
  };
  if (thumbPng && thumbPng.length > 100) {
    files["thumbnail.png"] = thumbPng;
    files["thumbnail@2x.png"] = thumbPng;
  }
  const manifest = {};
  for (const [name, data] of Object.entries(files)) {
    manifest[name] = crypto.createHash("sha1").update(data).digest("hex");
  }
  const manifestBuf = Buffer.from(JSON.stringify(manifest));
  const signature = signManifest(manifestBuf, {
    wwdr: pemFrom("APPLE_WWDR_CERT_BASE64"),
    signerCert: pemFrom("APPLE_PASS_CERT_BASE64"),
    signerKey: pemFrom("APPLE_PASS_KEY_BASE64"),
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
  });
  return zipStore([
    ...Object.entries(files).map(([name, data]) => ({ name, data })),
    { name: "manifest.json", data: manifestBuf },
    { name: "signature", data: signature },
  ]);
}
