"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const tokens = {
  navy: "#152238",
  gold: "#C9A227",
  sky: "#EAF0F6",
  paper: "#F6F8FA",
  ink: "#1C2733",
  stamp: "#B23A2E",
  line: "#D9E1E8",
};

const font = {
  display: "'Fraunces', serif",
  mono: "'IBM Plex Mono', monospace",
  body: "'Inter', sans-serif",
};

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
      <div style={{ fontFamily: font.mono, fontSize: 10.5, color: tokens.stamp, letterSpacing: "0.1em" }} className="mb-2">
        COMING SOON
      </div>
      <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-2">
        {title}
      </div>
      <div style={{ fontFamily: font.body, fontSize: 14, opacity: 0.7, maxWidth: 380 }} className="mx-auto">
        {blurb}
      </div>
    </div>
  );
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
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
      })
      .eq("id", pet.id);
    setSavingEdit(false);
    setShowEditForm(false);
    onPhotoUpdated();
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);

    const filePath = `${userId}/${pet.id}/profile-photo-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("pet-documents").upload(filePath, file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("pet-documents").getPublicUrl(filePath);
      await supabase.from("pets").update({ photo_url: urlData.publicUrl }).eq("id", pet.id);
      onPhotoUpdated();
    }
    setUploadingPhoto(false);
  }

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docType, setDocType] = useState("Vaccination record");
  const [selectedFile, setSelectedFile] = useState(null);
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
      const { data: urlData } = supabase.storage.from("pet-documents").getPublicUrl(filePath);
      await supabase.from("documents").insert({
        user_id: userId,
        pet_id: pet.id,
        document_type: docType,
        file_url: urlData.publicUrl,
      });
      setSelectedFile(null);
      setShowUploadForm(false);
      loadDocuments();
    }
    setUploading(false);
  }

  async function handleDeleteDocument(doc) {
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
            <img
              src={pet.photo_url}
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
              fontSize: 10,
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
          <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.65 }}>
            {pet.breed ? `${pet.breed} · ` : ""}
            {pet.sex ? `${pet.sex} · ` : ""}
            {pet.role}
          </div>
        </div>
        <button
          onClick={() => setShowEditForm((v) => !v)}
          style={{ fontFamily: font.body, fontSize: 12, color: tokens.navy, fontWeight: 600 }}
        >
          Edit
        </button>
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
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <div className="flex gap-2">
              <select
                value={editForm.animal_type}
                onChange={(e) => setEditForm((f) => ({ ...f, animal_type: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
                className="rounded-lg px-3 py-2 outline-none flex-1"
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Other</option>
              </select>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
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
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <div className="flex gap-2">
              <select
                value={editForm.sex}
                onChange={(e) => setEditForm((f) => ({ ...f, sex: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
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
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
                className="rounded-lg px-3 py-2 outline-none flex-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={savingEdit}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 13 }}
              className="rounded-lg px-4 py-2 hover:opacity-90 transition"
            >
              {savingEdit ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              style={{ fontFamily: font.body, fontSize: 13, opacity: 0.6 }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!pet.photo_url && (
        <div
          style={{ fontFamily: font.body, fontSize: 12, color: tokens.stamp, opacity: 0.85 }}
          className="mt-2"
        >
          {uploadingPhoto ? "Uploading photo…" : "No photo yet — tap the camera icon above. For best results: a bright, clear headshot works better than a full-body or action shot."}
        </div>
      )}

      {/* Digital Pet ID */}
      <div className="rounded-xl overflow-hidden mt-4" style={{ border: `1px solid ${tokens.line}` }}>
        <div style={{ background: tokens.navy }} className="px-4 py-2.5 flex items-center justify-between">
          <div style={{ fontFamily: font.mono, fontSize: 9.5, color: tokens.gold, letterSpacing: "0.1em" }}>
            DIGITAL PET ID
          </div>
          <div style={{ fontFamily: font.mono, fontSize: 8.5, color: tokens.sky, opacity: 0.6 }}>PETPASSGO</div>
        </div>
        <div className="p-4 flex items-center gap-4" style={{ background: "#fff" }}>
          {pet.photo_url ? (
            <img src={pet.photo_url} alt={pet.name} className="rounded-lg object-cover flex-shrink-0" style={{ width: 56, height: 56 }} />
          ) : (
            <div
              className="rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ width: 56, height: 56, background: tokens.sky, fontSize: 26 }}
            >
              {pet.animal_type === "Dog" ? "🐕" : pet.animal_type === "Cat" ? "🐈" : "🐾"}
            </div>
          )}
          <div className="flex-1">
            <div style={{ fontFamily: font.display, fontSize: 18, color: tokens.navy }}>{pet.name}</div>
            <div style={{ fontFamily: font.body, fontSize: 12, opacity: 0.65 }}>
              {[pet.breed, pet.sex, pet.animal_type].filter(Boolean).join(" · ")}
            </div>
            <div
              style={{
                fontFamily: font.mono,
                fontSize: 9.5,
                color: pet.role === "Service animal" ? tokens.stamp : tokens.navy,
                border: `1px solid ${pet.role === "Service animal" ? tokens.stamp : tokens.navy}`,
                borderRadius: 999,
                padding: "2px 8px",
                display: "inline-block",
              }}
              className="mt-1"
            >
              {pet.role.toUpperCase()}
            </div>
          </div>
          <svg viewBox="0 0 29 29" style={{ width: 44, height: 44 }} className="flex-shrink-0">
            <rect width="29" height="29" fill="#fff" />
            {[[1, 1], [22, 1], [1, 22]].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <rect x={x} y={y} width="6" height="6" fill={tokens.navy} />
                <rect x={x + 1.3} y={y + 1.3} width="3.4" height="3.4" fill="#fff" />
                <rect x={x + 2} y={y + 2} width="2" height="2" fill={tokens.navy} />
              </g>
            ))}
            {[
              [10, 2], [13, 3], [16, 1], [19, 4], [10, 5], [15, 6],
              [2, 10], [5, 12], [3, 15], [7, 16], [1, 18], [5, 19],
              [10, 10], [13, 11], [11, 14], [16, 12], [14, 16], [18, 9],
              [22, 10], [25, 12], [23, 15], [26, 17], [21, 18], [24, 20],
              [10, 22], [13, 24], [16, 21], [11, 26], [18, 23], [15, 27],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="1.3" height="1.3" fill={tokens.navy} />
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${tokens.line}` }}>
        {loadingLog ? (
          <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.5 }}>Loading weight…</div>
        ) : current ? (
          <button onClick={() => setShowLog((v) => !v)} className="flex items-center justify-between w-full text-left">
            <div>
              <span style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.6 }}>Weight: </span>
              <span style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 600, color: tokens.navy }}>
                {current.value} {current.unit || "lbs"}
              </span>
              {delta !== null && delta !== 0 && (
                <span
                  style={{ fontFamily: font.body, fontSize: 12.5, color: delta > 0 ? tokens.stamp : "#3E7A4B" }}
                  className="ml-2"
                >
                  {delta > 0 ? "↗" : "↘"} {delta > 0 ? "+" : ""}
                  {delta} since {previous.recorded_date}
                </span>
              )}
            </div>
            <span style={{ fontFamily: font.body, fontSize: 12, color: tokens.navy, opacity: 0.6 }}>
              {showLog ? "Hide log" : "View log"}
            </span>
          </button>
        ) : (
          <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.6 }}>No weight logged yet</div>
        )}

        {showLog && measurements.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5">
            {measurements.map((m) => (
              <div key={m.id} className="flex justify-between" style={{ fontFamily: font.body, fontSize: 13 }}>
                <span style={{ opacity: 0.6 }}>{m.recorded_date}</span>
                <span style={{ color: tokens.navy, fontWeight: 600 }}>
                  {m.value} {m.unit || "lbs"}
                </span>
              </div>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.navy, fontWeight: 600 }}
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
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
                className="rounded-lg px-3 py-2 outline-none w-full"
              />
            </div>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
              className="rounded-lg px-3 py-2 outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 13 }}
              className="rounded-lg px-4 py-2 hover:opacity-90 transition"
            >
              {saving ? "…" : "Save"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 600, color: tokens.navy }} className="mb-2">
          Documents
        </div>

        {loadingDocs ? (
          <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.5 }}>Loading documents…</div>
        ) : documents.length === 0 ? (
          <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.6 }} className="mb-2">
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
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.navy, textDecoration: "underline" }}
              >
                {doc.document_type}
              </a>
              <button
                onClick={() => handleDeleteDocument(doc)}
                style={{ fontFamily: font.body, fontSize: 12, color: tokens.stamp, opacity: 0.7 }}
              >
                Remove
              </button>
            </div>
          ))
        )}

        {!showUploadForm ? (
          <button
            onClick={() => setShowUploadForm(true)}
            style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.navy, fontWeight: 600 }}
            className="mt-2 underline"
          >
            + Upload a document
          </button>
        ) : (
          <form onSubmit={handleUpload} className="mt-3 flex flex-col gap-2">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 14 }}
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
              style={{ fontFamily: font.body, fontSize: 13 }}
            />
            <div style={{ fontFamily: font.body, fontSize: 11.5, opacity: 0.55 }}>
              On your phone, this lets you choose "Take Photo" or pick an existing file.
            </div>
            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                style={{ background: tokens.stamp, color: "#fff", fontFamily: font.body, fontWeight: 600, fontSize: 13 }}
                className="rounded-lg px-4 py-2 hover:opacity-90 transition"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                style={{ fontFamily: font.body, fontSize: 13, opacity: 0.6 }}
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

