"use client";

import { useEffect, useRef, useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import PetPassport from "../../../components/PetPassport";
import BreedInput from "../../../components/BreedInput";
import { BennySays, LockedPages } from "../../../components/passport/BennyGuide";
import PassportReveal from "../../../components/PassportReveal";
import { supabase } from "../../../lib/supabaseClient";
import { usePetAccess } from "../../../lib/access";
import { PRICES as P } from "../../../lib/pricing";
import { tokens, font } from "../../../lib/theme";
import { TRAINED_BY, TASK_GROUPS, cleanTrainerText } from "../../../lib/training";

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

const EMPTY_FORM = { animal_type: "", role: "", name: "", breed: "", sex: "", month: "", year: "", handler_name: "", email: "", weight: "", trained_by: "", trainer_name: "", trainer_business: "", tasks: "", vet_name: "", vet_phone: "", rabies_exp: "", signed_name: "", attest: "" };

export default function CreatePassport() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState(EMPTY_FORM);
  const [user, setUser] = useState(null); // signed in: { id, email }
  const [reveal, setReveal] = useState(null); // { at, petId? }
  const access = usePetAccess(user?.id);
  const [photo, setPhoto] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { token, at }
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { const u = data?.session?.user; if (u) setUser({ id: u.id, email: u.email || "" }); }); }, []);
  const camRef = useRef(null);
  const libRef = useRef(null);
  const loaded = useRef(false);

  // Everything saves as she goes.
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s?.f) { const clean = Object.fromEntries(Object.entries(s.f).map(([k, v]) => [k, typeof v === "string" ? v : ""])); setF((x) => ({ ...x, ...clean })); if (s.photo) setPhoto(s.photo); if (s.done) setDone(s.done); setStep(s.done ? 99 : [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14].includes(s.step) ? s.step : 0); }
    } catch {}
    // Coming from the service dog path: a dog, as a service animal.
    try {
      const forWho = new URLSearchParams(window.location.search).get("for");
      const preset = forWho === "service" ? { animal_type: "Dog", role: "Service animal" } : forWho === "esa" ? { role: "Emotional support animal" } : forWho === "pet" ? { role: "Pet" } : null;
      // A saved draft for a different kind of pet (for example a service dog draft,
      // then arriving from the ESA page) starts fresh with this page's choice.
      if (preset) setF((x) => {
        if (!x.animal_type && !x.role) return { ...x, ...preset };
        if (x.role === preset.role) return x;
        setStep(0); setPhoto(""); setDone(null);
        return { ...EMPTY_FORM, ...preset };
      });
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
  // Service dogs get a few more passport questions (Benny collects what the DOT form
  // needs) and sign their promise before the reveal. Everyone else goes 1-7.
  const svc = f.role === "Service animal" && f.animal_type !== "Cat";
  const ORDER = svc ? [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 7] : [1, 2, 3, 4, 5, 6, 7];
  const nextOf = (n) => ORDER[ORDER.indexOf(n) + 1] ?? 7;
  const prevOf = (n) => (ORDER.indexOf(n) > 0 ? ORDER[ORDER.indexOf(n) - 1] : 0);
  const taskList = f.tasks ? f.tasks.split(",").filter(Boolean) : [];
  const toggleTask = (k) => set("tasks")((taskList.includes(k) ? taskList.filter((x) => x !== k) : [...taskList, k]).join(","));

  const pet = {
    id: "sample-draft", name: f.name.trim() || "Your pet", animal_type: f.animal_type, role: f.role || "Pet",
    breed: f.breed.trim(), sex: f.sex, date_of_birth: dob, handler_name: f.handler_name.trim(),
    weight_lb: Number(f.weight) > 0 ? Number(f.weight) : null,
    training: svc && f.trained_by ? { levels: ["tasks"], trained_by: f.trained_by, tasks: taskList } : null,
    service_attested_at: svc && f.attest && f.signed_name.trim() ? new Date().toISOString() : null,
    passport_no: "PPG-PREVIEW", passport_issued_at: done?.at || null,
  };
  const passportPhoto = photo ? <img src={photo} alt={f.name || "Your pet"} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null;

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try { setPhoto(await shrink(file)); go(4); } catch { setErr("That photo didn't open. Try another one."); }
  }

  const serviceData = () => svc ? { weight: f.weight, trained_by: f.trained_by, trainer_name: f.trainer_name, trainer_business: f.trainer_business, tasks: taskList, vet_name: f.vet_name, vet_phone: f.vet_phone, rabies_exp: f.rabies_exp, signed_name: f.signed_name, attest: f.attest === "1" } : null;
  const draftData = () => ({ animal_type: pet.animal_type || "Dog", role: pet.role, name: pet.name, breed: pet.breed, sex: pet.sex, date_of_birth: dob, handler_name: pet.handler_name, service: serviceData() });

  // Members (and travelers with a paid trip) save straight to their account.
  async function saveToAccount() {
    const { data: created, error } = await supabase.from("pets").insert({
      user_id: user.id, name: pet.name, animal_type: pet.animal_type || "Dog", role: pet.role,
      breed: pet.breed || null, sex: pet.sex || null, date_of_birth: dob || null,
      handler_name: pet.handler_name || null, passport_issued_at: new Date().toISOString(),
      ...(svc ? { weight_lb: Number(f.weight) > 0 ? Number(f.weight) : null, vet_name: f.vet_name.trim() || null, vet_phone: f.vet_phone.trim() || null } : {}),
    }).select("id").single();
    if (error || !created) return { limit: /PET_LIMIT/.test(error?.message || "") };
    if (svc) {
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(f.rabies_exp)) await supabase.from("pet_health_records").insert({ pet_id: created.id, user_id: user.id, kind: "vaccine", name: "Rabies", expires_on: f.rabies_exp });
        const { data: sess } = await supabase.auth.getSession();
        await fetch("/api/service-statement", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": sess?.session?.access_token || "" }, body: JSON.stringify({ pet_id: created.id, signed_name: f.signed_name, agree: f.attest === "1", tasks: taskList, trained_by: f.trained_by, trainer_name: f.trainer_name, trainer_business: f.trainer_business, show_tasks: false }) });
      } catch {}
    }
    if (photo) {
      try {
        const blob = await (await fetch(photo)).blob();
        const path = `${user.id}/${created.id}/profile-photo-${Date.now()}.jpg`;
        const up = await supabase.storage.from("pet-documents").upload(path, blob, { contentType: "image/jpeg" });
        if (!up.error) await supabase.from("pets").update({ photo_url: path }).eq("id", created.id).eq("user_id", user.id);
      } catch {}
    }
    return { id: created.id };
  }

  async function finish(e) {
    e.preventDefault();
    const email = user?.email || f.email.trim();
    if (!user && !/^\S+@\S+\.\S+$/.test(email)) { setErr("Please check your email address."); return; }
    setBusy(true); setErr("");
    try {
      if (user && access.allowed) {
        const r = await saveToAccount();
        if (r.id) { try { localStorage.removeItem(KEY); } catch {} setReveal({ at: new Date().toISOString(), petId: r.id }); setBusy(false); return; }
        if (!r.limit) throw new Error("We couldn't save the passport. Please try again.");
      }
      const r = await fetch("/api/passport-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, photo, data: draftData() }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      const at = new Date().toISOString();
      setDone({ token: j.token, at });
      setReveal({ at });
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  function afterReveal() {
    const id = reveal?.petId;
    setReveal(null);
    if (id) { window.location.href = `/account?pet=${id}`; return; }
    setStep(99);
  }

  function startOver() {
    try { localStorage.removeItem(KEY); } catch {}
    setF({ animal_type: "", role: "", name: "", breed: "", sex: "", month: "", year: "", handler_name: "", email: "", weight: "", trained_by: "", trainer_name: "", trainer_business: "", tasks: "", vet_name: "", vet_phone: "", rabies_exp: "", signed_name: "", attest: "" });
    setPhoto(""); setDone(null); setStep(0);
  }

  const total = ORDER.length;
  const stepNo = Math.max(1, ORDER.indexOf(step) + 1);
  const years = Array.from({ length: 26 }, (_, i) => String(new Date().getFullYear() - i));
  const errLine = err ? <p role="alert" className="mt-3" style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.primary }}>{err}</p> : null;
  const back = step > 0 && step < 99 ? <button type="button" onClick={() => go(prevOf(step))} style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.navy, background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}>← Back</button> : null;

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
      <BennySays sub={f.animal_type === "Cat" ? "Either way, the passport keeps everything in one place." : "This sets the seal on the passport."}>What does {name} do for you?</BennySays>
      <div className="mt-6 grid gap-3">
        <Choice on={f.role === "Pet"} onClick={() => { set("role")("Pet"); go(3); }}>{name} is my pet</Choice>
        {f.animal_type !== "Cat" ? <Choice on={f.role === "Service animal"} onClick={() => { set("role")("Service animal"); go(3); }} sub="Trained to do tasks for a disability, including psychiatric service dogs">Service dog</Choice> : null}
        <Choice on={f.role === "Emotional support animal"} onClick={() => set("role")("Emotional support animal")} sub="Comfort and support at home">Emotional support animal</Choice>
      </div>
      {f.role === "Emotional support animal" ? (
        <div className="mt-5 rounded-2xl p-4" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
          <p style={{ fontFamily: B, fontSize: 17, lineHeight: 1.5, color: tokens.ink }}><b style={{ color: "#991B1B" }}>Good to know:</b> on U.S. flights, emotional support animals fly as pets. That means the airline&apos;s regular pet fee and pet rules, not free. {name}&apos;s passport still keeps everything in one place.</p>
          <div className="mt-4"><BigButton onClick={() => go(3)}>Got it</BigButton></div>
        </div>
      ) : null}
    </>
  );
  if (step === 3) q = (
    <>
      <BennySays sub="A clear photo of their face works best. You can change it anytime.">What a lovely name! Do you have a favorite photo of {name}?</BennySays>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} hidden />
      <input ref={libRef} type="file" accept="image/*" onChange={pickPhoto} hidden />
      <div className="mt-6 grid gap-3">
        <Choice onClick={() => libRef.current?.click()} sub="Pick one you already have">Choose from my photos</Choice>
        <Choice onClick={() => camRef.current?.click()} sub="Use your phone's camera">Take a photo now</Choice>
      </div>
      {errLine}
      <button type="button" onClick={() => go(4)} className="mt-4" style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Skip for now</button>
    </>
  );
  if (step === 4) q = (
    <form onSubmit={(e) => { e.preventDefault(); go(5); }}>
      <BennySays sub="Mixed or not sure? Just type what you think.">What kind of {kind} is {name}?</BennySays>
      <div className="mt-6"><BreedInput value={f.breed} onChange={(e) => set("breed")(e?.target ? e.target.value : String(e || ""))} animal={f.animal_type || "Dog"} style={big} placeholder="Like Dachshund or Mixed" aria-label="Breed" /></div>
      <div className="mt-5 flex flex-wrap gap-3"><BigButton type="submit">Next</BigButton></div>
    </form>
  );
  if (step === 5) q = (
    <>
      <BennySays>Is {name} a boy or a girl?</BennySays>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Choice on={f.sex === "Male"} onClick={() => { set("sex")("Male"); go(6); }}>Boy</Choice>
        <Choice on={f.sex === "Female"} onClick={() => { set("sex")("Female"); go(6); }}>Girl</Choice>
      </div>
    </>
  );
  if (step === 6) q = (
    <form onSubmit={(e) => { e.preventDefault(); go(nextOf(6)); }}>
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
        <button type="button" onClick={() => { setF((x) => ({ ...x, month: "", year: "" })); go(nextOf(6)); }} style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>I&apos;m not sure</button>
      </div>
    </form>
  );

  const tName = cleanTrainerText(f.trainer_name), tBiz = cleanTrainerText(f.trainer_business);
  const trainerErr = f.trained_by === "trainer" ? tName.error || tBiz.error || "" : f.trained_by === "program" ? tBiz.error || "" : "";
  if (step === 10) q = (
    <form onSubmit={(e) => { e.preventDefault(); go(nextOf(10)); }}>
      <BennySays sub="A guess is fine. Airlines like to know.">About how much does {name} weigh?</BennySays>
      <div className="mt-6 flex items-center gap-3">
        <input type="number" inputMode="decimal" min="1" max="250" value={f.weight} onChange={(e) => set("weight")(e.target.value.slice(0, 5))} aria-label="Weight in pounds" style={{ ...big, maxWidth: 200 }} />
        <span style={{ fontFamily: B, fontSize: 20, fontWeight: 700, color: tokens.navy }}>lb</span>
      </div>
      <div className="mt-5"><BigButton type="submit">Next</BigButton></div>
    </form>
  );
  if (step === 11) q = (
    <form onSubmit={(e) => { e.preventDefault(); if (!f.trained_by) { setErr(`Who trained ${name}?`); return; } if (trainerErr) { setErr(trainerErr); return; } if (f.trained_by === "trainer" && !f.trainer_name.trim() && !f.trainer_business.trim()) { setErr("Add the trainer's name or business."); return; } if (f.trained_by === "program" && !f.trainer_business.trim()) { setErr("Add the program's name."); return; } go(nextOf(11)); }}>
      <BennySays sub="Every great service dog has a teacher.">Who trained {name}?</BennySays>
      <div className="mt-6 grid gap-3">
        {TRAINED_BY.map(([k, l]) => <Choice key={k} on={f.trained_by === k} onClick={() => set("trained_by")(k)}>{l}</Choice>)}
      </div>
      {f.trained_by === "trainer" ? (
        <div className="mt-4 grid gap-3">
          <input value={f.trainer_name} onChange={(e) => set("trainer_name")(e.target.value)} maxLength={80} placeholder="Trainer's name" aria-label="Trainer's name" style={big} />
          <input value={f.trainer_business} onChange={(e) => set("trainer_business")(e.target.value)} maxLength={80} placeholder="Their business" aria-label="Trainer's business" style={big} />
        </div>
      ) : f.trained_by === "program" ? (
        <input value={f.trainer_business} onChange={(e) => set("trainer_business")(e.target.value)} maxLength={80} placeholder="Program name" aria-label="Program name" className="mt-4" style={big} />
      ) : null}
      {errLine}
      <div className="mt-5"><BigButton type="submit">Next</BigButton></div>
    </form>
  );
  if (step === 12) q = (
    <>
      <BennySays sub="Pick everything that fits. Only the kind of help can show on the passport.">What does {name} help you with?</BennySays>
      <div className="mt-5 grid gap-4">
        {TASK_GROUPS.map((g) => (
          <div key={g.key}>
            <div style={{ fontFamily: B, fontSize: 15, fontWeight: 800, color: tokens.navy, marginBottom: 6 }}>{g.label.replace(/ tasks$/, "")}</div>
            <div className="flex flex-wrap gap-2">
              {g.tasks.map(([k, l]) => {
                const on = taskList.includes(k);
                return <button key={k} type="button" onClick={() => toggleTask(k)} aria-pressed={on} className="rounded-full px-4 py-2.5" style={{ fontFamily: B, fontSize: 15.5, fontWeight: 700, cursor: "pointer", background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `2px solid ${on ? tokens.navy : tokens.line}` }}>{on ? "✓ " : ""}{l}</button>;
              })}
            </div>
          </div>
        ))}
      </div>
      {errLine}
      <div className="mt-6"><BigButton onClick={() => { if (!taskList.length) { setErr(`Pick at least one way ${name} helps you.`); return; } go(nextOf(12)); }}>Next</BigButton></div>
    </>
  );
  if (step === 13) q = (
    <form onSubmit={(e) => { e.preventDefault(); go(nextOf(13)); }}>
      <BennySays sub="So everything is in one place when you fly.">Who&apos;s {name}&apos;s vet?</BennySays>
      <div className="mt-6 grid gap-3">
        <input value={f.vet_name} onChange={(e) => set("vet_name")(e.target.value)} maxLength={80} placeholder="Vet or clinic name" aria-label="Vet or clinic name" style={big} />
        <input type="tel" value={f.vet_phone} onChange={(e) => set("vet_phone")(e.target.value)} maxLength={30} placeholder="Clinic phone" aria-label="Clinic phone" inputMode="tel" style={big} />
        <label className="block">
          <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Rabies vaccine good until</span>
          <input type="date" value={f.rabies_exp} onChange={(e) => set("rabies_exp")(e.target.value)} aria-label="Rabies vaccine expiration date" className="mt-1.5" style={big} />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <BigButton type="submit">Next</BigButton>
        <button type="button" onClick={() => go(nextOf(13))} style={{ fontFamily: B, fontWeight: 700, fontSize: 17, color: tokens.muted, background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>I&apos;ll add this later</button>
      </div>
    </form>
  );
  const PROMISE = [
    `${name} is trained to do tasks that help me with a disability.`,
    `${name} is well-behaved in public, house trained, and stays right with me.`,
    "I understand that false statements about a service animal can lead to fines and other penalties under federal law.",
  ];
  if (step === 14) q = (
    <form onSubmit={(e) => { e.preventDefault(); if (f.attest !== "1") { setErr("Check each line to sign."); return; } const n = f.signed_name.trim().replace(/\s+/g, " "); if (n.length < 3 || !/\s/.test(n)) { setErr("Sign with your first and last name."); return; } go(nextOf(14)); }}>
      <BennySays sub="This goes on your DOT form too, so it's ready every time you fly.">Last thing for {name}: your service dog promise.</BennySays>
      <div className="mt-6 rounded-3xl p-5 sm:p-6" style={{ background: "#fff", border: "2px solid #1D4ED8", boxShadow: "0 14px 36px rgba(29,78,216,.12)" }}>
        <span className="ppg-badge ppg-badge-service inline-flex items-center rounded-full px-3 py-1" style={{ color: "#fff", fontFamily: B, fontWeight: 800, fontSize: 12.5, letterSpacing: ".08em" }}>SERVICE DOG</span>
        <ul className="mt-4 grid gap-3">
          {PROMISE.map((t) => (
            <li key={t} className="flex items-start gap-3" style={{ fontFamily: B, fontSize: 17, lineHeight: 1.45, color: tokens.ink }}>
              <span aria-hidden="true" className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 26, height: 26, marginTop: 1, background: f.attest === "1" ? "#1D4ED8" : "#E0E7FF", color: "#fff", fontWeight: 900, fontSize: 14 }}>{f.attest === "1" ? "✓" : ""}</span>{t}
            </li>
          ))}
        </ul>
        <label className="mt-5 flex items-start gap-3" style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy, cursor: "pointer" }}>
          <input type="checkbox" checked={f.attest === "1"} onChange={(e) => set("attest")(e.target.checked ? "1" : "")} style={{ width: 24, height: 24, marginTop: 2, accentColor: "#1D4ED8" }} />
          <span>All of this is true. I agree to the <a href="/terms#service-dogs" target="_blank" rel="noreferrer" style={{ color: tokens.navy }}>Terms</a>.</span>
        </label>
        <label className="block mt-5">
          <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Sign with your full name</span>
          <input value={f.signed_name} onChange={(e) => set("signed_name")(e.target.value)} maxLength={120} autoComplete="name" className="mt-1.5" style={{ ...big, fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: 26 }} placeholder="Your full name" />
        </label>
      </div>
      {errLine}
      <div className="mt-5"><BigButton type="submit">Sign and continue</BigButton></div>
    </form>
  );
  if (step === 7) q = (
    <form onSubmit={finish}>
      <BennySays sub={user ? "" : `We'll email you ${name}'s passport. No password needed.`}>{user ? `Last step! Ready to make ${name}'s passport?` : <>Last step! Where should we send {name}&apos;s passport?</>}</BennySays>
      <label className="block mt-6">
        <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Your full name</span>
        <input value={f.handler_name} onChange={(e) => set("handler_name")(e.target.value)} maxLength={60} autoComplete="name" className="mt-1.5" style={big} />
        <span className="block mt-1.5" style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted }}>Shown on {name}&apos;s passport as {svc ? "the handler" : "the owner"}. Anything you share shows only your first name and last initial.</span>
        </label>
      {user ? (
        <p className="mt-4" style={{ fontFamily: B, fontSize: 17, color: tokens.ink }}>{access.allowed ? `It goes straight into your account.` : `We'll send it to ${user.email}.`}</p>
      ) : (
        <>
        <label className="block mt-4">
        <span style={{ fontFamily: B, fontSize: 17, fontWeight: 700, color: tokens.navy }}>Your email</span>
        <input type="email" value={f.email} onChange={(e) => set("email")(e.target.value)} maxLength={200} autoComplete="email" inputMode="email" className="mt-1.5" style={big} />
        </label>
        </>
      )}
      {errLine}
      <div className="mt-5"><BigButton type="submit" disabled={busy}>{busy ? "Making the passport…" : `Make ${name}'s passport`}</BigButton></div>
      {user ? null : <p className="mt-3" style={{ fontFamily: B, fontSize: 14.5, color: tokens.muted }}>We only use your email for {name}&apos;s passport and travel tips. <a href="/privacy" style={{ color: tokens.navy }}>Privacy</a></p>}
    </form>
  );
  if (step === 99 && done) q = (
    <>
      <BennySays sub={`We also emailed it to ${user?.email || f.email || "you"}.`}>{pet.name}&apos;s passport is ready!</BennySays>
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
      {reveal ? <PassportReveal pet={{ ...pet, passport_issued_at: reveal.at }} photo={passportPhoto} issuedAt={reveal.at} onClose={afterReveal} preview={!reveal.petId} /> : null}
      <SiteHeader />
      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-10 grid xl:grid-cols-[minmax(380px,1fr)_minmax(540px,600px)] gap-6 xl:gap-10 items-start">
        <section className="order-2 xl:order-1 min-w-0" aria-live="polite">
          {step > 0 && step < 99 ? (
            <div className="flex items-center justify-between mb-4">
              {back}
              <span style={{ fontFamily: B, fontSize: 15.5, fontWeight: 700, color: tokens.muted }}>Step {stepNo} of {total}</span>
            </div>
          ) : null}
          {step > 0 && step < 99 ? (
            <div className="mb-6 rounded-full overflow-hidden" style={{ height: 8, background: tokens.line }}>
              <div style={{ width: `${(stepNo / total) * 100}%`, height: "100%", background: tokens.primary, transition: "width .3s ease" }} />
            </div>
          ) : null}
          {q}
        </section>
        <aside className="order-1 xl:order-2 w-full max-w-[600px] mx-auto xl:sticky xl:top-6">
          <div className="ppg-mini-pp">
          <PetPassport pet={pet} photo={passportPhoto} sample justIssued={step === 99} />
          </div>
          <p className="mt-2 text-center" style={{ fontFamily: B, fontSize: 14, color: tokens.muted }}>{step === 99 ? "Tap the passport to see the back." : "Your passport fills in as you go."}</p>
        </aside>
      </main>
    </div>
  );
}
