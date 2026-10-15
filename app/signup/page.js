"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import { tokens, font } from "../../lib/theme";



export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
    }
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-[460px]">

        <div className="rounded-2xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" }}>
          {status === "success" ? (
            <div className="text-center">
              <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">
                Check your email
              </div>
              <p style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7 }}>
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
              <p style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7 }} className="mt-3">
                Then come back and{" "}
                <a href="/login" style={{ color: tokens.navy, fontWeight: 600, textDecoration: "underline" }}>
                  log in
                </a>{" "}
                — we'll take you straight to your trip results.
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mb-1 text-center">
                Create your account
              </h1>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-6 text-center">
                This is where your pet's profile and travel plans will live.
              </p>

              <form onSubmit={handleSignup} className="flex flex-col gap-3">
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
                  minLength={6}
                  placeholder="Password (6+ characters)"
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
                  {status === "loading" ? "Creating account…" : "Create account"}
                </button>
                <p style={{ fontFamily: font.body, fontSize: 13, opacity: 0.7 }} className="text-center">
                  By creating an account you agree to our{" "}
                  <a href="/terms" style={{ color: tokens.navy, textDecoration: "underline" }}>Terms of Service</a> and{" "}
                  <a href="/privacy" style={{ color: tokens.navy, textDecoration: "underline" }}>Privacy Policy</a>.
                </p>
              </form>

              <div style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="text-center mt-5">
                Already have an account?{" "}
                <a href="/login" style={{ color: tokens.navy, fontWeight: 600, textDecoration: "underline" }}>
                  Log in
                </a>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
