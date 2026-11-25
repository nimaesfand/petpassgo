import Image from "next/image";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import { Wordmark } from "../components/Logo";
import WelcomeBack from "../components/home/WelcomeBack";
import SamplePassportCard, { PET_ICONS } from "../components/SamplePassportCard";
import { FAQ } from "../lib/faq";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { PRICES as P } from "../lib/pricing";

const D = font.display;
const B = font.body;

export const metadata = {
  title: { absolute: "PetPassGo | Fly with your pet" },
  description: "Flying with your pet? Find out what your airline, destination and pet need before you book. Free to start.",
};

const STEPS = [
  { n: "1", title: "Tell us about the trip", body: "Where and when you're flying. Haven't booked yet? We show which airlines take your pet and what each one charges." },
  { n: "2", title: "See what your pet needs", body: "A checklist of everything to do before you fly, with dates. Simple flights are free." },
  { n: "3", title: "Keep it in their passport", body: "Records, vaccines and the microchip in one place, ready to show at the airport on every trip." },
];



const PRICE_CARDS = [
  { title: "Free checklist", sub: "For simple flights", price: "$0", unit: "with a free account", checks: ["Every step for your flight, in order", "Your airline's pet fee and carrier size", "Saved for travel day"], cta: "Get my pet ready to fly", href: "/assessment", bordered: true },
  { title: "Travel Pass", sub: "For flights that need paperwork", price: P.memberPass, unit: "per trip, with Pet Vault", checks: ["Mexico, Canada, Hawaii, service dogs and cargo", "Your dates, reminders and forms filled in", "Flight-Ready Guarantee"], cta: "Get my pet ready to fly", href: "/assessment", dark: true },
  { title: "Pet Vault", sub: "Their passport and every record", price: P.member, unit: "a month", checks: ["Records sent for you when someone needs proof", "A tag anyone can scan if they're lost", "Cancel anytime"], cta: "Make your pet's passport", href: "/passport/create", accent: true, tag: "Best for records and frequent travel" },
];

const ICON = (d) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const VAULT_TILES = [
  { text: "At the airport? One tap shows everything you've saved for them.", icon: ICON(<><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></>) },
  { text: "Groomer, daycare or boarding needs proof? We send it for you.", icon: ICON(<><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>) },
  { text: "Lost? Anyone who scans their tag can reach you. You choose what they see.", icon: ICON(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></>) },
  { text: "About to expire? We remind you first.", icon: ICON(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>) },
];

const HOME_FAQ = [FAQ[1], FAQ[3], FAQ[2], FAQ[4]];

const WRAP = "max-w-[1240px] mx-auto px-4 sm:px-6 md:px-14";


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
  { href: "/guarantee", label: "Flight-Ready Guarantee" },
  { href: "/business", label: "For Businesses — Advertise with PetPassGo" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/privacy-choices", label: "Your privacy choices" },
];

const WHO = [
  { href: "/service-dog-passport", title: "My service dog", sub: "Your DOT forms, filled in and ready", name: "Benny", bg: "linear-gradient(135deg, #0B1A45 0%, #1E3A8A 100%)", photo: "/images/hero-golden-retriever.jpg" },
  { href: "/esa-passport", title: "My emotional support animal", sub: "Your housing letter, always on hand", name: "Cleo", bg: "linear-gradient(135deg, #3B0D0D 0%, #8F1D1D 100%)", icon: "cat" },
  { href: "/pet-passport", title: "My pet", sub: "Their records and airline rules, in one place", name: "Milo", bg: "linear-gradient(135deg, #3A160A 0%, #A3400F 100%)", icon: "dog" },
];

