"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tokens, font } from "../../../../lib/theme";
import { PetIllustration } from "../../../../components/PetIdCard";
import usePublicPet from "../../../../lib/usePublicPet";
import { fmtDate } from "../../../../lib/lost";
import { SITE_URL } from "../../../../lib/site";
import { supabase } from "../../../../lib/supabaseClient";

export default function Flyer({ params }) {
  const { status, pet, lost } = usePublicPet(params.petId);
  const [qr, setQr] = useState("");
  const [reward, setReward] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);
  const pageUrl = pet ? `${SITE_URL}/id/${pet.public_slug || pet.id}` : "";
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

  if (status === "loading") return <p className="p-10" style={{ fontFamily: font.body }}>Loading…</p>;
  if (status !== "ok") return <p className="p-10" style={{ fontFamily: font.body }}>This Pet ID wasn’t found.</p>;
  if (!lost) return <p className="p-10" style={{ fontFamily: font.body }}>{pet.name} isn’t reported lost, so there’s no flyer to print. <a href={`/id/${pet.id}`} style={{ textDecoration: "underline" }}>Back to Pet ID</a></p>;

  const phone = pet.emergency_contact_phone;
  return (
    <main className="min-h-screen min-w-0 overflow-x-clip" style={{ background: "#F3F5F9", color: tokens.ink, fontFamily: font.body }}>
      <style>{`@media print { .no-print { display: none !important; } @page { size: letter; margin: 0.4in; } body { background: #fff !important; } }`}</style>
      <div className="no-print flex flex-wrap justify-center gap-3 py-4 px-4">
        <button onClick={() => window.print()} className="ppg-btn ppg-btn-primary">Print flyer</button>
        <a href={`/id/${pet.public_slug || pet.id}`} className="ppg-btn ppg-btn-secondary">Back</a>
      </div>
      <article className="mx-auto bg-white min-w-0" style={{ width: "min(100%, 8.5in)", minHeight: "11in", border: "1px solid #DCE3EC" }}>
        <div className="text-center py-4 px-4" style={{ background: tokens.primary }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 42, letterSpacing: "0.14em", color: "#fff", lineHeight: 1 }}>LOST</div>
        </div>
        <div className="px-6 py-5 text-center">
          <div className="mx-auto overflow-hidden" style={{ width: "100%", maxWidth: 420, aspectRatio: "1 / 1", background: "#E8EEF7", border: `4px solid ${tokens.navy}` }}>
            {pet.photo_path && !photoFailed ? (
              <img src={`/api/pet-photo/${pet.id}`} onError={() => setPhotoFailed(true)} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} />
            ) : (
              <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={220} /></div>
            )}
          </div>
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 48, lineHeight: 1.05, color: tokens.navy, overflowWrap: "anywhere" }} className="mt-4">{pet.name}</h1>
          <div style={{ fontFamily: font.body, fontSize: 18, fontWeight: 700 }} className="mt-2">
            Last seen {lost.last_seen_area || "—"}{lost.last_seen_date ? ` · ${fmtDate(lost.last_seen_date)}` : ""}
          </div>
          {lost.note ? <div style={{ fontSize: 16, whiteSpace: "pre-wrap" }} className="mt-2">{lost.note}</div> : null}
          {reward ? <div style={{ fontSize: 18, fontWeight: 800, color: tokens.navy }} className="mt-2">Reward: {reward}</div> : null}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-5 text-left">
            <div style={{ width: 148, height: 148, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: qr }} />
            <div className="min-w-0" style={{ maxWidth: 320 }}>
              <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, color: tokens.navy }}>Seen {pet.name}?</div>
              <div style={{ fontSize: 16, fontWeight: 700 }} className="mt-1">Scan the code to message the owner{phone ? <> or call {phone}</> : ""}.</div>
              <div style={{ fontSize: 13, marginTop: 6, overflowWrap: "anywhere" }}>{pageUrl}</div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
