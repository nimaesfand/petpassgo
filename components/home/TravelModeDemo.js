"use client";
import { useEffect, useState } from "react";
import { tokens, font } from "../../lib/theme";

const NAVY = "#14213D", GOLD = "#F2B84B", GREEN = "#15803D", INK = "#2B3443", MUTED = "#6B7585", LINE = "#DCE3EC";

function Badge({ kind }) {
  const l = { verified: ["VERIFIED", GREEN, "#EAF6EE"], doc: ["DOCUMENT ON FILE", "#1D4ED8", "#EAF1FF"], owner: ["OWNER-STATED", MUTED, "#F1F4F8"] }[kind];
  return <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".08em", color: l[1], background: l[2], borderRadius: 5, padding: "2px 6px", whiteSpace: "nowrap" }}>{l[0]}</span>;
}
function Row({ title, detail, kind }) {
  return (
    <div style={{ padding: "9px 0", borderTop: `1px solid ${LINE}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: NAVY }}>{title}</div>
        <Badge kind={kind} />
      </div>
      <div style={{ fontSize: 12, color: INK, marginTop: 2, lineHeight: 1.35 }}>{detail}</div>
    </div>
  );
}

// What travel mode looks like on a phone, with Benny.
function Screen() {
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ background: "#EEF2F7", fontFamily: font.body, padding: "14px 12px 22px", minHeight: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: NAVY, letterSpacing: "-.03em" }}>PetPass<span style={{ color: "#C2410C" }}>Go</span></div>
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".14em", color: MUTED }}>TRAVEL MODE</div>
      </div>
      <div className="ppg-demo-live" style={{ borderRadius: 14, padding: "9px 12px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ppg-demo-dot" aria-hidden="true" />
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: ".14em", opacity: .85 }}>TRAVEL MODE · LIVE</div>
            <div style={{ fontSize: 17, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : " "}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: .9 }}>Open for 24 hr</div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, marginTop: 10, padding: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 62, height: 76, borderRadius: 11, overflow: "hidden", border: `2.5px solid ${GOLD}`, flexShrink: 0 }}>
            <img src="/images/hero-golden-retriever.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "62% 22%" }} />
          </div>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>Benny</div>
            <div style={{ fontSize: 12, color: INK }}>Dog · Golden Retriever · Male</div>
            <span style={{ display: "inline-block", marginTop: 5, background: GOLD, color: NAVY, fontSize: 9, fontWeight: 800, letterSpacing: ".12em", borderRadius: 5, padding: "3px 6px" }}>SERVICE DOG</span>
            <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11, color: NAVY, marginTop: 4 }}>PPG-000-0001</div>
          </div>
        </div>
        <div style={{ marginTop: 10, background: "#F5F7FA", borderRadius: 11, padding: "8px 10px", display: "flex", justifyContent: "space-between", gap: 6 }}>
          {[["TRIP", "LAX → CUN"], ["AIRLINE", "Delta"], ["DATE", "Dec 20"]].map(([k, v]) => (
            <div key={k}><div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: ".12em", color: MUTED }}>{k}</div><div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{v}</div></div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <Row title="Rabies vaccine" kind="verified" detail="Valid until May 1, 2028 · Confirmed by Dr. Maya Lee, Sunset Animal Clinic" />
          <Row title="DHPP" kind="verified" detail="Valid until Dec 1, 2027 · Confirmed by Dr. Maya Lee" />
          <Row title="Health certificate" kind="doc" detail="Issued Dec 16 · Tap to open" />
          <Row title="Microchip" kind="owner" detail="Ends in 6789" />
        </div>
      </div>
    </div>
  );
}

export default function TravelModeDemo() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <>
      <style>{`.ppg-demo-live{background:linear-gradient(110deg,#14213D 0%,#1F3A6E 25%,#14213D 50%,#1F3A6E 75%,#14213D 100%);background-size:300% 100%;animation:ppgDemoLive 6s linear infinite}@keyframes ppgDemoLive{to{background-position:-300% 0}}.ppg-demo-dot{width:10px;height:10px;border-radius:50%;background:#4ADE80;box-shadow:0 0 0 0 rgba(74,222,128,.7);animation:ppgDemoPulse 1.6s infinite}@keyframes ppgDemoPulse{70%{box-shadow:0 0 0 8px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}@media (prefers-reduced-motion: reduce){.ppg-demo-live,.ppg-demo-dot{animation:none}}`}</style>
      <button type="button" onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-full px-5 min-h-[46px]" style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "1px solid rgba(255,255,255,.35)", fontFamily: font.body, fontWeight: 800, fontSize: 15.5, cursor: "pointer" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></svg>
        See travel mode on a phone
      </button>
      {open ? (
        <div role="dialog" aria-modal="true" aria-label="Travel mode example" className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: "rgba(11,20,40,.8)" }} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="flex flex-col items-center gap-3">
            <div style={{ width: 300, height: "min(620px, calc(100svh - 120px))", borderRadius: 44, background: "#0B1529", padding: 10, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
              <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 34, overflow: "hidden", background: "#EEF2F7" }}>
                <div aria-hidden="true" style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 90, height: 24, borderRadius: 14, background: "#0B1529", zIndex: 2 }} />
                <div style={{ height: "100%", overflowY: "auto", paddingTop: 26 }}><Screen /></div>
              </div>
            </div>
            <p style={{ fontFamily: font.body, fontSize: 14.5, color: "#D5DEEB", maxWidth: 300, textAlign: "center", lineHeight: 1.45 }}>One tap from the passport. Hand over your phone or read off it. Example only.</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-6 min-h-[44px]" style={{ background: "#fff", color: tokens.navy, border: "none", fontFamily: font.body, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
