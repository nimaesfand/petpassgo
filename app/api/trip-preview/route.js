import { NextResponse } from "next/server";
import { serviceClient } from "../../../lib/serverEmail";
import { rulesRole, segmentsToStore } from "../../../lib/segments";
import { loadTripPlan, isEasyTrip } from "../../../lib/easyTrip";

export const dynamic = "force-dynamic";

// The free answer's step count and locked step names, built with the same code
// as the paid Travel Pass so the number on the free page matches the pass.
// Only short step names go out ("Vaccines", "DOT form"); details stay in the pass.
export async function POST(req) {
  let a;
  try { a = await req.json(); } catch { return NextResponse.json({ count: 0, steps: [] }, { status: 400 }); }
  const s = (v, n = 160) => (typeof v === "string" ? v.slice(0, n) : "");
  const answers = {
    airline: s(a?.airline, 80), second_airline: s(a?.second_airline, 80), connecting: a?.connecting === true, stop: s(a?.stop), second_date: s(a?.second_date, 10), second_mode: s(a?.second_mode, 8),
    origin: s(a?.origin), destination: s(a?.destination), animal: s(a?.animal, 20) || "Dog", role: s(a?.role, 40) || "Pet", esa: a?.esa === true,
    date: s(a?.date, 10), pet_travel: s(a?.pet_travel, 12), pet_count: a?.pet_count === 2 ? 2 : 1,
  };
  if (!answers.airline || /not sure/i.test(answers.airline) || !answers.origin || !answers.destination) return NextResponse.json({ count: 0, steps: [] });
  const trip = { ...answers, role: rulesRole(answers.role, answers.esa), animal_type: answers.animal, travel_date: answers.date, segments: segmentsToStore(answers) };
  const plan = await loadTripPlan(serviceClient(), trip);
  if (!plan) return NextResponse.json({ count: 0, steps: [] });
  const open = plan.open;
  const names = [...new Set(open.map((c) => c.shortTitle).filter(Boolean))];
  return NextResponse.json({ count: open.length, steps: names.slice(0, 12), dot: open.some((c) => c.dot), easy: isEasyTrip(trip, plan) }, { headers: { "Cache-Control": "private, max-age=60" } });
}
