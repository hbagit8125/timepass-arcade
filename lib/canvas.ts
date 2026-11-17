"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";

export type Palette = Record<
  "bg" | "ink" | "muted" | "line" | "cell" | "puzzle" | "arcade" | "classic" | "reflex",
  string
>;

let cached: { theme: string | undefined; colors: Palette } | null = null;

/** The site's theme colours, for drawing on a canvas. Re-read when the theme changes. */
export function palette(): Palette {
  const theme = document.documentElement.dataset.theme;
  if (cached && cached.theme === theme) return cached.colors;
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const colors: Palette = {
    bg: v("--bg"), ink: v("--ink"), muted: v("--muted"), line: v("--line"), cell: v("--surface-strong"),
    puzzle: v("--puzzle"), arcade: v("--arcade"), classic: v("--classic"), reflex: v("--reflex"),
  };
  cached = { theme, colors };
  return colors;
}

/** Blend two #rrggbb colours. */
export function mixHex(a: string, b: string, t = 0.5): string {
  const part = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(part(a, i) * (1 - t) + part(b, i) * t)).join(",")})`;
}

/** Calls `frame` every animation frame with the seconds since the last one. */
export function useLoop(frame: (dt: number) => void) {
  const latest = useRef(frame);
  useEffect(() => {
    latest.current = frame;
  });
  useEffect(() => {
    let id = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Cap the step so a background tab doesn't cause one giant jump.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      latest.current(dt);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
}

/** A canvas with a fixed logical size (w × h) that stays sharp on high-density screens. */
export function useCanvas(w: number, h: number) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [w, h]);
  return ref;
}

/** Sizes a canvas to fit both the column width and the screen height. */
export const canvasStyle = (w: number, h: number, maxRem: number, reserveRem = 21): CSSProperties => ({
  aspectRatio: `${w} / ${h}`,
  // reserveRem is the height taken by everything else on the page.
  maxWidth: `min(${maxRem}rem, max(11rem, calc((100dvh - ${reserveRem}rem) * ${(w / h).toFixed(4)})))`,
});

export const canvasClass = "glass w-full touch-none select-none rounded-3xl shadow-lift";

/** Pointer position in the canvas's logical coordinates. */
export function pointerAt(e: PointerEvent<HTMLCanvasElement>, w: number, h: number) {
  const box = e.currentTarget.getBoundingClientRect();
  return { x: ((e.clientX - box.left) * w) / box.width, y: ((e.clientY - box.top) * h) / box.height };
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
  ctx.fill();
}

export function centerText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ${getComputedStyle(document.body).getPropertyValue("--font-bricolage") || "sans-serif"}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}
