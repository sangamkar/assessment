import { ALL_SKILLS, getSubject } from "../content";
import type { Difficulty, Grade, Skill, Item } from "../content/types";
import { NOISE_TAGS } from "../content/misconceptions";
import type { AppState } from "./progress";
import type { QuestStep } from "./planner";
import { present } from "./planner";
import { createRng } from "./rng";
import {
  itemFingerprint,
  isMockItem,
  poolItems,
  legacyItemFamily,
} from "./itemPools";

/*
 * Mock i-Ready Diagnostic.
 *
 * Like the real test it is adaptive *within each domain*: every answer moves a
 * staircase up or down a 9-step ladder (K / Grade 1 / Grade 2 × difficulty 1–3).
 * Big steps first, then small steps, so it homes in quickly. The result is an
 * estimated working level per domain, phrased like i-Ready placements
 * ("Mid Grade 1"). It is an estimate from our own items, not an i-Ready scale score.
 */

export type MockSubject = "math" | "reading";
const GRADES: Grade[] = ["K", "1", "2"];
export const LADDER_MAX = 8;

export const MOCK_DOMAINS: Record<
  MockSubject,
  { strand: string; title: string }[]
> = {
  math: [
    { strand: "number", title: "Number and Operations" },
    { strand: "algebra", title: "Algebra and Algebraic Thinking" },
    { strand: "measure", title: "Measurement and Data" },
    { strand: "geometry", title: "Geometry" },
  ],
  reading: [
    { strand: "phonological", title: "Phonological Awareness" },
    { strand: "phonics", title: "Phonics" },
    { strand: "hfw", title: "High-Frequency Words" },
    { strand: "vocab", title: "Vocabulary" },
    { strand: "lit", title: "Comprehension: Literature" },
    { strand: "info", title: "Comprehension: Informational Text" },
  ],
};

/** Questions per domain. ~32 math / ~36 reading, close to a real K–1 diagnostic sitting split in parts. */
export const MOCK_PER_DOMAIN: Record<MockSubject, number> = {
  math: 8,
  reading: 6,
};
export const MOCK_BREAK_EVERY = 12;

export interface MockAnswer {
  strand: string;
  skill: string;
  itemId: string;
  fingerprint?: string;
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
}

export const ladderOf = (grade: Grade, d: Difficulty) =>
  GRADES.indexOf(grade) * 3 + (d - 1);
const fromLadder = (level: number): { grade: Grade; d: Difficulty } => ({
  grade: GRADES[Math.floor(level / 3)],
  d: ((level % 3) + 1) as Difficulty,
});

export function levelLabel(x: number): string {
  const labels = [
    "Early K",
    "Mid K",
    "Late K",
    "Early Grade 1",
    "Mid Grade 1",
    "Late Grade 1",
    "Early Grade 2",
    "Mid Grade 2",
    "Late Grade 2 or above",
  ];
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
  return ALL_SKILLS.filter(
    (s) =>
      s.subject === subject &&
      s.strand === strand &&
      !s.language &&
      (!s.regions || s.regions.includes("us-ga")),
  );
}

/** Staircase: big steps for the first two answers in a domain, then single steps. */
export function domainLevel(run: MockRun, strand: string): number {
  let level = run.startLevel;
  run.answers
    .filter((a) => a.strand === strand)
    .forEach((a, i) => {
      const step = i < 2 ? 2 : 1;
      level = Math.max(
        0,
        Math.min(LADDER_MAX, level + (a.correct ? step : -step)),
      );
    });
  return level;
}

export function mockTotal(subject: MockSubject) {
  return MOCK_DOMAINS[subject].length * MOCK_PER_DOMAIN[subject];
}

