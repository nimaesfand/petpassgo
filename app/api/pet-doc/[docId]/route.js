import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isHousingDoc } from "../../../../lib/petProfile";

export const dynamic = "force-dynamic";

const BUCKET = "pet-documents";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const notFound = () => new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(_req, { params }) {
  const docId = params.docId;
  if (!UUID.test(docId || "")) return notFound();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return new NextResponse("Not available", { status: 503, headers: { "Cache-Control": "no-store" } });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: doc } = await admin.from("documents").select("id,pet_id,user_id,document_type,file_url").eq("id", docId).maybeSingle();
  if (!doc?.file_url) return notFound();
  const { data: pet } = await admin.from("pets").select("id,show_documents_on_public,show_housing_on_public").eq("id", doc.pet_id).maybeSingle();
  if (!pet) return notFound();
  const housing = isHousingDoc(doc.document_type);
  if (housing ? !pet.show_housing_on_public : !pet.show_documents_on_public) return notFound();
  const path = String(doc.file_url);
  const parts = path.split("/");
  if (parts.length < 3 || parts[0] !== doc.user_id || parts[1] !== doc.pet_id) return notFound();
  const { data: signed, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 120);
  if (error || !signed?.signedUrl) return notFound();
  return NextResponse.redirect(signed.signedUrl, { status: 302, headers: { "Cache-Control": "no-store" } });
}
