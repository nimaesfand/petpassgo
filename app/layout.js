import "./globals.css";
import localFont from "next/font/local";
import { SITE_URL, SITE_NAME } from "../lib/site";
import ChatWidget from "../components/ChatWidget";
import Analytics from "../components/Analytics";
import AuthResume from "../components/AuthResume";
import JsonLd from "../components/JsonLd";

// Self-hosted latin subsets. next/font/google fetches these during the build, and that
// fetch fails on Vercel when the font URL has no extension the loader can match.
const display = localFont({
  src: "./fonts/BricolageGrotesque-latin.woff2",
  weight: "500 800",
  style: "normal",
  display: "swap",
  variable: "--font-display",
});
const body = localFont({
  src: "./fonts/Inter-latin.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-body",
});

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
