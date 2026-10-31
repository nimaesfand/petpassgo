"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { tokens, font } from "../lib/theme";
import {
  LAND, LAKES, GRATICULE, VIEW_W, VIEW_H, ROUTE_SETS, ROUTE_MS,
  modeOf, staticPose, motionPose,
} from "../lib/flightMap";
import PassportPuppy from "./PassportPuppy";

// Illustrative map. The puppy follows example arcs; choosing Domestic or
// International only changes which examples play. Nothing here is tracked.
function Pin({ fill, dot }) {
  return (
    <g>
      <path d="M0 1.2C-1.4-6.2-6.2-9.4-6.2-14.6a6.2 6.2 0 0 1 12.4 0C6.2-9.4 1.4-6.2 0 1.2z" fill={fill} stroke={tokens.navy} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cy="-14.6" r="2.15" fill={dot} />
    </g>
  );
}

function applyPose(refs, pose) {
  const { map, trail, puppy, origin, dest, originLabel, destLabel, dots } = refs;
  map.current?.setAttribute("transform", pose.camera);
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
  if (destLabel.current) {
    destLabel.current.setAttribute("x", pose.dest.lx);
    destLabel.current.setAttribute("y", pose.dest.ly);
    destLabel.current.setAttribute("opacity", String(pose.dest.opacity));
    destLabel.current.textContent = pose.dest.name;
  }
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
  const puppyRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);
  const originLabelRef = useRef(null);
  const destLabelRef = useRef(null);
  const dotRefs = useRef([]);
  const refs = {
    map: mapRef,
    trail: trailRef,
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
    stroke: tokens.sky,
    strokeWidth: 5,
    paintOrder: "stroke",
    strokeLinejoin: "round",
    fontFamily: font.body,
    fontSize: 20,
    fontWeight: 700,
    textAnchor: "middle",
  };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${tokens.gold}`, boxShadow: "0 18px 40px rgba(20,33,61,0.10)" }}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full h-auto" aria-hidden="true">
        <rect width={VIEW_W} height={VIEW_H} fill={tokens.sky} />
        <g className="ppg-cloud" opacity="0.85">
          <ellipse cx="78" cy="34" rx="34" ry="11" fill="#fff" />
          <ellipse cx="104" cy="40" rx="18" ry="8" fill="#fff" />
        </g>
        <g className="ppg-cloud" opacity="0.7" style={{ animationDelay: "-12s" }}>
          <ellipse cx="458" cy="26" rx="30" ry="10" fill="#fff" />
          <ellipse cx="486" cy="32" rx="16" ry="7" fill="#fff" />
        </g>
        <g ref={mapRef} transform={opening.camera}>
          <path d={GRATICULE} fill="none" stroke={tokens.navy} strokeWidth="1" strokeOpacity="0.09" vectorEffect="non-scaling-stroke" />
          <path d={LAND} fill={tokens.navy} fillOpacity="0.26" stroke={tokens.navy} strokeWidth="1.4" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
          <path d={LAKES} fill={tokens.sky} stroke={tokens.navy} strokeWidth="1" strokeOpacity="0.22" vectorEffect="non-scaling-stroke" />
          <path
            ref={trailRef}
            d={opening.trail.d}
            fill="none"
            stroke={tokens.primary}
            strokeWidth={opening.trail.width}
            strokeDasharray={opening.trail.dash}
            strokeLinecap="round"
            opacity={opening.trail.opacity}
          />
        </g>
        {Array.from({ length: 8 }, (_, i) => (
          <circle
            key={i}
            ref={(node) => { dotRefs.current[i] = node; }}
            r="4"
            fill={tokens.navy}
            stroke="#fff"
            strokeWidth="1.4"
            opacity="0"
          />
        ))}
        <g ref={originRef} transform={opening.origin.transform} opacity={opening.origin.opacity}>
          <Pin fill={tokens.gold} dot={tokens.navy} />
        </g>
        <g ref={destRef} transform={opening.dest.transform} opacity={opening.dest.opacity}>
          <Pin fill="#fff" dot={tokens.gold} />
        </g>
        <g ref={puppyRef} transform={opening.puppy.transform} opacity={opening.puppy.opacity}>
          <PassportPuppy />
        </g>
        <text ref={originLabelRef} x={opening.origin.lx} y={opening.origin.ly} opacity={opening.origin.opacity} {...labelProps}>{opening.origin.name}</text>
        <text ref={destLabelRef} x={opening.dest.lx} y={opening.dest.ly} opacity={opening.dest.opacity} {...labelProps}>{opening.dest.name}</text>
      </svg>
    </div>
  );
}
