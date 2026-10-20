"use client";
import PetQr from "../lib/PetQr";
import { tokens, font } from "../lib/theme";

export function PetIllustration({ type, size = 96 }) {
  const cat = type === "Cat";
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={cat ? "Cat illustration" : "Pet illustration"}>
      <rect width="96" height="96" rx="20" fill="#E8EEF7" />
      {cat ? (
        <g fill={tokens.navy}>
          <path d="M26 30 L34 52 L22 50 Z" /><path d="M70 30 L62 52 L74 50 Z" />
          <ellipse cx="48" cy="56" rx="24" ry="21" />
          <circle cx="40" cy="54" r="3" fill="#F2B84B" /><circle cx="56" cy="54" r="3" fill="#F2B84B" />
          <path d="M45 62 h6 l-3 3z" fill="#F2B84B" />
        </g>
      ) : (
        <g fill={tokens.navy}>
          <ellipse cx="28" cy="46" rx="9" ry="16" transform="rotate(18 28 46)" />
          <ellipse cx="68" cy="46" rx="9" ry="16" transform="rotate(-18 68 46)" />
          <ellipse cx="48" cy="54" rx="21" ry="22" />
          <circle cx="40" cy="50" r="3" fill="#fff" /><circle cx="56" cy="50" r="3" fill="#fff" />
          <ellipse cx="48" cy="62" rx="6" ry="4.5" fill="#F2B84B" />
        </g>
      )}
    </svg>
  );
}

/**
 * Passport-style Digital Pet ID. Used in the dashboard and on the public /id page.
 * photo: a ready element (signed image) or null for the illustration fallback.
 */
export default function PetIdCard({ pet, photo, showQr = true, children }) {
  const details = [
    ["Sex", pet.sex],
    ["Passport No.", pet.passport_no],
  ].filter(([, v]) => v);
  return (
    <div data-pet-passport className="rounded-2xl overflow-hidden w-full" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.10)" }}>
      <div style={{ background: tokens.navy }} className="px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={tokens.gold} aria-hidden="true"><circle cx="6" cy="9" r="2.2"/><circle cx="10" cy="5.5" r="2.2"/><circle cx="14" cy="5.5" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M12 10c-3.3 0-6 3.6-6 6.2 0 2 1.6 2.8 3.3 2.8 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.7 0 3.3-.8 3.3-2.8 0-2.6-2.7-6.2-6-6.2z"/></svg>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: "#fff" }}>PetPassGo</span>
        </div>
        <span style={{ textAlign: "right" }}><span style={{ display: "block", fontFamily: font.body, fontWeight: 700, fontSize: 11.5, letterSpacing: "0.14em", color: tokens.gold }}>DIGITAL PET ID</span><span style={{ display: "block", fontFamily: font.body, fontSize: 11, color: "#fff", opacity: 0.75 }}>Show this if found</span></span>
      </div>
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">
        <div className="flex gap-5 items-center flex-1 w-full">
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 104, height: 104, border: `4px solid ${tokens.gold}`, boxShadow: "0 4px 14px rgba(20,33,61,0.15)" }}>
            {photo || <PetIllustration type={pet.animal_type} size={104} />}
          </div>
          <div className="min-w-0">
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.14em", color: tokens.muted }}>NAME</div>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 30, lineHeight: 1.1, color: tokens.navy }} className="mb-1 break-words">{pet.name}</div>
            {(pet.breed || pet.animal_type) && (
              <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.ink }} className="mb-1">
                {[pet.breed, pet.animal_type].filter(Boolean).join(" · ")}
              </div>
            )}
            <dl className="grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: "auto 1fr", fontFamily: font.body, fontSize: 15 }}>
              {details.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt style={{ color: tokens.muted }}>{k}</dt>
                  <dd style={{ color: tokens.ink, fontWeight: 600, margin: 0 }}>{v}</dd>
                </div>
              ))}
            </dl>
            {pet.role && (
              <span className="inline-block mt-2 rounded-full px-3 py-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", background: pet.role === "Service animal" ? tokens.primary : tokens.navy, color: "#fff" }}>
                {pet.role.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        {showQr && (
          <div className="flex flex-col items-center justify-center rounded-xl p-3 flex-shrink-0" style={{ border: `2px dashed ${tokens.line}` }}>
            <PetQr petId={pet.id} size={128} color={tokens.navy} />
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", color: tokens.navy }} className="mt-2">SCAN IF FOUND</div>
            <div style={{ fontFamily: font.body, fontSize: 11.5, color: tokens.muted, textAlign: "center", maxWidth: 140 }}>Opens {pet.name || "this pet"}'s safe public page</div>
          </div>
        )}
      </div>
      <div className="px-5 py-3 flex flex-wrap gap-2" style={{ background: tokens.paper, borderTop: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 12.5, color: tokens.muted }}>
        <span>Name & photo only</span><span>·</span><span>No chip number shown</span><span>·</span><span>Message the owner privately</span>
      </div>
      {children}
    </div>
  );
}
