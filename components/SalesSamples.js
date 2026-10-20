"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tokens, font } from "../lib/theme";

// Sales examples. EVERYTHING here is fictional and carries ONE clear EXAMPLE
// label per visual: Buddy, made-up route/listings, generic steps only.
// No real airline requirements, forms, deadlines or businesses pre-payment.

const badge = { fontFamily: font.mono, fontSize: 11, letterSpacing: "0.12em", color: tokens.navy, background: tokens.gold, borderRadius: 999, padding: "3px 10px", fontWeight: 700, whiteSpace: "nowrap", display: "inline-block" };
export const DEMO_QR_URL = "https://petpassgo.com/pet-vault#example";

// A REAL, scannable QR code (generated with the `qrcode` lib, same one the
// real Pet ID uses) encoding a harmless demo link. Crisp SVG, quiet zone kept.
export function ExampleQr({ size = 92 }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(DEMO_QR_URL, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: "#14213D", light: "#ffffff" } }).then(setSvg).catch(() => {});
  }, []);
  return (
    <div role="img" aria-label="Example QR code" className="flex-shrink-0" style={{ width: `min(${size}px, 24vw)`, height: `min(${size}px, 24vw)`, background: "#fff", borderRadius: 10, padding: 5, boxSizing: "border-box" }}>
      <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg width="100%" height="100%" style="display:block" ') }} />
    </div>
  );
}

export function SamplePetIdCard() {
  const [back, setBack] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setBack((b) => !b)} aria-pressed={back} className="w-full text-left rounded-3xl p-5 min-h-[44px]" style={{ background: tokens.navy, border: "none", cursor: "pointer", boxShadow: "0 18px 40px rgba(20,33,61,.28)" }}>
        {!back ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: "clamp(54px,17vw,72px)", height: "clamp(54px,17vw,72px)", background: tokens.gold, fontFamily: font.display, fontSize: 28, fontWeight: 700, color: tokens.navy }}>B</div>
            <div className="flex-1 min-w-0">
              <span style={badge}>EXAMPLE PET ID</span>
              <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: "#fff" }} className="mt-2">Buddy</div>
              <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, opacity: 0.9 }}>Dog · Mixed breed · Friendly, loves people</div>
              <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.gold }} className="mt-1">Tap to see what a finder sees →</div>
            </div>
            <ExampleQr size={92} />
          </div>
        ) : (
          <div>
            <span style={badge}>EXAMPLE — FINDER’S VIEW</span>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: "#fff" }} className="mt-3 mb-2">Found Buddy? You’re in the right place.</div>
            <ul style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, lineHeight: 1.7, paddingLeft: 18 }}>
              <li>Message Buddy’s owner right from this page — no phone number shown</li>
              <li>Buddy’s vet clinic is listed — chip details stay private</li>
              <li>Allergies &amp; meds shown only if the owner chose to share them</li>
            </ul>
            <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.gold }} className="mt-2">Tap to flip back →</div>
          </div>
        )}
      </button>
      <p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }} className="mt-2">Buddy is fictional — yours is generated for your pet when you join. This QR is real and scannable; it just opens this page.</p>
    </div>
  );
}

/* ---------- "See it in use" visual gallery (CSS phone/card mockups) ---------- */

