"use client";

import Icon from "../../components/Icon";
import BreedInput from "../../components/BreedInput";
import { telHref } from "../../lib/linkify";
import { VAULT_NAME, VAULT_SUB, MEMBERSHIP_TERMS } from "../../lib/travelPassOffer";
import TrustBadges from "../../components/TrustBadges";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { usePetAccess } from "../../lib/access";
import WinBack from "../../components/WinBack";
import { PRICES as P, usd } from "../../lib/pricing";
import WithdrawalConsent from "../../components/WithdrawalConsent";
import { WITHDRAWAL_BLOCKED } from "../../lib/withdrawal";
import { JOIN_CTA, PLAN_CTA } from "../../lib/cta";
import { startStripe } from "../../lib/checkout";
import { trackBeginCheckout, trackPurchaseOnce, getAttribution } from "../../lib/analytics";
import { requirementAirline } from "../../lib/airlines";
import { requirementQueryTypes, segmentPlans } from "../../lib/segments";
import SiteHeader from "../../components/SiteHeader";
import { useTripPet, TripCountdown } from "../../components/TripLive";
import TravelPassDashboard from "../../components/TravelPassDashboard";
import { maskChip, ChipVault, HealthPassport, ShareCard, WalletCard, ActivationChecklist } from "../../components/PetIdV2";
import { WhatsNeededNext, TravelStamps, FindAVet } from "../../components/PetExtras";
import VetImport from "../../components/VetImport";
import PetQr from "../../lib/PetQr";
import { PetIdSheet, cardFromPet, rabiesLine, isService } from "../../components/PetIdPreview";
import FeedbackPrompt from "../../components/FeedbackPrompt";
import MobileBottomNav from "../../components/MobileBottomNav";
import LostPanel from "../../components/LostPanel";
import PetIdCard, { PetIllustration } from "../../components/PetIdCard";
import PetHero from "../../components/pets/PetHero";
import Fold from "../../components/pets/Fold";
import PetBasicsCard from "../../components/PetBasicsCard";
import PetCareCard from "../../components/PetCareCard";
import PetDocumentsCard from "../../components/PetDocumentsCard";
import { SECTION_THEME } from "../../lib/petSections";
import PetProfileExperience from "../../components/PetProfileExperience";
import PassportWizard from "../../components/pets/PassportWizard";
import MarketingOptIn from "../../components/MarketingOptIn";
import MarketingSettings from "../../components/MarketingSettings";
import { buildPassCards, dueChip, groupCards, matchesDestination, passProgress } from "../../lib/passCards";
import { pickTripPet } from "../../lib/tripPet";
import { todayPT } from "../../lib/travelDates";
import { fmtTripDate } from "../../lib/tripAccess";
import { BUCKET, SignedImg, getSignedUrl, toStoragePath } from "../../lib/storage";
import { tokens, font } from "../../lib/theme";
import SavedToast from "../../components/SavedToast";
import { Greeting, SectionTitle, UnpaidTripCard, PlanTripCard, PetsStrip, QuickActions } from "../../components/account/HomeParts";



const TABS = [
  { key: "dashboard", label: "Home" },
  { key: "trips", label: "My Trips" },
  { key: "vault", label: "My Pets" },
  { key: "billing", label: "Account" },
];

function ComingSoon({ title, blurb }) {
  return (
    <div
      className="rounded-xl p-8 text-center"
      style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}
    >
      <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.stamp, letterSpacing: "0.1em" }} className="mb-2">
        COMING SOON
      </div>
      <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-2">
        {title}
      </div>
      <div style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7, maxWidth: 380 }} className="mx-auto">
        {blurb}
      </div>
    </div>
  );
}

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 1) return `${months} month${months === 1 ? "" : "s"} old`;
  if (months === 0) return `${years} year${years === 1 ? "" : "s"} old`;
  return `${years}y ${months}m old`;
}

const BANNERS = {
  health: [(n) => `${n}'s Health`, () => "Vaccines, meds and vet in one place. We remind you before anything expires."],
  docs: [() => "Documents", () => "Upload certificates once. Show them at the counter or share a link."],
  lost: [(n) => `If ${n} Goes Missing`, () => "One tap makes a lost poster and alerts you when the tag is scanned."],
  about: [(n) => `All About ${n}`, () => "Personality and quirks, ready to share with sitters and vets."],
};

const th = (k) => SECTION_THEME[k];

function SectionBanner({ k, title, text }) {
  const th = SECTION_THEME[k];
  return (
    <div className="relative overflow-hidden rounded-3xl px-5 py-5 flex items-center gap-4" style={{ background: `linear-gradient(120deg, ${th.color}, ${th.deep})`, color: "#fff" }}>
      <div aria-hidden="true" className="ppg-hero-paws" />
      <div className="relative flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: 52, height: 52, background: "rgba(255,255,255,0.18)" }}><Icon name={th.icon} size={28} /></div>
      <div className="relative min-w-0">
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 23, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, opacity: 0.95 }}>{text}</div>
      </div>
    </div>
  );
}

