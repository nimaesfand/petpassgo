import { createClient } from "@supabase/supabase-js";

// Email only when the existing email flag and keys are configured (same as reminders).
export function emailConfigured() {
  return (
    process.env.REMINDER_EMAILS_ENABLED === "true" &&
    !!process.env.RESEND_API_KEY &&
    !!process.env.REMINDER_FROM_EMAIL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

function redact(value) {
  return String(value || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .slice(0, 300);
}

// Logs the Resend HTTP result. No API key, message body, or recipient address.
export async function sendResendEmail({ to, subject, text, kind, replyTo }) {
  const label = kind || "email";
  const payload = { from: process.env.REMINDER_FROM_EMAIL, to, subject, text };
  if (replyTo) payload.reply_to = replyTo;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const raw = await r.text();
    let body = null;
    try { body = raw ? JSON.parse(raw) : null; } catch { body = null; }
    const summary = {
      kind: label,
      status: r.status,
      ok: r.ok,
      id: body?.id || null,
      error: r.ok ? null : redact(body?.message || body?.name || body?.error || raw || `HTTP ${r.status}`),
    };
    if (r.ok) console.info("resend_send_ok", { kind: label, status: r.status, id: summary.id });
    else console.error("resend_send_failed", summary);
    return summary;
  } catch (e) {
    const summary = { kind: label, status: 0, ok: false, id: null, error: redact(e?.message || "network error") };
    console.error("resend_send_failed", summary);
    return summary;
  }
}

// Looks up the pet owner's email server-side (never sent to the browser) and emails them.
// A failed send is logged and does not throw. Callers that already saved the message can still succeed.
export async function emailPetOwner(petId, subject, text, kind = "pet_owner") {
  if (!emailConfigured()) {
    const summary = { kind, status: 0, ok: false, id: null, error: "email_not_configured" };
    console.error("resend_send_failed", summary);
    return summary;
  }
  try {
    const sb = serviceClient();
    const { data: pet } = await sb.from("pets").select("user_id,name").eq("id", petId).maybeSingle();
    if (!pet) {
      const summary = { kind, status: 0, ok: false, id: null, error: "pet_not_found" };
      console.error("resend_send_failed", summary);
      return summary;
    }
    const { data: u } = await sb.auth.admin.getUserById(pet.user_id);
    const to = u?.user?.email;
    if (!to) {
      const summary = { kind, status: 0, ok: false, id: null, error: "owner_email_missing" };
      console.error("resend_send_failed", summary);
      return summary;
    }
    return await sendResendEmail({
      to,
      subject: subject.replace("{name}", pet.name),
      text: text.replace(/\{name\}/g, pet.name),
      kind,
    });
  } catch (e) {
    const summary = { kind, status: 0, ok: false, id: null, error: redact(e?.message || "lookup_failed") };
    console.error("resend_send_failed", summary);
    return summary;
  }
}
