"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import Logo, { Wordmark } from "./Logo";
import Icon from "./Icon";
import { LOGIN_CTA, PLAN_CTA } from "../lib/cta";
import { readHomeIntentHref } from "../lib/tripIntent";

const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true";
const DISCOVER = process.env.NEXT_PUBLIC_DISCOVER_ENABLED === "true";

// "Get started" offers the two doors into PetPassGo. Both end in the same Pet Vault.
function GetStarted({ style }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const opt = (href, title, sub, icon) => (
    <a href={href} onClick={href === "/assessment" ? (e) => { const h = readHomeIntentHref(); if (h !== "/assessment") { e.preventDefault(); window.location.href = h; } } : undefined}
      className="flex items-center gap-3 rounded-2xl p-4 ppg-lift" style={{ background: "#fff", border: `1.5px solid ${tokens.line}`, textDecoration: "none" }}>
      <span className="flex-shrink-0 flex items-center justify-center rounded-2xl" style={{ width: 46, height: 46, background: "#FFF4EC", color: tokens.primary }}><Icon name={icon} size={22} /></span>
      <span className="min-w-0">
        <span className="block" style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>{title}</span>
        <span className="block mt-0.5" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted, lineHeight: 1.4 }}>{sub}</span>
      </span>
    </a>
  );
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="btn-primary rounded-full px-3 sm:px-5 py-2" style={{ ...style, border: "none", cursor: "pointer" }}>Get started</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Get started" className="fixed inset-0 z-[80] flex items-start justify-center px-4" style={{ background: "rgba(20,33,61,.45)", paddingTop: 76 }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-[440px] rounded-3xl p-4 sm:p-5 ppg-menu-sheet" style={{ background: tokens.sky, boxShadow: "0 24px 60px rgba(20,33,61,.3)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 mb-3 px-1">
              <span style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }}>Where do you want to start?</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: "#fff", border: `1px solid ${tokens.line}`, color: tokens.navy, cursor: "pointer" }}>✕</button>
            </div>
            <div className="grid gap-2.5">
              {opt("/assessment", "Flying soon?", "Get my pet ready to fly: what your airline and destination need, step by step.", "plane")}
              {opt("/passport/create", "Make your pet's passport", "Their passport and records, always on your phone. Starts their Pet Vault.", "passport")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Kept for pages that list the public links (footer, sitemap).
export const NAV_LINKS = [
  { href: "/airlines", label: "Airlines" },
  { href: "/blog", label: "Blog" },
  ...(COMMUNITY ? [{ href: "/community", label: "Community" }] : []),
  { href: "/faq", label: "FAQ" },
];

// Main links, by who is looking. Kept short on purpose: one job per page.
const GUEST_MAIN = [
  { href: "/assessment", label: "Plan a trip", icon: "plane", sub: "What your pet needs to fly" },
  { href: "/passport/create", label: "Pet Passport", icon: "tag", sub: "Starts their Pet Vault" },
  { href: "/pet-vault", label: "Pet Vault", icon: "shield", sub: "Passport, records, travel mode" },
];
const GUEST_MORE = [
  { href: "/faq", label: "Help & FAQ" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact us" },
];
const MEMBER_MAIN = [
  { href: "/account?tab=trips", label: "My Trips", icon: "plane", sub: "Travel Passes and checklists" },
  { href: "/account?tab=vault", label: "My Pets", icon: "paw", sub: "Profiles and passports" },
  { href: "/account?tab=vault&focus=id", label: "Passport", icon: "passport", sub: "Your pet's passport and QR" },
];
const MEMBER_MORE = [
  { href: "/account", label: "Dashboard" },
  { href: "/account?tab=billing", label: "Account & billing" },
  { href: "/faq", label: "Help & FAQ" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact us" },
];

const link = { fontFamily: font.body, fontSize: 15, fontWeight: 500, color: tokens.navy, textDecoration: "none", whiteSpace: "nowrap" };

function isActive(href, here) {
  if (!here) return false;
  const [path, query = ""] = href.split("?");
  if (path.includes("#")) return false;
  if (here.path !== path) return false;
  if (!query) return path !== "/account" || !here.search.get("tab");
  const want = new URLSearchParams(query);
  for (const [k, v] of want) if (here.search.get(k) !== v) return false;
  if (!want.has("focus") && here.search.get("focus")) return false;
  return true;
}

function useOutside(ref, onOut) {
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onOut(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

function Dropdown({ label, items, onLogout, avatar }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} className="relative hidden lg:block">
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5" style={{ ...link, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        {avatar ? (
          <span aria-label="Account menu" className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: tokens.gold, color: tokens.navy, fontWeight: 800, fontSize: 15 }}>{avatar}</span>
        ) : label}
        <span aria-hidden="true" style={{ fontSize: 11, color: tokens.muted }}>▾</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 rounded-2xl p-2 ppg-menu-sheet" style={{ minWidth: 220, background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 16px 40px rgba(20,33,61,.14)", zIndex: 60 }}>
          {items.map((it) => (
            <a key={it.href} role="menuitem" href={it.href} className="block rounded-xl px-3 py-2.5 hover:bg-[#F3F5F9]" style={{ ...link, fontWeight: 600 }}>{it.label}</a>
          ))}
          {onLogout && (
            <>
              <div style={{ height: 1, background: tokens.line, margin: "4px 8px" }} />
              <button type="button" role="menuitem" onClick={onLogout} className="block w-full text-left rounded-xl px-3 py-2.5 hover:bg-[#F3F5F9]" style={{ ...link, color: tokens.muted, background: "none", border: "none", cursor: "pointer" }}>Log out</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose, main, more, signedIn, onLogout, here }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0" style={{ zIndex: 80 }} role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0" style={{ background: "rgba(11,21,41,.35)" }} onClick={onClose} />
      <div className="absolute left-0 right-0 top-0 ppg-menu-sheet flex flex-col" style={{ background: "#fff", maxHeight: "100dvh", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: "0 20px 50px rgba(0,0,0,.2)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${tokens.line}` }}>
          <Wordmark size={22} />
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: tokens.sky, color: tokens.navy, border: "none" }}><Icon name="x" size={20} /></button>
        </div>
        <div className="overflow-y-auto px-2.5 py-3">
          <div className="px-4 pt-1 pb-2" style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>{signedIn ? "YOUR STUFF" : "PETPASSGO"}</div>
          {main.map((it) => {
            const on = isActive(it.href, here);
            return (
              <a key={it.href} href={it.href} onClick={onClose} className="flex items-center gap-3.5 rounded-2xl px-4 py-3" style={{ textDecoration: "none", background: on ? "#FFF3EC" : "transparent" }}>
                <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 42, height: 42, background: on ? "#FDE8E2" : tokens.sky, color: on ? tokens.primary : tokens.navy }}><Icon name={it.icon} size={20} /></span>
                <span className="min-w-0">
                  <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{it.label}</span>
                  <span className="block" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{it.sub}</span>
                </span>
              </a>
            );
          })}
          <div className="px-4 pt-4 pb-1" style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: tokens.muted }}>MORE</div>
          {more.filter((it) => !main.some((m) => m.href === it.href)).map((it) => (
            <a key={it.href} href={it.href} onClick={onClose} className="block rounded-xl px-4 py-2.5" style={{ ...link, fontSize: 16, fontWeight: 600 }}>{it.label}</a>
          ))}
          {signedIn ? (
            <button type="button" onClick={onLogout} className="block w-full text-left rounded-xl px-4 py-2.5" style={{ ...link, fontSize: 16, color: tokens.muted, background: "none", border: "none" }}>Log out</button>
          ) : (
            <a href="/login" className="block rounded-xl px-4 py-2.5" style={{ ...link, fontSize: 16, fontWeight: 700 }}>{LOGIN_CTA}</a>
          )}
        </div>
        <div className="p-4" style={{ borderTop: `1px solid ${tokens.line}` }}>
          {signedIn ? <a href="/assessment" className="block text-center rounded-full py-3" style={{ background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}`, fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>+ Plan another trip</a> : <a href="/assessment" className="block text-center rounded-full py-3.5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{PLAN_CTA}</a>}
        </div>
      </div>
    </div>
  );
}

// One header for every page. Signed out: product links. Signed in: the owner's own trips, pets and Pet ID.
export default function SiteHeader({ onLogout }) {
  const [signedIn, setSignedIn] = useState(false);
  const [initial, setInitial] = useState("");
  const [menu, setMenu] = useState(false);
  const [here, setHere] = useState(null);
  useEffect(() => {
    setHere({ path: window.location.pathname, search: new URLSearchParams(window.location.search) });
    supabase.auth.getSession().then(({ data }) => {
      const u = data?.session?.user;
      setSignedIn(!!u);
      if (u) {
        const name = u.user_metadata?.first_name || u.user_metadata?.full_name || u.email || "";
        setInitial(String(name).trim().charAt(0).toUpperCase() || "•");
      }
    }).catch(() => {});
  }, []);
  async function logout() {
    if (onLogout) return onLogout();
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  const main = signedIn ? MEMBER_MAIN : GUEST_MAIN;
  const more = signedIn ? MEMBER_MORE : GUEST_MORE;
  return (
    <header className="ppg-no-print" style={{ background: "#fff", borderBottom: `1px solid ${tokens.line}`, position: "sticky", top: 0, zIndex: 60 }}>
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-3 sm:px-5 md:px-10 py-3 md:py-4 gap-2 min-w-0">
        <a href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0" style={{ textDecoration: "none" }} aria-label="PetPassGo">
          <span className="ppg-logo-icon"><Logo size={30} /></span>
          <Wordmark size={23} className="ppg-wordmark" />
        </a>
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-nowrap flex-shrink-0">
          {main.filter((l) => l.href !== "/assessment").map((l) => {
            const on = isActive(l.href, here);
            return (
              <a key={l.href} href={l.href} className={`hidden ${l.href === "/airlines" ? "xl:inline" : "lg:inline"}`} aria-current={on ? "page" : undefined}
                style={{ ...link, color: on ? tokens.primary : tokens.navy, fontWeight: on ? 700 : 500, boxShadow: on ? `inset 0 -2px 0 ${tokens.primary}` : "none", paddingBottom: 4 }}>{l.label}</a>
            );
          })}
          {signedIn ? (
            <Dropdown items={more} onLogout={logout} avatar={initial || "•"} />
          ) : (
            <>
              <Dropdown label="Help" items={more} />
              <a href="/login" style={link} className="hidden sm:inline">{LOGIN_CTA}</a>
            </>
          )}
          {signedIn ? (
            <a href="/account" aria-label="My account" className="lg:hidden rounded-full flex items-center justify-center" style={{ width: 40, height: 40, background: tokens.gold || "#F2B84B", color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 16, textDecoration: "none" }}>{initial || "•"}</a>
          ) : (
            <GetStarted style={{ ...link, background: tokens.primary, color: "#fff", fontWeight: 700, fontSize: 15 }} />
          )}
          <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu} className="lg:hidden rounded-xl flex items-center justify-center" style={{ width: 40, height: 40, background: tokens.sky, border: "none", color: tokens.navy }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </nav>
      <MobileMenu open={menu} onClose={() => setMenu(false)} main={main} more={more} signedIn={signedIn} onLogout={logout} here={here} />
    </header>
  );
}
