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
  { key: "profile", label: "Pet Profile" },
  { key: "flight", label: "Current Flight" },
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

function PetCard({ pet, userId }) {
  const [measurements, setMeasurements] = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

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
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{ width: 48, height: 48, background: tokens.sky, fontSize: 22 }}
        >
          {pet.animal_type === "Dog" ? "🐕" : pet.animal_type === "Cat" ? "🐈" : "🐾"}
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 18, color: tokens.navy }}>{pet.name}</div>
          <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.65 }}>
            {pet.breed ? `${pet.breed} · ` : ""}
            {pet.role}
          </div>
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
    </div>
  );
}

function PetProfileTab({ userId }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", animal_type: "Dog", role: "Pet", breed: "" });

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
    });
    setSaving(false);
    if (!error) {
      setForm({ name: "", animal_type: "Dog", role: "Pet", breed: "" });
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
            <PetCard key={pet.id} pet={pet} userId={userId} />
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

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
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

        {activeTab === "flight" && (
          <ComingSoon
            title="Current Flight"
            blurb="Once you've booked a trip, this is where you'll answer a few more precise questions and get your exact, matched requirements."
          />
        )}

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
