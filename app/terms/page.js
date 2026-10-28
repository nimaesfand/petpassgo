import { LegalPage, H, P, UL, Email } from "../../components/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use PetPassGo.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 28, 2026">
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
      <P>Some features may require payment. Payments will be processed by Stripe; we do not store your full card number. Planned prices (in U.S. dollars, before any applicable taxes):</P>
      <UL>
        <li>Lost-pet flyer maker: no account and no payment. The flyer is built in your browser and can be shared from your device. Nothing else on the Service is free.</li>
        <li>Pet Vault: $6.99 per month, billed monthly. Your pet's records, ID and more. Includes the Digital Pet ID with QR code, finder messages to you after you tap Report lost, reading and posting on the community boards (including a Lost &amp; Found post for one state and city), document expiry reminders, unlimited pets, and Travel Passes at $19.99 per trip.</li>
        <li>Travel Pass without membership: $49.99, one-time, per trip. Includes that trip's checklist, deadlines, sources and reminders, plus the pet vault and Digital Pet ID. That access stays open until 7 days after the trip ends. On a one-way trip, it ends 7 days after the travel date. If you add a return date later than the outbound date, it ends 7 days after the return date instead.</li>
      </UL>
      <P>You can cancel Pet Vault at any time. You keep access until the end of the billing period you've paid for; after that, Pet Vault features stop, and we don't give partial refunds for unused time. Your pets and documents are kept, not deleted, and come back if you rejoin. A Travel Pass you bought stays available for its trip through the access window above. The printable lost-pet flyer can still be made with no account. Prices may change; we will show the current price before you pay, and we will tell you before a Pet Vault price change takes effect.</P>
      <P><strong>Refunds.</strong> You can get a full refund within 7 days of purchase, but only if you have never opened the details of the paid Travel Pass. Once those details have been opened, the digital product has been delivered and is not refundable. To request a refund, email <Email /> from the address on your account.</P>
      <P><strong>Exception for inaccurate information.</strong> At PetPassGo's sole discretion, we may issue a refund if information we showed you was inaccurate and directly caused a documented problem, such as being denied boarding. To ask for this, email <Email /> within 14 days of your travel date and include:</P>
      <UL>
        <li>your booking confirmation or itinerary;</li>
        <li>the specific PetPassGo information you relied on;</li>
        <li>written proof from the airline or authority showing the actual requirement or the denial (for example, a denial notice, a written statement from the airline, or a receipt); and</li>
        <li>a description of what happened.</li>
      </UL>
      <P>This exception does not apply if the information was correct when we showed it but the airline or authority changed its rules later, or if you did not follow the information we provided.</P>
      <P>Approved refunds are paid to the original payment method, and your access to that trip is removed.</P>

      <H>7. Community boards</H>
      <UL>
        <li>When the community boards are available, Pet Vault members can read and post tips, experiences, questions and replies under a display name. Your email address is never shown.</li>
        <li>Community posts come from travelers and are not verified by PetPassGo. Always follow your PetPassGo checklist and your airline's rules.</li>
        <li>Don't post links, email addresses, phone numbers, offensive language, or anything illegal, harassing or misleading. We may limit how often you post.</li>
        <li>Anyone can report a post. We may hide or delete posts, and suspend accounts that break these rules, at our discretion.</li>
        <li>You keep ownership of your posts and give us permission to display them on the Service, including publicly.</li>
      </UL>

      <H>8. Acceptable use</H>
      <P>Do not misuse the Service. That includes: breaking the law; uploading content you have no right to share; uploading malware; trying to access other users' data; scraping or reselling our content; or interfering with the Service's security or operation.</P>

      <H>9. Our content</H>
      <P>The Service's software, design, checklists and written guidance belong to PetPassGo or its licensors. Except for your own content, you may not copy or redistribute them without our permission.</P>

      <H>10. Disclaimers</H>
      <P>The Service is provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all warranties, express or implied, including warranties of accuracy, fitness for a particular purpose and non-infringement. We are not responsible for decisions made by airlines, airports, government agencies or veterinarians, including denied boarding, quarantine, or travel delays.</P>

      <H>11. Limitation of liability</H>
      <P>To the fullest extent permitted by law, PetPassGo will not be liable for indirect, incidental, special or consequential damages, or for lost travel costs. Our total liability for any claim relating to the Service is limited to the amount you paid us in the 12 months before the claim. Some jurisdictions do not allow these limits, so they may not apply to you.</P>

      <H>12. Ending your use</H>
      <P>You can stop using the Service and ask us to delete your account at any time by emailing <Email />. We may suspend or end accounts that break these Terms.</P>

      <H>13. Changes to these Terms</H>
      <P>We may update these Terms. If a change is material, we will notify you by email or in the app before it takes effect. If you keep using the Service after that, you accept the updated Terms.</P>

      <H>14. Governing law</H>
      <P>These Terms are governed by the laws of the State of California, without regard to its conflict-of-law rules.</P>

      <H>15. Contact</H>
      <P>Questions about these Terms: <Email />.</P>
    </LegalPage>
  );
}
