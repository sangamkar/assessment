// Selectively restored pipe rules from PR #16; no legacy UI or state dependencies.
import { createRng } from "../../../engine/rng";
export const DIRECTIONS = ["up", "right", "down", "left"];
export function rotateMask(mask: number, turns: number) {
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++)
    mask = ((mask << 1) & 15) | (mask >> 3);
  return mask;
}
const step = (cell: number, dir: number, size: number) => {
  const r = Math.floor(cell / size),
    c = cell % size;
  return dir === 0
    ? r
      ? cell - size
      : -1
    : dir === 1
      ? c < size - 1
        ? cell + 1
        : -1
      : dir === 2
        ? r < size - 1
          ? cell + size
          : -1
        : c
          ? cell - 1
          : -1;
};
export function pipePuzzle(level: 1 | 2 | 3, seed: number) {
  const rng = createRng(seed),
    size = level + 2,
    path = [0];
  let n = 0;
  while (n !== size * size - 1) {
    const r = Math.floor(n / size),
      c = n % size;
    n += r === size - 1 ? 1 : c === size - 1 ? size : rng.pick([1, size]);
    path.push(n);
  }
  const solved = Array.from({ length: size * size }, () =>
    rng.pick([3, 6, 12, 9, 5, 10]),
  );
  for (let i = 0; i < path.length; i++) {
    let mask = 0;
    for (const adjacent of [path[i - 1], path[i + 1]])
      if (adjacent !== undefined) {
        const dir = [-size, 1, size, -1].indexOf(adjacent - path[i]);
        mask |= 1 << dir;
      }
    solved[path[i]] = mask;
  }
  const initial = solved.map((m, i) =>
    i === 0 || i === size * size - 1 ? m : rotateMask(m, rng.int(0, 3)),
  );
  // Every generated board starts needing at least one turn.
  if (traceWater(size, initial).ok) {
    const cell = path[1];
    initial[cell] = rotateMask(initial[cell], 1);
  }
  return { size, path, solved, initial };
}
export function traceWater(size: number, masks: number[]) {
  const reached: number[] = [];
  let cell = 0,
    previous = -1;
  while (cell >= 0 && !reached.includes(cell)) {
    reached.push(cell);
    const mask = masks[cell] ?? 0;
    const exits = Array.from({ length: 4 }, (_, d) => d).filter(
      (d) => mask & (1 << d),
    );
    for (const d of exits) {
      const next = step(cell, d, size);
      if (next < 0 || !((masks[next] ?? 0) & (1 << (d + 2) % 4)))
        return { ok: false, reached, blocked: cell };
    }
    if (cell === size * size - 1) return { ok: true, reached, blocked: null };
    const next = exits
      .map((d) => step(cell, d, size))
      .find((n) => n !== previous);
    if (next === undefined) return { ok: false, reached, blocked: cell };
    previous = cell;
    cell = next;
  }
  return { ok: false, reached, blocked: cell };
}

/** Reveal one repair along a guaranteed route, never the whole solution. */
export function pipeHint(
  puzzle: ReturnType<typeof pipePuzzle>,
  masks: number[],
) {
  const cell = puzzle.path.find(
    (i) =>
      i !== 0 &&
      i !== puzzle.size * puzzle.size - 1 &&
      masks[i] !== puzzle.solved[i],
  );
  if (cell === undefined) return null;
  const turns = [1, 2, 3].find(
    (n) => rotateMask(masks[cell], n) === puzzle.solved[cell],
  )!;
  return {
    cell,
    turns,
    row: Math.floor(cell / puzzle.size) + 1,
    column: (cell % puzzle.size) + 1,
  };
}
