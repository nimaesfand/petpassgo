import { NextResponse } from "next/server";
import { stripe, userFromReq, siteUrl, serviceClient } from "@/lib/stripeServer";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const user = await userFromReq(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { data } = await serviceClient().from("stripe_customers").select("customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.customer_id) return NextResponse.json({ error: "No billing account yet." }, { status: 404 });
  const s = await stripe().billingPortal.sessions.create({ customer: data.customer_id, return_url: `${siteUrl(req)}/account` });
  return NextResponse.json({ url: s.url });
}
