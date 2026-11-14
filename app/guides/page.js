import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";
import { STATES, GUIDES_CHECKED } from "../../lib/stateGuides";

export const metadata = {
  title: "Service dog, PSD and ESA laws by state",
  description: "What's true and what's not about service dogs, psychiatric service dogs and emotional support animals in your state, for housing, public places and flying. Checked against the laws themselves.",
  alternates: { canonical: "/guides" },
};

const D = font.display;
const B = font.body;

const TOPICS = [
  { href: "/service-dog", title: "Flying with a service dog", body: "What airlines can ask for, and the DOT form." },
  { href: "/mexico", title: "Flying to Mexico with your dog", body: "Two certificates, two 5-day windows, and the CDC form home." },
  { href: "/canada", title: "Flying to Canada with your dog", body: "The rabies certificate, and the CDC form home." },
];

export default function GuidesPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[920px] mx-auto px-4 sm:px-6 pt-8 lg:pt-12 pb-14">
        <h1 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.08 }} className="text-[32px] sm:text-[46px]">Service dog, PSD and ESA laws by state</h1>
        <p className="mt-3" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>
          What&apos;s true and what&apos;s not, for housing, public places and flying. Written from the laws themselves, with a link to each one. Last checked {GUIDES_CHECKED}.
        </p>
        <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[24px] mt-8">States</h2>
        <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
          {STATES.map((s) => (
            <a key={s.slug} href={`/guides/${s.slug}`} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
              <div style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{s.name}</div>
              <div className="mt-1" style={{ fontFamily: B, fontSize: 14.5, lineHeight: 1.45, color: tokens.ink }}>{s.summary}</div>
            </a>
          ))}
        </div>
        <p className="mt-3" style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted }}>More states are on the way.</p>
        <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[24px] mt-8">Flying guides</h2>
        <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
          {TOPICS.map((t) => (
            <a key={t.href} href={t.href} className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
              <div style={{ fontFamily: B, fontWeight: 800, fontSize: 17, color: tokens.navy }}>{t.title}</div>
              <div className="mt-1" style={{ fontFamily: B, fontSize: 14.5, color: tokens.ink }}>{t.body}</div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
