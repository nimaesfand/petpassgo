"use client";
import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import QRCode from "qrcode";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { PUBLIC_ID_BASE } from "../lib/PetQr";
import VetImport from "./VetImport";
import { WhatsNeededNext, TravelStamps, FindAVet } from "./PetExtras";

const AAHA = "https://www.aaha.org/for-veterinary-professionals/microchip-registry-lookup-tool-aaha-find-your-pets-microchip-registry/";
const input = { fontFamily: font.body, fontSize: 15.5, border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "9px 12px", width: "100%", background: "#fff" };
const label = { fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy, letterSpacing: "0.02em" };
const section = { borderTop: `1px solid ${tokens.line}`, paddingTop: 16, marginTop: 16 };
const h3 = { fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy };
const btn = { fontFamily: font.body, fontWeight: 700, fontSize: 14.5, borderRadius: 999, padding: "9px 16px" };

export const maskChip = (v) => {
  const s = String(v || "").replace(/[^0-9A-Za-z]/g, "");
  return s ? `•••• ${s.slice(-4)}` : "";
};
const chipDigits = (v) => String(v || "").replace(/\D/g, "");
export const chipLooksValid = (v) => [9, 10, 15].includes(chipDigits(v).length);
const fmtDate = (v) => (v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const plusYear = (iso) => { const d = new Date(`${iso}T12:00:00`); d.setFullYear(d.getFullYear() + 1); return d; };
const todayISO = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

function DueBadge({ children, tone = "muted" }) {
  const colors = { muted: [tokens.sky, tokens.muted], warn: ["#FFF3D6", "#8A5A00"], bad: ["#FDE8E2", tokens.stamp], good: ["#EAF6EE", tokens.green] };
  const [bg, fg] = colors[tone] || colors.muted;
  return <span className="rounded-full px-2.5 py-1 inline-block" style={{ background: bg, color: fg, fontFamily: font.body, fontSize: 12.5, fontWeight: 700 }}>{children}</span>;
}

function expiryState(exp) {
  if (!exp) return null;
  const days = Math.round((new Date(`${exp}T12:00:00`) - new Date(`${todayISO()}T12:00:00`)) / 86400000);
  if (days < 0) return { tone: "bad", text: `Expired ${fmtDate(exp)}` };
  if (days <= 30) return { tone: "warn", text: `Expires ${fmtDate(exp)} · ${days} days` };
  return { tone: "good", text: `Expires ${fmtDate(exp)}` };
}

export function ChipVault({ pet, userId, onChanged, bare = false }) {
  const [form, setForm] = useState({
    microchip_number: pet.microchip_number || "", chip_brand: pet.chip_brand || "", chip_registry: pet.chip_registry || "",
    chip_registry_phone: pet.chip_registry_phone || "", chip_registry_url: pet.chip_registry_url || "", chip_verified_at: pet.chip_verified_at || "",
  });
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false); const [checker, setChecker] = useState(false);
  const [trip, setTrip] = useState(null);
  useEffect(() => { setForm({ microchip_number: pet.microchip_number || "", chip_brand: pet.chip_brand || "", chip_registry: pet.chip_registry || "", chip_registry_phone: pet.chip_registry_phone || "", chip_registry_url: pet.chip_registry_url || "", chip_verified_at: pet.chip_verified_at || "" }); }, [pet.id, pet.microchip_number, pet.chip_brand, pet.chip_registry, pet.chip_verified_at]);
  useEffect(() => { supabase.from("trips").select("travel_date,airline").eq("paid", true).gte("travel_date", todayISO()).order("travel_date").limit(1).then(({ data }) => setTrip(data?.[0] || null)); }, []);
  const due = useMemo(() => {
    if (!form.microchip_number) return null;
    if (!form.chip_verified_at) return { tone: "warn", text: "Registration check due — not recorded yet" };
    const next = plusYear(form.chip_verified_at); const days = Math.round((next - new Date(`${todayISO()}T12:00:00`)) / 86400000);
    if (days < 0) return { tone: "bad", text: `Yearly chip check was due ${fmtDate(next.toISOString().slice(0, 10))}` };
    if (days <= 30) return { tone: "warn", text: `Yearly chip check due ${fmtDate(next.toISOString().slice(0, 10))}` };
    return { tone: "good", text: `Checked ${fmtDate(form.chip_verified_at)} · next check ${fmtDate(next.toISOString().slice(0, 10))}` };
  }, [form.microchip_number, form.chip_verified_at]);

  async function save(next = form) {
    setSaving(true); setSaved(false);
    const payload = Object.fromEntries(Object.entries(next).map(([k, v]) => [k, v?.trim?.() || null]));
    const { error } = await supabase.from("pets").update(payload).eq("id", pet.id).eq("user_id", userId);
    setSaving(false); if (!error) { setSaved(true); onChanged?.(); }
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <section id="chip-vault" style={bare ? {} : section} aria-label="Microchip">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        {!bare && <div><div style={h3}>Microchip</div><div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>Private in PetPassGo. The chip registry keeps the official record.</div></div>}
        {due && <DueBadge tone={due.tone}>{due.text}</DueBadge>}
      </div>
      {pet.microchip_number ? (
        <div className="rounded-xl p-3 mt-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: tokens.paper }}>
          <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>Chip ending <b>{maskChip(pet.microchip_number)}</b>{pet.chip_registry ? ` · ${pet.chip_registry}` : ""}</span>
          <span style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }}>Full number stays private</span>
        </div>
      ) : <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-2">No chip number saved yet. Your vet can read it with a quick, free scan.</p>}
      {trip && form.microchip_number && due?.tone !== "good" && <div className="rounded-xl p-3 mt-3" style={{ background: "#FFF9EC", fontFamily: font.body, fontSize: 14.5 }}>Before your {fmtDate(trip.travel_date)} trip{ trip.airline ? ` with ${trip.airline}` : ""}: take two minutes to confirm the registry has your current phone and email.</div>}
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        <label style={label}>Chip number<input style={input} value={form.microchip_number} onChange={(e) => set("microchip_number", e.target.value)} placeholder="9, 10 or 15 digits" inputMode="numeric" /></label>
        <label style={label}>Chip brand / maker<input style={input} value={form.chip_brand} onChange={(e) => set("chip_brand", e.target.value)} placeholder="e.g. HomeAgain, AVID" /></label>
        <label style={label}>Registry name<input style={input} value={form.chip_registry} onChange={(e) => set("chip_registry", e.target.value)} placeholder="Where it's registered" /></label>
        <label style={label}>Registry phone<input style={input} value={form.chip_registry_phone} onChange={(e) => set("chip_registry_phone", e.target.value)} placeholder="Optional" /></label>
        <label style={label}>Registry website<input style={input} value={form.chip_registry_url} onChange={(e) => set("chip_registry_url", e.target.value)} placeholder="https://…" /></label>
        <label style={label}>Registration last verified<input type="date" style={input} value={form.chip_verified_at || ""} onChange={(e) => set("chip_verified_at", e.target.value)} /></label>
      </div>
      {form.microchip_number && !chipLooksValid(form.microchip_number) && <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.stamp }} className="mt-2">That doesn't look like a standard 9-, 10- or 15-digit chip number. Please double-check it — we saved nothing yet.</div>}
      <div className="flex gap-2 flex-wrap mt-3">
        <button onClick={() => save()} disabled={saving} style={{ ...btn, background: tokens.navy, color: "#fff" }}>{saving ? "Saving…" : "Save microchip"}</button>
        <button onClick={() => { const n = { ...form, chip_verified_at: todayISO() }; setForm(n); save(n); }} disabled={!form.microchip_number || saving} style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, opacity: form.microchip_number ? 1 : 0.5 }}>I checked it today</button>
        <button onClick={() => setChecker((v) => !v)} style={{ ...btn, background: tokens.sky, color: tokens.navy }}>Is my chip registered?</button>
        {saved && <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.green, alignSelf: "center" }}>Saved</span>}
      </div>
      {checker && (
        <ol className="mt-3 rounded-xl p-4 space-y-3" style={{ background: tokens.paper, fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
          <li><b>1. Have the number handy.</b> It's {form.microchip_number ? `the one ending ${maskChip(form.microchip_number)} above` : "on your vet paperwork, or your vet can scan for it free"}.</li>
          <li><b>2. Look up which registry holds it.</b> <a href={AAHA} target="_blank" rel="noopener noreferrer" style={{ color: tokens.primary, fontWeight: 700 }}>Open the AAHA microchip lookup</a> and enter the full number there. AAHA points to the registry; it doesn't show owner details.</li>
          <li><b>3. Confirm at that registry.</b> Sign in or call them and check the phone, email and emergency contact they would use if {pet.name} were found. Update anything old there — that's the official record.</li>
          <li><b>4. Come back and tap “I checked it today.”</b> We'll remind you again in a year, and before a trip. No chip yet? A vet or shelter can implant one in a quick visit, then register the new number right away.</li>
        </ol>
      )}
      <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-2">We're not a chip registry. A vet or shelter that scans the chip contacts the registry.</p>
    </section>
  );
}

