import { describe, expect, it } from "vitest";
import {
  DotsAndBoxes,
  edgesFor,
  boxEdges,
  computerMove,
  edgeBetween,
} from "../../src/logicLab/games/tinker/dots";
import {
  WaterRescue,
  WATER_LEVELS,
} from "../../src/logicLab/games/tinker/water";
import {
  ShapeBuilder,
  SHAPE_LEVELS,
} from "../../src/logicLab/games/tinker/shapes";
import { pipePuzzle, traceWater } from "../../src/logicLab/games/tinker/pipes";
import {
  loadRun,
  saveRun,
  runKey,
} from "../../src/logicLab/games/tinker/storage";
import { ProgressStore, STORAGE_KEY } from "../../src/logicLab/core/progress";
const dots = (size = 2, mode = "friend", difficulty = "thinking") => {
  const g = new DotsAndBoxes();
  g.loadLevel({ size, mode, difficulty });
  return g;
};
describe("Dots and Boxes", () => {
  it("draws only adjacent dot connections, in either direction", () => {
    expect(edgeBetween(2, 0, 1)).toBe("h-0-0");
    expect(edgeBetween(2, 3, 0)).toBe("v-0-0");
    expect(edgeBetween(2, 0, 4)).toBeNull();
    expect(edgeBetween(2, 0, 2)).toBeNull();
    expect(edgeBetween(2, 2, 3)).toBeNull();
  });
  it("claims two boxes at once and retains the turn, with undo restoring ownership", () => {
    const g = dots();
    const common = "v-0-1";
    [...new Set([...boxEdges(0, 0), ...boxEdges(0, 1)])]
      .filter((id) => id !== common)
      .forEach((id) => g.play(id));
    const before = g.getState();
    expect(Object.keys(before.boxes)).toHaveLength(0);
    g.play(common);
    expect(g.getState().score[before.turn - 1]).toBe(2);
    expect(g.getState().turn).toBe(before.turn);
    g.undo();
    expect(g.getState()).toEqual(before);
  });
  it("rejects invalid/repeated lines and awards one completion per finished board", () => {
    const g = dots();
    let count = 0;
    g.onComplete(() => count++);
    expect(g.play("h-99-3")).toBe(false);
    g.play("h-0-0");
    expect(g.play("h-0-0")).toBe(false);
    edgesFor(2).forEach((e) => g.play(e.id));
    expect(g.getState().complete).toBe(true);
    expect(g.getState().score.reduce((a, b) => a + b)).toBe(4);
    expect(count).toBe(1);
    g.reset();
    expect(g.getState().edges).toEqual({});
    expect(g.getState().turn).toBe(1);
  });
  it("thinking computer takes a box and otherwise avoids a third side when possible", () => {
    const g = dots();
    ["h-0-0", "v-0-0", "h-1-0"].forEach((e) => g.play(e));
    expect(computerMove(g.getState(), () => 0)).toBe("v-0-1");
    const h = dots();
    h.play("h-0-0");
    h.play("v-0-0");
    const move = computerMove(h.getState(), () => 0)!;
    h.play(move);
    expect(boxEdges(0, 0).filter((e) => h.getState().edges[e])).toHaveLength(2);
  });
  it.each(
    [2, 3, 4, 5].flatMap((size) =>
      ["gentle", "thinking"].map((difficulty) => ({ size, difficulty })),
    ),
  )(
    "finishes $size by $size games with $difficulty computer moves",
    ({ size, difficulty }) => {
      for (let run = 0; run < 20; run++) {
        const g = dots(size, "computer", difficulty);
        let moves = 0;
        while (!g.getState().complete) {
          const line = computerMove(
            g.getState(),
            () => ((run * 13 + moves * 17) % 97) / 97,
          );
          expect(line).not.toBeNull();
          expect(g.play(line!)).toBe(true);
          if (++moves > edgesFor(size).length) throw Error("Did not finish");
        }
        expect(g.getState().score[0] + g.getState().score[1]).toBe(size * size);
        expect(computerMove(g.getState())).toBeNull();
      }
    },
    10000,
  );
  it("undoes the human action and computer responses as one decision", () => {
    const g = dots(2, "computer");
    g.play("h-0-0");
    g.play("h-0-1");
    expect(g.getState().turn).toBe(1);
    g.undoTurn();
    expect(g.moves).toEqual([]);
    expect(g.getState().turn).toBe(1);
  });
});
describe("5 by 5 matches", () => {
  it("offers 36 dots, 60 lines and 25 boxes with normal extra turns", () => {
    const g = dots(5);
    expect(edgesFor(5)).toHaveLength(60);
    expect(edgeBetween(5, 34, 35)).toBe("h-5-4");
    let completed = 0;
    g.onComplete(() => completed++);
    for (const edge of edgesFor(5)) g.play(edge.id);
    expect(g.getState().complete).toBe(true);
    expect(Object.keys(g.getState().boxes)).toHaveLength(25);
    expect(g.getState().score[0] + g.getState().score[1]).toBe(25);
    expect(completed).toBe(1);
  });
  it("restores an unfinished 5x5 match in either opponent mode", () => {
    const data = new Map<string, string>(),
      storage = {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => {
          data.set(key, value);
        },
      };
    for (const mode of ["friend", "computer"]) {
      const g = dots(5, mode);
      g.play("h-0-0");
      g.play("v-0-5");
      expect(saveRun("dots-boxes", g, storage)).toBe(true);
      const restored = loadRun("dots-boxes", storage).game;
      expect(restored?.getState()).toEqual(g.getState());
    }
  });
});
describe("Restored puzzles", () => {
  it("all 24 water levels start unsolved, finish through hints and undo the final turn", () => {
    const signatures = new Set<string>();
    for (const l of WATER_LEVELS) {
      const g = new WaterRescue();
      g.loadLevel(l.data);
      expect(g.getState().complete).toBe(false);
      signatures.add(JSON.stringify(g.getState().puzzle.initial));
      let count = 0;
      g.onComplete(() => count++);
      for (let i = 0; i < 100 && !g.getState().complete; i++) {
        const h = g.getHint(2);
        expect(h).not.toBeNull();
        g.rotate(Number(h!.pieceId));
      }
      expect(g.getState().complete).toBe(true);
      expect(count).toBe(1);
      g.undo();
      expect(g.getState().complete).toBe(false);
    }
    expect(signatures.size).toBe(24);
  });
  it("generated water routes remain solvable across 600 seeds", () => {
    for (const level of [1, 2, 3] as const)
      for (let seed = 0; seed < 200; seed++) {
        const p = pipePuzzle(level, seed);
        expect(traceWater(p.size, p.solved).ok).toBe(true);
        expect(traceWater(p.size, p.initial).ok).toBe(false);
      }
  });
  it("all 18 mosaics complete only with the correct cells and allow correction and undo", () => {
    for (const level of SHAPE_LEVELS) {
      const g = new ShapeBuilder();
      g.loadLevel(level.data);
      expect(g.getState().complete).toBe(false);
      expect(g.place(-1, 5)).toBe(false);
      expect(g.place(0, 9)).toBe(false);
      const cell = Math.max(
        0,
        g.puzzle.cells.findIndex((c) => c === 0),
      );
      g.place(cell, g.puzzle.cells[cell] === 0 ? 5 : 0);
      g.puzzle.cells.forEach((code, i) => {
        if (code && i !== cell) g.place(i, code);
      });
      expect(g.getState().complete).toBe(false);
      const hint = g.getHint(2);
      expect(hint).toEqual({
        pieceId: String(g.puzzle.cells[cell]),
        pegId: String(cell),
      });
      g.place(cell, g.puzzle.cells[cell]);
      expect(g.getState().complete).toBe(true);
      g.undo();
      expect(g.getState().complete).toBe(false);
    }
  });
});
describe("Saved game isolation and recovery", () => {
  const storage = () => {
    const map = new Map<string, string>([
      ["learning-quest:v1", "academic data"],
      ["learning-quest:v1:before-rollback", "preserved backup"],
    ]);
    return {
      map,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
    };
  };
  it("round-trips every game and hint count without touching academic data or rollback copy", () => {
    const s = storage(),
      water = new WaterRescue(),
      shape = new ShapeBuilder(),
      d = dots();
    water.loadLevel({ index: 4 });
    shape.loadLevel({ index: 9 });
    water.rotate(1);
    water.getHint(1);
    shape.place(0, 5);
    d.play("h-0-0");
    for (const [id, g] of [
      ["water-pipes", water],
      ["shape-builder", shape],
      ["dots-boxes", d],
    ] as const) {
      expect(saveRun(id, g, s)).toBe(true);
      const restored = loadRun(id, s);
      expect(restored.warning).toBe("");
      expect(restored.game?.getState()).toEqual(g.getState());
      expect(restored.game?.hints).toBe(g.hints);
    }
    expect(s.map.get("learning-quest:v1")).toBe("academic data");
    expect(s.map.get("learning-quest:v1:before-rollback")).toBe(
      "preserved backup",
    );
  });
  it("preserves corrupt saves and rejects impossible/repeated moves", () => {
    const s = storage();
    for (const data of [
      "broken",
      JSON.stringify({
        version: 1,
        level: { size: 2, mode: "friend", difficulty: "gentle" },
        moves: ["h-0-0", "h-0-0"],
        hints: 0,
      }),
    ]) {
      s.setItem(runKey("dots-boxes"), data);
      expect(loadRun("dots-boxes", s).warning).not.toBe("");
      expect(s.getItem(runKey("dots-boxes"))).toBe(data);
    }
  });
  it("retains previous gear completion when adding restored game progress", () => {
    const s = storage();
    s.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gearworks: {
          "first-link": { completed: true, hintsUsed: 0, stars: 3 },
        },
      }),
    );
    const p = new ProgressStore(s);
    p.save("water-pipes", "rescue-1", 1, { stars: 2 });
    expect(new ProgressStore(s).get("gearworks", "first-link").stars).toBe(3);
  });
  it("reports blocked storage without interrupting a game", () => {
    const g = dots();
    expect(
      saveRun("dots-boxes", g, {
        getItem() {
          return null;
        },
        setItem() {
          throw Error("quota");
        },
      }),
    ).toBe(false);
    expect(g.play("h-0-0")).toBe(true);
  });
});
