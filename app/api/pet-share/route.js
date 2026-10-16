import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";
import { serviceClient } from "../../../lib/serverEmail";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Creates a one-time, expiring vet/sitter share link. Only the hash is stored.
export async function POST(req) {
  try {
    const token = req.headers.get("x-sb-token") || "";
    if (!token) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const petId = String(body?.pet_id || "");
    const days = Math.min(30, Math.max(1, Number(body?.days) || 7));
    if (!UUID.test(petId)) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data: u } = await sb.auth.getUser(token);
    if (!u?.user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

    const admin = serviceClient();
    const { data: pet } = await admin.from("pets").select("id,user_id").eq("id", petId).maybeSingle();
    if (!pet || pet.user_id !== u.user.id) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

    const clear = `${randomBytes(24).toString("base64url")}${randomBytes(8).toString("hex")}`;
    const tokenHash = createHash("sha256").update(clear).digest("hex");
    const expiresAt = new Date(Date.now() + days * 86400_000).toISOString();
    const { error } = await admin.from("pet_share_cards").insert({ pet_id: petId, user_id: u.user.id, token_hash: tokenHash, expires_at: expiresAt });
    if (error) throw error;
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return NextResponse.json({ url: `${proto}://${host}/api/pet-share/${clear}`, expires_at: expiresAt });
  } catch (e) {
    console.error("pet-share create", e?.message);
    return NextResponse.json({ error: "Share links aren't available right now. You can still use the QR card below." }, { status: 503 });
  }
}
