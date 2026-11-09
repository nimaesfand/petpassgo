"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";
import Fold from "./Fold";
import PetQr from "../../lib/PetQr";
import { Wordmark } from "../Logo";
import { savePetIdImage } from "../PetIdV2";
import { supabase } from "../../lib/supabaseClient";
import { tokens, font } from "../../lib/theme";
import { fmtDob, weightLabel, profileUrl, profileLabel, filled } from "../../lib/petProfile";
import { SECTION_THEME } from "../../lib/petSections";

const T = SECTION_THEME.id;

const TOGGLES = [
  ["show_contact_on_public_id", "Emergency contact", "phone", (p) => [p.emergency_contact_name, p.emergency_contact_phone].filter(Boolean).join(" · ")],
  ["show_medical_on_public", "Medical notes and vet", "health", (p) => [p.allergies && `Allergies: ${p.allergies}`, p.vet_name && `Vet: ${p.vet_name}`].filter(Boolean).join(" · ")],
  ["show_dob_on_public", "Birthday", "calendar", (p) => fmtDob(p.date_of_birth)],
  ["show_weight_on_public", "Weight", "scale", (p) => weightLabel(p.weight_lb)],
  ["show_sex_on_public", "Sex", "paw", (p) => p.sex],
  ["show_color_on_public", "Color", "sparkle", (p) => p.color],
  ["show_about_on_public", "About text", "chat", (p) => p.about_bio],
  ["show_documents_on_public", "Documents", "file", () => ""],
  ["show_housing_on_public", "Housing info", "home", (p) => p.housing_notes],
  ["show_travel_on_public", "Paid trips", "plane", () => ""],
];

function Switch({ on, onClick, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className="flex-shrink-0"
      style={{ width: 50, height: 30, borderRadius: 999, border: "none", cursor: "pointer", background: on ? T.color : "#CBD3DE", position: "relative", transition: "background .2s" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s" }} />
    </button>
  );
}

function ActionTile({ icon, title, sub, onClick, href, busy }) {
  const inner = (
    <>
      <span className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: T.soft, color: T.color }}><Icon name={icon} size={21} /></span>
      <span className="block text-center" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 13.5, color: tokens.navy, lineHeight: 1.15 }}>{busy || title}</span>
      <span className="hidden sm:block text-center" style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }}>{sub}</span>
    </>
  );
  const cls = "ppg-lift flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 min-w-0";
  const style = { background: "#fff", border: `1.5px solid ${tokens.line}`, cursor: "pointer", textDecoration: "none" };
  return href
    ? <a href={href} target="_blank" rel="noopener" className={cls} style={style}>{inner}</a>
    : <button type="button" onClick={onClick} className={cls} style={style}>{inner}</button>;
}


function CardFront({ pet, photo }) {
  const facts = [["Born", fmtDob(pet.date_of_birth)], ["Weight", weightLabel(pet.weight_lb)], ["Sex", pet.sex]].filter(([, v]) => filled(v));
  return (
    <div className="ppg-idcard relative overflow-hidden rounded-[22px] p-4 sm:p-5 h-full" style={{ background: `linear-gradient(135deg, ${T.color} 0%, #115E59 45%, ${tokens.navy} 100%)`, color: "#fff", boxShadow: "0 18px 40px rgba(15,94,89,.35)" }}>
      <div aria-hidden="true" className="ppg-hero-paws" />
      <div aria-hidden="true" className="absolute" style={{ right: -40, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(242,184,75,.16)" }} />
      <div className="relative flex items-center justify-between">
        <Wordmark size={18} onDark />
        <span className="rounded-full px-2.5 py-0.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 800, fontSize: 10.5, letterSpacing: ".14em" }}>PET ID</span>
      </div>
      <div className="relative flex gap-4 mt-4 items-center">
        <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 88, height: 104, border: `3px solid ${tokens.gold}`, background: "#E8EEF7" }}>{photo}</div>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 28, lineHeight: 1, overflowWrap: "anywhere" }}>{pet.name}</div>
          <div className="mt-1" style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{[pet.breed || pet.animal_type].filter(Boolean).join(" · ")}</div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {facts.map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: ".12em", color: tokens.gold }}>{k.toUpperCase()}</div>
                <div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative mt-4 flex items-center justify-between">
        <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, fontWeight: 700, letterSpacing: ".08em" }}>{pet.passport_no || ""}</div>
        <div className="flex items-center gap-1.5" style={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 800, opacity: .9 }}>Tap to flip <Icon name="repeat" size={14} /></div>
      </div>
    </div>
  );
}

