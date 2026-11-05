"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import { getSignedUrl } from "../lib/storage";
import { VAULT_DOC_TYPES, DOC_ACCEPT, documentFileError, documentStatus } from "../lib/petDocuments";
import { fmtDob } from "../lib/petProfile";

const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };

const CHIP = {
  Valid: { background: "#EAF6EE", color: tokens.green },
  "Expiring soon": { background: "#FFF4D6", color: "#8A5A00" },
  Expired: { background: "#FDE8E2", color: tokens.primary },
  "No expiry": { background: tokens.sky, color: tokens.navy },
};

function todayPT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function StatusChip({ status }) {
  const tone = CHIP[status] || CHIP["No expiry"];
  return <span className="inline-flex items-center rounded-full px-3 py-1" style={{ ...tone, fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>{status}</span>;
}

export default function PetDocumentsCard({ pet, userId }) {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ type: VAULT_DOC_TYPES[0], file: null, issuedOn: "", expiresOn: "", note: "" });
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("documents").select("*").eq("pet_id", pet.id).order("uploaded_at", { ascending: false });
    setDocs(data || []);
  }

  useEffect(() => { load(); }, [pet.id]);

  async function uploadFile(file) {
    const path = `${userId}/${pet.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const { error } = await supabase.storage.from("pet-documents").upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (error) throw error;
    return path;
  }

  async function add(e) {
    e.preventDefault();
    const problem = documentFileError(form.file);
    if (problem) { alert(problem); return; }
    setBusy(true);
    try {
      const path = await uploadFile(form.file);
      const row = { user_id: userId, pet_id: pet.id, document_type: form.type, file_url: path, expires_on: form.expiresOn || null, issued_on: form.issuedOn || null, note: form.note.trim() || null };
      let { error } = await supabase.from("documents").insert(row);
      if (error && /issued_on|note|schema cache|PGRST204|column/i.test(error.message || "")) {
        ({ error } = await supabase.from("documents").insert({ user_id: userId, pet_id: pet.id, document_type: form.type, file_url: path, expires_on: form.expiresOn || null }));
      }
      if (error) throw error;
      setForm({ type: VAULT_DOC_TYPES[0], file: null, issuedOn: "", expiresOn: "", note: "" });
      e.target.reset();
      await load();
    } catch {
      alert("Couldn't upload that file. Please try again.");
    }
    setBusy(false);
  }

  async function view(doc) {
    const url = await getSignedUrl(doc.file_url, 120);
    if (url) window.open(url, "_blank", "noopener");
    else alert("Couldn't open that file. Please try again.");
  }

  async function replace(doc, file) {
    const problem = documentFileError(file);
    if (problem) { alert(problem); return; }
    if (!window.confirm("Replace this file?")) return;
    setBusy(true);
    try {
      const path = await uploadFile(file);
      const { error } = await supabase.from("documents").update({ file_url: path }).eq("id", doc.id).eq("user_id", userId);
      if (error) throw error;
      if (doc.file_url) await supabase.storage.from("pet-documents").remove([doc.file_url]);
      await load();
    } catch {
      alert("Couldn't replace that file. Please try again.");
    }
    setBusy(false);
  }

  async function remove(doc) {
    if (!window.confirm("Delete this document? This can't be undone.")) return;
    if (doc.file_url) await supabase.storage.from("pet-documents").remove([doc.file_url]);
    await supabase.from("documents").delete().eq("id", doc.id).eq("user_id", userId);
    setDocs((rows) => rows.filter((d) => d.id !== doc.id));
  }

  const today = todayPT();

  return (
    <section id={`documents-${pet.id}`} data-pet-documents className="rounded-3xl p-4 sm:p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <h3 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }} className="mb-4">Documents</h3>
      <div className="grid gap-3">
        {docs.map((doc) => {
          const status = documentStatus(doc.expires_on, today);
          return (
            <article key={doc.id} className="rounded-2xl p-4" style={{ background: tokens.paper }}>
              <div className="flex items-start justify-between gap-3">
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 17, color: tokens.navy }}>{doc.document_type}</div>
                <StatusChip status={status} />
              </div>
              <div className="mt-1" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>
                {[doc.issued_on ? `Issued ${fmtDob(doc.issued_on)}` : "", doc.expires_on ? `Expires ${fmtDob(doc.expires_on)}` : ""].filter(Boolean).join(" · ")}
              </div>
              {doc.note ? <div className="mt-1" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{doc.note}</div> : null}
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={() => view(doc)} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, background: tokens.navy, color: "#fff", border: "none", borderRadius: 999, minHeight: 44, padding: "8px 14px", cursor: "pointer" }}>View</button>
                <label style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, borderRadius: 999, minHeight: 44, padding: "8px 14px", cursor: "pointer" }}>
                  Replace
                  <input type="file" accept={DOC_ACCEPT} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) replace(doc, f); }} />
                </label>
                <button type="button" onClick={() => remove(doc)} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, background: "#fff", color: tokens.primary, border: `2px solid ${tokens.primary}`, borderRadius: 999, minHeight: 44, padding: "8px 14px", cursor: "pointer" }}>Delete</button>
              </div>
            </article>
          );
        })}
      </div>

      <form onSubmit={add} className="grid gap-3 mt-5">
        <label style={label}>Type
          <select aria-label="Document type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={input}>
            {VAULT_DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label style={label}>File
          <input required aria-label="Document file" type="file" accept={DOC_ACCEPT} onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} style={{ fontFamily: font.body, fontSize: 16 }} />
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label style={label}>Issue date<input type="date" aria-label="Issue date" value={form.issuedOn} onChange={(e) => setForm({ ...form, issuedOn: e.target.value })} style={input} /></label>
          <label style={label}>Expiry date<input type="date" aria-label="Expiry date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} style={input} /></label>
        </div>
        <label style={label}>Note<input aria-label="Document note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={500} style={input} /></label>
        <button type="submit" disabled={busy} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, background: tokens.primary, color: "#fff", border: "none", borderRadius: 999, minHeight: 48, padding: "12px 18px", cursor: "pointer", justifySelf: "start" }}>{busy ? "Uploading…" : "Upload"}</button>
      </form>
    </section>
  );
}
