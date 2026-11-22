import SiteHeader from "../../components/SiteHeader";
import Icon from "../../components/Icon";
import HomePassport from "../../components/home/HomePassport";
import { TrackOnMount } from "../../components/Analytics";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";
import { DOT_AIR_FORM_PAGE } from "../../lib/dotFormLinks";

export const metadata = {
  title: "Service Dog Travel Kit: get your service dog ready to fly",
  description: "Everything airlines check for a service dog, ready in about 10 minutes: the DOT form filled in, your signed handler statement, vet-confirmed vaccines and a pet passport for the airport.",
  alternates: { canonical: "/service-dog-kit" },
};

const D = font.display;
const B = font.body;
const START = "/service-dog-kit/start";
const TEAL = "#0F766E";

// What people often buy, and what actually helps at the airport.
const KIT = [
  ["An ID card", "A pet passport you can print or keep on your phone, with a number anyone can check"],
  ["A certificate", "Your signed handler statement: who trained your dog, and what they're trained to do"],
  ["A registration number", "The DOT Service Animal form, filled in for every trip and ready to sign"],
  [null, "Vaccines confirmed by your own vet"],
  [null, "Travel mode: everything about your dog on one screen at the airport"],
  [null, "Your airline's own steps and deadlines for your flight, with reminders"],
];

const CHECKS = [
  { icon: "award", title: "A dog trained for your disability", body: "Trained to do work or tasks for you. You can train the dog yourself. Your signed statement in the passport records how.", got: "Your handler statement" },
  { icon: "file", title: "The DOT Service Animal form", body: "The free U.S. government form airlines can ask for once per trip, about your dog's training, health and behavior. Some airlines want it 48 hours ahead.", got: "Filled in for every trip" },
  { icon: "clock", title: "The relief form, for flights of 8+ hours", body: "How your dog will relieve itself on a long flight, or that it won't need to.", got: "Added when your flight needs it" },
  { icon: "health", title: "Healthy, vaccinated and well behaved", body: "Rabies vaccine on file, on a leash or harness, and fitting at your feet or on your lap.", got: "Vet-confirmed records" },
];

const FAQ = [
  ["Is this a service dog registration?", "No. The U.S. has no official service dog registry, and airlines don't look one up. Your kit is the paperwork airlines actually ask for, filled in, organized and ready to show."],
  ["Can I train my dog myself?", "Yes. The DOT doesn't require a professional trainer or program. You tell us who trained your dog, and that goes on your statement and the DOT form."],
  ["What does it cost?", `${P.joinToday} to start: your first month of Pet Vault (${P.member}) and a Travel Pass for your trip at the member price (${P.memberPass}). Cancel Pet Vault anytime. We never charge for the service dog statement itself.`],
  ["What if my dog is an emotional support animal?", "Since 2021, U.S. airlines treat emotional support animals as pets. Take the 30-second check and we'll show you which airline is cheapest for your trip and what your pet needs."],
];

