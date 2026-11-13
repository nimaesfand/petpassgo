import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/paidUser";
import { allowRequest, clientIp } from "../../../../lib/rateLimit";
import { sendResendEmail } from "../../../../lib/serverEmail";
import { hashToken, newToken } from "../../../../lib/ppgSign";
import { SITE_URL } from "../../../../lib/site";

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
  const { data: pet } = await sb.from("pets").select("id,name,animal_type,breed,handler_name").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  const { count } = await sb.from("pet_health_records").select("id", { count: "exact", head: true }).eq("pet_id", petId).in("kind", ["vaccine", "medication"]);
  if (!count) return NextResponse.json({ error: "Add at least one vaccine first, then ask your vet to confirm it." }, { status: 400 });

  const token = newToken();
  const { error } = await sb.from("vet_verifications").insert({ token_hash: hashToken(token), pet_id: petId, user_id: user.id, vet_email: vetEmail, expires_at: new Date(Date.now() + 14 * 864e5).toISOString() });
  if (error) return NextResponse.json({ error: "Couldn't create the request. Try again." }, { status: 500 });
  const owner = pet.handler_name || "A pet owner";
  const sent = await sendResendEmail({
    to: vetEmail,
    replyTo: user.email || undefined,
    kind: "vet_verify_request",
    subject: `Please confirm ${pet.name}'s vaccine records`,
    text: [
      "Hello,",
      "",
      `${owner} asked us to have their vet confirm the vaccine records for ${pet.name} (${[pet.breed, pet.animal_type].filter(Boolean).join(", ")}).`,
      "",
      "It takes about a minute. Open this private link, check the records against your files, and confirm the ones that match:",
      `${SITE_URL}/vet-verify/${token}`,
      "",
      "The link works once and expires in 14 days. Your name and clinic appear on the pet's PetPassGo passport next to the records you confirm.",
      "If you don't see this patient in your records, just ignore this email.",
      "",
      "Thank you,",
      "PetPassGo",
    ].join("\n"),
  });
  if (!sent.ok) return NextResponse.json({ error: "We couldn't send the email. Check the address and try again." }, { status: 502 });
  return NextResponse.json({ sent: true });
}
