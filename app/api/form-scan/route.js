import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Temporary, test site only: list the fill-in fields of the official Hawaii AQS-279 PDF.
const URL_AQS279 = "https://dab.hawaii.gov/ai/files/2024/01/form_AQS279-2024.01.17.pdf";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ error: "Not here." }, { status: 404 });
  const r = await fetch(URL_AQS279);
  if (!r.ok) return NextResponse.json({ error: `fetch ${r.status}` }, { status: 502 });
  const buf = Buffer.from(await r.arrayBuffer());
  const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
  const fields = pdf.getForm().getFields().map((f) => {
    const t = f.constructor.name;
    let extra = null;
    try { if (t === "PDFCheckBox") extra = "checkbox"; if (t === "PDFRadioGroup") extra = f.getOptions(); if (t === "PDFDropdown") extra = f.getOptions(); } catch {}
    const w = f.acroField.getWidgets()[0];
    const rect = w ? w.getRectangle() : null;
    const page = w ? pdf.getPages().findIndex((p) => p.ref === w.P()) : -1;
    return { name: f.getName(), type: t, extra, page, rect: rect && [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width)] };
  });
  return NextResponse.json({ bytes: buf.length, pages: pdf.getPageCount(), count: fields.length, fields });
}
