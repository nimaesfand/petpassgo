import { NextResponse } from "next/server";
import { buildPetPass, walletConfigured } from "../../../lib/appleWallet";
import { googleConfigured } from "../../../lib/googleWallet";
import { PET_COLUMNS, passExtras, petThumbs, walletPassRow } from "../../../lib/walletData";
import { requireUser, vaultIsOpen } from "../../../lib/paidUser";
import { allowRequest, clientIp } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET: which wallet buttons to show (members only; hidden until each one is set up).
export async function GET(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb || !(await vaultIsOpen(sb, user.id))) return NextResponse.json({ available: false, apple: false, google: false });
  const apple = walletConfigured(), google = googleConfigured();
  return NextResponse.json({ available: apple, apple, google });
}

// POST { pet_id }: the signed Apple Wallet pass (.pkpass), registered for updates.
export async function POST(req) {
  try {
    const { user, sb } = await requireUser(req);
    if (!user || !sb) return NextResponse.json({ error: "Sign in to add this passport." }, { status: 401 });
    if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Adding to Wallet is part of Pet Vault." }, { status: 403 });
    if (!walletConfigured()) return NextResponse.json({ available: false, error: "Couldn't add the pass. Try again in a few minutes." }, { status: 404 });
    if (!(await allowRequest(sb, `pet_wallet:${user.id}:${clientIp(req)}`, 10, 600))) return NextResponse.json({ error: "Too many tries. Try again in a few minutes." }, { status: 429 });
    const body = await req.json().catch(() => ({}));
    const petId = String(body.pet_id || "");
    if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
    const { data: pet } = await sb.from("pets").select(PET_COLUMNS).eq("id", petId).eq("user_id", user.id).maybeSingle();
    if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    const row = await walletPassRow(sb, pet.id);
    const [extras, thumbs] = await Promise.all([passExtras(sb, pet), petThumbs(sb, pet).catch(() => ({}))]);
    const bytes = await buildPetPass(pet, { ...extras, thumbs, authToken: row.auth_token });
    const safe = String(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40) || "pet";
    return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/vnd.apple.pkpass", "Content-Disposition": `attachment; filename="${safe}-passport.pkpass"`, "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Couldn't add the pass. Try again in a few minutes." }, { status: 500 });
  }
}
