import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/paidUser";
import { allowRequest, clientIp } from "../../../../lib/rateLimit";
import { sendResendEmail } from "../../../../lib/serverEmail";
import { hashToken, newToken } from "../../../../lib/ppgSign";
import { vetRequestEmail } from "../../../../lib/vetVerifyEmail";
import { petPhotoAttachment } from "../../../../lib/emailHtml";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The owner asks their vet to confirm the vaccine records. The vet gets a
// private link (good for 14 days, one use) and confirms on our site.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  const vetEmail = String(body.vet_email || "").trim().toLowerCase().slice(0, 200);
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  if (!EMAIL.test(vetEmail)) return NextResponse.json({ error: "Enter your vet clinic's email address." }, { status: 400 });
  if (user.email && vetEmail === String(user.email).toLowerCase()) return NextResponse.json({ error: "This goes to your vet clinic, not to you." }, { status: 400 });
  const ok = await allowRequest(sb, `vet_verify:${user.id}:${clientIp(req)}`, 5, 3600);
  if (!ok) return NextResponse.json({ error: "Too many requests. Try again in an hour." }, { status: 429 });
  const { data: pet } = await sb.from("pets").select("id,name,animal_type,breed,role,passport_no,photo_url,handler_name").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  const { count } = await sb.from("pet_health_records").select("id", { count: "exact", head: true }).eq("pet_id", petId).in("kind", ["vaccine", "medication"]);
  if (!count) return NextResponse.json({ error: "Add at least one vaccine first, then ask your vet to confirm it." }, { status: 400 });

  const token = newToken();
  const { error } = await sb.from("vet_verifications").insert({ token_hash: hashToken(token), pet_id: petId, user_id: user.id, vet_email: vetEmail, expires_at: new Date(Date.now() + 14 * 864e5).toISOString() });
  if (error) return NextResponse.json({ error: "Couldn't create the request. Try again." }, { status: 500 });
  const { data: recs } = await sb.from("pet_health_records").select("name,date_given,expires_on").eq("pet_id", petId).eq("kind", "vaccine").order("expires_on", { ascending: true, nullsFirst: false }).limit(8);
  const photo = await petPhotoAttachment(sb, pet);
  const mail = vetRequestEmail({ owner: pet.handler_name, pet, token, records: recs || [], photoCid: photo ? "petphoto" : null });
  const sent = await sendResendEmail({ to: vetEmail, replyTo: user.email || undefined, fromName: pet.handler_name ? `${String(pet.handler_name).split(" ")[0]} via PetPassGo` : undefined, kind: "vet_verify_request", subject: mail.subject, text: mail.text, html: mail.html, attachments: photo ? [photo] : undefined });
  if (!sent.ok) return NextResponse.json({ error: "We couldn't send the email. Check the address and try again." }, { status: 502 });
  return NextResponse.json({ sent: true });
}

// GET: the latest request for this pet, so the owner can see it's waiting.
export async function GET(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const petId = new URL(req.url).searchParams.get("pet_id") || "";
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: v } = await sb.from("vet_verifications").select("vet_email,created_at,expires_at,used_at,vet_name,clinic,record_ids,reminded_at").eq("pet_id", petId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!v) return NextResponse.json({ status: "none" });
  const status = v.used_at ? "done" : new Date(v.expires_at) < new Date() ? "expired" : "waiting";
  return NextResponse.json({ status, vet_email: v.vet_email, sent_at: v.created_at, reminded_at: v.reminded_at, vet_name: v.vet_name, clinic: v.clinic, confirmed: (v.record_ids || []).length });
}
