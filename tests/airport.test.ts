import { describe, expect, it } from "vitest";
import {
  CHALLENGES,
  initialLayout,
  normalizeLayout,
  editLayout,
  testLayout,
  newDraft,
  changeDesign,
  testDesign,
  undoDesign,
  normalizeAirport,
} from "../src/games/airport";
import type { Layout } from "../src/games/airport";
import { emptyState, upgradeState } from "../src/engine/progress";
const valid = (
  runway = [12, 18],
  taxi = [13, 14, 15],
  gates: (number | null)[] = [16, null],
): Layout => ({ runway, taxi, gates });
describe("Airport Designer", () => {
  it("requires a connected path and a real gate, not just enough tiles", () => {
    expect(testLayout(initialLayout(), CHALLENGES[0]).ok).toBe(false);
    expect(testLayout(valid(), CHALLENGES[0]).ok).toBe(true);
    expect(testLayout(valid([12, 18], [13, 15]), CHALLENGES[0]).ok).toBe(false);
    expect(testLayout(valid([12, 18], [7, 8, 9, 15]), CHALLENGES[0]).ok).toBe(
      false,
    );
  });
  it("measures only contiguous runway joined to the exit", () => {
    expect(testLayout(valid([0, 12, 18]), CHALLENGES[1]).runwayLength).toBe(2);
    expect(testLayout(valid([6, 12, 18]), CHALLENGES[1]).ok).toBe(true);
  });
  it("each challenge has a working design, including two distinct gates and tile budget", () => {
    const solutions = [
      valid(),
      valid([6, 12, 18]),
      valid([6, 12, 18], [13, 7, 8, 9], [10, null]),
      valid([6, 12, 18], [13, 7, 8, 9, 15, 21], [10, 22]),
      valid([0, 6, 12, 18], [13, 14, 15, 21], [16, 22]),
    ];
    CHALLENGES.forEach((c, i) =>
      expect(testLayout(solutions[i], c).ok, c.title).toBe(true),
    );
    const long = valid(
      [6, 12, 18],
      [1, 2, 3, 7, 8, 9, 13, 15, 19, 21],
      [10, 22],
    );
    expect(
      testLayout(long, CHALLENGES[3]).messages.some((m) => m.includes("9")),
    ).toBe(true);
  });
  it("ponds and terminal tiles cannot be overwritten and gates cannot overlap", () => {
    const c = CHALLENGES[3],
      l = initialLayout();
    expect(editLayout(l, "taxi", 14, c)).toBe(l);
    expect(editLayout(l, "erase", 5, c)).toBe(l);
    expect(editLayout(l, "erase", 12, c)).toBe(l);
    const g = editLayout(l, "gate-a", 16, c);
    expect(editLayout(g, "gate-b", 16, c)).toBe(g);
    expect(editLayout(g, "gate-a", 10, c).gates[0]).toBe(10);
    expect(editLayout(g, "gate-a", 13, c)).toBe(g);
  });
  it("does not allow one plane to use another gate as a through-route", () => {
    const l = valid([6, 12, 18], [13, 14, 15], [16, 22]);
    expect(testLayout(l, CHALLENGES[3]).ok).toBe(false);
  });
  it("invalidates a flight check after an edit or undo, preserving prior solved history", () => {
    const c = CHALLENGES[0];
    let d = { ...newDraft(), layout: valid() };
    d = testDesign(d, c, 100);
    expect(d.firstSolvedAt).toBe(100);
    expect(d.lastTest?.ok).toBe(true);
    d = changeDesign(d, c, "erase", 14);
    expect(d.lastTest).toBeUndefined();
    expect(d.firstSolvedAt).toBe(100);
    d = testDesign(d, c, 200);
    expect(d.lastTest?.ok).toBe(false);
    d = undoDesign(d);
    expect(d.lastTest).toBeUndefined();
    expect(testLayout(d.layout, c).ok).toBe(true);
    expect(d.tests).toBe(2);
  });
  it("round trips layouts and help records without altering academics or earlier portfolios", () => {
    const state = emptyState();
    state.growth.sessions = [
      {
        id: "old",
        activityId: "airport-bag",
        startedAt: 1,
        triedAt: 2,
        reflection: "old words",
        drawing: [],
        strategies: [],
      },
    ];
    state.airport = {
      selected: "first-flight",
      drafts: {
        "first-flight": {
          ...testDesign({ ...newDraft(), layout: valid() }, CHALLENGES[0], 100),
          hints: 2,
          reflection: "I connected the path.",
        },
      },
    };
    const restored = upgradeState(JSON.parse(JSON.stringify(state)));
    expect(restored.ok).toBe(true);
    if (!restored.ok) return;
    expect(restored.state.airport).toEqual(state.airport);
    expect(restored.state.growth).toEqual(state.growth);
    expect(restored.state.skills).toEqual({});
    expect(restored.state.attempts).toEqual([]);
    const old = upgradeState({ ...state, airport: undefined });
    expect(old.ok && old.state.airport?.drafts).toEqual({});
  });
  it("sanitizes imported maps, counters and claimed flight success", () => {
    const c = CHALLENGES[3];
    const clean = normalizeLayout(
      {
        runway: [-1, 5, 12, 18, NaN],
        taxi: [14, 20, 35, 13, 13],
        gates: [16, 16],
      },
      c,
    );
    expect(clean).toEqual({ runway: [12, 18], taxi: [13], gates: [16, null] });
    const imported = normalizeAirport({
      selected: "bad",
      drafts: {
        "first-flight": {
          ...newDraft(),
          hints: 500,
          lastTest: { revision: 0, ts: 100, ok: true },
          tests: NaN,
        },
      },
    });
    expect(imported.selected).toBe("first-flight");
    expect(imported.drafts["first-flight"].hints).toBe(3);
    expect(imported.drafts["first-flight"].lastTest?.ok).toBe(false);
    expect(imported.drafts["first-flight"].tests).toBe(0);
  });
});
