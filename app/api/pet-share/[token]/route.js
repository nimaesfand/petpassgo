import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { serviceClient } from "../../../../lib/serverEmail";

export const dynamic = "force-dynamic";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const date = (v) => (v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const last4 = (v) => {
  const s = String(v || "").replace(/[^0-9A-Za-z]/g, "");
  return s ? `•••• ${s.slice(-4)}` : "Not recorded";
};

export async function GET(req, { params }) {
  const unavailable = (msg) => new NextResponse(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PetPassGo share card</title><body style="font-family:system-ui;background:#E8EEF7;padding:24px"><main style="max-width:560px;margin:40px auto;background:white;border-radius:20px;padding:28px;text-align:center"><h1 style="color:#14213D">This share link isn't available</h1><p style="color:#52606D">${esc(msg)}</p></main></body>`, { status: 410, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  try {
    const tokenHash = createHash("sha256").update(String(params.token || "")).digest("hex");
    const admin = serviceClient();
    const { data: card } = await admin.from("pet_share_cards").select("*").eq("token_hash", tokenHash).maybeSingle();
    if (!card || card.revoked_at || new Date(card.expires_at) <= new Date()) return unavailable("It may have expired or been turned off by the owner. Please ask them for a new link.");
    const [{ data: pet }, { data: records }] = await Promise.all([
      admin.from("pets").select("*").eq("id", card.pet_id).maybeSingle(),
      admin.from("pet_health_records").select("*").eq("pet_id", card.pet_id).order("expires_on", { ascending: true, nullsFirst: false }),
    ]);
    if (!pet) return unavailable("This pet profile could not be found.");
    await admin.from("pet_share_cards").update({ last_viewed_at: new Date().toISOString(), view_count: (card.view_count || 0) + 1 }).eq("id", card.id);

    const groups = [
      ["Medications", (records || []).filter((r) => r.kind === "medication")],
      ["Allergies", (records || []).filter((r) => r.kind === "allergy")],
      ["Vaccines", (records || []).filter((r) => r.kind === "vaccine")],
      ["Care notes", (records || []).filter((r) => r.kind === "note")],
    ];
    const groupHtml = groups.filter(([, rows]) => rows.length).map(([title, rows]) => `<section><h2>${title}</h2>${rows.map((r) => `<div class="row"><b>${esc(r.name)}</b><span>${esc([date(r.date_given), r.expires_on ? `expires ${date(r.expires_on)}` : "", r.clinic || ""].filter(Boolean).join(" · "))}</span>${r.notes ? `<small>${esc(r.notes)}</small>` : ""}</div>`).join("")}</section>`).join("");
    const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(pet.name)}'s PetPassGo share card</title><style>
      body{font-family:system-ui,-apple-system,sans-serif;background:#E8EEF7;color:#1F2A37;margin:0;padding:18px}main{max-width:640px;margin:0 auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 10px 30px rgba(20,33,61,.12)}
      header{background:#14213D;color:#fff;padding:22px}h1{font-size:30px;margin:4px 0}h2{font-size:18px;color:#14213D;margin:20px 0 6px}.body{padding:6px 22px 24px}.muted{color:#718096;font-size:14px}.row{padding:9px 0;border-top:1px solid #E5EAF1;display:grid;gap:2px}.row span,.row small{color:#52606D;font-size:14px}.facts{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:15px}.facts dt{color:#718096}.facts dd{margin:0;font-weight:600}img.pet{width:100%;max-height:320px;object-fit:cover}button{background:#C2410C;color:white;border:0;border-radius:999px;padding:12px 20px;font-weight:700;width:100%;margin-top:20px}@media print{button{display:none}body{background:#fff;padding:0}main{box-shadow:none}}
    </style></head><body><main>
      <header><div style="letter-spacing:.14em;font-size:12px;color:#F2B84B;font-weight:700">PETPASSGO SHARE CARD</div><h1>${esc(pet.name)}</h1><div>${esc([pet.breed, pet.animal_type, pet.sex].filter(Boolean).join(" · "))}</div></header>
      <img class="pet" src="/api/pet-photo/${esc(pet.id)}" alt="" onerror="this.remove()">
      <div class="body">
        <p class="muted">Shared by the owner for a vet, sitter or groomer. This link expires ${esc(new Date(card.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))}. Health details are owner-entered and not verified by PetPassGo.</p>
        <dl class="facts">
          <dt>Microchip</dt><dd>${last4(pet.microchip_number)}</dd>
          ${pet.vet_name || pet.vet_phone ? `<dt>Vet</dt><dd>${esc([pet.vet_name, pet.vet_phone].filter(Boolean).join(" · "))}</dd>` : ""}
          ${pet.emergency_contact_name || pet.emergency_contact_phone ? `<dt>Emergency</dt><dd>${esc([pet.emergency_contact_name, pet.emergency_contact_phone].filter(Boolean).join(" · "))}</dd>` : ""}
        </dl>
        ${groupHtml || '<p class="muted">No health records were added to this share card.</p>'}
        <button onclick="window.print()">Print / save as PDF</button>
      </div>
    </main></body></html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (e) {
    console.error("pet-share view", e?.message);
    return unavailable("Please ask the owner for a new link.");
  }
}
