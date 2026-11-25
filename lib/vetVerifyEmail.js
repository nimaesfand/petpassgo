import { SITE_URL } from "./site";
import { brandedEmail, esc } from "./emailHtml";

const fmt = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

// The email a vet clinic gets when an owner asks them to confirm records.
// records: optional [{ name, date_given, expires_on }] the owner entered (shown so the clinic knows what to check).
export function vetRequestEmail({ owner, pet, token, reminder = false, records = [], photoCid = null }) {
  const who = owner || "A pet owner";
  const desc = [pet.breed, pet.animal_type].filter(Boolean).join(", ");
  const link = `${SITE_URL}/vet-verify/${token}`;
  const subject = `${reminder ? "Reminder: " : ""}Please confirm ${pet.name}'s vaccine records`;
  const text = [
    "Hello,",
    "",
    reminder
      ? `A few days ago ${who} asked you to confirm the vaccine records for ${pet.name}${desc ? ` (${desc})` : ""}. Here's a fresh link in case it got buried.`
      : `${who} keeps ${pet.name}'s${desc ? ` (${desc})` : ""} records in PetPassGo and asked us to have their vet confirm the vaccines they entered.`,
    "",
    "It takes about a minute. Open this private link, check each vaccine against your files, and tick the ones that match:",
    link,
    "",
    "- No account and nothing to install.",
    "- You only see what the owner entered. You don't send us any records from your system.",
    "- Your name and clinic appear next to the records you confirm.",
    "",
    `Reply to this email to reach ${who} directly. If this isn't your patient, just ignore it. The link works once and expires 14 days after the first request.`,
    "",
    "Thank you,",
    "PetPassGo",
  ].join("\n");
  const html = brandedEmail({
    preheader: `${who} asked you to confirm ${pet.name}'s vaccines. About a minute, no account.`,
    eyebrow: reminder ? "FRIENDLY REMINDER" : "A QUICK REQUEST FROM YOUR CLIENT",
    title: `Please confirm ${pet.name}'s vaccine records`,
    intro: [
      reminder
        ? `A few days ago ${esc(who)} asked you to confirm ${esc(pet.name)}'s vaccines. Here's a fresh link in case it got buried.`
        : `${esc(who)} keeps ${esc(pet.name)}'s records in PetPassGo and would love your confirmation on the vaccines they entered.`,
      "It takes about a minute: open the link, check each vaccine against your files and tick the ones that match.",
    ],
    pet,
    photoCid,
    rows: (records || []).slice(0, 8).map((r) => ({ label: r.name, note: [r.date_given ? `Given ${fmt(r.date_given)}` : "", r.expires_on ? `Due ${fmt(r.expires_on)}` : ""].filter(Boolean).join(" · ") || "Entered by the owner" })),
    button: { label: "Confirm records", href: link },
    after: [
      "<b>No account, nothing to install.</b> You only see what the owner entered, and nothing is pulled from your system.",
      `Your name and clinic appear next to the records you confirm. Questions? Reply and it goes straight to ${esc(who)}.`,
    ],
    footer: `This request comes from ${esc(who)} through PetPassGo. Not your patient? Just ignore it. The link works once and expires 14 days after the first request.`,
  });
  return { subject, text, html };
}

// "Connect my vet": asks the clinic to add the pet's private PetPassGo address
// to the file, so reminders and records also reach the owner's Pet Vault.
export function vetConnectEmail({ owner, ownerEmail, pet, inbox, clinic, photoCid = null }) {
  const who = owner || "Your client";
  const subject = `Please add ${pet.name}'s records address to their file`;
  const text = [
    clinic ? `Hello ${clinic} team,` : "Hello,",
    "",
    `${who} keeps ${pet.name}'s records in PetPassGo and asked us to send you this request.`,
    "",
    `Please add this email to ${pet.name}'s file as an additional contact for reminders and records:`,
    inbox,
    "",
    `Anything you send there (vaccine reminders, certificates, visit summaries) goes straight into ${pet.name}'s Pet Vault, and ${who} checks it before anything is saved. Nothing changes in your system.`,
    "",
    `${who} approved this request.${ownerEmail ? ` You can reach them at ${ownerEmail}, or just reply to this email.` : " Reply to this email to reach them."}`,
    "",
    "Thank you,",
    "PetPassGo",
  ].join("\n");
  const html = brandedEmail({
    preheader: `Add one email to ${pet.name}'s file and your reminders reach ${who} in their Pet Vault.`,
    eyebrow: "A QUICK REQUEST FROM YOUR CLIENT",
    title: `Add ${pet.name}'s records address to their file`,
    intro: [
      `${clinic ? `Hello ${esc(clinic)} team,` : "Hello,"}`,
      `${esc(who)} keeps ${esc(pet.name)}'s records in PetPassGo and asked us to send you this request. Please add this email as an additional contact on ${esc(pet.name)}'s file:`,
      `<span style="display:block;background:#14213D;color:#F2B84B;border-radius:12px;padding:14px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:16px;font-weight:700;text-align:center;word-break:break-all">${esc(inbox)}</span>`,
    ],
    pet,
    photoCid,
    rows: [
      { label: "What happens", value: `Reminders and records you send there go straight into ${pet.name}'s Pet Vault.` },
      { label: "Nothing changes for you", value: "Keep sending as usual. No account, no software, nothing to install." },
      { label: "Approved by the owner", value: `${who} asked us to send this. Questions? Reply and it goes to them.` },
    ],
    footer: `Sent on behalf of ${esc(who)} through PetPassGo.`,
  });
  return { subject, text, html };
}
