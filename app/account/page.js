"use client";

import Icon from "../../components/Icon";
import { telHref } from "../../lib/linkify";
import { VAULT_NAME, VAULT_SUB, MEMBERSHIP_TERMS } from "../../lib/travelPassOffer";
import GuaranteeLine from "../../components/GuaranteeLine";
import React, { useEffect, useState } from "react";
import { LiveFlightCard } from "../../components/FlightLookup";
import { supabase } from "../../lib/supabaseClient";
import { usePetAccess } from "../../lib/access";
import WinBack from "../../components/WinBack";
import { PRICES as P } from "../../lib/pricing";
import { JOIN_CTA, PLAN_CTA } from "../../lib/cta";
import { startStripe } from "../../lib/checkout";
import { trackBeginCheckout, trackPurchaseOnce, getAttribution } from "../../lib/analytics";
import { requirementAirline } from "../../lib/airlines";
import { tripTypeForRoute, isMexicoAirport } from "../../lib/airports";
import SiteHeader from "../../components/SiteHeader";
import { useTripPet, isTravelDay, TripCountdown, DayOfMode, PetReliefCard, CommunityPulse, TripExtras } from "../../components/TripLive";
import { maskChip, ChipVault, HealthPassport, ShareCard, WalletCard, ActivationChecklist } from "../../components/PetIdV2";
import { WhatsNeededNext, TravelStamps, FindAVet } from "../../components/PetExtras";
import VetImport from "../../components/VetImport";
import PetQr from "../../lib/PetQr";
import { PetIdSheet, cardFromPet, rabiesLine, isService } from "../../components/PetIdPreview";
import FeedbackPrompt from "../../components/FeedbackPrompt";
import MobileBottomNav from "../../components/MobileBottomNav";
import LostPanel from "../../components/LostPanel";
import PetIdCard, { PetIllustration } from "../../components/PetIdCard";
import TripTimeline from "../../components/TripTimeline";
import DocCheck from "../../components/DocCheck";
import PassChecklist from "../../components/PassChecklist";
import RoundTripAddon from "../../components/RoundTripAddon";
import { buildPassCards, groupCards, isServiceRole } from "../../lib/passCards";
import { reminderSchedule, classifyReminder, todayPT } from "../../lib/travelDates";
import { fmtTripDate } from "../../lib/tripAccess";
import VetGuidance from "../../components/VetGuidance";
import { BUCKET, SignedImg, getSignedUrl, toStoragePath } from "../../lib/storage";
import { tokens, font } from "../../lib/theme";



const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "vault", label: "Pet Vault" },
  { key: "trips", label: "My Trips" },
  { key: "billing", label: "Account & Billing" },
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

