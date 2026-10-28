import SiteHeader from "../../components/SiteHeader";
import { TrackOnMount } from "../../components/Analytics";

import { SampleTravelPass } from "../../components/SalesSamples";
import { PassEdge, PassIncluded } from "../../components/TravelPassOffer";
import { PRICES as P } from "../../lib/pricing";
import { PLAN_CTA } from "../../lib/cta";
import { tokens, font } from "../../lib/theme";

// Purchase options live here, but there is no orphan checkout: picking one
// carries the choice into the trip questionnaire (/assessment?plan=…), the
// pass attaches to that trip, and Stripe checkout happens at the end.
export default function TravelPassPage() {
  const h2 = { fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy };
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="travel_pass" contentName="Travel Pass" />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="text-center mb-6">
          <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="text-[30px] lg:text-[42px]">Your trip, your pet, every step</h1>
          <p style={{ fontFamily: font.body, fontSize: 16.5, color: tokens.muted }} className="mt-2 max-w-[520px] mx-auto">One Travel Pass covers one trip. Here’s what makes it different.</p>
        </div>
        <PassEdge />
        <h2 style={h2} className="mt-7 mb-2.5">What’s inside</h2>
        <PassIncluded />
        <div className="text-center mt-7">
          <a href="/assessment" className="btn-primary inline-block rounded-full px-8 py-4 min-h-[48px]" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{PLAN_CTA}</a>
          <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">A few questions, then checkout. Travel Pass {P.pass}, or {P.joinToday} with Pet Vault. Members pay {P.memberPass}.</p>
        </div>
        <h2 style={h2} className="mt-8 mb-2.5">An example pass</h2>
        <SampleTravelPass />
      </main>
    </div>
  );
}
