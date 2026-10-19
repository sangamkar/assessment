import { ALL_SKILLS, SUBJECTS, getSkill, getSubject } from '../content';
import type { Difficulty, Item, Skill, SubjectId } from '../content/types';
import { NOISE_TAGS } from '../content/misconceptions';
import { createRng } from './rng';
import type { AppState, Attempt, Band, CheckupResult, StrandResult } from './progress';
import { accuracy, attemptsFor, skillState } from './progress';

export type SkillStatus = 'locked' | 'ready' | 'learning' | 'mastered' | 'review';

const rng = createRng();

/** A prerequisite is satisfied once it is mastered, credited, or solidly being practised. */
function prereqMet(state: AppState, id: string): boolean {
  const s = skillState(state, id);
  if (s.mastered || s.credited) return true;
  const list = attemptsFor(state, id);
  return list.length >= 5 && accuracy(list.slice(-8)) >= 0.7;
}

export function isVisible(state: AppState, skill: Skill): boolean {
  if (skill.regions && !skill.regions.some((r) => state.settings.curricula.includes(r))) return false;
  return skill.grade === 'K' || state.settings.showStretch;
}

export function skillStatus(state: AppState, skill: Skill, now = Date.now()): SkillStatus {
  const s = skillState(state, skill.id);
  if (s.mastered) return s.nextReview && s.nextReview <= now ? 'review' : 'mastered';
  if (attemptsFor(state, skill.id).length > 0) return 'learning';
  if (state.settings.unlockAll || skill.prereqs.every((p) => prereqMet(state, p))) return 'ready';
  return 'locked';
}

/* ------------------------------------------------------------------------ */
/* Item selection                                                           */
/* ------------------------------------------------------------------------ */

/** Shuffle answer positions (Q6). Numeric-only choice sets are sorted ascending instead. */
export function present(item: Item): Item {
  if (item.keepOrder) return item;
  const numeric = item.choices.every((c) => c.text !== undefined && !c.visual && /^\d+$/.test(c.text));
  const choices = numeric ? [...item.choices].sort((a, b) => Number(a.text) - Number(b.text)) : rng.shuffle(item.choices);
  return { ...item, choices };
}

export function pickItem(state: AppState, skill: Skill, level: Difficulty, avoid: Set<string> = new Set()): Item {
  const recent = new Set(state.attempts.slice(-30).map((a) => a.itemId));
  const written = (skill.items ?? []).filter((i) => !avoid.has(i.id));
  const useGenerator = skill.generate && (written.length === 0 || rng.next() < 0.6);
  if (useGenerator && skill.generate) {
    for (let tries = 0; tries < 8; tries++) {
      const item = skill.generate(rng, level);
      if (!avoid.has(item.id) && !recent.has(item.id)) return present(item);
    }
    return present(skill.generate(rng, level));
  }
  const pool = written.length ? written : skill.items ?? [];
  const byDistance = [...pool].sort((a, b) => {
    const da = Math.abs(a.difficulty - level) + (recent.has(a.id) ? 2 : 0);
    const db = Math.abs(b.difficulty - level) + (recent.has(b.id) ? 2 : 0);
    return da - db || rng.next() - 0.5;
  });
  return present(byDistance[0]);
}

/* ------------------------------------------------------------------------ */
/* Today's Quest                                                            */
/* ------------------------------------------------------------------------ */

export interface QuestStep {
  skill: Skill;
  item: Item;
  role: 'focus' | 'review' | 'stretch';
}

export const QUEST_LENGTH = 8;

/** Rotating subject order so every subject gets regular attention. */
function subjectRotation(state: AppState, now: number): SubjectId[] {
  const day = Math.floor(now / (24 * 60 * 60 * 1000));
  // Math and reading lead most days (i-Ready); the other subjects rotate in.
  const rest: SubjectId[] = ['science', 'reasoning', 'social'];
  if (ALL_SKILLS.some((s) => s.subject === 'hindi' && isVisible(state, s))) rest.push('hindi');
  const lead = rest[day % rest.length];
  return day % 2 === 0 ? ['math', 'reading', lead] : ['reading', 'math', lead];
}

