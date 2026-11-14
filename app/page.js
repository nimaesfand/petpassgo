import Image from "next/image";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import { Wordmark } from "../components/Logo";
import WelcomeBack from "../components/home/WelcomeBack";
import HomePassport from "../components/home/HomePassport";
import { FAQ } from "../lib/faq";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { PRICES as P } from "../lib/pricing";

const D = font.display;
const B = font.body;

export const metadata = {
  title: { absolute: "PetPassGo | Fly with your pet" },
  description: "PetPassGo tells you exactly what your pet needs to fly, and keeps their passport and vet-confirmed records ready for every trip. Checking your trip is free.",
};

const STEPS = [
  { n: "1", title: "Tell us about the trip", body: "Where and when you're flying. Haven't booked yet? We show which airlines take your pet and what each one charges." },
  { n: "2", title: "See what your pet needs", body: "A checklist of everything to do before you fly, with dates. Simple flights are free." },
  { n: "3", title: "Keep it in their passport", body: "Records, vaccines and the microchip in one place, ready to show at the airport on every trip." },
];

const VET_STEPS = [
  { title: "Send your vet a link", body: "From Pet Vault, enter your vet's email. They don't need an account." },
  { title: "Your vet checks the records", body: "They see your pet's vaccines and confirm the ones that match their files." },
  { title: "Records show as vet verified", body: "With your vet's name and clinic, on the passport and at airport check-in. If a record is edited later, the badge comes off." },
];

