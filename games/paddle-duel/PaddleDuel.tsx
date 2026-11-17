"use client";

import { useRef } from "react";
import { canvasClass, canvasStyle, centerText, palette, pointerAt, roundRect, useCanvas, useLoop } from "@/lib/canvas";
import { sfx } from "@/lib/sound";
import { useHeldKeys, useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const W = 360;
const H = 500;
const PAD = { w: 78, h: 12 };
const YOU_Y = H - 30;
const CPU_Y = 18;
const R = 7;
const LIVES = 5;

const clampX = (x: number) => Math.max(PAD.w / 2, Math.min(W - PAD.w / 2, x));

const start = () => ({
  you: W / 2,
  cpu: W / 2,
  cpuAim: 0, // how far off-centre the computer tries to meet the ball
  ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
  wait: 0, // seconds until the next serve
  yourPoints: 0,
  cpuPoints: 0,
  started: false,
  over: false,
});

export default function PaddleDuel({ paused, onScore, onEnd }: GameProps) {
  const canvas = useCanvas(W, H);
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();
  const held = useHeldKeys();

  function serve(towardYou: boolean) {
    const g = state.current!;
    const angle = (Math.random() - 0.5) * 0.9;
    g.ball = { x: W / 2, y: H / 2, vx: 300 * Math.sin(angle), vy: 300 * Math.cos(angle) * (towardYou ? 1 : -1) };
    g.wait = 0.9;
  }

  function begin() {
    const g = state.current!;
    if (g.started || paused) return;
    g.started = true;
    serve(true);
  }

  /** Send the ball back from a paddle; where it lands on the paddle sets the angle. */
  function returnBall(paddleX: number, direction: 1 | -1) {
    const g = state.current!;
    const b = g.ball;
    const speed = Math.min(640, Math.hypot(b.vx, b.vy) * 1.045);
    const offset = Math.max(-1, Math.min(1, (b.x - paddleX) / (PAD.w / 2)));
    b.vx = speed * Math.sin(offset * 0.95);
    b.vy = speed * Math.cos(offset * 0.95) * direction;
    g.cpuAim = (Math.random() - 0.5) * PAD.w * 0.9;
    sfx.bounce();
  }

  useLoop((dt) => {
    const g = state.current!;
    const b = g.ball;

    if (g.started && !g.over && !paused) {
      const dir = (held.current.has("ArrowRight") ? 1 : 0) - (held.current.has("ArrowLeft") ? 1 : 0);
      g.you = clampX(g.you + dir * 460 * dt);

      // The computer follows the ball, and gets quicker as you score.
      const cpuSpeed = 170 + g.yourPoints * 16;
      const target = b.vy < 0 ? b.x + g.cpuAim : W / 2;
      g.cpu = clampX(g.cpu + Math.max(-cpuSpeed * dt, Math.min(cpuSpeed * dt, target - g.cpu)));

      if (g.wait > 0) g.wait -= dt;
      else {
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

        if (b.vy > 0 && b.y + R >= YOU_Y && b.y - R <= YOU_Y + PAD.h && Math.abs(b.x - g.you) <= PAD.w / 2 + R) {
          b.y = YOU_Y - R;
          returnBall(g.you, -1);
        } else if (b.vy < 0 && b.y - R <= CPU_Y + PAD.h && b.y + R >= CPU_Y && Math.abs(b.x - g.cpu) <= PAD.w / 2 + R) {
          b.y = CPU_Y + PAD.h + R;
          returnBall(g.cpu, 1);
        }

        if (b.y < -R * 2) {
          g.yourPoints++;
          onScore(g.yourPoints * 100);
          sfx.merge(6);
          serve(false);
        } else if (b.y > H + R * 2) {
          g.cpuPoints++;
          sfx.lose();
          if (g.cpuPoints === LIVES) {
            g.over = true;
            onEnd({
              score: g.yourPoints * 100,
              message: `You won ${g.yourPoints} ${g.yourPoints === 1 ? "point" : "points"} before the computer reached ${LIVES}.`,
            });
          } else serve(true);
        }
      }
    }

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = palette();
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = c.line;
    for (let x = 10; x < W; x += 24) ctx.fillRect(x, H / 2 - 1, 12, 2);
    ctx.globalAlpha = 0.5;
    centerText(ctx, String(g.cpuPoints), W / 2, H * 0.3, 64, c.arcade);
    centerText(ctx, String(g.yourPoints), W / 2, H * 0.7, 64, c.classic);
    ctx.globalAlpha = 1;

    ctx.fillStyle = c.arcade;
    roundRect(ctx, g.cpu - PAD.w / 2, CPU_Y, PAD.w, PAD.h, 6);
    ctx.fillStyle = c.classic;
    roundRect(ctx, g.you - PAD.w / 2, YOU_Y, PAD.w, PAD.h, 6);
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
    ctx.fill();

    if (!g.started) centerText(ctx, "Press Space or tap to serve", W / 2, H * 0.56, 17, c.muted);
  });

  useKey((key) => {
    if (key === " " || key === "Enter") return (begin(), true);
    if (key === "ArrowLeft" || key === "ArrowRight") return (begin(), true);
  });

  return (
    <canvas
      ref={canvas}
      className={canvasClass}
      style={canvasStyle(W, H, 24)}
      onPointerDown={(e) => {
        begin();
        if (!paused) state.current!.you = clampX(pointerAt(e, W, H).x);
      }}
      onPointerMove={(e) => {
        if (!paused) state.current!.you = clampX(pointerAt(e, W, H).x);
      }}
      role="img"
      aria-label="Paddle Duel playing field. Your paddle is at the bottom."
    />
  );
}
