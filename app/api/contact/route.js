import { NextResponse } from "next/server";
import { sendResendEmail, serviceClient } from "../../../lib/serverEmail";
import { allowRequest, clientIp } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SUPPORT = "support@petpassgo.com";

function line(value, max) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

// Saves every real submission, then emails support when Resend is configured.
// A failed or unconfigured email still counts as sent once the row is stored.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 }); }

  // Honeypot. Bots get a quiet success so they don't retry.
  if (String(body?.company || body?.website || "").trim()) return NextResponse.json({ ok: true });

  const name = line(body?.name, 120);
  const email = line(body?.email, 200).toLowerCase();
  const message = String(body?.message || "").trim().slice(0, 4000);
  if (name.length < 1) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (message.length < 2) return NextResponse.json({ error: "Please write a message." }, { status: 400 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: `We couldn't send that just now. Email ${SUPPORT} instead.` }, { status: 503 });
  }

  const sb = serviceClient();
  const ip = clientIp(req);
  const allowed = await allowRequest(sb, `contact:${ip}`, 5, 60 * 60);
  if (!allowed) return NextResponse.json({ error: "Please wait a bit and try again." }, { status: 429 });

  const { error } = await sb.from("contact_messages").insert({ name, email, message, status: "new" });
  if (error) return NextResponse.json({ error: `We couldn't send that just now. Email ${SUPPORT} instead.` }, { status: 500 });

  if (process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL) {
    await sendResendEmail({
      to: SUPPORT,
      replyTo: email,
      kind: "contact",
      subject: `PetPassGo contact from ${name}`.slice(0, 180),
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
  } else {
    console.error("resend_send_failed", { kind: "contact", status: 0, ok: false, id: null, error: "email_not_configured" });
  }

  return NextResponse.json({ ok: true });
}
