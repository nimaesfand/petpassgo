import { Wordmark } from "./Logo";
import SamplePassportCard from "./SamplePassportCard";
import { TrackOnMount } from "./Analytics";
import { PRICES as P } from "../lib/pricing";
import { tokens, font } from "../lib/theme";

// One-screen landing page shared by /service-dog-passport, /esa-passport and
// /pet-passport. Same Pet Vault price; only the look, words and preset change.
export const THEMES = {
  service: { bg: "radial-gradient(120% 60% at 50% 18%, #1E3A8A 0%, #0B1A45 45%, #0B1529 100%)", badge: "ppg-badge-service", iconColor: "#A9C1FF", iconBg: "rgba(143,176,255,.13)", iconLine: "rgba(143,176,255,.32)", sub: "#C9D4E6", muted: "#9FB0CA", rot: -2 },
  esa: { bg: "radial-gradient(120% 60% at 50% 18%, #7F1D1D 0%, #3B0D0D 45%, #160A12 100%)", badge: "ppg-badge-esa", iconColor: "#FFB4B4", iconBg: "rgba(255,154,154,.13)", iconLine: "rgba(255,154,154,.32)", sub: "#E9CFCF", muted: "#C3A3A3", rot: 2 },
  pet: { bg: "radial-gradient(120% 60% at 50% 18%, #7C2D12 0%, #3A160A 45%, #160D0A 100%)", badge: "ppg-badge-pet", iconColor: "#FDBA8C", iconBg: "rgba(247,162,107,.13)", iconLine: "rgba(247,162,107,.32)", sub: "#EBD5C7", muted: "#C4A897", rot: -2 },
};

// Where the visitor came from (our own ads): ?src=google
export function cleanSrc(v) {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" && /^[a-z0-9_-]{1,32}$/i.test(s) ? s.toLowerCase() : "";
}

export default function PassportLanding({ kind, eyebrow, title, sub, caption, items, button, preset, track, searchParams, after }) {
  const t = THEMES[kind];
  const src = cleanSrc(searchParams?.src);
  const start = `/passport/create?for=${preset}${src ? `&src=${src}` : ""}`;
  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: font.body }}>
      <TrackOnMount contentType="landing" contentName={`${track}${src ? `:${src}` : ""}`} />
      <header className="max-w-[1080px] mx-auto flex items-center justify-between px-5 sm:px-8" style={{ paddingTop: 16, paddingBottom: 16 }}>
        <a href="/" aria-label="PetPassGo home" style={{ textDecoration: "none" }}><Wordmark size={22} onDark /></a>
        <a href="/login" style={{ color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", padding: "10px 4px" }}>Log in</a>
      </header>

      <main className="ppg-landing max-w-[1080px] mx-auto px-5 sm:px-8" style={{ paddingTop: 6, paddingBottom: 48 }}>
        <div className="ppg-landing-intro">
          <span className={`ppg-badge ${t.badge} inline-flex`} style={{ borderRadius: 10, padding: "7px 12px", color: "#fff", fontWeight: 900, fontSize: 12, letterSpacing: ".14em", textShadow: "0 1px 1px rgba(0,0,0,.35)" }}>{eyebrow}</span>
          <h1 className="mt-4 text-[38px] sm:text-[52px] font-extrabold" style={{ fontFamily: font.display, color: "#fff", lineHeight: 1.04, letterSpacing: "-.02em", maxWidth: "15ch" }}>{title}</h1>
          <p className="mt-3 text-[17px] sm:text-[19px]" style={{ color: t.sub, lineHeight: 1.45, maxWidth: "32rem" }}>{sub}</p>
        </div>

        <div className="ppg-landing-card flex flex-col items-center" style={{ marginTop: 24 }}>
          <div style={{ transform: `rotate(${t.rot}deg)`, width: "100%", display: "flex", justifyContent: "center" }}>
            <SamplePassportCard kind={kind} />
          </div>
          <div className="text-center" style={{ fontSize: 12.5, color: t.muted, marginTop: 12 }}>{caption}</div>
        </div>

        <div className="ppg-landing-rest" style={{ maxWidth: "32rem" }}>
          <ul className="flex flex-col" style={{ listStyle: "none", margin: "24px 0 0", padding: 0, gap: 14 }}>
            {items.map((it) => (
              <li key={it.text} className="flex items-start" style={{ gap: 14 }}>
                <span className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 12, color: t.iconColor, background: t.iconBg, border: `1px solid ${t.iconLine}` }}>{it.icon}</span>
                <span style={{ fontSize: 16.5, lineHeight: 1.4, color: "#fff", fontWeight: 700, paddingTop: 8 }}>{it.text}</span>
              </li>
            ))}
          </ul>
          <a href={start} className="btn-primary flex items-center justify-center text-center w-full sm:w-auto sm:inline-flex sm:px-10" style={{ marginTop: 28, minHeight: 60, padding: "0 18px", borderRadius: 999, background: tokens.primary, color: "#fff", fontWeight: 800, fontSize: 17, textDecoration: "none", boxShadow: "0 14px 30px rgba(0,0,0,.35)" }}>{button}</a>
          <div className="text-center sm:text-left" style={{ fontSize: 14, color: t.muted, marginTop: 10 }}>{P.member} a month. Cancel anytime.</div>
          {after ? <div className="text-center sm:text-left" style={{ fontSize: 15, color: t.sub, marginTop: 18 }}>{after}</div> : null}
        </div>
      </main>
    </div>
  );
}
