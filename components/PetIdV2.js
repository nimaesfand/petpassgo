"use client";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { PUBLIC_ID_BASE } from "../lib/PetQr";
import VetImport from "./VetImport";

const AAHA = "https://www.aahanet.org/searching-for-the-microchip/";
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

export function ChipVault({ pet, userId, onChanged }) {
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
    <section style={section} aria-label="Chip Vault">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><div style={h3}>🔖 Chip Vault</div><div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>Private in PetPassGo. The chip registry keeps the official record.</div></div>
        {due && <DueBadge tone={due.tone}>{due.text}</DueBadge>}
      </div>
      {pet.microchip_number ? (
        <div className="rounded-xl p-3 mt-3 flex items-center justify-between gap-3 flex-wrap" style={{ background: tokens.paper }}>
          <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>Chip ending <b>{maskChip(pet.microchip_number)}</b>{pet.chip_registry ? ` · ${pet.chip_registry}` : ""}</span>
          <span style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }}>Full number stays private</span>
        </div>
      ) : <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-2">No chip number saved yet. Your vet can read it with a quick, free scan.</p>}
      {trip && form.microchip_number && due?.tone !== "good" && <div className="rounded-xl p-3 mt-3" style={{ background: "#FFF9EC", fontFamily: font.body, fontSize: 14.5 }}>✈️ Before your {fmtDate(trip.travel_date)} trip{ trip.airline ? ` with ${trip.airline}` : ""}: take two minutes to confirm the registry has your current phone and email.</div>}
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
        <button onClick={() => save()} disabled={saving} style={{ ...btn, background: tokens.navy, color: "#fff" }}>{saving ? "Saving…" : "Save Chip Vault"}</button>
        <button onClick={() => { const n = { ...form, chip_verified_at: todayISO() }; setForm(n); save(n); }} disabled={!form.microchip_number || saving} style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, opacity: form.microchip_number ? 1 : 0.5 }}>I checked it today</button>
        <button onClick={() => setChecker((v) => !v)} style={{ ...btn, background: tokens.sky, color: tokens.navy }}>Is my chip registered?</button>
        {saved && <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.green, alignSelf: "center" }}>Saved ✓</span>}
      </div>
      {checker && (
        <ol className="mt-3 rounded-xl p-4 space-y-3" style={{ background: tokens.paper, fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
          <li><b>1. Have the number handy.</b> It's {form.microchip_number ? `the one ending ${maskChip(form.microchip_number)} above` : "on your vet paperwork, or your vet can scan for it free"}.</li>
          <li><b>2. Look up which registry holds it.</b> <a href={AAHA} target="_blank" rel="noopener noreferrer" style={{ color: tokens.primary, fontWeight: 700 }}>Open the AAHA microchip lookup</a> and enter the full number there. AAHA points to the registry; it doesn't show owner details.</li>
          <li><b>3. Confirm at that registry.</b> Sign in or call them and check the phone, email and emergency contact they would use if {pet.name} were found. Update anything old there — that's the official record.</li>
          <li><b>4. Come back and tap “I checked it today.”</b> We'll remind you again in a year, and before a trip. No chip yet? A vet or shelter can implant one in a quick visit, then register the new number right away.</li>
        </ol>
      )}
      <p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-2">PetPassGo stores and reminds. We are not a microchip registry, and a vet or shelter that scans a chip contacts the registry — not PetPassGo.</p>
    </section>
  );
}

const KIND = [["vaccine", "💉 Vaccine"], ["medication", "💊 Medication"], ["allergy", "⚠️ Allergy"], ["note", "📝 Care note"]];

export function HealthPassport({ pet, userId, refreshKey = 0 }) {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true); const [show, setShow] = useState(false);
  const [f, setF] = useState({ kind: "vaccine", name: "", date_given: "", expires_on: "", clinic: "", notes: "", show_to_finder: false });
  async function load() { const { data } = await supabase.from("pet_health_records").select("*").eq("pet_id", pet.id).order("expires_on", { ascending: true, nullsFirst: false }); setRows(data || []); setLoading(false); }
  useEffect(() => { load(); }, [pet.id, refreshKey]);
  async function add(e) { e.preventDefault(); const payload = { pet_id: pet.id, user_id: userId, kind: f.kind, name: f.name.trim(), date_given: f.date_given || null, expires_on: f.expires_on || null, clinic: f.clinic.trim() || null, notes: f.notes.trim() || null, show_to_finder: !!f.show_to_finder }; if (!payload.name) return; const { error } = await supabase.from("pet_health_records").insert(payload); if (!error) { setF({ kind: "vaccine", name: "", date_given: "", expires_on: "", clinic: "", notes: "", show_to_finder: false }); setShow(false); load(); } }
  async function remove(id) { if (window.confirm("Remove this health record?")) { await supabase.from("pet_health_records").delete().eq("id", id); load(); } }
  async function toggle(row) { await supabase.from("pet_health_records").update({ show_to_finder: !row.show_to_finder }).eq("id", row.id); load(); }
  return (
    <section style={section} aria-label="Health passport">
      <div className="flex items-start justify-between gap-3 flex-wrap"><div><div style={h3}>🩺 Health passport</div><div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>Owner-entered, not verified by PetPassGo or a vet.</div></div><button onClick={() => setShow((v) => !v)} style={{ ...btn, background: tokens.navy, color: "#fff" }}>+ Add record</button></div>
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
      <p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-2">For preparation and records only — not veterinary advice. Check due dates with your vet.</p>
    </section>
  );
}

