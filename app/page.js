import Image from "next/image";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import TrustBadges from "../components/TrustBadges";
import TripHero from "../components/TripHero";
import PassPhone from "../components/home/PassPhone";
import VaultCluster from "../components/home/VaultCluster";
import HomePricing from "../components/home/HomePricing";
import PlanTripButton from "../components/home/PlanTripButton";
import { US_AIRLINES, INTERNATIONAL_AIRLINES } from "../lib/airlines";
import { FAQ } from "../lib/faq";
import { PRICES as P } from "../lib/pricing";

const D = font.display;
const B = font.body;

export const metadata = {
  title: "Travel with your pet",
  description: "Get the exact steps for your trip, your airline, and your pet. A Travel Pass is $49.99 for one trip. Pet Vault is $6.99 a month.",
};

const STRIP = [
  { icon: "plane", label: "Airline requirements" },
  { icon: "check", label: "Step-by-step checklist" },
  { icon: "cloudSun", label: "Weather and cargo safety" },
  { icon: "stethoscope", label: "Vets and pet stores" },
  { icon: "file", label: "Documents in one place" },
];

const PASS_BENEFITS = [
  { icon: "check", title: "Your step-by-step checklist", body: "Everything your pet needs for this trip, in order. Check things off as you go and watch your progress fill up." },
  { icon: "scale", title: "Will your pet fit?", body: "Enter your pet's weight and carrier size, and we'll tell you if they meet your airline's limits." },
  { icon: "cloudSun", title: "Weather and cargo safety", body: "Live weather at both airports, plus a heads-up if it's too hot or cold for pets flying in cargo." },
  { icon: "stethoscope", title: "Vets and pet stores where you land", body: "Find vets and pet stores near you the moment you arrive." },
  { icon: "smartphone", title: "Everything in one place on travel day", body: "Flight status, your pet's documents and Pet ID, ready to show at the counter." },
];

const VAULT_BENEFITS = [
  { icon: "passport", title: "Digital Pet ID", body: "Your pet's profile in one place: name, breed, weight, and whether they're a pet or a service animal, plus your contact info. Show the Pet ID from your phone, or share it with a QR code scan." },
  { icon: "pin", title: "Lost pet help", body: "If your pet goes missing, report them lost and get a printable flyer to share. Anyone who scans your pet's QR code can message you right away, and that message does not show your phone number." },
  { icon: "file", title: "Documents", body: "Keep vaccination records, health records and vet records ready whenever you need them." },
  { icon: "clock", title: "Reminders", body: "We'll remind you before something expires, like a rabies vaccine or a health certificate, so you're never caught off guard." },
];

const STEPS = [
  { n: "1", title: "Answer 6 quick questions", body: "Tell us about your flight and your pet.", icon: "M4 6h16M4 12h10M4 18h7" },
  { n: "2", title: "Get your Travel Pass", body: "Your step-by-step checklist built for your airline, route and pet.", icon: "M5 4h14v16H5zM8 9h8M8 13h8M8 17h5" },
  { n: "3", title: "Check it off and fly", body: "Follow the steps and keep your pet's ID and documents ready in your Pet Vault.", icon: "M5 13l4 4L19 7" },
];

const HOME_AIRLINE_GROUPS = [
  { title: "U.S.", names: US_AIRLINES },
  { title: "International", names: INTERNATIONAL_AIRLINES },
];

