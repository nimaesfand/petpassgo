"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";

// Sign up or log in without leaving the business pages. Calls onReady(user) once signed in.
export function useBusinessUser() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => sub?.subscription?.unsubscribe();
  }, []);
  return user;
}

export default function BusinessAuth({ title = "Create your business account", sub = "Free. You'll use this to manage your listing." }) {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const input = { fontFamily: font.body, fontSize: 16, color: tokens.ink, border: `1.5px solid ${tokens.line}`, borderRadius: 14, padding: "12px 14px", width: "100%", outline: "none", background: "#fff" };

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg("");
    try { localStorage.setItem("petpassgo_return_to", window.location.pathname + window.location.search); } catch {}
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: name.trim().split(" ")[0] || undefined, account_kind: "business" }, emailRedirectTo: `${window.location.origin}/login` } });
      setBusy(false);
      if (error) { setMsg(/registered|exists/i.test(error.message) ? "That email already has an account. Log in instead." : error.message); if (/registered|exists/i.test(error.message)) setMode("login"); return; }
      if (!data.session) setMsg("Check your email for a link to confirm your account. It brings you right back here.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMsg(error.message);
  }

  return (
    <div className="rounded-3xl p-6 md:p-8 max-w-[480px] mx-auto" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 16px 40px rgba(20,33,61,.08)" }}>
      <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>{mode === "signup" ? title : "Log in to your business account"}</h1>
      <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="mt-1.5 mb-5">{mode === "signup" ? sub : "Use the email you signed up with."}</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" autoComplete="name" style={input} required />}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" style={input} required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Password"} aria-label="Password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} style={input} required />
        {msg && <div className="rounded-xl px-3 py-2.5" style={{ background: "#FFF8EC", fontFamily: font.body, fontSize: 14.5, color: "#7A4F00" }}>{msg}</div>}
        <button type="submit" disabled={busy} className="rounded-full py-3.5 mt-1" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
      <div className="mt-4 text-center" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>
        {mode === "signup" ? <>Already have an account? <button type="button" onClick={() => { setMode("login"); setMsg(""); }} style={{ color: tokens.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Log in</button></>
          : <>New here? <button type="button" onClick={() => { setMode("signup"); setMsg(""); }} style={{ color: tokens.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Create an account</button> · <a href="/login" style={{ color: tokens.navy }}>Forgot password?</a></>}
      </div>
      {mode === "signup" && <p className="mt-4" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>By creating an account you agree to the <a href="/terms" style={{ color: tokens.navy }}>Terms</a> and <a href="/privacy" style={{ color: tokens.navy }}>Privacy Policy</a>.</p>}
    </div>
  );
}
