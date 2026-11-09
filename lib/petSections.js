// Each My Pets section gets its own colour so the tabs feel alive and you always know where you are.
// Every colour passes 4.5:1 with white text.
export const SECTION_THEME = {
  passport: { label: "Passport", icon: "passport", color: "#C2410C", deep: "#9A3412", soft: "#FFF1E8" },
  id: { label: "Pet ID", icon: "tag", color: "#0F766E", deep: "#115E59", soft: "#E3F5F2" },
  health: { label: "Health", icon: "health", color: "#BE185D", deep: "#9D174D", soft: "#FDEBF3" },
  docs: { label: "Documents", icon: "file", color: "#4338CA", deep: "#3730A3", soft: "#EEF0FF" },
  lost: { label: "Lost pet", icon: "alert", color: "#B91C1C", deep: "#991B1B", soft: "#FDECEC" },
  about: { label: "About", icon: "paw", color: "#7C3AED", deep: "#6D28D9", soft: "#F3EEFF" },
};

export const SECTION_ORDER = ["passport", "id", "health", "docs", "lost", "about"];

// What a "complete" profile has, and which section fixes each gap.
export const PROFILE_FIELDS = [
  ["photo_url", "Photo", "passport"],
  ["breed", "Breed", "passport"],
  ["date_of_birth", "Birthday", "passport"],
  ["weight_lb", "Weight", "passport"],
  ["sex", "Sex", "passport"],
  ["color", "Color", "passport"],
  ["emergency_contact_phone", "Emergency contact", "passport"],
  ["microchip_number", "Microchip", "health"],
  ["vet_name", "Vet", "health"],
  ["about_bio", "About", "about"],
];

function has(v) {
  return v !== null && v !== undefined && String(v).trim() !== "";
}

export function profileProgress(pet) {
  const done = PROFILE_FIELDS.filter(([k]) => has(pet?.[k]));
  const missing = PROFILE_FIELDS.filter(([k]) => !has(pet?.[k]));
  return { pct: Math.round((done.length / PROFILE_FIELDS.length) * 100), done: done.length, total: PROFILE_FIELDS.length, missing };
}

export function petAge(dob) {
  if (!dob) return "";
  const d = new Date(`${String(dob).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) return "";
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  return `${y} yr${y === 1 ? "" : "s"}`;
}
