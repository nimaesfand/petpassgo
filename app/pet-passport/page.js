import Icon from "../../components/Icon";
import PassportLanding from "../../components/PassportLanding";

export const metadata = {
  title: "Pet Passport",
  description: "Everything your airline and vet ask for, plus every record, in one beautiful passport for your pet.",
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
      sub="Everything your airline and vet ask for, plus every record, in one beautiful passport."
      items={[
        { icon: <Icon name="plane" size={20} />, text: "Know exactly what your airline needs" },
        { icon: <Icon name="stethoscope" size={20} />, text: "Vaccines and vet records in one place, with reminders" },
        { icon: <Icon name="tag" size={20} />, text: "A lost pet tag that reaches you, without sharing your number" },
      ]}
      button="Get your Pet Passport"
    />
  );
}
