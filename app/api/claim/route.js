import { NextResponse } from "next/server";
import { userFromReq, serviceClient } from "@/lib/stripeServer";
import { claimForUser } from "@/lib/guestCheckout";

export const dynamic = "force-dynamic";

// Signed-in: attach any pay-first purchases made with this account's email.
export async function POST(req) {
  try {
    const user = await userFromReq(req);
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const claimed = await claimForUser(serviceClient(), user);
    return NextResponse.json({ claimed: claimed.length });
  } catch (e) {
    console.error("claim", e?.message);
    return NextResponse.json({ claimed: 0 }, { status: 500 });
  }
}
