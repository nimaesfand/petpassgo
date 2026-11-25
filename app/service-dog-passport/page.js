import { Wordmark } from "../../components/Logo";
import Icon from "../../components/Icon";
import SamplePassportCard from "../../components/SamplePassportCard";
import { TrackOnMount } from "../../components/Analytics";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";

export const metadata = {
  title: "Service Dog Passport",
  description: "One beautiful passport for your service dog, with the DOT form filled in for every trip, your signed handler statement and travel mode at the gate.",
  alternates: { canonical: "/service-dog-passport" },
  openGraph: { title: "Service Dog Passport", description: "Your partner works hard. Give them papers that look the part.", images: ["/images/hero-golden-retriever.jpg"] },
};

const D = font.display;
const B = font.body;

const SIGN = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 17c3-3 5-8 7-8s1 6 3 6 3-3 5-3" /><path d="M3 21h18" /></svg>;

const ITEMS = [
  { icon: <Icon name="file" size={20} />, text: "The DOT form, filled in for every trip" },
  { icon: SIGN, text: "Your signed handler statement, on file" },
  { icon: <Icon name="smartphone" size={20} />, text: "Travel mode: everything on one screen at the gate" },
];

// Where the visitor came from (ads, Google, registry links): ?src=registry
function cleanSrc(v) {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" && /^[a-z0-9_-]{1,32}$/i.test(s) ? s.toLowerCase() : "";
}

export default function ServiceDogPassportPage({ searchParams }) {
  const src = cleanSrc(searchParams?.src);
  const start = `/passport/create?for=service${src ? `&src=${src}` : ""}`;
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(120% 60% at 50% 18%, #1E3A8A 0%, #0B1A45 45%, #0B1529 100%)", fontFamily: B }}>
      <TrackOnMount contentType="landing" contentName={`service_dog_passport${src ? `:${src}` : ""}`} />
      <header className="max-w-[1080px] mx-auto flex items-center justify-between px-5 sm:px-8" style={{ paddingTop: 16, paddingBottom: 16 }}>
        <a href="/" aria-label="PetPassGo home" style={{ textDecoration: "none" }}><Wordmark size={22} onDark /></a>
        <a href="/login" style={{ color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", padding: "10px 4px" }}>Log in</a>
      </header>

      <main className="ppg-landing max-w-[1080px] mx-auto px-5 sm:px-8" style={{ paddingTop: 6, paddingBottom: 48 }}>
        <div className="ppg-landing-intro">
          <span className="ppg-badge ppg-badge-service inline-flex" style={{ borderRadius: 10, padding: "7px 12px", color: "#fff", fontWeight: 900, fontSize: 12, letterSpacing: ".14em", textShadow: "0 1px 1px rgba(0,0,0,.35)" }}>SERVICE DOG PASSPORT</span>
          <h1 className="mt-4 text-[38px] sm:text-[52px] font-extrabold" style={{ fontFamily: D, color: "#fff", lineHeight: 1.04, letterSpacing: "-.02em", maxWidth: "15ch" }}>Your partner works hard. Give them papers that look the part.</h1>
          <p className="mt-3 text-[17px] sm:text-[19px]" style={{ color: "#C9D4E6", lineHeight: 1.45, maxWidth: "32rem" }}>One beautiful passport for your service dog, with everything your airline can ask for ready to go.</p>
        </div>

        <div className="ppg-landing-card flex flex-col items-center" style={{ marginTop: 24 }}>
          <div style={{ transform: "rotate(-2deg)", width: "100%", display: "flex", justifyContent: "center" }}>
            <SamplePassportCard kind="service" />
          </div>
          <div className="text-center" style={{ fontSize: 12.5, color: "#9FB0CA", marginTop: 12 }}>Sample passport. Benny is one of our AI characters.</div>
        </div>

        <div className="ppg-landing-rest" style={{ maxWidth: "32rem" }}>
          <ul className="flex flex-col" style={{ listStyle: "none", margin: "24px 0 0", padding: 0, gap: 14 }}>
            {ITEMS.map((it) => (
              <li key={it.text} className="flex items-start" style={{ gap: 14 }}>
                <span className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 12, color: "#A9C1FF", background: "rgba(143,176,255,.13)", border: "1px solid rgba(143,176,255,.32)" }}>{it.icon}</span>
                <span style={{ fontSize: 16.5, lineHeight: 1.4, color: "#fff", fontWeight: 700, paddingTop: 8 }}>{it.text}</span>
              </li>
            ))}
          </ul>
          <a href={start} className="btn-primary flex items-center justify-center text-center w-full sm:w-auto sm:inline-flex sm:px-10" style={{ marginTop: 28, minHeight: 60, padding: "0 18px", borderRadius: 999, background: tokens.primary, color: "#fff", fontWeight: 800, fontSize: 17, textDecoration: "none", boxShadow: "0 14px 30px rgba(0,0,0,.35)" }}>Get your Service Dog Passport</a>
          <div className="text-center sm:text-left" style={{ fontSize: 14, color: "#9FB0CA", marginTop: 10 }}>{P.member} a month. Cancel anytime.</div>
        </div>
      </main>
    </div>
  );
}
