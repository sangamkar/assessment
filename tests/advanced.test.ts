import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, getSkill } from '../src/content';
import { createRng } from '../src/engine/rng';
import { emptyState, markKnown, recordAttempt, skillState, unmarkKnown } from '../src/engine/progress';
import type { AppState } from '../src/engine/progress';
import { PLACEMENT_CAP, buildQuest, buildSkipChallenge, isVisible, placementAnswer, placementNext, skillStatus, startPlacement } from '../src/engine/planner';
import { SENTENCES, sentenceTiles } from '../src/games/sentences';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 1, 15);

describe('skipping what he already knows', () => {
  it('marking known unlocks the next skills and keeps them out of focus', () => {
    const kMath = ALL_SKILLS.filter((s) => s.subject === 'math' && s.grade === 'K').map((s) => s.id);
    const s = markKnown(emptyState(), kMath, 'parent', T0);
    expect(skillStatus(s, getSkill('m.add')!, T0)).toBe('mastered');
    expect(skillStatus(s, getSkill('m1.add20')!, T0)).toBe('ready');
    const quest = buildQuest(s, T0);
    expect(quest.filter((q) => q.role === 'focus' && q.skill.subject === 'math').every((q) => q.skill.grade !== 'K')).toBe(true);
  });

  it('a skipped skill comes back once as review; failing it returns it to practice', () => {
    let s = markKnown(emptyState(), ['m.add'], 'parent', T0);
    expect(skillStatus(s, getSkill('m.add')!, T0 + 15 * DAY)).toBe('review');
    s = recordAttempt(s, { itemId: 'x', skill: 'm.add', d: 2, correct: false, ts: T0 + 15 * DAY, mode: 'quest' });
    expect(skillState(s, 'm.add').mastered).toBe(false);
    expect(skillState(s, 'm.add').known).toBeUndefined();
  });

  it('un-ticking “knows it” restores the skill', () => {
    const s = unmarkKnown(markKnown(emptyState(), ['r.cvc'], 'parent', T0), 'r.cvc');
    expect(skillState(s, 'r.cvc')).toMatchObject({ mastered: false, level: 1 });
    expect(skillState(s, 'r.cvc').known).toBeUndefined();
  });

  it('does not overwrite a skill mastered through practice', () => {
    const practiced: AppState = { ...emptyState(), skills: { 'm.add': { introSeen: true, level: 3, streak: 0, mastered: true, masteredAt: 1, reviewStep: 4, nextReview: 99 } } };
    expect(skillState(markKnown(practiced, ['m.add'], 'parent', T0), 'm.add').reviewStep).toBe(4);
  });
});

describe('placement ("find his level")', () => {
  /** A child who knows everything below Grade 2 and nothing at Grade 2. */
  const simulate = (subject: 'math' | 'reading') => {
    const state = emptyState();
    const run = startPlacement(state, subject);
    let asked = 0;
    for (let step = placementNext(state, run); step; step = placementNext(state, run)) {
      asked++;
      placementAnswer(run, step.skill.grade !== '2');
    }
    return { run, asked };
  };

  for (const subject of ['math', 'reading'] as const) {
    it(`skips K/G1 and stops at the Grade 2 frontier, within the question cap (${subject})`, () => {
      const { run, asked } = simulate(subject);
      expect(asked).toBeLessThanOrEqual(PLACEMENT_CAP);
      expect(run.known.length).toBeGreaterThan(5);
      expect(run.known.every((id) => getSkill(id)!.grade !== '2')).toBe(true);
      expect(new Set(run.known).size).toBe(run.known.length);
    });
  }

  it('a child who misses the first probe gets nothing skipped in that strand', () => {
    const state = emptyState();
    const run = startPlacement(state, 'math');
    const first = placementNext(state, run)!;
    placementAnswer(run, false); // probe miss → backfill the easier skill
    const back = placementNext(state, run)!;
    expect(back.skill.id).not.toBe(first.skill.id);
    placementAnswer(run, false);
    expect(run.known).toHaveLength(0);
    expect(run.frontier).toContain(back.skill.id);
  });

  it('asks hard questions only', () => {
    const state = emptyState();
    const run = startPlacement(state, 'math');
    const step = placementNext(state, run)!;
    expect(step.item.difficulty).toBeGreaterThanOrEqual(2);
  });
});

describe('skip-ahead challenge', () => {
  it('is three different hard questions on one skill', () => {
    const steps = buildSkipChallenge(emptyState(), getSkill('m2.add2d')!);
    expect(steps).toHaveLength(3);
    expect(new Set(steps.map((s) => s.item.id)).size).toBe(3);
    steps.forEach((s) => expect(s.item.difficulty).toBe(3));
  });
});

describe('Grade 2 content', () => {
  it('2-digit addition and subtraction answers are arithmetically right', () => {
    for (let seed = 1; seed < 200; seed++) {
      for (const d of [1, 2, 3] as const) {
        const add = getSkill('m2.add2d')!.generate!(createRng(seed), d);
        const [a, b] = add.id.split('#')[1].split('+').map(Number);
        expect(Number(add.choices.find((c) => c.correct)!.text)).toBe(a + b);
        const sub = getSkill('m2.sub2d')!.generate!(createRng(seed), d);
        const [x, y] = sub.id.split('#')[1].split('-').map(Number);
        expect(Number(sub.choices.find((c) => c.correct)!.text)).toBe(x - y);
        if (d >= 2) expect(x % 10 < y % 10).toBe(true); // levels 2–3 really need regrouping
      }
    }
  });

  it('US money is US-only and rupees are India-only', () => {
    const us = emptyState();
    const india: AppState = { ...us, settings: { ...us.settings, curricula: ['in-cbse'], primary: 'in-cbse' } };
    expect(isVisible(us, getSkill('m2.money')!)).toBe(true);
    expect(isVisible(india, getSkill('m2.money')!)).toBe(false);
    expect(isVisible(india, getSkill('in.money')!)).toBe(true);
  });
});

describe('Sentence Builder', () => {
  it('every sentence starts with a capital, ends with a mark, and level 3 has one trap tile', () => {
    for (const level of [1, 2, 3] as const) {
      for (const b of SENTENCES[level]) {
        expect(b.words[0]).toMatch(/^[A-Z]/);
        expect(b.words[b.words.length - 1]).toMatch(/^[.?!]$/);
        const tiles = sentenceTiles(b, level, (l) => [...l]);
        expect(tiles.filter((t) => t.id === 'trap')).toHaveLength(level === 3 ? 1 : 0);
      }
    }
  });
});
