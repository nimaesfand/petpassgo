"use client";

import React, { useState, useEffect } from "react";
import { PRICES as P } from "../../lib/pricing";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import { trackEvent, getAttribution } from "../../lib/analytics";
import { tokens, font } from "../../lib/theme";
import { saveCheckoutIntent, resumeAfterAuth } from "../../lib/resumeIntent";
import GuestEmailStep from "../../components/GuestEmailStep";



export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState("");
  const [plan, setPlan] = useState("member");
  const [free, setFree] = useState(false); // free account only (no plan, nothing to pay)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("plan");
    // Pay first: plan links skip account creation and go straight to checkout.
    if (q === "member" && !localStorage.getItem("petpassgo_pending_trip")) { window.location.replace("/join"); return; }
    if (q === "pass" && !localStorage.getItem("petpassgo_pending_trip")) { window.location.replace("/assessment?plan=pass"); return; }
    if (q === "pass" || q === "member") setPlan(q);
    if (new URLSearchParams(window.location.search).get("free") === "1") setFree(true);
    else if (localStorage.getItem("petpassgo_pending_trip")) setPlan("pass");
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // Remember the chosen plan so signup (or a later login) continues straight to checkout.
    localStorage.setItem("petpassgo_plan", plan);
    const hasTrip = !!localStorage.getItem("petpassgo_pending_trip");
    saveCheckoutIntent(hasTrip || free ? null : plan === "member" ? "membership" : "pass");
    try { localStorage.setItem("ppg_signup_attribution", JSON.stringify(getAttribution())); } catch {}

    const r = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 409) { setStatus("exists"); return; }
    if (!r.ok) { setStatus("error"); setErrorMsg(j.error || "We couldn't create your account. Please try again."); return; }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setStatus("error"); setErrorMsg(error.message); return; }
    trackEvent("sign_up", { method: "email", plan, content_type: "signup" });
    setStatus("redirecting");
    await resumeAfterAuth();
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-[520px]">

        <div className="rounded-2xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" }}>
          {status === "redirecting" ? (
            <div className="text-center">
              <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">Account created</div>
              <p style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7 }}>Taking you to secure checkout…</p>
            </div>
          ) : status === "exists" ? (
            <div className="text-center">
              <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">You already have an account</div>
              <p style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7 }}>
                <strong>{email}</strong> is already signed up.{" "}
                <a href="/login" style={{ color: tokens.navy, fontWeight: 600, textDecoration: "underline" }}>Log in</a> and we'll take you straight to checkout.
              </p>
            </div>
          ) : (
            <>
              {free ? (
                <>
                  <h1 style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: tokens.navy }} className="mb-5 text-center">Create a free account</h1>
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
                  {status === "loading" ? "Creating account…" : "Create free account"}
                </button>
                <p style={{ fontFamily: font.body, fontSize: 13, opacity: 0.7 }} className="text-center">
                  No plan, nothing to pay. By creating an account you agree to our{" "}
                  <a href="/terms" style={{ color: tokens.navy, textDecoration: "underline" }}>Terms of Service</a> and{" "}
                  <a href="/privacy" style={{ color: tokens.navy, textDecoration: "underline" }}>Privacy Policy</a>.
                </p>
              </form>

                  <button type="button" onClick={() => setFree(false)} className="w-full mt-3 py-1" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted, background: "none", border: "none" }}>See plans instead</button>
                </>
              ) : (
                <>
              <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mb-1 text-center">
                Choose your plan
              </h1>
              <p style={{ fontFamily: font.body, fontSize: 15, opacity: 0.65 }} className="mb-6 text-center">
                You can switch later.
              </p>
              <div role="radiogroup" aria-label="Plan" className="mb-6">
                {[
                  ["member", "Membership", `${P.member}/mo`, `Pet vault, Digital Pet ID, lost-pet alerts, community. Travel Passes ${P.memberPass}.`],
                  ["pass", "Travel Pass only", `${P.pass} per trip`, "One trip's checklist, deadlines and reminders. Pet ID & vault stay open until 7 days after your travel date, or 7 days after your return if you add one."],
                ].map(([k, n, price, d]) => {
                  const sel = plan === k;
                  return (
                    <label key={k} className="flex gap-3 items-start rounded-2xl p-4 mb-3 cursor-pointer" style={{ border: `2px solid ${sel ? tokens.primary : tokens.line}`, background: sel ? "#FFF7F2" : "#fff" }}>
                      <input type="radio" name="plan" value={k} checked={sel} onChange={() => setPlan(k)} className="mt-1.5" style={{ accentColor: tokens.primary }} />
                      <span className="flex-1">
                        <span className="flex justify-between gap-2 flex-wrap">
                          <span style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }}>
                            {n}{k === "member" && <span className="ml-2 rounded-full px-2 py-0.5 align-middle" style={{ background: tokens.gold, fontFamily: font.body, fontSize: 10.5, fontWeight: 800 }}>BEST VALUE</span>}
                          </span>
                          <span style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy, fontSize: 15 }}>{price}</span>
                        </span>
                        <span style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{d}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {plan === "member" ? (
                <GuestEmailStep plan="membership" cancelPath="/signup" />
              ) : (
                <a href="/assessment?plan=pass" style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }} className="btn-primary block text-center rounded-full py-3.5 text-[16px]">Start your trip · {P.pass}</a>
              )}
              <p style={{ fontFamily: font.body, fontSize: 13, opacity: 0.7 }} className="text-center mt-3">
                {plan === "member" ? "Monthly, cancel anytime. Pay first, then set your password. " : ""}By continuing you agree to our{" "}
                <a href="/terms" style={{ color: tokens.navy, textDecoration: "underline" }}>Terms of Service</a> and{" "}
                <a href="/privacy" style={{ color: tokens.navy, textDecoration: "underline" }}>Privacy Policy</a>.
              </p>
              <button type="button" onClick={() => setFree(true)} className="w-full mt-2 py-1" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted, background: "none", border: "none" }}>Just want a free account?</button>
                </>
              )}

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
