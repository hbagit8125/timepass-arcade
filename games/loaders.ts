"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GameProps } from "./types";

type Loader = () => Promise<{ default: ComponentType<GameProps> }>;

// One import per game. The game page and the offline download both go
// through these, so they fetch exactly the same files.
const LOADERS: Record<string, Loader> = {
  "2048": () => import("./2048/Game2048"),
  sudoku: () => import("./sudoku/Sudoku"),
  minesweeper: () => import("./minesweeper/Minesweeper"),
  "memory-match": () => import("./memory-match/MemoryMatch"),
  "word-guess": () => import("./word-guess/WordGuess"),
  "sliding-puzzle": () => import("./sliding-puzzle/SlidingPuzzle"),
  "tic-tac-toe": () => import("./tic-tac-toe/TicTacToe"),
  "connect-four": () => import("./connect-four/ConnectFour"),
  hangman: () => import("./hangman/Hangman"),
  "rock-paper-scissors": () => import("./rock-paper-scissors/RockPaperScissors"),
  snake: () => import("./snake/Snake"),
  "brick-breaker": () => import("./brick-breaker/BrickBreaker"),
  "falling-blocks": () => import("./falling-blocks/FallingBlocks"),
  flap: () => import("./flap/Flap"),
  "paddle-duel": () => import("./paddle-duel/PaddleDuel"),
  dash: () => import("./dash/Dash"),
  "whack-a-mole": () => import("./whack-a-mole/WhackAMole"),
  echo: () => import("./echo/Echo"),
  "reaction-time": () => import("./reaction-time/ReactionTime"),
  "typing-speed": () => import("./typing-speed/TypingSpeed"),
};

// Each game is its own bundle, downloaded only when someone opens it.
export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = Object.fromEntries(
  Object.entries(LOADERS).map(([slug, load]) => [slug, dynamic(load, { ssr: false })]),
);

/** Downloads every game's code ahead of time, so it is available offline. */
export const preloadAllGames = () => Promise.allSettled(Object.values(LOADERS).map((load) => load()));
