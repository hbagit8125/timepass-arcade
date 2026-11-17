"use client";

import { useRef, type PointerEvent } from "react";
import { canvasClass, canvasStyle, centerText, palette, roundRect, useCanvas, useLoop } from "@/lib/canvas";
import { randInt } from "@/lib/random";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const N = 20; // cells per side
const SIZE = 400;
const CELL = SIZE / N;

type Point = { x: number; y: number };

const DIRS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
};

function placeFood(snake: Point[]): Point {
  for (;;) {
    const p = { x: randInt(N), y: randInt(N) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

function start() {
  const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  return {
    snake,
    dir: { x: 1, y: 0 },
    queue: [] as Point[],
    food: placeFood(snake),
    clock: 0,
    score: 0,
    started: false,
    dead: false,
  };
}

export default function Snake({ paused, onScore, onEnd }: GameProps) {
  const canvas = useCanvas(SIZE, SIZE);
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();
  const swipe = useRef<Point | null>(null);

  function turn(d: Point) {
    const g = state.current!;
    if (paused || g.dead) return;
    const last = g.queue.at(-1) ?? g.dir;
    g.started = true;
    // Ignore reversing into yourself and repeats; buffer up to two quick turns.
    if ((d.x === -last.x && d.y === -last.y) || (d.x === last.x && d.y === last.y)) return;
    if (g.queue.length < 2) g.queue.push(d);
  }

  function step() {
    const g = state.current!;
    g.dir = g.queue.shift() ?? g.dir;
    const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
    const eats = head.x === g.food.x && head.y === g.food.y;
    const body = eats ? g.snake : g.snake.slice(0, -1);

    if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || body.some((s) => s.x === head.x && s.y === head.y)) {
      g.dead = true;
      onEnd({ score: g.score, message: `Your snake was ${g.snake.length} squares long.` });
      return;
    }

    g.snake = [head, ...body];
    if (eats) {
      g.score += 10;
      g.food = placeFood(g.snake);
      onScore(g.score);
      sfx.merge(Math.min(12, g.snake.length / 2));
    }
  }

  useLoop((dt) => {
    const g = state.current!;
    if (g.started && !g.dead && !paused) {
      // Speeds up as the snake grows.
      const interval = Math.max(0.065, 0.15 - g.score * 0.0004);
      g.clock += dt;
      while (g.clock >= interval && !g.dead) {
        g.clock -= interval;
        step();
      }
    }

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = palette();
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = c.puzzle;
    ctx.beginPath();
    ctx.arc((g.food.x + 0.5) * CELL, (g.food.y + 0.5) * CELL, CELL * 0.36, 0, Math.PI * 2);
    ctx.fill();

    g.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? c.ink : c.arcade;
      ctx.globalAlpha = i === 0 ? 1 : Math.max(0.45, 1 - i * 0.02);
      roundRect(ctx, s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, 6);
    });
    ctx.globalAlpha = 1;

    if (!g.started) centerText(ctx, "Press an arrow key or swipe to start", SIZE / 2, SIZE * 0.72, 17, c.muted);
  });

  useKey((key) => {
    const d = DIRS[key.length === 1 ? key.toLowerCase() : key];
    if (d) return turn(d), true;
  });

  function onPointerMove(e: PointerEvent) {
    const from = swipe.current;
    if (!from) return;
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
    // Restart the swipe here so one long drag can make several turns.
    swipe.current = { x: e.clientX, y: e.clientY };
  }

  return (
    <canvas
      ref={canvas}
      className={canvasClass}
      style={canvasStyle(SIZE, SIZE, 30)}
      onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
      onPointerMove={onPointerMove}
      onPointerUp={() => (swipe.current = null)}
      onPointerCancel={() => (swipe.current = null)}
      role="img"
      aria-label="Snake playing field"
    />
  );
}
