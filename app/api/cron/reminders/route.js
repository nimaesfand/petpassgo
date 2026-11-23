import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reminderSchedule, fmt, flightPhrase, daysUntil } from "../../../../lib/travelDates";
import { sendResendEmail, emailPetOwner } from "../../../../lib/serverEmail";
import { vetRequestEmail } from "../../../../lib/vetVerifyEmail";
import { hashToken, newToken } from "../../../../lib/ppgSign";
import { SITE_URL } from "../../../../lib/site";

export const dynamic = "force-dynamic";

// Daily (vercel.json). Emails go out only when REMINDER_EMAILS_ENABLED=true and
// RESEND_API_KEY, REMINDER_FROM_EMAIL, SUPABASE_SERVICE_ROLE_KEY and CRON_SECRET are set.
export async function GET(req) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const needed = ["SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "REMINDER_FROM_EMAIL"].filter((k) => !process.env[k]);
  if (process.env.REMINDER_EMAILS_ENABLED !== "true" || needed.length)
    return NextResponse.json({ skipped: true, reason: "Reminder emails are disabled or not configured.", missing: needed });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  let { data: trips, error } = await sb.from("trips").select("id,user_id,airline,role,origin,destination,travel_date,return_date,paid").eq("paid", true).or(`travel_date.gte.${today},return_date.gte.${today}`);
  if (error) {
    // Before the return_date column exists, keep sending outbound reminders.
    const fallback = await sb.from("trips").select("id,user_id,airline,role,origin,destination,travel_date,paid").eq("paid", true).gte("travel_date", today);
    trips = fallback.data;
    error = fallback.error;
  }
  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });

  let sent = 0;
  for (const trip of trips || []) {
    for (const it of reminderSchedule(trip, today).filter((x) => x.date === today)) {
      const { error: insErr } = await sb.from("trip_reminders").insert({ trip_id: trip.id, user_id: trip.user_id, kind: it.kind, due_date: it.date });
      if (insErr) continue; // already sent (unique trip_id+kind)
      const { data: u } = await sb.auth.admin.getUserById(trip.user_id);
      const to = u?.user?.email;
      if (!to) continue;
      const r = await sendResendEmail({
        to,
        kind: "trip_reminder",
        subject: `PetPassGo: ${it.title}`,
        text: `${it.title} (${fmt(it.date)})\n\n${flightPhrase(daysUntil(it.leg === "return" ? trip.return_date : trip.travel_date, today)) || "Your flight"} — ${it.body}\n\nYour flight: ${trip.origin} → ${trip.destination}, ${fmt(trip.travel_date)}.${trip.return_date ? `\nReturn: ${fmt(trip.return_date)}.` : ""}\nOpen your checklist: ${SITE_URL}/account`,
      });
      if (r.ok) { sent++; await sb.from("trip_reminders").update({ sent_at: new Date().toISOString() }).eq("trip_id", trip.id).eq("kind", it.kind); }
      else await sb.from("trip_reminders").delete().eq("trip_id", trip.id).eq("kind", it.kind);
    }
  }
  // Document expiry: one email 30 days before, and one 7 days before. Transactional.
  // Marketing opt-in does not gate these. A document_reminders = false row does.
  let docSent = 0;
  const addDays = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const targets = { "30d": addDays(today, 30), "7d": addDays(today, 7) };
  const { data: docs } = await sb.from("documents").select("id,user_id,pet_id,document_type,expires_on").in("expires_on", Object.values(targets));
  const userIds = [...new Set((docs || []).map((d) => d.user_id).filter(Boolean))];
  let optedOut = new Set();
  if (userIds.length) {
    const prefs = await sb.from("user_marketing").select("user_id,document_reminders").in("user_id", userIds);
    if (!prefs.error) optedOut = new Set((prefs.data || []).filter((r) => r.document_reminders === false).map((r) => r.user_id));
  }
  for (const doc of docs || []) {
    if (optedOut.has(doc.user_id)) continue;
    const kind = doc.expires_on === targets["7d"] ? "7d" : "30d";
    const { error: insErr } = await sb.from("document_reminders").insert({ document_id: doc.id, user_id: doc.user_id, kind });
    if (insErr) continue; // already sent
    const { data: u } = await sb.auth.admin.getUserById(doc.user_id);
    const to = u?.user?.email;
    if (!to) continue;
    const { data: pet } = await sb.from("pets").select("name").eq("id", doc.pet_id).maybeSingle();
    const r = await sendResendEmail({
      to,
      kind: "document_reminder",
      subject: `PetPassGo: ${pet?.name ? pet.name + "'s " : ""}${doc.document_type} expires ${fmt(doc.expires_on)}`,
      text: `${pet?.name ? pet.name + "'s " : "Your "}${doc.document_type} expires on ${fmt(doc.expires_on)} (in ${kind === "7d" ? "7" : "30"} days).\n\nBook a vet visit if you need a renewal, then upload the new copy: ${SITE_URL}/account`,
    });
    if (r.ok) { docSent++; await sb.from("document_reminders").update({ sent_at: new Date().toISOString() }).eq("document_id", doc.id).eq("kind", kind); }
    else await sb.from("document_reminders").delete().eq("document_id", doc.id).eq("kind", kind);
  }
  // Vet requests: remind the vet once after 3 days, and tell the owner if the link ran out.
  let vetReminded = 0, vetExpired = 0;
  const nowIso = new Date().toISOString();
  const { data: open } = await sb.from("vet_verifications").select("id,pet_id,user_id,vet_email,created_at,expires_at,reminded_at,owner_notified_at").is("used_at", null).gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString());
  for (const v of open || []) {
    const expired = v.expires_at < nowIso;
    if (!expired && !v.reminded_at && Date.now() - new Date(v.created_at).getTime() > 3 * 864e5) {
      const { data: pet } = await sb.from("pets").select("name,animal_type,breed,handler_name").eq("id", v.pet_id).maybeSingle();
      if (!pet) continue;
      const token = newToken();
      const { error: upErr } = await sb.from("vet_verifications").update({ token_hash: hashToken(token), reminded_at: nowIso }).eq("id", v.id).is("reminded_at", null);
      if (upErr) continue;
      const { data: u } = await sb.auth.admin.getUserById(v.user_id);
      const mail = vetRequestEmail({ owner: pet.handler_name, pet, token, reminder: true });
      const r = await sendResendEmail({ to: v.vet_email, replyTo: u?.user?.email || undefined, kind: "vet_verify_reminder", subject: mail.subject, text: mail.text });
      if (r.ok) vetReminded++;
    } else if (expired && !v.owner_notified_at) {
      await sb.from("vet_verifications").update({ owner_notified_at: nowIso }).eq("id", v.id);
      await emailPetOwner(v.pet_id, "PetPassGo: your vet didn't confirm {name}'s records", `We sent your vet clinic (${v.vet_email}) a link and a reminder, but they didn't confirm {name}'s records, and the link has now expired.\n\nYou can:\n- Call the clinic and ask them to look for an email from PetPassGo, then send it again from Pet Vault.\n- Try a different email for the clinic.\n- Ask the clinic to email you their records as a PDF, and upload it under Documents.\n\n${SITE_URL}/account`, "vet_verify_expired");
      vetExpired++;
    }
  }
  const renewals = await membershipNotices(sb, today);
  return NextResponse.json({ sent, docSent, vetReminded, vetExpired, renewals });
}

