"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Wordmark } from "./Logo";
import { PetIllustration } from "./PetIdCard";
import { PassportStamp, MrzStrip } from "./PetPassport";
import { chipMask } from "../lib/petProfile";
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
  const [stage, setStage] = useState(0); // 0 closed book, 1 opens, 2 details, 3 stamp, 4 celebrate
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
    if (reduced) { setStage(4); return undefined; }
    // A calm sequence: the closed book floats in, opens, the details fill in
    // one by one, the stamp lands, then the celebration.
    const t = [setTimeout(() => setStage(1), 1700), setTimeout(() => setStage(2), 3300), setTimeout(() => setStage(3), 5600), setTimeout(() => setStage(4), 6500)];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 4) closeRef.current?.focus();
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
    <div role="dialog" aria-modal="true" aria-label={`${pet.name}'s passport is issued`} className="fixed inset-0 z-[1000] flex flex-col items-center justify-center px-5 py-8 overflow-y-auto overflow-x-hidden" style={{ background: "radial-gradient(120% 80% at 50% 30%, #1B2C52 0%, #0B1529 70%)" }}>
      <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", color: tokens.gold, minHeight: 16 }}><span key={stage < 2 ? "a" : stage < 3 ? "b" : "c"} className="ppg-pp-fade inline-block">{stage < 2 ? `PRINTING ${String(pet.name || "").toUpperCase()}'S PASSPORT…` : stage < 3 ? "CHECKING THE DETAILS…" : "PASSPORT ISSUED"}</span></div>

      <div className="ppg-pp-book ppg-pp-float relative mt-5" style={{ width: 340, maxWidth: "90vw" }}>
        <div className={`ppg-pp-page ppg-guilloche-light relative rounded-2xl overflow-hidden flex flex-col ${stage === 3 ? "is-thud" : ""}`} style={{ background: "#FBF7EE", boxShadow: "0 30px 60px rgba(0,0,0,.45)" }}>
          <div style={{ height: 6, background: tokens.primary }} />
          <div className="px-4 pt-3 flex justify-between items-center">
            <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: tokens.muted }}>PET PASSPORT</span>
            <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: tokens.muted }}>PETPASSGO</span>
          </div>
          <div className="px-4 pt-3 flex gap-3">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="rounded-xl overflow-hidden" style={{ width: 112, height: 140, border: "3px solid #fff", outline: `1.5px solid ${tokens.gold}`, background: "#E8EEF7", boxShadow: "0 6px 16px rgba(20,33,61,.14)" }}>
                {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={100} /></div>}
              </div>
              <div aria-hidden="true" className="ppg-holo rounded-full" style={{ width: 26, height: 26 }} />
            </div>
            <div className="min-w-0 flex flex-col gap-1" style={{ paddingRight: 70 }}>
              <div>{label("NAME")}<div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, lineHeight: 1.05, color: tokens.navy, overflowWrap: "break-word" }}>{pet.name}</div></div>
              <span className="self-start rounded-md px-2 py-0.5" style={{ background: /service/i.test(pet.role || "") ? "#0F766E" : /emotional|esa/i.test(pet.role || "") ? "#6D28D9" : tokens.gold, color: /service|emotional|esa/i.test(pet.role || "") ? "#fff" : tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.14em" }}>{/service/i.test(pet.role || "") ? "SERVICE DOG" : /emotional|esa/i.test(pet.role || "") ? "SUPPORT ANIMAL" : "PET"}</span>
              {pet.breed ? <div className="mt-1">{label("BREED")}<div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.navy, overflowWrap: "anywhere" }}>{pet.breed}</div></div> : null}
            </div>
          </div>
          <div className="px-4 pt-3 pb-1 grid grid-cols-3 gap-x-3 gap-y-2" style={{ borderTop: "1px dashed #D9CDB2", marginTop: 12 }}>
            {[
              pet.animal_type && ["SPECIES", pet.animal_type],
              pet.sex && ["SEX", pet.sex],
              pet.date_of_birth && ["BORN", fmtDob(pet.date_of_birth)],
              Number(pet.weight_lb) > 0 && ["WEIGHT", `${pet.weight_lb} lb`],
              pet.color && ["COLOR", pet.color],
              pet.trained != null && ["TRAINED", pet.trained ? "Yes" : "Not yet"],
              pet.microchip_number && ["MICROCHIP", chipMask(pet.microchip_number)],
              pet.handler_name && ["OWNER", pet.handler_name],
              pet.passport_no && ["PASSPORT NO.", pet.passport_no],
            ].filter(Boolean).slice(0, 9).map(([k, v], i) => (
              <div key={k} className={`min-w-0 ${k === "OWNER" || k === "PASSPORT NO." ? "col-span-2" : ""}`} style={{ paddingTop: i < 3 ? 8 : 0, opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? "none" : "translateY(6px)", transition: `opacity .45s ease ${i * 0.22}s, transform .45s ease ${i * 0.22}s` }}>
                {label(k)}
                <div className="truncate" style={{ fontFamily: k === "PASSPORT NO." || k === "MICROCHIP" ? "ui-monospace, Menlo, monospace" : font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }}>{v}</div>
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="px-4 pt-2 overflow-hidden whitespace-nowrap" style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 6, letterSpacing: "0.18em", color: "rgba(20,33,61,.28)" }}>{"PETPASSGO · PET PASSPORT · ".repeat(8)}</div>
          <div className="px-2.5 pt-2 pb-3" style={{ transform: "scale(0.86)", transformOrigin: "left bottom" }}><MrzStrip pet={pet} /></div>
          {stage >= 3 ? (
            <div className="ppg-pp-stamp absolute" style={{ right: 6, top: 34, mixBlendMode: "multiply" }}>
              <PassportStamp date={issuedAt} size={84} style={{ transform: "none" }} />
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

      {stage >= 4 ? (
        <>
          <div className="ppg-pp-fade mt-6 text-center" style={{ maxWidth: 340 }}>
            <h2 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{pet.name} is official!</h2>
            <p className="mt-2" style={{ fontFamily: font.body, fontSize: 15.5, color: "rgba(255,255,255,.8)" }}>{pet.name}&apos;s passport, Pet ID and QR code are ready. Show them at the counter or share them with a sitter.</p>
          </div>
          <div className="ppg-pp-fade mt-5 flex flex-col gap-2.5 w-full" style={{ maxWidth: 340, animationDelay: ".35s" }}>
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