const PRICE_CARDS = [
  { title: "Free checklist", sub: "For simple flights", price: "Free", unit: "with an account", body: "A small pet in the cabin, inside the U.S., on one airline, with no health papers. You get every step for your flight.", cta: "Check my flight", href: "/assessment" },
  { title: "Travel Pass", sub: "For flights that need paperwork", price: P.pass, unit: `per trip, or ${P.memberPass} with Pet Vault`, body: "Mexico, Canada and Hawaii, service dogs, big dogs, cargo and two-airline trips. Every step with dates and reminders, and we check your pet's vaccines and certificates are valid for the trip.", cta: "Plan my trip", href: "/assessment", dark: true },
  { title: "Pet Vault", sub: "Your pet's passport and records", price: P.member, unit: "a month", body: `Your pet's passport, vet-confirmed records, reminders and lost-pet help, for every trip. Travel Passes are ${P.memberPass} for members. Cancel anytime.`, cta: "Make their passport", href: "/join" },
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

      <main>
      <section className="relative overflow-hidden" style={{ background: tokens.navyDeep }}>
        <div className="absolute inset-0 lg:left-auto lg:w-[58%] 2xl:w-[56%]">
          <Image src="/images/hero-golden-retriever.jpg" alt="A golden retriever in a travel harness at the airport" fill priority sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover object-[70%_35%] lg:object-[74%_22%]" />
          <div className="absolute inset-y-0 left-0 hidden lg:block w-[38%]" style={{ background: "linear-gradient(90deg, rgba(11,21,41,1) 0%, rgba(11,21,41,.55) 55%, rgba(11,21,41,0) 100%)" }} aria-hidden="true" />
        </div>
        <div className="absolute inset-0 lg:hidden" style={{ background: "linear-gradient(to top, rgba(11,21,41,.92) 0%, rgba(11,21,41,.62) 38%, rgba(11,21,41,.12) 72%)" }} aria-hidden="true" />
        <div className="absolute inset-0 hidden lg:block xl:hidden" style={{ background: "linear-gradient(90deg, rgba(11,21,41,.7) 0%, rgba(11,21,41,.3) 40%, rgba(11,21,41,0) 60%)" }} aria-hidden="true" />
        <div className={`relative ${WRAP} min-h-[86svh] lg:min-h-[640px] flex flex-col justify-end lg:justify-center pb-14 pt-32`}>
          <h1 style={{ fontFamily: D, color: "#fff", lineHeight: .98, letterSpacing: "-0.02em" }} className="text-[54px] sm:text-[76px] lg:text-[92px] font-extrabold max-w-[11ch]">Bring them along.</h1>
          <p style={{ fontFamily: B, color: "#E7EDF6", lineHeight: 1.5 }} className="mt-5 text-[18px] sm:text-[20px] max-w-[30rem]">PetPassGo tells you exactly what your pet needs to fly, and keeps their papers ready for every trip.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-9 min-h-[58px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Plan my pet&apos;s trip</a>
            <a href="#how" style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: "#fff", textDecoration: "underline", textUnderlineOffset: 4 }} className="text-center sm:text-left">See how it works</a>
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

      <section style={{ background: tokens.navy }} className="py-16 lg:py-24 overflow-hidden">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1fr)_minmax(560px,640px)] gap-12 items-center`}>
          <div>
            <h2 style={{ fontFamily: D, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[36px] md:text-[52px] font-extrabold max-w-[14ch]">A passport made for your pet.</h2>
            <p className="mt-5 max-w-[32rem]" style={{ fontFamily: B, color: "#D5DEEB", fontSize: 18, lineHeight: 1.55 }}>Their details, vaccines and microchip in one place. Your vet can confirm the records, and at the airport you can show a live check-in code the agent scans.</p>
            <ul className="mt-6 grid gap-3 max-w-[32rem]" style={{ listStyle: "none", padding: 0 }}>
              {["Vaccines confirmed by your vet", "A live code to show at check-in", "Reminders before shots and papers run out", "A QR tag that helps if they ever get lost"].map((t) => (
                <li key={t} className="flex gap-3" style={{ fontFamily: B, fontSize: 16.5, color: "#fff" }}><span style={{ color: tokens.gold, fontWeight: 800 }}>✓</span>{t}</li>
              ))}
            </ul>
            <a href="/join" className="mt-8 inline-flex items-center justify-center rounded-full px-8 min-h-[54px]" style={{ background: "#fff", color: tokens.navy, fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>Make your pet&apos;s passport</a>
          </div>
          <div className="w-full max-w-[640px] mx-auto">
            <HomePassport />
            <p className="mt-3 text-center" style={{ fontFamily: B, fontSize: 14, color: "#AFC0D6" }}>Meet Biscuit. Tap the passport to flip it.</p>
          </div>
        </div>
      </section>

      <section className={`${WRAP} py-16 lg:py-24 grid lg:grid-cols-[1fr_minmax(320px,460px)] gap-12 items-center`}>
        <div>
          <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[32px] md:text-[44px] font-extrabold max-w-[16ch]">Records your vet confirms.</h2>
          <p className="mt-3 max-w-[34rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Anyone can type in a vaccine date. A record your vet has confirmed is one an airline agent can trust.</p>
          <ol className="mt-7 grid gap-5 max-w-[34rem]" style={{ listStyle: "none", padding: 0 }}>
            {VET_STEPS.map((t, i) => (
              <li key={t.title} className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: tokens.navy, color: tokens.gold, fontFamily: D, fontWeight: 800 }}>{i + 1}</span>
                <div>
                  <h3 style={{ fontFamily: D, fontSize: 20, fontWeight: 700, color: tokens.navy, lineHeight: 1.2 }}>{t.title}</h3>
                  <p className="mt-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl p-5 sm:p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 24px 60px rgba(20,33,61,.12)" }} aria-label="Example of vet-verified records">
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: D, fontSize: 19, fontWeight: 800, color: tokens.navy }}>Biscuit&apos;s vaccines</span>
            <span style={{ fontFamily: B, fontSize: 13, color: tokens.muted }}>Example</span>
          </div>
          <ul className="mt-4 grid gap-2.5" style={{ listStyle: "none", padding: 0 }}>
            {[["Rabies", "Valid until May 1, 2028", true], ["DHPP", "Valid until Dec 1, 2027", true], ["Bordetella", "Valid until Jun 3, 2027", false]].map(([n, d, ok]) => (
              <li key={n} className="rounded-2xl px-4 py-3" style={{ background: tokens.sky }}>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontFamily: B, fontWeight: 800, fontSize: 16.5, color: tokens.navy }}>{n}</span>
                  <span className="rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: ok ? "#EAF6EE" : "#EEF2F6", color: ok ? "#15803D" : "#475569", fontFamily: B, fontSize: 12.5, fontWeight: 800 }}>{ok ? "✓ Vet verified" : "Entered by you"}</span>
                </div>
                <div className="mt-0.5" style={{ fontFamily: B, fontSize: 14, color: tokens.ink }}>{d}{ok ? " · Dr. Sample, Sample Vet Clinic" : ""}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${WRAP} py-16 lg:py-24`}>
        <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold">Heading to Mexico or Canada?</h2>
        <p className="mt-3 max-w-[38rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Crossing a border with a dog means vet certificates that must be signed a few days before you fly, and a CDC form to come home. We tell you the exact days for each one.</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-[52rem]">
          {[["/mexico", "Mexico with your dog", "Two vet certificates, an inspection on landing, and the trip home."], ["/canada", "Canada with your dog", "The rabies certificate Canada checks, and the CDC form home."]].map(([href, title, body]) => (
            <a key={href} href={href} className="rounded-3xl p-6 block" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
              <div style={{ fontFamily: D, fontSize: 24, fontWeight: 800, color: tokens.navy }}>{title}</div>
              <p className="mt-2" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{body}</p>
              <span className="inline-block mt-4" style={{ fontFamily: B, fontWeight: 800, fontSize: 15.5, color: tokens.primary }}>Read the guide</span>
            </a>
          ))}
        </div>
      </section>

      <section id="pricing" style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-16 lg:py-24">
        <div className={WRAP}>
          <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold">What it costs</h2>
          <p className="mt-3 max-w-[38rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Checking your trip is always free. You only pay when a flight needs paperwork.</p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {PRICE_CARDS.map((c) => (
              <article key={c.title} className="rounded-3xl p-6 flex flex-col" style={{ background: c.dark ? tokens.navy : tokens.sky, color: c.dark ? "#fff" : tokens.navy }}>
                <h3 style={{ fontFamily: D, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{c.title}</h3>
                <p className="mt-0.5" style={{ fontFamily: B, fontSize: 15, color: c.dark ? "#C9D4E4" : tokens.muted }}>{c.sub}</p>
                <div className="mt-3 flex items-baseline gap-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{c.price}</span><span style={{ fontFamily: B, fontSize: 15, color: c.dark ? "#C9D4E4" : tokens.muted }}>{c.unit}</span></div>
                <p className="mt-4 flex-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.55, color: c.dark ? "#E7EDF6" : tokens.ink }}>{c.body}</p>
                <a href={c.href} className="mt-6 inline-flex items-center justify-center rounded-full min-h-[50px] px-6" style={{ background: c.dark ? tokens.primary : "#fff", color: c.dark ? "#fff" : tokens.navy, border: c.dark ? "none" : `1.5px solid ${tokens.line}`, fontFamily: B, fontWeight: 800, fontSize: 15.5, textDecoration: "none" }}>{c.cta}</a>
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
          <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-9 min-h-[58px] self-start lg:self-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Plan my pet&apos;s trip</a>
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
