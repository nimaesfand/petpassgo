import Image from "next/image";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import { Wordmark } from "../components/Logo";
import TrustBadges from "../components/TrustBadges";
import TripHero from "../components/TripHero";
import HomePricing from "../components/home/HomePricing";
import PlanTripButton from "../components/home/PlanTripButton";
import ScrollReveal from "../components/ScrollReveal";
import WelcomeBack from "../components/home/WelcomeBack";
import SampleAnswer from "../components/home/SampleAnswer";
import { FAQ } from "../lib/faq";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { PRICES as P } from "../lib/pricing";

const D = font.display;
const B = font.body;

export const metadata = {
  title: { absolute: "Flying with your pet? Check before you book | PetPassGo" },
  description: "Know before you book. Easy flights are free: see every step your pet needs. Complicated trips get a $29.99 Travel Pass. Keep your pet's passport and vet-verified records in one place.",
};

const STEPS = [
  { n: "1", title: "Check before you book", body: "Pick your route and pet. See which airlines take your pet, what it costs, and whether it's an easy flight.", icon: "M4 6h16M4 12h10M4 18h7" },
  { n: "2", title: "Get your checklist", body: "Every step with real dates. Free for easy flights. Complicated trips get a Travel Pass.", icon: "M5 4h14v16H5zM8 9h8M8 13h8M8 17h5" },
  { n: "3", title: "Keep it all in Pet Vault", body: "Vet-confirmed records and your pet's passport, ready to show at the airport, for every trip.", icon: "M5 13l4 4L19 7" },
];

const HOME_FAQ = [
  {
    q: FAQ[2].q,
    a: "Easy flights are free: a pet in the cabin, inside the US, on one airline, with no health papers or forms. You just make a free account. Complicated trips, like Mexico or Canada, big dogs, service dogs, or two airlines, need a Travel Pass: $29.99 for one trip, or $14.99 if you already have Pet Vault. You get the requirements for your airline, route, and animal, plus a checklist with deadlines and reminders. A step is shown only when we have the official page and the date we last checked it. Without Pet Vault, your Digital Pet ID and document vault stay open until 7 days after the trip ends. That is 7 days after the travel date on a one-way trip, or 7 days after the return date if you add a later return. One-way trips stay one date.",
  },
  { q: FAQ[6].q, a: FAQ[6].a },
  {
    q: "What if an airline requirement changes?",
    a: "Airline rules change, and they aren't the same on every route. Your Travel Pass shows a step when we have the official page and the date we last checked it. If we don't have it, the pass says to check with your airline. Fees, forms, and carrier sizes are in the pass after you pay, not here.",
  },
  {
    q: "Is this a subscription?",
    a: `A Travel Pass is a one-time purchase for one trip. Pet Vault is ${P.member} a month. It renews each month until you cancel, and you can cancel online anytime in account Billing. No phone call. Members can add a Travel Pass for ${P.memberPass} per trip.`,
  },
];

const WRAP = "max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14";

