import SiteHeader from "../../components/SiteHeader";
import ContactForm from "../../components/ContactForm";
import { tokens, font } from "../../lib/theme";

export const metadata = {
  title: "Contact",
  description: "Send a message to PetPassGo. Questions are answered within 24 hours.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact | PetPassGo", url: "/contact", description: "Send a message to PetPassGo. Questions are answered within 24 hours." },
};

export default function ContactPage() {
  return (
    <div style={{ background: tokens.sky, minHeight: "100vh" }}>
      <SiteHeader />
      <main className="max-w-[640px] mx-auto px-4 sm:px-6 py-10 md:py-14">
        <h1 style={{ fontFamily: font.display, fontWeight: 700, color: tokens.navy, lineHeight: 1.15 }} className="text-[32px] md:text-[40px]">Contact</h1>
        <p style={{ fontFamily: font.body, fontSize: 18, lineHeight: 1.5, color: tokens.ink }} className="mt-3">
          Questions answered within 24 hours.
        </p>
        <p style={{ fontFamily: font.body, fontSize: 18, lineHeight: 1.5, color: tokens.navy, fontWeight: 700 }} className="mt-2 mb-6">
          support@petpassgo.com
        </p>
        <div className="rounded-2xl p-5 sm:p-7" style={{ background: "#fff", border: `1px solid ${tokens.line}` }}>
          <ContactForm />
        </div>
      </main>
    </div>
  );
}
