"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { tokens, font } from "../lib/theme";
import {
  LAND, LAKES, GRATICULE, VIEW_W, VIEW_H, ROUTE_SETS, ROUTE_MS,
  modeOf, staticPose, motionPose,
} from "../lib/flightMap";
import PassportPuppy from "./PassportPuppy";

// Illustrative map. The puppy follows sample arcs for the United States,
// Canada, and Mexico. Nothing here is a live flight.
function Pin({ fill, dot }) {
  return (
    <g>
      <path d="M0 1.2C-1.4-6.2-6.2-9.4-6.2-14.6a6.2 6.2 0 0 1 12.4 0C6.2-9.4 1.4-6.2 0 1.2z" fill={fill} stroke={tokens.navy} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cy="-14.6" r="2.15" fill={dot} />
    </g>
  );
}

// A soft white pill behind each city name (sized from the name's length).
function placeChip(node, p) {
  if (!node) return;
  const w = String(p.name || "").length * 9.6 + 22;
  node.setAttribute("x", (Number(p.lx) - w / 2).toFixed(1));
  node.setAttribute("y", (Number(p.ly) - 19).toFixed(1));
  node.setAttribute("width", w.toFixed(1));
  node.setAttribute("opacity", String(p.opacity));
}

function applyPose(refs, pose) {
  const { map, trail, trailGlow, puppy, origin, dest, originLabel, destLabel, originChip, destChip, dots } = refs;
  map.current?.setAttribute("transform", pose.camera);
  if (trailGlow.current) {
    trailGlow.current.setAttribute("d", pose.trail.d);
    trailGlow.current.setAttribute("stroke-width", String(Number(pose.trail.width) * 3.2));
    trailGlow.current.setAttribute("opacity", String(pose.trail.opacity * 0.22));
  }
  if (trail.current) {
    trail.current.setAttribute("d", pose.trail.d);
    trail.current.setAttribute("stroke-width", pose.trail.width);
    trail.current.setAttribute("stroke-dasharray", pose.trail.dash);
    trail.current.setAttribute("opacity", String(pose.trail.opacity));
  }
  puppy.current?.setAttribute("transform", pose.puppy.transform);
  puppy.current?.setAttribute("opacity", String(pose.puppy.opacity));
  origin.current?.setAttribute("transform", pose.origin.transform);
  origin.current?.setAttribute("opacity", String(pose.origin.opacity));
  dest.current?.setAttribute("transform", pose.dest.transform);
  dest.current?.setAttribute("opacity", String(pose.dest.opacity));
  if (originLabel.current) {
    originLabel.current.setAttribute("x", pose.origin.lx);
    originLabel.current.setAttribute("y", pose.origin.ly);
    originLabel.current.setAttribute("opacity", String(pose.origin.opacity));
    originLabel.current.textContent = pose.origin.name;
  }
  placeChip(originChip.current, pose.origin);
  if (destLabel.current) {
    destLabel.current.setAttribute("x", pose.dest.lx);
    destLabel.current.setAttribute("y", pose.dest.ly);
    destLabel.current.setAttribute("opacity", String(pose.dest.opacity));
    destLabel.current.textContent = pose.dest.name;
  }
  placeChip(destChip.current, pose.dest);
  dots.current.forEach((node, i) => {
    const dot = pose.dots[i];
    if (!node || !dot) return;
    node.setAttribute("cx", dot.x.toFixed(1));
    node.setAttribute("cy", dot.y.toFixed(1));
    node.setAttribute("opacity", dot.show ? String(pose.dotOpacity) : "0");
  });
}

