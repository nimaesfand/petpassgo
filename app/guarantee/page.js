import { LegalPage, H, P, UL, Email } from "../../components/LegalPage";

export const metadata = {
  title: "Flight-Ready Guarantee",
  description: "If your pet is refused boarding because a requirement in your Travel Pass was wrong, we refund that Travel Pass.",
  alternates: { canonical: "/guarantee" },
};

export default function GuaranteePage() {
  return (
    <LegalPage title="Flight-Ready Guarantee" updated="October 28, 2026">
      <P><strong>If your pet is refused boarding because a requirement in your Travel Pass was wrong, we refund that Travel Pass.</strong></P>

      <H>When it applies</H>
      <P>All three have to be true:</P>
      <UL>
        <li>A requirement in your Travel Pass was wrong or missing.</li>
        <li>It was wrong on the Last checked date shown for that requirement.</li>
        <li>Your pet was refused boarding, or you were refused check-in with your pet, because of that requirement.</li>
      </UL>

      <H>What you get</H>
      <P>The price you paid for that pass ($49.99, or $19.99 if you paid the member price). One refund per pass. This does not include flights, airline fees, hotels, vet visits, documents, or membership.</P>

      <H>What it does not cover</H>
      <UL>
        <li>A rule that changed after the Last checked date.</li>
        <li>Steps you did not follow, or a pet, carrier, or other detail that did not match what you entered.</li>
        <li>A mistake on a document from your vet, a lab, or a government office.</li>
        <li>A decision the airline or officials make that day, such as your pet’s health or behavior, a full pet limit, weather, or an aircraft change.</li>
        <li>Anything marked “Check with your airline,” and fares, fees, or seat availability.</li>
        <li>A different airline, route, or travel date than the pass was built for.</li>
      </UL>

      <H>How to claim</H>
      <P>Email <Email /> within 30 days of the refusal. Use the subject “Flight-Ready Guarantee claim.” Include:</P>
      <UL>
        <li>Your order number, or the email you used to buy the pass.</li>
        <li>Something from the airline showing why you were refused. A note, email, or chat is enough. If you could not get one, tell us the airport, flight, and time.</li>
        <li>Your boarding pass or booking confirmation.</li>
      </UL>
      <P>We reply within 24 hours. Approved refunds are issued within 24 hours of approval, back to the original card. Your bank may take a few days to show it. If we say no, we tell you why. You can send more information and we will look again.</P>
      <P>You can ask for a written copy of this policy at <Email />.</P>
      <P>This does not limit your other rights, including a dispute with your card company.</P>
      <P>PetPassGo helps you prepare. Your airline decides boarding.</P>
    </LegalPage>
  );
}
