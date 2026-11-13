"use client";

import { useState } from "react";
import { Wordmark } from "./Logo";
import Icon from "./Icon";
import PetQr from "../lib/PetQr";
import { PetIllustration } from "./PetIdCard";
import { tokens, font } from "../lib/theme";
import { filled, fmtDob, profileUrl, mrzLines, issuedLabel, chipMask } from "../lib/petProfile";

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
  const [copied, setCopied] = useState(false);
  const url = profileUrl(pet);
  const contact = [pet.emergency_contact_name, pet.emergency_contact_phone].filter(filled).join(" · ");
  const roleWord = /service/i.test(pet.role || "") ? "Service dog" : /emotional/i.test(pet.role || "") ? "Emotional support" : "Pet";
  const top = [
    ["Breed", pet.breed || pet.animal_type],
    ["Type", [pet.animal_type, roleWord].filter(filled).join(" · ")],
  ].filter(([, v]) => filled(v));
  const rows = [
    ["Sex", pet.sex],
    ["Born", fmtDob(pet.date_of_birth)],
    ["Weight", pet.weight_lb ? `${pet.weight_lb} lb` : ""],
    ["Color", pet.color],
    ["Owner", pet.handler_name],
    ["Microchip", owner && !sheet ? chipMask(chipValue) : chipValue],
    ["Issued", pet.passport_issued_at ? fmtDob(String(pet.passport_issued_at).slice(0, 10)) : ""],
    ["Trips", stamps.length ? String(stamps.length) : ""],
  ].filter(([, v]) => filled(v));

  async function share() {
    const payload = { title: `${pet.name || "Pet"} passport`, url };
    try {
      if (navigator.share) { await navigator.share(payload); return; }
    } catch { return; }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="grid gap-3 min-w-0">
      <article data-pet-passport className="ppg-passport ppg-sheen rounded-[22px] overflow-hidden min-w-0 max-w-full relative" style={{ background: "#FBF7EE", boxShadow: "0 1px 0 #E6DCC6, 0 22px 50px rgba(20,33,61,0.18)" }}>
        <div className="ppg-guilloche-dark px-4 sm:px-6 py-3 flex items-center justify-between gap-3 min-w-0" style={{ background: `linear-gradient(120deg, ${tokens.navy}, #22386A)` }}>
          <div className="min-w-0">
            <Wordmark size={19} onDark />
            <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 9.5, letterSpacing: "0.22em", color: tokens.gold, marginTop: 2 }}>PET PASSPORT</div>
          </div>
          {pet.passport_no ? (
            <div className="text-right flex-shrink-0">
              <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", color: tokens.gold }}>PASSPORT NO.</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: "#fff", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>{pet.passport_no}</div>
            </div>
          ) : null}
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${tokens.gold}, #F7D98C 50%, ${tokens.gold})` }} />

        <div className="ppg-guilloche-light px-4 sm:px-6 pt-4 sm:pt-5 pb-4 min-w-0 relative">
          <div className="flex gap-3 sm:gap-6 min-w-0">
            <div className="flex-shrink-0">
              <div className="ppg-pp-photo relative rounded-xl overflow-hidden" style={{ border: `3px solid #fff`, outline: `1.5px solid ${tokens.gold}`, background: "#E8EEF7", boxShadow: "0 6px 16px rgba(20,33,61,0.14)" }}>
                {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={110} /></div>}
                {onPhotoTap ? (
                  <button type="button" onClick={onPhotoTap} aria-label={photo ? "Retake passport photo" : "Add passport photo"} className="ppg-no-print absolute inset-0" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                    <span className="absolute flex items-center justify-center rounded-full" style={{ top: 6, right: 6, width: 30, height: 30, background: "#fff", color: tokens.navy, boxShadow: "0 2px 8px rgba(20,33,61,.3)" }}><Icon name="camera" size={15} /></span>
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>NAME</div>
              <h2 className="ppg-pp-name" style={{ fontFamily: font.display, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: tokens.navy, overflowWrap: "anywhere" }}>{pet.name}</h2>
              <div className="mt-2.5 grid grid-cols-1 gap-y-1.5 sm:gap-y-2 min-w-0">
                {top.map(([k, v]) => <Cell key={k} k={k} v={v} />)}
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-center flex-shrink-0">
              <div className="rounded-xl p-1.5" style={{ border: `1.5px solid ${tokens.gold}`, background: "#fff" }}>
                {qr || <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={96} color={tokens.navy} />}
              </div>
              <div className="mt-1" style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.12em", color: tokens.navy }}>SCAN IF FOUND</div>
            </div>
          </div>

          {rows.length ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2.5 min-w-0 pt-3" style={{ borderTop: "1px dashed #D9CDB2" }}>
              {rows.map(([k, v]) => <Cell key={k} k={k} v={v} />)}
            </div>
          ) : null}

          {contact ? (
            <div className="mt-4 rounded-xl px-3 py-2 flex items-center justify-between gap-3 min-w-0" style={{ background: "rgba(20,33,61,0.05)" }}>
              <div className="min-w-0">
                <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>IF FOUND, CONTACT</div>
                <div className="truncate" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{contact}</div>
              </div>
              <div className="sm:hidden flex-shrink-0 rounded-lg p-1" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
                {qr || <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={52} color={tokens.navy} />}
              </div>
            </div>
          ) : null}

          <div className="mt-3"><MrzStrip pet={pet} /></div>

          {pending ? (
            <div className="ppg-no-print ppg-pp-stampspot" aria-label="Not issued yet" role="img" style={{ position: "absolute", pointerEvents: "none" }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", border: `2.5px dashed #9AA4B2`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#7B8595", transform: "rotate(-12deg)", textAlign: "center", background: "rgba(251,247,238,0.6)" }}>
                <div style={{ fontFamily: font.body, fontSize: 8, fontWeight: 800, letterSpacing: "0.2em" }}>PETPASSGO</div>
                <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 800, lineHeight: 1.05 }}>NOT YET<br />ISSUED</div>
              </div>
            </div>
          ) : null}
          {pet.passport_issued_at ? (
            <div className="ppg-pp-stampspot" style={{ position: "absolute", pointerEvents: "none", mixBlendMode: "multiply" }}><PassportStamp date={pet.passport_issued_at} size={96} className={justIssued ? "ppg-pp-stamp" : ""} style={{ opacity: 0.9 }} /></div>
          ) : null}
        </div>

        {stamps.length > 0 ? (
          <div className="px-4 sm:px-6 pb-5 min-w-0" style={{ background: "#FBF7EE" }}>
            <div className="pt-4" style={{ borderTop: `1px dashed #D9CDB2` }}>
              <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", color: tokens.navy }} className="mb-3">TRIP STAMPS</div>
              <div className="flex flex-wrap gap-3 min-w-0">
                {stamps.map((s, i) => (
                  <div key={s.id || i} className="flex flex-col items-center justify-center text-center px-2 py-2" style={{ width: 120, minHeight: 84, border: `2.5px solid ${[tokens.primary, "#0F766E", "#7C3AED"][i % 3]}`, borderRadius: 14, color: [tokens.primary, "#0F766E", "#7C3AED"][i % 3], transform: i % 2 ? "rotate(4deg)" : "rotate(-5deg)" }}>
                    <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15, lineHeight: 1.2, overflowWrap: "anywhere" }}>{[s.origin, s.destination].filter(Boolean).map((x) => (String(x).match(/\(([A-Z]{3})\)/) || [])[1] || x).join(" → ")}</div>
                    <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 14, letterSpacing: "0.14em", marginTop: 2 }}>ENTRY</div>
                    {stampDate(s.travelDate || s.travel_date) ? <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 11 }}>{stampDate(s.travelDate || s.travel_date)}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </article>

      {sample || sheet ? null : (
        <div className="ppg-no-print flex items-center gap-2 flex-wrap">
          <button type="button" onClick={share} className="ppg-chip-btn">{copied ? "Link copied" : "Share"}</button>
          <button type="button" onClick={() => { if (!(owner && pet?.id)) window.print(); else window.open(`/account/passport/print?pet=${pet.id}`, "_blank"); }} className="ppg-chip-btn">Print</button>
          <span className="ml-auto" style={{ fontFamily: font.body, fontSize: 12, color: tokens.muted }}>Not a government document</span>
        </div>
      )}
    </div>
  );
}
