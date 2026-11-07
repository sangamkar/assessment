import { gamesUnlocked } from './dailyQuest';
import type { AppState } from './progress';
import { dayKey } from './progress';

const DAY = 24 * 60 * 60 * 1000;

/** At most one missed day per rolling week is forgiven as a rest day. */
export const REST_GAP = 7;

/** Noon of the local calendar day `n` days before `now`; stepping by dates keeps DST shifts from skipping a day. */
function daysBefore(now: number, n: number): number {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.getTime();
}

export type DayMark = 'done' | 'rest' | 'missed' | 'today';

function streakWalk(state: AppState, now: number) {
  const done = new Set(state.days);
  const rests = new Set<string>();
  let count = 0;
  let lastRest = -Infinity;
  let pendingRest: string | undefined;
  const start = done.has(dayKey(now)) ? 0 : 1; // today is still open
  for (let i = 0; i < 400; i++) {
    const key = dayKey(daysBefore(now, start + i));
    if (done.has(key)) {
      count++;
      if (pendingRest) rests.add(pendingRest);
      pendingRest = undefined;
      continue;
    }
    if (pendingRest || i - lastRest < REST_GAP) break;
    pendingRest = key;
    lastRest = i;
  }
  return { count, rests };
}

/** Days of learning in a row, forgiving one rest day per week so a missed weekend day doesn't reset it. */
export function gentleStreak(state: AppState, now = Date.now()): number {
  return streakWalk(state, now).count;
}

export function bestStreakSoFar(state: AppState, now = Date.now()): number {
  return Math.max(state.engagement?.bestStreak ?? 0, gentleStreak(state, now));
}

/** The last seven days, oldest first, for the kid-facing calendar strip. */
export function weekStrip(state: AppState, now = Date.now()): { key: string; label: string; mark: DayMark }[] {
  const done = new Set(state.days);
  // A rest day stays earned once a later learning day bridged it, even if the streak broke afterwards.
  const rests = new Set(streakWalk(state, now).rests);
  for (let j = 1; j < 7; j++) {
    const t = daysBefore(now, j);
    if (done.has(dayKey(t))) streakWalk(state, t).rests.forEach((key) => rests.add(key));
  }
  return Array.from({ length: 7 }, (_, i) => {
    const t = daysBefore(now, 6 - i);
    const key = dayKey(t);
    const mark: DayMark = done.has(key) ? 'done' : i === 6 ? 'today' : rests.has(key) ? 'rest' : 'missed';
    return { key, label: new Date(t).toLocaleDateString('en-US', { weekday: 'narrow' }), mark };
  });
}

export const questsToday = (state: AppState, now = Date.now()) => state.engagement?.questDays?.[dayKey(now)] ?? 0;
export const dailyGoal = (state: AppState) => Math.min(3, Math.max(1, state.settings.dailyQuests ?? 1));
export const goalMet = (state: AppState, now = Date.now()) => questsToday(state, now) >= dailyGoal(state);
/** Brain Games and Build & Explore wait until one full Today's learning session is finished. */
export const playLocked = (state: AppState, now = Date.now()) => !gamesUnlocked(state, now);

export function recordQuestDone(state: AppState, now = Date.now()): AppState {
  const key = dayKey(now);
  const questDays = Object.fromEntries(
    Object.entries({ ...state.engagement?.questDays, [key]: questsToday(state, now) + 1 })
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-60),
  );
  return { ...state, engagement: { ...state.engagement, questDays } };
}

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  page: string;
  cost: number;
  /** Earned free by reaching this many days in a row. */
  streak?: number;
}

export const STICKER_PAGES = ['Sky & airport', 'Garden', 'Animals', 'Space', 'Days in a row'] as const;

const shop = (page: string, cost: number, list: [string, string, string][]): Sticker[] =>
  list.map(([id, emoji, name], i) => ({ id, emoji, name, page, cost: cost + i * 5 }));

export const STICKERS: Sticker[] = [
  ...shop('Sky & airport', 10, [['plane', '✈️', 'Jet plane'], ['heli', '🚁', 'Helicopter'], ['balloon', '🎈', 'Balloon'], ['rainbow', '🌈', 'Rainbow'], ['parachute', '🪂', 'Parachute'], ['rocket-plane', '🛩️', 'Small plane']]),
  ...shop('Garden', 10, [['sunflower', '🌻', 'Sunflower'], ['carrot', '🥕', 'Carrot'], ['strawberry', '🍓', 'Strawberry'], ['ladybug', '🐞', 'Ladybug'], ['butterfly', '🦋', 'Butterfly'], ['tree', '🌳', 'Big tree']]),
  ...shop('Animals', 15, [['lion', '🦁', 'Lion'], ['elephant', '🐘', 'Elephant'], ['penguin', '🐧', 'Penguin'], ['octopus', '🐙', 'Octopus'], ['tiger', '🐯', 'Tiger'], ['dino', '🦕', 'Dinosaur']]),
  ...shop('Space', 20, [['moon', '🌙', 'Moon'], ['star', '🌟', 'Shining star'], ['planet', '🪐', 'Ringed planet'], ['comet', '☄️', 'Comet'], ['astronaut', '🧑‍🚀', 'Astronaut'], ['rocket', '🚀', 'Rocket']]),
  { id: 'streak-3', emoji: '🥉', name: '3 days in a row', page: 'Days in a row', cost: 0, streak: 3 },
  { id: 'streak-7', emoji: '🥈', name: 'A whole week', page: 'Days in a row', cost: 0, streak: 7 },
  { id: 'streak-14', emoji: '🥇', name: 'Two weeks', page: 'Days in a row', cost: 0, streak: 14 },
  { id: 'streak-30', emoji: '🏆', name: 'A whole month', page: 'Days in a row', cost: 0, streak: 30 },
];

