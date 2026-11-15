import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
// TEMPORARY preview-only: checks that public pages load. Remove after.
const PAGES = ["/", "/assessment", "/travel-pass", "/pet-vault", "/join", "/login", "/signup", "/faq", "/guarantee", "/terms", "/privacy", "/mexico", "/canada", "/service-dog", "/guides", "/guides/california", "/guides/texas", "/guides/florida", "/guides/new-york", "/guides/illinois", "/guides/arizona", "/airlines", "/airlines/delta", "/airlines/jetblue", "/business", "/lost-flyer", "/contact", "/verify", "/blog", "/discover", "/sitemap.xml", "/robots.txt", "/id/does-not-exist", "/check/bad-token", "/vet-verify/bad-token"];
export async function GET(req) {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "no" }, { status: 404 });
  const base = new URL(req.url).origin;
  const out = await Promise.all(PAGES.map(async (p) => {
    try {
      const r = await fetch(base + p, { redirect: "manual", headers: { cookie: req.headers.get("cookie") || "" } });
      const t = r.status === 200 ? await r.text() : "";
      return [p, r.status, /Application error|Internal Server Error/.test(t) ? "ERROR TEXT" : ""];
    } catch (e) { return [p, 0, String(e)]; }
  }));
  return NextResponse.json(out);
}
