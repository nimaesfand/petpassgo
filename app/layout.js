import "./globals.css";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { SITE_URL, SITE_NAME } from "../lib/site";
import ChatWidget from "../components/ChatWidget";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const description =
  "PetPassGo helps travelers prepare for flights with pets and service animals — a free assessment, then a personalized, airline-specific Travel Pass with every requirement organized and tracked.";

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
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
