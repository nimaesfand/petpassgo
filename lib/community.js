import { AIRLINE_GUIDES } from "./airlineGuides";

export const COMMUNITY_ENABLED = process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true";

export const BOARDS = [
  ...AIRLINE_GUIDES.map((a) => ({ slug: a.slug, name: a.name, blurb: `Tips and questions from people who flew ${a.name} with a pet or service animal.` })),
  { slug: "lost-and-found", name: "Lost & found", blurb: "Help reunite lost pets. Owners can link their pet's Lost Pet poster." },
];
export const boardBySlug = (s) => BOARDS.find((b) => b.slug === s);

export const COMMUNITY_NOTICE = "Community tips are from travelers and aren't verified; always follow your PetPassGo checklist and airline rules.";

// Same checks as the database (which is the real enforcement); this just gives instant feedback.
export function textProblem(t) {
  if (!t) return null;
  if (/(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|co|ly|me|gg|xyz|info|biz|app|link|site|shop|us|ca)\b)/i.test(t)) return "Links aren't allowed in community posts.";
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+/i.test(t)) return "Please don't post email addresses. Use the Pet ID message button instead.";
  if (/(\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}/.test(t)) return "Please don't post phone numbers. Use the Pet ID message button instead.";
  return null;
}

// Supabase errors from our RPCs carry a friendly message.
export const friendly = (error) => (error?.message || "Something went wrong. Please try again.").replace(/^PET_LIMIT:\s*/, "");
