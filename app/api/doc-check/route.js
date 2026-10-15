import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Same provider approach as /api/chat. Keys stay server-side.
function provider() {
  if (process.env.AI_GATEWAY_API_KEY)
    return { url: "https://ai-gateway.vercel.sh/v1/chat/completions", key: process.env.AI_GATEWAY_API_KEY, model: process.env.DOC_CHECK_MODEL || "openai/gpt-4o-mini" };
  if (process.env.OPENAI_API_KEY)
    return { url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY, model: process.env.DOC_CHECK_MODEL || "gpt-4o-mini" };
  return null;
}

const PROMPT = `You read a pet health / vaccination document image. Return ONLY JSON:
{"pet_name":string|null,"rabies_date":"YYYY-MM-DD"|null,"rabies_expires":"YYYY-MM-DD"|null,"vet_signature_present":boolean,"notes":string|null}
Only report what is visibly on the document. Never guess. Use null when unsure. notes: one short sentence about anything unreadable.`;

export async function POST(req) {
  if (process.env.NEXT_PUBLIC_DOC_CHECK_ENABLED !== "true") return NextResponse.json({ error: "Not enabled." }, { status: 404 });
  const p = provider();
  if (!p) return NextResponse.json({ error: "Document check is not configured yet." }, { status: 503 });

  const token = req.headers.get("x-sb-token") || "";
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: u } = token ? await sb.auth.getUser(token) : { data: null };
  if (!u?.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const image = body?.image;
  if (typeof image !== "string" || !/^data:image\/(png|jpe?g|webp);base64,/.test(image) || image.length > 9e6)
    return NextResponse.json({ error: "Please upload a JPG or PNG image." }, { status: 400 });
  const travelDate = /^\d{4}-\d{2}-\d{2}$/.test(body?.travelDate || "") ? body.travelDate : null;

  const r = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: p.model, temperature: 0, max_tokens: 300, response_format: { type: "json_object" },
      messages: [{ role: "system", content: PROMPT }, { role: "user", content: [{ type: "image_url", image_url: { url: image } }] }],
    }),
  });
  if (!r.ok) return NextResponse.json({ error: "The checker is unavailable right now." }, { status: 502 });
  let out = {};
  try { out = JSON.parse((await r.json())?.choices?.[0]?.message?.content || "{}"); } catch {}
  const iso = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  const res = {
    pet_name: typeof out.pet_name === "string" ? out.pet_name.slice(0, 80) : null,
    rabies_date: iso(out.rabies_date),
    rabies_expires: iso(out.rabies_expires),
    vet_signature_present: out.vet_signature_present === true,
    notes: typeof out.notes === "string" ? out.notes.slice(0, 200) : null,
  };
  res.valid_on_travel_date = travelDate && res.rabies_expires ? res.rabies_expires >= travelDate : null;
  return NextResponse.json(res);
}
