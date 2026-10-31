"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { tokens, font } from "../lib/theme";
import { findAirport, tripTypeForRoute } from "../lib/airports";
import { fmtTripDate } from "../lib/tripAccess";
import { fmtTime, LiveFlightCard } from "./FlightLookup";
import { SignedImg, getSignedUrl } from "../lib/storage";
import { buildPassCards, cardDone, groupCards, isServiceRole, passProgress } from "../lib/passCards";
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
  const [docs, setDocs] = useState(null);
  const [health, setHealth] = useState(null);
  const pack = useTripExtras(trip?.id);
  const today = useTodayPT();
  const cards = useMemo(() => buildPassCards(results, { ...trip, pet }), [results, trip, pet]);
  const groups = useMemo(() => groupCards(cards, statusMap), [cards, statusMap]);
  const progress = passProgress(groups);
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

      <div className="rounded-3xl p-5 sm:p-6 mb-4" style={{ background: tokens.navy }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 72, height: 72, background: tokens.gold, border: "3px solid #fff" }}>
              {pet?.photo_url ? <SignedImg value={pet.photo_url} alt={pet.name || "Pet"} className="object-cover" style={{ width: "100%", height: "100%" }} /> : <span style={{ color: tokens.navy }}><Icon name="paw" size={32} /></span>}
            </div>
            <div className="min-w-0">
              <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: tokens.gold }}>YOUR TRIP</div>
              <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>{pet?.name || "Your trip"}</div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {meta && <span style={{ fontFamily: font.body, fontSize: 16, color: tokens.sky }}>{meta}</span>}
                <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>{animal}</span>
                {service && !serviceDogMismatch && <span className="rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 15 }}>Service dog</span>}
                {pet?.passport_no && <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.sky }}>{pet.passport_no}</span>}
              </div>
            </div>
          </div>
          <div className="lg:text-right">
            <div style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: "#fff" }}>{trip.travel_date ? fmtTripDate(trip.travel_date) : "Date not set"}{trip.return_date ? ` · back ${fmtTripDate(trip.return_date)}` : ""}</div>
            <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.sky }}>{from} to {to}{[nonstop, duration].filter(Boolean).length ? ` · ${[nonstop, duration].filter(Boolean).join(" · ")}` : ""}{tripTypeForRoute(trip.origin, trip.destination) === "international" ? " · International" : ""}</div>
            <div style={{ fontFamily: font.body, fontSize: 15, color: tokens.sky }}>{trip.airline}</div>
          </div>
        </div>
        {!trip.pet_id && petChoices.length > 1 && (
          <label className="block mt-4" style={{ fontFamily: font.body, fontSize: 16, color: "#fff" }}>
            Which pet is flying?
            <select className="mt-1 w-full rounded-xl px-3 py-3" style={{ fontFamily: font.body, fontSize: 16, color: tokens.navy }} defaultValue="" onChange={(e) => e.target.value && onPickPet?.(e.target.value)}>
              <option value="">Choose a pet</option>
              {petChoices.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        )}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.sky }}>Trip readiness</span>
            <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: "#fff" }}>{progress.total ? (progress.complete ? "Travel Pass complete" : `${progress.done} of ${progress.total} steps complete`) : "Checklist coming up"}</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.18)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.pct}%`, background: "#7DCEA0" }} />
          </div>
        </div>
        {pet?.id ? (
          <a href={`/id/${pet.id}`} className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-3 w-full sm:w-auto" style={{ background: "#fff", color: tokens.navy, fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none", minHeight: 48 }}>View your Pet ID</a>
        ) : (
          <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.sky }} className="mt-3">Link a pet and the Pet ID opens from here.</p>
        )}
      </div>

      <PassTabs tabs={PASS_TAB_LIST} value={section} onChange={setSection} label="Trip sections" />

      {section === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SoftCard title="Flight status" action={flightStatus ? <StatusChip tone={flightStatus.tone}>{flightStatus.label}</StatusChip> : null}>
            <RouteLine from={from} to={to} />
            <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-3">{[when, nonstop, duration].filter(Boolean).join(" · ")}</p>
            {!snapshot && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-1">Add a flight number to see live status, terminal, and gate.</p>}
            <div className="mt-3"><TextButton onClick={() => setSection("flight")}>View full flight details</TextButton></div>
          </SoftCard>

          <SoftCard title="Weather">
            {!pack.weather && <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>Checking the weather…</p>}
            {pack.weather?.failed && <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>Weather isn’t available right now.</p>}
            {destWeather?.status === "ok" && (
              <>
                <div className="flex items-center gap-3">
                  <span style={{ color: tokens.navy }}><Icon name={wxIcon(destWeather.symbol)} size={36} /></span>
                  <div>
                    <div style={{ fontFamily: font.display, fontSize: 32, fontWeight: 700, color: tokens.navy, lineHeight: 1 }}>{destWeather.tempF ?? destWeather.highF}°</div>
                    <div style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{pack.weather.destination.city} · {wxWord(destWeather.symbol)}</div>
                  </div>
                </div>
                <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }} className="mt-2">High {destWeather.highF}° · Low {destWeather.lowF}°{destWeather.windMph != null ? ` · Wind ${destWeather.windMph} mph` : ""}</p>
                {precipLine(destWeather.precipMm) && <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{precipLine(destWeather.precipMm)}</p>}
              </>
            )}
            {destWeather?.status === "later" && <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>The forecast shows up closer to your trip, about 9 days out.</p>}
            {pack.weather?.origin?.weather?.status === "ok" && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-2">Departing {pack.weather.origin.city}: {pack.weather.origin.weather.tempF ?? pack.weather.origin.weather.highF}°, high {pack.weather.origin.weather.highF}° / low {pack.weather.origin.weather.lowF}°.</p>}
            {(hot || cold) && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink }} className="mt-2">{hot ? "It may be hot for cargo. " : ""}{cold ? "It may be cold for cargo. " : ""}The full check is under Flight & Weather.</p>}
            <div className="mt-3"><TextButton onClick={() => setSection("flight")}>Weather and cargo check</TextButton></div>
          </SoftCard>

          <SoftCard title="Vets and pet stores">
            <div className="flex gap-4">
              {[["stethoscope", "Vets", countKind(pack.spots, "vet")], ["bag", "Pet stores", countKind(pack.spots, "pet_store")]].map(([icon, label, n]) => (
                <button key={label} type="button" onClick={() => setSection("destination")} className="flex flex-col items-center gap-2" style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: tokens.sky, color: tokens.navy }}><Icon name={icon} size={28} /></span>
                  <span style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.navy }}>{label}{n > 0 ? ` · ${n}` : ""}</span>
                </button>
              ))}
            </div>
            <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">Near arrival{pack.originSpots ? " and departure" : ""}, from public map data.</p>
            <div className="mt-3"><TextButton onClick={() => setSection("destination")}>View map & locations</TextButton></div>
          </SoftCard>

          <SoftCard title="Travel checklist">
            <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: progress.complete ? tokens.green : tokens.navy }} className="mb-2">{progress.total ? `${progress.done} of ${progress.total} complete` : "No steps for this trip yet."}</p>
            <ul className="space-y-2">
              {shownSteps.map((step) => (
                <li key={step.id} className="flex items-center gap-2">
                  <CheckDot on={cardDone(step, statusMap)} />
                  <span style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{step.shortTitle}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3"><TextButton onClick={() => setSection("checklist")}>Open the checklist</TextButton></div>
          </SoftCard>

          <SoftCard title="Important reminders">
            {reminders.length === 0 && expirations.length === 0 ? (
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>Reminders use the travel date on this pass, plus expiration dates saved in the Vault.</p>
            ) : (
              <ul className="space-y-3">
                {reminders.slice(0, 3).map((r) => (
                  <li key={r.kind} className="flex items-center gap-3">
                    <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: tokens.sky, color: tokens.navy }}><Icon name="calendar" size={20} /></span>
                    <span>
                      <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{r.title}</span>
                      <span className="block" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{fmt(r.date)}</span>
                    </span>
                  </li>
                ))}
                {expirations.slice(0, 2).map((r) => (
                  <li key={r.key} className="flex items-center gap-3">
                    <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 40, height: 40, background: tokens.sky, color: tokens.navy }}><Icon name={r.icon} size={20} /></span>
                    <span>
                      <span className="block" style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{r.title}</span>
                      <span className="block" style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>Expires {fmt(r.date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3"><TextButton onClick={() => setSection("reminders")}>All reminders</TextButton></div>
          </SoftCard>

          <SoftCard title="Your documents">
            <div className="grid grid-cols-2 gap-2">
              <DocTile label="Pet ID" on={!!pet?.id} onClick={() => pet?.id && (window.location.href = `/id/${pet.id}`)} />
              <DocTile label="Vaccination records" on={vaxOn} onClick={() => setSection("documents")} />
              <DocTile label="DOT form" on={dotOn} hint={service ? "PDF you sign" : "Service-dog trips"} onClick={() => setSection("documents")} />
              <DocTile label="Travel Pass summary" on onClick={() => setSection("documents")} />
            </div>
            {!isMember && <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }} className="mt-3">Pet Vault keeps this pet’s records for the next trip.</p>}
          </SoftCard>
        </div>
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
              <button type="button" onClick={onSetRolePet} className="rounded-full px-5 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, border: "none", cursor: "pointer", minHeight: 48 }}>Switch this trip to the pet path</button>
            </div>
          )}
          <RoundTripAddon trip={trip} onSave={onSaveReturn} />
          <VetGuidance trip={trip} requirements={[...results, ...cards.filter((c) => String(c.id).startsWith("syn:"))]} paid />
          {cards.length === 0 ? (
            <div className="rounded-xl p-5 text-center" style={{ background: "#fff", border: `1px dashed ${tokens.line}`, fontFamily: font.body, fontSize: 16, color: tokens.ink }}>No requirements found for this exact combination yet.</div>
          ) : (
            <PassChecklist trip={trip} requirements={results} statusMap={statusMap} onSetDone={onSetDone} onOpenRelief={() => { setSection("flight"); setTimeout(() => document.getElementById("pet-relief")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }} />
          )}
        </>
      )}

      {section === "reminders" && (
        <>
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
        </>
      )}

      {section === "documents" && (
        <div className="space-y-3">
          <SoftCard title="Pet ID">
            <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink }}>The Pet ID page is the one a finder or gate agent can open. PetPassGo does not verify service-animal status.</p>
            {pet?.passport_no && <p style={{ fontFamily: font.body, fontSize: 16, fontWeight: 700, color: tokens.navy }} className="mt-2">PetPassGo ID {pet.passport_no}</p>}
            {pet?.id && <div className="mt-3"><a href={`/id/${pet.id}`} className="inline-flex items-center justify-center rounded-full px-5 py-3" style={{ background: tokens.navy, color: "#fff", fontFamily: font.body, fontWeight: 700, fontSize: 16, textDecoration: "none", minHeight: 48 }}>View your Pet ID</a></div>}
          </SoftCard>
          <SoftCard title="Vaccination records">
            {(health || []).length === 0 && (docs || []).filter((d) => /vaccin|rabies|health/i.test(d.document_type || "")).length === 0 && (
              <p style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>None saved yet. Add them in Pet Vault and they show up here.</p>
            )}
            <ul className="space-y-2">
              {(health || []).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3" style={{ background: tokens.paper }}>
                  <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: tokens.navy }}>{h.name}</span>
                  <span style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted }}>{h.expires_on ? `Expires ${fmt(h.expires_on)}` : h.kind}</span>
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
