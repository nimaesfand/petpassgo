import { NextResponse } from "next/server";
import { serviceClient, sendResendEmail } from "../../../lib/serverEmail";
import { hashToken, newToken } from "../../../lib/ppgSign";
import { vetRequestEmail } from "../../../lib/vetVerifyEmail";
export const dynamic = "force-dynamic";
// TEMPORARY preview-only: sends one sample vet email to the owner. Remove after.
export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "no" }, { status: 404 });
  const sb = serviceClient();
  const petId = "a7b65b24-308c-45af-a042-ef170f302f21";
  const { data: pet } = await sb.from("pets").select("id,user_id,name,animal_type,breed,handler_name").eq("id", petId).maybeSingle();
  if (!pet) return NextResponse.json({ error: "no pet" });
  const { count } = await sb.from("vet_verifications").select("id", { count: "exact", head: true }).eq("pet_id", petId);
  if (count) return NextResponse.json({ error: "already sent" });
  const token = newToken();
  await sb.from("vet_verifications").insert({ token_hash: hashToken(token), pet_id: petId, user_id: pet.user_id, vet_email: "admin@petpassgo.com", expires_at: new Date(Date.now() + 14 * 864e5).toISOString() });
  const mail = vetRequestEmail({ owner: pet.handler_name, pet, token });
  const r = await sendResendEmail({ to: "admin@petpassgo.com", kind: "vet_verify_request", subject: mail.subject, text: mail.text });
  return NextResponse.json({ ok: r.ok });
}
