import SiteHeader from "../../../components/SiteHeader";
import Icon from "../../../components/Icon";
import { TrackOnMount } from "../../../components/Analytics";
import { tokens, font } from "../../../lib/theme";
import { PRICES as P } from "../../../lib/pricing";
import { DOT_AIR_FORM_PAGE } from "../../../lib/dotFormLinks";

export const metadata = {
  title: "How to fill out the DOT Service Animal Air Transportation Form",
  description: "A plain guide to the free U.S. DOT service animal form: what each section asks, when your airline can ask for it, and the mistakes that cause problems at the gate.",
  alternates: { canonical: "/service-dog/dot-form" },
};

const D = font.display;
const B = font.body;
const BLUE = "#1D4ED8";

const WHEN = [
  ["Once per trip", "An airline can ask for the form once per trip, not before every flight. A round-trip ticket counts as one trip."],
  ["Up to 48 hours ahead", "If you booked more than 48 hours before departure, your airline can ask you to send it up to 48 hours before you fly."],
  ["At the gate if you booked late", "Booked within 48 hours of the flight? The airline has to let you hand it in at the gate on the day you travel."],
  ["Paper or electronic", "When it's due ahead of time, the airline must accept either a paper or an electronic copy."],
];

const SECTIONS = [
  ["A", "Service animal handler", ["Your full name, phone and email, so the airline can reach you about the form.", "The handler is the person with the disability, or someone traveling with them, like a parent of a child or a caregiver.", "Check the box that a service animal must travel with you."]],
  ["B", "The dog and its health", ["Your dog's name, and a description with its weight and color. The airline uses this to recognize your dog.", "Check the box that your dog has no fleas, ticks or contagious disease, and is vaccinated for rabies.", "Write the date the rabies vaccine expires (mm/dd/yyyy). It's on the rabies certificate. Use the expiry date, not the date of the shot.", "Your vet's name and phone. No vet signature is needed."]],
  ["C", "Task training", ["Check the box that your dog is individually trained to do a task for a disability.", "Write who trained it and their phone. If you trained your dog yourself, write your own name."]],
  ["D", "Behavior training", ["Check the box that your dog is trained to behave in public, and write who trained it.", "Read and check the box about keeping your dog under control. An airline can treat a dog that misbehaves as a pet.", "Check the box that your dog hasn't been aggressive or hurt anyone, or explain why you can't."]],
  ["E", "Other assurances, signature and date", ["Read and check the last box: your dog stays leashed or harnessed, you may pay for damage, and false statements can lead to fines.", "Sign and date the form."]],
];

const MISTAKES = [
  "Writing the date of the rabies shot instead of the date it expires",
  "Forgetting to sign and date it",
  "Sending it to the Department of Transportation. It goes to your airline, never to DOT.",
  "Waiting until the airport when the airline asked for it 48 hours ahead",
  "Using it for an emotional support animal or a dog in training. On U.S. flights, those fly as pets.",
];