const KIND = [["vaccine", "Vaccine"], ["medication", "Medication"], ["allergy", "Allergy"], ["note", "Care note"]];

export function HealthPassport({ pet, userId, refreshKey = 0, bare = false, onRows }) {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [show, setShow] = useState(false);
  const [f, setF] = useState({ kind: "vaccine", name: "", date_given: "", expires_on: "", clinic: "", notes: "", show_to_finder: false });
  async function load() { const { data } = await supabase.from("pet_health_records").select("*").eq("pet_id", pet.id).order("expires_on", { ascending: true, nullsFirst: false }); setRows(data || []); setLoading(false); onRows?.(data || []); }
  useEffect(() => { load(); }, [pet.id, refreshKey]);
  async function add(e) { e.preventDefault(); const payload = { pet_id: pet.id, user_id: userId, kind: f.kind, name: f.name.trim(), date_given: f.date_given || null, expires_on: f.expires_on || null, clinic: f.clinic.trim() || null, notes: f.notes.trim() || null, show_to_finder: !!f.show_to_finder }; if (!payload.name) return; const { error } = await supabase.from("pet_health_records").insert(payload); if (!error) { setF({ kind: "vaccine", name: "", date_given: "", expires_on: "", clinic: "", notes: "", show_to_finder: false }); setShow(false); load(); } }
  async function remove(id) { if (window.confirm("Remove this health record?")) { await supabase.from("pet_health_records").delete().eq("id", id); load(); } }
  async function toggle(row) { await supabase.from("pet_health_records").update({ show_to_finder: !row.show_to_finder }).eq("id", row.id); load(); }
  return (
    <section id="health-passport" style={bare ? {} : section} aria-label="Health records">
      <div className="flex items-start justify-between gap-3 flex-wrap"><div>{!bare && <div style={h3}>Health records</div>}<div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>Vaccines, meds and allergies you enter.</div></div><button onClick={() => setShow((v) => !v)} style={{ ...btn, background: tokens.navy, color: "#fff" }}>+ Add record</button></div>
      {show && <form onSubmit={add} className="grid sm:grid-cols-2 gap-2 mt-3 rounded-xl p-3" style={{ background: tokens.paper }}>
        <label style={label}>Type<select style={input} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KIND.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label style={label}>Name<input required style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Rabies, medication, allergy…" /></label>
        <label style={label}>Date given<input type="date" style={input} value={f.date_given} onChange={(e) => setF({ ...f, date_given: e.target.value })} /></label>
        <label style={label}>Expires<input type="date" style={input} value={f.expires_on} onChange={(e) => setF({ ...f, expires_on: e.target.value })} /></label>
        <label style={label}>Clinic / vet<input style={input} value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} placeholder="Optional" /></label>
        <label style={label}>Notes<input style={input} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Dose, reaction, instructions…" /></label>
        <label className="flex gap-2 items-center sm:col-span-2" style={{ fontFamily: font.body, fontSize: 14 }}><input type="checkbox" checked={f.show_to_finder} onChange={(e) => setF({ ...f, show_to_finder: e.target.checked })} /> Show this on the public Pet ID / share card</label>
        <button style={{ ...btn, background: tokens.stamp, color: "#fff" }}>Save record</button>
      </form>}
      {loading ? <div style={{ fontFamily: font.body, color: tokens.muted }} className="mt-2">Loading…</div> : rows.length === 0 ? <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-2">No vaccines, medicines or allergies recorded yet.</p> : <div className="mt-3 space-y-2">{rows.map((r) => { const ex = expiryState(r.expires_on); return <div key={r.id} className="rounded-xl p-3 flex gap-3 items-start justify-between" style={{ background: tokens.paper }}>
        <div className="min-w-0"><div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>{KIND.find(([k]) => k === r.kind)?.[1]} · {r.name}</div><div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{[r.date_given ? `Given ${fmtDate(r.date_given)}` : "", r.clinic || "", r.notes || ""].filter(Boolean).join(" · ")}</div><div className="flex gap-2 mt-1 flex-wrap">{ex && <DueBadge tone={ex.tone}>{ex.text}</DueBadge>}<DueBadge tone={r.show_to_finder ? "good" : "muted"}>{r.show_to_finder ? "Shown publicly" : "Private"}</DueBadge></div></div>
        <div className="flex flex-col gap-1 flex-shrink-0"><button onClick={() => toggle(r)} style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.navy }}>{r.show_to_finder ? "Hide" : "Show"}</button><button onClick={() => remove(r.id)} style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.stamp }}>Remove</button></div></div>; })}</div>}
    </section>
  );
}

