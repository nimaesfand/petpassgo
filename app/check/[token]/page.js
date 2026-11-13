import { serviceClient } from "../../../lib/serverEmail";
import { readCheckin } from "../../../lib/ppgSign";
import LiveSeal from "./LiveSeal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pet check-in | PetPassGo", robots: { index: false, follow: false } };

const BUCKET = "pet-documents";
const NAVY = "#14213D", GOLD = "#F2B84B", GREEN = "#15803D", INK = "#2B3443", MUTED = "#6B7585", LINE = "#DCE3EC";

function storagePath(v) {
  if (!v) return null;
  for (const m of [`/object/public/${BUCKET}/`, `/object/sign/${BUCKET}/`]) {
    const i = v.indexOf(m);
    if (i !== -1) return decodeURIComponent(v.slice(i + m.length).split("?")[0]);
  }
  return v;
}
const fmt = (v) => (v ? new Date(`${String(v).slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");
const today = () => new Date().toISOString().slice(0, 10);
const code = (s) => (String(s || "").match(/\(([A-Z]{3})\)/) || [])[1] || String(s || "").split(",")[0];

function Badge({ kind }) {
  const look = {
    verified: ["VERIFIED", GREEN, "#EAF6EE"],
    doc: ["DOCUMENT ON FILE", "#1D4ED8", "#EAF1FF"],
    owner: ["OWNER-STATED", MUTED, "#F1F4F8"],
    missing: ["NOT ON FILE", "#B45309", "#FEF3C7"],
    expired: ["EXPIRED", "#B91C1C", "#FDECEC"],
  }[kind];
  return <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", color: look[1], background: look[2], borderRadius: 6, padding: "3px 7px", whiteSpace: "nowrap" }}>{look[0]}</span>;
}

function Row({ title, detail, kind, extra }) {
  return (
    <div style={{ padding: "12px 0", borderTop: `1px solid ${LINE}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: NAVY }}>{title}</div>
        <Badge kind={kind} />
      </div>
      {detail ? <div style={{ fontSize: 14.5, color: INK, marginTop: 2, lineHeight: 1.4 }}>{detail}</div> : null}
      {extra}
    </div>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#EEF2F7", fontFamily: "Inter, system-ui, sans-serif", padding: "20px 14px 40px" }}>
      <style>{`.ppg-live{background:linear-gradient(110deg,#14213D 0%,#1F3A6E 25%,#14213D 50%,#1F3A6E 75%,#14213D 100%);background-size:300% 100%;animation:ppgLive 6s linear infinite}@keyframes ppgLive{to{background-position:-300% 0}}.ppg-live-dot{width:12px;height:12px;border-radius:50%;background:#4ADE80;box-shadow:0 0 0 0 rgba(74,222,128,.7);animation:ppgPulse 1.6s infinite}@keyframes ppgPulse{70%{box-shadow:0 0 0 10px rgba(74,222,128,0)}100%{box-shadow:0 0 0 0 rgba(74,222,128,0)}}`}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: NAVY, letterSpacing: "-.03em" }}>PetPass<span style={{ color: "#C2410C" }}>Go</span></div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", color: MUTED }}>PET CHECK-IN</div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function CheckPage({ params }) {
  const c = readCheckin(params.token);
  if (!c.ok) {
    return <Shell><div style={{ background: "#fff", borderRadius: 20, padding: 24, textAlign: "center" }}><h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{c.reason === "expired" ? "This check-in link has expired" : "This check-in link isn't valid"}</h1><p style={{ color: INK, marginTop: 8 }}>Ask the traveler to open a fresh check-in code from their PetPassGo passport. Codes last 30 minutes.</p></div></Shell>;
  }
  const sb = serviceClient();
  const [{ data: pet }, { data: records }, { data: docs }, tripRes] = await Promise.all([
    sb.from("pets").select("*").eq("id", c.petId).maybeSingle(),
    sb.from("pet_health_records").select("*").eq("pet_id", c.petId).in("kind", ["vaccine"]).order("expires_on", { ascending: false, nullsFirst: false }),
    sb.from("documents").select("id,document_type,file_url,issued_on,expires_on,uploaded_at").eq("pet_id", c.petId).order("uploaded_at", { ascending: false }),
    c.tripId ? sb.from("trips").select("*").eq("id", c.tripId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!pet) return <Shell><div style={{ background: "#fff", borderRadius: 20, padding: 24 }}>This pet profile is no longer available.</div></Shell>;
  const trip = tripRes?.data || null;
  let photo = null;
  const pp = storagePath(pet.photo_url);
  if (pp) { const { data } = await sb.storage.from(BUCKET).createSignedUrl(pp, 1800); photo = data?.signedUrl || null; }
  const signDoc = async (d) => { const p = storagePath(d?.file_url); if (!p) return null; const { data } = await sb.storage.from(BUCKET).createSignedUrl(p, 1800); return data?.signedUrl || null; };

  const t = today();
  const rabies = (records || []).find((r) => /rabies/i.test(r.name || ""));
  const otherVax = (records || []).filter((r) => r !== rabies).slice(0, 4);
  const vaxKind = (r) => (!r ? "missing" : r.expires_on && r.expires_on < t ? "expired" : r.verified_at ? "verified" : "owner");
  const vaxDetail = (r) => !r ? "No rabies record in the passport." : [r.expires_on ? `Valid until ${fmt(r.expires_on)}` : "No expiry date entered", r.verified_at ? `Confirmed by ${r.verified_by_name}, ${r.verified_by_clinic}${r.verified_by_license ? ` (lic. ${r.verified_by_license})` : ""} on ${fmt(r.verified_at)}` : "Entered by the owner"].join(" · ");
  const findDoc = (re) => (docs || []).find((d) => re.test(d.document_type || ""));
  const health = findDoc(/health certificate|cvi|7001/i);
  const dot = findDoc(/dot|service animal/i);
  const healthUrl = await signDoc(health);
  const dotUrl = await signDoc(dot);
  const service = /service/i.test(pet.role || "");
  const status = service ? ["SERVICE DOG", "#0F766E", "#fff"] : /emotional|esa/i.test(pet.role || "") ? ["SUPPORT ANIMAL · FLIES AS A PET", "#6D28D9", "#fff"] : ["PET", GOLD, NAVY];
  const chip = String(pet.microchip_number || "").replace(/[^0-9A-Za-z]/g, "");
  const checkedAt = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", timeZone: "America/Los_Angeles" });
  const open = (url, label) => url ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 6, fontWeight: 800, fontSize: 14.5, color: "#1D4ED8" }}>{label} ↗</a> : null;

  return (
    <Shell>
      <LiveSeal expiresAt={c.expiresAt.toISOString()} />
      <section style={{ background: "#fff", borderRadius: 20, marginTop: 12, padding: 18, boxShadow: "0 10px 30px rgba(20,33,61,.08)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 92, height: 114, borderRadius: 14, overflow: "hidden", background: "#E8EEF7", border: `3px solid ${GOLD}`, flexShrink: 0 }}>
            {photo ? <img src={photo} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, lineHeight: 1.05 }}>{pet.name}</div>
            <div style={{ fontSize: 15, color: INK, marginTop: 2 }}>{[pet.animal_type, pet.breed, pet.sex].filter(Boolean).join(" · ")}</div>
            <span style={{ display: "inline-block", marginTop: 8, background: status[1], color: status[2], fontSize: 11, fontWeight: 800, letterSpacing: ".12em", borderRadius: 6, padding: "4px 8px" }}>{status[0]}</span>
            <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13.5, color: NAVY, marginTop: 8 }}>{pet.passport_no || ""}{pet.verify_code ? ` · ${pet.verify_code}` : ""}</div>
          </div>
        </div>

        {trip ? (
          <div style={{ marginTop: 16, background: "#F5F7FA", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: MUTED }}>TRIP</div><div style={{ fontSize: 17, fontWeight: 800, color: NAVY }}>{code(trip.origin)} → {code(trip.destination)}</div></div>
            <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: MUTED }}>AIRLINE</div><div style={{ fontSize: 15.5, fontWeight: 700, color: NAVY }}>{trip.airline}{trip.flight_number ? ` ${trip.flight_number}` : ""}</div></div>
            <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: MUTED }}>DATE</div><div style={{ fontSize: 15.5, fontWeight: 700, color: NAVY }}>{fmt(trip.travel_date)}</div></div>
            {!service && trip.pet_travel ? <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", color: MUTED }}>TRAVELS</div><div style={{ fontSize: 15.5, fontWeight: 700, color: NAVY }}>{trip.pet_travel === "hold" ? "In the hold" : "In the cabin"}</div></div> : null}
          </div>
        ) : null}

        <div style={{ marginTop: 14 }}>
          <Row title="Rabies vaccine" kind={vaxKind(rabies)} detail={vaxDetail(rabies)} />
          {otherVax.map((r) => <Row key={r.id} title={r.name} kind={vaxKind(r)} detail={vaxDetail(r)} />)}
          {service ? <Row title="DOT Service Animal form" kind={dot ? "doc" : "missing"} detail={dot ? `Uploaded ${fmt(String(dot.uploaded_at).slice(0, 10))}. Signed by the handler.` : "Not uploaded to the passport. Ask the traveler for their copy."} extra={open(dotUrl, "View the form")} /> : null}
          <Row title="Health certificate" kind={health ? (health.expires_on && health.expires_on < t ? "expired" : "doc") : "missing"} detail={health ? [health.issued_on ? `Issued ${fmt(health.issued_on)}` : "", health.expires_on ? `Valid until ${fmt(health.expires_on)}` : ""].filter(Boolean).join(" · ") || "On file" : "None on file. Many U.S. domestic trips don't need one; check your airline's rule."} extra={open(healthUrl, "View the certificate")} />
          <Row title="Microchip" kind={chip ? "owner" : "missing"} detail={chip ? `Ends in ${chip.slice(-4)}` : "No microchip number entered."} />
          <Row title="Weight" kind={pet.weight_lb ? "owner" : "missing"} detail={pet.weight_lb ? `${pet.weight_lb} lb` : "Not entered."} />
          {!service && (pet.carrier_length_in && pet.carrier_width_in && pet.carrier_height_in) ? <Row title="Carrier" kind="owner" detail={`${pet.carrier_length_in} × ${pet.carrier_width_in} × ${pet.carrier_height_in} in`} /> : null}
        </div>
      </section>

      <div style={{ marginTop: 12, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
        <b style={{ color: NAVY }}>Verified</b> means a veterinarian confirmed the record through PetPassGo. <b style={{ color: NAVY }}>Document on file</b> means the traveler uploaded it; open it to review. <b style={{ color: NAVY }}>Owner-stated</b> means the traveler entered it. Loaded {checkedAt} PT. PetPassGo is not a government agency and does not replace your airline&apos;s own checks.
      </div>
    </Shell>
  );
}
