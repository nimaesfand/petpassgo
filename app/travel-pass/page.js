import SiteHeader from "../../components/SiteHeader";
import { TrackOnMount } from "../../components/Analytics";
import TravelPassPreview from "../../components/TravelPassPreview";
import TrustBadges from "../../components/TrustBadges";
import Icon from "../../components/Icon";
import { PRICES as P } from "../../lib/pricing";
import { PLAN_CTA } from "../../lib/cta";
import { tokens, font } from "../../lib/theme";

const CHIPS = [
  { icon: "plane", title: "Airline requirements" },
  { icon: "check", title: "Step-by-step checklist" },
  { icon: "cloudSun", title: "Weather & cargo safety" },
  { icon: "bag", title: "Vets and pet stores" },
  { icon: "file", title: "Documents in one place" },
];

export default function TravelPassPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="travel_pass" contentName="Travel Pass" />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 lg:pt-12 pb-10">
        <p style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.primary }}>TRAVEL PASS</p>
        <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.05 }} className="text-[36px] sm:text-[48px] mt-2">Your Travel Pass</h1>
        <p style={{ fontFamily: font.body, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="mt-3 max-w-[40rem]">
          One trip, ready before you fly. After you pay: a checklist with due dates, a check for whether your pet will fit, weather at both airports with a cargo heat and cold warning, vets and pet stores near arrival and departure, flight status, your documents, and Pet ID.
        </p>
        <div className="flex gap-2 mt-5 pb-1 max-sm:overflow-x-auto max-sm:flex-nowrap sm:flex-wrap" role="list" aria-label="What’s in a Travel Pass" style={{ scrollbarWidth: "none" }}>
          {CHIPS.map((c) => (
            <div key={c.title} role="listitem" className="flex items-center gap-2 rounded-full px-4 py-2 flex-shrink-0" style={{ background: "#fff", border: `1px solid ${tokens.line}`, minHeight: 48 }}>
              <span className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 32, height: 32, background: tokens.navy, color: tokens.gold }}><Icon name={c.icon} size={16} /></span>
              <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy, whiteSpace: "nowrap" }}>{c.title}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-6">
          <img
            src="/travel-pass-hero.jpg"
            alt="A golden retriever in a navy harness sits beside a suitcase at an airport window, with a plane outside."
            className="w-full h-[240px] sm:h-[440px] object-cover rounded-3xl"
            style={{ objectPosition: "70% center" }}
          />
          <div className="relative sm:absolute sm:left-5 sm:bottom-5 mt-3 sm:mt-0 w-full sm:w-auto sm:max-w-[300px] rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 16px 40px rgba(20,33,61,0.18)" }}>
            <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>SAMPLE ROUTE</div>
            <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="mt-1">LAX to JFK</div>
            <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-1">Apr 18 · sample date</div>
            <span className="inline-flex mt-3 rounded-full px-3 py-1.5" style={{ background: "#EAF6EE", color: tokens.green, fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>Ready for travel</span>
          </div>
        </div>

        <TravelPassPreview />
      </main>

      <section className="w-full" style={{ background: tokens.navy }}>
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 text-center">
          <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.gold }}>ONE TRIP</div>
          <div style={{ fontFamily: font.display, fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1 }} className="mt-2">{P.pass}</div>
          <p style={{ fontFamily: font.body, fontSize: 17, lineHeight: 1.5, color: tokens.sky }} className="mt-3 mb-6 max-w-[36rem] mx-auto">
            Includes Pet Vault until 7 days after the trip. If you add a return date, that runs until 7 days after you fly back. Members add a Travel Pass for {P.memberPass}.
          </p>
          <a href="/assessment" className="btn-primary inline-flex items-center justify-center rounded-full px-8 py-4 w-full sm:w-auto min-h-[56px]" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 18, textDecoration: "none" }}>{PLAN_CTA}</a>
        </div>
      </section>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
        <TrustBadges />
      </div>
    </div>
  );
}