export function WalletCard({ pet, onDone, bare = false }) {
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const qr = await QRCode.toDataURL(`${PUBLIC_ID_BASE}${pet.id}`, { width: 360, margin: 1, errorCorrectionLevel: "M" });
      const canvas = document.createElement("canvas"); canvas.width = 900; canvas.height = 540; const c = canvas.getContext("2d");
      c.fillStyle = "#14213D"; c.fillRect(0, 0, 900, 120); c.fillStyle = "#fff"; c.fillRect(0, 120, 900, 420);
      c.fillStyle = "#F2B84B"; c.font = "700 25px system-ui"; c.fillText("PETPASSGO · DIGITAL PET ID", 42, 72);
      c.fillStyle = "#14213D"; c.font = "700 58px system-ui"; c.fillText(pet.name || "My pet", 42, 220);
      c.font = "30px system-ui"; c.fillStyle = "#52606D"; c.fillText([pet.breed, pet.animal_type].filter(Boolean).join(" · "), 42, 270);
      if (pet.passport_no) { c.font = "700 24px system-ui"; c.fillStyle = "#14213D"; c.fillText(`Passport No. ${pet.passport_no}`, 42, 315); }
      c.font = "700 26px system-ui"; c.fillStyle = "#C2410C"; c.fillText("SCAN IF FOUND", 42, 350);
      c.font = "22px system-ui"; c.fillStyle = "#52606D"; c.fillText("Message the owner through PetPassGo.", 42, 390); c.fillText("No chip number or owner phone is shown.", 42, 425);
      const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = qr; }); c.drawImage(img, 590, 160, 260, 260);
      const a = document.createElement("a"); a.download = `${(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-petpassgo-id.png`; a.href = canvas.toDataURL("image/png"); a.click(); onDone?.();
    } finally { setBusy(false); }
  }
  return <section id="wallet-card" style={bare ? { marginTop: 16 } : section}><div style={h3}>QR card for your phone</div><p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">Save {pet.name}'s QR to your photos for one-tap access.</p><button disabled={busy} onClick={download} style={{ ...btn, background: tokens.navy, color: "#fff" }} className="mt-2">{busy ? "Making card…" : "Download QR card"}</button></section>;
}

