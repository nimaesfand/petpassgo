import SiteHeader from "../../components/SiteHeader";
import { SampleTravelPass } from "../../components/SalesSamples";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";

export default function TravelPassPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="text-[32px] lg:text-[44px]">Here’s what a Travel Pass gives you</h1>
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.muted }} className="mt-3 max-w-[540px] mx-auto">Take a look inside before you plan. Everything below is a labelled example — your real pass is built from your trip answers.</p>
        </div>
        <SampleTravelPass />
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="rounded-3xl p-7 flex flex-col" style={{ background: tokens.navy }}>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.gold, letterSpacing: "0.1em" }}>MEMBERS</div>
            <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: "#fff" }} className="mt-1">{P.memberPass} <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.8 }}>per trip</span></div>
            <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky }} className="flex-1 mt-1">With Membership ({P.member}/mo) — the Pet Vault and Pet ID included all year.</p>
            <a href="/pet-vault" className="rounded-full px-6 py-3.5 text-center min-h-[48px] mt-5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>See the Pet Vault</a>
          </div>
          <div className="rounded-3xl p-7 flex flex-col" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.primary, letterSpacing: "0.1em" }}>ONE TRIP, NO MEMBERSHIP</div>
            <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mt-1">{P.pass} <span style={{ fontSize: 15, fontWeight: 500, color: tokens.muted }}>per trip</span></div>
            <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="flex-1 mt-1">Full checklist, deadlines, official sources and reminders for one trip. Pet ID and vault included until your trip ends.</p>
            <a href="/assessment" className="btn-primary rounded-full px-6 py-3.5 text-center min-h-[48px] mt-5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Plan your trip — start free</a>
          </div>
        </div>
        <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="text-center mt-5">Start free: answer the trip questions and see your plan preview. You only pay to unlock the full pass.</p>
      </main>
    </div>
  );
}
