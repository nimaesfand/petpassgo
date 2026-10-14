"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const tokens = { navy: "#152238", gold: "#C9A227", sky: "#EAF0F6", paper: "#F6F8FA", ink: "#1C2733", stamp: "#B23A2E", line: "#D9E1E8" };
const font = { display: "'Fraunces', serif", mono: "'IBM Plex Mono', monospace", body: "'Inter', sans-serif" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PublicPetId({ params }) {
  const petId = params.petId;
  const [pet, setPet] = useState(null);
  const [state, setState] = useState("loading");
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (!UUID.test(petId)) return setState("notfound");
    supabase.rpc("get_public_pet_id", { pet_id: petId }).then(({ data, error }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row) return setState("notfound");
      setPet(row);
      setState("ok");
    });
  }, [petId]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: tokens.paper }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ background: tokens.navy }} className="px-5 py-3 flex items-center justify-between">
          <div style={{ fontFamily: font.mono, fontSize: 11, color: tokens.gold, letterSpacing: "0.1em" }}>DIGITAL PET ID</div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: tokens.sky, opacity: 0.7 }}>PETPASSGO</div>
        </div>

        {state === "loading" && <p className="p-6" style={{ fontFamily: font.body, opacity: 0.6 }}>Loading…</p>}
        {state === "notfound" && (
          <p className="p-6" style={{ fontFamily: font.body, color: tokens.ink }}>
            This Pet ID wasn’t found. Please check the link or QR code.
          </p>
        )}

        {state === "ok" && pet && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              {pet.photo_path && !photoFailed ? (
                <img src={`/api/pet-photo/${pet.id}`} onError={() => setPhotoFailed(true)} alt={pet.name} className="rounded-xl object-cover" style={{ width: 88, height: 88 }} />
              ) : (
                <div className="rounded-xl flex items-center justify-center" style={{ width: 88, height: 88, background: tokens.sky, fontSize: 40 }}>
                  {pet.animal_type === "Dog" ? "🐕" : pet.animal_type === "Cat" ? "🐈" : "🐾"}
                </div>
              )}
              <div>
                <h1 style={{ fontFamily: font.display, fontSize: 26, color: tokens.navy }}>{pet.name}</h1>
                <div style={{ fontFamily: font.body, fontSize: 13, opacity: 0.7 }}>
                  {[pet.breed, pet.animal_type].filter(Boolean).join(" · ")}
                </div>
                {pet.role && (
                  <div className="mt-1 inline-block" style={{ fontFamily: font.mono, fontSize: 10, color: tokens.navy, border: `1px solid ${tokens.navy}`, borderRadius: 999, padding: "2px 8px" }}>
                    {pet.role.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {(pet.emergency_contact_name || pet.emergency_contact_phone) && (
              <div className="rounded-xl p-4" style={{ background: tokens.sky }}>
                <div style={{ fontFamily: font.mono, fontSize: 10, letterSpacing: "0.1em", color: tokens.navy, opacity: 0.7 }} className="mb-1">
                  IF FOUND, PLEASE CONTACT
                </div>
                <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{pet.emergency_contact_name}</div>
                {pet.emergency_contact_phone && (
                  <a href={`tel:${pet.emergency_contact_phone.replace(/[^0-9+]/g, "")}`} style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy, textDecoration: "underline" }}>
                    {pet.emergency_contact_phone}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
