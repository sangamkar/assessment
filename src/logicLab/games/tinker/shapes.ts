import { PuzzleModule } from "./base";
import type { GameDescriptor } from "../../core/types";
// 0 empty, 1..4 quarter-turn triangles, 5 square. Original mosaics retained selectively.
const PATTERNS = [
  { name: "Little house", size: 2, cells: [1, 2, 5, 5] },
  { name: "Sailboat", size: 3, cells: [0, 1, 0, 0, 5, 2, 4, 5, 3] },
  { name: "Steps", size: 3, cells: [5, 0, 0, 5, 5, 0, 5, 5, 5] },
  {
    name: "Rocket",
    size: 4,
    cells: [0, 1, 2, 0, 0, 5, 5, 0, 1, 5, 5, 2, 0, 4, 3, 0],
  },
  {
    name: "House",
    size: 4,
    cells: [0, 1, 2, 0, 1, 5, 5, 2, 0, 5, 5, 0, 0, 5, 5, 0],
  },
  {
    name: "Butterfly",
    size: 4,
    cells: [1, 0, 0, 2, 5, 2, 1, 5, 5, 3, 4, 5, 4, 0, 0, 3],
  },
  {
    name: "Fish",
    size: 4,
    cells: [0, 1, 2, 0, 1, 5, 5, 1, 4, 5, 5, 4, 0, 4, 3, 0],
  },
  {
    name: "Boat",
    size: 4,
    cells: [0, 1, 0, 0, 0, 5, 2, 0, 4, 5, 5, 3, 0, 4, 3, 0],
  },
  {
    name: "Robot",
    size: 4,
    cells: [0, 5, 5, 0, 1, 5, 5, 2, 0, 5, 5, 0, 0, 5, 5, 0],
  },
];
export function shapeLevel(index: number) {
  const tier = Math.floor(index / 6),
    p = PATTERNS[tier === 0 ? index % 6 : 3 + (index % 6)];
  const mirror = tier === 2,
    flip = [0, 2, 1, 4, 3, 5];
  return {
    ...p,
    cells: mirror
      ? p.cells.map(
          (_, i) =>
            flip[
              p.cells[
                Math.floor(i / p.size) * p.size + p.size - 1 - (i % p.size)
              ]
            ],
        )
      : [...p.cells],
    guide: tier === 0,
  };
}
export const SHAPE_LEVELS = Array.from({ length: 18 }, (_, index) => ({
  id: `mosaic-${index + 1}`,
  title: shapeLevel(index).name,
  tier: (["Starter", "Explorer", "Master"] as const)[Math.floor(index / 6)],
  data: { index },
}));
export interface ShapeState {
  index: number;
  puzzle: ReturnType<typeof shapeLevel>;
  cells: number[];
  complete: boolean;
}
export class ShapeBuilder extends PuzzleModule<ShapeState> {
  index = 0;
  puzzle = shapeLevel(0);
  moves: { cell: number; code: number }[] = [];
  private cells: number[] = [];
  loadLevel(data: unknown) {
    const i = (data as { index?: unknown })?.index;
    if (!Number.isInteger(i) || Number(i) < 0 || Number(i) >= 18)
      throw Error("Unknown shape puzzle.");
    this.index = Number(i);
    this.puzzle = shapeLevel(this.index);
    this.reset();
  }
  reset() {
    this.cells = this.puzzle.cells.map(() => 0);
    this.moves = [];
    this.hints = 0;
    this.announced = false;
    this.emit();
  }
  snapshot() {
    return {
      index: this.index,
      puzzle: structuredClone(this.puzzle),
      cells: [...this.cells],
      complete: this.cells.every((c, i) => c === this.puzzle.cells[i]),
    };
  }
  getState() {
    return this.snapshot();
  }
  place(cell: number, code: number) {
    if (
      !Number.isInteger(cell) ||
      cell < 0 ||
      cell >= this.cells.length ||
      !Number.isInteger(code) ||
      code < 0 ||
      code > 5 ||
      this.cells[cell] === code ||
      this.getState().complete
    )
      return false;
    this.moves.push({ cell, code });
    this.cells[cell] = code;
    this.emit(this.getState().complete);
    return true;
  }
  undo() {
    if (!this.moves.length) return;
    this.moves.pop();
    this.cells = this.puzzle.cells.map(() => 0);
    this.moves.forEach((m) => {
      this.cells[m.cell] = m.code;
    });
    this.emit(this.getState().complete);
  }
  getHint(tier: 1 | 2) {
    const cell = this.cells.findIndex((c, i) => c !== this.puzzle.cells[i]);
    if (cell < 0) return null;
    this.hints++;
    return {
      pieceId: String(this.puzzle.cells[cell]),
      ...(tier === 2 ? { pegId: String(cell) } : {}),
    };
  }
}
export const SHAPE_BUILDER: GameDescriptor = {
  id: "shape-builder",
  title: "Shape Builder",
  levels: SHAPE_LEVELS,
  create: () => new ShapeBuilder(),
};
