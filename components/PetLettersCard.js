"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { getSignedUrl } from "../lib/storage";
import { DOC_ACCEPT, documentFileError, documentStatus } from "../lib/petDocuments";
import { fmtDob } from "../lib/petProfile";

// ESA housing letters and service dog housing or travel letters.
// Private to the owner: never on the passport, tag, travel mode or /check.
export const LETTER_KINDS = [
  ["esa_housing", "ESA housing letter"],
  ["service_housing", "Service dog housing letter"],
  ["service_travel", "Service dog travel letter"],
];
const kindLabel = (k) => (LETTER_KINDS.find(([v]) => v === k) || [k, "Letter"])[1];

const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };
const EMPTY = { provider_name: "", provider_credential: "", license_state: "", license_number: "", issued_on: "", expires_on: "", provider_phone: "", provider_email: "", provider_address: "" };
const CHIP = { Valid: { background: "#EAF6EE", color: tokens.green }, "Expiring soon": { background: "#FFF4D6", color: "#8A5A00" }, Expired: { background: "#FDE8E2", color: tokens.primary }, "No expiry": { background: tokens.sky, color: tokens.navy } };

function todayPT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

// Shrink a photo before it is read, so big phone photos stay under the limit.
function photoDataUrl(file) {
  return new Promise((resolve) => {
    if (!/^image\/(jpe?g|png|webp)$/.test(file.type || "")) { resolve(null); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

function Row({ k, v }) {
  if (!v) return null;
  return (
    <div className="flex gap-3" style={{ fontFamily: font.body, fontSize: 15.5, lineHeight: 1.4 }}>
      <span style={{ color: tokens.muted, minWidth: 92 }}>{k}</span>
      <span style={{ color: tokens.ink, overflowWrap: "anywhere" }}>{v}</span>
    </div>
  );
}

export default function PetLettersCard({ pet, userId }) {
  const name = pet.name || "your pet";
  const service = pet.role === "Service animal";
  const [letters, setLetters] = useState([]);
  const [file, setFile] = useState(null);
  const [kind, setKind] = useState(service ? "service_housing" : "esa_housing");
  const [f, setF] = useState(EMPTY);
  const [agree, setAgree] = useState(false);
  const [reading, setReading] = useState("");
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    const { data } = await supabase.from("pet_letters").select("*").eq("pet_id", pet.id).order("created_at", { ascending: false });
    setLetters(data || []);
  }
  useEffect(() => { load(); }, [pet.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function pick(next) {
    setErr("");
    const problem = documentFileError(next);
    if (problem) { setErr(problem); return; }
    setFile(next);
    setF(EMPTY);
    const image = await photoDataUrl(next);
    if (!image) return; // PDFs and HEIC: the owner types the details.
    setReading("Reading your letter…");
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/letter-scan", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ image }) });
      const out = await r.json().catch(() => ({}));
      if (r.ok) {
        setF((x) => ({
          ...x,
          provider_name: out.provider_name || "", provider_credential: out.provider_credential || "", license_state: out.license_state || "",
          license_number: out.license_last4 || "", issued_on: out.issued_on || "", expires_on: out.expires_on || "",
          provider_phone: out.provider_phone || "", provider_email: out.provider_email || "", provider_address: out.provider_address || "",
        }));
        setReading("We filled in what we could read. Please check it.");
      } else setReading(out.error || "Couldn't read it. You can type the details in.");
    } catch {
      setReading("Couldn't read it. You can type the details in.");
    }
  }

  async function save(e) {
    e.preventDefault();
    if (!file || !agree) return;
    setBusy(true);
    setErr("");
    try {
      const path = `${userId}/${pet.id}/letters/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const up = await supabase.storage.from("pet-documents").upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (up.error) throw up.error;
      const last4 = f.license_number.replace(/[^0-9A-Za-z]/g, "").slice(-4);
      const row = {
        user_id: userId, pet_id: pet.id, kind, file_path: path,
        provider_name: f.provider_name.trim() || null, provider_credential: f.provider_credential.trim() || null,
        license_state: f.license_state.trim().toUpperCase().slice(0, 2) || null, license_last4: last4 || null,
        issued_on: f.issued_on || null, expires_on: f.expires_on || null,
        provider_phone: f.provider_phone.trim() || null, provider_email: f.provider_email.trim() || null, provider_address: f.provider_address.trim() || null,
        consent_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("pet_letters").insert(row);
      if (error) { await supabase.storage.from("pet-documents").remove([path]); throw error; }
      setFile(null); setF(EMPTY); setAgree(false); setReading("");
      await load();
    } catch {
      setErr("Couldn't save the letter. Please try again.");
    }
    setBusy(false);
  }

  function view(l) {
    const win = window.open("", "_blank");
    getSignedUrl(l.file_path, 120).then((url) => {
      if (url && win) win.location.href = url;
      else { if (win) win.close(); setErr("Couldn't open that letter. Please try again."); }
    });
  }

  async function remove(l) {
    await supabase.storage.from("pet-documents").remove([l.file_path]);
    await supabase.from("pet_letters").delete().eq("id", l.id).eq("user_id", userId);
    setLetters((rows) => rows.filter((x) => x.id !== l.id));
    setAsk(null);
  }

  const today = todayPT();

  return (
    <section id={`letters-${pet.id}`} className="rounded-3xl p-4 sm:p-6 min-w-0 max-w-full overflow-x-clip" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <h3 style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy }}>Letters</h3>
      <p className="mt-1 flex items-start gap-2" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tokens.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        <span>Only you can see this. It&apos;s never on {name}&apos;s passport, tag, or anything you share at the airport.</span>
      </p>

      <div className="grid gap-3 mt-4 min-w-0">
        {letters.map((l) => {
          const status = documentStatus(l.expires_on, today);
          return (
            <article key={l.id} className="rounded-2xl p-4" style={{ background: tokens.paper }}>
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="min-w-0" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 17, color: tokens.navy }}>{kindLabel(l.kind)}</div>
                <span className="inline-flex items-center rounded-full px-3 py-1 flex-shrink-0 whitespace-nowrap" style={{ ...(CHIP[status] || CHIP["No expiry"]), fontFamily: font.body, fontSize: 14, fontWeight: 700 }}>{status}</span>
              </div>
              <div className="mt-2 grid gap-1">
                <Row k="Provider" v={[l.provider_name, l.provider_credential].filter(Boolean).join(", ")} />
                <Row k="License" v={[l.license_state, l.license_last4 ? `•••• ${l.license_last4}` : ""].filter(Boolean).join(" ")} />
                <Row k="Dates" v={[l.issued_on ? `Issued ${fmtDob(l.issued_on)}` : "", l.expires_on ? `Expires ${fmtDob(l.expires_on)}` : ""].filter(Boolean).join(" · ")} />
                <Row k="Phone" v={l.provider_phone} />
                <Row k="Email" v={l.provider_email} />
                <Row k="Office" v={l.provider_address} />
              </div>
              {ask?.id === l.id ? (
                <div role="dialog" aria-label="Delete this letter?" className="mt-3 rounded-2xl p-4" style={{ background: "#fff", border: `2px solid ${tokens.navy}` }}>
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-3">Delete this letter? This can&apos;t be undone.</div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => remove(l)} className="ppg-btn ppg-btn-primary">Delete</button>
                    <button type="button" onClick={() => setAsk(null)} className="ppg-btn ppg-btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => view(l)} className="ppg-btn ppg-btn-secondary ppg-btn-compact">View letter</button>
                  <button type="button" onClick={() => setAsk(l)} className="ppg-btn ppg-btn-secondary ppg-btn-compact">Delete</button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!file ? (
        <label className="ppg-lift mt-4 flex items-center gap-4 rounded-2xl p-4 cursor-pointer min-w-0" style={{ border: `2px dashed ${tokens.navy}`, background: tokens.sky }}>
          <span className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 48, height: 48, background: tokens.navy, color: "#fff", fontSize: 28, fontWeight: 700, lineHeight: 1 }} aria-hidden="true">+</span>
          <span className="min-w-0">
            <span className="block" style={{ fontFamily: font.body, fontSize: 17, fontWeight: 800, color: tokens.navy }}>Add a letter</span>
            <span className="block" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>Snap a photo and we&apos;ll read the details. PDFs work too.</span>
          </span>
          <input aria-label="Letter file" type="file" accept={DOC_ACCEPT} className="ppg-hp" onChange={(e) => { const x = e.target.files?.[0]; e.target.value = ""; if (x) pick(x); }} />
        </label>
      ) : (
        <form onSubmit={save} className="grid gap-3 mt-4 min-w-0 rounded-2xl p-4" style={{ background: tokens.sky }}>
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="truncate" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 800, color: tokens.navy }}>{file.name}</span>
            <button type="button" onClick={() => { setFile(null); setReading(""); }} style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.muted, background: "none", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
          {reading ? <p role="status" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{reading}</p> : null}
          <label style={label}>What is it?
            <select value={kind} onChange={(e) => setKind(e.target.value)} style={input}>
              {LETTER_KINDS.filter(([v]) => service || v === "esa_housing").map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label style={label}>Provider name<input value={f.provider_name} onChange={set("provider_name")} maxLength={120} style={input} /></label>
          <label style={label}>Credential<input value={f.provider_credential} onChange={set("provider_credential")} maxLength={60} placeholder="For example LCSW, PhD" style={input} /></label>
          <div className="grid grid-cols-[90px_1fr] gap-3 min-w-0">
            <label style={label}>State<input value={f.license_state} onChange={set("license_state")} maxLength={2} style={input} /></label>
            <label style={label}>License number<input value={f.license_number} onChange={set("license_number")} maxLength={40} style={input} /></label>
          </div>
          <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted, marginTop: -4 }}>We only keep the last 4 digits of the license number.</p>
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <label style={label}>Issued<input type="date" value={f.issued_on} onChange={set("issued_on")} style={input} /></label>
            <label style={label}>Expires<input type="date" value={f.expires_on} onChange={set("expires_on")} style={input} /></label>
          </div>
          <label style={label}>Provider phone<input type="tel" value={f.provider_phone} onChange={set("provider_phone")} maxLength={40} style={input} /></label>
          <label style={label}>Provider email<input type="email" value={f.provider_email} onChange={set("provider_email")} maxLength={120} style={input} /></label>
          <label style={label}>Office address<input value={f.provider_address} onChange={set("provider_address")} maxLength={200} style={input} /></label>
          <label className="flex items-start gap-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 22, height: 22, marginTop: 1, flexShrink: 0 }} />
            <span>This letter may include health information. Store it only in my Vault, never on the passport, the tag, or at the airport.</span>
          </label>
          {err ? <p role="alert" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary }}>{err}</p> : null}
          <button type="submit" disabled={busy || !agree} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start", opacity: agree ? 1 : 0.6 }}>{busy ? "Saving…" : "Save letter"}</button>
        </form>
      )}
      {!file && err ? <p role="alert" className="mt-3" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary }}>{err}</p> : null}
    </section>
  );
}
