"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";
import { resumeAfterAuth } from "../../lib/resumeIntent";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState("login");
  useEffect(() => { const e = new URLSearchParams(window.location.search).get("email"); if (e) setEmail(e); }, []);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function handleForgot(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
    if (error) { setStatus("error"); setErrorMsg(error.message); return; }
    setStatus("idle");
    setMode("sent");
  }

  async function handleReset(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setStatus("error"); setErrorMsg(error.message); return; }
    setStatus("idle");
    setMode("login");
    setErrorMsg("");
    await resumeAfterAuth();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (/not confirmed/i.test(error.message || "")) {
        // Older accounts made before instant signup: resend the link, which brings them back to checkout.
        await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/login` } }).catch(() => {});
        setStatus("error");
        setErrorMsg("Please confirm your email first. We just sent you a new link; it brings you right back here.");
        return;
      }
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      await resumeAfterAuth();
    }
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-[460px]">

        <div className="rounded-2xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" }}>
          <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mb-1 text-center">
            Welcome back
          </h1>
          <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-6 text-center">
            Log in to see your pet's profile and trips.
          </p>

          <style>{`@keyframes ppgspin{to{transform:rotate(360deg)}} .ppg-spin{width:18px;height:18px;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;display:inline-block;animation:ppgspin .7s linear infinite;vertical-align:-3px;margin-right:8px}`}</style>
          {mode === "sent" ? (
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }}>Check {email} for a link to choose a new password.</p>
          ) : (
          <form onSubmit={mode === "forgot" ? handleForgot : mode === "reset" ? handleReset : handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            {mode !== "forgot" && (
            <input
              type="password"
              required
              placeholder={mode === "reset" ? "New password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            )}

            {status === "error" && (
              <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.stamp }}>{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
              className="btn-primary rounded-full py-3.5 text-[16px] mt-2"
            >
              {status === "loading" && <span className="ppg-spin" aria-hidden="true" />}
              {status === "loading" ? (mode === "forgot" ? "Sending…" : mode === "reset" ? "Saving…" : "Logging in…") : mode === "forgot" ? "Send reset link" : mode === "reset" ? "Save new password" : "Log in"}
            </button>
            {mode === "login" && (
              <button type="button" onClick={() => { setMode("forgot"); setErrorMsg(""); setStatus("idle"); }} style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Forgot password
              </button>
            )}
          </form>
          )}

          <div style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="text-center mt-5">
            <a href="/assessment" style={{ color: tokens.navy, fontWeight: 600, textDecoration: "underline" }}>
              Plan my trip
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
