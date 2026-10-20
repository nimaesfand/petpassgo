"use client";
import { useEffect, useState } from "react";
import PetQr from "../lib/PetQr";
import { PetIllustration } from "./PetIdCard";
import { tokens, font } from "../lib/theme";

const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const fmt = (v) => (v ? new Date(`${String(v).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const telHref = (p) => `tel:${String(p || "").replace(/[^0-9+]/g, "")}`;

export function ageText(months) {
  if (months == null || Number.isNaN(months) || months < 0) return "";
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  return `${y} yr${y === 1 ? "" : "s"}`;
}
export function monthsSince(dob) {
  if (!dob) return null;
  const b = new Date(`${dob}T12:00:00`); const n = new Date();
  let m = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
  if (n.getDate() < b.getDate()) m -= 1;
  return m;
}
export const isService = (role) => /service/i.test(role || "");
const last4 = (v) => String(v || "").replace(/[^0-9A-Za-z]/g, "").slice(-4);

export function rabiesLine(expires) {
  if (!expires) return { text: "No rabies record on file", tone: "muted" };
  if (String(expires).slice(0, 10) >= todayISO()) return { text: `Rabies current until ${fmt(expires)}`, tone: "good" };
  return { text: `Rabies expired ${fmt(expires)}`, tone: "bad" };
}

// Owner's pet row + vault health rows -> card fields
export function cardFromPet(pet, healthRows = []) {
  const rab = healthRows.filter((h) => h.kind === "vaccine" && /rabies/i.test(h.name || "") && h.expires_on).map((h) => h.expires_on).sort().pop() || null;
  return {
    id: pet.id, name: pet.name, animal_type: pet.animal_type, breed: pet.breed, sex: pet.sex,
    age: ageText(monthsSince(pet.date_of_birth)), service: isService(pet.role), trained: pet.trained,
    handler: pet.handler_name, contactName: pet.emergency_contact_name, contactPhone: pet.emergency_contact_phone,
    chipLast4: last4(pet.microchip_number), passportNo: pet.passport_no, rabiesExpires: rab,
    contactPublic: !!pet.show_contact_on_public_id,
  };
}
// get_public_pet_card row -> card fields
export function cardFromPublic(r) {
  return {
    id: r.id, name: r.name, animal_type: r.animal_type, breed: r.breed, sex: r.sex, age: ageText(r.age_months),
    service: isService(r.role), trained: r.trained, handler: r.handler_name, contactName: r.emergency_contact_name,
    contactPhone: r.emergency_contact_phone, chipLast4: r.chip_last4, passportNo: r.passport_no, rabiesExpires: r.rabies_expires,
    contactPublic: true, isPublic: true,
  };
}

function Row({ label, children, hidden }) {
  return (
    <div className="py-2.5 flex items-baseline justify-between gap-3" style={{ borderTop: `1px solid ${tokens.line}` }}>
      <dt style={{ fontFamily: font.body, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: tokens.muted, textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</dt>
      <dd style={{ margin: 0, fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.ink, textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>
        {children}
        {hidden && <span className="ml-2 rounded-full px-2 py-0.5 align-middle" style={{ background: tokens.sky, color: tokens.muted, fontSize: 11, fontWeight: 700 }}>Private</span>}
      </dd>
    </div>
  );
}

/** The polished Pet ID card. `photo` is a ready element or null. In owner preview,
 *  rows the public page would hide are labeled Private; on the public page they're omitted. */
export default function PetIdPreviewCard({ card, photo }) {
  const c = card;
  const rab = rabiesLine(c.rabiesExpires);
  const showRabies = !c.isPublic || rab.tone === "good";
  const accent = c.service ? tokens.primary : tokens.gold;
  const meta = [c.breed || c.animal_type, c.sex, c.age].filter(Boolean).join(" · ");
  const contactHidden = !c.isPublic && !c.contactPublic;
  return (
    <div data-pet-id-card className="rounded-[22px] overflow-hidden w-full mx-auto" style={{ maxWidth: 400, background: "#fff", boxShadow: "0 18px 48px rgba(11,21,41,0.28)", border: `1px solid ${tokens.line}` }}>
      <div className="relative px-5 pt-4 pb-14" style={{ background: `linear-gradient(135deg, ${tokens.navyDeep} 0%, ${tokens.navy} 60%, #23345C 100%)` }}>
        <svg aria-hidden="true" width="180" height="180" viewBox="0 0 24 24" fill="#fff" style={{ position: "absolute", right: -30, top: -30, opacity: 0.05 }}><circle cx="6" cy="9" r="2.2"/><circle cx="10" cy="5.5" r="2.2"/><circle cx="14" cy="5.5" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M12 10c-3.3 0-6 3.6-6 6.2 0 2 1.6 2.8 3.3 2.8 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.7 0 3.3-.8 3.3-2.8 0-2.6-2.7-6.2-6-6.2z"/></svg>
        <div className="flex items-center justify-between relative">
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 16, color: "#fff" }}>PetPassGo</span>
          <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.18em", color: tokens.gold }}>{c.service ? "SERVICE ANIMAL ID" : "PET ID"}</span>
        </div>
        {c.passportNo && <div className="relative mt-1" style={{ fontFamily: font.body, fontSize: 12, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)" }}>No. {c.passportNo}</div>}
      </div>
      <div className="px-5 -mt-11 relative">
        <div className="flex items-end gap-4">
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 96, height: 96, border: `4px solid #fff`, boxShadow: `0 0 0 2px ${accent}, 0 6px 18px rgba(11,21,41,0.2)`, background: "#E8EEF7" }}>
            {photo || <PetIllustration type={c.animal_type} size={88} />}
          </div>
          <div className="min-w-0 pb-1">
            {c.service && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 mb-1" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                {/dog/i.test(c.animal_type || "dog") ? "SERVICE DOG" : "SERVICE ANIMAL"}
              </span>
            )}
          </div>
        </div>
        <h2 className="mt-3" style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy, lineHeight: 1.05, overflowWrap: "anywhere" }}>{c.name}</h2>
        {meta && <div className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, fontWeight: 600 }}>{meta}</div>}
        <dl className="mt-3">
          {c.chipLast4 && <Row label="Microchip">•••• {c.chipLast4}</Row>}
          {showRabies && <Row label="Vaccines"><span style={{ color: rab.tone === "good" ? tokens.green : rab.tone === "bad" ? tokens.primary : tokens.muted }}>{rab.text}</span></Row>}
          {c.service && <Row label="Service animal">Yes, owner-declared</Row>}
          {c.trained != null && <Row label="Trained">{c.trained ? "Yes, per owner" : "No"}</Row>}
          {c.handler && <Row label={c.service ? "Handler" : "Owner"} hidden={contactHidden}>{c.handler}</Row>}
          {(c.contactName || c.contactPhone) && (
            <Row label="Emergency" hidden={contactHidden}>
              {c.contactName}{c.contactName && c.contactPhone ? " · " : ""}
              {c.contactPhone && <a href={telHref(c.contactPhone)} style={{ color: tokens.primary, textDecoration: "underline" }}>{c.contactPhone}</a>}
            </Row>
          )}
        </dl>
      </div>
      <div className="mx-5 mt-2 mb-5 rounded-2xl p-3 flex items-center gap-3" style={{ background: tokens.sky }}>
        <div className="rounded-xl p-1.5" style={{ background: "#fff" }}><PetQr petId={c.id} size={84} color={tokens.navy} /></div>
        <div className="min-w-0">
          <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 13, letterSpacing: "0.12em", color: tokens.navy }}>FOUND ME? SCAN</div>
          <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted, lineHeight: 1.4 }}>Message my {c.service ? "handler" : "owner"} right away. Their email and phone stay private.</div>
        </div>
      </div>
    </div>
  );
}

/** Full-screen sheet for the owner's "Preview Pet ID". */
export function PetIdSheet({ open, onClose, card, photo, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`${card.name}'s Pet ID`} className="fixed inset-0 z-[80] overflow-y-auto" style={{ background: "rgba(11,21,41,0.97)" }} onClick={onClose}>
      <div className="min-h-full flex flex-col items-center px-4 pt-4 pb-10" onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex justify-end mb-3" style={{ maxWidth: 400 }}>
          <button onClick={onClose} aria-label="Close" className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.14)", color: "#fff", border: "none", cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <PetIdPreviewCard card={card} photo={photo} />
        <div className="w-full mt-4" style={{ maxWidth: 400 }}>{children}</div>
      </div>
    </div>
  );
}
