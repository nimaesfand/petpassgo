import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/stripeServer";
import { loadPaidGuestSession, userIdByEmail, claimGuestCheckout } from "@/lib/guestCheckout";

export const dynamic = "force-dynamic";

// Status for /welcome after a pay-first checkout. If the email already has an account,
// the purchase is attached to it and the buyer is asked to log in (no password set here).
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const sb = serviceClient();
    const got = await loadPaidGuestSession(sb, body?.session_id);
    if (!got) return NextResponse.json({ state: "invalid" }, { status: 404 });
    const { session, row } = got;
    const out = { email: row.email, first_name: row.first_name || "", plan: row.plan };
    if (row.claimed_at) return NextResponse.json({ ...out, state: "claimed" });
    const uid = await userIdByEmail(sb, row.email);
    if (uid) { await claimGuestCheckout(sb, row, uid, session); return NextResponse.json({ ...out, state: "exists" }); }
    return NextResponse.json({ ...out, state: "new" });
  } catch (e) {
    console.error("welcome", e?.message);
    return NextResponse.json({ state: "error" }, { status: 500 });
  }
}
