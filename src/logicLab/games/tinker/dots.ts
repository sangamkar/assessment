import { PuzzleModule } from "./base";
export type Player = 1 | 2;
export interface DotsLevel {
  size: 2 | 3 | 4 | 5;
  mode: "friend" | "computer";
  difficulty: "gentle" | "thinking";
}
export interface Edge {
  id: string;
  row: number;
  col: number;
  vertical: boolean;
}
export interface DotsState {
  level: DotsLevel;
  edges: Record<string, Player>;
  boxes: Record<string, Player>;
  turn: Player;
  complete: boolean;
  score: [number, number];
}
export function edgesFor(size: number): Edge[] {
  const list: Edge[] = [];
  for (let r = 0; r <= size; r++)
    for (let c = 0; c < size; c++)
      list.push({ id: `h-${r}-${c}`, row: r, col: c, vertical: false });
  for (let r = 0; r < size; r++)
    for (let c = 0; c <= size; c++)
      list.push({ id: `v-${r}-${c}`, row: r, col: c, vertical: true });
  return list;
}
export function boxEdges(row: number, col: number) {
  return [
    `h-${row}-${col}`,
    `h-${row + 1}-${col}`,
    `v-${row}-${col}`,
    `v-${row}-${col + 1}`,
  ];
}
export function drawLine(state: DotsState, id: string): DotsState {
  if (
    state.complete ||
    state.edges[id] ||
    !edgesFor(state.level.size).some((e) => e.id === id)
  )
    return state;
  const edges = { ...state.edges, [id]: state.turn },
    boxes = { ...state.boxes };
  let gained = 0;
  for (let r = 0; r < state.level.size; r++)
    for (let c = 0; c < state.level.size; c++) {
      const key = `${r}-${c}`;
      if (!boxes[key] && boxEdges(r, c).every((e) => edges[e])) {
        boxes[key] = state.turn;
        gained++;
      }
    }
  const score: [number, number] = [
    Object.values(boxes).filter((p) => p === 1).length,
    Object.values(boxes).filter((p) => p === 2).length,
  ];
  return {
    ...state,
    edges,
    boxes,
    score,
    turn: gained ? state.turn : state.turn === 1 ? 2 : 1,
    complete: score[0] + score[1] === state.level.size ** 2,
  };
}
/** Take boxes, then avoid giving away a third side. Gentle mode simply explores legal lines. */
export function computerMove(
  state: DotsState,
  random: () => number = Math.random,
): string | null {
  const free = edgesFor(state.level.size).filter((e) => !state.edges[e.id]);
  if (state.complete || !free.length) return null;
  const scoring = free.filter(
    (e) =>
      Object.keys(drawLine(state, e.id).boxes).length >
      Object.keys(state.boxes).length,
  );
  const safe = free.filter((e) => {
    const next = drawLine(state, e.id);
    for (let r = 0; r < state.level.size; r++)
      for (let c = 0; c < state.level.size; c++)
        if (boxEdges(r, c).filter((id) => next.edges[id]).length === 3)
          return false;
    return true;
  });
  const candidates =
    state.level.difficulty === "gentle"
      ? free
      : scoring.length
        ? scoring
        : safe.length
          ? safe
          : free;
  return candidates[
    Math.min(
      candidates.length - 1,
      Math.max(0, Math.floor(random() * candidates.length)),
    )
  ].id;
}
export class DotsAndBoxes extends PuzzleModule<DotsState> {
  private state!: DotsState;
  private level!: DotsLevel;
  moves: string[] = [];
  loadLevel(data: unknown) {
    const d = data as DotsLevel;
    if (
      !d ||
      ![2, 3, 4, 5].includes(d.size) ||
      !["friend", "computer"].includes(d.mode) ||
      !["gentle", "thinking"].includes(d.difficulty)
    )
      throw Error("Choose a board and opponent.");
    this.level = { size: d.size, mode: d.mode, difficulty: d.difficulty };
    this.reset();
  }
  reset() {
    this.moves = [];
    this.state = {
      level: { ...this.level },
      edges: {},
      boxes: {},
      turn: 1,
      score: [0, 0],
      complete: false,
    };
    this.hints = 0;
    this.announced = false;
    this.emit();
  }
  getState() {
    return structuredClone(this.state);
  }
  play(id: string) {
    const next = drawLine(this.state, id);
    if (next === this.state) return false;
    this.moves.push(id);
    this.state = next;
    this.emit(next.complete);
    return true;
  }
  undo() {
    if (!this.moves.length) return;
    const moves = this.moves.slice(0, -1);
    this.state = {
      level: { ...this.level },
      edges: {},
      boxes: {},
      turn: 1,
      score: [0, 0],
      complete: false,
    };
    this.moves = moves;
    for (const id of moves) this.state = drawLine(this.state, id);
    this.emit();
  }
  /** In computer mode undo to the last human decision, including extra computer turns. */
  undoTurn() {
    if (!this.moves.length) return;
    do {
      this.undo();
    } while (
      this.level.mode === "computer" &&
      this.moves.length &&
      this.state.turn === 2
    );
  }
  getHint(tier: 1 | 2) {
    const move = computerMove(
      { ...this.state, level: { ...this.level, difficulty: "thinking" } },
      () => 0,
    );
    if (!move) return null;
    this.hints++;
    return { pieceId: move, ...(tier === 2 ? { pegId: move } : {}) };
  }
}

/** Only neighboring dots may be joined; diagonal and multi-cell strokes are ignored. */
export function edgeBetween(size: number, a: number, b: number): string | null {
  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    a < 0 ||
    b < 0 ||
    a >= (size + 1) ** 2 ||
    b >= (size + 1) ** 2
  )
    return null;
  const ar = Math.floor(a / (size + 1)),
    ac = a % (size + 1),
    br = Math.floor(b / (size + 1)),
    bc = b % (size + 1);
  if (ar === br && Math.abs(ac - bc) === 1)
    return `h-${ar}-${Math.min(ac, bc)}`;
  if (ac === bc && Math.abs(ar - br) === 1)
    return `v-${Math.min(ar, br)}-${ac}`;
  return null;
}