// The Pet ID tab: the card itself first (tap to flip to the QR), quick actions,
// then a live "what a stranger sees" preview with simple switches.
export default function PetIdStudio({ pet, userId, photo, card, onChanged, onRemove }) {
  const [flipped, setFlipped] = useState(false);
  const [local, setLocal] = useState({});
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState("");
  const [wallet, setWallet] = useState(false);
  const [askRemove, setAskRemove] = useState(false);

  useEffect(() => { setLocal({}); }, [pet.id, pet.updated_at]);
  useEffect(() => {
    let live = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const r = await fetch("/api/pet-wallet", { headers: { "x-sb-token": data?.session?.access_token || "" } }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      if (live) setWallet(!!j.available);
    }).catch(() => {});
    return () => { live = false; };
  }, [pet.id]);

  const isOn = (k) => (k in local ? local[k] : !!pet[k]);
  async function flip(k) {
    const v = !isOn(k);
    setLocal((s) => ({ ...s, [k]: v }));
    const { error } = await supabase.from("pets").update({ [k]: v }).eq("id", pet.id).eq("user_id", userId);
    if (error) setLocal((s) => ({ ...s, [k]: !v })); else onChanged?.();
  }
  async function copy() {
    try { await navigator.clipboard.writeText(profileUrl(pet)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  }
  async function saveImage() {
    setBusy("png");
    try { await savePetIdImage(pet); window.dispatchEvent(new CustomEvent("ppg-qr-done")); } finally { setBusy(""); }
  }
  async function addWallet() {
    setBusy("wallet");
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/pet-wallet", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: pet.id }) });
      if (!r.ok) { setWallet(false); return; }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(pet.name || "pet").replace(/[^a-z0-9]+/gi, "-")}-pet-id.pkpass`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } finally { setBusy(""); }
  }

  const visible = TOGGLES.filter(([k]) => isOn(k));

  return (
    <div className="grid grid-cols-1 gap-4 min-w-0">
      {/* The card */}
      <section className="w-full mx-auto" style={{ maxWidth: 460 }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>Scan the QR and a finder can reach you.</div>
          <button type="button" onClick={() => setFlipped((f) => !f)} className="ppg-btn ppg-btn-secondary flex-shrink-0" style={{ borderColor: T.color, color: T.color }}>
            <Icon name="repeat" size={16} /> {flipped ? "Front" : "QR side"}
          </button>
        </div>
        <div className="ppg-flip" data-flipped={flipped ? "1" : "0"} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0} aria-label="Flip the ID card" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}>
          <div className="ppg-flip-inner">
            <div className="ppg-flip-face"><CardFront pet={pet} photo={photo} /></div>
            <div className="ppg-flip-face ppg-flip-back rounded-[22px] flex flex-col items-center justify-center p-4 text-center" style={{ background: tokens.navy, color: "#fff" }}>
              <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 12, letterSpacing: "0.16em", color: tokens.gold }}>SCAN IF FOUND</div>
              <div className="rounded-2xl p-3 mt-3" style={{ background: "#fff" }}>
                <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={112} color={tokens.navy} />
              </div>
              <div className="mt-2" style={{ fontFamily: font.body, fontSize: 13, opacity: 0.85 }}>{profileLabel(pet)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${wallet ? 4 : 3}, minmax(0,1fr))` }}>
        <ActionTile icon="smartphone" title="Save to phone" sub="Card image with QR" onClick={saveImage} busy={busy === "png" ? "Saving…" : ""} />
        <ActionTile icon="link" title={copied ? "Copied!" : "Copy link"} sub="Share the profile" onClick={copy} />
        <ActionTile icon="external" title="Public page" sub="What a finder sees" href={profileUrl(pet)} />
        {wallet ? <ActionTile icon="bag" title="Apple Wallet" sub="Next to your cards" onClick={addWallet} busy={busy === "wallet" ? "Preparing…" : ""} /> : null}
      </div>

      {/* Privacy: switches + live preview */}
      <Fold icon="lock" color={T.color} soft={T.soft} title="What people see when they scan" hint={`Name, photo, breed + ${visible.length} you chose`}>
        <p className="mb-3" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>Name, photo, breed and a "message the owner" button always show. You choose the rest.</p>
        <div className="grid lg:grid-cols-[1fr_300px] gap-5">
          <ul className="grid gap-1" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {TOGGLES.map(([k, label, icon]) => (
              <li key={k} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: isOn(k) ? T.soft : "transparent", transition: "background .2s" }}>
                <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 36, height: 36, background: isOn(k) ? "#fff" : tokens.sky, color: isOn(k) ? T.color : tokens.muted }}><Icon name={icon} size={18} /></span>
                <span className="flex-1" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{label}</span>
                <Switch on={isOn(k)} onClick={() => flip(k)} label={`Show ${label.toLowerCase()} on the public page`} />
              </li>
            ))}
          </ul>
          <div className="lg:sticky lg:top-20 self-start mx-auto w-full" style={{ maxWidth: 300 }}>
            <div className="rounded-[34px] p-2.5" style={{ background: tokens.navy, boxShadow: "0 18px 40px rgba(20,33,61,.25)" }}>
              <div className="rounded-[26px] overflow-hidden" style={{ background: tokens.sky }}>
                <div className="px-4 py-2 text-center" style={{ background: "#fff", fontFamily: font.body, fontSize: 11.5, color: tokens.muted, borderBottom: `1px solid ${tokens.line}` }}>{profileLabel(pet)}</div>
                <div className="p-4 text-center">
                  <div className="mx-auto rounded-full overflow-hidden" style={{ width: 72, height: 72, border: `3px solid ${tokens.gold}`, background: "#E8EEF7" }}>{photo}</div>
                  <div className="mt-2" style={{ fontFamily: font.display, fontWeight: 800, fontSize: 20, color: tokens.navy }}>{pet.name}</div>
                  <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{[pet.breed, pet.animal_type].filter(Boolean).join(" · ")}</div>
                </div>
                <div className="px-3 pb-3 grid gap-1.5">
                  {visible.map(([k, label, icon, val]) => {
                    const v = val(pet);
                    return (
                      <div key={k} className="ppg-rise rounded-xl px-3 py-2 flex items-start gap-2 text-left" style={{ background: "#fff" }}>
                        <span style={{ color: T.color, marginTop: 1 }}><Icon name={icon} size={14} /></span>
                        <span className="min-w-0">
                          <span className="block" style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", color: tokens.muted }}>{label.toUpperCase()}</span>
                          <span className="block" style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 700, color: filled(v) ? tokens.navy : tokens.muted, overflowWrap: "anywhere" }}>{filled(v) ? String(v).slice(0, 80) : "Shown when added"}</span>
                        </span>
                      </div>
                    );
                  })}
                  <div className="rounded-full py-2.5 text-center mt-1" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 800, fontSize: 14 }}>Message the owner</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Live preview</div>
          </div>
        </div>
      </Fold>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <p style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.muted }}>A digital pet ID, not a government ID.</p>
        {askRemove ? (
          <div role="dialog" aria-label="Remove pet" className="rounded-2xl p-4" style={{ border: `2px solid ${tokens.navy}`, background: "#fff" }}>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-3">Remove {pet.name}'s profile? This can't be undone.</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onRemove} className="ppg-btn ppg-btn-primary">Remove pet</button>
              <button type="button" onClick={() => setAskRemove(false)} className="ppg-btn ppg-btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAskRemove(true)} style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "6px 0" }}>Remove {pet.name}</button>
        )}
      </div>
    </div>
  );
}
