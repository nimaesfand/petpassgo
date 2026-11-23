import Image from "next/image";
import { tokens, font } from "../lib/theme";
import SiteHeader from "../components/SiteHeader";
import { Wordmark } from "../components/Logo";
import WelcomeBack from "../components/home/WelcomeBack";
import HomePassport from "../components/home/HomePassport";
import { FAQ } from "../lib/faq";
import { AIRLINE_GUIDES } from "../lib/airlineGuides";
import { PRICES as P } from "../lib/pricing";
import TravelModeDemo from "../components/home/TravelModeDemo";
import QRCode from "qrcode";

const D = font.display;
const B = font.body;

export const metadata = {
  title: { absolute: "PetPassGo | Fly with your pet" },
  description: "Can your pet fly with you? Find out what your airline, destination and pet need before you book. Checking your trip is free.",
};

const STEPS = [
  { n: "1", title: "Tell us about the trip", body: "Where and when you're flying. Haven't booked yet? We show which airlines take your pet and what each one charges." },
  { n: "2", title: "See what your pet needs", body: "A checklist of everything to do before you fly, with dates. Simple flights are free." },
  { n: "3", title: "Keep it in their passport", body: "Records, vaccines and the microchip in one place, ready to show at the airport on every trip." },
];

const VET_STEPS = [
  { title: "Send your vet a link", body: "In Pet Vault, enter your clinic's email. We send them a private link. They don't need an account." },
  { title: "Your vet checks and confirms", body: "They match each vaccine to their own files and tick the ones that are right. It takes about a minute." },
  { title: "Your records show as vet verified", body: "With your vet's name, clinic and the date, on the passport and in travel mode. If they don't reply, we remind them and let you know." },
];

const QR_STEPS = [
  { title: "Someone scans the tag", body: "Any phone camera works. No app needed." },
  { title: "They see your pet's page", body: "Their photo, name and a button to message you. Your contact info stays private." },
  { title: "You get an email right away", body: "With their message and how to reach them. Mark your pet as lost and scans alert you too, with the approximate city they came from." },
];

