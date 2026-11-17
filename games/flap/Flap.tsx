"use client";

import { useRef } from "react";
import { canvasClass, canvasStyle, centerText, palette, roundRect, useCanvas, useLoop } from "@/lib/canvas";
import { sfx } from "@/lib/sound";
import { useKey } from "@/lib/useKey";
import type { GameProps } from "../types";

const W = 360;
const H = 520;
const GROUND = H - 36;
const BIRD = { x: 96, size: 26 };
const GATE_W = 58;
const SPACING = 215;

type Gate = { x: number; gapY: number; gap: number; passed: boolean };

const start = () => ({
  y: H * 0.42,
  vy: 0,
  gates: [] as Gate[],
  score: 0,
  time: 0,
  started: false,
  dead: false,
});

export default function Flap({ paused, onScore, onEnd }: GameProps) {
  const canvas = useCanvas(W, H);
  const state = useRef<ReturnType<typeof start> | null>(null);
  if (state.current === null) state.current = start();

  function flap() {
    const g = state.current!;
    if (paused || g.dead) return;
    g.started = true;
    g.vy = -430;
    sfx.bounce();
  }

  function addGate(x: number) {
    const g = state.current!;
    const gap = Math.max(128, 160 - g.score * 1.5);
    g.gates.push({ x, gap, gapY: 70 + Math.random() * (GROUND - 140 - gap), passed: false });
  }

  useLoop((dt) => {
    const g = state.current!;
    g.time += dt;

    if (g.started && !g.dead && !paused) {
      const speed = Math.min(250, 165 + g.score * 2.5);
      g.vy += 1500 * dt;
      g.y = Math.max(0, g.y + g.vy * dt);

      if (g.gates.length === 0) addGate(W + 60);
      for (const gate of g.gates) gate.x -= speed * dt;
      if (g.gates[g.gates.length - 1].x < W - SPACING) addGate(W);
      if (g.gates[0].x < -GATE_W) g.gates.shift();

      let hit = g.y + BIRD.size >= GROUND;
      for (const gate of g.gates) {
        // Slightly forgiving hit box.
        const overlapsX = BIRD.x + BIRD.size - 4 > gate.x && BIRD.x + 4 < gate.x + GATE_W;
        if (overlapsX && (g.y + 4 < gate.gapY || g.y + BIRD.size - 4 > gate.gapY + gate.gap)) hit = true;
        if (!gate.passed && gate.x + GATE_W < BIRD.x) {
          gate.passed = true;
          g.score++;
          onScore(g.score);
          sfx.merge(Math.min(12, g.score));
        }
      }
      if (hit) {
        g.dead = true;
        onEnd({ score: g.score, message: `You flew through ${g.score} ${g.score === 1 ? "gap" : "gaps"}.` });
      }
    }

    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const c = palette();
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = c.classic;
    for (const gate of g.gates) {
      roundRect(ctx, gate.x, -12, GATE_W, gate.gapY + 12, 10);
      roundRect(ctx, gate.x, gate.gapY + gate.gap, GATE_W, GROUND - gate.gapY - gate.gap + 12, 10);
    }

    ctx.fillStyle = c.cell;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = c.line;
    ctx.fillRect(0, GROUND, W, 2);

    // The bird: a square that bobs before the first flap and tilts with its speed.
    const y = g.started ? g.y : g.y + Math.sin(g.time * 4) * 6;
    ctx.save();
    ctx.translate(BIRD.x + BIRD.size / 2, y + BIRD.size / 2);
    ctx.rotate(Math.max(-0.5, Math.min(1.1, g.vy / 600)));
    ctx.fillStyle = c.puzzle;
    ctx.beginPath();
    ctx.moveTo(BIRD.size / 2 - 2, -4);
    ctx.lineTo(BIRD.size / 2 + 9, 1);
    ctx.lineTo(BIRD.size / 2 - 2, 6);
    ctx.fill();
    ctx.fillStyle = c.arcade;
    roundRect(ctx, -BIRD.size / 2, -BIRD.size / 2, BIRD.size, BIRD.size, 8);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(5, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#17132f";
    ctx.beginPath();
    ctx.arc(6.5, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!g.started) centerText(ctx, "Press Space or tap to flap", W / 2, H * 0.68, 17, c.muted);
  });

  useKey((key) => {
    if (key === " " || key === "ArrowUp" || key.toLowerCase() === "w") return flap(), true;
  });

  return (
    <canvas
      ref={canvas}
      className={canvasClass}
      style={canvasStyle(W, H, 24)}
      onPointerDown={flap}
      role="img"
      aria-label="Flap playing field"
    />
  );
}
