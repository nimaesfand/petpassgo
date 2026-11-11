"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { tokens, font } from "../../lib/theme";
import Icon from "../Icon";
import { PetIllustration } from "../PetIdCard";
import { Wordmark } from "../Logo";

// Homepage Pet Vault: every tile opens a quick example with Biscuit, our sample pup,
// so people see exactly what they get before signing up.

function Badge({ tone, children }) {
  const look = { ok: ["#E8F6EC", tokens.green], soon: ["#FEF3C7", "#92400E"], late: ["#FDECEC", "#B91C1C"] }[tone];
  return <span className="inline-flex rounded-full px-2.5 py-1" style={{ background: look[0], color: look[1], fontFamily: font.body, fontSize: 12.5, fontWeight: 800 }}>{children}</span>;
}

function Row({ emoji, title, sub, badge }) {
  return (
    <div className="rounded-2xl p-3 flex gap-3 items-start" style={{ background: tokens.sky }}>
      <span aria-hidden="true" className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: "#fff", fontSize: 19 }}>{emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>{title}</div>
          {badge}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{sub}</div>
      </div>
    </div>
  );
}

function IdCard() {
  const [back, setBack] = useState(false);
  const [qr, setQr] = useState("");
  useEffect(() => { QRCode.toDataURL("https://www.petpassgo.com/pet-vault", { width: 220, margin: 1 }).then(setQr).catch(() => {}); }, []);
  return (
    <button type="button" onClick={() => setBack((b) => !b)} className="w-full text-left" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }} aria-label="Flip the sample ID card">
      {!back ? (
        <div className="relative overflow-hidden rounded-[20px] p-4" style={{ background: "linear-gradient(135deg, #0F766E 0%, #115E59 45%, #14213D 100%)", color: "#fff" }}>
          <div className="flex items-center justify-between"><Wordmark size={16} onDark /><span className="rounded-full px-2 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 10, letterSpacing: ".14em" }}>PET ID</span></div>
          <div className="flex gap-3 mt-3 items-center">
            <div className="rounded-2xl overflow-hidden flex items-center justify-center" style={{ width: 76, height: 90, border: `3px solid ${tokens.gold}`, background: "#FDE7C3" }}><PetIllustration type="Dog" size={66} /></div>
            <div>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 26, lineHeight: 1 }}>Biscuit</div>
              <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, opacity: 0.9 }}>Dachshund · 18 lb</div>
              <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, marginTop: 6 }}>PPG-000-0001</div>
            </div>
          </div>
          <div className="mt-3 text-right" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, opacity: 0.85 }}>Tap to flip ⟲</div>
        </div>
      ) : (
        <div className="rounded-[20px] p-4 flex items-center gap-4" style={{ background: tokens.navy, color: "#fff" }}>
          <div className="rounded-xl p-1.5 flex-shrink-0" style={{ background: "#fff" }}>{qr ? <img src={qr} alt="" width={96} height={96} /> : <div style={{ width: 96, height: 96 }} />}</div>
          <div>
            <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 12, letterSpacing: ".14em", color: tokens.gold }}>SCAN IF FOUND</div>
            <div className="mt-1" style={{ fontFamily: font.body, fontSize: 14.5, lineHeight: 1.4 }}>A finder scans it and messages you. Your number stays private.</div>
          </div>
        </div>
      )}
    </button>
  );
}

