import BorderGuide from "../../components/BorderGuide";

export const metadata = {
  title: "Flying to Canada with your dog: every step, there and back",
  description: "The rabies certificate Canada checks, what happens at the border, and the CDC form to bring your dog home. Every rule for flying to Canada with a dog, with official sources.",
  alternates: { canonical: "/canada" },
};

const APHIS = "https://www.aphis.usda.gov/pet-travel/us-to-another-country-export/pet-travel-us-canada";
const CFIA = "https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports/import-policies/general/reference-document";
const CDC = "https://www.cdc.gov/importation/dogs/rabies-free-low-risk-countries.html";
const CDC_FAQ = "https://www.cdc.gov/importation/dogs/faqs.html";

const GUIDE = {
  name: "Canada",
  eyebrow: "FLYING TO CANADA WITH YOUR DOG",
  title: "Take your dog to Canada, and get them home again.",
  lead: "Canada mostly wants one thing: a proper rabies certificate. Coming home, the U.S. wants a CDC form. Here's exactly what each one needs.",
  checked: "November 13, 2026",
  stats: [["document for adult dogs", "1"], ["quarantine with the right papers", "None"], ["old to come home", "6 mo+"]],
  traps: [
    { title: "Not every rabies paper counts.", body: "It must be signed by a licensed vet, in English or French, identify your dog, give the vaccine type and date, and still be valid. A missing or expired one can mean a vaccination order at your cost, or your dog being sent back." },
    { title: "Puppies can get in but not back.", body: "Dogs must be at least 6 months old on the day they return to the U.S. Check your return date before you book." },
    { title: "Don't forget the trip home.", body: "Every dog entering the U.S. needs a CDC Dog Import Form receipt, including U.S. dogs coming back from Canada." },
  ],
  phases: [
    {
      title: "Before you go",
      when: "Start 2 weeks out",
      steps: [
        { icon: "calendar", title: "Check your dog will be 6 months old when you come home", when: "Before you book", warn: true, body: "CDC only lets dogs 6 months or older into the U.S., including U.S. dogs coming home. Your dog also needs a microchip that a universal scanner can read.", source: CDC_FAQ },
        { icon: "file", title: "Rabies vaccination certificate", when: "Must be current on travel day", body: "Dogs 8 months and older need only this, no health certificate. It must be signed by a licensed vet, in English or French, identify your dog, and show the vaccine type, the date given, and that it's still valid.", source: APHIS },
        { icon: "plane", title: "Book your dog's spot with the airline", when: "When you book", body: "Cabin pet spots are limited. Some airlines also need you to check in with an agent, not online. Your Travel Pass shows your airline's exact fee, carrier size and check-in rules." },
      ],
    },
    {
      title: "When you land in Canada",
      when: "At the border",
      steps: [
        { icon: "shield", title: "Show the rabies certificate if asked", body: "Pet dogs and cats that meet the rules aren't quarantined. If the certificate is missing or out of date, an inspector can order your dog vaccinated at your cost, and animals that don't meet the rules can be ordered out of Canada.", source: CFIA },
      ],
    },
    {
      title: "Coming home",
      when: "Before your flight back",
      steps: [
        { icon: "file", title: "CDC Dog Import Form", when: "A few days before your flight home", body: "Fill it in online. If your dog has only been in the U.S. and Canada in the past 6 months, it's the only CDC document you need. The receipt is good for 6 months and for repeat trips back from Canada.", source: CDC },
      ],
    },
  ],
  cats: "Cats 3 months and older need a vet-signed rabies certificate that identifies the cat and shows a current vaccination. No health certificate, and the CDC dog rules don't apply to cats.",
};

export default function CanadaPage() {
  return <BorderGuide g={GUIDE} />;
}
