import { createHash, createHmac, timingSafeEqual, randomBytes } from "crypto";

// Server-only signing for passport verification codes and check-in links.
// The key is derived from a server secret that never reaches the browser.
function key() {
  const base = process.env.PPG_SIGNING_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base) throw new Error("signing key missing");
  return createHash("sha256").update(`ppg-sign-v1:${base}`).digest();
}

const b64u = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L

// Short code printed on the passport, tied to this pet and its passport number.
// Example: K7QM-3XPA-9WRT
export function passportCode(pet) {
  const mac = createHmac("sha256", key()).update(`passport|${pet.id}|${pet.passport_no || ""}`).digest();
  let out = "";
  for (let i = 0; i < 12; i++) out += ALPHA[mac[i] % ALPHA.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

// Check-in link token: pet + optional trip + expiry, signed. No database row needed.
export function signCheckin({ petId, tripId = "", minutes = 30 }) {
  const exp = Math.floor(Date.now() / 1000) + minutes * 60;
  const body = b64u(JSON.stringify({ p: petId, t: tripId || "", e: exp, n: b64u(randomBytes(4)) }));
  const sig = b64u(createHmac("sha256", key()).update(`checkin|${body}`).digest()).slice(0, 32);
  return { token: `${body}.${sig}`, expiresAt: new Date(exp * 1000).toISOString() };
}

export function readCheckin(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return { ok: false, reason: "bad" };
  const want = b64u(createHmac("sha256", key()).update(`checkin|${body}`).digest()).slice(0, 32);
  const a = Buffer.from(sig), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad" };
  let data;
  try { data = JSON.parse(unb64u(body).toString("utf8")); } catch { return { ok: false, reason: "bad" }; }
  if (!data?.p || !data?.e) return { ok: false, reason: "bad" };
  if (data.e * 1000 < Date.now()) return { ok: false, reason: "expired", petId: data.p };
  return { ok: true, petId: data.p, tripId: data.t || "", expiresAt: new Date(data.e * 1000) };
}

export function hashToken(t) {
  return createHash("sha256").update(String(t || "")).digest("hex");
}

export function newToken() {
  return b64u(randomBytes(24));
}
