import { shuffle } from "@/lib/random";

/** A full valid grid: a base pattern with rows, columns and digits shuffled. */
function solvedGrid(): number[] {
  const groups = () => shuffle([0, 1, 2]).flatMap((g) => shuffle([0, 1, 2]).map((i) => g * 3 + i));
  const rows = groups();
  const cols = groups();
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const grid: number[] = [];
  for (const r of rows) for (const c of cols) grid.push(digits[(3 * (r % 3) + Math.floor(r / 3) + c) % 9]);
  return grid;
}

function candidates(grid: number[], cell: number): number[] {
  const r = Math.floor(cell / 9);
  const c = cell % 9;
  const used = new Set<number>();
  for (let i = 0; i < 9; i++) {
    used.add(grid[r * 9 + i]);
    used.add(grid[i * 9 + c]);
    used.add(grid[(3 * Math.floor(r / 3) + Math.floor(i / 3)) * 9 + 3 * Math.floor(c / 3) + (i % 3)]);
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !used.has(d));
}

/** Counts solutions, stopping at `limit`. Mutates and restores `grid`. */
function countSolutions(grid: number[], limit: number): number {
  let best = -1;
  let bestOptions: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== 0) continue;
    const options = candidates(grid, i);
    if (options.length === 0) return 0;
    if (best === -1 || options.length < bestOptions.length) {
      best = i;
      bestOptions = options;
      if (options.length === 1) break;
    }
  }
  if (best === -1) return 1;
  let count = 0;
  for (const d of bestOptions) {
    grid[best] = d;
    count += countSolutions(grid, limit - count);
    if (count >= limit) break;
  }
  grid[best] = 0;
  return count;
}

/** A puzzle with exactly one solution. */
export function makePuzzle(holes = 44): { puzzle: number[]; solution: number[] } {
  const solution = solvedGrid();
  const puzzle = [...solution];
  let removed = 0;
  for (const cell of shuffle(Array.from({ length: 81 }, (_, i) => i))) {
    if (removed >= holes) break;
    const keep = puzzle[cell];
    puzzle[cell] = 0;
    if (countSolutions(puzzle, 2) === 1) removed++;
    else puzzle[cell] = keep;
  }
  return { puzzle, solution };
}
