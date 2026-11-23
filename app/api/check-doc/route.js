import { NextResponse } from "next/server";
import { serviceClient } from "../../../lib/serverEmail";
import { readCheckin } from "../../../lib/ppgSign";
import { GATE_DOC } from "../../../lib/gateDocs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "pet-documents";
function storagePath(v) {
  if (!v) return null;
  for (const m of [`/object/public/${BUCKET}/`, `/object/sign/${BUCKET}/`]) {
    const i = v.indexOf(m);
    if (i !== -1) return decodeURIComponent(v.slice(i + m.length).split("?")[0]);
  }
  return v;
}

// A fresh, short-lived link to one travel document, minted when it's tapped.
export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const c = readCheckin(body.token);
  if (!c.ok) return NextResponse.json({ error: c.reason === "expired" ? "This link has closed." : "This link isn't valid." }, { status: 403 });
  const docId = String(body.doc || "");
  if (!/^[0-9a-f-]{36}$/i.test(docId)) return NextResponse.json({ error: "Missing document." }, { status: 400 });
  const sb = serviceClient();
  if (c.share) {
    const { data: pet } = await sb.from("pets").select("checkin_epoch").eq("id", c.petId).maybeSingle();
    if (!pet || (pet.checkin_epoch || 0) !== c.epoch) return NextResponse.json({ error: "The owner stopped sharing this page." }, { status: 403 });
  }
  const { data: doc } = await sb.from("documents").select("id,document_type,file_url").eq("id", docId).eq("pet_id", c.petId).maybeSingle();
  if (!doc || !GATE_DOC.test(doc.document_type || "")) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const path = storagePath(doc.file_url);
  if (!path) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, 300);
  if (!data?.signedUrl) return NextResponse.json({ error: "Couldn't open the file. Please try again." }, { status: 500 });
  const kind = /\.pdf$/i.test(path) ? "pdf" : /\.(jpe?g|png|webp|gif|heic)$/i.test(path) ? "image" : "file";
  return NextResponse.json({ url: data.signedUrl, kind }, { headers: { "Cache-Control": "no-store" } });
}
