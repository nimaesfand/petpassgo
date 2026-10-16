import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { aiProvider, AI_KEY_HINT } from "../../../lib/aiProvider";

export const dynamic = "force-dynamic";
const BUCKET = "pet-documents";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX = 6 * 1024 * 1024;

const PROMPT = `You extract structured data from a pet's veterinary paperwork (photo, scan or document text).
Return ONLY JSON in exactly this shape:
{"pet_name":string|null,"microchip_number":string|null,"chip_brand":string|null,
"vet_name":string|null,"vet_phone":string|null,"clinic_name":string|null,
"weight_value":number|null,"weight_unit":"lbs"|"kg"|null,
"vaccines":[{"name":string,"date_given":"YYYY-MM-DD"|null,"expires_on":"YYYY-MM-DD"|null}],
"medications":[{"name":string,"notes":string|null}],
"allergies":[{"name":string,"notes":string|null}],
"notes":string|null}
Rules: only report what is visibly/documented. Never guess or infer. Use null or [] when unsure.
Dates must be YYYY-MM-DD. Microchip: digits as printed. notes: one short sentence about anything unreadable.`;

const iso = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const str = (v, n = 120) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
function clean(out) {
  const rows = (a, med) => (Array.isArray(a) ? a : []).slice(0, 12).map((r) => med ? { name: str(r?.name, 120), notes: str(r?.notes, 300) } : { name: str(r?.name, 120), date_given: iso(r?.date_given), expires_on: iso(r?.expires_on) }).filter((r) => r.name);
  return {
    pet_name: str(out?.pet_name, 80), microchip_number: str(out?.microchip_number, 40), chip_brand: str(out?.chip_brand, 80),
    vet_name: str(out?.vet_name, 120), vet_phone: str(out?.vet_phone, 40), clinic_name: str(out?.clinic_name, 120),
    weight_value: typeof out?.weight_value === "number" && out.weight_value > 0 && out.weight_value < 1000 ? out.weight_value : null,
    weight_unit: out?.weight_unit === "kg" ? "kg" : out?.weight_unit === "lbs" ? "lbs" : null,
    vaccines: rows(out?.vaccines, false), medications: rows(out?.medications, true), allergies: rows(out?.allergies, true),
    notes: str(out?.notes, 300),
  };
}

export async function POST(req) {
  const p = aiProvider();
  if (!p) return NextResponse.json({ error: "Smart import isn't available yet. You can still add everything by hand below.", code: "NO_AI_PROVIDER", key_needed: AI_KEY_HINT }, { status: 503 });
  const token = req.headers.get("x-sb-token") || "";
  if (!token) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await sb.auth.getUser(token);
  if (!u?.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  let body; try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const petId = String(body?.pet_id || ""), filePath = String(body?.file_path || "");
  if (!UUID.test(petId) || !filePath.startsWith(`${u.user.id}/${petId}/vet-import-`)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id").eq("id", petId).eq("user_id", u.user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

  // The file already lives in the pet's private vault bucket; read it back with the owner's token.
  const { data: blob, error: dlErr } = await sb.storage.from(BUCKET).download(filePath);
  if (dlErr || !blob) return NextResponse.json({ error: "Couldn't read that upload. Please try again." }, { status: 400 });
  if (blob.size > MAX) return NextResponse.json({ error: "Please use a file under 6 MB." }, { status: 400 });
  const buf = Buffer.from(await blob.arrayBuffer());
  const isPdf = blob.type === "application/pdf" || filePath.toLowerCase().endsWith(".pdf");

  let userContent;
  if (isPdf) {
    let text = "";
    try { const { extractText } = await import("unpdf"); text = String((await extractText(new Uint8Array(buf), { mergePages: true }))?.text || ""); } catch {}
    if (text.trim().length < 20) return NextResponse.json({ error: "That PDF looks like a scan with no readable text. Please upload a clear photo of the paperwork instead.", code: "PDF_NO_TEXT" }, { status: 422 });
    userContent = `Document text (from the owner's PDF):\n\n${text.slice(0, 14000)}`;
  } else {
    const mime = blob.type?.startsWith("image/") ? blob.type : "image/jpeg";
    userContent = [{ type: "text", text: "Extract the vet paperwork details from this image." }, { type: "image_url", image_url: { url: `data:${mime};base64,${buf.toString("base64")}` } }];
  }

  const r = await fetch(p.url, { method: "POST", headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: p.model, temperature: 0, max_tokens: 1200, response_format: { type: "json_object" }, messages: [{ role: "system", content: PROMPT }, { role: "user", content: userContent }] }) });
  if (!r.ok) return NextResponse.json({ error: "Smart import is unavailable right now. Please try again, or add the details by hand.", code: "AI_UNAVAILABLE" }, { status: 502 });
  let out = {}; try { out = JSON.parse((await r.json())?.choices?.[0]?.message?.content || "{}"); } catch {}
  // Nothing is saved here. The client shows a review screen; saving happens only on owner confirm.
  return NextResponse.json({ extraction: clean(out), source: isPdf ? "pdf" : "image" });
}
