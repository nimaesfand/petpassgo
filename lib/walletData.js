import { randomBytes, createHmac } from "crypto";
import { ImageResponse } from "next/og";
import { createElement as h } from "react";
import { taskGroupsLine, trainingSummary } from "./training.js";
import { SITE_URL } from "./site.js";

// Shared by Apple and Google Wallet: the pet row, its pass token, the rabies line
// and a square face-crop thumbnail made on the server (no browser needed).
export const PET_COLUMNS = "id,user_id,name,breed,animal_type,passport_no,role,sex,color,weight_lb,date_of_birth,training,microchip_number,handler_name,emergency_contact_name,emergency_contact_phone,show_contact_on_public_id,passport_issued_at,service_attested_at,photo_url,public_slug";

export async function walletPassRow(sb, petId) {
  const { data } = await sb.from("wallet_passes").select("*").eq("pet_id", petId).maybeSingle();
  if (data) return data;
  const row = { pet_id: petId, auth_token: randomBytes(24).toString("hex") };
  await sb.from("wallet_passes").insert(row);
  const { data: again } = await sb.from("wallet_passes").select("*").eq("pet_id", petId).maybeSingle();
  return again || row;
}

export async function passExtras(sb, pet) {
  const { data: rab } = await sb.from("pet_health_records").select("expires_on,verified_at").eq("pet_id", pet.id).ilike("name", "%rabies%").order("expires_on", { ascending: false, nullsFirst: false }).limit(1);
  const t = pet.training || {};
  const groups = Array.isArray(t.tasks) && t.tasks.length ? taskGroupsLine(t.tasks).split(", ").slice(0, 2).join(" · ") : "";
  return { rabies: rab?.[0] || null, trainingLine: groups || trainingSummary(t) || "" };
}

function storagePath(v) {
  const s = String(v || "");
  for (const m of ["/object/public/pet-documents/", "/object/sign/pet-documents/"]) { const i = s.indexOf(m); if (i !== -1) return decodeURIComponent(s.slice(i + m.length).split("?")[0]); }
  return s || null;
}

// Square PNGs at 90/180/270 px, cropped on the pet (cover, a little above center for faces).
export async function petThumbs(sb, pet) {
  const path = storagePath(pet.photo_url);
  if (!path) return {};
  const { data: blob } = await sb.storage.from("pet-documents").download(path);
  if (!blob) return {};
  const buf = Buffer.from(await blob.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return {};
  const mime = buf[0] === 0x89 ? "image/png" : "image/jpeg";
  const src = `data:${mime};base64,${buf.toString("base64")}`;
  const out = {};
  for (const [k, size] of [[1, 90], [2, 180], [3, 270]]) {
    try {
      const res = new ImageResponse(
        h("div", { style: { display: "flex", width: size, height: size, background: "#14213D" } },
          h("img", { src, width: size, height: size, style: { width: size, height: size, objectFit: "cover", objectPosition: "50% 35%" } })),
        { width: size, height: size },
      );
      out[k] = Buffer.from(await res.arrayBuffer());
    } catch { /* leave this size out */ }
  }
  return out;
}

// A public, unguessable URL for the pet photo (Google Wallet needs an https image).
export function thumbToken(petId) {
  const key = process.env.WALLET_THUMB_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHmac("sha256", key).update(`thumb:${petId}`).digest("hex").slice(0, 32);
}
export const thumbUrl = (petId) => `${SITE_URL}/api/wallet/thumb/${petId}?t=${thumbToken(petId)}`;
