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
  return NextResponse.json({ sent });
}
