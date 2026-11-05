// Private pet files. These rules are used by the vault upload form and by the local check script.

export const MAX_DOC_BYTES = 10 * 1024 * 1024;

export const VAULT_DOC_TYPES = [
  "Rabies",
  "Other vaccines",
  "Health certificate",
  "Airline form",
  "Microchip record",
  "Other",
];

const EXT = [".pdf", ".jpg", ".jpeg", ".png", ".heic", ".heif"];
const MIME = new Set(["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export function documentFileError(file) {
  if (!file) return "Choose a file.";
  if (file.size > MAX_DOC_BYTES) return "Use a file under 10 MB.";
  const name = String(file.name || "").toLowerCase();
  const extOk = EXT.some((ext) => name.endsWith(ext));
  const type = String(file.type || "");
  const typeOk = !type || type === "application/octet-stream" || MIME.has(type);
  if (!extOk || !typeOk) return "Use a PDF, JPG, PNG, or HEIC file.";
  return "";
}

export function documentStatus(expiresOn, today) {
  if (!expiresOn) return "No expiry";
  const exp = String(expiresOn).slice(0, 10);
  const day = String(today || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exp) || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return "No expiry";
  if (exp < day) return "Expired";
  const days = Math.round((Date.parse(`${exp}T12:00:00Z`) - Date.parse(`${day}T12:00:00Z`)) / 86400000);
  if (days <= 30) return "Expiring soon";
  return "Valid";
}

export const DOC_ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic,image/heif";