function PetCard({ pet, userId, onPhotoUpdated }) {
  const [section, setSection] = useState(() => {
    const want = typeof window !== "undefined" ? window.__ppgPetSection : null;
    return want && (!want.petId || want.petId === pet.id) ? want.section : "passport";
  });
  useEffect(() => {
    function go(e) {
      const d = e.detail || {};
      if (d.petId && d.petId !== pet.id) return;
      if (d.section) setSection(d.section);
    }
    window.addEventListener("ppg-pet-section", go);
    return () => window.removeEventListener("ppg-pet-section", go);
  }, [pet.id]);
  const [measurements, setMeasurements] = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: pet.name || "",
    animal_type: pet.animal_type || "Dog",
    role: pet.role || "Pet",
    breed: pet.breed || "",
    sex: pet.sex || "",
    weight_lb: pet.weight_lb ?? "",
    carrier_length_in: pet.carrier_length_in ?? "",
    carrier_width_in: pet.carrier_width_in ?? "",
    carrier_height_in: pet.carrier_height_in ?? "",
    date_of_birth: pet.date_of_birth || "",
    vet_name: pet.vet_name || "",
    vet_phone: pet.vet_phone || "",
    emergency_contact_name: pet.emergency_contact_name || "",
    emergency_contact_phone: pet.emergency_contact_phone || "",
    microchip_number: pet.microchip_number || "",
    handler_name: pet.handler_name || "",
    trained: pet.trained == null ? "" : pet.trained ? "yes" : "no",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveEdit(e) {
    e.preventDefault();
    setSavingEdit(true);
    await supabase
      .from("pets")
      .update({
        name: editForm.name,
        animal_type: editForm.animal_type,
        role: editForm.role,
        breed: editForm.breed || null,
        sex: editForm.sex || null,
        weight_lb: editForm.weight_lb === "" ? null : Number(editForm.weight_lb),
        carrier_length_in: editForm.carrier_length_in === "" ? null : Number(editForm.carrier_length_in),
        carrier_width_in: editForm.carrier_width_in === "" ? null : Number(editForm.carrier_width_in),
        carrier_height_in: editForm.carrier_height_in === "" ? null : Number(editForm.carrier_height_in),
        date_of_birth: editForm.date_of_birth || null,
        vet_name: editForm.vet_name || null,
        vet_phone: editForm.vet_phone || null,
        emergency_contact_name: editForm.emergency_contact_name || null,
        emergency_contact_phone: editForm.emergency_contact_phone || null,
        handler_name: editForm.handler_name.trim() || null,
        trained: editForm.trained === "" ? null : editForm.trained === "yes",
      })
      .eq("id", pet.id);
    setSavingEdit(false);
    setShowEditForm(false);
    onPhotoUpdated();
  }

  async function handleDeletePet() {
    if (!window.confirm(`Remove ${pet.name}'s profile? This can't be undone.`)) return;
    setDeleting(true);
    await supabase.from("pets").delete().eq("id", pet.id);
    onPhotoUpdated();
  }

  const [justCopied, setJustCopied] = useState(false);

  async function handleShare() {
    const age = calculateAge(pet.date_of_birth);
    const lines = [
      `${pet.name}'s Info (via PetPassGo)`,
      pet.breed ? `Breed: ${pet.breed}` : null,
      pet.sex ? `Sex: ${pet.sex}` : null,
      age ? `Age: ${age}` : null,
      pet.vet_name ? `Vet: ${pet.vet_name}${pet.vet_phone ? " - " + pet.vet_phone : ""}` : null,
      pet.emergency_contact_name
        ? `Emergency Contact: ${pet.emergency_contact_name}${pet.emergency_contact_phone ? " - " + pet.emergency_contact_phone : ""}`
        : null,
      pet.microchip_number ? `Microchip ending: ${maskChip(pet.microchip_number)}` : null,
    ].filter(Boolean);
    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: `${pet.name}'s Info`, text });
      } catch (e) {
        // user canceled the share sheet — no action needed
      }
    } else {
      await navigator.clipboard.writeText(text);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    }
  }

  const [savingContactToggle, setSavingContactToggle] = useState(false);
  async function togglePublicContact(value) {
    setSavingContactToggle(true);
    // RLS ("Users can update their own pets") limits this to the owner's own row.
    await supabase.from("pets").update({ show_contact_on_public_id: value }).eq("id", pet.id).eq("user_id", userId);
    setSavingContactToggle(false);
    onPhotoUpdated();
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);

    const filePath = `${userId}/${pet.id}/profile-photo-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file);

    if (!uploadError) {
      // Store the storage path; a short-lived signed URL is created when displaying.
      await supabase.from("pets").update({ photo_url: filePath }).eq("id", pet.id);
      onPhotoUpdated();
    }
    setUploadingPhoto(false);
  }

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docType, setDocType] = useState("Vaccination record");
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiresOn, setExpiresOn] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadDocuments() {
    setLoadingDocs(true);
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("pet_id", pet.id)
      .order("uploaded_at", { ascending: false });
    setDocuments(data || []);
    setLoadingDocs(false);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);

    const filePath = `${userId}/${pet.id}/${Date.now()}-${selectedFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("pet-documents")
      .upload(filePath, selectedFile);

    if (!uploadError) {
      await supabase.from("documents").insert({
        user_id: userId,
        pet_id: pet.id,
        document_type: docType,
        file_url: filePath, // storage path, not a public URL
        expires_on: expiresOn || null,
      });
      setSelectedFile(null);
      setExpiresOn("");
      setShowUploadForm(false);
      loadDocuments();
    }
    setUploading(false);
  }

  async function handleDeleteDocument(doc) {
    const path = toStoragePath(doc.file_url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    loadDocuments();
  }

  async function loadMeasurements() {
    setLoadingLog(true);
    const { data } = await supabase
      .from("pet_measurements")
      .select("*")
      .eq("pet_id", pet.id)
      .eq("metric_type", "weight")
      .order("recorded_date", { ascending: false });
    setMeasurements(data || []);
    setLoadingLog(false);
  }

  useEffect(() => {
    loadMeasurements();
  }, []);

  async function handleAddWeight(e) {
    e.preventDefault();
    setSaving(true);
    const pounds = parseFloat(newValue);
    const { error } = await supabase.from("pet_measurements").insert({
      user_id: userId,
      pet_id: pet.id,
      metric_type: "weight",
      value: pounds,
      recorded_date: newDate,
    });
    if (!error) await supabase.from("pets").update({ weight_lb: pounds }).eq("id", pet.id);
    setSaving(false);
    if (!error) {
      setNewValue("");
      setShowAddForm(false);
      loadMeasurements();
    }
  }

  const current = measurements[0];
  const previous = measurements[1];
  const delta = current && previous ? current.value - previous.value : null;
  const [showId, setShowId] = useState(false);
  const [healthRows, setHealthRows] = useState([]);
  const [healthKey, setHealthKey] = useState(0);
  useEffect(() => { supabase.from("pet_health_records").select("kind,name,expires_on").eq("pet_id", pet.id).then(({ data }) => setHealthRows(data || [])); }, [pet.id, healthKey]);
  const card = cardFromPet(pet, healthRows);
  const rab = rabiesLine(card.rabiesExpires);
  const reminders = [
    ...documents.filter((d) => d.expires_on).map((d) => ({ id: `doc-${d.id}`, label: d.document_type, date: d.expires_on })),
    ...healthRows.filter((h) => h.expires_on).map((h, i) => ({ id: `health-${i}-${h.name}`, label: h.name, date: h.expires_on })),
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const field = { fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 };
  const fieldCls = "rounded-lg px-3 py-2 outline-none w-full";
  const sub = (t) => <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }} className="mt-2">{t}</div>;
  const photoEl = pet.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null;

  const sections = [
    ["passport", "Passport", "passport"],
    ["health", "Health", "health"],
    ["docs", "Docs", "file"],
    ["lost", "Lost", "alert"],
    ["about", "About", "paw"],
  ];
  const panel = { background: "#fff", border: `1px solid ${tokens.line}` };
  const sectionTitle = (t, s) => (
    <div className="mb-3">
      <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>{t}</div>
      {s ? <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{s}</div> : null}
    </div>
  );

  return (
    <div id={`pet-top-${pet.id}`} className="mb-8 grid grid-cols-1 gap-4 min-w-0">
      <PetHero pet={pet} photo={photoEl} photoBusy={uploadingPhoto} onPhoto={handlePhotoUpload} onGo={(k, field) => { setSection(k); setTimeout(() => { if (field) window.dispatchEvent(new CustomEvent("ppg-focus-field", { detail: { petId: pet.id, field } })); else document.getElementById(`pet-nav-${pet.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60); }} />

      <div id={`pet-nav-${pet.id}`} className="ppg-pet-nav grid grid-cols-5 gap-1.5 sm:gap-2" style={{ scrollMarginTop: 8 }} role="tablist" aria-label={`${pet.name} sections`}>
        {sections.map(([key, label, icon]) => {
          const on = section === key;
          const t = SECTION_THEME[key];
          return (
            <button key={key} type="button" role="tab" aria-selected={on} onClick={() => setSection(key)} className="ppg-tab flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 sm:py-3 min-w-0 px-0.5"
              style={{ cursor: "pointer", background: on ? t.color : "#fff", border: `1.5px solid ${on ? t.color : tokens.line}`, boxShadow: on ? `0 8px 18px ${t.color}45` : "none" }}>
              <span className="flex items-center justify-center rounded-xl" style={{ width: 32, height: 32, background: on ? "rgba(255,255,255,0.2)" : t.soft, color: on ? "#fff" : t.color }}><Icon name={icon} size={18} /></span>
              <span className="ppg-tab-label" style={{ fontFamily: font.body, fontWeight: 800, color: on ? "#fff" : tokens.navy, lineHeight: 1.1, textAlign: "center" }}>{label}</span>
            </button>
          );
        })}
      </div>

      <div data-pet-section={section} className="grid grid-cols-1 gap-3 ppg-rise min-w-0" key={section}>
        {BANNERS[section] ? <SectionBanner k={section} title={BANNERS[section][0](pet.name)} text={BANNERS[section][1](pet.name)} /> : null}

        {(section === "passport" || section === "id") && (<>
          <PetProfileExperience pet={pet} userId={userId} onChanged={onPhotoUpdated} view="passport" />
          <Fold icon="file" color={th("passport").color} soft={th("passport").soft} title={`Edit ${pet.name}'s details`} hint="Name, breed, birthday, weight, training, microchip">
            <PetBasicsCard pet={pet} userId={userId} onChanged={onPhotoUpdated} bare />
          </Fold>
          <Fold icon="send" color={th("id").color} soft={th("id").soft} title="Care card for sitters" hint="A private link that expires">
            <ShareCard pet={pet} userId={userId} bare onDone={() => window.dispatchEvent(new CustomEvent("ppg-qr-done"))} />
          </Fold>
        </>)}

        {section === "health" && (<>
          <div id="health-passport-wrap" className="rounded-3xl p-4 sm:p-5" style={panel}>
            {sectionTitle("Vaccines & records", rab?.text || null)}
            <HealthPassport pet={pet} userId={userId} bare refreshKey={healthKey} onRows={setHealthRows} />
          </div>
          <Fold icon="camera" color={th("health").color} soft={th("health").soft} title="Scan a vet record" hint="Snap a photo, we fill it in">
            <VetImport pet={pet} userId={userId} onSaved={() => { setHealthKey((n) => n + 1); onPhotoUpdated(); }} />
          </Fold>
          <Fold icon="stethoscope" color={th("health").color} soft={th("health").soft} title="Vet, allergies & care" hint={pet.vet_name || "Food, routine, carrier size"}>
            <PetCareCard pet={pet} userId={userId} onChanged={onPhotoUpdated} />
          </Fold>
          <Fold icon="scale" color={th("health").color} soft={th("health").soft} title="Weight" hint={current ? `${current.value} ${current.unit || "lbs"}` : (pet.weight_lb ? `${pet.weight_lb} lb` : "Not logged yet")}>
            {measurements.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {measurements.slice(0, showLog ? undefined : 3).map((m) => (
                  <div key={m.id} className="flex justify-between items-center" style={{ fontFamily: font.body, fontSize: 14.5 }}>
                    <span style={{ color: tokens.muted }}>{m.recorded_date}</span>
                    <span className="flex items-center gap-3"><b style={{ color: tokens.navy }}>{m.value} {m.unit || "lbs"}</b>
                      <button aria-label="Delete entry" onClick={async () => { await supabase.from("pet_measurements").delete().eq("id", m.id); loadMeasurements(); }} style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted, textDecoration: "underline" }}>Delete</button></span>
                  </div>
                ))}
                {measurements.length > 3 && <button onClick={() => setShowLog((v) => !v)} className="self-start" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.navy, textDecoration: "underline" }}>{showLog ? "Show less" : "Show all"}</button>}
                {delta !== null && delta !== 0 && <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>{delta > 0 ? "+" : ""}{delta} since {previous.recorded_date}</div>}
              </div>
            )}
            <form onSubmit={handleAddWeight} className="grid gap-2 items-center min-w-0" style={{ gridTemplateColumns: "84px minmax(0,1fr) auto" }}>
              <input required type="number" step="0.1" placeholder="lbs" aria-label="Weight in pounds" value={newValue} onChange={(e) => setNewValue(e.target.value)} style={{ ...field, width: "100%" }} className="rounded-lg px-3 py-2 outline-none" />
              <input type="date" aria-label="Date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={field} className="rounded-lg px-3 py-2 outline-none w-full min-w-0" />
              <button type="submit" disabled={saving} className="ppg-btn ppg-btn-primary">{saving ? "Saving…" : "Log"}</button>
            </form>
          
          </Fold>
          <Fold id={`chip-${pet.id}`} icon="tag" color={th("health").color} soft={th("health").soft} title="Microchip" hint={pet.microchip_number ? `•••• ${String(pet.microchip_number).replace(/[^0-9A-Za-z]/g, "").slice(-4)}` : "Not added yet"}>
            <ChipVault pet={pet} userId={userId} onChanged={onPhotoUpdated} bare />
          </Fold>
          <Fold icon="search" color={th("health").color} soft={th("health").soft} title="Find a vet" hint="Near you or where you're going">
            <FindAVet pet={pet} />
          </Fold>
        </>)}

        {section === "docs" && (<>
          <PetDocumentsCard pet={pet} userId={userId} />
          <Fold icon="home" color={th("docs").color} soft={th("docs").soft} title="Housing paperwork" hint="Pet resume, landlord forms, references">
            <PetProfileExperience pet={pet} userId={userId} onChanged={onPhotoUpdated} view="docs" />
          </Fold>
        </>)}

        {section === "lost" && (
          <div id={`lost-${pet.id}`} className="rounded-3xl p-4 sm:p-5" style={panel}>
            <LostPanel pet={pet} userId={userId} onChanged={onPhotoUpdated} />
            <a href="/lost-flyer" className="inline-block mt-4" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 800, color: th("lost").color }}>Make a printable lost pet flyer →</a>
          </div>
        )}

        {section === "about" && (<>
          <PetProfileExperience pet={pet} userId={userId} onChanged={onPhotoUpdated} view="about" />
          <Fold icon="plane" color={th("about").color} soft={th("about").soft} title="Trips flown" hint="Every Travel Pass adds a stamp">
            <TravelStamps pet={pet} />
          </Fold>
        </>)}
      </div>
    </div>
  );
}

