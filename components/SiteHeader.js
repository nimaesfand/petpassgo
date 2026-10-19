"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import Logo from "./Logo";

// Airlines, Blog, and FAQ. Blog is listed because the owner approved the
// service-dog posts on 2026-10-19. Outlines in content/drafts stay unpublished.
export const NAV_LINKS = [
  { href: "/airlines", label: "Airlines" },
  { href: "/blog", label: "Blog" },
  ...(process.env.NEXT_PUBLIC_COMMUNITY_ENABLED === "true" ? [{ href: "/community", label: "Community" }] : []),
  { href: "/faq", label: "FAQ" },
];

const link = { fontFamily: font.body, fontSize: 15, fontWeight: 500, color: tokens.navy, textDecoration: "none", whiteSpace: "nowrap" };

// One header for every page. Shows Account/Log out when signed in, Log in/Sign up otherwise.
export default function SiteHeader({ onLogout }) {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data?.session)).catch(() => {});
  }, []);
  async function logout() {
    if (onLogout) return onLogout();
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <header style={{ background: "#fff", borderBottom: `1px solid ${tokens.line}` }}>
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-5 md:px-10 py-3 md:py-4 gap-3">
        <a href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <Logo size={34} />
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 21, color: tokens.navy, letterSpacing: "-0.02em" }}>PetPassGo</span>
        </a>
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          {NAV_LINKS.map((l) => <a key={l.href} href={l.href} style={link} className="hidden md:inline">{l.label}</a>)}
          {signedIn ? (
            <>
              <a href="/account" style={link} className="hidden md:inline">Dashboard</a>
              <a href="/account?tab=vault" style={link} className="hidden md:inline">Pet Vault</a>
              <a href="/account?tab=trips" style={link} className="hidden md:inline">My Trips</a>
              <button onClick={logout} style={{ ...link, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Log out</button>
            </>
          ) : (
            <>
              <a href="/login" style={link}>Log in</a>
              <a href="/signup" style={link}>Sign up</a>
            </>
          )}
          <a href="/assessment" className="btn-primary rounded-full px-5 py-2.5 hidden md:inline-block" style={{ ...link, background: tokens.primary, color: "#fff", fontWeight: 600 }}>Plan your trip</a>
        </div>
      </nav>
    </header>
  );
}
