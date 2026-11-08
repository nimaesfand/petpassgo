"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tokens, font } from "../../lib/theme";
import { Wordmark } from "../Logo";
import Logo from "../Logo";
import { PetIllustration } from "../PetIdCard";
import Icon from "../Icon";

// Homepage section: My Pets, Pet ID and Discover. The pet shown is a sample
// (labeled as one). Discover shows as "coming soon" until the directory is live.
const DISCOVER_LIVE = process.env.NEXT_PUBLIC_DISCOVER_ENABLED === "true";

function Chip({ children, dark }) {
  return (
    <span className="rounded-full px-2.5 py-0.5" style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, background: dark ? "rgba(255,255,255,.14)" : tokens.gold, color: dark ? "#fff" : tokens.navy }}>{children}</span>
  );
}

function Card({ art, title, body, bullets, cta, href, badge }) {
  return (
    <div className="rounded-3xl overflow-hidden flex flex-col h-full ppg-lift" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="relative">{art}{badge ? <div className="absolute" style={{ top: 14, left: 14 }}>{badge}</div> : null}</div>
      <div className="p-6 flex flex-col gap-2.5 flex-1">
        <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy }}>{title}</div>
        <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{body}</p>
        <ul className="mt-1 flex flex-col gap-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2 items-start" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.ink }}>
              <span className="mt-0.5 shrink-0" style={{ color: tokens.green }}><Icon name="check" size={16} /></span>{b}
            </li>
          ))}
        </ul>
        {href ? (
          <a href={href} className="mt-auto pt-3" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.primary, textDecoration: "none" }}>{cta} →</a>
        ) : (
          <span className="mt-auto pt-3" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.muted }}>{cta}</span>
        )}
      </div>
    </div>
  );
}

function PassportArt() {
  return (
    <div className="flex items-center justify-center px-6 py-8" style={{ background: tokens.navy, minHeight: 250 }}>
      <div className="w-full max-w-[290px] rounded-2xl overflow-hidden" style={{ transform: "rotate(-3deg)", boxShadow: "0 18px 36px rgba(0,0,0,.35)" }}>
        <div className="flex items-center justify-between px-3.5 py-2.5" style={{ background: tokens.navyDeep }}>
          <Wordmark size={15} onDark />
          <span style={{ fontFamily: font.body, fontSize: 9, letterSpacing: "0.14em", fontWeight: 700, color: tokens.gold }}>PET PASSPORT</span>
        </div>
        <div style={{ height: 4, background: tokens.gold }} />
        <div className="ppg-guilloche-light relative flex gap-3 items-center p-3.5" style={{ background: "#FBF6EC" }}>
          <div className="rounded-lg flex items-end justify-center overflow-hidden shrink-0" style={{ width: 70, height: 84, background: "linear-gradient(160deg,#E9B872,#B87333)" }}>
            <PetIllustration type="Dog" size={66} />
          </div>
          <div style={{ fontFamily: font.body, fontSize: 11.5, lineHeight: 1.5, color: tokens.ink }}>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>Biscuit</div>
            Golden Retriever<br />3 yrs · 22 lb<br />Microchip on file
          </div>
          <div className="absolute flex items-center justify-center text-center rounded-full" style={{ right: 10, bottom: 8, width: 58, height: 58, border: `2.5px solid ${tokens.primary}`, color: tokens.primary, fontFamily: font.body, fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", transform: "rotate(-14deg)" }}>ISSUED<br />✓</div>
        </div>
      </div>
    </div>
  );
}

function PetIdArt() {
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toDataURL("https://www.petpassgo.com/pet-vault", { width: 220, margin: 1, color: { dark: "#14213D", light: "#FFFFFF" } }).then(setQr).catch(() => {});
  }, []);
  return (
    <div className="flex items-center justify-center gap-4 px-5 py-8" style={{ background: "#FDE8E2", minHeight: 250 }}>
      <div className="rounded-3xl p-3.5 text-center" style={{ width: 150, background: "#fff", boxShadow: "0 16px 32px rgba(20,33,61,.18)" }}>
        <div style={{ fontFamily: font.body, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: tokens.primary }}>SCAN IF FOUND</div>
        <div className="relative mx-auto my-2.5" style={{ width: 108, height: 108 }}>
          {qr ? <img src={qr} alt="Sample Pet ID QR code" width={108} height={108} /> : <div className="ppg-shimmer rounded-md" style={{ width: 108, height: 108 }} />}
          <span className="absolute rounded-md flex items-center justify-center" style={{ left: 38, top: 38, width: 32, height: 32, background: "#fff" }}><Logo size={26} /></span>
        </div>
        <div style={{ fontFamily: font.display, fontWeight: 800, color: tokens.navy }}>Biscuit</div>
      </div>
      <div className="rounded-2xl p-3" style={{ width: 150, background: "#fff", boxShadow: "0 12px 26px rgba(20,33,61,.14)", fontFamily: font.body, fontSize: 12, lineHeight: 1.45, color: tokens.ink }}>
        <div style={{ fontWeight: 800, color: tokens.navy, fontSize: 13 }}>Hi, I&apos;m Biscuit</div>
        My family is looking for me.
        <div className="mt-2.5 rounded-full py-1.5 text-center" style={{ background: tokens.primary, color: "#fff", fontWeight: 700 }}>Call my owner</div>
        <div className="mt-1.5 rounded-full py-1.5 text-center" style={{ border: `1.5px solid ${tokens.navy}`, color: tokens.navy, fontWeight: 700 }}>Share location</div>
      </div>
    </div>
  );
}

