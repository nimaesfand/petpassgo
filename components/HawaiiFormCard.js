"use client";
import { useEffect, useState } from "react";
import { tokens, font } from "../lib/theme";
import { supabase } from "../lib/supabaseClient";
import Icon from "./Icon";

// Hawaii's Dog & Cat Import Form (AQS-279), filled in from the pet and trip.
// The owner adds a few details we don't keep, then downloads, prints or emails it.
export function needsHawaiiForm(cards = []) {
  return cards.some((c) => /aqs-?\s?279|hawaii dog (&|and) cat import/i.test(`${c.title || ""} ${c.description || ""}`));
}

const FILE = "Hawaii-Dog-and-Cat-Import-Form-AQS-279.pdf";
const input = { fontFamily: font.body, fontSize: 16, color: tokens.ink, border: `1.5px solid ${tokens.line}`, borderRadius: 12, padding: "11px 12px", width: "100%", outline: "none", background: "#fff" };

export default function HawaiiFormCard({ trip, pet }) {
  const [f, setF] = useState({ owner: "", phone: "", street: "", city: "", state: "", zip: "", hi_street: "", hi_city: "", hi_zip: "" });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => { if (pet?.handler_name) setF((x) => ({ ...x, owner: x.owner || pet.handler_name })); }, [pet?.handler_name]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function go(deliver) {
    setBusy(deliver); setMsg("");
    const printWin = deliver === "print" ? window.open("", "_blank") : null;
    try {
      const { data: s } = await supabase.auth.getSession();
      const r = await fetch("/api/hawaii-form", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ trip_id: trip.id, deliver: deliver === "email" ? "email" : "file", ...f }) });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || "The form could not be prepared."); }
      if (deliver === "email") { setMsg("Sent. Check your email for the form."); return; }
      const url = URL.createObjectURL(await r.blob());
      if (printWin) printWin.location.href = url;
      else { const a = document.createElement("a"); a.href = url; a.download = FILE; a.click(); }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMsg(deliver === "print" ? "Opened. Print it from the new tab." : "Downloaded.");
    } catch (e) { if (printWin) printWin.close(); setMsg(e.message); }
    finally { setBusy(""); }
  }

  const missing = [!pet?.microchip_number && "microchip number", !pet?.date_of_birth && "birthday", !pet?.breed && "breed"].filter(Boolean);
  return (
    <section className="rounded-2xl mb-4 p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }} aria-label="Hawaii Dog and Cat Import Form">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>Hawaii Dog &amp; Cat Import Form</h3>
          <p className="mt-0.5" style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.45, color: tokens.muted }}>
            Hawaii&apos;s official form (AQS-279), filled in with {pet?.name || "your pet"}&apos;s details and your arrival date. Add your address, then download it. You pick the program, sign and send it yourself.
          </p>
        </div>
        <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: "#EAF2FB", color: tokens.navy }}><Icon name="file" size={18} /></span>
      </div>
      {missing.length ? <p className="mt-2 rounded-xl px-3 py-2" style={{ background: "#FFF8EC", fontFamily: font.body, fontSize: 14, color: "#7A4F00" }}>Add {pet?.name || "your pet"}&apos;s {missing.join(", ")} to their profile so it&apos;s on the form.</p> : null}
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        <input style={input} value={f.owner} onChange={set("owner")} placeholder="Owner's full name" aria-label="Owner's full name" autoComplete="name" />
        <input style={input} value={f.phone} onChange={set("phone")} placeholder="Phone" aria-label="Phone" autoComplete="tel" inputMode="tel" />
        <input style={input} className="sm:col-span-2" value={f.street} onChange={set("street")} placeholder="Your street address" aria-label="Street address" autoComplete="street-address" />
        <input style={input} value={f.city} onChange={set("city")} placeholder="City" aria-label="City" autoComplete="address-level2" />
        <div className="grid grid-cols-2 gap-2">
          <input style={input} value={f.state} onChange={set("state")} placeholder="State" aria-label="State" autoComplete="address-level1" />
          <input style={input} value={f.zip} onChange={set("zip")} placeholder="ZIP" aria-label="ZIP" autoComplete="postal-code" inputMode="numeric" />
        </div>
        <input style={input} className="sm:col-span-2" value={f.hi_street} onChange={set("hi_street")} placeholder="Where you're staying in Hawaii (optional)" aria-label="Hawaii address" />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" disabled={!!busy} onClick={() => go("download")} className="ppg-btn ppg-btn-primary">{busy === "download" ? "Preparing…" : "Download PDF"}</button>
        <button type="button" disabled={!!busy} onClick={() => go("print")} className="ppg-btn ppg-btn-secondary">{busy === "print" ? "Preparing…" : "Print it"}</button>
        <button type="button" disabled={!!busy} onClick={() => go("email")} className="ppg-btn ppg-btn-secondary">{busy === "email" ? "Sending…" : "Email it to me"}</button>
      </div>
      {msg ? <p className="mt-2" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>{msg}</p> : null}
    </section>
  );
}
