import { LegalPage, H, P, UL, Email } from "../../components/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use PetPassGo.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 31, 2026">
      <P>These Terms of Service ("Terms") govern your use of PetPassGo (the "Service"), operated by PetPassGo ("PetPassGo", "we", "us"). By creating an account or using the Service, you agree to these Terms.</P>

      <H>1. What PetPassGo is, and what it is not</H>
      <P>PetPassGo helps you prepare to fly with a pet or service animal. It organizes airline and government requirements into a checklist, stores your pet's records, and sends reminders.</P>
      <P><strong>PetPassGo provides general guidance only. It is not legal advice and not veterinary advice.</strong> We are not an airline, a government agency, or a certifying authority, and we cannot guarantee that an airline or agency will accept your pet, your documents, or your travel plans. Airline and government rules change, sometimes without notice. Always confirm requirements directly with your airline and the relevant authorities before you travel, and ask a licensed veterinarian about your pet's health and fitness to fly.</P>

      <H>2. Your account</H>
      <UL>
        <li>Accounts are created and authenticated through our hosting provider, Supabase. You must give accurate information and keep your password secure.</li>
        <li>You are responsible for activity on your account. Tell us promptly at <Email /> if you believe it has been accessed without permission.</li>
        <li>You must be at least 18 years old, or the age of majority where you live, to create an account.</li>
      </UL>

      <H>3. Your content</H>
      <P>You keep ownership of the information and documents you upload (pet profiles, photos, health records, travel documents). You give us permission to store, process and display that content only as needed to run the Service for you, including showing the information you choose to publish on your pet's public Pet ID page. You confirm that you have the right to upload it and that it is accurate to the best of your knowledge.</P>

      <H>4. Public Pet ID pages and lost-pet tools</H>
      <UL>
        <li>Each pet can have a public Pet ID page that anyone with the link or QR code can view. You control what appears on it.</li>
        <li>A lost notice goes live only when you tap Report lost. Finder messages then come to you through our relay form. Your email address is not shown to the finder. If you also post to the Lost &amp; Found board, people browsing the state and city you enter can see that post. We do not use GPS, and we do not see or verify microchip scans.</li>
        <li>We do not guarantee that a lost pet will be found or that messages from finders are genuine. Use caution when meeting anyone in person.</li>
        <li>You must not use the finder message form to harass, spam or deceive anyone.</li>
      </UL>

      <H>5. Optional AI features</H>
      <P>Where offered, the AI document check and chat assistant are optional. AI output can be wrong or incomplete. It does not replace the airline's or agency's own review, or a veterinarian's advice.</P>

      <H>6. Payments</H>
      <P>Some features may require payment. Payments will be processed by Stripe; we do not store your full card number. Prices are in US dollars (USD), before any applicable taxes:</P>
      <UL>
        <li>Lost-pet flyer maker: no account and no payment. The flyer is built in your browser and can be shared from your device. Nothing else on the Service is free.</li>
        <li>Pet Vault: $6.99 USD per month, billed monthly. Your pet's records, ID and more. Includes the Digital Pet ID with QR code, finder messages to you after you tap Report lost, reading and posting on the community boards (including a Lost &amp; Found post for one state and city), document expiry reminders, unlimited pets, and Travel Passes at $19.99 USD per trip.</li>
        <li>Travel Pass without membership: $49.99 USD, one-time, per trip. Includes that trip's checklist, deadlines, sources and reminders, plus the pet vault and Digital Pet ID. That access stays open until 7 days after the trip ends. On a one-way trip, it ends 7 days after the travel date. If you add a return date later than the outbound date, it ends 7 days after the return date instead.</li>
      </UL>
      <P>Pet Vault is $6.99 USD per month and renews each month until you cancel. You can cancel online at any time from account Billing. You do not have to call. You keep access until the end of the billing period you've paid for, and you won't be charged again. We don't refund partial months except where the law requires it, including section 7.7. Pet Vault fees are not covered by the Flight-Ready Guarantee in section 7. Your pets and documents are kept, not deleted, and come back if you rejoin. A Travel Pass you bought stays available for its trip through the access window above. The printable lost-pet flyer can still be made with no account. Prices may change; we will show the current price before you pay, and we will tell you before a Pet Vault price change takes effect. Travel Pass refunds are only as section 7 describes.</P>

      <H>7. Refunds and the Flight-Ready Guarantee</H>
      <P><strong>7.1 Flight-Ready Guarantee.</strong> Travel Pass purchases are covered by our <a href="/guarantee">Flight-Ready Guarantee</a> (<a href="/guarantee">Terms</a>). The Guarantee is part of these Terms. If your pet is refused boarding because a requirement we showed you was wrong, we refund the Travel Pass price you paid, as the Guarantee describes. If these Terms and the Guarantee conflict, the Guarantee controls for Travel Pass refunds.</P>
      <P><strong>7.2 Other Travel Pass refunds.</strong> Except under the Guarantee, section 7.7, or where the law requires a refund, Travel Pass fees aren't refundable once the Travel Pass has been delivered. We may issue other refunds at our discretion. One of those refunds doesn't create a right to another.</P>
      <P><strong>7.3 Pet Vault.</strong> Pet Vault fees are not covered by the Guarantee. Cancellation works as section 6 describes.</P>
      <P><strong>7.4 What the refund covers.</strong> The refund is the price you paid for that Travel Pass ($49.99 USD, or $19.99 USD at the member price), and never more than that price. One refund per Travel Pass. Approved refunds are issued within 24 hours of approval, back to the original card. Your bank may take a few days to show it. It does not include flights, airline pet fees, change fees, hotels, transport, vet visits, documents, membership, or any other cost.</P>
      <P>All of these must be true: a requirement in the Travel Pass was incorrect; the airline denied boarding, or refused check-in with your pet, because of that requirement; you followed the Travel Pass checklist; you ask within 14 days of the scheduled flight; and you send proof that the denial was due to that requirement, such as a written airline denial notice or other documentation that states the reason.</P>
      <P>The Guarantee does not cover a denial for another reason. That includes late arrival, your pet’s behavior or health, a carrier size you misreported, airline capacity or the airline’s discretion, weather embargoes, a rule that changed after the Last checked date shown on the pass, and information you entered incorrectly. Anything the pass marks “Check with your airline” is not covered. A different airline, route, or date than the pass was built for is not covered. A mistake on a document from a vet, a lab, or a government office is not covered.</P>
      <P>To claim, email <Email /> within 14 days of the scheduled flight, with the subject “Flight-Ready Guarantee claim,” the email you used to buy the pass, the requirement you relied on, and the proof described above. We reply within 24 hours. Approved refunds are issued within 24 hours of approval, back to the original card. Your bank may take a few days to show it. If we decline the claim, we say why. You can reply with more information and we will look again. You can request a written copy of the Guarantee at <Email />.</P>
      <P><strong>7.5 Limits.</strong> The Guarantee is our only commitment about boarding outcomes. To the extent the law allows, our total liability for a claim about a Travel Pass is limited to the amount you paid for that Travel Pass. Nothing in these Terms limits a right the law says cannot be limited, including your right to dispute a charge with your card issuer or bank.</P>
      <P><strong>7.6 A preparation tool.</strong> PetPassGo is a preparation tool, not a certifying authority. Requirements are set by airlines and government agencies. PetPassGo is not an airline, a government agency, a veterinarian, or a certifying authority. We do not issue health or travel documents or decide boarding. A requirement is shown only when it has an official source and a Last checked date. If either is missing, the pass says “Check with your airline for this item,” and that item is not covered by the Guarantee.</P>
      <P><strong>7.7 Customers in the EU and UK.</strong> If you live in the European Union or the United Kingdom, you have 14 days to withdraw from a purchase of digital content. That right comes from EU Directive 2011/83/EU, articles 16(m) and 8(7), and the UK Consumer Contracts Regulations 2013, regulations 16(3) and 37. At checkout we ask for your express consent to start your Travel Pass, and your Pet Vault membership access, immediately, and for your acknowledgment that you lose the 14-day right to withdraw once it starts. We confirm both by email. If you did not give that consent and that acknowledgment, you may withdraw within 14 days for a full refund. You can cancel Pet Vault membership online at any time from account Billing. You keep access until the end of the period you have paid for. Section 15 does not remove this right. This does not change the Flight-Ready Guarantee: we still reply within 24 hours, and an approved refund still goes back to your original card within 24 hours of approval.</P>

      <H>8. Community boards</H>
      <UL>
        <li>When the community boards are available, Pet Vault members can read and post tips, experiences, questions and replies under a display name. Your email address is never shown.</li>
        <li>Community posts come from travelers and are not verified by PetPassGo. Always follow your PetPassGo checklist and your airline's rules.</li>
        <li>Don't post links, email addresses, phone numbers, offensive language, or anything illegal, harassing or misleading. We may limit how often you post.</li>
        <li>Anyone can report a post. We may hide or delete posts, and suspend accounts that break these rules, at our discretion.</li>
        <li>You keep ownership of your posts and give us permission to display them on the Service, including publicly.</li>
      </UL>

      <H>9. Acceptable use</H>
      <P>Do not misuse the Service. That includes: breaking the law; uploading content you have no right to share; uploading malware; trying to access other users' data; scraping or reselling our content; or interfering with the Service's security or operation.</P>

      <H>10. Our content</H>
      <P>The Service's software, design, checklists and written guidance belong to PetPassGo or its licensors. Except for your own content, you may not copy or redistribute them without our permission.</P>

      <H>11. Disclaimers</H>
      <P>The Service is provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all warranties, express or implied, including warranties of accuracy, fitness for a particular purpose and non-infringement. We do not make boarding decisions. Airline, airport, government, and veterinary decisions are outside the Guarantee, except for a Travel Pass refund the Guarantee itself requires.</P>

      <H>12. Limitation of liability</H>
      <P>To the fullest extent permitted by law, PetPassGo will not be liable for indirect, incidental, special or consequential damages, or for lost travel costs. A claim about a Travel Pass is limited as section 7.5 describes. For any other claim, our total liability is limited to the amount you paid us in the 12 months before the claim. Some jurisdictions do not allow these limits, so they may not apply to you. Nothing here limits a right the law says cannot be limited, including a dispute with your card issuer or bank.</P>

      <H>13. Ending your use</H>
      <P>You can stop using the Service and ask us to delete your account at any time by emailing <Email />. We may suspend or end accounts that break these Terms.</P>

      <H>14. Changes to these Terms</H>
      <P>We may update these Terms. If a change is material, we will notify you by email or in the app before it takes effect. If you keep using the Service after that, you accept the updated Terms.</P>

      <H>15. Governing law</H>
      <P>These Terms are governed by the laws of the State of California, without regard to its conflict-of-law rules.</P>

      <H>16. Contact</H>
      <P>PetPassGo. Questions about these Terms: <Email />.</P>
    </LegalPage>
  );
}
