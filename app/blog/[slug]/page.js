import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import JsonLd from "../../../components/JsonLd";
import Prose from "../../../components/Prose";
import { getAllPosts, getPost } from "../../../lib/blog";
import { SITE_URL } from "../../../lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title, description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `/blog/${post.slug}`, publishedTime: post.date },
  };
}

export default function BlogPost({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  return (
    <>
      <SiteHeader />
      <Prose>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, datePublished: post.date,
          author: { "@type": "Organization", name: post.author }, publisher: { "@type": "Organization", name: "PetPassGo" }, mainEntityOfPage: `${SITE_URL}/blog/${post.slug}` }} />
        <h1 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 38, color: "#14213D" }}>{post.title}</h1>
        <div style={{ fontSize: 13, opacity: 0.6 }} className="mb-8">{post.date}</div>
        <div className="blog-body" style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: post.html }} />
      </Prose>
    </>
  );
}
