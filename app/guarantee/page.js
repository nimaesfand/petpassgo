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
      <P>The price you paid for that pass ($49.99 USD, or $19.99 USD if you paid the member price). One refund per pass. This does not include flights, airline fees, hotels, vet visits, documents, or membership.</P>

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

      <H>Customers in the EU and UK</H>
      <P>If you live in the European Union or the United Kingdom, you have 14 days to withdraw from a purchase of digital content. That right comes from EU Directive 2011/83/EU, articles 16(m) and 8(7), and the UK Consumer Contracts Regulations 2013, regulations 16(3) and 37.</P>
      <P>At checkout we ask for your express consent to start your Travel Pass, and your Pet Vault membership access, immediately. We also ask you to acknowledge that you lose the 14-day right to withdraw once it starts. We confirm both by email.</P>
      <P>If you did not give that consent and that acknowledgment, you may withdraw within 14 days for a full refund.</P>
      <P>You can cancel Pet Vault membership online at any time from account Billing. You keep access until the end of the period you have paid for.</P>
      <P>This does not change the Flight-Ready Guarantee. We still reply within 24 hours. An approved refund still goes back to your original card within 24 hours of approval. The California law named in our Terms does not remove this right.</P>

      <P>PetPassGo helps you prepare. Your airline decides boarding.</P>
    </LegalPage>
  );
}
