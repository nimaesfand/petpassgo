"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { tokens, font } from "../../../../lib/theme";
import { PetIllustration } from "../../../../components/PetIdCard";
import usePublicPet from "../../../../lib/usePublicPet";
import { fmtDate, publicIdUrl } from "../../../../lib/lost";

export default function Flyer({ params }) {
  const { status, pet, lost } = usePublicPet(params.petId);
  const [qr, setQr] = useState("");
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => {
    if (pet) QRCode.toString(publicIdUrl(pet.id), { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }).then(setQr);
  }, [pet]);

  if (status === "loading") return <p className="p-10" style={{ fontFamily: font.body }}>Loading…</p>;
  if (status !== "ok") return <p className="p-10" style={{ fontFamily: font.body }}>This Pet ID wasn’t found.</p>;
  if (!lost) return <p className="p-10" style={{ fontFamily: font.body }}>{pet.name} isn’t reported lost, so there’s no flyer to print. <a href={`/id/${pet.id}`} style={{ textDecoration: "underline" }}>Back to Pet ID</a></p>;

  const what = [pet.breed, pet.animal_type].filter(Boolean).join(" · ");
  return (
    <main style={{ background: "#fff", color: "#000", fontFamily: font.body }} className="min-h-screen">
      <style>{`@media print { .no-print { display: none !important; } @page { size: letter; margin: 0.4in; } body { background: #fff; } }`}</style>
      <div className="no-print flex justify-center gap-3 py-4" style={{ background: tokens.sky }}>
        <button onClick={() => window.print()} className="btn-primary rounded-full px-6 py-2.5" style={{ background: tokens.primary, color: "#fff", fontWeight: 700 }}>Print flyer</button>
        <a href={`/id/${pet.id}`} className="rounded-full px-6 py-2.5" style={{ border: `1.5px solid ${tokens.line}`, color: tokens.navy, fontWeight: 600, textDecoration: "none", background: "#fff" }}>Back</a>
      </div>
      <div className="mx-auto text-center px-6 py-6" style={{ maxWidth: 760 }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 88, lineHeight: 1, color: tokens.primary, letterSpacing: "0.04em" }}>LOST {(pet.animal_type || "PET").toUpperCase()}</div>
        <div className="mx-auto mt-5 overflow-hidden rounded-2xl" style={{ width: "100%", maxWidth: 560, aspectRatio: "4 / 3", border: "4px solid #000", background: "#E8EEF7" }}>
          {pet.photo_path && !photoFailed ? (
            <img src={`/api/pet-photo/${pet.id}`} onError={() => setPhotoFailed(true)} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} />
          ) : (
            <div className="flex items-center justify-center h-full"><PetIllustration type={pet.animal_type} size={260} /></div>
          )}
        </div>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 64, lineHeight: 1.05 }} className="mt-4">{pet.name}</div>
        {what && <div style={{ fontSize: 26, fontWeight: 600 }}>{what}</div>}
        <div style={{ fontSize: 24 }} className="mt-3">
          Last seen <b>{lost.last_seen_area || "—"}</b>{lost.last_seen_date ? <> on <b>{fmtDate(lost.last_seen_date)}</b></> : null}
        </div>
        {lost.note && <div style={{ fontSize: 18, whiteSpace: "pre-wrap" }} className="mt-2">{lost.note}</div>}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div style={{ width: 170, height: 170 }} dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="text-left" style={{ maxWidth: 340 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Seen {pet.name}?</div>
            <div style={{ fontSize: 18 }}>Scan the code to message the owner{pet.emergency_contact_phone ? <> or call <b>{pet.emergency_contact_phone}</b></> : ""}.</div>
            <div style={{ fontSize: 13, marginTop: 6, wordBreak: "break-all" }}>{publicIdUrl(pet.id)}</div>
          </div>
        </div>
        <div style={{ fontSize: 13 }} className="mt-6">Digital Pet ID by PetPassGo</div>
      </div>
    </main>
  );
}