function Phone({ title, children }) {
  return (
    <div>
      <div className="mx-auto rounded-[30px] p-2 pb-3" style={{ maxWidth: 270, background: tokens.navyDeep, boxShadow: "0 16px 34px rgba(20,33,61,.22)" }}>
        <div className="mx-auto rounded-full mb-2 mt-1" style={{ width: 54, height: 5, background: "rgba(255,255,255,.28)" }} />
        <div className="rounded-[22px] px-4 py-4 overflow-hidden" style={{ background: "#fff", minHeight: 308 }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.muted }}>{title}</span>
            <span style={{ ...badge, fontSize: 9.5, padding: "2px 7px" }}>EXAMPLE</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
const h3 = { fontFamily: font.display, fontSize: 16.5, fontWeight: 700, color: tokens.navy, lineHeight: 1.25 };
const txt = { fontFamily: font.body, fontSize: 13, color: tokens.muted, lineHeight: 1.5 };
const chip = (bg, c) => ({ fontFamily: font.body, fontSize: 11, fontWeight: 700, color: c, background: bg, borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" });
function GalleryItem({ title, caption, children }) {
  return (
    <figure className="rounded-3xl p-4 sm:p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}`, margin: 0 }}>
      {children}
      <figcaption className="text-center mt-4">
        <div style={h3}>{title}</div>
        <p style={txt} className="mt-1">{caption}</p>
      </figcaption>
    </figure>
  );
}
const Avatar = ({ size = 52 }) => (
  <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: tokens.gold, fontFamily: font.display, fontSize: size * 0.4, fontWeight: 700, color: tokens.navy }}>B</div>
);

export function VaultInUseGallery() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <GalleryItem title="A finder scans the QR" caption="They land here and message you through PetPassGo.">
        <Phone title="petpassgo.com/id/…">
          <div className="flex items-center gap-3 mb-3"><Avatar /><div><div style={h3}>Found Buddy?</div><div style={txt}>You’re in the right place.</div></div></div>
          <div className="rounded-xl px-3 py-2.5 mb-2" style={{ background: tokens.paper, ...txt, color: tokens.ink }}>Friendly, loves people. Please keep him safe — his owner is one tap away.</div>
          <div className="rounded-full text-center py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>Message Buddy’s owner</div>
          <div style={{ ...txt, fontSize: 12 }} className="text-center mt-2">No phone number shown</div>
        </Phone>
      </GalleryItem>

      <GalleryItem title="Lost-pet flyer, ready to print" caption="One tap from the Pet ID. Same QR, posted anywhere.">
        <div className="mx-auto rounded-2xl p-5 text-center" style={{ maxWidth: 270, background: "#fff", border: `2px dashed ${tokens.line}`, boxShadow: "0 12px 26px rgba(20,33,61,.10)", minHeight: 332 }}>
          <div className="flex justify-center mb-2"><span style={badge}>EXAMPLE</span></div>
          <div style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: "0.14em", color: tokens.primary, fontWeight: 700 }}>LOST DOG</div>
          <div className="flex justify-center my-3"><Avatar size={76} /></div>
          <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }}>Buddy</div>
          <div style={txt}>Mixed breed · Friendly, loves people<br />Last seen near Maple Park</div>
          <div className="flex justify-center my-3"><ExampleQr size={74} /></div>
          <div style={{ ...txt, fontWeight: 700, color: tokens.navy }}>Scan to message his owner</div>
        </div>
      </GalleryItem>

      <GalleryItem title="Microchip" caption="Chip, brand and registry — plus a yearly check that it still points to you.">
        <Phone title="Buddy · Microchip">
          <div style={txt}>Microchip</div>
          <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy, letterSpacing: "0.03em" }}>•••• •••• 0000</div>
          <div className="space-y-2 mt-3">
            {[["Brand & registry", "On file"], ["Registered to", "You ✓"], ["Last scanned check", "This year ✓"]].map(([a, b]) => (
              <div key={a} className="flex justify-between rounded-xl px-3 py-2.5" style={{ background: tokens.paper }}><span style={txt}>{a}</span><span style={{ ...txt, fontWeight: 700, color: tokens.green }}>{b}</span></div>
            ))}
          </div>
          <div className="rounded-xl px-3 py-2.5 mt-3" style={{ background: "#FFF7E6", ...txt, color: tokens.ink }}>🔔 Yearly reminder: ask the vet to scan the chip at Buddy’s next visit.</div>
        </Phone>
      </GalleryItem>

      <GalleryItem title="Health records" caption="Every document in one place, expiry dates watched for you.">
        <Phone title="Buddy · Documents">
          <div className="space-y-2">
            {[["Rabies certificate", "Expires in 8 mo", "#E7F4EC", tokens.green], ["Vaccination record", "Up to date", "#E7F4EC", tokens.green], ["Health certificate", "Add before a trip", "#FFF1F2", tokens.primary], ["Vet visit summary", "Imported ✓", tokens.sky, tokens.navy]].map(([a, b, bg, c]) => (
              <div key={a} className="flex items-center justify-between gap-2 rounded-xl px-3 py-3" style={{ background: tokens.paper }}>
                <span style={{ ...txt, color: tokens.ink, fontWeight: 600 }}>▣ {a}</span><span style={chip(bg, c)}>{b}</span>
              </div>
            ))}
          </div>
          <div style={txt} className="mt-3">Snap a photo of new paperwork — we read it in for your review.</div>
        </Phone>
      </GalleryItem>

      <GalleryItem title="Share card for vet or sitter" caption="Just what they need, for just as long as you choose.">
        <Phone title="Shared with Sitter Sam">
          <div className="flex items-center gap-3 mb-3"><Avatar size={44} /><div><div style={h3}>Buddy’s care card</div><div style={txt}>Link expires in 7 days</div></div></div>
          <div className="space-y-2">
            {[["Feeding", "1 cup, twice a day"], ["Medication", "None"], ["Vet clinic", "Listed with directions"], ["Emergencies", "Message owner button"]].map(([a, b]) => (
              <div key={a} className="rounded-xl px-3 py-2.5" style={{ background: tokens.paper }}><div style={{ ...txt, fontSize: 11.5, fontWeight: 700 }}>{a}</div><div style={{ ...txt, color: tokens.ink }}>{b}</div></div>
            ))}
          </div>
          <div style={{ ...txt, color: tokens.primary, fontWeight: 700 }} className="mt-3 text-center">Revoke anytime</div>
        </Phone>
      </GalleryItem>

      <GalleryItem title="Reminders before it’s urgent" caption="Expiries and deadlines land while there’s still time to act.">
        <Phone title="Today">
          <div className="space-y-2.5">
            {[["PetPassGo · now", "Rabies certificate expires in 30 days — book the vet while it’s easy."], ["PetPassGo · Tue", "Yearly chip check: ask the vet to scan Buddy’s chip."], ["PetPassGo · Trip", "Flying in 7 days — carrier check and documents, all in your pass."]].map(([a, b]) => (
              <div key={b} className="rounded-2xl px-3.5 py-3" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
                <div style={{ ...txt, fontSize: 11.5, fontWeight: 700 }}>{a}</div><div style={{ ...txt, color: tokens.ink }} className="mt-0.5">{b}</div>
              </div>
            ))}
          </div>
          <div className="rounded-full text-center py-3 mt-4" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>Open Buddy’s vault</div>
        </Phone>
      </GalleryItem>
    </div>
  );
}

