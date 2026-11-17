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

/** The set of keys currently held down, for games that move while a key is pressed. */
export function useHeldKeys() {
  const held = useRef(new Set<string>());
  useEffect(() => {
    const keys = held.current;
    const down = (e: KeyboardEvent) => keys.add(e.key);
    const up = (e: KeyboardEvent) => keys.delete(e.key);
    const clear = () => keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);
  return held;
}
