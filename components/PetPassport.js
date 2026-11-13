"use client";

import { useState } from "react";
import { Wordmark } from "./Logo";
import Icon from "./Icon";
import PetQr from "../lib/PetQr";
import { PetIllustration } from "./PetIdCard";
import { tokens, font } from "../lib/theme";
import { filled, fmtDob, mrzLines, issuedLabel, chipMask } from "../lib/petProfile";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function Cell({ k, v }) {
  if (!filled(v)) return null;
  return (
    <div className="min-w-0">
      <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", color: tokens.muted }}>{String(k).toUpperCase()}</div>
      <div className="ppg-pp-val" style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy, overflowWrap: "break-word" }}>{v}</div>
    </div>
  );
}

function stampDate(v) {
  return fmtDob(v);
}

// The round "ISSUED" stamp. Shared with the passport-issue moment.
export function PassportStamp({ date, size = 118, className = "", style }) {
  const label = issuedLabel(date);
  return (
    <div
      aria-label={label ? `Passport issued ${label}` : "Passport issued"}
      role="img"
      className={`ppg-stamp ${className}`}
      style={{ width: size, height: size, borderRadius: "50%", border: `3.5px solid ${tokens.primary}`, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.primary, transform: "rotate(-13deg)", ...style }}
    >
      <div style={{ width: size - 16, height: size - 16, borderRadius: "50%", border: `1.5px dashed ${tokens.primary}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontFamily: font.body, fontSize: Math.round(size * 0.075), fontWeight: 800, letterSpacing: "0.2em" }}>PETPASSGO</div>
        <div style={{ fontFamily: font.display, fontSize: Math.round(size * 0.21), fontWeight: 800, letterSpacing: "0.05em", lineHeight: 1.05 }}>ISSUED</div>
        {label ? <div style={{ fontFamily: MONO, fontSize: Math.round(size * 0.08), fontWeight: 700 }}>{label}</div> : null}
      </div>
    </div>
  );
}

export function MrzStrip({ pet }) {
  const [a, b] = mrzLines(pet);
  return (
    <div aria-hidden="true" className="ppg-mrz rounded-lg px-3 py-2 overflow-hidden" style={{ background: "#F1EADA", fontFamily: MONO, fontWeight: 600, lineHeight: 1.55, color: tokens.navy, whiteSpace: "pre" }}>
      {a}
      {"\n"}
      {b}
    </div>
  );
}

function ageLabel(dob) {
  if (!dob) return "";
  const d = new Date(`${String(dob).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const months = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
  if (months < 0) return "";
  if (months < 12) return `${months} mo`;
  return `${Math.floor(months / 12)} yr${Math.floor(months / 12) === 1 ? "" : "s"}`;
}

const STATUS = {
  service: { label: "SERVICE DOG", bg: "#0F766E", fg: "#fff" },
  esa: { label: "SUPPORT ANIMAL", bg: "#6D28D9", fg: "#fff" },
  pet: { label: "PET", bg: "#F2B84B", fg: "#14213D" },
};

function statusOf(role) {
  if (/service/i.test(role || "")) return STATUS.service;
  if (/emotional|esa/i.test(role || "")) return STATUS.esa;
  return STATUS.pet;
}

// Tiny repeated text line, like the microprint on a real data page.
function Microprint({ dark = false }) {
  return (
    <div aria-hidden="true" className="overflow-hidden whitespace-nowrap" style={{ fontFamily: MONO, fontSize: 6.5, letterSpacing: "0.18em", color: dark ? "rgba(242,184,75,.45)" : "rgba(20,33,61,.28)", lineHeight: 1 }}>
      {"PETPASSGO · PET PASSPORT · ".repeat(14)}
    </div>
  );
}

// Holographic seal: a paw in a ring with a slow rainbow sheen.
function HoloSeal({ size = 54 }) {
  return (
    <div aria-hidden="true" className="ppg-holo rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="rgba(20,33,61,.55)">
        <ellipse cx="7" cy="9" rx="2.2" ry="2.8" /><ellipse cx="12" cy="6.5" rx="2.2" ry="2.8" /><ellipse cx="17" cy="9" rx="2.2" ry="2.8" />
        <path d="M12 11.5c-3.3 0-6 3.4-6 5.9 0 1.7 1.4 2.6 3 2.6 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.6 0 3-.9 3-2.6 0-2.5-2.7-5.9-6-5.9z" />
      </svg>
    </div>
  );
}

function Field({ k, v, wide = false, mono = false }) {
  if (!filled(v)) return null;
  return (
    <div className={`min-w-0 ${wide ? "col-span-2" : ""}`}>
      <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>{String(k).toUpperCase()}</div>
      <div className="ppg-pp-val" style={{ fontFamily: mono ? MONO : font.body, fontWeight: 700, color: tokens.navy, overflowWrap: "break-word", letterSpacing: mono ? "0.04em" : 0 }}>{v}</div>
    </div>
  );
}

function Front({ pet, photo, owner, chipValue, sheet, pending, justIssued, onPhotoTap, onFlip }) {
  const st = statusOf(pet.role);
  const age = ageLabel(pet.date_of_birth);
  const fields = [
    ["Species", pet.animal_type],
    ["Breed", pet.breed],
    ["Sex", pet.sex],
    ["Born", [fmtDob(pet.date_of_birth), age && `(${age})`].filter(Boolean).join(" ")],
    ["Weight", pet.weight_lb ? `${pet.weight_lb} lb` : ""],
    ["Color", pet.color],
    ["Trained", pet.trained == null ? "" : pet.trained ? "Yes" : "Not yet"],
    ["Microchip", owner && !sheet ? chipMask(chipValue) : chipValue],
    ["Owner", pet.handler_name],
    ["Issued", pet.passport_issued_at ? fmtDob(String(pet.passport_issued_at).slice(0, 10)) : ""],
  ];
  return (
    <article data-pet-passport className="ppg-passport ppg-sheen rounded-[22px] overflow-hidden min-w-0 max-w-full relative h-full flex flex-col" style={{ background: "#FBF7EE", boxShadow: "0 1px 0 #E6DCC6, 0 22px 50px rgba(20,33,61,0.18)" }}>
      <div className="ppg-guilloche-dark px-4 sm:px-6 py-3 flex items-center justify-between gap-3 min-w-0" style={{ background: `linear-gradient(120deg, ${tokens.navy}, #22386A)` }}>
        <div className="min-w-0">
          <Wordmark size={19} onDark />
          <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.22em", color: tokens.gold, marginTop: 2 }}>PET PASSPORT</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {pet.passport_no ? (
            <div className="text-right">
              <div style={{ fontFamily: font.body, fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: tokens.gold }}>PASSPORT NO.</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: "#fff", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>{pet.passport_no}</div>
            </div>
          ) : null}
          {onFlip ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); onFlip(); }} aria-label="Flip to the QR side" className="ppg-no-print flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", cursor: "pointer" }}><Icon name="repeat" size={16} /></button>
          ) : null}
        </div>
      </div>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${tokens.gold}, #F7D98C 50%, ${tokens.gold})` }} />

      <div className="ppg-guilloche-light px-4 sm:px-6 pt-4 pb-4 min-w-0 relative flex-1 flex flex-col">
        <div className="ppg-pp-grid min-w-0">
          {/* Photo column: main photo + ghost image, like a real data page */}
          <div className="ppg-pp-photocol flex flex-col items-center gap-2">
            <div className="ppg-pp-photo relative rounded-xl overflow-hidden" style={{ border: "3px solid #fff", outline: `1.5px solid ${tokens.gold}`, background: "#E8EEF7", boxShadow: "0 6px 16px rgba(20,33,61,0.14)" }}>
              {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={110} /></div>}
              {onPhotoTap ? (
                <button type="button" onClick={(e) => { e.stopPropagation(); onPhotoTap(); }} aria-label={photo ? "Retake passport photo" : "Add passport photo"} className="ppg-no-print absolute inset-0" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  <span className="absolute flex items-center justify-center rounded-full" style={{ top: 6, right: 6, width: 28, height: 28, background: "#fff", color: tokens.navy, boxShadow: "0 2px 8px rgba(20,33,61,.3)" }}><Icon name="camera" size={14} /></span>
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {photo ? <div aria-hidden="true" className="ppg-pp-ghost rounded-md overflow-hidden" style={{ width: 34, height: 42, opacity: 0.22, filter: "grayscale(1) contrast(1.2)", mixBlendMode: "multiply" }}>{photo}</div> : null}
              <HoloSeal size={40} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>NAME</div>
                <h2 className="ppg-pp-name" style={{ fontFamily: font.display, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: tokens.navy, overflowWrap: "break-word" }}>{pet.name}</h2>
                <span className="inline-block rounded-md px-2 py-0.5 mt-2" style={{ background: st.bg, color: st.fg, fontFamily: font.body, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.14em" }}>{st.label}</span>
              </div>
              {pet.passport_issued_at ? (
                <div className="ppg-pp-stampspot2 flex-shrink-0" style={{ mixBlendMode: "multiply", pointerEvents: "none" }}><PassportStamp date={pet.passport_issued_at} size={86} className={justIssued ? "ppg-pp-stamp" : ""} style={{ opacity: 0.9 }} /></div>
              ) : pending ? (
                <div className="ppg-no-print flex-shrink-0" aria-label="Not issued yet" role="img" style={{ width: 82, height: 82, borderRadius: "50%", border: "2.5px dashed #9AA4B2", display: "flex", alignItems: "center", justifyContent: "center", color: "#7B8595", transform: "rotate(-12deg)", textAlign: "center", fontFamily: font.display, fontSize: 12, fontWeight: 800, lineHeight: 1.05 }}>NOT YET<br />ISSUED</div>
              ) : null}
            </div>
            <div className="ppg-pp-fields mt-3 pt-3 grid gap-x-4 gap-y-2.5 min-w-0" style={{ borderTop: "1px dashed #D9CDB2" }}>
              {fields.map(([k, v]) => <Field key={k} k={k} v={v} mono={k === "Microchip"} />)}
            </div>
          </div>
        </div>

        <div className="flex-1" />
        <div className="mt-4"><Microprint /></div>
        <div className="mt-1.5"><MrzStrip pet={pet} /></div>
      </div>
    </article>
  );
}

function Back({ pet, stamps, owner, qr, onFlip }) {
  const contact = [pet.emergency_contact_name, pet.emergency_contact_phone].filter(filled);
  const showContact = owner || pet.show_contact_on_public_id;
  const medical = (owner || pet.show_medical_on_public) ? [
    pet.allergies && ["Allergies", pet.allergies],
    pet.medications && ["Medications", pet.medications],
    pet.vet_name && ["Vet", [pet.vet_name, pet.vet_phone].filter(Boolean).join(" · ")],
  ].filter(Boolean) : [];
  return (
    <article className="rounded-[22px] overflow-hidden min-w-0 h-full flex flex-col relative" style={{ background: `linear-gradient(160deg, ${tokens.navy}, #1B2D55 60%, #0F1B36)`, color: "#fff", boxShadow: "0 22px 50px rgba(20,33,61,0.25)" }}>
      <div className="ppg-guilloche-dark absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="relative px-4 sm:px-6 py-3 flex items-center justify-between">
        <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 11, letterSpacing: "0.22em", color: tokens.gold }}>IF FOUND · SCAN ME</div>
        {onFlip ? <button type="button" onClick={(e) => { e.stopPropagation(); onFlip(); }} aria-label="Flip to the front" className="ppg-no-print flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", cursor: "pointer" }}><Icon name="repeat" size={16} /></button> : null}
      </div>
      <div className="relative px-4 sm:px-6 pb-4 flex-1 grid gap-4 sm:grid-cols-[auto_1fr] items-center">
        <div className="mx-auto rounded-2xl p-2.5" style={{ background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
          {qr || <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={132} color={tokens.navy} />}
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>Hi, I&apos;m {pet.name}!</div>
          <div className="mt-1" style={{ fontFamily: font.body, fontSize: 14.5, color: "rgba(255,255,255,.8)", lineHeight: 1.4 }}>If I&apos;m lost, scan my code. It messages my family right away.</div>
          {showContact && contact.length ? (
            <div className="mt-3 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,.1)" }}>
              <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.gold }}>CALL MY FAMILY</div>
              <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700 }}>{contact.join(" · ")}</div>
            </div>
          ) : null}
          {medical.length ? (
            <div className="mt-2 grid gap-1">
              {medical.map(([k, v]) => <div key={k} style={{ fontFamily: font.body, fontSize: 13.5, color: "rgba(255,255,255,.85)" }}><b style={{ color: tokens.gold }}>{k}:</b> {v}</div>)}
            </div>
          ) : null}
        </div>
      </div>
      {stamps.length > 0 ? (
        <div className="relative px-4 sm:px-6 pb-4">
          <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", color: tokens.gold }} className="mb-2">TRAVEL STAMPS</div>
          <div className="flex flex-wrap gap-2.5">
            {stamps.slice(0, 6).map((s, i) => (
              <div key={s.id || i} className="flex flex-col items-center justify-center text-center px-2 py-1.5" style={{ minWidth: 92, border: `2px solid ${["#F2B84B", "#5EEAD4", "#C4B5FD"][i % 3]}`, borderRadius: 12, color: ["#F2B84B", "#5EEAD4", "#C4B5FD"][i % 3], transform: i % 2 ? "rotate(4deg)" : "rotate(-4deg)" }}>
                <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 14 }}>{[s.origin, s.destination].filter(Boolean).map((x) => (String(x).match(/\(([A-Z]{3})\)/) || [])[1] || x).join(" → ")}</div>
                {stampDate(s.travelDate || s.travel_date) ? <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 10.5 }}>{stampDate(s.travelDate || s.travel_date)}</div> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="relative px-4 sm:px-6 pb-3"><Microprint dark /></div>
    </article>
  );
}

