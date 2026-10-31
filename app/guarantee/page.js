import { LegalPage, H, P, UL, Email } from "../../components/LegalPage";

export const metadata = {
  title: "Flight-Ready Guarantee",
  description: "If your pet is refused boarding because a requirement we showed you was wrong, we refund your Travel Pass. Terms, proof, and what is not covered.",
  alternates: { canonical: "/guarantee" },
};

export default function GuaranteePage() {
  return (
    <LegalPage title="Flight-Ready Guarantee" updated="October 31, 2026">
      <P><strong>If your pet is refused boarding because a requirement we showed you was wrong, we refund your Travel Pass.</strong></P>
      <P>This page is the terms of that refund. It is signed by PetPassGo.</P>

      <H>When we refund</H>
      <P>We refund only if you were denied boarding specifically because information PetPassGo gave you was incorrect, and the denial happened because of that. All of the following have to be true:</P>
      <UL>
        <li>A requirement in your Travel Pass was incorrect.</li>
        <li>The airline denied boarding, or refused check-in with your pet, because of that requirement. The denial has to be for that reason.</li>
        <li>You followed the Travel Pass checklist.</li>
        <li>You ask within 14 days of the scheduled flight, by email to <Email />.</li>
        <li>You send proof that the denial was due to that requirement. A written airline denial notice, or other documentation that states the reason, qualifies.</li>
      </UL>

      <H>What the refund covers</H>
      <P>The refund is limited to the Travel Pass price you paid. That is $49.99, or $19.99 if you paid the member price. One refund per pass.</P>
      <P>It does not include flights, airline fees, lodging, or other costs. It does not include Pet Vault membership fees.</P>
      <P>We reply within 24 hours. If the claim qualifies, the refund goes back to the original card within 24 hours of approval. Your bank may take a few days to show it. If we decline the claim, we say why. You can send more information and we will look again.</P>

      <H>What is not covered</H>
      <P>A denial for any other reason is not covered. That includes:</P>
      <UL>
        <li>Late arrival.</li>
        <li>Your pet’s behavior or health.</li>
        <li>A carrier size you misreported.</li>
        <li>Airline capacity, or a decision the airline makes at its discretion.</li>
        <li>Weather embargoes.</li>
        <li>A rule that changed after the Last checked date shown on your pass.</li>
        <li>Information you entered incorrectly.</li>
      </UL>
      <P>Anything the pass marks “Check with your airline” was not shown as a finished requirement, so it is not covered. A different airline, route, or travel date than the pass was built for is not covered. A mistake on a document from your vet, a lab, or a government office is not covered.</P>

      <H>How to ask</H>
      <P>Email <Email /> within 14 days of the scheduled flight. Use the subject “Flight-Ready Guarantee claim.” Include the email you used to buy the pass, the requirement you relied on, and the proof described above.</P>
      <P>You can ask for a written copy of this policy at <Email />.</P>
      <P>This does not limit any other right the law gives you, including a dispute with your card company.</P>

      <H>Customers in the EU and UK</H>
      <P>If you live in the European Union or the United Kingdom, you have 14 days to withdraw from a purchase of digital content. That right comes from EU Directive 2011/83/EU, articles 16(m) and 8(7), and the UK Consumer Contracts Regulations 2013, regulations 16(3) and 37.</P>
      <P>At checkout we ask for your express consent to start your Travel Pass, and your Pet Vault membership access, immediately. We also ask you to acknowledge that you lose the 14-day right to withdraw once it starts. We confirm both by email.</P>
      <P>If you did not give that consent and that acknowledgment, you may withdraw within 14 days for a full refund.</P>
      <P>You can cancel Pet Vault membership online at any time from account Billing. You keep access until the end of the period you have paid for.</P>
      <P>This does not change the Flight-Ready Guarantee. We still reply within 24 hours. An approved refund still goes back to your original card within 24 hours of approval. The California law below does not remove this right.</P>

      <H>California law</H>
      <P>These terms are governed by the laws of the State of California, without regard to conflict-of-law rules.</P>

      <P>PetPassGo helps you prepare. Your airline decides boarding.</P>
      <P>PetPassGo<br /><Email /></P>
    </LegalPage>
  );
}
