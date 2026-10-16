"use client";

import { useEffect, useState } from "react";
import { tokens, font } from "../../../lib/theme";
import PetIdCard, { PetIllustration } from "../../../components/PetIdCard";
import FinderMessageForm from "../../../components/FinderMessageForm";
import ShareButtons from "../../../components/ShareButtons";
import usePublicPet from "../../../lib/usePublicPet";
import { fmtDate } from "../../../lib/lost";
import { supabase } from "../../../lib/supabaseClient";
import { SITE_LAUNCHED } from "../../../lib/pricing";
import { lapsedPreview } from "../../../lib/access";

function PublicHealth({ petId, petName }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { supabase.rpc("get_public_pet_health", { pet_id: petId }).then(({ data }) => setRows(data || [])); }, [petId]);
  if (!rows.length) return null;
  const icon = { allergy: "⚠️", medication: "💊", vaccine: "💉", note: "📝" };
  return <div className="mt-4 rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body }}>
    <div style={{ fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Health notes {petName ? `for ${petName}` : ""}</div>
    <div className="space-y-1">{rows.map((r, i) => <div key={i} style={{ fontSize: 14.5, color: tokens.ink }}>{icon[r.kind] || "•"} <b>{r.name}</b>{r.expires_on ? ` · expires ${fmtDate(r.expires_on)}` : ""}</div>)}</div>
    <div style={{ fontSize: 12.5, color: tokens.muted }} className="mt-2">Owner-entered and shared by the owner. Not verified by PetPassGo.</div>
  </div>;
}

function ChipLine({ pet }) {
  if (!pet.microchipped) return null;
  return <div className="mt-4 rounded-2xl p-4 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>🔖 <b>Microchipped.</b> Any vet or shelter can scan the chip for free. The registry contacts the owner — PetPassGo never shows the chip number.</div>;
}

function ScanHonesty({ lostMode }) {
  return <div className="mt-4 rounded-2xl p-4" style={{ background: "#FFF9EC", border: `1px solid ${tokens.line}`, fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>
    {lostMode ? <>🐾 <b>Found this pet?</b> Message the owner below. Opening this page while lost mode is on can alert the owner through PetPassGo right away. A vet scanning the implanted chip contacts the chip registry instead — PetPassGo can't see chip scans, and chips have no GPS.</> : <>Message the owner below if you found this pet. If they're ever marked lost here, opening this page can alert the owner through PetPassGo. A vet scanning an implanted chip contacts the chip registry — chips have no GPS.</>}
  </div>;
}

function ContactBox({ pet }) {
  const phone = pet.emergency_contact_phone;
  if (!pet.emergency_contact_name && !phone) return null;
  return (
    <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", border: `2px solid ${tokens.primary}` }}>
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", color: tokens.primary }} className="mb-2">FOUND THIS PET? PLEASE CONTACT</div>
      {pet.emergency_contact_name && <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: tokens.navy }}>{pet.emergency_contact_name}</div>}
      {phone && (
        <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="btn-primary rounded-full px-6 py-3.5 mt-4 block" style={{ background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
          Call {phone}
        </a>
      )}
    </div>
  );
}

function Photo({ pet, size }) {
  const [failed, setFailed] = useState(false);
  return pet.photo_path && !failed ? (
    <img src={`/api/pet-photo/${pet.id}`} onError={() => setFailed(true)} alt={pet.name} className="object-cover" style={{ width: "100%", height: "100%" }} />
  ) : (
    <div className="flex items-center justify-center" style={{ width: "100%", height: "100%", background: "#E8EEF7" }}><PetIllustration type={pet.animal_type} size={size} /></div>
  );
}

function LostPoster({ pet, lost }) {
  const what = [pet.breed, pet.animal_type].filter(Boolean).join(" · ");
  const trip = [lost.trip_airline, lost.trip_flight && `flight ${lost.trip_flight}`, lost.trip_destination && `to ${lost.trip_destination}`].filter(Boolean).join(" ");
  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `3px solid ${tokens.primary}`, boxShadow: "0 10px 30px rgba(20,33,61,0.12)" }}>
        <div className="text-center py-3" style={{ background: tokens.primary }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 40, letterSpacing: "0.08em", color: "#fff", lineHeight: 1 }}>LOST {(pet.animal_type || "PET").toUpperCase()}</div>
        </div>
        <div style={{ aspectRatio: "4 / 3", background: "#E8EEF7" }}><Photo pet={pet} size={200} /></div>
        <div className="p-6 text-center">
          <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: 40, color: tokens.navy, lineHeight: 1.05 }}>{pet.name}</h1>
          {what && <div style={{ fontFamily: font.body, fontWeight: 600, fontSize: 18, color: tokens.ink }} className="mt-1">{what}</div>}
          <div className="mt-4 rounded-xl p-4" style={{ background: tokens.sky, fontFamily: font.body, fontSize: 16, color: tokens.ink }}>
            <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", color: tokens.muted }}>LAST SEEN</div>
            <div style={{ fontWeight: 700, fontSize: 19, color: tokens.navy }}>{lost.last_seen_area || "Area not given"}</div>
            {lost.last_seen_date && <div>{fmtDate(lost.last_seen_date)}</div>}
            {trip && <div className="mt-1" style={{ color: tokens.muted }}>While traveling: {trip}</div>}
          </div>
          {lost.note && <p className="mt-4 text-left" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.55, color: tokens.ink, whiteSpace: "pre-wrap" }}>{lost.note}</p>}
        </div>
      </div>
      <div className="mt-4"><ContactBox pet={pet} /></div>
      <div className="mt-4"><ScanHonesty lostMode /></div>
      <div className="mt-4"><ChipLine pet={pet} /></div>
      <PublicHealth petId={pet.id} petName={pet.name} />
      <div className="mt-4"><FinderMessageForm petId={pet.id} petName={pet.name} /></div>
      <div className="mt-4 rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }} className="mb-3">Help {pet.name} get home: share this page</div>
        <ShareButtons pet={pet} lost={lost} />
      </div>
    </>
  );
}

