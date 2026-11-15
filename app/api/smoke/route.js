import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
// TEMPORARY preview-only. Remove after.
const CASES = [
  { name: "domestic dog", body: { origin: "LAX", destination: "JFK", animal: "Dog", role: "Pet" } },
  { name: "domestic cat", body: { origin: "SFO", destination: "SEA", animal: "Cat", role: "Pet" } },
  { name: "mexico dog", body: { origin: "LAX", destination: "CUN", animal: "Dog", role: "Pet" } },
  { name: "canada cat", body: { origin: "SEA", destination: "YVR", animal: "Cat", role: "Pet" } },
  { name: "service dog", body: { origin: "ATL", destination: "MCO", animal: "Dog", role: "Service animal" } },
  { name: "hawaii", body: { origin: "LAX", destination: "HNL", animal: "Dog", role: "Pet" } },
];
export async function GET(req) {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "no" }, { status: 404 });
  const base = new URL(req.url).origin;
  const out = [];
  for (const c of CASES) {
    try {
      const r = await fetch(base + "/api/compare-airlines", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(c.body) });
      const j = await r.json();
      out.push({ case: c.name, status: r.status, count: (j.airlines || []).length, checkedAt: j.checkedAt, first: (j.airlines || []).slice(0, 3).map((a) => ({ n: a.airline || a.name, fee: a.fee ?? a.feeText, easy: a.easy, ok: a.allowed ?? a.ok })) });
    } catch (e) { out.push({ case: c.name, err: String(e) }); }
  }
  return NextResponse.json(out);
}
