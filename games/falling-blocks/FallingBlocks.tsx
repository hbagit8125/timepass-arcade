"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, RotateCw } from "lucide-react";
import { useRef, useState } from "react";
import { canvasClass, canvasStyle, centerText, mixHex, palette, roundRect, useCanvas, useLoop, type Palette } from "@/lib/canvas";
import { shuffle } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const COLS = 10;
const ROWS = 20;
const CELL = 24;
const W = COLS * CELL;
const H = ROWS * CELL;

type Matrix = number[][];

const SHAPES: Matrix[] = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
];

const colorOf = (kind: number, c: Palette) =>
  [c.classic, c.puzzle, c.reflex, mixHex(c.classic, c.puzzle), c.arcade, mixHex(c.reflex, c.classic), mixHex(c.puzzle, c.arcade)][kind];

const rotate = (m: Matrix): Matrix => m.map((_, r) => m.map((__, c) => m[m.length - 1 - c][r]));
const LINE_POINTS = [0, 100, 300, 500, 800];

type Piece = { kind: number; m: Matrix; x: number; y: number };

function start() {
  const bag = shuffle([0, 1, 2, 3, 4, 5, 6]);
  return {
    grid: Array.from({ length: ROWS }, () => Array<number>(COLS).fill(-1)),
    bag,
    piece: null as Piece | null,
    clock: 0,
    score: 0,
    lines: 0,
    started: false,
    over: false,
  };
}

