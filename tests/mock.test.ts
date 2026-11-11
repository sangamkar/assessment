import { describe, expect, it } from 'vitest';
import { getSkill } from '../src/content';
import { emptyState } from '../src/engine/progress';
import type { AppState } from '../src/engine/progress';
import { buildQuest } from '../src/engine/planner';
import { LADDER_MAX, MOCK_DOMAINS, MOCK_PER_DOMAIN, domainLevel, expectedLevel, levelLabel, mockTotal, newMockRun, nextMockStep, scoreMock } from '../src/engine/mock';
import type { MockSubject } from '../src/engine/mock';
import { itemFingerprint } from '../src/engine/exposures';

const T0 = Date.UTC(2026, 9, 20, 15);
const DAY = 24 * 60 * 60 * 1000;

/** A simulated child who answers correctly exactly when the question is at or below their true level. */
function simulate(subject: MockSubject, trueLevel: number, state: AppState = emptyState()) {
  const run = newMockRun(subject, 2, T0);
  let guard = 0;
  for (let step = nextMockStep(state, run); step && guard < 100; step = nextMockStep(state, run), guard++) {
    run.answers.push({ strand: step.strand, skill: step.skill.id, itemId: step.item.id, fingerprint: itemFingerprint(step.item), repeated: step.repeated, level: step.level, target: step.target, correct: step.level <= trueLevel, ts: T0 + guard });
  }
  return { run, result: scoreMock(run) };
}

describe('mock i-Ready', () => {
  for (const subject of ['math', 'reading'] as const) {
    it(`asks the right number of questions, evenly across every i-Ready domain (${subject})`, () => {
      const { run } = simulate(subject, 4);
      expect(run.answers).toHaveLength(mockTotal(subject));
      for (const d of MOCK_DOMAINS[subject]) expect(run.answers.filter((a) => a.strand === d.strand)).toHaveLength(MOCK_PER_DOMAIN[subject]);
      expect(new Set(run.answers.map((a) => a.itemId)).size).toBe(run.answers.length);
    });
  }

  it('adjusts the internal selection ladder without presenting it as a calibrated score', () => {
    const run = newMockRun('math', 2, T0);
    expect(domainLevel(run, 'number')).toBe(2);
    run.answers.push({ strand:'number', skill:'m.count10', itemId:'a', level:2, correct:true, ts:T0 });
    expect(domainLevel(run, 'number')).toBe(4);
    run.answers.push({ strand:'number', skill:'m.count10', itemId:'b', level:4, correct:false, ts:T0+1 });
    expect(domainLevel(run, 'number')).toBe(2);
  });

  it('reports a sample of app questions without assigning a school grade level', () => {
    const { result } = simulate('math', 4);
    expect(result.overallLabel).toBe('Performance on this app’s questions');
    expect(result.domains.every(d => d.freshTotal !== undefined)).toBe(true);
  });

  it('never uses India-only or language-track questions', () => {
    const india: AppState = { ...emptyState(), settings: { ...emptyState().settings, curricula: ['us-ga', 'in-cbse'], languages: ['hi', 'kn'] } };
    const { run } = simulate('math', 5, india);
    expect(run.answers.every((a) => !getSkill(a.skill)!.regions?.includes('in-cbse') || getSkill(a.skill)!.regions?.includes('us-ga'))).toBe(true);
    expect(run.answers.every((a) => !getSkill(a.skill)!.language)).toBe(true);
  });

  it('resumes where it left off', () => {
    const state = emptyState();
    const run = newMockRun('math', 2, T0);
    for (let i = 0; i < 10; i++) {
      const step = nextMockStep(state, run)!;
      run.answers.push({ strand: step.strand, skill: step.skill.id, itemId: step.item.id, fingerprint: itemFingerprint(step.item), repeated: step.repeated, level: step.level, correct: i % 2 === 0, ts: T0 + i });
    }
    const saved = JSON.parse(JSON.stringify(run));
    const next = nextMockStep(state, saved)!;
    expect(next).not.toBeNull();
    expect(saved.answers.map((a: { itemId: string }) => a.itemId)).not.toContain(next.item.id);
  });

  it('expected Kindergarten level in December is “Mid K”-ish and labels are ordered', () => {
    const dec = expectedLevel('K', new Date(2026, 11, 2));
    expect(levelLabel(dec)).toMatch(/K$/);
    expect(levelLabel(0)).toBe('Early K');
    expect(levelLabel(LADDER_MAX)).toBe('Late Grade 2 or above');
  });
});

describe('focus pins', () => {
  it('a pinned skill leads every daily Quest, rotating through the pins', () => {
    const pins = ['m1.time', 'm1.coins', 'm1.patternrule'];
    const s: AppState = { ...emptyState(), settings: { ...emptyState().settings, focus: pins } };
    const leaders = new Set<string>();
    for (let day = 0; day < 6; day++) {
      const quest = buildQuest(s, T0 + day * DAY);
      const pinnedInQuest = quest.filter((q) => pins.includes(q.skill.id));
      expect(pinnedInQuest.length).toBeGreaterThanOrEqual(2);
      leaders.add(pinnedInQuest[0].skill.id);
    }
    expect(leaders.size).toBe(3);
  });
});
