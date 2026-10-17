"use client";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution, trackPageView, trackViewContent } from "../lib/analytics";

// Captures first-touch UTMs on any landing and sends a page_view per App
// Router navigation (no reloads). Renders nothing; loads nothing unless the
// GA/Meta env IDs are set. See lib/analytics.js.
function Tracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    captureAttribution();
    trackPageView(pathname + (search?.toString() ? `?${search.toString()}` : ""));
  }, [pathname, search]);
  return null;
}
export default function Analytics() {
  return <Suspense fallback={null}><Tracker /></Suspense>;
}

// Fire ViewContent when a (server-rendered) sales page mounts. Props are
// plain strings so this stays RSC-safe.
export function TrackOnMount({ contentType, contentName }) {
  useEffect(() => { trackViewContent(contentType, contentName); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
