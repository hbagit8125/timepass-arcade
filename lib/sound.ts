"use client";

import { useArcade } from "./store";

// Small synthesised sound effects, so there are no audio files to download.

let ctx: AudioContext | null = null;

function tone(freq: number, duration: number, type: OscillatorType, gain: number, delay = 0) {
  if (useArcade.getState().muted || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch {
    // Audio is a nice-to-have; ignore browsers that block it.
  }
}

export const sfx = {
  move: () => tone(220, 0.07, "triangle", 0.08),
  merge: (step = 1) => tone(300 + step * 45, 0.12, "sine", 0.12),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "triangle", 0.12, i * 0.09)),
  lose: () => [330, 262, 196].forEach((f, i) => tone(f, 0.25, "sawtooth", 0.06, i * 0.12)),
  click: () => tone(520, 0.04, "square", 0.04),
  /** A plain note, for games that play their own tunes. */
  note: (freq: number, duration = 0.18) => tone(freq, duration, "triangle", 0.13),
  bounce: () => tone(420, 0.05, "square", 0.05),
};
