// Decorative example routes for the homepage map. Positions are a fixed
// illustration — not a live flight, a GPS trace, or the visitor's trip.
import { LAND, LAKES, GRATICULE } from "./flightMapLand";

export { LAND, LAKES, GRATICULE };

export const VIEW_W = 560;
export const VIEW_H = 300;
const ASPECT = VIEW_W / VIEW_H;

export const ROUTE_MS = 7000;

export const CITIES = {
  lax: { name: "Los Angeles", x: 795.36, y: 235.13 },
  nyc: { name: "New York", x: 986.8, y: 199.5 },
  sha: { name: "Shanghai", x: 274.71, y: 250.22 },
  chi: { name: "Chicago", x: 927.85, y: 193.24 },
  yyz: { name: "Toronto", x: 963.55, y: 183.77 },
  hou: { name: "Houston", x: 894.34, y: 258.08 },
  mex: { name: "Mexico City", x: 878.07, y: 313.35 },
  mia: { name: "Miami", x: 960.05, y: 279.48 },
  cun: { name: "Cancún", x: 931.22, y: 304.09 },
  yvr: { name: "Vancouver", x: 774.24, y: 153.65 },
  lhr: { name: "London", x: 1306.61, y: 141.72 },
  sfo: { name: "San Francisco", x: 777.27, y: 215.23 },
  nrt: { name: "Tokyo", x: 353.92, y: 226.41 },
  pek: { name: "Beijing", x: 252.81, y: 203.84 },
  den: { name: "Denver", x: 852.71, y: 204.69 },
  dal: { name: "Dallas", x: 888.16, y: 241.93 },
  atl: { name: "Atlanta", x: 941.87, y: 236.74 },
  bos: { name: "Boston", x: 999.56, y: 190.67 },
  sea: { name: "Seattle", x: 777.66, y: 162.59 },
};

const DOT_IDS = ["lax", "nyc", "sha", "chi", "yyz", "hou", "mex", "mia", "cun", "yvr", "lhr", "sfo", "nrt", "pek", "den", "dal", "atl", "bos", "sea"];

const PAIRS = {
  all: [
    ["lax", "nyc"],
    ["chi", "yyz"],
    ["mia", "cun"],
    ["lax", "yvr"],
    ["hou", "mex"],
    ["nyc", "lhr"],
    ["lax", "sha"],
    ["sfo", "nrt"],
  ],
  domestic: [
    ["lax", "nyc"],
    ["lax", "yvr"],
    ["chi", "yyz"],
    ["hou", "mex"],
    ["mia", "cun"],
  ],
  international: [
    ["lax", "sha"],
    ["sfo", "nrt"],
    ["nyc", "lhr"],
  ],
};

function quadPoint(a, c, b, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  };
}

function partialPath(a, c, b, t) {
  if (t <= 0.004) return "";
  const q1x = a.x + (c.x - a.x) * t;
  const q1y = a.y + (c.y - a.y) * t;
  const p = quadPoint(a, c, b, t);
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${q1x.toFixed(1)} ${q1y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}

function buildRoute(pair) {
  const a = CITIES[pair[0]];
  const b = CITIES[pair[1]];
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const lift = Math.min(150, Math.max(32, dist * 0.33));
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - lift };
  const geo = { fromId: pair[0], toId: pair[1], a, b, c, dist };
  return { ...geo, frame: frameFor(geo) };
}

