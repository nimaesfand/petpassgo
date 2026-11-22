"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import PetPassport from "../../../components/PetPassport";
import BreedInput from "../../../components/BreedInput";
import { BennySays, LockedPages } from "../../../components/passport/BennyGuide";
import { PRICES as P } from "../../../lib/pricing";
import { tokens, font } from "../../../lib/theme";

// A free, guided passport. One question at a time, big and friendly, and the
// passport fills in beside it as she answers. The email comes last; then the stamp.

const KEY = "ppg_passport_create_v1";
const B = font.body;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const big = { fontFamily: B, fontSize: 20, border: `2px solid ${tokens.line}`, borderRadius: 16, padding: "14px 16px", width: "100%", minHeight: 60, background: "#fff", color: tokens.ink };

function BigButton({ onClick, children, quiet = false, disabled = false, type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="w-full sm:w-auto rounded-full px-8" style={{ minHeight: 60, fontFamily: B, fontWeight: 800, fontSize: 19, cursor: disabled ? "default" : "pointer", background: quiet ? "#fff" : tokens.primary, color: quiet ? tokens.navy : "#fff", border: quiet ? `2px solid ${tokens.line}` : "none", opacity: disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}

function Choice({ on, onClick, children, sub }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="w-full text-left rounded-2xl px-5" style={{ minHeight: 68, background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `2px solid ${on ? tokens.navy : tokens.line}`, cursor: "pointer" }}>
      <span className="block" style={{ fontFamily: B, fontWeight: 800, fontSize: 20 }}>{children}</span>
      {sub ? <span className="block" style={{ fontFamily: B, fontSize: 15.5, opacity: 0.8 }}>{sub}</span> : null}
    </button>
  );
}

// Shrink a photo in the browser so it uploads fast and fits the passport.
async function shrink(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const max = 900, scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } finally { URL.revokeObjectURL(url); }
}

export default function CreatePassport() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ animal_type: "", name: "", breed: "", sex: "", month: "", year: "", handler_name: "", email: "" });
  const [photo, setPhoto] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { token, at }
  const camRef = useRef(null);
  const libRef = useRef(null);
  const loaded = useRef(false);

  // Everything saves as she goes.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s?.f) { const clean = Object.fromEntries(Object.entries(s.f).map(([k, v]) => [k, typeof v === "string" ? v : ""])); setF((x) => ({ ...x, ...clean })); if (s.photo) setPhoto(s.photo); if (s.done) setDone(s.done); setStep(s.done ? 99 : Math.min(s.step || 0, 6)); }
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(KEY, JSON.stringify({ f, photo, step, done })); } catch { try { localStorage.setItem(KEY, JSON.stringify({ f, step, done })); } catch {} }
  }, [f, photo, step, done]);
  useEffect(() => { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {} }, [step]);

  const set = (k) => (v) => { setF((x) => ({ ...x, [k]: v })); setErr(""); };
  const name = f.name.trim() || "your pet";
  const kind = f.animal_type === "Cat" ? "cat" : "dog";
  const dob = f.year ? `${f.year}-${String(f.month ? MONTHS.indexOf(f.month) + 1 : 6).padStart(2, "0")}-15` : "";
  const go = (n) => { setErr(""); setStep(n); };

  const pet = {
    id: "sample-draft", name: f.name.trim() || "Your pet", animal_type: f.animal_type || "Dog", role: "Pet",
    breed: f.breed.trim(), sex: f.sex, date_of_birth: dob, handler_name: f.handler_name.trim(),
    passport_no: "PPG-PREVIEW", passport_issued_at: done?.at || null,
  };
  const passportPhoto = photo ? <img src={photo} alt={f.name || "Your pet"} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null;

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try { setPhoto(await shrink(file)); go(3); } catch { setErr("That photo didn't open. Try another one."); }
  }

  async function finish(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) { setErr("Please check your email address."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/passport-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.email.trim(), photo, data: { animal_type: pet.animal_type, name: pet.name, breed: pet.breed, sex: pet.sex, date_of_birth: dob, handler_name: pet.handler_name } }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setDone({ token: j.token, at: new Date().toISOString() });
      setStep(99);
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  function startOver() {
    try { localStorage.removeItem(KEY); } catch {}
    setF({ animal_type: "", name: "", breed: "", sex: "", month: "", year: "", handler_name: "", email: "" });
    setPhoto(""); setDone(null); setStep(0);
  }

  const total = 6;
  const years = Array.from({ length: 26 }, (_, i) => String(new Date().getFullYear() - i));
  const errLine = err ? <p role="alert" className="mt-3" style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.primary }}>{err}</p> : null;
  const back = step > 0 && step < 99 ? <button type="button" onClick={() => go(step - 1)} style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.navy, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>← Back</button> : null;

  let q = null;
  if (step === 0) q = (
    <>
      <BennySays sub="It takes about a minute, and you'll see it come together as you go.">Hi, I&apos;m Benny. Let&apos;s make your pet a passport!</BennySays>
      <div className="mt-6 grid gap-3">
        <Choice on={f.animal_type === "Dog"} onClick={() => { set("animal_type")("Dog"); go(1); }}>It&apos;s for my dog</Choice>
        <Choice on={f.animal_type === "Cat"} onClick={() => { set("animal_type")("Cat"); go(1); }}>It&apos;s for my cat</Choice>
      </div>
    </>
  );
  if (step === 1) q = (
    <form onSubmit={(e) => { e.preventDefault(); if (!f.name.trim()) { setErr(`What do you call your ${kind}?`); return; } go(2); }}>
      <BennySays>What&apos;s your {kind}&apos;s name?</BennySays>
      <input autoFocus value={f.name} onChange={(e) => set("name")(e.target.value)} maxLength={40} placeholder="Their name" aria-label={`Your ${kind}'s name`} className="mt-6" style={big} autoComplete="off" />
      {errLine}
      <div className="mt-5"><BigButton type="submit">Next</BigButton></div>
    </form>
  );
  if (step === 2) q = (
    <>
      <BennySays sub="A clear photo of their face works best. You can change it anytime.">What a lovely name! Do you have a favorite photo of {name}?</BennySays>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} hidden />
      <input ref={libRef} type="file" accept="image/*" onChange={pickPhoto} hidden />
      <div className="mt-6 grid gap-3">
        <Choice onClick={() => libRef.current?.click()} sub="Pick one you already have">Choose from my photos</Choice>
        <Choice onClick={() => camRef.current?.click()} sub="Use your phone's camera">Take a photo now</Choice>
      </div>
      {errLine}
      <button type="button" onClick={() => go(3)} className="mt-4" style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Skip for now</button>
    </>
  );
  if (step === 3) q = (
    <form onSubmit={(e) => { e.preventDefault(); go(4); }}>
      <BennySays sub="Mixed or not sure? Just type what you think.">What kind of {kind} is {name}?</BennySays>
      <div className="mt-6"><BreedInput value={f.breed} onChange={(e) => set("breed")(e?.target ? e.target.value : String(e || ""))} animal={f.animal_type || "Dog"} style={big} placeholder="Like Dachshund or Mixed" aria-label="Breed" /></div>
      <div className="mt-5 flex flex-wrap gap-3"><BigButton type="submit">Next</BigButton></div>
    </form>
  );
  if (step === 4) q = (
    <>
      <BennySays>Is {name} a boy or a girl?</BennySays>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Choice on={f.sex === "Male"} onClick={() => { set("sex")("Male"); go(5); }}>Boy</Choice>
        <Choice on={f.sex === "Female"} onClick={() => { set("sex")("Female"); go(5); }}>Girl</Choice>
      </div>
    </>
  );
  if (step === 5) q = (
    <form onSubmit={(e) => { e.preventDefault(); go(6); }}>
      <BennySays sub="A guess is perfectly fine.">When is {name}&apos;s birthday?</BennySays>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <select value={f.month} onChange={(e) => set("month")(e.target.value)} aria-label="Birth month" style={big}>
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={f.year} onChange={(e) => set("year")(e.target.value)} aria-label="Birth year" style={big}>
          <option value="">Year</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <BigButton type="submit">Next</BigButton>
        <button type="button" onClick={() => { setF((x) => ({ ...x, month: "", year: "" })); go(6); }} style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>I&apos;m not sure</button>
      </div>
    </form>
  );
  if (step === 6) q = (
    <form onSubmit={finish}>
      <BennySays sub={`We'll email you ${name}'s passport. No password needed.`}>Last step! Where should we send {name}&apos;s passport?</BennySays>
      <label className="block mt-6">
        <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Your first name</span>
        <input value={f.handler_name} onChange={(e) => set("handler_name")(e.target.value)} maxLength={60} autoComplete="given-name" className="mt-1.5" style={big} />
      </label>
      <label className="block mt-4">
        <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Your email</span>
        <input type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} maxLength={200} autoComplete="email" inputMode="email" className="mt-1.5" style={big} />
      </label>
      {errLine}
      <div className="mt-5"><BigButton type="submit" disabled={busy}>{busy ? "Making the passport…" : `Make ${name}'s passport`}</BigButton></div>
      <p className="mt-3" style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted }}>We only use your email for {name}&apos;s passport and travel tips. <a href="/privacy" style={{ color: tokens.navy }}>Privacy</a></p>
    </form>
  );
  if (step === 99 && done) q = (
    <>
      <BennySays sub={`We also emailed it to ${f.email || "you"}.`}>{pet.name}&apos;s passport is ready!</BennySays>
      <div className="mt-6 rounded-3xl p-5 sm:p-6" style={{ background: "#fff", border: `2px solid ${tokens.primary}`, boxShadow: "0 18px 44px rgba(194,65,12,.14)" }}>
        <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.2 }}>Keep {pet.name}&apos;s passport</div>
        <p className="mt-1" style={{ fontFamily: B, fontSize: 17, color: tokens.ink }}>Pet Vault, {P.member} a month. Cancel anytime. It unlocks the rest of the passport:</p>
        <div className="mt-4"><LockedPages name={pet.name} /></div>
        <a href={`/passport/keep?t=${done.token}`} className="mt-5 flex items-center justify-center rounded-full" style={{ minHeight: 60, background: tokens.primary, color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 19, textDecoration: "none" }}>Keep {pet.name}&apos;s passport</a>
        <p className="mt-3 text-center" style={{ fontFamily: B, fontSize: 15, color: tokens.muted }}>We&apos;ll hold it for 7 days.</p>
      </div>
      <button type="button" onClick={startOver} className="mt-5" style={{ fontFamily: B, fontWeight: 700, fontSize: 16, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Make a passport for another pet</button>
    </>
  );

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-10 grid xl:grid-cols-[minmax(380px,1fr)_minmax(540px,600px)] gap-6 xl:gap-10 items-start">
        <section className="order-2 xl:order-1 min-w-0" aria-live="polite">
          {step > 0 && step < 99 ? (
            <div className="flex items-center justify-between mb-4">
              {back}
              <span style={{ fontFamily: B, fontSize: 15.5, fontWeight: 700, color: tokens.muted }}>Step {Math.min(step, total)} of {total}</span>
            </div>
          ) : null}
          {step > 0 && step < 99 ? (
            <div className="mb-6 rounded-full overflow-hidden" style={{ height: 8, background: tokens.line }}>
              <div style={{ width: `${(Math.min(step, total) / total) * 100}%`, height: "100%", background: tokens.primary, transition: "width .3s ease" }} />
            </div>
          ) : null}
          {q}
        </section>
        <aside className="order-1 xl:order-2 w-full max-w-[600px] mx-auto xl:sticky xl:top-6">
          <PetPassport pet={pet} photo={passportPhoto} sample justIssued={step === 99} />
          <p className="mt-2 text-center" style={{ fontFamily: B, fontSize: 14, color: tokens.muted }}>{step === 99 ? "Tap the passport to see the back." : "Your passport fills in as you go."}</p>
        </aside>
      </main>
    </div>
  );
}
