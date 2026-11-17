"use client";

import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useElapsed } from "@/lib/useElapsed";
import type { GameProps } from "../types";
import { TYPING_WORDS } from "./words";

const DURATION = 60;
const VISIBLE = 12;

const makeWords = () => Array.from({ length: 260 }, () => pick(TYPING_WORDS));

export default function TypingSpeed({ paused, onScore, onEnd }: GameProps) {
  const [words] = useState(makeWords);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  // Characters in correctly typed words (plus the space after each), and all characters submitted.
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const reported = useRef(false);

  const seconds = useElapsed(started && !paused);
  const left = Math.max(0, DURATION - seconds);
  const done = left === 0;
  const wpm = Math.round(correct / 5);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    onEnd({ score: wpm, won: true, message: `${wpm} words per minute at ${accuracy}% accuracy.` });
  }, [done, wpm, correct, total, onEnd]);

  function change(value: string) {
    if (done || paused) return;
    if (!started) setStarted(true);
    if (!value.endsWith(" ")) return setTyped(value);

    const attempt = value.trim();
    if (!attempt) return setTyped("");
    const right = attempt === words[index];
    const gained = right ? words[index].length + 1 : 0;
    setCorrect(correct + gained);
    setTotal(total + attempt.length + 1);
    setIndex(index + 1);
    setTyped("");
    if (right) {
      sfx.click();
      onScore(Math.round((correct + gained) / 5));
    } else sfx.lose();
  }

  const word = words[index];
  const mistyped = !word.startsWith(typed);

  return (
    <div className="flex w-full max-w-xl flex-col items-center">
      <div className="mb-3 flex w-full justify-between text-sm text-muted">
        <span>Time left {left}s</span>
        <span>{started ? `${wpm} words so far` : "The clock starts when you type"}</span>
      </div>

      <div
        onClick={() => input.current?.focus()}
        className="glass w-full rounded-3xl p-5 text-xl leading-loose shadow-lift sm:p-6 sm:text-2xl"
      >
        <p className="flex min-h-28 flex-wrap content-start gap-x-3" aria-label={`Type: ${word}`}>
          {words.slice(index, index + VISIBLE).map((w, i) =>
            i === 0 ? (
              <span key={index} className="rounded-lg bg-surface-strong px-2 font-semibold">
                {[...w].map((letter, k) => (
                  <span
                    key={k}
                    className={k >= typed.length ? "" : typed[k] === letter ? "text-(--cat-ink)" : "text-arcade underline"}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ) : (
              <span key={index + i} className="text-muted">
                {w}
              </span>
            ),
          )}
        </p>

        <input
          ref={input}
          value={typed}
          onChange={(e) => change(e.target.value)}
          disabled={done}
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="next"
          aria-label="Type the highlighted word, then press space"
          placeholder={started ? "" : "Type here"}
          className={`mt-4 h-14 w-full rounded-2xl border-2 bg-surface-strong px-4 text-xl outline-none transition-colors placeholder:text-muted ${
            mistyped ? "border-arcade" : "border-transparent focus:border-(--cat)"
          }`}
        />
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        Type the highlighted word and press space. A word with a mistake doesn&apos;t count.
      </p>
    </div>
  );
}
