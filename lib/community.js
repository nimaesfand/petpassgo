import { AIRLINE_GUIDES } from "./airlineGuides";

export const COMMUNITY_ENABLED = process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true";

export const BOARDS = [
  ...AIRLINE_GUIDES.map((a) => ({ slug: a.slug, name: a.name, blurb: `Tips and questions from people who flew ${a.name} with a pet or service animal.`, airline: true })),
  { slug: "lost-and-found", name: "Lost & found", blurb: "Help reunite lost pets. Owners can link their pet's Lost Pet poster.", airline: false },
];
export const boardBySlug = (s) => BOARDS.find((b) => b.slug === s);

export const POST_TYPES = [
  { id: "tip", label: "Tip" },
  { id: "experience", label: "Experience" },
  { id: "question", label: "Question" },
];
export const postTypeLabel = (id) => POST_TYPES.find((t) => t.id === id)?.label || null;

export const COMMUNITY_NOTICE = "Community tips are from travelers and aren't verified; always follow your PetPassGo checklist and airline rules.";

/** Absolute date+time in America/Los_Angeles plus relative age, e.g. "Oct 12, 2026 · 4:15 PM · 3 days ago" */
export function formatPostWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const abs = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  let rel = "just now";
  if (sec >= 60 && sec < 3600) rel = `${Math.floor(sec / 60)} min ago`;
  else if (sec >= 3600 && sec < 86400) {
    const h = Math.floor(sec / 3600);
    rel = h === 1 ? "1 hour ago" : `${h} hours ago`;
  } else if (sec >= 86400 && sec < 86400 * 30) {
    const days = Math.floor(sec / 86400);
    rel = days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (sec >= 86400 * 30 && sec < 86400 * 365) {
    const mo = Math.floor(sec / (86400 * 30));
    rel = mo === 1 ? "1 month ago" : `${mo} months ago`;
  } else if (sec >= 86400 * 365) {
    const y = Math.floor(sec / (86400 * 365));
    rel = y === 1 ? "1 year ago" : `${y} years ago`;
  } else if (sec < 0) rel = "just now";
  return `${abs} PT · ${rel}`;
}

export function formatBoardLatest(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function textProblem(t) {
  if (!t) return null;
  if (/(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|co|ly|me|gg|xyz|info|biz|app|link|site|shop|us|ca)\b)/i.test(t)) return "Links aren't allowed in community posts.";
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+/i.test(t)) return "Please don't post email addresses. Use the Pet ID message button instead.";
  if (/(\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}/.test(t)) return "Please don't post phone numbers. Use the Pet ID message button instead.";
  return null;
}

export const friendly = (error) => (error?.message || "Something went wrong. Please try again.").replace(/^PET_LIMIT:\s*/, "");
