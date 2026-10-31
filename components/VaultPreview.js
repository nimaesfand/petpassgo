"use client";

import { tokens, font } from "../lib/theme";
import { PetIllustration } from "./PetIdCard";
import MaskedLine from "./MaskedLine";

function Section({ title, hint, children, open = false }) {
  return (
    <details open={open} className="group" style={{ borderBottom: `1px solid ${tokens.line}`, background: "#fff" }}>
      <summary className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ cursor: "pointer", listStyle: "none", fontFamily: font.body }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: tokens.navy }}>{title}</span>
        <span className="flex items-center gap-2">
          {hint ? <span style={{ fontSize: 15, color: tokens.muted }}>{hint}</span> : null}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export default function VaultPreview() {
  return (
    <div>
      <style>{`summary::-webkit-details-marker { display: none; }`}</style>
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.10)" }}>
        <div style={{ background: tokens.navy }} className="px-5 py-3.5 flex items-center justify-between gap-3">
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: "#fff" }}>PetPassGo</span>
          <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: tokens.gold }}>SAMPLE</span>
        </div>
        <div className="p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ border: `4px solid ${tokens.gold}` }}>
            <PetIllustration size={104} />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: tokens.muted }}>NAME</div>
            <div className="mt-2"><MaskedLine label="Pet name, after you add a pet" width="140px" /></div>
            <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-3">
              The Pet ID shows the name, photo, and a QR code. Someone who scans it opens that pet’s public page.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl p-3 flex-shrink-0" style={{ border: `2px dashed ${tokens.line}` }}>
            <div role="img" aria-label="QR code, after you add a pet" className="rounded-md" style={{ width: 96, height: 96, background: tokens.sky }} />
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, letterSpacing: "0.06em", color: tokens.navy }} className="mt-2">SCAN IF FOUND</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }}>Messages from finders</div>
        <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-2">
          None yet. After you tap Report lost, messages sent from the public page come to you. Your email and phone stay hidden unless you choose to show an emergency contact.
        </p>
      </div>

      <div className="rounded-full px-5 py-3 text-center mb-2" style={{ border: `2px solid ${tokens.primary}`, color: tokens.primary, fontFamily: font.body, fontWeight: 700, fontSize: 16 }} aria-hidden="true">
        Report lost
      </div>
      <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mb-4">
        In your vault, Report lost opens the lost-pet flyer. You confirm it, then you can print it and share it.
      </p>

      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${tokens.line}` }}>
        <Section title="Documents" hint="None yet" open>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>None yet. Keep vaccination records, health records and vet records ready whenever you need them.</p>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-2">We'll remind you before something expires, like a rabies vaccine or a health certificate, so you're never caught off guard.</p>
        </Section>
        <Section title="Pet ID page" hint="After you add a pet">
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>The public page is the one a finder sees from the QR code. It is created for your pet, not shown here.</p>
        </Section>
      </div>
    </div>
  );
}
