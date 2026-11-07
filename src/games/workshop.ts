import { createRng } from "../engine/rng";
import type { Level } from "./brain";
export const WORKSHOP_IDS = [
  "shape-builder",
  "clock-quest",
  "pattern-machine",
  "sound-switch",
  "water-pipes",
] as const;
export type WorkshopId = (typeof WORKSHOP_IDS)[number];
export const isWorkshop = (id: string): id is WorkshopId =>
  WORKSHOP_IDS.includes(id as WorkshopId);
export const WORKSHOP_TITLES: Record<WorkshopId, string> = {
  "shape-builder": "Shape Builder",
  "clock-quest": "Clock Quest",
  "pattern-machine": "Pattern Machine",
  "sound-switch": "Sound Switch",
  "water-pipes": "Water Rescue",
};
// Shape codes: empty, four quarter-turns of a right triangle, square.
const MOSAICS = [
  { name: "rocket", cells: [0, 1, 2, 0, 0, 5, 5, 0, 1, 5, 5, 2, 0, 4, 3, 0] },
  { name: "house", cells: [0, 1, 2, 0, 1, 5, 5, 2, 0, 5, 5, 0, 0, 5, 5, 0] },
  { name: "boat", cells: [0, 1, 0, 0, 0, 5, 2, 0, 4, 5, 5, 3, 0, 4, 3, 0] },
  {
    name: "butterfly",
    cells: [1, 0, 0, 2, 5, 2, 1, 5, 5, 3, 4, 5, 4, 0, 0, 3],
  },
];
export function shapePuzzle(level: Level, seed: number) {
  const rng = createRng(seed),
    p = rng.pick(MOSAICS);
  const mirror = rng.int(0, 1) === 1;
  const flip = [0, 2, 1, 4, 3, 5];
  const cells = mirror
    ? p.cells.map((_, i) => flip[p.cells[Math.floor(i / 4) * 4 + 3 - (i % 4)]])
    : [...p.cells];
  return { ...p, cells, guide: level < 3 };
}
export function clockPuzzle(level: Level, seed: number) {
  const rng = createRng(seed),
    hour = rng.int(1, 12),
    minute =
      level === 1
        ? 0
        : level === 2
          ? rng.pick([0, 30])
          : rng.pick([0, 15, 30, 45]);
  return {
    hour,
    minute,
    total: (hour % 12) * 60 + minute,
    label: `${hour}:${String(minute).padStart(2, "0")}`,
  };
}
export const PATTERN_TILES = ["●", "▲", "■", "★"];
export function patternPuzzle(level: Level, seed: number) {
  const rng = createRng(seed),
    symbols = rng.shuffle([0, 1, 2, 3]);
  const rule =
    level === 1
      ? [0, 1]
      : level === 2
        ? rng.pick([
            [0, 0, 1],
            [0, 1, 1],
          ])
        : rng.pick([
            [0, 1, 2],
            [0, 1, 0, 2],
          ]);
  const unit = rule.map((i) => symbols[i]);
  const sequence = Array.from(
    { length: unit.length * 3 },
    (_, i) => unit[i % unit.length],
  );
  return {
    unit,
    shown: sequence.slice(0, -2),
    answer: sequence.slice(-2),
    explanation: `The repeating unit is ${unit.map((i) => PATTERN_TILES[i]).join(" ")}.`,
  };
}
// Each reference supplies the replacement SOUND in the same position. No synthetic isolated phonemes.
const SOUND_PAIRS = [
  [
    { from: "cat", to: "sat", at: 0, reference: "sun" },
    { from: "map", to: "tap", at: 0, reference: "top" },
    { from: "pig", to: "dig", at: 0, reference: "dog" },
    { from: "hen", to: "pen", at: 0, reference: "pot" },
    { from: "fan", to: "man", at: 0, reference: "mat" },
    { from: "log", to: "dog", at: 0, reference: "dig" },
  ],
  [
    { from: "cat", to: "cap", at: 2, reference: "cup" },
    { from: "map", to: "mat", at: 2, reference: "hat" },
    { from: "pig", to: "pin", at: 2, reference: "sun" },
    { from: "hen", to: "hem", at: 2, reference: "jam" },
    { from: "bag", to: "bat", at: 2, reference: "net" },
    { from: "bed", to: "beg", at: 2, reference: "dog" },
  ],
  [
    { from: "cat", to: "cot", at: 1, reference: "pot" },
    { from: "pin", to: "pan", at: 1, reference: "cat" },
    { from: "bag", to: "big", at: 1, reference: "pig" },
    { from: "pet", to: "pot", at: 1, reference: "cot" },
    { from: "bug", to: "bag", at: 1, reference: "hat" },
    { from: "pen", to: "pin", at: 1, reference: "sit" },
  ],
];
export function soundPuzzle(level: Level, seed: number) {
  const rng = createRng(seed),
    p = rng.pick(SOUND_PAIRS[level - 1]);
  const answer = p.to[p.at];
  return {
    ...p,
    answer,
    position: ["first", "middle", "last"][p.at],
    choices: rng.shuffle([
      answer,
      ...rng
        .shuffle(
          (p.at === 1 ? "aeiou" : "smtpdn")
            .split("")
            .filter((x) => x !== answer),
        )
        .slice(0, 3),
    ]),
  };
}
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
export function pipePuzzle(level: Level, seed: number) {
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
      if (next < 0 || !((masks[next] ?? 0) & (1 << ((d + 2) % 4))))
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
export function pipeHint(puzzle: ReturnType<typeof pipePuzzle>, masks: number[]) {
  const cell = puzzle.path.find(i => i !== 0 && i !== puzzle.size * puzzle.size - 1 && masks[i] !== puzzle.solved[i]);
  if (cell === undefined) return null;
  const turns = [1, 2, 3].find(n => rotateMask(masks[cell], n) === puzzle.solved[cell])!;
  return { cell, turns, row: Math.floor(cell / puzzle.size) + 1, column: cell % puzzle.size + 1 };
}
