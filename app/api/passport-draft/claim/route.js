import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/paidUser";
import { serviceClient } from "../../../../lib/serverEmail";
import { claimDraft } from "../../../../lib/passportClaim";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Move a saved passport into the signed-in account (Pet Vault members).
export async function POST(req) {
  const { user } = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const t = String(b.t || "");
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(t)) return NextResponse.json({ error: "This link isn't valid." }, { status: 400 });
  const svc = serviceClient();
  const { data: d } = await svc.from("passport_drafts").select("*").eq("token", t).maybeSingle();
  if (!d) return NextResponse.json({ error: "We couldn't find this passport." }, { status: 404 });
  const r = await claimDraft(svc, user, d);
  if (r.error) return NextResponse.json({ error: r.error, need: r.need }, { status: r.status });
  return NextResponse.json({ ok: true, pet_id: r.pet_id });
}
