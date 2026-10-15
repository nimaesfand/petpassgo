"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";

export const NAV_LINKS = [
  { href: "/airlines", label: "Airlines" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
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
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-5 md:px-10 py-4 flex-wrap gap-3">
        <a href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <span aria-hidden="true" className="rounded-lg flex items-center justify-center" style={{ width: 32, height: 32, background: tokens.navy }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={tokens.gold}><circle cx="6" cy="9" r="2.2"/><circle cx="10" cy="5.5" r="2.2"/><circle cx="14" cy="5.5" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M12 10c-3.3 0-6 3.6-6 6.2 0 2 1.6 2.8 3.3 2.8 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.7 0 3.3-.8 3.3-2.8 0-2.6-2.7-6.2-6-6.2z"/></svg>
          </span>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 24, color: tokens.navy, letterSpacing: "-0.02em" }}>PetPassGo</span>
        </a>
        <div className="flex items-center gap-5 md:gap-7 flex-wrap">
          {NAV_LINKS.map((l) => <a key={l.href} href={l.href} style={link}>{l.label}</a>)}
          {signedIn ? (
            <>
              <a href="/account" style={link}>My dashboard</a>
              <button onClick={logout} style={{ ...link, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Log out</button>
            </>
          ) : (
            <>
              <a href="/login" style={link}>Log in</a>
              <a href="/signup" style={link}>Sign up</a>
            </>
          )}
          <a href="/assessment" className="btn-primary rounded-full px-5 py-2.5" style={{ ...link, background: tokens.primary, color: "#fff", fontWeight: 600 }}>Get your Travel Pass</a>
        </div>
      </nav>
    </header>
  );
}
