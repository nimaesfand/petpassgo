import { notFound } from "next/navigation";

export const metadata = {
  title: "Community: pet travel tips by airline",
  description: "Airline-by-airline tips and questions from people who fly with pets and service animals, plus a Lost & found board.",
  alternates: { canonical: "/community" },
};

export default function CommunityLayout({ children }) {
  if (process.env.NEXT_PUBLIC_COMMUNITY_ENABLED !== "true") notFound();
  return children;
}
