import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Stores private owner feedback. Optionally emails support@ only when Resend is configured.
// Feedback is never published automatically.
export async function POST(req) {
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const kind = b?.kind === "post_trip" ? "post_trip" : "purchase";
  const rating = Number(b?.rating);
  const comment = typeof b?.comment === "string" ? b.comment.trim().slice(0, 2000) : "";
  const tripId = typeof b?.trip_id === "string" ? b.trip_id : null;
  const ref = typeof b?.ref === "string" ? b.ref.slice(0, 120) : tripId || "account";
  if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Please choose a rating." }, { status: 400 });
  const { error } = await sb.from("feedback").insert({ user_id: u.user.id, kind, trip_id: tripId, ref, rating, comment: comment || null });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: "Couldn't save feedback. Please try again." }, { status: 500 });
  }
  if (process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL) {
    try {
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.REMINDER_FROM_EMAIL, to: "support@petpassgo.com", subject: `PetPassGo feedback (${kind}) — ${rating}/5`, text: `New private feedback from account ${u.user.email || u.user.id}\nKind: ${kind}\nRating: ${rating}/5\n${comment ? `Comment: ${comment}\n` : ""}\nStored in the feedback table. Not published.` }) });
    } catch {}
  }
  return NextResponse.json({ ok: true });
}
