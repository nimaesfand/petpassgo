import { NextResponse } from "next/server";
import { serviceClient } from "../../../../lib/serverEmail";
import { allowRequest, clientIp } from "../../../../lib/rateLimit";
import { hashToken } from "../../../../lib/ppgSign";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const clip = (v, n) => String(v || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

async function load(sb, token) {
  const { data: v, error } = await sb.from("vet_verifications").select("*").eq("token_hash", hashToken(token)).maybeSingle();
  if (error) console.error("vet_verify_load", error.code, error.message);
  if (!v) return { error: "This link isn't valid.", status: 404 };
  if (v.used_at) return { error: "These records were already confirmed. Thank you!", status: 410 };
  if (new Date(v.expires_at) < new Date()) return { error: "This link has expired. The owner can send a new one.", status: 410 };
  return { v };
}

// GET: what the vet sees. POST: the vet confirms some or all records.
export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const sb = serviceClient();
  const r = await load(sb, token);
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  const [{ data: pet }, { data: records }] = await Promise.all([
    sb.from("pets").select("name,animal_type,breed,sex,color,date_of_birth,microchip_number,handler_name").eq("id", r.v.pet_id).maybeSingle(),
    sb.from("pet_health_records").select("id,kind,name,date_given,expires_on,clinic").eq("pet_id", r.v.pet_id).in("kind", ["vaccine", "medication"]).order("expires_on", { ascending: true, nullsFirst: false }),
  ]);
  if (!pet) return NextResponse.json({ error: "This pet's profile was removed." }, { status: 404 });
  const chip = String(pet.microchip_number || "").replace(/[^0-9A-Za-z]/g, "");
  return NextResponse.json({
    pet: { name: pet.name, species: pet.animal_type, breed: pet.breed, sex: pet.sex, color: pet.color, born: pet.date_of_birth, chipLast4: chip ? chip.slice(-4) : "", owner: pet.handler_name },
    records: records || [],
  });
}

export async function POST(req) {
  const sb = serviceClient();
  if (!(await allowRequest(sb, `vet_confirm:${clientIp(req)}`, 20, 3600))) return NextResponse.json({ error: "Too many tries. Try again later." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const r = await load(sb, String(body.token || ""));
  if (r.error) return NextResponse.json({ error: r.error }, { status: r.status });
  const vetName = clip(body.vet_name, 80);
  const clinic = clip(body.clinic, 120);
  const license = clip(body.license, 40);
  if (!vetName || !clinic) return NextResponse.json({ error: "Add your name and clinic." }, { status: 400 });
  if (body.attest !== true) return NextResponse.json({ error: "Please confirm the statement." }, { status: 400 });
  const ids = Array.isArray(body.record_ids) ? body.record_ids.filter((x) => /^[0-9a-f-]{36}$/i.test(String(x))).slice(0, 50) : [];
  const now = new Date().toISOString();
  if (ids.length) {
    const { error } = await sb.from("pet_health_records")
      .update({ verified_at: now, verified_source: "vet", verified_by_name: vetName, verified_by_clinic: clinic, verified_by_license: license || null })
      .eq("pet_id", r.v.pet_id).in("id", ids);
    if (error) return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  }
  await sb.from("vet_verifications").update({ used_at: now, vet_name: vetName, clinic, license: license || null, record_ids: ids }).eq("id", r.v.id);
  return NextResponse.json({ ok: true, confirmed: ids.length });
}
