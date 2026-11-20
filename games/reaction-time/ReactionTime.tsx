"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const ROUNDS = 5;

type Phase = "idle" | "wait" | "go" | "early" | "result";

export default function ReactionTime({ paused, onScore, onEnd }: GameProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const goAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const done = times.length === ROUNDS;

  function press() {
    if (paused || done) return;

    if (phase === "wait") {
      window.clearTimeout(timer.current);
      setPhase("early");
      sfx.lose();
      return;
    }

    if (phase === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      const next = [...times, ms];
      setTimes(next);
      setPhase("result");
      sfx.click();
      if (next.length === ROUNDS) {
        const average = Math.round(next.reduce((a, b) => a + b, 0) / ROUNDS);
        const score = Math.max(0, 1000 - average);
        onScore(score);
        onEnd({ score, won: true, message: `Average ${average} ms. Fastest ${Math.min(...next)} ms.` });
      }
      return;
    }

    // idle, early or result: arm the next round with an unpredictable delay.
    setPhase("wait");
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
      sfx.note(660, 0.08);
    }, 1200 + Math.random() * 2600);
  }

  useKey((key) => {
    if (key === " " || key === "Enter") return press(), true;
  });

  const last = times.at(-1);
  const text: Record<Phase, { title: string; hint: string }> = {
    idle: { title: "Tap to begin", hint: `${ROUNDS} rounds. Tap as soon as the panel turns teal.` },
    wait: { title: "Wait for teal", hint: "Don't tap yet." },
    go: { title: "Tap now", hint: "" },
    early: { title: "Too soon", hint: "That round doesn't count. Tap to try it again." },
    result: { title: `${last} ms`, hint: done ? "" : "Tap for the next round." },
  };

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          press();
        }}
        onClick={(e) => e.detail === 0 && press()}
        className={`grid aspect-[4/3] w-full max-w-[min(34rem,max(16rem,calc((100dvh-24rem)*1.333)))] touch-manipulation select-none place-items-center rounded-3xl p-6 text-center shadow-lift transition-colors duration-75 ${
          phase === "go"
            ? "bg-classic text-on-accent"
            : phase === "early"
              ? "bg-arcade text-on-accent"
              : phase === "wait"
                ? "bg-surface-strong"
                : "glass"
        }`}
      >
        <span>
          <span className="block font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">{text[phase].title}</span>
          <span className="mt-3 block min-h-6 text-base opacity-80">{text[phase].hint}</span>
        </span>
      </button>

      <ol className="mt-4 flex w-full max-w-sm gap-2" aria-label="Round times">
        {Array.from({ length: ROUNDS }, (_, i) => (
          <li
            key={i}
            className={`grid h-11 flex-1 place-items-center rounded-xl text-sm font-semibold tabular-nums ${
              times[i] !== undefined ? "bg-(--cat) text-on-accent" : "glass text-muted"
            }`}
          >
            {times[i] ?? i + 1}
          </li>
        ))}
      </ol>
    </div>
  );
}