/* ---------- Travel Pass example (unchanged structure, tightened copy) ---------- */

const SAMPLE_TABS = [["checklist", "Checklist"], ["flight", "Flight"], ["weather", "Weather & spots"], ["reminders", "Timeline"]];

export function SampleTravelPass() {
  const [tab, setTab] = useState("checklist");
  const row = (title, meta, done) => (
    <li key={title} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
      <span style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>{done ? "✓ " : ""}{title}</span>
      <span style={{ fontFamily: font.mono, fontSize: 11, color: tokens.stamp, whiteSpace: "nowrap" }}>{meta}</span>
    </li>
  );
  return (
    <div className="rounded-3xl p-5 sm:p-6" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <span style={badge}>EXAMPLE TRAVEL PASS</span>
        <span style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Buddy’s trip</span>
      </div>
      <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mb-4">Made-up details so you can see everything inside. Your pass is built for your real trip — airline-specific steps stay locked until you unlock.</p>
      <div role="tablist" aria-label="Example Travel Pass sections" className="flex flex-wrap gap-1 mb-4 p-1 rounded-full" style={{ background: tokens.sky }}>
        {SAMPLE_TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="rounded-full px-4 py-2 min-h-[40px]" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, background: tab === k ? tokens.navy : "transparent", color: tab === k ? "#fff" : tokens.ink, border: "none", cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      {tab === "checklist" && (
        <ul className="space-y-2">
          {row("Reserve your pet’s spot with the airline", "30 DAYS BEFORE", true)}
          {row("Vet visit & health documents in the vault", "2 WEEKS BEFORE", false)}
          {row("Check the carrier fits and is airline-approved size", "1 WEEK BEFORE", false)}
          {row("Pack documents, food and a familiar blanket", "DAY BEFORE", false)}
        </ul>
      )}
      {tab === "flight" && (
        <div className="rounded-2xl p-4" style={{ background: tokens.navy }}>
          <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.gold, letterSpacing: "0.1em" }}>LIVE FLIGHT</div>
          <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: "#fff" }} className="mt-1">Flight XX123 · On time</div>
          <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky }}>Departs 9:05 AM · Terminal A · Gate 7 → Arrives 12:40 PM</div>
          <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.sky, opacity: 0.8 }} className="mt-1">On your real pass this updates live, with delays, terminal and gate.</div>
        </div>
      )}
      {tab === "weather" && (
        <div>
          <div className="flex gap-3 flex-wrap mb-3">
            {[["DEPART", "72° / 54°F", "Mild — good flying weather"], ["ARRIVE", "85° / 66°F", "Warm — keep water handy"]].map(([l, t, s]) => (
              <div key={l} className="rounded-xl p-4 flex-1 min-w-[150px]" style={{ background: tokens.sky }}>
                <div style={{ fontFamily: font.mono, fontSize: 11, color: tokens.muted }}>{l}</div>
                <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy }}>{t}</div>
                <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink }}>{s}</div>
              </div>
            ))}
          </div>
          <ul className="space-y-2">
            {row("Pet relief areas, before and after security", "MAPPED", false)}
            {row("Veterinary clinic — near your arrival airport", "NEARBY", false)}
            {row("Dog park & pet store nearby", "NEARBY", false)}
          </ul>
          <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-2">We also check your airline’s checked-pet temperature rules for you when a forecast runs hot or cold.</p>
        </div>
      )}
      {tab === "reminders" && (
        <ul className="space-y-2">
          {row("30 days before — start documents", "ON YOUR TIMELINE", false)}
          {row("7 days before — confirm reservations & carrier", "ON YOUR TIMELINE", false)}
          {row("1 day before — pack & print copies", "ON YOUR TIMELINE", false)}
          {row("Flight day — live flight, documents and Pet ID on one screen", "FLIGHT DAY", false)}
        </ul>
      )}
    </div>
  );
}