const PRICE_CARDS = [
  { title: "Free checklist", sub: "For simple flights", price: "$0", unit: "with a free account", body: "Small pets in the cabin on U.S. flights with one airline.", checks: ["Every step for your flight, in order", "Your airline's pet fee and carrier size", "Saved to your account for travel day"], note: { strong: "No card needed.", text: "Check your flight in about 2 minutes." }, cta: "Check my flight", href: "/assessment", bordered: true },
  { title: "Travel Pass", sub: "For flights that need paperwork", price: P.memberPass, unit: "per trip, with Pet Vault", body: "Mexico, Canada and Hawaii, service dogs, pets flying as cargo, and trips that switch airlines. Your exact dates, reminders, forms filled in, and a check that your pet's vaccines and certificates are valid for the trip. One price covers the round trip, for up to 2 pets.", guarantee: true, cta: "Plan my pet's trip", href: "/assessment", dark: true },
  { title: "Pet Vault", sub: "Your pet's passport and records", price: P.member, unit: "a month", body: `Your pet's passport, vet-confirmed records, travel mode, reminders, lost pet alerts, and the DOT form filled in for service dogs. Add a Travel Pass for ${P.memberPass} when a trip needs paperwork. Cancel anytime.`, note: { strong: "Make the passport free.", text: `We hold it for 7 days. Keep it for ${P.member} a month.` }, cta: "Make their passport", href: "/passport/create", accent: true, tag: "Best for records and frequent travel" },
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

export default async function PetPassGoLanding() {
  const tagQr = await QRCode.toString("https://www.petpassgo.com/pet-vault", { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#14213D", light: "#ffffff" } }).catch(() => "");
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
          <h1 style={{ fontFamily: D, color: "#fff", lineHeight: .98, letterSpacing: "-0.02em" }} className="text-[54px] sm:text-[76px] lg:text-[92px] font-extrabold max-w-[11ch]">Bring them along.</h1>
          <p style={{ fontFamily: B, color: "#E7EDF6", lineHeight: 1.5 }} className="mt-5 text-[18px] sm:text-[20px] max-w-[30rem]"><b style={{ color: "#fff", fontWeight: 800 }}>Can your pet fly with you?</b> Find out what your airline, destination and pet need before you book.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-9 min-h-[58px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Plan my pet&apos;s trip</a>
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
        <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold max-w-[20ch]">Flying somewhere that needs paperwork?</h2>
        <p className="mt-3 max-w-[38rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Crossing a border with a dog means vet certificates that must be signed before you fly, and a CDC form to come home. The timing is where most people get it wrong. We give you the exact dates for your flights and help you fill in each form.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[["/mexico", "Mexico", "Two vet certificates, an inspection when you land, and what you need to come home."], ["/canada", "Canada", "The rabies certificate Canada asks for, and the CDC form to come home."], ["/service-dog", "Service dogs", "The DOT form, what airlines can ask, and how to get ready for the airport."]].map(([href, title, body]) => (
            <a key={href} href={href} className="rounded-3xl p-6 block" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
              <div style={{ fontFamily: D, fontSize: 24, fontWeight: 800, color: tokens.navy }}>{title}</div>
              <p className="mt-2" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{body}</p>
              <span className="inline-block mt-4" style={{ fontFamily: B, fontWeight: 800, fontSize: 15.5, color: tokens.primary }}>Read the guide</span>
            </a>
          ))}
        </div>
        <p className="mt-5" style={{ fontFamily: B, fontSize: 15.5, color: tokens.muted }}>Also covered: Hawaii, pets flying as cargo, and trips that switch airlines. <a href="/assessment" style={{ color: tokens.navy, fontWeight: 800 }}>Check your trip</a></p>
      </section>

      <section style={{ background: tokens.navy }} className="py-16 lg:py-24 overflow-hidden">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(0,1fr)_minmax(560px,640px)] gap-12 items-center`}>
          <div>
            <h2 style={{ fontFamily: D, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[36px] md:text-[52px] font-extrabold max-w-[14ch]">A passport made for your pet.</h2>
            <p className="mt-5 max-w-[32rem]" style={{ fontFamily: B, color: "#D5DEEB", fontSize: 18, lineHeight: 1.55 }}>Their details, vaccines and microchip in one place. Your vet can confirm the records, and at the airport travel mode shows everything on one screen.</p>
            <ul className="mt-6 grid gap-3 max-w-[32rem]" style={{ listStyle: "none", padding: 0 }}>
              {["Vaccines confirmed by your vet", "Travel mode: all their documents in one tap", "Reminders before vaccines and documents expire", "Lost pet alerts from their QR tag"].map((t) => (
                <li key={t} className="flex gap-3" style={{ fontFamily: B, fontSize: 16.5, color: "#fff" }}><span style={{ color: tokens.gold, fontWeight: 800 }}>✓</span>{t}</li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-5">
              <a href="/passport/create" className="mt-6 inline-flex items-center justify-center rounded-full px-8 min-h-[54px]" style={{ background: "#fff", color: tokens.navy, fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>Make your pet&apos;s passport, free</a>
              <TravelModeDemo />
            </div>
          </div>
          <div className="w-full max-w-[640px] mx-auto">
            <HomePassport />
            <p className="mt-3 text-center" style={{ fontFamily: B, fontSize: 14, color: "#AFC0D6" }}>Meet Benny. Tap the passport to flip it.</p>
          </div>
        </div>
      </section>

      <section style={{ background: tokens.sky }} className="py-16 lg:py-24">
        <div className={`${WRAP} grid lg:grid-cols-[minmax(320px,440px)_1fr] gap-12 items-center`}>
          <div className="order-2 lg:order-1 flex items-center justify-center gap-5 flex-wrap" aria-label="Example of a QR tag and the email you get">
            <div className="flex flex-col items-center">
              <div className="rounded-full flex items-center justify-center" style={{ width: 150, height: 150, background: "linear-gradient(145deg, #E9EEF5, #C9D3E0)", boxShadow: "0 14px 34px rgba(20,33,61,.18), inset 0 2px 0 #fff" }}>
                <div className="rounded-full bg-white flex flex-col items-center justify-center" style={{ width: 126, height: 126 }}>
                  <div style={{ width: 70, height: 70 }} dangerouslySetInnerHTML={{ __html: tagQr.replace("<svg", '<svg width="70" height="70"') }} />
                  <div style={{ fontFamily: B, fontSize: 9.5, fontWeight: 800, letterSpacing: ".12em", color: tokens.navy, marginTop: 5 }}>SCAN ME · BENNY</div>
                </div>
              </div>
              <span className="mt-2" style={{ fontFamily: B, fontSize: 13, color: tokens.muted }}>Their collar tag</span>
            </div>
            <div className="rounded-2xl p-4 w-full max-w-[290px]" style={{ background: "#fff", boxShadow: "0 18px 44px rgba(20,33,61,.12)", border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: B, fontSize: 12, color: tokens.muted }}>From PetPassGo · just now</div>
              <div className="mt-1" style={{ fontFamily: B, fontSize: 15, fontWeight: 800, color: tokens.navy, lineHeight: 1.3 }}>Someone sent a message about Benny</div>
              <p className="mt-2 rounded-xl px-3 py-2" style={{ background: tokens.sky, fontFamily: B, fontSize: 14, color: tokens.ink, lineHeight: 1.45 }}>&ldquo;Found him by the park on Lake Ave. He&apos;s safe with me at the coffee shop.&rdquo;</p>
              <div className="mt-2" style={{ fontFamily: B, fontSize: 13, color: tokens.ink }}>Their contact: (555) 010-2233</div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[32px] md:text-[44px] font-extrabold max-w-[16ch]">If they ever get lost.</h2>
            <p className="mt-3 max-w-[34rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Every passport comes with a QR code for their collar tag. Print it at home in 3 tag sizes.</p>
            <ol className="mt-7 grid gap-5 max-w-[34rem]" style={{ listStyle: "none", padding: 0 }}>
              {QR_STEPS.map((t, i) => (
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
        </div>
      </section>

      <section className={`${WRAP} py-16 lg:py-24 grid lg:grid-cols-[1fr_minmax(320px,460px)] gap-12 items-center`}>
        <div>
          <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05, letterSpacing: "-0.01em" }} className="text-[32px] md:text-[44px] font-extrabold max-w-[16ch]">Records your vet confirms.</h2>
          <p className="mt-3 max-w-[34rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Anyone can type in a vaccine date. When your vet confirms it, you know your records are right and organized, ready when you need them. Official travel health certificates still come from your vet, and some trips also need USDA approval.</p>
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
        <div className="relative" aria-label="Example of vet-verified records">
          <div aria-hidden="true" className="absolute -inset-3 rounded-[32px]" style={{ background: "linear-gradient(135deg, #FDE7C2 0%, #DDF3E4 100%)", transform: "rotate(-2.5deg)" }} />
          <div className="relative rounded-3xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 24px 60px rgba(20,33,61,.16)" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: tokens.navy }}>
              <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 48, height: 48, border: `2.5px solid ${tokens.gold}` }}>
                <img src="/images/hero-golden-retriever.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 22%" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontFamily: D, fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Benny&apos;s vaccines</div>
                <div style={{ fontFamily: B, fontSize: 13, color: "#C9D4E4" }}>Example</div>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center text-center rounded-full" style={{ width: 62, height: 62, border: `2px dashed ${tokens.gold}`, color: tokens.gold, fontFamily: B, fontSize: 9.5, fontWeight: 800, letterSpacing: ".08em", lineHeight: 1.15, transform: "rotate(-10deg)" }}>VET<br />VERIFIED</div>
            </div>
            <ul className="p-4 grid gap-2.5" style={{ listStyle: "none", margin: 0 }}>
              {[["Rabies", "Valid until May 1, 2028", true, "#FEE2E2", "#B91C1C"], ["DHPP", "Valid until Dec 1, 2027", true, "#E0F2FE", "#0369A1"], ["Bordetella", "Valid until Jun 3, 2027", false, "#FEF3C7", "#B45309"]].map(([n, d, ok, bg, fg]) => (
                <li key={n} className="flex items-center gap-3 rounded-2xl px-3.5 py-3" style={{ background: ok ? "#F3FBF6" : tokens.sky }}>
                  <span className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: bg, color: fg }} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6" /></svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ fontFamily: B, fontWeight: 800, fontSize: 16.5, color: tokens.navy }}>{n}</span>
                      <span className="rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: ok ? "#15803D" : "#E2E8F0", color: ok ? "#fff" : "#475569", fontFamily: B, fontSize: 12, fontWeight: 800 }}>{ok ? "✓ Vet verified" : "Entered by you"}</span>
                    </div>
                    <div style={{ fontFamily: B, fontSize: 13.5, color: tokens.ink }}>{d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-5 -mt-1" style={{ fontFamily: B, fontSize: 13.5, color: tokens.muted, lineHeight: 1.45 }}>
              Confirmed by <b style={{ color: tokens.navy }}>Dr. Maya Lee</b>, Sunset Animal Clinic, on Nov 2, 2026
            </div>
          </div>
        </div>
      </section>


      <section className={`${WRAP} py-16 lg:py-20`}>
        <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold max-w-[20ch]">Where our information comes from.</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[["Checked against the rule makers", "We check every rule against USDA, the CDC, the destination's government and each airline's own pet policy."], ["Dated and rechecked", "Each rule shows when we last checked it against the official page, and we keep rechecking them."], ["Backed by a guarantee", "If your pet is refused boarding because our information was wrong, we refund your Travel Pass."]].map(([t, b]) => (
            <div key={t} className="rounded-3xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <h3 style={{ fontFamily: D, fontSize: 21, fontWeight: 800, color: tokens.navy }}>{t}</h3>
              <p className="mt-2" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-5" style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted, lineHeight: 1.5 }}>PetPassGo is a travel-prep tool, not a government agency. Official health certificates come from your vet, and airlines make the final call at the counter. <a href="/guarantee" style={{ color: tokens.navy, fontWeight: 700 }}>Flight-Ready Guarantee</a></p>
      </section>

      <section id="pricing" style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="py-16 lg:py-24">
        <div className={WRAP}>
          <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] md:text-[44px] font-extrabold">What it costs</h2>
          <p className="mt-3 max-w-[38rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Checking your trip is always free. You only pay when a flight needs paperwork.</p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {PRICE_CARDS.map((c) => (
              <article key={c.title} className="rounded-3xl p-6 flex flex-col" style={{ background: c.dark ? tokens.navy : c.accent ? "#fff" : tokens.sky, color: c.dark ? "#fff" : tokens.navy, border: c.accent || c.bordered ? `2px solid ${tokens.primary}` : "none", boxShadow: c.accent ? "0 18px 44px rgba(194,65,12,.14)" : "none" }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 style={{ fontFamily: D, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{c.title}</h3>
                  {c.tag ? <span className="rounded-full px-3 py-1" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>{c.tag}</span> : null}
                </div>
                <p className="mt-0.5" style={{ fontFamily: B, fontSize: 15, color: c.dark ? "#C9D4E4" : tokens.muted }}>{c.sub}</p>
                <div className="mt-3 flex items-baseline gap-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{c.price}</span><span style={{ fontFamily: B, fontSize: 15, color: c.dark ? "#C9D4E4" : tokens.muted }}>{c.unit}</span></div>
                <p className={`mt-4 ${c.checks ? "" : "flex-1"}`} style={{ fontFamily: B, fontSize: 16, lineHeight: 1.55, color: c.dark ? "#E7EDF6" : tokens.ink }}>{c.body}</p>
                {c.checks ? <ul className="mt-3 flex flex-col gap-2">{c.checks.map((t) => <li key={t} className="flex items-start gap-2" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.4, color: tokens.ink }}><span aria-hidden="true" className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 20, height: 20, marginTop: 1, background: tokens.green, color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>{t}</li>)}</ul> : null}
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
