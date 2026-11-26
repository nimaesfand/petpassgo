import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { requireUser, vaultIsOpen } from "../../../lib/paidUser";
import { emailConfigured, sendResendEmail } from "../../../lib/serverEmail";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clean = (v, n) => String(v || "").replace(/\s+/g, " ").trim().slice(0, n);

// GET: the member's own review (to show its status or edit it).
export async function GET(req) {
  const { user, sb } = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { data } = await sb.from("reviews").select("display_name,rating,body,status,updated_at").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ review: data || null });
}

// POST { rating, body, display_name }: one review per Pet Vault member. Saved as pending;
// it only shows on /reviews after Nima approves it from the email.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Reviews are for Pet Vault members." }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const rating = Math.round(Number(b.rating));
  const body = String(b.body || "").trim().slice(0, 1500);
  const display_name = clean(b.display_name, 40);
  if (!(rating >= 1 && rating <= 5)) return NextResponse.json({ error: "Please choose 1 to 5 stars." }, { status: 400 });
  if (body.length < 10) return NextResponse.json({ error: "Please write a few words (at least 10 characters)." }, { status: 400 });
  if (!display_name) return NextResponse.json({ error: "Please add the name to show." }, { status: 400 });

  const token = randomBytes(24).toString("base64url");
  const row = { user_id: user.id, rating, body, display_name, status: "pending", approved_at: null, mod_token_hash: createHash("sha256").update(token).digest("hex"), updated_at: new Date().toISOString() };
  const { data, error } = await sb.from("reviews").upsert(row, { onConflict: "user_id" }).select("id").single();
  if (error) return NextResponse.json({ error: "Couldn't save your review. Please try again." }, { status: 500 });

  if (emailConfigured()) {
    const link = (a) => `${SITE_URL}/api/reviews/moderate?id=${data.id}&t=${token}&a=${a}`;
    await sendResendEmail({
      to: "support@petpassgo.com",
      kind: "review_moderation",
      subject: `New review to approve: ${"★".repeat(rating)}${"☆".repeat(5 - rating)} from ${display_name}`,
      text: `A Pet Vault member left a review. It's hidden until you approve it.\n\nName shown: ${display_name}\nStars: ${rating}/5\n\n"${body}"\n\nApprove: ${link("approve")}\nReject: ${link("reject")}\n\nPlease don't reject a review only because it's negative. Reject spam, abuse, private info, or reviews that aren't about PetPassGo.`,
    });
  }
  return NextResponse.json({ ok: true, status: "pending" });
}
