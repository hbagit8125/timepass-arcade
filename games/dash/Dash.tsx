"use client";

import { useEffect, useRef } from "react";
import { canvasClass, canvasStyle, centerText, palette, roundRect, useCanvas, useLoop } from "@/lib/canvas";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const W = 480;
const H = 300;
const GROUND = 240;
const RUNNER = { x: 70, size: 28 };

type Block = { x: number; w: number; h: number };

const start = () => ({
  y: GROUND - RUNNER.size,
  vy: 0,
  blocks: [] as Block[],
  nextIn: 380, // distance until the next block appears
  distance: 0,
  reported: 0,
  started: false,
  dead: false,
});

export default function Dash({ paused, onScore, onEnd }: GameProps) {
  const canvas = useCanvas(W, H);
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();

  const onGround = () => state.current!.y >= GROUND - RUNNER.size - 0.5;

  function jump() {
    const g = state.current!;
    if (paused || g.dead) return;
    g.started = true;
    if (!onGround()) return;
    g.vy = -780;
    sfx.bounce();
  }

  /** Letting go early makes a shorter hop. */
  function release() {
    const g = state.current!;
    if (g.vy < -320) g.vy = -320;
  }

  useLoop((dt) => {
    const g = state.current!;

    if (g.started && !g.dead && !paused) {
      const speed = Math.min(580, 270 + g.distance * 0.012);
      const move = speed * dt;
      g.distance += move;

      g.vy += 2500 * dt;
      g.y = Math.min(GROUND - RUNNER.size, g.y + g.vy * dt);
      if (onGround()) g.vy = 0;

      g.nextIn -= move;
      if (g.nextIn <= 0) {
        g.blocks.push({ x: W + 20, w: 18 + Math.random() * 18, h: 26 + Math.random() * 34 });
        g.nextIn = speed * (0.8 + Math.random() * 0.9);
      }
      for (const block of g.blocks) block.x -= move;
      if (g.blocks[0] && g.blocks[0].x + g.blocks[0].w < 0) g.blocks.shift();

      const score = Math.floor(g.distance / 10);
      if (score >= g.reported + 5) {
        g.reported = score;
        onScore(score);
      }

      // Slightly forgiving hit box.
      const hit = g.blocks.some(
        (b) => RUNNER.x + RUNNER.size - 5 > b.x && RUNNER.x + 5 < b.x + b.w && g.y + RUNNER.size - 3 > GROUND - b.h,
      );
      if (hit) {
        g.dead = true;
        onScore(score);
        onEnd({ score, message: `You ran ${score} metres.` });
      }
    }

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = palette();
    ctx.clearRect(0, 0, W, H);

    // Ground, with dashes that scroll to show speed.
    ctx.fillStyle = c.line;
    ctx.fillRect(0, GROUND, W, 2);
    for (let x = -(g.distance % 60); x < W; x += 60) ctx.fillRect(x, GROUND + 14, 22, 2);

    ctx.fillStyle = c.arcade;
    for (const b of g.blocks) roundRect(ctx, b.x, GROUND - b.h, b.w, b.h, 5);

    ctx.fillStyle = c.reflex;
    roundRect(ctx, RUNNER.x, g.y, RUNNER.size, RUNNER.size, 8);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(RUNNER.x + 19, g.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#17132f";
    ctx.beginPath();
    ctx.arc(RUNNER.x + 20.5, g.y + 10, 2.2, 0, Math.PI * 2);
    ctx.fill();

    if (!g.started) centerText(ctx, "Press Space or tap to jump", W / 2, H * 0.36, 18, c.muted);
  });

  // Releasing the jump key early also makes a shorter hop.
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      const g = state.current;
      if (g && (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") && g.vy < -320) g.vy = -320;
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, []);

  useKey((key, e) => {
    if (key === " " || key === "ArrowUp" || key.toLowerCase() === "w") {
      if (!e.repeat) jump();
      return true;
    }
  });

  return (
    <canvas
      ref={canvas}
      className={canvasClass}
      style={canvasStyle(W, H, 40)}
      onPointerDown={jump}
      onPointerUp={release}
      onPointerCancel={release}
      role="img"
      aria-label="Dash playing field"
    />
  );
}
