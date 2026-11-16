"use client";

import { useState } from "react";
import SiteHeader from "../../../components/SiteHeader";
import Icon from "../../../components/Icon";
import { PRICES as P } from "../../../lib/pricing";
import { tokens, font } from "../../../lib/theme";

const D = font.display;
const B = font.body;
const TEAL = "#0F766E";

const ANIMALS = [
  { id: "dog", title: "Dog", icon: "dog" },
  { id: "cat", title: "Cat", icon: "cat" },
  { id: "other", title: "Another animal", icon: "paw" },
];
const ROLES = [
  { id: "service", title: "Trained to do tasks for my disability", sub: "Like guiding, alerting, mobility help or psychiatric tasks" },
  { id: "training", title: "Still in training", sub: "Learning service dog tasks" },
  { id: "esa", title: "Helps me feel calm and supported", sub: "An emotional support animal" },
  { id: "pet", title: "My pet and best friend", sub: "No special role" },
];
const WHERE = [
  { id: "us", title: "Within the U.S.", sub: "Not Hawaii" },
  { id: "hawaii", title: "To or from Hawaii" },
  { id: "near", title: "Canada or Mexico" },
  { id: "unsure", title: "Not sure yet" },
];

function Tile({ on, onClick, title, sub, icon }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="w-full text-left rounded-2xl px-4 py-4 flex items-center gap-3" style={{ background: "#fff", border: `2px solid ${on ? tokens.navy : tokens.line}`, cursor: "pointer", boxShadow: on ? "0 6px 18px rgba(20,33,61,.12)" : "none" }}>
      {icon ? <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 44, height: 44, background: tokens.sky, color: tokens.navy }}><Icon name={icon} size={22} /></span> : null}
      <span className="min-w-0">
        <span className="block" style={{ fontFamily: B, fontWeight: 800, fontSize: 17.5, color: tokens.navy }}>{title}</span>
        {sub ? <span className="block mt-0.5" style={{ fontFamily: B, fontSize: 15, color: tokens.muted }}>{sub}</span> : null}
      </span>
    </button>
  );
}

function tripLink(pet, where) {
  const q = new URLSearchParams();
  if (pet) q.set("pet", pet);
  if (where === "us" || where === "hawaii") q.set("region", "us");
  if (where === "near") q.set("region", "near");
  return `/assessment${q.toString() ? `?${q}` : ""}`;
}

function Check({ children }) {
  return (
    <li className="flex gap-3" style={{ fontFamily: B, fontSize: 16.5, lineHeight: 1.45, color: tokens.ink }}>
      <span className="flex-shrink-0 mt-0.5" style={{ color: TEAL }}><Icon name="check" size={18} /></span><span>{children}</span>
    </li>
  );
}

