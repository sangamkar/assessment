import { describe, it, expect } from "vitest";
import { ALL_SKILLS, getSkill } from "../src/content";
import { MOCK_ONLY_ITEMS } from "../src/content/mockOnly";
import { createRng } from "../src/engine/rng";
import {
  itemFingerprint,
  isMockItem,
  poolItems,
  legacyItemFamily,
} from "../src/engine/itemPools";
import { pickItem } from "../src/engine/planner";
import { newMockRun, nextMockStep, mockTotal } from "../src/engine/mock";
import { emptyState, recordAttempt } from "../src/engine/progress";
import type { Difficulty, Item } from "../src/content/types";
import type { MockSubject } from "../src/engine/mock";

describe("practice versus mock transfer questions", () => {
  it("holds new mock-only tasks out even when their IDs or distractors change", () => {
    const item = MOCK_ONLY_ITEMS[0];
    expect(
      isMockItem({
        ...item,
        id: "renamed",
        choices: [...item.choices].reverse(),
      }),
    ).toBe(true);
  });
  it("ignores object property order in an otherwise identical visual stimulus", () => {
    const item = getSkill("r.vocab")!.items![0];
    const a: Item = { ...item, visual: { kind: "number", value: 8 } };
    const b: Item = { ...item, visual: { value: 8, kind: "number" } };
    expect(itemFingerprint(a)).toBe(itemFingerprint(b));
  });
  it("keeps the full bank for subjects and writing skills that have no mock", () => {
    for (const skill of ALL_SKILLS.filter(
      (s) =>
        !["math", "reading"].includes(s.subject) ||
        s.strand === "writing" ||
        s.language ||
        (s.regions && !s.regions.includes("us-ga")),
    )) {
      expect(poolItems(skill, "practice")).toEqual(skill.items ?? []);
      expect(poolItems(skill, "mock")).toEqual([]);
    }
  });
  it("recognizes legacy reading prompts across difficulty labels", () => {
    expect(legacyItemFamily("r.sight#the-1")).toBe(
      legacyItemFamily("r.sight#the-3"),
    );
    expect(legacyItemFamily("r.letters#1-a")).toBe(
      legacyItemFamily("r.letters#3-a"),
    );
    expect(legacyItemFamily("m.add#4-3")).not.toBe(
      legacyItemFamily("m.add#4-1"),
    );
  });
  it("does not mistake shuffled choices, changed IDs or new distractors for new questions", () => {
    const item = getSkill("r.vocab")!.items![0];
    const correct = item.choices.find((c) => c.correct)!;
    const lookalike: Item = {
      ...item,
      id: "another-id",
      choices: [
        { id: "z", text: "new wrong choice", why: "near_miss" },
        { ...correct, id: "x" },
      ],
    };
    expect(itemFingerprint(lookalike)).toBe(itemFingerprint(item));
    expect(isMockItem(lookalike)).toBe(isMockItem(item));
  });
  it("partitions authored content without changing skill, difficulty or saved item IDs", () => {
    for (const skill of ALL_SKILLS) {
      const practice = poolItems(skill, "practice"),
        mock = poolItems(skill, "mock");
      const fingerprints = new Set(practice.map(itemFingerprint));
      for (const item of mock)
        expect(fingerprints.has(itemFingerprint(item)), item.id).toBe(false);
      for (const item of [...practice, ...mock]) {
        expect(item.skill).toBe(skill.id);
        expect([1, 2, 3]).toContain(item.difficulty);
      }
    }
  });
  it("never serves held-out authored or generated tasks during practice", () => {
    const state = emptyState();
    for (const skill of ALL_SKILLS)
      for (const d of [1, 2, 3] as Difficulty[])
        for (let i = 0; i < 8; i++)
          expect(isMockItem(pickItem(state, skill, d)), skill.id).toBe(false);
  });
  it("has held-out math and sight-word tasks at each difficulty", () => {
    for (const id of ["m.add", "m.sub", "m1.time", "m1.coins", "r.sight"])
      for (const d of [1, 2, 3] as Difficulty[]) {
        const k = getSkill(id)!,
          rng = createRng(d * 550 + id.length);
        const signatures = new Set<string>(
          poolItems(k, "mock")
            .filter((i) => i.difficulty === d)
            .map(itemFingerprint),
        );
        for (let i = 0; i < 500; i++) {
          const item = k.generate!(rng, d);
          if (isMockItem(item)) signatures.add(itemFingerprint(item));
        }
        expect(signatures.size, `${id}/${d}`).toBeGreaterThan(0);
      }
  });
  for (const subject of ["math", "reading"] as MockSubject[])
    it(`runs a full ${subject} mock without reusing exposed practice or repeated tasks`, () => {
      let state = emptyState();
      for (const skill of ALL_SKILLS.filter((s) => s.subject === subject))
        for (let i = 0; i < 5; i++) {
          const item = pickItem(state, skill, 2);
          state = recordAttempt(state, {
            itemId: item.id,
            fingerprint: itemFingerprint(item),
            skill: skill.id,
            d: item.difficulty,
            correct: true,
            ts: 1000 + i,
            mode: "skill",
          });
        }
      const run = newMockRun(subject, 2, Date.UTC(2026, 10, 4));
      const exposed = new Set(state.attempts.map((a) => a.fingerprint));
      let step = nextMockStep(state, run);
      while (step) {
        const fp = itemFingerprint(step.item);
        expect(isMockItem(step.item), step.item.id).toBe(true);
        expect(exposed.has(fp), step.item.id).toBe(false);
        exposed.add(fp);
        run.answers.push({
          strand: step.strand,
          skill: step.skill.id,
          itemId: step.item.id,
          fingerprint: fp,
          level: step.level,
          correct: run.answers.length % 2 === 0,
          ts: 2000 + run.answers.length,
        });
        step = nextMockStep(state, run);
      }
      expect(run.answers).toHaveLength(mockTotal(subject));
    });
  it("remembers pre-update authored exposure and pauses instead of leaking practice on exhaustion", () => {
    let state = emptyState();
    const info = getSkill("r.info")!;
    for (const item of [
      ...info.items!,
      ...MOCK_ONLY_ITEMS.filter((i) => i.skill === info.id),
    ])
      state = recordAttempt(state, {
        itemId: item.id,
        skill: info.id,
        d: item.difficulty,
        correct: true,
        ts: 1000,
        mode: "skill",
      });
    const run = newMockRun("reading", 2, Date.UTC(2026, 10, 4));
    let step = nextMockStep(state, run);
    while (step) {
      run.answers.push({
        strand: step.strand,
        skill: step.skill.id,
        itemId: step.item.id,
        level: step.level,
        correct: true,
        ts: 2000,
      });
      step = nextMockStep(state, run);
    }
    expect(run.answers.length).toBeLessThan(mockTotal("reading"));
  });
  it("authors complete new questions with a single answer, feedback and no duplicate visible task", () => {
    const fps = new Set(
      ALL_SKILLS.flatMap((s) => (s.items ?? []).map(itemFingerprint)),
    );
    for (const item of MOCK_ONLY_ITEMS) {
      expect(item.choices.length).toBeGreaterThanOrEqual(3);
      expect(item.choices.filter((c) => c.correct)).toHaveLength(1);
      expect(item.explain.length).toBeGreaterThan(10);
      expect(fps.has(itemFingerprint(item))).toBe(false);
      fps.add(itemFingerprint(item));
    }
  });
});
