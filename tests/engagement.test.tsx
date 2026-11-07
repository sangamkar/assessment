import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dayKey, emptyState, upgradeState } from '../src/engine/progress';
import type { AppState } from '../src/engine/progress';
import { SCREEN_FLUSH_CAP, screenMinutesToday, screenTracker, backupDue, buySticker, claimStreakStickers, gentleStreak, goalMet, playLocked, recordQuestDone, starsToSpend, weekStrip } from '../src/engine/engagement';
import { completeDailyQuest } from '../src/engine/dailyQuest';
import { Home } from '../src/ui/Home';
import { Results, celebrationKey } from '../src/ui/Results';

const DAY = 86_400_000;
const NOW = new Date(2026, 10, 7, 12).getTime();
const ago = (...n: number[]) => n.map((d) => dayKey(NOW - d * DAY));
const withDays = (days: string[], extra: Partial<AppState> = {}): AppState => ({ ...emptyState(), days, ...extra });
const noop = () => {};
afterEach(() => vi.unstubAllGlobals());

describe('gentle streak', () => {
  it('keeps an earned rest day on the strip after the streak later breaks', () => {
    const marks = weekStrip(withDays(ago(6, 5, 3)), NOW).map((d) => d.mark);
    expect(gentleStreak(withDays(ago(6, 5, 3)), NOW)).toBe(0);
    expect(marks).toEqual(['done', 'done', 'rest', 'done', 'missed', 'missed', 'today']);
  });
  it('walks calendar days across daylight-saving changes', () => {
    const tz = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      const spring = new Date(2026, 2, 9, 0, 30).getTime();
      const springState = withDays(['2026-03-07', '2026-03-08', '2026-03-09']);
      expect(gentleStreak(springState, spring)).toBe(3);
      expect(weekStrip(springState, spring).map((d) => d.key).slice(-3)).toEqual(['2026-03-07', '2026-03-08', '2026-03-09']);
      const fall = new Date(2026, 10, 2, 23, 30).getTime();
      expect(gentleStreak(withDays(['2026-10-31', '2026-11-01', '2026-11-02']), fall)).toBe(3);
      expect(new Set(weekStrip(withDays([]), fall).map((d) => d.key)).size).toBe(7);
    } finally {
      if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz;
    }
  });
  it('counts consecutive days and keeps going while today is still open', () => {
    expect(gentleStreak(withDays(ago(0, 1, 2)), NOW)).toBe(3);
    expect(gentleStreak(withDays(ago(1, 2)), NOW)).toBe(2);
  });
  it('forgives one missed day per week as a rest day', () => {
    const state = withDays(ago(0, 1, 3, 4));
    expect(gentleStreak(state, NOW)).toBe(4);
    expect(weekStrip(state, NOW).map((d) => d.mark)).toEqual(['missed', 'missed', 'done', 'done', 'rest', 'done', 'done']);
  });
  it('keeps the streak when yesterday was missed and today has not started', () => {
    expect(gentleStreak(withDays(ago(2, 3)), NOW)).toBe(2);
  });
  it('breaks after two missed days in a row or two rests in one week', () => {
    expect(gentleStreak(withDays(ago(0, 3, 4)), NOW)).toBe(1);
    expect(gentleStreak(withDays(ago(0, 2, 4)), NOW)).toBe(2);
  });
  it('shows nothing as rest when there is no streak', () => {
    expect(weekStrip(withDays([]), NOW).map((d) => d.mark)).toEqual(['missed', 'missed', 'missed', 'missed', 'missed', 'missed', 'today']);
  });
});

describe('daily goal and play lock', () => {
  it('meets the goal after the chosen number of sessions', () => {
    let state: AppState = { ...emptyState(), settings: { ...emptyState().settings, dailyQuests: 2 } };
    state = recordQuestDone(state, NOW);
    expect(goalMet(state, NOW)).toBe(false);
    state = recordQuestDone(state, NOW);
    expect(goalMet(state, NOW)).toBe(true);
    expect(goalMet(state, NOW + DAY)).toBe(false);
  });
  it('locks play until one full session is finished today', () => {
    expect(playLocked(emptyState(), NOW)).toBe(true);
    const done = completeDailyQuest(emptyState(), 8, 8, dayKey(NOW), NOW);
    expect(playLocked(done, NOW)).toBe(false);
    expect(playLocked(done, NOW + DAY)).toBe(true);
  });
});