export default function PetPassport({
  pet,
  photo,
  stamps = [],
  owner = false,
  chipValue = "",
  sheet = false,
  sample = false,
  qr = null,
  pending = false,
  justIssued = false,
  onPhotoTap = null,
}) {
  const [flipped, setFlipped] = useState(false);
  const flip = () => setFlipped((f) => !f);
  const front = <Front pet={pet} photo={photo} owner={owner} chipValue={chipValue} sheet={sheet} pending={pending} justIssued={justIssued} onPhotoTap={onPhotoTap} onFlip={sheet ? null : flip} />;
  const back = <Back pet={pet} stamps={stamps} owner={owner} qr={qr} onFlip={sheet ? null : flip} />;

  // Printed: both sides, one above the other.
  if (sheet) return <div className="grid gap-4 min-w-0">{front}{back}</div>;

  return (
    <div className="grid gap-2 min-w-0">
      <div className="ppg-flip" data-flipped={flipped ? "1" : "0"} onClick={flip} role="button" tabIndex={0} aria-label={flipped ? "Show the passport front" : "Show the QR side"} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } }}>
        <div className="ppg-flip-inner">
          <div className="ppg-flip-face">{front}</div>
          <div className="ppg-flip-face ppg-flip-back">{back}</div>
        </div>
      </div>
      {sample ? null : <div className="text-center ppg-no-print" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Tap the passport to flip it</div>}
    </div>
  );
}
