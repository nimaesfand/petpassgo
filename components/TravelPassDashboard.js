"use client";

import VerdictCard from "./VerdictCard";
import { tripVerdict, tripFacts } from "../lib/verdict";
import PassHome from "./pass/PassHome";
import StepsTools from "./pass/StepsTools";
import { tripFitWarnings } from "../lib/tripFit";

import { useEffect, useMemo, useState } from "react";
import TripFitCard from "./TripFitCard";
import Icon from "./Icon";
import { tokens, font } from "../lib/theme";
import { findAirport, tripTypeForRoute } from "../lib/airports";
import { fmtTripDate } from "../lib/tripAccess";
import { fmtTime, LiveFlightCard } from "./FlightLookup";
import { SignedImg, getSignedUrl } from "../lib/storage";
import { cardDone, groupCards, isServiceRole, passProgress } from "../lib/passCards";
import { passReady, segmentPlans } from "../lib/segments";
import { reminderSchedule, classifyReminder, fmt } from "../lib/travelDates";
import { useTodayPT } from "../lib/useTodayPT";
import { supabase } from "../lib/supabaseClient";
import { PET_RELIEF } from "../lib/petRelief";
import PassChecklist from "./PassChecklist";
import TripTimeline from "./TripTimeline";
import VetGuidance from "./VetGuidance";
import RoundTripAddon from "./RoundTripAddon";
import DocCheck from "./DocCheck";
import ServiceAnimalTrack from "./ServiceAnimalTrack";
import { PASS_TAB_LIST, PassTabs, RouteLine, SoftCard, StatusChip, TextButton } from "./travelPassUi";
import { isTravelDay, PetReliefCard, TripExtras, useTripExtras, precipLine, wxIcon, wxWord } from "./TripLive";

function codeOf(label) {
  return findAirport(label)?.code || String(label || "").slice(0, 3).toUpperCase();
}

function weightText(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return null;
  return `${Number.isInteger(x) ? x : Math.round(x * 10) / 10} lb`;
}

