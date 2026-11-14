import SiteHeader from "./SiteHeader";
import Icon from "./Icon";
import { TrackOnMount } from "./Analytics";
import { PRICES as P } from "../lib/pricing";
import { tokens, font } from "../lib/theme";

const D = font.display;
const B = font.body;

// One page per border country: everything in the order you'll need it, with
// the official source for each rule. Content lives in app/<country>/page.js.
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
            <a href={cta} className="inline-flex items-center justify-center rounded-full px-8 min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Check my {g.name} trip</a>
            <a href="#steps" className="hidden sm:inline-flex items-center justify-center rounded-full px-6 min-h-[54px]" style={{ background: "#fff", color: tokens.navy, border: `1.5px solid ${tokens.line}`, fontFamily: B, fontWeight: 800, fontSize: 16, textDecoration: "none" }}>See every step</a>
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

        {g.traps?.length ? (
          <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-8">
            <div className="rounded-3xl p-5 sm:p-6" style={{ background: "#FFF4EC", border: "1px solid #F6C9A9" }}>
              <div className="flex items-center gap-2" style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: "#9A3412" }}><Icon name="alert" size={20} /> Where people get stuck</div>
              <ul className="mt-3 grid gap-2.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {g.traps.map((t) => (
                  <li key={t.title} style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}><b style={{ color: tokens.navy }}>{t.title}</b> {t.body}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section id="steps" className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-12" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[30px] sm:text-[38px]">Every step, in order</h2>
          <p className="mt-1" style={{ fontFamily: B, fontSize: 16, color: tokens.muted }}>For a dog flying in the cabin from the U.S. Last checked {g.checked}.</p>
          <div className="grid gap-4 mt-5">
            {g.phases.map((ph, pi) => (
              <div key={ph.title} className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <div className="px-5 py-3.5 flex items-center gap-3" style={{ background: tokens.navy, color: "#fff" }}>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: tokens.gold, color: tokens.navy, fontFamily: D, fontWeight: 800 }}>{pi + 1}</span>
                  <div>
                    <div style={{ fontFamily: D, fontWeight: 800, fontSize: 20, lineHeight: 1.15 }}>{ph.title}</div>
                    {ph.when ? <div style={{ fontFamily: B, fontSize: 13.5, color: "rgba(255,255,255,.75)" }}>{ph.when}</div> : null}
                  </div>
                </div>
                <ul className="divide-y" style={{ listStyle: "none", padding: 0, margin: 0, borderColor: tokens.line }}>
                  {ph.steps.map((s) => (
                    <li key={s.title} className="px-5 py-4 flex gap-3.5">
                      <span className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: s.warn ? "#FFF1E6" : "#EAF2FB", color: s.warn ? "#C2410C" : tokens.navy }}><Icon name={s.icon || "check"} size={20} /></span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span style={{ fontFamily: B, fontWeight: 800, fontSize: 17, color: tokens.navy }}>{s.title}</span>
                          {s.when ? <span className="rounded-full px-2.5 py-0.5" style={{ background: tokens.sky, fontFamily: B, fontSize: 12.5, fontWeight: 800, color: tokens.navy }}>{s.when}</span> : null}
                        </div>
                        <p className="mt-1" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.55, color: tokens.ink }}>{s.body}</p>
                        {s.source ? <a href={s.source} target="_blank" rel="noopener" style={{ fontFamily: B, fontSize: 13.5, color: tokens.muted }}>Source: {new URL(s.source).hostname.replace(/^www\./, "")}</a> : null}
                      </div>
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
              <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[28px] sm:text-[36px]">We work out every date for you</h2>
              <p className="mt-3" style={{ fontFamily: B, fontSize: 17, lineHeight: 1.55, color: tokens.ink }}>
                Tell us your flights and your dog. Your Travel Pass turns these rules into a checklist with real dates: the day to see your vet, the 5-day windows, the CDC form before your flight home, and your airline&apos;s own steps. Reminders before each one.
              </p>
              <ul className="mt-4 grid gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Dates from your flights there and back", "Checks your dog is old enough to come home", "Official source on every step", "Vet-confirmed records and a passport to show at the counter"].map((t) => (
                  <li key={t} className="flex gap-2" style={{ fontFamily: B, fontSize: 16, color: tokens.ink }}><span style={{ color: tokens.green, marginTop: 2 }}><Icon name="check" size={17} /></span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-6" style={{ background: tokens.sky }}>
              <div style={{ fontFamily: B, fontSize: 14, fontWeight: 800, letterSpacing: ".06em", color: tokens.muted }}>TRAVEL PASS · {g.name.toUpperCase()}</div>
              <div className="mt-1 flex items-baseline gap-2"><span style={{ fontFamily: D, fontSize: 44, fontWeight: 800, color: tokens.navy }}>{P.pass}</span><span style={{ fontFamily: B, color: tokens.muted }}>one trip, there and back</span></div>
              <p className="mt-1" style={{ fontFamily: B, fontSize: 15, color: tokens.ink }}>{P.memberPass} with Pet Vault. Checking your trip first is free.</p>
              <a href={cta} className="mt-4 flex items-center justify-center rounded-full min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Check my {g.name} trip</a>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10">
          <p style={{ fontFamily: B, fontSize: 13.5, lineHeight: 1.6, color: tokens.muted }} className="max-w-[48rem]">
            Rules change. We check them against official U.S. and {g.name} government pages and show the date we last checked. Your airline can have its own extra rules, which your Travel Pass adds for your flight. PetPassGo is a travel-prep tool, not a government agency.
          </p>
        </section>
      </main>
    </div>
  );
}
