import { LegalPage, H, P, UL, Email } from "../../components/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "How PetPassGo collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 14, 2026">
      <P>This policy explains what information PetPassGo, operated by PetPassGo ("we", "us"), collects, how we use it, and the choices you have. Questions: <Email />.</P>

      <H>1. Information we collect</H>
      <UL>
        <li><strong>Account information:</strong> your email address and password. Accounts are managed by our hosting and authentication provider, Supabase. We do not see your password in plain text.</li>
        <li><strong>Pet and trip information:</strong> pet profiles (name, species, breed, weight, photos, microchip and health details you enter), trips (airline, route, dates), checklist progress and weight logs.</li>
        <li><strong>Documents:</strong> files you upload, such as vaccination records and health certificates.</li>
        <li><strong>Lost-pet messages:</strong> when someone who finds your pet uses the contact form on its Pet ID page, we collect the message and any contact details they choose to include.</li>
        <li><strong>Pet ID page views while a pet is lost:</strong> while your pet is marked lost, when its Pet ID page is viewed or its QR code is scanned we record the time and an approximate area (city/region, derived by our host from the visitor's network). We do not store the visitor's IP address or precise location, and these view records are deleted when you mark the pet as reunited.</li>
        <li><strong>Community posts:</strong> if you use the community boards, your display name and the posts, replies and reports you submit. Posts are stored with your account so we can enforce limits and moderate, but your email and account ID are never shown.</li>
        <li><strong>Free lost pet flyer maker:</strong> the flyer is built entirely in your browser. The photo and details you enter are not uploaded to or stored by us.</li>
        <li><strong>Document expiry dates:</strong> if you add one to an uploaded document, so members can get a reminder before it expires.</li>
        <li><strong>AI feature inputs:</strong> if you use the optional AI document check or chat, the documents and messages you submit to it.</li>
        <li><strong>Payment information (when payments launch):</strong> handled by Stripe. We receive payment status and limited details (for example, the last four card digits), not your full card number.</li>
        <li><strong>Technical data:</strong> standard logs from our hosting providers (Vercel and Supabase), such as IP address, browser type and request times, used for security and reliability.</li>
      </UL>

      <H>2. How we use it</H>
      <UL>
        <li>To provide the Service: build your checklist, store your records, and show your trip status.</li>
        <li>To send reminder emails about upcoming deadlines (delivered through our email provider, Resend), and messages about your account.</li>
        <li>To forward finder messages to you when your pet is marked lost.</li>
        <li>To run optional AI features you choose to use.</li>
        <li>To process payments, prevent fraud, secure the Service and fix problems.</li>
      </UL>
      <P>We do not sell your personal information, and we do not use it for third-party advertising.</P>

      <H>3. What is private and what is public</H>
      <UL>
        <li><strong>Private by default:</strong> your account, trips, documents and full pet records are visible only to you. Uploaded documents are kept in private storage and opened only through short-lived, signed links generated for you.</li>
        <li><strong>Public Pet ID page:</strong> if you share it, anyone with the link or QR code can see the information shown on that page. You choose what appears there.</li>
        <li><strong>Community boards:</strong> your display name and posts are visible to other signed-in users and, once the boards open publicly, to anyone. A Lost &amp; found post can link to your pet's public Pet ID page if you choose.</li>
        <li><strong>Lost-pet relay:</strong> finders contact you through a relay form. Your email address is not shown to them. If you reply directly, they will see the address you reply from.</li>
      </UL>

      <H>4. Who we share it with</H>
      <P>We share information only with service providers that help us run PetPassGo, and only as needed:</P>
      <UL>
        <li>Supabase: database, authentication and file storage.</li>
        <li>Vercel: website hosting.</li>
        <li>Resend: email delivery.</li>
        <li>Stripe: payment processing, once payments launch.</li>
        <li>A third-party AI provider: only for content you submit to the optional AI features.</li>
      </UL>
      <P>We may also disclose information if the law requires it, to protect people's safety or rights, or as part of a merger or sale of the business, subject to this policy.</P>

      <H>5. How long we keep it</H>
      <P>We keep your information while your account is active. If you delete your account, we delete your account data and uploaded documents within 30 days, except where we must keep records (for example, payment records) for legal or accounting reasons.</P>

      <H>6. Your choices and rights</H>
      <UL>
        <li>You can view and edit your pet and trip information, and delete documents, in the app.</li>
        <li>You can turn off a pet's lost status, or stop sharing its Pet ID link, at any time.</li>
        <li>You can ask us for a copy of your data, or ask us to correct or delete it, by emailing <Email />.</li>
        <li>Depending on where you live, you may have additional rights. California residents, see the next section.</li>
      </UL>

      <H>7. Your California privacy rights</H>
      <P>If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act (CCPA), gives you the following rights:</P>
      <UL>
        <li><strong>Right to know:</strong> to ask what personal information we have collected about you, the categories of sources, why we collect it, and the categories of third parties we disclose it to.</li>
        <li><strong>Right to access:</strong> to get a copy of the specific personal information we hold about you.</li>
        <li><strong>Right to delete:</strong> to ask us to delete your personal information, subject to legal exceptions.</li>
        <li><strong>Right to correct:</strong> to ask us to correct inaccurate personal information.</li>
        <li><strong>Right to opt out of sale or sharing:</strong> we do not sell your personal information and do not share it for cross-context behavioral advertising, so there is nothing to opt out of.</li>
        <li><strong>Right to limit use of sensitive personal information:</strong> we use your account login details only to provide the Service, as the CCPA permits.</li>
        <li><strong>Non-discrimination:</strong> we will not deny you service, charge you a different price, or give you a lower level of service for using these rights.</li>
      </UL>
      <P>Categories of personal information we collect: identifiers (such as email address); account login details; content you upload (pet records and documents); internet activity on our Service (technical logs); approximate location of Pet ID page views while a pet is marked lost; and commercial information (purchase records, once payments launch). The sources, purposes and recipients are described in sections 1, 2 and 4 above. We keep each category for as long as described in section 5.</P>
      <P>To use these rights, email <Email /> from the address on your account. We will verify your request by confirming it with that email address, and respond within 45 days. You can also use an authorized agent; we may ask for proof that the agent is authorized and confirm your identity directly.</P>

      <H>8. Security</H>
      <P>We use access controls (database row-level security), private storage, signed links and encryption in transit to protect your information. No system is perfectly secure, so we cannot guarantee absolute security.</P>

      <H>9. Children</H>
      <P>PetPassGo is not directed to children under 13, and we do not knowingly collect their personal information.</P>

      <H>10. Changes</H>
      <P>If we change this policy in a material way, we will notify you by email or in the app before the change takes effect.</P>

      <H>11. Contact</H>
      <P>Questions about this policy or your data: <Email />.</P>
    </LegalPage>
  );
}
