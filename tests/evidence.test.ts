import { describe, it, expect } from 'vitest';
import { emptyState, recordAttempt, upgradeState, meetsMastery, recordGame } from '../src/engine/progress';
import type { Attempt } from '../src/engine/progress';
import type { Item, Skill } from '../src/content/types';
import {
  pickAssessmentItem,
  buildSkipChallenge,
  startPlacement,
  placementNext,
  placementAnswer,
  applyPlacement,
  buildQuest,
} from '../src/engine/planner';
import { questionFingerprint, evidenceLabel } from '../src/engine/evidence';
import { learningSummary } from '../src/engine/insights';
const NOW = Date.UTC(2026, 10, 4, 16);
const question = (id: string, value: number): Item => ({
  id,
  skill: 'm.count10',
  difficulty: 2,
  say: `How many apples?`,
  visual: { kind: 'objects', emoji: '🍎', count: value },
  choices: [
    { id: 'yes', text: `${value}`, correct: true },
    { id: 'no', text: `${value + 1}` },
  ],
  explain: `There are ${value} apples.`,
});
const attempt = (item: Item, correct = false): Attempt => ({
  itemId: item.id,
  skill: item.skill,
  d: item.difficulty,
  correct,
  ts: NOW,
  mode: 'quest',
  fingerprint: questionFingerprint(item),
  repeated: false,
  selectedChoiceId: correct ? 'yes' : 'no',
  question: correct ? undefined : item,
});
const skill = (items: Item[]): Skill => ({
  id: 'm.count10',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Count',
  kidTitle: 'Count',
  icon: '',
  prereqs: [],
  standards: [],
  parentTip: '',
  intro: [],
  items,
});

describe('credible learning evidence', () => {
  it('recognizes the same question despite shuffled answers and changed IDs', () => {
    const a = question('a', 2),
      b = {
        ...a,
        id: 'new-id',
        choices: a.choices
          .slice()
          .reverse()
          .map((c, i) => ({ ...c, id: `${i}` })),
      };
    expect(questionFingerprint(a)).toBe(questionFingerprint(b));
    expect(questionFingerprint(a)).not.toBe(questionFingerprint(question('c', 3)));
    expect(questionFingerprint(a).length).toBeLessThan(30);
  });
  it('avoids a previously practised question at equivalent difficulty', () => {
    const a = question('a', 2),
      b = question('b', 3);
    const state = recordAttempt(emptyState(), attempt(a));
    const chosen = pickAssessmentItem(state, skill([a, b]), 2);
    expect(chosen.item.id).toBe('b');
    expect(chosen.repeated).toBe(false);
  });
  it('recognizes familiar content under a new ID and still finishes when fresh items run out', () => {
    const a = question('a', 2),
      b = { ...a, id: 'new-id' };
    const state = recordAttempt(emptyState(), attempt(a));
    const chosen = pickAssessmentItem(state, skill([b]), 2);
    expect(chosen.item.id).toBe('new-id');
    expect(chosen.repeated).toBe(true);
  });
  it('finishes a tiny skip-check pool while flagging repeated questions', () => {
    const only = { ...question('one', 2), difficulty: 3 as const };
    const steps = buildSkipChallenge(emptyState(), skill([only]));
    expect(steps).toHaveLength(3);
    expect(steps.map(s => s.repeated)).toEqual([false, true, true]);
  });
  it('keeps the exact generated question, choice order and selected answer through backup', () => {
    const a = question('generated-2', 2);
    a.choices.reverse();
    const state = recordAttempt(emptyState(), attempt(a));
    const restored = upgradeState(JSON.parse(JSON.stringify(state)));
    expect(restored.ok).toBe(true);
    if (!restored.ok) return;
    expect(restored.state.attempts[0].question).toEqual(a);
    expect(restored.state.attempts[0].selectedChoiceId).toBe('no');
    expect(restored.state.attempts[0].question?.choices.find((c) => c.correct)?.id).toBe('yes');
  });
  it('bounds detailed history without silently deleting attempt metadata', () => {
    let state = emptyState();
    for (let i = 0; i < 205; i++) state = recordAttempt(state, { ...attempt(question(`q${i}`, i)), ts: NOW + i });
    expect(state.attempts.length).toBe(205);
    expect(state.attempts.filter((a) => a.question).length).toBe(200);
    expect(state.attempts[0].question).toBeUndefined();
    expect(state.attempts[0].selectedChoiceId).toBe('no');
  });
  it('does not call repeated success or a single good sitting retained mastery', () => {
    const repeated = Array.from({ length: 8 }, (_, i) => ({
      ...attempt(question(`q${i}`, i), true),
      ts: NOW + i * 86400000,
      repeated: true,
    }));
    expect(meetsMastery(repeated)).toBe(false);
    const state = { ...emptyState(), attempts: repeated };
    expect(learningSummary(state, NOW + 8 * 86400000).demonstrated).toHaveLength(0);
    state.attempts = repeated.map((a) => ({ ...a, repeated: false, ts: NOW }));
    expect(learningSummary(state, NOW).demonstrated).toHaveLength(0);
    expect(evidenceLabel(2, 2)).toBe('Limited evidence');
    expect(evidenceLabel(6, 6, 1)).toBe('Includes familiar questions');
  });
  it('spreads a short startup check across areas and credits only directly demonstrated skills', () => {
    const state = emptyState();
    const run = startPlacement(state, 'math');
    run.cap = 12;
    run.perStrandCap = 3;
    const subjects = new Set<string>();
    const asked = new Set<string>();
    for (let step = placementNext(state, run); step; step = placementNext(state, run)) {
      subjects.add(step.strand);
      asked.add(step.skill.id);
      placementAnswer(run, true);
    }
    expect(run.asked).toBeLessThanOrEqual(12);
    expect(subjects.size).toBe(run.strands.length);
    expect(run.known.every((id) => asked.has(id))).toBe(true);
    const applied = applyPlacement(state, run, NOW);
    expect(
      Object.values(applied.skills)
        .filter((s) => s.provisional)
        .every((s) => !s.mastered),
    ).toBe(true);
    expect(buildQuest(applied, NOW).some((q) => applied.skills[q.skill.id]?.provisional)).toBe(false);
  });
  it('keeps game coaching separate from academic mastery and preserves it in backups', () => {
    const state = recordGame(emptyState(), 'mystery-word', 'assisted', NOW, {
      prompt: 'Spell cat',
      answer: 'cat',
      hints: 1,
      mistakes: ['Position 1: selected b; expected c.'],
    });
    expect(state.gameReviews?.[0].mistakes[0]).toContain('selected b');
    expect(state.attempts).toHaveLength(0);
    expect(state.skills).toEqual({});
    expect(upgradeState(JSON.parse(JSON.stringify(state))).ok).toBe(true);
  });
});

describe('progress upgrades', () => {
  it('preserves older progress and never invents a missing answer snapshot', () => {
    const old = {
      ...emptyState(),
      version: 2,
      profile: { name: 'Existing learner', avatar: '🦁', createdAt: NOW },
      attempts: [{ itemId: 'old', skill: 'm.count10', d: 2, correct: false, ts: NOW, mode: 'quest' }],
    };
    const result = upgradeState(old);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.version).toBe(3);
    expect(result.state.profile?.name).toBe('Existing learner');
    expect(result.state.attempts).toEqual(old.attempts);
    expect(result.state.attempts[0].question).toBeUndefined();
  });
});
