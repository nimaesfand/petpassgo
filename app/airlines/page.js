import SiteHeader from "../../components/SiteHeader";
import Prose from "../../components/Prose";
import { AIRLINE_GUIDES } from "../../lib/airlineGuides";
import { coveredAirlineNames, airlineCoverageHeading } from "../../lib/airlines";

const coverage = airlineCoverageHeading().replace(". One place.", "");
const guideByName = new Map(AIRLINE_GUIDES.map((a) => [a.name, a]));

export const metadata = {
  title: "Airline pet travel guides",
  description: `${coverage}. Plan a trip to get the checklist for your airline.`,
  alternates: { canonical: "/airlines" },
  openGraph: { title: "Airline pet travel guides | PetPassGo", url: "/airlines" },
};

export default function AirlinesIndex() {
  return (
    <>
      <SiteHeader />
      <Prose>
        <h1 style={{ fontFamily: "var(--font-display), system-ui, sans-serif", fontSize: 40, color: "#14213D" }} className="mb-3">Airlines</h1>
        <p className="mb-8" style={{ fontSize: 17, lineHeight: 1.5 }}>{coverage}. The checklist for your airline and route is in the Travel Pass after you pay.</p>
        <div className="grid grid-cols-2 gap-3">
          {coveredAirlineNames().map((name) => {
            const guide = guideByName.get(name);
            const href = guide ? `/airlines/${guide.slug}` : "/assessment";
            return (
              <a key={name} href={href} className="rounded-xl px-5 py-4" style={{ background: "#fff", border: "1px solid #DCE3EC", color: "#14213D", fontWeight: 600, fontSize: 16, textDecoration: "none", minHeight: 48 }}>{name}</a>
            );
          })}
        </div>
      </Prose>
    </>
  );
}