export default function FlightPathMap({ route = "" }) {
  const mode = modeOf(route);
  const routes = ROUTE_SETS[mode];
  // First paint matches the moment the flight has just started, so motion
  // doesn't jump. Reduced motion swaps this for a held pose before paint.
  const opening = motionPose(routes, 560, 1, null);
  const poseRef = useRef(opening);
  const faceRef = useRef(opening.face);
  const handoffRef = useRef(null);
  const modeRef = useRef(mode);
  if (modeRef.current !== mode) {
    handoffRef.current = poseRef.current.frame;
    modeRef.current = mode;
    const next = motionPose(routes, 0, faceRef.current, handoffRef.current);
    poseRef.current = next;
    faceRef.current = next.face;
  }

  const mapRef = useRef(null);
  const trailRef = useRef(null);
  const trailGlowRef = useRef(null);
  const originChipRef = useRef(null);
  const destChipRef = useRef(null);
  const puppyRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);
  const originLabelRef = useRef(null);
  const destLabelRef = useRef(null);
  const dotRefs = useRef([]);
  const refs = {
    map: mapRef,
    trail: trailRef,
    trailGlow: trailGlowRef,
    originChip: originChipRef,
    destChip: destChipRef,
    puppy: puppyRef,
    origin: originRef,
    dest: destRef,
    originLabel: originLabelRef,
    destLabel: destLabelRef,
    dots: dotRefs,
  };

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const held = staticPose(mode);
      poseRef.current = held;
      faceRef.current = held.face;
    }
    applyPose(refs, poseRef.current);
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const started = performance.now() - (handoffRef.current ? 0 : 560);
    let raf = 0;

    const frame = (now) => {
      if (mq.matches) {
        const held = staticPose(mode);
        poseRef.current = held;
        faceRef.current = held.face;
        applyPose(refs, held);
        return;
      }
      const elapsed = Math.max(0, now - started);
      if (elapsed >= ROUTE_MS) handoffRef.current = null;
      const next = motionPose(routes, elapsed, faceRef.current, handoffRef.current);
      faceRef.current = next.face;
      poseRef.current = next;
      applyPose(refs, next);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (mq.matches) {
        const held = staticPose(mode);
        poseRef.current = held;
        faceRef.current = held.face;
        applyPose(refs, held);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    start();
    mq.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", start);
    };
  }, [mode]);

  const labelProps = {
    fill: tokens.navy,
    fontFamily: font.body,
    fontSize: 16,
    fontWeight: 700,
    textAnchor: "middle",
  };

  const chipProps = { height: 26, rx: 13, fill: "#fff", stroke: "rgba(20,33,61,0.10)", strokeWidth: 1, filter: "url(#ppgChipShadow)" };

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${tokens.line}`, boxShadow: "0 24px 60px rgba(20,33,61,0.12)" }}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full h-auto" aria-hidden="true">
        <defs>
          <linearGradient id="ppgOcean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EAF3FB" />
            <stop offset="1" stopColor="#D6E7F5" />
          </linearGradient>
          <linearGradient id="ppgLand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFDF8" />
            <stop offset="1" stopColor="#F5EEDF" />
          </linearGradient>
          <linearGradient id="ppgTrail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={tokens.gold} />
            <stop offset="1" stopColor={tokens.primary} />
          </linearGradient>
          <pattern id="ppgDots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.9" fill={tokens.navy} fillOpacity="0.09" />
          </pattern>
          <radialGradient id="ppgVignette" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor={tokens.navy} stopOpacity="0.10" />
          </radialGradient>
          <filter id="ppgChipShadow" x="-20%" y="-40%" width="140%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#14213D" floodOpacity="0.16" />
          </filter>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} fill="url(#ppgOcean)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#ppgDots)" />
        <g ref={mapRef} transform={opening.camera}>
          <path d={GRATICULE} fill="none" stroke="#5B8DB8" strokeWidth="1" strokeOpacity="0.16" vectorEffect="non-scaling-stroke" />
          <path d={LAND} transform="translate(1.6 2.4)" fill={tokens.navy} fillOpacity="0.10" />
          <path d={LAND} fill="url(#ppgLand)" stroke="#9FB6CC" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          <path d={LAKES} fill="#DCEBF7" stroke="#9FB6CC" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          <path ref={trailGlowRef} d={opening.trail.d} fill="none" stroke={tokens.primary} strokeWidth={opening.trail.width * 3.2} strokeLinecap="round" opacity={opening.trail.opacity * 0.22} />
          <path
            ref={trailRef}
            d={opening.trail.d}
            fill="none"
            stroke="url(#ppgTrail)"
            strokeWidth={opening.trail.width}
            strokeDasharray={opening.trail.dash}
            strokeLinecap="round"
            opacity={opening.trail.opacity}
          />
        </g>
        <g className="ppg-cloud" opacity="0.9">
          <ellipse cx="78" cy="34" rx="34" ry="11" fill="#fff" />
          <ellipse cx="104" cy="40" rx="18" ry="8" fill="#fff" />
        </g>
        <g className="ppg-cloud" opacity="0.75" style={{ animationDelay: "-12s" }}>
          <ellipse cx="458" cy="26" rx="30" ry="10" fill="#fff" />
          <ellipse cx="486" cy="32" rx="16" ry="7" fill="#fff" />
        </g>
        {Array.from({ length: 8 }, (_, i) => (
          <circle
            key={i}
            ref={(node) => { dotRefs.current[i] = node; }}
            r="3.4"
            fill="#fff"
            stroke={tokens.navy}
            strokeWidth="1.8"
            opacity="0"
          />
        ))}
        <g ref={originRef} transform={opening.origin.transform} opacity={opening.origin.opacity}>
          <circle r="11" cy="-14.6" fill={tokens.gold} opacity="0.25" className="ppg-pin-pulse" />
          <Pin fill={tokens.gold} dot={tokens.navy} />
        </g>
        <g ref={destRef} transform={opening.dest.transform} opacity={opening.dest.opacity}>
          <circle r="11" cy="-14.6" fill={tokens.primary} opacity="0.18" className="ppg-pin-pulse" style={{ animationDelay: "-0.9s" }} />
          <Pin fill="#fff" dot={tokens.primary} />
        </g>
        <g ref={puppyRef} transform={opening.puppy.transform} opacity={opening.puppy.opacity}>
          <PassportPuppy />
        </g>
        <rect ref={originChipRef} {...chipProps} x="0" y="0" width="0" opacity="0" />
        <rect ref={destChipRef} {...chipProps} x="0" y="0" width="0" opacity="0" />
        <text ref={originLabelRef} x={opening.origin.lx} y={opening.origin.ly} opacity={opening.origin.opacity} {...labelProps}>{opening.origin.name}</text>
        <text ref={destLabelRef} x={opening.dest.lx} y={opening.dest.ly} opacity={opening.dest.opacity} {...labelProps}>{opening.dest.name}</text>
        <rect width={VIEW_W} height={VIEW_H} fill="url(#ppgVignette)" pointerEvents="none" />
      </svg>
      <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 4px 14px rgba(20,33,61,0.12)", fontFamily: font.body, fontSize: 12.5, fontWeight: 700, color: tokens.navy, backdropFilter: "blur(6px)" }}>
        <span className="ppg-live-dot" aria-hidden="true" />
        U.S. · Canada · Mexico
      </div>
      <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.85)", fontFamily: font.body, fontSize: 11, fontWeight: 600, color: tokens.muted }}>
        Sample routes
      </div>
    </div>
  );
}
