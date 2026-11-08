"use client";

import { useEffect, useMemo, useState } from "react";
import { Wordmark } from "./Logo";
import PawMark from "./PawMark";
import PetQr from "../lib/PetQr";
import { PetIllustration } from "./PetIdCard";
import { WalletCard, HealthPassport } from "./PetIdV2";
import VetImport from "./VetImport";
import PetPassport from "./PetPassport";
import PetBasicsCard from "./PetBasicsCard";
import PetCareCard from "./PetCareCard";
import PetDocumentsCard from "./PetDocumentsCard";
import { documentFileError } from "../lib/petDocuments";
import { todayPT } from "../lib/travelDates";
import { SignedImg, BUCKET, getSignedUrl, toStoragePath } from "../lib/storage";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import {
  HOUSING_DOC_TYPES, chipMask, filled, fmtDob, isHousingDoc, isTravelDoc,
  profileLabel, profileUrl, roleLabel, weightLabel,
} from "../lib/petProfile";

const text = { fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink };
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "10px 12px", width: "100%", background: "#fff" };
const btn = { fontFamily: font.body, fontWeight: 700, fontSize: 16, borderRadius: 999, padding: "10px 16px", border: "none", cursor: "pointer", minHeight: 44 };

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1.5" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 15, fontWeight: 700 }}>{children}</span>
  );
}

function CheckRow({ title, detail }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" fill="#EAF6EE" /><path d="M7.5 12.5 10.5 15.5 16.5 9" fill="none" stroke={tokens.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div>
        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{title}</div>
        {detail ? <div style={{ ...text, color: tokens.muted }}>{detail}</div> : null}
      </div>
    </div>
  );
}

const SIDEBAR = [
  ["Travel info", "M4 7h16v10H4z M8 7V5h8v2"],
  ["Document storage", "M7 3h7l5 5v13H7z M14 3v5h5"],
  ["Emergency info", "M12 21s7-4.4 7-10a7 7 0 1 0-14 0c0 5.6 7 10 7 10z M12 11v4 M12 8.5h.01"],
  ["Housing info", "M4 11 12 4l8 7 M6 10v9h12v-9"],
  ["Up-to-date profile", "M12 8v5l3 2 M12 3a9 9 0 1 0 9 9"],
];

