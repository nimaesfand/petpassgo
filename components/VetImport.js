"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { BUCKET } from "../lib/storage";
import { tokens, font } from "../lib/theme";

const input = { fontFamily: font.body, fontSize: 15.5, border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "9px 12px", width: "100%", background: "#fff" };
const label = { fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy };
const btn = { fontFamily: font.body, fontWeight: 700, fontSize: 14.5, borderRadius: 999, padding: "9px 16px" };
const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

export default function VetImport({ pet, userId, onSaved }) {
  const [phase, setPhase] = useState("idle"); // idle | reading | review | saving | done
  const [err, setErr] = useState("");
  const [path, setPath] = useState("");
  const [f, setF] = useState(null);

  async function onFile(e) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    if (!/^(image\/|application\/pdf)/.test(file.type) || file.size > 6e6) { setErr("Please choose a photo (JPG/PNG) or PDF under 6 MB."); return; }
    setErr(""); setPhase("reading"); setF(null);
    const safe = file.name.replace(/[^a-z0-9.\-]+/gi, "-").slice(-60) || "vet-paperwork";
    const filePath = `${userId}/${pet.id}/vet-import-${Date.now()}-${safe}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (upErr) { setPhase("idle"); setErr("Upload failed. Please try again."); return; }
    setPath(filePath);
    const { data: s } = await supabase.auth.getSession();
    const r = await fetch("/api/vet-import", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id, file_path: filePath }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok) { setPhase("idle"); setErr(j.error || "Smart import isn't available yet. You can add everything by hand below — and remove the uploaded file if you like."); return; }
    const x = j.extraction || {};
    setF({
      pet_name: x.pet_name || "", microchip_number: x.microchip_number || "", chip_brand: x.chip_brand || "",
      vet_name: x.clinic_name || x.vet_name || "", vet_phone: x.vet_phone || "", weight_value: x.weight_value ? String(x.weight_value) : "", weight_unit: x.weight_unit || "lbs",
      vaccines: (x.vaccines || []).map((v) => ({ ...v, include: true })), medications: (x.medications || []).map((v) => ({ ...v, include: true })), allergies: (x.allergies || []).map((v) => ({ ...v, include: true })), notes: x.notes || "",
    });
    setPhase("review");
  }

  async function discard() { if (path) await supabase.storage.from(BUCKET).remove([path]); setPath(""); setF(null); setPhase("idle"); setErr(""); }

  async function confirm() {
    if (!f) return; setPhase("saving"); setErr("");
    const petPatch = {};
    if (f.microchip_number.trim()) petPatch.microchip_number = f.microchip_number.trim();
    if (f.chip_brand.trim()) petPatch.chip_brand = f.chip_brand.trim();
    if (f.vet_name.trim()) petPatch.vet_name = f.vet_name.trim();
    if (f.vet_phone.trim()) petPatch.vet_phone = f.vet_phone.trim();
    const jobs = [];
    if (Object.keys(petPatch).length) jobs.push(supabase.from("pets").update(petPatch).eq("id", pet.id).eq("user_id", userId));
    const recs = [
      ...f.vaccines.filter((r) => r.include && r.name.trim()).map((r) => ({ kind: "vaccine", name: r.name.trim(), date_given: r.date_given || null, expires_on: r.expires_on || null })),
      ...f.medications.filter((r) => r.include && r.name.trim()).map((r) => ({ kind: "medication", name: r.name.trim(), notes: r.notes || null })),
      ...f.allergies.filter((r) => r.include && r.name.trim()).map((r) => ({ kind: "allergy", name: r.name.trim(), notes: r.notes || null })),
    ].map((r) => ({ ...r, pet_id: pet.id, user_id: userId }));
    if (recs.length) jobs.push(supabase.from("pet_health_records").insert(recs));
    const w = parseFloat(f.weight_value);
    if (w > 0) jobs.push(supabase.from("pet_measurements").insert({ user_id: userId, pet_id: pet.id, metric_type: "weight", value: f.weight_unit === "kg" ? Math.round(w * 2.20462 * 10) / 10 : w, recorded_date: todayISO() }));
    if (path) jobs.push(supabase.from("documents").insert({ user_id: userId, pet_id: pet.id, document_type: "Vet paperwork (smart import)", file_url: path }));
    const results = await Promise.all(jobs);
    if (results.some((r) => r.error)) { setPhase("review"); setErr("Some details couldn't be saved. Please check them and try again."); return; }
    setPhase("done"); onSaved?.();
  }

  const rowEditor = (key, title, dateFields) => f && (
    <div className="mt-3">
      <div style={{ ...label, fontSize: 14 }}>{title}</div>
      {f[key].length === 0 && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>None found on the paperwork.</div>}
      <div className="space-y-2 mt-1">{f[key].map((r, i) => (
        <div key={i} className="rounded-xl p-2.5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div className="flex gap-2 items-center"><input type="checkbox" checked={r.include} onChange={(e) => setF({ ...f, [key]: f[key].map((x, j) => j === i ? { ...x, include: e.target.checked } : x) })} className="w-5 h-5 flex-shrink-0" /><input style={input} value={r.name} placeholder="Name" onChange={(e) => setF({ ...f, [key]: f[key].map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} /></div>
          {dateFields ? <div className="flex gap-2 mt-2"><input type="date" style={input} value={r.date_given || ""} onChange={(e) => setF({ ...f, [key]: f[key].map((x, j) => j === i ? { ...x, date_given: e.target.value } : x) })} /><input type="date" style={input} value={r.expires_on || ""} onChange={(e) => setF({ ...f, [key]: f[key].map((x, j) => j === i ? { ...x, expires_on: e.target.value } : x) })} /></div>
          : <input style={{ ...input, marginTop: 8 }} value={r.notes || ""} placeholder="Notes / dose (optional)" onChange={(e) => setF({ ...f, [key]: f[key].map((x, j) => j === i ? { ...x, notes: e.target.value } : x) })} />}
        </div>))}
      </div>
    </div>
  );

  return (
    <section id="vet-import" style={{ borderTop: `1px solid ${tokens.line}`, paddingTop: 16, marginTop: 16 }} aria-label="Smart vet paperwork import">
      <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }}>Smart import from vet paperwork</div>
      <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mt-1">Upload a photo or PDF. We read it, you check every detail, and nothing is saved until you confirm. The file goes into {pet.name}'s private vault and is sent only to read it — never used to train anything. Everything saved is marked owner-confirmed, not verified by a vet.</p>
      {phase !== "review" && phase !== "done" && (
        <label className="inline-block mt-3 rounded-full px-5 py-2.5 cursor-pointer" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 14.5, opacity: phase === "reading" ? 0.6 : 1 }}>
          {phase === "reading" ? "Reading your paperwork…" : "Upload vet paperwork"}
          <input type="file" accept="image/*,application/pdf" disabled={phase === "reading"} onChange={onFile} style={{ display: "none" }} />
        </label>
      )}
      {phase === "reading" && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="mt-2">This can take a few seconds…</div>}
      {err && <div className="rounded-xl p-3 mt-3" style={{ background: "#FFF9EC", fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>{err}{path && phase === "idle" && <div className="mt-2 flex gap-2"><button onClick={discard} style={{ ...btn, background: "#fff", color: tokens.stamp, border: `2px solid ${tokens.stamp}`, padding: "6px 12px", fontSize: 13 }}>Remove uploaded file</button></div>}</div>}
      {phase === "done" && <div className="rounded-xl p-3 mt-3" style={{ background: "#EAF6EE", fontFamily: font.body, fontSize: 14.5 }}>✓ Saved as owner-confirmed details. You'll see them in the Chip Vault, Health passport and vet info above.</div>}
      {phase === "review" && f && (
        <div className="rounded-xl p-4 mt-3" style={{ background: tokens.paper, border: `1.5px solid ${tokens.gold}` }}>
          <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Check what we read — edit anything</div>
          <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>Nothing has been saved yet. Untick anything you don't want to keep. {f.notes && <>Reader note: {f.notes}</>}</div>
          {f.pet_name && f.pet_name.toLowerCase() !== (pet.name || "").toLowerCase() && <div className="rounded-lg p-2.5 mt-2" style={{ background: "#FFF9EC", fontFamily: font.body, fontSize: 14 }}>The paperwork says “{f.pet_name}”, but this profile is {pet.name}. Save only if it's the same pet.</div>}
          <div className="grid sm:grid-cols-2 gap-2 mt-3">
            <label style={label}>Microchip number<input style={input} value={f.microchip_number} onChange={(e) => setF({ ...f, microchip_number: e.target.value })} placeholder="Not found" /></label>
            <label style={label}>Chip brand<input style={input} value={f.chip_brand} onChange={(e) => setF({ ...f, chip_brand: e.target.value })} placeholder="Not found" /></label>
            <label style={label}>Vet / clinic<input style={input} value={f.vet_name} onChange={(e) => setF({ ...f, vet_name: e.target.value })} placeholder="Not found" /></label>
            <label style={label}>Vet phone<input style={input} value={f.vet_phone} onChange={(e) => setF({ ...f, vet_phone: e.target.value })} placeholder="Not found" /></label>
            <label style={label}>Weight<input style={input} value={f.weight_value} inputMode="decimal" onChange={(e) => setF({ ...f, weight_value: e.target.value })} placeholder="Not found" /></label>
            <label style={label}>Unit<select style={input} value={f.weight_unit} onChange={(e) => setF({ ...f, weight_unit: e.target.value })}><option value="lbs">lbs</option><option value="kg">kg</option></select></label>
          </div>
          {rowEditor("vaccines", "Vaccines", true)}
          {rowEditor("medications", "Medications", false)}
          {rowEditor("allergies", "Allergies", false)}
          <div className="flex gap-2 flex-wrap mt-4">
            <button disabled={phase === "saving"} onClick={confirm} style={{ ...btn, background: tokens.stamp, color: "#fff" }}>{phase === "saving" ? "Saving…" : "Confirm & save"}</button>
            <button onClick={discard} style={{ ...btn, background: "#fff", color: tokens.stamp, border: `2px solid ${tokens.stamp}` }}>Discard, save nothing</button>
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-2">Saved details are owner-confirmed from your paperwork — not verified by PetPassGo or a vet.</div>
        </div>
      )}
    </section>
  );
}
