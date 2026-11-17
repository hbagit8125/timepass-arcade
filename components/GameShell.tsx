"use client";

import Link from "next/link";
import { ArrowLeft, CircleHelp, Heart, Maximize, Minimize, Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_COMPONENTS } from "@/games/loaders";
import { getGame } from "@/games/registry";
import type { GameResult } from "@/games/types";
import { sfx } from "@/lib/sound";
import { useArcade } from "@/lib/store";
import { Confetti } from "./Confetti";

type EndState = GameResult & { newBest: boolean };

const control =
  "glass inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors hover:bg-surface-strong sm:gap-2 sm:px-4";

export function GameShell({ slug }: { slug: string }) {
  const game = getGame(slug)!;
  const Game = GAME_COMPONENTS[slug];

  const ready = useArcade((s) => s.ready);
  const best = useArcade((s) => s.best[slug] ?? 0);
  const isFavourite = useArcade((s) => s.favourites.includes(slug));
  const toggleFavourite = useArcade((s) => s.toggleFavourite);

  const [run, setRun] = useState(0);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [end, setEnd] = useState<EndState | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  // Best score when this round began, to tell whether the round set a new one.
  const bestAtStart = useRef<number | null>(null);

  useEffect(() => {
    if (ready) useArcade.getState().markPlayed(slug);
  }, [ready, slug]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Real-time games pause themselves when the tab is hidden, and with the P key.
  useEffect(() => {
    if (!game.pausable) return;
    const onHide = () => document.hidden && setPaused(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p" && !e.metaKey && !e.ctrlKey && !e.altKey) setPaused((p) => !p);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("keydown", onKey);
    };
  }, [game.pausable]);

  const handleScore = useCallback(
    (value: number) => {
      const state = useArcade.getState();
      bestAtStart.current ??= state.best[slug] ?? 0;
      setScore(value);
      state.submitScore(slug, value);
    },
    [slug],
  );

  const handleEnd = useCallback(
    (result: GameResult) => {
      const state = useArcade.getState();
      const before = bestAtStart.current ?? state.best[slug] ?? 0;
      state.submitScore(slug, result.score);
      const newBest = result.score > before && result.score > 0;
      if (result.won || newBest) sfx.win();
      else sfx.lose();
      setEnd({ ...result, newBest });
    },
    [slug],
  );

  function restart() {
    bestAtStart.current = null;
    setScore(0);
    setEnd(null);
    setPaused(false);
    setRun((r) => r + 1);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.current?.requestFullscreen?.().catch(() => {});
  }

  return (
    <div data-cat={game.category} className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex h-11 items-center gap-2 rounded-full pr-3 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden />
          All games
        </Link>
        <button
          type="button"
          onClick={() => toggleFavourite(slug)}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-arcade"
        >
          <Heart className={`size-5 ${isFavourite ? "fill-arcade text-arcade" : ""}`} />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">{game.name}</h1>
        <dl className="flex gap-2">
          <div className="glass min-w-20 rounded-2xl px-3 py-1.5 text-center sm:min-w-24 sm:px-4 sm:py-2">
            <dt className="text-xs font-medium text-muted">Score</dt>
            <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl">{score.toLocaleString("en")}</dd>
          </div>
          <div className="glass min-w-20 rounded-2xl px-3 py-1.5 text-center sm:min-w-24 sm:px-4 sm:py-2">
            <dt className="text-xs font-medium text-muted">Best</dt>
            <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl text-(--cat-ink)">
              {Math.max(best, score).toLocaleString("en")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        <button type="button" onClick={restart} className={control}>
          <RotateCcw className="size-4" aria-hidden />
          New game
        </button>
        {game.pausable && !end && (
          <button type="button" onClick={() => setPaused((p) => !p)} className={control}>
            {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        <button type="button" onClick={() => setShowHelp((h) => !h)} aria-expanded={showHelp} className={control}>
          <CircleHelp className="size-4" aria-hidden />
          <span className="sm:hidden">Help</span>
          <span className="hidden sm:inline">How to play</span>
        </button>
        <button type="button" onClick={toggleFullscreen} className={`${control} ml-auto`} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>
          {fullscreen ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
          <span className="hidden sm:inline">{fullscreen ? "Exit full screen" : "Full screen"}</span>
        </button>
      </div>

      {showHelp && (
        <div className="glass mt-3 rounded-2xl p-5 text-sm leading-relaxed">
          <p>{game.howTo.goal}</p>
          <dl className="mt-3 grid gap-x-4 gap-y-1 text-muted sm:grid-cols-[auto_1fr]">
            <dt className="font-medium text-ink">Keyboard</dt>
            <dd>{game.howTo.keyboard}</dd>
            <dt className="font-medium text-ink">Touch</dt>
            <dd>{game.howTo.touch}</dd>
          </dl>
        </div>
      )}

      <div
        ref={stage}
        className="relative mt-4 flex min-h-[min(34rem,calc(100dvh-13rem))] flex-1 flex-col items-center justify-start [&:fullscreen]:justify-center [&:fullscreen]:bg-bg [&:fullscreen]:p-6"
      >
        <Game key={run} paused={paused || end !== null} onScore={handleScore} onEnd={handleEnd} />

        {paused && !end && (
          <div className="absolute inset-0 grid place-items-center rounded-3xl bg-bg/80 backdrop-blur-sm">
            <button type="button" onClick={() => setPaused(false)} className="h-13 rounded-full bg-ink px-8 font-semibold text-bg">
              Resume
            </button>
          </div>
        )}

        {end && (
          <div
            role="dialog"
            aria-label={end.won ? "You win" : "Game over"}
            className="absolute inset-0 z-20 grid place-items-center rounded-3xl bg-bg/85 p-6 text-center backdrop-blur-sm motion-safe:animate-[tile-in_260ms_ease-out]"
          >
            <div>
              <h2 className="font-display text-5xl font-extrabold tracking-[-0.03em]">
                {end.won ? "You win" : "Game over"}
              </h2>
              <p className="mt-3 text-lg text-muted">
                You scored <strong className="text-ink">{end.score.toLocaleString("en")}</strong>.
                {end.message && <span className="mt-1 block">{end.message}</span>}
                {end.newBest && <span className="mt-1 block font-semibold text-(--cat-ink)">That is your new best score.</span>}
              </p>
              <button
                type="button"
                onClick={restart}
                autoFocus
                className="mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-linear-to-r from-puzzle to-arcade px-8 font-semibold text-on-accent transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                <RotateCcw className="size-4" aria-hidden />
                Play again
              </button>
            </div>
          </div>
        )}
      </div>

      {end?.newBest && <Confetti />}
    </div>
  );
}
