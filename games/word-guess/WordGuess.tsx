"use client";

import { CornerDownLeft, Delete } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";
import { WORDS } from "./words";

const TRIES = 6;
const LENGTH = 5;
const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

type Mark = "hit" | "near" | "miss";

/** Marks each letter, counting repeated letters only as often as the answer has them. */
function mark(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(LENGTH).fill("miss");
  const spare: Record<string, number> = {};
  for (let i = 0; i < LENGTH; i++) {
    if (guess[i] === answer[i]) marks[i] = "hit";
    else spare[answer[i]] = (spare[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < LENGTH; i++) {
    if (marks[i] !== "hit" && spare[guess[i]] > 0) {
      marks[i] = "near";
      spare[guess[i]]--;
    }
  }
  return marks;
}

const MARK_CLASS: Record<Mark, string> = {
  hit: "bg-classic text-on-accent border-transparent",
  near: "bg-puzzle text-on-accent border-transparent",
  miss: "bg-surface-strong text-muted border-transparent",
};
const MARK_LABEL: Record<Mark, string> = { hit: "correct", near: "in the word, wrong place", miss: "not in the word" };
const RANK: Record<Mark, number> = { miss: 0, near: 1, hit: 2 };

export default function WordGuess({ paused, onScore, onEnd }: GameProps) {
  const [answer] = useState(() => pick(WORDS));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [note, setNote] = useState("Guess the five-letter word. You have six tries.");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const solved = guesses.at(-1) === answer;
  const finished = solved || guesses.length === TRIES;
  const locked = paused || finished;

  const keyMarks: Record<string, Mark> = {};
  for (const g of guesses)
    mark(g, answer).forEach((m, i) => {
      if (!keyMarks[g[i]] || RANK[m] > RANK[keyMarks[g[i]]]) keyMarks[g[i]] = m;
    });

  function type(letter: string) {
    if (locked || current.length >= LENGTH) return;
    sfx.click();
    setCurrent(current + letter);
  }

  function erase() {
    if (!locked) setCurrent(current.slice(0, -1));
  }

  function submit() {
    if (locked) return;
    if (current.length < LENGTH) {
      setNote("Enter five letters first.");
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");

    if (current === answer) {
      const score = (TRIES + 1 - next.length) * 100;
      setNote("You got it.");
      onScore(score);
      timer.current = window.setTimeout(
        () => onEnd({ score, won: true, message: `The word was ${answer.toUpperCase()}, found in ${next.length} ${next.length === 1 ? "try" : "tries"}.` }),
        1100,
      );
    } else if (next.length === TRIES) {
      setNote(`The word was ${answer.toUpperCase()}.`);
      timer.current = window.setTimeout(
        () => onEnd({ score: 0, message: `The word was ${answer.toUpperCase()}.` }),
        1100,
      );
    } else {
      sfx.move();
      setNote(`${TRIES - next.length} ${TRIES - next.length === 1 ? "try" : "tries"} left.`);
    }
  }

  useKey((key) => {
    if (key === "Enter") return submit(), true;
    if (key === "Backspace") return erase(), true;
    if (/^[a-zA-Z]$/.test(key)) return type(key.toLowerCase()), true;
  });

  const keyClass = (m?: Mark) =>
    `grid h-12 touch-manipulation place-items-center rounded-lg text-sm font-semibold uppercase transition-colors sm:h-13 sm:text-base ${
      m ? MARK_CLASS[m] : "glass hover:bg-surface-strong"
    }`;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid w-full max-w-[min(20rem,max(13rem,calc((100dvh-30rem)/1.2)))] gap-1.5">
        {Array.from({ length: TRIES }, (_, row) => {
          const submitted = guesses[row];
          const letters = submitted ?? (row === guesses.length ? current : "");
          const marks = submitted ? mark(submitted, answer) : null;
          const active = row === guesses.length && shake;
          return (
            <div
              key={row}
              className="grid grid-cols-5 gap-1.5"
              style={{ animation: active ? "shake 380ms ease-in-out" : undefined }}
            >
              {Array.from({ length: LENGTH }, (_, i) => (
                <div
                  key={i}
                  aria-label={letters[i] ? `${letters[i]}${marks ? `, ${MARK_LABEL[marks[i]]}` : ""}` : "empty"}
                  className={`grid aspect-square place-items-center rounded-xl border-2 font-display text-3xl font-extrabold uppercase transition-colors duration-300 ${
                    marks ? MARK_CLASS[marks[i]] : letters[i] ? "border-(--cat)" : "border-line"
                  }`}
                  style={{ transitionDelay: marks ? `${i * 110}ms` : undefined }}
                >
                  {letters[i] ?? ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="mt-3 min-h-5 text-sm text-muted" aria-live="polite">
        {note}
      </p>

      <div className="mt-3 grid w-full max-w-lg gap-1.5">
        {KEY_ROWS.map((row, r) => (
          <div key={row} className="flex justify-center gap-1 sm:gap-1.5">
            {r === 2 && (
              <button type="button" onClick={submit} aria-label="Enter" className={`${keyClass()} flex-[1.6] bg-ink! text-bg!`}>
                <CornerDownLeft className="size-5" aria-hidden />
              </button>
            )}
            {[...row].map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => type(letter)}
                aria-label={keyMarks[letter] ? `${letter}, ${MARK_LABEL[keyMarks[letter]]}` : letter}
                className={`${keyClass(keyMarks[letter])} max-w-11 flex-1`}
              >
                {letter}
              </button>
            ))}
            {r === 2 && (
              <button type="button" onClick={erase} aria-label="Delete letter" className={`${keyClass()} flex-[1.6]`}>
                <Delete className="size-5" aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
