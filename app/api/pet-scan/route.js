import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { emailConfigured, serviceClient, emailPetOwner } from "../../../lib/serverEmail";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Logs a view of a LOST pet's public page with a coarse, IP-based area
// (city/region from Vercel's edge headers). No precise location, no IP stored.
export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const petId = String(b?.petId || "");
  if (!UUID.test(petId)) return NextResponse.json({ ok: false }, { status: 400 });
  const dec = (v) => { try { return v ? decodeURIComponent(v) : ""; } catch { return ""; } };
  const area = [dec(req.headers.get("x-vercel-ip-city")), dec(req.headers.get("x-vercel-ip-country-region")), dec(req.headers.get("x-vercel-ip-country"))].filter(Boolean).join(", ") || null;

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data: lost } = await sb.rpc("get_public_lost_report", { pet_id: petId });
  if (!(Array.isArray(lost) ? lost[0] : lost)) return NextResponse.json({ ok: true }); // only while lost

  let notify = false;
  if (emailConfigured()) {
    const since = new Date(Date.now() - 3600e3).toISOString();
    const { count } = await serviceClient().from("pet_scans").select("id", { count: "exact", head: true }).eq("pet_id", petId).gte("scanned_at", since);
    notify = (count || 0) === 0; // at most one scan email per hour
  }
  await sb.rpc("log_pet_scan", { pet_id: petId, area });
  if (notify) {
    await emailPetOwner(petId, "PetPassGo: {name}'s lost poster was just viewed", `Someone just opened {name}'s lost poster${area ? ` (approximate area: ${area})` : ""}.\n\nSee scans and messages: ${SITE_URL}/account`);
  }
  return NextResponse.json({ ok: true });
}
