import { NextResponse } from "next/server";
import { googleConfigured, objectId, saveUrl } from "../../../../lib/googleWallet";
import { PET_COLUMNS, passExtras, walletPassRow } from "../../../../lib/walletData";
import { requireUser, vaultIsOpen } from "../../../../lib/paidUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST { pet_id } -> { url }: the "Add to Google Wallet" link for this pet.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in to add this passport." }, { status: 401 });
  if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Adding to Wallet is part of Pet Vault." }, { status: 403 });
  if (!googleConfigured()) return NextResponse.json({ error: "Couldn't add the pass. Try again in a few minutes." }, { status: 404 });
  const { pet_id: petId } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(String(petId || ""))) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select(PET_COLUMNS).eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  await walletPassRow(sb, pet.id);
  await sb.from("wallet_passes").update({ google_object_id: objectId(pet.id) }).eq("pet_id", pet.id);
  try {
    return NextResponse.json({ url: saveUrl(pet, await passExtras(sb, pet)) });
  } catch {
    return NextResponse.json({ error: "Couldn't add the pass. Try again in a few minutes." }, { status: 500 });
  }
}
