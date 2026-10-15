"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { tokens, font } from "../../../lib/theme";
import PetIdCard from "../../../components/PetIdCard";

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
    }, () => setState("notfound"));
  }, [petId]);

  const phone = pet?.emergency_contact_phone;
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-14" style={{ background: `linear-gradient(180deg, ${tokens.navy} 0, ${tokens.navy} 220px, ${tokens.sky} 220px)` }}>
      <a href="/" className="mb-6" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: "#fff", textDecoration: "none" }}>PetPassGo</a>
      <div className="w-full max-w-md">
        {state === "loading" && <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", fontFamily: font.body, color: tokens.muted }}>Loading…</div>}
        {state === "notfound" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", fontFamily: font.body, color: tokens.ink }}>
            This Pet ID wasn’t found. Please check the link or QR code.
          </div>
        )}
        {state === "ok" && pet && (
          <>
            <PetIdCard
              pet={pet}
              showQr={false}
              photo={pet.photo_path && !photoFailed ? <img src={`/api/pet-photo/${pet.id}`} onError={() => setPhotoFailed(true)} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null}
            />
            {(pet.emergency_contact_name || phone) ? (
              <div className="rounded-2xl p-6 mt-4 text-center" style={{ background: "#fff", border: `2px solid ${tokens.primary}` }}>
                <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", color: tokens.primary }} className="mb-2">FOUND THIS PET? PLEASE CONTACT</div>
                {pet.emergency_contact_name && <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: tokens.navy }}>{pet.emergency_contact_name}</div>}
                {phone && (
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="btn-primary rounded-full px-6 py-3.5 mt-4 block" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
                    Call {phone}
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-2xl p-5 mt-4 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 15, color: tokens.muted }}>
                The owner hasn’t shared contact details. If this pet seems lost, please take it to a local vet or shelter to scan for a microchip.
              </div>
            )}
            <p className="text-center mt-6" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Digital Pet ID by <a href="/" style={{ color: tokens.navy, fontWeight: 600 }}>PetPassGo</a></p>
          </>
        )}
      </div>
    </main>
  );
}
