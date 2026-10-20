import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/stripeServer";
import { loadPaidGuestSession, userIdByEmail, claimGuestCheckout } from "@/lib/guestCheckout";

export const dynamic = "force-dynamic";

// Create the account for a paid guest checkout using the email Stripe collected (never the client's),
// then attach the purchase. The browser signs in with the returned email + the password it chose.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body?.password || "");
    if (password.length < 6 || password.length > 72) return NextResponse.json({ error: "Password must be 6 to 72 characters." }, { status: 400 });
    const sb = serviceClient();
    const got = await loadPaidGuestSession(sb, body?.session_id);
    if (!got) return NextResponse.json({ error: "We couldn't find that payment." }, { status: 404 });
    const { session, row } = got;
    if (row.claimed_at) return NextResponse.json({ state: "claimed", email: row.email }, { status: 409 });
    if (!row.email) return NextResponse.json({ error: "We couldn't read the email from your payment." }, { status: 400 });
    const existing = await userIdByEmail(sb, row.email);
    if (existing) { await claimGuestCheckout(sb, row, existing, session); return NextResponse.json({ state: "exists", email: row.email }, { status: 409 }); }
    const meta = { first_name: row.first_name || "", last_name: row.last_name || "", full_name: [row.first_name, row.last_name].filter(Boolean).join(" ") };
    const { data, error } = await sb.auth.admin.createUser({ email: row.email, password, email_confirm: true, user_metadata: meta });
    if (error) {
      if (error.code === "email_exists" || error.status === 422) {
        const uid = await userIdByEmail(sb, row.email);
        if (uid) await claimGuestCheckout(sb, row, uid, session);
        return NextResponse.json({ state: "exists", email: row.email }, { status: 409 });
      }
      if (error.code === "weak_password") return NextResponse.json({ error: error.message }, { status: 400 });
      throw error;
    }
    const r = await claimGuestCheckout(sb, row, data.user.id, session);
    return NextResponse.json({ state: "created", email: row.email, plan: row.plan, trip_id: r.tripId || null });
  } catch (e) {
    console.error("welcome claim", e?.message);
    return NextResponse.json({ error: "Something went wrong finishing your account. Please try again or email support@petpassgo.com." }, { status: 500 });
  }
}
