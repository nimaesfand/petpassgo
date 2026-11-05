import { notFound } from "next/navigation";

export const metadata = {
  title: "Community: pet travel tips by airline",
  description: "Airline tips and a Lost & found board. Members post.",
  alternates: { canonical: "/community" },
};

export default function CommunityLayout({ children }) {
  if (process.env.NEXT_PUBLIC_COMMUNITY_ENABLED !== "true") notFound();
  return children;
}
