import SiteHeader from "../../components/SiteHeader";
import Prose from "../../components/Prose";
import { AIRLINE_GUIDES } from "../../lib/airlineGuides";

export const metadata = {
  title: "Airline pet travel guides",
  description: "Flying with a pet or service dog? Start with your airline: Delta, American, United, Southwest, JetBlue, Alaska, Hawaiian, Frontier, Allegiant and Sun Country.",
  alternates: { canonical: "/airlines" },
  openGraph: { title: "Airline pet travel guides | PetPassGo", url: "/airlines" },
};

export default function AirlinesIndex() {
  return (
    <>
      <SiteHeader />
      <Prose>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, color: "#152238" }} className="mb-8">Airline guides</h1>
        <div className="grid grid-cols-2 gap-3">
          {AIRLINE_GUIDES.map((a) => (
            <a key={a.slug} href={`/airlines/${a.slug}`} className="rounded-xl px-5 py-4" style={{ background: "#fff", border: "1px solid #D9E1E8", color: "#152238", fontWeight: 600, textDecoration: "none" }}>{a.name}</a>
          ))}
        </div>
      </Prose>
    </>
  );
}
