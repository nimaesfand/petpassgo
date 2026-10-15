"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { SITE_LAUNCHED } from "./pricing";

// Vault + Digital Pet ID access: members, OR anyone with a paid trip whose travel date
// hasn't passed. Before launch (NEXT_PUBLIC_SITE_LAUNCHED !== "true") everyone keeps access,
// so owner testing works before Stripe exists.
export function usePetAccess(userId) {
  const [state, setState] = useState({ loading: true, member: false, activeTrip: null, allowed: !SITE_LAUNCHED });
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
      const [{ data: m }, { data: trips }] = await Promise.all([
        supabase.rpc("my_membership"),
        supabase.from("trips").select("id,travel_date,airline").eq("paid", true),
      ]);
      const activeTrip = (trips || []).find((t) => !t.travel_date || t.travel_date >= today) || null;
      setState({ loading: false, member: !!m, activeTrip, allowed: !SITE_LAUNCHED || !!m || !!activeTrip });
    })();
  }, [userId]);
  return state;
}
