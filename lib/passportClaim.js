const BUCKET = "pet-documents"; // same bucket as lib/storage
import { cleanDraft } from "./passportDraft";
import { isMember } from "./stripeServer";

// Move one saved passport into a member's account. Returns { pet_id } or { error, status }.
export async function claimDraft(svc, user, d) {
  if (d.claimed_at) {
    if (d.claimed_by === user.id && d.claimed_pet_id) return { pet_id: d.claimed_pet_id };
    return { error: "This passport was already kept on another account.", status: 409 };
  }
  if (new Date(d.expires_at) < new Date()) return { error: "This passport expired. You can make a new one in a minute.", status: 410 };
  if (!(await isMember(svc, user.id))) return { error: "Keeping the passport needs Pet Vault.", status: 402, need: "vault" };

  const f = cleanDraft(d.data);
  const { data: pet, error } = await svc.from("pets").insert({
    user_id: user.id, name: f.name, animal_type: f.animal_type, role: f.role,
    breed: f.breed || null, sex: f.sex || null, date_of_birth: f.date_of_birth || null,
    handler_name: f.handler_name || null, passport_issued_at: d.created_at,
  }).select("id").single();
  if (error || !pet) return { error: "We couldn't add the passport. Please try again.", status: 500 };
  if (d.photo_path) {
    const dest = `${user.id}/${pet.id}/profile-photo-${Date.now()}.jpg`;
    const cp = await svc.storage.from(BUCKET).copy(d.photo_path, dest);
    if (!cp.error) await svc.from("pets").update({ photo_url: dest }).eq("id", pet.id);
  }
  await svc.from("passport_drafts").update({ claimed_at: new Date().toISOString(), claimed_by: user.id, claimed_pet_id: pet.id }).eq("id", d.id);
  return { pet_id: pet.id };
}

// On sign-in: keep every unexpired passport made with this member's email.
export async function claimDraftsByEmail(svc, user) {
  const email = String(user?.email || "").toLowerCase();
  if (!email) return [];
  const { data: rows } = await svc.from("passport_drafts").select("*").ilike("email", email).is("claimed_at", null).gt("expires_at", new Date().toISOString()).order("created_at").limit(5);
  if (!rows?.length || !(await isMember(svc, user.id))) return [];
  const out = [];
  for (const d of rows) { const r = await claimDraft(svc, user, d); if (r.pet_id) out.push(r.pet_id); }
  return out;
}
