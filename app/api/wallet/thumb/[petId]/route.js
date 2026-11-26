import { serviceClient } from "../../../../../lib/serverEmail";
import { petThumbs, thumbToken } from "../../../../../lib/walletData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Pet photo for Google Wallet (it needs a public https image). Only with the signed token.
export async function GET(req, { params }) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (!/^[0-9a-f-]{36}$/i.test(params.petId) || t !== thumbToken(params.petId)) return new Response("Not found", { status: 404 });
  const sb = serviceClient();
  const { data: pet } = await sb.from("pets").select("id,photo_url").eq("id", params.petId).maybeSingle();
  const thumbs = pet ? await petThumbs(sb, pet).catch(() => ({})) : {};
  if (!thumbs[3]) return new Response("Not found", { status: 404 });
  return new Response(thumbs[3], { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
}