function frameFor(geo) {
  const pts = [geo.a, geo.b, geo.c];
  let minX = Math.min(pts[0].x, pts[1].x, pts[2].x);
  let maxX = Math.max(pts[0].x, pts[1].x, pts[2].x);
  let minY = Math.min(pts[0].y, pts[1].y, pts[2].y);
  let maxY = Math.max(pts[0].y, pts[1].y, pts[2].y);
  const padX = Math.max(64, geo.dist * 0.18);
  const padY = Math.max(42, geo.dist * 0.1);
  minX -= padX;
  maxX += padX;
  minY -= padY + 10;
  maxY += padY;
  let w = maxX - minX;
  let h = maxY - minY;
  const minW = 188;
  if (w < minW) {
    const grow = (minW - w) / 2;
    minX -= grow;
    maxX += grow;
    w = minW;
  }
  if (w / h < ASPECT) {
    const target = h * ASPECT;
    const grow = (target - w) / 2;
    minX -= grow;
    maxX += grow;
    w = target;
  } else {
    const target = w / ASPECT;
    const grow = (target - h) / 2;
    minY -= grow * 0.62;
    maxY += grow * 0.38;
    h = target;
  }
  return { minX, minY, w, h };
}

export const ROUTE_SETS = {
  all: PAIRS.all.map(buildRoute),
  domestic: PAIRS.domestic.map(buildRoute),
  international: PAIRS.international.map(buildRoute),
};

export function modeOf(route) {
  if (route === "international") return "international";
  if (route === "domestic") return "domestic";
  return "all";
}

function easeInOut(t) {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
}

function lerpFrame(a, b, t) {
  const e = easeInOut(t);
  return {
    minX: a.minX + (b.minX - a.minX) * e,
    minY: a.minY + (b.minY - a.minY) * e,
    w: a.w + (b.w - a.w) * e,
    h: a.h + (b.h - a.h) * e,
  };
}

