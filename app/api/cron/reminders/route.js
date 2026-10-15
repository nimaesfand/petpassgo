import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reminderSchedule, fmt } from "../../../../lib/travelDates";
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
  const { data: trips, error } = await sb.from("trips").select("id,user_id,airline,role,origin,destination,travel_date,paid").eq("paid", true).gte("travel_date", today);
  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });

  let sent = 0;
  for (const trip of trips || []) {
    for (const it of reminderSchedule(trip).filter((x) => x.date === today)) {
      const { error: insErr } = await sb.from("trip_reminders").insert({ trip_id: trip.id, user_id: trip.user_id, kind: it.kind, due_date: it.date });
      if (insErr) continue; // already sent (unique trip_id+kind)
      const { data: u } = await sb.auth.admin.getUserById(trip.user_id);
      const to = u?.user?.email;
      if (!to) continue;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.REMINDER_FROM_EMAIL, to,
          subject: `PetPassGo: ${it.title}`,
          text: `${it.title} (${fmt(it.date)})\n\n${it.body}\n\nYour flight: ${trip.origin} → ${trip.destination}, ${fmt(trip.travel_date)}.\nOpen your checklist: ${SITE_URL}/account`,
        }),
      });
      if (r.ok) { sent++; await sb.from("trip_reminders").update({ sent_at: new Date().toISOString() }).eq("trip_id", trip.id).eq("kind", it.kind); }
      else await sb.from("trip_reminders").delete().eq("trip_id", trip.id).eq("kind", it.kind);
    }
  }
  // Members only: reminders 30 and 7 days before a document's expiry date.
  let docSent = 0;
  const addDays = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const targets = { "30d": addDays(today, 30), "7d": addDays(today, 7) };
  const { data: docs } = await sb.from("documents").select("id,user_id,pet_id,document_type,expires_on").in("expires_on", Object.values(targets));
  const { data: members } = await sb.from("memberships").select("user_id,status,current_period_end").eq("status", "active");
  const memberIds = new Set((members || []).filter((m) => !m.current_period_end || new Date(m.current_period_end) > new Date()).map((m) => m.user_id));
  for (const doc of docs || []) {
    if (!memberIds.has(doc.user_id)) continue;
    const kind = doc.expires_on === targets["7d"] ? "7d" : "30d";
    const { error: insErr } = await sb.from("document_reminders").insert({ document_id: doc.id, user_id: doc.user_id, kind });
    if (insErr) continue; // already sent
    const { data: u } = await sb.auth.admin.getUserById(doc.user_id);
    const to = u?.user?.email;
    if (!to) continue;
    const { data: pet } = await sb.from("pets").select("name").eq("id", doc.pet_id).maybeSingle();
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.REMINDER_FROM_EMAIL, to,
        subject: `PetPassGo: ${pet?.name ? pet.name + "'s " : ""}${doc.document_type} expires ${fmt(doc.expires_on)}`,
        text: `${pet?.name ? pet.name + "'s " : "Your "}${doc.document_type} expires on ${fmt(doc.expires_on)} (in ${kind === "7d" ? "7" : "30"} days).\n\nBook a vet visit if you need a renewal, then upload the new copy: ${SITE_URL}/account`,
      }),
    });
    if (r.ok) { docSent++; await sb.from("document_reminders").update({ sent_at: new Date().toISOString() }).eq("document_id", doc.id).eq("kind", kind); }
    else await sb.from("document_reminders").delete().eq("document_id", doc.id).eq("kind", kind);
  }
  return NextResponse.json({ sent, docSent });
}
