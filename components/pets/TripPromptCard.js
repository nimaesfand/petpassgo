import { tokens, font } from "../../lib/theme";

// Inside Pet Vault: a clear way into trip planning from the pet's passport.
export default function TripPromptCard({ pet }) {
  const service = /service/i.test(pet?.role || "");
  const esa = /emotional|esa/i.test(pet?.role || "");
  const kind = service ? "service" : esa ? "esa" : pet?.animal_type === "Cat" ? "cat" : "dog";
  const name = pet?.name || "your pet";
  return (
    <section className="rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" style={{ background: tokens.navy, color: "#fff" }}>
      <span aria-hidden="true" className="flex-shrink-0 flex items-center justify-center rounded-2xl" style={{ width: 52, height: 52, background: "rgba(242,184,75,.16)", color: tokens.gold }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
      </span>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: font.display, fontSize: 21, fontWeight: 800, lineHeight: 1.2 }}>Going on a trip with {name}?</div>
        <p className="mt-1" style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.5, color: "#D5DEEB" }}>We check your airline and destination, show each airline&apos;s pet fee, and give you every document and date for your flight.</p>
      </div>
      <a href={`/assessment?pet=${kind}`} className="flex-shrink-0 inline-flex items-center justify-center rounded-full px-6" style={{ minHeight: 52, background: tokens.primary, color: "#fff", fontFamily: font.body, fontWeight: 800, fontSize: 16.5, textDecoration: "none" }}>Plan the trip</a>
    </section>
  );
}
