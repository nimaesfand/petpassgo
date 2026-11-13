import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/paidUser";
import { passportCode } from "../../../lib/ppgSign";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Gives an issued passport its verification code (made once, kept on the pet).
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id,passport_no,passport_issued_at,verify_code").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  if (!pet.passport_issued_at || !pet.passport_no) return NextResponse.json({ code: null });
  if (pet.verify_code) return NextResponse.json({ code: pet.verify_code });
  const code = passportCode(pet);
  await sb.from("pets").update({ verify_code: code }).eq("id", pet.id).eq("user_id", user.id);
  return NextResponse.json({ code });
}