export default function PublicPetId({ params }) {
  const { status, pet, lost } = usePublicPet(params.petId);
  // Owner's membership/trip lapsed (enforced only after launch; ?preview=lapsed pre-launch):
  // show a basic page with name, photo and the message relay instead of the full ID.
  const [basic, setBasic] = useState(false);
  useEffect(() => {
    if (status !== "ok") return;
    if (lapsedPreview()) return setBasic(true);
    if (!SITE_LAUNCHED) return;
    supabase.rpc("pet_owner_has_access", { pet_id: pet.id }).then(({ data }) => setBasic(data === false));
  }, [status, pet?.id]);

  // Log a coarse scan only while the pet is lost (server checks again).
  useEffect(() => {
    if (status !== "ok" || !lost) return;
    const key = `ppg_scan_${pet.id}`;
    if (sessionStorage.getItem(key)) return; // one log per visit
    sessionStorage.setItem(key, "1");
    fetch("/api/pet-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ petId: pet.id }) }).catch(() => {});
  }, [status, lost, pet?.id]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-14" style={{ background: `linear-gradient(180deg, ${tokens.navy} 0, ${tokens.navy} 220px, ${tokens.sky} 220px)` }}>
      <a href="/" className="mb-6" style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: "#fff", textDecoration: "none" }}>PetPassGo</a>
      <div className="w-full max-w-md">
        {status === "loading" && <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", fontFamily: font.body, color: tokens.muted }}>Loading…</div>}
        {status === "notfound" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", fontFamily: font.body, color: tokens.ink }}>
            This Pet ID wasn’t found. Please check the link or QR code.
          </div>
        )}
        {status === "ok" && lost && <LostPoster pet={pet} lost={lost} />}
        {status === "ok" && !lost && basic && (
          <div className="rounded-2xl p-7 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div className="flex justify-center mb-3">{pet.photo_path ? <Photo pet={pet} size={128} /> : <PetIllustration type={pet.animal_type} size={128} />}</div>
            <div style={{ fontFamily: font.display, fontSize: 34, fontWeight: 700, color: tokens.navy }} className="mb-1">{pet.name}</div>
            <p style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.muted }} className="mb-5">Found this pet, or need to reach the owner? Send a message. Your note goes straight to them.</p>
            <div className="text-left"><ScanHonesty lostMode={false} /><div className="mt-4"><FinderMessageForm petId={pet.id} petName={pet.name} /></div></div>
          </div>
        )}
        {status === "ok" && !lost && !basic && (
          <>
            <PetIdCard pet={pet} showQr={false} photo={pet.photo_path ? <Photo pet={pet} size={104} /> : null} />
            <ChipLine pet={pet} />
            <PublicHealth petId={pet.id} petName={pet.name} />
            <ScanHonesty lostMode={false} />
            <div className="mt-4">
              {pet.emergency_contact_name || pet.emergency_contact_phone ? <ContactBox pet={pet} /> : <FinderMessageForm petId={pet.id} petName={pet.name} />}
            </div>
          </>
        )}
        {status === "ok" && <p className="text-center mt-6" style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Digital Pet ID by <a href="/" style={{ color: tokens.navy, fontWeight: 600 }}>PetPassGo</a></p>}
      </div>
    </main>
  );
}
