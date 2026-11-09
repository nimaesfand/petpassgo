"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";
import PetQr from "../../lib/PetQr";
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
      <span className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 44, height: 44, background: T.soft, color: T.color }}><Icon name={icon} size={22} /></span>
      <span className="min-w-0 text-left">
        <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>{busy || title}</span>
        <span className="block" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{sub}</span>
      </span>
    </>
  );
  const style = { background: "#fff", border: `1.5px solid ${tokens.line}`, cursor: "pointer", textDecoration: "none" };
  return href
    ? <a href={href} target="_blank" rel="noopener" className="ppg-lift flex items-center gap-3 rounded-2xl p-3.5" style={style}>{inner}</a>
    : <button type="button" onClick={onClick} className="ppg-lift flex items-center gap-3 rounded-2xl p-3.5" style={style}>{inner}</button>;
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
    <div className="grid gap-4">
      {/* The card */}
      <section className="rounded-3xl p-4 sm:p-6" style={{ background: `linear-gradient(160deg, ${T.soft}, #fff 70%)`, border: `1px solid ${tokens.line}` }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 24, color: tokens.navy }}>{pet.name}'s Pet ID</div>
            <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Put the QR on a tag or collar. Anyone who scans it can reach you.</div>
          </div>
          <button type="button" onClick={() => setFlipped((f) => !f)} className="ppg-btn ppg-btn-secondary flex-shrink-0" style={{ borderColor: T.color, color: T.color }}>
            <Icon name="repeat" size={16} /> {flipped ? "Front" : "QR side"}
          </button>
        </div>
        <div className="ppg-flip" data-flipped={flipped ? "1" : "0"} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0} aria-label="Flip the ID card" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}>
          <div className="ppg-flip-inner">
            <div className="ppg-flip-face">{card}</div>
            <div className="ppg-flip-face ppg-flip-back rounded-3xl flex flex-col items-center justify-center p-6 text-center" style={{ background: tokens.navy, color: "#fff" }}>
              <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 12, letterSpacing: "0.16em", color: tokens.gold }}>SCAN IF FOUND</div>
              <div className="rounded-2xl p-3 mt-3" style={{ background: "#fff" }}>
                <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={176} color={tokens.navy} />
              </div>
              <div className="mt-3" style={{ fontFamily: font.display, fontWeight: 800, fontSize: 22 }}>{pet.name}</div>
              {pet.passport_no ? <div style={{ fontFamily: font.body, fontSize: 14, opacity: 0.85 }}>PetPassGo ID {pet.passport_no}</div> : null}
              <div className="mt-1" style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.85 }}>{profileLabel(pet)}</div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Tap the card to flip it</div>
      </section>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ActionTile icon="smartphone" title="Save to phone" sub="Card image with the QR code" onClick={saveImage} busy={busy === "png" ? "Saving…" : ""} />
        <ActionTile icon="link" title={copied ? "Link copied" : "Copy link"} sub={profileLabel(pet)} onClick={copy} />
        <ActionTile icon="external" title="See the public page" sub="What a finder sees" href={profileUrl(pet)} />
        {wallet ? <ActionTile icon="bag" title="Add to Apple Wallet" sub="Keep it next to your cards" onClick={addWallet} busy={busy === "wallet" ? "Preparing…" : ""} /> : null}
      </div>

      {/* Privacy: switches + live preview */}
      <section className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div className="px-5 pt-5">
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 21, color: tokens.navy }}>What people see when they scan</div>
          <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Name, photo, breed and a "message the owner" button always show. You choose the rest.</div>
        </div>
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 p-5">
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
      </section>

      <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>This is a digital pet ID. It is not a government ID and does not grant special legal rights.</p>

      <div className="pt-2" style={{ borderTop: `1px dashed ${tokens.line}` }}>
        {askRemove ? (
          <div role="dialog" aria-label="Remove pet" className="rounded-2xl p-4" style={{ border: `2px solid ${tokens.navy}`, background: "#fff" }}>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-3">Remove {pet.name}'s profile? This can't be undone.</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onRemove} className="ppg-btn ppg-btn-primary">Remove pet</button>
              <button type="button" onClick={() => setAskRemove(false)} className="ppg-btn ppg-btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setAskRemove(true)} style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.muted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "8px 0" }}>Remove {pet.name}</button>
        )}
      </div>
    </div>
  );
}
