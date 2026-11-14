import SiteHeader from "./SiteHeader";
import Icon from "./Icon";
import { TrackOnMount } from "./Analytics";
import { tokens, font } from "../lib/theme";
import { FEDERAL, FEDERAL_TRUTHS, GUIDES_CHECKED } from "../lib/stateGuides";

const D = font.display;
const B = font.body;
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

function Truth({ t }) {
  return (
    <li className="rounded-2xl p-4 flex gap-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: t.true ? "#EAF6EE" : "#FDECEC", color: t.true ? "#15803D" : "#B91C1C" }}><Icon name={t.true ? "check" : "x"} size={18} /></span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-2 py-0.5" style={{ background: t.true ? "#EAF6EE" : "#FDECEC", color: t.true ? "#15803D" : "#B91C1C", fontFamily: B, fontSize: 12, fontWeight: 800, letterSpacing: ".04em" }}>{t.true ? "TRUE" : "NOT TRUE"}</span>
          <span style={{ fontFamily: B, fontWeight: 800, fontSize: 16, color: tokens.navy }}>&ldquo;{t.claim}&rdquo;</span>
        </div>
        <p className="mt-1" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.5, color: tokens.ink }}>{t.why}</p>
      </div>
    </li>
  );
}

export default function StateGuide({ s }) {
  const cta = "/assessment";
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="guide" contentName={`state:${s.slug}`} />
      <main className="max-w-[920px] mx-auto px-4 sm:px-6 pt-8 lg:pt-12 pb-14">
        <a href="/guides" style={{ fontFamily: B, fontSize: 14.5, fontWeight: 700, color: tokens.muted, textDecoration: "none" }}>← All state guides</a>
        <h1 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.08, textWrap: "balance" }} className="text-[32px] sm:text-[46px] mt-2">{s.name} service dog, PSD and ESA laws</h1>
        <p style={{ fontFamily: B, fontSize: 18.5, lineHeight: 1.5, color: tokens.ink }} className="mt-3">{s.summary}</p>
        <p className="mt-2" style={{ fontFamily: B, fontSize: 14, color: tokens.muted }}>Checked against the laws themselves on {GUIDES_CHECKED}. Not legal advice.</p>

        <div className="grid sm:grid-cols-3 gap-2 mt-6">
          {[["Service dog / PSD", "Public places, housing and flights", "#EAF6EE", "#15803D"], ["ESA in housing", s.slug === "texas" ? "Federal rules only, changed in 2026" : "Protected by state law", "#EAF2FB", tokens.navy], ["ESA on a plane", "Flies as a pet", "#FEF3C7", "#92400E"]].map(([k, v, bg, fg]) => (
            <div key={k} className="rounded-2xl px-4 py-3" style={{ background: bg }}>
              <div style={{ fontFamily: B, fontSize: 13, fontWeight: 800, letterSpacing: ".04em", color: fg }}>{k.toUpperCase()}</div>
              <div style={{ fontFamily: B, fontSize: 15.5, fontWeight: 700, color: tokens.navy }}>{v}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[26px] sm:text-[32px] mt-10">True or not true</h2>
        <ul className="grid gap-2.5 mt-3" style={{ listStyle: "none", padding: 0 }}>
          {[...s.truths, ...FEDERAL_TRUTHS].map((t) => <Truth key={t.claim} t={t} />)}
        </ul>

        <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[26px] sm:text-[32px] mt-10">{s.name}&apos;s own rules</h2>
        <div className="grid gap-3 mt-3">
          {s.rules.map((r) => (
            <article key={r.title} className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: B, fontSize: 12.5, fontWeight: 800, letterSpacing: ".05em", color: tokens.primary }}>{r.law.toUpperCase()}</div>
              <h3 className="mt-1" style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{r.title}</h3>
              <p className="mt-1.5" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.55, color: tokens.ink }}>{r.body}</p>
              <a href={r.source} target="_blank" rel="noopener" style={{ fontFamily: B, fontSize: 13.5, color: tokens.muted }}>Source: {host(r.source)}</a>
            </article>
          ))}
        </div>

        <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[26px] sm:text-[32px] mt-10">Federal rules that apply in {s.name}</h2>
        <div className="grid gap-3 mt-3">
          {Object.values(FEDERAL).map((f) => (
            <article key={f.title} className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <h3 style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{f.title}</h3>
              <ul className="mt-2 grid gap-1.5" style={{ listStyle: "none", padding: 0 }}>
                {f.points.map((p) => <li key={p} className="flex gap-2" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.5, color: tokens.ink }}><span style={{ color: tokens.primary, marginTop: 2 }}>•</span>{p}</li>)}
              </ul>
              <a href={f.source} target="_blank" rel="noopener" className="inline-block mt-2" style={{ fontFamily: B, fontSize: 13.5, color: tokens.muted }}>Source: {host(f.source)}</a>
            </article>
          ))}
        </div>

        <section className="rounded-3xl p-6 mt-10" style={{ background: tokens.navy, color: "#fff" }}>
          <h2 style={{ fontFamily: D, fontWeight: 800 }} className="text-[24px] sm:text-[30px]">Flying from {s.name} with your dog?</h2>
          <p className="mt-2" style={{ fontFamily: B, fontSize: 16.5, lineHeight: 1.5, color: "rgba(255,255,255,.85)" }}>
            Check your trip before you book. See which airlines take your dog from {s.airports.slice(0, 3).join(", ")} and more, what it costs, and exactly what you need. Service dog? We fill in the DOT form for you.
          </p>
          <a href={cta} className="mt-4 inline-flex items-center justify-center rounded-full px-8 min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Check my trip · free</a>
        </section>
      </main>
    </div>
  );
}
