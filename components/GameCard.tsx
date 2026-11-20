"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { PointerEvent } from "react";
import type { GameMeta } from "@/games/registry";
import { CATEGORIES } from "@/games/registry";
import { useArcade } from "@/lib/store";
import { GameIcon } from "./GameIcon";
import { GamePreview } from "./GamePreview";

function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const box = el.getBoundingClientRect();
  const x = (e.clientX - box.left) / box.width - 0.5;
  const y = (e.clientY - box.top) / box.height - 0.5;
  el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
}

function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

export function GameCard({ game }: { game: GameMeta }) {
  const best = useArcade((s) => s.best[game.slug]);
  const isFavourite = useArcade((s) => s.favourites.includes(game.slug));
  const toggleFavourite = useArcade((s) => s.toggleFavourite);
  const categoryLabel = CATEGORIES.find((c) => c.id === game.category)?.label;

  const body = (
    <>
      <div
        className={`grid h-24 place-items-center rounded-2xl ${
          game.playable ? "bg-[color-mix(in_oklab,var(--cat)_13%,transparent)]" : "border border-dashed border-(--cat)"
        }`}
      >
        {game.playable ? (
          <GamePreview slug={game.slug} className="h-[4.5rem]" />
        ) : (
          <GameIcon name={game.icon} className="size-6 text-(--cat-ink)" />
        )}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{game.name}</h3>
      <p className="mt-1 text-sm leading-snug text-muted">{game.tagline}</p>
      <div className="mt-auto flex items-center justify-between pt-5 text-sm">
        <span className="font-medium text-(--cat-ink)">{categoryLabel}</span>
        <span className="text-muted">
          {!game.playable ? "Coming soon" : best ? `Best ${best.toLocaleString("en")}` : "Not played yet"}
        </span>
      </div>
    </>
  );

  if (!game.playable) {
    return (
      <article
        data-cat={game.category}
        className="flex min-h-60 flex-col rounded-3xl border border-dashed border-line p-5 opacity-70"
      >
        {body}
      </article>
    );
  }

  return (
    <article
      data-cat={game.category}
      onPointerMove={tilt}
      onPointerLeave={untilt}
      className="tilt glass relative flex min-h-60 flex-col rounded-3xl p-5 shadow-lift hover:border-(--cat)"
    >
      <Link href={`/games/${game.slug}`} className="absolute inset-0 rounded-3xl" aria-label={`Play ${game.name}`} />
      {body}
      <button
        type="button"
        onClick={() => toggleFavourite(game.slug)}
        aria-label={isFavourite ? `Remove ${game.name} from favourites` : `Add ${game.name} to favourites`}
        className="absolute right-6 top-6 z-10 grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-arcade"
      >
        <Heart className={`size-5 ${isFavourite ? "fill-arcade text-arcade" : ""}`} />
      </button>
    </article>
  );
}
