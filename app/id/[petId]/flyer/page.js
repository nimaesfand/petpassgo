"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { tokens, font } from "../../../../lib/theme";
import { PetIllustration } from "../../../../components/PetIdCard";
import usePublicPet from "../../../../lib/usePublicPet";
import { fmtDate } from "../../../../lib/lost";
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
    return <FlyerSheet name="Miso" breed="Shiba Inu" area="Clark St & Ventura Blvd" date="2026-11-01" note="Red collar." reward="$200 if found safe" phone="415-555-0134" pageUrl={pageUrl} qr={qr} photo={null} sample />;
  }

  if (status === "loading") return <p className="p-10" style={{ fontFamily: font.body }}>Loading…</p>;
  if (status !== "ok") return <p className="p-10" style={{ fontFamily: font.body }}>This Pet ID wasn’t found.</p>;
  if (!lost) return <p className="p-10" style={{ fontFamily: font.body }}>{pet.name} isn’t reported lost, so there’s no flyer to print. <a href={`/id/${pet.id}`} style={{ textDecoration: "underline" }}>Back to Pet ID</a></p>;

  return (
    <FlyerSheet
      name={pet.name}
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

function FlyerSheet({ name, breed, area, date, note, reward, phone, pageUrl, qr, photo, backHref, sample }) {
  return (
    <main className="min-w-0 overflow-x-clip" style={{ background: "#fff", color: tokens.ink, fontFamily: font.body, margin: 0 }}>
      <style>{`@media print { .no-print { display: none !important; } html, body { margin: 0 !important; background: #fff !important; height: auto !important; } .ppg-print-sheet { width: 8.5in !important; height: 10.9in !important; max-height: 10.9in !important; overflow: hidden !important; } .ppg-print-sheet svg { width: 120px !important; height: 120px !important; } @page { size: letter; margin: 0; } }`}</style>
      {sample ? <div className="no-print" style={{ background: "#F2B84B", color: "#14213D", fontWeight: 800, textAlign: "center", padding: 8 }}>Sample</div> : null}
      <div className="no-print flex flex-wrap justify-center gap-3 py-4 px-4">
        <button onClick={() => window.print()} className="ppg-btn ppg-btn-primary">Print flyer</button>
        {backHref ? <a href={backHref} className="ppg-btn ppg-btn-secondary">Back</a> : null}
      </div>
      <article className="ppg-print-sheet mx-auto bg-white min-w-0" style={{ width: "8.5in", maxWidth: "100%", overflow: "hidden" }}>
        <div className="text-center" style={{ background: tokens.primary, padding: "14px 16px" }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, letterSpacing: "0.14em", color: "#fff", lineHeight: 1 }}>LOST</div>
        </div>
        <div className="text-center" style={{ padding: "16px 28px 12px" }}>
          <div className="mx-auto overflow-hidden" style={{ width: 280, height: 280, maxWidth: "100%", background: "#E8EEF7", border: `4px solid ${tokens.navy}` }}>
            <div className="flex items-center justify-center" style={{ width: "100%", height: "100%" }}>{photo || <PetIllustration type="Dog" size={180} />}</div>
          </div>
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, lineHeight: 1.05, color: tokens.navy, overflowWrap: "anywhere", margin: "12px 0 0" }}>{name}</h1>
          {breed ? <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700 }}>{breed}</div> : null}
          <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, marginTop: 6 }}>
            Last seen {area || "—"}{date ? ` · ${fmtDate(date)}` : ""}
          </div>
          {note ? <div style={{ fontSize: 15, marginTop: 6, overflow: "hidden", maxHeight: 44 }}>{note}</div> : null}
          {reward ? <div style={{ fontSize: 16, fontWeight: 800, color: tokens.navy, marginTop: 6 }}>Reward: {reward}</div> : null}
          <div className="flex items-center justify-center gap-4" style={{ marginTop: 12, textAlign: "left" }}>
            <div style={{ width: 120, height: 120, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: qr }} />
            <div className="min-w-0" style={{ maxWidth: 280 }}>
              <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.navy }}>Seen {name}?</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Scan the code to message the owner{phone ? <> or call {phone}</> : ""}.</div>
              <div style={{ fontSize: 12, marginTop: 4, overflowWrap: "anywhere" }}>{pageUrl}</div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}

export default function Flyer({ params }) {
  return <Suspense fallback={<p className="p-8">Loading…</p>}><FlyerInner params={params} /></Suspense>;
}
