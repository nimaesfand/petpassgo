"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TagSheet from "../../../components/pets/TagSheet";
import { supabase } from "../../../lib/supabaseClient";
import { getSignedUrl } from "../../../lib/storage";
import { tokens, font } from "../../../lib/theme";

function Tags() {
  const petId = useSearchParams().get("pet");
  const [pet, setPet] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) { window.location.href = "/login"; return; }
      let q = supabase.from("pets").select("*").eq("user_id", data.user.id);
      q = petId ? q.eq("id", petId) : q.order("created_at", { ascending: true }).limit(1);
      const { data: rows } = await q;
      const row = rows?.[0];
      if (!row) { setMissing(true); return; }
      setPet(row);
      if (row.photo_url) setPhotoUrl((await getSignedUrl(row.photo_url)) || "");
    });
  }, [petId]);

  if (missing) return <p className="p-8" style={{ fontFamily: font.body, color: tokens.ink }}>That pet isn't on this account.</p>;
  if (!pet) return <p className="p-8" style={{ fontFamily: font.body, color: tokens.ink }}>Loading…</p>;
  return <TagSheet pet={pet} photoUrl={photoUrl} />;
}

export default function Page() {
  return <Suspense fallback={<p className="p-8">Loading…</p>}><Tags /></Suspense>;
}
