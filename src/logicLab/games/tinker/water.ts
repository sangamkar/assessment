import { PuzzleModule } from "./base";
import { pipePuzzle, pipeHint, rotateMask, traceWater } from "./pipes";
import type { GameDescriptor } from "../../core/types";
export const WATER_LEVELS = Array.from({ length: 24 }, (_, i) => ({
  id: `rescue-${i + 1}`,
  title: `${["Flower", "Bunny", "Turtle", "Duck"][i % 4]} rescue ${Math.floor(i / 4) + 1}`,
  tier: (["Starter", "Explorer", "Master"] as const)[Math.floor(i / 8)],
  data: { index: i },
}));
export interface WaterState {
  index: number;
  puzzle: ReturnType<typeof pipePuzzle>;
  masks: number[];
  flow: ReturnType<typeof traceWater>;
  complete: boolean;
}
export class WaterRescue extends PuzzleModule<WaterState> {
  index = 0;
  puzzle = pipePuzzle(1, 731);
  moves: number[] = [];
  private masks: number[] = [];
  loadLevel(data: unknown) {
    const i = (data as { index?: unknown })?.index;
    if (!Number.isInteger(i) || Number(i) < 0 || Number(i) >= 24)
      throw Error("Unknown water puzzle.");
    this.index = Number(i);
    this.puzzle = pipePuzzle(
      (Math.floor(this.index / 8) + 1) as 1 | 2 | 3,
      731 + this.index * 97,
    );
    this.reset();
  }
  reset() {
    this.moves = [];
    this.masks = [...this.puzzle.initial];
    this.hints = 0;
    this.announced = false;
    this.emit();
  }
  snapshot() {
    return {
      index: this.index,
      puzzle: structuredClone(this.puzzle),
      masks: [...this.masks],
      flow: traceWater(this.puzzle.size, this.masks),
      complete: traceWater(this.puzzle.size, this.masks).ok,
    };
  }
  getState() {
    return this.snapshot();
  }
  rotate(cell: number) {
    if (
      !Number.isInteger(cell) ||
      cell <= 0 ||
      cell >= this.masks.length - 1 ||
      this.getState().complete
    )
      return false;
    this.moves.push(cell);
    this.masks[cell] = rotateMask(this.masks[cell], 1);
    this.emit(this.getState().complete);
    return true;
  }
  undo() {
    if (!this.moves.length) return;
    const cell = this.moves.pop()!;
    this.masks[cell] = rotateMask(this.masks[cell], -1);
    this.emit(this.getState().complete);
  }
  getHint(tier: 1 | 2) {
    if (this.getState().complete) return null;
    const h = pipeHint(this.puzzle, this.masks);
    if (!h) return null;
    this.hints++;
    return {
      pieceId: String(h.cell),
      ...(tier === 2 ? { pegId: String(this.puzzle.solved[h.cell]) } : {}),
    };
  }
}
export const WATER_RESCUE: GameDescriptor = {
  id: "water-pipes",
  title: "Water Rescue",
  levels: WATER_LEVELS,
  create: () => new WaterRescue(),
};
