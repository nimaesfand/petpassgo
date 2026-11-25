import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { emailConfigured, sendResendEmail, serviceClient } from "../../../lib/serverEmail";
import { brandedEmail, esc } from "../../../lib/emailHtml";
import { aiProvider } from "../../../lib/aiProvider";
import { inboundDomain } from "../../../lib/petInbox";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Resend "email.received" webhook for pet inbox addresses (milo-xxxx@in.petpassgo.com).
// We read the email, pull out vaccine dates as suggestions, keep the attached files,
// and ask the owner to confirm. Nothing is added to the Vault without that tap.

function verified(raw, headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET || "";
  const id = headers.get("svix-id"), ts = headers.get("svix-timestamp"), sigs = headers.get("svix-signature");
  if (!secret || !id || !ts || !sigs) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${raw}`).digest();
  return sigs.split(" ").some((s) => {
    const [, b64] = s.split(",");
    if (!b64) return false;
    const got = Buffer.from(b64, "base64");
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

const resend = (path) => fetch(`https://api.resend.com${path}`, { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
const iso = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const clip = (v, n) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
const strip = (html) => String(html || "").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");

const PROMPT = `You read an email a veterinary clinic (or groomer, daycare, boarding) sent about a pet. Return ONLY JSON:
{"summary": one short plain sentence of what the email is about, "vaccines": [{"name": string, "date_given": "YYYY-MM-DD"|null, "due_date": "YYYY-MM-DD"|null}]}
Only include vaccines or medications the email clearly names. A "due" or "expires" date goes in due_date. Never guess a date; use null when unsure. No other health details.`;

async function readItems(req, subject, text) {
  const p = aiProvider(req, "LETTER_SCAN_MODEL");
  if (!p || !text) return { summary: null, vaccines: [] };
  const r = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: p.model, temperature: 0, max_tokens: 500, response_format: { type: "json_object" }, messages: [{ role: "system", content: PROMPT }, { role: "user", content: `Subject: ${subject}\n\n${text.slice(0, 12000)}` }] }),
  }).catch(() => null);
  if (!r?.ok) return { summary: null, vaccines: [] };
  try {
    const out = JSON.parse((await r.json())?.choices?.[0]?.message?.content || "{}");
    const vaccines = (Array.isArray(out.vaccines) ? out.vaccines : []).slice(0, 12).map((v) => ({ name: clip(v?.name, 80), date_given: iso(v?.date_given), due_date: iso(v?.due_date) })).filter((v) => v.name);
    return { summary: clip(out.summary, 240), vaccines };
  } catch {
    return { summary: null, vaccines: [] };
  }
}

export async function POST(req) {
  const raw = await req.text();
  if (!verified(raw, req.headers)) return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  let event;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }
  if (event?.type !== "email.received" || !event?.data?.email_id) return NextResponse.json({ ok: true });
  const domain = inboundDomain();
  if (!domain) return NextResponse.json({ ok: true });

  const d = event.data;
  const keys = [...(d.to || []), ...(d.received_for || [])]
    .map((a) => String(a).toLowerCase().match(/([a-z0-9-]+)@([a-z0-9.-]+)/))
    .filter((m) => m && m[2] === domain).map((m) => m[1]);
  if (!keys.length) return NextResponse.json({ ok: true });
  const sb = serviceClient();
  const { data: pet } = await sb.from("pets").select("id,user_id,name,breed,animal_type,role,passport_no").in("inbox_key", [...new Set(keys)]).limit(1).maybeSingle();
  if (!pet) return NextResponse.json({ ok: true });

  // Already handled (webhooks can retry)?
  const { data: dup } = await sb.from("pet_notices").select("id").eq("email_id", d.email_id).maybeSingle();
  if (dup) return NextResponse.json({ ok: true });

  const full = await resend(`/emails/receiving/${encodeURIComponent(d.email_id)}`);
  const subject = clip(full?.subject || d.subject, 200) || "(no subject)";
  const fromRaw = String(full?.from || d.from || "");
  const fromEmail = (fromRaw.match(/[^\s<>"]+@[^\s<>"]+/) || [""])[0].toLowerCase();
  const fromName = clip(fromRaw.replace(/<[^>]+>/, "").replace(/"/g, ""), 80) || fromEmail;
  const text = String(full?.text || strip(full?.html) || "");
  const { summary, vaccines } = await readItems(req, subject, text);

  // Keep attached files (PDF / images) so the owner can add them with one tap.
  const files = [];
  const atts = Array.isArray(full?.attachments) ? full.attachments : Array.isArray(d.attachments) ? d.attachments : [];
  for (const a of atts.slice(0, 5)) {
    const type = String(a.content_type || "");
    if (!/pdf|jpe?g|png|heic|heif/i.test(type) || a.content_disposition === "inline") continue;
    const meta = await resend(`/emails/receiving/${encodeURIComponent(d.email_id)}/attachments/${encodeURIComponent(a.id)}`);
    const url = meta?.download_url;
    if (!url) continue;
    const bin = await fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    if (!bin || bin.byteLength > 10 * 1024 * 1024) continue;
    const name = String(a.filename || "record").replace(/[^\w.\-]+/g, "_").slice(0, 80);
    const path = `${pet.user_id}/${pet.id}/inbox/${Date.now()}-${name}`;
    const up = await sb.storage.from("pet-documents").upload(path, Buffer.from(bin), { contentType: type || undefined, upsert: false });
    if (!up.error) files.push({ path, name, type });
  }

  const { error } = await sb.from("pet_notices").insert({
    user_id: pet.user_id, pet_id: pet.id, email_id: d.email_id, from_email: fromEmail || null, from_name: fromName,
    subject, summary, items: { vaccines, files },
  });
  if (error) return NextResponse.json({ ok: true });
  if (fromEmail) await sb.from("pet_providers").update({ last_received_at: new Date().toISOString() }).eq("pet_id", pet.id).eq("email", fromEmail);

  if (emailConfigured()) {
    const { data: u } = await sb.auth.admin.getUserById(pet.user_id);
    if (u?.user?.email) {
      const lines = vaccines.slice(0, 6).map((v) => ({ label: v.name, note: v.due_date ? `Due ${v.due_date}` : v.date_given ? `Given ${v.date_given}` : "" }));
      await sendResendEmail({
        to: u.user.email,
        kind: "pet_notice",
        subject: `${fromName} sent a notice about ${pet.name}`,
        text: `${fromName} sent a notice about ${pet.name}: "${subject}".\n\nCheck it and add it to ${pet.name}'s Vault with one tap: ${SITE_URL}/account`,
        html: brandedEmail({
          eyebrow: "NEW NOTICE",
          title: `${fromName} sent a notice about ${pet.name}`,
          intro: [summary ? esc(summary) : `“${esc(subject)}”`, "Take a quick look and tap Confirm to add it to the Vault. Nothing is added until you do."],
          pet,
          rows: [...lines, ...(files.length ? [{ label: `${files.length} file${files.length === 1 ? "" : "s"} attached`, note: "Ready to add to Docs" }] : [])],
          button: { label: "Check and confirm", href: `${SITE_URL}/account` },
        }),
      });
    }
  }
  return NextResponse.json({ ok: true });
}
