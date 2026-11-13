import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/paidUser";
import { loadTripPlan, isEasyTrip } from "../../../lib/easyTrip";
import { allowRequest, clientIp } from "../../../lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Easy trips are free with an account. The server checks the saved trip
// itself; the browser's word that a trip is easy is never trusted.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Make a free account first." }, { status: 401 });
  if (!(await allowRequest(sb, `free_trip:${user.id}:${clientIp(req)}`, 20, 3600))) return NextResponse.json({ error: "Too many tries. Try again later." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const tripId = String(body.trip_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(tripId)) return NextResponse.json({ error: "Missing trip." }, { status: 400 });
  const { data: trip } = await sb.from("trips").select("*").eq("id", tripId).eq("user_id", user.id).maybeSingle();
  if (!trip) return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  if (trip.paid) return NextResponse.json({ ok: true, trip_id: trip.id, already: true });
  const plan = await loadTripPlan(sb, trip);
  if (!isEasyTrip(trip, plan)) return NextResponse.json({ error: "This trip has a few harder steps, so it needs a Travel Pass.", easy: false }, { status: 409 });
  const { error } = await sb.from("trips").update({ paid: true, paid_at: new Date().toISOString(), free_trip: true, status: "ready" }).eq("id", trip.id).eq("user_id", user.id).eq("paid", false);
  if (error) { console.error("free_trip_unlock", error.code, error.message); return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 }); }
  return NextResponse.json({ ok: true, trip_id: trip.id });
}
