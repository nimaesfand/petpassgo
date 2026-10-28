import { sendResendEmail } from "./serverEmail";
import { SITE_URL } from "./site";
import { WITHDRAWAL_CONFIRMED } from "./withdrawal";

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

export function purchaseConfirmationText({ plan, amountLine }) {
  const name = PLAN_NAME[plan] || "PetPassGo purchase";
  const lines = [
    amountLine ? `Your ${name} is confirmed. You paid ${amountLine}.` : `Your ${name} is confirmed.`,
    "",
    WITHDRAWAL_CONFIRMED,
    "",
  ];
  if (plan === "membership" || plan === "join") {
    lines.push("You can cancel Pet Vault online anytime in account Billing. You keep access through the period you have paid.", "");
  }
  lines.push(
    `Flight-Ready Guarantee: if a requirement we showed was wrong and your pet was refused boarding, we refund that Travel Pass. We reply within 24 hours. Approved refunds are issued within 24 hours of approval, back to your original card. Conditions apply: ${SITE_URL}/guarantee`,
    "",
    `Your account: ${SITE_URL}/account`,
  );
  return lines.join("\n");
}

function sessionEmail(session) {
  return String(session?.customer_details?.email || session?.customer_email || "").trim().toLowerCase();
}

// One confirmation per paid checkout. Safe to call twice: the row's email_sent_at is the lock.
export async function sendPurchaseConfirmation(sb, session) {
  if (session?.metadata?.withdrawal_consent !== "1") return;
  const sessionId = session.id;
  const consentId = session.metadata.withdrawal_consent_id || null;
  if (consentId) {
    await sb.from("withdrawal_consents").update({ stripe_checkout_session_id: sessionId }).eq("id", consentId).is("stripe_checkout_session_id", null);
  }

  let row = null;
  const bySession = await sb.from("withdrawal_consents").select("id,email,plan,user_id,email_sent_at").eq("stripe_checkout_session_id", sessionId).maybeSingle();
  row = bySession.data;
  if (!row && consentId) {
    const byId = await sb.from("withdrawal_consents").select("id,email,plan,user_id,email_sent_at").eq("id", consentId).maybeSingle();
    row = byId.data;
  }
  if (!row || row.email_sent_at) return;

  let to = row.email || sessionEmail(session);
  if (!to && row.user_id) {
    const { data: u } = await sb.auth.admin.getUserById(row.user_id);
    to = u?.user?.email || "";
  }
  to = String(to || "").trim().toLowerCase();
  if (!to) {
    console.error("purchase_email_missing_recipient", { kind: "purchase_confirmation" });
    return;
  }
  if (!process.env.RESEND_API_KEY || !process.env.REMINDER_FROM_EMAIL) {
    console.error("purchase_email_not_configured", { kind: "purchase_confirmation" });
    return;
  }

  const claimedAt = new Date().toISOString();
  const { data: claimed } = await sb.from("withdrawal_consents").update({ email_sent_at: claimedAt }).eq("id", row.id).is("email_sent_at", null).select("id").maybeSingle();
  if (!claimed) return;

  const amountLine = formatMoney(session.amount_total, session.currency);
  const result = await sendResendEmail({
    to,
    subject: "Your PetPassGo purchase",
    text: purchaseConfirmationText({ plan: row.plan || session.metadata?.plan, amountLine }),
    kind: "purchase_confirmation",
  });
  if (!result.ok) {
    await sb.from("withdrawal_consents").update({ email_sent_at: null }).eq("id", row.id);
    throw new Error("purchase confirmation email failed");
  }
}