export default async function PetPassGoLanding() {
  return (
    <div style={{ background: tokens.sky, color: tokens.ink }} className="min-h-screen w-full overflow-x-clip">
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

      <main>
      <section className="relative overflow-hidden" style={{ background: tokens.navyDeep }}>
        <div className="absolute inset-0 lg:left-auto lg:w-[68%]">
          <Image src="/images/hero-golden-retriever.jpg" alt="A golden retriever in a travel harness at the airport" fill priority sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover object-[70%_35%] lg:object-[74%_22%]" />
          <div className="absolute inset-y-0 -left-px hidden lg:block w-[38%]" style={{ background: "linear-gradient(90deg, rgba(11,21,41,1) 0%, rgba(11,21,41,.55) 55%, rgba(11,21,41,0) 100%)" }} aria-hidden="true" />
        </div>
        <div className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(to top, rgba(11,21,41,.92) 0%, rgba(11,21,41,.62) 38%, rgba(11,21,41,.12) 72%)" }} aria-hidden="true" />
        <div className="absolute inset-0 hidden lg:block xl:hidden" style={{ background: "linear-gradient(90deg, rgba(11,21,41,.7) 0%, rgba(11,21,41,.3) 40%, rgba(11,21,41,0) 60%)" }} aria-hidden="true" />
        <div className={`relative ${WRAP} min-h-[86svh] lg:min-h-[640px] flex flex-col justify-end lg:justify-center pb-14 pt-32`}>
          <h1 style={{ fontFamily: D, color: "#fff", lineHeight: .98, letterSpacing: "-0.02em" }} className="text-[54px] sm:text-[76px] lg:text-[92px] font-extrabold max-w-[11ch]">Flying with your pet?</h1>
          <p style={{ fontFamily: B, color: "#E7EDF6", lineHeight: 1.5 }} className="mt-5 text-[18px] sm:text-[20px] max-w-[30rem]">Find out what your airline, destination and pet need before you book.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-9 min-h-[58px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Get my pet ready to fly</a>
          </div>
        </div>
      </section>

      <div className={WRAP}><WelcomeBack /></div>

      <section id="how" className={`${WRAP} py-16 lg:py-24`} style={{ scrollMarginTop: 64 }}>
        <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[36px] md:text-[52px] font-extrabold max-w-[16ch]">How it works</h2>
        <ol className="mt-10 grid md:grid-cols-3 gap-x-10 gap-y-8 relative" style={{ listStyle: "none", padding: 0 }}>
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative pl-14 md:pl-0">
              <span className="absolute left-0 top-0 md:static flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: tokens.navy, color: tokens.gold, fontFamily: D, fontWeight: 800, fontSize: 18 }}>{s.n}</span>
              {i < STEPS.length - 1 ? <span aria-hidden="true" className="hidden md:block absolute" style={{ top: 20, left: 52, right: -28, height: 2, background: tokens.line }} /> : null}
              <h3 className="md:mt-5" style={{ fontFamily: D, color: tokens.navy, fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{s.title}</h3>
              <p className="mt-2" style={{ fontFamily: B, color: tokens.ink, fontSize: 17, lineHeight: 1.55 }}>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${WRAP} pb-16 lg:pb-24`}>
        <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold max-w-[20ch]">Who&apos;s coming with you?</h2>
        <p className="mt-3 max-w-[38rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Pick one to see their passport.</p>
        <div className="grid md:grid-cols-3 gap-3 md:gap-4 mt-7">
          {WHO.map((w) => (
            <a key={w.href} href={w.href} className="ppg-lift relative overflow-hidden flex items-center gap-4 rounded-3xl p-4 md:p-5" style={{ background: w.bg, textDecoration: "none", boxShadow: "0 14px 30px rgba(20,33,61,.22)" }}>
              <span aria-hidden="true" className="ppg-foil" style={{ mixBlendMode: "screen", opacity: 0.55 }} />
              <span className="relative flex-shrink-0 overflow-hidden rounded-full flex items-center justify-center" style={{ width: 64, height: 64, border: `3px solid ${tokens.gold}`, background: "#FBF7EE", boxShadow: "0 0 0 3px rgba(255,255,255,.12)" }}>
                {w.photo ? <Image src={w.photo} alt="" width={64} height={64} className="object-cover" style={{ width: "100%", height: "100%", objectPosition: "62% 22%" }} /> : <span style={{ transform: "scale(.55)", display: "flex" }}>{PET_ICONS[w.icon]}</span>}
              </span>
              <span className="relative flex-1 min-w-0">
                <span className="block" style={{ fontFamily: D, fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{w.title}</span>
                <span className="block mt-1" style={{ fontFamily: B, fontSize: 15.5, color: "rgba(255,255,255,.82)", lineHeight: 1.4 }}>{w.sub}</span>
                <span className="block mt-1.5" style={{ fontFamily: B, fontSize: 13, fontWeight: 800, letterSpacing: ".08em", color: tokens.gold }}>{w.name.toUpperCase()}</span>
              </span>
              <span className="relative flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section style={{ background: tokens.navy }} className="py-16 lg:py-24 overflow-hidden">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 lg:gap-16 items-center`}>
          <div>
            <h2 style={{ fontFamily: D, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[36px] md:text-[52px] font-extrabold max-w-[14ch]">Their passport, ready wherever you go.</h2>
            <p className="mt-5 max-w-[30rem]" style={{ fontFamily: B, color: "#D5DEEB", fontSize: 19, lineHeight: 1.5 }}>Backed by Pet Vault, where all your pet&apos;s records live.</p>
            <a href="/passport/create" className="mt-8 inline-flex items-center justify-center rounded-full px-9 min-h-[56px]" style={{ background: "#fff", color: tokens.navy, fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Make your pet&apos;s passport</a>
          </div>
          <div className="flex justify-center" style={{ transform: "rotate(-2deg)" }}>
            <SamplePassportCard kind="service" />
          </div>
        </div>
        <ul className={`${WRAP} grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-12 lg:mt-16`} style={{ listStyle: "none" }}>
          {VAULT_TILES.map((t) => (
            <li key={t.text} className="flex items-center gap-4 rounded-3xl p-5" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}>
              <span className="flex-shrink-0 flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: "rgba(242,184,75,.14)", color: tokens.gold }}>{t.icon}</span>
              <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{t.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="pricing" style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-16 lg:py-24">
        <div className={WRAP}>
          <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold">What it costs</h2>
          <p className="mt-3 max-w-[38rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Seeing what your pet needs is free. You only pay when a flight needs paperwork.</p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {PRICE_CARDS.map((c) => (
              <article key={c.title} className="rounded-3xl p-6 flex flex-col" style={{ background: c.dark ? tokens.navy : c.accent ? "#fff" : tokens.sky, color: c.dark ? "#fff" : tokens.navy, border: c.accent || c.bordered ? `2px solid ${tokens.primary}` : "none", boxShadow: c.accent ? "0 18px 44px rgba(194,65,12,.14)" : "none" }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 style={{ fontFamily: D, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{c.title}</h3>
                  {c.tag ? <span className="rounded-full px-3 py-1" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>{c.tag}</span> : null}
                </div>
                <p className="mt-0.5" style={{ fontFamily: B, fontSize: 15, color: c.dark ? "#C9D4E4" : tokens.muted }}>{c.sub}</p>
                <div className="mt-3 flex items-baseline gap-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{c.price}</span><span style={{ fontFamily: B, fontSize: 15, color: c.dark ? "#C9D4E4" : tokens.muted }}>{c.unit}</span></div>
                {c.body ? <p className={`mt-4 ${c.checks ? "" : "flex-1"}`} style={{ fontFamily: B, fontSize: 16, lineHeight: 1.55, color: c.dark ? "#E7EDF6" : tokens.ink }}>{c.body}</p> : null}
                {c.checks ? <ul className="mt-4 flex flex-col gap-2">{c.checks.map((t) => <li key={t} className="flex items-start gap-2" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.4, color: c.dark ? "#E7EDF6" : tokens.ink }}><span aria-hidden="true" className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 20, height: 20, marginTop: 1, background: tokens.green, color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>{t}</li>)}</ul> : null}
                {c.note ? <div className="mt-4 flex items-start gap-2 rounded-2xl px-3 py-2.5" style={{ background: c.accent ? "#FFF4EC" : "#E7F6EC", color: tokens.ink, fontFamily: B, fontSize: 14, lineHeight: 1.4 }}><span aria-hidden="true" style={{ color: c.accent ? tokens.primary : tokens.green, fontWeight: 900 }}>✓</span><span><b style={{ color: tokens.navy }}>{c.note.strong}</b> {c.note.text}</span></div> : null}
                {c.guarantee ? <a href="/faq" className="mt-4 flex items-start gap-2 rounded-2xl px-3 py-2.5" style={{ background: "rgba(255,255,255,.08)", color: "#E7EDF6", fontFamily: B, fontSize: 14, lineHeight: 1.4, textDecoration: "none" }}><span aria-hidden="true" style={{ color: tokens.gold, fontWeight: 900 }}>✓</span><span><b style={{ color: "#fff" }}>Flight-Ready Guarantee.</b> If your pet is refused boarding because our information was wrong, we refund your Travel Pass. <span style={{ textDecoration: "underline" }}>How it works</span></span></a> : null}
                {c.checks ? <div className="flex-1" /> : null}
                <a href={c.href} className="mt-6 inline-flex items-center justify-center rounded-full min-h-[50px] px-6" style={{ background: c.dark || c.accent ? tokens.primary : "#fff", color: c.dark || c.accent ? "#fff" : tokens.navy, border: c.dark || c.accent ? "none" : `1.5px solid ${tokens.line}`, fontFamily: B, fontWeight: 800, fontSize: 15.5, textDecoration: "none" }}>{c.cta}</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${WRAP} py-16 lg:py-24`}>
        <div className="max-w-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
            <H2>Questions</H2>
            <a href="/faq" style={{ fontFamily: B, color: tokens.navy, fontWeight: 700, fontSize: 16, textDecoration: "none" }} className="underline underline-offset-4">All questions</a>
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
          <p className="mt-10" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.9, color: tokens.ink }}>
            <b style={{ color: tokens.navy }}>Guides:</b>{" "}
            {AIRLINE_GUIDES.map((a, i) => <span key={a.slug}>{i ? ", " : ""}<a href={`/airlines/${a.slug}`} style={{ color: tokens.navy }}>{a.name}</a></span>)}
            {", "}<a href="/service-dog" style={{ color: tokens.navy }}>flying with a service dog</a>{", "}<a href="/guides" style={{ color: tokens.navy }}>service dog and ESA laws by state</a>
          </p>
        </div>
      </section>

      <section style={{ background: tokens.navyDeep }} className="py-16 lg:py-20">
        <div className={`${WRAP} flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6`}>
          <h2 style={{ fontFamily: D, color: "#fff", lineHeight: 1.05 }} className="text-[34px] md:text-[48px] font-extrabold max-w-[16ch]">Where are you and your pet flying?</h2>
          <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-9 min-h-[58px] self-start lg:self-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Get my pet ready to fly</a>
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
