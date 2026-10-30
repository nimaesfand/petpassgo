import { tokens } from "../lib/theme";

// Decorative map. The dotted route is a CSS animation. The plane follows the
// same path in SVG user units so it stays on the line when the card scales.
// prefers-reduced-motion hides that motion and leaves the plane still.
const PATHS = {
  domestic: "M 78 158 C 128 112 176 186 236 136",
  international: "M 168 150 C 250 72 360 68 478 156",
};

function Plane() {
  return (
    <g>
      <circle cx="0" cy="0" r="16" fill="#fff" stroke={tokens.primary} strokeWidth="2" />
      <path d="M12 0 L-8 7 L-3 0 L-8 -7 Z" fill={tokens.primary} />
    </g>
  );
}

export default function FlightPathMap({ route = "" }) {
  const mode = route === "international" ? "international" : "domestic";
  const still = mode === "international" ? "translate(330 104)" : "translate(156 148)";
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}`, boxShadow: "0 18px 40px rgba(20,33,61,0.10)" }}>
      <svg viewBox="0 0 560 300" className="block w-full h-auto" aria-hidden="true">
        <rect width="560" height="300" fill={tokens.sky} />
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 14 }).map((__, col) => (
            <circle key={`${row}-${col}`} cx={28 + col * 38} cy={22 + row * 36} r="1.3" fill={tokens.navy} opacity="0.12" />
          ))
        )}
        <path d="M36 78c28-34 112-46 168-18 22-28 78-22 96 16 28 8 40 48 22 78-8 36-48 62-92 54-52 22-120 8-150-36-22-28-28-62-44-94z" fill={tokens.navy} opacity="0.16" />
        <path d="M392 86c36-28 112-18 128 28 22 10 28 48 8 70-28 28-90 22-112-8-16-22-28-36-24-90z" fill={tokens.navy} opacity={mode === "international" ? 0.16 : 0.08} />
        <path className="ppg-route" d={PATHS.domestic} fill="none" stroke={tokens.primary} strokeWidth="2.5" strokeLinecap="round" opacity={mode === "domestic" ? 1 : 0.35} />
        <path className="ppg-route" d={PATHS.international} fill="none" stroke={tokens.navy} strokeWidth="2.5" strokeLinecap="round" opacity={mode === "international" ? 0.85 : 0.22} />
        <circle cx="78" cy="158" r="5.5" fill={tokens.gold} stroke={tokens.navy} strokeWidth="1.5" />
        <circle cx="236" cy="136" r="5.5" fill="#fff" stroke={tokens.navy} strokeWidth="1.5" />
        <circle cx="478" cy="156" r="5.5" fill={tokens.gold} stroke={tokens.navy} strokeWidth="1.5" opacity={mode === "international" ? 1 : 0.35} />
        <g className="ppg-motion">
          <animateMotion dur="8.5s" repeatCount="indefinite" rotate="auto" path={PATHS[mode]} />
          <Plane />
        </g>
        <g className="ppg-plane-still" transform={still}>
          <Plane />
        </g>
      </svg>
    </div>
  );
}
