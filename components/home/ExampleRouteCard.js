import { tokens, font } from "../../lib/theme";
import Icon from "../Icon";

const CHECKS = [
  "Airline requirements",
  "Travel checklist",
  "Documents ready",
  "Vets and pet stores",
];

// Static sample. The map next to it plays other example routes.
export default function ExampleRouteCard() {
  return (
    <aside
      data-testid="example-route-card"
      aria-label="Example route card. LAX to JFK is a sample, not a real trip."
      className="rounded-2xl p-4 sm:p-5"
      style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 16px 40px rgba(20,33,61,0.16)" }}
    >
      <div style={{ fontFamily: font.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: tokens.muted }}>EXAMPLE ROUTE</div>
      <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 26, color: tokens.navy, lineHeight: 1.15 }} className="mt-1">LAX → JFK</div>
      <p style={{ fontFamily: font.body, fontSize: 16, lineHeight: 1.4, color: tokens.ink }} className="mt-1">Los Angeles to New York. Not a real trip.</p>
      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mt-3" style={{ background: "#EAF6EE", color: tokens.green, fontFamily: font.body, fontSize: 15, fontWeight: 700 }}>
        <Icon name="check" size={16} />
        Ready for travel
      </span>
      <ul className="mt-4 grid gap-2.5">
        {CHECKS.map((label) => (
          <li key={label} className="flex items-center gap-2.5" style={{ fontFamily: font.body, fontSize: 16, fontWeight: 600, color: tokens.navy }}>
            <span aria-hidden="true" className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, background: "#EAF6EE", color: tokens.green }}>
              <Icon name="check" size={14} stroke={2.4} />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
