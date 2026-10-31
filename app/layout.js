import "./globals.css";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { SITE_URL, SITE_NAME } from "../lib/site";
import ChatWidget from "../components/ChatWidget";
import Analytics from "../components/Analytics";
import AuthResume from "../components/AuthResume";
import JsonLd from "../components/JsonLd";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const description =
  "PetPassGo helps travelers prepare for flights with pets and service animals — answer a few trip questions, then get a personalized, airline-specific Travel Pass with every requirement organized and tracked.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PetPassGo — Travel with confidence", template: "%s | PetPassGo" },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/", title: "PetPassGo — Travel with confidence", description },
  twitter: { card: "summary_large_image", title: "PetPassGo — Travel with confidence", description },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          email: "support@petpassgo.com",
          contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "support@petpassgo.com", url: `${SITE_URL}/contact` },
        }} />
        {children}
        <Analytics />
        <AuthResume />
        <ChatWidget />
      </body>
    </html>
  );
}