export function WalletCard({ pet }) {
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
      c.font = "700 26px system-ui"; c.fillStyle = "#C2410C"; c.fillText("SCAN IF FOUND", 42, 350);
      c.font = "22px system-ui"; c.fillStyle = "#52606D"; c.fillText("Message the owner through PetPassGo.", 42, 390); c.fillText("No chip number or owner phone is shown.", 42, 425);
      const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = qr; }); c.drawImage(img, 590, 160, 260, 260);
      const a = document.createElement("a"); a.download = `${(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-petpassgo-id.png`; a.href = canvas.toDataURL("image/png"); a.click();
    } finally { setBusy(false); }
  }
  return <section style={section}><div style={h3}>📱 Wallet QR card</div><p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">Save this card to your phone photos or Files for one-tap access to {pet.name}'s QR.</p><button disabled={busy} onClick={download} style={{ ...btn, background: tokens.navy, color: "#fff" }} className="mt-2">{busy ? "Making card…" : "Download QR card"}</button><p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-2">Apple Wallet needs a paid Apple Developer certificate we don't have yet, and Google Wallet needs issuer access, so there's no one-tap Wallet pass yet. This downloadable card works in any photos app.</p></section>;
}

export function ShareCard({ pet, userId }) {
  const [days, setDays] = useState(7); const [url, setUrl] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [links, setLinks] = useState([]);
  async function load() { const { data } = await supabase.from("pet_share_cards").select("id,expires_at,revoked_at,created_at,view_count").eq("pet_id", pet.id).order("created_at", { ascending: false }).limit(5); setLinks(data || []); }
  useEffect(() => { load(); }, [pet.id]);
  async function create() { setBusy(true); setErr(""); const { data: s } = await supabase.auth.getSession(); const r = await fetch("/api/pet-share", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id, days }) }); const j = await r.json().catch(() => ({})); if (r.ok && j.url) { setUrl(j.url); load(); } else setErr(j.error || "Couldn't create the link."); setBusy(false); }
  async function revoke(id) { await supabase.from("pet_share_cards").update({ revoked_at: new Date().toISOString() }).eq("id", id); load(); }
  const active = links.filter((l) => !l.revoked_at && new Date(l.expires_at) > new Date());
  return <section style={section}><div style={h3}>🧑‍⚕️ Vet / sitter share card</div><p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">A private, expiring page with {pet.name}'s photo, chip last 4, vet, emergency contact and health records. It never shows the full chip number.</p>
    <div className="flex gap-2 items-center flex-wrap mt-3"><label style={label}>Expires in <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ ...input, width: "auto", display: "inline-block", marginLeft: 6 }}><option value={1}>1 day</option><option value={7}>7 days</option><option value={30}>30 days</option></select></label><button disabled={busy} onClick={create} style={{ ...btn, background: tokens.stamp, color: "#fff" }}>{busy ? "Creating…" : "Create share link"}</button></div>
    {err && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mt-2">{err}</div>}
    {url && <div className="rounded-xl p-3 mt-3 flex gap-2 flex-wrap items-center" style={{ background: tokens.paper }}><input readOnly value={url} style={{ ...input, flex: 1, minWidth: 220 }} onFocus={(e) => e.target.select()} /><button onClick={() => navigator.clipboard?.writeText(url)} style={{ ...btn, background: tokens.navy, color: "#fff" }}>Copy</button><a href={url} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, textDecoration: "none" }}>Open / PDF</a></div>}
    {active.length > 0 && <div className="mt-3 space-y-1">{active.map((l) => <div key={l.id} className="flex justify-between gap-2" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}><span>Active until {fmtDate(String(l.expires_at).slice(0, 10))} · viewed {l.view_count || 0}×</span><button onClick={() => revoke(l.id)} style={{ color: tokens.stamp, fontWeight: 700 }}>Turn off</button></div>)}</div>}
  </section>;
}

export default function PetIdV2({ pet, userId, onChanged }) {
  const [refresh, setRefresh] = useState(0);
  return <div className="rounded-xl p-5 mt-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
    <div style={{ fontFamily: font.mono, fontSize: 11.5, letterSpacing: "0.12em", color: tokens.stamp, fontWeight: 700 }}>PET ID EXTRAS</div>
    <div className="rounded-xl p-4 mt-3" style={{ background: tokens.sky }}>
      <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 700, color: tokens.navy }}>What this is</div>
      <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="mt-1">{pet.name}'s everyday safety kit: chip details, health records and a card you can share with a vet or sitter.</p>
      <div style={{ fontFamily: font.display, fontSize: 17, fontWeight: 700, color: tokens.navy }} className="mt-3">What to do next</div>
      <ol style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }} className="mt-1 space-y-1 list-none">
        <li>1. 🔖 Save the chip and tap “I checked it today”.</li>
        <li>2. 🩺 Add vaccines, meds and allergies — or smart-import them.</li>
        <li>3. 📱 Download the QR card and share it when someone cares for {pet.name}.</li>
      </ol>
    </div>
    <ChipVault pet={pet} userId={userId} onChanged={onChanged} />
    <HealthPassport pet={pet} userId={userId} refreshKey={refresh} />
    <VetImport pet={pet} userId={userId} onSaved={() => { setRefresh((v) => v + 1); onChanged?.(); }} />
    <ShareCard pet={pet} userId={userId} />
    <WalletCard pet={pet} />
  </div>;
}
