import SiteHeader from "../../components/SiteHeader";
import JsonLd from "../../components/JsonLd";
import Prose from "../../components/Prose";
import { FAQ } from "../../lib/faq";

export const metadata = {
  title: "FAQ: flying with pets and service animals",
  description: "Answers to common questions about PetPassGo and about flying with a pet or service dog in the U.S.",
  alternates: { canonical: "/faq" },
  openGraph: { title: "FAQ | PetPassGo", url: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <Prose>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, color: "#152238" }} className="mb-8">Frequently asked questions</h1>
        {FAQ.map((f) => (
          <details key={f.q} className="mb-3 rounded-xl p-4" style={{ border: "1px solid #D9E1E8", background: "#fff" }}>
            <summary className="cursor-pointer" style={{ fontWeight: 600, color: "#152238" }}>{f.q}</summary>
            <p className="mt-3" style={{ lineHeight: 1.6, opacity: 0.85 }}>{f.a}</p>
          </details>
        ))}
        <p className="mt-10"><a href="/assessment" style={{ color: "#152238", fontWeight: 600 }}>Take the free assessment →</a></p>
      </Prose>
    </>
  );
}
