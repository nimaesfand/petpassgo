import { NextResponse } from "next/server";
import { stripe, serviceClient } from "@/lib/stripeServer";

export const dynamic = "force-dynamic";

function mapStatus(s) {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due" || s === "unpaid") return "past_due";
  if (s === "canceled" || s === "incomplete_expired") return "canceled";
  return null; // incomplete / paused: don't grant
}

async function userIdForCustomer(sb, customerId) {
  const { data } = await sb.from("stripe_customers").select("user_id").eq("customer_id", customerId).maybeSingle();
  return data?.user_id || null;
}

async function syncSubscription(sb, sub) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = sub.metadata?.user_id || (await userIdForCustomer(sb, customerId));
  if (!userId) return;
  const status = mapStatus(sub.status);
  if (!status) return;
  const end = sub.current_period_end || sub.items?.data?.[0]?.current_period_end;
  const { error } = await sb.from("memberships").upsert({
    user_id: userId,
    status,
    current_period_end: end ? new Date(end * 1000).toISOString() : null,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
  const sb = serviceClient();
  const o = event.data.object;
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        if (o.payment_status !== "paid" && o.payment_status !== "no_payment_required") break;
        const tripId = o.metadata?.trip_id;
        const userId = o.metadata?.user_id;
        if (tripId && userId) {
          const { error } = await sb.from("trips")
            .update({ paid: true, paid_at: new Date().toISOString(), stripe_checkout_session_id: o.id })
            .eq("id", tripId).eq("user_id", userId);
          if (error) throw error;
        }
        if (o.mode === "subscription" && o.subscription) {
          await syncSubscription(sb, await stripe().subscriptions.retrieve(o.subscription));
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(sb, o);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        const subId = o.subscription || o.parent?.subscription_details?.subscription;
        if (subId) await syncSubscription(sb, await stripe().subscriptions.retrieve(subId));
        break;
      }
    }
  } catch (e) {
    console.error("stripe webhook", event.type, e?.message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
