import SiteHeader from "../../components/SiteHeader";
import Icon from "../../components/Icon";
import BusinessCard from "../../components/discover/BusinessCard";
import { Wordmark } from "../../components/Logo";
import { tokens, font } from "../../lib/theme";
import { PLANS, CHECKED_LINE } from "../../lib/discover";

export const metadata = {
  title: "For businesses: get discovered by pet owners",
  description: "List your pet business on PetPassGo for free. Featured and Premium placements put you in front of pet owners planning trips and caring for their pets.",
  alternates: { canonical: "/business" },
  openGraph: { title: "Grow your pet business with PetPassGo", url: "/business" },
};

// Clearly labeled examples. Not real advertisers.
const EXAMPLES = [
  { id: "e1", slug: "#", name: "Harbor Animal Clinic", category: "vet", subcategories: ["Veterinarian"], tagline: "Same-day sick visits and travel health certificates", city: "San Diego", state: "CA", plan: "premium", photos: [] },
  { id: "e2", slug: "#", name: "Suds & Tails Grooming", category: "grooming", subcategories: ["Dog groomer"], tagline: "Calm, fear-free grooming for dogs of every size", city: "Austin", state: "TX", plan: "featured", photos: [] },
  { id: "e3", slug: "#", name: "Lakeview Pet Sitters", category: "care", subcategories: ["Pet sitting"], tagline: "Drop-in visits and overnight sitting", city: "Chicago", state: "IL", plan: "free", photos: [] },
];

const D = font.display;
const B = font.body;

function Eyebrow({ children, light }) {
  return <div style={{ fontFamily: B, fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", color: light ? tokens.gold : tokens.primary }}>{children}</div>;
}

function Where({ icon, title, body, children }) {
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="p-5 flex items-center justify-center" style={{ background: tokens.sky, minHeight: 210 }}>{children}</div>
      <div className="p-5">
        <div className="flex items-center gap-2" style={{ fontFamily: D, fontSize: 20, fontWeight: 800, color: tokens.navy }}><span style={{ color: tokens.primary }}><Icon name={icon} size={20} /></span>{title}</div>
        <p style={{ fontFamily: B, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }} className="mt-1.5">{body}</p>
      </div>
    </div>
  );
}

function MiniRow({ icon, title, sub, tag, tagDark }) {
  return (
    <div className="rounded-2xl flex items-center gap-3 px-3 py-2.5 w-full" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 6px 16px rgba(20,33,61,.06)" }}>
      <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 38, height: 38, background: "#FDE8E2", color: tokens.primary }}><Icon name={icon} size={19} /></span>
      <div className="min-w-0 flex-1" style={{ fontFamily: B, fontSize: 13, color: tokens.ink, lineHeight: 1.35 }}><b style={{ color: tokens.navy }}>{title}</b><br />{sub}</div>
      {tag && <span className="rounded-full px-2 py-0.5 shrink-0" style={{ fontFamily: B, fontSize: 10.5, fontWeight: 800, background: tagDark ? tokens.navy : tokens.gold, color: tagDark ? tokens.gold : tokens.navy }}>{tag}</span>}
    </div>
  );
}

