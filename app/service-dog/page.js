import SiteHeader from "../../components/SiteHeader";
import Icon from "../../components/Icon";
import { TrackOnMount } from "../../components/Analytics";
import { PRICES as P } from "../../lib/pricing";
import { tokens, font } from "../../lib/theme";
import { DOT_AIR_FORM_PAGE } from "../../lib/dotFormLinks";

export const metadata = {
  title: "Flying with a service dog: what you need",
  description: "Your service dog flies in the cabin at no charge. Here's what U.S. airlines can ask for, the DOT form, and how PetPassGo fills it in for you.",
  alternates: { canonical: "/service-dog" },
};

const D = font.display;
const B = font.body;
const CTA = "/assessment?pet=service";

const NEED = [
  { icon: "award", title: "A dog trained to help you", body: "Your dog has to be individually trained to do work or tasks for a person with a disability. You can train the dog yourself, or a trainer can. Psychiatric service dogs count." },
  { icon: "file", title: "The DOT Service Animal Air Transportation Form", body: "The airline can ask you to fill in this U.S. Department of Transportation form, about your dog's training, health and behavior. You sign it yourself." },
  { icon: "clock", title: "The relief form for flights of 8 hours or more", body: "For long flights, the airline can also ask how your dog will relieve itself, or that it won't need to." },
  { icon: "check", title: "Your dog's basics", body: "Rabies vaccine, a harness, leash or tether at all times, and a dog that fits in your foot space or on your lap without blocking the aisle." },
];

const NOT = [
  "A certificate, registration or ID card. U.S. airlines can't require one.",
  "A doctor's letter. Airlines can't ask for one for a service dog.",
  "A pet fee or a carrier. A trained service dog flies in the cabin at no charge.",
];

const STEPS = [
  { n: "1", title: "Answer a few questions", body: "Your route, airline and dog. Free, and you get a straight answer for your trip." },
  { n: "2", title: "We fill in the DOT form", body: "Your name, your dog's details, your vet's rabies info and who trained the dog go into the official form for you." },
  { n: "3", title: "Check the boxes, sign, and fly", body: "Download the PDF, read and tick the sworn statements yourself, sign, and send it to your airline when they ask." },
];

export default function ServiceDogPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="landing" contentName="Service dog" />
      <main>
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 lg:pt-14 pb-10">
          <p style={{ fontFamily: B, fontSize: 15, fontWeight: 800, letterSpacing: "0.08em", color: tokens.primary }}>FLYING WITH A SERVICE DOG</p>
          <h1 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.05, textWrap: "balance" }} className="text-[36px] sm:text-[52px] mt-2 max-w-[48rem]">
            Your service dog flies with you, in the cabin, at no charge.
          </h1>
          <p style={{ fontFamily: B, fontSize: 19, lineHeight: 1.5, color: tokens.ink }} className="mt-4 max-w-[40rem]">
            Here's what U.S. airlines can actually ask for. Then let us fill in the official DOT form for your trip, ready to sign.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href={CTA} className="inline-flex items-center justify-center rounded-full px-8 min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Check my trip</a>
            <a href="#what-you-need" className="inline-flex items-center justify-center rounded-full px-6 min-h-[54px]" style={{ background: "#fff", color: tokens.navy, border: `1.5px solid ${tokens.line}`, fontFamily: B, fontWeight: 800, fontSize: 16, textDecoration: "none" }}>What you need</a>
          </div>
        </section>

        <section id="what-you-need" className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-12" style={{ scrollMarginTop: 80 }}>
          <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[30px] sm:text-[38px]">What you need</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {NEED.map((x) => (
              <div key={x.title} className="rounded-3xl p-5 flex gap-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <span className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 48, height: 48, background: "#E3F5F2", color: "#0F766E" }}><Icon name={x.icon} size={24} /></span>
                <div>
                  <div style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{x.title}</div>
                  <div className="mt-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{x.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl p-5 sm:p-6 mt-4" style={{ background: "#FFF8EB", border: "1px solid #F5D9A4" }}>
            <div style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>What you don't need</div>
            <ul className="mt-2 grid gap-2" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {NOT.map((t) => (
                <li key={t} className="flex gap-2" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>
                  <span style={{ color: tokens.green, marginTop: 3 }}><Icon name="check" size={16} /></span>{t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section style={{ background: "#fff", borderTop: `1px solid ${tokens.line}`, borderBottom: `1px solid ${tokens.line}` }}>
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
            <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[30px] sm:text-[38px]">How PetPassGo gets you ready</h2>
            <ol className="grid md:grid-cols-3 gap-3 mt-5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-3xl p-5" style={{ background: tokens.sky }}>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: tokens.navy, color: tokens.gold, fontFamily: D, fontWeight: 800, fontSize: 18 }}>{s.n}</span>
                  <div className="mt-3" style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{s.title}</div>
                  <div className="mt-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{s.body}</div>
                </li>
              ))}
            </ol>
            <p className="mt-5" style={{ fontFamily: B, fontSize: 15, lineHeight: 1.5, color: tokens.muted }}>
              Your Travel Pass also covers your airline's own steps and deadlines (some ask for the form up to 48 hours before you fly), your destination's entry rules, and a Pet ID for your dog. {P.pass} for one trip, or {P.memberPass} with Pet Vault.
            </p>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
          <h2 style={{ fontFamily: D, fontWeight: 800, color: tokens.navy }} className="text-[26px] sm:text-[32px]">Emotional support animals</h2>
          <p className="mt-2 max-w-[44rem]" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.55, color: tokens.ink }}>
            Since 2021, U.S. airlines treat emotional support animals as pets, so the pet rules and fees apply. If your dog is trained to perform a task for your disability, including psychiatric tasks, it's a service dog. If it isn't, it flies as a pet, and we'll show you exactly how.
          </p>
          <p className="mt-4 max-w-[44rem]" style={{ fontFamily: B, fontSize: 14, lineHeight: 1.5, color: tokens.muted }}>
            The DOT form is an official U.S. government document. You sign it yourself, and knowingly false statements can lead to fines and other penalties. Source: <a href={DOT_AIR_FORM_PAGE} target="_blank" rel="noopener" style={{ color: tokens.navy }}>U.S. Department of Transportation</a>.
          </p>
          <a href={CTA} className="inline-flex items-center justify-center rounded-full px-8 min-h-[54px] mt-6" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 17, textDecoration: "none" }}>Check my trip</a>
        </section>
      </main>
    </div>
  );
}
