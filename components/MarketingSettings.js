"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import MarketingOptIn from "./MarketingOptIn";

export default function MarketingSettings() {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.rpc("my_marketing").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      setOn(!!row?.marketing_opt_in);
      setReady(true);
    });
  }, []);
  async function change(next) {
    setBusy(true);
    setOn(next);
    const { error } = await supabase.rpc("set_marketing_opt_in", { opt_in: next, source: "account" });
    setBusy(false);
    if (error) setOn(!next);
  }
  if (!ready) return null;
  return (
    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">Email</div>
      <MarketingOptIn checked={on} onChange={(v) => { if (!busy) change(v); }} />
      <p style={{ fontFamily: font.body, fontSize: 15, color: tokens.muted, margin: "4px 0 0" }}>Off unless you ask for them. You can change this whenever you like.</p>
    </div>
  );
}