export const ownedStickers = (state: AppState) => state.engagement?.stickers ?? [];
/** Lifetime stars stay as earned; spending only moves stars into the sticker book. */
export const starsToSpend = (state: AppState) => Math.max(0, state.stars - (state.engagement?.spent ?? 0));
export const canBuy = (state: AppState, s: Sticker) => !s.streak && !ownedStickers(state).includes(s.id) && starsToSpend(state) >= s.cost;

export function buySticker(state: AppState, id: string): AppState {
  const sticker = STICKERS.find((s) => s.id === id);
  if (!sticker || !canBuy(state, sticker)) return state;
  return { ...state, engagement: { ...state.engagement, stickers: [...ownedStickers(state), id], spent: (state.engagement?.spent ?? 0) + sticker.cost } };
}

/** Adds streak stickers that have been reached and remembers the best streak. Returns the same object when nothing changed. */
export function claimStreakStickers(state: AppState, now = Date.now()): AppState {
  const best = bestStreakSoFar(state, now);
  const owned = ownedStickers(state);
  const fresh = STICKERS.filter((s) => s.streak && best >= s.streak && !owned.includes(s.id)).map((s) => s.id);
  if (!fresh.length && best === (state.engagement?.bestStreak ?? 0)) return state;
  return { ...state, engagement: { ...state.engagement, bestStreak: best, stickers: [...owned, ...fresh] } };
}

export const BACKUP_EVERY_DAYS = 14;

/** Grown-ups are reminded once there is real progress and no backup in the last two weeks. */
export function backupDue(state: AppState, now = Date.now()): boolean {
  if (state.days.length < 3) return false;
  const last = state.engagement?.lastBackupAt;
  return !last || now - last >= BACKUP_EVERY_DAYS * DAY;
}

export function downloadBackup(state: AppState, now = Date.now()): AppState {
  const next = { ...state, engagement: { ...state.engagement, lastBackupAt: now } };
  const blob = new Blob([JSON.stringify(next, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `learning-quest-backup-${dayKey(now)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  return next;
}

/** Visible minutes today. Kept apart from progress so it is not rewritten into the main save every few seconds. */
const SCREEN_KEY = 'learning-quest:screen-time';
export function screenMinutesToday(now = Date.now()): number {
  try {
    const saved = JSON.parse(localStorage.getItem(SCREEN_KEY) ?? 'null');
    return saved?.day === dayKey(now) && typeof saved.ms === 'number' ? Math.floor(saved.ms / 60000) : 0;
  } catch {
    return 0;
  }
}
export function addScreenTime(ms: number, now = Date.now()) {
  try {
    const saved = JSON.parse(localStorage.getItem(SCREEN_KEY) ?? 'null');
    const prior = saved?.day === dayKey(now) && typeof saved.ms === 'number' ? saved.ms : 0;
    localStorage.setItem(SCREEN_KEY, JSON.stringify({ day: dayKey(now), ms: prior + ms }));
  } catch {
    // Storage blocked: the soft limit simply never shows.
  }
}
export const overScreenLimit = (state: AppState, now = Date.now()) => !!state.settings.screenMinutes && screenMinutesToday(now) >= state.settings.screenMinutes;

export function normalizeEngagement(value: unknown): AppState['engagement'] {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : undefined);
  const known = new Set(STICKERS.map((s) => s.id));
  const questDays: Record<string, number> = {};
  if (v.questDays && typeof v.questDays === 'object')
    for (const [k, n] of Object.entries(v.questDays as Record<string, unknown>)) if (/^\d{4}-\d{2}-\d{2}$/.test(k) && num(n) !== undefined) questDays[k] = Math.floor(n as number);
  return {
    stickers: Array.isArray(v.stickers) ? [...new Set(v.stickers.filter((s): s is string => typeof s === 'string' && known.has(s)))] : [],
    spent: num(v.spent) ?? 0,
    bestStreak: num(v.bestStreak) ?? 0,
    lastBackupAt: num(v.lastBackupAt),
    questDays,
  };
}
