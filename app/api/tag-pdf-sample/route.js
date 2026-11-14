import { NextResponse } from "next/server";
import { buildTagPdf } from "../../../lib/tagPdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Temporary, test site only: a sample tag sheet to check layout.
export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "Not here." }, { status: 404 });
  const bytes = await buildTagPdf({ url: "https://www.petpassgo.com/id/biscuit-sample", petName: "Biscuit" });
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" } });
}
