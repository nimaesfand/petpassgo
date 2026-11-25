"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Wordmark } from "./Logo";
import Icon from "./Icon";
import PetQr from "../lib/PetQr";
import { tokens, font } from "../lib/theme";
import { filled, fmtDob, mrzLines, issuedLabel, chipMask } from "../lib/petProfile";
import { trainingSummary, trainedByLine, tasksLine, taskGroupsLine, whereLine } from "../lib/training";

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
  service: { label: "SERVICE DOG", bg: "#1D4ED8", fg: "#fff" },
  esa: { label: "EMOTIONAL SUPPORT", bg: "#B91C1C", fg: "#fff" },
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

// Training on the card: one short line. Details (who, where, tasks) live behind the
// QR on the check page, only when the owner shares them.
function trainingText(pet) {
  const t = pet.training || {};
  if (pet.service_attested_at && Array.isArray(t.levels) && t.levels.includes("tasks")) return "Task trained";
  const two = trainingSummary(t).split(", ").filter(Boolean).slice(0, 2).join(", ");
  return two || (pet.trained == null ? "" : pet.trained ? "House trained" : "Not yet");
}

// Role badge under the photo: deep blue (service dog) or deep red (ESA), metallic sheen.
function RoleLabel({ kind, signed }) {
  const c = SEALS[kind];
  const sub = kind === "esa" ? "Flies as a pet" : signed ? "Handler statement signed" : "Statement not signed yet";
  return (
    <div className={`ppg-badge ppg-badge-${kind} w-full rounded-lg px-2 py-1.5 text-center`}>
      <div style={{ fontFamily: font.body, fontWeight: 900, fontSize: 11, letterSpacing: "0.14em", color: "#fff", lineHeight: 1.15, textShadow: "0 1px 1px rgba(0,0,0,.35)" }}>{c.title}</div>
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 9.5, color: "rgba(255,255,255,.92)", lineHeight: 1.25, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// Role seals. Service dogs (including psychiatric service dogs) get blue; emotional
// support animals get red, with a reminder that they fly as pets.
const SEALS = {
  service: { a: "#1D4ED8", b: "#1E3A8A", soft: "#E0E7FF", glow: "rgba(29,78,216,.3)", title: "SERVICE DOG" },
  esa: { a: "#B91C1C", b: "#7F1D1D", soft: "#FEE2E2", glow: "rgba(185,28,28,.28)", title: "EMOTIONAL SUPPORT" },
};
function RoleSeal({ kind, attestedAt }) {
  const c = SEALS[kind];
  const d = attestedAt ? new Date(attestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase() : "";
  const sub = kind === "esa" ? "FLIES AS A PET" : d ? `HANDLER STATEMENT · ${d}` : "STATEMENT NOT SIGNED";
  return (
    <div className="inline-flex items-center gap-2 mt-2 rounded-xl pl-1.5 pr-3 py-1.5" style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})`, boxShadow: `inset 0 0 0 1.5px ${tokens.gold}, 0 3px 10px ${c.glow}` }}>
      <span aria-hidden="true" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 30, height: 30, background: "#fff", boxShadow: `0 0 0 2px ${tokens.gold}` }}>
        {kind === "esa" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill={c.soft} stroke={c.a} strokeWidth="2" strokeLinejoin="round"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5l7.5 3v5.6c0 4.6-3.1 8.6-7.5 10.4-4.4-1.8-7.5-5.8-7.5-10.4V5.5z" fill={c.soft} />
            <path d="M8.3 12.2l2.5 2.5 4.9-5" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 11.5, letterSpacing: "0.16em", color: "#fff", lineHeight: 1.1 }}>{c.title}</span>
        <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 9, letterSpacing: "0.1em", color: "#F7D98C", lineHeight: 1.3 }}>{sub}</span>
      </span>
    </div>
  );
}

// The empty photo spot: a fine line portrait, like a specimen passport, not a cartoon.
export function PhotoSlot({ type = "Dog", label = "PHOTO" }) {
  const ink = "rgba(20,33,61,.42)";
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: "repeating-linear-gradient(135deg, #F3EEE2 0 6px, #EFE8D9 6px 7px)" }}>
      <svg viewBox="0 0 100 110" style={{ width: "62%", height: "auto" }} fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {type === "Cat" ? (
          <g>
            <path d="M31 44 C31 30 69 30 69 44 L69 64 C69 80 60 88 50 88 C40 88 31 80 31 64 Z" />
            <path d="M32 40 L28 19 L45 31" /><path d="M68 40 L72 19 L55 31" />
            <path d="M39 55 C41 52 45 52 47 55" /><path d="M53 55 C55 52 59 52 61 55" />
            <path d="M47 66 L50 69 L53 66 Z" fill={ink} />
            <path d="M50 69 V73 M44 76 C47 78 53 78 56 76" />
            <path d="M40 68 L24 65 M40 71 L25 73 M60 68 L76 65 M60 71 L75 73" />
            <path d="M22 108 C26 96 38 91 50 91 C62 91 74 96 78 108" />
          </g>
        ) : (
          <g>
            <path d="M31 40 C31 23 69 23 69 40 L71 62 C71 80 60 89 50 89 C40 89 29 80 29 62 Z" />
            <path d="M33 33 C21 29 14 43 17 62 C19 71 27 69 30 59" /><path d="M67 33 C79 29 86 43 83 62 C81 71 73 69 70 59" />
            <circle cx="42" cy="52" r="2.2" fill={ink} stroke="none" /><circle cx="58" cy="52" r="2.2" fill={ink} stroke="none" />
            <ellipse cx="50" cy="67" rx="5" ry="3.6" fill={ink} stroke="none" />
            <path d="M50 70.5 V75 M44 78 C47 80.5 53 80.5 56 78" />
            <path d="M22 108 C26 96 38 91 50 91 C62 91 74 96 78 108" />
          </g>
        )}
      </svg>
      <span style={{ fontFamily: font.body, fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", color: "rgba(20,33,61,.5)", marginTop: 4 }}>{label}</span>
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

// Replaces a fake machine-readable line: the real passport number and a signed
// code anyone can check at petpassgo.com/verify.
export function VerifyStrip({ no, code }) {
  return (
    <div className="rounded-lg px-3 py-2 flex items-center justify-between gap-3 flex-wrap" style={{ background: "#F1EADA" }}>
      <div className="min-w-0">
        <div style={{ fontFamily: font.body, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.16em", color: tokens.muted }}>VERIFICATION CODE</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: "0.12em", color: tokens.navy }}>{code || "····-····-····"}</div>
      </div>
      <div className="text-right" style={{ fontFamily: font.body, fontSize: 11, fontWeight: 700, color: tokens.muted, lineHeight: 1.3 }}>Check it at<br /><span style={{ color: tokens.navy }}>petpassgo.com/verify</span></div>
    </div>
  );
}

function RabiesField({ rabies }) {
  if (!rabies) return null;
  const today = new Date().toISOString().slice(0, 10);
  const expired = rabies.expires_on && rabies.expires_on < today;
  const tag = expired ? ["EXPIRED", "#B91C1C", "#FDECEC"] : rabies.verified_at ? ["✓ VET VERIFIED", "#15803D", "#EAF6EE"] : ["OWNER-STATED", "#6B7585", "#EEF1F5"];
  return (
    <div className="min-w-0">
      <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>RABIES</div>
      <div className="ppg-pp-val" style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>{rabies.expires_on ? `Until ${fmtDob(rabies.expires_on)}` : "On file"}</div>
      <span className="inline-block rounded px-1.5 py-0.5 mt-0.5" style={{ background: tag[2], color: tag[1], fontFamily: font.body, fontWeight: 800, fontSize: 9, letterSpacing: "0.1em" }}>{tag[0]}</span>
    </div>
  );
}

export function shortName(full) {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function Front({ pet, photo, owner, chipValue, sheet, pending, justIssued, onPhotoTap, onFlip, rabies, code }) {
  const st = statusOf(pet.role);
  const age = ageLabel(pet.date_of_birth);
  // Full name for the owner, prints and samples; first name + last initial anywhere it's shared.
  const fullHolder = String(pet.handler_name || "").trim();
  const holder = owner || sheet || String(pet.id || "").startsWith("sample") ? fullHolder : shortName(fullHolder);
  const fields = [
    ["Species", pet.animal_type],
    ["Breed", pet.breed],
    ["Sex", pet.sex],
    ["Born", [fmtDob(pet.date_of_birth), age && `(${age})`].filter(Boolean).join(" ")],
    ["Weight", pet.weight_lb ? `${pet.weight_lb} lb` : ""],
    ["Color", pet.color],
    ["Training", trainingText(pet)],
    ["Microchip", owner && !sheet ? chipMask(chipValue) : chipValue],
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
              {photo || <PhotoSlot type={pet.animal_type} />}
              {onPhotoTap ? (
                <button type="button" onClick={(e) => { e.stopPropagation(); onPhotoTap(); }} aria-label={photo ? "Retake passport photo" : "Add passport photo"} className="ppg-no-print absolute inset-0" style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  <span className="absolute flex items-center justify-center rounded-full" style={{ top: 6, right: 6, width: 28, height: 28, background: "#fff", color: tokens.navy, boxShadow: "0 2px 8px rgba(20,33,61,.3)" }}><Icon name="camera" size={14} /></span>
                </button>
              ) : null}
            </div>
            {st === STATUS.service || st === STATUS.esa ? <RoleLabel kind={st === STATUS.service ? "service" : "esa"} signed={!!pet.service_attested_at} /> : null}
            <div className="flex items-center gap-2">
              {photo ? <div aria-hidden="true" className="ppg-pp-ghost rounded-md overflow-hidden" style={{ width: 34, height: 42, opacity: 0.22, filter: "grayscale(1) contrast(1.2)", mixBlendMode: "multiply" }}>{photo}</div> : null}
              <HoloSeal size={40} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="ppg-pp-namerow flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>NAME</div>
                <h2 className={`ppg-pp-name ${String(pet.name || "").length > 9 ? "is-long" : String(pet.name || "").length > 5 ? "is-mid" : ""}`} style={{ fontFamily: font.display, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: tokens.navy, overflowWrap: "break-word" }}>{pet.name}</h2>
                {holder ? (
                  <div className="mt-2">
                    <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>{st === STATUS.service ? "HANDLER" : "OWNER"}</div>
                    <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy, overflowWrap: "break-word" }}>{holder}</div>
                  </div>
                ) : null}
                {st === STATUS.service || st === STATUS.esa ? null : <span className="inline-block rounded-md px-2 py-0.5 mt-2" style={{ background: st.bg, color: st.fg, fontFamily: font.body, fontWeight: 800, fontSize: 10.5, letterSpacing: "0.14em" }}>{st.label}</span>}
              </div>
              {pet.passport_issued_at ? (
                <div className="ppg-pp-stampspot2 flex-shrink-0" style={{ mixBlendMode: "multiply", pointerEvents: "none" }}><PassportStamp date={pet.passport_issued_at} size={86} className={justIssued ? "ppg-pp-stamp" : ""} style={{ opacity: 0.9 }} /></div>
              ) : pending ? (
                <div className="ppg-no-print flex-shrink-0" aria-label="Not issued yet" role="img" style={{ width: 82, height: 82, borderRadius: "50%", border: "2.5px dashed #9AA4B2", display: "flex", alignItems: "center", justifyContent: "center", color: "#7B8595", transform: "rotate(-12deg)", textAlign: "center", fontFamily: font.display, fontSize: 12, fontWeight: 800, lineHeight: 1.05 }}>NOT YET<br />ISSUED</div>
              ) : null}
            </div>
          </div>
          <div className="ppg-pp-fields pt-3 grid gap-x-4 gap-y-2.5 min-w-0" style={{ borderTop: "1px dashed #D9CDB2" }}>
            {fields.map(([k, v]) => <Field key={k} k={k} v={v} mono={k === "Microchip"} wide={k === "Training" && String(v).length > 24} />)}
            <RabiesField rabies={rabies} />
          </div>
        </div>

        <div className="flex-1" />
        <div className="mt-4"><Microprint /></div>
        <div className="mt-1.5">{pet.passport_issued_at ? <VerifyStrip no={pet.passport_no} code={code} /> : <MrzStrip pet={pet} />}</div>
      </div>
    </article>
  );
}

// Owner: open travel mode, a full-screen view of everything about the pet.
async function openTravelMode(pet) {
  const win = window.open("", "_blank");
  try {
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/checkin-link", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id, mode: "travel" }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.url) throw new Error(j.error || "Couldn't open travel mode.");
    if (win) win.location.href = j.url; else window.location.href = j.url;
  } catch (e) { if (win) win.close(); alert(e.message || "Couldn't open travel mode."); }
}

// Owner: download the print-ready QR tag sheet.
async function downloadTagPdf(pet) {
  try {
    const { data: s } = await supabase.auth.getSession();
    const r = await fetch("/api/tag-pdf", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || "The tag sheet could not be made."); return; }
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement("a"); a.href = url; a.download = `${String(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-QR-tags.pdf`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch { alert("The tag sheet could not be made."); }
}

function Back({ pet, stamps, owner, qr, onFlip, onCheckin }) {
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
      <div className="relative px-4 sm:px-6 pb-3 ppg-no-print flex flex-wrap items-center justify-between gap-2" style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 10 }}>
        <div style={{ fontFamily: font.body, fontSize: 13.5, color: "rgba(255,255,255,.85)", lineHeight: 1.4 }}>Print this code for their collar tag. You get a print-ready PDF in 3 tag sizes.</div>
        {owner && pet.id && !String(pet.id).startsWith("sample") ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); downloadTagPdf(pet); }} className="rounded-full px-4 flex items-center gap-1.5" style={{ minHeight: 38, background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", fontFamily: font.body, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            <Icon name="download" size={15} /> Tag PDF
          </button>
        ) : null}
      </div>
      {onCheckin ? (
        <div className="relative px-4 sm:px-6 pb-4 ppg-no-print">
          <button type="button" onClick={(e) => { e.stopPropagation(); onCheckin(); }} className="w-full rounded-full flex items-center justify-center gap-2" style={{ minHeight: 50, background: tokens.gold, color: tokens.navy, border: "none", fontFamily: font.body, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
            <Icon name="checkCircle" size={18} /> Travel mode
          </button>
        </div>
      ) : null}
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
  const [rabies, setRabies] = useState(null);
  const [code, setCode] = useState(pet.verify_code || "");
  const flip = () => setFlipped((f) => !f);
  useEffect(() => {
    if (!owner || sample || !pet?.id) return;
    let live = true;
    supabase.from("pet_health_records").select("name,expires_on,verified_at").eq("pet_id", pet.id).ilike("name", "%rabies%").order("expires_on", { ascending: false, nullsFirst: false }).limit(1)
      .then(({ data }) => { if (live) setRabies(data?.[0] || null); });
    if (pet.passport_issued_at && !pet.verify_code) {
      supabase.auth.getSession().then(async ({ data }) => {
        const r = await fetch("/api/passport-code", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id }) }).catch(() => null);
        const j = r ? await r.json().catch(() => ({})) : {};
        if (live && j.code) setCode(j.code);
      });
    }
    return () => { live = false; };
  }, [pet?.id, pet?.passport_issued_at, pet?.verify_code, owner, sample]);
  const front = <Front pet={pet} photo={photo} owner={owner} chipValue={chipValue} sheet={sheet} pending={pending} justIssued={justIssued} onPhotoTap={onPhotoTap} onFlip={sheet ? null : flip} rabies={rabies} code={code} />;
  const back = <Back pet={pet} stamps={stamps} owner={owner} qr={qr} onFlip={sheet ? null : flip} onCheckin={owner && !sheet && !sample ? () => openTravelMode(pet) : null} />;

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
