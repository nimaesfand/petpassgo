import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Stores a "talk to a person" request. Table + insert-only policy:
// supabase/support_requests.sql (anon can insert, nobody can read via the API).
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const email = String(body?.email || "").trim().slice(0, 200);
  const message = String(body?.message || "").trim().slice(0, 2000);
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  const transcript = Array.isArray(body?.transcript) ? body.transcript.slice(-10).map((m) => `${m.role}: ${String(m.content).slice(0, 500)}`).join("\n") : "";

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.from("support_requests").insert({ email, message, transcript, source: "chat" });
  if (error) return NextResponse.json({ error: "Couldn't send right now. Please try again later." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
