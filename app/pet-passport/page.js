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
        { icon: <Icon name="send" size={20} />, text: "Groomer or boarding asking for records? We send them for you." },
        { icon: <Icon name="tag" size={20} />, text: "If they ever get lost, anyone who scans their tag can message you. Your number stays hidden." },
      ]}
      button="Get your Pet Passport"
      after={<>Flying with a small pet in the cabin? <a href="/assessment?pet=dog" style={{ color: "#fff", fontWeight: 800 }}>Check my pet&apos;s trip</a></>}
    />
  );
}
