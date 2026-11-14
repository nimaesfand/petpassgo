import { NextResponse } from "next/server";
import { fillHawaiiForm } from "../../../lib/hawaiiForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Temporary, test site only: the Hawaii form filled with sample data, to check placement.
export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "Not here." }, { status: 404 });
  const bytes = await fillHawaiiForm({ arrival: "2026-12-20", petCount: 1, airport: "HNL", petName: "Biscuit", species: "Dog", breed: "Golden Retriever", sex: "Male", color: "Golden", age: "5 YRS", chip: "985112003456789", first: "Sample", last: "Owner", phone: "555-0100", email: "sample@example.com", street: "123 Main St", city: "Los Angeles", state: "CA", zip: "90001", hiStreet: "45 Beach Rd", hiCity: "Honolulu", hiZip: "96815" });
  return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" } });
}
