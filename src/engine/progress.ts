import type { CurriculumId, Difficulty, LanguageCode } from '../content/types';

export type Mode = 'quest' | 'skill' | 'checkup' | 'placement' | 'skip';

export interface Attempt {
  itemId: string;
  skill: string;
  d: Difficulty;
  /** Correct on the first try — the only thing that counts toward mastery. */
  correct: boolean;
  why?: string;
  ts: number;
  mode: Mode;
}

export interface SkillState {
  introSeen: boolean;
  level: Difficulty;
  streak: number;
  mastered: boolean;
  masteredAt?: number;
  reviewStep: number;
  nextReview?: number;
  /** Shown as known in a Check-up, so Quests don't re-teach it from scratch. */
  credited?: boolean;
  /** Skipped because he already knows it: marked by a parent, or tested out (placement / skip-ahead). */
  known?: 'parent' | 'tested';
}

export interface StrandResult {
  strand: string;
  title: string;
  points: number;
  max: number;
  band: Band;
}
export type Band = 'Strong' | 'On track' | 'Growing' | 'Needs practice';

export interface CheckupResult {
  id: string;
  subject: string;
  ts: number;
  strands: StrandResult[];
  correct: number;
  total: number;
  misconceptions: { tag: string; count: number }[];
  recommend: string[];
}

export interface Settings {
  muted: boolean;
  unlockAll: boolean;
  showStretch: boolean;
  /** Curricula he is preparing for; region-only skills (Hindi, rupees…) appear when theirs is on. */
  curricula: CurriculumId[];
  /** Drives grade names, spelling, English accent and currency. */
  primary: CurriculumId;
  /** Indian language tracks switched on (shown when India is on). */
  languages: LanguageCode[];
}

export type GameId = 'mystery-word' | 'number-path' | 'sentence-builder';
export interface GameState {
  level: 1 | 2 | 3;
  played: number;
  won: number;
  streak: number;
}

export interface AppState {
  version: 1;
  profile?: { name: string; avatar: string; createdAt: number };
  settings: Settings;
  skills: Record<string, SkillState>;
  attempts: Attempt[];
  stars: number;
  days: string[];
  checkups: CheckupResult[];
  games: Partial<Record<GameId, GameState>>;
}

const KEY = 'learning-quest:v1';
const MAX_ATTEMPTS = 6000;
export const REVIEW_DAYS = [1, 3, 7, 14, 30];
const DAY = 24 * 60 * 60 * 1000;

export const MASTERY = { window: 8, minAttempts: 6, accuracy: 0.85, minHardAttempts: 3, minDays: 3 };

export function emptyState(): AppState {
  return { version: 1, settings: { muted: false, unlockAll: false, showStretch: true, curricula: ['us-ga'], primary: 'us-ga', languages: ['hi'] }, skills: {}, attempts: [], stars: 0, days: [], checkups: [], games: {} };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1) return emptyState();
    return { ...emptyState(), ...parsed, settings: { ...emptyState().settings, ...parsed.settings } };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: progress for this session still lives in memory.
  }
}

export const dayKey = (ts: number) => new Date(ts).toLocaleDateString('en-CA');

export function skillState(state: AppState, id: string): SkillState {
  return state.skills[id] ?? { introSeen: false, level: 1, streak: 0, mastered: false, reviewStep: 0 };
}

export function attemptsFor(state: AppState, skill: string): Attempt[] {
  return state.attempts.filter((a) => a.skill === skill);
}

export function accuracy(list: Attempt[]): number {
  return list.length ? list.filter((a) => a.correct).length / list.length : 0;
}

/**
 * Mastery = it stuck: over the most recent attempts, ≥85% first-try accuracy,
 * several at difficulty ≥ 2, correct answers on at least 3 different days.
 */
export function meetsMastery(list: Attempt[]): boolean {
  const recent = list.slice(-MASTERY.window);
  if (recent.length < MASTERY.minAttempts) return false;
  if (accuracy(recent) < MASTERY.accuracy) return false;
  if (recent.filter((a) => a.d >= 2).length < MASTERY.minHardAttempts) return false;
  const days = new Set(list.filter((a) => a.correct).map((a) => dayKey(a.ts)));
  return days.size >= MASTERY.minDays;
}

