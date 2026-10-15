"use client";
import { useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import CommunityNotice from "../../components/CommunityNotice";
import { PRICES as P } from "../../lib/pricing";
import { supabase } from "../../lib/supabaseClient";
import { BOARDS } from "../../lib/community";
import { tokens, font } from "../../lib/theme";

export default function CommunityHome() {
  const [counts, setCounts] = useState({});
  const [signedIn, setSignedIn] = useState(null);
  const [member, setMember] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSignedIn(!!data?.session);
      if (!data?.session) return;
      const { data: ok } = await supabase.rpc("can_use_community");
      setMember(!!ok);
      if (!ok) return;
      const { data: rows } = await supabase.from("community_posts").select("board").is("parent_id", null).limit(2000);
      const c = {}; (rows || []).forEach((r) => (c[r.board] = (c[r.board] || 0) + 1)); setCounts(c);
    });
  }, []);
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1100px] mx-auto px-6 py-12">
        <h1 style={{ fontFamily: font.display, fontSize: 40, fontWeight: 700, color: tokens.navy }} className="mb-2">Community</h1>
        <p style={{ fontFamily: font.body, fontSize: 18, color: tokens.muted }} className="mb-6">Swap tips with people who've flown your airline with their animal.</p>
        <CommunityNotice />
        {(signedIn === false || member === false) && (
          <div className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4 flex-wrap" style={{ background: tokens.navy, color: "#fff" }}>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700 }}>Community boards are for members</div>
              <div style={{ fontFamily: font.body, fontSize: 15, color: "#C9D3E3" }}>Membership {P.member}/mo also includes your Pet ID, lost-pet alerts and {P.memberPass} Travel Passes.{signedIn === false && <> Already a member? <a href="/login" style={{ color: tokens.gold, fontWeight: 600 }}>Log in</a></>}</div>
            </div>
            <a href="/signup?plan=member" className="btn-primary rounded-full px-6 py-3" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Join for {P.member}/mo</a>
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOARDS.map((b) => (
            <a key={b.slug} href={`/community/${b.slug}`} className="airline-tile rounded-2xl p-6 block" style={{ background: b.slug === "lost-and-found" ? tokens.navy : "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700, color: b.slug === "lost-and-found" ? "#fff" : tokens.navy }}>{b.name}</span>
                {counts[b.slug] ? <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: b.slug === "lost-and-found" ? tokens.gold : tokens.primary }}>{counts[b.slug]} thread{counts[b.slug] > 1 ? "s" : ""}</span> : null}
              </div>
              <p style={{ fontFamily: font.body, fontSize: 15, color: b.slug === "lost-and-found" ? "#C9D3E3" : tokens.muted, lineHeight: 1.5 }}>{b.blurb}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