const HOME_FAQ = [
  {
    q: FAQ[2].q,
    a: "$49.99 for one trip, or $19.99 if you already have Pet Vault. You get the requirements for your airline, route, and animal, plus a checklist with deadlines and reminders. A step is shown only when we have the official page and the date we last checked it. Without Pet Vault, your Digital Pet ID and document vault stay open until 7 days after the trip ends. That is 7 days after the travel date on a one-way trip, or 7 days after the return date if you add a later return. One-way trips stay one date.",
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

function Rows({ items, card }) {
  return (
    <ul className="grid">
      {items.map((item, i) => (
        <li key={item.title} className="flex gap-3.5 py-4" style={{ borderTop: i === 0 && !card ? "none" : `1px solid ${tokens.line}`, background: card || "transparent", borderRadius: card ? 16 : 0, padding: card ? 16 : undefined, marginTop: card && i ? 12 : 0, border: card ? `1px solid ${tokens.line}` : undefined }}>
          <span aria-hidden="true" className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: "#FDE8E2", color: tokens.primary }}>
            <Icon name={item.icon} size={22} />
          </span>
          <span className="min-w-0">
            <span style={{ display: "block", fontFamily: D, fontWeight: 700, fontSize: 18, color: tokens.navy, lineHeight: 1.3 }}>{item.title}</span>
            <span style={{ display: "block", fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink, marginTop: 4 }}>{item.body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const FOOTER_LINKS = [
  { href: "/travel-pass", label: "Travel Pass" },
  { href: "/pet-vault", label: "Pet Vault" },
  { href: "/airlines", label: "Airlines" },
  { href: "/blog", label: "Blog" },
  { href: "#pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/lost-flyer", label: "Free lost pet flyer" },
  { href: "/guarantee", label: "Flight-Ready Guarantee" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
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

      <section className={`${WRAP} pt-7 sm:pt-10 lg:pt-14 pb-8 lg:pb-12`}>
        <TripHero />
      </section>

      <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-8 lg:py-10">
        <ul className={`${WRAP} grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6`}>
          {STRIP.map((item, i) => (
            <li key={item.label} className={`flex flex-col items-center text-center gap-2.5 min-w-0 ${i === STRIP.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}>
              <span aria-hidden="true" className="flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: "#FDE8E2", color: tokens.primary }}>
                <Icon name={item.icon} size={24} />
              </span>
              <span style={{ fontFamily: B, fontWeight: 700, fontSize: 16, lineHeight: 1.35, color: tokens.navy }}>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${WRAP} py-12 lg:py-16`}>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-6 lg:items-start">
          <div className="order-1 lg:col-start-2 lg:row-start-1">
            <Eyebrow>TRAVEL PASS</Eyebrow>
            <H2>What's included in your Travel Pass</H2>
            <p style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="mt-3 max-w-[40rem]">
              Tell us about your flight and your pet. The pass is built for your airline, route, and pet.
            </p>
          </div>
          <div className="order-2 lg:col-start-1 lg:row-start-1 lg:row-span-2">
            <PassPhone />
          </div>
          <div className="order-3 lg:col-start-2 lg:row-start-2">
            <Rows items={PASS_BENEFITS} />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-12 lg:py-16">
        <div className={`${WRAP} flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] lg:gap-x-14 lg:items-center`}>
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <Eyebrow>PET VAULT</Eyebrow>
            <H2>What's in your Pet Vault</H2>
            <p style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="mt-3">
              Your pet's records, ID, and lost-pet help, kept in one place.
            </p>
          </div>
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3">
            <VaultCluster />
          </div>
          <div className="order-3 lg:col-start-1">
            <Rows items={VAULT_BENEFITS} card="#fff" />
          </div>
          <div className="order-4 lg:col-start-1">
            <a href="/join" className="home-navy-btn inline-flex items-center justify-center rounded-full px-8 py-3.5 min-h-[52px] w-full sm:w-auto" style={{ background: tokens.navy, color: "#fff", fontFamily: B, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>Create your Pet Vault</a>
          </div>
        </div>
      </section>

      <section className={`${WRAP} py-12 lg:py-16`}>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <H2>3 easy steps to takeoff.</H2>
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

      <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-12 lg:py-16">
        <div className={WRAP}>
          <Eyebrow>AIRLINES</Eyebrow>
          <H2>Wherever you're flying, we've got you covered.</H2>
          <p style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="max-w-[40rem]">
            These are the airlines in Plan my trip.
          </p>
          <div className="mt-8 space-y-8">
            {HOME_AIRLINE_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-3">{group.title}</h3>
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {group.names.map((name) => (
                    <li key={name}>
                      <a href="/assessment" className="airline-tile rounded-xl px-4 py-3 min-h-[52px] h-full flex items-center" style={{ background: tokens.sky, border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
                        <span style={{ fontFamily: B, fontWeight: 600, fontSize: 16, lineHeight: 1.35, color: tokens.navy }}>{name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" style={{ background: tokens.navy }} className="py-12 lg:py-16">
        <div className={WRAP}>
          <Eyebrow color={tokens.gold}>PRICING</Eyebrow>
          <H2 light>Pick your plan.</H2>
          <div className="mt-8">
            <HomePricing />
          </div>
          <TrustBadges className="mt-6" />
        </div>
      </section>

      <section className={`${WRAP} py-12 lg:py-16`}>
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

      <section className="relative overflow-hidden min-h-[520px] lg:min-h-[440px]" style={{ background: tokens.navyDeep }}>
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

      <footer className="px-4 sm:px-6 md:px-14 py-10" style={{ background: tokens.navyDeep, color: "#D5DEEB" }}>
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <Logo size={34} />
            <span style={{ fontFamily: D, fontWeight: 700, fontSize: 20, color: "#fff" }}>PetPassGo</span>
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
