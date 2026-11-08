import { contentIssue } from './contentIssues';
import { ALL_SKILLS } from '../content';
import { isVisible } from './planner';
import { dayKey, skillState } from './progress';
import type { AppState } from './progress';

export function learningSummary(state: AppState, now = Date.now()) {
  const since = now - 14 * 86400000;
  const rows = ALL_SKILLS.filter((s) => ['math', 'reading'].includes(s.subject) && isVisible(state, s)).map((skill) => {
    const attempts = state.attempts
      .filter((a) => a.skill === skill.id && a.ts >= since && !contentIssue(a))
      .sort((a, b) => a.ts - b.ts)
      .slice(-8);
    const misses = attempts.filter((a) => !a.correct).length;
    const fresh = attempts.filter((a) => a.repeated === false);
    const days = new Set(fresh.filter((a) => a.correct).map((a) => dayKey(a.ts))).size;
    const distinct = new Set(fresh.filter((a) => a.correct).map((a) => a.fingerprint ?? a.itemId)).size;
    return { skill, attempts, misses, fresh, days, distinct, latest: attempts.at(-1)?.ts ?? 0 };
  });
  return {
    revisit: rows
      .filter((r) => r.misses > 0)
      .sort((a, b) => b.latest - a.latest || b.misses - a.misses)
      .slice(0, 3),
    demonstrated: rows
      .filter((r) => r.fresh.length >= 6 && r.misses === 0 && r.days >= 3 && r.distinct >= 4)
      .slice(0, 3),
    developing: rows.filter(
      (r) => r.attempts.length > 0 && !(r.fresh.length >= 6 && r.misses === 0 && r.days >= 3 && r.distinct >= 4),
    ).length,
    established: ALL_SKILLS.filter(
      (s) => isVisible(state, s) && skillState(state, s.id).mastered && !skillState(state, s.id).known,
    ).length,
    markedKnown: ALL_SKILLS.filter((s) => isVisible(state, s) && skillState(state, s.id).known).length,
  };
}
