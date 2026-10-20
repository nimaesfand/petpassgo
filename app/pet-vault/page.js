import SiteHeader from "../../components/SiteHeader";
import { TrackOnMount } from "../../components/Analytics";

import Logo from "../../components/Logo";
import { SamplePetIdCard, VaultInUseGallery } from "../../components/SalesSamples";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";

// The gallery above shows most features in use; these three don't photograph well.
const FEATURES = [
  ["Smart vet import", "Snap a photo of vet paperwork and we read it into the record for you to review — nothing saved without your OK."],
  ["Unlimited pets", "One membership covers every pet in the house, each with their own ID, chip vault and documents."],
  ["Private by default", "Your pet’s info is private — only people you share with can see it. Finders message you through PetPassGo; your email and phone stay hidden unless you choose to show an emergency contact."],
  ["Digital, ready instantly", "Your pet’s ID lives on your phone — no waiting for a printed card in the mail."],
];

export default function PetVaultPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="pet_vault" contentName="Pet Vault" />
      <main className="max-w-[980px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo size={44} /></div>
          <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.1 }} className="text-[32px] lg:text-[44px]">The Pet Vault</h1>
          <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.muted }} className="mt-3 max-w-[560px] mx-auto">Your pet’s ID, chip and vet records — safe in one place, and working for you if you’re ever separated. Tap the ID to see how it works.</p>
        </div>

        <div className="max-w-[640px] mx-auto mb-4"><SamplePetIdCard /></div>
        <div className="max-w-[640px] mx-auto mb-10 rounded-2xl p-4 flex items-center gap-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div className="flex-1">
            <div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy, fontSize: 15 }}>Setting up Buddy’s vault <span style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: "0.1em", background: tokens.gold, borderRadius: 999, padding: "2px 8px", marginLeft: 6 }}>EXAMPLE</span></div>
            <div className="w-full h-[8px] rounded-full mt-2" style={{ background: tokens.line }}><div className="h-full rounded-full" style={{ width: "80%", background: tokens.green }} /></div>
          </div>
          <div style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy }}>80%</div>
        </div>

        <div className="text-center mb-6">
          <h2 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.15 }} className="text-[26px] lg:text-[32px]">See it in use</h2>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="mt-2">This is Buddy’s vault, doing its jobs. Yours looks like this — with your pet in it.</p>
        </div>
        <div className="mb-10"><VaultInUseGallery /></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {FEATURES.map(([t, b]) => (
            <div key={t} className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: font.display, fontSize: 17.5, fontWeight: 700, color: tokens.navy }} className="mb-1.5">{t}</div>
              <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted, lineHeight: 1.55 }}>{b}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-7 sm:p-9 text-center" style={{ background: tokens.navy }}>
          <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold, letterSpacing: "0.12em" }} className="mb-2">MEMBERSHIP</div>
          <div style={{ fontFamily: font.display, fontSize: 34, fontWeight: 700, color: "#fff" }}>{P.member}<span style={{ fontSize: 16, fontWeight: 500, opacity: 0.8 }}>/month</span></div>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.sky }} className="mt-2 mb-7 max-w-[480px] mx-auto">Pet Vault, Digital Pet ID & QR, lost-pet alerts, community and reminders — plus every future Travel Pass at {P.memberPass} instead of {P.pass}. Monthly, cancel anytime.</p>
          <a href="/join" className="btn-primary rounded-full px-8 py-4 inline-block min-h-[48px]" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Join Membership — {P.member}/mo</a>
          <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.sky }} className="mt-4">Next: create your account, confirm your email, then secure checkout. No charge until then.</p>
          <div className="mt-3"><a href="/account?tab=vault" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, textDecoration: "underline" }}>Already a member? Open your vault →</a></div>
        </div>
      </main>
    </div>
  );
}
