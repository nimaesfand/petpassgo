import PrivacyChoices from "../../components/PrivacyChoices";
import { LegalPage, P } from "../../components/LegalPage";

export const metadata = {
  title: "Your privacy choices",
  description: "Turn off advertising measurement on PetPassGo.",
  alternates: { canonical: "/privacy-choices" },
};

export default function PrivacyChoicesPage() {
  return (
    <LegalPage title="Your privacy choices" updated="November 13, 2026">
      <P>PetPassGo uses advertising pixels to see which of our ads bring visitors and whether those visits lead to a trip check, sign-up or purchase. They never receive your pet records, documents or trip details. You can switch this off here for this browser.</P>
      <PrivacyChoices />
      <P>Your browser may also send a Do Not Track or Global Privacy Control signal. When it does, we treat it as an opt-out automatically. This setting is saved in this browser, so set it again on other devices or if you clear your browser data.</P>
    </LegalPage>
  );
}
