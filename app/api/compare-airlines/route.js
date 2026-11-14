import { NextResponse } from "next/server";
import { serviceClient } from "../../../lib/serverEmail";
import { airlineGroupsForRegion, airlineCountry, requirementAirline } from "../../../lib/airlines";
import { findAirport, routeAllowed, tripTypeForRoute } from "../../../lib/airports";
import { matchesDestination } from "../../../lib/passCards";
import { rulesRole } from "../../../lib/segments";
import { planFromRows, isEasyTrip } from "../../../lib/easyTrip";
import { tripVerdict, tripFacts } from "../../../lib/verdict";
import { tripFitWarnings, holdInfo } from "../../../lib/tripFit";

export const dynamic = "force-dynamic";

// "Haven't booked yet": every airline that could fly this kind of route, side by side,
// using the same checks as the trip answer so the numbers always match.
export async function POST(req) {
  let a;
  try { a = await req.json(); } catch { return NextResponse.json({ airlines: [] }, { status: 400 }); }
  const s = (v, n = 160) => (typeof v === "string" ? v.slice(0, n) : "");
  const base = {
    origin: s(a?.origin), destination: s(a?.destination), animal: s(a?.animal, 20) || "Dog", role: s(a?.role, 40) || "Pet", esa: a?.esa === true,
    date: s(a?.date, 10), pet_count: a?.pet_count === 2 ? 2 : 1,
  };
  if (!base.origin || !base.destination || !routeAllowed(base.origin, base.destination)) return NextResponse.json({ airlines: [] });

  // Candidate airlines: U.S. carriers always; for Canada or Mexico, that country's carriers too.
  const domestic = tripTypeForRoute(base.origin, base.destination) === "domestic";
  const countries = new Set([findAirport(base.origin)?.country, findAirport(base.destination)?.country].filter(Boolean));
  const names = airlineGroupsForRegion(domestic ? "domestic" : "near").flatMap(([, list]) => list)
    .filter((n) => { const c = airlineCountry(n); return !c || c === "US" || countries.has(c); });
  const uniq = [...new Set(names)].slice(0, 20);
  if (!uniq.length) return NextResponse.json({ airlines: [] });

  const role = rulesRole(base.role, base.esa);
  const types = domestic ? ["domestic"] : ["international", "domestic"];
  const ruleNames = new Set(["Any"]);
  for (const n of uniq) { ruleNames.add(n); ruleNames.add(requirementAirline(n)); }
  const { data, error } = await serviceClient().from("airline_requirements").select("*")
    .in("airline", [...ruleNames]).in("animal_type", [base.animal, "Any"]).in("role", [role, "Any"]).in("trip_type", types);
  if (error) return NextResponse.json({ airlines: [] });
  const all = data || [];

  const out = uniq.map((name) => {
    const ruleName = requirementAirline(name);
    const trip = { ...base, airline: name, role, animal_type: base.animal, travel_date: base.date, pet_travel: "cabin", segments: null, connecting: false };
    const rows = all.filter((r) => r.airline === "Any" || r.airline === name || r.airline === ruleName);
    const own = rows.filter((r) => r.airline !== "Any");
    // International: only a confident answer when we've checked this airline's international rules.
    if (!domestic && !own.some((r) => r.trip_type === "international")) return { name, key: "check", title: "We haven't checked this airline's international pet rules", easy: false, fee: null, cargo: null };
    if (!own.length) return { name, key: "check", title: "We haven't checked this airline yet", easy: false, fee: null, cargo: holdInfo(name)?.state || null };
    const plan = planFromRows(rows, trip);
    const easy = isEasyTrip(trip, plan);
    const shown = rows.filter((r) => matchesDestination(r, trip));
    const v = tripVerdict({ rows: shown, trip: { ...trip, petName: "your pet" }, fitWarnings: tripFitWarnings(trip), stepCount: plan.open.length, easy });
    const facts = tripFacts(shown, { ...trip, airline: name });
    return { name, key: v.key, title: v.title, easy, steps: plan.open.length, fee: facts.fee, carrier: facts.carrier, cargo: holdInfo(name)?.state || null };
  });
  const rank = (x) => (x.key === "no" ? 4 : x.key === "check" ? 3 : x.easy ? 0 : x.key === "go" ? 1 : 2);
  const price = (x) => { const m = String(x.fee || "").match(/(\d+(?:\.\d+)?)/); return m ? Number(m[1]) : 9999; };
  out.sort((x, y) => rank(x) - rank(y) || price(x) - price(y) || (x.steps || 99) - (y.steps || 99) || x.name.localeCompare(y.name));
  return NextResponse.json({ airlines: out, domestic }, { headers: { "Cache-Control": "private, max-age=120" } });
}
