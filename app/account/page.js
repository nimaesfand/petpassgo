"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { usePetAccess } from "../../lib/access";
import WinBack from "../../components/WinBack";
import { PRICES as P } from "../../lib/pricing";
import { requirementAirline } from "../../lib/airlines";
import { tripTypeForRoute, isMexicoAirport } from "../../lib/airports";
import SiteHeader from "../../components/SiteHeader";
import LostPanel from "../../components/LostPanel";
import PetIdCard, { PetIllustration } from "../../components/PetIdCard";
import TripTimeline from "../../components/TripTimeline";
import ServiceAnimalTrack from "../../components/ServiceAnimalTrack";
import DocCheck from "../../components/DocCheck";
import VetGuidance from "../../components/VetGuidance";
import { BUCKET, SignedImg, getSignedUrl, toStoragePath } from "../../lib/storage";
import { tokens, font } from "../../lib/theme";



const TABS = [
  { key: "flight", label: "Current Flight" },
  { key: "profile", label: "Pet Profile" },
  { key: "history", label: "Flight History" },
  { key: "billing", label: "Billing" },
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
        microchip_number: editForm.microchip_number || null,
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
      `🐾 ${pet.name}'s Info (via PetPassGo)`,
      pet.breed ? `Breed: ${pet.breed}` : null,
      pet.sex ? `Sex: ${pet.sex}` : null,
      age ? `Age: ${age}` : null,
      pet.vet_name ? `Vet: ${pet.vet_name}${pet.vet_phone ? " - " + pet.vet_phone : ""}` : null,
      pet.emergency_contact_name
        ? `Emergency Contact: ${pet.emergency_contact_name}${pet.emergency_contact_phone ? " - " + pet.emergency_contact_phone : ""}`
        : null,
      pet.microchip_number ? `Microchip: ${pet.microchip_number}` : null,
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

  return (
    <div className="rounded-xl p-5 mb-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {pet.photo_url ? (
            <SignedImg
              value={pet.photo_url}
              alt={pet.name}
              className="rounded-full object-cover"
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 48, height: 48, background: tokens.sky, fontSize: 22 }}
            >
              {pet.animal_type === "Dog" ? "🐕" : pet.animal_type === "Cat" ? "🐈" : "🐾"}
            </div>
          )}
          <label
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 18,
              height: 18,
              background: tokens.navy,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              cursor: "pointer",
              border: "2px solid #fff",
            }}
          >
            📷
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: font.display, fontSize: 18, color: tokens.navy }}>{pet.name}</div>
          <div style={{ fontFamily: font.body, fontSize: 14.5, opacity: 0.65 }}>
            {pet.breed ? `${pet.breed} · ` : ""}
            {pet.sex ? `${pet.sex} · ` : ""}
            {calculateAge(pet.date_of_birth) ? `${calculateAge(pet.date_of_birth)} · ` : ""}
            {pet.role}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleShare}
            style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.green, fontWeight: 600 }}
          >
            {justCopied ? "Copied!" : "📤 Share"}
          </button>
          <button
            onClick={() => setShowEditForm((v) => !v)}
            style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.navy, fontWeight: 600 }}
          >
            Edit
          </button>
          <button
            onClick={handleDeletePet}
            disabled={deleting}
            style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.stamp, opacity: 0.7 }}
          >
            {deleting ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>

      {showEditForm && (
        <form
          onSubmit={handleSaveEdit}
          className="rounded-xl p-4 mt-3"
          style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}
        >
          <div className="flex flex-col gap-2">
            <input
              required
              placeholder="Name"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <div className="flex gap-2">
              <select
                value={editForm.animal_type}
                onChange={(e) => setEditForm((f) => ({ ...f, animal_type: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
                className="rounded-lg px-3 py-2 outline-none flex-1"
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Other</option>
              </select>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
                className="rounded-lg px-3 py-2 outline-none flex-1"
              >
                <option>Pet</option>
                <option>Service animal</option>
              </select>
            </div>
            <input
              placeholder="Breed (optional)"
              value={editForm.breed}
              onChange={(e) => setEditForm((f) => ({ ...f, breed: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <div className="flex gap-2">
              <select
                value={editForm.sex}
                onChange={(e) => setEditForm((f) => ({ ...f, sex: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
                className="rounded-lg px-3 py-2 outline-none flex-1"
              >
                <option value="">Sex (optional)</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <input
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
                className="rounded-lg px-3 py-2 outline-none flex-1"
              />
            </div>

            <div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 600, color: tokens.navy }} className="mt-2">
              Vet & Emergency Info (optional)
            </div>
            <input
              placeholder="Vet's name"
              value={editForm.vet_name}
              onChange={(e) => setEditForm((f) => ({ ...f, vet_name: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <input
              placeholder="Vet's phone"
              value={editForm.vet_phone}
              onChange={(e) => setEditForm((f) => ({ ...f, vet_phone: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <input
              placeholder="Emergency contact name"
              value={editForm.emergency_contact_name}
              onChange={(e) => setEditForm((f) => ({ ...f, emergency_contact_name: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <input
              placeholder="Emergency contact phone"
              value={editForm.emergency_contact_phone}
              onChange={(e) => setEditForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <input
              placeholder="Microchip number"
              value={editForm.microchip_number}
              onChange={(e) => setEditForm((f) => ({ ...f, microchip_number: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={savingEdit}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 14.5 }}
              className="rounded-lg px-4 py-2 hover:opacity-90 transition"
            >
              {savingEdit ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!pet.photo_url && (
        <div
          style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, color: tokens.muted }}
          className="mt-2"
        >
          {uploadingPhoto ? "Uploading photo…" : "No photo yet — tap the camera icon above. For best results: a bright, clear headshot works better than a full-body or action shot."}
        </div>
      )}

      {(pet.vet_name || pet.emergency_contact_name || pet.microchip_number) && (
        <div className="rounded-xl p-3 mt-3" style={{ background: tokens.paper, border: `1px solid ${tokens.line}` }}>
          {pet.vet_name && (
            <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.75 }}>
              🩺 Vet: {pet.vet_name}{pet.vet_phone ? ` · ${pet.vet_phone}` : ""}
            </div>
          )}
          {pet.emergency_contact_name && (
            <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.75 }}>
              📞 Emergency: {pet.emergency_contact_name}{pet.emergency_contact_phone ? ` · ${pet.emergency_contact_phone}` : ""}
            </div>
          )}
          {pet.microchip_number && (
            <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.75 }}>
              🔖 Microchip: {pet.microchip_number}
            </div>
          )}
        </div>
      )}

      {/* Digital Pet ID */}
      <div className="mt-4">
      <PetIdCard
        pet={pet}
        photo={pet.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null}
      >
        <label
          className="px-5 py-4 flex items-start gap-3 cursor-pointer"
          style={{ background: tokens.paper, borderTop: `1px solid ${tokens.line}` }}
        >
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 flex-shrink-0"
            style={{ accentColor: tokens.primary }}
            checked={!!pet.show_contact_on_public_id}
            disabled={savingContactToggle}
            onChange={(e) => togglePublicContact(e.target.checked)}
          />
          <span style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.ink }}>
            Show my emergency contact on the public Pet ID
            <span style={{ display: "block", color: tokens.muted, fontWeight: 400, fontSize: 15, lineHeight: 1.5 }}>
              {pet.show_contact_on_public_id
                ? "On: anyone who scans this QR code sees your emergency contact's name and phone."
                : "Off: your emergency contact stays private. Turn on so whoever finds your pet can reach you."}{" "}
              Name, species, breed and photo are always shown.
            </span>
          </span>
        </label>
      </PetIdCard>
      <LostPanel pet={pet} userId={userId} />
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${tokens.line}` }}>
        {loadingLog ? (
          <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>Loading weight…</div>
        ) : current ? (
          <button onClick={() => setShowLog((v) => !v)} className="flex items-center justify-between w-full text-left">
            <div>
              <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Weight: </span>
              <span style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.navy }}>
                {current.value} {current.unit || "lbs"}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  style={{ fontFamily: font.body, fontSize: 14, color: delta > 0 ? tokens.stamp : "#3E7A4B" }}
                  className="ml-2"
                >
                  {delta > 0 ? "↗" : "↘"} {delta > 0 ? "+" : ""}
                  {delta} since {previous.recorded_date}
                </span>
              )}
            </div>
            <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.navy, color: tokens.muted }}>
              {showLog ? "Hide log" : "View log"}
            </span>
          </button>
        ) : (
          <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>No weight logged yet</div>
        )}

        {showLog && measurements.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {measurements.map((m) => (
              <div key={m.id} className="flex justify-between items-center" style={{ fontFamily: font.body, fontSize: 14.5 }}>
                <span style={{ color: tokens.muted }}>{m.recorded_date}</span>
                <div className="flex items-center gap-2">
                  <span style={{ color: tokens.navy, fontWeight: 600 }}>
                    {m.value} {m.unit || "lbs"}
                  </span>
                  <button
                    onClick={async () => {
                      await supabase.from("pet_measurements").delete().eq("id", m.id);
                      loadMeasurements();
                    }}
                    style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.stamp, color: tokens.muted }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{ fontFamily: font.body, fontSize: 14, color: tokens.navy, fontWeight: 600 }}
            className="mt-3 underline"
          >
            + Log weight
          </button>
        ) : (
          <form onSubmit={handleAddWeight} className="mt-3 flex gap-2 items-end">
            <div className="flex-1">
              <input
                required
                type="number"
                step="0.1"
                placeholder="Weight (lbs)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
                className="rounded-lg px-3 py-2 outline-none w-full"
              />
            </div>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 14.5 }}
              className="rounded-lg px-4 py-2 hover:opacity-90 transition"
            >
              {saving ? "…" : "Save"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.navy }} className="mb-2">
          Documents
        </div>

        {loadingDocs ? (
          <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}>Loading documents…</div>
        ) : documents.length === 0 ? (
          <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mb-2">
            No documents uploaded yet
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between py-2"
              style={{ borderTop: `1px solid ${tokens.line}` }}
            >
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  const win = window.open("", "_blank");
                  const url = await getSignedUrl(doc.file_url);
                  if (url && win) win.location.href = url;
                  else if (win) win.close();
                }}
                style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy, textDecoration: "underline" }}
              >
                {doc.document_type}
              </a>
              {doc.expires_on && (
                <span style={{ fontFamily: font.body, fontSize: 13, color: doc.expires_on < new Date().toISOString().slice(0, 10) ? tokens.stamp : tokens.muted }} className="ml-auto mr-3">
                  {doc.expires_on < new Date().toISOString().slice(0, 10) ? "Expired" : "Expires"} {new Date(doc.expires_on + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              <button
                onClick={() => handleDeleteDocument(doc)}
                style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.stamp, opacity: 0.7 }}
              >
                Remove
              </button>
            </div>
          ))
        )}

        {!showUploadForm ? (
          <button
            onClick={() => setShowUploadForm(true)}
            style={{ fontFamily: font.body, fontSize: 14, color: tokens.navy, fontWeight: 600 }}
            className="mt-2 underline"
          >
            + Upload a document
          </button>
        ) : (
          <form onSubmit={handleUpload} className="mt-3 flex flex-col gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15.5 }}
              className="rounded-lg px-3 py-2 outline-none"
            >
              <option>Vaccination record</option>
              <option>Health certificate</option>
              <option>Training documentation</option>
              <option>Microchip registration</option>
              <option>Insurance policy</option>
              <option>Pet photo</option>
              <option>Other</option>
            </select>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ fontFamily: font.body, fontSize: 14.5 }}
            />
            <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.55 }}>
              On your phone, this lets you choose "Take Photo" or pick an existing file.
            </div>
            <label style={{ fontFamily: font.body, fontSize: 14, color: tokens.navy }} className="flex items-center gap-2 flex-wrap">
              Expires on (optional)
              <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }} className="rounded-lg px-3 py-1.5 outline-none" />
              <span style={{ fontSize: 12.5, color: tokens.muted }}>Members get an email before it expires.</span>
            </label>
            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 14.5 }}
                className="rounded-lg px-4 py-2 hover:opacity-90 transition"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.muted }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AccessGate() {
  return (
    <div className="rounded-2xl p-7 text-center" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 700, color: tokens.navy }} className="mb-2">Your pet vault and Digital Pet ID are paused</div>
      <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted, lineHeight: 1.55 }} className="mb-5 max-w-lg mx-auto">
        They're included with Membership, or with a Travel Pass until your trip ends. Your pets and documents are kept safe and come back as soon as you rejoin.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <a href="/signup?plan=member" className="btn-primary rounded-full px-6 py-3" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>Join for {P.member}/mo</a>
        <a href="/assessment" className="rounded-full px-6 py-3" style={{ border: `2px solid ${tokens.navy}`, color: tokens.navy, fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}>Buy a Travel Pass</a>
      </div>
    </div>
  );
}

function MemberUpsell() {
  return (
    <div className="rounded-xl p-5 mt-3" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}` }}>
      <div style={{ fontFamily: font.display, fontSize: 19, fontWeight: 700, color: tokens.navy }} className="mb-1">Traveling with more than one animal?</div>
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, lineHeight: 1.55 }} className="mb-3">
        Your plan includes one pet. Membership ({P.member}/mo) adds unlimited pets, {P.memberPass} Travel Passes and reminders before your documents expire.
      </p>
      <span className="inline-block rounded-full px-4 py-2" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 14, fontWeight: 600, color: tokens.navy }}>Membership is coming soon</span>
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
          <div style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.muted }}>Lost-pet tools stay free, always:</div>
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

const CATEGORY_ICONS = {
  "BOOKING REQUIREMENT": "📞",
  "KENNEL REQUIREMENT": "🧳",
  "PET FEE": "💵",
  "AGE REQUIREMENT": "🗓️",
  "WEIGHT LIMIT": "⚖️",
  "BREED RESTRICTION": "🐾",
  "REQUIRED FORM": "📄",
  SUBMISSION: "📤",
  "HEALTH DOCUMENTATION": "🩺",
  VACCINATION: "💉",
  "ROUTE RESTRICTION": "🚫",
  "PHONE SUPPORT": "☎️",
};

function categoryIcon(category) {
  if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
  if (category.includes("CARGO") || category.includes("FIT IN THE CABIN")) return "📦";
  if (category.includes("MISS A STEP")) return "⚠️";
  return "📌";
}

const STATUS_ACCENT = {
  attention: tokens.stamp,
  verify: tokens.gold,
  complete: tokens.green,
};

// Pure facts (kennel size, age, fee, breed rule, vaccination timing) never get a "Go here"
// button — there's no real destination for a fact, only for an actual form or booking action.
const NO_LINK_CATEGORIES = new Set(["KENNEL REQUIREMENT", "AGE REQUIREMENT", "PET FEE", "BREED RESTRICTION", "VACCINATION"]);

function RequirementItem({ req, checked, onToggle }) {
  const accent = STATUS_ACCENT[req.status] || tokens.line;
  return (
    <div
      className="rounded-xl p-4 mb-2.5 flex items-start gap-3"
      style={{
        background: checked ? tokens.paper : "#fff",
        borderLeft: `4px solid ${checked ? tokens.line : accent}`,
        borderTop: `1px solid ${tokens.line}`,
        borderRight: `1px solid ${tokens.line}`,
        borderBottom: `1px solid ${tokens.line}`,
        opacity: checked ? 0.6 : 1,
      }}
    >
      <div
        className="rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ width: 34, height: 34, background: tokens.sky, fontSize: 16 }}
      >
        {categoryIcon(req.category)}
      </div>
      <div className="flex-1">
        <div style={{ fontFamily: font.mono, fontSize: 11.5, color: tokens.ink, opacity: 0.4, letterSpacing: "0.08em" }} className="mb-0.5">
          {req.category}
        </div>
        <div
          style={{
            fontFamily: font.body,
            fontWeight: 700,
            fontSize: 16.5,
            color: tokens.navy,
            textDecoration: checked ? "line-through" : "none",
            lineHeight: 1.25,
          }}
          className="mb-1"
        >
          {req.title}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.ink, opacity: 0.7 }} className="mb-2">
          {req.description}
          {req.source_url && req.verified_at && (
            <div style={{ fontFamily: font.mono, fontSize: 12, opacity: 0.55, marginTop: 4 }}>
              Source:{" "}
              <a href={req.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                {(() => { try { return new URL(req.source_url).hostname.replace(/^www\./, ""); } catch { return "official page"; } })()}
              </a>
              {" · last verified "}
              {new Date(req.verified_at + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontFamily: font.mono,
                fontSize: 12,
                color: tokens.navy,
                background: tokens.sky,
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              DUE {req.deadline_description}
            </span>
            {req.category === "REQUIRED FORM" && (
              <span style={{ fontFamily: font.body, fontSize: 12, color: tokens.stamp, fontWeight: 600 }}>
                Submit it as shown in the "Submission" step
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {req.submission_link && !NO_LINK_CATEGORIES.has(req.category) && (
              <a
                href={req.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: font.body,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#fff",
                  background: tokens.primary,
                  textDecoration: "none",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                className="rounded-full px-3.5 py-1.5 hover:opacity-90 transition"
              >
                Go here →
              </a>
            )}
            <button
              onClick={onToggle}
              className="rounded-full flex items-center gap-1.5 flex-shrink-0 transition-all duration-200"
              style={{
                padding: "5px 12px 5px 6px",
                border: `2px solid ${checked ? tokens.green : tokens.line}`,
                background: checked ? tokens.green : "#fff",
                boxShadow: checked ? `0 0 0 4px rgba(47,111,237,0.18)` : "none",
              }}
            >
              <span
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: 18,
                  height: 18,
                  background: checked ? "#fff" : tokens.paper,
                  border: checked ? "none" : `1.5px solid ${tokens.line}`,
                }}
              >
                {checked && <span style={{ color: tokens.green, fontSize: 12.5, fontWeight: 900 }}>✓</span>}
              </span>
              <span
                style={{
                  fontFamily: font.body,
                  fontSize: 13,
                  fontWeight: 700,
                  color: checked ? "#fff" : tokens.ink,
                }}
              >
                {checked ? "Done" : "Mark as done"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementGroup({ title, items, statusMap, onToggle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const doneCount = items.filter((r) => statusMap[r.id]).length;

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-2"
      >
        <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 600, color: tokens.navy }}>
          {title} ({doneCount}/{items.length})
        </span>
        <span style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, color: tokens.muted }}>
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open &&
        items.map((r) => (
          <RequirementItem key={r.id} req={r} checked={!!statusMap[r.id]} onToggle={() => onToggle(r.id)} />
        ))}
    </div>
  );
}

function CurrentFlightTab({ userId }) {
  const [trip, setTrip] = useState(null);
  const [results, setResults] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);

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
      const { data: reqs } = await supabase
        .from("airline_requirements")
        .select("*")
        .in("airline", [requirementAirline(currentTrip.airline), "Any"])
        .in("animal_type", [currentTrip.animal_type, "Any"])
        .in("role", [currentTrip.role, "Any"])
        .in("trip_type", tripTypeForRoute(currentTrip.origin, currentTrip.destination) === "international" ? ["international", "domestic"] : ["domestic"]);

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
      // Refund rule: record (server-side, once) the first time paid details are opened.
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

  async function handleToggle(requirementId) {
    const newValue = !statusMap[requirementId];
    setStatusMap((m) => ({ ...m, [requirementId]: newValue }));

    await supabase.from("trip_requirement_status").upsert(
      {
        user_id: userId,
        trip_id: trip.id,
        requirement_id: requirementId,
        completed: newValue,
      },
      { onConflict: "trip_id,requirement_id" }
    );
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
          Plan your trip to get your Travel Pass, and it'll show up here.
        </div>
        <a
          href="/assessment"
          style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, textDecoration: "none" }}
          className="rounded-full px-6 py-2.5 text-[14px] hover:opacity-90 transition inline-block"
        >
          Start your Travel Pass
        </a>
      </div>
    );
  }

  const actionItems = results.filter((r) => r.status === "attention");
  const showTrack = trip.paid && /service|psychiatric/i.test(trip.role || "");
  const verifyItems = results.filter((r) => r.status === "verify");
  const goodToKnow = results.filter((r) => r.status === "complete");

  const trackedTotal = actionItems.length + verifyItems.length;
  const trackedDone = [...actionItems, ...verifyItems].filter((r) => statusMap[r.id]).length;
  const progressPct = trackedTotal > 0 ? Math.round((trackedDone / trackedTotal) * 100) : 100;

  return (
    <div>
      <div className="rounded-xl p-5 mb-4" style={{ background: tokens.navy }}>
        <div style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold, letterSpacing: "0.1em" }} className="mb-1">
          YOUR TRAVEL PASS
        </div>
        <div style={{ fontFamily: font.display, fontSize: 20, color: "#fff" }} className="mb-1">
          {trip.animal_type} · {trip.origin} → {trip.destination}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky, opacity: 0.8 }} className="mb-3">
          {trip.airline} · {trip.travel_date || "date pending"} · {trip.role}{isMexicoAirport(trip.destination) || isMexicoAirport(trip.origin) ? " · International (Mexico)" : ""}
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontFamily: font.mono, fontSize: 12, color: tokens.sky, opacity: 0.7, letterSpacing: "0.08em" }}>
            TRIP READINESS
          </span>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: tokens.gold }}>
            {trackedDone}/{trackedTotal} DONE
          </span>
        </div>
        <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: tokens.stamp }}
          />
        </div>
      </div>

      {trip.paid && <TripTimeline trip={trip} requirements={results} statusMap={statusMap} />}
      <VetGuidance trip={trip} requirements={results} paid={!!trip.paid} />
      {showTrack && <ServiceAnimalTrack trip={trip} />}
      {trip.paid && <DocCheck trip={trip} />}

      {results.length === 0 ? (
        <div className="rounded-xl p-5 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 15, opacity: 0.7 }}>
          No requirements found for this exact combination yet.
        </div>
      ) : (
        <>
          {trackedTotal > 0 && trackedDone === trackedTotal && (
            <div
              className="rounded-xl p-5 mb-4 text-center"
              style={{ background: "#EAF6EE", border: `1.5px solid ${tokens.green}` }}
            >
              <div style={{ fontFamily: font.display, fontSize: 18, color: tokens.green }} className="mb-1">
                🎉 You're all set for this trip
              </div>
              <div style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink, opacity: 0.75 }}>
                Everything that needed action or verification is checked off. Review "Good to know" below before you fly.
              </div>
            </div>
          )}
          <RequirementGroup title="Needs action" items={actionItems} statusMap={statusMap} onToggle={handleToggle} defaultOpen={true} />
          <RequirementGroup title="Needs verification" items={verifyItems} statusMap={statusMap} onToggle={handleToggle} defaultOpen={false} />
          <RequirementGroup title="Good to know" items={goodToKnow} statusMap={statusMap} onToggle={handleToggle} defaultOpen={false} />
        </>
      )}
    </div>
  );
}

