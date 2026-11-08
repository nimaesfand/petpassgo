import { tokens, font } from "../lib/theme";

// PetPassGo brand (W1, Nov 2026).
// Logo = the app icon: the gold "Go" on a navy tile. Drawn as an outline so it
// looks the same everywhere, with or without web fonts.
// Wordmark = "PetPass" + an orange "Go" (gold on dark backgrounds).

const GO_PATH = "M334 14Q253 14 188.5 -23.5Q124 -61 86.5 -135.5Q49 -210 49 -323Q49 -406 70.5 -470.5Q92 -535 133.5 -580.5Q175 -626 236.0 -650.0Q297 -674 377 -674Q437 -674 486.0 -660.0Q535 -646 571.0 -620.0Q607 -594 627.5 -557.5Q648 -521 650 -475L514 -433Q512 -475 492.5 -502.0Q473 -529 441.5 -542.5Q410 -556 371 -556Q317 -556 278.5 -531.5Q240 -507 220.0 -456.5Q200 -406 200 -329Q200 -270 211.5 -227.5Q223 -185 246.0 -157.0Q269 -129 301.0 -115.5Q333 -102 375 -102Q419 -102 451.5 -116.5Q484 -131 503.5 -161.5Q523 -192 525 -239H400V-343H667V-222V0H567L569 -169H551Q535 -109 508.0 -68.5Q481 -28 438.5 -7.0Q396 14 334 14Z M985.0 14Q906.0 14 846.0 -17.5Q786.0 -49 752.0 -110.5Q718.0 -172 718.0 -264Q718.0 -356 752.5 -417.0Q787.0 -478 847.5 -508.5Q908.0 -539 985.0 -539Q1064.0 -539 1124.5 -508.0Q1185.0 -477 1219.5 -415.5Q1254.0 -354 1254.0 -262Q1254.0 -169 1218.5 -107.5Q1183.0 -46 1122.5 -16.0Q1062.0 14 985.0 14ZM990.0 -93Q1029.0 -93 1055.5 -111.0Q1082.0 -129 1095.5 -165.5Q1109.0 -202 1109.0 -254Q1109.0 -309 1094.5 -347.5Q1080.0 -386 1052.0 -406.5Q1024.0 -427 981.0 -427Q944.0 -427 917.0 -409.5Q890.0 -392 876.0 -355.5Q862.0 -319 862.0 -266Q862.0 -181 896.0 -137.0Q930.0 -93 990.0 -93Z";

export default function Logo({ size = 34, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
      style={{ flexShrink: 0, display: "block" }}
    >
      <rect width="24" height="24" rx="6" fill={tokens.navy} />
      <path transform="translate(2.398 16.864) scale(0.01474)" fill={tokens.gold} d={GO_PATH} />
    </svg>
  );
}

export function Wordmark({ size = 24, onDark = false, className, style }) {
  return (
    <span
      className={className}
      style={{ fontFamily: font.display, fontWeight: 800, fontSize: size, letterSpacing: "-0.035em", lineHeight: 1, color: onDark ? "#fff" : tokens.navy, whiteSpace: "nowrap", ...style }}
    >
      PetPass<span style={{ color: onDark ? tokens.gold : tokens.primary }}>Go</span>
    </span>
  );
}
