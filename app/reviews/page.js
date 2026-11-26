"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";

// Public reviews: approved only, newest first. Real members only. Nothing seeded.
const PAGE = 8;
const stars = (n) => <span aria-label={`${n} out of 5 stars`} style={{ color: "#F2B84B", letterSpacing: 2, fontSize: 18 }}>{"★".repeat(n)}<span style={{ color: "#CBD3DE" }}>{"★".repeat(5 - n)}</span></span>;

export default function ReviewsPage() {
  const [list, setList] = useState(null);
  const [sum, setSum] = useState(null);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load(offset) {
    setBusy(true);
    const { data } = await supabase.rpc("get_public_reviews", { p_limit: PAGE, p_offset: offset });
    setBusy(false);
    const rows = data || [];
    setList((l) => [...(offset ? l || [] : []), ...rows]);
    setMore(rows.length === PAGE);
  }
  useEffect(() => {
    load(0);
    supabase.rpc("get_review_summary").then(({ data }) => setSum(Array.isArray(data) ? data[0] : data));
  }, []);

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[760px] mx-auto px-5 py-12">
        <h1 style={{ fontFamily: font.display, fontSize: 40, fontWeight: 800, color: tokens.navy, lineHeight: 1.1 }}>Reviews</h1>
        <p className="mt-2" style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink, lineHeight: 1.5 }}>From real Pet Vault members, in their own words.</p>
        {sum?.total > 0 ? (
          <div className="mt-4 inline-flex items-center gap-3 rounded-full px-4 py-2" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            {stars(Math.round(Number(sum.average)))}
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{Number(sum.average).toFixed(1)} from {sum.total} review{sum.total === 1 ? "" : "s"}</span>
          </div>
        ) : null}

        {list && list.length === 0 ? (
          <div className="mt-8 rounded-3xl p-6 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>Be one of the first to share your story</div>
            <p className="mt-2" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>Pet Vault members can leave a review from their account.</p>
            <a href="/account" className="ppg-btn ppg-btn-primary mt-4">Go to my account</a>
          </div>
        ) : null}

        <div className="mt-8 grid gap-3">
          {(list || []).map((r) => (
            <article key={r.id} className="rounded-3xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {stars(r.rating)}
                <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
              <p className="mt-2" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.55, whiteSpace: "pre-line" }}>{r.body}</p>
              <div className="mt-2" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 800, color: tokens.navy }}>{r.display_name}</div>
            </article>
          ))}
        </div>
        {more ? <div className="mt-5 text-center"><button type="button" disabled={busy} onClick={() => load(list.length)} className="ppg-btn ppg-btn-secondary">{busy ? "Loading…" : "Show more"}</button></div> : null}
      </main>
    </div>
  );
}
