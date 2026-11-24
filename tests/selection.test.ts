import { describe, expect, it } from 'vitest';
import { getSkill } from '../src/content';
import { itemFingerprint, wasExposed } from '../src/engine/exposures';
import { buildQuest, buildSkillSession, focusSkills, pickItem } from '../src/engine/planner';
import type { QuestStep } from '../src/engine/planner';
import { emptyState, isSpacedRepeat, recordAttempt } from '../src/engine/progress';
import type { AppState, Mode } from '../src/engine/progress';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 10, 2, 15);

/** Records an answer the way App.tsx does (repeat and spaced-repeat flags included). */
function answer(state: AppState, step: QuestStep, mode: Mode, ts: number, seen: Set<string>, correct: boolean): AppState {
  const fingerprint = itemFingerprint(step.item);
  const inSession = seen.has(fingerprint);
  const repeated = !!step.repeated || wasExposed(state.exposures, step.item) || inSession;
  const spaced = repeated && isSpacedRepeat(state.attempts, step.item.id, fingerprint, ts) && !inSession;
  seen.add(fingerprint);
  return recordAttempt(state, { itemId: step.item.id, fingerprint, repeated, spaced, skill: step.skill.id, d: step.item.difficulty, correct, ts, mode });
}

/** Each day: Today's Quest, then a practice session on the top math and the top reading topic. */
function simulate(start: AppState, days: number) {
  let state = start;
  const served: { day: number; skill: string; grade: string; id: string; fp: string; ts: number; d: number }[] = [];
  let n = 0;
  for (let day = 0; day < days; day++) {
    const now = T0 + day * DAY;
    const play = (steps: QuestStep[], mode: Mode) => {
      const seen = new Set<string>();
      steps.forEach((step, i) => {
        const ts = now + (n++ % 500) * 1000 + i;
        served.push({ day, skill: step.skill.id, grade: step.skill.grade, id: step.item.id, fp: itemFingerprint(step.item), ts, d: step.item.difficulty });
        state = answer(state, step, mode, ts, seen, n % 12 !== 0);
      });
    };
    play(buildQuest(state, now), 'quest');
    for (const subject of ['math', 'reading']) {
      const top = focusSkills(state, now).find((s) => s.subject === subject);
      if (top) play(buildSkillSession(state, top), 'skill');
    }
  }
  return { state, served };
}

/** Share of questions he had already seen in the previous 7 days. */
function recentRepeatShare(served: ReturnType<typeof simulate>['served']) {
  let repeats = 0;
  served.forEach((q, i) => {
    if (served.slice(0, i).some((p) => p.fp === q.fp && q.ts - p.ts < 7 * DAY)) repeats++;
  });
  return repeats / served.length;
}

function topSkillShare(served: ReturnType<typeof simulate>['served']) {
  const counts = new Map<string, number>();
  served.forEach((q) => counts.set(q.skill, (counts.get(q.skill) ?? 0) + 1));
  return Math.max(...counts.values()) / served.length;
}

describe('question selection over weeks of daily use', () => {
  it.each([
    ['K', 0.15],
    ['1', 0.2],
  ] as const)('does not loop the same questions or let one topic take over (working level %s)', (grade, maxRepeats) => {
    const base = emptyState();
    const { served, state } = simulate({ ...base, settings: { ...base.settings, workingGrade: grade } }, 30);
    const share = recentRepeatShare(served);
    const top = topSkillShare(served);
    const mastered = Object.values(state.skills).filter((s) => s.mastered).length;
    console.log(`Level ${grade}, 30 days: ${served.length} questions, ${(share * 100).toFixed(0)}% seen in the last week, top topic ${(top * 100).toFixed(0)}%, ${new Set(served.map((q) => q.skill)).size} topics, ${mastered} mastered`);
    expect(share).toBeLessThan(maxRepeats);
    expect(top).toBeLessThan(0.12);
    expect(mastered).toBeGreaterThan(15);
  });

  it('a child set to work at Grade 1 gets Grade 1–2 topics, not Kindergarten', () => {
    const base = emptyState();
    const start = { ...base, settings: { ...base.settings, workingGrade: '1' as const } };
    const { served } = simulate(start, 5);
    const quest = served.filter((q) => q.skill && !q.skill.startsWith('q.') && getSkill(q.skill)!.subject !== 'science' && getSkill(q.skill)!.subject !== 'social');
    const above = quest.filter((q) => q.grade !== 'K').length / quest.length;
    console.log(`Grade 1 setting, first 5 days: ${(above * 100).toFixed(0)}% of math and reading questions from Grade 1–2`);
    expect(above).toBeGreaterThan(0.7);
  });

  it('serves questions at his level before fresher but easier ones', () => {
    const skill = getSkill('m.countback')!;
    for (let i = 0; i < 30; i++) {
      const item = pickItem(emptyState(), skill, 3, new Set());
      expect(item.difficulty).toBeGreaterThanOrEqual(2);
    }
  });
});
