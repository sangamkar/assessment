import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import {
  WORKSHOP_IDS,
  WORKSHOP_TITLES,
  shapePuzzle,
  clockPuzzle,
  patternPuzzle,
  soundPuzzle,
  pipePuzzle,
  traceWater,
  rotateMask,
} from "../src/games/workshop";
import {
  newBrainRun,
  finishBrainRound,
  nextBrainRound,
  normalizeBrainRuns,
} from "../src/games/brain";
import type { Level } from "../src/games/brain";
import { emptyState, upgradeState, recordGame } from "../src/engine/progress";
import { Workshop } from "../src/ui/brain/Workshop";
import { GAMES } from "../src/ui/games/Games";
describe("learning workshop", () => {
  it("generates solvable pipe networks at all levels, requiring rotation", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let seed = 0; seed < 200; seed++) {
        const p = pipePuzzle(level, seed);
        expect(traceWater(p.size, p.solved).ok).toBe(true);
        expect(traceWater(p.size, p.initial).ok).toBe(false);
        expect(p.initial[0]).toBe(p.solved[0]);
        expect(p.initial.at(-1)).toBe(p.solved.at(-1));
        p.initial.forEach((m, i) =>
          expect(
            [0, 1, 2, 3].some((t) => rotateMask(m, t) === p.solved[i]),
          ).toBe(true),
        );
      }
  });
  it("stops water at disconnected joins, edges and loops instead of crediting destination proximity", () => {
    expect(traceWater(3, [2, 10, 12, 0, 0, 5, 0, 0, 1]).ok).toBe(true);
    expect(traceWater(3, [2, 5, 12, 0, 0, 5, 0, 0, 1]).ok).toBe(false);
    expect(traceWater(3, [1, 0, 0, 0, 0, 0, 0, 0, 1]).reached).toEqual([0]);
    expect(traceWater(3, [6, 12, 0, 3, 9, 0, 0, 0, 1]).ok).toBe(false);
  });
  it("gives valid shape models, clock ranges, repeating patterns and single-sound changes", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let seed = 0; seed < 100; seed++) {
        const s = shapePuzzle(level, seed);
        expect(s.cells).toHaveLength(16);
        expect(s.cells.every((c) => c >= 0 && c <= 5)).toBe(true);
        const c = clockPuzzle(level, seed);
        expect(c.total).toBe((c.hour % 12) * 60 + c.minute);
        expect(c.minute % (level === 1 ? 60 : level === 2 ? 30 : 15)).toBe(0);
        const p = patternPuzzle(level, seed);
        expect(
          [...p.shown, ...p.answer].every(
            (n, i) => n === p.unit[i % p.unit.length],
          ),
        ).toBe(true);
        const w = soundPuzzle(level, seed);
        expect([...w.from].filter((c, i) => c !== w.to[i])).toHaveLength(1);
        expect(w.reference[w.at]).toBe(w.answer);
        expect(w.choices).toContain(w.answer);
        expect(new Set(w.choices).size).toBe(4);
      }
  });
  it("preserves partial boards and old progress through actual backup migration", () => {
    const s = emptyState();
    s.brainRuns = {};
    const work = {
      "shape-builder": [1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 2],
      "clock-quest": [690],
      "pattern-machine": [2, 2],
      "sound-switch": [3],
      "water-pipes": pipePuzzle(3, 20).initial,
    };
    for (const id of WORKSHOP_IDS)
      s.brainRuns[id] = {
        ...newBrainRun(id, 3, 20),
        board: { ...newBrainRun(id, 3, 20).board, work: work[id] },
      };
    s.brainRuns["word-detective"] = newBrainRun("word-detective", 2, 42);
    const saved = upgradeState(JSON.parse(JSON.stringify(s)));
    expect(saved.ok).toBe(true);
    if (saved.ok) expect(saved.state.brainRuns).toEqual(s.brainRuns);
    s.brainRuns["clock-quest"]!.board.work = [999];
    expect(normalizeBrainRuns(s.brainRuns)["clock-quest"]).toBeUndefined();
    expect(normalizeBrainRuns(s.brainRuns)["word-detective"]).toBeDefined();
  });
  it("records independent, assisted and skipped results once and completes four rounds", () => {
    for (const id of WORKSHOP_IDS) {
      let r = newBrainRun(id, 1, 17);
      r = finishBrainRound(r, true, "solved");
      expect(finishBrainRound(r, true, "again")).toBe(r);
      expect(r.clean).toBe(1);
      r = nextBrainRound(id, r);
      r.board.hints = 1;
      r = finishBrainRound(r, true, "help");
      expect(r.assisted).toBe(1);
      r = nextBrainRound(id, r);
      r = nextBrainRound(id, finishBrainRound(r, false, "skip"));
      r = nextBrainRound(id, finishBrainRound(r, true, "done"));
      expect(r.round).toBe(4);
      expect(r.clean + r.assisted + r.skipped).toBe(4);
      const s = recordGame(emptyState(), id, "assisted", 123, {
        prompt: "test",
        answer: "response",
        hints: 1,
        mistakes: [],
      });
      expect(s.gameReviews?.[0].game).toBe(id);
      expect(s.games[id]?.played).toBe(1);
    }
  });
  it("renders every game at each difficulty with instructions, checking, hints, solutions and catalog entries", () => {
    for (const id of WORKSHOP_IDS)
      for (const level of [1, 2, 3] as Level[]) {
        const s = emptyState();
        s.brainRuns = { [id]: newBrainRun(id, level, 25) };
        const html = renderToStaticMarkup(
          <Workshop id={id} state={s} update={() => {}} onExit={() => {}} />,
        );
        expect(html).toContain(WORKSHOP_TITLES[id]);
        expect(html).toContain("Give me a hint");
        expect(html).toContain("Show solution and skip");
        expect(GAMES.some((g) => g.id === id)).toBe(true);
      }
  });
});
