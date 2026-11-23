import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/paidUser";
import { signCheckin } from "../../../lib/ppgSign";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Travel mode: the owner opens this on their own phone and shows it at the
// airport. It lasts 24 hours. Without mode "travel" it's a 30-minute link to
// hand to someone else. It never works for anyone else's pet.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id,checkin_epoch").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  // Stop sharing: every link given to someone else stops working right away.
  if (body.stop === true) {
    const { error } = await sb.from("pets").update({ checkin_epoch: (pet.checkin_epoch || 0) + 1 }).eq("id", petId).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: "Couldn't stop sharing. Please try again." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  // The trip: the next paid or free trip for this pet (or for this account if
  // the trip has no pet linked). "Today" starts a day early so U.S. evenings,
  // which are already tomorrow in UTC, still find today's flight.
  const today = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const { data: trips } = await sb.from("trips").select("id,pet_id,travel_date,return_date").eq("user_id", user.id).or("paid.eq.true,free_trip.eq.true").or(`travel_date.gte.${today},return_date.gte.${today}`).order("travel_date", { ascending: true }).limit(10);
  const trip = (trips || []).find((t) => t.pet_id === petId) || (trips || []).find((t) => !t.pet_id) || null;
  const travel = body.mode === "travel";
  // Travel mode stays open through the trip: until 2 days after the last flight
  // (covers delays), at least 24 hours, at most 30 days. Shared links stay short.
  let minutes = 30;
  if (travel) {
    const last = trip ? (trip.return_date || trip.travel_date) : null;
    const until = last ? new Date(`${String(last).slice(0, 10)}T23:59:00Z`).getTime() + 2 * 864e5 : 0;
    minutes = Math.min(30 * 1440, Math.max(1440, Math.round((until - Date.now()) / 60000)));
  }
  const { token, expiresAt } = signCheckin({ petId, tripId: trip?.id || "", minutes, share: !travel, epoch: pet.checkin_epoch || 0 });
  return NextResponse.json({ url: `${SITE_URL}/check/${token}${travel ? "?travel=1" : ""}`, expiresAt });
}
