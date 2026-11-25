import Icon from "../../components/Icon";
import PassportLanding from "../../components/PassportLanding";

export const metadata = {
  title: "Service Dog Passport",
  description: "A passport for your service dog with everything your airline can ask for, filled in before you fly.",
  alternates: { canonical: "/service-dog-passport" },
  openGraph: { title: "Service Dog Passport", description: "Your partner works hard. Give them papers that look the part.", images: ["/images/hero-golden-retriever.jpg"] },
};

const SIGN = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 17c3-3 5-8 7-8s1 6 3 6 3-3 5-3" /><path d="M3 21h18" /></svg>;

export default function ServiceDogPassportPage({ searchParams }) {
  return (
    <PassportLanding
      kind="service"
      preset="service"
      track="service_dog_passport"
      searchParams={searchParams}
      eyebrow="SERVICE DOG PASSPORT"
      title="Your partner works hard. Give them papers that look the part."
      sub="Everything your airline can ask for, filled in before you fly."
      items={[
        { icon: <Icon name="file" size={20} />, text: "Your DOT forms, filled in and ready" },
        { icon: SIGN, text: "Your signed handler statement, kept on file" },
        { icon: <Icon name="smartphone" size={20} />, text: "One tap shows the gate agent everything" },
      ]}
      button="Get your Service Dog Passport"
    />
  );
}