function VaultSection({ id, anchor, title, hint, hintTone, children, last, open }) {
  return (
    <details id={id} open={open} data-vault-section className="group" style={{ borderBottom: last ? "none" : `1px solid ${tokens.line}`, background: "#fff" }}>
      {anchor && <span id={anchor} />}
      <summary className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ cursor: "pointer", listStyle: "none" }}>
        <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{title}</span>
        <span className="flex items-center gap-2 min-w-0">
          {hint && <span style={{ fontFamily: font.body, fontSize: 15, color: hintTone === "bad" ? tokens.primary : tokens.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hint}</span>}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90 flex-shrink-0" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

function AccessGate() {
  return (
    <div className="rounded-2xl p-7 text-center" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-2">Your pet vault and Digital Pet ID are paused</div>
      <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted, lineHeight: 1.55 }} className="mb-5 max-w-lg mx-auto">
        They're included with Membership, or with a Travel Pass until 7 days after you fly (7 days after your return, if you added one). Your pets and documents are kept safe and come back as soon as you rejoin.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <a href="/join" className="btn-primary rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>{JOIN_CTA}</a>
        <a href="/assessment" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{PLAN_CTA}</a>
      </div>
    </div>
  );
}

function MemberUpsell() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [consent, setConsent] = useState(false);
  const [tips, setTips] = useState(false);
  return (
    <div className="rounded-xl p-5 mt-3" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-1">Traveling with more than one animal?</div>
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, lineHeight: 1.55 }} className="mb-3">
        Your plan includes one pet. Membership ({usd(P.member)}/mo) adds unlimited pets, {usd(P.memberPass)} Travel Passes and reminders before your documents expire. {MEMBERSHIP_TERMS}
      </p>
      <WithdrawalConsent checked={consent} onChange={(v) => { setConsent(v); setErr(""); }} error={err} />
      <MarketingOptIn checked={tips} onChange={setTips} />
      <button disabled={busy} onClick={async () => { if (!consent) { setErr(WITHDRAWAL_BLOCKED); return; } trackBeginCheckout("membership"); setBusy(true); const e = await startStripe("/api/stripe/checkout", { plan: "membership", immediate_access_consent: true, marketing_opt_in: tips }); if (e) { setErr(e); setBusy(false); } }} className="ppg-btn ppg-btn-primary">{JOIN_CTA}</button>
    </div>
  );
}

