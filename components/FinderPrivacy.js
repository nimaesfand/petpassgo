"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { SECTION_THEME } from "../lib/petSections";

// What a finder sees when they scan the collar tag. Owner's choice, saved instantly.
const T = SECTION_THEME.lost || SECTION_THEME.id;
const ITEMS = [
  ["show_contact_on_public_id", "Emergency contact phone", (p) => [p.emergency_contact_name, p.emergency_contact_phone].filter(Boolean).join(" · ") || "Add one in Passport details"],
  ["show_medical_on_public", "Allergies, meds and vet", (p) => [p.allergies && `Allergies: ${p.allergies}`, p.vet_name && `Vet: ${p.vet_name}`].filter(Boolean).join(" · ") || "Helps if they need care"],
];

function Switch({ on, onClick, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className="flex-shrink-0"
      style={{ width: 50, height: 30, borderRadius: 999, border: "none", cursor: "pointer", background: on ? T.color : "#CBD3DE", position: "relative", transition: "background .2s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s" }} />
    </button>
  );
}

export default function FinderPrivacy({ pet, userId, onChanged }) {
  const [vals, setVals] = useState(() => Object.fromEntries(ITEMS.map(([k]) => [k, !!pet[k]])));
  async function flip(k) {
    const next = !vals[k];
    setVals((v) => ({ ...v, [k]: next }));
    const { error } = await supabase.from("pets").update({ [k]: next }).eq("id", pet.id).eq("user_id", userId);
    if (error) setVals((v) => ({ ...v, [k]: !next }));
    else onChanged?.();
  }
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: tokens.sky }}>
      <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800, color: tokens.navy }}>Lost? Anyone who scans their tag can reach you.</div>
      <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>You choose what they see. They can always message you, and your email stays private.</p>
      <div className="grid gap-2 mt-3">
        <div className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div className="min-w-0">
            <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{pet.name}&apos;s name, photo and a message button</div>
            <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Always shown, so they can reach you</div>
          </div>
          <span style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 800, color: tokens.green }}>On</span>
        </div>
        {ITEMS.map(([k, t, sub]) => (
          <div key={k} className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div className="min-w-0">
              <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{t}</div>
              <div className="truncate" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{sub(pet)}</div>
            </div>
            <Switch on={vals[k]} onClick={() => flip(k)} label={`Show ${t.toLowerCase()} to finders`} />
          </div>
        ))}
      </div>
    </div>
  );
}
