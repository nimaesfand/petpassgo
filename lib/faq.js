// General answers only. Airline-specific forms, fees, sizes and deadlines are
// part of the paid Travel Pass and must not appear here.
// Each answer leads with the direct answer. The /faq page builds its FAQPage JSON-LD from this list.
import { coveredAirlineNames } from "./airlines";

const COVERED = coveredAirlineNames();

export const FAQ = [
  { q: "What is PetPassGo?", a: "A tool for flying with your pet. Tell us your trip and we show which airlines take your pet, what it costs, and everything you need to do before you fly. Pet Vault keeps your pet's passport and records for every trip." },
  { q: "Do I have to pay to start?", a: "No. Checking your trip is free. If it's a simple flight (a small pet in the cabin, inside the U.S., on one airline, with no health papers), the full checklist is free with an account. Flights with paperwork need a Travel Pass." },
  { q: "What does the Travel Pass cost and what's included?", a: "$29.99 per trip, or $14.99 with Pet Vault. You get every step for your airline, route and pet, with dates and reminders, a check that your pet's vaccines and certificates are valid for the trip, and any forms we can fill in for you, like the DOT service animal form and Hawaii's import form. Each step links to the official source." },
  { q: "Which trips need a Travel Pass?", a: "Trips with paperwork or extra steps: Mexico, Canada and Hawaii, service dogs, pets flying as cargo, and trips on two airlines. The trip check tells you which kind your trip is before you pay anything." },
  { q: "What is Pet Vault?", a: "$6.99 a month. Your pet's passport, vet-confirmed records, a live check-in code for the airport, reminders before vaccines and papers expire, and lost-pet help with a QR tag. Travel Passes are $14.99 for members. Cancel anytime in Billing." },
  { q: "Which airlines do you cover?", a: `${COVERED.length} airlines: ${COVERED.join(", ")}.` },
  { q: "Can airlines ask for paperwork for a service dog?", a: "Yes. Airlines can ask for the DOT Service Animal Air Transportation Form, and the DOT relief form for flights of 8 hours or more. Your Travel Pass fills in both for you.", guide: { href: "/blog/dot-service-animal-form", label: "The DOT service animal form" } },
  { q: "Can my emotional support animal fly?", a: "Yes, as a pet. Since 2021, U.S. airlines don't treat emotional support animals as service animals, so the airline's pet fee and carrier rules apply.", guide: { href: "/blog/service-dog-vs-esa-vs-psd-flying", label: "Why an ESA flies as a pet" } },
  { q: "What counts as a service animal on U.S. flights?", a: "A dog trained to do work or tasks for a person with a disability. A psychiatric service dog is a service dog. Emotional support animals and dogs in training aren't.", guide: { href: "/blog/service-dog-vs-esa-vs-psd-flying", label: "Service dog vs ESA vs PSD" } },
  { q: "Where does your information come from?", a: "Each airline's own website and official government sources, like the U.S. Department of Transportation, the CDC and USDA. Every step shows its source and the date we last checked it." },
  { q: "Does PetPassGo check my pet's records?", a: "Your vet can. Send them a link from Pet Vault and they confirm each record. Confirmed records show as vet verified, with the vet's name and clinic. If you change a record later, it shows as entered by you until your vet confirms it again." },
  { q: "Who can see my pet's information?", a: "Only you, unless you choose otherwise. The public passport page shows your pet's name, photo, species, breed and passport number. Everything else, like contact details and medical notes, shows only if you turn it on. The full microchip number is never shown." },
  { q: "Is the pet passport a government document?", a: "No. It's a PetPassGo record of your pet's details and papers. Official certificates come from your vet and government agencies." },
  { q: "Can I buy a QR collar tag?", a: "Metal tags are coming soon. For now you can print your pet's QR tags for free from their passport." },
  { q: "What if a requirement in my Travel Pass is wrong?", a: "If your pet is refused boarding because a requirement we showed was wrong, we refund your Travel Pass. Email support@petpassgo.com within 14 days of the flight with proof from the airline. The refund covers the Travel Pass, not flights or other costs. Full terms are on the guarantee page.", link: { href: "/guarantee", label: "Terms" } },
  { q: "Can I buy from the EU or the UK?", a: "Yes. Prices are in U.S. dollars. You have 14 days to withdraw from digital purchases, unless you choose at checkout to start right away. Details are on the guarantee page.", link: { href: "/guarantee", label: "Customers in the EU and UK" } },
];
