"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import GuestEmailStep from "../../components/GuestEmailStep";
import { startStripe } from "../../lib/checkout";
import { trackBeginCheckout } from "../../lib/analytics";
import { PRICES as P, usd } from "../../lib/pricing";
import { VAULT_NAME, VAULT_SUB } from "../../lib/travelPassOffer";
import WithdrawalConsent from "../../components/WithdrawalConsent";
import { WITHDRAWAL_BLOCKED } from "../../lib/withdrawal";
import { tokens, font } from "../../lib/theme";

// Membership. Signed out → email first. Signed in → tick the box, then Stripe.
export default function JoinPage() {
  const [mode, setMode] = useState("loading"); // loading | guest | ready | error
  const [err, setErr] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setMode(data?.session ? "ready" : "guest"));
  }, []);
  async function pay() {
    if (!consent) { setErr(WITHDRAWAL_BLOCKED); return; }
    setBusy(true); setErr("");
    trackBeginCheckout("membership");
    const e = await startStripe("/api/stripe/checkout", { plan: "membership", immediate_access_consent: true });
    if (e) { setErr(e); setBusy(false); }
  }
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-[440px] rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          {mode === "guest" ? (
            <>
              <h1 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-1">Join PetPassGo</h1>
              <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{VAULT_NAME} · {usd(P.member)}/mo</p>
              <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-4">{VAULT_SUB}</p>
              <GuestEmailStep plan="membership" cancelPath="/" />
            </>
          ) : mode === "ready" ? (
            <>
              <h1 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-1">Join PetPassGo</h1>
              <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{VAULT_NAME} · {usd(P.member)}/mo</p>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mb-2">{VAULT_SUB} Prices are in US dollars (USD).</p>
              <WithdrawalConsent checked={consent} onChange={(v) => { setConsent(v); setErr(""); }} error={err} />
              <button type="button" disabled={busy} onClick={pay} style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, border: "none" }} className="btn-primary w-full rounded-full py-3.5 text-[16px]">{busy ? "One moment…" : "Continue"}</button>
            </>
          ) : (
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="text-center">One moment…</p>
          )}
        </div>
      </div>
    </div>
  );
}
