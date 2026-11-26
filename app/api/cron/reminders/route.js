import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reminderSchedule, fmt, flightPhrase, daysUntil } from "../../../../lib/travelDates";
import { sendResendEmail, emailPetOwner } from "../../../../lib/serverEmail";
import { vetRequestEmail } from "../../../../lib/vetVerifyEmail";
import { hashToken, newToken } from "../../../../lib/ppgSign";
import { SITE_URL } from "../../../../lib/site";
import { brandedEmail, petPhotoAttachment } from "../../../../lib/emailHtml";
import { syncAllWalletPasses } from "../../../../lib/walletSync";

export const dynamic = "force-dynamic";

// Daily (vercel.json). Emails go out only when REMINDER_EMAILS_ENABLED=true and
// RESEND_API_KEY, REMINDER_FROM_EMAIL, SUPABASE_SERVICE_ROLE_KEY and CRON_SECRET are set.
export async function GET(req) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Wallet passes that changed (shots, statement, photo) get their update push, even if emails are off.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) await syncAllWalletPasses(createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })).catch(() => 0);
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
      const { data: pet } = await sb.from("pets").select("name,animal_type,breed,role,passport_no,photo_url,handler_name").eq("id", v.pet_id).maybeSingle();
      if (!pet) continue;
      const token = newToken();
      const { error: upErr } = await sb.from("vet_verifications").update({ token_hash: hashToken(token), reminded_at: nowIso }).eq("id", v.id).is("reminded_at", null);
      if (upErr) continue;
      const { data: u } = await sb.auth.admin.getUserById(v.user_id);
      const photo = await petPhotoAttachment(sb, pet);
      const mail = vetRequestEmail({ owner: pet.handler_name, pet, token, reminder: true, photoCid: photo ? "petphoto" : null });
      const r = await sendResendEmail({ to: v.vet_email, replyTo: u?.user?.email || undefined, kind: "vet_verify_reminder", subject: mail.subject, text: mail.text, html: mail.html, attachments: photo ? [photo] : undefined });
      if (r.ok) vetReminded++;
    } else if (expired && !v.owner_notified_at) {
      await sb.from("vet_verifications").update({ owner_notified_at: nowIso }).eq("id", v.id);
      await emailPetOwner(v.pet_id, "PetPassGo: your vet didn't confirm {name}'s records", `We sent your vet clinic (${v.vet_email}) a link and a reminder, but they didn't confirm {name}'s records, and the link has now expired.\n\nYou can:\n- Call the clinic and ask them to look for an email from PetPassGo, then send it again from Pet Vault.\n- Try a different email for the clinic.\n- Ask the clinic to email you their records as a PDF, and upload it under Documents.\n\n${SITE_URL}/account`, "vet_verify_expired");
      vetExpired++;
    }
  }
  const letters = await letterReminders(sb, today, targets["30d"], optedOut);
  const life = await lifeReminders(sb, today, addDays);
  const renewals = await membershipNotices(sb, today);
  return NextResponse.json({ sent, docSent, vetReminded, vetExpired, letters, life, renewals });
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

