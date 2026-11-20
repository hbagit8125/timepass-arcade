"use client";

import { Eraser } from "lucide-react";
import { useState } from "react";
import { sfx } from "@/lib/sound";
import { clock, useElapsed } from "@/lib/useElapsed";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";
import { makePuzzle } from "./logic";

const box = (cell: number) => Math.floor(cell / 27) * 3 + Math.floor((cell % 9) / 3);

export default function Sudoku({ paused, onScore, onEnd }: GameProps) {
  const [{ puzzle, solution }] = useState(makePuzzle);
  const [values, setValues] = useState(puzzle);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = values.every((v, i) => v === solution[i]);
  const seconds = useElapsed(!paused && !done);

  function enter(digit: number) {
    if (paused || done || selected === null || puzzle[selected] !== 0) return;
    if (values[selected] === digit) return;
    const next = [...values];
    next[selected] = digit;
    setValues(next);
    if (digit === 0) return;

    if (digit !== solution[selected]) {
      setMistakes((m) => m + 1);
      sfx.lose();
      return;
    }
    sfx.move();
    if (next.every((v, i) => v === solution[i])) {
      const score = Math.max(100, 2000 - seconds * 2 - mistakes * 100);
      onScore(score);
      onEnd({
        score,
        won: true,
        message: `Solved in ${clock(seconds)} with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}.`,
      });
    }
  }

  useKey((key) => {
    if (/^[1-9]$/.test(key)) return enter(Number(key)), true;
    if (key === "Backspace" || key === "Delete" || key === "0") return enter(0), true;
    const step = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[key];
    if (step === undefined) return;
    setSelected((s) => {
      if (s === null) return 40;
      if (step === -1 && s % 9 === 0) return s;
      if (step === 1 && s % 9 === 8) return s;
      const next = s + step;
      return next < 0 || next > 80 ? s : next;
    });
    return true;
  });

  const selectedValue = selected !== null ? values[selected] : 0;
  const placed = (d: number) => values.filter((v, i) => v === d && solution[i] === d).length;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-3 flex w-full max-w-[min(30rem,max(17rem,calc(100dvh-29rem)))] justify-between text-sm text-muted">
        <span>Time {clock(seconds)}</span>
        <span>Mistakes {mistakes}</span>
      </div>

      <div className="glass @container grid aspect-square w-full max-w-[min(30rem,max(17rem,calc(100dvh-29rem)))] grid-cols-3 gap-[1.6%] rounded-3xl p-[2%] shadow-lift">
        {Array.from({ length: 9 }, (_, b) => (
          <div key={b} className="grid grid-cols-3 gap-[3%]">
            {Array.from({ length: 9 }, (_, k) => {
              const r = 3 * Math.floor(b / 3) + Math.floor(k / 3);
              const c = 3 * (b % 3) + (k % 3);
              const cell = r * 9 + c;
              const value = values[cell];
              const given = puzzle[cell] !== 0;
              const wrong = value !== 0 && value !== solution[cell];
              const isSelected = selected === cell;
              const peer =
                selected !== null &&
                (Math.floor(selected / 9) === r || selected % 9 === c || box(selected) === b);
              const sameDigit = value !== 0 && value === selectedValue;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelected(cell)}
                  aria-label={`Row ${r + 1}, column ${c + 1}, ${value || "empty"}`}
                  aria-pressed={isSelected}
                  className={`grid aspect-square place-items-center rounded-[18%] font-display text-[5.6cqw] leading-none transition-colors ${
                    isSelected
                      ? "bg-(--cat) text-on-accent"
                      : sameDigit
                        ? "bg-[color-mix(in_oklab,var(--cat)_45%,var(--surface-strong))]"
                        : peer
                          ? "bg-[color-mix(in_oklab,var(--cat)_14%,var(--surface-strong))]"
                          : "bg-surface-strong"
                  } ${given ? "font-extrabold" : "font-semibold"} ${
                    wrong && !isSelected ? "text-arcade" : !given && !isSelected ? "text-(--cat-ink)" : ""
                  } ${wrong ? "underline decoration-2 underline-offset-2" : ""}`}
                >
                  {value || ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 grid w-full max-w-[min(30rem,max(17rem,calc(100dvh-29rem)))] grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => enter(d)}
            disabled={placed(d) === 9}
            className="glass h-12 rounded-2xl font-display text-xl font-bold transition-colors hover:bg-surface-strong disabled:opacity-30"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => enter(0)}
          aria-label="Erase"
          className="glass grid h-12 place-items-center rounded-2xl transition-colors hover:bg-surface-strong"
        >
          <Eraser className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
