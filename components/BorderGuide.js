import SiteHeader from "./SiteHeader";
import Icon from "./Icon";
import { TrackOnMount } from "./Analytics";
import { PRICES as P } from "../lib/pricing";
import { tokens, font } from "../lib/theme";

const D = font.display;
const B = font.body;

// One page per border country: what you'll need (the "what", not the step-by-step
// "how", which is the Travel Pass). Content lives in app/<country>/page.js.
export default function BorderGuide({ g }) {
  const cta = `/assessment?region=near&pet=dog`;
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="landing" contentName={g.name} />
      <main>
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 lg:pt-14 pb-8">
          <p style={{ fontFamily: B, fontSize: 15, fontWeight: 800, letterSpacing: "0.08em", color: tokens.primary }}>{g.eyebrow}</p>
          <h1 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.05, textWrap: "balance" }} className="text-[36px] sm:text-[52px] mt-2 max-w-[48rem]">{g.title}</h1>
          <p style={{ fontFamily: B, fontSize: 19, lineHeight: 1.5, color: tokens.ink }} className="mt-4 max-w-[42rem]">{g.lead}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href={cta} className="inline-flex items-center justify-center rounded-full px-8 min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Get my dates and forms</a>
            <a href="#steps" hidden className="hidden items-center justify-center rounded-full px-6 min-h-[54px]" style={{ background: "#fff", color: tokens.navy, border: `1.5px solid ${tokens.line}`, fontFamily: B, fontWeight: 800, fontSize: 16, textDecoration: "none" }}>See every step</a>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8">
            {g.stats.map(([k, v]) => (
              <div key={k} className="rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <div className="text-[20px] sm:text-[26px]" style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.1 }}>{v}</div>
                <div className="mt-0.5 text-[12.5px] sm:text-[14.5px]" style={{ fontFamily: B, color: tokens.muted, lineHeight: 1.3 }}>{k}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="steps" className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-12" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[30px] sm:text-[38px]">What you&apos;ll need</h2>
          <p className="mt-1" style={{ fontFamily: B, fontSize: 16, color: tokens.muted }}>For a dog flying in the cabin from the U.S. Last checked {g.checked}.</p>
          <div className="grid gap-4 mt-5 sm:grid-cols-3">
            {g.phases.map((ph) => (
              <div key={ph.title} className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <div className="px-5 py-3.5" style={{ background: tokens.navy, color: "#fff", fontFamily: D, fontWeight: 800, fontSize: 19 }}>{ph.title}</div>
                <ul className="px-5 py-4 grid gap-3" style={{ listStyle: "none", margin: 0 }}>
                  {ph.steps.map((st) => (
                    <li key={st.title} className="flex gap-3 items-start" style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.navy, lineHeight: 1.35 }}>
                      <span className="flex-shrink-0 flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: st.warn ? "#FFF1E6" : "#EAF2FB", color: st.warn ? "#C2410C" : tokens.navy }}><Icon name={st.icon || "check"} size={16} /></span>
                      <span>{st.short || st.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {g.cats ? <p className="mt-4 rounded-2xl px-4 py-3" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: B, fontSize: 15.5, lineHeight: 1.5, color: tokens.ink }}><b style={{ color: tokens.navy }}>Flying with a cat?</b> {g.cats}</p> : null}
        </section>

        <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }}>
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
            <div>
              <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[28px] sm:text-[36px]">The rules are the easy part. The timing isn&apos;t.</h2>
              <p className="mt-3" style={{ fontFamily: B, fontSize: 17, lineHeight: 1.55, color: tokens.ink }}>
                Each certificate has to be signed within a short window before your flight, and the CDC form has its own deadline before you fly home. Miss one and your dog can be turned away. Your Travel Pass turns these rules into your own checklist, with the exact dates for your flights.
              </p>
              <ul className="mt-4 grid gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Your vet visit dates, worked out from your flights", "Reminders before every deadline", "Your CDC form answers, ready to copy in", "Checks your dog is old enough to come home", "Everything in travel mode at the airport"].map((t) => (
                  <li key={t} className="flex gap-2" style={{ fontFamily: B, fontSize: 16, color: tokens.ink }}><span style={{ color: tokens.green, marginTop: 2 }}><Icon name="check" size={17} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-6" style={{ background: tokens.sky }}>
              <div style={{ fontFamily: B, fontSize: 14, fontWeight: 800, letterSpacing: ".06em", color: tokens.muted }}>TRAVEL PASS · {g.name.toUpperCase()}</div>
              <div className="mt-1 flex items-baseline gap-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 800, color: tokens.navy }}>{P.memberPass}</span><span style={{ fontFamily: B, color: tokens.muted }}>one trip, there and back, with Pet Vault ({P.member}/mo)</span></div>
              <p className="mt-1" style={{ fontFamily: B, fontSize: 15, color: tokens.ink }}>Per trip, with Pet Vault ({P.member} a month, cancel anytime). Checking your trip is free.</p>
              <a href={cta} className="mt-4 flex items-center justify-center rounded-full min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Get my dates and forms</a>
            </div>
          </div>
        </section>


      </main>
    </div>
  );
}
