"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Loads only public fields: the pet (get_public_pet_id) and, if active, its lost report.
export default function usePublicPet(petId) {
  const [state, setState] = useState({ status: "loading", pet: null, lost: null });
  useEffect(() => {
    if (!UUID.test(petId)) return setState({ status: "notfound", pet: null, lost: null });
    Promise.all([
      supabase.rpc("get_public_pet_id", { pet_id: petId }),
      supabase.rpc("get_public_lost_report", { pet_id: petId }),
    ]).then(([p, l]) => {
      const pet = Array.isArray(p.data) ? p.data[0] : p.data;
      if (p.error || !pet) return setState({ status: "notfound", pet: null, lost: null });
      const lost = Array.isArray(l.data) ? l.data[0] : l.data;
      setState({ status: "ok", pet, lost: lost || null });
    }, () => setState({ status: "notfound", pet: null, lost: null }));
  }, [petId]);
  return state;
}
