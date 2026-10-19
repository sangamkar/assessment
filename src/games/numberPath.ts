import type { Rng } from '../content/types';

/**
 * Number Path (a Zip-style puzzle): draw one path through every cell of an
 * n×n grid, moving up/down/left/right, passing the numbered cells in order.
 */
export interface Cell {
  r: number;
  c: number;
}
export interface PathPuzzle {
  size: number;
  /** A known solution (others may exist — any valid path wins). */
  solution: Cell[];
  /** cell key → number shown on it */
  numbers: Map<string, number>;
}

export const key = (p: Cell) => `${p.r},${p.c}`;
export const adjacent = (a: Cell, b: Cell) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

/** Random Hamiltonian path by DFS with Warnsdorff ordering (fewest onward moves first). */
function hamiltonian(size: number, rng: Rng): Cell[] {
  const total = size * size;
  const neighbours = (p: Cell) =>
    [
      { r: p.r - 1, c: p.c },
      { r: p.r + 1, c: p.c },
      { r: p.r, c: p.c - 1 },
      { r: p.r, c: p.c + 1 },
    ].filter((q) => q.r >= 0 && q.c >= 0 && q.r < size && q.c < size);

  for (let attempt = 0; attempt < 50; attempt++) {
    const start = { r: rng.int(0, size - 1), c: rng.int(0, size - 1) };
    const seen = new Set([key(start)]);
    const path = [start];
    let steps = 0;
    const dfs = (): boolean => {
      if (path.length === total) return true;
      if (++steps > 20000) return false;
      const here = path[path.length - 1];
      const options = rng
        .shuffle(neighbours(here).filter((q) => !seen.has(key(q))))
        .sort((a, b) => neighbours(a).filter((q) => !seen.has(key(q))).length - neighbours(b).filter((q) => !seen.has(key(q))).length);
      for (const q of options) {
        seen.add(key(q));
        path.push(q);
        if (dfs()) return true;
        path.pop();
        seen.delete(key(q));
      }
      return false;
    };
    if (dfs()) return path;
  }
  // Fallback: snake path always exists.
  return Array.from({ length: total }, (_, i) => {
    const r = Math.floor(i / size);
    return { r, c: r % 2 === 0 ? i % size : size - 1 - (i % size) };
  });
}

export const LEVELS: Record<1 | 2 | 3, { size: number; numbers: number }> = {
  1: { size: 3, numbers: 3 },
  2: { size: 4, numbers: 4 },
  3: { size: 5, numbers: 6 },
};

export function makePuzzle(level: 1 | 2 | 3, rng: Rng): PathPuzzle {
  const { size, numbers: count } = LEVELS[level];
  const solution = hamiltonian(size, rng);
  const last = solution.length - 1;
  // Spread the numbers along the path: first, last, and evenly spaced (lightly jittered) between.
  const idx = new Set([0, last]);
  for (let k = 1; k < count - 1; k++) {
    const base = Math.round((k * last) / (count - 1));
    idx.add(Math.min(last - 1, Math.max(1, base + rng.int(-1, 1))));
  }
  const sorted = [...idx].sort((a, b) => a - b);
  const numbers = new Map(sorted.map((i, n) => [key(solution[i]), n + 1]));
  return { size, solution, numbers };
}

/** Can the path be extended onto `next`? Enforces adjacency, no revisits and number order. */
export function canStep(p: PathPuzzle, path: Cell[], next: Cell): boolean {
  if (!path.length) return p.numbers.get(key(next)) === 1;
  if (!adjacent(path[path.length - 1], next)) return false;
  if (path.some((q) => q.r === next.r && q.c === next.c)) return false;
  const n = p.numbers.get(key(next));
  if (n === undefined) return true;
  const reached = path.filter((q) => p.numbers.has(key(q))).length;
  if (n !== reached + 1) return false;
  // The last number must be the very last cell, after every other square.
  return n < p.numbers.size || path.length === p.size * p.size - 1;
}

export function isSolved(p: PathPuzzle, path: Cell[]): boolean {
  const max = p.numbers.size;
  return path.length === p.size * p.size && p.numbers.get(key(path[path.length - 1])) === max;
}

/** Hint: keep the part of the path that matches the known solution, then add its next cell. */
export function hintPath(p: PathPuzzle, path: Cell[]): Cell[] {
  let same = 0;
  while (same < path.length && key(path[same]) === key(p.solution[same])) same++;
  return p.solution.slice(0, Math.min(same + 1, p.solution.length));
}
