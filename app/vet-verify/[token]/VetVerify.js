"use client";
import { useEffect, useState } from "react";
import { tokens, font } from "../../../lib/theme";
import { Wordmark } from "../../../components/Logo";

const fmt = (v) => (v ? new Date(`${String(v).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
const input = { fontFamily: font.body, fontSize: 16, border: `2px solid ${tokens.line}`, borderRadius: 12, padding: "12px 14px", width: "100%", background: "#fff" };

// A vet confirms the vaccine records an owner entered. No account needed:
// the private link from the email is the permission, and it works once.
export default function VetVerify({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [picked, setPicked] = useState({});
  const [f, setF] = useState({ vet_name: "", clinic: "", license: "" });
  const [attest, setAttest] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    fetch(`/api/vet-verify/confirm?token=${encodeURIComponent(token)}`).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(j.error || "This link isn't valid."); return; }
      setData(j);
      setPicked(Object.fromEntries((j.records || []).map((x) => [x.id, true])));
    }).catch(() => setErr("Couldn't load this page. Try again."));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/vet-verify/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...f, attest, record_ids: Object.keys(picked).filter((k) => picked[k]) }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error || "Couldn't save. Try again."); return; }
    setDone(j.confirmed);
  }

  const p = data?.pet;
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }} className="px-4 py-8">
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between mb-4"><Wordmark size={22} /><span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: tokens.muted }}>Vet confirmation</span></div>
        <div className="rounded-3xl p-5 sm:p-7" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 10px 30px rgba(20,33,61,.06)" }}>
          {done != null ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-3 flex items-center justify-center rounded-full" style={{ width: 60, height: 60, background: "#EAF6EE", color: tokens.green, fontSize: 30, fontWeight: 800 }}>✓</div>
              <h1 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, color: tokens.navy }}>Thank you!</h1>
              <p className="mt-2" style={{ fontFamily: font.body, fontSize: 16, color: tokens.ink }}>{done ? `${done} record${done === 1 ? "" : "s"} now show as vet-confirmed on ${p?.name}'s passport.` : "Nothing was confirmed. The owner will see that the records weren't verified."}</p>
            </div>
          ) : err && !data ? (
            <p style={{ fontFamily: font.body, fontSize: 17, color: tokens.ink }}>{err}</p>
          ) : !data ? (
            <p style={{ fontFamily: font.body, color: tokens.muted }}>Loading…</p>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div>
                <h1 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, color: tokens.navy, lineHeight: 1.15 }}>Confirm {p.name}&apos;s records</h1>
                <p className="mt-1" style={{ fontFamily: font.body, fontSize: 15.5, color: tokens.ink, lineHeight: 1.45 }}>{p.owner || "The owner"} entered these records and asked you to check them against your files. Untick anything that doesn&apos;t match.</p>
              </div>
              <div className="rounded-2xl p-4 grid grid-cols-2 gap-x-4 gap-y-2" style={{ background: tokens.paper }}>
                {[["Patient", p.name], ["Species", p.species], ["Breed", p.breed], ["Sex", p.sex], ["Color", p.color], ["Born", p.born ? fmt(p.born) : ""], ["Microchip", p.chipLast4 ? `ends in ${p.chipLast4}` : ""]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><div style={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: tokens.muted }}>{k.toUpperCase()}</div><div style={{ fontFamily: font.body, fontSize: 15.5, fontWeight: 700, color: tokens.navy }}>{v}</div></div>
                ))}
              </div>
              <div className="grid gap-2">
                {data.records.map((r) => (
                  <label key={r.id} className="flex items-start gap-3 rounded-2xl p-3" style={{ border: `2px solid ${picked[r.id] ? tokens.green : tokens.line}`, cursor: "pointer", background: picked[r.id] ? "#F3FBF6" : "#fff" }}>
                    <input type="checkbox" checked={!!picked[r.id]} onChange={(e) => setPicked((x) => ({ ...x, [r.id]: e.target.checked }))} style={{ width: 22, height: 22, marginTop: 2, accentColor: tokens.green }} />
                    <span className="min-w-0">
                      <span className="block" style={{ fontFamily: font.body, fontSize: 16.5, fontWeight: 800, color: tokens.navy }}>{r.name}</span>
                      <span className="block" style={{ fontFamily: font.body, fontSize: 14.5, color: tokens.ink }}>Given {fmt(r.date_given)} · Expires {fmt(r.expires_on)}{r.clinic ? ` · ${r.clinic}` : ""}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: tokens.navy }}>Your name<input required style={input} value={f.vet_name} onChange={(e) => setF({ ...f, vet_name: e.target.value })} placeholder="Dr. Jane Smith" autoComplete="name" /></label>
                <label style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: tokens.navy }}>Clinic<input required style={input} value={f.clinic} onChange={(e) => setF({ ...f, clinic: e.target.value })} placeholder="Clinic name" autoComplete="organization" /></label>
                <label className="sm:col-span-2" style={{ fontFamily: font.body, fontSize: 14.5, fontWeight: 700, color: tokens.navy }}>License number <span style={{ fontWeight: 500, color: tokens.muted }}>(optional)</span><input style={input} value={f.license} onChange={(e) => setF({ ...f, license: e.target.value })} /></label>
              </div>
              <label className="flex items-start gap-3" style={{ fontFamily: font.body, fontSize: 15, color: tokens.ink, lineHeight: 1.45, cursor: "pointer" }}>
                <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} style={{ width: 22, height: 22, marginTop: 1, accentColor: tokens.navy }} />
                <span>I work at this clinic, and the records I ticked match our files for this patient.</span>
              </label>
              {err ? <p role="alert" style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, color: tokens.stamp }}>{err}</p> : null}
              <button type="submit" disabled={busy || !attest} className="ppg-btn ppg-btn-primary w-full" style={{ minHeight: 52, opacity: busy || !attest ? 0.6 : 1 }}>{busy ? "Saving…" : "Confirm records"}</button>
              <p style={{ fontFamily: font.body, fontSize: 13, color: tokens.muted }}>Your name and clinic show next to the records you confirm. Nothing is shared beyond the owner&apos;s passport.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
