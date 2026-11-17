"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const ROWS = 6;
const COLS = 7;
const YOU = 1;
const CPU = 2;

type Grid = number[][]; // grid[row][col], row 0 at the top

const empty = (): Grid => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

/** Row a disc would land on in `col`, or -1 if the column is full. */
function landing(grid: Grid, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (grid[r][col] === 0) return r;
  return -1;
}

function drop(grid: Grid, col: number, who: number): Grid {
  const r = landing(grid, col);
  const next = grid.map((row) => [...row]);
  next[r][col] = who;
  return next;
}

/** The four connected cells, as "row,col" keys, if anyone has won. */
function connected(grid: Grid): string[] | null {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const who = grid[r][c];
      if (!who) continue;
      for (const [dr, dc] of dirs) {
        const cells = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
        if (cells.every(([rr, cc]) => grid[rr]?.[cc] === who)) return cells.map(([rr, cc]) => `${rr},${cc}`);
      }
    }
  return null;
}

const open = (grid: Grid) => [...Array(COLS).keys()].filter((c) => landing(grid, c) >= 0);
const wins = (grid: Grid, col: number, who: number) => connected(drop(grid, col, who)) !== null;

/** Take a win, block a loss, avoid setting up the opponent, otherwise favour the middle. */
function computerMove(grid: Grid): number {
  const cols = open(grid);
  const win = cols.find((c) => wins(grid, c, CPU));
  if (win !== undefined) return win;
  const block = cols.find((c) => wins(grid, c, YOU));
  if (block !== undefined) return block;

  const safe = cols.filter((c) => {
    const after = drop(grid, c, CPU);
    return !open(after).some((reply) => wins(after, reply, YOU));
  });
  const pool = safe.length ? safe : cols;
  const weighted = pool.flatMap((c) => Array(4 - Math.abs(3 - c)).fill(c) as number[]);
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export default function ConnectFour({ paused, onScore, onEnd }: GameProps) {
  const [grid, setGrid] = useState(empty);
  const [turn, setTurn] = useState<"you" | "computer" | "between">("you");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [cursor, setCursor] = useState(3);
  const [note, setNote] = useState("You are yellow. Line up four to win the round.");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const line = connected(grid);

  /** Returns true if the round is over. */
  function settle(next: Grid, total: number): boolean {
    const won = connected(next);
    if (!won && open(next).length > 0) return false;
    setTurn("between");

    const [r, c] = won ? won[0].split(",").map(Number) : [0, 0];
    if (won && next[r][c] === CPU) {
      setNote("The computer connected four.");
      timer.current = window.setTimeout(
        () => onEnd({ score: total, message: `Your run ended in round ${round}.` }),
        1400,
      );
      return true;
    }

    const gained = won ? 100 : 30;
    setNote(won ? "Four in a row. Plus 100." : "The board is full. Plus 30.");
    setScore(total + gained);
    onScore(total + gained);
    sfx.merge(won ? 6 : 2);
    timer.current = window.setTimeout(() => {
      setGrid(empty());
      setRound((n) => n + 1);
      setTurn("you");
      setNote("Next round. Your move.");
    }, 1600);
    return true;
  }

  function play(col: number) {
    if (paused || turn !== "you" || landing(grid, col) < 0) return;
    const next = drop(grid, col, YOU);
    setGrid(next);
    setCursor(col);
    sfx.click();
    if (settle(next, score)) return;

    setTurn("computer");
    timer.current = window.setTimeout(() => {
      const reply = drop(next, computerMove(next), CPU);
      setGrid(reply);
      sfx.move();
      if (!settle(reply, score)) setTurn("you");
    }, 620);
  }

  useKey((key) => {
    if (/^[1-7]$/.test(key)) return play(Number(key) - 1), true;
    if (key === "ArrowLeft") return setCursor((c) => Math.max(0, c - 1)), true;
    if (key === "ArrowRight") return setCursor((c) => Math.min(COLS - 1, c + 1)), true;
    if (key === "ArrowDown" || key === "Enter" || key === " ") return play(cursor), true;
  });

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-3 text-sm text-muted">Round {round}</p>
      <div className="glass grid w-full max-w-[min(30rem,66dvh)] select-none grid-cols-7 rounded-3xl p-[2.5%] shadow-lift">
        {Array.from({ length: COLS }, (_, c) => (
          <button
            key={c}
            type="button"
            onClick={() => play(c)}
            onPointerEnter={() => setCursor(c)}
            aria-label={`Drop a disc in column ${c + 1}`}
            disabled={landing(grid, c) < 0}
            className={`flex touch-manipulation flex-col rounded-2xl transition-colors ${
              cursor === c && turn === "you" ? "bg-surface-strong" : ""
            }`}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const who = grid[r][c];
              const lit = line?.includes(`${r},${c}`);
              return (
                <span key={r} className="block aspect-square p-[9%]">
                  <span className="block size-full overflow-hidden rounded-full bg-surface-strong shadow-[inset_0_2px_6px_rgba(0,0,0,0.25)]">
                    {who !== 0 && (
                      <span
                        key={`${round}-${who}`}
                        className={`block size-full rounded-full ${who === YOU ? "bg-puzzle" : "bg-arcade"} ${
                          line && !lit ? "opacity-35" : ""
                        }`}
                        style={{
                          ["--rows" as string]: r + 1,
                          animation: "disc-drop 320ms cubic-bezier(0.5, 0, 0.9, 0.6)",
                        }}
                      />
                    )}
                  </span>
                </span>
              );
            })}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {turn === "computer" ? "The computer is thinking." : note}
      </p>
    </div>
  );
}
