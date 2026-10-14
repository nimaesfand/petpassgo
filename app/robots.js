import { SITE_URL, SITE_LAUNCHED } from "../lib/site";

// While the site is password-protected, ask crawlers to stay out entirely.
// Set NEXT_PUBLIC_SITE_LAUNCHED=true in Vercel at launch to open it up.
export default function robots() {
  if (!SITE_LAUNCHED) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/account", "/api/", "/id/", "/login", "/signup"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
