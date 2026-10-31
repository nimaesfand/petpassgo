import { tokens, font } from "../../lib/theme";
import { PRICES as P } from "../../lib/pricing";
import { VAULT_NAME } from "../../lib/travelPassOffer";
import PlanTripButton from "./PlanTripButton";

const PASS_INCLUDED = [
  "Airline requirements for your trip",
  "Step-by-step checklist with due dates and progress",
  "Will your pet fit?",
  "Live weather at both airports, plus cargo heat and cold warnings",
  "Vets and pet stores near you",
  "Flight status, documents, and Digital Pet ID",
  "Email support at support@petpassgo.com",
];

const VAULT_INCLUDED = [
  "Digital Pet ID with a QR code",
  "Lost pet help with a flyer and private finder messages",
  "Vaccination, health and vet records in one place",
  "Reminders before anything expires",
  "Members-only community boards",
  "Unlimited pets",
];

function Checks({ items, color }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.4, color }}>
          <span aria-hidden="true" style={{ color: tokens.green, fontWeight: 800, lineHeight: 1.4 }}>✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HomePricing() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch">
      <article data-testid="home-price-pass" className="rounded-3xl p-6 sm:p-7 flex flex-col h-full" style={{ background: "#fff", color: tokens.navy }}>
        <h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 28, lineHeight: 1.15 }} className="mb-4">One trip. Everything included.</h3>
        <div className="flex-1">
          <Checks items={PASS_INCLUDED} color={tokens.ink} />
        </div>
        <div className="flex items-baseline gap-x-2 gap-y-1 flex-wrap mt-6">
          <span data-testid="pass-price" style={{ fontFamily: font.display, fontSize: 48, fontWeight: 700, lineHeight: 1 }}>{P.pass}</span>
          <span style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.3, color: tokens.muted }}>one trip</span>
        </div>
        <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, fontWeight: 600 }} className="mt-2 mb-5">Includes Pet Vault until 7 days after your trip.</p>
        <PlanTripButton full />
      </article>

      <article data-testid="home-price-vault" className="rounded-3xl p-6 sm:p-7 flex flex-col h-full" style={{ background: "#fff", color: tokens.navy }}>
        <h3 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 28, lineHeight: 1.15 }} className="mb-4">{VAULT_NAME}</h3>
        <div className="flex-1">
          <Checks items={VAULT_INCLUDED} color={tokens.ink} />
        </div>
        <div className="flex items-baseline gap-x-2 gap-y-1 flex-wrap mt-6">
          <span data-testid="vault-price" style={{ fontFamily: font.display, fontSize: 48, fontWeight: 700, lineHeight: 1 }}>{P.member}</span>
          <span style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.3, color: tokens.muted }}>/mo</span>
        </div>
        <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, fontWeight: 600 }} className="mt-2 mb-5">Members can add a Travel Pass for {P.memberPass} per trip.</p>
        <a href="/join" className="home-navy-btn mt-auto flex items-center justify-center rounded-full px-4 py-3.5 text-center min-h-[52px] w-full" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.25, textDecoration: "none" }}>Create your Pet Vault</a>
      </article>
    </div>
  );
}
