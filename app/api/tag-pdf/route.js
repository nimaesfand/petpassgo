import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/paidUser";
import { buildTagPdf } from "../../../lib/tagPdf";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Owner-only: the print-ready QR tag sheet for one pet.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in to print tags." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id,name,public_slug").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "That pet isn't on this account." }, { status: 404 });
  const bytes = await buildTagPdf({ url: `${SITE_URL}/id/${pet.public_slug || pet.id}`, petName: pet.name });
  const file = `${String(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-QR-tags.pdf`;
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store" } });
}
