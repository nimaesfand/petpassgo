"use client";

import { useState } from "react";
import Logo from "./Logo";
import PetQr from "../lib/PetQr";
import { PetIllustration } from "./PetIdCard";
import { tokens, font } from "../lib/theme";
import { filled, fmtDob, profileUrl } from "../lib/petProfile";

function Cell({ k, v }) {
  if (!filled(v)) return null;
  return (
    <div className="min-w-0">
      <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: tokens.navy }}>{k}</div>
      <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.ink, overflowWrap: "anywhere" }}>{v}</div>
    </div>
  );
}

function stampDate(v) {
  return fmtDob(v);
}

export default function PetPassport({
  pet,
  photo,
  stamps = [],
  owner = false,
  chipValue = "",
  onPhoto,
  photoBusy = false,
  onDocuments,
}) {
  const [copied, setCopied] = useState(false);
  const url = profileUrl(pet);
  const contact = [pet.emergency_contact_name, pet.emergency_contact_phone].filter(filled).join(" · ");
  const rows = [
    ["Type", pet.animal_type],
    ["Breed", pet.breed],
    ["DOB", fmtDob(pet.date_of_birth)],
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
    <article data-pet-passport className="ppg-passport rounded-3xl overflow-hidden min-w-0 max-w-full" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 16px 40px rgba(20,33,61,0.12)" }}>
      <div className="px-4 py-3 flex items-center justify-between gap-3 min-w-0" style={{ background: tokens.navy }}>
        <div className="flex items-center gap-2 min-w-0">
          <Logo size={32} />
          <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 12, letterSpacing: "0.14em", color: tokens.gold, whiteSpace: "nowrap" }}>PET PASSPORT</div>
        </div>
        {pet.passport_no ? (
          <div className="text-right flex-shrink-0">
            <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: tokens.gold }}>PASSPORT NO.</div>
            <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15, color: "#fff", whiteSpace: "nowrap" }}>{pet.passport_no}</div>
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-6 min-w-0" style={{ background: "linear-gradient(180deg, #fff 0, #fff 70%, #FBF7EE 100%)" }}>
        <div className="flex flex-col sm:flex-row gap-4 min-w-0">
          <div className="relative self-center sm:self-start flex-shrink-0">
            <div className="rounded-2xl overflow-hidden" style={{ width: 132, height: 156, border: `3px solid ${tokens.gold}`, background: "#E8EEF7" }}>
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
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, lineHeight: 1.05, color: tokens.navy, overflowWrap: "anywhere" }}>{pet.name}</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 min-w-0">
              {rows.map(([k, v]) => <Cell key={k} k={k} v={v} />)}
            </div>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 self-center">
            <div className="rounded-xl p-2" style={{ border: `2px solid ${tokens.gold}`, background: "#fff" }}>
              <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={104} color={tokens.navy} />
            </div>
          </div>
        </div>

        {stamps.length > 0 ? (
          <div className="mt-6 pt-5 min-w-0" style={{ borderTop: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: tokens.navy }} className="mb-3">TRIP STAMPS</div>
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

        <div className="ppg-no-print flex flex-wrap gap-2 mt-5">
          <button type="button" onClick={() => window.print()} className="ppg-btn ppg-btn-primary">Print</button>
          <button type="button" onClick={share} className="ppg-btn ppg-btn-secondary">{copied ? "Link copied" : "Share"}</button>
          {owner && onDocuments ? <button type="button" onClick={onDocuments} className="ppg-btn ppg-btn-secondary">View documents</button> : null}
        </div>
      </div>
    </article>
  );
}
