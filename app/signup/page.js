"use client";

import SiteHeader from "../../components/SiteHeader";
import { JOIN_CTA, LOGIN_CTA, PLAN_CTA } from "../../lib/cta";
import { VAULT_SUB } from "../../lib/travelPassOffer";
import { tokens, font } from "../../lib/theme";

// Paid paths only. A Travel Pass needs the trip questions first. Pet Vault checkout is /join.
export default function SignupPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader />
      <div className="w-full flex justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[520px] rounded-2xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <h1 style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mb-2 text-center">Get started</h1>
          <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mb-6 text-center">{VAULT_SUB}</p>
          <a href="/assessment" className="btn-primary block text-center rounded-full py-3.5" style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{PLAN_CTA}</a>
          <p className="text-center mt-4">
            <a href="/join" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{JOIN_CTA}</a>
          </p>
          <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="text-center mt-6">
            Already have an account? <a href="/login" style={{ color: tokens.navy, fontWeight: 700 }}>{LOGIN_CTA}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
