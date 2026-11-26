import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { serviceClient } from "@/lib/stripeServer";
import { userIdByEmail } from "@/lib/guestCheckout";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Team test accounts (Nima, Nov 25). Only emails on the comp_emails list.
// Creates the account with no password, then emails a "set your password" link to
// that inbox, so only the person who owns the inbox can sign in. The comp_on_signup
// trigger makes it an active Pet Vault member. No Stripe, no payment.
async function handle(email) {
  email = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter an email." }, { status: 400 });
  const sb = serviceClient();
  const { data: listed } = await sb.from("comp_emails").select("email").ilike("email", email).maybeSingle();
  if (!listed) return NextResponse.json({ error: "Not on the team list." }, { status: 403 });

  let uid = await userIdByEmail(sb, email);
  if (!uid) {
    const { data, error } = await sb.auth.admin.createUser({ email, email_confirm: true, user_metadata: { first_name: "Team" } });
    if (error) return NextResponse.json({ error: "Couldn't create the account." }, { status: 500 });
    uid = data.user.id;
  }
  // Make sure the membership is there even if the account already existed.
  await sb.from("memberships").upsert({ user_id: uid, status: "active", current_period_end: null }, { onConflict: "user_id" });

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await anon.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/login` });
  return NextResponse.json({ ok: true, sent: "A set-your-password link was emailed to that inbox." });
}

export async function GET(req) { return handle(new URL(req.url).searchParams.get("email")); }
export async function POST(req) { const b = await req.json().catch(() => ({})); return handle(b.email); }