const TILES = [
  {
    key: "vax", icon: "health", label: "Vaccination records", tint: "#EAF6EE", ink: tokens.green,
    title: "Biscuit's vaccines",
    body: () => (
      <div className="grid gap-2">
        <Row emoji="💉" title="Rabies" sub="Given May 1, 2025 · Sample Vet Clinic" badge={<Badge tone="ok">Good to May 2028</Badge>} />
        <Row emoji="💉" title="DHPP" sub="Given Dec 1, 2025" badge={<Badge tone="soon">Expires in 23 days</Badge>} />
        <Row emoji="💉" title="Bordetella" sub="Given Oct 3, 2025" badge={<Badge tone="late">Expired</Badge>} />
        <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }} className="mt-1">We email you before anything expires, so you're never caught out at the airport or the groomer.</p>
      </div>
    ),
  },
  {
    key: "health", icon: "file", label: "Health records", tint: tokens.sky, ink: tokens.navy,
    title: "Biscuit's health",
    body: () => (
      <div className="grid gap-2">
        <Row emoji="⚠️" title="Allergies" sub="Chicken" />
        <Row emoji="⚖️" title="Weight" sub="18 lb · logged monthly" badge={<Badge tone="ok">Steady</Badge>} />
        <Row emoji="🔖" title="Microchip" sub="•••• 6789 · registered" />
        <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }} className="mt-1">Everything a sitter, boarder or new vet asks for, in one place.</p>
      </div>
    ),
  },
  {
    key: "vet", icon: "stethoscope", label: "Vet records", tint: "#FDE8E2", ink: tokens.primary,
    title: "Snap it, we fill it in",
    body: () => (
      <div className="grid gap-2">
        <div className="rounded-2xl p-4 text-center" style={{ border: `2px dashed ${tokens.primary}`, background: "#FFF7F2" }}>
          <div style={{ fontSize: 30 }} aria-hidden="true">📄📸</div>
          <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }} className="mt-1">Take a photo of your vet papers</div>
          <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>We read the vaccines and dates and add them for you. You check before saving.</div>
        </div>
        <Row emoji="🏥" title="Sample Vet Clinic" sub="Last visit Oct 2, 2026 · (555) 0199" />
      </div>
    ),
  },
  {
    key: "remind", icon: "clock", label: "Reminders", tint: "#FFF7E6", ink: "#8A5A12",
    title: "Reminders that actually help",
    body: () => (
      <div className="grid gap-2">
        {[["now", "Biscuit's DHPP vaccine expires in 30 days. Book a vet visit."], ["8 weeks out", "Hawaii trip: start the rabies blood test now. Lab results take 6 to 8 weeks."], ["2 days out", "Pack Biscuit's health certificate and carrier. Check-in opens tomorrow."]].map(([when, text]) => (
          <div key={when} className="rounded-2xl p-3 flex gap-3" style={{ background: "rgba(20,33,61,0.05)" }}>
            <span className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 34, height: 34, background: tokens.navy, color: tokens.gold, fontFamily: font.display, fontWeight: 800 }}>Go</span>
            <div className="min-w-0">
              <div className="flex justify-between gap-2" style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 800, color: tokens.muted }}><span>PETPASSGO</span><span>{when}</span></div>
              <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.navy, lineHeight: 1.35 }}>{text}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

function Sheet({ tile, onClose }) {
  const [host, setHost] = useState(null);
  useEffect(() => {
    setHost(document.body);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!host || !tile) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={tile.title} className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center" style={{ background: "rgba(11,20,40,0.55)" }} onClick={onClose}>
      <div className="ppg-rise w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 800, letterSpacing: ".12em", color: tokens.primary }}>EXAMPLE</div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 22, color: tokens.navy }}>{tile.title}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 40, height: 40, background: tokens.sky, color: tokens.navy, border: "none", cursor: "pointer" }}><Icon name="x" size={18} /></button>
        </div>
        {tile.body()}
        <a href="/join" className="mt-4 inline-flex w-full items-center justify-center rounded-full min-h-[50px]" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 800, fontSize: 16, textDecoration: "none" }}>Start your Pet Vault</a>
      </div>
    </div>,
    host
  );
}

export default function VaultCluster() {
  const [open, setOpen] = useState(null);
  const idTile = { key: "id", title: "Biscuit's Pet ID", body: () => (<div className="grid gap-3"><IdCard /><p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>Show it at the counter, put the QR on a collar tag, or share a link with a sitter.</p></div>) };
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => (
          <button key={tile.key} type="button" onClick={() => setOpen(tile)} className="ppg-lift rounded-2xl p-3.5 flex items-center gap-3 min-h-[72px] text-left" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 8px 20px rgba(20,33,61,0.05)", cursor: "pointer" }}>
            <span aria-hidden="true" className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: tile.tint, color: tile.ink }}>
              <Icon name={tile.icon} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: tokens.navy }}>{tile.label}</span>
              <span className="block" style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.primary }}>See example →</span>
            </span>
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setOpen(idTile)} className="ppg-lift mt-3 w-full text-left rounded-2xl p-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #0F766E 0%, #14213D 100%)", border: "none", cursor: "pointer", boxShadow: "0 12px 28px rgba(20,33,61,0.15)" }}>
        <div className="rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 70, height: 82, border: `3px solid ${tokens.gold}`, background: "#FDE7C3" }}><PetIllustration type="Dog" size={60} /></div>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 800, letterSpacing: ".14em", color: tokens.gold }}>PET ID · SAMPLE</div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 24, color: "#fff", lineHeight: 1.1 }}>Biscuit</div>
          <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.sky }}>Dachshund · tap to see the QR side</div>
        </div>
        <Icon name="passport" size={26} />
      </button>
      {open ? <Sheet tile={open} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
