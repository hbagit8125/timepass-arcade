"use client";

import { useRef } from "react";
import { canvasClass, canvasStyle, centerText, palette, pointerAt, roundRect, useCanvas, useLoop } from "@/lib/canvas";
import { sfx } from "@/lib/sound";
import { useHeldKeys, useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const W = 400;
const H = 480;
const COLS = 8;
const ROWS = 6;
const GAP = 6;
const SIDE = 16;
const BRICK_W = (W - SIDE * 2 - GAP * (COLS - 1)) / COLS;
const BRICK_H = 18;
const PADDLE = { w: 78, h: 12, y: H - 30 };
const R = 7;
const ROW_COLORS = ["arcade", "arcade", "puzzle", "puzzle", "classic", "classic"] as const;

type Brick = { x: number; y: number; row: number; alive: boolean };

const wall = (): Brick[] =>
  Array.from({ length: ROWS * COLS }, (_, i) => ({
    x: SIDE + (i % COLS) * (BRICK_W + GAP),
    y: 56 + Math.floor(i / COLS) * (BRICK_H + GAP),
    row: Math.floor(i / COLS),
    alive: true,
  }));

const start = () => ({
  paddleX: W / 2,
  ball: { x: W / 2, y: PADDLE.y - R, vx: 0, vy: 0 },
  stuck: true, // ball rides the paddle until launched
  bricks: wall(),
  lives: 3,
  level: 1,
  score: 0,
  over: false,
});

export default function BrickBreaker({ paused, onScore, onEnd }: GameProps) {
  const canvas = useCanvas(W, H);
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();
  const held = useHeldKeys();

  const speed = () => 270 + (state.current!.level - 1) * 30;

  function launch() {
    const g = state.current!;
    if (paused || g.over || !g.stuck) return;
    const angle = (Math.random() - 0.5) * 0.9;
    g.ball.vx = speed() * Math.sin(angle);
    g.ball.vy = -speed() * Math.cos(angle);
    g.stuck = false;
  }

  function move(dt: number) {
    const g = state.current!;
    const b = g.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x < R) {
      b.x = R;
      b.vx = Math.abs(b.vx);
    }
    if (b.x > W - R) {
      b.x = W - R;
      b.vx = -Math.abs(b.vx);
    }
    if (b.y < R) {
      b.y = R;
      b.vy = Math.abs(b.vy);
    }

    // Paddle: where the ball lands on it decides the angle it leaves at.
    if (b.vy > 0 && b.y + R >= PADDLE.y && b.y - R <= PADDLE.y + PADDLE.h && Math.abs(b.x - g.paddleX) <= PADDLE.w / 2 + R) {
      const offset = Math.max(-1, Math.min(1, (b.x - g.paddleX) / (PADDLE.w / 2)));
      b.vx = speed() * Math.sin(offset * 1.05);
      b.vy = -speed() * Math.cos(offset * 1.05);
      b.y = PADDLE.y - R;
      sfx.bounce();
    }

    for (const brick of g.bricks) {
      if (!brick.alive) continue;
      const nx = Math.max(brick.x, Math.min(b.x, brick.x + BRICK_W));
      const ny = Math.max(brick.y, Math.min(b.y, brick.y + BRICK_H));
      const dx = b.x - nx;
      const dy = b.y - ny;
      if (dx * dx + dy * dy > R * R) continue;
      brick.alive = false;
      if (Math.abs(dx) > Math.abs(dy)) b.vx = Math.sign(dx || b.vx) * Math.abs(b.vx);
      else b.vy = Math.sign(dy || -b.vy) * Math.abs(b.vy);
      g.score += 10;
      onScore(g.score);
      sfx.merge(ROWS - brick.row);
      break;
    }

    if (g.bricks.every((k) => !k.alive)) {
      g.level++;
      g.score += 100;
      onScore(g.score);
      g.bricks = wall();
      g.stuck = true;
      sfx.win();
    } else if (b.y > H + R) {
      g.lives--;
      g.stuck = true;
      sfx.lose();
      if (g.lives === 0) {
        g.over = true;
        onEnd({ score: g.score, message: `You reached level ${g.level}.` });
      }
    }
  }

  useLoop((dt) => {
    const g = state.current!;
    if (!paused && !g.over) {
      const dir = (held.current.has("ArrowRight") ? 1 : 0) - (held.current.has("ArrowLeft") ? 1 : 0);
      g.paddleX = Math.max(PADDLE.w / 2, Math.min(W - PADDLE.w / 2, g.paddleX + dir * 420 * dt));
      if (g.stuck) {
        g.ball.x = g.paddleX;
        g.ball.y = PADDLE.y - R;
      } else {
        // Two small steps per frame so a fast ball can't skip through a brick.
        move(dt / 2);
        if (!g.stuck) move(dt / 2);
      }
    }

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = palette();
    ctx.clearRect(0, 0, W, H);

    for (const brick of g.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = c[ROW_COLORS[brick.row]];
      roundRect(ctx, brick.x, brick.y, BRICK_W, BRICK_H, 5);
    }

    ctx.fillStyle = c.ink;
    roundRect(ctx, g.paddleX - PADDLE.w / 2, PADDLE.y, PADDLE.w, PADDLE.h, 6);
    ctx.beginPath();
    ctx.arc(g.ball.x, g.ball.y, R, 0, Math.PI * 2);
    ctx.fill();

    // Lives (dots) and level along the top.
    ctx.fillStyle = c.arcade;
    for (let i = 0; i < g.lives; i++) {
      ctx.beginPath();
      ctx.arc(SIDE + 6 + i * 18, 28, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = c.muted;
    ctx.font = '600 14px "Outfit Variable", sans-serif';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`Level ${g.level}`, W - SIDE, 28);

    if (g.stuck && !g.over) centerText(ctx, "Press Space or tap to launch", W / 2, H * 0.62, 17, c.muted);
  });

  useKey((key) => {
    if (key === " " || key === "ArrowUp") return (launch(), true);
    return key === "ArrowLeft" || key === "ArrowRight";
  });

  return (
    <canvas
      ref={canvas}
      className={canvasClass}
      style={canvasStyle(W, H, 28)}
      onPointerMove={(e) => {
        if (paused) return;
        const x = pointerAt(e, W, H).x;
        state.current!.paddleX = Math.max(PADDLE.w / 2, Math.min(W - PADDLE.w / 2, x));
      }}
      onPointerDown={(e) => {
        const x = pointerAt(e, W, H).x;
        if (!paused) state.current!.paddleX = Math.max(PADDLE.w / 2, Math.min(W - PADDLE.w / 2, x));
      }}
      onPointerUp={launch}
      role="img"
      aria-label="Brick Breaker playing field"
    />
  );
}
