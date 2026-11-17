# Timepass Arcade

Quick browser games for short breaks. Next.js (App Router), TypeScript, Tailwind CSS. Scores, favourites and settings are saved in the browser, so there is no backend.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy

Import this repo in Vercel and accept the defaults. Every push to `main` deploys.

## How it is organised

```
app/
  page.tsx                home: hero + game grid
  games/[slug]/page.tsx   one page per game
games/
  registry.ts             the list of all 20 games (name, category, how to play)
  loaders.ts              maps a game to its lazy-loaded component
  types.ts                the contract every game implements
  2048/                   one folder per game
components/               header, hero, cards, game shell, confetti
lib/                      saved-score store, sound effects
```

## Add a game

1. Create `games/<slug>/` with a component that takes `GameProps` (`paused`, `onScore`, `onEnd`).
2. Add it to `games/loaders.ts`.
3. Set `playable: true` and fill in `howTo` for its entry in `games/registry.ts`.

The shell handles score, best score, restart, pause, full screen and the end screen.

## Status

Playable (10): 2048, Sudoku, Minesweeper, Memory Match, Word Guess, Sliding Puzzle, Tic-Tac-Toe, Connect Four, Hangman, Rock Paper Scissors.

Coming soon (10): the arcade and reflex games.
