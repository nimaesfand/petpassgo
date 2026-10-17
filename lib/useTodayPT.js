"use client";
import { useEffect, useState } from "react";
import { todayPT } from "./travelDates";

// Today's calendar date in America/Los_Angeles, kept live: recomputed on mount,
// every minute, and whenever the tab regains focus/visibility — so an account
// page left open across midnight (or restored from cache) never shows a
// countdown formed on an earlier day.
export function useTodayPT() {
  const [today, setToday] = useState(() => todayPT());
  useEffect(() => {
    const tick = () => setToday((prev) => { const next = todayPT(); return next === prev ? prev : next; });
    tick();
    const id = setInterval(tick, 60000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, []);
  return today;
}
