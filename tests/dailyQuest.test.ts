import { describe, it, expect } from 'vitest';
import { emptyState, dayKey, upgradeState } from '../src/engine/progress';
import { gamesUnlocked, completeDailyQuest } from '../src/engine/dailyQuest';
describe('daily game lock', () => {
  const now = new Date(2026,10,7,12).getTime(), today = dayKey(now);
  it('locks new and old saves regardless of stars or activity', () => {
    expect(gamesUnlocked({...emptyState(), stars:100, days:[today]},now)).toBe(false);
  });
  it('unlocks a completed session and preserves it through backup restore', () => {
    const s=completeDailyQuest(emptyState(),8,8,today,now);
    expect(gamesUnlocked(s,now)).toBe(true);
    const restored=upgradeState(JSON.parse(JSON.stringify(s)));
    expect(restored.ok && gamesUnlocked(restored.state,now)).toBe(true);
  });
  it('does not unlock partial, empty or previous-day sessions', () => {
    for(const [answered,expected,start] of [[4,8,today],[0,0,today],[8,8,'2026-11-06']] as const)
      expect(gamesUnlocked(completeDailyQuest(emptyState(),answered,expected,start,now),now)).toBe(false);
  });
  it('locks again on the next local calendar day', () => {
    const s=completeDailyQuest(emptyState(),8,8,today,now);
    expect(gamesUnlocked(s,new Date(2026,10,7,23,59).getTime())).toBe(true);
    expect(gamesUnlocked(s,new Date(2026,10,8,0,0).getTime())).toBe(false);
  });
});
