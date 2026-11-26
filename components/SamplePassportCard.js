import { Wordmark } from "./Logo";
import PetPassport from "./PetPassport";
import { tokens, font } from "../lib/theme";

// A static sample passport for landing pages, matching the Nov 25 mockups.
// Marked SAMPLE on the photo; never shown as a real customer.
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const SAMPLES = {
  service: {
    name: "Benny",
    holder: ["HANDLER", "Alex Morgan"],
    photo: "/images/hero-golden-retriever.jpg",
    pos: "70% 28%",
    alt: "Benny, a golden retriever at the airport",
    fields: [["SPECIES", "Dog"], ["BREED", "Golden Retriever"], ["SEX", "Male"], ["BORN", "Apr 12, 2021"], ["WEIGHT", "68 lb"], ["TRAINING", "Task trained"], ["MICROCHIP", "•••• 6789", true], ["ISSUED", "Nov 1, 2026"]],
    mrz: ["P<PPGBENNY<<GOLDEN<RETRIEVER<<<<<<", "PPGSAMPLE<DOG<210412<SVC<<<<<<<"],
    badge: "service",
  },
  esa: {
    name: "Luna",
    holder: ["OWNER", "Jamie Cruz"],
    icon: "cat",
    photo: "/images/luna-ginger-maine-coon.jpg",
    pos: "70% 42%",
    alt: "Luna, a ginger Maine Coon on a sofa",
    fields: [["SPECIES", "Cat"], ["BREED", "Maine Coon"], ["SEX", "Female"], ["BORN", "Mar 3, 2022"], ["WEIGHT", "14 lb"], ["TRAINING", "Leash trained"], ["MICROCHIP", "•••• 4410", true], ["ISSUED", "Nov 1, 2026"]],
    mrz: ["P<PPGLUNA<<MAINE<COON<<<<<<<<<<<<", "PPGSAMPLE<CAT<220303<ESA<<<<<<<"],
    badge: "esa",
  },
  pet: {
    name: "Milo",
    holder: ["OWNER", "Sam Rivera"],
    icon: "dog",
    photo: "/images/milo-dachshund-park.jpg",
    pos: "66% 62%",
    alt: "Milo, a black and tan dachshund in a park",
    fields: [["SPECIES", "Dog"], ["BREED", "Dachshund"], ["SEX", "Male"], ["BORN", "Jun 2, 2020"], ["WEIGHT", "11 lb"], ["TRAINING", "House trained"], ["MICROCHIP", "•••• 2048", true], ["ISSUED", "Nov 1, 2026"]],
    mrz: ["P<PPGMILO<<DACHSHUND<<<<<<<<<<<<<", "PPGSAMPLE<DOG<200602<PET<<<<<<<"],
    badge: null,
  },
};

const CAT = <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#B8A47A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 26 12 10l12 8h16l12-8-2 16c3 4 4 8 4 12 0 12-11 18-22 18S10 50 10 38c0-4 1-8 4-12z" /><circle cx="24" cy="34" r="2" fill="#B8A47A" /><circle cx="40" cy="34" r="2" fill="#B8A47A" /><path d="M30 41h4l-2 2z" /></svg>;
const DOG = <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#B8A47A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 16c-8 0-12 6-12 16 0 5 3 7 6 6l4-10" /><path d="M44 16c8 0 12 6 12 16 0 5-3 7-6 6l-4-10" /><path d="M20 16h24c2 6 4 12 4 20 0 10-7 16-16 16s-16-6-16-16c0-8 2-14 4-20z" /><circle cx="26" cy="32" r="2" fill="#B8A47A" /><circle cx="38" cy="32" r="2" fill="#B8A47A" /><path d="M29 41h6l-3 3z" /></svg>;
export const PET_ICONS = { cat: CAT, dog: DOG };

function Label({ children }) {
  return <div style={{ fontFamily: font.body, fontSize: 9.5, fontWeight: 800, letterSpacing: ".16em", color: "#4B5565" }}>{children}</div>;
}

// Samples render with the exact card customers keep (components/PetPassport.js).
const SAMPLE_PETS = {
  service: { id: "sample-service", name: "Benny", handler_name: "Alex Morgan", animal_type: "Dog", role: "Service animal", breed: "Golden Retriever", sex: "Male", date_of_birth: "2021-04-12", weight_lb: 68, training: { levels: ["tasks"] }, service_attested_at: "2026-11-01T12:00:00Z", passport_no: "PPG-SAMPLE", passport_issued_at: "2026-11-01T12:00:00Z", chip: "•••• 6789" },
  esa: { id: "sample-esa", name: "Luna", handler_name: "Jamie Cruz", animal_type: "Cat", role: "Emotional support animal", breed: "Maine Coon", sex: "Female", date_of_birth: "2022-03-03", weight_lb: 14, training: { levels: ["leash"] }, passport_no: "PPG-SAMPLE", passport_issued_at: "2026-11-01T12:00:00Z", chip: "•••• 4410" },
  pet: { id: "sample-pet", name: "Milo", handler_name: "Sam Rivera", animal_type: "Dog", role: "Pet", breed: "Dachshund", sex: "Male", date_of_birth: "2020-06-02", weight_lb: 11, training: { levels: ["house"] }, passport_no: "PPG-SAMPLE", passport_issued_at: "2026-11-01T12:00:00Z", chip: "•••• 2048" },
};

export default function SamplePassportCard({ kind = "service" }) {
  const s = SAMPLES[kind];
  const pet = SAMPLE_PETS[kind];
  // eslint-disable-next-line @next/next/no-img-element
  const photo = s.photo ? <img src={s.photo} alt={s.alt} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos || "62% 22%" }} /> : <div role="img" aria-label={s.alt} className="flex items-center justify-center" style={{ width: "100%", height: "100%", background: "#F4ECDA" }}>{PET_ICONS[s.icon]}</div>;
  return (
    <div aria-label={`Sample passport for ${s.name}`} style={{ width: 350, maxWidth: "100%" }}>
      <PetPassport frontOnly sample sheet pet={pet} photo={photo} chipValue={pet.chip} />
    </div>
  );
}
