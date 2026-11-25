import { NextResponse } from "next/server";
import { requireUser, vaultIsOpen } from "../../../lib/paidUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET: new notices for a pet (sent by a connected vet, groomer, daycare or boarding).
export async function GET(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const petId = new URL(req.url).searchParams.get("pet_id") || "";
  if (!UUID.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data } = await sb.from("pet_notices").select("id,from_name,from_email,subject,summary,items,created_at")
    .eq("pet_id", petId).eq("user_id", user.id).eq("status", "new").order("created_at", { ascending: false }).limit(5);
  return NextResponse.json({ notices: data || [] });
}

// POST { id, action: "confirm" | "dismiss", keep: [vaccine indexes] }
// Confirm adds only what the owner ticked. Nothing is added without this tap.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!UUID.test(id)) return NextResponse.json({ error: "Missing notice." }, { status: 400 });
  const { data: n } = await sb.from("pet_notices").select("id,pet_id,from_name,items,status").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!n) return NextResponse.json({ error: "Notice not found." }, { status: 404 });
  if (n.status !== "new") return NextResponse.json({ ok: true });

  if (body.action === "dismiss") {
    await sb.from("pet_notices").update({ status: "dismissed" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }
  if (!(await vaultIsOpen(sb, user.id))) return NextResponse.json({ error: "Adding records is part of Pet Vault." }, { status: 403 });

  const keep = new Set((Array.isArray(body.keep) ? body.keep : []).map(Number));
  const vaccines = (n.items?.vaccines || []).filter((_, i) => keep.has(i));
  const files = n.items?.files || [];
  const from = String(n.from_name || "").slice(0, 80) || null;

  if (vaccines.length) {
    const { error } = await sb.from("pet_health_records").insert(vaccines.map((v) => ({
      pet_id: n.pet_id, user_id: user.id, kind: "vaccine", name: v.name, date_given: v.date_given || null, expires_on: v.due_date || null, clinic: from,
    })));
    if (error) return NextResponse.json({ error: "Couldn't add those. Please try again." }, { status: 500 });
  }
  for (const f of files) {
    const type = /rabies/i.test(f.name) ? "Rabies" : /vacc|immun|dhpp|bordetella/i.test(f.name) ? "Other vaccines" : "Other";
    const row = { user_id: user.id, pet_id: n.pet_id, document_type: type, file_url: f.path, note: from ? `From ${from}` : null };
    const { error } = await sb.from("documents").insert(row);
    if (error) await sb.from("documents").insert({ user_id: user.id, pet_id: n.pet_id, document_type: type, file_url: f.path });
  }
  await sb.from("pet_notices").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ ok: true, added: vaccines.length, files: files.length });
}
