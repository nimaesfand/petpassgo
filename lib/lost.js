import { SITE_URL } from "./site";

export const publicIdUrl = (petId) => `${SITE_URL}/id/${petId}`;

export function shareText(pet, lost) {
  const what = [pet.breed, pet.animal_type].filter(Boolean).join(" ").toLowerCase() || "pet";
  const where = lost?.last_seen_area ? ` near ${lost.last_seen_area}` : "";
  const when = lost?.last_seen_date ? ` on ${fmtDate(lost.last_seen_date)}` : "";
  return `LOST: ${pet.name}, a ${what}, last seen${where}${when}. If you see ${pet.name}, please contact the owner through this page:`;
}

export function shareLinks(pet, lost) {
  const url = publicIdUrl(pet.id);
  const text = shareText(pet, lost);
  const e = encodeURIComponent;
  return [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`],
    ["X", `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`],
    ["WhatsApp", `https://wa.me/?text=${e(`${text} ${url}`)}`],
    ["Nextdoor", `https://nextdoor.com/sharekit/?source=petpassgo&body=${e(`${text} ${url}`)}&hash_tag=lostandfound`],
  ];
}

export function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso.slice(0, 10) + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
