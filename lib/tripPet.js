// Pick the vault pet for a trip. Never guess when several pets could match.
export function pickTripPet(pets, trip) {
  const list = pets || [];
  if (!list.length || !trip) return null;
  if (trip.pet_id) return list.find((p) => p.id === trip.pet_id) || null;
  const type = String(trip.animal_type || "").toLowerCase();
  const same = type ? list.filter((p) => String(p.animal_type || "").toLowerCase() === type) : list;
  if (same.length === 1) return same[0];
  if (list.length === 1) return list[0];
  return null;
}
