import SiteHeader from "../../components/SiteHeader";
import Icon from "../../components/Icon";
import { TrackOnMount } from "../../components/Analytics";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";

export const metadata = {
  title: "Flying with a service dog: what U.S. airlines ask for",
  description: "Your service dog flies with you in the cabin at no charge. Here's what U.S. airlines can ask for, and how PetPassGo fills in the DOT Service Animal form for every trip.",
  alternates: { canonical: "/service-dog" },
};

const D = font.display;
const B = font.body;
const CTA = "/assessment?pet=service";
const CHECKED = "November 2026";

// What the airline can ask for. The "what", not the step-by-step "how".
const NEED = [
  { icon: "file", title: "The DOT Service Animal form", body: "A U.S. Department of Transportation form about your dog's training, health and behavior." },
  { icon: "clock", title: "A relief form on long flights", body: "For flights of 8 hours or more, the airline can also ask how your dog will relieve itself." },
  { icon: "check", title: "A trained, well-behaved dog", body: "Trained to do tasks for you, current on rabies, and on a leash or harness at your feet." },
];

const STEPS = [
  { title: "Check your flight", body: "Your route, airline and dog. Free, in about a minute." },
  { title: "Make your dog's passport", body: "Benny walks you through it, with your dog's training and your signed statement." },
  { title: "Your DOT form, filled in", body: "Ready for every trip. You check the boxes, sign, and you're set." },
];

export default function ServiceDogPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="service_dog" contentName="Service dog" />

      <section style={{ background: tokens.navyDeep || tokens.navy }}>
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <span className="ppg-badge ppg-badge-service inline-flex items-center gap-2 rounded-full px-3.5 py-1.5" style={{ color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 13.5, letterSpacing: ".06em" }}>
            <Icon name="shield" size={16} /> SERVICE DOG
          </span>
          <h1 className="mt-4 text-[38px] sm:text-[56px] font-extrabold" style={{ fontFamily: D, color: "#fff", lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: "16ch" }}>Your service dog flies with you, free.</h1>
          <p className="mt-4 text-[18px] sm:text-[20px]" style={{ fontFamily: B, color: "#E7EDF6", lineHeight: 1.5, maxWidth: "34rem" }}>Airlines can ask for the DOT Service Animal form. We fill it in from your dog&apos;s passport, for every trip.</p>
          <a href={CTA} className="btn-primary mt-8 inline-flex items-center justify-center rounded-full px-9 min-h-[58px] w-full sm:w-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 18, textDecoration: "none" }}>Check my flight</a>
        </div>
      </section>

      <main className="max-w-[900px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <h2 className="text-[28px] sm:text-[36px] font-extrabold" style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.1 }}>What your airline can ask for</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {NEED.map((n) => (
            <div key={n.title} className="rounded-3xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <span className="inline-flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: "#E0E7FF", color: "#1D4ED8" }}><Icon name={n.icon} size={22} /></span>
              <div className="mt-3" style={{ fontFamily: D, fontSize: 19, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{n.title}</div>
              <p className="mt-1.5" style={{ fontFamily: B, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }}>{n.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-3" style={{ fontFamily: B, fontSize: 13.5, color: tokens.muted }}>Last checked {CHECKED}.</p>

        <h2 className="mt-14 text-[28px] sm:text-[36px] font-extrabold" style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.1 }}>How we get you ready</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <span className="inline-flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: tokens.navy, color: tokens.gold, fontFamily: D, fontWeight: 800 }}>{i + 1}</span>
              <div className="mt-3" style={{ fontFamily: D, fontSize: 19, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{s.title}</div>
              <p className="mt-1.5" style={{ fontFamily: B, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }}>{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-3xl p-6 sm:p-8 text-center" style={{ background: tokens.navy }}>
          <div style={{ fontFamily: B, fontSize: 14, fontWeight: 800, letterSpacing: ".08em", color: tokens.gold }}>PET VAULT</div>
          <div className="mt-1" style={{ fontFamily: D, fontSize: 40, fontWeight: 800, color: "#fff" }}>{P.member}<span style={{ fontSize: 17, fontWeight: 600 }}> a month</span></div>
          <p className="mt-2 mx-auto" style={{ fontFamily: B, fontSize: 16, color: "#E7EDF6", lineHeight: 1.5, maxWidth: "30rem" }}>Your dog&apos;s passport, the DOT form for every trip, records, reminders and travel mode at the gate. Cancel anytime.</p>
          <a href={CTA} className="btn-primary mt-6 inline-flex items-center justify-center rounded-full px-9 min-h-[56px] w-full sm:w-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Check my flight</a>
        </div>

        <div className="mt-10 rounded-3xl p-5 sm:p-6 flex gap-4 items-start" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <span className="ppg-badge ppg-badge-esa flex-shrink-0 inline-flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, color: "#fff" }}><Icon name="heart" size={22} /></span>
          <div>
            <div style={{ fontFamily: D, fontSize: 19, fontWeight: 800, color: tokens.navy }}>Flying with an emotional support animal?</div>
            <p className="mt-1" style={{ fontFamily: B, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }}>On U.S. airlines, emotional support animals fly as pets. <a href="/assessment?pet=esa" style={{ color: tokens.navy, fontWeight: 800 }}>Check your flight</a> to see what yours needs.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
