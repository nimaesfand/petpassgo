export default function PawMark({ size = 18, color = "#14213D" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="8" r="2.1" fill={color} />
      <circle cx="12" cy="5.2" r="2.1" fill={color} />
      <circle cx="17" cy="8" r="2.1" fill={color} />
      <ellipse cx="12" cy="15.2" rx="4.2" ry="3.4" fill={color} />
    </svg>
  );
}
