export const SIZE = 4;

export type Direction = "left" | "right" | "up" | "down";

export type Tile = {
  id: number;
  value: number;
  r: number;
  c: number;
  /** just spawned */
  isNew?: boolean;
  /** just doubled by a merge */
  merged?: boolean;
  /** absorbed by a merge; kept briefly so it can slide into place */
  dying?: boolean;
};

export type Board = { tiles: Tile[]; score: number; won: boolean; over: boolean };

let nextId = 1;

function spawn(tiles: Tile[]): Tile | null {
  const taken = new Set(tiles.filter((t) => !t.dying).map((t) => t.r * SIZE + t.c));
  const free: number[] = [];
  for (let i = 0; i < SIZE * SIZE; i++) if (!taken.has(i)) free.push(i);
  if (free.length === 0) return null;
  const cell = free[Math.floor(Math.random() * free.length)];
  return {
    id: nextId++,
    value: Math.random() < 0.9 ? 2 : 4,
    r: Math.floor(cell / SIZE),
    c: cell % SIZE,
    isNew: true,
  };
}

export function newBoard(): Board {
  const tiles: Tile[] = [];
  tiles.push(spawn(tiles)!);
  tiles.push(spawn(tiles)!);
  return { tiles, score: 0, won: false, over: false };
}

function hasMoves(tiles: Tile[]): boolean {
  const live = tiles.filter((t) => !t.dying);
  if (live.length < SIZE * SIZE) return true;
  const grid: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (const t of live) grid[t.r][t.c] = t.value;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

/** Returns the board after sliding in `dir`, or null if nothing can move that way. */
export function slide(board: Board, dir: Direction): (Board & { gained: number }) | null {
  const horizontal = dir === "left" || dir === "right";
  const reverse = dir === "right" || dir === "down";
  const live = board.tiles.filter((t) => !t.dying).map((t) => ({ ...t, isNew: false, merged: false }));
  const result: Tile[] = [];
  let moved = false;
  let gained = 0;

  for (let line = 0; line < SIZE; line++) {
    // Tiles on this row/column, nearest the wall they are sliding toward first.
    const tiles = live
      .filter((t) => (horizontal ? t.r : t.c) === line)
      .sort((a, b) => (horizontal ? a.c - b.c : a.r - b.r) * (reverse ? -1 : 1));

    let slot = 0;
    let prev: Tile | null = null;
    for (const t of tiles) {
      const from = horizontal ? t.c : t.r;
      let index: number;
      if (prev && prev.value === t.value && !prev.merged) {
        prev.value *= 2;
        prev.merged = true;
        gained += prev.value;
        t.dying = true;
        index = slot - 1;
        prev = null;
      } else {
        index = slot++;
        prev = t;
      }
      const to = reverse ? SIZE - 1 - index : index;
      if (to !== from || t.dying) moved = true;
      if (horizontal) t.c = to;
      else t.r = to;
      result.push(t);
    }
  }

  if (!moved) return null;

  const fresh = spawn(result);
  if (fresh) result.push(fresh);

  return {
    tiles: result,
    score: board.score + gained,
    won: board.won || result.some((t) => !t.dying && t.value >= 2048),
    over: !hasMoves(result),
    gained,
  };
}
