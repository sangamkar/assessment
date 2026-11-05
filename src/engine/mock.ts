import { ALL_SKILLS, getSubject } from '../content';
import type { Difficulty, Grade, Skill } from '../content/types';
import { NOISE_TAGS } from '../content/misconceptions';
import type { AppState } from './progress';
import type { QuestStep } from './planner';
import { pickAssessmentItem } from './planner';
import { evidenceLabel } from './evidence';

/** Independent adaptive practice check. Numeric ladder values only select questions;
 * they are not calibrated grade placements, standardized scores, or school norms. */

export type MockSubject = 'math' | 'reading';
const GRADES: Grade[] = ['K', '1', '2'];
export const LADDER_MAX = 8;

export const MOCK_DOMAINS: Record<MockSubject, { strand: string; title: string }[]> = {
  math: [
    { strand: 'number', title: 'Number and Operations' },
    { strand: 'algebra', title: 'Algebra and Algebraic Thinking' },
    { strand: 'measure', title: 'Measurement and Data' },
    { strand: 'geometry', title: 'Geometry' },
  ],
  reading: [
    { strand: 'phonological', title: 'Phonological Awareness' },
    { strand: 'phonics', title: 'Phonics' },
    { strand: 'hfw', title: 'High-Frequency Words' },
    { strand: 'vocab', title: 'Vocabulary' },
    { strand: 'lit', title: 'Comprehension: Literature' },
    { strand: 'info', title: 'Comprehension: Informational Text' },
  ],
};

/** App-specific question budgets, split into short sittings. */
export const MOCK_PER_DOMAIN: Record<MockSubject, number> = { math: 8, reading: 6 };
export const MOCK_BREAK_EVERY = 12;

export interface MockAnswer {
  strand: string;
  skill: string;
  itemId: string;
  fingerprint?: string;
  repeated?: boolean;
  level: number;
  /** Level the staircase asked for; above `level` when the domain had no harder questions. */
  target?: number;
  correct: boolean;
  why?: string;
  ts: number;
}

export interface MockRun {
  id: string;
  subject: MockSubject;
  startedAt: number;
  /** Ladder level each domain starts at (2 = late Kindergarten). */
  startLevel: number;
  answers: MockAnswer[];
}

export interface MockDomainResult {
  strand: string;
  title: string;
  estimate: number;
  label: string;
  correct: number;
  total: number;
  /** The app cannot provide harder content here; no higher ability is inferred. */
  ceiling: boolean;
  repeated?: number;
  untracked?: number;
}

export interface MockResult {
  id: string;
  subject: MockSubject;
  ts: number;
  overall: number;
  overallLabel: string;
  domains: MockDomainResult[];
  misconceptions: { tag: string; count: number }[];
  practice: string[];
  repeated?: number;
  untracked?: number;
}

export const ladderOf = (grade: Grade, d: Difficulty) => GRADES.indexOf(grade) * 3 + (d - 1);
const fromLadder = (level: number): { grade: Grade; d: Difficulty } => ({ grade: GRADES[Math.floor(level / 3)], d: ((level % 3) + 1) as Difficulty });

/** Skills that represent a domain on a US i-Ready test (no India-only or language-track skills). */
function domainSkills(subject: MockSubject, strand: string): Skill[] {
  return ALL_SKILLS.filter((s) => s.subject === subject && s.strand === strand && !s.language && (!s.regions || s.regions.includes('us-ga')));
}

/** Staircase: big steps for the first two answers in a domain, then single steps. */
export function domainLevel(run: MockRun, strand: string): number {
  let level = run.startLevel;
  run.answers
    .filter((a) => a.strand === strand)
    .forEach((a, i) => {
      const step = i < 2 ? 2 : 1;
      level = Math.max(0, Math.min(LADDER_MAX, level + (a.correct ? step : -step)));
    });
  return level;
}

export function mockTotal(subject: MockSubject) {
  return MOCK_DOMAINS[subject].length * MOCK_PER_DOMAIN[subject];
}

