"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { SITE_LAUNCHED } from "./pricing";
import { tripAccessOpen } from "./tripAccess";

// Vault + Digital Pet ID access: members, OR anyone with a paid trip whose access
// window is still open — until 7 days after the travel date, or after the return
// date when one was volunteered (lib/tripAccess.js). Before launch (NEXT_PUBLIC_SITE_LAUNCHED !== "true") everyone keeps access,
// so owner testing works before Stripe exists.
// Pre-launch only: add ?preview=lapsed to any page to see the lapsed-member experience.
export function lapsedPreview() {
  return !SITE_LAUNCHED && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "lapsed";
}

export function usePetAccess(userId) {
  const [state, setState] = useState({ loading: true, member: false, activeTrip: null, allowed: !SITE_LAUNCHED });
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
      const [{ data: m }, tripQuery] = await Promise.all([
        supabase.rpc("my_membership"),
        supabase.from("trips").select("id,travel_date,return_date,airline").eq("paid", true),
      ]);
      const trips = tripQuery.error
        ? (await supabase.from("trips").select("id,travel_date,airline").eq("paid", true)).data
        : tripQuery.data;
      const activeTrip = (trips || []).find((t) => tripAccessOpen(t.travel_date, t.return_date, today)) || null;
      setState({ loading: false, member: !!m, activeTrip, allowed: lapsedPreview() ? false : !SITE_LAUNCHED || !!m || !!activeTrip });
    })();
  }, [userId]);
  return state;
}
