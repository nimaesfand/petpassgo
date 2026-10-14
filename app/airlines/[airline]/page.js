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
  const description = `What to know before flying ${a.name} with your pet or service animal, and how to get a personalized, verified checklist for your trip.`;
  return { title, description, alternates: { canonical: `/airlines/${a.slug}` }, openGraph: { title, description, url: `/airlines/${a.slug}` } };
}

const h2 = { fontFamily: "'Fraunces', serif", fontSize: 24, color: "#152238" };

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
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 38, color: "#152238" }} className="mb-4">Flying {a.name} with a pet or service dog</h1>
        {a.note && <p className="mb-4 rounded-xl p-4" style={{ background: "#EAF0F6" }}>{a.note}</p>}
        <p className="mb-6" style={{ lineHeight: 1.7 }}>
          Every airline sets its own rules for animals in the cabin — which animals it accepts, how you book space for them,
          carrier limits, fees, and what paperwork service-dog handlers need and when. Those rules also change, and your route
          (for example Hawaii or an international trip) can add requirements on top.
        </p>
        <h2 style={h2} className="mb-2">What PetPassGo checks for your {a.name} trip</h2>
        <ul className="list-disc pl-6 mb-6" style={{ lineHeight: 1.8 }}>
          <li>How to add your pet or notify {a.name} about your service dog</li>
          <li>Carrier, age and eligibility requirements</li>
          <li>Fees and payment timing</li>
          <li>Required forms and their deadlines</li>
          <li>Destination rules (state, territory or country) that apply to your route</li>
        </ul>
        <p className="mb-8" style={{ lineHeight: 1.7, opacity: 0.85 }}>
          Every item in a Travel Pass is checked against {a.name}&apos;s own website and official government sources. You can also read{" "}
          <a href={a.site} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{a.name}&apos;s pet travel page</a> directly.
        </p>
        <div className="rounded-2xl p-6" style={{ background: "#152238", color: "#EAF0F6" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }} className="mb-2">Get your {a.name} checklist</div>
          <p className="mb-4" style={{ opacity: 0.85 }}>Start with the free assessment, then unlock a verified, step-by-step Travel Pass for your exact trip.</p>
          <a href="/assessment" className="inline-block rounded-full px-5 py-2" style={{ background: "#C9A227", color: "#152238", fontWeight: 600, textDecoration: "none" }}>Take the free assessment</a>
        </div>
      </Prose>
    </>
  );
}
