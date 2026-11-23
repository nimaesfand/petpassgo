import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { serviceClient, sendResendEmail, emailConfigured } from "../../../lib/serverEmail";
const BUCKET = "pet-documents"; // same bucket as lib/storage
import { SITE_URL } from "../../../lib/site";
import { cleanDraft, validEmail, DRAFT_DAYS } from "../../../lib/passportDraft";
import { PRICES as P } from "../../../lib/pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Save a passport someone made before signing up, and email them the link to keep it.
export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase();
  if (!validEmail(email)) return NextResponse.json({ error: "That email doesn't look right. Please check it." }, { status: 400 });
  const data = cleanDraft(b.data);
  // Keep when and where the service dog promise was signed, for the statement record.
  if (data.service?.attest && data.service.signed_name) {
    data.service.signed_at = new Date().toISOString();
    data.service.ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64) || null;
    data.service.user_agent = (req.headers.get("user-agent") || "").slice(0, 300) || null;
  }
  if (!data.name) return NextResponse.json({ error: "Your pet's name is missing." }, { status: 400 });

  const svc = serviceClient();
  const since = new Date(Date.now() - 864e5).toISOString();
  const { count } = await svc.from("passport_drafts").select("id", { count: "exact", head: true }).ilike("email", email).gte("created_at", since);
  if ((count || 0) >= 5) return NextResponse.json({ error: "You've made a few passports today. Check your email for the links." }, { status: 429 });

  const token = crypto.randomBytes(24).toString("base64url");
  const { data: row, error } = await svc.from("passport_drafts").insert({ token, email, data }).select("id").single();
  if (error || !row) return NextResponse.json({ error: "We couldn't save the passport. Please try again." }, { status: 500 });

  // Photo: a small JPEG made in the browser.
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(String(b.photo || ""));
  if (m) {
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 0 && buf.length <= 2_000_000) {
      const path = `drafts/${row.id}.jpg`;
      const up = await svc.storage.from(BUCKET).upload(path, buf, { contentType: `image/${m[1]}`, upsert: true });
      if (!up.error) await svc.from("passport_drafts").update({ photo_path: path }).eq("id", row.id);
    }
  }

  const link = `${SITE_URL}/passport/keep?t=${token}`;
  const hi = data.handler_name ? `Hi ${data.handler_name.split(" ")[0]},` : "Hi,";
  if (emailConfigured()) {
    await sendResendEmail({
      to: email,
      kind: "passport_draft",
      subject: `${data.name}'s passport is ready`,
      text: [
        hi,
        "",
        `${data.name}'s PetPassGo passport is ready. See it here:`,
        link,
        "",
        `To keep it, start Pet Vault for ${P.member} a month. You also get:`,
        "- Vet Verified records, confirmed by your own vet",
        "- Gate Ready: everything on one screen at the airport",
        "- Reminders before vaccines and documents expire",
        "- A Bring Me Home QR tag for their collar",
        "",
        `We'll hold ${data.name}'s passport for ${DRAFT_DAYS} days.`,
        "",
        "The PetPassGo team",
      ].join("\n"),
    });
  }
  return NextResponse.json({ ok: true, token });
}

// Load a saved passport by its link.
export async function GET(req) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(t)) return NextResponse.json({ error: "This link isn't valid." }, { status: 400 });
  const svc = serviceClient();
  const { data: d } = await svc.from("passport_drafts").select("id,email,data,photo_path,created_at,expires_at,claimed_at,claimed_pet_id").eq("token", t).maybeSingle();
  if (!d) return NextResponse.json({ error: "We couldn't find this passport." }, { status: 404 });
  const expired = !d.claimed_at && new Date(d.expires_at) < new Date();
  let photo = null;
  if (d.photo_path && !expired) {
    const s = await svc.storage.from(BUCKET).createSignedUrl(d.photo_path, 3600);
    photo = s.data?.signedUrl || null;
  }
  const pub = d.data?.service ? { ...d.data, service: { ...d.data.service, ip: undefined, user_agent: undefined } } : d.data;
  return NextResponse.json({ data: pub, email: d.email, photo, created_at: d.created_at, expires_at: d.expires_at, expired, claimed: !!d.claimed_at, pet_id: d.claimed_pet_id });
}
