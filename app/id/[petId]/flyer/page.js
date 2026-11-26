"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { tokens, font } from "../../../../lib/theme";
import { PetIllustration } from "../../../../components/PetIdCard";
import LostFlyerSheet from "../../../../components/LostFlyerSheet";
import usePublicPet from "../../../../lib/usePublicPet";
import { SITE_URL } from "../../../../lib/site";
import { supabase } from "../../../../lib/supabaseClient";

function FlyerInner({ params }) {
  const search = useSearchParams();
  const sample = search.get("sample") === "1";
  const { status, pet, lost } = usePublicPet(params.petId);
  const [qr, setQr] = useState("");
  const [reward, setReward] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);
  const pageUrl = sample ? `${SITE_URL}/id/sample` : (pet ? `${SITE_URL}/id/${pet.public_slug || pet.id}` : "");
  useEffect(() => {
    if (!pageUrl) return;
    QRCode.toString(pageUrl, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#14213D", light: "#ffffff" } }).then(setQr);
  }, [pageUrl]);
  useEffect(() => {
    if (!pet?.id || !lost) return;
    supabase.rpc("get_public_lost_reward", { pet_id: pet.id }).then(({ data, error }) => {
      if (error) return;
      const value = Array.isArray(data) ? data[0] : data;
      if (typeof value === "string") setReward(value);
    });
  }, [pet?.id, lost]);

  if (sample) {
    return <FlyerSheet name="Miso" kind="DOG" sex="Female" chipped breed="Shiba Inu" area="Clark St & Ventura Blvd" date="2026-11-01" note="Red collar." reward="$200 if found safe" phone="415-555-0134" pageUrl={pageUrl} qr={qr} photo={null} sample />;
  }

  if (status === "loading") return <p className="p-10" style={{ fontFamily: font.body }}>Loading…</p>;
  if (status !== "ok") return <p className="p-10" style={{ fontFamily: font.body }}>This Pet ID wasn’t found.</p>;
  if (!lost) return <p className="p-10" style={{ fontFamily: font.body }}>{pet.name} isn’t reported lost, so there’s no flyer to print. <a href={`/id/${pet.id}`} style={{ textDecoration: "underline" }}>Back to Pet ID</a></p>;

  return (
    <FlyerSheet
      name={pet.name}
      kind={/cat/i.test(pet.animal_type || "") ? "CAT" : /dog/i.test(pet.animal_type || "Dog") ? "DOG" : "PET"}
      sex={pet.sex}
      chipped={!!pet.microchipped}
      color={pet.color}
      weight={pet.weight_lb}
      animalType={pet.animal_type}
      breed={pet.breed}
      area={lost.last_seen_area}
      date={lost.last_seen_date}
      note={lost.note}
      reward={reward}
      phone={pet.emergency_contact_phone}
      pageUrl={pageUrl}
      qr={qr}
      photo={pet.photo_path && !photoFailed ? <img src={`/api/pet-photo/${pet.id}`} onError={() => setPhotoFailed(true)} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <PetIllustration type={pet.animal_type} size={180} />}
      backHref={`/id/${pet.public_slug || pet.id}`}
    />
  );
}

function FlyerSheet({ name, kind = "PET", sex, color, weight, chipped, breed, area, date, note, reward, phone, pageUrl, qr, photo, animalType, backHref, sample }) {
  return (
    <main className="min-w-0 overflow-x-clip" style={{ background: "#fff", color: tokens.ink, fontFamily: font.body, margin: 0 }}>
      <style>{`@media print { .no-print { display: none !important; } html, body { margin: 0 !important; background: #fff !important; height: auto !important; } .ppg-print-sheet { width: 8.5in !important; height: 10.9in !important; max-height: 10.9in !important; overflow: hidden !important; } .ppg-print-sheet .ppg-flyer-qr svg { width: 150px !important; height: 150px !important; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: letter; margin: 0; } }`}</style>
      {sample ? <div className="no-print" style={{ background: "#F2B84B", color: "#14213D", fontWeight: 800, textAlign: "center", padding: 8 }}>Sample</div> : null}
      <div className="no-print flex flex-wrap justify-center gap-3 py-4 px-4">
        <button onClick={() => window.print()} className="ppg-btn ppg-btn-primary">Print flyer</button>
        {backHref ? <a href={backHref} className="ppg-btn ppg-btn-secondary">Back</a> : null}
      </div>
      <LostFlyerSheet name={name} kind={kind} breed={breed} color={color} sex={sex} weight={weight} chipped={chipped} area={area} date={date} note={note} reward={reward} phone={phone} pageUrl={pageUrl} qr={qr} photo={photo} animalType={animalType} />
    </main>
  );
}

export default function Flyer({ params }) {
  return <Suspense fallback={<p className="p-8">Loading…</p>}><FlyerInner params={params} /></Suspense>;
}
