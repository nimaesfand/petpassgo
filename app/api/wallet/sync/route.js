import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/paidUser";
import { syncWalletPass } from "../../../../lib/walletSync";
import { allowRequest } from "../../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST { pet_id }: called when the owner opens their pet. Sends any pending Wallet update.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ ok: false }, { status: 401 });
  const { pet_id: petId } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(String(petId || ""))) return NextResponse.json({ ok: false }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ ok: false }, { status: 404 });
  if (!(await allowRequest(sb, `wallet_sync:${petId}`, 20, 3600))) return NextResponse.json({ ok: true, skipped: true });
  return NextResponse.json({ ok: true, ...(await syncWalletPass(sb, petId)) });
}
