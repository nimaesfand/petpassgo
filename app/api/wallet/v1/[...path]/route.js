import { NextResponse } from "next/server";
import { serviceClient } from "../../../../../lib/serverEmail";
import { buildPetPass, walletConfigured } from "../../../../../lib/appleWallet";
import { PET_COLUMNS, passExtras, petThumbs } from "../../../../../lib/walletData";
import { vaultIsOpen } from "../../../../../lib/paidUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Apple Wallet web service (PassKit). Paths, relative to webServiceURL:
//   POST/DELETE v1/devices/{device}/registrations/{passType}/{serial}
//   GET         v1/devices/{device}/registrations/{passType}?passesUpdatedSince=tag
//   GET         v1/passes/{passType}/{serial}
//   POST        v1/log
// serialNumber is pets.id; authenticationToken lives in wallet_passes and never changes.
const typeOk = (t) => t && t === process.env.APPLE_PASS_TYPE_ID;

async function authed(sb, req, serial) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("ApplePass ") ? h.slice(10).trim() : "";
  if (!token || !/^[0-9a-f-]{36}$/i.test(serial || "")) return null;
  const { data } = await sb.from("wallet_passes").select("pet_id,auth_token,last_updated").eq("pet_id", serial).maybeSingle();
  return data && data.auth_token === token ? data : null;
}

export async function POST(req, { params }) {
  const p = params.path || [];
  if (p[0] === "log") { const b = await req.json().catch(() => ({})); console.log("wallet log", JSON.stringify(b).slice(0, 2000)); return new NextResponse(null, { status: 200 }); }
  if (p[0] !== "devices" || p[2] !== "registrations" || !typeOk(p[3]) || !p[4]) return new NextResponse(null, { status: 404 });
  const sb = serviceClient();
  if (!(await authed(sb, req, p[4]))) return new NextResponse(null, { status: 401 });
  const { pushToken } = await req.json().catch(() => ({}));
  if (!pushToken) return new NextResponse(null, { status: 400 });
  await sb.from("wallet_devices").upsert({ device_id: p[1], push_token: String(pushToken), updated_at: new Date().toISOString() });
  const { data: existing } = await sb.from("wallet_registrations").select("device_id").eq("device_id", p[1]).eq("pass_type_id", p[3]).eq("serial", p[4]).maybeSingle();
  if (existing) return new NextResponse(null, { status: 200 });
  await sb.from("wallet_registrations").insert({ device_id: p[1], pass_type_id: p[3], serial: p[4] });
  return new NextResponse(null, { status: 201 });
}

export async function DELETE(req, { params }) {
  const p = params.path || [];
  if (p[0] !== "devices" || p[2] !== "registrations" || !typeOk(p[3]) || !p[4]) return new NextResponse(null, { status: 404 });
  const sb = serviceClient();
  if (!(await authed(sb, req, p[4]))) return new NextResponse(null, { status: 401 });
  await sb.from("wallet_registrations").delete().eq("device_id", p[1]).eq("pass_type_id", p[3]).eq("serial", p[4]);
  return new NextResponse(null, { status: 200 });
}

export async function GET(req, { params }) {
  const p = params.path || [];
  const sb = serviceClient();
  // Which of this device's passes changed since the tag?
  if (p[0] === "devices" && p[2] === "registrations" && typeOk(p[3]) && !p[4]) {
    const since = new URL(req.url).searchParams.get("passesUpdatedSince");
    const { data: regs } = await sb.from("wallet_registrations").select("serial").eq("device_id", p[1]).eq("pass_type_id", p[3]);
    if (!regs?.length) return new NextResponse(null, { status: 204 });
    let q = sb.from("wallet_passes").select("pet_id,last_updated").in("pet_id", regs.map((r) => r.serial));
    if (since && !Number.isNaN(Number(since))) q = q.gt("last_updated", new Date(Number(since)).toISOString());
    const { data: rows } = await q;
    if (!rows?.length) return new NextResponse(null, { status: 204 });
    const last = Math.max(...rows.map((r) => new Date(r.last_updated).getTime()));
    return NextResponse.json({ serialNumbers: rows.map((r) => r.pet_id), lastUpdated: String(last) });
  }
  // The latest pass.
  if (p[0] === "passes" && typeOk(p[1]) && p[2]) {
    if (!walletConfigured()) return new NextResponse(null, { status: 404 });
    const row = await authed(sb, req, p[2]);
    if (!row) return new NextResponse(null, { status: 401 });
    const ims = req.headers.get("if-modified-since");
    const modified = new Date(row.last_updated);
    if (ims && !Number.isNaN(Date.parse(ims)) && Math.floor(modified.getTime() / 1000) <= Math.floor(Date.parse(ims) / 1000)) return new NextResponse(null, { status: 304 });
    const { data: pet } = await sb.from("pets").select(PET_COLUMNS).eq("id", p[2]).maybeSingle();
    if (!pet) return new NextResponse(null, { status: 404 });
    // Never remote-delete on a lapsed membership: the pass stays, it just stops updating.
    if (!(await vaultIsOpen(sb, pet.user_id))) return new NextResponse(null, { status: 304 });
    const [extras, thumbs] = await Promise.all([passExtras(sb, pet), petThumbs(sb, pet).catch(() => ({}))]);
    const bytes = await buildPetPass(pet, { ...extras, thumbs, authToken: row.auth_token });
    return new NextResponse(Buffer.from(bytes), { headers: { "Content-Type": "application/vnd.apple.pkpass", "Last-Modified": modified.toUTCString(), "Cache-Control": "no-store" } });
  }
  return new NextResponse(null, { status: 404 });
}