export default function FallingBlocks({ paused, onScore, onEnd }: GameProps) {
  const canvas = useCanvas(W, H);
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();
  const [hud, setHud] = useState<{ next: number | null; lines: number; level: number }>({ next: null, lines: 0, level: 1 });

  const level = () => Math.floor(state.current!.lines / 10) + 1;

  function fits(m: Matrix, x: number, y: number) {
    const { grid } = state.current!;
    return m.every((row, r) =>
      row.every((on, c) => {
        if (!on) return true;
        const gx = x + c;
        const gy = y + r;
        return gx >= 0 && gx < COLS && gy < ROWS && (gy < 0 || grid[gy][gx] === -1);
      }),
    );
  }

  function spawn() {
    const g = state.current!;
    // Pieces come from a shuffled set of all seven, refilled when it runs low.
    if (g.bag.length < 2) g.bag.push(...shuffle([0, 1, 2, 3, 4, 5, 6]));
    const kind = g.bag.shift()!;
    const m = SHAPES[kind];
    const piece = { kind, m, x: Math.floor((COLS - m.length) / 2), y: kind === 0 ? -1 : 0 };
    g.piece = piece;
    setHud({ next: g.bag[0], lines: g.lines, level: level() });
    if (!fits(m, piece.x, piece.y)) {
      g.over = true;
      onEnd({ score: g.score, message: `You cleared ${g.lines} ${g.lines === 1 ? "line" : "lines"}.` });
    }
  }

  function lock() {
    const g = state.current!;
    const p = g.piece!;
    p.m.forEach((row, r) =>
      row.forEach((on, c) => {
        if (on && p.y + r >= 0) g.grid[p.y + r][p.x + c] = p.kind;
      }),
    );
    const kept = g.grid.filter((row) => row.some((cell) => cell === -1));
    const cleared = ROWS - kept.length;
    if (cleared) {
      g.score += LINE_POINTS[cleared] * level();
      g.lines += cleared;
      g.grid = [...Array.from({ length: cleared }, () => Array<number>(COLS).fill(-1)), ...kept];
      sfx.merge(4 + cleared * 2);
    } else sfx.move();
    onScore(g.score);
    spawn();
  }

  function act(action: "left" | "right" | "rotate" | "down" | "drop") {
    const g = state.current!;
    if (paused || g.over) return;
    if (!g.started) {
      g.started = true;
      spawn();
      return;
    }
    const p = g.piece;
    if (!p) return;

    if (action === "left" && fits(p.m, p.x - 1, p.y)) p.x--;
    if (action === "right" && fits(p.m, p.x + 1, p.y)) p.x++;
    if (action === "rotate") {
      const turned = rotate(p.m);
      // Nudge sideways if the turn would hit a wall or another block.
      const kick = [0, -1, 1, -2, 2].find((dx) => fits(turned, p.x + dx, p.y));
      if (kick !== undefined) {
        p.m = turned;
        p.x += kick;
        sfx.click();
      }
    }
    if (action === "down") {
      if (fits(p.m, p.x, p.y + 1)) {
        p.y++;
        g.score += 1;
        g.clock = 0;
      } else lock();
    }
    if (action === "drop") {
      while (fits(p.m, p.x, p.y + 1)) {
        p.y++;
        g.score += 2;
      }
      lock();
    }
  }

  useLoop((dt) => {
    const g = state.current!;
    if (g.started && !g.over && !paused && g.piece) {
      g.clock += dt;
      const interval = Math.max(0.08, 0.7 - (level() - 1) * 0.06);
      if (g.clock >= interval) {
        g.clock = 0;
        if (fits(g.piece.m, g.piece.x, g.piece.y + 1)) g.piece.y++;
        else lock();
      }
    }

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = palette();
    ctx.clearRect(0, 0, W, H);
    const block = (x: number, y: number) => roundRect(ctx, x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 5);

    g.grid.forEach((row, y) =>
      row.forEach((kind, x) => {
        if (kind === -1) return;
        ctx.fillStyle = colorOf(kind, c);
        block(x, y);
      }),
    );

    const p = g.piece;
    if (p && !g.over) {
      // Outline of where the piece would land.
      let ghostY = p.y;
      while (fits(p.m, p.x, ghostY + 1)) ghostY++;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colorOf(p.kind, c);
      p.m.forEach((row, r) => row.forEach((on, col) => on && block(p.x + col, ghostY + r)));
      ctx.globalAlpha = 1;
      p.m.forEach((row, r) => row.forEach((on, col) => on && p.y + r >= 0 && block(p.x + col, p.y + r)));
    }

    if (!g.started) centerText(ctx, "Press any control to start", W / 2, H / 2, 15, c.muted);
  });

  useKey((key) => {
    const action = (
      { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rotate", ArrowDown: "down", " ": "drop", a: "left", d: "right", w: "rotate", s: "down" } as const
    )[key.length === 1 ? key.toLowerCase() : key];
    if (action) return act(action), true;
  });

  const next = hud.next === null ? [[0, 0], [0, 0]] : SHAPES[hud.next];
  const pad = "glass grid h-13 touch-manipulation place-items-center rounded-2xl transition-colors hover:bg-surface-strong active:bg-surface-strong";

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-start justify-center gap-3">
        <canvas ref={canvas} className={canvasClass} style={canvasStyle(W, H, 17, 25)} role="img" aria-label="Falling Blocks playing field" />
        <div className="flex w-20 shrink-0 flex-col gap-2 text-center text-xs text-muted">
          <div className="glass rounded-2xl p-2">
            Next
            <div className="mx-auto mt-1.5 grid w-12 gap-0.5" style={{ gridTemplateColumns: `repeat(${next.length}, 1fr)` }} aria-hidden>
              {next.flat().map((on, i) => (
                <i key={i} className={`aspect-square rounded-[3px] ${on ? "bg-(--cat)" : ""}`} />
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-2">
            Level
            <div className="font-display text-xl font-bold text-ink">{hud.level}</div>
          </div>
          <div className="glass rounded-2xl p-2">
            Lines
            <div className="font-display text-xl font-bold text-ink">{hud.lines}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid w-full max-w-sm grid-cols-5 gap-2">
        <button type="button" onClick={() => act("left")} aria-label="Move left" className={pad}><ArrowLeft className="size-5" aria-hidden /></button>
        <button type="button" onClick={() => act("right")} aria-label="Move right" className={pad}><ArrowRight className="size-5" aria-hidden /></button>
        <button type="button" onClick={() => act("rotate")} aria-label="Rotate" className={pad}><RotateCw className="size-5" aria-hidden /></button>
        <button type="button" onClick={() => act("down")} aria-label="Move down" className={pad}><ArrowDown className="size-5" aria-hidden /></button>
        <button type="button" onClick={() => act("drop")} aria-label="Drop to the bottom" className={pad}><ChevronsDown className="size-5" aria-hidden /></button>
      </div>
    </div>
  );
}