function PetProfileTab({ userId }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const blankPet = { name: "", animal_type: "Dog", role: "Pet", breed: "", sex: "", weight_lb: "", carrier_length_in: "", carrier_width_in: "", carrier_height_in: "" };
  const [form, setForm] = useState(blankPet);
  const [isMember, setIsMember] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const access = usePetAccess(userId);
  useEffect(() => { supabase.rpc("my_membership").then(({ data }) => setIsMember(!!data)); }, [userId]);

  const [loadError, setLoadError] = useState(false);
  const loadSeq = React.useRef(0);
  const loadedOnce = React.useRef(false);

  // Race-safe loader: only the latest request may update state, the spinner always
  // clears (try/finally), and a stalled request times out into a Retry state instead
  // of leaving "Loading your pets…" up forever.
  async function loadPets() {
    const seq = ++loadSeq.current;
    if (!loadedOnce.current) {
      setLoading(true);
      setLoadError(false);
    }
    try {
      const query = supabase.from("pets").select("*").order("created_at", { ascending: false });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 12000));
      const { data, error } = await Promise.race([query, timeout]);
      if (seq !== loadSeq.current) return;
      if (error) throw error;
      setPets(data || []);
      loadedOnce.current = true;
      setLoadError(false);
    } catch {
      if (seq === loadSeq.current && !loadedOnce.current) setLoadError(true);
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    loadPets();
    // Re-run once auth finishes restoring/refreshing the session (the original race:
    // the first query could fire before the session was ready).
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") setTimeout(loadPets, 0);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [userId]);

  async function handleAddPet(e) {
    e.preventDefault();
    setSaving(true);
    const pounds = form.weight_lb === "" ? null : Number(form.weight_lb);
    const { data: created, error } = await supabase.from("pets").insert({
      user_id: userId,
      name: form.name,
      animal_type: form.animal_type,
      role: form.role,
      breed: form.breed || null,
      sex: form.sex || null,
      weight_lb: pounds,
      carrier_length_in: form.carrier_length_in === "" ? null : Number(form.carrier_length_in),
      carrier_width_in: form.carrier_width_in === "" ? null : Number(form.carrier_width_in),
      carrier_height_in: form.carrier_height_in === "" ? null : Number(form.carrier_height_in),
    }).select("id").single();
    if (!error && created && pounds) {
      await supabase.from("pet_measurements").insert({ user_id: userId, pet_id: created.id, metric_type: "weight", value: pounds, recorded_date: new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }) });
    }
    setSaving(false);
    if (error && /PET_LIMIT/.test(error.message || "")) { setShowForm(false); setLimitHit(true); return; }
    if (!error) {
      setForm(blankPet);
      setShowForm(false);
      loadPets();
    }
  }

  // Lapsed (only when launched, or with ?preview=lapsed pre-launch): lost-pet tools stay
  // free; vault and full Pet ID show a win-back message. Nothing is deleted.
  if (!access.loading && !access.allowed) return (
    <div className="space-y-6 min-w-0">
      {pets.length === 0 && !loading ? (
        <div className="rounded-3xl p-6" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <h3 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-2">Keep every record in one place</h3>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }} className="mb-4">Pet Vault is {usd(P.member)} a month. It holds your pet's records, ID, and documents.</p>
          <a href="/join" className="ppg-btn ppg-btn-primary w-full">{JOIN_CTA}</a>
        </div>
      ) : null}
      {loading ? <div style={{ fontFamily: font.body, color: tokens.muted }}>Loading your pets…</div> : pets.map((pet) => (
        <div key={pet.id} className="rounded-2xl p-5 space-y-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div className="flex items-center gap-3">
            <PetIllustration type={pet.animal_type} size={48} />
            <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }}>{pet.name}</div>
          </div>
          <WinBack area="vault" petName={pet.name} compact />
          <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Report lost</div>
          <LostPanel pet={pet} userId={userId} />
        </div>
      ))}
      {pets.length > 1 && <WinBack area="pets" compact />}
      <a href="/lost-flyer" className="inline-block" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.navy, marginTop: 16 }}>Make a printable lost pet flyer →</a>
    </div>
  );
  return (
    <div>
      {loading ? (
        <div style={{ fontFamily: font.body, color: tokens.muted, fontSize: 16 }}>Loading your pets…</div>
      ) : loadError ? (
        <div className="rounded-xl p-6 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 16 }}>
          We couldn't load your pets.{" "}
          <button onClick={loadPets} className="ppg-btn ppg-btn-primary ml-2">Retry</button>
        </div>
      ) : pets.length === 0 && !showForm ? (
        <PassportWizard userId={userId} onCancel={() => window.history.back()} onDone={() => { loadPets(); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50); }} />
      ) : (
        <>
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} userId={userId} onPhotoUpdated={loadPets} />
          ))}
          {!showForm && (isMember ? (
            <button
              onClick={() => setShowForm(true)}
              style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy, fontWeight: 600 }}
              className="mt-1 underline"
            >
              + Add another pet
            </button>
          ) : limitHit ? (
            access.member === false && access.allowed === false ? <WinBack area="pets" compact /> : <MemberUpsell />
          ) : (
            <button
              onClick={() => setLimitHit(true)}
              style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy, fontWeight: 600 }}
              className="mt-1 underline"
            >
              + Add another pet
            </button>
          ))}
        </>
      )}

      {showForm && (
        <PassportWizard
          userId={userId}
          onCancel={() => setShowForm(false)}
          onDone={() => { setForm(blankPet); setShowForm(false); loadPets(); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50); }}
        />
      )}
    </div>
  );
}


function UnlockTripCard({ trip }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [consent, setConsent] = useState(false);
  const [tips, setTips] = useState(false);
  async function unlock() {
    if (!consent) { setErr(WITHDRAWAL_BLOCKED); return; }
    setBusy(true); setErr("");
    const { data: m } = await supabase.rpc("my_membership");
    const { data: s } = await supabase.auth.getSession();
    trackBeginCheckout(m ? "member_pass" : "pass");
    const r = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ plan: m ? "member_pass" : "pass", trip_id: trip.id, attribution: getAttribution(), immediate_access_consent: true, marketing_opt_in: tips }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.url) window.location.href = j.url; else { setErr(j.error || "Checkout isn't available right now. Please try again."); setBusy(false); }
  }
  return (
    <div className="rounded-xl p-6 text-center" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-1"><Icon name="lock" size={18} /> This trip isn't unlocked yet</div>
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.8 }} className="mb-4">Your full checklist, deadlines and reminders are ready the moment you finish checkout.</p>
      <MarketingOptIn checked={tips} onChange={setTips} />
      <WithdrawalConsent checked={consent} onChange={(v) => { setConsent(v); setErr(""); }} error={err} />
      <button disabled={busy} onClick={unlock} className="ppg-btn ppg-btn-primary">Unlock this trip</button>
      <TrustBadges className="mt-4 text-left" />
    </div>
  );
}


// Prominent Pet Vault card: pet, completion, three quick actions. Shown at the
// top of the Dashboard so the vault is never buried under trip details.
export function VaultCard({ userId, onOpenVault }) {
  const [pet, setPet] = useState(null);
  const [pct, setPct] = useState(null);
  useEffect(() => { if (!userId) return; (async () => {
    const { data: pets } = await supabase.from("pets").select("*").order("created_at", { ascending: false }).limit(1);
    const first = pets?.[0] || null; setPet(first);
    if (!first) { setPct(0); return; }
    const [{ count: docs }, { count: health }] = await Promise.all([
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("pet_id", first.id),
      supabase.from("pet_health_records").select("id", { count: "exact", head: true }).eq("pet_id", first.id),
    ]);
    const checks = [!!first.name, !!first.photo_url, !!first.microchip_number, !!first.chip_verified_at, !!first.vet_name, !!first.emergency_contact_name, (docs || 0) > 0, (health || 0) > 0];
    setPct(Math.round((checks.filter(Boolean).length / checks.length) * 100));
  })(); }, [userId]);
  if (pct == null) return null;
  if (pet) return (
    <button data-vault-card onClick={() => onOpenVault && onOpenVault()} className="w-full rounded-2xl p-4 mb-4 flex items-center gap-3 text-left" style={{ background: tokens.navy, border: "none", cursor: "pointer" }}>
      <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52, background: tokens.gold, border: "2px solid #fff" }}>
        {pet.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <span style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }}>{(pet.name || "P").slice(0, 1)}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{pet.name}’s Pet Vault</div>
        <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.sky, opacity: 0.85 }}>{pct}% set up</div>
        <div className="w-full max-w-[200px] h-[5px] rounded-full mt-1.5" style={{ background: "rgba(255,255,255,0.18)" }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: tokens.gold }} /></div>
      </div>
      <span className="rounded-full px-4 py-2 flex-shrink-0" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontSize: 14.5, fontWeight: 700 }}>Open</span>
    </button>
  );
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: tokens.navy }}>
      <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700, color: "#fff" }}>Pet Vault? Start here.</div>
      <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, opacity: 0.85 }} className="mb-3">{VAULT_SUB}</div>
      <button onClick={() => onOpenVault && onOpenVault()} className="rounded-full px-5 py-2.5" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>Add your pet</button>
    </div>
  );
}