function toScreen(p, frame) {
  const s = VIEW_W / frame.w;
  return { x: (p.x - frame.minX) * s, y: (p.y - frame.minY) * s, s };
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function labelPoint(name, cityScreen, otherScreen) {
  const dx = cityScreen.x - otherScreen.x;
  const dy = cityScreen.y - otherScreen.y;
  const len = Math.hypot(dx, dy) || 1;
  const half = Math.min(116, name.length * 5.7 + 8);
  const uy = dy / len;
  let x = cityScreen.x + (dx / len) * 18;
  let y = uy > 0.4 ? cityScreen.y + 44 : cityScreen.y - 52;
  x = clamp(x, half, VIEW_W - half);
  y = clamp(y, 16, VIEW_H - 12);
  return { x, y };
}

function poseFrom(route, frame, progress, trailProgress, prevFace, opacity) {
  const t = Math.max(0, Math.min(1, progress));
  const puppyAt = quadPoint(route.a, route.c, route.b, t);
  const ahead = quadPoint(route.a, route.c, route.b, Math.min(1, t + 0.03));
  const vx = ahead.x - puppyAt.x;
  const vy = ahead.y - puppyAt.y;
  const span = Math.hypot(vx, vy) || 1;
  const dir = vx / span;
  let face = prevFace >= 0 ? 1 : -1;
  if (dir > 0.22) face = 1;
  else if (dir < -0.22) face = -1;
  let bank = Math.atan2(vy, Math.abs(vx)) * (180 / Math.PI);
  bank = clamp(bank, -14, 14);

  const pup = toScreen(puppyAt, frame);
  const origin = toScreen(route.a, frame);
  const dest = toScreen(route.b, frame);
  const s = origin.s;
  let originLabel = labelPoint(route.a.name, origin, dest);
  let destLabel = labelPoint(route.b.name, dest, origin);
  if (Math.hypot(originLabel.x - destLabel.x, originLabel.y - destLabel.y) < 100) {
    originLabel = { x: originLabel.x, y: clamp(originLabel.y - 16, 16, VIEW_H - 12) };
    destLabel = { x: destLabel.x, y: clamp(destLabel.y + 18, 16, VIEW_H - 12) };
  }

  const dots = [];
  for (const id of DOT_IDS) {
    if (id === route.fromId || id === route.toId) continue;
    const p = toScreen(CITIES[id], frame);
    if (p.x < 16 || p.x > VIEW_W - 16 || p.y < 16 || p.y > VIEW_H - 16) continue;
    if (Math.hypot(p.x - origin.x, p.y - origin.y) < 26) continue;
    if (Math.hypot(p.x - dest.x, p.y - dest.y) < 26) continue;
    let crowded = false;
    for (const other of dots) {
      if (Math.hypot(p.x - other.x, p.y - other.y) < 18) crowded = true;
    }
    if (crowded) continue;
    dots.push({ x: p.x, y: p.y, show: true });
    if (dots.length === 8) break;
  }
  while (dots.length < 8) dots.push({ x: 0, y: 0, show: false });

  const trailT = Math.max(0, Math.min(1, trailProgress));
  const width = 2.7 / s;
  return {
    frame,
    face,
    camera: `translate(${(-frame.minX * s).toFixed(2)} ${(-frame.minY * s).toFixed(2)}) scale(${s.toFixed(4)})`,
    trail: {
      d: partialPath(route.a, route.c, route.b, trailT) || "M0 0",
      width: width.toFixed(3),
      dash: `${(5.5 / s).toFixed(2)} ${(8 / s).toFixed(2)}`,
      opacity: trailT <= 0.004 ? 0 : opacity.trail,
    },
    puppy: {
      transform: `translate(${pup.x.toFixed(2)} ${pup.y.toFixed(2)}) rotate(${bank.toFixed(2)}) scale(${face} 1)`,
      opacity: opacity.puppy,
    },
    origin: {
      transform: `translate(${origin.x.toFixed(2)} ${origin.y.toFixed(2)})`,
      name: route.a.name,
      lx: originLabel.x.toFixed(1),
      ly: originLabel.y.toFixed(1),
      opacity: opacity.pins,
    },
    dest: {
      transform: `translate(${dest.x.toFixed(2)} ${dest.y.toFixed(2)})`,
      name: route.b.name,
      lx: destLabel.x.toFixed(1),
      ly: destLabel.y.toFixed(1),
      opacity: opacity.pins,
    },
    dots,
    dotOpacity: opacity.pins,
  };
}

export function staticPose(mode) {
  const routes = ROUTE_SETS[mode] || ROUTE_SETS.all;
  const route = routes[0];
  const seed = route.b.x >= route.a.x ? 1 : -1;
  return poseFrom(route, route.frame, 0.58, 1, seed, { puppy: 1, trail: 1, pins: 1 });
}

// handoffFrame: camera to ease in from, used for the first route after a
// region change. Fresh loads stay framed on the opening route.
export function motionPose(routes, elapsed, prevFace, handoffFrame) {
  const n = routes.length;
  const cycle = n * ROUTE_MS;
  const safeElapsed = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const t = safeElapsed % cycle;
  const index = ((Math.floor(t / ROUTE_MS) % n) + n) % n;
  const local = (t - index * ROUTE_MS) / ROUTE_MS;
  const route = routes[index] || routes[0];
  const routeFace = route.b.x >= route.a.x ? 1 : -1;
  const faceSeed = local < 0.2 ? routeFace : prevFace;
  const prevIndex = (index + n - 1) % n;
  let fromFrame = null;
  if (handoffFrame && elapsed < ROUTE_MS) fromFrame = handoffFrame;
  else if (elapsed >= ROUTE_MS) fromFrame = routes[prevIndex].frame;

  const intro = 0.16;
  const frame = fromFrame && local < intro ? lerpFrame(fromFrame, route.frame, local / intro) : route.frame;
  const flyStart = fromFrame ? intro : 0.02;
  const flyEnd = 0.84;
  let progress = 1;
  if (local <= flyStart) progress = 0;
  else if (local < flyEnd) progress = easeInOut((local - flyStart) / (flyEnd - flyStart));

  let puppy = 1;
  if (local > 0.93) puppy = Math.max(0, (1 - local) / 0.07);
  let pins = 1;
  if (local > 0.94) pins = Math.max(0, (1 - local) / 0.06);
  const trail = progress <= 0 ? 0 : puppy;

  return poseFrom(route, frame, progress, progress, faceSeed, { puppy, trail, pins });
}
