import { ALL_SKILLS, getSkill, getSubject } from '../content';
import { KINDERGARTEN_NUMBER_SKILLS } from '../content/kindergartenNumbers';
import { KINDERGARTEN_VISUAL_SKILLS } from '../content/kindergartenVisual';
import type { Difficulty, Grade, Skill } from '../content/types';
import { NOISE_TAGS } from '../content/misconceptions';
import type { AppState } from './progress';
import type { QuestStep } from './planner';
import { present } from './planner';
import { isFreshEvidence, itemFingerprint } from './exposures';
import { isNewReserve, poolItems } from './itemPools';
import type { Item } from '../content/types';

/* Adaptive app practice check. The ladder selects content; it is not a
 * calibrated grade placement, official i-Ready score, or readiness prediction. */

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

/** Questions per domain. ~32 math / ~36 reading, close to a real K–1 diagnostic sitting split in parts. */
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
  /** He reached the hardest questions the app has for this domain, so his true level may be higher. */
  ceiling: boolean;
  freshCorrect?: number;
  freshTotal?: number;
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

export function levelLabel(x: number): string {
  const labels = ['Early K', 'Mid K', 'Late K', 'Early Grade 1', 'Mid Grade 1', 'Late Grade 1', 'Early Grade 2', 'Mid Grade 2', 'Late Grade 2 or above'];
  return labels[Math.max(0, Math.min(LADDER_MAX, Math.round(x)))];
}

/** Where a kindergartner is expected to be at a given month (school year Aug–May). */
export function expectedLevel(grade: Grade, date: Date): number {
  const month = date.getMonth(); // 0 = Jan
  const fraction = month >= 7 ? (month - 7) / 10 : (month + 5) / 10; // Aug → 0, May → 0.9
  return GRADES.indexOf(grade) * 3 + fraction * 3;
}

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

const newlyAuthored = new Set([...KINDERGARTEN_NUMBER_SKILLS, ...KINDERGARTEN_VISUAL_SKILLS].map(s => s.id));
export interface PoolCandidate { skill: Skill; item: Item }
/** An unused task within this run always precedes any repeat. */
export function chooseMockCandidate(state: AppState, answers: MockAnswer[], candidates: PoolCandidate[]): { candidate: PoolCandidate; repeated: boolean } | undefined {
  const practiceIds = new Set(state.exposures.practiceIds);
  const practicePrints = new Set(state.exposures.practiceFingerprints), mockPrints = new Set(state.exposures.mockFingerprints);
  const unknownPractice = new Set(state.exposures.untrackedPracticeSkills), unknownMock = new Set(state.exposures.untrackedMockSkills);
  const usesById = new Map<string, number>(), usesByPrint = new Map<string, number>();
  answers.forEach(a => { if (a.fingerprint?.startsWith('fp2:')) usesByPrint.set(a.fingerprint, (usesByPrint.get(a.fingerprint) ?? 0) + 1); else usesById.set(a.itemId, (usesById.get(a.itemId) ?? 0) + 1); });
  const oldSubjects = new Set<string>();
  for (const id of [...unknownPractice, ...unknownMock, ...answers.filter(a => !a.fingerprint?.startsWith('fp2:')).map(a => a.skill)]) {
    const subject = getSkill(id)?.subject;
    if (id === '__subject_math__') oldSubjects.add('math');
    else if (id === '__subject_reading__') oldSubjects.add('reading');
    else if (subject) oldSubjects.add(subject);
    else if (id.startsWith('m.')) oldSubjects.add('math');
    else if (id.startsWith('r.')) oldSubjects.add('reading');
    else { oldSubjects.add('math'); oldSubjects.add('reading'); }
  }
  const eligible = candidates.map(candidate => {
    const { skill, item } = candidate, fp = itemFingerprint(item);
    const uses = Math.max(usesById.get(item.id) ?? 0, usesByPrint.get(fp) ?? 0);
    const newTask = isNewReserve(item) || (newlyAuthored.has(skill.id) && !unknownPractice.has(skill.id) && !unknownMock.has(skill.id));
    const uncertainSubject = oldSubjects.has(skill.subject);
    const repeated = uses > 0 || practicePrints.has(fp) || mockPrints.has(fp) || (uncertainSubject && !newTask);
    return { candidate, fp, uses, repeated, newTask, uncertainSubject };
  }).filter(x => !(unknownPractice.has(x.candidate.skill.id) && practiceIds.has(x.candidate.item.id)) && !practicePrints.has(x.fp) && (!x.uncertainSubject || x.newTask));
  const unused = eligible.filter(x => x.uses === 0);
  const fresh = unused.filter(x => !x.repeated);
  const pool = fresh.length ? fresh : unused.length ? unused : eligible;
  if (!pool.length) return undefined;
  const minimum = Math.min(...pool.map(x => x.uses));
  const chosen = pool.find(x => x.uses === minimum)!;
  return { candidate: chosen.candidate, repeated: chosen.repeated };
}