export function focusSkills(state: AppState, now = Date.now()): Skill[] {
  const open = ALL_SKILLS.filter((s) => isVisible(state, s)).filter((s) => {
    const st = skillStatus(state, s, now);
    return st === 'ready' || st === 'learning';
  });
  const score = (s: Skill) => {
    const learning = attemptsFor(state, s.id).length > 0 ? 0 : 1;
    const grade = s.grade === 'K' ? 0 : 2;
    return learning + grade;
  };
  return open.sort((a, b) => score(a) - score(b));
}

export function buildQuest(state: AppState, now = Date.now()): QuestStep[] {
  const steps: QuestStep[] = [];
  const used = new Set<string>();
  const take = (skill: Skill, role: QuestStep['role'], level?: Difficulty) => {
    const st = skillState(state, skill.id);
    const item = pickItem(state, skill, level ?? (st.credited && st.level === 1 ? 2 : st.level), used);
    used.add(item.id);
    steps.push({ skill, item, role });
  };

  const candidates = focusSkills(state, now);
  const focus: Skill[] = [];
  for (const subject of subjectRotation(state, now)) {
    const s = candidates.find((c) => c.subject === subject && !focus.includes(c));
    if (s) focus.push(s);
    if (focus.length === 3) break;
  }
  for (const c of candidates) if (focus.length < 3 && !focus.includes(c)) focus.push(c);

  // Interleave focus skills (A, B, C, A, B, C) — mixed practice sticks better than blocks.
  for (let round = 0; round < 2; round++) focus.forEach((s) => take(s, 'focus'));

  const due = ALL_SKILLS.filter((s) => skillStatus(state, s, now) === 'review');
  const mastered = ALL_SKILLS.filter((s) => skillState(state, s.id).mastered);
  const reviewPool = due.length ? due : mastered;
  if (reviewPool.length) take(rng.pick(reviewPool), 'review', 2);

  const puzzles = ALL_SKILLS.filter((s) => s.subject === 'reasoning' && isVisible(state, s) && ['ready', 'learning'].includes(skillStatus(state, s, now)));
  if (puzzles.length) take(rng.pick(puzzles), 'stretch');

  while (steps.length < QUEST_LENGTH && (focus.length || candidates.length)) {
    const s = focus[steps.length % Math.max(focus.length, 1)] ?? candidates[0];
    take(s, 'focus');
  }
  // End on a familiar focus item rather than the stretch puzzle, so the Quest finishes on a success.
  const out = steps.slice(0, QUEST_LENGTH);
  const extras = out.filter((x) => x.role !== 'focus');
  const core = out.filter((x) => x.role === 'focus');
  const mid = Math.ceil(core.length / 2);
  return [...core.slice(0, mid), ...extras, ...core.slice(mid)];
}

export function buildSkillSession(state: AppState, skill: Skill, length = 6): QuestStep[] {
  const used = new Set<string>();
  const level = skillState(state, skill.id).level;
  return Array.from({ length }, () => {
    const item = pickItem(state, skill, level, used);
    used.add(item.id);
    return { skill, item, role: 'focus' as const };
  });
}

/* ------------------------------------------------------------------------ */
/* Check-up (adaptive, no feedback)                                         */
/* ------------------------------------------------------------------------ */

export interface CheckupPlan {
  subject: SubjectId;
  /** Skills per strand, easiest first. */
  strands: { strand: string; title: string; skills: Skill[] }[];
  perStrand: number;
}

function depth(skill: Skill, memo = new Map<string, number>()): number {
  if (memo.has(skill.id)) return memo.get(skill.id)!;
  const d = skill.prereqs.length ? 1 + Math.max(...skill.prereqs.map((p) => depth(getSkill(p)!, memo))) : 0;
  memo.set(skill.id, d);
  return d;
}

export function planCheckup(state: AppState, subject: SubjectId): CheckupPlan {
  const meta = getSubject(subject);
  const strands = meta.strands
    .map((st) => ({
      strand: st.id,
      title: st.title,
      skills: ALL_SKILLS.filter((s) => s.subject === subject && s.strand === st.id && isVisible(state, s)).sort((a, b) => depth(a) - depth(b) || (a.grade < b.grade ? -1 : 1)),
    }))
    .filter((s) => s.skills.length);
  const perStrand = Math.max(2, Math.min(4, Math.floor(12 / strands.length)));
  return { subject, strands, perStrand };
}

export interface CheckupAnswer {
  skill: string;
  itemId: string;
  d: Difficulty;
  correct: boolean;
  strand: string;
}

/**
 * Within each strand: start at difficulty 2 on the easiest skill.
 * Correct → difficulty 3, then on to the next skill. Wrong → one step easier.
 */
