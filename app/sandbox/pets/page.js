import { notFound } from "next/navigation";
import SandboxPets from "./SandboxPets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practice copy | PetPassGo", robots: { index: false, follow: false } };

// Preview builds only. Production returns 404.
export default function Page() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <SandboxPets />;
}
