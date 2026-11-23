"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// Owner only: turns off every link given to someone else for this pet.
export default function StopSharing({ petId }) {
  const [state, setState] = useState("");
  async function stop() {
    setState("busy");
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/checkin-link", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data?.session?.access_token || ""}`, "x-sb-token": data?.session?.access_token || "" }, body: JSON.stringify({ pet_id: petId, stop: true }) }).catch(() => null);
    setState(r?.ok ? "done" : "err");
  }
  if (state === "done") return <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: "#15803D" }}>Stopped. Links you shared no longer open.</div>;
  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" onClick={stop} disabled={state === "busy"} style={{ minHeight: 44, padding: "0 16px", borderRadius: 999, background: "#fff", color: "#B91C1C", border: "1.5px solid #B91C1C", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}>{state === "busy" ? "Stopping…" : "Stop sharing"}</button>
      {state === "err" ? <div role="alert" style={{ fontSize: 13, color: "#B91C1C", marginTop: 4 }}>Couldn&apos;t stop sharing. Open travel mode from your account and try again.</div> : null}
    </div>
  );
}
