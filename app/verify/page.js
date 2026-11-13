import { serviceClient } from "../../lib/serverEmail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify a pet passport | PetPassGo", description: "Check that a PetPassGo pet passport is real: enter the passport number and verification code printed on it." };

const NAVY = "#14213D", GREEN = "#15803D", INK = "#2B3443", MUTED = "#6B7585";
const norm = (s, re) => String(s || "").toUpperCase().replace(/\s+/g, "").replace(re, "").slice(0, 20);
const fmt = (v) => (v ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");

// Public check for anyone holding a printed or shared passport.
export default async function VerifyPage({ searchParams }) {
  const no = norm(searchParams?.no, /[^A-Z0-9-]/g);
  const code = norm(searchParams?.code, /[^A-Z0-9-]/g);
  let result = null;
  if (no && code) {
    const { data } = await serviceClient().from("pets").select("name,animal_type,breed,passport_no,passport_issued_at,verify_code").eq("passport_no", no).maybeSingle();
    result = data && data.verify_code && data.verify_code === code && data.passport_issued_at ? data : false;
  }
  const field = { width: "100%", fontSize: 17, padding: "13px 14px", borderRadius: 12, border: "2px solid #DCE3EC", fontFamily: "ui-monospace, Menlo, monospace", textTransform: "uppercase", marginTop: 6 };
  return (
    <div style={{ minHeight: "100vh", background: "#EEF2F7", fontFamily: "Inter, system-ui, sans-serif", padding: "28px 14px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 22, color: NAVY, letterSpacing: "-.03em", textDecoration: "none" }}>PetPass<span style={{ color: "#C2410C" }}>Go</span></a>
        <div style={{ background: "#fff", borderRadius: 22, padding: 22, marginTop: 14, boxShadow: "0 10px 30px rgba(20,33,61,.08)" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: NAVY, lineHeight: 1.15 }}>Verify a pet passport</h1>
          <p style={{ color: INK, marginTop: 6, fontSize: 15.5, lineHeight: 1.45 }}>Enter the passport number and the verification code printed on the passport.</p>
          {result ? (
            <div style={{ marginTop: 16, background: "#EAF6EE", border: `2px solid ${GREEN}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", color: GREEN }}>✓ VALID PETPASSGO PASSPORT</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: NAVY, marginTop: 4 }}>{result.name}</div>
              <div style={{ color: INK, fontSize: 15.5 }}>{[result.animal_type, result.breed].filter(Boolean).join(" · ")}</div>
              <div style={{ color: INK, fontSize: 14.5, marginTop: 6, fontFamily: "ui-monospace, Menlo, monospace" }}>{result.passport_no} · issued {fmt(result.passport_issued_at)}</div>
              <p style={{ color: MUTED, fontSize: 13.5, marginTop: 8, lineHeight: 1.45 }}>This confirms the passport was issued by PetPassGo and the code matches. Ask the traveler for their live check-in code to see vaccine and document status.</p>
            </div>
          ) : result === false ? (
            <div style={{ marginTop: 16, background: "#FDECEC", border: "2px solid #B91C1C", borderRadius: 16, padding: 16, color: "#7F1D1D", fontWeight: 700 }}>No PetPassGo passport matches that number and code. Check both and try again.</div>
          ) : null}
          <form method="get" style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <label style={{ fontWeight: 700, color: NAVY, fontSize: 14.5 }}>Passport number<input name="no" defaultValue={no} placeholder="PPG-123-4567" style={field} /></label>
            <label style={{ fontWeight: 700, color: NAVY, fontSize: 14.5 }}>Verification code<input name="code" defaultValue={code} placeholder="ABCD-EFGH-JKMN" style={field} /></label>
            <button type="submit" style={{ minHeight: 52, borderRadius: 999, border: "none", background: "#C2410C", color: "#fff", fontWeight: 800, fontSize: 16.5, cursor: "pointer" }}>Verify</button>
          </form>
        </div>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>PetPassGo pet passports are private travel records, not government documents.</p>
      </div>
    </div>
  );
}
