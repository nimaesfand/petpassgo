import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import SiteHeader from "../../../components/SiteHeader";
import BusinessProfile from "../../../components/discover/BusinessProfile";
import { PUBLIC_FIELDS, photoUrl, CATEGORIES, STATE_NAME } from "../../../lib/discover";
import { tokens, font } from "../../../lib/theme";

export const revalidate = 120;

async function load(slug) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data } = await db.from("businesses").select(PUBLIC_FIELDS).eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const b = await load(params.slug);
  if (!b) return { title: "Business not found", robots: { index: false } };
  const cat = CATEGORIES.find((c) => c.slug === b.category)?.name || "Pet business";
  const where = b.online_only ? "online" : `${b.city}, ${STATE_NAME[b.state] || b.state}`;
  const description = (b.tagline || b.description || `${cat} in ${where}.`).slice(0, 155);
  const img = photoUrl(b.photos?.[0]);
  return {
    title: `${b.name} · ${cat} in ${where}`,
    description,
    alternates: { canonical: `/discover/${b.slug}` },
    openGraph: { title: b.name, description, url: `/discover/${b.slug}`, images: img ? [img] : undefined },
  };
}

export default async function BusinessPage({ params }) {
  const b = await load(params.slug);
  if (!b) notFound();
  const cat = CATEGORIES.find((c) => c.slug === b.category);
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[920px] mx-auto px-4 sm:px-6 py-6 md:py-10">
        <nav className="mb-4 flex flex-wrap gap-1.5" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} aria-label="Breadcrumb">
          <a href="/discover" style={{ color: tokens.navy, fontWeight: 600 }}>Discover</a><span>/</span>
          {!b.online_only && <><a href={`/discover?state=${b.state}&city=${encodeURIComponent(b.city)}`} style={{ color: tokens.navy, fontWeight: 600 }}>{b.city}</a><span>/</span></>}
          <a href={`/discover?category=${b.category}${b.online_only ? "" : `&state=${b.state}&city=${encodeURIComponent(b.city)}`}`} style={{ color: tokens.navy, fontWeight: 600 }}>{cat?.short_name}</a>
        </nav>
        <BusinessProfile b={b} />
        <p className="mt-6 text-center" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>
          Is this your business? <a href="/business/dashboard" style={{ color: tokens.primary, fontWeight: 700 }}>Manage this listing</a>
        </p>
      </main>
    </div>
  );
}