function Eyebrow({ children, color = tokens.stamp }) {
  return <p style={{ fontFamily: B, color, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em" }} className="mb-3">{children}</p>;
}

function H2({ children, light, id }) {
  return <h2 id={id} style={{ fontFamily: D, color: light ? "#fff" : tokens.navy, lineHeight: 1.12 }} className="text-[32px] md:text-[42px] font-bold">{children}</h2>;
}


const FOOTER_LINKS = [
  { href: "/travel-pass", label: "Travel Pass" },
  { href: "/pet-vault", label: "Pet Vault" },
  { href: "/airlines", label: "Airlines" },
  { href: "/blog", label: "Blog" },
  { href: "#pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/service-dog", label: "Flying with a service dog" },
  { href: "/lost-flyer", label: "Free lost pet flyer" },
  { href: "/guarantee", label: "Flight-Ready Guarantee" },
  { href: "/business", label: "For Businesses — Advertise with PetPassGo" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/privacy-choices", label: "Your privacy choices" },
];

export default function PetPassGoLanding() {
  return (
    <div style={{ background: tokens.sky, color: tokens.ink }} className="min-h-screen w-full overflow-x-hidden">
      <style>{`
        .airline-tile { transition: border-color .15s ease, transform .15s ease; }
        .airline-tile:hover { border-color: ${tokens.stamp}; transform: translateY(-2px); }
        .home-faq summary { list-style: none; }
        .home-faq summary::-webkit-details-marker { display: none; }
        .home-faq summary span[aria-hidden] { display: inline-block; transition: transform .15s ease; }
        .home-faq details[open] summary span[aria-hidden] { transform: rotate(45deg); }
        @media (prefers-reduced-motion: reduce) { .airline-tile:hover { transform: none; } }
      `}</style>

      <SiteHeader />
      <ScrollReveal />

      <main>
      <section className={`${WRAP} pt-7 sm:pt-10 lg:pt-14 pb-8 lg:pb-12`}>
        <WelcomeBack />
        <TripHero />
      </section>

      <section data-reveal className={`${WRAP} py-12 lg:py-16`}>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <H2>Three steps. Fly ready.</H2>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center justify-center rounded-full" style={{ width: 52, height: 52, background: "#FDE8E2" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={tokens.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.icon} /></svg>
                </span>
                <span style={{ fontFamily: D, color: tokens.line, fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{s.n}</span>
              </div>
              <h3 style={{ fontFamily: D, color: tokens.navy, fontSize: 22, fontWeight: 700, lineHeight: 1.25 }} className="mb-2">{s.title}</h3>
              <p style={{ fontFamily: B, color: tokens.ink, fontSize: 16, lineHeight: 1.55 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-reveal className={`${WRAP} py-12 lg:py-16`}>
        <SampleAnswer />
      </section>

      <section data-reveal id="pricing" style={{ background: tokens.navy }} className="py-12 lg:py-16">
        <div className={WRAP}>
          <Eyebrow color={tokens.gold}>PRICING</Eyebrow>
          <H2 light>Pick your plan.</H2>
          <div className="mt-8">
            <HomePricing />
          </div>
          <TrustBadges className="mt-6" />
        </div>
      </section>

      <section data-reveal className={`${WRAP} py-12 lg:py-16`}>
        <div className="max-w-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
            <H2>Quick answers</H2>
            <a href="/faq" style={{ fontFamily: B, color: tokens.navy, fontWeight: 700, fontSize: 16, textDecoration: "none" }} className="underline underline-offset-4">View all questions</a>
          </div>
          <div className="home-faq">
            {HOME_FAQ.map((f) => (
              <details key={f.q} className="mb-3 rounded-2xl px-5 py-4" style={{ border: `1px solid ${tokens.line}`, background: "#fff" }}>
                <summary className="cursor-pointer flex items-center justify-between gap-4 min-h-[48px]" style={{ fontFamily: B, fontWeight: 600, color: tokens.navy, fontSize: 17, lineHeight: 1.35 }}>
                  <span>{f.q}</span>
                  <span aria-hidden="true" style={{ fontFamily: D, fontSize: 26, fontWeight: 500, color: tokens.muted, lineHeight: 1 }}>+</span>
                </summary>
                <p className="mt-3 pr-6" style={{ fontFamily: B, color: tokens.ink, fontSize: 16, lineHeight: 1.55 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={`${WRAP} pb-12`}>
        <p style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.9, color: tokens.ink }}>
          <b style={{ color: tokens.navy }}>Airline pet guides:</b>{" "}
          {AIRLINE_GUIDES.map((a, i) => <span key={a.slug}>{i ? " · " : ""}<a href={`/airlines/${a.slug}`} style={{ color: tokens.navy }}>{a.name}</a></span>)}
          {" "}· <a href="/mexico" style={{ color: tokens.primary, fontWeight: 700 }}>Mexico</a> · <a href="/canada" style={{ color: tokens.primary, fontWeight: 700 }}>Canada</a> · <a href="/service-dog" style={{ color: tokens.primary, fontWeight: 700 }}>Service dogs</a>
        </p>
      </section>

      <section data-reveal className="relative overflow-hidden min-h-[520px] lg:min-h-[440px]" style={{ background: tokens.navyDeep }}>
        <Image
          src="/images/hero-golden-retriever.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[78%_32%]"
        />
        <div className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(to top, rgba(11,21,41,0.96) 0%, rgba(11,21,41,0.9) 34%, rgba(11,21,41,0.28) 68%, rgba(11,21,41,0.12) 100%)" }} aria-hidden="true" />
        <div className="absolute inset-0 hidden lg:block" style={{ background: "linear-gradient(90deg, rgba(11,21,41,0.94) 0%, rgba(11,21,41,0.84) 40%, rgba(11,21,41,0.22) 100%)" }} aria-hidden="true" />
        <div className={`relative ${WRAP} py-16 lg:py-20 min-h-[520px] lg:min-h-[440px] flex flex-col justify-end lg:justify-center`}>
          <div className="max-w-[36rem]">
            <h2 style={{ fontFamily: D, color: "#fff", lineHeight: 1.12 }} className="text-[32px] md:text-[44px] font-bold">Make travel easier for you and your pet.</h2>
            <p style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: "#E7EDF6" }} className="mt-4 mb-7">
              Get the steps for this trip, then keep your pet's ID and records in one place.
            </p>
            <PlanTripButton />
          </div>
        </div>
      </section>
      </main>

      <footer className="px-4 sm:px-6 md:px-14 pt-10 pb-28 md:pb-10" style={{ background: tokens.navyDeep, color: "#D5DEEB" }}>
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Wordmark size={28} onDark />
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href} style={{ fontFamily: B, fontSize: 16, color: "#E7EDF6", textDecoration: "underline", textUnderlineOffset: 3 }}>{l.label}</a>
            ))}
          </nav>
          <p style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5 }} className="mt-6">
            <a href="/contact" style={{ color: "#fff" }}>support@petpassgo.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
