"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import GuestEmailStep from "../../components/GuestEmailStep";
import { startStripe } from "../../lib/checkout";
import { trackBeginCheckout } from "../../lib/analytics";
import { PRICES as P } from "../../lib/pricing";
import { VAULT_NAME, VAULT_SUB } from "../../lib/travelPassOffer";
import { tokens, font } from "../../lib/theme";

// Membership. Signed in → straight to Stripe. Signed out → email first (existing accounts log in), then Stripe.
export default function JoinPage() {
  const [mode, setMode] = useState("loading"); // loading | guest | error
  const [err, setErr] = useState("");
  useEffect(() => {
    (async () => {
      trackBeginCheckout("membership");
      const { data } = await supabase.auth.getSession();
      if (!data?.session) { setMode("guest"); return; }
      const e = await startStripe("/api/stripe/checkout", { plan: "membership" });
      if (e) { setErr(e); setMode("error"); }
    })();
  }, []);
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-[440px] rounded-2xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          {mode === "guest" ? (
            <>
              <h1 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-1">Join PetPassGo</h1>
              <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{VAULT_NAME} · {P.member}/mo</p>
              <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-4">{VAULT_SUB}</p>
              <GuestEmailStep plan="membership" cancelPath="/" />
            </>
          ) : mode === "error" ? (
            <div className="text-center">
              <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.navy }} className="mb-4">{err}</p>
              <a href="/account" style={{ fontFamily: font.body, fontWeight: 600, color: tokens.navy, textDecoration: "underline" }}>Go to my account</a>
            </div>
          ) : (
            <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="text-center">Taking you to secure checkout…</p>
          )}
        </div>
      </div>
    </div>
  );
}
