"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, GAMES, getGame, type Category } from "@/games/registry";
import { useArcade } from "@/lib/store";
import { GameCard } from "./GameCard";
import { GameIcon } from "./GameIcon";

type Filter = "all" | "favourites" | Category;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORIES,
  { id: "favourites", label: "Favourites" },
];

export function GameBrowser() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const favourites = useArcade((s) => s.favourites);
  const recent = useArcade((s) => s.recent);

  const q = query.trim().toLowerCase();
  const games = GAMES.filter((g) => {
    if (filter === "favourites" && !favourites.includes(g.slug)) return false;
    if (filter !== "all" && filter !== "favourites" && g.category !== filter) return false;
    return !q || g.name.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q);
  });

  const recentGames = recent.map(getGame).filter((g) => g !== undefined);

  return (
    <section id="games" className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 sm:px-8">
      {recentGames.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Continue playing</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {recentGames.map((g) => (
              <Link
                key={g.slug}
                href={`/games/${g.slug}`}
                data-cat={g.category}
                className="glass flex items-center gap-3 rounded-full py-2 pl-2 pr-5 font-medium transition-colors hover:border-(--cat)"
              >
                <span className="grid size-9 place-items-center rounded-full bg-(--cat) text-on-accent">
                  <GameIcon name={g.icon} className="size-[18px]" />
                </span>
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="font-display text-3xl font-bold tracking-tight">All games</h2>
        <label className="glass flex h-12 items-center gap-2.5 rounded-full px-4 lg:w-72">
          <Search className="size-[18px] shrink-0 text-muted" aria-hidden />
          <span className="sr-only">Search games</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter games">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
                active ? "bg-ink text-bg" : "glass text-ink hover:bg-surface-strong"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {games.length > 0 ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      ) : (
        <p className="glass mt-7 rounded-3xl p-8 text-muted">
          {filter === "favourites" && !q
            ? "No favourites yet. Tap the heart on a game to keep it here."
            : "No games match that. Try a different word or filter."}
        </p>
      )}
    </section>
  );
}
