"use client";

import { useState } from "react";
import BreedInput from "./BreedInput";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { fmtDob, weightLabel, filled } from "../lib/petProfile";
import { pingSaved } from "./SavedToast";

const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };

function Field({ k, v }) {
  if (!filled(v)) return null;
  return (
    <div className="min-w-0">
      <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{k}</div>
      <div style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink, overflowWrap: "anywhere" }}>{v}</div>
    </div>
  );
}

export default function PetBasicsCard({ pet, userId, onChanged, bare = false }) {
  const [open, setOpen] = useState(bare);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    name: pet.name || "",
    animal_type: pet.animal_type || "Dog",
    breed: pet.breed || "",
    sex: pet.sex || "",
    color: pet.color || "",
    weight_lb: pet.weight_lb ?? "",
    date_of_birth: pet.date_of_birth ? String(pet.date_of_birth).slice(0, 10) : "",
    microchip_number: pet.microchip_number || "",
    handler_name: pet.handler_name || "",
    role: pet.role || "Pet",
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const patch = {
      name: form.name.trim() || pet.name,
      animal_type: form.animal_type,
      role: form.role,
      breed: form.breed.trim() || null,
      sex: form.sex || null,
      color: form.color.trim() || null,
      weight_lb: form.weight_lb === "" ? null : Number(form.weight_lb),
      date_of_birth: form.date_of_birth || null,
      microchip_number: form.microchip_number.trim() || null,
      handler_name: form.handler_name.trim() || null,
    };
    const { error } = await supabase.from("pets").update(patch).eq("id", pet.id).eq("user_id", userId);
    setSaving(false);
    if (!error) { pingSaved(); if (!bare) setOpen(false); onChanged?.(); }
    else alert("Couldn't save the profile. Please try again.");
  }

  const rows = [
    ["Type", pet.animal_type],
    ["Breed", pet.breed],
    ["Date of birth", fmtDob(pet.date_of_birth)],
    ["Weight", weightLabel(pet.weight_lb)],
    ["Sex", pet.sex],
    ["Color", pet.color],
    ["Microchip", pet.microchip_number],
    ["Owner", pet.handler_name],
  ];

  return (
    <section data-pet-basics className="rounded-3xl p-4 sm:p-6 min-w-0 max-w-full" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      {bare ? null : <div className="flex items-center justify-between gap-3 mb-3">
        <h3 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }}>Basics</h3>
        <button type="button" onClick={() => setOpen((v) => !v)} className="ppg-btn ppg-btn-secondary">{open ? "Close" : "Edit"}</button>
      </div>}
      {!bare && pet.passport_no ? <div className="mb-3" style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink }}><b style={{ color: tokens.navy }}>PetPassGo ID </b>{pet.passport_no}</div> : null}
      {!open ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{rows.map(([k, v]) => <Field key={k} k={k} v={v} />)}</div>
      ) : (
        <form onSubmit={save} className="grid gap-3">
          <label style={label}>Name<input required aria-label="Name" value={form.name} onChange={set("name")} style={input} /></label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label style={label}>Type<select aria-label="Type" value={form.animal_type} onChange={set("animal_type")} style={input}><option>Dog</option><option>Cat</option><option>Other</option></select></label>
            <label style={label}>Breed<BreedInput aria-label="Breed" value={form.breed} onChange={set("breed")} animal={form.animal_type} placeholder="Start typing, e.g. Dachshund" style={input} /></label>
            <label style={label}>Date of birth<input type="date" aria-label="Date of birth" value={form.date_of_birth} onChange={set("date_of_birth")} style={input} /></label>
            <label style={label}>Weight (lb)<input type="number" step="0.1" min="0.1" aria-label="Weight in pounds" value={form.weight_lb} onChange={set("weight_lb")} style={input} /></label>
            <label style={label}>Sex<select aria-label="Sex" value={form.sex} onChange={set("sex")} style={input}><option value="">Select</option><option>Male</option><option>Female</option></select></label>
            <label style={label}>Color<input aria-label="Color" value={form.color} onChange={set("color")} style={input} /></label>
          </div>
          <label style={label}>Microchip number<input aria-label="Microchip number" value={form.microchip_number} onChange={set("microchip_number")} autoComplete="off" style={input} /></label>
          <label style={label}>Owner name<input aria-label="Owner name" maxLength={80} value={form.handler_name} onChange={set("handler_name")} style={input} /></label>
          <label style={label}>Role, as you declare it
            <select aria-label="Role" value={form.role} onChange={set("role")} style={input}>
              <option>Pet</option>
              <option>Service animal</option>
              <option>Emotional support animal</option>
            </select>
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <button type="submit" disabled={saving} className="ppg-btn ppg-btn-primary">{saving ? "Saving…" : "Save basics"}</button>
            {bare ? null : <button type="button" onClick={() => setOpen(false)} className="ppg-btn ppg-btn-secondary">Cancel</button>}
          </div>
        </form>
      )}
    </section>
  );
}
