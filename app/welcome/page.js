"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";
import GuaranteeLine from "../../components/GuaranteeLine";
import { WITHDRAWAL_CONFIRMED, clearWithdrawalConsent } from "../../lib/withdrawal";

const card = { background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" };
const h = { fontFamily: font.display, fontSize: 26, fontWeight: 700, color: tokens.navy };
const p = { fontFamily: font.body, fontSize: 15.5, color: tokens.muted };
const btn = { background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" };

function clearSaved() {
  try { ["petpassgo_pending_trip", "petpassgo_purchase_intent", "petpassgo_checkout_intent"].forEach((k) => localStorage.removeItem(k)); } catch {}
  clearWithdrawalConsent();
}

export default function WelcomePage() {
  const [sessionId, setSessionId] = useState("");
  const [info, setInfo] = useState(null); // { state, email, first_name, plan }
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("session_id") || "";
    setSessionId(sid);
    fetch("/api/welcome", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sid }) })
      .then((r) => r.json().catch(() => ({ state: "error" })))
      .then((j) => { setInfo(j); if (j.state === "exists" || j.state === "claimed") clearSaved(); })
      .catch(() => setInfo({ state: "error" }));
  }, []);

  async function finish(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/welcome/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, password }) });
    const j = await r.json().catch(() => ({}));
    if (j.state === "exists" || j.state === "claimed") { clearSaved(); setInfo((i) => ({ ...i, state: j.state })); setBusy(false); return; }
    if (!r.ok) { setErr(j.error || "Something went wrong. Please try again."); setBusy(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email: j.email, password });
    clearSaved();
    if (error) { setInfo((i) => ({ ...i, state: "claimed" })); setBusy(false); return; }
    window.location.href = "/account?checkout=success";
  }

  const s = info?.state;
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-[460px] rounded-2xl p-7" style={card}>
          {!info ? (
            <p style={p} className="text-center">Checking your payment…</p>
          ) : s === "new" ? (
            <>
              <h1 style={h} className="mb-1">You're in{info.first_name ? `, ${info.first_name}` : ""}!</h1>
              <p style={{ ...p, fontSize: 16, color: tokens.ink }} className="mb-3">Payment received. {WITHDRAWAL_CONFIRMED} We also email that confirmation. Create a password to finish.</p>
              {(info.plan === "pass" || info.plan === "join") && <div className="mb-4"><GuaranteeLine /></div>}
              <form onSubmit={finish} className="flex flex-col gap-3">
                <input type="email" value={info.email || ""} readOnly aria-label="Email" style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16, background: "#F5F7FA", color: tokens.navy }} className="rounded-xl px-4 py-3 outline-none" />
                <input type="password" required minLength={6} autoFocus autoComplete="new-password" placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }} className="rounded-xl px-4 py-3 outline-none" />
                {err && <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.stamp }}>{err}</div>}
                <button type="submit" disabled={busy} style={btn} className="btn-primary rounded-full py-3.5 text-[16px] mt-1">{busy ? "Finishing…" : "Finish"}</button>
              </form>
            </>
          ) : s === "exists" || s === "claimed" ? (
            <>
              <h1 style={h} className="mb-1">You're all set</h1>
              <p style={p} className="mb-5">{s === "exists" ? <>You already have an account with <strong>{info.email}</strong>. Your purchase is on it. Log in to continue.</> : <>Your purchase is saved to <strong>{info.email}</strong>. Log in to continue.</>}</p>
              <a href="/login" style={btn} className="btn-primary block text-center rounded-full py-3.5 text-[16px]">Log in</a>
            </>
          ) : (
            <>
              <h1 style={h} className="mb-1">We couldn't find that payment</h1>
              <p style={p} className="mb-5">If you were charged, log in or sign up with the email you paid with and it will appear automatically. Questions: support@petpassgo.com</p>
              <a href="/login" style={btn} className="btn-primary block text-center rounded-full py-3.5 text-[16px]">Log in</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
