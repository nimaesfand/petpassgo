"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Wordmark } from "./Logo";
import { PetIllustration } from "./PetIdCard";
import { PassportStamp, MrzStrip } from "./PetPassport";
import { tokens, font } from "../lib/theme";
import { fmtDob, profileUrl } from "../lib/petProfile";

// The moment a pet's profile is complete: the passport pops up, the cover
// swings open, the ISSUED stamp lands and gold bits fall. Shown once per pet;
// the parent saves passport_issued_at when this closes.

const BITS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 137) % 1000) / 1000,
  size: 6 + ((i * 5) % 9),
  color: [tokens.gold, tokens.primary, "#FFFFFF", "#E9C77A"][i % 4],
  round: i % 3 === 0,
}));

export default function PassportReveal({ pet, photo, issuedAt, onClose }) {
  const [stage, setStage] = useState(0); // 0 pop, 1 open, 2 stamped
  const [copied, setCopied] = useState(false);
  const [host, setHost] = useState(null);
  const closeRef = useRef(null);
  // Render on top of the whole page (not inside the scrolling account area), and
  // hide the header, tabs, bottom bar and chat button while it plays.
  useEffect(() => {
    setHost(document.body);
    document.documentElement.classList.add("ppg-revealing");
    return () => document.documentElement.classList.remove("ppg-revealing");
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setStage(2); return undefined; }
    const a = setTimeout(() => setStage(1), 900);
    const b = setTimeout(() => setStage(2), 2150);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    if (stage === 2) closeRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  async function share() {
    const url = profileUrl(pet);
    try {
      if (navigator.share) { await navigator.share({ title: `${pet.name}'s PetPassGo passport`, url }); return; }
    } catch { return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }

  const label = (k) => <div style={{ fontFamily: font.body, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: tokens.muted }}>{k}</div>;

  if (!host) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${pet.name}'s passport is issued`} className="fixed inset-0 z-[1000] flex flex-col items-center justify-center px-5 py-8 overflow-hidden" style={{ background: "radial-gradient(120% 80% at 50% 30%, #1B2C52 0%, #0B1529 70%)" }}>
      <div className="ppg-pp-fade" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", color: tokens.gold }}>{stage < 2 ? "ISSUING PASSPORT…" : "PASSPORT ISSUED"}</div>

      <div className="ppg-pp-book relative mt-5" style={{ width: 300, height: 410, maxWidth: "86vw" }}>
        <div className={`ppg-pp-page ppg-guilloche-light absolute inset-0 rounded-2xl overflow-hidden flex flex-col ${stage === 2 ? "is-thud" : ""}`} style={{ background: "#FBF7EE", boxShadow: "0 30px 60px rgba(0,0,0,.45)" }}>
          <div style={{ height: 6, background: tokens.primary }} />
          <div className="px-4 pt-3 flex justify-between items-center">
            <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: tokens.muted }}>PET PASSPORT · PASSEPORT</span>
            <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 800, color: tokens.muted }}>PETPASSGO</span>
          </div>
          <div className="px-4 pt-3 flex gap-3">
            <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 96, height: 118, border: `3px solid ${tokens.gold}`, background: "#E8EEF7" }}>
              {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={92} /></div>}
            </div>
            <div className="min-w-0 flex flex-col gap-1.5">
              <div>{label("NAME")}<div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, lineHeight: 1.05, color: tokens.navy, overflowWrap: "anywhere" }}>{pet.name}</div></div>
              {pet.breed ? <div>{label("BREED")}<div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.navy }}>{pet.breed}</div></div> : null}
              {pet.passport_no ? <div>{label("PASSPORT NO.")}<div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, fontWeight: 700, color: tokens.navy }}>{pet.passport_no}</div></div> : null}
            </div>
          </div>
          <div className="px-4 pt-3 grid grid-cols-2 gap-2">
            {pet.date_of_birth ? <div>{label("DATE OF BIRTH")}<div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>{fmtDob(pet.date_of_birth)}</div></div> : null}
            <div>{label("TYPE")}<div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: tokens.navy }}>{pet.animal_type || "Pet"}</div></div>
          </div>
          <div className="flex-1" />
          <div className="px-2.5 pb-3" style={{ transform: "scale(0.86)", transformOrigin: "left bottom" }}><MrzStrip pet={pet} /></div>
          {stage === 2 ? (
            <div className="ppg-pp-stamp absolute" style={{ right: 12, top: 150, mixBlendMode: "multiply" }}>
              <PassportStamp date={issuedAt} size={124} style={{ transform: "none" }} />
            </div>
          ) : null}
        </div>

        <div className={`ppg-pp-cover ppg-guilloche-dark absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4 ${stage >= 1 ? "is-open" : ""}`} style={{ background: tokens.navy, boxShadow: "0 30px 60px rgba(0,0,0,.45), inset 0 0 0 1px rgba(242,184,75,.3)" }} aria-hidden="true">
          <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: 16, background: tokens.navyDeep }} />
          <div className="absolute rounded-lg" style={{ inset: "16px 16px 16px 30px", border: `1.5px solid ${tokens.gold}`, opacity: 0.75 }} />
          <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.32em", color: tokens.gold, paddingLeft: 14 }}>PET PASSPORT</div>
          <div style={{ paddingLeft: 14 }}><Wordmark size={34} onDark /></div>
          <div style={{ width: 54, height: 1.5, background: tokens.gold, marginLeft: 14, opacity: 0.8 }} />
          <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", color: "rgba(255,255,255,.7)", paddingLeft: 14 }}>{String(pet.name || "").toUpperCase()}</div>
        </div>
      </div>

      {stage === 2 ? (
        <>
          <div className="ppg-pp-fade mt-7 text-center" style={{ maxWidth: 340 }}>
            <h2 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{pet.name} is official!</h2>
            <p className="mt-2" style={{ fontFamily: font.body, fontSize: 15.5, color: "rgba(255,255,255,.78)" }}>Passport issued. The Pet ID and QR code are ready to show at the counter.</p>
            <p className="mt-2" style={{ fontFamily: font.body, fontSize: 12.5, color: "rgba(255,255,255,.6)" }}>A PetPassGo digital pet profile, not a government passport or official travel document.</p>
          </div>
          <div className="ppg-pp-fade mt-5 flex flex-col gap-2.5 w-full" style={{ maxWidth: 340, animationDelay: ".2s" }}>
            <button type="button" onClick={share} className="rounded-full" style={{ height: 52, background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>{copied ? "Link copied" : `Share ${pet.name}'s passport`}</button>
            <button ref={closeRef} type="button" onClick={onClose} className="rounded-full" style={{ height: 48, background: "transparent", color: "#fff", fontFamily: font.body, fontSize: 15, fontWeight: 600, border: "2px solid rgba(255,255,255,.35)", cursor: "pointer" }}>View passport</button>
          </div>
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            {BITS.map((b, i) => (
              <span key={i} className="ppg-pp-bit" style={{ left: `${b.left}%`, width: b.size, height: b.round ? b.size : b.size * 0.45, background: b.color, borderRadius: b.round ? "50%" : 2, animationDelay: `${b.delay}s` }} />
            ))}
          </div>
        </>
      ) : null}
    </div>,
    host
  );
}
