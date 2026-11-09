import { stripe, priceId } from "../../../../lib/stripeServer";

export const dynamic = "force-dynamic";

// Makes sure the current Stripe prices exist (creating new ones after a price change)
// and reports the amounts. Shows no secrets.
export async function GET() {
  const out = {};
  for (const kind of ["pass", "member_pass", "membership"]) {
    try {
      const p = await stripe().prices.retrieve(await priceId(kind));
      out[kind] = { amount: p.unit_amount, currency: p.currency, live: p.livemode };
    } catch (e) {
      out[kind] = { error: e?.message || "failed" };
    }
  }
  return Response.json(out);
}
