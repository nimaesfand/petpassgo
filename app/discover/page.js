"use client";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import BusinessCard from "../../components/discover/BusinessCard";
import Icon from "../../components/Icon";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";
import { CATEGORIES, STATES, STATE_NAME, PUBLIC_FIELDS, rankBusinesses } from "../../lib/discover";

export default function DiscoverPage() {
  const [all, setAll] = useState(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get("q") || ""); setState((p.get("state") || "").toUpperCase()); setCity(p.get("city") || ""); setCat(p.get("category") || "");
    supabase.from("businesses").select(PUBLIC_FIELDS).eq("status", "published").limit(2000)
      .then(({ data }) => setAll(data || []));
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); if (state) p.set("state", state); if (city) p.set("city", city); if (cat) p.set("category", cat);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/discover?${qs}` : "/discover");
  }, [q, state, city, cat]);

  const cities = useMemo(() => {
    const anchors = STATES.find(([c]) => c === state)?.[2] || [];
    const live = (all || []).filter((b) => b.state === state && !b.online_only).map((b) => b.city);
    return [...new Set([...anchors, ...live])].sort();
  }, [state, all]);

  const results = useMemo(() => {
    if (!all) return null;
    const needle = q.trim().toLowerCase();
    return rankBusinesses(all.filter((b) => {
      if (cat && b.category !== cat) return false;
      if (state && b.state !== state && !b.online_only) return false;
      if (city && !b.online_only && b.city.toLowerCase() !== city.toLowerCase()) return false;
      if (needle) {
        const hay = [b.name, b.tagline, b.city, b.zip, ...(b.subcategories || [])].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    }));
  }, [all, q, state, city, cat]);

  const place = city ? `${city}, ${state}` : state ? STATE_NAME[state] : "";
  const select = { fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.navy, background: "#fff", border: `1.5px solid ${tokens.line}`, borderRadius: 14, padding: "12px 14px", minWidth: 0 };

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <section style={{ background: tokens.navy }} className="px-4 sm:px-6 md:px-10 pt-10 pb-24 md:pt-14">
        <div className="max-w-[1180px] mx-auto">
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 800, letterSpacing: "0.16em", color: tokens.gold }}>DISCOVER</div>
          <h1 style={{ fontFamily: font.display, color: "#fff", lineHeight: 1.05 }} className="text-[36px] md:text-[54px] font-bold mt-2 max-w-[44rem]">Pet-friendly places, wherever you land.</h1>
          <p style={{ fontFamily: font.body, fontSize: 18, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }} className="mt-3 max-w-[38rem]">Vets, groomers, sitters, trainers, stores and pet-friendly stays. Every listing is set up by the business and checked by PetPassGo.</p>
        </div>
      </section>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-10 -mt-14 pb-20">
        <div className="rounded-3xl p-4 md:p-5 grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]" style={{ background: "#fff", boxShadow: "0 20px 50px rgba(20,33,61,.14)" }}>
          <label className="flex items-center gap-2 rounded-2xl px-4" style={{ border: `1.5px solid ${tokens.line}` }}>
            <span style={{ color: tokens.muted }}><Icon name="search" size={20} /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a business, service or ZIP" aria-label="Search" className="w-full py-3 outline-none" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, background: "transparent" }} />
          </label>
          <select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} aria-label="State" style={select}>
            <option value="">All states</option>
            {STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" style={{ ...select, opacity: state ? 1 : 0.55 }} disabled={!state}>
            <option value="">{state ? "All cities" : "Pick a state first"}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto mt-6 pb-1 ppg-noscrollbar" role="tablist" aria-label="Categories">
          {[{ slug: "", short_name: "All", icon: "sparkle" }, ...CATEGORIES].map((c) => {
            const on = cat === c.slug;
            return (
              <button key={c.slug || "all"} type="button" role="tab" aria-selected={on} onClick={() => setCat(c.slug)} className="shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2.5"
                style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14.5, cursor: "pointer", background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `1.5px solid ${on ? tokens.navy : tokens.line}` }}>
                <Icon name={c.icon} size={17} />{c.short_name}
              </button>
            );
          })}
        </div>

        <div className="mt-7">
          {results === null ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="rounded-3xl ppg-shimmer" style={{ height: 300 }} />)}</div>
          ) : results.length ? (
            <>
              <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-4">{results.length} {results.length === 1 ? "place" : "places"}{place ? ` in ${place}` : ""}. Featured and Premium listings are sponsored and labeled.</div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{results.map((b) => <BusinessCard key={b.id} b={b} />)}</div>
            </>
          ) : (
            <div className="rounded-3xl p-8 md:p-10 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
              <div className="mx-auto rounded-2xl flex items-center justify-center" style={{ width: 60, height: 60, background: "#FDE8E2", color: tokens.primary }}><Icon name="pin" size={28} /></div>
              <h2 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, color: tokens.navy }} className="mt-4">
                {all?.length ? `Nothing here${place ? ` in ${place}` : ""} yet.` : "Discover is just opening."}
              </h2>
              <p style={{ fontFamily: font.body, fontSize: 16.5, color: tokens.ink, lineHeight: 1.55 }} className="mt-2 max-w-[34rem] mx-auto">
                We&apos;re adding pet businesses city by city, and only list businesses that set up their own listing. Know a great vet, groomer or pet-friendly spot? Send them our way.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <a href="/business" className="rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>List your business free</a>
                {(q || state || city || cat) && <button type="button" onClick={() => { setQ(""); setState(""); setCity(""); setCat(""); }} className="rounded-full px-6 py-3" style={{ background: "#fff", color: tokens.navy, border: `1.5px solid ${tokens.navy}`, fontFamily: font.body, fontWeight: 700, cursor: "pointer" }}>Clear filters</button>}
              </div>
            </div>
          )}
        </div>

        <a href="/business" className="mt-12 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none" }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy }}>Own a pet business?</div>
            <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-1">Create a free listing with photos, your pet policy and how to reach you.</div>
          </div>
          <span style={{ fontFamily: font.body, fontWeight: 700, color: tokens.primary, fontSize: 16 }}>For businesses →</span>
        </a>
      </main>
    </div>
  );
}
