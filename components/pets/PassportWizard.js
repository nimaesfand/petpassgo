"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { BUCKET } from "../../lib/storage";
import { tokens, font } from "../../lib/theme";
import BreedInput from "../BreedInput";
import PhotoBooth from "./PhotoBooth";
import Icon from "../Icon";

// Adding a pet = making its passport. One short flow asks for everything the
// passport needs (and nothing it doesn't), then the photo booth, then the
// passport is issued on the pet's page.

const field = { fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16, background: "#fff", width: "100%", minHeight: 50 };
const lab = { fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy, display: "block" };
const COLORS = ["Black", "White", "Brown", "Golden", "Gray", "Cream", "Brindle", "Mixed"];

function Tile({ on, onClick, title, sub }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="rounded-2xl px-4 py-3 text-left" style={{ background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `2px solid ${on ? tokens.navy : tokens.line}`, cursor: "pointer", minHeight: 52 }}>
      <span className="block" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16 }}>{title}</span>
      {sub ? <span className="block mt-0.5" style={{ fontFamily: font.body, fontSize: 14, opacity: on ? 0.85 : 0.75 }}>{sub}</span> : null}
    </button>
  );
}

function Chip({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="rounded-full px-3.5 py-2" style={{ background: on ? tokens.navy : "#fff", color: on ? "#fff" : tokens.navy, border: `2px solid ${on ? tokens.navy : tokens.line}`, fontFamily: font.body, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{children}</button>
  );
}

function fmtDob(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}/${y}`;
}

export function MeasureGuide({ onClose, kind = "pet" }) {
  const [tab, setTab] = useState(kind);
  return (
    <div className="rounded-2xl p-4 mt-2" style={{ background: "#fff", border: `2px solid ${tokens.gold}` }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex gap-2">
          <Chip on={tab === "pet"} onClick={() => setTab("pet")}>Your pet</Chip>
          <Chip on={tab === "carrier"} onClick={() => setTab("carrier")}>Your carrier</Chip>
        </div>
        {onClose ? <button type="button" onClick={onClose} aria-label="Close guide" style={{ background: tokens.sky, border: "none", borderRadius: 12, width: 40, height: 40, cursor: "pointer", color: tokens.navy }}><Icon name="x" size={18} /></button> : null}
      </div>
      {tab === "pet" ? (
        <>
          <svg viewBox="0 0 320 196" width="100%" role="img" aria-label="How to measure your dog: length from nose to the base of the tail, height from the floor to the top of the head">
            <rect x="0" y="0" width="320" height="196" rx="16" fill="#F3F5F9" />
            <ellipse cx="160" cy="176" rx="120" ry="6" fill="#E3E8EF" />
            <line x1="18" y1="172" x2="302" y2="172" stroke="#C3CBD6" strokeWidth="2" strokeLinecap="round" />
            {/* tail */}
            <path d="M232 104 C252 98 262 84 264 66" fill="none" stroke="#D8964F" strokeWidth="10" strokeLinecap="round" />
            {/* back legs */}
            <path d="M200 120 L198 164 Q198 170 206 170 L214 170 Q220 170 218 164 L218 120 Z" fill="#E7A960" />
            <path d="M222 118 L222 164 Q222 170 230 170 L236 170 Q242 170 240 164 L238 116 Z" fill="#D8964F" />
            {/* body */}
            <path d="M104 100 C104 84 122 78 146 79 L208 80 C230 81 242 94 240 110 C238 126 224 134 206 134 L132 134 C114 134 104 120 104 104 Z" fill="#F0B96C" />
            <path d="M130 126 C150 136 196 136 214 128 C200 134 160 138 130 126 Z" fill="#FBE3BC" />
            <ellipse cx="146" cy="116" rx="34" ry="14" fill="#FBE3BC" />
            {/* front legs */}
            <path d="M116 118 L114 164 Q114 170 122 170 L130 170 Q136 170 134 164 L134 118 Z" fill="#E7A960" />
            <path d="M138 120 L138 164 Q138 170 146 170 L153 170 Q159 170 157 164 L156 120 Z" fill="#F0B96C" />
            {/* collar */}
            <path d="M98 92 Q108 104 122 98" fill="none" stroke="#C2410C" strokeWidth="7" strokeLinecap="round" />
            <circle cx="111" cy="105" r="5" fill="#F2B84B" stroke="#B7791F" strokeWidth="1.5" />
            {/* head */}
            <circle cx="84" cy="66" r="30" fill="#F0B96C" />
            <ellipse cx="56" cy="80" rx="24" ry="16" fill="#FBE3BC" />
            <ellipse cx="34" cy="74" rx="7.5" ry="6" fill="#14213D" />
            <path d="M44 88 Q52 94 60 89" fill="none" stroke="#14213D" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="72" cy="80" rx="7" ry="4.5" fill="#F7A8A0" opacity=".7" />
            <circle cx="76" cy="60" r="5.5" fill="#14213D" /><circle cx="78" cy="58" r="1.8" fill="#fff" />
            {/* ear */}
            <path d="M92 38 C114 38 120 64 110 90 C106 100 92 98 90 84 C88 70 86 52 92 38 Z" fill="#B8733A" />
            {/* length */}
            <g stroke="#C2410C" strokeWidth="3" strokeLinecap="round"><line x1="27" y1="24" x2="232" y2="24" /><line x1="27" y1="17" x2="27" y2="31" /><line x1="232" y1="17" x2="232" y2="31" /></g>
            <text x="130" y="15" textAnchor="middle" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12.5, fill: "#C2410C" }}>LENGTH · nose to base of tail</text>
            {/* height */}
            <g stroke="#0F766E" strokeWidth="3" strokeLinecap="round"><line x1="292" y1="36" x2="292" y2="170" /><line x1="285" y1="36" x2="299" y2="36" /><line x1="285" y1="170" x2="299" y2="170" /></g>
            <line x1="84" y1="36" x2="284" y2="36" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="308" y="103" textAnchor="middle" transform="rotate(-90 308 103)" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12.5, fill: "#0F766E" }}>HEIGHT</text>
          </svg>
          <ul className="mt-2 space-y-1.5" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.ink, paddingLeft: 18, listStyle: "disc" }}>
            <li><b>Length:</b> with your pet standing, measure from the tip of the nose to the base of the tail (not the tip).</li>
            <li><b>Height:</b> from the floor to the top of the head, standing up straight.</li>
            <li><b>Width:</b> across the widest part, usually the shoulders.</li>
            <li>Your pet should be able to stand, turn around and lie down in the carrier, so add a couple of inches to each.</li>
          </ul>
        </>
      ) : (
        <>
          <svg viewBox="0 0 320 170" width="100%" role="img" aria-label="How to measure a carrier: length, width and height on the outside">
            <rect x="0" y="0" width="320" height="170" rx="14" fill="#F3F5F9" />
            <path d="M70 60 L200 60 L250 35 L120 35 Z" fill="#DCE3EC" stroke="#14213D" strokeWidth="2" />
            <path d="M70 60 L70 140 L200 140 L200 60 Z" fill="#fff" stroke="#14213D" strokeWidth="2" />
            <path d="M200 60 L250 35 L250 115 L200 140 Z" fill="#EEF2F7" stroke="#14213D" strokeWidth="2" />
            <path d="M95 75 h80 v50 h-80 z" fill="none" stroke="#9AA4B2" strokeWidth="2" strokeDasharray="4 4" />
            <g stroke="#C2410C" strokeWidth="3"><line x1="70" y1="155" x2="200" y2="155" /><path d="M70 149 v12 M200 149 v12" /></g>
            <text x="135" y="168" textAnchor="middle" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12, fill: "#C2410C" }}>LENGTH</text>
            <g stroke="#4338CA" strokeWidth="3"><line x1="208" y1="146" x2="258" y2="121" /></g>
            <text x="270" y="140" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12, fill: "#4338CA" }}>WIDTH</text>
            <g stroke="#0F766E" strokeWidth="3"><line x1="52" y1="60" x2="52" y2="140" /><path d="M46 60 h12 M46 140 h12" /></g>
            <text x="44" y="104" textAnchor="end" style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 12, fill: "#0F766E" }}>HEIGHT</text>
          </svg>
          <ul className="mt-2 space-y-1.5" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.ink, paddingLeft: 18, listStyle: "disc" }}>
            <li>Measure the <b>outside</b> of the carrier, including any pockets or a rigid frame.</li>
            <li><b>Length</b> is the long side, <b>width</b> the short side, <b>height</b> from the floor to the top.</li>
            <li>Soft carriers can squish a little under the seat. Hard ones can&apos;t.</li>
          </ul>
        </>
      )}
    </div>
  );
}

const STEPS = ["Who", "About", "Size", "Contact", "Photo"];

export default function PassportWizard({ userId, onDone, onCancel, defaultOwner = "" }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", animal_type: "Dog", role: "Pet", breed: "", sex: "", date_of_birth: "", color: "", weight_lb: "", carrier_length_in: "", carrier_width_in: "", carrier_height_in: "", handler_name: defaultOwner, emergency_contact_name: defaultOwner, emergency_contact_phone: "" });
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [booth, setBooth] = useState(false);
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));
  const name = f.name.trim() || "your pet";

  const okStep = [
    f.name.trim().length > 0,
    f.breed.trim() && f.date_of_birth,
    true,
    f.emergency_contact_name.trim() && f.emergency_contact_phone.replace(/\D/g, "").length >= 7,
    !!photo,
  ];
  const need = [
    "Add a name to keep going.",
    "Breed and birthday go on the passport.",
    "",
    "Add a name and a phone number someone can call.",
    "Add a passport photo.",
  ];

  function next() {
    if (!okStep[step]) { setErr(need[step]); return; }
    setErr("");
    setStep((s) => s + 1);
  }

  async function finish() {
    if (!photo) { setErr(need[4]); return; }
    setBusy(true); setErr("");
    const num = (v) => (v === "" || v == null ? null : Number(v));
    const { data: created, error } = await supabase.from("pets").insert({
      user_id: userId,
      name: f.name.trim(),
      animal_type: f.animal_type,
      role: f.role,
      breed: f.breed.trim() || null,
      sex: f.sex || null,
      date_of_birth: f.date_of_birth || null,
      color: f.color.trim() || null,
      weight_lb: num(f.weight_lb),
      carrier_length_in: num(f.carrier_length_in),
      carrier_width_in: num(f.carrier_width_in),
      carrier_height_in: num(f.carrier_height_in),
      handler_name: f.handler_name.trim() || null,
      emergency_contact_name: f.emergency_contact_name.trim() || null,
      emergency_contact_phone: f.emergency_contact_phone.trim() || null,
    }).select("id").single();
    if (error || !created) {
      setBusy(false);
      setErr(/PET_LIMIT/.test(error?.message || "") ? "Your plan has room for one pet. Pet Vault adds more." : "We couldn't save that. Please try again.");
      return;
    }
    const path = `${userId}/${created.id}/profile-photo-${Date.now()}.jpg`;
    const up = await supabase.storage.from(BUCKET).upload(path, photo, { contentType: photo.type || "image/jpeg" });
    if (!up.error) await supabase.from("pets").update({ photo_url: path }).eq("id", created.id).eq("user_id", userId);
    if (num(f.weight_lb)) {
      await supabase.from("pet_measurements").insert({ user_id: userId, pet_id: created.id, metric_type: "weight", value: num(f.weight_lb), recorded_date: new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }) });
    }
    setBusy(false);
    onDone?.(created.id);
  }

  // What you've entered so far, so nothing feels lost between steps.
  const summary = [
    f.name.trim() && ["Name", f.name.trim()],
    step > 0 && [f.animal_type, f.role === "Pet" ? "Pet" : f.role === "Service animal" ? "Service dog" : "ESA"],
    f.breed.trim() && ["Breed", f.breed.trim()],
    f.date_of_birth && ["Born", fmtDob(f.date_of_birth)],
    f.sex && ["Sex", f.sex],
    f.color.trim() && ["Color", f.color.trim()],
    Number(f.weight_lb) > 0 && ["Weight", `${f.weight_lb} lb`],
    step > 3 && f.emergency_contact_phone && ["Contact", f.emergency_contact_name.trim() || "Added"],
  ].filter(Boolean);

  return (
    <div className="rounded-3xl p-5 mt-4" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.06)" }}>
      {booth ? <PhotoBooth pet={{ name: f.name.trim() || "your pet", animal_type: f.animal_type }} onClose={() => setBooth(false)} onSave={(file) => { setPhoto(file); try { setPhotoUrl(URL.createObjectURL(file)); } catch {} setBooth(false); setErr(""); }} /> : null}
      <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 800, letterSpacing: ".14em", color: tokens.primary }}>PET PASSPORT · STEP {step + 1} OF {STEPS.length}</div>
      <div className="flex gap-1.5 mt-2 mb-4" aria-hidden="true">
        {STEPS.map((s, i) => <span key={s} className="flex-1 rounded-full" style={{ height: 6, background: i <= step ? tokens.primary : tokens.line, transition: "background .3s" }} />)}
      </div>

      {summary.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {summary.map(([k, v]) => (
            <span key={k} className="rounded-full px-3 py-1.5" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 13.5, color: tokens.navy }}>
              <span style={{ color: tokens.muted }}>{k}:</span> <b>{v}</b>
            </span>
          ))}
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>Who&apos;s the lucky traveler?</h3>
            <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted, lineHeight: 1.45 }}>Every adventure starts with a passport. This takes about two minutes.</p>
          </div>
          <label style={lab}>Their name<input autoFocus value={f.name} onChange={set("name")} placeholder="e.g. Milo" className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} /></label>
          <div>
            <span style={lab}>Species</span>
            <div className="flex flex-wrap gap-2 mt-1.5">{["Dog", "Cat", "Other"].map((t) => <Chip key={t} on={f.animal_type === t} onClick={() => setF((x) => ({ ...x, animal_type: t, role: t !== "Dog" && x.role === "Service animal" ? "Pet" : x.role }))}>{t}</Chip>)}</div>
          </div>
          <div>
            <span style={lab}>Is {f.name.trim() || "your pet"} a service or support animal?</span>
            <div className="grid gap-2 mt-1.5">
              <Tile on={f.role === "Pet"} onClick={() => setF((x) => ({ ...x, role: "Pet" }))} title="No, just my pet" sub="Most pets. Airline pet rules apply." />
              {f.animal_type === "Dog" && <Tile on={f.role === "Service animal"} onClick={() => setF((x) => ({ ...x, role: "Service animal" }))} title="Service dog" sub="Trained to do tasks for a disability, including psychiatric service dogs" />}
              <Tile on={f.role === "Emotional support animal"} onClick={() => setF((x) => ({ ...x, role: "Emotional support animal" }))} title="Emotional support animal (ESA)" sub="Flies as a pet on US airlines" />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h3 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>About {name}</h3>
          <label style={lab}>Breed<BreedInput aria-label="Breed" animal={f.animal_type} value={f.breed} onChange={set("breed")} placeholder="Start typing, or Mixed" className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} /></label>
          <label style={lab}>Birthday<input type="date" value={f.date_of_birth} max={new Date().toISOString().slice(0, 10)} onChange={set("date_of_birth")} className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} />
            <span className="block mt-1" style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 500, color: tokens.muted }}>Not sure? Pick your best guess.</span>
          </label>
          <div>
            <span style={lab}>Sex</span>
            <div className="flex gap-2 mt-1.5">{["Male", "Female"].map((t) => <Chip key={t} on={f.sex === t} onClick={() => setF((x) => ({ ...x, sex: x.sex === t ? "" : t }))}>{t}</Chip>)}</div>
          </div>
          <div>
            <span style={lab}>Color</span>
            <div className="flex flex-wrap gap-2 mt-1.5">{COLORS.map((c) => <Chip key={c} on={f.color === c} onClick={() => setF((x) => ({ ...x, color: x.color === c ? "" : c }))}>{c}</Chip>)}</div>
            <input value={COLORS.includes(f.color) ? "" : f.color} onChange={set("color")} placeholder="Or type it, e.g. Black and tan" className="rounded-xl px-4 py-3 outline-none mt-2" style={field} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <h3 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>How big is {name}?</h3>
            <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, lineHeight: 1.45 }}>Airlines care about size. Don&apos;t know yet? Skip it and add it later.</p>
          </div>
          <label style={lab}>Weight (pounds)<input type="number" inputMode="decimal" step="0.1" min="0.1" value={f.weight_lb} onChange={set("weight_lb")} placeholder="e.g. 18" className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} />
            <span className="block mt-1" style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 500, color: tokens.muted }}>Tip: weigh yourself holding {name}, then subtract your own weight.</span>
          </label>
          <div className="rounded-2xl p-4" style={{ background: tokens.sky }}>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>Carrier size <span style={{ fontWeight: 500, color: tokens.muted }}>(optional)</span></span>
              <button type="button" onClick={() => setGuide((g) => !g)} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.primary, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>{guide ? "Hide guide" : "How to measure"}</button>
            </div>
            {guide && <MeasureGuide onClose={() => setGuide(false)} />}
            <div className="grid grid-cols-3 gap-2 mt-3 min-w-0">
              {[["carrier_length_in", "Length"], ["carrier_width_in", "Width"], ["carrier_height_in", "Height"]].map(([k, l]) => (
                <label key={k} className="min-w-0" style={{ ...lab, fontSize: 14 }}>{l} (in)<input type="number" inputMode="decimal" step="0.1" min="0.1" value={f[k]} onChange={set(k)} className="rounded-xl px-3 py-2.5 outline-none mt-1" style={{ ...field, minHeight: 46 }} /></label>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h3 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>If {name} is ever lost</h3>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.45, marginTop: -6 }}>This goes on the passport and the Pet ID. You choose later what a finder can see.</p>
          <label style={lab}>Owner name<input value={f.handler_name} onChange={(e) => { const v = e.target.value; setF((x) => ({ ...x, handler_name: v, emergency_contact_name: !x.emergency_contact_name || x.emergency_contact_name === x.handler_name ? v : x.emergency_contact_name })); }} autoComplete="name" className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} /></label>
          <label style={lab}>Who should a finder call?<input value={f.emergency_contact_name} onChange={set("emergency_contact_name")} className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} /></label>
          <label style={lab}>Their phone<input type="tel" inputMode="tel" autoComplete="tel" value={f.emergency_contact_phone} onChange={set("emergency_contact_phone")} placeholder="(555) 555-0123" className="rounded-xl px-4 py-3 outline-none mt-1.5" style={field} /></label>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4 items-center text-center">
          <h3 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>Last stop: the photo booth</h3>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={`${name}'s passport photo`} style={{ width: 168, height: 210, objectFit: "cover", borderRadius: 18, border: "6px solid #fff", boxShadow: "0 10px 26px rgba(20,33,61,.18)" }} />
          ) : (
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }}>Bev at Window 3 will take {name}&apos;s passport photo. A bright, close face shot works best.</p>
          )}
          <button type="button" onClick={() => setBooth(true)} className="ppg-btn ppg-btn-primary">{photoUrl ? "Retake photo" : "Open the photo booth"}</button>
        </div>
      )}

      {err && <p role="alert" className="mt-3" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.stamp }}>{err}</p>}

      <div className="flex items-center justify-between gap-3 mt-5">
        <button type="button" onClick={() => (step === 0 ? onCancel?.() : (setErr(""), setStep((s) => s - 1)))} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.muted, background: "none", border: "none", cursor: "pointer", minHeight: 44 }}>{step === 0 ? "Cancel" : "← Back"}</button>
        {step < 4 ? (
          <div className="flex items-center gap-3">
            {step === 2 && !(Number(f.weight_lb) > 0) && !f.carrier_length_in ? (
              <button type="button" onClick={next} style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", minHeight: 44 }}>Skip for now</button>
            ) : null}
            <button type="button" onClick={next} className="ppg-btn ppg-btn-primary" style={{ opacity: okStep[step] && !(step === 2 && !(Number(f.weight_lb) > 0) && !f.carrier_length_in) ? 1 : 0.55 }}>Continue</button>
          </div>
        ) : (
          <button type="button" disabled={busy} onClick={finish} className="ppg-btn ppg-btn-primary" style={{ opacity: photo ? 1 : 0.55 }}>{busy ? "Issuing…" : "Issue the passport"}</button>
        )}
      </div>
    </div>
  );
}
