"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

// Inside Pet Vault: leave (or edit) one public review, or send private feedback.
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff", color: tokens.ink };
const label = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "grid", gap: 6 };

async function call(url, method = "GET", body) {
  const { data } = await supabase.auth.getSession();
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: body ? JSON.stringify(body) : undefined });
  return r.json().catch(() => ({}));
}

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)}
          style={{ fontSize: 34, lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 2, color: n <= value ? "#F2B84B" : "#CBD3DE" }}>★</button>
      ))}
    </div>
  );
}

export default function ReviewCard() {
  const [mine, setMine] = useState(undefined);
  const [mode, setMode] = useState(""); // "", "review", "feedback"
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ ok: true, text: "" });

  useEffect(() => {
    call("/api/reviews").then((d) => setMine(d?.review || null));
    supabase.auth.getUser().then(({ data }) => {
      const m = data?.user?.user_metadata || {};
      const first = (m.first_name || m.full_name || "").trim().split(" ")[0];
      const last = (m.last_name || (m.full_name || "").trim().split(" ").slice(1).join(" ")).trim();
      setName([first, last ? `${last[0]}.` : ""].filter(Boolean).join(" "));
    });
  }, []);

  function openReview() {
    setMode("review"); setMsg({ ok: true, text: "" });
    if (mine) { setRating(mine.rating); setBody(mine.body); setName(mine.display_name); }
  }
  async function sendReview(e) {
    e.preventDefault(); setBusy(true);
    const d = await call("/api/reviews", "POST", { rating, body, display_name: name });
    setBusy(false);
    if (d?.error) return setMsg({ ok: false, text: d.error });
    setMine({ rating, body, display_name: name, status: "pending" }); setMode("");
    setMsg({ ok: true, text: "Thank you! Your review will appear on our reviews page once it's checked." });
  }
  async function sendFeedback(e) {
    e.preventDefault(); setBusy(true);
    const d = await call("/api/feedback", "POST", { kind: "general", comment: note });
    setBusy(false);
    if (d?.error) return setMsg({ ok: false, text: d.error });
    setNote(""); setMode("");
    setMsg({ ok: true, text: "Thanks. Your feedback went straight to our team. It's never posted publicly." });
  }

  const status = mine?.status === "approved" ? "Live on the reviews page" : mine?.status === "pending" ? "Waiting to be checked" : mine?.status === "rejected" ? "Not posted. Edit it and send again." : "";
  return (
    <section className="rounded-3xl p-5 sm:p-6 min-w-0" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <h3 style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, color: tokens.navy }}>How are we doing?</h3>
      <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>
        Your story helps other pet owners. Leave a review, or send us private feedback that only our team reads.
      </p>
      {mine && mode !== "review" ? (
        <div className="mt-3 rounded-2xl px-4 py-3" style={{ background: tokens.sky }}>
          <div style={{ color: "#F2B84B", fontSize: 18, letterSpacing: 2 }}>{"★".repeat(mine.rating)}<span style={{ color: "#CBD3DE" }}>{"★".repeat(5 - mine.rating)}</span></div>
          <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }}>{mine.body}</p>
          <div className="mt-1" style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: mine.status === "approved" ? "#2F7A4A" : tokens.muted }}>{status}</div>
        </div>
      ) : null}
      {!mode && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={openReview} className="ppg-btn ppg-btn-primary">{mine ? "Edit my review" : "Leave a review"}</button>
          <button type="button" onClick={() => { setMode("feedback"); setMsg({ ok: true, text: "" }); }} className="ppg-btn ppg-btn-secondary">Send private feedback</button>
        </div>
      )}
      {mode === "review" && (
        <form onSubmit={sendReview} className="grid gap-3 mt-4">
          <Stars value={rating} onChange={setRating} />
          <label style={label}>Your review<textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={1500} rows={4} placeholder="What did PetPassGo help you with?" style={input} /></label>
          <label style={label}>Name to show<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Sam R." style={input} /></label>
          <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>We show your name and review only. Never your email.</p>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || !rating || body.trim().length < 10 || !name.trim()} className="ppg-btn ppg-btn-primary">{busy ? "Sending…" : "Post my review"}</button>
            <button type="button" onClick={() => setMode("")} className="ppg-btn ppg-btn-secondary">Cancel</button>
          </div>
        </form>
      )}
      {mode === "feedback" && (
        <form onSubmit={sendFeedback} className="grid gap-3 mt-4">
          <label style={label}>Your feedback<textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={4} placeholder="What should we fix or add?" style={input} /></label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || !note.trim()} className="ppg-btn ppg-btn-primary">{busy ? "Sending…" : "Send feedback"}</button>
            <button type="button" onClick={() => setMode("")} className="ppg-btn ppg-btn-secondary">Cancel</button>
          </div>
        </form>
      )}
      {msg.text && <div className="mt-3" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: msg.ok ? "#2F7A4A" : "#B91C1C" }}>{msg.text}</div>}
    </section>
  );
}
