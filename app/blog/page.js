import SiteHeader from "../../components/SiteHeader";
import Prose from "../../components/Prose";
import { getAllPosts } from "../../lib/blog";

export const metadata = {
  title: "Blog",
  description: "Guides and news about traveling with pets and service animals.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog | PetPassGo", url: "/blog" },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <>
      <SiteHeader />
      <Prose>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, color: "#152238" }} className="mb-8">Blog</h1>
        {posts.length === 0 && <p style={{ opacity: 0.7 }}>New guides are on the way. In the meantime, check our <a href="/faq" style={{ textDecoration: "underline" }}>FAQ</a>.</p>}
        {posts.map((p) => (
          <article key={p.slug} className="mb-8">
            <a href={`/blog/${p.slug}`} style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: "#152238", textDecoration: "none" }}>{p.title}</a>
            <div style={{ fontSize: 13, opacity: 0.6 }}>{p.date}</div>
            <p style={{ opacity: 0.85 }}>{p.description}</p>
          </article>
        ))}
      </Prose>
    </>
  );
}
