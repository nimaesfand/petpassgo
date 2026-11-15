import { SITE_URL } from "./site";

// The email a vet clinic gets when an owner asks them to confirm records.
export function vetRequestEmail({ owner, pet, token, reminder = false }) {
  const who = owner || "A pet owner";
  const desc = [pet.breed, pet.animal_type].filter(Boolean).join(", ");
  return {
    subject: `${reminder ? "Reminder: " : ""}Please confirm ${pet.name}'s vaccine records`,
    text: [
      "Hello,",
      "",
      reminder
        ? `A few days ago ${who} asked you to confirm the vaccine records for ${pet.name}${desc ? ` (${desc})` : ""}. Here's a fresh link in case it got buried.`
        : `${who} is getting ready to travel with ${pet.name}${desc ? ` (${desc})` : ""} and asked us to have their vet confirm the vaccine records they entered.`,
      "",
      "It takes about a minute. Open this private link, check each vaccine against your files, and tick the ones that match:",
      `${SITE_URL}/vet-verify/${token}`,
      "",
      "What this means for you:",
      "- No account and nothing to install.",
      "- You only see what the owner entered. You don't send us any records from your system.",
      "- Your name and clinic appear next to the records you confirm, on the pet's PetPassGo passport.",
      "",
      `This request comes from ${who} through PetPassGo. Reply to this email to reach them directly.`,
      "If this isn't your patient, or you'd rather not, just ignore this email. The link works once and expires 14 days after the first request.",
      "",
      "Thank you,",
      "PetPassGo",
    ].join("\n"),
  };
}
