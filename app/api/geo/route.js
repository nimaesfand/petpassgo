import { NextResponse } from "next/server";
import { needsWithdrawalConsent, requestCountry } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(req) {
  return NextResponse.json({ country: requestCountry(req) || null, withdrawal: needsWithdrawalConsent(req) }, { headers: { "Cache-Control": "private, no-store" } });
}
