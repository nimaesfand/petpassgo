import { NextResponse } from "next/server";
import { stripe, priceId, userFromReq, isMember, customerFor, siteUrl, serviceClient } from "@/lib/stripeServer";
import { consentAccepted, WITHDRAWAL_BLOCKED } from "@/lib/withdrawal";
import { attachConsentSession, consentMetadata, recordWithdrawalConsent } from "@/lib/withdrawalRecord";

export const dynamic = "force-dynamic";

// plan: "pass" ($49.99, non-members), "member_pass" ($19.99, active members only),
// "join" ($6.99/mo membership + this trip at $19.99), "membership" (membership only).
export async function POST(req) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("stripe route", e?.message);
    return NextResponse.json({ error: "Checkout isn't available right now. Please try again in a little while or email support@petpassgo.com." }, { status: 503 });
  }
}

async function handle(req) {
  const user = await userFromReq(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const plan = body?.plan;
  const tripId = body?.trip_id || null;
  // First-touch attribution -> Stripe metadata (whitelisted, length-capped; optional).
  const attribution = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]) {
    const v = body?.attribution?.[k];
    if (typeof v === "string" && v) attribution[k] = v.slice(0, 200);
  }
  if (!["pass", "member_pass", "join", "membership"].includes(plan)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  if (!consentAccepted(body)) return NextResponse.json({ error: WITHDRAWAL_BLOCKED }, { status: 400 });

  const sb = serviceClient();
  const member = await isMember(sb, user.id);
  if (plan === "member_pass" && !member) return NextResponse.json({ error: "The $19.99 USD pass is for members." }, { status: 403 });
  if ((plan === "join" || plan === "membership") && member) return NextResponse.json({ error: "You're already a member." }, { status: 409 });
  // Members always get the member price.
  const effPlan = plan === "pass" && member ? "member_pass" : plan;

  if (effPlan !== "membership") {
    if (!tripId) return NextResponse.json({ error: "Missing trip" }, { status: 400 });
    const { data: trip } = await sb.from("trips").select("id,user_id,paid").eq("id", tripId).maybeSingle();
    if (!trip || trip.user_id !== user.id) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    if (trip.paid) return NextResponse.json({ error: "This trip is already unlocked." }, { status: 409 });
  }

  const customer = await customerFor(sb, user);
  const base = siteUrl(req);
  const consent = await recordWithdrawalConsent(sb, { userId: user.id, email: user.email, plan: effPlan });
  const meta = { user_id: user.id, trip_id: effPlan === "membership" ? "" : tripId, plan: effPlan, ...attribution, ...consentMetadata(consent.id, consent.consented_at) };
  const params = {
    customer,
    client_reference_id: user.id,
    metadata: meta,
    success_url: `${base}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/account?checkout=canceled`,
    allow_promotion_codes: false,
  };
  if (effPlan === "pass" || effPlan === "member_pass") {
    Object.assign(params, {
      mode: "payment",
      line_items: [{ price: await priceId(effPlan), quantity: 1 }],
      payment_intent_data: { metadata: meta },
      // Show the card already on file (e.g. the membership card) so returning customers just tap Pay.
      saved_payment_method_options: { payment_method_save: "enabled", allow_redisplay_filters: ["always", "limited", "unspecified"] },
    });
  } else {
    const items = [{ price: await priceId("membership"), quantity: 1 }];
    if (effPlan === "join") items.push({ price: await priceId("member_pass"), quantity: 1 });
    Object.assign(params, {
      mode: "subscription", line_items: items, subscription_data: { metadata: { user_id: user.id, ...attribution, ...consentMetadata(consent.id, consent.consented_at) } },
      payment_method_data: { allow_redisplay: "always" }, // card can be offered again on later Travel Pass checkouts
      saved_payment_method_options: { allow_redisplay_filters: ["always", "limited", "unspecified"] },
    });
  }
  const session = await stripe().checkout.sessions.create(params);
  await attachConsentSession(sb, consent.id, session.id);
  return NextResponse.json({ url: session.url });
}
