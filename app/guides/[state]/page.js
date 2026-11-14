import { notFound } from "next/navigation";
import StateGuide from "../../../components/StateGuide";
import { STATES, stateBySlug } from "../../../lib/stateGuides";

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }));
}

export function generateMetadata({ params }) {
  const s = stateBySlug(params.state);
  if (!s) return {};
  return {
    title: `${s.name} service dog, PSD and ESA laws (2026)`,
    description: `${s.summary} What's true and what's not about ESA letters, psychiatric service dogs and flying in ${s.name}, with official sources.`,
    alternates: { canonical: `/guides/${s.slug}` },
  };
}

export default function StateGuidePage({ params }) {
  const s = stateBySlug(params.state);
  if (!s) notFound();
  return <StateGuide s={s} />;
}
