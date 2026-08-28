import "./globals.css";

export const metadata = {
  title: "PetPassGo — Travel with confidence",
  description:
    "PetPassGo helps travelers prepare for trips with their animals by organizing the requirements, documents, and travel information they need — all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