// Letters (ESA / service dog): one email about a month before the letter expires.
// The email never includes the letter or the provider's details.
async function letterReminders(sb, today, in30, optedOut) {
  const { data: rows, error } = await sb.from("pet_letters").select("id,user_id,pet_id,kind,expires_on").is("reminder_sent_at", null).gte("expires_on", today).lte("expires_on", in30);
  if (error) return 0;
  let n = 0;
  for (const l of rows || []) {
    if (optedOut?.has(l.user_id)) continue;
    { const { data: mk } = await sb.from("user_marketing").select("document_reminders").eq("user_id", l.user_id).maybeSingle(); if (mk?.document_reminders === false) continue; }
    const { data: claimed } = await sb.from("pet_letters").update({ reminder_sent_at: new Date().toISOString() }).eq("id", l.id).is("reminder_sent_at", null).select("id");
    if (!claimed?.length) continue;
    const { data: u } = await sb.auth.admin.getUserById(l.user_id);
    const to = u?.user?.email;
    if (!to) continue;
    const { data: pet } = await sb.from("pets").select("name").eq("id", l.pet_id).maybeSingle();
    const what = l.kind === "esa_housing" ? "housing letter" : l.kind === "service_travel" ? "travel letter" : "housing letter";
    const r = await sendResendEmail({
      to,
      kind: "letter_reminder",
      subject: `PetPassGo: ${pet?.name ? pet.name + "'s " : "your "}${what} expires ${fmt(l.expires_on)}`,
      text: `${pet?.name ? pet.name + "'s " : "Your "}${what} expires on ${fmt(l.expires_on)}.\n\nIf you need a new one, reach out to your provider now so you're never caught without one when a lease comes up. When you have it, add it to your Vault: ${SITE_URL}/account`,
    });
    if (r.ok) n++;
    else await sb.from("pet_letters").update({ reminder_sent_at: null }).eq("id", l.id);
  }
  return n;
}