function DiscoverArt() {
  const Row = ({ icon, bg, title, sub, indent }) => (
    <div className="rounded-2xl flex gap-2.5 items-center px-3 py-2.5" style={{ background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,.18)", marginLeft: indent ? 18 : 0 }}>
      <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: bg, color: tokens.navy }}><Icon name={icon} size={20} /></span>
      <div style={{ fontFamily: font.body, fontSize: 12.5, lineHeight: 1.35, color: tokens.ink }}><b style={{ color: tokens.navy }}>{title}</b><br />{sub}</div>
    </div>
  );
  return (
    <div className="flex flex-col justify-end gap-2 p-5" style={{ minHeight: 250, background: "linear-gradient(180deg, rgba(20,33,61,.05), rgba(20,33,61,.5)), linear-gradient(135deg,#7FB3A3,#3E7C6B)" }}>
      <Row icon="pin" bg="#FDE8E2" title="Dog-friendly patio café" sub="Water bowls · near your hotel" />
      <Row icon="home" bg="#E7F0FF" title="Pet-friendly hotel" sub="Pet policy confirmed by the hotel" indent />
      <Row icon="stethoscope" bg="#E5F4EE" title="24-hour vet" sub="Close to the airport" />
    </div>
  );
}

export default function PetHub() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">
        <div className="max-w-[40rem]">
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", color: tokens.primary }}>BEYOND THE TRIP</div>
          <h2 style={{ fontFamily: font.display, color: tokens.navy, lineHeight: 1.08 }} className="text-[32px] md:text-[42px] font-bold mt-2">Your pet, all in one place.</h2>
          <p style={{ fontFamily: font.body, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="mt-3">A profile and passport for every pet, a QR tag that helps them get home, and pet-friendly places wherever you land.</p>
        </div>
        <a href="/pet-vault" className="ppg-btn ppg-btn-primary self-start lg:self-auto">Set up my pet&apos;s profile</a>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card
          art={<PassportArt />}
          badge={<Chip dark>Sample pet</Chip>}
          title="My Pets"
          body="Add each pet once. Fill in the details and their passport is issued, ready for every trip and vet visit."
          bullets={["Profile, photo, weight and microchip", "Records and vaccine reminders in Pet Vault"]}
          cta="Add my pet"
          href="/pet-vault"
        />
        <Card
          art={<PetIdArt />}
          title="Pet ID"
          body="A QR code for your pet's collar or carrier. Whoever finds your pet scans it and can reach you fast. No app needed."
          bullets={["You choose what a finder sees", "“Report lost” makes a flyer in one tap"]}
          cta="Get my pet's QR"
          href="/pet-vault#pet-id"
        />
        <Card
          art={<DiscoverArt />}
          badge={<Chip>{DISCOVER_LIVE ? "Sample listings" : "Coming soon"}</Chip>}
          title="Discover"
          body="Vets, sitters, hotels, cafés and parks that welcome pets, in the cities you fly to."
          bullets={["Details confirmed by the business, checked by PetPassGo", "Shown in your Travel Pass for your destination"]}
          cta={DISCOVER_LIVE ? "Explore pet-friendly places" : "Own a pet-friendly business? Get listed"}
          href={DISCOVER_LIVE ? "/discover" : "/contact?topic=business"}
        />
      </div>
    </div>
  );
}
