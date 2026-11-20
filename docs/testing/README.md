# Independent test pass

After Phase 4, a separate tester agent (one that had not built the site) tested the whole app on a local production build, using each game's "How to play" text as the spec. It reported bugs, the builder fixed them, and the tester re-tested.

## What was tested

- Home page: hero, Surprise me, search, filters, favourites, Continue playing, best scores on cards, theme and sound toggles.
- Game shell: score and best, New game, Help, Full screen, pause (button, P key, hidden tab), end screen, new-best saving.
- All 20 games with keyboard (1366 × 768) and touch (390 × 844), including rule checks against independent simulations (2048, Falling Blocks, Word Guess colouring, Sudoku uniqueness, Sliding Puzzle solvability, Minesweeper first click).
- Layout, offline play, install, keyboard-only use and an axe accessibility scan in both themes.

## Bugs found and fixed

| # | Bug | Fix |
|---|---|---|
| 1 | Space and Enter went to the last clicked button instead of the game (Flap, Dash, Brick Breaker, Paddle Duel, Falling Blocks, Reaction Time) | `lib/useKey.ts` gives those keys to the game when focus is on a clicked button; a button reached with Tab still responds to them |
| 2 | Connect Four: Enter dropped in the clicked column, not the arrow-key column | Same fix as 1 |
| 3 | Word Guess: Enter didn't submit after clicking an on-screen key | Same fix as 1 |
| 4 | Typing Speed crashed after 260 words | Word list tops itself up |
| 5 | Full screen hid the score and toolbar | The whole game shell goes full screen |
| 6 | Whack-a-Mole and Typing Speed said "You win" for 0 | "You win" only with a score above 0 |
| 7 | Damaged saved data in the browser broke the site | `lib/store.ts` cleans saved data on load |

Smaller fixes: the end screen can't be skipped by a held key; the Score box shows the final score in Sudoku, Sliding Puzzle and Dash; Continue playing only lists games you actually played; Reaction Time fits 320 px screens; Echo's Space no longer scrolls; the browser bar colour follows the theme; clearer screen-reader labels on toggle buttons; Minesweeper ignores Android's extra long-press event.

## Re-test result

All seven bugs and the smaller issues confirmed fixed. Two minor issues found in the re-test (an early right-click in Minesweeper, and Tab counting as playing) were also fixed. Regression pass: all 20 games start, play and end on keyboard and touch; offline works; axe found no issues on the home page or any game in either theme; no page errors.

## Known and left as is

- Unknown game addresses show the "not found" page but return HTTP 200 (`dynamicParams` isn't available with Cache Components).
- Harmless font preload warnings in the console on game pages.
- A few games need slight scrolling on 360 × 640 phones and in landscape.
- Not testable here: real phones (iOS Safari, Android long-press), real on-screen keyboards, the real install prompt, sound.

## Screenshots

`screenshots/` holds the tester's shots of the home page and every game on desktop (`d_`) and phone (`m_`), taken during its regression pass, plus `fullscreen-after-fix.png`.