export function nextMockStep(state: AppState, run: MockRun): (QuestStep & { strand: string; level: number; target: number }) | null {
  const per = MOCK_PER_DOMAIN[run.subject];
  const domains = MOCK_DOMAINS[run.subject];
  // Interleave domains: next is the domain with the fewest answers so far.
  const counts = domains.map((d) => run.answers.filter((a) => a.strand === d.strand).length);
  const min = Math.min(...counts);
  if (min >= per) return null;
  const domain = domains[counts.indexOf(min)];
  const target = domainLevel(run, domain.strand);
  const { grade, d } = fromLadder(target);
  const pool = domainSkills(run.subject, domain.strand);
  // Nearest grade first, least-used skill first; never repeat a question if any other skill has a fresh one.
  const usedSkills = new Map<string, number>();
  run.answers.forEach((a) => usedSkills.set(a.skill, (usedSkills.get(a.skill) ?? 0) + 1));
  const dist = (k: Skill) => Math.abs(GRADES.indexOf(k.grade) - GRADES.indexOf(grade));
  const ordered = [...pool].sort((a, b) => dist(a) - dist(b) || (usedSkills.get(a.id) ?? 0) - (usedSkills.get(b.id) ?? 0));
  const seen = new Set(run.answers.map((a) => a.itemId));
  // Keep the nearest available grade; freshness never pushes a child into unrelated harder content.
  const nearest = dist(ordered[0]);
  const appropriate = ordered.filter(s => dist(s) === nearest);
  let skill = appropriate[0];
  let selected = pickAssessmentItem(state, skill, d, run.answers);
  for (const candidate of appropriate) {
    const next = pickAssessmentItem(state, candidate, d, run.answers);
    if (!next.repeated) { skill = candidate; selected = next; break; }
  }
  return { skill, ...selected, role: 'focus', strand: domain.strand, level: ladderOf(skill.grade, selected.item.difficulty), target };
}

/** Estimate = average level of the last 4 questions, nudged by how many of them were right. */
function estimate(answers: MockAnswer[]): number {
  if (!answers.length) return 0;
  const last = answers.slice(-4);
  const mean = last.reduce((n, a) => n + a.level, 0) / last.length;
  const acc = last.filter((a) => a.correct).length / last.length;
  return Math.max(0, Math.min(LADDER_MAX, mean + (acc - 0.5) * 2));
}

export function scoreMock(run: MockRun): MockResult {
  const domains = MOCK_DOMAINS[run.subject].map((d) => {
    const mine = run.answers.filter((a) => a.strand === d.strand);
    const est = estimate(mine);
    const top = Math.max(...domainSkills(run.subject, d.strand).map((s) => ladderOf(s.grade, 3)));
    // Ceiling: he reached the hardest questions we have, or kept answering right when we could not serve harder ones.
    const lastThree = mine.slice(-3);
    const starved = lastThree.length === 3 && lastThree.every((a) => a.correct) && lastThree.some((a) => a.target !== undefined && a.level < a.target);
    const ceiling = mine.length > 0 && (est >= top - 0.5 || starved);
    const correct = mine.filter(a => a.correct).length;
    const repeated = mine.filter(a => a.repeated).length;
    return { strand: d.strand, title: d.title, estimate: est, label: mine.some(a => a.repeated === undefined) ? 'Limited evidence' : evidenceLabel(correct, mine.length, repeated), untracked: mine.filter(a => a.repeated === undefined).length, correct, total: mine.length, ceiling, repeated };
  });
  const overall = domains.reduce((n, d) => n + d.estimate, 0) / domains.length;
  const tags = new Map<string, number>();
  run.answers.forEach((a) => !a.correct && a.why && !NOISE_TAGS.has(a.why) && tags.set(a.why, (tags.get(a.why) ?? 0) + 1));
  // Practise next: the lowest-level skills he missed, per domain.
  const practice = [...new Set(run.answers.filter((a) => !a.correct).sort((a, b) => a.level - b.level).map((a) => a.skill))].slice(0, 6);
  return {
    id: run.id,
    subject: run.subject,
    ts: run.answers[run.answers.length - 1]?.ts ?? run.startedAt,
    overall,
    overallLabel: "Performance on this app’s questions",
    repeated: run.answers.filter(a => a.repeated).length,
    untracked: run.answers.filter(a => a.repeated === undefined).length,
    domains,
    misconceptions: [...tags.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
    practice,
  };
}

export function newMockRun(subject: MockSubject, startLevel = 2, now = Date.now()): MockRun {
  return { id: `mock-${subject}-${now}`, subject, startedAt: now, startLevel, answers: [] };
}

export const mockTitle = (subject: MockSubject) => `Practice check · ${getSubject(subject).title}`;
