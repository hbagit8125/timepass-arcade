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
lib/                      saved-score store, sound effects, canvas and game-loop helpers
```

## Add a game

1. Create `games/<slug>/` with a component that takes `GameProps` (`paused`, `onScore`, `onEnd`).
2. Add it to `games/loaders.ts`.
3. Set `playable: true` and fill in `howTo` for its entry in `games/registry.ts`.

The shell handles score, best score, restart, pause, full screen and the end screen.

## Offline and install

`public/sw.js` is a small service worker. Pages are fetched fresh when online and served from the saved copy when not; hashed files under `/_next/static/` are served from the saved copy first. After the first visit, `components/OfflineReady.tsx` downloads every game in the background, so the whole arcade works without a connection. Browsers that support it show an "Install app" button in the header.

The service worker only registers in production builds. If you change caching behaviour in a way that needs old copies thrown away, bump `CACHE` in `public/sw.js`.

## Status

All 20 games are playable. Phases 1 to 4 are complete.

Checks at the end of Phase 4, on a production build:

- Lighthouse (mobile): performance 92 on the home page and 97 to 99 on game pages; accessibility, best practices and SEO 100.
- axe accessibility scan: no issues on the home page or any of the 20 game pages, in both themes.
- Offline: every game page loads and plays with the network switched off, after one online visit.
