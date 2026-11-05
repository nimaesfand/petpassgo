// Public pages live on www. An older hosting value of the apex domain is
// rewritten so canonicals, the sitemap, and emails stay on one address.
const configured = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.petpassgo.com").replace(/\/$/, "");
export const SITE_URL = configured === "https://petpassgo.com" || configured === "http://petpassgo.com"
  ? "https://www.petpassgo.com"
  : configured;
export const SITE_NAME = "PetPassGo";
// Flip to "true" in Vercel when the password gate is removed and the site launches.
export const SITE_LAUNCHED = process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true";
