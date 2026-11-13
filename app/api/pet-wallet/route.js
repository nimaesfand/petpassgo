import { NextResponse } from "next/server";
import { buildPetPass, walletConfigured } from "../../../lib/appleWallet";
import { requireUser, vaultIsOpen } from "../../../lib/paidUser";
import { allowRequest, clientIp } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ available: false });
  if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ available: false });
  return NextResponse.json({ available: walletConfigured() });
}

export async function POST(req) {
  try {
    const { user, sb } = await requireUser(req);
    if (!user || !sb) return NextResponse.json({ error: "Sign in to save this pet ID." }, { status: 401 });
    if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Pet Vault is paused for this account." }, { status: 403 });
    if (!walletConfigured()) return NextResponse.json({ available: false, error: "Apple Wallet is not set up." }, { status: 404 });
    const allowed = await allowRequest(sb, `pet_wallet:${user.id}:${clientIp(req)}`, 10, 600);
    if (!allowed) return NextResponse.json({ error: "Too many downloads. Try again in a few minutes." }, { status: 429 });

    const body = await req.json().catch(() => ({}));
    const petId = String(body.pet_id || "");
    if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
    const { data: pet } = await sb.from("pets").select("id,name,breed,animal_type,passport_no,role,sex,color,weight_lb,date_of_birth,trained,microchip_number,handler_name,emergency_contact_name,emergency_contact_phone,show_contact_on_public_id,passport_issued_at").eq("id", petId).eq("user_id", user.id).maybeSingle();
    if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });

    // Optional pet photo from the browser: a small PNG only (checked by its signature and size).
    let thumb = null;
    if (typeof body.thumb === "string" && body.thumb.length < 400000) {
      const buf = Buffer.from(body.thumb, "base64");
      if (buf.length > 100 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) thumb = buf;
    }
    const bytes = await buildPetPass(pet, thumb);
    const safe = String(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40) || "pet";
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${safe}-passport.pkpass"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "The Wallet pass could not be created." }, { status: 500 });
  }
}
