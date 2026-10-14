export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://petpassgo.com").replace(/\/$/, "");
export const SITE_NAME = "PetPassGo";
// Flip to "true" in Vercel when the password gate is removed and the site launches.
export const SITE_LAUNCHED = process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true";
