import { NextResponse } from "next/server";
import { requireUser, vaultIsOpen } from "../../../lib/paidUser";
import { emailConfigured, sendResendEmail } from "../../../lib/serverEmail";
import { petPhotoAttachment } from "../../../lib/emailHtml";
import { vetConnectEmail } from "../../../lib/vetVerifyEmail";
import { ensureInboxKey, inboundDomain, inboxAddress } from "../../../lib/petInbox";
import { allowRequest, clientIp } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const clip = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

// GET: the pet's connected vets and its private address.
export async function GET(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const petId = new URL(req.url).searchParams.get("pet_id") || "";
  if (!UUID.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id,inbox_key").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  const { data: providers } = await sb.from("pet_providers").select("id,kind,name,email,requested_at,last_received_at").eq("pet_id", petId).order("created_at", { ascending: false });
  return NextResponse.json({ ready: !!inboundDomain(), inbox: inboxAddress(pet.inbox_key), providers: providers || [] });
}

// POST: the owner approves, and we email the clinic a ready-made request to add
// the pet's private address to the file. The owner gets a copy.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Connecting your vet is part of Pet Vault." }, { status: 403 });
  if (!inboundDomain() || !emailConfigured()) return NextResponse.json({ error: "Connecting a vet isn't switched on yet. Please try again soon." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  const email = clip(body.email, 200).toLowerCase();
  const clinic = clip(body.clinic, 80);
  const kind = ["vet", "groomer", "daycare", "boarding", "trainer", "sitter"].includes(body.kind) ? body.kind : "vet";
  if (!UUID.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Check the clinic's email address." }, { status: 400 });
  if (user.email && email === String(user.email).toLowerCase()) return NextResponse.json({ error: "This goes to your clinic, not to you." }, { status: 400 });
  if (body.agree !== true) return NextResponse.json({ error: "Please tick the box to approve." }, { status: 400 });
  if (!(await allowRequest(sb, `vet_connect:${user.id}:${clientIp(req)}`, 5, 86400))) return NextResponse.json({ error: "Too many requests today. Please try again tomorrow." }, { status: 429 });

  const { data: pet } = await sb.from("pets").select("id,user_id,name,breed,animal_type,role,passport_no,photo_url,handler_name,inbox_key").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  const key = await ensureInboxKey(sb, pet);
  if (!key) return NextResponse.json({ error: "Couldn't set this up. Please try again." }, { status: 500 });
  const inbox = inboxAddress(key);
  const owner = clip(pet.handler_name || user.user_metadata?.full_name || "", 60) || "Your client";
  const photo = await petPhotoAttachment(sb, pet);
  const mail = vetConnectEmail({ owner, ownerEmail: user.email, pet, inbox, clinic, photoCid: photo ? "petphoto" : null });
  const r = await sendResendEmail({
    to: email, cc: user.email ? [user.email] : undefined, replyTo: user.email || undefined,
    fromName: `${owner.split(" ")[0]} via PetPassGo`, subject: mail.subject, text: mail.text, html: mail.html,
    kind: "vet_connect", attachments: photo ? [photo] : undefined,
  });
  if (!r.ok) return NextResponse.json({ error: "We couldn't send the email. Check the address and try again." }, { status: 502 });

  const { data: existing } = await sb.from("pet_providers").select("id").eq("pet_id", pet.id).eq("email", email).maybeSingle();
  if (existing) await sb.from("pet_providers").update({ name: clinic || null, kind, requested_at: new Date().toISOString() }).eq("id", existing.id);
  else await sb.from("pet_providers").insert({ user_id: user.id, pet_id: pet.id, kind, name: clinic || null, email, requested_at: new Date().toISOString() });
  return NextResponse.json({ ok: true, inbox });
}