export function nextMockStep(state: AppState, run: MockRun): (QuestStep & { strand: string; level: number; target: number }) | null {
  const per = MOCK_PER_DOMAIN[run.subject], domains = MOCK_DOMAINS[run.subject];
  const counts = domains.map(d => run.answers.filter(a => a.strand === d.strand).length);
  const min = Math.min(...counts);
  if (min >= per) return null;
  const domain = domains[counts.indexOf(min)], target = domainLevel(run, domain.strand);
  const { grade, d } = fromLadder(target);
  const skills = domainSkills(run.subject, domain.strand);
  const usedSkills = new Map<string, number>();
  run.answers.forEach(a => usedSkills.set(a.skill, (usedSkills.get(a.skill) ?? 0) + 1));
  const offset = Math.abs(run.startedAt) % skills.length;
  const rotated = [...skills.slice(offset), ...skills.slice(0, offset)];
  rotated.sort((a, b) => Math.abs(GRADES.indexOf(a.grade)-GRADES.indexOf(grade)) - Math.abs(GRADES.indexOf(b.grade)-GRADES.indexOf(grade)) || (usedSkills.get(a.id) ?? 0) - (usedSkills.get(b.id) ?? 0));
  const candidates = rotated.flatMap(skill => poolItems(skill, 'mock').filter(item => !item.regions || item.regions.includes('us-ga')).sort((a,b) => Math.abs(a.difficulty-d)-Math.abs(b.difficulty-d)).map(item => ({ skill, item })));
  const chosen = chooseMockCandidate(state, run.answers, candidates);
  if (!chosen) throw new Error(`No reserved mock questions available for ${domain.strand}`);
  const { skill, item } = chosen.candidate;
  // Keep the existing speech lifecycle: a repeated item gets a unique presentation ID.
  const shown = chosen.repeated || run.answers.some(a => a.itemId === item.id) ? { ...item, id: `${item.id}:presentation-${run.answers.length}` } : item;
  return { skill, item: present(shown), repeated: chosen.repeated, role: 'focus', strand: domain.strand, level: ladderOf(skill.grade, item.difficulty), target };
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
    const fresh = mine.filter(isFreshEvidence);
    const est = estimate(fresh);
    const top = Math.max(...domainSkills(run.subject, d.strand).map((s) => ladderOf(s.grade, 3)));
    // Ceiling: he reached the hardest questions we have, or kept answering right when we could not serve harder ones.
    const lastThree = fresh.slice(-3);
    const starved = lastThree.length === 3 && lastThree.every((a) => a.correct) && lastThree.some((a) => a.target !== undefined && a.level < a.target);
    const ceiling = fresh.length >= 3 && (est >= top - 0.5 || starved);
    return { strand: d.strand, title: d.title, estimate: est, label: fresh.length ? 'Fresh questions' : 'Limited evidence', correct: mine.filter(a => a.correct).length, total: mine.length, ceiling, freshCorrect: fresh.filter(a => a.correct).length, freshTotal: fresh.length, repeated: mine.filter(a => a.repeated === true).length, untracked: mine.filter(a => a.repeated === undefined || (a.repeated === false && !isFreshEvidence(a))).length };
  });
  const overall = domains.reduce((n, d) => n + d.estimate, 0) / domains.length;
  const tags = new Map<string, number>();
  run.answers.forEach((a) => isFreshEvidence(a) && !a.correct && a.why && !NOISE_TAGS.has(a.why) && tags.set(a.why, (tags.get(a.why) ?? 0) + 1));
  // Practise next: the lowest-level skills he missed, per domain.
  const practice = [...new Set(run.answers.filter((a) => isFreshEvidence(a) && !a.correct).sort((a, b) => a.level - b.level).map((a) => a.skill))].slice(0, 6);
  return {
    id: run.id,
    subject: run.subject,
    ts: run.answers[run.answers.length - 1]?.ts ?? run.startedAt,
    overall,
    overallLabel: 'Performance on this app’s questions',
    repeated: run.answers.filter(a => a.repeated === true).length,
    untracked: run.answers.filter(a => a.repeated === undefined || (a.repeated === false && !isFreshEvidence(a))).length,
    domains,
    misconceptions: [...tags.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count),
    practice,
  };
}

export function newMockRun(subject: MockSubject, startLevel = 2, now = Date.now()): MockRun {
  return { id: `mock-${subject}-${now}`, subject, startedAt: now, startLevel, answers: [] };
}

export const mockTitle = (subject: MockSubject) => `Mock i-Ready · ${getSubject(subject).title}`;
