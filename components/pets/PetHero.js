"use client";

import Icon from "../Icon";
import { PetIllustration } from "../PetIdCard";
import { tokens, font } from "../../lib/theme";
import { passportMissing } from "../../lib/petProfile";
import { profileProgress, petAge, SECTION_THEME } from "../../lib/petSections";

function Ring({ pct }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: 60, height: 60 }}>
      <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={tokens.gold} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "#fff" }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontFamily: font.body, fontSize: 9, fontWeight: 700, opacity: 0.85 }}>done</div>
      </div>
    </div>
  );
}

// Big, warm header for each pet: photo, quick facts, how complete the profile is,
// and the single most useful next step.
export default function PetHero({ pet, photo, onGo, onPhoto, photoBusy }) {
  const prog = profileProgress(pet);
  const missingPassport = passportMissing(pet);
  const issued = !!pet.passport_issued_at;
  const facts = [pet.breed || pet.animal_type, petAge(pet.date_of_birth), pet.sex, pet.weight_lb ? `${pet.weight_lb} lb` : ""].filter(Boolean);

  let next = null;
  if (!issued && missingPassport.length) {
    next = {
      section: "passport",
      text: missingPassport.length === 1
        ? `Add ${missingPassport[0].toLowerCase()} to issue ${pet.name}'s passport`
        : `${missingPassport.length} details left to issue ${pet.name}'s passport`,
    };
  } else if (prog.missing.length) {
    const [, label, section] = prog.missing[0];
    next = { section, text: `Next: add ${label.toLowerCase()}` };
  }

  return (
    <section className="ppg-pet-hero relative overflow-hidden rounded-3xl p-4 sm:p-6" style={{ background: `linear-gradient(135deg, ${tokens.navy} 0%, #1D3463 55%, #0F5E5A 100%)`, color: "#fff" }}>
      <div aria-hidden="true" className="ppg-hero-paws" />
      <div className="relative flex items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="ppg-hero-photo rounded-full overflow-hidden" style={{ border: `4px solid ${tokens.gold}`, background: "#E8EEF7" }}>
              {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={68} /></div>}
            </div>
            {onPhoto ? (
              <label className="absolute flex items-center justify-center" title="Change photo" style={{ right: -4, bottom: -4, width: 30, height: 30, borderRadius: "50%", background: tokens.gold, color: tokens.navy, border: "3px solid #fff", cursor: "pointer" }}>
                <span className="sr-only">Change photo</span>
                <Icon name="camera" size={14} />
                <input type="file" accept="image/*" className="ppg-hp" onChange={onPhoto} />
              </label>
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="ppg-hero-name" style={{ fontFamily: font.display, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.02em", overflowWrap: "anywhere" }}>{pet.name}</h2>
              {issued ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 12 }}>
                  <Icon name="check" size={13} />Passport issued
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {facts.map((f) => (
                <span key={f} className="rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.14)", fontFamily: font.body, fontSize: 12.5, fontWeight: 700 }}>{f}</span>
              ))}
            </div>
            {photoBusy ? <div className="mt-1" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>Uploading photo…</div> : null}
          </div>
        </div>
        <Ring pct={prog.pct} />
      </div>
      {next ? (
        <button type="button" onClick={() => onGo?.(next.section)} className="relative mt-4 w-full flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left ppg-lift"
          style={{ background: "#fff", color: tokens.navy, border: "none", cursor: "pointer" }}>
          <span className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 32, height: 32, background: SECTION_THEME[next.section].soft, color: SECTION_THEME[next.section].color }}>
              <Icon name="sparkle" size={18} />
            </span>
            <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 15 }}>{next.text}</span>
          </span>
          <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 20, color: SECTION_THEME[next.section].color }}>→</span>
        </button>
      ) : null}
    </section>
  );
}
