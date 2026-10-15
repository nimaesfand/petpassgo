"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import ShareButtons from "./ShareButtons";
import { fmtDate } from "../lib/lost";

const todayPT = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const when = (ts) => new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }) + " PT";

// Owner-only lost-pet controls for one pet (RLS limits every query to the owner's rows).
export default function LostPanel({ pet, userId }) {
  const [report, setReport] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [scans, setScans] = useState([]);
  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    const [r, m, s] = await Promise.all([
      supabase.from("pet_lost_reports").select("*").eq("pet_id", pet.id).eq("status", "lost").maybeSingle(),
      supabase.from("finder_messages").select("*").eq("pet_id", pet.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("pet_scans").select("id,area,scanned_at").eq("pet_id", pet.id).order("scanned_at", { ascending: false }).limit(50),
    ]);
    setReport(r.data || null);
    setMessages(m.data || []);
    setScans(s.data || []);
  }
  useEffect(() => {
    load();
    supabase.from("trips").select("airline,destination,travel_date").eq("pet_id", pet.id).order("created_at", { ascending: false }).limit(1).then(({ data }) => setTrip(data?.[0] || null));
  }, [pet.id]);

  function openForm() {
    setErr("");
    setForm({ area: "", date: todayPT(), note: "", useTrip: false, flight: "" });
  }

  async function submit(e) {
    e.preventDefault();
    if (/\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|dr|drive|ln|lane|ct|court|way)\b/i.test(form.area)) {
      setErr("Please use a neighborhood, park or cross-streets, not a street address.");
      return;
    }
    setBusy(true); setErr("");
    const { error } = await supabase.from("pet_lost_reports").insert({
      pet_id: pet.id,
      user_id: userId,
      last_seen_area: form.area.trim(),
      last_seen_date: form.date || null,
      note: form.note.trim() || null,
      trip_airline: form.useTrip && trip ? trip.airline : null,
      trip_destination: form.useTrip && trip ? trip.destination : null,
      trip_flight: form.useTrip ? form.flight.trim() || null : null,
    });
    setBusy(false);
    if (error) return setErr("Couldn't save. Please try again.");
    setForm(null);
    load();
  }

  async function reunited() {
    if (!confirm(`Mark ${pet.name} as home safe? The lost poster comes down right away and scan locations are deleted.`)) return;
    setBusy(true);
    const { error } = await supabase.rpc("mark_pet_reunited", { pet_id: pet.id });
    setBusy(false);
    if (error) return setErr("Couldn't update. Please try again.");
    load();
  }

  async function deleteMessage(id) {
    await supabase.from("finder_messages").delete().eq("id", id);
    setMessages((m) => m.filter((x) => x.id !== id));
  }

  const input = { fontFamily: font.body, fontSize: 15.5, border: `2px solid ${tokens.line}`, borderRadius: 10, padding: "8px 12px", width: "100%" };
  const label = { fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.ink };
  if (report === undefined) return null;

  return (
    <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: `${report ? 2 : 1}px solid ${report ? tokens.primary : tokens.line}`, background: "#fff" }}>
      {!report && !form && (
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>
            If {pet.name} goes missing, turn the Pet ID into a lost poster with sharing and a private finder inbox.
          </div>
          <button onClick={openForm} className="rounded-full px-5 py-2.5" style={{ border: `2px solid ${tokens.primary}`, color: tokens.primary, fontFamily: font.body, fontWeight: 700, background: "#fff" }}>
            Report {pet.name} lost
          </button>
        </div>
      )}

      {!report && form && (
        <form onSubmit={submit} className="p-5 grid gap-3">
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: tokens.navy }}>Report {pet.name} lost</div>
          <label style={label}>Last seen area (neighborhood, park, or cross-streets; no home address)
            <input required maxLength={120} style={input} value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. Mission Dolores Park, San Francisco" />
          </label>
          <label style={label}>Date last seen
            <input type="date" required max={todayPT()} style={input} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label style={label}>Note for finders (optional, shown publicly)
            <textarea maxLength={500} rows={3} style={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Friendly but shy. Wearing a red collar. Don't chase, call his name." />
          </label>
          {trip && (
            <label className="flex items-start gap-2" style={label}>
              <input type="checkbox" className="mt-1 w-5 h-5" style={{ accentColor: tokens.primary }} checked={form.useTrip} onChange={(e) => setForm({ ...form, useTrip: e.target.checked })} />
              <span>Lost while traveling: add trip details ({trip.airline} to {trip.destination})</span>
            </label>
          )}
          {form.useTrip && (
            <label style={label}>Flight number (optional)
              <input maxLength={20} style={input} value={form.flight} onChange={(e) => setForm({ ...form, flight: e.target.value })} placeholder="e.g. DL 1234" />
            </label>
          )}
          <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>
            The public page shows {pet.name}'s name, species, breed and photo, plus these details. Your email and phone are never shown{pet.show_contact_on_public_id ? ", except the emergency contact you chose to show" : ""}. Finders message you privately.
          </div>
          {err && <div style={{ color: "#B42318", fontSize: 14 }}>{err}</div>}
          <div className="flex gap-2">
            <button disabled={busy} className="btn-primary rounded-full px-6 py-2.5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700 }}>{busy ? "Saving…" : "Turn on lost poster"}</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-full px-5 py-2.5" style={{ fontFamily: font.body, fontWeight: 600, color: tokens.navy }}>Cancel</button>
          </div>
        </form>
      )}

      {report && (
        <>
          <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2" style={{ background: tokens.primary }}>
            <div style={{ fontFamily: font.body, fontWeight: 800, letterSpacing: "0.1em", color: "#fff" }}>LOST · POSTER IS LIVE</div>
            <a href={`/id/${pet.id}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: font.body, fontWeight: 600, color: "#fff", textDecoration: "underline" }}>View poster</a>
          </div>
          <div className="p-5 grid gap-4">
            <div style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }}>
              Last seen <b>{report.last_seen_area}</b>{report.last_seen_date ? ` on ${fmtDate(report.last_seen_date)}` : ""}
              {report.trip_airline ? ` · while traveling with ${report.trip_airline}${report.trip_flight ? ` ${report.trip_flight}` : ""}${report.trip_destination ? ` to ${report.trip_destination}` : ""}` : ""}
            </div>
            <ShareButtons pet={pet} lost={report} />

            <div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }} className="mb-2">Messages from finders ({messages.length})</div>
              {messages.length === 0 ? (
                <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>No messages yet. Finders can write to you from the poster without seeing your email or phone.</div>
              ) : messages.map((m) => (
                <div key={m.id} className="rounded-xl p-3 mb-2" style={{ background: tokens.sky, fontFamily: font.body }}>
                  <div style={{ fontSize: 13, color: tokens.muted }}>{when(m.created_at)}</div>
                  <div style={{ fontSize: 15.5, whiteSpace: "pre-wrap" }}>{m.message}</div>
                  <div className="flex justify-between items-center mt-1" style={{ fontSize: 14 }}>
                    <span>Contact: <b>{m.finder_contact || "not provided"}</b></span>
                    <button onClick={() => deleteMessage(m.id)} style={{ color: tokens.muted, textDecoration: "underline" }}>Delete</button>
                  </div>
                </div>
              ))}
              <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-1">Stay safe: meet in a public place, and never pay anyone before you have {pet.name} back.</div>
            </div>

            <div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }} className="mb-2">Poster views ({scans.length})</div>
              {scans.length === 0 ? (
                <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>No views yet. Each time someone opens the poster or scans the QR, you'll see the time and approximate city here.</div>
              ) : (
                <ul style={{ fontFamily: font.body, fontSize: 14.5 }}>
                  {scans.slice(0, 15).map((s) => <li key={s.id}>{when(s.scanned_at)}: {s.area || "area unknown"}</li>)}
                </ul>
              )}
            </div>

            {process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true" && (
              <a href={`/community/lost-and-found?pet=${pet.id}`} className="rounded-xl p-4 block" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none", fontFamily: font.body }}>
                <div style={{ fontWeight: 700, color: tokens.navy, fontSize: 15.5 }}>Post on the Lost &amp; found board →</div>
                <div style={{ fontSize: 14, color: tokens.muted }}>Other travelers can see it and open {pet.name}'s poster. Your contact details stay hidden.</div>
              </a>
            )}
            {err && <div style={{ color: "#B42318", fontSize: 14 }}>{err}</div>}
            <button disabled={busy} onClick={reunited} className="rounded-full px-6 py-3" style={{ background: tokens.green, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16 }}>
              {pet.name} is home: mark reunited
            </button>
          </div>
        </>
      )}
    </div>
  );
}