function Button({ href, children, quiet = false }) {
  return (
    <a href={href} className="inline-flex items-center justify-center rounded-full px-7 min-h-[54px]" style={{ background: quiet ? "#fff" : tokens.primary, color: quiet ? tokens.navy : "#fff", border: quiet ? `1.5px solid ${tokens.line}` : "none", fontFamily: B, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>{children}</a>
  );
}

function Result({ animal, role, where, onBack }) {
  const place = where === "hawaii" ? "Hawaii" : where === "near" ? "Canada and Mexico" : "";
  const extra = place ? <Check><b>{place} entry rules apply too</b>, even for service dogs. Your Travel Pass gives you the forms and the exact dates for your flights.</Check> : null;

  if (animal === "dog" && role === "service") {
    return (
      <div>
        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "#E3F5F2", color: TEAL, fontFamily: B, fontWeight: 800, fontSize: 14 }}><Icon name="shield" size={16} /> Service dog</span>
        <h1 className="mt-3" style={{ fontFamily: D, fontWeight: 800, fontSize: 34, lineHeight: 1.08, color: tokens.navy }}>Good news: your dog flies with you in the cabin, at no charge.</h1>
        <p className="mt-3" style={{ fontFamily: B, fontSize: 17.5, lineHeight: 1.5, color: tokens.ink }}>Here&apos;s what your airline can ask for, and how your kit covers it:</p>
        <ul className="mt-4 grid gap-3" style={{ listStyle: "none", padding: 0 }}>
          <Check><b>The DOT Service Animal form.</b> We fill it in for your flight. You check the boxes and sign.</Check>
          <Check><b>Your signed handler statement</b> in your dog&apos;s passport: who trained them and what they do.</Check>
          <Check><b>Rabies vaccine on file</b>, confirmed by your vet if you like.</Check>
          <Check><b>Travel mode</b>, so everything is on one screen at the airport.</Check>
          {extra}
        </ul>
        <div className="mt-6 rounded-2xl p-4" style={{ background: "#fff", border: `2px solid ${TEAL}` }}>
          <div style={{ fontFamily: B, fontWeight: 800, fontSize: 15, color: TEAL }}>Service Dog Travel Kit</div>
          <p className="mt-1" style={{ fontFamily: B, fontSize: 15.5, lineHeight: 1.5, color: tokens.ink }}><b style={{ color: tokens.navy, fontSize: 20 }}>{P.joinToday}</b> to start: Pet Vault&apos;s first month and a Travel Pass at the member price. Cancel Pet Vault anytime.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={tripLink("service", where)}>Plan my dog&apos;s trip</Button>
          <Button href="/join" quiet>Start the passport</Button>
        </div>
        <Back onBack={onBack} />
      </div>
    );
  }

  if (animal === "dog" && role === "training") {
    return (
      <div>
        <h1 style={{ fontFamily: D, fontWeight: 800, fontSize: 34, lineHeight: 1.08, color: tokens.navy }}>For now, your dog flies as a pet.</h1>
        <p className="mt-3" style={{ fontFamily: B, fontSize: 17.5, lineHeight: 1.5, color: tokens.ink }}>U.S. airlines don&apos;t have to accept service dogs in training as service animals, so plan for pet rules: a fee, and a carrier if your dog flies in the cabin.</p>
        <ul className="mt-4 grid gap-3" style={{ listStyle: "none", padding: 0 }}>
          <Check>We&apos;ll show you every airline&apos;s pet fee and carrier size for your route.</Check>
          <Check>Start the passport now. When training is done, sign the service dog statement and it switches over.</Check>
          {extra}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={tripLink("dog", where)}>Compare airlines for my trip</Button>
          <Button href="/join" quiet>Start the passport</Button>
        </div>
        <Back onBack={onBack} />
      </div>
    );
  }

  const isEsa = role === "esa";
  const pet = animal === "cat" ? "cat" : animal === "dog" ? (isEsa ? "esa" : "dog") : "";
  const name = animal === "cat" ? "cat" : animal === "dog" ? "dog" : "pet";
  return (
    <div>
      <h1 style={{ fontFamily: D, fontWeight: 800, fontSize: 34, lineHeight: 1.08, color: tokens.navy }}>{isEsa ? `Your support ${name} can fly, as a pet.` : `Your ${name} can fly with you.`}</h1>
      <p className="mt-3" style={{ fontFamily: B, fontSize: 17.5, lineHeight: 1.5, color: tokens.ink }}>
        {isEsa ? "Since 2021, U.S. airlines treat emotional support animals as pets. That means a pet fee and a carrier, but most airlines welcome small dogs and cats in the cabin." : animal === "other" ? "Most U.S. airlines only take dogs and cats, and a few take rabbits or small birds. We'll show you which ones fly your route." : "Most airlines welcome small dogs and cats in the cabin for a fee. Fees and carrier sizes differ a lot between airlines."}
      </p>
      <ul className="mt-4 grid gap-3" style={{ listStyle: "none", padding: 0 }}>
        <Check>See every airline&apos;s pet fee and carrier size for your route, cheapest first.</Check>
        <Check>Simple U.S. flights get a free checklist. Trips with paperwork get a Travel Pass with every form and date.</Check>
        {extra}
      </ul>
      {isEsa ? (
        <div className="mt-5 rounded-2xl p-4" style={{ background: "#FFF8EB", border: "1px solid #F5D9A4", fontFamily: B, fontSize: 15.5, lineHeight: 1.5, color: tokens.ink }}>
          <b style={{ color: tokens.navy }}>Is your dog trained to do tasks for a psychiatric disability?</b> Then it may be a psychiatric service dog, which flies at no charge. <button type="button" onClick={onBack} style={{ color: tokens.navy, fontWeight: 800, background: "none", border: "none", padding: 0, textDecoration: "underline", cursor: "pointer", font: "inherit" }}>Change my answer</button>. For housing, your ESA letter still matters: <a href="/guides" style={{ color: tokens.navy, fontWeight: 800 }}>see your state&apos;s rules</a>.
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={tripLink(pet, where)}>Compare airlines for my trip</Button>
      </div>
      <Back onBack={onBack} />
    </div>
  );
}

function Back({ onBack }) {
  return <button type="button" onClick={onBack} className="mt-6 block" style={{ fontFamily: B, fontWeight: 700, fontSize: 15, color: tokens.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Change my answers</button>;
}

export default function KitQuiz() {
  const [step, setStep] = useState(0);
  const [animal, setAnimal] = useState("");
  const [role, setRole] = useState("");
  const [where, setWhere] = useState("");
  const total = animal === "dog" ? 3 : 2;
  const qIndex = step === 0 ? 1 : step === 1 ? 2 : total;

  const pickAnimal = (a) => { setAnimal(a); setRole(a === "dog" ? "" : "pet"); setStep(a === "dog" ? 1 : 2); };
  const pickRole = (r) => { setRole(r); setStep(2); };
  const pickWhere = (w) => { setWhere(w); setStep(3); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {} };
  const back = () => { setStep(0); setAnimal(""); setRole(""); setWhere(""); };

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[620px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {step < 3 ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <span style={{ fontFamily: B, fontWeight: 800, fontSize: 14.5, color: tokens.muted }}>Question {qIndex} of {total}</span>
              {step > 0 ? <button type="button" onClick={() => setStep(step === 2 && animal === "dog" ? 1 : 0)} style={{ fontFamily: B, fontWeight: 700, fontSize: 15, color: tokens.navy, background: "none", border: "none", cursor: "pointer" }}>← Back</button> : null}
            </div>
            <div className="mt-2 rounded-full overflow-hidden" style={{ height: 6, background: tokens.line }}>
              <div style={{ width: `${(qIndex / total) * 100}%`, height: "100%", background: tokens.primary, transition: "width .25s ease" }} />
            </div>
          </>
        ) : null}

        {step === 0 ? (
          <section className="mt-6">
            <h1 style={{ fontFamily: D, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: tokens.navy }}>Who&apos;s flying with you?</h1>
            <div className="mt-5 grid gap-3">{ANIMALS.map((a) => <Tile key={a.id} on={animal === a.id} onClick={() => pickAnimal(a.id)} title={a.title} icon={a.icon} />)}</div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="mt-6">
            <h1 style={{ fontFamily: D, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: tokens.navy }}>What does your dog do for you?</h1>
            <div className="mt-5 grid gap-3">{ROLES.map((r) => <Tile key={r.id} on={role === r.id} onClick={() => pickRole(r.id)} title={r.title} sub={r.sub} />)}</div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-6">
            <h1 style={{ fontFamily: D, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: tokens.navy }}>Where are you flying?</h1>
            <div className="mt-5 grid gap-3">{WHERE.map((w) => <Tile key={w.id} on={where === w.id} onClick={() => pickWhere(w.id)} title={w.title} sub={w.sub} />)}</div>
          </section>
        ) : null}

        {step === 3 ? <section aria-live="polite"><Result animal={animal} role={role} where={where} onBack={back} /></section> : null}
      </main>
    </div>
  );
}
