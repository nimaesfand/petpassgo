import { notFound } from "next/navigation";
import SandboxTags from "./SandboxTags";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practice tags | PetPassGo", robots: { index: false, follow: false } };

export default function Page() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return <SandboxTags />;
}
