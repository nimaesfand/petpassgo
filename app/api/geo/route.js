import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Approximate visitor area from Vercel's edge headers, used only to pre-fill the
// Lost & found state/city filter. Nothing is stored.
export async function GET(req) {
  const dec = (v) => { try { return v ? decodeURIComponent(v) : ""; } catch { return ""; } };
  const country = dec(req.headers.get("x-vercel-ip-country"));
  return NextResponse.json({
    country: country || null,
    state: country === "US" ? dec(req.headers.get("x-vercel-ip-country-region")) || null : null,
    city: dec(req.headers.get("x-vercel-ip-city")) || null,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
