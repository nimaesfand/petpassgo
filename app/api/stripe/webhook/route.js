import { NextResponse } from "next/server";
import { stripe, serviceClient, syncSubscription, userIdForCustomer } from "@/lib/stripeServer";
import { recordGuestPayment } from "@/lib/guestCheckout";
import { sendPurchaseConfirmation } from "@/lib/purchaseEmail";

export const dynamic = "force-dynamic";

async function recordPurchase(sb, o, kindHint) {
  if (!o?.metadata?.user_id) return;
  const kind = kindHint || o.metadata.plan || "membership";
  let receipt = null;
  try {
    if (o.payment_intent) { const pi = await stripe().paymentIntents.retrieve(o.payment_intent, { expand: ["latest_charge"] }); receipt = pi.latest_charge?.receipt_url || null; }
    if (!receipt && o.invoice) { const inv = await stripe().invoices.retrieve(o.invoice); receipt = inv.hosted_invoice_url || null; }
  } catch {}
  const { error } = await sb.from("purchases").insert({
    user_id: o.metadata.user_id, trip_id: o.metadata.trip_id || null, kind,
    amount_cents: typeof o.amount_total === "number" ? o.amount_total : null, currency: o.currency || "usd",
    stripe_checkout_session_id: o.id, stripe_payment_intent_id: typeof o.payment_intent === "string" ? o.payment_intent : null,
    stripe_invoice_id: typeof o.invoice === "string" ? o.invoice : null, receipt_url: receipt,
  });
  if (error && error.code !== "23505") throw error;
}

async function recordRenewal(sb, inv) {
  if (inv.billing_reason !== "subscription_cycle") return;
  const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
  const userId = await userIdForCustomer(sb, customerId);
  if (!userId) return;
  const { error } = await sb.from("purchases").insert({ user_id: userId, kind: "membership_renewal", amount_cents: inv.amount_paid ?? null, currency: inv.currency || "usd", stripe_invoice_id: inv.id, receipt_url: inv.hosted_invoice_url || null });
  if (error && error.code !== "23505") throw error;
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
        if (o.metadata?.guest_checkout_id && !o.metadata?.user_id) {
          await recordGuestPayment(sb, o);
          await sendPurchaseConfirmation(sb, o);
          break;
        }
        const tripId = o.metadata?.trip_id;
        const userId = o.metadata?.user_id;
        if (tripId && userId) {
          const { error } = await sb.from("trips")
            .update({ paid: true, paid_at: new Date().toISOString(), stripe_checkout_session_id: o.id })
            .eq("id", tripId).eq("user_id", userId);
          if (error) throw error;
        }
        await recordPurchase(sb, o);
        if (o.mode === "subscription" && o.subscription) {
          await syncSubscription(sb, await stripe().subscriptions.retrieve(o.subscription));
        }
        await sendPurchaseConfirmation(sb, o);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(sb, o);
        break;
      case "invoice.paid":
        await recordRenewal(sb, o);
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
