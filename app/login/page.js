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
  useEffect(() => { const e = new URLSearchParams(window.location.search).get("email"); if (e) setEmail(e); }, []);

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

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            />

            {status === "error" && (
              <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.stamp }}>{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
              className="btn-primary rounded-full py-3.5 text-[16px] mt-2"
            >
              {status === "loading" ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="text-center mt-5">
            Don't have an account?{" "}
            <a href="/signup" style={{ color: tokens.navy, fontWeight: 600, textDecoration: "underline" }}>
              Sign up
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