function durationLabel(snapshot) {
  const dep = snapshot?.departure?.estimated || snapshot?.departure?.scheduled;
  const arr = snapshot?.arrival?.estimated || snapshot?.arrival?.scheduled;
  if (!dep || !arr) return null;
  const ms = new Date(arr) - new Date(dep);
  if (!Number.isFinite(ms) || ms < 20 * 60000 || ms > 24 * 3600000) return null;
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function nonstopLabel(trip, snapshot) {
  const o = findAirport(trip.origin)?.code;
  const d = findAirport(trip.destination)?.code;
  const from = (snapshot?.departure?.iata || "").toUpperCase();
  const to = (snapshot?.arrival?.iata || "").toUpperCase();
  if (!o || !d || !from || !to) return null;
  return from === o && to === d ? "Nonstop" : null;
}

function statusOf(snapshot) {
  if (!snapshot?.flight_status && snapshot?.departure?.delay == null && snapshot?.arrival?.delay == null) return null;
  const s = String(snapshot?.flight_status || "").toLowerCase();
  const delay = snapshot?.departure?.delay || snapshot?.arrival?.delay;
  if (s === "cancelled" || s === "canceled") return { label: "Cancelled", tone: "bad" };
  if (s === "landed" || s === "arrived") return { label: "Landed", tone: "ok" };
  if (delay) return { label: `Delayed ${delay} min`, tone: "warn" };
  if (s === "scheduled" || s === "active" || s === "en-route") return { label: "On schedule", tone: "ok" };
  if (!s) return null;
  return { label: s.charAt(0).toUpperCase() + s.slice(1), tone: "neutral" };
}

function countKind(list, kind) {
  return (list || []).filter((s) => (kind === "vet" ? s.type === "vet" || s.type === "emergency_vet" : s.type === kind)).length;
}

function CheckDot({ on }) {
  return (
    <span aria-hidden className="flex items-center justify-center flex-shrink-0 rounded-full" style={{ width: 28, height: 28, background: on ? "#EAF6EE" : tokens.sky, color: on ? tokens.green : tokens.muted }}>
      <Icon name={on ? "check" : "clock"} size={16} />
    </span>
  );
}

export default function TravelPassDashboard({ trip, pet, petChoices = [], onPickPet, onSetRolePet, results = [], statusMap = {}, onSetDone, onSaveReturn, isMember }) {
  const [section, setSection] = useState("overview");
  const [focusStep, setFocusStep] = useState(null);
  const [docs, setDocs] = useState(null);
  const [health, setHealth] = useState(null);
  const pack = useTripExtras(trip?.id);
  const today = useTodayPT();
  const tripWithPet = useMemo(() => ({ ...trip, pet }), [trip, pet]);
  const plans = useMemo(() => segmentPlans(results, tripWithPet), [results, tripWithPet]);
  const cards = useMemo(() => plans.flatMap((plan) => plan.cards), [plans]);
  const groups = useMemo(() => groupCards(cards, statusMap), [cards, statusMap]);
  const progress = passProgress(groups);
  const ready = passReady(progress, plans);
  const needsCheck = plans.some((plan) => !plan.resolved);
  const snapshot = trip?.flight_snapshot || null;
  const from = codeOf(trip.origin);
  const to = codeOf(trip.destination);
  const nonstop = nonstopLabel(trip, snapshot);
  const duration = durationLabel(snapshot);
  const flightStatus = statusOf(snapshot);
  const when = snapshot?.departure?.scheduled
    ? fmtTime(snapshot.departure.estimated || snapshot.departure.scheduled, snapshot.departure.timezone)
    : (trip.travel_date ? fmtTripDate(trip.travel_date) : "Date not set");
  const service = isServiceRole(trip.role);
  const serviceDogMismatch = service && trip.animal_type && !/dog/i.test(trip.animal_type);
  const animal = pet?.animal_type || trip.animal_type || "Pet";
  const meta = [pet?.breed, weightText(pet?.weight_lb)].filter(Boolean).join(" · ");
  const openSteps = [...groups.first, ...groups.general];
  const shownSteps = [...groups.done, ...openSteps].slice(0, 4);
  const reminders = reminderSchedule(trip, today).map((it) => ({ ...it, ...classifyReminder(it, trip, { today }) })).filter((r) => r.state !== "passed" && r.state !== "done");
  const expirations = [
    ...(health || []).filter((h) => h.expires_on).map((h) => ({ key: `h-${h.id}`, title: h.name, date: h.expires_on, icon: "health" })),
    ...(docs || []).filter((d) => d.expires_on).map((d) => ({ key: `d-${d.id}`, title: d.document_type, date: d.expires_on, icon: "file" })),
  ].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const vaxOn = (health || []).some((h) => h.kind === "vaccine" || /vaccin|rabies/i.test(h.name || "")) || (docs || []).some((d) => /vaccin|rabies/i.test(d.document_type || ""));
  const dotOn = (docs || []).some((d) => /dot|service animal/i.test(d.document_type || ""));
  const destWeather = pack.weather?.destination?.weather;
  const hot = [pack.weather?.origin?.weather, destWeather].some((w) => w?.status === "ok" && w.highF >= 85);
  const cold = [pack.weather?.origin?.weather, destWeather].some((w) => w?.status === "ok" && w.lowF <= 45);
  const originAirport = findAirport(trip.origin);
  const daysToGo = trip.travel_date ? Math.round((new Date(`${String(trip.travel_date).slice(0, 10)}T12:00:00`) - new Date(`${today}T12:00:00`)) / 864e5) : null;
  const facts = (() => {
    const f = tripFacts(results, trip);
    if (f.fee && trip.return_date && /each way/i.test(f.fee)) {
      const n = Number((f.fee.match(/\$(\d+(?:\.\d+)?)/) || [])[1]);
      if (n) f.fee = `${f.fee.replace(/\s*\(.*\)$/, "")} · $${Math.round(n * 2)} round trip`;
    }
    return f;
  })();

  useEffect(() => {
    if (!trip?.id) return;
    let q = supabase.from("documents").select("id,document_type,file_url,expires_on,pet_id,trip_id");
    q = pet?.id ? q.or(`pet_id.eq.${pet.id},trip_id.eq.${trip.id}`) : q.eq("trip_id", trip.id);
    q.then(({ data }) => setDocs(data || []));
    if (pet?.id) supabase.from("pet_health_records").select("id,kind,name,expires_on").eq("pet_id", pet.id).then(({ data }) => setHealth(data || []));
    else setHealth([]);
  }, [trip?.id, pet?.id]);

  async function openDoc(d) {
    const url = await getSignedUrl(d.file_url);
    if (url) window.open(url, "_blank", "noopener");
  }

  const travelSteps = [
    `Give ${pet?.name || "your pet"} a last walk and a small meal early`,
    "Leave extra time. Many airlines check pets in at the counter",
    originAirport && PET_RELIEF[originAirport.code] ? "Use a pet relief area before security. It is listed under Flight & Weather." : "Look for a pet relief area before security if the airport has one",
    "At security, carry your pet through the scanner. The empty carrier goes through the X-ray",
    "Keep documents open on your phone",
  ];

  return (
    <div>
      {isTravelDay(trip) && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 700, color: tokens.navy }}>{pet?.name || "Your pet"} flies today</div>
          <ol className="mt-3 space-y-2">
            {travelSteps.map((s, i) => (
              <li key={s} className="flex gap-3" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>
                <span className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, background: tokens.gold, color: tokens.navy, fontWeight: 700 }}>{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {(() => {
        if (!results.length) return null;
        if (needsCheck) return <VerdictCard verdict={{ key: "check", title: "A flight still needs checking", text: "We don't have a verified requirement for every flight on this trip." }} />;
        const v = tripVerdict({ rows: results, trip: { ...trip, petName: pet?.name || "your pet" }, fitWarnings: tripFitWarnings(trip), stepCount: progress.total - progress.done });
        return v && v.key !== "go" ? <VerdictCard verdict={v} /> : null;
      })()}
      <div className="rounded-3xl p-5 sm:p-6 mb-4" style={{ background: tokens.navy }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 52, height: 52, background: tokens.gold, border: "2px solid #fff" }}>
              {pet?.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name || "Pet"} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <span style={{ color: tokens.navy }}><Icon name="paw" size={24} /></span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate" style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>{pet?.name || "Your pet"} · {codeOf(trip.origin)} → {codeOf(trip.destination)}</div>
              <div className="truncate" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.sky }}>{trip.travel_date ? fmtTripDate(trip.travel_date) : "Date not set"}{trip.return_date ? ` · back ${fmtTripDate(trip.return_date)}` : ""} · {trip.airline}{service && !serviceDogMismatch ? " · Service dog" : ""}</div>
            </div>
            {daysToGo != null && daysToGo >= 0 ? (
              <div className="flex-shrink-0 text-center rounded-2xl px-3 py-1.5" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, color: tokens.gold, lineHeight: 1 }}>{daysToGo}</div>
                <div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 700, color: tokens.sky }}>{daysToGo === 1 ? "day" : "days"}</div>
              </div>
            ) : null}
          </div>
        </div>
        {!trip.pet_id && petChoices.length > 1 && (
          <label className="block mt-4" style={{ fontFamily: font.body, fontSize: 16, color: "#fff" }}>
            Which pet is flying?
            <select className="mt-1 w-full rounded-xl px-3 py-3" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, background: "#fff", border: `2px solid ${tokens.line}` }} defaultValue="" onChange={(e) => e.target.value && onPickPet?.(e.target.value)}>
              <option value="">Choose a pet</option>
              {petChoices.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        )}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.sky }}>Trip readiness</span>
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: "#fff" }}>{needsCheck ? "A flight still needs checking" : progress.total ? (ready ? "Travel Pass complete" : `${progress.done} of ${progress.total} steps complete`) : "Checklist coming up"}</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.pct}%`, background: "#7DCEA0" }} />
          </div>
        </div>

      </div>

      <PassTabs tabs={PASS_TAB_LIST} value={section} onChange={setSection} label="Trip sections" />

      {section === "overview" && (
        <PassHome
          facts={facts}
          progress={progress}
          ready={ready}
          needsCheck={needsCheck}
          nextStep={openSteps[0] || null}
          today={today}
          petName={pet?.name}
          onGo={setSection}
          onOpenStep={(step) => { setFocusStep(step.id); setSection("checklist"); }}
          onDone={(step) => onSetDone?.(step.mergedIds?.length ? step.mergedIds : [step.id], true)}
          shortcuts={[
            { icon: "plane", label: "Flight", sub: flightStatus?.label || (trip.flight_number ? trip.flight_number : "Add flight #"), onClick: () => setSection("flight") },
            { icon: "cloudSun", label: "Weather", sub: destWeather?.status === "ok" ? `${destWeather.tempF ?? destWeather.highF}° ${to}` : "Closer to trip", onClick: () => setSection("flight") },
            { icon: "stethoscope", label: "Vets", sub: countKind(pack.spots, "vet") ? `${countKind(pack.spots, "vet")} near ${to}` : `Near ${to}`, onClick: () => setSection("destination") },
            { icon: "file", label: "Docs", sub: service ? (dotOn ? "DOT form ✓" : "DOT form") : vaxOn ? "Vaccines ✓" : "Add vaccines", onClick: () => setSection("documents") },
          ]}
        />
      )}

      {section === "flight" && (
        <>
          <LiveFlightCard trip={trip} />
          <TripExtras trip={trip} pet={pet} pack={pack} showSpots={false} />
          <div id="pet-relief">
            <PetReliefCard airportLabel={trip.origin} />
            <PetReliefCard airportLabel={trip.destination} title="When you land: pet relief" />
          </div>
          <DocCheck trip={trip} />
        </>
      )}

      {section === "checklist" && (
        <>
          {serviceDogMismatch && (
            <div className="rounded-2xl p-4 mb-4" style={{ background: "#FFF7F2", border: `1px solid ${tokens.primary}` }}>
              <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">U.S. service animals are dogs</div>
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink, lineHeight: 1.45 }} className="mb-3">A psychiatric service dog is a service dog. Cats, other animals, and emotional support animals fly as pets. PetPassGo does not decide service-animal status. That is what you tell us, and what the airline accepts.</p>
              <button type="button" onClick={onSetRolePet} className="ppg-btn ppg-btn-primary">Switch this trip to the pet path</button>
            </div>
          )}
          {tripFitWarnings(trip).some((w) => w.level === "stop") ? <TripFitCard answers={trip} className="mb-4" /> : null}
          {cards.length === 0 ? (
            <div className="rounded-xl p-5 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 16, color: tokens.ink }}>No requirements found for this exact combination yet.</div>
          ) : (
            <PassChecklist trip={tripWithPet} requirements={results} statusMap={statusMap} onSetDone={onSetDone} focusId={focusStep} onOpenRelief={() => { setSection("flight"); setTimeout(() => document.getElementById("pet-relief")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }} />
          )}
          <div className="mt-6"><StepsTools trip={trip} pet={pet} facts={facts} service={service} steps={openSteps} /></div>
          <div className="mt-2"><RoundTripAddon trip={trip} onSave={onSaveReturn} /></div>
          <details className="ppg-fold group rounded-2xl mt-3" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
            <summary className="flex items-center gap-3 px-4 py-3.5" style={{ cursor: "pointer", listStyle: "none" }}>
              <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: tokens.sky, color: tokens.navy }}><Icon name="stethoscope" size={19} /></span>
              <span className="flex-1" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>Before your vet visit</span>
              <span style={{ fontFamily: font.body, fontSize: 18, color: tokens.muted }}>›</span>
            </summary>
            <div className="ppg-fold-body px-4 pb-4"><VetGuidance trip={trip} requirements={[...results, ...cards.filter((c) => String(c.id).startsWith("syn:"))]} paid /></div>
          </details>
        </>
      )}

      {section === "checklist" && (
        <details className="ppg-fold group rounded-2xl mt-4" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <summary className="flex items-center gap-3 px-4 py-3.5" style={{ cursor: "pointer", listStyle: "none" }}>
            <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: tokens.sky, color: tokens.navy }}><Icon name="calendar" size={19} /></span>
            <span className="flex-1" style={{ fontFamily: font.body, fontWeight: 800, fontSize: 16, color: tokens.navy }}>Reminder dates{expirations.length ? " and expirations" : ""}</span>
            <span style={{ fontFamily: font.body, fontSize: 18, color: tokens.muted }}>›</span>
          </summary>
          <div className="ppg-fold-body px-4 pb-4">
          <TripTimeline trip={trip} requirements={results} statusMap={statusMap} />
          {expirations.length > 0 && (
            <SoftCard title="Vault expirations">
              <ul className="space-y-2">
                {expirations.map((r) => (
                  <li key={r.key} className="flex items-center justify-between gap-3">
                    <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{r.title}</span>
                    <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }}>{fmt(r.date)}</span>
                  </li>
                ))}
              </ul>
            </SoftCard>
          )}
</div>
        </details>
      )}

      {section === "documents" && (
        <div className="space-y-3">
          <SoftCard title="Pet ID">
            <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }}>The Pet ID page is the one a finder or gate agent can open. PetPassGo does not verify service-animal status.</p>
            {pet?.passport_no && <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }} className="mt-2">PetPassGo ID {pet.passport_no}</p>}
            {pet?.id && <div className="mt-3"><a href={`/id/${pet.id}`} className="ppg-btn ppg-btn-primary">View your Pet ID</a></div>}
          </SoftCard>
          <SoftCard title="Vaccination records">
            {(health || []).length === 0 && (docs || []).filter((d) => /vaccin|rabies|health/i.test(d.document_type || "")).length === 0 && (
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>None saved yet. Add them in Pet Vault and they show up here.</p>
            )}
            <ul className="space-y-2">
              {(health || []).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3" style={{ background: tokens.paper }}>
                  <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{h.name}</span>
                  <span className="inline-flex rounded-full px-2.5 py-1" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>{h.expires_on ? `Expires ${fmt(h.expires_on)}` : h.kind}</span>
                </li>
              ))}
              {(docs || []).filter((d) => /vaccin|rabies|health/i.test(d.document_type || "")).map((d) => (
                <li key={d.id}><button type="button" onClick={() => openDoc(d)} className="w-full text-left rounded-xl px-3 py-3" style={{ background: tokens.paper, border: "none", cursor: "pointer", fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy, minHeight: 48 }}>{d.document_type}</button></li>
              ))}
            </ul>
          </SoftCard>
          <div id="dot-form">
            {service ? <ServiceAnimalTrack trip={trip} /> : (
              <SoftCard title="DOT form">
                <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }}>The DOT service animal form is for a trip you marked as a service dog. You fill it in and sign it. PetPassGo does not attest for you.</p>
              </SoftCard>
            )}
          </div>
          <SoftCard title="Travel Pass summary">
            <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: tokens.ink }}>{pet?.name || "Your pet"} · {from} to {to}{trip.travel_date ? ` · ${fmtTripDate(trip.travel_date)}` : ""} · {trip.airline}. {progress.total ? `${progress.done} of ${progress.total} checklist steps complete.` : ""}</p>
          </SoftCard>
          {(docs || []).length > 0 && (
            <SoftCard title="Files on this pass">
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}><button type="button" onClick={() => openDoc(d)} className="w-full text-left rounded-xl px-3 py-3 flex items-center justify-between" style={{ background: tokens.paper, border: "none", cursor: "pointer", minHeight: 48 }}>
                    <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{d.document_type || "Document"}</span>
                    <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.navy }}>Open</span>
                  </button></li>
                ))}
              </ul>
            </SoftCard>
          )}
        </div>
      )}

      {section === "destination" && (
        <>
          <TripExtras trip={trip} pet={pet} pack={pack} showWeather={false} />
          <div id="pet-relief-dest">
            <PetReliefCard airportLabel={trip.destination} title="When you land: pet relief" />
          </div>
        </>
      )}
    </div>
  );
}

function DocTile({ label, on, hint, onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl p-3 text-left" style={{ background: tokens.paper, border: "none", cursor: "pointer", minHeight: 88 }}>
      <CheckDot on={on} />
      <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }} className="mt-2">{label}</div>
      {hint && <div style={{ fontFamily: font.body, fontSize: 14, color: tokens.muted }}>{hint}</div>}
    </button>
  );
}