/** Records one answered item and returns the new state (immutable update). */
export function recordAttempt(state: AppState, attempt: Attempt): AppState {
  const prev = skillState(state, attempt.skill);
  const next: SkillState = { ...prev };
  if (attempt.mode === 'quest' || attempt.mode === 'skill') {
    if (attempt.correct) {
      next.streak = prev.streak + 1;
      if (next.streak >= 2 && prev.level < 3) {
        next.level = (prev.level + 1) as Difficulty;
        next.streak = 0;
      }
    } else {
      next.streak = 0;
      if (prev.level > 1) next.level = (prev.level - 1) as Difficulty;
    }
  }
  const attempts = [...state.attempts, attempt].slice(-MAX_ATTEMPTS);
  const practice = attempt.mode === 'quest' || attempt.mode === 'skill';
  const list = attempts.filter((a) => a.skill === attempt.skill);

  if (prev.mastered && prev.nextReview && attempt.ts >= prev.nextReview && practice) {
    // A spaced review: success moves the next review further out, a miss brings it back.
    next.reviewStep = attempt.correct ? Math.min(prev.reviewStep + 1, REVIEW_DAYS.length - 1) : 0;
    next.nextReview = attempt.ts + REVIEW_DAYS[next.reviewStep] * DAY;
    if (!attempt.correct && accuracy(list.slice(-4)) < 0.5) {
      next.mastered = false;
      next.known = undefined; // a skipped skill he could not do goes back into practice
      next.level = 2;
    }
  } else if (!prev.mastered && meetsMastery(list)) {
    next.mastered = true;
    next.masteredAt = attempt.ts;
    next.reviewStep = 0;
    next.nextReview = attempt.ts + REVIEW_DAYS[0] * DAY;
  }

  const day = dayKey(attempt.ts);
  return {
    ...state,
    attempts,
    skills: { ...state.skills, [attempt.skill]: next },
    stars: state.stars + (attempt.correct && practice ? 1 : 0),
    days: state.days.includes(day) ? state.days : [...state.days, day],
  };
}

export function markIntroSeen(state: AppState, skill: string): AppState {
  return { ...state, skills: { ...state.skills, [skill]: { ...skillState(state, skill), introSeen: true } } };
}

/** Consecutive practice days ending today or yesterday. */
export function dayStreak(state: AppState, now = Date.now()): number {
  const set = new Set(state.days);
  let streak = 0;
  let t = now;
  if (!set.has(dayKey(t))) t -= DAY;
  while (set.has(dayKey(t))) {
    streak++;
    t -= DAY;
  }
  return streak;
}

export function gameState(state: AppState, id: GameId): GameState {
  return state.games?.[id] ?? { level: 1, played: 0, won: 0, streak: 0 };
}

/**
 * One round of a game. 2 clean wins in a row → harder; a loss → easier;
 * 'assisted' (solved with several hints) changes nothing. Clean wins earn a star.
 */
export function recordGame(state: AppState, id: GameId, result: 'win' | 'assisted' | 'loss', now = Date.now()): AppState {
  const g = gameState(state, id);
  let { level, streak } = g;
  const won = result === 'win';
  if (result === 'assisted') {
    // no level change
  } else if (won) {
    streak++;
    if (streak >= 2 && level < 3) {
      level = (level + 1) as GameState['level'];
      streak = 0;
    }
  } else {
    streak = 0;
    if (level > 1) level = (level - 1) as GameState['level'];
  }
  const day = dayKey(now);
  return {
    ...state,
    games: { ...state.games, [id]: { level, streak, played: g.played + 1, won: g.won + (won ? 1 : 0) } },
    stars: state.stars + (won ? 1 : 0),
    days: state.days.includes(day) ? state.days : [...state.days, day],
  };
}

/**
 * Skip skills he already knows. They count as mastered (unlocking what comes
 * next) but still come back once as spaced review in two weeks; failing that
 * review returns them to practice, so a wrong guess about what he knows self-corrects.
 */
export function markKnown(state: AppState, ids: string[], source: 'parent' | 'tested', now = Date.now()): AppState {
  const skills = { ...state.skills };
  for (const id of ids) {
    const s = skillState(state, id);
    if (s.mastered && !s.known) continue; // already mastered through practice
    skills[id] = { ...s, mastered: true, masteredAt: now, known: source, credited: true, level: 3, reviewStep: 2, nextReview: now + 14 * DAY };
  }
  return { ...state, skills };
}

export function unmarkKnown(state: AppState, id: string): AppState {
  const s = skillState(state, id);
  if (!s.known) return state;
  const { known: _known, masteredAt: _at, nextReview: _next, ...rest } = s;
  return { ...state, skills: { ...state.skills, [id]: { ...rest, mastered: false, credited: false, level: 1, reviewStep: 0 } } };
}
