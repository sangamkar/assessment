/** A toy airport planning puzzle; routes are orthogonal and flights run separately. */
export const SIZE = 6;
export const EXIT = 12;
export type Tool = "taxi" | "runway" | "gate-a" | "gate-b" | "erase";
export interface Layout {
  runway: number[];
  taxi: number[];
  gates: (number | null)[];
}
export interface Challenge {
  id: string;
  title: string;
  goal: string;
  runwayLength: number;
  gates: number;
  rocks: number[];
  taxiLimit: number;
  hints: string[];
}
export const CHALLENGES: Challenge[] = [
  {
    id: "first-flight",
    title: "First flight",
    goal: "Build a path from the runway exit to Gate A. Then send the little plane.",
    runwayLength: 2,
    gates: 1,
    rocks: [],
    taxiLimit: 12,
    hints: [
      "The plane leaves the striped runway at the arrow on row 3.",
      "Put Gate A beside the terminal, in the rightmost building zone.",
      "A straight path across row 3 is one solution. There are others!",
    ],
  },
  {
    id: "bigger-plane",
    title: "A bigger plane",
    goal: "Make room for a bigger plane. It needs 3 joined runway tiles and a path to Gate A.",
    runwayLength: 3,
    gates: 1,
    rocks: [],
    taxiLimit: 12,
    hints: [
      "The striped runway is on the left. The bigger plane needs more joined tiles.",
      "Choose Extend runway, then tap a grass tile directly above or below the existing runway.",
      "Three connected runway tiles are enough. Check that the exit still has a taxi path to your gate.",
    ],
  },
  {
    id: "around-the-pond",
    title: "Around the pond",
    goal: "Keep the pond safe. Find a route around it for the bigger plane.",
    runwayLength: 3,
    gates: 1,
    rocks: [14, 20, 26],
    taxiLimit: 12,
    hints: [
      "The blue pond tiles cannot be built on. You can go around them.",
      "Try traveling up from the runway exit before you cross the airport.",
      "Row 2 has room to cross above the pond. Put your gate at the end of your path.",
    ],
  },
  {
    id: "two-gates",
    title: "Two gates, one airport",
    goal: "Help two planes reach different gates. Share a path and use at most 9 taxi tiles.",
    runwayLength: 3,
    gates: 2,
    rocks: [14, 20],
    taxiLimit: 9,
    hints: [
      "Both planes can use the same taxi path. They travel one at a time.",
      "Build one main path, then add a short branch to the other gate.",
      "Try crossing above the pond and putting your gates near that path. Count only taxi tiles, not gates.",
    ],
  },
  {
    id: "free-design",
    title: "My own airport",
    goal: "Design your own airport for two planes. The jumbo needs 4 joined runway tiles. Try a different layout!",
    runwayLength: 4,
    gates: 2,
    rocks: [],
    taxiLimit: 24,
    hints: [
      "You choose the layout. Any working route is welcome.",
      "The jumbo needs four joined runway tiles on the left.",
      "Test, move a gate or change a path, then test your new idea.",
    ],
  },
];
export const challengeById = (id: string) =>
  CHALLENGES.find((c) => c.id === id);
export const initialLayout = (): Layout => ({
  runway: [12, 18],
  taxi: [],
  gates: [null, null],
});
export const neighbors = (cell: number): number[] => {
  const x = cell % SIZE,
    y = Math.floor(cell / SIZE);
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ]
    .filter(([a, b]) => a >= 0 && a < SIZE && b >= 0 && b < SIZE)
    .map(([a, b]) => b * SIZE + a);
};
const cellOk = (x: unknown): x is number =>
  Number.isInteger(x) && Number(x) >= 0 && Number(x) < SIZE * SIZE;
