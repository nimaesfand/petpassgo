"use client";

import { useEffect, useRef, useState } from "react";
import { shortBreed } from "../lib/breeds";
import { createPortal } from "react-dom";
import { Wordmark } from "./Logo";
import PetPassport from "./PetPassport";
import { PassportStamp, MrzStrip, PhotoSlot } from "./PetPassport";
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

export default function PassportReveal({ pet, photo, issuedAt, onClose, preview = false, sample = false }) {
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
    const t = sample
      ? [setTimeout(() => setStage(1), 900), setTimeout(() => setStage(2), 1900), setTimeout(() => setStage(3), 3300), setTimeout(() => setStage(4), 4000)]
      : [setTimeout(() => setStage(1), 1700), setTimeout(() => setStage(2), 3300), setTimeout(() => setStage(3), 5600), setTimeout(() => setStage(4), 6500)];
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

      <div className="ppg-pp-book ppg-pp-float relative mt-5" style={{ width: 360, maxWidth: "92vw" }}>
        {/* The same passport card customers keep (components/PetPassport.js). */}
        <div className={`ppg-pp-page relative ${stage === 3 ? "is-thud" : ""}`}>
          <PetPassport frontOnly sample={sample} pet={{ ...pet, passport_no: pet.passport_no || "PPG-PREVIEW", passport_issued_at: stage >= 3 ? issuedAt : null }} photo={photo} justIssued={stage === 3} chipValue={pet.microchip_number ? chipMask(pet.microchip_number) : ""} />
        </div>

        <div className={`ppg-pp-cover ppg-guilloche-dark absolute inset-0 rounded-[24px] overflow-hidden flex flex-col items-center justify-center gap-4 ${stage >= 1 ? "is-open" : ""}`} style={{ background: tokens.navy, boxShadow: "0 30px 60px rgba(0,0,0,.45), inset 0 0 0 1px rgba(242,184,75,.3)" }} aria-hidden="true">
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
            <h2 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{sample ? "This is a sample passport" : <>{pet.name}&apos;s passport is ready!</>}</h2>
            <p className="mt-2" style={{ fontFamily: font.body, fontSize: 15.5, color: "rgba(255,255,255,.8)" }}>{sample ? "Make your pet's own passport in a few minutes. Benny walks you through it." : preview ? `Keep it to show it at the counter, add it to your phone, and share it with a sitter.` : `${pet.name}'s passport and QR code are ready. Show them at the counter, add them to your phone, or share them with a sitter.`}</p>
          </div>
          <div className="ppg-pp-fade mt-5 flex flex-col gap-2.5 w-full" style={{ maxWidth: 340, animationDelay: ".35s" }}>
            {sample ? (
              <>
                <a href="/passport/create" className="rounded-full flex items-center justify-center" style={{ height: 54, background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 17, fontWeight: 800, textDecoration: "none" }}>Make your pet&apos;s passport</a>
                <button ref={closeRef} type="button" onClick={onClose} className="rounded-full" style={{ height: 48, background: "transparent", color: "#fff", fontFamily: font.body, fontSize: 15, fontWeight: 600, border: "2px solid rgba(255,255,255,.35)", cursor: "pointer" }}>Close</button>
              </>
            ) : preview ? (
              <button ref={closeRef} type="button" onClick={onClose} className="rounded-full" style={{ height: 56, background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 17, fontWeight: 800, border: "none", cursor: "pointer" }}>See {pet.name}&apos;s passport</button>
            ) : (
              <>
                <button type="button" onClick={share} className="rounded-full" style={{ height: 52, background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>{copied ? "Link copied" : `Share ${pet.name}'s passport`}</button>
                <button ref={closeRef} type="button" onClick={onClose} className="rounded-full" style={{ height: 48, background: "transparent", color: "#fff", fontFamily: font.body, fontSize: 15, fontWeight: 600, border: "2px solid rgba(255,255,255,.35)", cursor: "pointer" }}>View passport</button>
              </>
            )}
          </div>
          {sample ? null : <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            {BITS.map((b, i) => (
              <span key={i} className="ppg-pp-bit" style={{ left: `${b.left}%`, width: b.size, height: b.round ? b.size : b.size * 0.45, background: b.color, borderRadius: b.round ? "50%" : 2, animationDelay: `${b.delay}s` }} />
            ))}
          </div>}
        </>
      ) : null}
    </div>,
    host
  );
}
