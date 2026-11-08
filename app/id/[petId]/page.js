"use client";

import { useEffect, useState } from "react";
import { tokens, font } from "../../../lib/theme";
import { PetIllustration } from "../../../components/PetIdCard";
import FinderMessageForm from "../../../components/FinderMessageForm";
import ShareButtons from "../../../components/ShareButtons";
import usePublicPet from "../../../lib/usePublicPet";
import PetProfileExperience from "../../../components/PetProfileExperience";
import { fmtDate } from "../../../lib/lost";
import { supabase } from "../../../lib/supabaseClient";
import { SITE_LAUNCHED } from "../../../lib/pricing";
import { lapsedPreview } from "../../../lib/access";
import { Wordmark } from "../../../components/Logo";

function PublicHealth({ petId, petName }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { supabase.rpc("get_public_pet_health", { pet_id: petId }).then(({ data }) => setRows(data || [])); }, [petId]);
  if (!rows.length) return null;
  const icon = { allergy: "⚠️", medication: "💊", vaccine: "💉", note: "📝" };
  return <div className="mt-4 rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${tokens.line}`, fontFamily: font.body }}>
    <div style={{ fontWeight: 700, fontSize: 16, color: tokens.navy }} className="mb-2">Health notes {petName ? `for ${petName}` : ""}</div>
    <div className="space-y-1">{rows.map((r, i) => <div key={i} style={{ fontSize: 14.5, color: tokens.ink }}>{icon[r.kind] || "•"} <b>{r.name}</b>{r.expires_on ? ` · expires ${fmtDate(r.expires_on)}` : ""}</div>)}</div>
    <div style={{ fontSize: 15, color: tokens.ink }} className="mt-2">The owner typed this. PetPassGo did not check it.</div>
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
        <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="ppg-btn ppg-btn-primary mt-4 w-full">
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

function LostBanner({ pet, lost, reward }) {
  const trip = [lost.trip_airline, lost.trip_flight && `flight ${lost.trip_flight}`, lost.trip_destination && `to ${lost.trip_destination}`].filter(Boolean).join(" ");
  return (
    <section className="rounded-3xl overflow-hidden mb-4 min-w-0" style={{ background: "#fff", border: `3px solid ${tokens.primary}` }}>
      <div className="px-4 py-3 text-center" style={{ background: tokens.primary }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 28, letterSpacing: "0.12em", color: "#fff", lineHeight: 1 }}>LOST</div>
      </div>
      <div className="p-4 sm:p-5 grid gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-2xl overflow-hidden flex-shrink-0" style={{ width: 72, height: 72, background: "#E8EEF7" }}><Photo pet={pet} size={72} /></div>
          <div className="min-w-0">
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 28, color: tokens.navy, overflowWrap: "anywhere", lineHeight: 1.05 }}>{pet.name}</div>
            <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: tokens.navy }} className="mt-1">LAST SEEN</div>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.ink, overflowWrap: "anywhere" }}>{lost.last_seen_area || "Area not given"}{lost.last_seen_date ? ` · ${fmtDate(lost.last_seen_date)}` : ""}</div>
          </div>
        </div>
        {trip ? <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>While traveling: {trip}</div> : null}
        {lost.note ? <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink, whiteSpace: "pre-wrap", margin: 0 }}>{lost.note}</p> : null}
        {reward ? (
          <div>
            <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: tokens.navy }}>REWARD</div>
            <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.ink, overflowWrap: "anywhere" }}>{reward}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function PublicPetId({ params }) {
  const { status, pet, lost } = usePublicPet(params.petId);
  const [reward, setReward] = useState("");
  // Owner's membership/trip lapsed (enforced only after launch; ?preview=lapsed pre-launch):
  // show a basic page with name, photo and the message relay instead of the full ID.
  const [basic, setBasic] = useState(false);
  useEffect(() => {
    if (status !== "ok") return;
    if (lapsedPreview()) return setBasic(true);
    if (!SITE_LAUNCHED) return;
    supabase.rpc("pet_owner_has_access", { pet_id: pet.id }).then(({ data }) => setBasic(data === false));
  }, [status, pet?.id]);

  useEffect(() => {
    if (status !== "ok" || !lost || !pet?.id) return;
    supabase.rpc("get_public_lost_reward", { pet_id: pet.id }).then(({ data, error }) => {
      if (error) return;
      const value = Array.isArray(data) ? data[0] : data;
      if (typeof value === "string") setReward(value);
    });
  }, [status, lost, pet?.id]);

  // Log a coarse scan only while the pet is lost (server checks again).
  useEffect(() => {
    if (status !== "ok" || !lost) return;
    const key = `ppg_scan_${pet.id}`;
    if (sessionStorage.getItem(key)) return; // one log per visit
    sessionStorage.setItem(key, "1");
    fetch("/api/pet-scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ petId: pet.id }) }).catch(() => {});
  }, [status, lost, pet?.id]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-14 ppg-fab-clear min-w-0 overflow-x-clip" style={{ background: `linear-gradient(180deg, ${tokens.navy} 0, ${tokens.navy} 220px, ${tokens.sky} 220px)` }}>
      <a href="/" className="mb-6" style={{ textDecoration: "none" }} aria-label="PetPassGo home"><Wordmark size={26} onDark /></a>
      <div className="w-full max-w-3xl">
        {status === "loading" && <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", fontFamily: font.body, color: tokens.muted }}>Loading…</div>}
        {status === "notfound" && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "#fff", fontFamily: font.body, color: tokens.ink }}>
            This Pet ID wasn’t found. Please check the link or QR code.
          </div>
        )}
        {status === "ok" && lost && (
          <>
            <LostBanner pet={pet} lost={lost} reward={reward} />
            <div className="mb-4"><ContactBox pet={pet} /></div>
            <FinderMessageForm petId={pet.id} petName={pet.name} />
            <div className="mt-4"><ShareButtons pet={pet} lost={lost} /></div>
            {!basic && <div className="mt-4"><PetProfileExperience pet={pet} mode="public" /></div>}
            {!basic && <PublicHealth petId={pet.id} petName={pet.name} />}
          </>
        )}
        {status === "ok" && !lost && basic && (
          <div className="rounded-2xl p-7 text-center" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <div className="flex justify-center mb-3">{pet.photo_path ? <div className="rounded-full overflow-hidden" style={{ width: 128, height: 128 }}><Photo pet={pet} size={128} /></div> : <PetIllustration type={pet.animal_type} size={128} />}</div>
            <div style={{ fontFamily: font.display, fontSize: 34, fontWeight: 700, color: tokens.navy }} className="mb-1">{pet.name}</div>
            {pet.passport_no && <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.navy }} className="mb-4">PetPassGo ID {pet.passport_no}</div>}
            <div className="text-left"><FinderMessageForm petId={pet.id} petName={pet.name} /></div>
          </div>
        )}
        {status === "ok" && !lost && !basic && (
          <>
            <PetProfileExperience pet={pet} mode="public" />
            <div className="mt-4"><FinderMessageForm petId={pet.id} petName={pet.name} /></div>
          </>
        )}
        {status === "ok" && <p className="text-center mt-6" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>Digital Pet ID by <a href="/" style={{ color: tokens.navy }}>PetPassGo</a></p>}
      </div>
    </main>
  );
}
