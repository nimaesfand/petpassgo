"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PetPassport from "../../../../components/PetPassport";
import { SignedImg } from "../../../../lib/storage";
import { supabase } from "../../../../lib/supabaseClient";
import { tokens, font } from "../../../../lib/theme";
import { PetIllustration } from "../../../../components/PetIdCard";

const SAMPLE = {
  id: "sample",
  name: "Miso",
  animal_type: "Dog",
  breed: "Shiba Inu",
  color: "Red",
  date_of_birth: "2021-03-02",
  microchip_number: "981000004567890",
  passport_no: "PPG-184-2206",
  handler_name: "Nima",
  emergency_contact_name: "Ava",
  emergency_contact_phone: "415-555-0134",
  public_slug: "sample",
};

const SAMPLE_STAMPS = [
  { id: "1", origin: "SFO", destination: "JFK", travel_date: "2026-10-02" },
  { id: "2", origin: "LAX", destination: "SEA", travel_date: "2026-06-08" },
];

function Sheet({ pet, stamps, photo, sample }) {
  return (
    <main className="min-w-0" style={{ background: "#fff", margin: 0 }}>
      {sample ? <div className="ppg-no-print" style={{ background: "#F2B84B", color: "#14213D", fontWeight: 800, textAlign: "center", padding: 8 }}>Sample</div> : null}
      <div className="ppg-no-print" style={{ display: "flex", justifyContent: "center", padding: 16 }}>
        <button type="button" onClick={() => window.print()} className="ppg-btn ppg-btn-primary">Print passport</button>
      </div>
      <div className="ppg-print-sheet" style={{ width: "8.5in", maxWidth: "100%", margin: "0 auto", overflow: "hidden", background: "#fff" }}>
        <PetPassport pet={pet} photo={photo} stamps={stamps} owner sheet chipValue={pet.microchip_number || ""} />
      </div>
    </main>
  );
}

function PrintPassport() {
  const search = useSearchParams();
  const sample = search.get("sample") === "1";
  const petId = search.get("pet");
  const [pet, setPet] = useState(sample ? SAMPLE : null);
  const [stamps, setStamps] = useState(sample ? SAMPLE_STAMPS : []);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (sample) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { window.location.href = "/login"; return; }
      if (!petId) { setMissing(true); return; }
      const { data: row } = await supabase.from("pets").select("*").eq("id", petId).eq("user_id", data.user.id).maybeSingle();
      if (!row) { setMissing(true); return; }
      setPet(row);
      const { data: trips } = await supabase.from("trips").select("id,origin,destination,travel_date,paid").eq("pet_id", petId).eq("paid", true);
      setStamps((trips || []).filter((t) => t.origin || t.destination));
    });
  }, [sample, petId]);

  if (sample) return <Sheet pet={SAMPLE} stamps={SAMPLE_STAMPS} photo={<PetIllustration type="Dog" size={132} />} sample />;
  if (missing) return <p className="p-8" style={{ fontFamily: font.body, color: tokens.ink }}>That passport isn't on this account.</p>;
  if (!pet) return <p className="p-8" style={{ fontFamily: font.body, color: tokens.ink }}>Loading…</p>;
  const photo = pet.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : null;
  return <Sheet pet={pet} stamps={stamps} photo={photo} />;
}

export default function Page() {
  return <Suspense fallback={<p className="p-8">Loading…</p>}><PrintPassport /></Suspense>;
}
