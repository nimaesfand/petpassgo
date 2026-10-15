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

// Looks up the pet owner's email server-side (never sent to the browser) and emails them.
export async function emailPetOwner(petId, subject, text) {
  if (!emailConfigured()) return false;
  try {
    const sb = serviceClient();
    const { data: pet } = await sb.from("pets").select("user_id,name").eq("id", petId).maybeSingle();
    if (!pet) return false;
    const { data: u } = await sb.auth.admin.getUserById(pet.user_id);
    const to = u?.user?.email;
    if (!to) return false;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.REMINDER_FROM_EMAIL, to, subject: subject.replace("{name}", pet.name), text: text.replace(/\{name\}/g, pet.name) }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
