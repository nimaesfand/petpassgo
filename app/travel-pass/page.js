import SiteHeader from "../../components/SiteHeader";
import { TrackOnMount } from "../../components/Analytics";

import { SampleTravelPass } from "../../components/SalesSamples";
import { PassEdge, PassIncluded, PlanPoints } from "../../components/TravelPassOffer";
import { JOIN_PASS_POINTS, JOIN_PASS_NOTE, passOnlyPoints } from "../../lib/travelPassOffer";
import { PRICES as P } from "../../lib/pricing";
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
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-7">
          <div className="rounded-3xl p-6 flex flex-col" style={{ background: tokens.navy }}>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.gold, letterSpacing: "0.1em" }}>JOIN + TRAVEL PASS · BEST VALUE</div>
            <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: "#fff" }} className="mt-1">{P.joinToday} <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.8 }}>today</span></div>
            <PlanPoints dark points={JOIN_PASS_POINTS} note={JOIN_PASS_NOTE} />
            <a href="/assessment?plan=join" className="rounded-full px-6 py-3.5 text-center min-h-[48px] mt-5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Choose Join + Pass — {P.joinToday} today</a>
          </div>
          <div className="rounded-3xl p-6 flex flex-col" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.primary, letterSpacing: "0.1em" }}>TRAVEL PASS ONLY</div>
            <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mt-1">{P.pass} <span style={{ fontSize: 15, fontWeight: 500, color: tokens.muted }}>per trip</span></div>
            <PlanPoints points={passOnlyPoints()} />
            <a href="/assessment?plan=pass" className="btn-primary rounded-full px-6 py-3.5 text-center min-h-[48px] mt-5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Choose Travel Pass only — {P.pass}</a>
          </div>
        </div>
        <p style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }} className="text-center mt-4">Next: answer the trip questions (about 3 minutes), then check out. Members pay {P.memberPass} automatically.</p>
        <details className="mt-6 rounded-2xl" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <summary className="px-5 py-4" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy, cursor: "pointer", minHeight: 48 }}>See an example pass</summary>
          <div className="px-2 pb-2 sm:px-3 sm:pb-3"><SampleTravelPass /></div>
        </details>
      </main>
    </div>
  );
}
