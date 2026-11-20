"use client";

import { useRef, useState } from "react";
import { useLoop } from "@/lib/canvas";
import { randInt } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const DURATION = 30;

type Mole = { until: number; golden: boolean; hit: boolean };

const start = () => ({
  time: 0,
  nextSpawn: 0.4,
  holes: Array<Mole | null>(9).fill(null),
  score: 0,
  hits: 0,
  started: false,
  over: false,
});

export default function WhackAMole({ paused, onScore, onEnd }: GameProps) {
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();
  const [view, setView] = useState({ holes: Array<Mole | null>(9).fill(null), left: DURATION, started: false });

  const show = () => {
    const g = state.current!;
    setView({ holes: [...g.holes], left: Math.max(0, Math.ceil(DURATION - g.time)), started: g.started });
  };

  useLoop((dt) => {
    const g = state.current!;
    if (!g.started || g.over || paused) return;
    const second = Math.ceil(DURATION - g.time);
    g.time += dt;
    let changed = Math.ceil(DURATION - g.time) !== second;

    g.holes.forEach((mole, i) => {
      if (mole && g.time >= mole.until) {
        g.holes[i] = null;
        changed = true;
      }
    });

    if (g.time >= DURATION) {
      g.over = true;
      g.holes.fill(null);
      show();
      onEnd({ score: g.score, won: g.score > 0, message: `You hit ${g.hits} ${g.hits === 1 ? "mole" : "moles"} in ${DURATION} seconds.` });
      return;
    }

    if (g.time >= g.nextSpawn) {
      const empty = g.holes.flatMap((m, i) => (m ? [] : [i]));
      if (empty.length) {
        // Moles appear more often and hide sooner as time runs down.
        const stay = Math.max(0.55, 1.15 - g.time * 0.018);
        g.holes[empty[randInt(empty.length)]] = { until: g.time + stay, golden: Math.random() < 0.12, hit: false };
        changed = true;
      }
      g.nextSpawn = g.time + Math.max(0.3, 0.8 - g.time * 0.015) * (0.7 + Math.random() * 0.6);
    }

    if (changed) show();
  });

  function whack(i: number) {
    const g = state.current!;
    if (paused || g.over) return;
    if (!g.started) {
      g.started = true;
      show();
      return;
    }
    const mole = g.holes[i];
    if (!mole || mole.hit) return;
    mole.hit = true;
    mole.until = g.time + 0.22;
    g.score += mole.golden ? 30 : 10;
    g.hits++;
    onScore(g.score);
    sfx.merge(mole.golden ? 10 : 4);
    show();
  }

  useKey((key) => {
    if (/^[1-9]$/.test(key)) return whack(Number(key) - 1), true;
    if (key === " " || key === "Enter") return whack(0), true;
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-3 flex w-full max-w-[min(26rem,max(15rem,calc(100dvh-24rem)))] justify-between text-sm text-muted">
        <span>Time left {view.left}s</span>
        <span>Gold moles are worth 30</span>
      </div>
      <div className="glass grid w-full max-w-[min(26rem,max(15rem,calc(100dvh-24rem)))] select-none grid-cols-3 gap-[4%] rounded-3xl p-[5%] shadow-lift">
        {view.holes.map((mole, i) => (
          <button
            key={i}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              whack(i);
            }}
            onClick={(e) => e.detail === 0 && whack(i)}
            aria-label={`Hole ${i + 1}${mole ? (mole.golden ? ", gold mole" : ", mole") : ", empty"}`}
            className="relative aspect-square touch-manipulation overflow-hidden rounded-full bg-surface-strong shadow-[inset_0_6px_14px_rgba(0,0,0,0.35)]"
          >
            <span
              className="absolute inset-x-[16%] bottom-0 top-[22%] rounded-t-[45%] transition-transform duration-100 ease-out"
              style={{
                transform: mole ? (mole.hit ? "translateY(35%) scaleY(0.8)" : "translateY(0)") : "translateY(105%)",
                background: mole?.hit ? "var(--arcade)" : mole?.golden ? "var(--puzzle)" : "var(--cat)",
              }}
            >
              <i className="absolute left-[24%] top-[26%] size-[14%] rounded-full bg-on-accent" />
              <i className="absolute right-[24%] top-[26%] size-[14%] rounded-full bg-on-accent" />
              <i className="absolute left-1/2 top-[46%] h-[9%] w-[22%] -translate-x-1/2 rounded-full bg-on-accent/70" />
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {view.started ? "Tap the moles before they duck." : "Tap any hole to start the 30 seconds."}
      </p>
    </div>
  );
}
