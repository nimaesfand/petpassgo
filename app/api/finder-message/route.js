import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { emailPetOwner } from "../../../lib/serverEmail";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Finder -> owner relay. The finder never sees the owner's email/phone; the owner
// sees the message (and the finder's contact, if given) in their dashboard.
export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const petId = String(b?.petId || "");
  const message = String(b?.message || "").trim();
  const contact = String(b?.contact || "").trim().slice(0, 200);
  if (b?.website) return NextResponse.json({ ok: true }); // honeypot: silently drop bots
  if (!UUID.test(petId)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (message.length < 2 || message.length > 1000) return NextResponse.json({ error: "Please write a message (up to 1000 characters)." }, { status: 400 });
  if (typeof b?.elapsedMs === "number" && b.elapsedMs < 2500) return NextResponse.json({ ok: true }); // too fast to be human

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const senderHash = createHash("sha256").update(`${ip}|${day}|${process.env.SITE_PASSWORD || "petpassgo"}`).digest("hex").slice(0, 32);

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error } = await sb.from("finder_messages").insert({ pet_id: petId, message, finder_contact: contact || null, sender_hash: senderHash });
  if (error) {
    const msg = error.code === "P0001" ? error.message : "Couldn't send your message. Please try again.";
    return NextResponse.json({ error: msg }, { status: error.code === "P0001" ? 429 : 400 });
  }
  // The message is already saved. A failed email is logged server-side; the finder still sees success.
  await emailPetOwner(
    petId,
    "PetPassGo: someone sent a message about {name}",
    `Someone sent a message about {name} through the Pet ID page:\n\n"${message}"\n\nTheir contact: ${contact || "(not provided)"}\n\nSee all messages: ${SITE_URL}/account\n\nStay safe: meet in a public place and never send money before you have your pet back.`,
    "finder_message"
  );
  return NextResponse.json({ ok: true });
}
