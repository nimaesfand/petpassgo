"use client";
import { useState } from "react";
import PasswordInput from "./PasswordInput";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import Icon from "./Icon";
import { trackEvent } from "../lib/analytics";

// Free account for an easy trip. No card. Once signed in, onReady() unlocks the trip.
// If the project asks people to confirm their email, the trip waits in this browser
// and the confirmation link brings them back to finish.
export default function FreeAccountSheet({ open, onClose, onReady, trip, petWord = "your pet" }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!open) return null;
  const input = { fontFamily: font.body, fontSize: 16, color: tokens.ink, border: `1.5px solid ${tokens.line}`, borderRadius: 14, padding: "12px 14px", width: "100%", outline: "none", background: "#fff" };

  function remember() {
    try {
      localStorage.setItem("petpassgo_pending_trip", JSON.stringify(trip));
      localStorage.setItem("petpassgo_purchase_intent", "free");
    } catch {}
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    remember();
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: name.trim().split(" ")[0] || undefined }, emailRedirectTo: `${window.location.origin}/login` } });
      if (error) {
        setBusy(false);
        if (/registered|exists/i.test(error.message)) { setMode("login"); setMsg("That email already has an account. Log in instead."); } else setMsg(error.message);
        return;
      }
      trackEvent("sign_up", { content_name: "free_trip" });
      if (!data.session) { setBusy(false); setMsg("Check your email for a link to confirm your account. It brings you right back to your trip."); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setBusy(false); setMsg(error.message); return; }
    }
    try { localStorage.removeItem("petpassgo_pending_trip"); localStorage.removeItem("petpassgo_purchase_intent"); } catch {}
    await onReady();
    setBusy(false);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Create your free account" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,33,61,.45)" }} onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-3xl p-6 ppg-rise" style={{ background: "#fff", maxHeight: "92vh", overflowY: "auto" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-2" style={{ background: "#EAF6EE", color: tokens.green, fontFamily: font.body, fontSize: 12.5, fontWeight: 800, letterSpacing: ".04em" }}>FREE · NO CARD</div>
            <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>{mode === "signup" ? "Get your free checklist" : "Log in to see your checklist"}</h2>
            <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Every step for {petWord}&apos;s flight, saved to your account.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} disabled={busy} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.muted, padding: 4 }}><Icon name="x" size={20} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 mt-4">
          {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" aria-label="Your first name" autoComplete="given-name" style={input} />}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" style={input} required />
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Password"} aria-label="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} style={input} required />
          {msg && <div className="rounded-xl px-3 py-2.5" style={{ background: "#FFF8EC", fontFamily: font.body, fontSize: 14.5, color: "#7A4F00" }}>{msg}</div>}
          <button type="submit" disabled={busy} className="rounded-full py-3.5 mt-1" style={{ background: tokens.green, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
            {busy ? "One moment…" : mode === "signup" ? "Create free account" : "Log in"}
          </button>
        </form>
        <div className="mt-4 text-center" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>
          {mode === "signup"
            ? <>Already have an account? <button type="button" onClick={() => { setMode("login"); setMsg(""); }} style={{ color: tokens.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Log in</button></>
            : <>New here? <button type="button" onClick={() => { setMode("signup"); setMsg(""); }} style={{ color: tokens.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Create a free account</button> · <a href="/login" style={{ color: tokens.navy }}>Forgot password?</a></>}
        </div>
        {mode === "signup" && <p className="mt-3" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>By creating an account you agree to the <a href="/terms" style={{ color: tokens.navy }}>Terms</a> and <a href="/privacy" style={{ color: tokens.navy }}>Privacy Policy</a>.</p>}
      </div>
    </div>
  );
}
