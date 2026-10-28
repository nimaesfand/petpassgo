import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendResendEmail, serviceClient } from "../../../lib/serverEmail";

export const dynamic = "force-dynamic";
const OWNER_EMAIL = "nimaesfand@gmail.com";

async function gate(req) {
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return null;
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data: u } = await anon.auth.getUser(token);
  if (!u?.user || (u.user.email || "").toLowerCase() !== OWNER_EMAIL) return null;
  const admin = serviceClient();
  const { data } = await admin.from("admins").select("user_id").eq("user_id", u.user.id).maybeSingle();
  return data ? { user: u.user, admin } : null;
}
async function audit(ctx, target, action, details = {}) { await ctx.admin.from("admin_audit_log").insert({ admin_user_id: ctx.user.id, admin_email: ctx.user.email, target_user_id: target, action, details }); }
async function findUser(admin, email) {
  const q = String(email || "").trim().toLowerCase(); if (!q) return [];
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return (data?.users || []).filter((x) => (x.email || "").toLowerCase().includes(q)).slice(0, 10).map((x) => ({ id: x.id, email: x.email, created_at: x.created_at }));
}
async function customer(admin, id) {
  const { data: u } = await admin.auth.admin.getUserById(id); if (!u?.user) return null;
  const [pets, trips, mem, buys] = await Promise.all([
    admin.from("pets").select("id,name,animal_type,role,breed,microchip_number").eq("user_id", id),
    admin.from("trips").select("id,origin,destination,airline,travel_date,paid,paid_at,created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("memberships").select("*").eq("user_id", id).maybeSingle(),
    admin.from("purchases").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  const mask = (v) => { const s = String(v || "").replace(/[^0-9A-Za-z]/g, ""); return s ? `•••• ${s.slice(-4)}` : null; };
  return { id: u.user.id, email: u.user.email, created_at: u.user.created_at, pets: (pets.data || []).map((p) => ({ ...p, microchip_number: mask(p.microchip_number) })), trips: trips.data || [], membership: mem.data || null, purchases: buys.data || [] };
}

export async function GET(req) {
  const ctx = await gate(req); if (!ctx) return NextResponse.json({ error: "Owner only." }, { status: 403 });
  const url = new URL(req.url); const email = url.searchParams.get("email"); const id = url.searchParams.get("id");
  if (url.searchParams.get("activation")) {
    const [{ data: mems }, { data: pets }, { data: health }, { data: acts }, { data: trips }, { data: posts }] = await Promise.all([
      ctx.admin.from("memberships").select("user_id").eq("status", "active"), ctx.admin.from("pets").select("user_id,photo_url,microchip_number,chip_verified_at"),
      ctx.admin.from("pet_health_records").select("user_id"), ctx.admin.from("pet_activation").select("user_id,qr_done_at"), ctx.admin.from("trips").select("user_id"), ctx.admin.from("community_posts").select("user_id"),
    ]);
    const members = new Set((mems || []).map((x) => x.user_id)); const only = (rows, pred = () => true) => new Set((rows || []).filter((x) => members.has(x.user_id) && pred(x)).map((x) => x.user_id)).size;
    const bonus = new Set([...(trips || []), ...(posts || [])].filter((x) => members.has(x.user_id)).map((x) => x.user_id)).size;
    return NextResponse.json({ members: members.size, steps: { pet_with_photo: only(pets, (x) => !!x.photo_url), chip_checked: only(pets, (x) => !!(x.microchip_number && x.chip_verified_at)), health_record: only(health), qr_downloaded_or_shared: only(acts, (x) => !!x.qr_done_at), trip_or_community: bonus } });
  }
  if (id) { const c = await customer(ctx.admin, id); if (!c) return NextResponse.json({ error: "Customer not found" }, { status: 404 }); await audit(ctx, id, "view_customer", { email: c.email }); return NextResponse.json({ customer: c }); }
  return NextResponse.json({ results: await findUser(ctx.admin, email) });
}

export async function POST(req) {
  const ctx = await gate(req); if (!ctx) return NextResponse.json({ error: "Owner only." }, { status: 403 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const target = String(b?.user_id || ""); if (!target) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    if (b.action === "grant_days") {
      const days = Math.min(3650, Math.max(1, Number(b.days) || 0)); if (!days) return NextResponse.json({ error: "Choose days." }, { status: 400 });
      const { data: m } = await ctx.admin.from("memberships").select("*").eq("user_id", target).maybeSingle();
      const base = m?.current_period_end && new Date(m.current_period_end) > new Date() ? new Date(m.current_period_end) : new Date();
      const end = new Date(base.getTime() + days * 86400000).toISOString();
      const { error } = await ctx.admin.from("memberships").upsert({ user_id: target, status: "active", current_period_end: end, stripe_customer_id: m?.stripe_customer_id || null, stripe_subscription_id: m?.stripe_subscription_id || null, updated_at: new Date().toISOString() });
      if (error) throw error; await audit(ctx, target, "grant_membership_days", { days, previous_period_end: m?.current_period_end || null, new_period_end: end });
      return NextResponse.json({ ok: true, current_period_end: end });
    }
    if (b.action === "trip_paid") {
      const { data: trip } = await ctx.admin.from("trips").select("id,user_id,paid").eq("id", b.trip_id).maybeSingle();
      if (!trip || trip.user_id !== target) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      const paid = !!b.paid; const { error } = await ctx.admin.from("trips").update({ paid, paid_at: paid ? new Date().toISOString() : null }).eq("id", trip.id);
      if (error) throw error; await audit(ctx, target, paid ? "mark_trip_paid" : "mark_trip_unpaid", { trip_id: trip.id, previous_paid: trip.paid });
      return NextResponse.json({ ok: true });
    }
    if (b.action === "help_links") {
      const c = await customer(ctx.admin, target); if (!c) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      const links = ["https://petpassgo.com/login", "https://petpassgo.com/assessment", "https://petpassgo.com/account", "mailto:support@petpassgo.com"];
      let sent = false;
      if (process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL && c.email) {
        const r = await sendResendEmail({ to: c.email, kind: "help_links", subject: "PetPassGo help links", text: `Hi from PetPassGo support,\n\nHere are the links you asked for:\n${links.join("\n")}\n\nIf you still need help, reply to this email.\n\n— PetPassGo` });
        sent = r.ok;
      }
      await audit(ctx, target, "resend_help_links", { sent, email_configured: !!(process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL) });
      return NextResponse.json({ ok: true, sent, links });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) { console.error("admin action", e?.message); return NextResponse.json({ error: "Action failed." }, { status: 500 }); }
}