// A trip is past once its travel date (and return date, if any) is before today (PT).
function tripIsPast(t) {
  if (!t?.travel_date) return false;
  const today = todayPT();
  return t.travel_date < today && (!t.return_date || t.return_date < today);
}

// Dashboard overview: next-trip countdown, ONE consolidated Needs Action list
// (time-sensitive reminders first, then open checklist steps, de-duplicated),
// then the vault. Everything detailed lives under My Trips.
export function DashboardTab({ userId, onOpenTrips }) {
  const [trip, setTrip] = useState(null);
  const [actions, setActions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doneCount, setDoneCount] = useState(0);
  const [stepTotal, setStepTotal] = useState(0);
  const pet = useTripPet(trip);
  useEffect(() => { (async () => {
    const today = todayPT();
    let { data: trips, error: tripErr } = await supabase.from("trips").select("*").or(`travel_date.gte.${today},return_date.gte.${today}`).order("travel_date", { ascending: true }).limit(1);
    if (tripErr || !trips?.length) {
      const again = await supabase.from("trips").select("*").order("travel_date", { ascending: false }).limit(1);
      trips = again.data;
    }
    const current = trips?.[0] || null; setTrip(current);
    const list = []; let doneN = 0;
    if (current?.paid && !tripIsPast(current)) {
      const today = todayPT();
      // Only real checklist steps here. Reminder headings ("30 days before your flight") are not tasks.
      const { data: reqs } = await supabase.rpc("get_trip_requirements", { p_trip_id: current.id, p_trip_types: requirementQueryTypes(current) });
      const { data: statusRows } = await supabase.from("trip_requirement_status").select("*").eq("trip_id", current.id);
      const doneMap = {};
      (statusRows || []).forEach((s) => { if (s.completed) doneMap[s.requirement_id] = true; });
      const seen = new Set(list.map((a) => a.label.toLowerCase()));
      let petRow = null;
      if (current.pet_id) { const { data: pr } = await supabase.from("pets").select("id,name,weight_lb,carrier_length_in,carrier_width_in,carrier_height_in").eq("id", current.pet_id).maybeSingle(); petRow = pr || null; }
      const grouped = groupCards(segmentPlans(reqs || [], { ...current, pet: petRow }).flatMap((p) => p.cards), doneMap);
      doneN = grouped.done.length;
      setStepTotal(passProgress(grouped).total);
      for (const card of [...grouped.first, ...grouped.general]) {
        if (seen.has(card.shortTitle.toLowerCase())) continue;
        seen.add(card.shortTitle.toLowerCase());
        const chip = dueChip(card.dueDate, today, { suggested: card.dueSuggested, dayOf: card.dueKind === "dayof" });
        list.push({ key: `card-${card.id}`, label: card.shortTitle, hint: card.dueDate ? chip.label : "Before you fly" });
      }
    }
    setActions(list); setDoneCount(doneN); if (!current?.paid) setStepTotal(0); setLoading(false);
  })(); }, []);
  if (loading) return <div style={{ fontFamily: font.body, color: tokens.muted }}>Loading your dashboard…</div>;
  const visible = showAll ? actions : actions.slice(0, 4);
  return (
    <div>
      {trip?.paid && tripIsPast(trip) ? (
        <button onClick={onOpenTrips} className="w-full rounded-2xl px-4 py-3.5 mb-4 flex items-center justify-between gap-3 text-left" style={{ background: "#fff", border: `1px solid ${tokens.line}`, cursor: "pointer" }}>
          <span className="min-w-0">
            <span style={{ display: "block", fontFamily: font.body, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: tokens.muted }}>PAST TRIP</span>
            <span style={{ display: "block", fontFamily: font.body, fontSize: 15.5, fontWeight: 700, color: tokens.navy }}>{trip.origin} → {trip.destination}{trip.travel_date ? ` · ${fmtTripDate(trip.travel_date)}` : ""}</span>
          </span>
          <a href="/assessment" onClick={(e) => e.stopPropagation()} className="rounded-full px-4 py-2 flex-shrink-0" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>{PLAN_CTA}</a>
        </button>
      ) : trip?.paid ? <TripCountdown trip={trip} pet={pet} done={doneCount} total={stepTotal} />
        : trip && !tripIsPast(trip) ? <div className="mb-4"><UnpaidTripCard trip={trip} petName={pet?.name} onOpen={onOpenTrips} /></div>
        : <div className="mb-4"><PlanTripCard /></div>}
      {trip?.paid && !tripIsPast(trip) && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, color: tokens.navy }} className="mb-3">Up next for this trip</div>
          {actions.length === 0 ? <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>Nothing due right now.</p> : <>
            <ul className="space-y-2">{visible.map((a) => (
              <li key={a.key}><button type="button" onClick={onOpenTrips} className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left" style={{ background: tokens.paper, border: "none", cursor: "pointer", minHeight: 52 }}>
                <span style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }}>{a.label}</span>
                <span className="flex items-center gap-2" style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.primary, whiteSpace: "nowrap" }}>{a.hint}<span aria-hidden="true">›</span></span>
              </button></li>))}
            </ul>
            {actions.length > 4 && <button onClick={() => setShowAll((s) => !s)} style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.navy, background: "none", border: "none", padding: "8px 0 0", cursor: "pointer", textDecoration: "underline" }}>{showAll ? "Show less" : `Show ${actions.length - 4} more`}</button>}
            <div className="mt-4"><button onClick={onOpenTrips} className="ppg-btn ppg-btn-primary">View trip</button></div>
          </>}
        </div>
      )}
    </div>
  );
}

const TRIP_PAGE = 20;

async function loadTripRoster(upLimit, pastLimit) {
  const today = todayPT();
  const [up, past, pets] = await Promise.all([
    supabase.from("trips").select("*", { count: "exact" }).or(`travel_date.is.null,travel_date.gte.${today},return_date.gte.${today}`).order("travel_date", { ascending: true, nullsFirst: true }).range(0, upLimit - 1),
    supabase.from("trips").select("*", { count: "exact" }).lt("travel_date", today).or(`return_date.is.null,return_date.lt.${today}`).order("travel_date", { ascending: false }).range(0, pastLimit - 1),
    supabase.from("pets").select("id,name,animal_type"),
  ]);
  if (up.error || past.error) {
    const all = await supabase.from("trips").select("*").order("travel_date", { ascending: true }).limit(upLimit + pastLimit);
    const rows = all.data || [];
    const upcoming = rows.filter((trip) => !tripIsPast(trip));
    const pastRows = rows.filter(tripIsPast).sort((a, b) => String(b.travel_date || "").localeCompare(String(a.travel_date || "")));
    return { upcoming: upcoming.slice(0, upLimit), past: pastRows.slice(0, pastLimit), upTotal: upcoming.length, pastTotal: pastRows.length, pets: pets.data || [] };
  }
  return { upcoming: up.data || [], past: past.data || [], upTotal: up.count || 0, pastTotal: past.count || 0, pets: pets.data || [] };
}

