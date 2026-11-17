"use client";

import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GAMES, PLAYABLE } from "@/games/registry";
import { sfx } from "@/lib/sound";
import { GameIcon } from "./GameIcon";

export function Hero() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const timers = useRef<number[]>([]);

  // Idle: the reel drifts through the catalogue.
  useEffect(() => {
    if (spinning || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % GAMES.length), 1800);
    return () => window.clearInterval(id);
  }, [spinning]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  function surprise() {
    if (spinning) return;
    const target = PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];
    const targetIndex = GAMES.findIndex((g) => g.slug === target.slug);
    setSpinning(true);
    const steps = 14;
    for (let s = 1; s <= steps; s++) {
      timers.current.push(
        window.setTimeout(() => {
          sfx.click();
          setIndex(s === steps ? targetIndex : Math.floor(Math.random() * GAMES.length));
        }, s * 85),
      );
    }
    timers.current.push(window.setTimeout(() => router.push(`/games/${target.slug}`), steps * 85 + 450));
  }

  const game = GAMES[index];

  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-14 pt-6 sm:px-8 md:grid-cols-[1.25fr_1fr] md:pb-20 md:pt-12">
      <div>
        <h1 className="font-display text-[clamp(3rem,10vw,6.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em]">
          Got five
          <br />
          minutes?
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          Quick games for short breaks. No sign-up, nothing to install. Pick one and play.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={surprise}
            disabled={spinning}
            className="inline-flex h-13 items-center gap-2.5 rounded-full bg-linear-to-r from-puzzle to-arcade px-7 text-base font-semibold text-on-accent shadow-lift transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-80"
          >
            <Dices className={`size-5 ${spinning ? "animate-spin" : ""}`} aria-hidden />
            Surprise me
          </button>
          <a
            href="#games"
            className="glass inline-flex h-13 items-center rounded-full px-7 text-base font-medium transition-colors hover:bg-surface-strong"
          >
            Browse all games
          </a>
        </div>
      </div>

      <div className="flex justify-center md:justify-end" aria-hidden>
        <div
          data-cat={game.category}
          className="glass relative flex aspect-square w-full max-w-[19rem] rotate-3 flex-col items-center justify-center gap-5 rounded-[2.25rem] shadow-lift"
        >
          <div
            key={game.slug}
            className="grid size-28 place-items-center rounded-[1.75rem] bg-(--cat) text-on-accent motion-safe:animate-[tile-in_220ms_ease-out]"
          >
            <GameIcon name={game.icon} className="size-14" />
          </div>
          <div className="min-h-20 px-4 text-center">
            <div className="font-display text-2xl font-bold tracking-tight">{game.name}</div>
            <div className="mx-auto mt-1 max-w-52 text-sm leading-snug text-muted">{game.playable ? game.tagline : "Coming soon"}</div>
          </div>
          <span className="absolute -left-3 -top-3 size-6 rounded-lg bg-classic" />
          <span className="absolute -bottom-4 right-10 size-8 rounded-xl bg-reflex" />
        </div>
      </div>
    </section>
  );
}