export function normalizeLayout(input: unknown, challenge: Challenge): Layout {
  if (!input || typeof input !== "object") return initialLayout();
  const l = input as Partial<Layout>;
  const runway = [
    ...new Set([
      EXIT,
      ...(Array.isArray(l.runway)
        ? l.runway.filter((x) => cellOk(x) && x % SIZE === 0)
        : [18]),
    ]),
  ].sort((a, b) => a - b);
  const gates = [0, 1].map((i) => {
    const g = l.gates?.[i];
    return i < challenge.gates &&
      cellOk(g) &&
      g % SIZE === 4 &&
      !challenge.rocks.includes(g)
      ? g
      : null;
  });
  if (gates[0] !== null && gates[0] === gates[1]) gates[1] = null;
  const taxi = [
    ...new Set(
      (Array.isArray(l.taxi) ? l.taxi : []).filter(
        (x) =>
          cellOk(x) &&
          x % SIZE > 0 &&
          x % SIZE < 5 &&
          !challenge.rocks.includes(x) &&
          !gates.includes(x),
      ),
    ),
  ].sort((a, b) => a - b);
  return { runway, taxi, gates };
}
export function editLayout(
  layout: Layout,
  tool: Tool,
  cell: number,
  c: Challenge,
): Layout {
  if (
    !cellOk(cell) ||
    c.rocks.includes(cell) ||
    cell % SIZE === 5 ||
    cell === EXIT
  )
    return layout;
  const x = cell % SIZE;
  const next: Layout = {
    runway: [...layout.runway],
    taxi: [...layout.taxi],
    gates: [...layout.gates],
  };
  if (tool === "erase") {
    next.runway = next.runway.filter((n) => n !== cell);
    next.taxi = next.taxi.filter((n) => n !== cell);
    next.gates = next.gates.map((n) => (n === cell ? null : n));
  } else if (tool === "runway" && x === 0) {
    if (!next.runway.includes(cell)) next.runway.push(cell);
  } else if (tool === "taxi" && x > 0 && x < 5 && !next.gates.includes(cell)) {
    if (!next.taxi.includes(cell)) next.taxi.push(cell);
  } else if ((tool === "gate-a" || tool === "gate-b") && x === 4) {
    const i = tool === "gate-a" ? 0 : 1;
    if (i >= c.gates || next.gates[1 - i] === cell) return layout;
    next.gates[i] = cell;
    next.taxi = next.taxi.filter((n) => n !== cell);
  } else return layout;
  const cleaned = normalizeLayout(next, c);
  return JSON.stringify(cleaned) === JSON.stringify(layout) ? layout : cleaned;
}
export interface FlightResult {
  ok: boolean;
  messages: string[];
  routes: number[][];
  runwayLength: number;
}
export function testLayout(raw: Layout, c: Challenge): FlightResult {
  const l = normalizeLayout(raw, c);
  const seen = new Set([EXIT]);
  const queue = [EXIT];
  while (queue.length)
    for (const n of neighbors(queue.shift()!))
      if (l.runway.includes(n) && !seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
  const runwayLength = seen.size;
  const messages: string[] = [];
  if (runwayLength < c.runwayLength)
    messages.push(
      `The plane needs ${c.runwayLength} joined runway tiles. You have ${runwayLength} joined to the exit. Extend the striped runway.`,
    );
  if (l.taxi.length > c.taxiLimit)
    messages.push(
      `You used ${l.taxi.length} taxi tiles. Try sharing a shorter path: this challenge allows ${c.taxiLimit}.`,
    );
  const routes: number[][] = [];
  for (let i = 0; i < c.gates; i++) {
    const gate = l.gates[i],
      name = i === 0 ? "A" : "B";
    if (gate === null) {
      messages.push(`Place Gate ${name} beside the terminal on the right.`);
      continue;
    }
    const allowed = new Set([EXIT, ...l.taxi, gate]);
    const paths: number[][] = [[EXIT]];
    const visited = new Set([EXIT]);
    let found: number[] | undefined;
    while (paths.length) {
      const p = paths.shift()!;
      const last = p[p.length - 1];
      if (last === gate) {
        found = p;
        break;
      }
      for (const n of neighbors(last))
        if (allowed.has(n) && !visited.has(n)) {
          visited.add(n);
          paths.push([...p, n]);
        }
    }
    if (found) routes.push(found);
    else
      messages.push(
        `Gate ${name} has no connected path from the runway exit. The plane can turn, but cannot jump a gap or cross the pond.`,
      );
  }
  return {
    ok: messages.length === 0,
    messages: messages.length
      ? messages
      : [
          "Your airport works! Every plane can reach its gate. What else could you design?",
        ],
    routes,
    runwayLength,
  };
}
export interface TestRecord {
  revision: number;
  ts: number;
  ok: boolean;
}
export interface AirportDraft {
  layout: Layout;
  revision: number;
  edits: number;
  tests: number;
  hints: number;
  firstSolvedAt?: number;
  lastTest?: TestRecord;
  history: Layout[];
  reflection: string;
}
export interface AirportState {
  tutorialSeen?: boolean;
  selected: string;
  drafts: Record<string, AirportDraft>;
}
export const emptyAirport = (): AirportState => ({
  selected: CHALLENGES[0].id,
  drafts: {},
});
export const newDraft = (): AirportDraft => ({
  layout: initialLayout(),
  revision: 0,
  edits: 0,
  tests: 0,
  hints: 0,
  history: [],
  reflection: "",
});
export function normalizeAirport(value: unknown): AirportState {
  const out = emptyAirport();
  if (!value || typeof value !== "object") return out;
  const data = value as Partial<AirportState>;
  if (data.tutorialSeen === true) out.tutorialSeen = true;
  if (typeof data.selected === "string" && challengeById(data.selected))
    out.selected = data.selected;
  const count = (v: unknown, max = 100000) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.max(0, Math.min(max, Math.floor(v)))
      : 0;
  for (const c of CHALLENGES) {
    const d = data.drafts?.[c.id];
    if (!d || typeof d !== "object") continue;
    const clean = newDraft();
    clean.layout = normalizeLayout(d.layout, c);
    clean.revision = count(d.revision);
    clean.edits = count(d.edits);
    clean.tests = count(d.tests);
    clean.hints = count(d.hints, 3);
    clean.reflection =
      typeof d.reflection === "string" ? d.reflection.slice(0, 500) : "";
    clean.history = Array.isArray(d.history)
      ? d.history.slice(-30).map((l) => normalizeLayout(l, c))
      : [];
    if (
      typeof d.firstSolvedAt === "number" &&
      Number.isFinite(d.firstSolvedAt) &&
      d.firstSolvedAt > 0
    )
      clean.firstSolvedAt = d.firstSolvedAt;
    if (
      d.lastTest &&
      typeof d.lastTest === "object" &&
      d.lastTest.revision === clean.revision &&
      Number.isFinite(d.lastTest.ts)
    )
      clean.lastTest = {
        revision: clean.revision,
        ts: d.lastTest.ts,
        ok: testLayout(clean.layout, c).ok,
      };
    out.drafts[c.id] = clean;
  }
  return out;
}
export function changeDesign(
  d: AirportDraft,
  c: Challenge,
  tool: Tool,
  cell: number,
): AirportDraft {
  const layout = editLayout(d.layout, tool, cell, c);
  if (layout === d.layout) return d;
  return {
    ...d,
    layout,
    revision: d.revision + 1,
    edits: d.edits + 1,
    history: [...d.history, d.layout].slice(-30),
    lastTest: undefined,
  };
}
export function undoDesign(d: AirportDraft): AirportDraft {
  if (!d.history.length) return d;
  return {
    ...d,
    layout: d.history[d.history.length - 1],
    history: d.history.slice(0, -1),
    revision: d.revision + 1,
    edits: d.edits + 1,
    lastTest: undefined,
  };
}
export function testDesign(
  d: AirportDraft,
  c: Challenge,
  now = Date.now(),
): AirportDraft {
  const result = testLayout(d.layout, c);
  return {
    ...d,
    tests: d.tests + 1,
    firstSolvedAt: d.firstSolvedAt ?? (result.ok ? now : undefined),
    lastTest: { revision: d.revision, ts: now, ok: result.ok },
  };
}
