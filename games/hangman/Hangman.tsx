"use client";

import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const MAX_WRONG = 6;

const BANK: Record<string, string[]> = {
  Animal: ["elephant", "giraffe", "penguin", "dolphin", "kangaroo", "squirrel", "leopard", "octopus", "peacock", "buffalo", "hamster", "panther", "crocodile", "butterfly"],
  Food: ["biryani", "pancake", "noodles", "sandwich", "chocolate", "popcorn", "mango", "samosa", "omelette", "biscuit", "pumpkin", "coconut", "burger", "custard"],
  Place: ["airport", "library", "stadium", "museum", "village", "harbour", "desert", "island", "temple", "market", "station", "bakery", "castle", "valley"],
  Sport: ["cricket", "football", "badminton", "hockey", "tennis", "kabaddi", "cycling", "archery", "boxing", "sprint", "wrestling", "volleyball"],
  "Thing at home": ["blanket", "curtain", "mirror", "pillow", "cupboard", "bucket", "candle", "ladder", "kettle", "umbrella", "toaster", "charger", "slipper", "calendar"],
  Nature: ["thunder", "rainbow", "volcano", "monsoon", "glacier", "forest", "breeze", "meadow", "sunrise", "lagoon", "pebble", "blossom"],
};

function draw(avoid?: string) {
  for (;;) {
    const hint = pick(Object.keys(BANK));
    const word = pick(BANK[hint]);
    if (word !== avoid) return { hint, word };
  }
}

// Gallows first, then one body part per wrong guess.
const PARTS = [
  <circle key="head" cx="140" cy="62" r="16" />,
  <path key="body" d="M140 78v52" />,
  <path key="arm1" d="M140 92l-24 20" />,
  <path key="arm2" d="M140 92l24 20" />,
  <path key="leg1" d="M140 130l-20 32" />,
  <path key="leg2" d="M140 130l20 32" />,
];

export default function Hangman({ paused, onScore, onEnd }: GameProps) {
  const [{ hint, word }, setPuzzle] = useState(() => draw());
  const [tried, setTried] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [between, setBetween] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const wrong = tried.filter((l) => !word.includes(l)).length;
  const lost = wrong >= MAX_WRONG;

  function guess(letter: string) {
    if (paused || between || lost || tried.includes(letter)) return;
    const next = [...tried, letter];
    setTried(next);
    const misses = next.filter((l) => !word.includes(l)).length;

    if (!word.includes(letter)) {
      sfx.lose();
      if (misses >= MAX_WRONG) {
        timer.current = window.setTimeout(
          () =>
            onEnd({
              score,
              message: `The word was ${word.toUpperCase()}. You solved ${solvedCount} ${solvedCount === 1 ? "word" : "words"}.`,
            }),
          1300,
        );
      }
      return;
    }

    sfx.click();
    if ([...word].every((l) => next.includes(l))) {
      const total = score + 100 - misses * 10;
      setScore(total);
      setSolvedCount(solvedCount + 1);
      setBetween(true);
      onScore(total);
      sfx.merge(6);
      timer.current = window.setTimeout(() => {
        setPuzzle(draw(word));
        setTried([]);
        setBetween(false);
      }, 1300);
    }
  }

  useKey((key) => {
    if (/^[a-zA-Z]$/.test(key)) return guess(key.toLowerCase()), true;
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="glass flex w-full max-w-lg flex-col items-center rounded-3xl px-4 py-5 shadow-lift">
        <div className="flex w-full items-center justify-between text-sm text-muted">
          <span>
            Clue: <strong className="font-semibold text-(--cat-ink)">{hint}</strong>
          </span>
          <span>
            Wrong guesses {wrong} of {MAX_WRONG}
          </span>
        </div>

        <svg
          viewBox="0 0 200 190"
          className="mt-2 h-[min(11rem,24dvh)] text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label={`Hangman drawing, ${wrong} of ${MAX_WRONG} parts`}
        >
          <path d="M30 180h110M60 180V20h80v26" className="text-muted" stroke="currentColor" />
          <g className={lost ? "text-arcade" : "text-(--cat-ink)"} stroke="currentColor">
            {PARTS.slice(0, wrong)}
          </g>
        </svg>

        <div className="mt-3 flex flex-wrap justify-center gap-1.5" role="group" aria-label="The word">
          {[...word].map((letter, i) => {
            const shown = tried.includes(letter);
            return (
              <span
                key={i}
                className={`grid h-11 w-8 place-items-center border-b-[3px] font-display text-2xl font-extrabold uppercase sm:w-9 ${
                  shown ? "border-(--cat)" : lost ? "border-arcade text-arcade" : "border-line"
                }`}
              >
                {shown || lost ? letter : ""}
              </span>
            );
          })}
        </div>
      </div>

      <p className="mt-3 min-h-5 text-sm text-muted" aria-live="polite">
        {between ? "Solved. Here comes the next word." : lost ? "Out of guesses." : `Words solved ${solvedCount}.`}
      </p>

      <div className="mt-2 grid w-full max-w-lg grid-cols-9 gap-1.5">
        {[..."abcdefghijklmnopqrstuvwxyz"].map((letter) => {
          const used = tried.includes(letter);
          const good = used && word.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              onClick={() => guess(letter)}
              disabled={used}
              className={`h-11 touch-manipulation rounded-xl text-base font-semibold uppercase transition-colors ${
                used
                  ? good
                    ? "bg-(--cat) text-on-accent"
                    : "bg-surface-strong text-muted opacity-40"
                  : "glass hover:bg-surface-strong"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