function PetProfileTab({ userId }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", animal_type: "Dog", role: "Pet", breed: "", sex: "" });

  async function loadPets() {
    setLoading(true);
    const { data } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false });
    setPets(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPets();
  }, []);

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
    if (!error) {
      setForm({ name: "", animal_type: "Dog", role: "Pet", breed: "", sex: "" });
      setShowForm(false);
      loadPets();
    }
  }

  return (
    <div>
      {loading ? (
        <div style={{ fontFamily: font.body, opacity: 0.6, fontSize: 14 }}>Loading your pets…</div>
      ) : pets.length === 0 && !showForm ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}
        >
          <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-2">
            No pets yet
          </div>
          <div style={{ fontFamily: font.body, fontSize: 14, opacity: 0.7 }} className="mb-4">
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
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.navy, fontWeight: 600 }}
              className="mt-1 underline"
            >
              + Add another pet
            </button>
          )}
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
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            <div className="flex gap-3">
              <select
                value={form.animal_type}
                onChange={(e) => setForm((f) => ({ ...f, animal_type: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
                className="rounded-xl px-4 py-3 outline-none flex-1"
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Other</option>
              </select>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
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
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
              className="rounded-xl px-4 py-3 outline-none"
            />
            <select
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
              style={{ fontFamily: font.body, border: `2px solid ${tokens.line}`, fontSize: 15 }}
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
              style={{ fontFamily: font.body, fontSize: 14, opacity: 0.6 }}
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
        <div style={{ fontFamily: font.mono, fontSize: 9.5, color: tokens.ink, opacity: 0.4, letterSpacing: "0.08em" }} className="mb-0.5">
          {req.category}
        </div>
        <div
          style={{
            fontFamily: font.body,
            fontWeight: 700,
            fontSize: 15.5,
            color: tokens.navy,
            textDecoration: checked ? "line-through" : "none",
            lineHeight: 1.25,
          }}
          className="mb-1"
        >
          {req.title}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 12.5, color: tokens.ink, opacity: 0.7 }} className="mb-2">
          {req.description}
        </div>
        {req.submission_link && req.category === "REQUIRED FORM" && (
          <div style={{ fontFamily: font.body, fontSize: 11.5, color: tokens.ink, opacity: 0.6 }} className="mb-2">
            📥 Download and fill this out first — you'll submit it using the separate "Submission" step below.
          </div>
        )}
        {req.submission_link && req.category === "SUBMISSION" && (
          <div style={{ fontFamily: font.body, fontSize: 11.5, color: tokens.ink, opacity: 0.6 }} className="mb-2">
            📤 This is where you actually send your completed form — use the button below.
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span
            style={{
              fontFamily: font.mono,
              fontSize: 10.5,
              color: tokens.navy,
              background: tokens.sky,
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            DUE {req.deadline_description}
          </span>
          <div className="flex items-center gap-2">
            {req.submission_link && !NO_LINK_CATEGORIES.has(req.category) && (
              <a
                href={req.submission_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: font.body,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  background: tokens.navy,
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
                border: `2px solid ${checked ? "#2F6FED" : tokens.line}`,
                background: checked ? "#2F6FED" : "#fff",
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
                {checked && <span style={{ color: "#2F6FED", fontSize: 11, fontWeight: 900 }}>✓</span>}
              </span>
              <span
                style={{
                  fontFamily: font.body,
                  fontSize: 11.5,
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
        <span style={{ fontFamily: font.body, fontSize: 13.5, fontWeight: 600, color: tokens.navy }}>
          {title} ({doneCount}/{items.length})
        </span>
        <span style={{ fontFamily: font.body, fontSize: 12, color: tokens.ink, opacity: 0.5 }}>
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
        .in("airline", [currentTrip.airline, "Any"])
        .in("animal_type", [currentTrip.animal_type, "Any"])
        .in("role", [currentTrip.role, "Any"])
        .eq("trip_type", "domestic");

      const destLower = (currentTrip.destination || "").toLowerCase();
      const filtered = (reqs || []).filter((row) => {
        if (!row.destination_match) return true;
        const keywords = row.destination_match.split(",").map((k) => k.trim());
        return keywords.some((k) => destLower.includes(k));
      });
      const finalResults = filtered.filter((r) => r.category !== "ELIGIBILITY NOTE");
      setResults(finalResults);

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
    return <div style={{ fontFamily: font.body, opacity: 0.6, fontSize: 14 }}>Loading your trip…</div>;
  }

  if (!trip) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}` }}>
        <div style={{ fontFamily: font.display, fontSize: 20, color: tokens.navy }} className="mb-2">
          No trip yet
        </div>
        <div style={{ fontFamily: font.body, fontSize: 14, opacity: 0.7 }} className="mb-4">
          Complete the trip assessment to get your Travel Pass, and it'll show up here.
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
  const verifyItems = results.filter((r) => r.status === "verify");
  const goodToKnow = results.filter((r) => r.status === "complete");

  const trackedTotal = actionItems.length + verifyItems.length;
  const trackedDone = [...actionItems, ...verifyItems].filter((r) => statusMap[r.id]).length;
  const progressPct = trackedTotal > 0 ? Math.round((trackedDone / trackedTotal) * 100) : 100;

  return (
    <div>
      <div className="rounded-xl p-5 mb-4" style={{ background: tokens.navy }}>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: tokens.gold, letterSpacing: "0.1em" }} className="mb-1">
          YOUR TRAVEL PASS
        </div>
        <div style={{ fontFamily: font.display, fontSize: 20, color: "#fff" }} className="mb-1">
          {trip.animal_type} · {trip.origin} → {trip.destination}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.sky, opacity: 0.8 }} className="mb-3">
          {trip.airline} · {trip.travel_date || "date pending"} · {trip.role}
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontFamily: font.mono, fontSize: 10, color: tokens.sky, opacity: 0.7, letterSpacing: "0.08em" }}>
            TRIP READINESS
          </span>
          <span style={{ fontFamily: font.mono, fontSize: 10, color: tokens.gold }}>
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

      {results.length === 0 ? (
        <div className="rounded-xl p-5 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 13.5, opacity: 0.7 }}>
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
              <div style={{ fontFamily: font.body, fontSize: 13, color: tokens.ink, opacity: 0.75 }}>
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

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flight");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });

    if (localStorage.getItem("petpassgo_open_flight_tab")) {
      setActiveTab("flight");
      localStorage.removeItem("petpassgo_open_flight_tab");
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex items-center justify-center">
        <span style={{ fontFamily: font.body, color: tokens.ink, opacity: 0.6 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="w-full flex justify-center px-4 py-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        h1, h2, h3, h4 { font-variant-ligatures: none; -webkit-font-variant-ligatures: none; }
      `}</style>

      <div className="w-full max-w-[620px]">
        <div className="flex items-center justify-between mb-6">
          <a href="/" style={{ fontFamily: font.display, fontWeight: 600, fontSize: 22, color: tokens.navy, textDecoration: "none" }}>
            PetPassGo
          </a>
          <button
            onClick={handleLogout}
            style={{ fontFamily: font.body, fontSize: 13.5, color: tokens.ink, opacity: 0.6 }}
          >
            Log out
          </button>
        </div>

        <div style={{ fontFamily: font.body, fontSize: 13.5, opacity: 0.6 }} className="mb-4">
          {user?.email}
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily: font.body,
                fontSize: 13.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: activeTab === tab.key ? tokens.navy : "transparent",
                color: activeTab === tab.key ? "#fff" : tokens.ink,
              }}
              className="rounded-full px-4 py-2 transition"
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

        {activeTab === "billing" && (
          <ComingSoon
            title="Billing"
            blurb="Manage your PetPassGo Membership and payment details here once it's live."
          />
        )}
      </div>
    </div>
  );
}