export function nextMockStep(
  state: AppState,
  run: MockRun,
): (QuestStep & { strand: string; level: number; target: number }) | null {
  const per = MOCK_PER_DOMAIN[run.subject];
  const domains = MOCK_DOMAINS[run.subject];
  // Interleave domains: next is the domain with the fewest answers so far.
  const counts = domains.map(
    (d) => run.answers.filter((a) => a.strand === d.strand).length,
  );
  const min = Math.min(...counts);
  if (min >= per) return null;
  const domain = domains[counts.indexOf(min)];
  const target = domainLevel(run, domain.strand);
  const { grade, d } = fromLadder(target);
  const pool = domainSkills(run.subject, domain.strand);
  // Nearest grade first, least-used skill first; never repeat a question if any other skill has a fresh one.
  const usedSkills = new Map<string, number>();
  run.answers.forEach((a) =>
    usedSkills.set(a.skill, (usedSkills.get(a.skill) ?? 0) + 1),
  );
  const dist = (k: Skill) =>
    Math.abs(GRADES.indexOf(k.grade) - GRADES.indexOf(grade));
  const ordered = [...pool].sort(
    (a, b) =>
      dist(a) - dist(b) ||
      (usedSkills.get(a.id) ?? 0) - (usedSkills.get(b.id) ?? 0),
  );
  // Prefer new tasks; repeats are allowed only inside the reserved mock pool.
  const seen = new Set([
    ...state.attempts.map((a) => a.itemId),
    ...run.answers.map((a) => a.itemId),
  ]);
  const signatures = new Set(
    [
      ...state.attempts.map((a) => a.fingerprint),
      ...run.answers.map((a) => a.fingerprint),
    ].filter((x): x is string => !!x),
  );
  // Pre-update authored attempts did not store fingerprints. Recover those from IDs.
  for (const k of ALL_SKILLS)
    for (const i of k.items ?? [])
      if (seen.has(i.id)) signatures.add(itemFingerprint(i));
  const legacyFamilies = new Set(
    [...state.attempts, ...run.answers]
      .filter((a) => !a.fingerprint)
      .map((a) => legacyItemFamily(a.itemId)),
  );
  const unseen = (item: Item) =>
    !seen.has(item.id) &&
    !legacyFamilies.has(legacyItemFamily(item.id)) &&
    !signatures.has(itemFingerprint(item));
  const rng = createRng(
    run.startedAt +
      run.answers.length * 1009 +
      run.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0),
  );
  const currentIds = new Set(run.answers.map((a) => a.itemId));
  const currentSignatures = new Set(
    run.answers.map((a) => a.fingerprint).filter((x): x is string => !!x),
  );
  const currentLegacyFamilies = new Set(
    run.answers
      .filter((a) => !a.fingerprint)
      .map((a) => legacyItemFamily(a.itemId)),
  );
  const notInThisRun = (item: Item) =>
    !currentIds.has(item.id) &&
    !currentLegacyFamilies.has(legacyItemFamily(item.id)) &&
    !currentSignatures.has(itemFingerprint(item));
  const select = (
    accept: (item: Item) => boolean,
  ): (QuestStep & { strand: string; level: number; target: number }) | null => {
    for (const skill of ordered) {
      const written = poolItems(skill, "mock")
        .filter((i) => (!i.regions || i.regions.includes("us-ga")) && accept(i))
        .sort(
          (a, b) => Math.abs(a.difficulty - d) - Math.abs(b.difficulty - d),
        );
      // Draw at the intended difficulty first; use another authored level only if needed.
      if (written[0] && written[0].difficulty === d)
        return {
          skill,
          item: present(written[0]),
          role: "focus",
          strand: domain.strand,
          level: ladderOf(skill.grade, written[0].difficulty),
          target,
        };
      if (skill.generate)
        for (let tries = 0; tries < 240; tries++) {
          const item = skill.generate(rng, d);
          if (isMockItem(item) && accept(item))
            return {
              skill,
              item: present(item),
              role: "focus",
              strand: domain.strand,
              level: ladderOf(skill.grade, item.difficulty),
              target,
            };
        }
      if (written[0])
        return {
          skill,
          item: present(written[0]),
          role: "focus",
          strand: domain.strand,
          level: ladderOf(skill.grade, written[0].difficulty),
          target,
        };
    }
    return null;
  };
  // Prefer never-seen questions, then prior-test questions not used in this sitting.
  // If even those run out, allow a repeat so the full test can finish.
  return select(unseen) ?? select(notInThisRun) ?? select(() => true);
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
    const top = Math.max(
      ...domainSkills(run.subject, d.strand).map((s) => ladderOf(s.grade, 3)),
    );
    // Ceiling: he reached the hardest questions we have, or kept answering right when we could not serve harder ones.
    const lastThree = mine.slice(-3);
    const starved =
      lastThree.length === 3 &&
      lastThree.every((a) => a.correct) &&
      lastThree.some((a) => a.target !== undefined && a.level < a.target);
    const ceiling = mine.length > 0 && (est >= top - 0.5 || starved);
    return {
      strand: d.strand,
      title: d.title,
      estimate: est,
      label: levelLabel(est),
      correct: mine.filter((a) => a.correct).length,
      total: mine.length,
      ceiling,
    };
  });
  const overall = domains.reduce((n, d) => n + d.estimate, 0) / domains.length;
  const tags = new Map<string, number>();
  run.answers.forEach(
    (a) =>
      !a.correct &&
      a.why &&
      !NOISE_TAGS.has(a.why) &&
      tags.set(a.why, (tags.get(a.why) ?? 0) + 1),
  );
  // Practise next: the lowest-level skills he missed, per domain.
  const practice = [
    ...new Set(
      run.answers
        .filter((a) => !a.correct)
        .sort((a, b) => a.level - b.level)
        .map((a) => a.skill),
    ),
  ].slice(0, 6);
  return {
    id: run.id,
    subject: run.subject,
    ts: run.answers[run.answers.length - 1]?.ts ?? run.startedAt,
    overall,
    overallLabel: levelLabel(overall),
    domains,
    misconceptions: [...tags.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
    practice,
  };
}

export function newMockRun(
  subject: MockSubject,
  startLevel = 2,
  now = Date.now(),
): MockRun {
  return {
    id: `mock-${subject}-${now}`,
    subject,
    startedAt: now,
    startLevel,
    answers: [],
  };
}

export const mockTitle = (subject: MockSubject) =>
  `Mock i-Ready · ${getSubject(subject).title}`;
