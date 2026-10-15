export const metadata = {
  title: "Your account",
  description: "Your PetPassGo dashboard.",
  alternates: { canonical: "/account" },
  openGraph: { title: "Your account | PetPassGo", description: "Your PetPassGo dashboard.", url: "/account" },
  robots: { index: false, follow: false },
};
export default function Layout({ children }) {
  return children;
}
