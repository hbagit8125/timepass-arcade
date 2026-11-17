"use client";

import { Anchor, Crown, Ghost, Leaf, Moon, Pizza, Rocket, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/random";
import { sfx } from "@/lib/sound";
import type { GameProps } from "../types";

const FACES = [
  { Icon: Rocket, name: "rocket", color: "var(--arcade)" },
  { Icon: Ghost, name: "ghost", color: "var(--reflex)" },
  { Icon: Crown, name: "crown", color: "var(--puzzle)" },
  { Icon: Pizza, name: "pizza", color: "var(--arcade)" },
  { Icon: Anchor, name: "anchor", color: "var(--classic)" },
  { Icon: Leaf, name: "leaf", color: "var(--classic)" },
  { Icon: Moon, name: "moon", color: "var(--reflex)" },
  { Icon: Star, name: "star", color: "var(--puzzle)" },
];

const deal = () => shuffle([...FACES.keys(), ...FACES.keys()]);
const points = (pairs: number, misses: number) => Math.max(0, pairs * 150 - misses * 20);

export default function MemoryMatch({ paused, onScore, onEnd }: GameProps) {
  const [deck] = useState(deal);
  const [up, setUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function flip(i: number) {
    if (paused || up.length === 2 || up.includes(i) || matched.includes(i)) return;
    sfx.click();
    if (up.length === 0) return setUp([i]);

    const first = up[0];
    setUp([first, i]);

    if (deck[first] === deck[i]) {
      const nowMatched = [...matched, first, i];
      const pairs = nowMatched.length / 2;
      timer.current = window.setTimeout(() => {
        setMatched(nowMatched);
        setUp([]);
        sfx.merge(pairs);
        onScore(points(pairs, misses));
        if (pairs === FACES.length) {
          onEnd({
            score: points(pairs, misses),
            won: true,
            message: misses === 0 ? "A perfect round, no wrong flips." : `All pairs found with ${misses} wrong ${misses === 1 ? "flip" : "flips"}.`,
          });
        }
      }, 350);
    } else {
      timer.current = window.setTimeout(() => {
        setUp([]);
        setMisses(misses + 1);
        onScore(points(matched.length / 2, misses + 1));
      }, 800);
    }
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid w-full max-w-[min(28rem,60dvh)] grid-cols-4 gap-2.5 sm:gap-3">
        {deck.map((face, i) => {
          const { Icon, name, color } = FACES[face];
          const isMatched = matched.includes(i);
          const shown = isMatched || up.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => flip(i)}
              aria-label={shown ? `Card ${i + 1}, ${name}` : `Card ${i + 1}, face down`}
              className="aspect-square touch-manipulation rounded-2xl [perspective:600px]"
            >
              <span
                className="relative block size-full transition-transform duration-300 [transform-style:preserve-3d]"
                style={{ transform: shown ? "rotateY(180deg)" : undefined }}
              >
                <span className="glass absolute inset-0 grid place-items-center rounded-2xl shadow-lift [backface-visibility:hidden]">
                  <span className="grid grid-cols-2 gap-1 opacity-60">
                    <i className="size-2 rounded-[3px] bg-puzzle" />
                    <i className="size-2 rounded-[3px] bg-arcade" />
                    <i className="size-2 rounded-[3px] bg-classic" />
                    <i className="size-2 rounded-[3px] bg-reflex" />
                  </span>
                </span>
                <span
                  className={`absolute inset-0 grid place-items-center rounded-2xl text-on-accent transition-opacity [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isMatched ? "opacity-45" : ""
                  }`}
                  style={{ background: color }}
                >
                  <Icon className="size-[46%]" strokeWidth={2.2} aria-hidden />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Pairs found {matched.length / 2} of {FACES.length}. Wrong flips {misses}.
      </p>
    </div>
  );
}