function BillingTab({ userId }) {
  const [isMember, setIsMember] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (userId) supabase.rpc("my_membership").then(({ data }) => setIsMember(!!data)); }, [userId]);
  async function go(path, body) {
    setBusy(true); setErr("");
    const { data: s } = await supabase.auth.getSession();
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.session?.access_token || ""}` }, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.url) window.location.href = j.url; else { setErr(j.error || "Something went wrong. Please try again."); setBusy(false); }
  }
  const btn = { background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 600 };
  return (
    <div className="rounded-xl p-8" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 22, color: tokens.navy }} className="mb-2">Billing</div>
      {isMember === null ? (
        <div style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</div>
      ) : isMember ? (
        <>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }} className="mb-4">You're a PetPassGo member ({P.member}{P.memberUnit}). Update your card, see receipts or cancel anytime.</p>
          <button disabled={busy} onClick={() => go("/api/stripe/portal")} style={btn} className="rounded-full px-6 py-3 hover:opacity-90">Manage or cancel membership</button>
        </>
      ) : (
        <>
          <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink }} className="mb-4">Membership is {P.member}{P.memberUnit}: Pet ID, vault, lost-pet alerts, community, unlimited pets and {P.memberPass} Travel Passes. Monthly, cancel anytime.</p>
          <div className="flex flex-wrap gap-3">
            <button disabled={busy} onClick={() => go("/api/stripe/checkout", { plan: "membership" })} style={btn} className="rounded-full px-6 py-3 hover:opacity-90">Become a member</button>
            <button disabled={busy} onClick={() => go("/api/stripe/portal")} style={{ ...btn, background: "#fff", color: tokens.navy, border: `2px solid ${tokens.navy}` }} className="rounded-full px-6 py-3">Receipts</button>
          </div>
        </>
      )}
      {err && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.stamp }} className="mt-3">{err}</div>}
    </div>
  );
}

function CheckoutBanner() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("checkout");
    if (q === "success") setMsg("Payment received. Thank you! Your trip unlocks in a few seconds. Refresh if it still looks locked.");
    else if (q === "canceled") setMsg("Checkout canceled. You haven't been charged.");
  }, []);
  if (!msg) return null;
  return <div className="rounded-xl p-4 mb-6" style={{ background: "#fff", border: `1px solid ${tokens.green}`, fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{msg}</div>;
}

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flight");

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data?.user) window.location.href = "/login";
        else setUser(data.user);
      })
      .catch(() => (window.location.href = "/login"))
      .finally(() => setLoading(false));

    if (localStorage.getItem("petpassgo_open_flight_tab")) {
      setActiveTab("flight");
      localStorage.removeItem("petpassgo_open_flight_tab");
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full">
      <SiteHeader onLogout={handleLogout} />
      {loading ? (
        <div className="flex items-center justify-center py-24" style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</div>
      ) : (
      <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 style={{ fontFamily: font.display, fontWeight: 700, fontSize: 34, color: tokens.navy, lineHeight: 1.1 }}>Your dashboard</h1>
            <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.muted }} className="mt-1">{user?.email}</div>
          </div>
        </div>

        <CheckoutBanner />
        <div role="tablist" className="inline-flex flex-wrap gap-1 mb-8 p-1 rounded-full" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
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

        {activeTab === "profile" && <PetProfileTab userId={user?.id} />}

        {activeTab === "flight" && <CurrentFlightTab userId={user?.id} />}

        {activeTab === "history" && (
          <ComingSoon
            title="Flight History"
            blurb="Every trip you complete will show up here, so your next one starts faster."
          />
        )}

        {activeTab === "billing" && <BillingTab userId={user?.id} />}
      </div>
      )}
    </div>
  );
}
