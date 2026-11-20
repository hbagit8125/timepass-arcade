"use client";

import { useEffect, useRef, useState } from "react";
import { randInt } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const PADS = [
  { color: "var(--classic)", note: 330 },
  { color: "var(--arcade)", note: 392 },
  { color: "var(--puzzle)", note: 494 },
  { color: "var(--reflex)", note: 587 },
];

type Phase = "idle" | "watch" | "repeat" | "over";

export default function Echo({ paused, onScore, onEnd }: GameProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState<number | null>(null);
  const [position, setPosition] = useState(0);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  /** Add one step and play the whole pattern back. */
  function playNext(previous: number[]) {
    const next = [...previous, randInt(PADS.length)];
    const gap = Math.max(300, 620 - next.length * 22);
    setSequence(next);
    setPosition(0);
    setPhase("watch");
    next.forEach((pad, i) => {
      later(() => {
        setLit(pad);
        sfx.note(PADS[pad].note, gap / 1000);
      }, 350 + i * gap);
      later(() => setLit(null), 350 + i * gap + gap * 0.65);
    });
    later(() => setPhase("repeat"), 350 + next.length * gap);
  }

  function press(pad: number) {
    if (paused) return;
    if (phase === "idle") return playNext([]);
    if (phase !== "repeat") return;

    setLit(pad);
    later(() => setLit((current) => (current === pad ? null : current)), 180);

    if (pad !== sequence[position]) {
      setPhase("over");
      const steps = sequence.length - 1;
      onEnd({ score: steps * 10, message: `You repeated a pattern ${steps} ${steps === 1 ? "step" : "steps"} long.` });
      return;
    }

    sfx.note(PADS[pad].note);
    if (position + 1 === sequence.length) {
      onScore(sequence.length * 10);
      setPhase("watch");
      later(() => playNext(sequence), 650);
    } else setPosition(position + 1);
  }

  useKey((key) => {
    if (/^[1-4]$/.test(key)) return press(Number(key) - 1), true;
    if (key === " " || key === "Enter") {
      if (phase === "idle") press(0);
      return true;
    }
  });

  const status = {
    idle: "Tap any pad to start.",
    watch: "Watch the pattern.",
    repeat: `Your turn. ${position} of ${sequence.length} repeated.`,
    over: "That was the wrong pad.",
  }[phase];

  return (
    <div className="flex w-full flex-col items-center">
      <div className="glass grid w-full max-w-[min(24rem,max(14rem,calc(100dvh-23rem)))] grid-cols-2 gap-[4%] rounded-[2.5rem] p-[5%] shadow-lift">
        {PADS.map((pad, i) => (
          <button
            key={i}
            type="button"
            onClick={() => press(i)}
            aria-label={`Pad ${i + 1}`}
            className="grid aspect-square touch-manipulation place-items-center rounded-[1.75rem] font-display text-3xl font-extrabold text-on-accent transition-[opacity,scale,box-shadow] duration-100"
            style={{
              background: pad.color,
              opacity: lit === i ? 1 : 0.32,
              scale: lit === i ? "1.04" : "1",
              boxShadow: lit === i ? `0 0 44px -6px ${pad.color}` : "none",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