function CurrentFlightTab({ userId }) {
  const [trip, setTrip] = useState(null);
  const [roster, setRoster] = useState({ upcoming: [], past: [], upTotal: 0, pastTotal: 0, pets: [] });
  const [limits, setLimits] = useState({ up: TRIP_PAGE, past: TRIP_PAGE });
  const [results, setResults] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [petChoices, setPetChoices] = useState([]);
  const petForTrip = useTripPet(trip);
  useEffect(() => {
    if (!trip?.id || trip.pet_id) { setPetChoices([]); return; }
    supabase.from("pets").select("id,name,animal_type").then(async ({ data }) => {
      const pets = data || [];
      const pick = pickTripPet(pets, trip);
      if (pick) {
        const { error } = await supabase.from("trips").update({ pet_id: pick.id }).eq("id", trip.id);
        if (!error) setTrip((t) => (t ? { ...t, pet_id: pick.id } : t));
      } else setPetChoices(pets);
    });
  }, [trip?.id, trip?.pet_id]);
  useEffect(() => { supabase.rpc("my_membership").then(({ data }) => setIsMember(!!data)); }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const next = await loadTripRoster(limits.up, limits.past);
      if (cancel) return;
      setRoster(next);
      const all = [...next.upcoming, ...next.past];
      setTrip((current) => all.find((row) => row.id === current?.id) || next.upcoming[0] || next.past[0] || null);
      setLoading(false);
    })();
    return () => { cancel = true; };
  }, [limits.up, limits.past]);

  useEffect(() => {
    if (!trip?.id) { setResults([]); setStatusMap({}); return; }
    let cancel = false;
    (async () => {
      const { data: reqs } = trip.paid
        ? await supabase.rpc("get_trip_requirements", {
            p_trip_id: trip.id,
            p_trip_types: requirementQueryTypes(trip),
          })
        : { data: [] };
      if (cancel) return;
      const rows = (reqs || []).filter((r) => r.category !== "ELIGIBILITY NOTE");
      const multi = (Array.isArray(trip.segments) && trip.segments.length > 1) || !!(trip.connecting && trip.second_airline);
      const filtered = (multi ? rows : rows.filter((row) => matchesDestination(row, trip))).map((r) => (trip.paid ? r : { ...r, source_url: null, verified_at: null }));
      setResults(filtered);
      if (trip.paid && reqs) {
        const plans = segmentPlans(filtered, trip);
        const nextStatus = plans.length && plans.every((plan) => plan.resolved) ? "ready" : "checking";
        if (trip.status !== nextStatus) {
          supabase.from("trips").update({ status: nextStatus }).eq("id", trip.id);
          setTrip((current) => (current && current.id === trip.id ? { ...current, status: nextStatus } : current));
        }
      }
      if (trip.paid && !trip.details_first_viewed_at) supabase.rpc("mark_trip_details_viewed", { p_trip_id: trip.id });
      const { data: statusRows } = await supabase.from("trip_requirement_status").select("*").eq("trip_id", trip.id);
      if (cancel) return;
      const map = {};
      (statusRows || []).forEach((s) => { map[s.requirement_id] = s.completed; });
      setStatusMap(map);
    })();
    return () => { cancel = true; };
  }, [trip?.id, trip?.paid]);

  async function handleSetDone(requirementIds, completed) {
    const ids = (requirementIds || []).filter((id) => /^[0-9a-f-]{36}$/i.test(String(id || "")));
    setStatusMap((m) => {
      const next = { ...m };
      (requirementIds || []).forEach((id) => { next[id] = completed; });
      return next;
    });
    if (!ids.length || !trip?.id) return;
    await Promise.all(ids.map((requirementId) => supabase.from("trip_requirement_status").upsert(
      { user_id: userId, trip_id: trip.id, requirement_id: requirementId, completed },
      { onConflict: "trip_id,requirement_id" }
    )));
  }

  async function saveReturn(patch) {
    const { error } = await supabase.from("trips").update(patch).eq("id", trip.id);
    if (error) return error.message || "Couldn't save the return. Try again.";
    setTrip((t) => ({ ...t, ...patch }));
    return "";
  }

  if (loading) {
    return <div style={{ fontFamily: font.body, opacity: 0.6, fontSize: 15.5 }}>Loading your trip…</div>;
  }

  const petName = (row) => roster.pets.find((pet) => pet.id === row.pet_id)?.name || "No pet linked yet";
  const openTrip = (row) => setTrip(row);
  function TripList({ title, rows, total, onMore }) {
    if (!rows.length && total === 0) return null;
    return (
      <section className="mb-4">
        <h3 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-2">{title}</h3>
        <div className="grid gap-2">
          {rows.map((row) => {
            const open = trip?.id === row.id;
            return (
              <button key={row.id} type="button" onClick={() => openTrip(row)} className="w-full rounded-2xl px-4 py-3 text-left" style={{ background: "#fff", border: `2px solid ${open ? tokens.navy : tokens.line}`, cursor: "pointer" }}>
                <span className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="min-w-0" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{row.origin} → {row.destination}</span>
                  <span className="rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: row.paid ? "#E5F4EE" : "#FFF4DB", color: row.paid ? tokens.green : "#8A5A00", fontFamily: font.body, fontSize: 12, fontWeight: 700 }}>{row.paid ? "Unlocked" : "Not unlocked yet"}</span>
                  {tripIsPast(row) ? <span className="rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 12, fontWeight: 700 }}>Past</span> : null}
                </span>
                <span className="block mt-1" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{row.travel_date ? fmtTripDate(row.travel_date) : "Date not set"}{row.airline ? ` · ${row.airline}` : ""}</span>
                <span className="block mt-0.5" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{petName(row)}</span>
              </button>
            );
          })}
        </div>
        {total > rows.length && <button type="button" onClick={onMore} className="ppg-btn ppg-btn-secondary mt-2">Show more</button>}
      </section>
    );
  }
  const anyTrip = roster.upTotal + roster.pastTotal > 0;

  if (!anyTrip) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-4">
          No trip yet
        </div>
        <a
          href="/assessment"
          className="ppg-btn ppg-btn-primary"
        >
          {PLAN_CTA}
        </a>
      </div>
    );
  }

  const detail = !trip ? null : !trip.paid ? <UnlockTripCard trip={trip} /> : (
    <TravelPassDashboard
      trip={trip}
      pet={petForTrip}
      petChoices={petChoices}
      onPickPet={async (id) => {
        const { error } = await supabase.from("trips").update({ pet_id: id }).eq("id", trip.id);
        if (!error) {
          setTrip((t) => ({ ...t, pet_id: id }));
          setRoster((r) => ({
            ...r,
            upcoming: r.upcoming.map((row) => row.id === trip.id ? { ...row, pet_id: id } : row),
            past: r.past.map((row) => row.id === trip.id ? { ...row, pet_id: id } : row),
          }));
        }
      }}
      onSetRolePet={async () => {
        await supabase.from("trips").update({ role: "Pet", service_kind: null }).eq("id", trip.id);
        setTrip((t) => ({ ...t, role: "Pet", service_kind: null }));
      }}
      results={results}
      statusMap={statusMap}
      onSetDone={handleSetDone}
      onSaveReturn={saveReturn}
      isMember={isMember}
    />
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, color: tokens.navy, lineHeight: 1.08 }}>My Trips</h1>
        <a href="/assessment" style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 700, color: tokens.navy, textDecoration: "underline" }}>+ New trip</a>
      </div>
      {roster.upcoming.length + roster.past.length > 1 ? <TripList title="Upcoming" rows={roster.upcoming} total={roster.upTotal} onMore={() => setLimits((n) => ({ ...n, up: n.up + TRIP_PAGE }))} /> : null}
      <TripList title="Past" rows={roster.past} total={roster.pastTotal} onMore={() => setLimits((n) => ({ ...n, past: n.past + TRIP_PAGE }))} />
      {detail}
    </div>
  );
}

