import { NextResponse } from "next/server";
import { serviceClient } from "../../../lib/serverEmail";
import { groupCards } from "../../../lib/passCards";
import { legsFromTrip, requirementQueryTypes, rulesRole, segmentPlans, segmentsToStore } from "../../../lib/segments";
import { requirementAirline } from "../../../lib/airlines";

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
  const trip = { ...answers, animal_type: answers.animal, travel_date: answers.date, segments: segmentsToStore(answers) };
  const role = rulesRole(answers.role, answers.esa);
  const airlines = new Set(["Any"]);
  for (const leg of legsFromTrip(trip)) { airlines.add(leg.airline); airlines.add(requirementAirline(leg.airline)); }
  const { data, error } = await serviceClient().from("airline_requirements").select("*")
    .in("airline", [...airlines].filter(Boolean)).in("animal_type", [answers.animal, "Any"]).in("role", [role, "Any"]).in("trip_type", requirementQueryTypes(trip));
  if (error) return NextResponse.json({ count: 0, steps: [] });
  const plans = segmentPlans(data || [], trip);
  const open = plans.flatMap((p) => { const g = groupCards(p.cards, {}); return [...g.first, ...g.general]; });
  const names = [...new Set(open.map((c) => c.shortTitle).filter(Boolean))];
  return NextResponse.json({ count: open.length, steps: names.slice(0, 12), dot: open.some((c) => c.dot) }, { headers: { "Cache-Control": "private, max-age=60" } });
}
