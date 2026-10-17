import { tokens } from "../lib/theme";

// PetPassGo mark: a passport outline with a flight path through it.
// Abstract travel document, no paw. Gold on navy, drawn in SVG only.
export default function Logo({ size = 34 }) {
  return (
    <span aria-hidden="true" className="rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: tokens.navy }}>
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="2.5" width="14" height="19" rx="2.5" stroke={tokens.gold} strokeWidth="1.8" />
        <path d="M8.2 15.8c2.2.4 4.6-.6 6-2.6" stroke={tokens.gold} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.2 2.6" />
        <path d="M15.9 7.1l1.8-1.9c.2-.2.6-.2.8 0 .2.2.2.6 0 .8l-1.7 2c.5 1 .4 2.2-.3 3.1l-.7-.7c.3-.6.3-1.2.1-1.8l-2.3 1.1-1-.3 1-2.2c-.5-.2-1.1-.1-1.6.2l-.7-.6c.8-.8 2-1.1 3-.8l1.6-1.9z" fill={tokens.gold} transform="translate(-1.5 1) scale(0.92)" />
        <circle cx="8.4" cy="16" r="1" fill={tokens.gold} />
      </svg>
    </span>
  );
}