function BillingTab({ userId, email }) {
  const [memberRow, setMemberRow] = useState(null); const [isMember, setIsMember] = useState(null);
  const [purchases, setPurchases] = useState([]); const [legacyTrips, setLegacyTrips] = useState([]);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [consent, setConsent] = useState(false); const [tips, setTips] = useState(false);
  useEffect(() => { if (!userId) return; (async () => {
    const [{ data: m }, { data: buys }, { data: trips }] = await Promise.all([
      supabase.from("memberships").select("status,current_period_end").eq("user_id", userId).maybeSingle(),
      supabase.from("purchases").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("trips").select("id,origin,destination,airline,travel_date,paid_at").eq("paid", true).order("paid_at", { ascending: false }).limit(20),
    ]);
    setMemberRow(m || null); setIsMember(!!m && m.status === "active" && (!m.current_period_end || new Date(m.current_period_end) > new Date()));
    setPurchases(buys || []); if (!buys?.length) setLegacyTrips(trips || []);
  })(); }, [userId]);
  async function go(path, body) { setBusy(true); setErr(""); const { data: s } = await supabase.auth.getSession(); const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify(body || {}) }); const j = await r.json().catch(() => ({})); if (r.ok && j.url) window.location.href = j.url; else { setErr(j.error || "Something went wrong. Please try again."); setBusy(false); } }
  const money = (c, cur) => c == null ? "" : `$${(c / 100).toFixed(2)} ${(cur || "usd").toUpperCase()}`;
  const kindLabel = { pass: "Travel Pass", member_pass: "Travel Pass · member price", join: "Membership + Travel Pass", membership: "Membership", membership_renewal: "Membership renewal" };
  return (
    <div className="rounded-xl p-6 sm:p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">Account</div>
      {email ? <p className="mb-6" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, overflowWrap: "anywhere" }}>{email}</p> : null}
      <div className="mb-6">
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-2">Purchase history</div>
        {purchases.length === 0 && legacyTrips.length === 0 && <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }}>No purchases yet. Stripe also emails a receipt for every payment.</p>}
        <div className="space-y-2">{purchases.map((x) => <div key={x.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
          <div className="min-w-0"><div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>{kindLabel[x.kind] || "Purchase"}</div><div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{new Date(x.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{x.amount_cents != null ? ` · ${money(x.amount_cents, x.currency)}` : ""}</div></div>
          {x.receipt_url ? <a href={x.receipt_url} target="_blank" rel="noopener noreferrer" className="ppg-btn ppg-btn-secondary ppg-btn-compact flex-shrink-0">Receipt</a> : <button onClick={() => go("/api/stripe/portal")} className="ppg-btn ppg-btn-secondary ppg-btn-compact flex-shrink-0">Receipts</button>}
        </div>)}{legacyTrips.map((t) => <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
          <div className="min-w-0"><div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Travel Pass</div><div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{t.origin} → {t.destination}{t.paid_at ? ` · ${new Date(t.paid_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}</div></div>
          <button onClick={() => go("/api/stripe/portal")} className="ppg-btn ppg-btn-secondary ppg-btn-compact flex-shrink-0">Receipts</button>
        </div>)}</div>
        <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mt-3">Receipts open in Stripe.</p>
      </div>
      <div className="pt-5" style={{ borderTop: `1px solid ${tokens.line}` }}>
      {isMember === null ? <div style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</div> : isMember ? <>
          <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mb-1">You're a PetPassGo member ({usd(P.member)}{P.memberUnit}).</p>
          {memberRow?.current_period_end && <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mb-3">Current period ends {new Date(memberRow.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>}
          <button disabled={busy} onClick={() => go("/api/stripe/portal")} className="ppg-btn ppg-btn-secondary">Cancel membership</button>
          <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }} className="mt-3">Cancel online here. No phone call. You keep access through the period you've paid, and you won't be charged again.</p>
          <button disabled={busy} onClick={() => go("/api/stripe/portal")} className="ppg-btn ppg-btn-secondary mt-3">Receipts and payment method</button>
          {err && <p role="alert" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.stamp }} className="mt-3">{err}</p>}
        </> : <>
          <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mb-4">{memberRow?.status === "canceled" ? "Your membership has ended. " : ""}<b>{VAULT_NAME}</b> · {usd(P.member)}{P.memberUnit}. {VAULT_SUB} Plus {usd(P.memberPass)} Travel Passes. {MEMBERSHIP_TERMS}</p>
          <WithdrawalConsent checked={consent} onChange={(v) => { setConsent(v); setErr(""); }} error={err} />
          <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => { if (!consent) { setErr(WITHDRAWAL_BLOCKED); return; } trackBeginCheckout("membership"); go("/api/stripe/checkout", { plan: "membership", immediate_access_consent: true, marketing_opt_in: tips }); }} className="ppg-btn ppg-btn-primary">{JOIN_CTA}</button><button disabled={busy} onClick={() => go("/api/stripe/portal")} className="ppg-btn ppg-btn-secondary">Receipts and cards</button></div>
        </>}
      </div>
      <MarketingSettings onMarketingChange={setTips} />
    </div>
  );
}

function AccountMenu({ onLogout }) {
  const items = [
    { href: "/business/dashboard", icon: "home", label: "Business listings", sub: "Manage your Discover listing" },
    { href: "/faq", icon: "help", label: "Help & FAQ", sub: "Answers to common questions" },
    { href: "/contact", icon: "chat", label: "Contact support", sub: "support@petpassgo.com" },
    { href: "/guarantee", icon: "shield", label: "Flight-Ready Guarantee", sub: "How it works" },
  ];
  return (
    <div className="rounded-3xl overflow-hidden mb-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      {items.map((it, i) => (
        <a key={it.href} href={it.href} className="flex items-center gap-3.5 px-5 py-4" style={{ textDecoration: "none", borderTop: i ? `1px solid ${tokens.line}` : "none" }}>
          <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: tokens.sky, color: tokens.navy }}><Icon name={it.icon} size={20} /></span>
          <span className="flex-1 min-w-0"><span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{it.label}</span><span className="block" style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{it.sub}</span></span>
          <span style={{ color: tokens.muted }}>›</span>
        </a>
      ))}
      <button type="button" onClick={onLogout} className="w-full flex items-center gap-3.5 px-5 py-4 text-left" style={{ background: "none", borderWidth: "1px 0 0", borderStyle: "solid", borderColor: tokens.line, cursor: "pointer" }}>
        <span className="rounded-xl flex items-center justify-center shrink-0" style={{ width: 40, height: 40, background: "#FFF1EE", color: "#B4321C" }}><Icon name="x" size={20} /></span>
        <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: "#B4321C" }}>Log out</span>
      </button>
    </div>
  );
}

function CheckoutBanner() {
  const [msg, setMsg] = useState(null); const [sessionId, setSessionId] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search); const q = u.get("checkout");
    if (q === "success") {
      setMsg("paid");
      const sid = u.get("session_id"); setSessionId(sid);
      // Fire Purchase (and MembershipStart for membership kinds) once, with the
      // real amount/kind from the purchases row written by the Stripe webhook.
      if (sid) (async () => {
        for (let i = 0; i < 6; i++) {
          const { data } = await supabase.from("purchases").select("kind,amount_cents,currency").eq("stripe_checkout_session_id", sid).maybeSingle();
          if (data) { trackPurchaseOnce({ transactionId: sid, value: data.amount_cents != null ? data.amount_cents / 100 : undefined, currency: data.currency || "USD", kind: data.kind }); return; }
          await new Promise((r) => setTimeout(r, 2000));
        }
        trackPurchaseOnce({ transactionId: sid, kind: "purchase" }); // amount unknown; still count the conversion once
      })();
    }
    else if (q === "canceled") { setMsg("Checkout canceled. You haven't been charged."); setTimeout(() => setMsg(null), 7000); }
    if (q) { u.delete("checkout"); u.delete("session_id"); const qs = u.toString(); window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "")); }
  }, []);
  if (!msg) return null;
  return <><div role="status" className="rounded-2xl p-4 mb-6 flex items-start gap-3 ppg-rise" style={{ background: "#fff", border: `1px solid ${msg === "paid" ? tokens.green : tokens.line}`, fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }}><span className="flex-1">{msg === "paid" ? <><b>You&apos;re all set.</b> Everything is unlocked below. If something still looks locked, give it a few seconds and refresh.</> : msg}</span><button type="button" aria-label="Dismiss" onClick={() => setMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: tokens.muted, padding: 2 }}><Icon name="x" size={18} /></button></div>
  {sessionId && <FeedbackPrompt kind="purchase" refKey={sessionId} title="How did that feel?" blurb="A quick rating helps us make PetPassGo better." />}</>;
}

function PostTripFeedback() {
  const [trip, setTrip] = useState(null);
  useEffect(() => { const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }); supabase.from("trips").select("id,origin,destination,travel_date,return_date").eq("paid", true).lt("travel_date", today).order("travel_date", { ascending: false }).limit(1).then(async ({ data, error }) => { let row = data?.[0]; if (error) { const again = await supabase.from("trips").select("id,origin,destination,travel_date").eq("paid", true).lt("travel_date", today).order("travel_date", { ascending: false }).limit(1); row = again.data?.[0]; } if (row && (!row.return_date || row.return_date < today)) setTrip(row); }); }, []);
  if (!trip) return null;
  return <FeedbackPrompt kind="post_trip" tripId={trip.id} refKey={trip.id} title="How was the trip?" blurb={`Tell us how ${trip.origin} → ${trip.destination} went.`} />;
}

// Keep trying while the section loads (pets and records arrive a moment after the tab opens).
function revealWhenReady(sel, tries = 25) {
  if (revealAnchor(sel) || tries <= 0) return;
  setTimeout(() => revealWhenReady(sel, tries - 1), 250);
}

function revealAnchor(sel) {
  let el = null; try { el = document.querySelector(sel); } catch { return false; }
  if (!el) return false;
  for (let d = el.closest("details"); d; d = d.parentElement?.closest("details")) d.open = true;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bottomKey, setBottomKey] = useState(null);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data?.user) window.location.href = "/login";
        else setUser(data.user);
      })
      .catch(() => (window.location.href = "/login"))
      .finally(() => setLoading(false));

    const want = new URLSearchParams(window.location.search).get("tab");
    if (want) setActiveTab({ vault: "vault", profile: "vault", trips: "trips", flight: "trips", history: "trips", billing: "billing", dashboard: "dashboard" }[want] || "dashboard");
    // ?focus=id (header "Pet ID" link): open Pet Vault and scroll to the pet's ID card once it has loaded.
    if (new URLSearchParams(window.location.search).get("focus") === "id") {
      window.__ppgPetSection = { petId: null, section: "id" };
      setActiveTab("vault");
    }
    else if (localStorage.getItem("petpassgo_open_flight_tab")) {
      setActiveTab("trips");
      localStorage.removeItem("petpassgo_open_flight_tab");
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // Mobile bottom tabs -> real surfaces only: Home=Dashboard, Travel=My Trips,
  // Passport=Pet Vault Pet ID card, Health=Pet Vault health records, More=Billing.
  const bottomActive = (bottomKey === "passport" || bottomKey === "health") && activeTab === "vault" ? bottomKey : activeTab === "dashboard" ? "home" : activeTab === "trips" ? "travel" : activeTab === "billing" ? "more" : "passport";
  function openVaultAnchor(anchor) {
    setActiveTab("vault");
    if (anchor) setTimeout(() => revealWhenReady(anchor), 150);
  }
  // From Home: open one pet's passport, Pet ID, health records or lost-pet panel.
  function openPet(petId, kind) {
    const section = { passport: "passport", id: "passport", health: "health", lost: "lost" }[kind] || null;
    setBottomKey(section === "health" ? "health" : section === "passport" ? "passport" : null);
    if (section) {
      window.__ppgPetSection = { petId, section };
      window.dispatchEvent(new CustomEvent("ppg-pet-section", { detail: { petId, section } }));
    }
    setActiveTab("vault");
    const sc = document.querySelector(".ppg-account-scroll");
    if (petId) setTimeout(() => revealWhenReady(`#pet-top-${petId}`), 150);
    else (sc || window).scrollTo({ top: 0 });
  }
  // In-page links (#chip-vault, #health-passport…) open the collapsed section they point into.
  useEffect(() => {
    function onClick(e) {
      const a = e.target.closest?.('a[href^="#"]'); if (!a) return;
      const sel = a.getAttribute("href"); if (sel.length < 2) return;
      if (revealAnchor(sel)) e.preventDefault();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  function handleBottomNav(key) {
    setBottomKey(key);
    if (key === "home") setActiveTab("dashboard");
    else if (key === "travel") setActiveTab("trips");
    else if (key === "passport") openPet(null, "passport");
    else if (key === "health") openPet(null, "health");
    else setActiveTab("billing");
    const scroller = document.querySelector(".ppg-account-scroll");
    if (scroller) scroller.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // While typing on a phone, the keyboard takes half the screen: get the bottom bar,
  // chat button and sticky section tabs out of the way so the field stays visible.
  useEffect(() => {
    const root = document.documentElement;
    const isField = (el) => el && (el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el.tagName === "INPUT" && !/^(checkbox|radio|button|submit|file|range|color)$/i.test(el.type)));
    function onIn(e) {
      if (window.innerWidth >= 1024 || !isField(e.target)) return;
      root.classList.add("ppg-typing");
      setTimeout(() => e.target.scrollIntoView?.({ block: "center", behavior: "smooth" }), 300);
    }
    function onOut() { setTimeout(() => { if (!isField(document.activeElement)) root.classList.remove("ppg-typing"); }, 120); }
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); root.classList.remove("ppg-typing"); };
  }, []);

  useEffect(() => {
    const dock = document.querySelector(".ppg-account-dock");
    if (!dock) return;
    const sync = () => document.documentElement.style.setProperty("--ppg-dock-h", `${dock.offsetHeight}px`);
    sync();
    const obs = new ResizeObserver(sync);
    obs.observe(dock);
    return () => { obs.disconnect(); document.documentElement.style.removeProperty("--ppg-dock-h"); };
  }, [loading, user]);

  return (
    <div style={{ background: tokens.sky }} className="ppg-account-app w-full">
      <SiteHeader onLogout={handleLogout} />
      {loading ? (
        <main className="ppg-account-scroll flex items-center justify-center py-24" style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</main>
      ) : (
      <main className="ppg-account-scroll w-full max-w-[1100px] mx-auto px-4 md:px-8 pt-8 md:pt-12 ppg-account-clear min-w-0 overflow-x-clip">
        <CheckoutBanner />
        <PostTripFeedback />
        <div role="tablist" className="hidden md:inline-flex flex-wrap gap-1 mb-8 p-1 rounded-full" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => { setBottomKey(null); setActiveTab(tab.key); }}
              style={{
                fontFamily: font.body,
                fontSize: 16,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: activeTab === tab.key ? tokens.navy : "transparent",
                color: activeTab === tab.key ? "#fff" : tokens.ink,
              }}
              className="rounded-full px-5 py-2.5 transition"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (<>
          <Greeting user={user} />
          <DashboardTab userId={user?.id} onOpenTrips={() => { setActiveTab("trips"); const sc = document.querySelector(".ppg-account-scroll"); (sc || window).scrollTo({ top: 0 }); }} />
          <SectionTitle action={<button type="button" onClick={() => openPet(null, null)} style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.primary, background: "none", border: "none", cursor: "pointer" }}>See all →</button>}>My pets</SectionTitle>
          <PetsStrip userId={user?.id} onOpen={(id, kind) => openPet(id, kind)} />
          <SectionTitle>Shortcuts</SectionTitle>
          <QuickActions onOpen={(id, kind) => openPet(id, kind)} />
          <div className="h-6" />
        </>)}

        {activeTab === "vault" && (<>
          <h1 className="sr-only">My Pets</h1>
          <PetProfileTab userId={user?.id} />
        </>)}

        {activeTab === "trips" && <CurrentFlightTab userId={user?.id} />}

        {activeTab === "billing" && (<>
          <h1 style={{ fontFamily: font.display, fontSize: 34, fontWeight: 800, color: tokens.navy, lineHeight: 1.08 }} className="mb-5">Account</h1>
          <AccountMenu onLogout={handleLogout} />
          <BillingTab userId={user?.id} email={user?.email} />
        </>)}
      </main>
      )}
      <div className="ppg-account-dock">
        <div id="ppg-support-dock" className="ppg-support-dock">
          <div id="ppg-chat-slot" />
          <div id="ppg-contact-slot" />
        </div>
        {!loading && user ? <MobileBottomNav docked active={bottomActive} onNavigate={handleBottomNav} /> : null}
      </div>
      <SavedToast />
    </div>
  );
}
