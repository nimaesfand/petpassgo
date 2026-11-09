"use client";

import Icon from "../Icon";
import { PetIllustration } from "../PetIdCard";
import { tokens, font } from "../../lib/theme";
import { passportMissing } from "../../lib/petProfile";
import { profileProgress, petAge, SECTION_THEME } from "../../lib/petSections";

function Ring({ pct }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: 76, height: 76 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={tokens.gold} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 38 38)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "#fff" }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 19, lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontFamily: font.body, fontSize: 10.5, fontWeight: 700, opacity: 0.85 }}>complete</div>
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
    <section className="ppg-pet-hero relative overflow-hidden rounded-3xl p-5 sm:p-6" style={{ background: `linear-gradient(135deg, ${tokens.navy} 0%, #1D3463 55%, #0F5E5A 100%)`, color: "#fff" }}>
      <div aria-hidden="true" className="ppg-hero-paws" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="rounded-full overflow-hidden ppg-pulse" style={{ width: 96, height: 96, border: `4px solid ${tokens.gold}`, background: "#E8EEF7" }}>
              {photo || <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={86} /></div>}
            </div>
            {onPhoto ? (
              <label className="absolute flex items-center justify-center" title="Change photo" style={{ right: -2, bottom: -2, width: 34, height: 34, borderRadius: "50%", background: tokens.gold, color: tokens.navy, border: "3px solid #fff", cursor: "pointer" }}>
                <span className="sr-only">Change photo</span>
                <Icon name="camera" size={16} />
                <input type="file" accept="image/*" className="ppg-hp" onChange={onPhoto} />
              </label>
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 34, lineHeight: 1.02, letterSpacing: "-0.02em", overflowWrap: "anywhere" }}>{pet.name}</h2>
              {issued ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 12 }}>
                  <Icon name="check" size={13} />Passport issued
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {facts.map((f) => (
                <span key={f} className="rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.14)", fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>{f}</span>
              ))}
            </div>
            {photoBusy ? <div className="mt-1" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>Uploading photo…</div> : null}
          </div>
        </div>
        <div className="flex items-center gap-4 sm:flex-col sm:items-end">
          <Ring pct={prog.pct} />
        </div>
      </div>
      {next ? (
        <button type="button" onClick={() => onGo?.(next.section)} className="relative mt-5 w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ppg-lift"
          style={{ background: "#fff", color: tokens.navy, border: "none", cursor: "pointer" }}>
          <span className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 36, height: 36, background: SECTION_THEME[next.section].soft, color: SECTION_THEME[next.section].color }}>
              <Icon name="sparkle" size={18} />
            </span>
            <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16 }}>{next.text}</span>
          </span>
          <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 20, color: SECTION_THEME[next.section].color }}>→</span>
        </button>
      ) : null}
    </section>
  );
}
