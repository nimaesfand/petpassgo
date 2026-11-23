"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import PetPassport from "../../../components/PetPassport";
import GuestEmailStep from "../../../components/GuestEmailStep";
import WithdrawalConsent from "../../../components/WithdrawalConsent";
import { BennySays, LockedPages } from "../../../components/passport/BennyGuide";
import { supabase } from "../../../lib/supabaseClient";
import { startStripe } from "../../../lib/checkout";
import { trackBeginCheckout } from "../../../lib/analytics";
import { WITHDRAWAL_BLOCKED } from "../../../lib/withdrawal";
import { PRICES as P } from "../../../lib/pricing";
import { KEEP_TOKEN_KEY } from "../../../lib/passportDraft";
import { tokens, font } from "../../../lib/theme";

// The link in the passport email. See the passport, then keep it with Pet Vault.
// After paying, the passport moves into the account at sign-in (by email or this saved link).
const B = font.body;

export default function KeepPassport() {
  const [t, setT] = useState("");
  const [d, setD] = useState(null);
  const [state, setState] = useState("loading"); // loading | missing | expired | guest | member-needed | moving | kept
  const [err, setErr] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t") || "";
    setT(token);
    (async () => {
      const r = await fetch(`/api/passport-draft?t=${encodeURIComponent(token)}`);
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setState("missing"); return; }
      setD(j);
      if (j.expired) { setState("expired"); return; }
      try { localStorage.setItem(KEEP_TOKEN_KEY, token); } catch {}
      const { data } = await supabase.auth.getSession();
      if (!data?.session) { setState("guest"); return; }
      setState("moving");
      const c = await fetch("/api/passport-draft/claim", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data.session.access_token }, body: JSON.stringify({ t: token }) });
      const cj = await c.json().catch(() => ({}));
      if (c.ok) { try { localStorage.removeItem(KEEP_TOKEN_KEY); } catch {} setState("kept"); setTimeout(() => { window.location.href = `/account?pet=${cj.pet_id}`; }, 1800); return; }
      if (cj.need === "vault") { setState("member-needed"); return; }
      setErr(cj.error || "Something went wrong."); setState("member-needed");
    })();
  }, []);

  async function pay() {
    if (!consent) { setErr(WITHDRAWAL_BLOCKED); return; }
    setBusy(true); setErr("");
    trackBeginCheckout("membership");
    const e = await startStripe("/api/stripe/checkout", { plan: "membership", immediate_access_consent: true, marketing_opt_in: false });
    if (e) { setErr(e); setBusy(false); }
  }

  const name = d?.data?.name || "Your pet";
  const pet = d ? { id: "sample-draft", name, animal_type: d.data.animal_type || "Dog", role: d.data.role || "Pet", breed: d.data.breed, sex: d.data.sex, date_of_birth: d.data.date_of_birth, handler_name: d.data.handler_name, passport_no: "PPG-PREVIEW", passport_issued_at: d.created_at } : null;
  const photo = d?.photo ? <img src={d.photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null;
  const days = d?.expires_at ? Math.max(1, Math.ceil((new Date(d.expires_at) - Date.now()) / 864e5)) : 7;

  let side = null;
  if (state === "loading" || state === "moving") side = <BennySays>{state === "moving" ? `Adding ${name}'s passport to your account…` : "One moment…"}</BennySays>;
  if (state === "kept") side = <BennySays sub="Taking you there now.">{name}&apos;s passport is yours!</BennySays>;
  if (state === "missing") side = (
    <>
      <BennySays sub="The link may be incomplete. You can make a new passport in about a minute.">I couldn&apos;t find that passport.</BennySays>
      <a href="/passport/create" className="mt-6 inline-flex items-center justify-center rounded-full px-8" style={{ minHeight: 60, background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 19, textDecoration: "none" }}>Make a passport</a>
    </>
  );
  if (state === "expired") side = (
    <>
      <BennySays sub="We hold passports for 7 days. Making it again takes about a minute.">{name}&apos;s passport has expired.</BennySays>
      <a href="/passport/create" className="mt-6 inline-flex items-center justify-center rounded-full px-8" style={{ minHeight: 60, background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 19, textDecoration: "none" }}>Make it again</a>
    </>
  );
  if (state === "guest" || state === "member-needed") side = (
    <>
      <BennySays sub={`We'll hold it for ${days} more day${days === 1 ? "" : "s"}.`}>Welcome back! Here&apos;s {name}&apos;s passport.</BennySays>
      <div className="mt-6 rounded-3xl p-5 sm:p-6" style={{ background: "#fff", border: `2px solid ${tokens.primary}`, boxShadow: "0 18px 44px rgba(194,65,12,.14)" }}>
        <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>Keep {name}&apos;s passport</div>
        <p className="mt-1" style={{ fontFamily: B, fontSize: 17, color: tokens.ink }}>Pet Vault, {P.member} a month. Cancel anytime.</p>
        <div className="mt-4"><LockedPages name={name} /></div>
        <div className="mt-5">
          {state === "guest" ? (
            <>
              <GuestEmailStep plan="membership" cancelPath={`/passport/keep?t=${t}`} />
              <p className="mt-3" style={{ fontFamily: B, fontSize: 15, color: tokens.muted }}>Use <b style={{ color: tokens.navy }}>{d?.email}</b> so {name}&apos;s passport moves into your account. Already a member? <a href="/login" style={{ color: tokens.navy, fontWeight: 700 }}>Log in</a></p>
            </>
          ) : (
            <>
              <WithdrawalConsent renews checked={consent} onChange={(v) => { setConsent(v); setErr(""); }} error={err} />
              <button type="button" disabled={busy} onClick={pay} className="w-full rounded-full mt-2" style={{ minHeight: 60, background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 19, border: "none", cursor: "pointer" }}>{busy ? "One moment…" : `Keep ${name}'s passport`}</button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-10 grid xl:grid-cols-[minmax(380px,1fr)_minmax(540px,600px)] gap-6 xl:gap-10 items-start">
        <section className="order-2 xl:order-1 min-w-0" aria-live="polite">{side}</section>
        <aside className="order-1 xl:order-2 w-full max-w-[600px] mx-auto xl:sticky xl:top-6">
          <div className="ppg-mini-pp">
          {pet ? <PetPassport pet={pet} photo={photo} sample /> : null}
          </div>
        </aside>
      </main>
    </div>
  );
}