function PetCard({ pet, userId, onPhotoUpdated }) {
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
    const { error } = await supabase.from("pet_measurements").insert({
      user_id: userId,
      pet_id: pet.id,
      metric_type: "weight",
      value: parseFloat(newValue),
      recorded_date: newDate,
    });
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
  const field = { fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 };
  const fieldCls = "rounded-lg px-3 py-2 outline-none w-full";
  const sub = (t) => <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.navy }} className="mt-2">{t}</div>;
  const photoEl = pet.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null;

  return (
    <div id={`pet-top-${pet.id}`} data-pet-passport className="rounded-2xl p-4 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="rounded-2xl overflow-hidden flex items-center justify-center" style={{ width: 60, height: 60, background: tokens.sky, border: `2px solid ${isService(pet.role) ? tokens.primary : tokens.gold}` }}>
            {photoEl || <PetIllustration type={pet.animal_type} size={56} />}
          </div>
          <label aria-label="Change photo" className="absolute flex items-center justify-center" style={{ bottom: -4, right: -4, width: 24, height: 24, background: tokens.navy, borderRadius: "50%", cursor: "pointer", border: "2px solid #fff" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
          </label>
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 700, color: tokens.navy, lineHeight: 1.15 }}>{pet.name}</div>
          <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>
            {[pet.breed || pet.animal_type, pet.sex, calculateAge(pet.date_of_birth), isService(pet.role) ? "Service dog" : null].filter(Boolean).join(" · ")}
          </div>
          {pet.passport_no && <div style={{ fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.navy, letterSpacing: "0.04em" }}>No. {pet.passport_no}</div>}
        </div>
        <button onClick={() => setShowEditForm((v) => !v)} className="rounded-full px-3.5 py-1.5" style={{ fontFamily: font.body, fontSize: 14, color: tokens.navy, fontWeight: 700, background: tokens.sky, border: "none", cursor: "pointer" }}>
          {showEditForm ? "Close" : "Edit"}
        </button>
      </div>
      {uploadingPhoto && <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mt-2">Uploading photo…</div>}

      {showEditForm && (
        <form data-pet-edit onSubmit={handleSaveEdit} className="rounded-xl p-3 mt-3 grid gap-2" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
          <input required placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={field} className={fieldCls} />
          <div className="grid grid-cols-2 gap-2">
            <select value={editForm.animal_type} onChange={(e) => setEditForm((f) => ({ ...f, animal_type: e.target.value }))} style={field} className={fieldCls}><option>Dog</option><option>Cat</option><option>Other</option></select>
            <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} style={field} className={fieldCls}><option>Pet</option><option>Service animal</option></select>
          </div>
          <input placeholder="Breed" value={editForm.breed} onChange={(e) => setEditForm((f) => ({ ...f, breed: e.target.value }))} style={field} className={fieldCls} />
          <div className="grid grid-cols-2 gap-2">
            <select value={editForm.sex} onChange={(e) => setEditForm((f) => ({ ...f, sex: e.target.value }))} style={field} className={fieldCls}><option value="">Sex</option><option>Male</option><option>Female</option></select>
            <input type="date" aria-label="Date of birth" value={editForm.date_of_birth} onChange={(e) => setEditForm((f) => ({ ...f, date_of_birth: e.target.value }))} style={field} className={fieldCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder={editForm.role === "Service animal" ? "Handler name" : "Owner name"} value={editForm.handler_name} onChange={(e) => setEditForm((f) => ({ ...f, handler_name: e.target.value }))} style={field} className={fieldCls} maxLength={80} />
            <select aria-label="Trained" value={editForm.trained} onChange={(e) => setEditForm((f) => ({ ...f, trained: e.target.value }))} style={field} className={fieldCls}><option value="">Trained?</option><option value="yes">Trained: yes</option><option value="no">Trained: no</option></select>
          </div>
          {sub("Vet & emergency contact")}
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Vet name" value={editForm.vet_name} onChange={(e) => setEditForm((f) => ({ ...f, vet_name: e.target.value }))} style={field} className={fieldCls} />
            <input placeholder="Vet phone" type="tel" value={editForm.vet_phone} onChange={(e) => setEditForm((f) => ({ ...f, vet_phone: e.target.value }))} style={field} className={fieldCls} />
            <input placeholder="Emergency contact" value={editForm.emergency_contact_name} onChange={(e) => setEditForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} style={field} className={fieldCls} />
            <input placeholder="Their phone" type="tel" value={editForm.emergency_contact_phone} onChange={(e) => setEditForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} style={field} className={fieldCls} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button type="submit" disabled={savingEdit} className="rounded-full px-5 py-2.5" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15, border: "none" }}>{savingEdit ? "Saving…" : "Save"}</button>
            <button type="button" onClick={handleShare} style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 600, color: tokens.navy }}>{justCopied ? "Copied" : "Share info"}</button>
            <button type="button" onClick={handleDeletePet} disabled={deleting} className="ml-auto" style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.primary }}>{deleting ? "Removing…" : "Remove pet"}</button>
          </div>
        </form>
      )}

      {/* Pet ID: one tap to the polished card; lost report is a single button until used */}
      <button data-preview-pet-id onClick={() => setShowId(true)} className="w-full mt-3 rounded-2xl px-4 py-3 flex items-center gap-3 text-left" style={{ background: `linear-gradient(135deg, ${tokens.navyDeep}, ${tokens.navy})`, border: "none", cursor: "pointer" }}>
        <span className="rounded-lg p-1 flex-shrink-0" style={{ background: "#fff" }}><PetQr petId={pet.id} size={40} color={tokens.navy} /></span>
        <span className="flex-1 min-w-0">
          <span style={{ display: "block", fontFamily: font.body, fontWeight: 800, fontSize: 16, color: "#fff" }}>Preview Pet ID</span>
          <span style={{ display: "block", fontFamily: font.body, fontSize: 13.5, color: tokens.sky, opacity: 0.85 }}>What a finder sees when they scan</span>
        </span>
        <span style={{ color: tokens.gold, fontSize: 22, fontWeight: 700 }} aria-hidden="true">›</span>
      </button>
      <PetIdSheet open={showId} onClose={() => setShowId(false)} card={card} photo={photoEl}>
        <label className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "#fff", cursor: "pointer" }}>
          <input type="checkbox" className="mt-0.5 w-5 h-5 flex-shrink-0" style={{ accentColor: tokens.primary }} checked={!!pet.show_contact_on_public_id} disabled={savingContactToggle} onChange={(e) => togglePublicContact(e.target.checked)} />
          <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.ink }}>Show {isService(pet.role) ? "handler" : "owner"} name and emergency contact to finders
            <span style={{ display: "block", fontWeight: 400, fontSize: 14, color: tokens.muted }}>{pet.show_contact_on_public_id ? "On. Shown on the public page." : "Off. Finders message you privately."}</span>
          </span>
        </label>
        <div className="flex gap-2 mt-3">
          <a href={`/id/${pet.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center rounded-full px-4 py-3" style={{ background: tokens.gold, color: tokens.navy, fontFamily: font.body, fontWeight: 700, textDecoration: "none" }}>Open public page</a>
          <button onClick={() => { setShowId(false); setShowEditForm(true); setTimeout(() => document.getElementById(`pet-top-${pet.id}`)?.scrollIntoView({ behavior: "smooth" }), 50); }} className="flex-1 rounded-full px-4 py-3" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", fontFamily: font.body, fontWeight: 700, border: "none", cursor: "pointer" }}>Edit details</button>
        </div>
      </PetIdSheet>
      <LostPanel pet={pet} userId={userId} onChanged={onPhotoUpdated} />

      <ActivationChecklist pet={pet} userId={userId} refreshKey={healthKey} />
      <WhatsNeededNext pet={pet} />

      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: `1px solid ${tokens.line}` }}>
        <VaultSection id={`chip-${pet.id}`} title="Microchip" hint={pet.microchip_number ? `•••• ${String(pet.microchip_number).replace(/[^0-9A-Za-z]/g, "").slice(-4)}` : "Not added"}>
          <ChipVault pet={pet} userId={userId} onChanged={onPhotoUpdated} bare />
        </VaultSection>
        <VaultSection id={`health-${pet.id}`} anchor="health-passport" title="Health records" hint={rab.tone === "good" ? "Rabies current" : healthRows.length ? `${healthRows.length} record${healthRows.length === 1 ? "" : "s"}` : "None yet"} hintTone={rab.tone === "bad" ? "bad" : null}>
          <HealthPassport pet={pet} userId={userId} refreshKey={healthKey} bare onRows={(rows) => setHealthRows(rows)} />
          <VetImport pet={pet} userId={userId} onSaved={() => { setHealthKey((v) => v + 1); onPhotoUpdated(); }} />
        </VaultSection>
        <VaultSection id={`docs-${pet.id}`} title="Documents" hint={loadingDocs ? "" : documents.length ? `${documents.length} file${documents.length === 1 ? "" : "s"}` : "None yet"}>
          <div id={`documents-${pet.id}`}>
          {!loadingDocs && documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-2 py-2" style={{ borderTop: `1px solid ${tokens.line}` }}>
              <a href="#" onClick={async (e) => { e.preventDefault(); const win = window.open("", "_blank"); const url = await getSignedUrl(doc.file_url); if (url && win) win.location.href = url; else if (win) win.close(); }} style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy, textDecoration: "underline" }}>{doc.document_type}</a>
              {doc.expires_on && <span style={{ fontFamily: font.body, fontSize: 13, color: doc.expires_on < new Date().toISOString().slice(0, 10) ? tokens.stamp : tokens.muted }} className="ml-auto">{doc.expires_on < new Date().toISOString().slice(0, 10) ? "Expired" : "Expires"} {new Date(doc.expires_on + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
              <button onClick={() => handleDeleteDocument(doc)} style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.stamp }}>Remove</button>
            </div>
          ))}
          {!showUploadForm ? (
            <button onClick={() => setShowUploadForm(true)} className="mt-2 rounded-full px-4 py-2" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.navy, fontWeight: 700, background: tokens.sky, border: "none" }}>Upload a document</button>
          ) : (
            <form onSubmit={handleUpload} className="mt-3 grid gap-2">
              <select value={docType} onChange={(e) => setDocType(e.target.value)} style={field} className={fieldCls}>
                <option>Vaccination record</option><option>Health certificate</option><option>Training documentation</option><option>Microchip registration</option><option>Insurance policy</option><option>Other</option>
              </select>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ fontFamily: font.body, fontSize: 14.5 }} />
              <label style={{ fontFamily: font.body, fontSize: 14, color: tokens.navy }} className="flex items-center gap-2">Expires (optional)
                <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} style={field} className="rounded-lg px-3 py-1.5 outline-none" />
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading || !selectedFile} className="rounded-full px-5 py-2" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 14.5, border: "none" }}>{uploading ? "Uploading…" : "Upload"}</button>
                <button type="button" onClick={() => setShowUploadForm(false)} style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>Cancel</button>
              </div>
            </form>
          )}
          </div>
        </VaultSection>
        <VaultSection id={`vet-${pet.id}`} title="Vet & emergency contact" hint={pet.vet_name || pet.emergency_contact_name ? "Saved" : "Not added"}>
          <div className="grid gap-1.5" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>
            <div><span style={{ color: tokens.muted }}>Vet: </span>{pet.vet_name || "Not added"}{pet.vet_phone ? <> · <a href={`tel:${pet.vet_phone.replace(/[^0-9+]/g, "")}`} style={{ color: tokens.primary, fontWeight: 700 }}>{pet.vet_phone}</a></> : null}</div>
            <div><span style={{ color: tokens.muted }}>Emergency: </span>{pet.emergency_contact_name || "Not added"}{pet.emergency_contact_phone ? <> · <a href={`tel:${pet.emergency_contact_phone.replace(/[^0-9+]/g, "")}`} style={{ color: tokens.primary, fontWeight: 700 }}>{pet.emergency_contact_phone}</a></> : null}</div>
            <button onClick={() => { setShowEditForm(true); document.getElementById(`pet-top-${pet.id}`)?.scrollIntoView({ behavior: "smooth" }); }} className="justify-self-start mt-1" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: tokens.navy, textDecoration: "underline" }}>Edit</button>
          </div>
        </VaultSection>
        <VaultSection id={`weight-${pet.id}`} title="Weight" hint={loadingLog ? "" : current ? `${current.value} ${current.unit || "lbs"}` : "Not logged"}>
          {measurements.length > 0 && (
            <div className="flex flex-col gap-1.5">
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
          <form onSubmit={handleAddWeight} className="mt-2 flex gap-2 items-center">
            <input required type="number" step="0.1" placeholder="lbs" value={newValue} onChange={(e) => setNewValue(e.target.value)} style={{ ...field, width: 90 }} className="rounded-lg px-3 py-2 outline-none" />
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={field} className="rounded-lg px-3 py-2 outline-none flex-1 min-w-0" />
            <button type="submit" disabled={saving} className="rounded-full px-4 py-2" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 14.5, border: "none" }}>{saving ? "…" : "Log"}</button>
          </form>
        </VaultSection>
        <VaultSection id={`share-${pet.id}`} title="Care Card & QR card" hint="For sitters and vets">
          <ShareCard pet={pet} userId={userId} bare onDone={() => window.dispatchEvent(new CustomEvent("ppg-qr-done"))} />
          <WalletCard pet={pet} bare onDone={() => window.dispatchEvent(new CustomEvent("ppg-qr-done"))} />
        </VaultSection>
        <VaultSection id={`more-${pet.id}`} title="Find a vet & travel stamps" hint="" last>
          <FindAVet pet={pet} />
          <TravelStamps pet={pet} />
        </VaultSection>
      </div>
    </div>
  );
}

function VaultSection({ id, anchor, title, hint, hintTone, children, last }) {
  return (
    <details id={id} data-vault-section className="group" style={{ borderBottom: last ? "none" : `1px solid ${tokens.line}`, background: "#fff" }}>
      {anchor && <span id={anchor} />}
      <summary className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ cursor: "pointer", listStyle: "none" }}>
        <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{title}</span>
        <span className="flex items-center gap-2 min-w-0">
          {hint && <span style={{ fontFamily: font.body, fontSize: 13.5, color: hintTone === "bad" ? tokens.primary : tokens.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hint}</span>}
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
  return (
    <div className="rounded-xl p-5 mt-3" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-1">Traveling with more than one animal?</div>
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, lineHeight: 1.55 }} className="mb-3">
        Your plan includes one pet. Membership ({P.member}/mo) adds unlimited pets, {P.memberPass} Travel Passes and reminders before your documents expire. {MEMBERSHIP_TERMS}
      </p>
      <button disabled={busy} onClick={async () => { trackBeginCheckout("membership"); setBusy(true); const e = await startStripe("/api/stripe/checkout", { plan: "membership" }); if (e) { setErr(e); setBusy(false); } }} className="rounded-full px-5 py-2.5 hover:opacity-90" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontSize: 16, fontWeight: 600 }}>{JOIN_CTA}</button>
      {err && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mt-2">{err}</div>}
    </div>
  );
}

function PetProfileTab({ userId }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", animal_type: "Dog", role: "Pet", breed: "", sex: "" });
  const [isMember, setIsMember] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const access = usePetAccess(userId);
  useEffect(() => { supabase.rpc("my_membership").then(({ data }) => setIsMember(!!data)); }, [userId]);

  const [loadError, setLoadError] = useState(false);
  const loadSeq = React.useRef(0);

  // Race-safe loader: only the latest request may update state, the spinner always
  // clears (try/finally), and a stalled request times out into a Retry state instead
  // of leaving "Loading your pets…" up forever.
  async function loadPets() {
    const seq = ++loadSeq.current;
    setLoading(true);
    setLoadError(false);
    try {
      const query = supabase.from("pets").select("*").order("created_at", { ascending: false });
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 12000));
      const { data, error } = await Promise.race([query, timeout]);
      if (seq !== loadSeq.current) return;
      if (error) throw error;
      setPets(data || []);
    } catch {
      if (seq === loadSeq.current) setLoadError(true);
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
    const { error } = await supabase.from("pets").insert({
      user_id: userId,
      name: form.name,
      animal_type: form.animal_type,
      role: form.role,
      breed: form.breed || null,
      sex: form.sex || null,
    });
    setSaving(false);
    if (error && /PET_LIMIT/.test(error.message || "")) { setShowForm(false); setLimitHit(true); return; }
    if (!error) {
      setForm({ name: "", animal_type: "Dog", role: "Pet", breed: "", sex: "" });
      setShowForm(false);
      loadPets();
    }
  }

  // Lapsed (only when launched, or with ?preview=lapsed pre-launch): lost-pet tools stay
  // free; vault and full Pet ID show a win-back message. Nothing is deleted.
  if (!access.loading && !access.allowed) return (
    <div className="space-y-6">
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
      <a href="/lost-flyer" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.navy }}>Make a printable lost pet flyer →</a>
    </div>
  );
  return (
    <div>
      {loading ? (
        <div style={{ fontFamily: font.body, color: tokens.muted, fontSize: 16 }}>Loading your pets…</div>
      ) : loadError ? (
        <div className="rounded-xl p-6 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 16 }}>
          We couldn't load your pets.{" "}
          <button onClick={loadPets} className="btn-primary rounded-full px-5 py-2 ml-2" style={{ background: tokens.primary, color: "#fff", fontWeight: 600 }}>Retry</button>
        </div>
      ) : pets.length === 0 && !showForm ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}
        >
          <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-2">
            No pets yet
          </div>
          <div style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7 }} className="mb-4">
            Add your pet's info here — it'll carry over to every trip you plan.
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
            className="rounded-full px-6 py-2.5 text-[14px] hover:opacity-90 transition"
          >
            + Add your pet
          </button>
        </div>
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
        <form
          onSubmit={handleAddPet}
          className="rounded-xl p-5 mt-4"
          style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}
        >
          <div style={{ fontFamily: font.display, fontSize: 17, color: tokens.navy }} className="mb-3">
            Add a pet
          </div>
          <div className="flex flex-col gap-3">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            <div className="flex gap-3">
              <select
                value={form.animal_type}
                onChange={(e) => setForm((f) => ({ ...f, animal_type: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
                className="rounded-xl px-4 py-3 outline-none flex-1"
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Other</option>
              </select>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
                className="rounded-xl px-4 py-3 outline-none flex-1"
              >
                <option>Pet</option>
                <option>Service animal</option>
              </select>
            </div>
            <input
              placeholder="Breed (optional)"
              value={form.breed}
              onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            <select
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 16 }}
              className="rounded-xl px-4 py-3 outline-none"
            >
              <option value="">Sex (optional)</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}
              className="rounded-full px-6 py-2.5 text-[14px] hover:opacity-90 transition"
            >
              {saving ? "Saving…" : "Save pet"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


function UnlockTripCard({ trip }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function unlock() {
    setBusy(true); setErr("");
    const { data: m } = await supabase.rpc("my_membership");
    const { data: s } = await supabase.auth.getSession();
    trackBeginCheckout(m ? "member_pass" : "pass");
    const r = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json", "x-sb-token": s?.session?.access_token || "" }, body: JSON.stringify({ plan: m ? "member_pass" : "pass", trip_id: trip.id, attribution: getAttribution() }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.url) window.location.href = j.url; else { setErr(j.error || "Checkout isn't available right now. Please try again."); setBusy(false); }
  }
  return (
    <div className="rounded-xl p-6 text-center" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-1"><Icon name="lock" size={18} /> This trip isn't unlocked yet</div>
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, opacity: 0.8 }} className="mb-4">Your full checklist, deadlines and reminders are ready the moment you finish checkout.</p>
      <button disabled={busy} onClick={unlock} className="rounded-full px-6 py-3" style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600 }}>Unlock this trip</button>
      <GuaranteeLine align="center" />
      {err && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mt-3">{err}</div>}
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

// Calm overview: next-trip countdown, ONE consolidated Needs Action list
// (time-sensitive reminders first, then open checklist steps, de-duplicated),
// then the vault. Everything detailed lives under My Trips.
export function DashboardTab({ userId, onOpenTrips }) {
  const [trip, setTrip] = useState(null);
  const [actions, setActions] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doneCount, setDoneCount] = useState(0);
  const pet = useTripPet(trip);
  useEffect(() => { (async () => {
    const { data: trips } = await supabase.from("trips").select("*").order("created_at", { ascending: false }).limit(1);
    const current = trips?.[0] || null; setTrip(current);
    const list = []; let doneN = 0;
    if (current?.paid && !tripIsPast(current)) {
      const today = todayPT();
      for (const it of reminderSchedule(current, today)) {
        const { state } = classifyReminder(it, current, { today });
        if (state === "do_now" || state === "today") list.push({ key: `rem-${it.kind}`, label: it.title, hint: state === "today" ? "Due today" : "Catch up" });
      }
      const { data: reqs } = await supabase.rpc("get_trip_requirements", { p_trip_id: current.id, p_trip_types: tripTypeForRoute(current.origin, current.destination) === "international" ? ["international", "domestic"] : ["domestic"] });
      const { data: statusRows } = await supabase.from("trip_requirement_status").select("*").eq("trip_id", current.id);
      const doneMap = {};
      (statusRows || []).forEach((s) => { if (s.completed) doneMap[s.requirement_id] = true; });
      const seen = new Set(list.map((a) => a.label.toLowerCase()));
      const grouped = groupCards(buildPassCards(reqs || [], current), doneMap);
      doneN = grouped.done.length;
      for (const card of [...grouped.first, ...grouped.confirm]) {
        if (seen.has(card.shortTitle.toLowerCase())) continue;
        seen.add(card.shortTitle.toLowerCase());
        list.push({ key: `card-${card.id}`, label: card.shortTitle, hint: "Checklist" });
      }
    }
    setActions(list); setDoneCount(doneN); setLoading(false);
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
      ) : trip?.paid ? <TripCountdown trip={trip} pet={pet} done={doneCount} total={actions.length + doneCount} /> : (
        <div className="rounded-2xl p-7 mb-6 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }} className="mb-2">Where are you and your pets flying to?</div>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="mb-5">Answer a few trip questions and your plan, reminders and checklist land here.</p>
          <a href="/assessment" className="rounded-full px-6 py-3 inline-block" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>{PLAN_CTA}</a>
        </div>
      )}
      {trip?.paid && !tripIsPast(trip) && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 700, color: tokens.navy }} className="mb-3">Needs action</div>
          {actions.length === 0 ? <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Nothing needs action right now.</p> : <>
            <ul className="space-y-2">{visible.map((a) => (
              <li key={a.key} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
                <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{a.label}</span>
                <span style={{ fontFamily: font.mono, fontSize: 11, color: tokens.stamp, whiteSpace: "nowrap" }}>{a.hint.toUpperCase()}</span>
              </li>))}
            </ul>
            {actions.length > 4 && <button onClick={() => setShowAll((s) => !s)} style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.navy, background: "none", border: "none", padding: "8px 0 0", cursor: "pointer", textDecoration: "underline" }}>{showAll ? "Show less" : `Show ${actions.length - 4} more`}</button>}
            <div className="mt-4"><button onClick={onOpenTrips} className="rounded-full px-5 py-2.5" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600, border: "none", cursor: "pointer" }}>Open in My Trips →</button></div>
          </>}
        </div>
      )}
    </div>
  );
}

function CurrentFlightTab({ userId }) {
  const [trip, setTrip] = useState(null);
  const [results, setResults] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [section, setSection] = useState("overview");
  const [showAllActions, setShowAllActions] = useState(false);
  const petForTrip = useTripPet(trip);
  useEffect(() => { supabase.rpc("my_membership").then(({ data }) => setIsMember(!!data)); }, []);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: trips } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    const currentTrip = trips && trips[0];
    setTrip(currentTrip || null);

    if (currentTrip) {
      // Facts only after payment: unpaid trips get nothing; paid owners read via a server function.
      const { data: reqs } = currentTrip.paid
        ? await supabase.rpc("get_trip_requirements", {
            p_trip_id: currentTrip.id,
            p_trip_types: tripTypeForRoute(currentTrip.origin, currentTrip.destination) === "international" ? ["international", "domestic"] : ["domestic"],
          })
        : { data: [] };

      const destLower = (currentTrip.destination || "").toLowerCase();
      const filtered = (reqs || []).filter((row) => {
        if (!row.destination_match) return true;
        const keywords = row.destination_match.split(",").map((k) => k.trim());
        return keywords.some((k) => destLower.includes(k));
      });
      // Official source citations are a paid feature: strip them unless this trip is paid.
      const finalResults = filtered
        .filter((r) => r.category !== "ELIGIBILITY NOTE")
        .map((r) => (currentTrip.paid ? r : { ...r, source_url: null, verified_at: null }));
      setResults(finalResults);
      if (currentTrip.paid && !currentTrip.details_first_viewed_at) supabase.rpc("mark_trip_details_viewed", { p_trip_id: currentTrip.id });

      const { data: statusRows } = await supabase
        .from("trip_requirement_status")
        .select("*")
        .eq("trip_id", currentTrip.id);

      const map = {};
      (statusRows || []).forEach((s) => {
        map[s.requirement_id] = s.completed;
      });
      setStatusMap(map);
    }
    setLoading(false);
  }

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

  if (!trip) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-2">
          No trip yet
        </div>
        <div style={{ fontFamily: font.body, fontSize: 15.5, opacity: 0.7 }} className="mb-4">
          Plan my trip to get your Travel Pass, and it'll show up here.
        </div>
        <a
          href="/assessment"
          style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}
          className="rounded-full px-6 py-2.5 text-[14px] hover:opacity-90 transition inline-block"
        >
          {PLAN_CTA}
        </a>
      </div>
    );
  }

  const passCards = buildPassCards(results, trip);
  const passGroups = groupCards(passCards, statusMap);
  const actionItems = [...passGroups.first, ...passGroups.confirm];
  const tripPet = petForTrip;
  const trackedTotal = actionItems.length + passGroups.done.length;
  const trackedDone = passGroups.done.length;
  const progressPct = trackedTotal > 0 ? Math.round((trackedDone / trackedTotal) * 100) : 0;
  const serviceDogMismatch = trip.paid && isServiceRole(trip.role) && trip.animal_type && !/dog/i.test(trip.animal_type);

  if (trip.paid && isTravelDay(trip) && !showFull) {
    return <DayOfMode trip={trip} pet={tripPet} actionItems={passGroups.first.map((c) => ({ title: c.shortTitle }))} onShowFull={() => setShowFull(true)} />;
  }

  return (
    <div>
      {trip.paid && <TripCountdown trip={trip} pet={tripPet} done={trackedDone} total={trackedTotal} />}
      <div className="rounded-xl p-5 mb-4" style={{ background: tokens.navy }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52, background: tokens.gold, border: "2px solid #fff" }}>
            {tripPet?.photo_url ? <SignedImg value={tripPet.photo_url} alt={tripPet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <span style={{ color: tokens.navy }}><Icon name="paw" size={26} stroke={1.5} /></span>}
          </div>
          <div className="min-w-0">
            <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold, letterSpacing: "0.1em" }}>YOUR TRAVEL PASS</div>
            <div style={{ fontFamily: font.display, fontSize: 20, color: "#fff", lineHeight: 1.2 }}>{tripPet?.name ? `${tripPet.name}’s trip` : "Your trip"}</div>
          </div>
        </div>
        <div style={{ fontFamily: font.display, fontSize: 18, color: "#fff" }} className="mb-1">
          {trip.origin} → {trip.destination}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, opacity: 0.9 }} className="mb-3">
          {trip.airline} · {trip.travel_date || "date pending"}{trip.return_date ? ` · back ${fmtTripDate(trip.return_date)}` : ""} · {isServiceRole(trip.role) ? (serviceDogMismatch ? trip.role : trip.service_kind === "psd" ? "PSD (service dog)" : "Service dog") : trip.role}{isMexicoAirport(trip.destination) || isMexicoAirport(trip.origin) ? " · International (Mexico)" : ""}
        </div>
        {trackedTotal > 0 && <>
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ fontFamily: font.mono, fontSize: 12, color: tokens.sky, opacity: 0.7, letterSpacing: "0.08em" }}>TRIP READINESS</span>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold }}>{trackedDone}/{trackedTotal} DONE</span>
          </div>
          <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: progressPct >= 100 ? "#7DCEA0" : tokens.stamp }} />
          </div>
          {progressPct >= 100 && <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.gold }} className="mt-2">100% — you’re ready to fly.</div>}
          {progressPct >= 50 && progressPct < 100 && <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: tokens.gold }} className="mt-2">50% milestone — halfway there.</div>}
        </>}
      </div>

      {trip.paid && (
        <div role="tablist" aria-label="Trip sections" className="inline-flex flex-wrap gap-1 mb-5 p-1 rounded-full" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          {[["overview", "Overview"], ["flight", "Flight & weather"], ["checklist", "Checklist"], ["reminders", "Reminders"]].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={section === k} onClick={() => setSection(k)} className="rounded-full px-4 py-2" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 600, background: section === k ? tokens.navy : "transparent", color: section === k ? "#fff" : tokens.ink, border: "none", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      )}

      {trip.paid && section === "overview" && (<>
        <LiveFlightCard trip={trip} />
        {actionItems.length > 0 && (
          <div className="rounded-xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">Needs action</div>
            <p style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }} className="mb-3">Start here — the full list is under Checklist.</p>
            <ul className="space-y-2">{actionItems.slice(0, showAllActions ? undefined : 3).map((r) => (
              <li key={r.id} className="rounded-xl px-4 py-3" style={{ background: tokens.paper, fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{r.shortTitle}</li>
            ))}</ul>
            {actionItems.length > 3 && <button onClick={() => setShowAllActions((s) => !s)} style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.navy, background: "none", border: "none", padding: "8px 0 0", cursor: "pointer", textDecoration: "underline" }}>{showAllActions ? "Show less" : "Show more"}</button>}
            <div className="mt-3"><button onClick={() => setSection("checklist")} className="rounded-full px-5 py-2.5" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600, border: "none", cursor: "pointer" }}>Open the checklist →</button></div>
          </div>
        )}
        <CommunityPulse trip={trip} isMember={isMember} />
      </>)}
      {trip.paid && section === "flight" && (<>
        <LiveFlightCard trip={trip} />
        <TripExtras trip={trip} pet={tripPet} />
        <div id="pet-relief">
          <PetReliefCard airportLabel={trip.origin} />
          <PetReliefCard airportLabel={trip.destination} title="When you land: pet relief" />
        </div>
        <DocCheck trip={trip} />
      </>)}
      {trip.paid && section === "reminders" && <TripTimeline trip={trip} requirements={results} statusMap={statusMap} />}
      {trip.paid && section === "checklist" && <VetGuidance trip={trip} requirements={[...results, ...passCards.filter((c) => String(c.id).startsWith("syn:"))]} paid={!!trip.paid} />}

      {!trip.paid ? (
        <UnlockTripCard trip={trip} />
      ) : section !== "checklist" ? null : (
        <>
          {serviceDogMismatch && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "#FFF7F2", border: `1px solid ${tokens.primary}` }}>
              <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">U.S. service animals are dogs</div>
              <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45 }} className="mb-3">A psychiatric service dog (PSD) is a service dog. Cats and other animals, and emotional support animals, fly as pets: carrier plus the airline’s pet fee. Since 2021, airlines don’t treat an ESA as a service animal. <a href="/blog/service-dog-vs-esa-vs-psd-flying" style={{ color: tokens.navy, fontWeight: 600 }}>How this works.</a></p>
              <button type="button" onClick={async () => { await supabase.from("trips").update({ role: "Pet", service_kind: null }).eq("id", trip.id); setTrip((t) => ({ ...t, role: "Pet", service_kind: null })); }} className="rounded-full px-5 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, border: "none", cursor: "pointer" }}>Switch this trip to the pet path</button>
            </div>
          )}
          <RoundTripAddon trip={trip} onSave={saveReturn} />
          {passCards.length === 0 ? (
            <div className="rounded-xl p-5 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 15, opacity: 0.7 }}>
              No requirements found for this exact combination yet.
            </div>
          ) : (
            <PassChecklist trip={trip} requirements={results} statusMap={statusMap} onSetDone={handleSetDone} onOpenRelief={() => { setSection("flight"); setTimeout(() => document.getElementById("pet-relief")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }} />
          )}
        </>
      )}
    </div>
  );
}

function BillingTab({ userId }) {
  const [memberRow, setMemberRow] = useState(null); const [isMember, setIsMember] = useState(null);
  const [purchases, setPurchases] = useState([]); const [legacyTrips, setLegacyTrips] = useState([]);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
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
  const btn = { background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600 };
  const money = (c, cur) => c == null ? "" : `$${(c / 100).toFixed(2)}`;
  const kindLabel = { pass: "Travel Pass", member_pass: "Travel Pass · member price", join: "Membership + Travel Pass", membership: "Membership", membership_renewal: "Membership renewal" };
  return (
    <div className="rounded-xl p-6 sm:p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">Billing</div>
      {isMember === null ? <div style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</div> : isMember ? <>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }} className="mb-1">You're a PetPassGo member ({P.member}{P.memberUnit}).</p>
          {memberRow?.current_period_end && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-3">Current period ends {new Date(memberRow.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>}
          <button disabled={busy} onClick={() => go("/api/stripe/portal")} style={btn} className="rounded-full px-6 py-3 hover:opacity-90">Cancel membership</button>
          <p style={{ fontFamily: font.body, fontSize: 15, lineHeight: 1.45, color: tokens.ink }} className="mt-3">Cancel online here. No phone call. You keep access through the period you've paid, and you won't be charged again.</p>
          <button disabled={busy} onClick={() => go("/api/stripe/portal")} className="rounded-full px-6 py-3 mt-3" style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}` }}>Receipts and payment method</button>
        </> : <>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }} className="mb-4">{memberRow?.status === "canceled" ? "Your membership has ended. " : ""}<b>{VAULT_NAME}</b> · {P.member}{P.memberUnit}. {VAULT_SUB} Plus {P.memberPass} Travel Passes. {MEMBERSHIP_TERMS}</p>
          <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => { trackBeginCheckout("membership"); go("/api/stripe/checkout", { plan: "membership" }); }} style={btn} className="rounded-full px-6 py-3 hover:opacity-90">{JOIN_CTA}</button><button disabled={busy} onClick={() => go("/api/stripe/portal")} style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}` }} className="rounded-full px-6 py-3">Receipts & cards</button></div>
        </>}
      {err && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mt-3">{err}</div>}
      <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-2">Purchase history</div>
        {purchases.length === 0 && legacyTrips.length === 0 && <p style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>No purchases yet. Stripe also emails a receipt for every payment.</p>}
        <div className="space-y-2">{purchases.map((x) => <div key={x.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
          <div><div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>{kindLabel[x.kind] || "Purchase"}</div><div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{new Date(x.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{x.amount_cents != null ? ` · ${money(x.amount_cents, x.currency)}` : ""}</div></div>
          {x.receipt_url ? <a href={x.receipt_url} target="_blank" rel="noopener noreferrer" className="rounded-full px-3.5 py-1.5 flex-shrink-0" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700, textDecoration: "none" }}>Receipt</a> : <button onClick={() => go("/api/stripe/portal")} className="rounded-full px-3.5 py-1.5 flex-shrink-0" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>Receipts</button>}
        </div>)}{legacyTrips.map((t) => <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: tokens.paper }}>
          <div><div style={{ fontFamily: font.body, fontWeight: 700, color: tokens.navy }}>Travel Pass</div><div style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>{t.origin} → {t.destination}{t.paid_at ? ` · ${new Date(t.paid_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}</div></div>
          <button onClick={() => go("/api/stripe/portal")} className="rounded-full px-3.5 py-1.5 flex-shrink-0" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13.5, fontWeight: 700 }}>Receipts</button>
        </div>)}</div>
        <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">Receipts open in Stripe. Cancel membership is online on this page.</p>
      </div>
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
    else if (q === "canceled") setMsg("Checkout canceled. You haven't been charged.");
  }, []);
  if (!msg) return null;
  return <><div className="rounded-xl p-4 mb-6" style={{ background: "#fff", border: `1px solid ${tokens.green}`, fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{msg === "paid" ? <>Payment received. Thank you. Your trip unlocks in a few seconds. Refresh if it still looks locked. <a href="/guarantee" style={{ color: tokens.navy, fontWeight: 700 }}>Flight-Ready Guarantee. Conditions apply.</a></> : msg}</div>
  {sessionId && <FeedbackPrompt kind="purchase" refKey={sessionId} title="How did that feel?" blurb="A quick rating helps us make PetPassGo better." />}</>;
}

function PostTripFeedback() {
  const [trip, setTrip] = useState(null);
  useEffect(() => { const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }); supabase.from("trips").select("id,origin,destination,travel_date,return_date").eq("paid", true).lt("travel_date", today).order("travel_date", { ascending: false }).limit(1).then(async ({ data, error }) => { let row = data?.[0]; if (error) { const again = await supabase.from("trips").select("id,origin,destination,travel_date").eq("paid", true).lt("travel_date", today).order("travel_date", { ascending: false }).limit(1); row = again.data?.[0]; } if (row && (!row.return_date || row.return_date < today)) setTrip(row); }); }, []);
  if (!trip) return null;
  return <FeedbackPrompt kind="post_trip" tripId={trip.id} refKey={trip.id} title="How was the trip?" blurb={`Tell us how ${trip.origin} → ${trip.destination} went. Private to PetPassGo.`} />;
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
    if (anchor) setTimeout(() => revealAnchor(anchor), 350);
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
    else if (key === "passport") openVaultAnchor("[data-pet-passport]");
    else if (key === "health") openVaultAnchor("#health-passport");
    else setActiveTab("billing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader onLogout={handleLogout} />
      {loading ? (
        <div className="flex items-center justify-center py-24" style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</div>
      ) : (
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-28 md:pb-12">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 34, color: tokens.navy, lineHeight: 1.1 }}>Your dashboard</h1>
            <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mt-1">{user?.email}</div>
          </div>
        </div>

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
          <DashboardTab userId={user?.id} onOpenTrips={() => setActiveTab("trips")} />
          <VaultCard userId={user?.id} onOpenVault={(anchor) => { setActiveTab("vault"); if (anchor) setTimeout(() => revealAnchor(anchor), 350); window.scrollTo({ top: 0 }); }} />
        </>)}

        {activeTab === "vault" && (<>
          <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: tokens.navy }}>Pet Vault</div>
          <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-4">{VAULT_SUB}</p>
          <PetProfileTab userId={user?.id} />
        </>)}

        {activeTab === "trips" && <CurrentFlightTab userId={user?.id} />}

        {activeTab === "billing" && <BillingTab userId={user?.id} />}
      </div>
      )}
      {!loading && user && <MobileBottomNav active={bottomActive} onNavigate={handleBottomNav} />}
    </div>
  );
}
