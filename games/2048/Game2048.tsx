"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { sfx } from "@/lib/sound";
import type { GameProps } from "../types";
import { newBoard, slide, SIZE, type Board, type Direction } from "./logic";

const KEYS: Record<string, Direction> = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
  a: "left", d: "right", w: "up", s: "down",
};

const mix = (a: string, pct: number, b: string) => `color-mix(in oklab, var(--${a}) ${pct}%, var(--${b}))`;

function tileStyle(value: number): CSSProperties {
  const bright = { color: "var(--on-accent)" };
  switch (value) {
    case 2: return { background: mix("reflex", 16, "surface-strong"), color: "var(--ink)" };
    case 4: return { background: mix("reflex", 38, "surface-strong"), color: "var(--ink)" };
    case 8: return { background: "var(--reflex)", ...bright };
    case 16: return { background: "var(--classic)", ...bright };
    case 32: return { background: mix("classic", 50, "puzzle"), ...bright };
    case 64: return { background: "var(--puzzle)", ...bright };
    case 128: return { background: mix("puzzle", 50, "arcade"), ...bright };
    case 256: return { background: "var(--arcade)", ...bright };
    case 512: return { background: mix("arcade", 60, "reflex"), ...bright };
    case 1024: return { background: "linear-gradient(135deg, var(--classic), var(--reflex))", ...bright };
    case 2048: return {
      background: "linear-gradient(135deg, var(--puzzle), var(--arcade))",
      boxShadow: "0 0 32px -4px var(--arcade)",
      ...bright,
    };
    default: return { background: "var(--ink)", color: "var(--bg)" };
  }
}

const fontSize = (value: number) => (value < 100 ? "11cqw" : value < 1000 ? "9cqw" : value < 10000 ? "7cqw" : "5.6cqw");

export default function Game2048({ paused, onScore, onEnd }: GameProps) {
  const [board, setBoard] = useState<Board>(newBoard);
  const current = useRef(board);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const cleanup = useRef<number | undefined>(undefined);

  function move(dir: Direction) {
    if (paused || current.current.over) return;
    const next = slide(current.current, dir);
    if (!next) return;

    const { gained, ...state } = next;
    const justWon = state.won && !current.current.won;
    current.current = state;
    setBoard(state);

    if (justWon) sfx.win();
    else if (gained > 0) sfx.merge(Math.log2(gained));
    else sfx.move();

    if (gained > 0) onScore(state.score);
    if (state.over) onEnd({ score: state.score, won: state.won });

    // Absorbed tiles stay just long enough to finish sliding.
    window.clearTimeout(cleanup.current);
    cleanup.current = window.setTimeout(() => {
      const tiles = current.current.tiles.filter((t) => !t.dying);
      current.current = { ...current.current, tiles };
      setBoard(current.current);
    }, 130);
  }

  // Keep the key handler pointing at the latest `move` without re-subscribing.
  const moveRef = useRef(move);
  useEffect(() => {
    moveRef.current = move;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!dir) return;
      e.preventDefault();
      moveRef.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(cleanup.current);
    };
  }, []);

  function onPointerDown(e: PointerEvent) {
    swipeStart.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
        role="application"
        aria-label="2048 board. Use arrow keys or swipe to slide the tiles."
        className="glass @container relative aspect-square w-full max-w-[min(30rem,62dvh)] touch-none select-none rounded-3xl p-[2.5%] shadow-lift"
      >
        <div className="relative size-full [--gap:2.6%]">
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-(--gap)">
            {Array.from({ length: SIZE * SIZE }, (_, i) => (
              <div key={i} className="rounded-[14%] bg-surface-strong" />
            ))}
          </div>

          {board.tiles.map((t) => (
            <div
              key={t.id}
              className="absolute left-0 top-0 transition-transform duration-[120ms] ease-out"
              style={{
                // Board width = 4 tiles + 3 gaps. Percentages in translate are
                // relative to the tile, so the gap is converted to tile units.
                width: "calc((100% - 3 * var(--gap)) / 4)",
                height: "calc((100% - 3 * var(--gap)) / 4)",
                transform: `translate(calc(${t.c} * (100% + var(--step))), calc(${t.r} * (100% + var(--step))))`,
                ["--step" as string]: "calc(2.6 / 23.05 * 100%)",
                zIndex: t.dying ? 1 : 2,
              }}
            >
              <div
                className="grid size-full place-items-center rounded-[14%] font-display font-extrabold tracking-tight"
                style={{
                  ...tileStyle(t.value),
                  fontSize: fontSize(t.value),
                  animation: t.isNew
                    ? "tile-in 160ms ease-out 80ms both"
                    : t.merged
                      ? "tile-pop 180ms ease-out 90ms"
                      : undefined,
                }}
              >
                {t.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted" aria-live="polite">
        {board.won
          ? "You made 2048. Keep going for a higher score."
          : "Swipe on the board, or use the arrow keys."}
      </p>
    </div>
  );
}
