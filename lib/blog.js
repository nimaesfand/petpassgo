import fs from "fs";
import path from "path";
import { marked } from "marked";

const DIR = path.join(process.cwd(), "content", "blog");

// Minimal front matter: lines of `key: value` between --- fences.
function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = {};
  if (m) for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: m ? m[2] : raw };
}

export function getAllPosts() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const { meta } = parse(fs.readFileSync(path.join(DIR, f), "utf8"));
      return { slug: f.replace(/\.md$/, ""), title: meta.title || f, description: meta.description || "", date: meta.date || "", author: meta.author || "PetPassGo", status: meta.status || "" };
    })
    .filter((p) => p.title && p.date && p.status !== "draft")
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug) {
  const file = path.join(DIR, `${slug}.md`);
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(file)) return null;
  const { meta, body } = parse(fs.readFileSync(file, "utf8"));
  if (String(meta.status || "").toLowerCase() === "draft") return null;
  return { slug, title: meta.title || slug, description: meta.description || "", date: meta.date || "", author: meta.author || "PetPassGo", html: marked.parse(body) };
}
