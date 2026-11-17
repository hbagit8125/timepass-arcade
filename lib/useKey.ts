"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `handler` for every key press on the page. Return true from the
 * handler to stop the browser's default action (such as scrolling).
 */
export function useKey(handler: (key: string, e: KeyboardEvent) => boolean | void) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
        // Let Enter and Space press the focused button instead of the game.
        if (/^(BUTTON|A)$/.test(target.tagName) && (e.key === "Enter" || e.key === " ")) return;
      }
      if (latest.current(e.key, e) === true) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
