// One thin-outline icon set (lucide-style paths, 24x24, round caps).
// Use instead of emoji in the signed-in app. Color follows `currentColor`.
const P = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>,
  plane: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  passport: <><rect x="4.5" y="2.5" width="15" height="19" rx="2" /><circle cx="12" cy="10" r="3.5" /><path d="M8.5 10h7M12 6.5c1.2 1 1.2 6 0 7M12 6.5c-1.2 1-1.2 6 0 7M9 17.5h6" /></>,
  health: <><path d="M19.5 13.6 12 21l-7.5-7.4A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 7.5 7.2z" /><path d="M3.5 12h4l1.5-3 3 6 1.5-3h7" /></>,
  more: <><circle cx="5" cy="12" r="1.25" /><circle cx="12" cy="12" r="1.25" /><circle cx="19" cy="12" r="1.25" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>,
  external: <><path d="M15 3h6v6M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  camera: <><path d="M14.5 4h-5L7.5 6.5H4a2 2 0 0 0-2 2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-3.5z" /><circle cx="12" cy="13" r="3.5" /></>,
  share: <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4M12 2v13" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: <><circle cx="12" cy="12" r="9.5" /><path d="m8 12 3 3 5-6" /></>,
  stethoscope: <><path d="M5 3H4a1 1 0 0 0-1 1v5a6 6 0 0 0 12 0V4a1 1 0 0 0-1-1h-1" /><path d="M9 15v1a5 5 0 0 0 10 0v-3" /><circle cx="19" cy="11" r="2" /></>,
  tag: <><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r="1.25" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 10h18" /></>,
  dollar: <><circle cx="12" cy="12" r="9.5" /><path d="M15 9.2c-.5-1-1.6-1.6-3-1.6-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.5 0 1.3-1.3 2.2-3 2.2-1.5 0-2.6-.6-3.1-1.7M12 6v1.6M12 16.5V18" /></>,
  bag: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>,
  scale: <><path d="M12 3v18M7 21h10M5 7h14" /><path d="m5 7-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z" /></>,
  seat: <><path d="M7 3v9a2 2 0 0 0 2 2h7" /><path d="M5 14h12l1 7M7 14l-1 7" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
  ban: <><circle cx="12" cy="12" r="9.5" /><path d="m5.3 5.3 13.4 13.4" /></>,
  repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
  package: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
  leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" /><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  clock: <><circle cx="12" cy="12" r="9.5" /><path d="M12 6.5V12l3.5 2" /></>,
  smartphone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
  paw: <><circle cx="5.5" cy="10" r="2" /><circle cx="9" cy="5.5" r="2" /><circle cx="15" cy="5.5" r="2" /><circle cx="18.5" cy="10" r="2" /><path d="M12 12c-2.8 0-5.5 3.3-5.5 6 0 1.7 1.3 2.5 2.8 2.5 1 0 1.8-.5 2.7-.5s1.7.5 2.7.5c1.5 0 2.8-.8 2.8-2.5 0-2.7-2.7-6-5.5-6z" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  cloud: <path d="M17.5 19H8a6 6 0 1 1 5.7-7.9A4.5 4.5 0 1 1 17.5 19z" />,
  cloudSun: <><path d="M12 2v2M4.9 4.9l1.4 1.4M20 12h2M19.1 4.9l-1.4 1.4M15.9 13A4 4 0 0 0 8.4 9.2" /><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z" /></>,
  rain: <><path d="M16 13.4A4.5 4.5 0 0 0 17.5 5h-1.8A7 7 0 1 0 4 11.3" /><path d="M8 15v2M8 20v2M12 17v2M12 21.5v.5M16 15v2M16 20v2" /></>,
  snow: <><path d="M20 17.6A4.5 4.5 0 0 0 17.5 9h-1.8A7 7 0 1 0 4 15.3" /><path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01" /></>,
  storm: <><path d="M19 16.9A5 5 0 0 0 18 7h-1.3a8 8 0 1 0-11.7 9" /><path d="m13 12-3 5h4l-3 5" /></>,
  fog: <><path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" /><path d="M16 17H7M17 21H9" /></>,
  thermometer: <path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  sparkle: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  route: <><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></>,
  dog: <><path d="M11.25 16.25h1.5L12 17z" /><path d="M16 14v.5" /><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309" /><path d="M8 14v.5" /><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5" /></>,
  cat: <><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" /><path d="M8 14v.5" /><path d="M16 14v.5" /><path d="M11.25 16.25h1.5L12 17l-.75-.75Z" /></>,
};

export default function Icon({ name, size = 20, stroke = 1.75, style, className, title }) {
  const path = P[name] || P.pin;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={title ? undefined : true} role={title ? "img" : undefined} className={className} style={{ flexShrink: 0, display: "inline-block", verticalAlign: "-0.2em", ...style }}>
      {title ? <title>{title}</title> : null}
      {path}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(P);