export function ShareCard({ pet, userId, onDone, bare = false }) {
  const [days, setDays] = useState(7); const [preset, setPreset] = useState("sitter"); const [url, setUrl] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [links, setLinks] = useState([]);
  async function load() { const { data } = await supabase.from("pet_share_cards").select("id,expires_at,revoked_at,created_at,view_count,preset").eq("pet_id", pet.id).order("created_at", { ascending: false }).limit(5); setLinks(data || []); }
  useEffect(() => { load(); }, [pet.id]);
  async function create() { setBusy(true); setErr(""); const { data: s } = await supabase.auth.getSession(); const r = await fetch("/api/pet-share", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id, days, preset }) }); const j = await r.json().catch(() => ({})); if (r.ok && j.url) { setUrl(j.url); load(); onDone?.(); } else setErr(j.error || "Couldn't create the link."); setBusy(false); }
  async function revoke(id) { await supabase.from("pet_share_cards").update({ revoked_at: new Date().toISOString() }).eq("id", id); load(); }
  const active = links.filter((l) => !l.revoked_at && new Date(l.expires_at) > new Date());
  return <section id="share-card" style={bare ? {} : section}>{!bare && <div style={h3}>{pet.name}'s Care Card</div>}<p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">{preset === "emergency" ? "Meds, allergies, vet and who to call — first. For an emergency vet." : "Feeding, walks, meds, quirks, and who to call. Made for sitters and vets."} A private, expiring link; it never shows the full chip number.</p>
    <div className="flex gap-2 mt-3" role="tablist" aria-label="Care Card type">{[["sitter", "Sitter"], ["emergency", "Emergency"]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={preset === k} onClick={() => setPreset(k)} className="rounded-full px-4 py-2" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, background: preset === k ? tokens.navy : tokens.sky, color: preset === k ? "#fff" : tokens.navy, border: "none", cursor: "pointer" }}>{l}</button>)}</div>
    <div className="flex gap-2 items-center flex-wrap mt-3"><label style={label}>Expires in <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...input, width: "auto", display: "inline-block", marginLeft: 6 }}><option value={1}>1 day</option><option value={7}>7 days</option><option value={30}>30 days</option></select></label><button disabled={busy} onClick={create} style={{ ...btn, background: tokens.stamp, color: "#fff" }}>{busy ? "Creating…" : "Create share link"}</button></div>
    {err && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mt-2">{err}</div>}
    {url && <div className="rounded-xl p-3 mt-3 flex gap-2 flex-wrap items-center" style={{ background: tokens.paper }}><input readOnly value={url} style={{ ...input, flex: 1, minWidth: 220 }} onFocus={(e) => e.target.select()} /><button onClick={() => navigator.clipboard?.writeText(url)} style={{ ...btn, background: tokens.navy, color: "#fff" }}>Copy</button><a href={url} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, textDecoration: "none" }}>Open / PDF</a></div>}
    {active.length > 0 && <div className="mt-3 space-y-1">{active.map((l) => <div key={l.id} className="flex justify-between gap-2" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}><span>{l.preset === "emergency" ? "Emergency" : "Sitter"} · active until {fmtDate(String(l.expires_at).slice(0, 10))} · viewed {l.view_count || 0}×</span><button onClick={() => revoke(l.id)} style={{ color: tokens.stamp, fontWeight: 700 }}>Turn off</button></div>)}</div>}
  </section>;
}

