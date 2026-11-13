import VetVerify from "./VetVerify";

export const metadata = { title: "Confirm vaccine records | PetPassGo", robots: { index: false, follow: false } };

export default function Page({ params }) {
  return <VetVerify token={params.token} />;
}
