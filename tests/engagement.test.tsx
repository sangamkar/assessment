import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dayKey, emptyState, upgradeState } from '../src/engine/progress';
import type { AppState } from '../src/engine/progress';
import { backupDue, buySticker, claimStreakStickers, gentleStreak, goalMet, playLocked, recordQuestDone, starsToSpend, weekStrip } from '../src/engine/engagement';
import { Home } from '../src/ui/Home';
import { Results } from '../src/ui/Results';

const DAY = 86_400_000;
const NOW = new Date(2026, 10, 7, 12).getTime();
const ago = (...n: number[]) => n.map((d) => dayKey(NOW - d * DAY));
const withDays = (days: string[], extra: Partial<AppState> = {}): AppState => ({ ...emptyState(), days, ...extra });
const noop = () => {};
afterEach(() => vi.unstubAllGlobals());

describe('gentle streak', () => {
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
    let state: AppState = { ...emptyState(), settings: { ...emptyState().settings, dailyQuests: 2, gamesAfterQuest: true } };
    expect(playLocked(state, NOW)).toBe(true);
    state = recordQuestDone(state, NOW);
    expect(goalMet(state, NOW)).toBe(false);
    state = recordQuestDone(state, NOW);
    expect(goalMet(state, NOW)).toBe(true);
    expect(playLocked(state, NOW)).toBe(false);
    expect(goalMet(state, NOW + DAY)).toBe(false);
  });
  it('never locks play unless a grown-up turns it on', () => {
    expect(playLocked(emptyState(), NOW)).toBe(false);
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
    const html = renderToStaticMarkup(<Home state={withDays([dayKey(Date.now())], { stars: 7 })} {...props} />);
    expect(html).toContain('This week');
    expect(html).toContain('Today’s path');
    expect(html).toContain('7 stars to spend');
    expect(html).not.toContain('Opens after today’s learning');
  });
  it('locks games until today’s learning when the grown-up setting is on', () => {
    const state = { ...emptyState(), settings: { ...emptyState().settings, gamesAfterQuest: true } };
    const html = renderToStaticMarkup(<Home state={state} {...props} />);
    expect(html).toContain('Brain Games: open after today’s learning');
    expect(html).toContain('Build and Explore: open after today’s learning');
  });
  it('shows a soft screen-time reminder without blocking anything', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ day: dayKey(Date.now()), ms: 31 * 60_000 }) });
    const state = { ...emptyState(), settings: { ...emptyState().settings, screenMinutes: 30 } };
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
