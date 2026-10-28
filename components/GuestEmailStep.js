"use client";
import React, { useState } from "react";
import { startGuestCheckout } from "../lib/checkout";
import { saveCheckoutIntent } from "../lib/resumeIntent";
import { tokens, font } from "../lib/theme";
import { PRICES as P } from "../lib/pricing";
import GuaranteeLine from "./GuaranteeLine";
import { MEMBERSHIP_TERMS } from "../lib/travelPassOffer";

// One small step before Stripe for signed-out buyers: email → Continue.
// Existing accounts are sent to log in (members get the member price); new emails go to Stripe.
// plan: "membership" | "pass" | "join". trip: assessment answers for passes.
export default function GuestEmailStep({ plan, trip, cancelPath, onClose }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [login, setLogin] = useState(null); // { member }

  async function go(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await startGuestCheckout(plan, trip, cancelPath, email);
    if (r.redirecting) return;
    setBusy(false);
    if (r.login) setLogin({ member: r.member });
    else setErr(r.error);
  }

  function toLogin() {
    try {
      if (plan === "membership") saveCheckoutIntent(login?.member ? null : "membership");
      else {
        localStorage.setItem("petpassgo_pending_trip", JSON.stringify(trip));
        // Members buy just the pass at the member price; never a second membership.
        localStorage.setItem("petpassgo_purchase_intent", login?.member ? "pass" : plan === "join" ? "join" : "pass");
      }
    } catch {}
    window.location.href = `/login?email=${encodeURIComponent(email.trim())}`;
  }

  const msg = !login ? null
    : login.member ? (plan === "membership" ? "You're already a member — log in." : `You're already a member. Log in to get your Travel Pass for ${P.memberPass}.`)
    : "You already have a PetPassGo account — log in to continue.";

  const btn = { background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, border: "none" };
  return (
    <div>
      {login ? (
        <>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.navy }} className="mb-4">{msg}</p>
          <button type="button" onClick={toLogin} style={btn} className="btn-primary w-full rounded-full py-3.5 text-[16px]">Log in</button>
          <button type="button" onClick={() => setLogin(null)} className="w-full mt-2 py-2" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted, background: "none", border: "none" }}>Use a different email</button>
        </>
      ) : (
        <form onSubmit={go} className="flex flex-col gap-3">
          <input type="email" required autoFocus autoComplete="email" inputMode="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }} className="rounded-xl px-4 py-3 outline-none" />
          {err && <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.stamp }}>{err}</div>}
          {plan === "membership" ? <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.ink, margin: 0 }}>{MEMBERSHIP_TERMS}</p> : <GuaranteeLine />}
          <button type="submit" disabled={busy} style={btn} className="btn-primary rounded-full py-3.5 text-[16px]">{busy ? "One moment…" : "Continue"}</button>
          {onClose && <button type="button" onClick={onClose} className="py-1" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted, background: "none", border: "none" }}>Cancel</button>}
        </form>
      )}
    </div>
  );
}

// Bottom sheet wrapper (mobile-first).
export function GuestEmailSheet({ open, title, ...rest }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(20,33,61,0.45)" }} onClick={(e) => { if (e.target === e.currentTarget) rest.onClose?.(); }}>
      <div className="w-full md:max-w-[440px] rounded-t-2xl md:rounded-2xl p-6" style={{ background: "#fff", paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
        <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy }} className="mb-3">{title}</div>
        <GuestEmailStep {...rest} />
      </div>
    </div>
  );
}
