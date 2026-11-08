"use client";

import { useState } from "react";
import { Wordmark } from "./Logo";
import PetQr from "../lib/PetQr";
import { PetIllustration } from "./PetIdCard";
import { tokens, font } from "../lib/theme";
import { filled, fmtDob, profileUrl, mrzLines, issuedLabel } from "../lib/petProfile";

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function Cell({ k, v }) {
  if (!filled(v)) return null;
  return (
    <div className="min-w-0">
      <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", color: tokens.muted }}>{String(k).toUpperCase()}</div>
      <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy, overflowWrap: "anywhere" }}>{v}</div>
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
    <div aria-hidden="true" className="rounded-lg px-3 py-2 overflow-hidden" style={{ background: "#F1EADA", fontFamily: MONO, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.12em", lineHeight: 1.55, color: tokens.navy, whiteSpace: "pre" }}>
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
  onPhoto,
  onRemovePhoto,
  photoBusy = false,
  onDocuments,
  sheet = false,
  sample = false,
  qr = null,
}) {
  const [copied, setCopied] = useState(false);
  const url = profileUrl(pet);
  const contact = [pet.emergency_contact_name, pet.emergency_contact_phone].filter(filled).join(" · ");
  const rows = [
    ["Type", pet.animal_type],
    ["Breed", pet.breed],
    ["Date of birth", fmtDob(pet.date_of_birth)],
    ["Color", pet.color],
    ["Microchip", chipValue],
    ["Owner", pet.handler_name],
    ["Emergency contact", contact],
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
    <article data-pet-passport className="ppg-passport ppg-sheen rounded-3xl overflow-hidden min-w-0 max-w-full relative" style={{ background: "#FBF7EE", border: `1px solid #E6DCC6`, boxShadow: "0 18px 44px rgba(20,33,61,0.14)" }}>
      <div className="ppg-guilloche-dark px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 min-w-0" style={{ background: tokens.navy }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <Wordmark size={20} onDark />
          <div className="hidden sm:block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.18em", color: tokens.gold, whiteSpace: "nowrap", borderLeft: "1px solid rgba(242,184,75,0.45)", paddingLeft: 10 }}>PET PASSPORT · PASSEPORT</div>
        </div>
        {pet.passport_no ? (
          <div className="text-right flex-shrink-0">
            <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", color: tokens.gold }}>PASSPORT NO.</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: "#fff", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>{pet.passport_no}</div>
          </div>
        ) : null}
      </div>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${tokens.gold}, #E9C77A 50%, ${tokens.gold})` }} />

      <div className="ppg-guilloche-light p-4 sm:p-6 min-w-0 relative">
        <div className="relative min-w-0">
        <div className="flex flex-col sm:flex-row gap-5 min-w-0">
          <div className="relative self-center sm:self-start flex-shrink-0">
            <div className="rounded-2xl overflow-hidden" style={{ width: 132, height: 160, border: `3px solid ${tokens.gold}`, background: "#E8EEF7", boxShadow: "0 6px 16px rgba(20,33,61,0.12)" }}>
              {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={132} /></div>}
            </div>
            {owner && onPhoto ? (
              <label className="ppg-no-print absolute flex items-center justify-center" style={{ right: -4, bottom: -4, width: 36, height: 36, borderRadius: "50%", background: tokens.navy, color: "#fff", border: "2px solid #fff", cursor: "pointer" }}>
                <span className="sr-only">Change photo</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                <input type="file" accept="image/*" className="ppg-hp" onChange={onPhoto} />
              </label>
            ) : null}
            {photoBusy ? <div className="mt-1 text-center" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }}>Uploading photo…</div> : null}
            {owner && onRemovePhoto && photo ? <button type="button" onClick={onRemovePhoto} className="ppg-btn ppg-btn-secondary ppg-btn-compact ppg-no-print mt-2">Remove photo</button> : null}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", color: tokens.muted }}>NAME</div>
            <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 38, lineHeight: 1.02, letterSpacing: "-0.02em", color: tokens.navy, overflowWrap: "anywhere" }}>{pet.name}</h2>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 min-w-0">
              {rows.map(([k, v]) => <Cell key={k} k={k} v={v} />)}
            </div>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 self-center sm:self-start">
            <div className="rounded-xl p-2" style={{ border: `2px solid ${tokens.gold}`, background: "#fff" }}>
              {qr || <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={108} color={tokens.navy} />}
            </div>
            <div className="mt-1.5" style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", color: tokens.navy }}>SCAN IF FOUND</div>
          </div>
        </div>

        <div className="mt-5"><MrzStrip pet={pet} /></div>
        <p className="mt-2" style={{ fontFamily: font.body, fontSize: 12, color: tokens.muted }}>A PetPassGo digital pet profile. Not a government passport or official travel document.</p>

        {pet.passport_issued_at ? (
          <PassportStamp date={pet.passport_issued_at} size={112} className="ppg-stamp-on-card" style={{ position: "absolute", right: 150, bottom: 22, opacity: 0.85, mixBlendMode: "multiply", pointerEvents: "none" }} />
        ) : null}
        </div>

        {stamps.length > 0 ? (
          <div className="mt-6 pt-5 min-w-0" style={{ borderTop: `1px dashed #D9CDB2` }}>
            <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.navy }} className="mb-3">TRIP STAMPS</div>
            <div className="flex flex-wrap gap-3 min-w-0">
              {stamps.map((s, i) => (
                <div key={s.id || i} className="min-w-0" style={{ width: 148, maxWidth: "100%", transform: i % 2 ? "rotate(4deg)" : "rotate(-6deg)" }}>
                  <div className="flex flex-col items-center justify-center text-center px-2 py-3" style={{ minHeight: 112, border: `3px solid ${tokens.primary}`, borderRadius: 16, color: tokens.primary, background: "rgba(194,65,12,0.05)" }}>
                    <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 13, lineHeight: 1.25, overflowWrap: "anywhere" }}>{[s.origin, s.destination].filter(Boolean).join(" → ")}</div>
                    <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 18, letterSpacing: "0.14em", marginTop: 4 }}>ISSUED</div>
                    {stampDate(s.travelDate || s.travel_date) ? <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12, marginTop: 2 }}>{stampDate(s.travelDate || s.travel_date)}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {sample ? null : (
          <div className="ppg-no-print flex flex-wrap gap-2 mt-5">
            <button type="button" onClick={() => { if (sheet || !(owner && pet?.id)) window.print(); else window.open(`/account/passport/print?pet=${pet.id}`, "_blank"); }} className="ppg-btn ppg-btn-primary">Print</button>
            <button type="button" onClick={share} className="ppg-btn ppg-btn-secondary">{copied ? "Link copied" : "Share"}</button>
            {owner && onDocuments ? <button type="button" onClick={onDocuments} className="ppg-btn ppg-btn-secondary">View documents</button> : null}
          </div>
        )}
      </div>
    </article>
  );
}
