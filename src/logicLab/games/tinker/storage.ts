import { browserStorage, type StorageLike } from "../../core/progress";
import { DotsAndBoxes } from "./dots";
import { ShapeBuilder } from "./shapes";
import { WaterRescue } from "./water";
export type TinkerId = "dots-boxes" | "water-pipes" | "shape-builder";
export type TinkerGame = DotsAndBoxes | ShapeBuilder | WaterRescue;
export const runKey = (id: TinkerId) => `learning-quest:tinker:v1:${id}`;
export function createGame(id: TinkerId): TinkerGame {
  return id === "dots-boxes"
    ? new DotsAndBoxes()
    : id === "water-pipes"
      ? new WaterRescue()
      : new ShapeBuilder();
}
export function saveRun(
  id: TinkerId,
  game: TinkerGame,
  storage: StorageLike | undefined = browserStorage(),
): boolean {
  const level =
    game instanceof DotsAndBoxes
      ? game.getState().level
      : { index: game.index };
  try {
    if (!storage) return false;
    storage.setItem(
      runKey(id),
      JSON.stringify({
        version: 1,
        level,
        moves: game.moves,
        hints: game.hints,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
export function loadRun(
  id: TinkerId,
  storage: StorageLike | undefined = browserStorage(),
): { game: TinkerGame | null; warning: string } {
  try {
    const raw = storage?.getItem(runKey(id));
    if (!raw) return { game: null, warning: "" };
    const data = JSON.parse(raw);
    if (
      !data ||
      data.version !== 1 ||
      !Array.isArray(data.moves) ||
      data.moves.length > 5000 ||
      !Number.isInteger(data.hints) ||
      data.hints < 0 ||
      data.hints > 5000
    )
      throw Error();
    const game = createGame(id);
    game.loadLevel(data.level);
    for (const move of data.moves) {
      const ok =
        game instanceof DotsAndBoxes
          ? typeof move === "string" && game.play(move)
          : game instanceof WaterRescue
            ? typeof move === "number" && game.rotate(move)
            : move &&
              typeof move === "object" &&
              game.place(move.cell, move.code);
      if (!ok) throw Error();
    }
    game.hints = data.hints;
    return { game, warning: "" };
  } catch {
    return {
      game: null,
      warning:
        "This saved game could not be read. It is kept on this device; starting a new game replaces only this game’s save.",
    };
  }
}
