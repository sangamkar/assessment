import { createRng } from "../engine/rng";
import { VOCABULARY, CONNECTIONS } from "./brainContent";
import { WORKSHOP_IDS, isWorkshop } from "./workshop";
export const NEW_GAME_IDS = [
  ...WORKSHOP_IDS,
  "word-detective",
  "target-number",
  "connections-junior",
  "balance-lab",
  "robot-delivery",
] as const;
export type NewGameId = (typeof NEW_GAME_IDS)[number];
export const isNewGame = (id: string): id is NewGameId =>
  NEW_GAME_IDS.includes(id as NewGameId);
export type Level = 1 | 2 | 3;
export const LAB_ROUNDS = 4;
export interface NumberTile {
  id: string;
  value: number;
  expression: string;
}
export interface Board {
  work?: number[];
  selection: number[];
  cards: NumberTile[];
  history: NumberTile[][];
  operator: "+" | "-";
  answer: number | null;
  groups: number[][];
  position: number;
  collected: number[];
  hints: number;
  misses: number;
  status: "playing" | "solved" | "skipped";
  feedback: string;
}
export interface BrainRun {
  seed: number;
  level: Level;
  round: number;
  clean: number;
  assisted: number;
  skipped: number;
  board: Board;
}
export type BrainRuns = Partial<Record<NewGameId, BrainRun>>;
export function targetPuzzle(level: Level, seed: number) {
  const rng = createRng(seed);
  const count = level + 1;
  const values = Array.from({ length: count }, () =>
    rng.int(1, level === 1 ? 9 : level === 2 ? 15 : 25),
  );
  let target = values[0];
  const ops: ("+" | "-")[] = [];
  for (const n of values.slice(1)) {
    const op = level > 1 && target >= n && rng.next() < 0.5 ? "-" : "+";
    ops.push(op);
    target = op === "+" ? target + n : target - n;
  }
  return { values, target, ops };
}
export function balancePuzzle(level: Level, seed: number) {
  const rng = createRng(seed),
    answer = rng.int(1, level === 1 ? 9 : level === 2 ? 20 : 40),
    a = rng.int(1, level === 1 ? 9 : level === 2 ? 15 : 30),
    total = a + answer;
  const b =
      level === 1
        ? total
        : level === 2
          ? rng.int(1, total - 1)
          : total + rng.int(1, 20),
    c = level === 1 ? 0 : level === 2 ? total - b : b - total;
  const values = new Set([answer]);
  while (values.size < 6) values.add(rng.int(0, Math.max(10, answer + 8)));
  return {
    a,
    b,
    c,
    answer,
    operator: level === 3 ? "-" : "+",
    total,
    choices: [...values].sort((x, y) => x - y),
  };
}
export function wordPuzzle(level: Level, seed: number, round: number) {
  const rng = createRng(seed);
  const deck = rng.shuffle(VOCABULARY[level]);
  const word = deck[round % 2];
  return {
    word,
    context: round >= 2,
    choices: createRng(seed + round * 17).shuffle([
      word,
      ...deck.filter((w) => w !== word).slice(0, 3),
    ]),
  };
}
export function connectionPuzzle(level: Level, seed: number, round: number) {
  const set = createRng(seed).shuffle(CONNECTIONS[level])[
    round % CONNECTIONS[level].length
  ];
  const tiles = createRng(seed + round + 41).shuffle(
    set.groups.flatMap((g, group) => g.words.map((word) => ({ word, group }))),
  );
  return { set, tiles };
}
export function robotPuzzle(level: Level, seed: number) {
  const size = level === 3 ? 5 : 4;
  const rng = createRng(seed);
  const start = 0;
  const stations =
    level === 1
      ? [size * size - 1]
      : level === 2
        ? [size - 1, size * size - 1]
        : [size * (size - 1), size * size - 1];
  const cells = rng.shuffle(
    Array.from({ length: size * size }, (_, i) => i).filter(
      (i) => i !== start && !stations.includes(i),
    ),
  );
  const parcels = cells
    .slice(0, 7)
    .map((cell, i) => ({
      cell,
      color: i < 4 ? ("blue" as const) : ("red" as const),
    }));
  const blue = level === 3 ? 3 : level === 2 ? 2 : 1,
    red = 1;
  const goal = stations[level === 2 ? 1 : 0];
  const instruction =
    level === 1
      ? "Collect 1 blue parcel and 1 red parcel. Deliver them to the station."
      : level === 2
        ? "Collect twice as many blue parcels as red: 2 blue and 1 red. Deliver to the station farther from START."
        : "Collect exactly 1 red parcel and two more blue parcels than red. Deliver to the station nearer to START.";
  return { size, start, stations, parcels, blue, red, goal, instruction };
}
export const puzzleSeed = (r: BrainRun) => r.seed + r.round * 1009;
export function freshBoard(id: NewGameId, level: Level, seed: number): Board {
  const cards =
    id === "target-number"
      ? targetPuzzle(level, seed).values.map((value, i) => ({
          id: `n${i}`,
          value,
          expression: String(value),
        }))
      : [];
  return {
    selection: [],
    cards,
    history: [],
    operator: "+",
    answer: null,
    groups: [],
    position: 0,
    collected: [],
    hints: 0,
    misses: 0,
    status: "playing",
    feedback: "",
  };
}
export const newBrainRun = (
  id: NewGameId,
  level: Level,
  seed = Date.now(),
): BrainRun => ({
  seed,
  level,
  round: 0,
  clean: 0,
  assisted: 0,
  skipped: 0,
  board: freshBoard(id, level, seed),
});
export function nextBrainRound(id: NewGameId, r: BrainRun): BrainRun {
  if (r.board.status === "playing" || r.round >= LAB_ROUNDS) return r;
  const round = r.round + 1;
  return { ...r, round, board: freshBoard(id, r.level, r.seed + round * 1009) };
}
export function finishBrainRound(
  r: BrainRun,
  solved: boolean,
  feedback: string,
): BrainRun {
  if (r.board.status !== "playing") return r;
  const clean = solved && r.board.hints === 0 && r.board.misses === 0;
  return {
    ...r,
    clean: r.clean + (clean ? 1 : 0),
    assisted: r.assisted + (solved && !clean ? 1 : 0),
    skipped: r.skipped + (!solved ? 1 : 0),
    board: { ...r.board, status: solved ? "solved" : "skipped", feedback },
  };
}
export function combineTiles(r: BrainRun): BrainRun {
  const b = r.board;
  if (b.status !== "playing" || b.selection.length !== 2) return r;
  const [i, j] = b.selection;
  if (i === j || !b.cards[i] || !b.cards[j]) return r;
  const a = b.cards[i],
    c = b.cards[j];
  const value = b.operator === "+" ? a.value + c.value : a.value - c.value;
  return {
    ...r,
    board: {
      ...b,
      selection: [],
      history: [...b.history, b.cards].slice(-8),
      cards: [
        ...b.cards.filter((_, k) => k !== i && k !== j),
        {
          id: `(${a.id}${b.operator}${c.id})`,
          value,
          expression: `(${a.expression} ${b.operator} ${c.expression})`,
        },
      ],
      feedback: "",
    },
  };
}
export function matchingGroup(
  indices: number[],
  level: Level,
  seed: number,
  round: number,
): number | null {
  const { tiles } = connectionPuzzle(level, seed, round);
  if (
    indices.length !== 4 ||
    new Set(indices).size !== 4 ||
    indices.some((i) => !tiles[i])
  )
    return null;
  const g = tiles[indices[0]].group;
  return indices.every((i) => tiles[i].group === g) ? g : null;
}
export function moveRobot(
  r: BrainRun,
  direction: "up" | "down" | "left" | "right",
): BrainRun {
  const p = robotPuzzle(r.level, puzzleSeed(r)),
    n = r.board.position,
    x = n % p.size,
    y = Math.floor(n / p.size);
  const target =
    direction === "up"
      ? y > 0
        ? n - p.size
        : n
      : direction === "down"
        ? y < p.size - 1
          ? n + p.size
          : n
        : direction === "left"
          ? x > 0
            ? n - 1
            : n
          : x < p.size - 1
            ? n + 1
            : n;
  return { ...r, board: { ...r.board, position: target, feedback: "" } };
}
export function robotDelivery(r: BrainRun) {
  const p = robotPuzzle(r.level, puzzleSeed(r));
  const bag = p.parcels.filter((x) => r.board.collected.includes(x.cell));
  const blue = bag.filter((x) => x.color === "blue").length,
    red = bag.filter((x) => x.color === "red").length;
  const ok = blue === p.blue && red === p.red && r.board.position === p.goal;
  return {
    ok,
    blue,
    red,
    message: ok
      ? "Delivered! Your counts and your destination match the instructions."
      : blue !== p.blue || red !== p.red
        ? `You need ${p.blue} blue and ${p.red} red. You have ${blue} blue and ${red} red. You can return a parcel and try again.`
        : "Your parcel counts fit. Check which station the instruction asks for.",
  };
}
/** Only accept internally consistent resumable runs. Invalid new-game data never erases old progress. */
export function normalizeBrainRuns(value: unknown): BrainRuns {
  const out: BrainRuns = {};
  if (!value || typeof value !== "object") return out;
  const all = value as BrainRuns;
  const integer = (n: unknown, min: number, max: number): n is number =>
    Number.isSafeInteger(n) && Number(n) >= min && Number(n) <= max;
  for (const id of NEW_GAME_IDS) {
    const r = all[id];
    if (
      !r ||
      typeof r !== "object" ||
      !integer(r.seed, 0, Number.MAX_SAFE_INTEGER) ||
      ![1, 2, 3].includes(r.level) ||
      !integer(r.round, 0, 4) ||
      !integer(r.clean, 0, 4) ||
      !integer(r.assisted, 0, 4) ||
      !integer(r.skipped, 0, 4)
    )
      continue;
    const b = r.board;
    if (isWorkshop(id) && b?.work !== undefined) {
      const w = b.work;
      const maxLength = id === 'shape-builder' ? 17 : id === 'water-pipes' ? (r.level + 2) ** 2 : id === 'pattern-machine' ? 2 : 1;
      const maxValue = id === 'shape-builder' ? 5 : id === 'water-pipes' ? 15 : id === 'clock-quest' ? 719 : 3;
      if (!Array.isArray(w) || w.length > maxLength || !w.every(n => integer(n, 0, maxValue))) continue;
    }
    if (b?.work !== undefined && (!Array.isArray(b.work) || b.work.length > 25 || !b.work.every(n => integer(n, 0, 720)))) continue;
    if (
      !b ||
      typeof b !== "object" ||
      !["playing", "solved", "skipped"].includes(b.status) ||
      !integer(b.hints, 0, 1000) ||
      !integer(b.misses, 0, 1000) ||
      !Array.isArray(b.selection) ||
      !Array.isArray(b.cards) ||
      !Array.isArray(b.history) ||
      !Array.isArray(b.groups) ||
      !Array.isArray(b.collected)
    )
      continue;
    if (
      r.clean + r.assisted + r.skipped !==
      r.round + (r.round < 4 && b.status !== "playing" ? 1 : 0)
    )
      continue;
    const card = (c: NumberTile) =>
      c &&
      typeof c.id === "string" &&
      c.id.length <= 250 &&
      integer(c.value, -1000, 1000) &&
      typeof c.expression === "string" &&
      c.expression.length < 250 &&
      /^[\d ()+\-]+$/.test(c.expression);
    if (
      b.cards.length > 4 ||
      !b.cards.every(card) ||
      b.history.length > 8 ||
      !b.history.every(
        (row) => Array.isArray(row) && row.length <= 4 && row.every(card),
      ) ||
      !b.selection.every((n) => integer(n, 0, 7)) ||
      b.selection.length > 4 ||
      new Set(b.selection).size !== b.selection.length ||
      !["+", "-"].includes(b.operator) ||
      !(b.answer === null || integer(b.answer, 0, 100)) ||
      !integer(b.position, 0, (r.level === 3 ? 25 : 16) - 1) ||
      !b.collected.every((n) => integer(n, 0, 24)) ||
      new Set(b.collected).size !== b.collected.length ||
      b.groups.length > 2 ||
      !b.groups.every(
        (g) =>
          Array.isArray(g) &&
          g.length === 4 &&
          g.every((n) => integer(n, 0, 7)),
      )
    )
      continue;
    out[id] = {
      ...r,
      board: {
        ...b,
        feedback:
          typeof b.feedback === "string" ? b.feedback.slice(0, 1000) : "",
      },
    };
  }
  return out;
}

/** Completion conditions shared by live interaction and restored saved boards. */
export function brainCompletion(id: NewGameId, run: BrainRun): string | null {
  if (run.round >= LAB_ROUNDS || run.board.status !== 'playing') return null;
  const board = run.board;
  if (id === 'target-number' && board.cards.length === 1) {
    const target = targetPuzzle(run.level, puzzleSeed(run)).target;
    return board.cards[0].value === target
      ? `You made ${target}! ${board.cards[0].expression} equals ${target}.` : null;
  }
  if (id === 'balance-lab') {
    const puzzle = balancePuzzle(run.level, puzzleSeed(run));
    return board.answer === puzzle.answer ? `${puzzle.a} + ${puzzle.answer} = ${puzzle.total}. Both sides balance.` : null;
  }
  if (id === 'connections-junior' && board.groups.length === 2) {
    const groups = board.groups.map(indices => matchingGroup(indices,run.level,run.seed,run.round));
    if (groups[0] === null || groups[1] === null || groups[0] === groups[1]) return null;
    return connectionPuzzle(run.level,run.seed,run.round).set.explanation;
  }
  if (id === 'robot-delivery') {
    const delivery = robotDelivery(run);
    return delivery.ok ? delivery.message : null;
  }
  return null;
}
