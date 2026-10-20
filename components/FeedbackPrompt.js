"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

export default function FeedbackPrompt({ kind, tripId = null, refKey = null, title, blurb }) {
  const [ready, setReady] = useState(false); const [dismissed, setDismissed] = useState(false);
  const [rating, setRating] = useState(0); const [comment, setComment] = useState(""); const [state, setState] = useState("idle");
  const ref = refKey || tripId || "account";
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("feedback").select("id").eq("kind", kind).eq("ref", ref).limit(1);
      if (!data?.length && !sessionStorage.getItem(`ppg_fb_${kind}_${ref}`)) setReady(true);
    })();
  }, [kind, ref]);
  if (!ready || dismissed) return null;
  async function submit() {
    if (!rating) return; setState("saving");
    const { data: s } = await supabase.auth.getSession();
    const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ kind, trip_id: tripId, ref, rating, comment }) });
    if (r.ok) setState("done"); else setState("idle");
  }
  function dismiss() { sessionStorage.setItem(`ppg_fb_${kind}_${ref}`, "1"); setDismissed(true); }
  return <div className="rounded-2xl p-5 mb-6" style={{ background: "#FFF9EC", border: `1.5px solid ${tokens.gold}`, fontFamily: font.body }}>
    {state === "done" ? <><div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }}>Thank you</div><p style={{ fontSize: 14.5, color: tokens.muted }} className="mt-1">Your note is private to PetPassGo. We won't publish it unless you later say we may.</p></> : <>
      <div className="flex items-start justify-between gap-3"><div><div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }}>{title}</div><div style={{ fontSize: 14.5, color: tokens.muted }} className="mt-0.5">{blurb}</div></div><button onClick={dismiss} aria-label="Dismiss" style={{ color: tokens.muted, fontSize: 20, lineHeight: 1 }}>×</button></div>
      <div className="flex gap-1.5 mt-3" role="radiogroup" aria-label="Rating">{[1,2,3,4,5].map((n) => <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="rounded-full" style={{ width: 42, height: 42, fontSize: 22, background: n <= rating ? tokens.gold : "#fff", border: `2px solid ${n <= rating ? tokens.gold : tokens.line}` }}>★</button>)}</div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={3} placeholder="Anything you'd like us to know? (optional)" style={{ width: "100%", marginTop: 12, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "10px 12px", fontSize: 15 }} />
      <div className="flex gap-2 items-center flex-wrap mt-2"><button disabled={!rating || state === "saving"} onClick={submit} className="rounded-full px-5 py-2.5" style={{ background: tokens.navy, color: "#fff", fontWeight: 700, opacity: rating ? 1 : 0.5 }}>{state === "saving" ? "Sending…" : "Send feedback"}</button><span style={{ fontSize: 12.5, color: tokens.muted }}>Private — never shown publicly without your permission.</span></div>
    </>}
  </div>;
}
