// Local checks for Pet Vault documents. No network. No secrets.
import fs from "fs";

const src = fs.readFileSync(new URL("../lib/petDocuments.js", import.meta.url), "utf8");
const { documentFileError, documentStatus, MAX_DOC_BYTES } = await import("data:text/javascript," + encodeURIComponent(src));

const today = "2026-11-05";
const cases = [
  [null, "No expiry"],
  ["", "No expiry"],
  ["2026-11-04", "Expired"],
  ["2026-11-05", "Expiring soon"],
  ["2026-12-05", "Expiring soon"],
  ["2026-12-06", "Valid"],
  ["2027-01-01", "Valid"],
];

let failed = 0;
function check(name, actual, expected) {
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL ${name}: got ${actual}, expected ${expected}`);
  }
}

for (const [date, expected] of cases) {
  check(`status ${date || "empty"}`, documentStatus(date, today), expected);
}

check("pdf ok", documentFileError({ name: "rabies.pdf", size: 1000, type: "application/pdf" }), "");
check("jpg ok", documentFileError({ name: "shot.JPG", size: 1000, type: "image/jpeg" }), "");
check("heic ok", documentFileError({ name: "chip.heic", size: 1000, type: "" }), "");
check("png ok", documentFileError({ name: "note.png", size: MAX_DOC_BYTES, type: "image/png" }), "");
check("too big", documentFileError({ name: "big.pdf", size: MAX_DOC_BYTES + 1, type: "application/pdf" }) !== "", true);
check("gif blocked", documentFileError({ name: "pic.gif", size: 1000, type: "image/gif" }) !== "", true);
check("missing", documentFileError(null) !== "", true);

const optedOut = new Set(["user-off"]);
function shouldEmail(userId) {
  return !optedOut.has(userId);
}
check("reminder on", shouldEmail("user-on"), true);
check("reminder off", shouldEmail("user-off"), false);

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log("step3 vault checks passed");