export default function ServiceDogKitPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="landing" contentName="Service dog kit" />
      <main>
        <section style={{ background: tokens.navy }} className="overflow-hidden">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-10 py-12 lg:py-20 grid lg:grid-cols-[minmax(0,1fr)_minmax(540px,600px)] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "rgba(15,118,110,.25)", color: "#9FE6DA", fontFamily: B, fontWeight: 800, fontSize: 14 }}>
                <Icon name="shield" size={16} /> Service Dog Travel Kit
              </span>
              <h1 style={{ fontFamily: D, fontWeight: 800, color: "#fff", lineHeight: 1.02, letterSpacing: "-0.02em", textWrap: "balance" }} className="text-[40px] sm:text-[58px] mt-4 max-w-[13ch]">
                Get your service dog ready to fly.
              </h1>
              <p style={{ fontFamily: B, fontSize: 19, lineHeight: 1.5, color: "#D5DEEB" }} className="mt-4 max-w-[32rem]">
                Everything airlines check, ready in about 10 minutes. All in your dog&apos;s passport, on your phone at the gate.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-7">
                <a href={START} className="inline-flex items-center justify-center rounded-full px-8 min-h-[56px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Build my dog&apos;s kit</a>
                <a href="#kit" style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: "#fff", textDecoration: "underline", textUnderlineOffset: 4 }}>See what&apos;s in it</a>
              </div>
              <p className="mt-4" style={{ fontFamily: B, fontSize: 14.5, color: "#AFC0D6" }}>Takes 30 seconds to see what your dog needs. Free to check.</p>
            </div>
            <div className="w-full max-w-[600px] mx-auto">
              <HomePassport />
              <p className="mt-3 text-center" style={{ fontFamily: B, fontSize: 14, color: "#AFC0D6" }}>Benny&apos;s passport, with his signed service dog statement.</p>
            </div>
          </div>
        </section>

        <section id="kit" className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14 lg:py-20" style={{ scrollMarginTop: 72 }}>
          <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] sm:text-[44px] max-w-[20ch]">What&apos;s in your kit</h2>
          <p className="mt-3 max-w-[40rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>
            Most service dog kits give you a card and a certificate. Yours comes with the things that help at the airport.
          </p>
          <div className="mt-8 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]" style={{ background: tokens.sky, borderBottom: `1px solid ${tokens.line}` }}>
              <div className="px-4 sm:px-6 py-3" style={{ fontFamily: B, fontWeight: 800, fontSize: 14.5, color: tokens.muted }}>Instead of</div>
              <div className="px-4 sm:px-6 py-3" style={{ fontFamily: B, fontWeight: 800, fontSize: 14.5, color: TEAL }}>Your PetPassGo kit</div>
            </div>
            {KIT.map(([old, ours], i) => (
              <div key={ours} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] items-center" style={{ borderTop: i ? `1px solid ${tokens.line}` : "none" }}>
                <div className="px-4 sm:px-6 py-4" style={{ fontFamily: B, fontSize: 16, color: old ? tokens.muted : "#9AA4B2" }}>{old || "Not included"}</div>
                <div className="px-4 sm:px-6 py-4 flex gap-3 items-start" style={{ fontFamily: B, fontSize: 16.5, fontWeight: 600, color: tokens.navy, lineHeight: 1.45 }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: TEAL }}><Icon name="check" size={18} /></span>{ours}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }}>
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14 lg:py-20">
            <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] sm:text-[44px] max-w-[22ch]">The 4 things airlines check</h2>
            <p className="mt-3 max-w-[40rem]" style={{ fontFamily: B, fontSize: 18, lineHeight: 1.5, color: tokens.ink }}>Under U.S. Department of Transportation rules, this is what an airline can ask for. Your kit covers each one.</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {CHECKS.map((c) => (
                <div key={c.title} className="rounded-3xl p-5 sm:p-6 flex flex-col" style={{ background: tokens.sky }}>
                  <span className="flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: "#E3F5F2", color: TEAL }}><Icon name={c.icon} size={24} /></span>
                  <div className="mt-3" style={{ fontFamily: B, fontWeight: 800, fontSize: 19, color: tokens.navy }}>{c.title}</div>
                  <p className="mt-1 flex-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{c.body}</p>
                  <span className="inline-flex items-center gap-1.5 mt-4 self-start rounded-full px-3 py-1.5" style={{ background: TEAL, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 13.5 }}><Icon name="check" size={14} /> {c.got}</span>
                </div>
              ))}
            </div>
            <p className="mt-6" style={{ fontFamily: B, fontSize: 14.5, lineHeight: 1.5, color: tokens.muted }}>
              Source: <a href={DOT_AIR_FORM_PAGE} target="_blank" rel="noopener" style={{ color: tokens.navy, fontWeight: 700 }}>U.S. Department of Transportation</a>. Airlines can also have their own steps, which your Travel Pass adds for your flight.
            </p>
              <div><a href="/service-dog/dot-form" className="inline-flex items-center justify-center rounded-full px-5 mt-3" style={{ minHeight: 46, background: "#fff", color: tokens.navy, border: `1.5px solid ${tokens.navy}`, fontWeight: 700, fontSize: 15.5, textDecoration: "none" }}>How to fill out the DOT form</a></div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14 lg:py-20 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-10 items-start">
          <div>
            <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.05 }} className="text-[32px] sm:text-[44px]">How it works</h2>
            <ol className="mt-7 grid gap-5" style={{ listStyle: "none", padding: 0 }}>
              {[
                ["Take the 30-second check", "Tell us about your dog and your trip. We show you exactly what you need."],
                ["Build the passport", "Add your dog's details and vaccines, sign the service dog statement, and send your vet a link to confirm the records."],
                ["Get your flight ready", "Your Travel Pass fills in the DOT form and lists your airline's steps and deadlines."],
                ["Show it at the airport", "Open travel mode and everything is on one screen."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 38, height: 38, background: tokens.navy, color: tokens.gold, fontFamily: D, fontWeight: 800 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontFamily: B, fontWeight: 800, fontSize: 19, color: tokens.navy }}>{t}</div>
                    <p className="mt-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${TEAL}`, boxShadow: "0 18px 44px rgba(15,118,110,.14)" }}>
            <div style={{ fontFamily: B, fontWeight: 800, fontSize: 15, color: TEAL }}>Service Dog Travel Kit</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span style={{ fontFamily: D, fontSize: 48, fontWeight: 800, color: tokens.navy, lineHeight: 1 }}>{P.joinToday}</span>
              <span style={{ fontFamily: B, fontSize: 15, color: tokens.muted }}>to start</span>
            </div>
            <ul className="mt-4 grid gap-2.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                `Pet Vault, first month (${P.member}): passport, statement, vet-confirmed records, travel mode`,
                `Travel Pass for your trip (${P.memberPass} member price): the DOT form filled in, your airline's steps and dates`,
                "Round trip, for up to 2 dogs",
                "Cancel Pet Vault anytime",
              ].map((t) => (
                <li key={t} className="flex gap-2.5" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.45, color: tokens.ink }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: TEAL }}><Icon name="check" size={16} /></span>{t}
                </li>
              ))}
            </ul>
            <a href={START} className="mt-6 flex items-center justify-center rounded-full min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Build my dog&apos;s kit</a>
            <p className="mt-3 text-center" style={{ fontFamily: B, fontSize: 13.5, color: tokens.muted }}>Checking what your dog needs is free.</p>
          </div>
        </section>

        <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}` }}>
          <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-14">
            <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[30px] sm:text-[38px]">Questions</h2>
            <div className="mt-6 grid gap-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="rounded-2xl px-5 py-4" style={{ border: `1px solid ${tokens.line}`, background: tokens.sky }}>
                  <summary className="cursor-pointer" style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.navy }}>{q}</summary>
                  <p className="mt-2" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.55, color: tokens.ink }}>{a}</p>
                </details>
              ))}
            </div>
            <p className="mt-6" style={{ fontFamily: B, fontSize: 14, lineHeight: 1.5, color: tokens.muted }}>
              PetPassGo doesn&apos;t certify, register or approve service dogs. Your statement and the DOT form are your own, and knowingly false statements can lead to fines. More in our <a href="/service-dog" style={{ color: tokens.navy, fontWeight: 700 }}>service dog guide</a>.
            </p>
          </div>
        </section>

        <section style={{ background: tokens.navyDeep }} className="py-14">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <h2 style={{ fontFamily: D, fontWeight: 800, color: "#fff", lineHeight: 1.05 }} className="text-[32px] sm:text-[44px] max-w-[18ch]">See what your dog needs for your trip.</h2>
            <a href={START} className="inline-flex items-center justify-center rounded-full px-9 min-h-[56px] self-start lg:self-auto" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17.5, textDecoration: "none" }}>Take the 30-second check</a>
          </div>
        </section>
      </main>
    </div>
  );
}
