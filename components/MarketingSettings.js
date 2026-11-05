"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { tokens, font } from "../lib/theme";
import MarketingOptIn from "./MarketingOptIn";

export default function MarketingSettings() {
  const [on, setOn] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([
      supabase.rpc("my_marketing"),
      supabase.rpc("my_document_reminders"),
    ]).then(([marketing, docs]) => {
      const row = Array.isArray(marketing.data) ? marketing.data[0] : marketing.data;
      setOn(!!row?.marketing_opt_in);
      if (!docs.error && docs.data != null) setReminders(docs.data !== false);
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
  async function changeReminders(next) {
    setBusy(true);
    setReminders(next);
    const { error } = await supabase.rpc("set_document_reminders", { enabled: next });
    setBusy(false);
    if (error) setReminders(!next);
  }
  if (!ready) return null;
  return (
    <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${tokens.line}` }}>
      <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, color: tokens.navy }} className="mb-1">Email</div>
      <MarketingOptIn checked={on} onChange={(v) => { if (!busy) change(v); }} />
      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: font.body, fontSize: 16, lineHeight: 1.45, color: tokens.ink, cursor: "pointer", padding: "8px 0" }}>
        <input type="checkbox" checked={reminders} disabled={busy} onChange={(e) => changeReminders(e.target.checked)} style={{ width: 22, height: 22, marginTop: 2, accentColor: tokens.navy }} />
        <span>Email me 30 days and 7 days before a document expires</span>
      </label>
    </div>
  );
}
