import { randomBytes } from "crypto";

// Each pet gets one private address, e.g. milo-k7d2x9qa@in.petpassgo.com.
// Set INBOUND_DOMAIN in Vercel once the receiving domain is set up in Resend.
export function inboundDomain() {
  return String(process.env.INBOUND_DOMAIN || "").trim().toLowerCase().replace(/^@/, "");
}

export function inboxAddress(key) {
  const d = inboundDomain();
  return d && key ? `${key}@${d}` : "";
}

export async function ensureInboxKey(sb, pet) {
  if (pet.inbox_key) return pet.inbox_key;
  const base = String(pet.name || "pet").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "").slice(0, 12) || "pet";
  for (let i = 0; i < 5; i++) {
    const key = `${base}-${randomBytes(6).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}`;
    const { data, error } = await sb.from("pets").update({ inbox_key: key }).eq("id", pet.id).is("inbox_key", null).select("inbox_key");
    if (!error && data?.length) return key;
    const { data: again } = await sb.from("pets").select("inbox_key").eq("id", pet.id).maybeSingle();
    if (again?.inbox_key) return again.inbox_key;
  }
  return null;
}
