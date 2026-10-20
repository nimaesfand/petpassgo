import { NextResponse } from "next/server";
import { stripe, priceId, siteUrl, serviceClient } from "@/lib/stripeServer";
import { cleanTrip } from "@/lib/guestCheckout";

export const dynamic = "force-dynamic";

// Pay-first checkout for signed-out visitors. Stripe collects email, name and card;
// the account is created afterwards on /welcome. plan: "pass" | "join" | "membership".
export async function POST(req) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("guest checkout", e?.message);
    return NextResponse.json({ error: "Checkout isn't available right now. Please try again in a little while or email support@petpassgo.com." }, { status: 503 });
  }
}

const NAME_FIELDS = [
  { key: "first_name", label: { type: "custom", custom: "First name" }, type: "text", text: { minimum_length: 1, maximum_length: 50 } },
  { key: "last_name", label: { type: "custom", custom: "Last name" }, type: "text", text: { minimum_length: 1, maximum_length: 50 } },
];

async function handle(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const plan = body?.plan;
  if (!["pass", "join", "membership"].includes(plan)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  const trip = plan === "membership" ? null : cleanTrip(body?.trip);
  if (plan !== "membership" && !trip) return NextResponse.json({ error: "Please finish your trip details first." }, { status: 400 });
  const attribution = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]) {
    const v = body?.attribution?.[k];
    if (typeof v === "string" && v) attribution[k] = v.slice(0, 200);
  }
  const cancelPath = typeof body?.cancel_path === "string" && /^\/(?!\/)[\w\-\/?=&.%]*$/.test(body.cancel_path) ? body.cancel_path.slice(0, 200) : "/";

  const sb = serviceClient();
  const { data: row, error } = await sb.from("guest_checkouts").insert({ plan, trip, attribution }).select("id").single();
  if (error) throw error;

  const base = siteUrl(req);
  const meta = { guest: "1", guest_checkout_id: row.id, plan, ...attribution };
  const params = {
    metadata: meta,
    client_reference_id: row.id,
    custom_fields: NAME_FIELDS,
    success_url: `${base}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${cancelPath}`,
    allow_promotion_codes: false,
  };
  if (plan === "pass") {
    Object.assign(params, {
      mode: "payment",
      customer_creation: "always",
      line_items: [{ price: await priceId("pass"), quantity: 1 }],
      payment_intent_data: { metadata: meta, setup_future_usage: "on_session" },
      payment_method_data: { allow_redisplay: "always" },
    });
  } else {
    const items = [{ price: await priceId("membership"), quantity: 1 }];
    if (plan === "join") items.push({ price: await priceId("member_pass"), quantity: 1 });
    Object.assign(params, {
      mode: "subscription",
      line_items: items,
      subscription_data: { metadata: { guest_checkout_id: row.id, ...attribution } },
      payment_method_data: { allow_redisplay: "always" },
    });
  }
  const session = await stripe().checkout.sessions.create(params);
  await sb.from("guest_checkouts").update({ stripe_checkout_session_id: session.id }).eq("id", row.id);
  return NextResponse.json({ url: session.url });
}
