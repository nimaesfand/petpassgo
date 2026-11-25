import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { aiProvider as provider } from "../../../lib/aiProvider";

export const dynamic = "force-dynamic";

// Reads the provider details off a photo of an ESA or service dog letter so the
// owner doesn't have to type them. Nothing is stored or logged here: the owner
// checks the fields and saves them from the Vault.
const PROMPT = `You read a photo of a letter from a licensed health professional about an emotional support animal or a service dog. Return ONLY JSON:
{"provider_name":string|null,"provider_credential":string|null,"license_state":"two-letter US state"|null,"license_number":string|null,"issued_on":"YYYY-MM-DD"|null,"expires_on":"YYYY-MM-DD"|null,"provider_phone":string|null,"provider_email":string|null,"provider_address":string|null}
Only report what is printed on the letter. Never guess. Use null when unsure. Do not return anything about the patient's health.`;

const clip = (v, n) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);
const iso = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export async function POST(req) {
  const p = provider(req, "LETTER_SCAN_MODEL");
  if (!p) return NextResponse.json({ error: "Reading letters isn't set up yet. You can type the details in." }, { status: 503 });

  const token = req.headers.get("x-sb-token") || "";
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: u } = token ? await sb.auth.getUser(token) : { data: null };
  if (!u?.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const image = body?.image;
  if (typeof image !== "string" || !/^data:image\/(png|jpe?g|webp);base64,/.test(image) || image.length > 9e6)
    return NextResponse.json({ error: "Use a photo (JPG or PNG) to have it read." }, { status: 400 });

  const r = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: p.model, temperature: 0, max_tokens: 400, response_format: { type: "json_object" },
      messages: [{ role: "system", content: PROMPT }, { role: "user", content: [{ type: "image_url", image_url: { url: image } }] }],
    }),
  }).catch(() => null);
  if (!r?.ok) return NextResponse.json({ error: "Couldn't read it right now. You can type the details in." }, { status: 502 });
  let out = {};
  try { out = JSON.parse((await r.json())?.choices?.[0]?.message?.content || "{}"); } catch {}
  const lic = clip(out.license_number, 40);
  const st = clip(out.license_state, 2);
  return NextResponse.json({
    provider_name: clip(out.provider_name, 120),
    provider_credential: clip(out.provider_credential, 60),
    license_state: st && /^[A-Za-z]{2}$/.test(st) ? st.toUpperCase() : null,
    license_last4: lic ? lic.replace(/[^0-9A-Za-z]/g, "").slice(-4) || null : null,
    issued_on: iso(out.issued_on),
    expires_on: iso(out.expires_on),
    provider_phone: clip(out.provider_phone, 40),
    provider_email: clip(out.provider_email, 120),
    provider_address: clip(out.provider_address, 200),
  });
}
