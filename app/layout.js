import "./globals.css";
import { SITE_URL, SITE_NAME } from "../lib/site";
import ChatWidget from "../components/ChatWidget";

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
    <html lang="en">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
