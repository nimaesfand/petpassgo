"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import { startStripe, startGuestCheckout } from "../../lib/checkout";
import { trackBeginCheckout } from "../../lib/analytics";
import { tokens, font } from "../../lib/theme";

// Membership: straight to Stripe. Signed out → pay first, set a password after.
export default function JoinPage() {
  const [err, setErr] = useState("");
  useEffect(() => {
    (async () => {
      trackBeginCheckout("membership");
      const { data } = await supabase.auth.getSession();
      const e = data?.session ? await startStripe("/api/stripe/checkout", { plan: "membership" }) : await startGuestCheckout("membership", null, "/");
      if (e) setErr(e);
    })();
  }, []);
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-16">
        <div className="w-full max-w-[460px] rounded-2xl p-7 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          {err ? (
            <>
              <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.navy }} className="mb-4">{err}</p>
              <a href="/account" style={{ fontFamily: font.body, fontWeight: 600, color: tokens.navy, textDecoration: "underline" }}>Go to my account</a>
            </>
          ) : (
            <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }}>Taking you to secure checkout…</p>
          )}
        </div>
      </div>
    </div>
  );
}
