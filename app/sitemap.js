import fs from "fs";
import path from "path";
import { SITE_URL } from "../lib/site";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { getAllPosts } from "../lib/blog";

const APP = path.join(process.cwd(), "app");

function pageExists(segments) {
  return fs.existsSync(path.join(APP, ...segments, "page.js"));
}

function entry(urlPath, now, changeFrequency, priority) {
  return { url: `${SITE_URL}${urlPath}`, lastModified: now, changeFrequency, priority };
}

// Only routes that have a page.
export default function sitemap() {
  const now = new Date();
  const staticPaths = ["", "/assessment", "/airlines", "/blog", "/faq", "/contact", "/pet-vault", "/travel-pass", "/lost-flyer", "/terms", "/privacy", "/guarantee"];
  const pages = staticPaths
    .filter((p) => pageExists(p.split("/").filter(Boolean)))
    .map((p) => entry(p, now, p === "/terms" || p === "/privacy" || p === "/guarantee" ? "yearly" : p === "/lost-flyer" ? "monthly" : "weekly", p === "" ? 1 : p === "/terms" || p === "/privacy" || p === "/guarantee" ? 0.3 : p === "/lost-flyer" ? 0.6 : 0.7));
  const airlines = pageExists(["airlines", "[airline]"])
    ? AIRLINE_GUIDES.filter((a) => /^[a-z0-9-]+$/.test(a.slug)).map((a) => entry(`/airlines/${a.slug}`, now, "monthly", 0.6))
    : [];
  const posts = pageExists(["blog", "[slug]"])
    ? getAllPosts().map((p) => entry(`/blog/${p.slug}`, new Date(p.date || now), "monthly", 0.5))
    : [];
  return [...pages, ...airlines, ...posts];
}