describe('sticker book', () => {
  it('spends stars without reducing lifetime stars and refuses what cannot be afforded', () => {
    let state = { ...emptyState(), stars: 12 };
    state = buySticker(state, 'plane');
    expect(state.stars).toBe(12);
    expect(starsToSpend(state)).toBe(2);
    expect(buySticker(state, 'heli')).toBe(state);
    expect(buySticker({ ...state, stars: 100 }, 'plane').engagement?.spent).toBe(10);
  });
  it('never sells streak stickers and awards them when the streak is reached', () => {
    const state = withDays(ago(0, 1, 2), { stars: 100 });
    expect(buySticker(state, 'streak-7')).toBe(state);
    const claimed = claimStreakStickers(state, NOW);
    expect(claimed.engagement?.stickers).toEqual(['streak-3']);
    expect(claimed.engagement?.bestStreak).toBe(3);
    expect(claimStreakStickers(claimed, NOW)).toBe(claimed);
  });
  it('restores engagement from a backup and drops unknown values', () => {
    const result = upgradeState({ ...emptyState(), engagement: { stickers: ['plane', 'bogus', 'plane'], spent: -4, questDays: { '2026-11-07': 2, bad: 1 } } });
    expect(result.ok && result.state.engagement).toEqual({ stickers: ['plane'], spent: 0, bestStreak: 0, lastBackupAt: undefined, questDays: { '2026-11-07': 2 } });
  });
});

describe('backup reminder', () => {
  it('waits for real progress, then reminds every two weeks', () => {
    expect(backupDue(withDays(ago(0, 1)), NOW)).toBe(false);
    expect(backupDue(withDays(ago(0, 1, 2)), NOW)).toBe(true);
    expect(backupDue(withDays(ago(0, 1, 2), { engagement: { lastBackupAt: NOW - 3 * DAY } }), NOW)).toBe(false);
    expect(backupDue(withDays(ago(0, 1, 2), { engagement: { lastBackupAt: NOW - 15 * DAY } }), NOW)).toBe(true);
  });
});

describe('kid screens', () => {
  const props = { onQuest: noop, onExplore: noop, onGames: noop, onIsland: noop, onGrownUps: noop, onStickers: noop };
  it('shows the week strip, path and spendable stars', () => {
    const html = renderToStaticMarkup(<Home state={withDays([dayKey(Date.now())], { stars: 7, questCompletedDay: dayKey(Date.now()) })} {...props} />);
    expect(html).toContain('This week');
    expect(html).toContain('Today’s path');
    expect(html).toContain('7 stars to spend');
    expect(html).not.toContain('Opens after today’s learning');
  });
  it('locks games until today’s learning is finished', () => {
    const state = emptyState();
    const html = renderToStaticMarkup(<Home state={state} {...props} />);
    expect(html).toContain('Brain Games: open after today’s learning');
    expect(html).toContain('Build and Explore: open after today’s learning');
  });
  it('shows a soft screen-time reminder without blocking anything', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ day: dayKey(Date.now()), ms: 31 * 60_000 }) });
    const state = { ...emptyState(), questCompletedDay: dayKey(Date.now()), settings: { ...emptyState().settings, screenMinutes: 30 } };
    const html = renderToStaticMarkup(<Home state={state} {...props} />);
    expect(html).toContain('Time to rest your eyes');
    expect(html).not.toContain('open after today’s learning');
  });
  it('ends the daily goal with a done-for-today screen', () => {
    const html = renderToStaticMarkup(<Results correct={7} total={8} mode="quest" onHome={noop} onAgain={noop} doneToday={{ streak: 4, stars: 20, onStickers: noop, onGames: noop }} />);
    expect(html).toContain('Done for today!');
    expect(html).toContain('4 days of learning in a row');
    expect(html).not.toContain('Again');
  });
});

describe('screen-time tracker', () => {
  const memoryStorage = () => {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v) });
  };
  it('counts only elapsed visible time across background and foreground switches', () => {
    memoryStorage();
    let t = NOW;
    let visible = true;
    const tracker = screenTracker(() => visible, () => t);
    t += 50_000; visible = false; tracker.flush(); // hidden after 50 s
    t += 10 * 60_000; tracker.flush(); // 10 min in another tab
    t += 20_000; visible = true; tracker.flush(); // back just before a tick
    t += 10_000; tracker.flush();
    expect(screenMinutesToday(t)).toBe(1);
    t += 40_000; tracker.flush();
    expect(screenMinutesToday(t)).toBe(1); // 50 + 10 + 40 = 100 s
  });
  it('persists across a reload and starts the new page from a fresh timestamp', () => {
    memoryStorage();
    let t = NOW;
    const first = screenTracker(() => true, () => t);
    t += 90_000; first.flush(); // page exit
    t += 5 * 60_000; // closed for 5 minutes
    const second = screenTracker(() => true, () => t);
    t += 30_000; second.flush();
    expect(screenMinutesToday(t)).toBe(2);
  });
  it('caps one flush so a sleeping device is not counted', () => {
    memoryStorage();
    let t = NOW;
    const tracker = screenTracker(() => true, () => t);
    t += 60 * 60_000; tracker.flush();
    expect(screenMinutesToday(t)).toBe(SCREEN_FLUSH_CAP / 60_000);
  });
});

describe('results celebration', () => {
  it('keeps the same identity when the parent rerenders with fresh props', () => {
    const a = celebrationKey('quest', 10, undefined, true);
    const b = celebrationKey('quest', 10, undefined, true);
    expect(a).toBe(b);
    expect(celebrationKey('quest', 10, undefined, false)).not.toBe(a);
  });
});
