import { Wordmark } from "./Logo";
import { tokens, font } from "../lib/theme";

// A static sample passport for landing pages, matching the Nov 25 mockups.
// Benny is one of our AI characters; the page shows that caption under it.
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const SAMPLES = {
  service: {
    name: "Benny",
    photo: "/images/hero-golden-retriever.jpg",
    alt: "Benny, a golden retriever in a service vest",
    fields: [["SPECIES", "Dog"], ["BREED", "Golden Retriever"], ["SEX", "Male"], ["BORN", "Apr 12, 2021"], ["WEIGHT", "68 lb"], ["TRAINING", "Task trained"], ["MICROCHIP", "•••• 6789", true], ["ISSUED", "Nov 25, 2026"]],
    mrz: ["P<PPGBENNY<<GOLDEN<RETRIEVER<<<<<<", "PPGSAMPLE<DOG<210412<SVC<<<<<<<"],
  },
};

function Label({ children }) {
  return <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: ".16em", color: "#4B5565" }}>{children}</div>;
}

export default function SamplePassportCard({ kind = "service" }) {
  const s = SAMPLES[kind];
  return (
    <article className="ppg-guilloche-light relative overflow-hidden" style={{ width: 350, maxWidth: "100%", borderRadius: 24, background: "#FBF7EE", boxShadow: "0 1px 0 #E6DCC6, 0 30px 60px rgba(0,0,0,.45)" }} aria-label={`Sample passport for ${s.name}`}>
      <div className="flex items-center justify-between" style={{ padding: "14px 18px", backgroundImage: "repeating-radial-gradient(circle at 50% 160%, rgba(242,184,75,.10) 0 1px, transparent 1px 10px), linear-gradient(120deg, #0E1A33, #1E3466)" }}>
        <div>
          <Wordmark size={21} onDark />
          <div style={{ fontFamily: font.body, fontSize: 9, fontWeight: 800, letterSpacing: ".24em", color: tokens.gold, marginTop: 3 }}>PET PASSPORT</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: font.body, fontSize: 8.5, fontWeight: 800, letterSpacing: ".16em", color: tokens.gold }}>PASSPORT NO.</div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: "#fff", letterSpacing: ".05em" }}>PPG-SAMPLE</div>
        </div>
      </div>
      <div style={{ height: 3, background: "linear-gradient(90deg, #F2B84B, #FBE3A6 50%, #F2B84B)" }} />
      <div style={{ padding: "18px 18px 14px" }}>
        <div className="flex items-start" style={{ gap: 16 }}>
          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            <div className="relative overflow-hidden" style={{ width: 128, height: 156, borderRadius: 14, border: "3px solid #fff", outline: `2px solid ${tokens.gold}`, boxShadow: "0 8px 20px rgba(20,33,61,.2)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.photo} alt={s.alt} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 22%" }} />
              <div style={{ position: "absolute", left: 7, top: 7, background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 900, fontSize: 9, letterSpacing: ".22em", padding: "3px 7px", borderRadius: 6 }}>SAMPLE</div>
            </div>
            <div className="ppg-badge ppg-badge-service" style={{ width: 128, boxSizing: "border-box", borderRadius: 10, padding: "7px 6px", textAlign: "center", color: "#fff" }}>
              <div className="flex items-center justify-center" style={{ gap: 5, fontFamily: font.body, fontWeight: 900, fontSize: 10.5, letterSpacing: ".12em", lineHeight: 1.2, textShadow: "0 1px 1px rgba(0,0,0,.35)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                SERVICE DOG
              </div>
              <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 700, opacity: 0.95, marginTop: 2 }}>Handler statement signed</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label>NAME</Label>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 38, lineHeight: 1, letterSpacing: "-.02em", color: tokens.navy }}>{s.name}</div>
            <div role="img" aria-label="Issued Nov 25, 2026" className="flex items-center justify-center" style={{ marginTop: 14, width: 84, height: 84, borderRadius: "50%", border: `3px solid ${tokens.primary}`, transform: "rotate(-13deg)", color: tokens.primary, opacity: 0.9, mixBlendMode: "multiply" }}>
              <div className="flex flex-col items-center justify-center" style={{ width: 68, height: 68, borderRadius: "50%", border: `1.5px dashed ${tokens.primary}` }}>
                <div style={{ fontFamily: font.body, fontSize: 5.5, fontWeight: 800, letterSpacing: ".2em" }}>PETPASSGO</div>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 17, lineHeight: 1.05 }}>ISSUED</div>
                <div style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700 }}>NOV 25, 2026</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1.5px dashed #D9CDB2", margin: "16px 0 12px" }} />
        <div className="grid grid-cols-2" style={{ gap: "11px 16px" }}>
          {s.fields.map(([k, v, mono]) => (
            <div key={k}>
              <Label>{k}</Label>
              <div style={{ fontFamily: mono ? MONO : font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" style={{ margin: "0 14px 16px", borderRadius: 10, background: "#F1EADA", padding: "8px 70px 8px 12px", fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", color: "#2B3443", lineHeight: 1.55, overflow: "hidden", whiteSpace: "nowrap" }}>
        {s.mrz[0]}<br />{s.mrz[1]}
      </div>
      <div className="ppg-foil" aria-hidden="true" />
      <div className="ppg-holo" aria-hidden="true" style={{ position: "absolute", right: 16, bottom: 12, width: 56, height: 56, borderRadius: "50%", zIndex: 2 }}>
        <svg width="60%" height="60%" viewBox="0 0 24 24" aria-hidden="true" style={{ position: "absolute", left: "20%", top: "20%", opacity: 0.55, mixBlendMode: "multiply" }}>
          <g fill={tokens.navy}><ellipse cx="12" cy="15.5" rx="4.2" ry="3.6" /><circle cx="6.5" cy="10" r="1.9" /><circle cx="17.5" cy="10" r="1.9" /><circle cx="9.5" cy="6.5" r="1.8" /><circle cx="14.5" cy="6.5" r="1.8" /></g>
        </svg>
      </div>
    </article>
  );
}
