import { notFound } from "next/navigation";
import SiteHeader from "../../../components/SiteHeader";
import JsonLd from "../../../components/JsonLd";
import Prose from "../../../components/Prose";
import { AIRLINE_GUIDES, guideBySlug } from "../../../lib/airlineGuides";
import { SITE_URL } from "../../../lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return AIRLINE_GUIDES.map((a) => ({ airline: a.slug }));
}

export function generateMetadata({ params }) {
  const a = guideBySlug(params.airline);
  if (!a) return {};
  const title = `Flying ${a.name} with a pet or service dog`;
  const description = `Plan a ${a.name} trip with a pet or service dog. The checklist is in your Travel Pass after you pay.`;
  return { title, description, alternates: { canonical: `/airlines/${a.slug}` }, openGraph: { title, description, url: `/airlines/${a.slug}` } };
}

export default function AirlineGuide({ params }) {
  const a = guideBySlug(params.airline);
  if (!a) notFound();
  return (
    <>
      <SiteHeader />
      <Prose>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Airlines", item: `${SITE_URL}/airlines` },
          { "@type": "ListItem", position: 2, name: a.name, item: `${SITE_URL}/airlines/${a.slug}` } ] }} />
        <h1 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 38, color: "#14213D" }} className="mb-4">Flying {a.name} with a pet or service dog</h1>
        {a.note && <p className="mb-4 rounded-xl p-4" style={{ background: "#F3F5F9", fontSize: 16, lineHeight: 1.5 }}>{a.note}</p>}
        <p className="mb-6" style={{ lineHeight: 1.7, fontSize: 16 }}>
          {a.name} sets its own rules for pets and service dogs, and those rules change. Your route can add more.
          The checklist for this airline and your route is in the Travel Pass after you plan the trip and pay.
        </p>
        <div className="rounded-2xl p-6" style={{ background: "#14213D", color: "#F3F5F9" }}>
          <p className="mb-4" style={{ fontSize: 16, lineHeight: 1.5 }}>A few questions about your pet and this trip, then checkout.</p>
          <a href="/assessment" className="btn-primary inline-block rounded-full px-6 py-3" style={{ background: "#C2410C", color: "#fff", fontWeight: 700, textDecoration: "none" }}>Plan my trip</a>
        </div>
      </Prose>
    </>
  );
}
