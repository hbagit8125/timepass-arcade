"use client";

import { useState } from "react";
import { pick } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const N = 3;
const BLANK = N * N - 1;

/** Cells next to `cell` on the board. */
function around(cell: number): number[] {
  const r = Math.floor(cell / N);
  const c = cell % N;
  const out: number[] = [];
  if (r > 0) out.push(cell - N);
  if (r < N - 1) out.push(cell + N);
  if (c > 0) out.push(cell - 1);
  if (c < N - 1) out.push(cell + 1);
  return out;
}

/** board[cell] = tile. Scrambled with real moves, so it can always be solved. */
function scramble(): number[] {
  const board = Array.from({ length: N * N }, (_, i) => i);
  let blank = BLANK;
  let last = -1;
  for (let i = 0; i < 120; i++) {
    const from = pick(around(blank).filter((c) => c !== last));
    board[blank] = board[from];
    board[from] = BLANK;
    last = blank;
    blank = from;
  }
  return board.every((t, i) => t === i) ? scramble() : board;
}

export default function SlidingPuzzle({ paused, onEnd }: GameProps) {
  const [board, setBoard] = useState(scramble);
  const [moves, setMoves] = useState(0);
  const solved = board.every((t, i) => t === i);
  const blank = board.indexOf(BLANK);

  function slide(cell: number) {
    if (paused || solved || !around(blank).includes(cell)) return;
    const next = [...board];
    next[blank] = next[cell];
    next[cell] = BLANK;
    setBoard(next);
    setMoves(moves + 1);
    sfx.move();
    if (next.every((t, i) => t === i)) {
      onEnd({
        score: Math.max(50, 1000 - (moves + 1) * 6),
        won: true,
        message: `Solved in ${moves + 1} moves.`,
      });
    }
  }

  // An arrow key moves the tile that can travel in that direction into the gap.
  useKey((key) => {
    const r = Math.floor(blank / N);
    const c = blank % N;
    if (key === "ArrowUp" && r < N - 1) return slide(blank + N), true;
    if (key === "ArrowDown" && r > 0) return slide(blank - N), true;
    if (key === "ArrowLeft" && c < N - 1) return slide(blank + 1), true;
    if (key === "ArrowRight" && c > 0) return slide(blank - 1), true;
    return key.startsWith("Arrow");
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="glass @container relative aspect-square w-full max-w-[min(26rem,58dvh)] select-none rounded-3xl shadow-lift">
        {board.map((tile, cell) =>
          tile === BLANK ? null : (
            <button
              key={tile}
              type="button"
              onClick={() => slide(cell)}
              aria-label={`Tile ${tile + 1}`}
              className="absolute left-0 top-0 size-1/3 touch-manipulation p-[2%] transition-transform duration-150 ease-out"
              style={{ transform: `translate(${(cell % N) * 100}%, ${Math.floor(cell / N) * 100}%)` }}
            >
              <span
                className={`grid size-full place-items-center rounded-[16%] font-display text-[13cqw] font-extrabold transition-colors ${
                  tile === cell ? "bg-(--cat) text-on-accent" : "bg-surface-strong"
                }`}
              >
                {tile + 1}
              </span>
            </button>
          ),
        )}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        Moves {moves}. Put the tiles in order, 1 to 8, with the gap last.
      </p>
    </div>
  );
}
