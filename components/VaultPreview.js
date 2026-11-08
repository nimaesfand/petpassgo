"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tokens, font } from "../lib/theme";
import { PetIllustration } from "./PetIdCard";
import SampleChip from "./SampleChip";
import PetPassport from "./PetPassport";
import PassportReveal from "./PassportReveal";
import Icon from "./Icon";
import { Wordmark } from "./Logo";

// A filled-in sample vault so visitors see what theirs will look like.
// Everything here is clearly labeled Sample; no real pet data is shown.

const SAMPLE_PET = { id: "sample", name: "Biscuit", animal_type: "Dog", breed: "Golden Retriever", date_of_birth: "2023-04-12", color: "Golden", handler_name: "Sample owner", passport_no: "PPG-4821-BSC", passport_issued_at: "2026-10-02T17:00:00Z" };

const DOCS = [
  { name: "Rabies vaccine", note: "Expires in 41 days", tone: "warn", icon: "health" },
  { name: "Health certificate", note: "Valid for your next trip", tone: "ok", icon: "file" },
  { name: "Vet visit summary", note: "Added Oct 2", tone: "muted", icon: "stethoscope" },
];

function toneColor(t) {
  if (t === "warn") return tokens.primary;
  if (t === "ok") return tokens.green;
  return tokens.muted;
}

export default function VaultPreview() {
  const [qr, setQr] = useState("");
  const [lost, setLost] = useState(false);
  const [demo, setDemo] = useState(null);

  useEffect(() => {
    QRCode.toDataURL("https://www.petpassgo.com/pet-vault", { width: 240, margin: 1, color: { dark: "#14213D", light: "#FFFFFF" } })
      .then(setQr)
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-4 relative">
        <div className="absolute z-10" style={{ left: 14, top: -10 }}><SampleChip /></div>
        <PetPassport
          pet={SAMPLE_PET}
          sample
          qr={qr ? <img src={qr} alt="Sample QR code" width={108} height={108} /> : <div className="ppg-shimmer rounded-md" style={{ width: 108, height: 108 }} />}
          chipValue="On file"
        />
        <button type="button" onClick={() => setDemo(new Date().toISOString())} className="ppg-btn ppg-btn-secondary mt-3">See a passport get issued</button>
        {demo ? <PassportReveal pet={SAMPLE_PET} issuedAt={demo} onClose={() => setDemo(null)} /> : null}
      </div>

      <div className="rounded-2xl p-4 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div className="flex items-center justify-between gap-3">
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }}>Messages from finders</div>
          <button
            type="button"
            onClick={() => setLost((v) => !v)}
            className="rounded-full px-4 py-2"
            style={{ border: `2px solid ${tokens.primary}`, color: lost ? "#fff" : tokens.primary, background: lost ? tokens.primary : "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            {lost ? "Mark found" : "Try: Report lost"}
          </button>
        </div>
        {lost ? (
          <div className="mt-3 rounded-xl p-3 ppg-rise" style={{ background: tokens.sky }}>
            <div className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.muted }}>
              <Icon name="message" size={16} /> New message · 2 min ago · near Riverside Park
            </div>
            <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }} className="mt-1">
              “Found a golden with a PetPassGo tag by the dog run. He's safe with me, reply here and I'll wait.”
            </p>
            <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }} className="mt-2">Your phone number and email stay hidden. You reply from your vault.</p>
          </div>
        ) : (
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mt-2">
            If your pet goes missing, tap Report lost. Anyone who scans the QR code can message you without seeing your phone number, and you get a printable flyer.
          </p>
        )}
      </div>

      <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18, color: tokens.navy }} className="mb-2">Documents and reminders</div>
        <ul className="flex flex-col gap-2">
          {DOCS.map((d) => (
            <li key={d.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: tokens.sky }}>
              <span style={{ color: tokens.navy }}><Icon name={d.icon} size={20} /></span>
              <span className="flex-1" style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 600, color: tokens.ink }}>{d.name}</span>
              <span style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: toneColor(d.tone) }}>{d.note}</span>
            </li>
          ))}
        </ul>
        <p style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.5, color: tokens.muted }} className="mt-3">
          We remind you before anything expires, like a rabies vaccine or a health certificate.
        </p>
      </div>
    </div>
  );
}