export default function DotFormGuide() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <TrackOnMount contentType="guide" contentName="DOT form guide" />
      <main className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "#E0E7FF", color: BLUE, fontFamily: B, fontWeight: 800, fontSize: 14 }}><Icon name="file" size={16} /> Free guide</span>
        <h1 className="mt-4" style={{ fontFamily: D, fontWeight: 800, color: tokens.navy, lineHeight: 1.05, letterSpacing: "-0.01em", textWrap: "balance" }}>
          <span className="block text-[34px] sm:text-[48px]">How to fill out the DOT Service Animal form</span>
        </h1>
        <p className="mt-4" style={{ fontFamily: B, fontSize: 18.5, lineHeight: 1.55, color: tokens.ink }}>
          U.S. airlines can ask you for the Department of Transportation&apos;s Service Animal Air Transportation Form before you fly with a service dog. It&apos;s free, it&apos;s one page to fill in, and you send it to your airline. Here&apos;s what each section asks, in plain words.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href={DOT_AIR_FORM_PAGE} target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-full px-7 min-h-[54px]" style={{ background: tokens.navy, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>Get the free form from DOT</a>
          <a href="#filled-in" className="inline-flex items-center justify-center rounded-full px-7 min-h-[54px]" style={{ background: "#fff", color: tokens.navy, border: `1.5px solid ${tokens.line}`, fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>Have it filled in for you</a>
        </div>

        <h2 className="mt-12" style={{ fontFamily: D, fontWeight: 800, fontSize: 30, color: tokens.navy }}>When your airline can ask for it</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          {WHEN.map(([t, b]) => (
            <div key={t} className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div style={{ fontFamily: B, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{t}</div>
              <p className="mt-1" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{b}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12" style={{ fontFamily: D, fontWeight: 800, fontSize: 30, color: tokens.navy }}>Section by section</h2>
        <ol className="mt-5 grid gap-4" style={{ listStyle: "none", padding: 0 }}>
          {SECTIONS.map(([letter, title, lines]) => (
            <li key={letter} className="rounded-2xl p-5 flex gap-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <span className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: tokens.navy, color: tokens.gold, fontFamily: D, fontWeight: 800, fontSize: 18 }}>{letter}</span>
              <div className="min-w-0">
                <div style={{ fontFamily: B, fontWeight: 800, fontSize: 19, color: tokens.navy }}>{title}</div>
                <ul className="mt-2 grid gap-1.5" style={{ paddingLeft: 18, margin: 0 }}>
                  {lines.map((l) => <li key={l} style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{l}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-12" style={{ fontFamily: D, fontWeight: 800, fontSize: 30, color: tokens.navy }}>Mistakes that cause trouble at the gate</h2>
        <ul className="mt-4 grid gap-2" style={{ listStyle: "none", padding: 0 }}>
          {MISTAKES.map((m) => (
            <li key={m} className="flex gap-3" style={{ fontFamily: B, fontSize: 16.5, lineHeight: 1.5, color: tokens.ink }}>
              <span aria-hidden="true" style={{ color: tokens.primary, fontWeight: 900 }}>✕</span>{m}
            </li>
          ))}
        </ul>
        <p className="mt-5" style={{ fontFamily: B, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>
          <b style={{ color: tokens.navy }}>Flying 8 hours or longer?</b> Your airline can also ask for a second DOT form, the Relief Attestation, saying your dog won&apos;t need to relieve itself on the flight or can do so in a way that avoids health or sanitation issues. Your Travel Pass includes it, filled in for your flight.
        </p>

        <section id="filled-in" className="mt-12 rounded-3xl p-6 sm:p-8" style={{ background: tokens.navy, color: "#fff", scrollMarginTop: 80 }}>
          <h2 style={{ fontFamily: D, fontWeight: 800, fontSize: 28, lineHeight: 1.15 }}>Rather have it filled in for you?</h2>
          <p className="mt-3" style={{ fontFamily: B, fontSize: 17, lineHeight: 1.55, color: "#D5DEEB" }}>
            Make your dog&apos;s passport and sign the service dog statement. With Pet Vault ({P.member} a month), we fill in the DOT form from the passport for every trip: your details, your dog, your vet, the trainer and the rabies date. You check each box and sign it yourself, and a photo of the signed form shows in Gate Ready at the airport.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="/passport/create" className="inline-flex items-center justify-center rounded-full px-7 min-h-[54px]" style={{ background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>Make my dog&apos;s passport</a>
            <a href="/service-dog-kit" className="inline-flex items-center justify-center rounded-full px-7 min-h-[54px]" style={{ color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>See the Service Dog Travel Kit</a>
          </div>
        </section>

        <p className="mt-8" style={{ fontFamily: B, fontSize: 14.5, lineHeight: 1.5, color: tokens.muted }}>
          Source: the form and its instructions from the <a href={DOT_AIR_FORM_PAGE} target="_blank" rel="noopener" style={{ color: tokens.navy, fontWeight: 700 }}>U.S. Department of Transportation</a>. PetPassGo doesn&apos;t certify or register service dogs. Knowingly false statements on the form can lead to fines and other penalties.
        </p>
      </main>
    </div>
  );
}
