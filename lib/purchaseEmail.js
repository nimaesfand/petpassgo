import { sendResendEmail } from "./serverEmail";
import { SITE_URL } from "./site";
import { WITHDRAWAL_CONFIRMED } from "./withdrawal";
import { receiptFor } from "./stripeServer";

const PLAN_NAME = {
  pass: "Travel Pass",
  member_pass: "Travel Pass at the member price",
  join: "Pet Vault membership and a Travel Pass",
  membership: "Pet Vault membership",
};

export function formatMoney(cents, currency) {
  if (typeof cents !== "number") return null;
  return `$${(cents / 100).toFixed(2)} ${(currency || "usd").toUpperCase()}`;
}

export function purchaseConfirmationText({ plan, amountLine, withdrawal = false, receiptUrl = null }) {
  const name = PLAN_NAME[plan] || "PetPassGo purchase";
  const lines = [
    "Thank you for your purchase!",
    "",
    amountLine ? `Your ${name} is confirmed. You paid ${amountLine}.` : `Your ${name} is confirmed.`,
  ];
  if (receiptUrl) lines.push(`Your receipt: ${receiptUrl}`);
  lines.push("");
  if (withdrawal) lines.push(WITHDRAWAL_CONFIRMED, "");
  if (plan === "membership" || plan === "join") {
    lines.push("You can cancel Pet Vault online anytime in account Billing. You keep access through the period you have paid.", "");
  }
  if (plan !== "membership") {
    lines.push(`Flight-Ready Guarantee: If your pet is refused boarding because a requirement we showed you was wrong, we refund your Travel Pass. Terms: ${SITE_URL}/guarantee`, "");
  }
  lines.push(`Open your account: ${SITE_URL}/account`, "", "Questions? Just reply to this email.", "", "— PetPassGo");
  return lines.join("\n");
}

function sessionEmail(session) {
  return String(session?.customer_details?.email || session?.customer_email || "").trim().toLowerCase();
}

// One confirmation per paid checkout, for every buyer. Safe to call twice:
// purchase_emails (keyed by the Stripe session) is the lock.
export async function sendPurchaseConfirmation(sb, session) {
  if (!session?.id) return;
  const consentId = session.metadata?.withdrawal_consent_id || null;
  const withdrawal = session.metadata?.withdrawal_consent === "1";
  if (withdrawal && consentId) {
    await sb.from("withdrawal_consents").update({ stripe_checkout_session_id: session.id }).eq("id", consentId).is("stripe_checkout_session_id", null);
  }

  let to = sessionEmail(session);
  if (!to && session.metadata?.user_id) {
    const { data: u } = await sb.auth.admin.getUserById(session.metadata.user_id);
    to = String(u?.user?.email || "").trim().toLowerCase();
  }
  if (!to) {
    console.error("purchase_email_missing_recipient", { kind: "purchase_confirmation" });
    return;
  }
  if (!process.env.RESEND_API_KEY || !process.env.REMINDER_FROM_EMAIL) {
    console.error("purchase_email_not_configured", { kind: "purchase_confirmation" });
    return;
  }

  const lock = await sb.from("purchase_emails").insert({ stripe_checkout_session_id: session.id });
  if (lock.error?.code === "23505") return;
  if (lock.error) console.error("purchase_email_lock", lock.error.message);

  let receiptUrl = null;
  try { receiptUrl = await receiptFor(session); } catch {}
  const result = await sendResendEmail({
    to,
    subject: "Thank you! Your PetPassGo receipt",
    text: purchaseConfirmationText({ plan: session.metadata?.plan, amountLine: formatMoney(session.amount_total, session.currency), withdrawal, receiptUrl }),
    kind: "purchase_confirmation",
  });
  if (!result.ok) {
    if (!lock.error) await sb.from("purchase_emails").delete().eq("stripe_checkout_session_id", session.id);
    throw new Error("purchase confirmation email failed");
  }
  if (withdrawal && consentId) await sb.from("withdrawal_consents").update({ email_sent_at: new Date().toISOString() }).eq("id", consentId).is("email_sent_at", null);
}
