import BorderGuide from "../../components/BorderGuide";

export const metadata = {
  title: "Flying to Mexico with your dog: every step, there and back",
  description: "The screwworm certificate, the SENASICA inspection, and the CDC form to get your dog home. Every rule for flying to Mexico with a dog, in order, with official sources.",
  alternates: { canonical: "/mexico" },
};

const APHIS = "https://www.aphis.usda.gov/pet-travel/us-to-another-country-export/pet-travel-us-mexico";
const NWS_HOME = "https://www.aphis.usda.gov/sites/default/files/import-alert-nws-mexico.pdf";
const CDC = "https://www.cdc.gov/importation/dogs/rabies-free-low-risk-countries.html";
const CDC_FAQ = "https://www.cdc.gov/importation/dogs/faqs.html";

const GUIDE = {
  name: "Mexico",
  eyebrow: "FLYING TO MEXICO WITH YOUR DOG",
  title: "Take your dog to Mexico, and get them home again.",
  lead: "Two vet certificates, two 5-day windows, an inspection when you land, and a CDC form for the flight home. Here's all of it, in the order you'll need it.",
  checked: "November 13, 2026",
  stats: [["vet certificates (one each way)", "2"], ["window for each certificate", "5 days"], ["minimum age to come home", "6 months"]],
  traps: [
    { title: "Puppies can get in but not back.", body: "Dogs must be at least 6 months old on the day they return to the U.S. Check your return date before you book." },
    { title: "There are two different screwworm certificates.", body: "One from a U.S. vet to enter Mexico, and a separate one from a vet in Mexico to come home. Both must be done within 5 days of the flight." },
    { title: "Bring a clean, empty carrier.", body: "Mexican inspectors remove bedding, pads and toys, and only allow food for the day. Ticks mean your dog is held until they're identified." },
  ],
  phases: [
    {
      title: "Before you go",
      when: "Start 2 to 3 weeks out",
      steps: [
        { icon: "calendar", title: "Check your dog will be 6 months old when you come home", when: "Before you book", warn: true, body: "CDC only lets dogs 6 months or older into the U.S., including U.S. dogs coming home. Your dog also needs a microchip that a universal scanner can read.", source: CDC_FAQ },
        { icon: "plane", title: "Book your dog's spot with the airline", when: "When you book", body: "Cabin pet spots are limited on every flight, and international pet fees are often higher than domestic ones. Your Travel Pass shows your airline's exact fee, carrier size and seat rules." },
        { icon: "stethoscope", title: "Screwworm inspection certificate to enter Mexico", when: "Within 5 days of landing", body: "A USDA-accredited vet in the U.S. inspects your dog and signs a New World screwworm inspection certificate no more than 5 days before you arrive in Mexico. It doesn't need USDA endorsement. The airline checks it at the counter.", source: APHIS },
        { icon: "pin", title: "Line up a vet in Mexico for the trip home", when: "Before you leave", body: "You'll need a SENASICA-authorized vet in Mexico for your dog's certificate home. Find one before you travel so you're not searching on vacation.", source: NWS_HOME },
      ],
    },
    {
      title: "When you land in Mexico",
      when: "At the airport",
      steps: [
        { icon: "shield", title: "SENASICA inspection", body: "Take your dog in a clean carrier to the Agricultural and Livestock Health Inspection Office (OISA). Officers check for signs of disease, ticks and fleas, and fresh or healing wounds, and look at the screwworm certificate.", source: APHIS },
        { icon: "ban", title: "Bedding, toys and extra food are removed", warn: true, body: "Inspectors destroy pads, newspaper, rags and toys. Only enough food for the day of travel is allowed. If they find ticks, your dog is held until they're identified, at your cost.", source: APHIS },
      ],
    },
    {
      title: "Coming home",
      when: "The last 5 days of your trip",
      steps: [
        { icon: "stethoscope", title: "Screwworm-free certificate for U.S. re-entry", when: "Within 5 days before your flight home", warn: true, body: "A SENASICA-authorized vet in Mexico inspects your dog and certifies it free of New World screwworm within 5 days before you enter the U.S. Bring the paper certificate.", source: NWS_HOME },
        { icon: "file", title: "CDC Dog Import Form", when: "A few days before your flight home", body: "Fill it in online. If your dog has only been in the U.S. and Mexico in the past 6 months, it's the only CDC document you need, and the receipt works for repeat trips for 6 months.", source: CDC },
      ],
    },
  ],
  cats: "It's simpler. Mexico doesn't require a health certificate for pet cats from the U.S., just the inspection on arrival, and the CDC dog rules don't apply to cats. Your airline's carrier and fee rules still do.",
};

export default function MexicoPage() {
  return <BorderGuide g={GUIDE} />;
}
