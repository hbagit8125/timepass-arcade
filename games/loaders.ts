"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GameProps } from "./types";

// Each game is its own bundle, downloaded only when someone opens it.
export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  "2048": dynamic(() => import("./2048/Game2048"), { ssr: false }),
  sudoku: dynamic(() => import("./sudoku/Sudoku"), { ssr: false }),
  minesweeper: dynamic(() => import("./minesweeper/Minesweeper"), { ssr: false }),
  "memory-match": dynamic(() => import("./memory-match/MemoryMatch"), { ssr: false }),
  "word-guess": dynamic(() => import("./word-guess/WordGuess"), { ssr: false }),
  "sliding-puzzle": dynamic(() => import("./sliding-puzzle/SlidingPuzzle"), { ssr: false }),
  "tic-tac-toe": dynamic(() => import("./tic-tac-toe/TicTacToe"), { ssr: false }),
  "connect-four": dynamic(() => import("./connect-four/ConnectFour"), { ssr: false }),
  hangman: dynamic(() => import("./hangman/Hangman"), { ssr: false }),
  "rock-paper-scissors": dynamic(() => import("./rock-paper-scissors/RockPaperScissors"), { ssr: false }),
};

Object.assign(GAME_COMPONENTS, {
  snake: dynamic(() => import("./snake/Snake"), { ssr: false }),
  "brick-breaker": dynamic(() => import("./brick-breaker/BrickBreaker"), { ssr: false }),
  "falling-blocks": dynamic(() => import("./falling-blocks/FallingBlocks"), { ssr: false }),
  flap: dynamic(() => import("./flap/Flap"), { ssr: false }),
  "paddle-duel": dynamic(() => import("./paddle-duel/PaddleDuel"), { ssr: false }),
  dash: dynamic(() => import("./dash/Dash"), { ssr: false }),
  "whack-a-mole": dynamic(() => import("./whack-a-mole/WhackAMole"), { ssr: false }),
  echo: dynamic(() => import("./echo/Echo"), { ssr: false }),
  "reaction-time": dynamic(() => import("./reaction-time/ReactionTime"), { ssr: false }),
  "typing-speed": dynamic(() => import("./typing-speed/TypingSpeed"), { ssr: false }),
});
