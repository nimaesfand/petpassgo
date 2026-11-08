import { NextResponse } from "next/server";
import { sendResendEmail } from "../../../../lib/serverEmail";
import { adminGate } from "../../../../lib/adminGate";
import { SITE_URL } from "../../../../lib/site";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const ctx = await adminGate(req);
  if (!ctx) return NextResponse.json({ error: "Owner only." }, { status: 403 });
  const status = new URL(req.url).searchParams.get("status") || "pending";
  const { data, error } = await ctx.admin.from("businesses").select("*").eq("status", status).order("updated_at", { ascending: true }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = [...new Set((data || []).map((b) => b.owner_user_id).filter(Boolean))];
  const emails = {};
  for (const id of ids) { const { data: u } = await ctx.admin.auth.admin.getUserById(id); emails[id] = u?.user?.email || null; }
  const { data: counts } = await ctx.admin.from("businesses").select("status");
  const tally = {}; for (const r of counts || []) tally[r.status] = (tally[r.status] || 0) + 1;
  return NextResponse.json({ businesses: (data || []).map((b) => ({ ...b, owner_email: emails[b.owner_user_id] || null })), counts: tally });
}

export async function POST(req) {
  const ctx = await adminGate(req);
  if (!ctx) return NextResponse.json({ error: "Owner only." }, { status: 403 });
  const { id, action, note, plan } = await req.json().catch(() => ({}));
  const { data: b } = await ctx.admin.from("businesses").select("id,name,slug,owner_user_id,status").eq("id", id).maybeSingle();
  if (!b) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const now = new Date().toISOString();
  let patch;
  if (action === "approve") patch = { status: "published", checked_by_petpassgo_at: now, published_at: now, review_note: null };
  else if (action === "changes") { if (!String(note || "").trim()) return NextResponse.json({ error: "Write what needs changing." }, { status: 400 }); patch = { status: "changes_requested", review_note: String(note).trim().slice(0, 600) }; }
  else if (action === "reject") patch = { status: "rejected", review_note: String(note || "").trim().slice(0, 600) || null };
  else if (action === "unpublish") patch = { status: "pending" };
  else if (action === "plan" && ["free", "featured", "premium"].includes(plan)) patch = { plan };
  else return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  const { error } = await ctx.admin.from("businesses").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await ctx.admin.from("admin_audit_log").insert({ admin_user_id: ctx.user.id, admin_email: ctx.user.email, target_user_id: b.owner_user_id || ctx.user.id, action: `business_${action}`, details: { business_id: id, note: note || null, plan: plan || null } }).then(() => {}, () => {});

  if (b.owner_user_id && ["approve", "changes", "reject"].includes(action)) {
    const { data: u } = await ctx.admin.auth.admin.getUserById(b.owner_user_id);
    const to = u?.user?.email;
    if (to) {
      const subject = action === "approve" ? `${b.name} is live on PetPassGo Discover` : action === "changes" ? `One change needed for ${b.name}` : `About your PetPassGo listing for ${b.name}`;
      const text = action === "approve"
        ? `Good news: your listing is live.\n\nSee it here: ${SITE_URL}/discover/${b.slug}\n\nYou can update it any time from your dashboard: ${SITE_URL}/business/dashboard\n\nThe PetPassGo team`
        : action === "changes"
          ? `Thanks for listing ${b.name}. Before it goes live, please make this change:\n\n${patch.review_note}\n\nEdit your listing here: ${SITE_URL}/business/listing?id=${b.id}\n\nThe PetPassGo team`
          : `Thanks for your interest in PetPassGo Discover. We weren't able to approve the listing for ${b.name}.${patch.review_note ? `\n\n${patch.review_note}` : ""}\n\nReply to this email if you have questions.\n\nThe PetPassGo team`;
      await sendResendEmail({ to, subject, text, kind: `business_${action}`, replyTo: "support@petpassgo.com" });
    }
  }
  return NextResponse.json({ ok: true });
}
