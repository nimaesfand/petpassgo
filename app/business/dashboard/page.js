"use client";
import { useEffect, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import BusinessAuth, { useBusinessUser } from "../../../components/discover/BusinessAuth";
import { Cover } from "../../../components/discover/BusinessCard";
import Icon from "../../../components/Icon";
import { supabase } from "../../../lib/supabaseClient";
import { tokens, font } from "../../../lib/theme";
import { CATEGORIES, PLANS } from "../../../lib/discover";

const STATUS = {
  draft: { label: "Draft", bg: tokens.sky, color: tokens.muted, text: "Not sent for review yet." },
  pending: { label: "In review", bg: "#FFF8EC", color: "#8A5A00", text: "PetPassGo is checking your listing, usually within 2 business days." },
  published: { label: "Live", bg: "#E5F4EE", color: tokens.green, text: "Pet owners can find you in Discover." },
  changes_requested: { label: "Needs a change", bg: "#FFF1EE", color: "#B4321C", text: "Make the change below and send it back." },
  rejected: { label: "Not approved", bg: "#FFF1EE", color: "#B4321C", text: "This listing wasn't approved." },
};

export default function BusinessDashboard() {
  const user = useBusinessUser();
  const [list, setList] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("businesses").select("id,slug,name,category,city,state,online_only,photos,plan,status,review_note,updated_at").eq("owner_user_id", user.id).order("created_at", { ascending: true })
      .then(({ data }) => setList(data || []));
  }, [user]);

  if (user === undefined) return <div style={{ background: tokens.sky, minHeight: "100vh" }}><SiteHeader /></div>;
  if (!user) return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="px-4 py-10 md:py-16"><BusinessAuth title="Business dashboard" sub="Create an account or log in to manage your listing." /></main>
    </div>
  );

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", color: tokens.primary }}>BUSINESS DASHBOARD</div>
            <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, color: tokens.navy }} className="mt-1">Your listings</h1>
          </div>
          <a href="/business/listing" className="rounded-full px-5 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>+ Add a listing</a>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {list === null ? <div className="rounded-3xl ppg-shimmer" style={{ height: 160 }} /> : list.length === 0 ? (
            <div className="rounded-3xl p-8 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy }}>No listings yet</h2>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-2">Create your free listing. It takes about 5 minutes.</p>
              <a href="/business/listing" className="inline-block mt-5 rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Create free listing</a>
            </div>
          ) : list.map((b) => {
            const st = STATUS[b.status] || STATUS.pending;
            const cat = CATEGORIES.find((c) => c.slug === b.category);
            return (
              <div key={b.id} className="rounded-3xl overflow-hidden grid sm:grid-cols-[220px_minmax(0,1fr)]" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
                <Cover b={b} height={170} />
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5" style={{ background: st.bg, color: st.color, fontFamily: font.body, fontSize: 12.5, fontWeight: 800 }}>{st.label}</span>
                    <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{cat?.short_name} · {b.online_only ? "Online" : `${b.city}, ${b.state}`} · {PLANS.find((p) => p.id === b.plan)?.name}</span>
                  </div>
                  <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>{b.name}</div>
                  <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{st.text}</div>
                  {b.review_note && (b.status === "changes_requested" || b.status === "rejected") && <div className="rounded-xl px-3 py-2" style={{ background: "#FFF8EC", fontFamily: font.body, fontSize: 14.5, color: "#7A4F00" }}><b>Note from PetPassGo:</b> {b.review_note}</div>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a href={`/business/listing?id=${b.id}`} className="rounded-full px-4 py-2" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}>Edit listing</a>
                    {b.status === "published" && <a href={`/discover/${b.slug}`} className="rounded-full px-4 py-2 inline-flex items-center gap-1.5" style={{ background: "#fff", border: `1.5px solid ${tokens.navy}`, color: tokens.navy, fontFamily: font.body, fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}><Icon name="external" size={15} />View live</a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="rounded-3xl p-6 md:p-8 mt-8" style={{ background: tokens.navy, color: "#fff" }}>
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", color: tokens.gold }}>GROW WITH FEATURED</div>
          <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, lineHeight: 1.15 }} className="mt-2">Get to the top of your category.</div>
          <div className="grid md:grid-cols-2 gap-4 mt-5">
            {PLANS.filter((p) => p.id !== "free").map((p) => (
              <div key={p.id} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.16)" }}>
                <div className="flex items-baseline justify-between gap-2"><span style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800 }}>{p.name}</span><span style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.gold }}>{p.price}<span style={{ fontSize: 14, opacity: 0.75 }}>{p.per}</span></span></div>
                <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.75 }} className="mt-1">{p.note}</div>
                <ul className="mt-3 flex flex-col gap-1.5">{p.points.slice(1, 4).map((x) => <li key={x} className="flex gap-2" style={{ fontFamily: font.body, fontSize: 14.5 }}><span style={{ color: tokens.gold }}><Icon name="check" size={15} /></span>{x}</li>)}</ul>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: font.body, fontSize: 14.5, opacity: 0.8 }} className="mt-5">Paid plans open for sign-up soon. You&apos;ll upgrade right here, and your listing stays exactly as it is.</p>
        </section>
      </main>
    </div>
  );
}