function Contactless() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 16.5a5 5 0 0 1 0-9" stroke={tokens.gold} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 19a8.5 8.5 0 0 1 0-14" stroke={tokens.gold} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.5 14.2a2.4 2.4 0 0 1 0-4.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IdField({ label, value }) {
  return (
    <div className="min-w-0">
      <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{label}</div>
      <div style={{ fontFamily: font.body, fontSize: 17, fontWeight: 700, color: tokens.navy, overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}

export function DigitalIdCard({ pet, photo }) {
  const fields = [
    ["Species", pet.animal_type],
    ["Breed", pet.breed],
    ["Color", pet.color],
    ["Date of birth", fmtDob(pet.date_of_birth)],
    ["Weight", weightLabel(pet.weight_lb)],
    ["Microchip", chipMask(pet.microchip_number)],
    ["Owner", pet.handler_name],
  ].filter(([, v]) => filled(v));
  const declared = roleLabel(pet.role);
  return (
    <article data-pet-id-card className="rounded-3xl overflow-hidden w-full relative" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 16px 40px rgba(20,33,61,0.12)" }}>
      <div className="px-4 py-3 sm:px-5 flex items-center justify-between gap-3" style={{ background: tokens.navy }}>
        <div className="flex items-center gap-2 min-w-0">
          <Wordmark size={21} onDark className="ppg-id-brand" />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="text-right">
            <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 11, letterSpacing: "0.08em", color: tokens.gold, whiteSpace: "nowrap" }}>DIGITAL PET ID</div>
            <div className="ppg-id-scan" style={{ fontFamily: font.body, color: "#fff" }}>Scan QR for pet info</div>
          </div>
          <Contactless />
        </div>
      </div>
      <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-5 lg:items-start">
        <div className="flex flex-col items-center lg:items-start flex-shrink-0">
          <div className="rounded-3xl overflow-hidden" style={{ width: 132, height: 132, border: `3px solid ${tokens.gold}`, background: "#E8EEF7" }}>
            {photo || <PetIllustration type={pet.animal_type} size={132} />}
          </div>
          {pet.animal_type ? (
            <div className="mt-2 rounded-lg px-3 py-1 text-center" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 800, fontSize: 14, letterSpacing: "0.08em" }}>{String(pet.animal_type).toUpperCase()}</div>
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <h2 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, lineHeight: 1.05, color: tokens.navy, overflowWrap: "anywhere" }}>{pet.name}</h2>
          {pet.passport_no ? (
            <div className="mt-1" style={{ fontFamily: font.body, fontSize: 16, color: tokens.navy }}>
              <span style={{ color: tokens.muted }}>PetPassGo ID </span>
              <b>{pet.passport_no}</b>
            </div>
          ) : null}
          {declared ? <div className="mt-2" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.ink }}>{declared}, as declared by the owner</div> : null}
          {fields.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">{fields.map(([k, v]) => <IdField key={k} label={k} value={v} />)}</div>
          ) : (
            <p className="mt-3" style={text}>Add breed, color, or a birthday and they show up here.</p>
          )}
        </div>
        <div className="rounded-2xl p-3 flex flex-col items-center flex-shrink-0" style={{ border: `2px solid ${tokens.gold}` }}>
          <PetQr petId={pet.id} publicKey={pet.public_slug || pet.id} size={148} color={tokens.navy} />
          <div className="mt-2 text-center" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 14, letterSpacing: "0.06em", color: tokens.navy }}>SCAN FOR FULL PROFILE</div>
        </div>
      </div>
      <div aria-hidden="true" style={{ position: "absolute", right: 18, bottom: 12, opacity: 0.07 }}><PawMark size={72} color={tokens.navy} /></div>
    </article>
  );
}

function fromPet(pet) {
  return {
    name: pet.name || "",
    animal_type: pet.animal_type || "Dog",
    role: pet.role || "Pet",
    breed: pet.breed || "",
    sex: pet.sex || "",
    color: pet.color || "",
    weight_lb: pet.weight_lb ?? "",
    date_of_birth: pet.date_of_birth ? String(pet.date_of_birth).slice(0, 10) : "",
    carrier_length_in: pet.carrier_length_in ?? "",
    carrier_width_in: pet.carrier_width_in ?? "",
    carrier_height_in: pet.carrier_height_in ?? "",
    handler_name: pet.handler_name || "",
    trained: pet.trained == null ? "" : pet.trained ? "yes" : "no",
    allergies: pet.allergies || "",
    medications: pet.medications || "",
    vet_name: pet.vet_name || "",
    vet_phone: pet.vet_phone || "",
    emergency_contact_name: pet.emergency_contact_name || "",
    emergency_contact_phone: pet.emergency_contact_phone || "",
    about_bio: pet.about_bio || "",
    housing_notes: pet.housing_notes || "",
  };
}