// Pet Vault renewal reminders: 3 days before the first renewal, then once a year.
// Each is sent once per member (membership_notices is unique on user_id + kind).
async function membershipNotices(sb, today) {
  const { data: rows } = await sb.from("memberships").select("user_id,status,current_period_end,stripe_subscription_id").eq("status", "active").not("stripe_subscription_id", "is", null);
  let n = 0;
  const day = 864e5;
  for (const m of rows || []) {
    if (!m.current_period_end) continue;
    const renew = new Date(m.current_period_end);
    const daysLeft = Math.round((new Date(renew.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" })) - new Date(today)) / day);
    const { data: first } = await sb.from("membership_notices").select("created_at").eq("user_id", m.user_id).eq("kind", "first_renewal").maybeSingle();
    let kind = "";
    if (!first && daysLeft >= 0 && daysLeft <= 3) kind = "first_renewal";
    else if (first) {
      const years = Math.floor((Date.now() - new Date(first.created_at).getTime()) / (365 * day));
      if (years >= 1) kind = `annual_${years}`;
    }
    if (!kind) continue;
    const { error: insErr } = await sb.from("membership_notices").insert({ user_id: m.user_id, kind });
    if (insErr) continue; // already sent
    const { data: u } = await sb.auth.admin.getUserById(m.user_id);
    const to = u?.user?.email;
    if (!to) continue;
    const when = renew.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });
    const yearly = kind !== "first_renewal";
    const r = await sendResendEmail({
      to,
      kind: yearly ? "membership_annual" : "membership_first_renewal",
      subject: yearly ? "Your Pet Vault membership: a yearly reminder" : `Pet Vault renews on ${when}`,
      text: [
        "Hi,",
        "",
        yearly
          ? "A yearly reminder about your Pet Vault membership."
          : `Your Pet Vault membership renews on ${when}.`,
        "",
        `Pet Vault is $6.99 USD a month and renews every month until you cancel.${yearly ? ` Your next renewal is ${when}.` : ""}`,
        "It keeps your pet's passport, records, reminders and travel mode, and fills in the DOT form for service dogs.",
        "",
        `To cancel, open your account and choose Cancel. No phone call, and you keep access through the month you've paid: ${SITE_URL}/account?tab=billing`,
        "",
        "PetPassGo",
      ].join("\n"),
    }).catch(() => null);
    if (r !== null) n++;
  }
  return n;
}
