import { NextResponse } from "next/server";
import { userFromReq, serviceClient } from "@/lib/stripeServer";
import { claimForUser } from "@/lib/guestCheckout";
import { claimDraftsByEmail } from "@/lib/passportClaim";

export const dynamic = "force-dynamic";

// Signed-in: attach any pay-first purchases made with this account's email.
export async function POST(req) {
  try {
    const user = await userFromReq(req);
    if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const svc = serviceClient();
    const claimed = await claimForUser(svc, user);
    // Passports made before signing up, with this email, move in once they're a member.
    const pets = await claimDraftsByEmail(svc, user).catch(() => []);
    return NextResponse.json({ claimed: claimed.length + pets.length, pets: pets.length });
  } catch (e) {
    console.error("claim", e?.message);
    return NextResponse.json({ claimed: 0 }, { status: 500 });
  }
}
