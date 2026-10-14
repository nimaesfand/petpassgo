import { SITE_URL } from "../lib/site";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { getAllPosts } from "../lib/blog";

export default function sitemap() {
  const now = new Date();
  const pages = ["", "/assessment", "/airlines", "/faq", "/blog"].map((p) => ({
    url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7,
  }));
  const airlines = AIRLINE_GUIDES.map((a) => ({ url: `${SITE_URL}/airlines/${a.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 }));
  const posts = getAllPosts().map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.date || now), changeFrequency: "monthly", priority: 0.5 }));
  return [...pages, ...airlines, ...posts];
}
