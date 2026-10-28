"use client";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import CommunityPaywall from "../../components/CommunityPaywall";
import { VAULT_SUB } from "../../lib/travelPassOffer";
import { supabase } from "../../lib/supabaseClient";
import { BOARDS, formatBoardLatest } from "../../lib/community";
import { tokens, font } from "../../lib/theme";

export default function CommunityHome() {
  const [meta, setMeta] = useState({}); // slug -> { count, latest }
  const [member, setMember] = useState(null);
  const [filter, setFilter] = useState("all"); // all | airlines | lost
  const airlines = useMemo(() => BOARDS.filter((b) => b.airline), []);
  const lost = useMemo(() => BOARDS.find((b) => b.slug === "lost-and-found"), []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) { setMember(false); return; }
      const { data: ok } = await supabase.rpc("can_use_community");
      setMember(!!ok);
      if (!ok) return;
      const { data: rows } = await supabase
        .from("community_posts")
        .select("board,created_at")
        .is("parent_id", null)
        .order("created_at", { ascending: false })
        .limit(2000);
      const m = {};
      (rows || []).forEach((r) => {
        if (!m[r.board]) m[r.board] = { count: 0, latest: r.created_at };
        m[r.board].count += 1;
        if (r.created_at > m[r.board].latest) m[r.board].latest = r.created_at;
      });
      setMeta(m);
    });
  }, []);

  const shown = filter === "lost" ? (lost ? [lost] : []) : filter === "airlines" ? airlines : BOARDS;

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1100px] mx-auto px-6 py-12">
        <h1 style={{ fontFamily: font.display, fontSize: 40, fontWeight: 700, color: tokens.navy }} className="mb-2">Community</h1>
        <p style={{ fontFamily: font.body, fontSize: 18, color: tokens.muted }} className="mb-4">
          {VAULT_SUB} Boards are for Pet Vault members.
        </p>
        {member !== true && (
          <div className="mb-6"><CommunityPaywall /></div>
        )}

        {member === true && <div className="mb-5">
          <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-2">Pick an airline</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { id: "all", label: "All boards" },
              { id: "airlines", label: "Airlines only" },
              { id: "lost", label: "Lost & found" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="rounded-full px-4 py-2"
                style={{
                  fontFamily: font.body,
                  fontSize: 14,
                  fontWeight: 600,
                  border: `2px solid ${filter === f.id ? tokens.navy : tokens.line}`,
                  background: filter === f.id ? tokens.navy : "#fff",
                  color: filter === f.id ? "#fff" : tokens.navy,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {airlines.map((b) => (
              <a
                key={b.slug}
                href={`/community/${b.slug}`}
                className="rounded-full px-3.5 py-1.5"
                style={{
                  fontFamily: font.body,
                  fontSize: 13.5,
                  fontWeight: 600,
                  background: "#fff",
                  border: `1px solid ${tokens.line}`,
                  color: tokens.navy,
                  textDecoration: "none",
                }}
              >
                {b.name}
                {meta[b.slug]?.latest ? (
                  <span style={{ color: tokens.muted, fontWeight: 500 }}> · {formatBoardLatest(meta[b.slug].latest)}</span>
                ) : null}
              </a>
            ))}
          </div>
        </div>}

        {member === true && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((b) => (
            <a
              key={b.slug}
              href={`/community/${b.slug}`}
              className="airline-tile rounded-2xl p-6 block"
              style={{ background: b.slug === "lost-and-found" ? tokens.navy : "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <span style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700, color: b.slug === "lost-and-found" ? "#fff" : tokens.navy }}>{b.name}</span>
                {meta[b.slug]?.count ? (
                  <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: b.slug === "lost-and-found" ? tokens.gold : tokens.primary }}>
                    {meta[b.slug].count} thread{meta[b.slug].count > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
              <p style={{ fontFamily: font.body, fontSize: 15, color: b.slug === "lost-and-found" ? "#C9D3E3" : tokens.muted, lineHeight: 1.5 }}>{b.blurb}</p>
              {meta[b.slug]?.latest && (
                <p style={{ fontFamily: font.body, fontSize: 13, color: b.slug === "lost-and-found" ? "#A8B4C8" : tokens.muted }} className="mt-3">
                  Latest post {formatBoardLatest(meta[b.slug].latest)}
                </p>
              )}
            </a>
          ))}
        </div>}
      </main>
    </div>
  );
}
