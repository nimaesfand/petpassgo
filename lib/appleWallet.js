import crypto from "crypto";
import forge from "node-forge";
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

export async function buildPetPass(pet) {
  const url = publicPetUrl(pet.id);
  const kind = [pet.breed, pet.animal_type].filter(Boolean).join(" · ") || "Pet";
  const files = {
    "pass.json": Buffer.from(JSON.stringify({
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
        auxiliaryFields: [
          ...(pet.passport_no ? [{ key: "ppgid", label: "PETPASSGO ID", value: String(pet.passport_no).slice(0, 40) }] : []),
          { key: "found", label: "IF FOUND", value: "Scan the code. It opens this pet's public page." },
        ],
        backFields: [{ key: "page", label: "PUBLIC PAGE", value: url }],
      },
      barcodes: [{ message: url, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1" }],
    })),
    "icon.png": solidPng(29, 29, NAVY),
    "icon@2x.png": solidPng(58, 58, NAVY),
    "logo.png": solidPng(160, 50, NAVY),
  };
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
