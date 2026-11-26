"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

// Add the passport to Apple Wallet / Google Wallet. Members only. Each button stays
// hidden until that wallet is set up (no "coming soon"). iPhone/Mac sees Apple,
// Android sees Google, other desktops see both with a note.
const APPLE = <svg width="18" height="22" viewBox="0 0 17 21" aria-hidden="true" fill="currentColor"><path d="M14.1 11.2c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.6-4zM11.7 3.9c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.5 2.8-1.3z" /></svg>;
const GOOGLE = <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5V9H3z" /><path fill="#34A853" d="M3 9h18v3H3z" /><path fill="#FBBC04" d="M3 12h18v3H3z" /><path fill="#EA4335" d="M3 15h18v1.5A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" /></svg>;

function platform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) return "apple";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export default function WalletButtons({ pet, onSaveImage }) {
  const [avail, setAvail] = useState({ apple: false, google: false });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ ok: true, text: "" });
  const [plat, setPlat] = useState("other");
  useEffect(() => {
    setPlat(platform());
    let live = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const r = await fetch("/api/pet-wallet", { headers: { "x-sb-token": data?.session?.access_token || "" } });
      const j = await r.json().catch(() => ({}));
      if (live) setAvail({ apple: !!j.apple, google: !!j.google });
    }).catch(() => {});
    return () => { live = false; };
  }, [pet.id]);

  const showApple = avail.apple && plat !== "android";
  const showGoogle = avail.google && plat !== "apple";
  if (!showApple && !showGoogle) return null;

  const fail = () => setMsg({ ok: false, text: "Couldn't add the pass. Try again in a few minutes." });
  async function apple() {
    setBusy("apple"); setMsg({ ok: true, text: "" });
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/pet-wallet", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id }) });
      if (!r.ok) { fail(); return; }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-passport.pkpass`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setMsg({ ok: true, text: "Added to Wallet. It updates when records change." });
    } catch { fail(); } finally { setBusy(""); }
  }
  async function google() {
    setBusy("google"); setMsg({ ok: true, text: "" });
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/pet-wallet/google", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) { fail(); return; }
      window.location.href = j.url;
    } catch { fail(); } finally { setBusy(""); }
  }

  const btn = { minHeight: 52, background: "#000", color: "#fff", border: "none", cursor: "pointer", fontFamily: font.body, fontWeight: 700, fontSize: 16 };
  return (
    <div className="grid gap-2 min-w-0">
      <div className={`grid gap-2 ${showApple && showGoogle ? "sm:grid-cols-2" : ""}`}>
        {showApple ? <button type="button" onClick={apple} disabled={!!busy} className="w-full rounded-xl flex items-center justify-center gap-2.5" style={btn}>{APPLE}{busy === "apple" ? "Preparing…" : "Add to Apple Wallet"}</button> : null}
        {showGoogle ? <button type="button" onClick={google} disabled={!!busy} className="w-full rounded-xl flex items-center justify-center gap-2.5" style={btn}>{GOOGLE}{busy === "google" ? "Preparing…" : "Add to Google Wallet"}</button> : null}
      </div>
      {showApple && showGoogle && plat === "other" ? <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>On iPhone, this adds the pass to Wallet.</div> : null}
      {msg.text ? (
        <div style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: msg.ok ? "#2F7A4A" : "#B91C1C" }}>
          {msg.text}{!msg.ok && onSaveImage ? <> <button type="button" onClick={onSaveImage} style={{ color: tokens.navy, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Save image instead</button></> : null}
        </div>
      ) : null}
    </div>
  );
}