export default function BusinessLanding() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />

      <section style={{ background: tokens.navy }} className="px-4 sm:px-6 md:px-10 py-14 md:py-20">
        <div className="max-w-[1180px] mx-auto grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          <div>
            <Eyebrow light>FOR BUSINESSES</Eyebrow>
            <h1 style={{ fontFamily: D, color: "#fff", lineHeight: 1.04 }} className="text-[38px] md:text-[58px] font-bold mt-3">Grow your pet business with PetPassGo.</h1>
            <p style={{ fontFamily: B, fontSize: 19, color: "rgba(255,255,255,.82)", lineHeight: 1.55 }} className="mt-4 max-w-[36rem]">Get discovered by pet owners looking for vets, groomers, sitters, trainers, products and pet-friendly places, including travelers planning a trip to your city.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <a href="/business/listing" className="rounded-full px-7 py-3.5" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 700, fontSize: 16.5, textDecoration: "none" }}>Create your free listing</a>
              <a href="#plans" className="rounded-full px-7 py-3.5" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.35)", color: "#fff", fontFamily: B, fontWeight: 700, fontSize: 16.5, textDecoration: "none" }}>See plans</a>
            </div>
            <p style={{ fontFamily: B, fontSize: 14, color: "rgba(255,255,255,.6)" }} className="mt-4">Free to start. No card needed. You can upgrade later without rebuilding anything.</p>
          </div>
          <div className="relative">
            <div className="absolute -top-3 left-4 z-10 rounded-full px-3 py-1" style={{ background: tokens.gold, fontFamily: B, fontSize: 12, fontWeight: 800, color: tokens.navy }}>Example listing</div>
            <div style={{ transform: "rotate(-1.5deg)" }}><BusinessCard b={EXAMPLES[0]} href="#plans" /></div>
          </div>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-20">
        <Eyebrow>WHERE YOU SHOW UP</Eyebrow>
        <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.08 }} className="text-[30px] md:text-[42px] font-bold mt-2 max-w-[44rem]">In front of owners at the moment they need you.</h2>
        <p style={{ fontFamily: B, fontSize: 15, color: tokens.muted }} className="mt-2">The businesses below are made-up examples to show the layout.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mt-8">
          <Where icon="search" title="Discover search" body="Owners search by city and category. Every listing, free or paid, appears here.">
            <div className="w-full flex flex-col gap-2"><MiniRow icon="scissors" title="Suds & Tails Grooming" sub="Austin, TX" tag="Featured" /><MiniRow icon="scissors" title="Example Grooming Co." sub="Austin, TX" /></div>
          </Where>
          <Where icon="award" title="Featured placement" body="Top of your category in your city, labeled Featured, with Book and Call buttons.">
            <div className="w-full flex flex-col gap-2"><MiniRow icon="stethoscope" title="Harbor Animal Clinic" sub="Book · Call · Directions" tag="Featured" /></div>
          </Where>
          <Where icon="plane" title="Inside Travel Passes" body="Premium partners are suggested to travelers flying into their city, inside their trip checklist.">
            <div className="w-full rounded-2xl p-3" style={{ background: tokens.navy }}>
              <div style={{ fontFamily: B, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: tokens.gold }} className="mb-2">YOUR TRIP · SAN DIEGO</div>
              <MiniRow icon="stethoscope" title="Vet near your hotel" sub="Harbor Animal Clinic" tag="Premium" tagDark />
            </div>
          </Where>
          <Where icon="paw" title="Pet Vault care tips" body="Premium partners can be suggested when an owner needs that kind of care, like a groomer or trainer.">
            <div className="w-full flex flex-col gap-2"><MiniRow icon="award" title="Time for puppy training?" sub="Trainers near you" tag="Premium" tagDark /></div>
          </Where>
        </div>
        <p style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted, lineHeight: 1.55 }} className="mt-6 max-w-[48rem]">
          PetPassGo gives you more visibility. We can&apos;t promise a number of views, calls, bookings or sales. Paid placements are always labeled as sponsored, and every business still appears in normal search.
        </p>
      </section>

      <section id="plans" style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }} className="px-4 sm:px-6 md:px-10 py-14 md:py-20">
        <div className="max-w-[1180px] mx-auto">
          <Eyebrow>PLANS</Eyebrow>
          <h2 style={{ fontFamily: D, color: tokens.navy, lineHeight: 1.08 }} className="text-[30px] md:text-[42px] font-bold mt-2">Start free. Upgrade when you&apos;re ready.</h2>
          <div className="grid gap-5 lg:grid-cols-3 mt-8">
            {PLANS.map((p) => {
              const hi = p.id === "featured";
              return (
                <div key={p.id} className="rounded-3xl p-6 md:p-7 flex flex-col relative" style={{ background: hi ? tokens.navy : tokens.sky, color: hi ? "#fff" : tokens.ink, border: hi ? "none" : `1px solid ${tokens.line}` }}>
                  {hi && <span className="absolute -top-3 left-6 rounded-full px-3 py-1" style={{ background: tokens.gold, color: tokens.navy, fontFamily: B, fontSize: 12, fontWeight: 800 }}>Founding rate $99/mo</span>}
                  <div style={{ fontFamily: D, fontSize: 24, fontWeight: 800, color: hi ? "#fff" : tokens.navy }}>{p.name}</div>
                  <div className="flex items-baseline gap-1 mt-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 800, color: hi ? tokens.gold : tokens.navy }}>{p.price}</span>{p.per && <span style={{ fontFamily: B, fontSize: 16, opacity: 0.75 }}>{p.per}</span>}</div>
                  <div style={{ fontFamily: B, fontSize: 14, opacity: 0.8, lineHeight: 1.45 }} className="mt-1 min-h-[2.9em]">{p.note}</div>
                  <ul className="mt-5 flex flex-col gap-2.5 flex-1">
                    {p.points.map((x) => <li key={x} className="flex gap-2.5" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.45 }}><span className="mt-0.5 shrink-0" style={{ color: hi ? tokens.gold : tokens.green }}><Icon name="check" size={17} /></span>{x}</li>)}
                  </ul>
                  {p.id === "free" ? (
                    <a href="/business/listing" className="mt-7 text-center rounded-full py-3.5" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 700, textDecoration: "none" }}>Create free listing</a>
                  ) : (
                    <div className="mt-7 text-center rounded-full py-3.5" style={{ background: hi ? "rgba(255,255,255,.1)" : "#fff", border: `1.5px solid ${hi ? "rgba(255,255,255,.35)" : tokens.line}`, fontFamily: B, fontWeight: 700, color: hi ? "#fff" : tokens.navy }}>Upgrade from your dashboard · opening soon</div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted, lineHeight: 1.55 }} className="mt-6">
            Business plans are separate from PetPassGo&apos;s plans for pet owners. Featured and Premium are monthly and you can cancel any time. Premium spots are limited in each category and city.
          </p>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-20">
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <div className="grid gap-5 md:grid-cols-3 mt-6">
          {[
            ["1", "Create your listing", "Add your details, pet policy and up to 3 photos. You'll see a live preview as you type."],
            ["2", "We check it", `PetPassGo reviews every listing before it goes live, usually within 2 business days. Listings show "${CHECKED_LINE}."`],
            ["3", "Keep it fresh", "Update hours, photos or your pet policy any time from your dashboard. Changes get a quick re-check."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-3xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: D, fontSize: 40, fontWeight: 800, color: tokens.line, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: D, fontSize: 21, fontWeight: 800, color: tokens.navy }} className="mt-3">{t}</div>
              <p style={{ fontFamily: B, fontSize: 15.5, color: tokens.ink, lineHeight: 1.5 }} className="mt-1.5">{d}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl p-7 md:p-10 mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5" style={{ background: tokens.navy }}>
          <div>
            <Wordmark size={24} onDark />
            <div style={{ fontFamily: D, fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1.15 }} className="mt-3">Your free listing takes about 5 minutes.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/business/listing" className="rounded-full px-7 py-3.5" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 700, textDecoration: "none" }}>Create your free listing</a>
            <a href="/business/dashboard" className="rounded-full px-7 py-3.5" style={{ background: "transparent", border: "1px solid rgba(255,255,255,.4)", color: "#fff", fontFamily: B, fontWeight: 700, textDecoration: "none" }}>Business log in</a>
          </div>
        </div>
      </section>
    </div>
  );
}
