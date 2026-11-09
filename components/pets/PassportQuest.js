"use client";

import { useState } from "react";
import Icon from "../Icon";
import BreedInput from "../BreedInput";
import PhotoBooth from "./PhotoBooth";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";
import { PASSPORT_FIELDS, filled } from "../../lib/petProfile";
import { SECTION_THEME } from "../../lib/petSections";

const T = SECTION_THEME.passport;
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "10px 12px", width: "100%", background: "#fff", minHeight: 46 };

function Field({ k, pet, value, setValue }) {
  if (k === "breed") return <BreedInput aria-label="Breed" animal={pet.animal_type || "Dog"} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Start typing, e.g. Dachshund" style={input} />;
  if (k === "date_of_birth") return <input aria-label="Date of birth" type="date" value={value} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setValue(e.target.value)} style={input} />;
  if (k === "weight_lb") return <input aria-label="Weight in pounds" type="number" inputMode="decimal" step="0.1" min="0.1" placeholder="Weight in lb" value={value} onChange={(e) => setValue(e.target.value)} style={input} />;
  if (k === "emergency_contact_phone") return <input aria-label="Emergency contact phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" value={value} onChange={(e) => setValue(e.target.value)} style={input} />;
  if (k === "emergency_contact_name") return <input aria-label="Emergency contact name" autoComplete="name" placeholder="Who should someone call?" value={value} onChange={(e) => setValue(e.target.value)} style={input} />;
  return <input aria-label="Name" value={value} onChange={(e) => setValue(e.target.value)} style={input} />;
}

function PhotoStep({ pet, onPhoto }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="ppg-btn ppg-btn-primary"><Icon name="camera" size={17} /> Open the photo booth</button>
      {open ? <PhotoBooth pet={pet} onClose={() => setOpen(false)} onSave={(f) => onPhoto({ target: { files: [f], value: "" } })} /> : null}
    </>
  );
}

function Step({ k, label, pet, userId, onChanged, onPhoto, open, onOpen }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const done = filled(pet?.[k]);

  async function save(e) {
    e.preventDefault();
    let v = String(value).trim();
    if (!v) return;
    if (k === "weight_lb") { const n = Number(v); if (!Number.isFinite(n) || n <= 0) return; v = n; }
    setBusy(true);
    const { error } = await supabase.from("pets").update({ [k]: v }).eq("id", pet.id).eq("user_id", userId);
    setBusy(false);
    if (!error) { setValue(""); onChanged?.(); }
  }

  return (
    <li className="rounded-2xl" style={{ background: done ? "#F4FAF6" : "#fff", border: `1.5px solid ${done ? "#CFE7D7" : open ? T.color : tokens.line}`, transition: "border-color .2s" }}>
      <button type="button" disabled={done} onClick={onOpen} className="w-full flex items-center gap-3 px-4 py-3 text-left" style={{ background: "none", border: "none", cursor: done ? "default" : "pointer" }}>
        <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 30, height: 30, background: done ? tokens.green : T.soft, color: done ? "#fff" : T.color, border: done ? "none" : `2px dashed ${T.color}` }}>
          {done ? <Icon name="check" size={16} /> : <Icon name="plus" size={15} />}
        </span>
        <span className="flex-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: done ? tokens.muted : tokens.navy, textDecoration: done ? "line-through" : "none" }}>{label}</span>
        {!done ? <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 14, color: T.color }}>{open ? "" : "Add"}</span> : null}
      </button>
      {!done && open ? (
        k === "photo_url" ? (
          <div className="px-4 pb-4">
            <PhotoStep pet={pet} onPhoto={onPhoto} />
          </div>
        ) : (
          <form onSubmit={save} className="px-4 pb-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0"><Field k={k} pet={pet} value={value} setValue={setValue} /></div>
            <button type="submit" disabled={busy || !String(value).trim()} className="ppg-btn ppg-btn-primary">{busy ? "Saving…" : "Save"}</button>
          </form>
        )
      ) : null}
    </li>
  );
}

// "Get your passport issued" checklist. Each missing detail opens right here, so
// nobody has to hunt through forms. When the last one is saved the issue moment plays.
export default function PassportQuest({ pet, userId, onChanged, onPhoto }) {
  const missingKeys = PASSPORT_FIELDS.filter(([k]) => !filled(pet?.[k])).map(([k]) => k);
  const [open, setOpen] = useState(missingKeys[0] || null);
  const doneCount = PASSPORT_FIELDS.length - missingKeys.length;
  const pct = Math.round((doneCount / PASSPORT_FIELDS.length) * 100);
  const openKey = missingKeys.includes(open) ? open : missingKeys[0];

  return (
    <section className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.08)" }}>
      <div className="px-5 py-4 flex items-center gap-4" style={{ background: `linear-gradient(120deg, ${T.color}, #E0782F)`, color: "#fff" }}>
        <div className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 48, height: 48, background: "rgba(255,255,255,0.18)" }}><Icon name="passport" size={26} /></div>
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 21, lineHeight: 1.15 }}>
            {missingKeys.length === 1 ? `One step from ${pet.name}'s passport` : `Get ${pet.name}'s passport issued`}
          </div>
          <div style={{ fontFamily: font.body, fontSize: 14.5, opacity: 0.92 }}>{doneCount} of {PASSPORT_FIELDS.length} done. Finish and we stamp it, right here.</div>
          <div className="mt-2 rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,0.25)" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: tokens.gold, borderRadius: 999, transition: "width .6s ease" }} />
          </div>
        </div>
      </div>
      <ul className="p-4 grid gap-2" style={{ listStyle: "none", margin: 0 }}>
        {PASSPORT_FIELDS.map(([k, label]) => (
          <Step key={k} k={k} label={label} pet={pet} userId={userId} onChanged={onChanged} onPhoto={onPhoto} open={openKey === k} onOpen={() => setOpen(k)} />
        ))}
      </ul>
    </section>
  );
}