export function ActivationChecklist({ pet, userId, refreshKey }) {
  const [act, setAct] = useState(null); const [counts, setCounts] = useState({ health: 0, docs: 0, bonus: false });
  const load = async () => {
    const [{ data: a }, { count: health }, { count: docs }, { data: bonus }] = await Promise.all([
      supabase.from("pet_activation").select("*").eq("pet_id", pet.id).maybeSingle(),
      supabase.from("pet_health_records").select("id", { count: "exact", head: true }).eq("pet_id", pet.id),
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("pet_id", pet.id),
      supabase.rpc("activation_bonus"),
    ]);
    setAct(a || {}); setCounts({ health: health || 0, docs: docs || 0, bonus: !!bonus });
  };
  useEffect(() => { load(); }, [pet.id, refreshKey]);
  async function save(patch) { await supabase.from("pet_activation").upsert({ pet_id: pet.id, user_id: userId, ...patch, updated_at: new Date().toISOString() }); load(); }
  useEffect(() => { const h = () => save({ qr_done_at: new Date().toISOString() }); window.addEventListener("ppg-qr-done", h); return () => window.removeEventListener("ppg-qr-done", h); }, [pet.id]);
  if (!act) return null;
  const steps = [
    { done: !!pet.photo_url, title: "Add a photo", text: "A clear headshot helps anyone who finds them.", href: `#pet-top-${pet.id}`, cta: "Add photo" },
    { done: !!(pet.microchip_number && pet.chip_verified_at), title: "Save the chip & check it", text: "Two minutes now can bring them home later.", href: "#chip-vault", cta: "Open Microchip" },
    { done: counts.health + counts.docs > 0, title: "Add one health record", text: "A vaccine, med or allergy — typed in or smart-imported.", href: "#health-passport", cta: "Add a record" },
    { done: !!act.qr_done_at, title: "Download or share the QR card", text: "Keep it on your phone, ready for a sitter or a just-in-case moment.", href: "#wallet-card", cta: "Get the card" },
    { done: counts.bonus, title: "Optional: plan a trip or say hello", text: "Start trip questions or browse your airline's board.", href: "/assessment", cta: "Explore", optional: true },
  ];
  const required = steps.slice(0, 4); const done = required.filter((x) => x.done).length; const pct = Math.round((done / 4) * 100);
  if (act.dismissed_at && done < 4) return null;
  const r = 24, c = 2 * Math.PI * r;
  return <div className="rounded-2xl p-4 mt-3" style={{ background: "linear-gradient(135deg,#FFF9EC,#fff)", border: `1.5px solid ${tokens.gold}` }}>
    <div className="flex items-center gap-3">
      <svg width="58" height="58" viewBox="0 0 58 58" className="flex-shrink-0"><circle cx="29" cy="29" r={r} fill="none" stroke={tokens.line} strokeWidth="6"/><circle cx="29" cy="29" r={r} fill="none" stroke={pct === 100 ? tokens.green : tokens.stamp} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - c * pct / 100} transform="rotate(-90 29 29)"/><text x="29" y="34" textAnchor="middle" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, fill: tokens.navy }}>{pct}%</text></svg>
      <div className="flex-1 min-w-0"><div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }}>{done === 4 ? `${pet.name}'s ID is all set` : `Finish ${pet.name}'s ID`}</div><div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{done === 4 ? "Everything important is stored safely here, ready whenever you need it." : `${done} of 4 little steps done. No rush — each one makes the ID more useful.`}</div></div>
      {done < 4 && <button onClick={() => save({ dismissed_at: new Date().toISOString() })} style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Later</button>}
    </div>
    <div className="grid gap-2 mt-3">{steps.map((s) => <div key={s.title} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fff", border: `1px solid ${tokens.line}`, opacity: s.done ? 0.72 : 1, flexWrap: "wrap" }}>
      <span aria-hidden="true" className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 22, height: 22, background: s.done ? tokens.green : "#fff", border: `2px solid ${s.done ? tokens.green : tokens.line}` }}>{s.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}</span><div className="min-w-0" style={{ flex: "1 1 180px" }}><div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14.5, color: tokens.navy }}>{s.title}{s.optional ? " (optional)" : ""}</div><div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{s.text}</div></div>
      {!s.done && <a href={s.href} className="rounded-full px-3 py-1.5 flex-shrink-0" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>{s.cta}</a>}
    </div>)}</div>
  </div>;
}
export default function PetIdV2({ pet, userId, onChanged }) {
  const [refresh, setRefresh] = useState(0);
  return <div className="rounded-xl p-5 mt-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
    <div style={{ fontFamily: font.mono, fontSize: 11.5, letterSpacing: "0.12em", color: tokens.stamp, fontWeight: 700 }}>PET ID EXTRAS</div>
    <ActivationChecklist pet={pet} userId={userId} refreshKey={refresh} />
    <ChipVault pet={pet} userId={userId} onChanged={onChanged} />
    <WhatsNeededNext pet={pet} />
    <HealthPassport pet={pet} userId={userId} refreshKey={refresh} />
    <VetImport pet={pet} userId={userId} onSaved={() => { setRefresh((v) => v + 1); onChanged?.(); }} />
    <ShareCard pet={pet} userId={userId} onDone={() => window.dispatchEvent(new CustomEvent("ppg-qr-done"))} />
    <WalletCard pet={pet} onDone={() => window.dispatchEvent(new CustomEvent("ppg-qr-done"))} />
    <TravelStamps pet={pet} />
    <FindAVet pet={pet} />
  </div>;
}
