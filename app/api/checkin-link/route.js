import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/paidUser";
import { signCheckin } from "../../../lib/ppgSign";
import { SITE_URL } from "../../../lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// A check-in link the owner shows at the counter. It works for 30 minutes,
// then the owner opens a fresh one. It never works for anyone else's pet.
export async function POST(req) {
  const { user, sb } = await requireUser(req);
  if (!user || !sb) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const petId = String(body.pet_id || "");
  if (!/^[0-9a-f-]{36}$/i.test(petId)) return NextResponse.json({ error: "Missing pet." }, { status: 400 });
  const { data: pet } = await sb.from("pets").select("id").eq("id", petId).eq("user_id", user.id).maybeSingle();
  if (!pet) return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  // The trip: the next paid one for this pet (or for this account if the trip has no pet linked).
  const today = new Date().toISOString().slice(0, 10);
  const { data: trips } = await sb.from("trips").select("id,pet_id,travel_date,return_date").eq("user_id", user.id).eq("paid", true).or(`travel_date.gte.${today},return_date.gte.${today}`).order("travel_date", { ascending: true }).limit(10);
  const trip = (trips || []).find((t) => t.pet_id === petId) || (trips || []).find((t) => !t.pet_id) || null;
  const { token, expiresAt } = signCheckin({ petId, tripId: trip?.id || "" });
  return NextResponse.json({ url: `${SITE_URL}/check/${token}`, expiresAt });
}
