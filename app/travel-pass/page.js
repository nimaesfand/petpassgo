import SiteHeader from "../../components/SiteHeader";
import { SampleTravelPass } from "../../components/SalesSamples";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";

// Purchase options live here, but there is no orphan checkout: picking one
// carries the choice into the trip questionnaire (/assessment?plan=…), the
// pass attaches to that trip, and Stripe checkout happens at the end.
export default function TravelPassPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="text-[32px] lg:text-[44px]">Here’s what a Travel Pass gives you</h1>
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.muted }} className="mt-3 max-w-[540px] mx-auto">Take a look inside before you plan. Your real pass is built from your trip answers.</p>
        </div>
        <SampleTravelPass />
        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <div className="rounded-3xl p-7 flex flex-col" style={{ background: tokens.navy }}>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.gold, letterSpacing: "0.1em" }}>JOIN + TRAVEL PASS · BEST VALUE</div>
            <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: "#fff" }} className="mt-1">{P.joinToday} <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.8 }}>today</span></div>
            <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky }} className="flex-1 mt-1">Membership ({P.member}/mo after today) plus this trip’s Travel Pass at the {P.memberPass} member price. Pet Vault and Pet ID included all year — and every future pass at {P.memberPass}.</p>
            <a href="/assessment?plan=join" className="rounded-full px-6 py-3.5 text-center min-h-[48px] mt-5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Choose Join + Pass — {P.joinToday} today</a>
          </div>
          <div className="rounded-3xl p-7 flex flex-col" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.primary, letterSpacing: "0.1em" }}>TRAVEL PASS ONLY</div>
            <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 700, color: tokens.navy }} className="mt-1">{P.pass} <span style={{ fontSize: 15, fontWeight: 500, color: tokens.muted }}>per trip</span></div>
            <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }} className="flex-1 mt-1">Full checklist, deadlines, official sources and reminders for one trip. Pet ID &amp; vault stay open until 7 days after your travel date.</p>
            <a href="/assessment?plan=pass" className="btn-primary rounded-full px-6 py-3.5 text-center min-h-[48px] mt-5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Choose Travel Pass only — {P.pass}</a>
          </div>
        </div>
        <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="text-center mt-5">Next: answer the trip questions (about 3 minutes). Your pass attaches to that trip, then you check out — nothing is charged until then. Already a member? <a href="/assessment" style={{ color: tokens.navy, fontWeight: 600 }}>Plan your trip</a> and your {P.memberPass} member price applies at checkout.</p>
      </main>
    </div>
  );
}
