import { checkoutKeyFromAnswers, tripToCheckoutAnswers } from "./checkoutKey";

function keyUnavailable(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.code || ""}`;
  return /checkout_key|42703|42501|PGRST204|schema cache/i.test(message);
}

// Reuse the unpaid trip for this user and these answers. A paid match is
// refused so checkout cannot charge it again. Same route on another date
// has a different key and is allowed.
export async function saveCheckoutTrip(supabase, { userId, baseTrip, extras, answers }) {
  const key = checkoutKeyFromAnswers(answers);
  const lookup = await supabase.from("trips").select("id,paid").eq("user_id", userId).eq("checkout_key", key).maybeSingle();
  if (lookup.error && keyUnavailable(lookup.error)) return saveWithoutKey(supabase, { userId, baseTrip, extras, key });
  if (lookup.error) return { error: lookup.error };
  if (lookup.data?.paid) return { paid: true, trip: lookup.data };
  if (lookup.data?.id) {
    const patch = { ...extras };
    if (baseTrip.pet_id) patch.pet_id = baseTrip.pet_id;
    if (Object.keys(patch).length) await supabase.from("trips").update(patch).eq("id", lookup.data.id).eq("user_id", userId);
    return { trip: { id: lookup.data.id } };
  }

  let inserted = await supabase.from("trips").insert({ ...baseTrip, ...extras, checkout_key: key }).select("id,paid").single();
  if (inserted.error?.code === "23505") {
    const again = await supabase.from("trips").select("id,paid").eq("user_id", userId).eq("checkout_key", key).maybeSingle();
    if (again.data?.paid) return { paid: true, trip: again.data };
    if (again.data) return { trip: again.data };
  }
  if (inserted.error && keyUnavailable(inserted.error)) return saveWithoutKey(supabase, { userId, baseTrip, extras, key });
  if (inserted.error && extras.segments && /segments/i.test(`${inserted.error.message || ""} ${inserted.error.details || ""}`) && /42703|PGRST204|schema cache/i.test(`${inserted.error.message || ""} ${inserted.error.code || ""}`)) {
    const { segments, ...rest } = extras;
    inserted = await supabase.from("trips").insert({ ...baseTrip, ...rest, checkout_key: key }).select("id,paid").single();
    if (!inserted.error) return { trip: inserted.data, droppedSegments: true };
  }
  if (inserted.error && Object.keys(extras).length) {
    inserted = await supabase.from("trips").insert({ ...baseTrip, checkout_key: key }).select("id,paid").single();
    if (!inserted.error) return { trip: inserted.data, droppedReturn: true };
  }
  if (inserted.error) return { error: inserted.error };
  return { trip: inserted.data };
}

async function saveWithoutKey(supabase, { userId, baseTrip, extras, key }) {
  const existing = await supabase
    .from("trips")
    .select("id,paid,origin,destination,airline,travel_date,return_date,animal_type,role,flight_number,return_flight_number,service_kind")
    .eq("user_id", userId);
  const match = (existing.data || []).find((trip) => checkoutKeyFromAnswers(tripToCheckoutAnswers(trip)) === key);
  if (match?.paid) return { paid: true, trip: match };
  if (match) {
    const patch = { ...extras };
    if (baseTrip.pet_id) patch.pet_id = baseTrip.pet_id;
    if (Object.keys(patch).length) await supabase.from("trips").update(patch).eq("id", match.id).eq("user_id", userId);
    return { trip: { id: match.id } };
  }
  let inserted = await supabase.from("trips").insert({ ...baseTrip, ...extras }).select("id").single();
  if (inserted.error && Object.keys(extras).length) {
    inserted = await supabase.from("trips").insert(baseTrip).select("id").single();
    if (!inserted.error) return { trip: inserted.data, droppedReturn: true };
  }
  if (inserted.error) return { error: inserted.error };
  return { trip: inserted.data };
}
