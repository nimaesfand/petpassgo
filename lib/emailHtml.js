import { SITE_URL } from "./site";

// One branded email look for everything PetPassGo sends: navy header with the
// wordmark, a passport-style pet card, short body, one orange button.
// Email-safe: tables + inline styles only.

const C = { navy: "#14213D", navyDeep: "#0B1529", orange: "#C2410C", gold: "#F2B84B", cream: "#FBF7EE", ink: "#1A2333", muted: "#4B5565", line: "#E6DCC6", sky: "#F3F5F9", green: "#2F7A4A" };
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export function esc(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// pet: { name, breed, animal_type, role, passport_no }, photoCid: content_id of an inline photo (optional)
function petCard(pet, photoCid) {
  if (!pet) return "";
  const role = pet.role === "Service animal" ? ["SERVICE DOG", "#1D4ED8"] : pet.role === "Emotional support animal" ? ["EMOTIONAL SUPPORT ANIMAL", "#C21E1E"] : null;
  const desc = [pet.breed, pet.animal_type].filter(Boolean).join(" · ");
  const photo = photoCid
    ? `<img src="cid:${esc(photoCid)}" width="84" height="84" alt="${esc(pet.name)}" style="display:block;width:84px;height:84px;border-radius:42px;border:3px solid ${C.gold};object-fit:cover" />`
    : `<div style="width:84px;height:84px;border-radius:42px;border:3px solid ${C.gold};background:${C.navy};text-align:center;line-height:84px;font-family:${FONT};font-size:36px;font-weight:800;color:${C.gold}">${esc(String(pet.name || "?").slice(0, 1).toUpperCase())}</div>`;
  return `
  <tr><td style="padding:0 28px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border:1px solid ${C.line};border-radius:18px">
      <tr><td style="padding:16px 18px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td valign="middle" style="padding-right:16px">${photo}</td>
          <td valign="middle" style="font-family:${FONT}">
            <div style="font-size:10px;font-weight:800;letter-spacing:2px;color:${C.muted}">PET PASSPORT${pet.passport_no ? ` · <span style="font-family:${MONO}">${esc(pet.passport_no)}</span>` : ""}</div>
            <div style="font-size:26px;font-weight:800;color:${C.navy};line-height:1.15;margin-top:2px">${esc(pet.name)}</div>
            ${desc ? `<div style="font-size:14px;color:${C.muted};margin-top:2px">${esc(desc)}</div>` : ""}
            ${role ? `<div style="display:inline-block;margin-top:8px;background:${role[1]};color:#fff;font-size:10.5px;font-weight:800;letter-spacing:1.5px;border-radius:8px;padding:4px 9px">${role[0]}</div>` : ""}
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>`;
}

// rows: [{ label, value, note }] shown as a clean list (e.g. attached records)
function rowsBlock(rows) {
  if (!rows?.length) return "";
  const items = rows.map((r) => `
      <tr><td style="padding:10px 0;border-bottom:1px solid #EEF1F5;font-family:${FONT}">
        <div style="font-size:15px;font-weight:700;color:${C.navy}">${esc(r.label)}</div>
        ${r.value ? `<div style="font-size:14px;color:${C.ink};margin-top:2px">${esc(r.value)}</div>` : ""}
        ${r.note ? `<div style="font-size:13px;color:${r.good ? C.green : C.muted};margin-top:2px;font-weight:${r.good ? 700 : 400}">${esc(r.note)}</div>` : ""}
      </td></tr>`).join("");
  return `<tr><td style="padding:6px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table></td></tr>`;
}

export function brandedEmail({ preheader = "", eyebrow = "", title, intro = [], pet, photoCid, rows, button, after = [], footer }) {
  const paras = (list, size = 16) => (Array.isArray(list) ? list : [list]).filter(Boolean)
    .map((t) => `<p style="margin:0 0 12px;font-family:${FONT};font-size:${size}px;line-height:1.55;color:${C.ink}">${t}</p>`).join("");
  const btn = button ? `
  <tr><td style="padding:20px 28px 6px">
    <a href="${esc(button.href)}" style="display:inline-block;background:${C.orange};color:#ffffff;font-family:${FONT};font-size:16px;font-weight:800;text-decoration:none;border-radius:999px;padding:14px 26px">${esc(button.label)}</a>
  </td></tr>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.sky}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sky}"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(20,33,61,.08)">
    <tr><td style="background:${C.navy};padding:20px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:${FONT};font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#ffffff">PetPass<span style="color:${C.gold}">Go</span></td>
        <td align="right" style="font-family:${FONT};font-size:10px;font-weight:800;letter-spacing:2px;color:${C.gold}">PET PASSPORT</td>
      </tr></table>
    </td></tr>
    <tr><td style="height:3px;background:${C.gold};line-height:3px;font-size:0">&nbsp;</td></tr>
    <tr><td style="padding:26px 28px 8px">
      ${eyebrow ? `<div style="font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:1.5px;color:${C.orange};margin-bottom:6px">${esc(eyebrow)}</div>` : ""}
      <h1 style="margin:0 0 12px;font-family:${FONT};font-size:26px;line-height:1.2;font-weight:800;color:${C.navy}">${esc(title)}</h1>
      ${paras(intro)}
    </td></tr>
    ${petCard(pet, photoCid)}
    ${rowsBlock(rows)}
    ${btn}
    ${after?.length ? `<tr><td style="padding:14px 28px 0">${paras(after, 14.5)}</td></tr>` : ""}
    <tr><td style="padding:22px 28px 26px">
      <div style="border-top:1px solid #EEF1F5;padding-top:14px;font-family:${FONT};font-size:12.5px;line-height:1.5;color:${C.muted}">${footer || `Sent with <a href="${SITE_URL}" style="color:${C.navy};font-weight:700;text-decoration:none">PetPassGo</a>, where pet owners keep their pet's passport and records.`}</div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

// Inline pet photo attachment from the private bucket, if the pet has one.
export async function petPhotoAttachment(sb, pet) {
  if (!pet?.photo_url || /^https?:/i.test(pet.photo_url)) return null;
  try {
    const { data } = await sb.storage.from("pet-documents").download(pet.photo_url);
    if (!data) return null;
    const buf = Buffer.from(await data.arrayBuffer());
    if (buf.length > 3 * 1024 * 1024) return null;
    const type = data.type || "image/jpeg";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    return { filename: `pet.${ext}`, content: buf.toString("base64"), content_id: "petphoto", content_type: type };
  } catch {
    return null;
  }
}
