import SiteHeader from "../../components/SiteHeader";
import { TrackOnMount } from "../../components/Analytics";
import TravelPassPreview from "../../components/TravelPassPreview";
import GuaranteeLine from "../../components/GuaranteeLine";
import { PRICES as P, usd } from "../../lib/pricing";
import { PLAN_CTA } from "../../lib/cta";
import { tokens, font } from "../../lib/theme";

export default function TravelPassPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="travel_pass" contentName="Travel Pass" />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="text-[32px] lg:text-[44px]">Travel Pass</h1>
        <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-3 mb-6">
          One trip. After you pay, the pass includes your step-by-step checklist, whether your pet will fit, weather and cargo safety, vets and pet stores where you land, and everything in one place on travel day.
        </p>
        <TravelPassPreview />
        <div className="rounded-3xl p-6 sm:p-8 mt-8 text-center" style={{ background: tokens.navy }}>
          <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.gold }}>ONE TRIP</div>
          <div style={{ fontFamily: font.display, fontSize: 36, fontWeight: 700, color: "#fff" }} className="mt-2">{usd(P.pass)}</div>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.sky }} className="mt-3 mb-6">
            Includes Pet Vault access for that trip, through 7 days after the trip ends. Pet Vault members add a Travel Pass for {usd(P.memberPass)} per trip.
          </p>
          <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-8 py-3.5 min-h-[52px]" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{PLAN_CTA}</a>
          <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.sky }} className="mt-3">A few questions, then checkout. Prices are in US dollars (USD).</p>
        </div>
        <GuaranteeLine align="center" />
      </main>
    </div>
  );
}