export function nextCheckupItem(state: AppState, plan: CheckupPlan, answered: CheckupAnswer[]): (QuestStep & { strand: string }) | null {
  const seen = new Set(answered.map((a) => a.itemId));
  for (const st of plan.strands) {
    const mine = answered.filter((a) => a.strand === st.strand);
    if (mine.length >= plan.perStrand) continue;
    let index = 0;
    let d: Difficulty = 2;
    for (const a of mine) {
      index = st.skills.findIndex((s) => s.id === a.skill);
      if (a.correct && a.d < 3) d = 3;
      else if (a.correct && index < st.skills.length - 1) {
        index++;
        d = 2;
      } else if (!a.correct) d = Math.max(1, a.d - 1) as Difficulty;
    }
    const skill = st.skills[index];
    return { skill, item: pickItem(state, skill, d, seen), role: 'focus', strand: st.strand };
  }
  return null;
}

const bandFor = (ratio: number): Band => (ratio >= 0.8 ? 'Strong' : ratio >= 0.6 ? 'On track' : ratio >= 0.4 ? 'Growing' : 'Needs practice');

export function scoreCheckup(plan: CheckupPlan, attempts: (Attempt & { strand: string })[]): CheckupResult {
  const strands: StrandResult[] = plan.strands.map((st) => {
    const mine = attempts.filter((a) => a.strand === st.strand);
    const points = mine.reduce((n, a) => n + (a.correct ? a.d : 0), 0);
    const max = mine.reduce((n, a) => n + Math.max(a.d, 2), 0) || 1;
    return { strand: st.strand, title: st.title, points, max, band: bandFor(points / max) };
  });
  const tags = new Map<string, number>();
  attempts.forEach((a) => {
    if (!a.correct && a.why && !NOISE_TAGS.has(a.why)) tags.set(a.why, (tags.get(a.why) ?? 0) + 1);
  });
  const missed = [...new Set(attempts.filter((a) => !a.correct).map((a) => a.skill))];
  return {
    id: `${plan.subject}-${Date.now()}`,
    subject: plan.subject,
    ts: Date.now(),
    strands,
    correct: attempts.filter((a) => a.correct).length,
    total: attempts.length,
    misconceptions: [...tags.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
    recommend: missed,
  };
}

/** Skills answered correctly at difficulty 3 in a Check-up are credited. */
export function creditFromCheckup(state: AppState, attempts: Attempt[]): AppState {
  const skills = { ...state.skills };
  for (const a of attempts) {
    if (a.correct && a.d === 3) {
      const s = skillState(state, a.skill);
      skills[a.skill] = { ...s, credited: true, level: Math.max(s.level, 2) as Difficulty };
    }
  }
  return { ...state, skills };
}

/* ------------------------------------------------------------------------ */
/* Parent insights                                                          */
/* ------------------------------------------------------------------------ */

export function topMisconceptions(state: AppState, sinceDays = 30, limit = 6) {
  const since = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
  const tags = new Map<string, { count: number; skills: Set<string> }>();
  for (const a of state.attempts) {
    if (a.ts < since || a.correct || !a.why || NOISE_TAGS.has(a.why)) continue;
    const t = tags.get(a.why) ?? { count: 0, skills: new Set<string>() };
    t.count++;
    t.skills.add(a.skill);
    tags.set(a.why, t);
  }
  return [...tags.entries()]
    .map(([tag, v]) => ({ tag, count: v.count, skills: [...v.skills] }))
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function weakestSkills(state: AppState, limit = 5) {
  return ALL_SKILLS.map((s) => ({ skill: s, list: attemptsFor(state, s.id) }))
    .filter((x) => x.list.length >= 3 && !skillState(state, x.skill.id).mastered)
    .map((x) => ({ skill: x.skill, accuracy: accuracy(x.list.slice(-10)), attempts: x.list.length }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

export function subjectSummary(state: AppState, subject: SubjectId) {
  const skills = ALL_SKILLS.filter((s) => s.subject === subject && isVisible(state, s));
  const counts = { total: skills.length, mastered: 0, learning: 0, ready: 0, locked: 0 };
  for (const s of skills) {
    const st = skillStatus(state, s);
    if (st === 'mastered' || st === 'review') counts.mastered++;
    else counts[st]++;
  }
  return counts;
}

export { SUBJECTS };
