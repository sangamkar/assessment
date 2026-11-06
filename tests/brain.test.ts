import { describe, it, expect } from "vitest";
import { VOCABULARY, CONNECTIONS } from "../src/games/brainContent";
import {
  NEW_GAME_IDS,
  LAB_ROUNDS,
  targetPuzzle,
  balancePuzzle,
  wordPuzzle,
  connectionPuzzle,
  robotPuzzle,
  newBrainRun,
  combineTiles,
  matchingGroup,
  moveRobot,
  robotDelivery,
  finishBrainRound,
  nextBrainRound,
  normalizeBrainRuns,
  puzzleSeed,
} from "../src/games/brain";
import type { Level, BrainRun } from "../src/games/brain";
import { emptyState, upgradeState, recordGame } from "../src/engine/progress";
describe("screen-time vocabulary and number games", () => {
  it("generates solvable target puzzles across every difficulty without reusing tiles", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let seed = 0; seed < 150; seed++) {
        const p = targetPuzzle(level, seed);
        let r = newBrainRun("target-number", level, seed);
        for (let k = 0; k < p.ops.length; k++) {
          r = {
            ...r,
            board: {
              ...r.board,
              selection: k === 0 ? [0, 1] : [r.board.cards.length - 1, 0],
              operator: p.ops[k],
            },
          };
          r = combineTiles(r);
        }
        expect(r.board.cards).toHaveLength(1);
        expect(r.board.cards[0].value).toBe(p.target);
        expect(r.board.history).toHaveLength(level);
      }
  });
  it("keeps operand order for subtraction and rejects duplicate selection", () => {
    let r = newBrainRun("target-number", 1, 13);
    const [a, b] = r.board.cards;
    r = { ...r, board: { ...r.board, selection: [1, 0], operator: "-" } };
    expect(combineTiles(r).board.cards[0].value).toBe(b.value - a.value);
    const duplicate = { ...r, board: { ...r.board, selection: [0, 0] } };
    expect(combineTiles(duplicate)).toBe(duplicate);
  });
  it("creates correct balance equations with six distinct choices", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let seed = 0; seed < 150; seed++) {
        const p = balancePuzzle(level, seed);
        expect(p.a + p.answer).toBe(p.operator === "+" ? p.b + p.c : p.b - p.c);
        expect(p.choices).toHaveLength(6);
        expect(new Set(p.choices).size).toBe(6);
        expect(p.choices).toContain(p.answer);
      }
  });
  it("introduces two distinct words and revisits them in new sentence contexts", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let seed = 0; seed < 30; seed++) {
        const first = wordPuzzle(level, seed, 0),
          second = wordPuzzle(level, seed, 1),
          again = wordPuzzle(level, seed, 2);
        expect(first.word.word).not.toBe(second.word.word);
        expect(again.word).toEqual(first.word);
        expect(first.context).toBe(false);
        expect(again.context).toBe(true);
        for (let round = 0; round < 4; round++) {
          const p = wordPuzzle(level, seed, round);
          expect(new Set(p.choices.map((w) => w.word)).size).toBe(4);
          expect(p.choices.filter((w) => w.word === p.word.word)).toHaveLength(
            1,
          );
        }
      }
    for (const words of Object.values(VOCABULARY))
      for (const word of words) {
        expect(word.context).toContain("___");
        expect(word.meaning.length).toBeGreaterThan(10);
        expect(word.example.toLowerCase()).toContain(word.word);
      }
  });
  it("has unambiguous intended partitions and checks either category in any order", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let round = 0; round < 4; round++) {
        const p = connectionPuzzle(level, 441, round);
        expect(new Set(p.tiles.map((t) => t.word)).size).toBe(8);
        for (const group of [0, 1]) {
          const indices = p.tiles.flatMap((t, i) =>
            t.group === group ? [i] : [],
          );
          expect(matchingGroup(indices.reverse(), level, 441, round)).toBe(
            group,
          );
          expect(
            matchingGroup(
              [indices[0], indices[0], indices[1], indices[2]],
              level,
              441,
              round,
            ),
          ).toBeNull();
        }
        expect(matchingGroup([0, 1, 2], level, 441, round)).toBeNull();
      }
    expect(Object.values(CONNECTIONS).flat()).toHaveLength(12);
  });
  it("generates reachable robot deliveries with correct counts and relative station distance", () => {
    for (const level of [1, 2, 3] as Level[])
      for (let seed = 0; seed < 60; seed++) {
        let r = newBrainRun("robot-delivery", level, seed);
        const p = robotPuzzle(level, puzzleSeed(r));
        const cells = [
          ...p.parcels.filter((x) => x.color === "blue").slice(0, p.blue),
          ...p.parcels.filter((x) => x.color === "red").slice(0, p.red),
        ].map((x) => x.cell);
        r = { ...r, board: { ...r.board, position: p.goal, collected: cells } };
        expect(robotDelivery(r).ok).toBe(true);
        expect(
          robotDelivery({
            ...r,
            board: { ...r.board, collected: cells.slice(1) },
          }).ok,
        ).toBe(false);
        if (level > 1)
          expect(
            robotDelivery({
              ...r,
              board: {
                ...r.board,
                position: p.stations.find((x) => x !== p.goal)!,
              },
            }).ok,
          ).toBe(false);
        const edge = moveRobot(
          newBrainRun("robot-delivery", level, seed),
          "left",
        );
        expect(edge.board.position).toBe(0);
      }
  });
  it("records one result per round and tracks assisted solves separately", () => {
    let r = newBrainRun("target-number", 1, 6);
    r = finishBrainRound(r, true, "Solved");
    expect(r.clean).toBe(1);
    expect(finishBrainRound(r, true, "Again")).toBe(r);
    r = nextBrainRound("target-number", r);
    r.board.hints = 1;
    r = finishBrainRound(r, true, "With help");
    expect(r.assisted).toBe(1);
    expect(r.clean).toBe(1);
    r = nextBrainRound("target-number", r);
    r = finishBrainRound(r, false, "Skipped");
    expect(r.skipped).toBe(1);
    r = nextBrainRound("target-number", r);
    r.board.misses = 1;
    r = finishBrainRound(r, true, "Another try");
    r = nextBrainRound("target-number", r);
    expect(r.round).toBe(LAB_ROUNDS);
    expect(r.clean + r.assisted + r.skipped).toBe(4);
  });
  it("restores in-progress combinations, inventories, categories and counters through backups", () => {
    const state = emptyState();
    state.brainRuns = {};
    for (const id of NEW_GAME_IDS) state.brainRuns[id] = newBrainRun(id, 2, 50);
    const r = state.brainRuns["target-number"]!;
    r.board.selection = [0, 1];
    state.brainRuns["target-number"] = combineTiles(r);
    state.brainRuns["robot-delivery"]!.board.collected = [
      robotPuzzle(2, 50).parcels[0].cell,
    ];
    const restored = upgradeState(JSON.parse(JSON.stringify(state)));
    expect(restored.ok && restored.state.brainRuns).toEqual(state.brainRuns);
    const observed = recordGame(state, "target-number", "win");
    expect(observed.skills).toEqual({});
    expect(observed.attempts).toEqual([]);
    expect(observed.games["target-number"]?.won).toBe(1);
    expect(normalizeBrainRuns({ bad: {} })).toEqual({});
    expect(normalizeBrainRuns({ "target-number": { ...r, round: 2 } })).toEqual(
      {},
    );
  });
});
