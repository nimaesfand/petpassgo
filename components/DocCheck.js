"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DocCheck({ trip }) {
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (process.env.NEXT_PUBLIC_DOC_CHECK_ENABLED !== "true") return null;

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type) || file.size > 6e6) { setErr("Please upload a photo or scan (JPG/PNG, under 6 MB)."); return; }
    setBusy(true); setErr(""); setRes(null);
    const dataUrl = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(file); });
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/doc-check", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" },
      body: JSON.stringify({ image: dataUrl, travelDate: trip.travel_date }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) setErr(j.error || "Check failed."); else setRes(j);
  }

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: "#fff", border: "1px solid #E5E0D5" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", opacity: 0.6 }} className="mb-1">DOCUMENT PRE-CHECK (BETA)</div>
      <div style={{ fontSize: 12.5, opacity: 0.7 }} className="mb-2">Upload a photo of your vet certificate. We'll read the key details to help you prep. This is not a certification or approval. Your airline and vet have the final say.</div>
      <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
      {busy && <div style={{ fontSize: 13 }} className="mt-2">Reading your document…</div>}
      {err && <div style={{ fontSize: 13, color: "#B42318" }} className="mt-2">{err}</div>}
      {res && (
        <ul style={{ fontSize: 13 }} className="mt-2">
          <li>Pet name: {res.pet_name || "not found"}</li>
          <li>Rabies vaccination date: {res.rabies_date || "not found"}{res.rabies_expires ? ` (expires ${res.rabies_expires})` : ""}</li>
          <li>Vet signature: {res.vet_signature_present ? "appears present" : "not detected"}</li>
          <li>Against your travel date: {res.valid_on_travel_date === true ? "rabies looks current" : res.valid_on_travel_date === false ? "rabies may expire before travel. Check with your vet" : "couldn't tell"}</li>
          {res.notes && <li style={{ opacity: 0.7 }}>{res.notes}</li>}
        </ul>
      )}
    </div>
  );
}