export default function PetProfileExperience({ pet, userId, mode = "owner", onChanged }) {
  const owner = mode === "owner";
  const [tab, setTab] = useState("travel");
  const [docs, setDocs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [steps, setSteps] = useState({});
  const [health, setHealth] = useState([]);
  const [healthKey, setHealthKey] = useState(0);
  const [form, setForm] = useState(() => fromPet(pet));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [housingType, setHousingType] = useState(HOUSING_DOC_TYPES[0]);
  const [housingFile, setHousingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [askRemove, setAskRemove] = useState(false);

  useEffect(() => { setForm(fromPet(pet)); }, [pet.id, pet.updated_at, pet.name, pet.breed, pet.about_bio, pet.housing_notes, pet.allergies, pet.color, pet.weight_lb]);

  useEffect(() => {
    if (!pet?.id) return;
    if (owner) {
      supabase.from("documents").select("*").eq("pet_id", pet.id).order("uploaded_at", { ascending: false }).then(({ data }) => setDocs(data || []));
      supabase.from("trips").select("id,origin,destination,airline,travel_date,return_date,paid,pet_id").eq("pet_id", pet.id).order("travel_date", { ascending: false }).then(async ({ data }) => {
        const rows = data || [];
        setTrips(rows);
        const paidIds = rows.filter((t) => t.paid).map((t) => t.id);
        if (!paidIds.length) { setSteps({}); return; }
        const { data: status } = await supabase.from("trip_requirement_status").select("trip_id,completed").in("trip_id", paidIds);
        const map = {};
        (status || []).forEach((s) => { if (s.completed) map[s.trip_id] = (map[s.trip_id] || 0) + 1; });
        setSteps(map);
      });
    } else {
      supabase.rpc("get_public_pet_documents", { pet_id: pet.id }).then(({ data }) => setDocs(data || []));
      supabase.rpc("get_public_pet_travel", { pet_id: pet.id }).then(({ data }) => setTrips(data || []));
      supabase.rpc("get_public_pet_health", { pet_id: pet.id }).then(({ data }) => setHealth(data || []));
    }
  }, [pet.id, owner, healthKey]);

  const housingDocs = docs.filter((d) => isHousingDoc(d.document_type));
  const otherDocs = docs.filter((d) => !isHousingDoc(d.document_type));
  const travelDocs = docs.filter((d) => isTravelDoc(d.document_type));
  const declared = roleLabel(pet.role);
  const chips = [pet.animal_type, pet.breed, fmtDob(pet.date_of_birth), weightLabel(pet.weight_lb), pet.color, pet.sex].filter(filled);

  const publicTabs = useMemo(() => {
    if (owner) return [
      ["travel", "Travel Info"],
      ["housing", "Housing Info"],
      ["medical", "Medical Info"],
      ["about", `About ${pet.name || "them"}`],
    ];
    const list = [];
    if (trips.length) list.push(["travel", "Travel Info"]);
    if (filled(pet.housing_notes) || housingDocs.length) list.push(["housing", "Housing Info"]);
    const medical = filled(pet.allergies) || filled(pet.medications) || filled(pet.vet_name) || filled(pet.vet_phone) || filled(pet.emergency_contact_name) || filled(pet.emergency_contact_phone) || health.length;
    if (medical) list.push(["medical", "Medical Info"]);
    if (filled(pet.about_bio)) list.push(["about", `About ${pet.name || "them"}`]);
    return list;
  }, [owner, trips.length, pet, housingDocs.length, health.length]);

  useEffect(() => {
    if (publicTabs.length && !publicTabs.some(([id]) => id === tab)) setTab(publicTabs[0][0]);
  }, [publicTabs, tab]);

  async function save(patch) {
    if (!owner) return false;
    setSaving(true);
    const { error } = await supabase.from("pets").update(patch).eq("id", pet.id).eq("user_id", userId);
    setSaving(false);
    if (!error) onChanged?.();
    return !error;
  }

  async function toggle(key, value) {
    await save({ [key]: value });
  }

  async function uploadPhoto(e) {
    const f = e.target.files?.[0];
    if (!f || !owner) return;
    setPhotoBusy(true);
    const path = `${userId}/${pet.id}/profile-photo-${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, f);
    if (!error) {
      const previous = toStoragePath(pet.photo_url);
      await supabase.from("pets").update({ photo_url: path }).eq("id", pet.id).eq("user_id", userId);
      if (previous && previous !== path) await supabase.storage.from(BUCKET).remove([previous]);
    }
    setPhotoBusy(false);
    if (!error) onChanged?.();
  }

  async function removePhoto() {
    const previous = toStoragePath(pet.photo_url);
    if (previous) await supabase.storage.from(BUCKET).remove([previous]);
    await supabase.from("pets").update({ photo_url: null }).eq("id", pet.id).eq("user_id", userId);
    onChanged?.();
  }

  async function removePet() {
    const { data: docs } = await supabase.from("documents").select("file_url").eq("pet_id", pet.id).eq("user_id", userId);
    const paths = (docs || []).map((d) => toStoragePath(d.file_url)).filter(Boolean);
    const photoPath = toStoragePath(pet.photo_url);
    if (photoPath) paths.push(photoPath);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from("documents").delete().eq("pet_id", pet.id).eq("user_id", userId);
    await supabase.from("pets").delete().eq("id", pet.id).eq("user_id", userId);
    setAskRemove(false);
    onChanged?.();
  }

  async function uploadDoc(chosen, type) {
    if (!chosen || !owner) return;
    const problem = documentFileError(chosen);
    if (problem) { alert(problem); return; }
    setUploading(true);
    const path = `${userId}/${pet.id}/${Date.now()}-${chosen.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, chosen);
    if (!error) {
      await supabase.from("documents").insert({ user_id: userId, pet_id: pet.id, document_type: type, file_url: path });
      setHousingFile(null);
      const { data } = await supabase.from("documents").select("*").eq("pet_id", pet.id).order("uploaded_at", { ascending: false });
      setDocs(data || []);
    }
    setUploading(false);
  }

  async function removeDoc(doc) {
    if (!owner || !window.confirm("Remove this document?")) return;
    const path = doc.file_url;
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    setDocs((rows) => rows.filter((d) => d.id !== doc.id));
  }

  async function openDoc(doc, event) {
    event?.preventDefault();
    if (owner) {
      const win = window.open("", "_blank");
      const url = await getSignedUrl(doc.file_url);
      if (url && win) win.location.href = url; else if (win) win.close();
      return;
    }
    window.open(`/api/pet-doc/${doc.id}`, "_blank", "noopener");
  }

  const photo = owner
    ? (pet.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null)
    : (pet.photo_path ? <img src={`/api/pet-photo/${pet.id}`} alt={pet.name || ""} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null);

  const showDocsButton = owner || otherDocs.length + housingDocs.length > 0;
  const stampRows = (trips || []).filter((t) => (owner ? t.paid : true) && (t.origin || t.destination));
  const chipValue = owner
    ? (filled(pet.microchip_number) ? pet.microchip_number : "")
    : (pet.microchipped ? "On file" : "");

  return (
    <div data-pet-profile className="grid gap-4 min-w-0 max-w-full">
      <PetPassport
        pet={pet}
        photo={photo}
        stamps={stampRows}
        owner={owner}
        chipValue={chipValue}
        onPhoto={owner ? uploadPhoto : null}
        onRemovePhoto={owner && pet.photo_url ? removePhoto : null}
        photoBusy={photoBusy}
        onDocuments={showDocsButton ? () => document.getElementById(`documents-${pet.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }) : null}
      />
      <section className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,0.08)" }}>
        <div className="px-4 py-2.5 flex items-center gap-3" style={{ background: tokens.navy }}>
          <span className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
            <i className="rounded-full" style={{ width: 10, height: 10, background: tokens.gold, display: "block" }} />
            <i className="rounded-full" style={{ width: 10, height: 10, background: "rgba(255,255,255,0.45)", display: "block" }} />
            <i className="rounded-full" style={{ width: 10, height: 10, background: "rgba(255,255,255,0.25)", display: "block" }} />
          </span>
          <div className="flex-1 min-w-0 rounded-full px-3 py-1 text-center truncate" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", fontFamily: font.body, fontSize: 15 }}>{profileLabel(pet)}</div>
        </div>
        <div className="p-4 sm:p-6">
          {declared ? <div className="mb-3" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.ink }}>{declared}, as declared by the owner</div> : null}
          {chips.length > 0 ? <div className="flex flex-wrap gap-2 mb-4">{chips.map((c) => <Chip key={c}>{c}</Chip>)}</div> : null}

          {publicTabs.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-5" role="tablist">
              {publicTabs.map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} style={{ ...btn, background: tab === id ? tokens.navy : "#fff", color: tab === id ? "#fff" : tokens.navy, border: `2px solid ${tokens.navy}` }}>{label}</button>
              ))}
            </div>
          ) : null}

          <div className="mt-4" role="tabpanel">
            {tab === "travel" && (owner || trips.length > 0) ? (
              <div className="grid gap-3">
                {trips.length === 0 && owner ? (
                  <div className="rounded-2xl p-4" style={{ background: tokens.paper }}>
                    <p style={text}>No trips yet. When you plan one, the date shows up here. Airline details stay hidden until the Travel Pass is paid.</p>
                    <a href="/assessment" className="ppg-btn ppg-btn-primary mt-2">Plan my trip</a>
                  </div>
                ) : null}
                {trips.map((t) => {
                  const paid = owner ? !!t.paid : true;
                  const today = todayPT();
                  const past = !!t.travel_date && t.travel_date < today && (!t.return_date || t.return_date < today);
                  const when = [fmtDob(t.travel_date), t.return_date ? `back ${fmtDob(t.return_date)}` : ""].filter(Boolean).join(" · ");
                  const route = [t.origin, t.destination].filter(Boolean).join(" → ");
                  return (
                    <div key={t.id} className="rounded-2xl p-4 min-w-0" style={{ background: tokens.paper }}>
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <div className="min-w-0" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 18, color: tokens.navy }}>{paid ? (t.airline || "Travel Pass") : "Trip planned"}</div>
                        {past ? <span className="rounded-full px-2.5 py-1" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 12, fontWeight: 700 }}>Past</span> : null}
                      </div>
                      {route ? <div style={text}>{route}</div> : null}
                      {when ? <div style={text}>{when}</div> : null}
                      {paid && !past ? (
                        <div style={text}>{steps[t.id] ? `${steps[t.id]} checklist steps marked done.` : "Checklist is in the Travel Pass."}</div>
                      ) : null}
                      {!paid ? <div style={text}>Airline details open after you pay.</div> : null}
                      {owner && !past ? <a href="/account?tab=trips" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{paid ? "Open checklist" : "Continue checkout"}</a> : null}
                    </div>
                  );
                })}
                {travelDocs.length > 0 ? travelDocs.map((d) => <CheckRow key={d.id} title={d.document_type} detail={d.expires_on ? `Expires ${fmtDob(d.expires_on)}` : ""} />) : null}
              </div>
            ) : null}

            {tab === "housing" ? (
              <div className="grid gap-3">
                <p style={text}>Keep your pet’s housing paperwork handy.</p>
                {filled(owner ? form.housing_notes : pet.housing_notes) || owner ? (
                  owner ? (
                    <label style={{ ...text, fontWeight: 700, color: tokens.navy }}>Notes, references, rental pet resume
                      <textarea value={form.housing_notes} onChange={(e) => setForm({ ...form, housing_notes: e.target.value })} rows={4} maxLength={2000} style={{ ...input, marginTop: 6, fontWeight: 500 }} placeholder="Landlord notes, pet references, anything you want on file" />
                    </label>
                  ) : <p style={{ ...text, whiteSpace: "pre-wrap" }}>{pet.housing_notes}</p>
                ) : null}
                {owner ? <button type="button" disabled={saving} onClick={() => save({ housing_notes: form.housing_notes.trim() || null })} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>{saving ? "Saving…" : "Save housing notes"}</button> : null}
                {housingDocs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3">
                    <button type="button" onClick={(e) => openDoc(d, e)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}><CheckRow title={d.document_type} /></button>
                    {owner ? <button type="button" onClick={() => removeDoc(d)} style={{ fontFamily: font.body, fontSize: 15, color: tokens.primary, background: "none", border: "none", cursor: "pointer" }}>Remove</button> : null}
                  </div>
                ))}
                {owner ? (
                  <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); uploadDoc(housingFile, housingType); }}>
                    <select aria-label="Housing document type" value={housingType} onChange={(e) => setHousingType(e.target.value)} style={input}>{HOUSING_DOC_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                    <label className="flex items-center min-h-[52px] rounded-2xl px-4 cursor-pointer min-w-0" style={{ border: `2px dashed ${tokens.navy}`, background: "#fff" }}>
                      <span className="truncate" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{housingFile ? housingFile.name : "Choose a file"}</span>
                      <input aria-label="Housing document file" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic" className="ppg-hp" onChange={(e) => setHousingFile(e.target.files?.[0] || null)} />
                    </label>
                    <button type="submit" disabled={uploading || !housingFile} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>{uploading ? "Uploading…" : "Attach paperwork"}</button>
                  </form>
                ) : null}
              </div>
            ) : null}

            {tab === "medical" ? (
              <div id="health-passport" className="grid gap-3">
                {owner ? (
                  <>
                    <label style={{ ...text, fontWeight: 700, color: tokens.navy }}>Allergies
                      <textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} rows={2} maxLength={500} style={{ ...input, marginTop: 6, fontWeight: 500 }} placeholder="Add allergies if you want them on the profile" />
                    </label>
                    <label style={{ ...text, fontWeight: 700, color: tokens.navy }}>Medications
                      <textarea value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} rows={2} maxLength={500} style={{ ...input, marginTop: 6, fontWeight: 500 }} placeholder="Add medications if you want them on the profile" />
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input aria-label="Veterinarian name" placeholder="Veterinarian name" value={form.vet_name} onChange={(e) => setForm({ ...form, vet_name: e.target.value })} style={input} />
                      <input aria-label="Veterinarian phone" placeholder="Veterinarian phone" value={form.vet_phone} onChange={(e) => setForm({ ...form, vet_phone: e.target.value })} style={input} />
                      <input aria-label="Emergency contact name" placeholder="Emergency contact name" value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} style={input} />
                      <input aria-label="Emergency contact phone" placeholder="Emergency contact phone" value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} style={input} />
                    </div>
                    <button type="button" disabled={saving} onClick={() => save({
                      allergies: form.allergies.trim() || null,
                      medications: form.medications.trim() || null,
                      vet_name: form.vet_name.trim() || null,
                      vet_phone: form.vet_phone.trim() || null,
                      emergency_contact_name: form.emergency_contact_name.trim() || null,
                      emergency_contact_phone: form.emergency_contact_phone.trim() || null,
                    })} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>{saving ? "Saving…" : "Save medical info"}</button>
                    <HealthPassport pet={pet} userId={userId} bare refreshKey={healthKey} />
                    <VetImport pet={pet} userId={userId} onSaved={() => { setHealthKey((n) => n + 1); onChanged?.(); }} />
                  </>
                ) : (
                  <div className="grid gap-2">
                    {filled(pet.allergies) ? <IdField label="Allergies" value={pet.allergies} /> : null}
                    {filled(pet.medications) ? <IdField label="Medications" value={pet.medications} /> : null}
                    {(filled(pet.vet_name) || filled(pet.vet_phone)) ? <IdField label="Veterinarian" value={[pet.vet_name, pet.vet_phone].filter(Boolean).join(" · ")} /> : null}
                    {(filled(pet.emergency_contact_name) || filled(pet.emergency_contact_phone)) ? <IdField label="Emergency contact" value={[pet.emergency_contact_name, pet.emergency_contact_phone].filter(Boolean).join(" · ")} /> : null}
                    {filled(pet.handler_name) ? <IdField label="Owner" value={pet.handler_name} /> : null}
                    {health.map((h, i) => <div key={`${h.name}-${i}`} style={text}><b>{h.name}</b>{h.expires_on ? ` · expires ${fmtDob(h.expires_on)}` : ""}</div>)}
                  </div>
                )}
              </div>
            ) : null}

            {tab === "about" ? (
              <div className="grid gap-3">
                {owner ? (
                  <>
                    {!filled(pet.about_bio) ? <p style={text}>Add a few words about {pet.name}: personality, what they like, anything a sitter should know.</p> : null}
                    <textarea aria-label={`About ${pet.name}`} value={form.about_bio} onChange={(e) => setForm({ ...form, about_bio: e.target.value })} rows={5} maxLength={1000} style={input} placeholder={`What is ${pet.name || "your pet"} like?`} />
                    <button type="button" disabled={saving} onClick={() => save({ about_bio: form.about_bio.trim() || null })} className="ppg-btn ppg-btn-primary" style={{ justifySelf: "start" }}>{saving ? "Saving…" : "Save about"}</button>
                  </>
                ) : <p style={{ ...text, whiteSpace: "pre-wrap" }}>{pet.about_bio}</p>}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {owner ? <><PetBasicsCard pet={pet} userId={userId} onChanged={onChanged} /><PetCareCard pet={pet} userId={userId} onChanged={onChanged} /><PetDocumentsCard pet={pet} userId={userId} /></> : null}

      {!owner && docs.length > 0 && <section id={`documents-${pet.id}`} className="rounded-3xl p-4 sm:p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <h3 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }}>Documents</h3>
        {docs.map((d) => (
          <button key={d.id} type="button" onClick={(e) => openDoc(d, e)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}><CheckRow title={d.document_type} detail={d.expires_on ? `Expires ${fmtDob(d.expires_on)}` : ""} /></button>
        ))}
      </section>}

      {owner ? (
        <>
          <section data-pet-details className="rounded-3xl overflow-hidden flex flex-col lg:flex-row" style={{ border: `1px solid ${tokens.line}` }}>
            <aside className="p-5 lg:w-72 flex-shrink-0" style={{ background: tokens.navy }}>
              <div className="flex items-center gap-2 mb-4"><Wordmark size={21} onDark /></div>
              <ul className="grid gap-3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {SIDEBAR.map(([label, path]) => (
                  <li key={label} className="flex items-center gap-3" style={{ color: "#fff", fontFamily: font.body, fontSize: 16, fontWeight: 700 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tokens.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-5" style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>This is a digital pet ID. It is not a government ID and does not grant special legal rights.</p>
            </aside>
            <div className="flex-1 p-5 bg-white grid gap-4">
              <div>
                <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy }}>Profile URL</div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input readOnly value={profileLabel(pet)} aria-label="Profile URL" style={input} onFocus={(e) => e.target.select()} />
                  <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(profileUrl(pet)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }} className="ppg-btn ppg-btn-secondary">{copied ? "Copied" : "Copy"}</button>
                </div>
              </div>
              <div className="grid gap-2">
                <div style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>What the public page can show</div>
                {[
                  ["show_dob_on_public", "Show date of birth on the public page", pet.show_dob_on_public],
                  ["show_weight_on_public", "Show weight on the public page", pet.show_weight_on_public],
                  ["show_sex_on_public", "Show sex on the public page", pet.show_sex_on_public],
                  ["show_color_on_public", "Show color on the public page", pet.show_color_on_public],
                  ["show_about_on_public", "Show the About text on the public page", pet.show_about_on_public],
                  ["show_medical_on_public", "Show medical info on the public page", pet.show_medical_on_public],
                  ["show_contact_on_public_id", "Show emergency contact on the public page", pet.show_contact_on_public_id],
                  ["show_documents_on_public", "Show documents on the public page", pet.show_documents_on_public],
                  ["show_housing_on_public", "Show housing info on the public page", pet.show_housing_on_public],
                  ["show_travel_on_public", "Show paid trips on the public page", pet.show_travel_on_public],
                ].map(([key, label, on]) => (
                  <label key={key} className="flex items-start gap-3" style={{ ...text, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!on} onChange={(e) => toggle(key, e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, accentColor: tokens.navy }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div id="wallet-card"><WalletCard pet={pet} bare onDone={() => window.dispatchEvent(new CustomEvent("ppg-qr-done"))} /></div>
              {askRemove ? (
                <div role="dialog" aria-label="Remove pet" className="rounded-2xl p-4" style={{ border: `2px solid ${tokens.navy}` }}>
                  <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-3">Remove {pet.name}'s profile? This can't be undone.</div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={removePet} className="ppg-btn ppg-btn-primary">Remove pet</button>
                    <button type="button" onClick={() => setAskRemove(false)} className="ppg-btn ppg-btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setAskRemove(true)} className="ppg-btn ppg-btn-secondary" style={{ justifySelf: "start" }}>Remove pet</button>
              )}
            </div>
          </section>
        </>
      ) : (
        null
      )}
    </div>
  );
}
