import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { requireUser, vaultIsOpen } from "../../../lib/paidUser";
import { emailConfigured, sendResendEmail } from "../../../lib/serverEmail";
import { brandedEmail, esc, petPhotoAttachment } from "../../../lib/emailHtml";
import { buildRecordsPdf } from "../../../lib/recordsPdf";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const DAILY_LIMIT = 10;
const MAX_TOTAL = 20 * 1024 * 1024;

const fmt = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};
const clip = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

// Owner sends their pet's records (the actual uploaded files + a one-page summary)
// to any email: groomer, daycare, boarding, a new vet. Reply-to is the owner,
// and the owner gets a copy. Transactional only: no promotion in this email.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Sharing records is part of Pet Vault." }, { status: 403 });
  if (!emailConfigured()) return NextResponse.json({ error: "Sending isn't available right now. Please try again later." }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  const toEmail = clip(body.to_email, 200).toLowerCase();
  const toName = clip(body.to_name, 80);
  const note = clip(body.note, 500);
  const docIds = Array.isArray(body.doc_ids) ? body.doc_ids.filter((x) => UUID.test(String(x))).slice(0, 12) : [];
  const includeSummary = body.include_summary !== false;
  if (!UUID.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  if (!EMAIL.test(toEmail)) return NextResponse.json({ error: "Check the email address." }, { status: 400 });
  if (body.agree !== true) return NextResponse.json({ error: "Please tick the box to agree." }, { status: 400 });
  if (!docIds.length && !includeSummary) return NextResponse.json({ error: "Pick at least one thing to send." }, { status: 400 });

  const since = new Date(Date.now() - 86400e3).toISOString();
  const { count } = await sb.from("record_sends").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("sent_at", since);
  if ((count || 0) >= DAILY_LIMIT) return NextResponse.json({ error: "You've sent a lot today. Please try again tomorrow." }, { status: 429 });

  const { data: pet } = await sb.from("pets").select("id,user_id,name,breed,animal_type,role,sex,date_of_birth,microchip_number,passport_no,weight_lb,photo_url,handler_name").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "That pet isn't on this account." }, { status: 404 });

  const owner = clip(pet.handler_name || user.user_metadata?.full_name || "", 60) || "A PetPassGo member";
  const ownerFirst = owner.split(" ")[0];

  // Attachments: the owner's own uploaded files for this pet.
  const attachments = [];
  const rows = [];
  let total = 0;
  if (docIds.length) {
    const { data: docs } = await sb.from("documents").select("id,document_type,file_url,expires_on,issued_on").eq("pet_id", pet.id).eq("user_id", user.id).in("id", docIds);
    for (const d of docs || []) {
      if (!d.file_url || String(d.file_url).startsWith("http")) continue;
      const { data: file } = await sb.storage.from("pet-documents").download(d.file_url);
      if (!file) continue;
      const buf = Buffer.from(await file.arrayBuffer());
      if (total + buf.length > MAX_TOTAL) break;
      total += buf.length;
      const ext = (String(d.file_url).match(/\.([a-z0-9]{2,5})$/i) || [null, "pdf"])[1].toLowerCase();
      const label = d.document_type || "Document";
      attachments.push({ filename: `${pet.name}-${label}.${ext}`.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-"), content: buf.toString("base64") });
      rows.push({ label, note: d.expires_on ? `Valid until ${fmt(d.expires_on)}` : d.issued_on ? `Issued ${fmt(d.issued_on)}` : "" });
    }
  }
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });
  if (includeSummary) {
    const { data: recs } = await sb.from("pet_health_records").select("kind,name,date_given,expires_on,verified_at,verified_by_name,verified_by_clinic").eq("pet_id", pet.id).order("expires_on", { ascending: true, nullsFirst: false });
    const bytes = await buildRecordsPdf({ pet, owner, records: recs || [], sharedOn: today });
    attachments.push({ filename: `${pet.name}-records-summary.pdf`.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-"), content: Buffer.from(bytes).toString("base64") });
    const vax = (recs || []).filter((r) => r.kind === "vaccine");
    for (const v of vax.slice(0, 8)) rows.push({ label: v.name, note: [v.expires_on ? `Due ${fmt(v.expires_on)}` : "", v.verified_at ? "Confirmed by their vet" : ""].filter(Boolean).join(" · "), good: !!v.verified_at });
    if (!vax.length) rows.push({ label: "Records summary", note: "One page with their details and records" });
  }
  if (!attachments.length) return NextResponse.json({ error: "We couldn't find those files. Please try again." }, { status: 400 });

  const photo = await petPhotoAttachment(sb, pet);
  if (photo) attachments.push(photo);

  const clear = `${randomBytes(18).toString("base64url")}${randomBytes(6).toString("hex")}`;
  const tokenHash = createHash("sha256").update(clear).digest("hex");
  const confirmUrl = `${SITE_URL}/api/share-records/received?t=${clear}`;
  const hello = toName ? `Hi ${esc(toName)},` : "Hi,";
  const html = brandedEmail({
    preheader: `${pet.name}'s records from ${owner}, attached.`,
    eyebrow: "RECORDS FROM A PET OWNER",
    title: `${pet.name}'s records are attached`,
    intro: [hello, `${esc(owner)} sent you ${esc(pet.name)}'s records through PetPassGo. Everything is attached to this email.${note ? "" : " Reply to reach them directly."}`, note ? `<span style="display:block;background:#F3F5F9;border-radius:12px;padding:12px 14px;font-style:italic">“${esc(note)}”<br/><span style="font-style:normal;font-size:13px;color:#4B5565">${esc(owner)}</span></span>` : ""],
    pet,
    photoCid: photo ? "petphoto" : null,
    rows,
    button: { label: "Got them? Tap to let them know", href: confirmUrl },
    after: [`Questions? Just reply. Your reply goes straight to ${esc(ownerFirst)}.`],
    footer: `${esc(owner)} sent this using PetPassGo. You received it because they entered this address.`,
  });
  const text = [
    `${toName ? `Hi ${toName},` : "Hi,"}`,
    "",
    `${owner} sent you ${pet.name}'s records through PetPassGo. They're attached to this email.`,
    note ? `\nTheir note: "${note}"\n` : "",
    `Got them? Let ${ownerFirst} know: ${confirmUrl}`,
    "",
    `Reply to this email to reach ${ownerFirst} directly.`,
  ].join("\n");

  const r = await sendResendEmail({
    to: toEmail,
    cc: user.email ? [user.email] : undefined,
    replyTo: user.email || undefined,
    fromName: `${ownerFirst} via PetPassGo`,
    subject: `${pet.name}'s records from ${owner}`,
    text,
    html,
    kind: "share_records",
    attachments,
  });
  if (!r.ok) return NextResponse.json({ error: "Couldn't send right now. Please try again." }, { status: 502 });

  await sb.from("record_sends").insert({ user_id: user.id, pet_id: pet.id, to_email: toEmail, to_name: toName || null, doc_ids: docIds, include_summary: includeSummary, note: note || null, token_hash: tokenHash });
  return NextResponse.json({ ok: true, to: toName || toEmail });
}
