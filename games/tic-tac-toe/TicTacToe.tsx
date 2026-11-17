"use client";

import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

type Mark = "X" | "O" | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const winningLine = (b: Mark[]) => LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]);
const free = (b: Mark[]) => b.flatMap((m, i) => (m ? [] : [i]));

/** Best achievable result for `turn`: 1 = O wins, -1 = X wins, 0 = draw. */
function minimax(b: Mark[], turn: "X" | "O"): number {
  const line = winningLine(b);
  if (line) return b[line[0]] === "O" ? 1 : -1;
  const open = free(b);
  if (open.length === 0) return 0;
  const results = open.map((i) => {
    b[i] = turn;
    const value = minimax(b, turn === "O" ? "X" : "O");
    b[i] = null;
    return value;
  });
  return turn === "O" ? Math.max(...results) : Math.min(...results);
}

/** Plays well, but slips now and then so it can be beaten. */
function computerMove(board: Mark[]): number {
  const open = free(board);
  if (Math.random() < 0.3) return pick(open);
  const b = [...board];
  let best = -2;
  let moves: number[] = [];
  for (const i of open) {
    b[i] = "O";
    const value = minimax(b, "X");
    b[i] = null;
    if (value > best) {
      best = value;
      moves = [i];
    } else if (value === best) moves.push(i);
  }
  return pick(moves);
}

const empty = (): Mark[] => Array(9).fill(null);

export default function TicTacToe({ paused, onScore, onEnd }: GameProps) {
  const [board, setBoard] = useState(empty);
  const [turn, setTurn] = useState<"you" | "computer" | "between">("you");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [note, setNote] = useState("You are X. Win or draw to keep your run going.");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const line = winningLine(board);

  /** Returns true if the round is over. */
  function settle(next: Mark[], total: number): boolean {
    const won = winningLine(next);
    if (!won && free(next).length > 0) return false;
    setTurn("between");

    if (won && next[won[0]] === "O") {
      setNote("The computer wins this one.");
      timer.current = window.setTimeout(
        () => onEnd({ score: total, message: `Your run ended in round ${round}.` }),
        1200,
      );
      return true;
    }

    const gained = won ? 100 : 30;
    setNote(won ? "You win the round. Plus 100." : "A draw. Plus 30.");
    setScore(total + gained);
    onScore(total + gained);
    sfx.merge(won ? 6 : 2);
    timer.current = window.setTimeout(() => {
      setBoard(empty());
      setRound((r) => r + 1);
      setTurn("you");
      setNote("Next round. Your move.");
    }, 1300);
    return true;
  }

  function play(i: number) {
    if (paused || turn !== "you" || board[i]) return;
    const next = [...board];
    next[i] = "X";
    setBoard(next);
    sfx.click();
    if (settle(next, score)) return;

    setTurn("computer");
    timer.current = window.setTimeout(() => {
      const reply = [...next];
      reply[computerMove(next)] = "O";
      setBoard(reply);
      sfx.move();
      if (!settle(reply, score)) setTurn("you");
    }, 480);
  }

  useKey((key) => {
    if (/^[1-9]$/.test(key)) return play(Number(key) - 1), true;
  });

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-3 text-sm text-muted">Round {round}</p>
      <div className="glass @container grid aspect-square w-full max-w-[min(24rem,56dvh)] grid-cols-3 gap-[3%] rounded-3xl p-[4%] shadow-lift">
        {board.map((mark, i) => (
          <button
            key={i}
            type="button"
            onClick={() => play(i)}
            aria-label={`Square ${i + 1}, ${mark ?? "empty"}`}
            className={`grid aspect-square touch-manipulation place-items-center rounded-[16%] font-display text-[20cqw] font-extrabold leading-none transition-colors ${
              line?.includes(i)
                ? mark === "X"
                  ? "bg-(--cat) text-on-accent"
                  : "bg-arcade text-on-accent"
                : `bg-surface-strong ${mark === "X" ? "text-(--cat-ink)" : "text-arcade"} ${
                    !mark && turn === "you" ? "hover:bg-[color-mix(in_oklab,var(--cat)_22%,var(--surface-strong))]" : ""
                  }`
            }`}
          >
            {mark && <span className="motion-safe:animate-[tile-in_160ms_ease-out]">{mark}</span>}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {turn === "computer" ? "The computer is thinking." : note}
      </p>
    </div>
  );
}
