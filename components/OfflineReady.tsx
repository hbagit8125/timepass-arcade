"use client";

import { useEffect } from "react";
import { preloadAllGames } from "@/games/loaders";
import { GAMES } from "@/games/registry";

/**
 * Registers the service worker, then quietly downloads every game once so
 * the whole arcade works offline. Renders nothing.
 */
export function OfflineReady() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    async function warm() {
      // Wait until the service worker controls this page, so it sees the downloads.
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) =>
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }),
        );
      }
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      if (cancelled || saveData || sessionStorage.getItem("timepass-warm")) return;

      // Files this page loaded before the service worker took over.
      const loaded = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => name.startsWith(location.origin + "/_next/static/"));
      const pages = ["/", ...GAMES.filter((g) => g.playable).map((g) => `/games/${g.slug}`)];

      await Promise.allSettled([...loaded, ...pages].map((url) => fetch(url)));
      await preloadAllGames();
      // Marked done only at the end, so leaving the page part-way just means it runs again.
      sessionStorage.setItem("timepass-warm", "1");
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // Start a few seconds after the page has finished loading, when the browser is idle,
        // so the download never slows down the first screen.
        const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 1));
        const later = () => window.setTimeout(() => idle(() => void warm().catch(() => {})), 4000);
        if (document.readyState === "complete") later();
        else window.addEventListener("load", later, { once: true });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
