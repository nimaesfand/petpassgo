import Icon from "../../components/Icon";
import PassportLanding from "../../components/PassportLanding";

export const metadata = {
  title: "Pet Passport",
  description: "Their records, their airline's rules and every reminder, in one place.",
  alternates: { canonical: "/pet-passport" },
  openGraph: { title: "Pet Passport", description: "Your best friend deserves a passport too." },
};

export default function PetPassportPage({ searchParams }) {
  return (
    <PassportLanding
      kind="pet"
      preset="pet"
      track="pet_passport"
      searchParams={searchParams}
      eyebrow="PET PASSPORT"
      title="Your best friend deserves a passport too."
      sub="Their records, their airline's rules and every reminder, in one place."
      items={[
        { icon: <Icon name="plane" size={20} />, text: "What your airline requires, before you book" },
        { icon: <Icon name="send" size={20} />, text: "Groomer, daycare or boarding needs proof? We send it for you." },
        { icon: <Icon name="tag" size={20} />, text: "Lost? Anyone who scans their tag can reach you. You choose what they see." },
      ]}
      button="Get your Pet Passport"
    />
  );
}