// Reminders around real life: vaccines typed into the Vault (30 days before they
// expire), the next grooming/daycare/boarding visit (4 days before, so records
// arrive before the place's cutoff), and an ESA lease renewal (30 days before).
// Each is sent once. Honors the document-reminder opt-out.
async function lifeReminders(sb, today, addDays) {
  const out = { vaccines: 0, visits: 0, leases: 0 };
  const optOut = new Map();
  const optedOutUser = async (uid) => {
    if (!optOut.has(uid)) {
      const { data } = await sb.from("user_marketing").select("document_reminders").eq("user_id", uid).maybeSingle();
      optOut.set(uid, data?.document_reminders === false);
    }
    return optOut.get(uid);
  };
  const ownerEmail = async (uid) => (await sb.auth.admin.getUserById(uid))?.data?.user?.email || null;
  const petsById = new Map();
  const petOf = async (id) => {
    if (!petsById.has(id)) {
      const { data } = await sb.from("pets").select("id,name,breed,animal_type,role,passport_no").eq("id", id).maybeSingle();
      petsById.set(id, data);
    }
    return petsById.get(id);
  };
  const VISIT = { grooming: "grooming", daycare: "daycare", boarding: "boarding stay", training: "training", vet: "vet visit" };

  // 1) Vaccines and medications typed into the Vault
  const in30 = addDays(today, 30);
  const { data: recs } = await sb.from("pet_health_records").select("id,user_id,pet_id,kind,name,expires_on").in("kind", ["vaccine", "medication"]).is("reminder_sent_at", null).gte("expires_on", today).lte("expires_on", in30);
  for (const r of recs || []) {
    if (await optedOutUser(r.user_id)) continue;
    const { data: claimed } = await sb.from("pet_health_records").update({ reminder_sent_at: new Date().toISOString() }).eq("id", r.id).is("reminder_sent_at", null).select("id");
    if (!claimed?.length) continue;
    const to = await ownerEmail(r.user_id);
    const pet = await petOf(r.pet_id);
    if (!to || !pet) continue;
    const res = await sendResendEmail({
      to, kind: "vaccine_reminder",
      subject: `${pet.name}'s ${r.name} is due ${fmt(r.expires_on)}`,
      text: `${pet.name}'s ${r.name} is due on ${fmt(r.expires_on)}.\n\nBook it with your vet now so groomers, daycare, boarding and airlines see it's current. When you have the new date, update it in Pet Vault: ${SITE_URL}/account`,
      html: brandedEmail({ eyebrow: "COMING UP", title: `${pet.name}'s ${r.name} is due ${fmt(r.expires_on)}`, intro: ["Book it with your vet now, so groomers, daycare, boarding and airlines all see it's current.", "When you have the new date, update it in Pet Vault and you're set."], pet, button: { label: "Open Pet Vault", href: `${SITE_URL}/account` } }),
    });
    if (res.ok) out.vaccines++;
    else await sb.from("pet_health_records").update({ reminder_sent_at: null }).eq("id", r.id);
  }

  // 2) Next grooming / daycare / boarding visit: 4 days before
  const in4 = addDays(today, 4);
  const { data: visits } = await sb.from("pets").select("id,user_id,name,breed,animal_type,role,passport_no,next_visit_kind,next_visit_date,next_visit_place").is("next_visit_reminded_at", null).gte("next_visit_date", today).lte("next_visit_date", in4);
  for (const p of visits || []) {
    if (await optedOutUser(p.user_id)) continue;
    const { data: claimed } = await sb.from("pets").update({ next_visit_reminded_at: new Date().toISOString() }).eq("id", p.id).is("next_visit_reminded_at", null).select("id");
    if (!claimed?.length) continue;
    const to = await ownerEmail(p.user_id);
    if (!to) continue;
    const what = VISIT[p.next_visit_kind] || "visit";
    const where = p.next_visit_place ? ` at ${p.next_visit_place}` : "";
    const res = await sendResendEmail({
      to, kind: "visit_reminder",
      subject: `${p.name}'s ${what} is ${fmt(p.next_visit_date)}: send their records now`,
      text: `${p.name}'s ${what}${where} is on ${fmt(p.next_visit_date)}.\n\nMany places want proof of vaccines a few days ahead. Send ${p.name}'s records in one tap: ${SITE_URL}/account`,
      html: brandedEmail({ eyebrow: "COMING UP", title: `${p.name}'s ${what} is ${fmt(p.next_visit_date)}`, intro: [`Many places want proof of vaccines a few days ahead. Send ${p.name}'s records now${where ? ` to ${p.next_visit_place}` : ""}, and you're all set.`], pet: p, button: { label: "Share records", href: `${SITE_URL}/account` } }),
    });
    if (res.ok) out.visits++;
    else await sb.from("pets").update({ next_visit_reminded_at: null }).eq("id", p.id);
  }

  // 3) ESA lease renewal: 30 days before
  const { data: leases } = await sb.from("pets").select("id,user_id,name,breed,animal_type,role,passport_no,lease_renewal_date").is("lease_reminded_at", null).gte("lease_renewal_date", today).lte("lease_renewal_date", in30);
  for (const p of leases || []) {
    if (await optedOutUser(p.user_id)) continue;
    const { data: claimed } = await sb.from("pets").update({ lease_reminded_at: new Date().toISOString() }).eq("id", p.id).is("lease_reminded_at", null).select("id");
    if (!claimed?.length) continue;
    const to = await ownerEmail(p.user_id);
    if (!to) continue;
    const { data: letter } = await sb.from("pet_letters").select("expires_on,provider_name").eq("pet_id", p.id).order("expires_on", { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
    const letterLine = letter?.expires_on ? ` Your housing letter is valid until ${fmt(letter.expires_on)}.` : "";
    const res = await sendResendEmail({
      to, kind: "lease_reminder",
      subject: `Your lease renews ${fmt(p.lease_renewal_date)}: is ${p.name}'s letter ready?`,
      text: `Your lease renews on ${fmt(p.lease_renewal_date)}.${letterLine}\n\nIf your landlord asks, your letter and your provider's contact details are in Pet Vault: ${SITE_URL}/account`,
      html: brandedEmail({ eyebrow: "COMING UP", title: `Your lease renews ${fmt(p.lease_renewal_date)}`, intro: [`If your landlord asks about ${p.name}, you're ready.${letterLine}`, letter?.provider_name ? `Need a new letter? ${letter.provider_name}'s contact details are saved with it.` : "Your letter and your provider's contact details are in Pet Vault."], pet: p, button: { label: "Open Pet Vault", href: `${SITE_URL}/account` } }),
    });
    if (res.ok) out.leases++;
    else await sb.from("pets").update({ lease_reminded_at: null }).eq("id", p.id);
  }
  return out;
}
