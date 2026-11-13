"use client";
import { useEffect, useState } from "react";
import { OPTOUT_KEY } from "../lib/analytics";

export default function PrivacyChoices() {
  const [out, setOut] = useState(null);
  const [gpc, setGpc] = useState(false);
  useEffect(() => {
    try { setOut(localStorage.getItem(OPTOUT_KEY) === "1"); } catch { setOut(false); }
    setGpc(typeof navigator !== "undefined" && (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1"));
  }, []);
  function toggle() {
    const next = !out;
    try { if (next) localStorage.setItem(OPTOUT_KEY, "1"); else localStorage.removeItem(OPTOUT_KEY); } catch {}
    setOut(next);
    if (next) window.location.reload(); // drop any tracker already loaded on this page
  }
  if (out === null) return null;
  const off = out || gpc;
  return (
    <div style={{ background: "#fff", border: "1px solid #DCE3EC", borderRadius: 16, padding: 18, margin: "16px 0", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 220px" }}>
        <div style={{ fontWeight: 700, color: "#14213D" }}>Do not share my information for advertising</div>
        <div style={{ fontSize: 14, color: "#4B5565", marginTop: 4 }}>{off ? "On. Advertising pixels are off in this browser." : "Off. Advertising pixels can measure our ads in this browser."}{gpc ? " Your browser's privacy signal already turns them off." : ""}</div>
      </div>
      <button type="button" role="switch" aria-checked={off} disabled={gpc && !out} onClick={toggle} className="ppg-btn ppg-btn-primary" style={{ minWidth: 150 }}>{out ? "Allow again" : off ? "Turned off" : "Turn off sharing"}</button>
    </div>
  );
}
