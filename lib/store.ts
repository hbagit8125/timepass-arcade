"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ArcadeState = {
  best: Record<string, number>;
  favourites: string[];
  recent: string[];
  muted: boolean;
  /** false until saved data has been read from the browser */
  ready: boolean;
  /** Returns true when the score is a new best. */
  submitScore: (slug: string, score: number) => boolean;
  toggleFavourite: (slug: string) => void;
  markPlayed: (slug: string) => void;
  toggleMuted: () => void;
};

type Saved = Pick<ArcadeState, "best" | "favourites" | "recent" | "muted">;

/** Keeps only well-formed saved values, so damaged browser data can't break the site. */
function clean(saved: unknown): Partial<Saved> {
  if (!saved || typeof saved !== "object") return {};
  const s = saved as Record<string, unknown>;
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  const best: Record<string, number> = {};
  if (s.best && typeof s.best === "object") {
    for (const [slug, score] of Object.entries(s.best)) {
      if (typeof score === "number" && Number.isFinite(score) && score >= 0) best[slug] = score;
    }
  }
  return {
    best,
    favourites: strings(s.favourites),
    recent: strings(s.recent).slice(0, 6),
    muted: s.muted === true,
  };
}

export const useArcade = create<ArcadeState>()(
  persist(
    (set, get) => ({
      best: {},
      favourites: [],
      recent: [],
      muted: false,
      ready: false,
      submitScore: (slug, score) => {
        if (score <= (get().best[slug] ?? 0)) return false;
        set((s) => ({ best: { ...s.best, [slug]: score } }));
        return true;
      },
      toggleFavourite: (slug) =>
        set((s) => ({
          favourites: s.favourites.includes(slug)
            ? s.favourites.filter((f) => f !== slug)
            : [...s.favourites, slug],
        })),
      markPlayed: (slug) =>
        set((s) => ({ recent: [slug, ...s.recent.filter((r) => r !== slug)].slice(0, 6) })),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: "timepass-arcade",
      version: 1,
      // Read saved data after hydration (see StoreHydrator) so the first
      // client render matches the server HTML.
      skipHydration: true,
      partialize: ({ best, favourites, recent, muted }) => ({ best, favourites, recent, muted }),
      merge: (saved, current) => ({ ...current, ...clean(saved) }),
      // Older or unknown versions are read through the same clean-up instead of failing.
      migrate: (saved) => clean(saved) as ArcadeState,
    },
  ),
);
