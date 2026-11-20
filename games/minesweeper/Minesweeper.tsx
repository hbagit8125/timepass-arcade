"use client";

import { Bomb, Flag, Shovel } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { shuffle } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { clock, useElapsed } from "@/lib/useElapsed";
import type { GameProps } from "../types";

const SIZE = 9;
const MINES = 10;
const SAFE = SIZE * SIZE - MINES;

type Cell = { mine: boolean; near: number; open: boolean; flag: boolean };

const blank = (): Cell[] =>
  Array.from({ length: SIZE * SIZE }, () => ({ mine: false, near: 0, open: false, flag: false }));

function neighbours(i: number): number[] {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if ((dr || dc) && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc);
    }
  return out;
}

/** Mines are placed after the first tap, so the first tap is always safe. */
function layMines(cells: Cell[], first: number): Cell[] {
  const avoid = new Set([first, ...neighbours(first)]);
  const spots = shuffle(cells.map((_, i) => i).filter((i) => !avoid.has(i))).slice(0, MINES);
  const next = cells.map((c) => ({ ...c }));
  for (const s of spots) next[s].mine = true;
  next.forEach((cell, i) => (cell.near = neighbours(i).filter((n) => next[n].mine).length));
  return next;
}

function open(cells: Cell[], start: number): Cell[] {
  const next = cells.map((c) => ({ ...c }));
  const queue = [start];
  while (queue.length) {
    const i = queue.pop()!;
    const cell = next[i];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (!cell.mine && cell.near === 0) queue.push(...neighbours(i));
  }
  return next;
}

const NUMBER_COLOR = ["", "var(--classic)", "var(--reflex)", "var(--arcade)", "var(--puzzle)"];

export default function Minesweeper({ paused, onScore, onEnd }: GameProps) {
  const [cells, setCells] = useState(blank);
  const [status, setStatus] = useState<"new" | "playing" | "won" | "lost">("new");
  const [flagMode, setFlagMode] = useState(false);
  const seconds = useElapsed(status === "playing" && !paused);
  const longPress = useRef<number | undefined>(undefined);
  const suppressClick = useRef(false);
  const lastLongPress = useRef(-Infinity);
  const endTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(longPress.current);
      window.clearTimeout(endTimer.current);
    },
    [],
  );

  const finished = status === "won" || status === "lost";
  const flags = cells.filter((c) => c.flag).length;

  function toggleFlag(i: number) {
    if (paused || finished || cells[i].open) return;
    sfx.click();
    setCells(cells.map((c, n) => (n === i ? { ...c, flag: !c.flag } : c)));
  }

  function reveal(i: number) {
    if (paused || finished || cells[i].open || cells[i].flag) return;
    const board = open(status === "new" ? layMines(cells, i) : cells, i);
    const opened = board.filter((c) => c.open && !c.mine).length;

    if (board[i].mine) {
      setCells(board.map((c) => (c.mine ? { ...c, open: true } : c)));
      setStatus("lost");
      sfx.lose();
      // Leave a moment to see where the mines were.
      endTimer.current = window.setTimeout(
        () => onEnd({ score: opened * 5, message: "You hit a mine." }),
        1300,
      );
      return;
    }

    setCells(board);
    sfx.move();
    if (opened === SAFE) {
      const score = SAFE * 5 + 200 + Math.max(0, 300 - seconds);
      setStatus("won");
      onScore(score);
      onEnd({ score, won: true, message: `Field cleared in ${clock(seconds)}.` });
    } else {
      setStatus("playing");
      onScore(opened * 5);
    }
  }

  function press(i: number) {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (flagMode) toggleFlag(i);
    else reveal(i);
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-3 flex w-full max-w-[min(30rem,max(17rem,calc(100dvh-25rem)))] items-center justify-between text-sm text-muted">
        <span>Mines left {MINES - flags}</span>
        <span>Time {clock(seconds)}</span>
      </div>

      <div
        onContextMenu={(e) => e.preventDefault()}
        className="glass @container grid aspect-square w-full max-w-[min(30rem,max(17rem,calc(100dvh-25rem)))] select-none grid-cols-9 gap-[1%] rounded-3xl p-[2%] shadow-lift"
      >
        {cells.map((cell, i) => (
          <button
            key={i}
            type="button"
            onClick={() => press(i)}
            onContextMenu={() => {
              // Android also fires this after a long press, which already placed the flag.
              if (performance.now() - lastLongPress.current < 800) return;
              toggleFlag(i);
            }}
            onPointerDown={(e) => {
              if (e.pointerType === "mouse") return;
              longPress.current = window.setTimeout(() => {
                suppressClick.current = true;
                lastLongPress.current = performance.now();
                toggleFlag(i);
              }, 420);
            }}
            onPointerUp={() => window.clearTimeout(longPress.current)}
            onPointerLeave={() => window.clearTimeout(longPress.current)}
            aria-label={
              cell.open ? (cell.mine ? "Mine" : `${cell.near} mines nearby`) : cell.flag ? "Flagged" : "Hidden"
            }
            className={`grid aspect-square touch-manipulation place-items-center rounded-[20%] font-display text-[6cqw] font-extrabold leading-none transition-colors ${
              cell.open
                ? cell.mine
                  ? "bg-arcade text-on-accent"
                  : "bg-transparent"
                : "bg-surface-strong hover:bg-[color-mix(in_oklab,var(--cat)_30%,var(--surface-strong))]"
            }`}
            style={{ color: cell.open && !cell.mine ? (NUMBER_COLOR[cell.near] ?? "var(--ink)") : undefined }}
          >
            {cell.open ? (
              cell.mine ? (
                <Bomb className="size-[55%]" aria-hidden />
              ) : (
                cell.near || ""
              )
            ) : cell.flag ? (
              <Flag className="size-[50%] fill-(--cat) text-(--cat-ink)" aria-hidden />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2" role="group" aria-label="What a tap does">
        {[
          { on: false, label: "Dig", Icon: Shovel },
          { on: true, label: "Flag", Icon: Flag },
        ].map(({ on, label, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => setFlagMode(on)}
            aria-pressed={flagMode === on}
            className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors ${
              flagMode === on ? "bg-ink text-bg" : "glass hover:bg-surface-strong"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
