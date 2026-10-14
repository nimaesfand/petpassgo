import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public pet photo for the Digital Pet ID page.
// Looks the pet up through get_public_pet_id (which exposes only public fields),
// then signs ONLY that pet's profile photo for a few minutes. The service-role key
// stays on the server and is never sent to the browser.

export const dynamic = "force-dynamic";

const BUCKET = "pet-documents";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIGNED_SECONDS = 300;

function toStoragePath(value) {
  if (!value) return null;
  for (const m of [`/object/public/${BUCKET}/`, `/object/sign/${BUCKET}/`]) {
    const i = value.indexOf(m);
    if (i !== -1) return decodeURIComponent(value.slice(i + m.length).split("?")[0]);
  }
  return value;
}

const notFound = () => new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(_req, { params }) {
  const petId = params.petId;
  if (!UUID.test(petId)) return notFound();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return new NextResponse("Photo service not configured", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  // Public lookup (same data any visitor can see).
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.rpc("get_public_pet_id", { pet_id: petId });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row || !row.photo_path) return notFound();

  const path = toStoragePath(row.photo_path);
  // Only ever sign a profile photo that lives in this pet's folder.
  const parts = path ? path.split("/") : [];
  if (parts.length < 3 || parts[1] !== petId || !parts[parts.length - 1].startsWith("profile-photo-")) {
    return notFound();
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: signed, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_SECONDS);
  if (signError || !signed?.signedUrl) return notFound();

  return NextResponse.redirect(signed.signedUrl, { status: 302, headers: { "Cache-Control": "no-store" } });
}
