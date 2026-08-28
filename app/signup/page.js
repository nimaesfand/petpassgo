"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const tokens = {
  navy: "#152238",
  gold: "#C9A227",
  sky: "#EAF0F6",
  paper: "#F6F8FA",
  ink: "#1C2733",
  stamp: "#B23A2E",
  line: "#D9E1E8",
};

const font = {
  display: "'Fraunces', serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Inter', sans-serif",
};

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
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex justify-center px-4 py-16">
      <div className="w-full max-w-[440px]">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 22, color: tokens.navy }}>
            PetPassGo
          </span>
        </div>

        <div className="rounded-2xl p-8" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
          {status === "success" ? (
            <div className="text-center">
              <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">
                Check your email
              </div>
              <p style={{ fontFamily: font.body, fontSize: 14, opacity: 0.7 }}>
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back to log in.
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: font.display, fontSize: 24, color: tokens.navy }} className="mb-1 text-center">
                Create your account
              </h1>
              <p style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="mb-6 text-center">
                This is where your pet's profile and travel plans will live.
              </p>

              <form onSubmit={handleSignup} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
                  className="rounded-xl px-4 py-3 outline-none"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password (6+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
                  className="rounded-xl px-4 py-3 outline-none"
                />

                {status === "error" && (
                  <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.stamp }}>{errorMsg}</div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
                  className="rounded-full py-3.5 text-[15px] hover:opacity-90 transition mt-2"
                >
                  {status === "loading" ? "Creating account…" : "Create account"}
                </button>
              </form>

              <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.65 }} className="text-center mt-5">
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
  );
}
