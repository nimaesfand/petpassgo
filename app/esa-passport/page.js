import Icon from "../../components/Icon";
import PassportLanding from "../../components/PassportLanding";

export const metadata = {
  title: "ESA Passport",
  description: "A passport for your emotional support animal, with your housing letter saved and a reminder before it expires.",
  alternates: { canonical: "/esa-passport" },
  openGraph: { title: "ESA Passport", description: "Their passport, and your housing letter, always with you." },
};

const BELL = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;

export default function EsaPassportPage({ searchParams }) {
  return (
    <PassportLanding
      kind="esa"
      preset="esa"
      track="esa_passport"
      searchParams={searchParams}
      eyebrow="ESA PASSPORT"
      title="Their passport, and your housing letter, always with you."
      sub="When your landlord asks, it's ready. Your ESA's records and your housing letter, in one place."
      items={[
        { icon: <Icon name="lock" size={20} />, text: "Your housing letter, saved and private to you" },
        { icon: BELL, text: "A reminder before your letter expires or your lease renews" },
        { icon: <Icon name="tag" size={20} />, text: "Lost? Anyone who scans their tag can reach you. You choose what they see." },
      ]}
      button="Get your ESA Passport"
      after={<>Flying soon? <a href="/assessment?pet=esa" style={{ color: "#fff", fontWeight: 800 }}>Check your trip for free.</a></>}
    />
  );
}
