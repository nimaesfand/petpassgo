// Original cartoon traveler. Not based on any copyrighted character.
// Drawn facing right; the map flips the whole group when the route heads left.
export default function PassportPuppy() {
  const navy = "#14213D";
  const fur = "#F6D7B0";
  const ear = "#E0A06A";
  const snout = "#FFF6EA";
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform="scale(1.12)">
      <ellipse cx="1" cy="16" rx="15" ry="3.6" fill={navy} opacity="0.14" />
      <circle cx="2" cy="1" r="20" fill="#fff" stroke="#F2B84B" strokeWidth="1.7" />
      <path d="M-13 2C-21 0-25-10-17-14" fill="none" stroke={navy} strokeWidth="5.6" />
      <path d="M-13 2C-21 0-25-10-17-14" fill="none" stroke={ear} strokeWidth="3.2" />
      <ellipse cx="-1" cy="3.5" rx="14.5" ry="10" fill={fur} stroke={navy} strokeWidth="1.7" />
      <ellipse cx="-11" cy="11.5" rx="3.8" ry="2.4" fill={fur} stroke={navy} strokeWidth="1.35" />
      <circle cx="10" cy="-6.5" r="10.4" fill={fur} stroke={navy} strokeWidth="1.7" />
      <path d="M5.2-13.2c-.6-8.6 5.2-13.6 10.4-10.2 1.6 1.6 1.8 5-.6 7.6-2.6 1.8-7.2 3.4-9.8 2.6z" fill={ear} stroke={navy} strokeWidth="1.45" />
      <ellipse cx="18.2" cy="-4.2" rx="6.4" ry="4.6" fill={snout} stroke={navy} strokeWidth="1.4" />
      <ellipse cx="21.6" cy="-4.3" rx="1.9" ry="1.45" fill={navy} />
      <circle cx="12.2" cy="-8.6" r="1.55" fill={navy} />
      <circle cx="12.65" cy="-9.1" r="0.48" fill="#fff" />
      <path d="M16-2.2c1.15 1.15 2.9 1.3 4.1.25" fill="none" stroke={navy} strokeWidth="1.1" />
      <ellipse cx="9.4" cy="-4" rx="1.9" ry="1.15" fill="#F0B0A0" opacity="0.9" />
      <path d="M2.4 1.6c2.7 2.1 7.2 2.3 10.6-.3" fill="none" stroke="#C2410C" strokeWidth="2.2" />
      <circle cx="8.4" cy="3.5" r="1.45" fill="#F2B84B" stroke={navy} strokeWidth="0.7" />
      <g transform="translate(5.2 6.4) rotate(-14)">
        <rect width="14.6" height="18.4" rx="1.5" fill={navy} />
        <rect x="12.4" y="1.3" width="1.6" height="15.7" rx="0.4" fill="#F7F4EC" />
        <rect x="2" y="2.4" width="7.1" height="1.6" rx="0.4" fill="#F2B84B" />
        <circle cx="5.6" cy="9.6" r="2.35" fill="none" stroke="#F2B84B" strokeWidth="1.1" />
      </g>
      <ellipse cx="12.4" cy="16.6" rx="3.2" ry="2.15" fill={fur} stroke={navy} strokeWidth="1.3" />
    </g>
  );
}
