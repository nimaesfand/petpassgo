"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };
const btn = { fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", borderRadius: 999, minHeight: 48, padding: "12px 18px", cursor: "pointer" };

function numOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function PetCareCard({ pet, userId, onChanged }) {
  const [form, setForm] = useState(() => ({
    food: pet.food || "",
    feeding_schedule: pet.feeding_schedule || "",
    allergies: pet.allergies || "",
    vet_name: pet.vet_name || "",
    vet_phone: pet.vet_phone || "",
    temperament: pet.temperament || "",
    carrier_length_in: pet.carrier_length_in ?? "",
    carrier_width_in: pet.carrier_width_in ?? "",
    carrier_height_in: pet.carrier_height_in ?? "",
  }));
  const [meds, setMeds] = useState([]);
  const [med, setMed] = useState({ name: "", dose: "", timing: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function loadMeds() {
    const { data, error } = await supabase.from("pet_health_records").select("id,name,dose,timing,notes").eq("pet_id", pet.id).eq("kind", "medication").order("created_at", { ascending: false });
    if (error && /dose|timing|schema cache|column/i.test(error.message || "")) {
      const again = await supabase.from("pet_health_records").select("id,name,notes").eq("pet_id", pet.id).eq("kind", "medication").order("created_at", { ascending: false });
      setMeds(again.data || []);
      return;
    }
    setMeds(data || []);
  }

  useEffect(() => { loadMeds(); }, [pet.id]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const patch = {
      allergies: form.allergies.trim() || null,
      vet_name: form.vet_name.trim() || null,
      vet_phone: form.vet_phone.trim() || null,
      carrier_length_in: numOrNull(form.carrier_length_in),
      carrier_width_in: numOrNull(form.carrier_width_in),
      carrier_height_in: numOrNull(form.carrier_height_in),
      food: form.food.trim() || null,
      feeding_schedule: form.feeding_schedule.trim() || null,
      temperament: form.temperament.trim() || null,
    };
    let { error } = await supabase.from("pets").update(patch).eq("id", pet.id).eq("user_id", userId);
    if (error && /food|feeding_schedule|temperament|schema cache|PGRST204|column/i.test(error.message || "")) {
      const { food, feeding_schedule, temperament, ...rest } = patch;
      ({ error } = await supabase.from("pets").update(rest).eq("id", pet.id).eq("user_id", userId));
      setSaving(false);
      if (!error) onChanged?.();
      alert("Food, feeding, and temperament save after the account update is applied. The rest of Care was saved.");
      return;
    }
    setSaving(false);
    if (!error) onChanged?.();
    else alert("Couldn't save Care. Please try again.");
  }

  async function addMed(e) {
    e.preventDefault();
    const name = med.name.trim();
    if (!name) return;
    const row = { pet_id: pet.id, user_id: userId, kind: "medication", name, dose: med.dose.trim() || null, timing: med.timing.trim() || null, show_to_finder: false };
    let { error } = await supabase.from("pet_health_records").insert(row);
    if (error && /dose|timing|schema cache|PGRST204|column/i.test(error.message || "")) {
      ({ error } = await supabase.from("pet_health_records").insert({ pet_id: pet.id, user_id: userId, kind: "medication", name, notes: [med.dose, med.timing].filter(Boolean).join(" · ") || null, show_to_finder: false }));
    }
    if (error) { alert("Couldn't add that medication. Please try again."); return; }
    setMed({ name: "", dose: "", timing: "" });
    loadMeds();
  }

  async function removeMed(id) {
    if (!window.confirm("Remove this medication?")) return;
    await supabase.from("pet_health_records").delete().eq("id", id).eq("user_id", userId);
    setMeds((rows) => rows.filter((r) => r.id !== id));
  }

  return (
    <section data-pet-care className="rounded-3xl p-4 sm:p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <h3 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }} className="mb-4">Care</h3>
      <form onSubmit={save} className="grid gap-3">
        <label style={label}>Food<textarea aria-label="Food" rows={2} value={form.food} onChange={set("food")} style={input} /></label>
        <label style={label}>Feeding schedule<textarea aria-label="Feeding schedule" rows={2} value={form.feeding_schedule} onChange={set("feeding_schedule")} style={input} /></label>
        <label style={label}>Allergies<textarea aria-label="Allergies" rows={2} maxLength={500} value={form.allergies} onChange={set("allergies")} style={input} /></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label style={label}>Vet clinic<input aria-label="Vet clinic name" value={form.vet_name} onChange={set("vet_name")} style={input} /></label>
          <label style={label}>Vet phone<input aria-label="Vet phone" value={form.vet_phone} onChange={set("vet_phone")} style={input} inputMode="tel" /></label>
        </div>
        <label style={label}>Temperament and behavior<textarea aria-label="Temperament" rows={3} value={form.temperament} onChange={set("temperament")} style={input} /></label>
        <div>
          <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }} className="mb-2">Crate or carrier size (inches)</div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" step="0.1" min="0.1" aria-label="Carrier length in inches" placeholder="Length" value={form.carrier_length_in} onChange={set("carrier_length_in")} style={input} />
            <input type="number" step="0.1" min="0.1" aria-label="Carrier width in inches" placeholder="Width" value={form.carrier_width_in} onChange={set("carrier_width_in")} style={input} />
            <input type="number" step="0.1" min="0.1" aria-label="Carrier height in inches" placeholder="Height" value={form.carrier_height_in} onChange={set("carrier_height_in")} style={input} />
          </div>
        </div>
        <button type="submit" disabled={saving} style={{ ...btn, background: tokens.primary, color: "#fff", justifySelf: "start" }}>{saving ? "Saving…" : "Save care"}</button>
      </form>

      <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.line}` }}>
        <h4 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-3">Medications</h4>
        <div className="grid gap-2 mb-3">
          {meds.map((row) => (
            <div key={row.id} className="rounded-2xl p-3 flex items-start justify-between gap-3" style={{ background: tokens.paper }}>
              <div>
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{row.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{[row.dose, row.timing, !row.dose && !row.timing ? row.notes : ""].filter(Boolean).join(" · ")}</div>
              </div>
              <button type="button" onClick={() => removeMed(row.id)} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.primary, background: "none", border: "none", cursor: "pointer", minHeight: 44 }}>Remove</button>
            </div>
          ))}
        </div>
        <form onSubmit={addMed} className="grid gap-2">
          <input required aria-label="Medication name" placeholder="Medication" value={med.name} onChange={(e) => setMed({ ...med, name: e.target.value })} style={input} />
          <div className="grid sm:grid-cols-2 gap-2">
            <input aria-label="Dose" placeholder="Dose" value={med.dose} onChange={(e) => setMed({ ...med, dose: e.target.value })} style={input} />
            <input aria-label="Timing" placeholder="Timing" value={med.timing} onChange={(e) => setMed({ ...med, timing: e.target.value })} style={input} />
          </div>
          <button type="submit" style={{ ...btn, background: tokens.navy, color: "#fff", justifySelf: "start" }}>Add medication</button>
        </form>
      </div>
    </section>
  );
}
