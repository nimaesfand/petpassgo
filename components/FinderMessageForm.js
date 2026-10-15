"use client";
import { useRef, useState } from "react";
import { tokens, font } from "../lib/theme";

// Masked relay: the finder writes to the owner through PetPassGo.
export default function FinderMessageForm({ petId, petName }) {
  const started = useRef(Date.now());
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState("idle");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setState("sending"); setErr("");
    const r = await fetch("/api/finder-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId, message, contact, website, elapsedMs: Date.now() - started.current }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) setState("sent");
    else { setState("idle"); setErr(j.error || "Couldn't send. Please try again."); }
  }

  const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "10px 14px", width: "100%" };
  if (state === "sent")
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "#EAF6EE", border: `1.5px solid ${tokens.green}`, fontFamily: font.body }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: tokens.green }}>Message sent. Thank you!</div>
        <div style={{ fontSize: 15, color: tokens.ink }} className="mt-1">{petName}'s owner will see it in their PetPassGo dashboard.</div>
      </div>
    );
  return (
    <form onSubmit={submit} className="rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body }}>
      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 20, color: tokens.navy }} className="mb-1">Message the owner</div>
      <div style={{ fontSize: 14, color: tokens.muted }} className="mb-3">Your message goes to {petName}'s owner through PetPassGo. Their email and phone stay private.</div>
      <textarea required minLength={2} maxLength={1000} rows={4} style={input} placeholder={`Where and when did you see ${petName}?`} value={message} onChange={(e) => setMessage(e.target.value)} />
      <input style={{ ...input, marginTop: 10 }} maxLength={200} placeholder="Your phone or email (optional, so the owner can reply)" value={contact} onChange={(e) => setContact(e.target.value)} />
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }} />
      {err && <div style={{ color: "#B42318", fontSize: 14 }} className="mt-2">{err}</div>}
      <button disabled={state === "sending"} className="btn-primary rounded-full px-6 py-3 mt-3 w-full" style={{ background: tokens.primary, color: "#fff", fontWeight: 700, fontSize: 16 }}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      <div style={{ fontSize: 12.5, color: tokens.muted }} className="mt-2">Don't share your home address. PetPassGo never asks finders or owners for money.</div>
    </form>
  );
}
