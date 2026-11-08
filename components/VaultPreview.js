"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tokens, font } from "../lib/theme";
import { PetIllustration } from "./PetIdCard";
import SampleChip from "./SampleChip";
import Icon from "./Icon";

// A filled-in sample vault so visitors see what theirs will look like.
// Everything here is clearly labeled Sample; no real pet data is shown.

const SAMPLE = { name: "Biscuit", breed: "Golden Retriever", age: "3 yrs", weight: "62 lb", chip: "Microchip on file" };

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

function Stat({ label, value }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: tokens.sky }}>
      <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: tokens.muted }}>{label}</div>
      <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{value}</div>
    </div>
  );
}

export default function VaultPreview() {
  const [qr, setQr] = useState("");
  const [lost, setLost] = useState(false);

  useEffect(() => {
    QRCode.toDataURL("https://www.petpassgo.com/pet-vault", { width: 240, margin: 1, color: { dark: "#14213D", light: "#FFFFFF" } })
      .then(setQr)
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.10)" }}>
        <div style={{ background: tokens.navy }} className="px-5 py-3.5 flex items-center justify-between gap-3">
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17, color: "#fff" }}>PetPassGo · Pet ID</span>
          <SampleChip />
        </div>
        <div className="p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ border: `4px solid ${tokens.gold}` }}>
            <PetIllustration size={104} />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 24, color: tokens.navy }}>{SAMPLE.name}</div>
              <span className="rounded-full px-2.5 py-0.5" style={{ background: lost ? "#FDE8DC" : "#E5F3EA", color: lost ? tokens.primary : tokens.green, fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>
                {lost ? "Reported lost" : "Home safe"}
              </span>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{SAMPLE.breed} · Dog</div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Stat label="AGE" value={SAMPLE.age} />
              <Stat label="WEIGHT" value={SAMPLE.weight} />
              <Stat label="CHIP" value="On file" />
            </div>
          </div>
          <div className="flex flex-col items-center rounded-xl p-3 flex-shrink-0" style={{ border: `2px solid ${tokens.line}` }}>
            {qr ? (
              <img src={qr} alt="Sample QR code" width={96} height={96} className="rounded-md" />
            ) : (
              <div className="rounded-md ppg-shimmer" style={{ width: 96, height: 96 }} />
            )}
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", color: tokens.navy }} className="mt-2">SCAN IF FOUND</div>
          </div>
        </div>
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
