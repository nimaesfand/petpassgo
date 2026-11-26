import { NextResponse } from "next/server";
import { aiProvider } from "../../../lib/aiProvider";
import { allowRequest, clientIp } from "../../../lib/rateLimit";
import { serviceClient } from "../../../lib/serverEmail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Passport maker: "Snap the rabies certificate and we'll fill it in."
// Reads only the rabies dates and the clinic. Nothing is stored here.
const PROMPT = `You read a photo of a pet's rabies certificate or vaccine record. Return ONLY JSON:
{"date_given":"YYYY-MM-DD"|null,"expires_on":"YYYY-MM-DD"|null,"clinic_name":string|null,"clinic_phone":string|null}
Only the rabies vaccine. "Expires", "Due", "Next due" or "Valid until" go in expires_on. Never guess; use null when unsure.`;
const iso = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const str = (v, n) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req) {
  const sb = serviceClient();
  if (!(await allowRequest(sb, `rabies-scan:${clientIp(req)}`, 6, 86400))) return NextResponse.json({ error: "Too many photos today. Type the date instead." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const img = String(b.image || "");
  if (!/^data:image\/(jpeg|png|webp|heic|heif);base64,/.test(img) || img.length > 6_000_000) return NextResponse.json({ error: "That photo didn't work. Try another, or type the date." }, { status: 400 });
  const p = aiProvider(req);
  if (!p) return NextResponse.json({ error: "Type the date instead." }, { status: 503 });
  const r = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: p.model, temperature: 0, max_tokens: 300, response_format: { type: "json_object" }, messages: [{ role: "system", content: PROMPT }, { role: "user", content: [{ type: "text", text: "Read the rabies details." }, { type: "image_url", image_url: { url: img } }] }] }),
  }).catch(() => null);
  if (!r?.ok) return NextResponse.json({ error: "We couldn't read it. Type the date instead." }, { status: 502 });
  try {
    const out = JSON.parse((await r.json())?.choices?.[0]?.message?.content || "{}");
    const res = { date_given: iso(out.date_given), expires_on: iso(out.expires_on), clinic_name: str(out.clinic_name, 80), clinic_phone: str(out.clinic_phone, 30) };
    if (!res.expires_on && !res.date_given) return NextResponse.json({ error: "We couldn't find the rabies date. Type it instead." }, { status: 422 });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "We couldn't read it. Type the date instead." }, { status: 502 });
  }
}
