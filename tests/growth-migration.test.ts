import { describe, expect, it } from 'vitest';
import { emptyState, upgradeState } from '../src/engine/progress';

const oldSession = { id: 'old', activityId: 'airport', startedAt: 1, triedAt: 2, reflection: 'My idea', drawing: ['M0,0 L2,2'], strategies: [] };
const newerSession = { id: 'new', activityId: 'screen', startedAt: 3, reflection: 'Later idea', drawing: [], strategies: [] };

describe('portfolio migration', () => {
  it('recovers archived portfolio while keeping current academic progress and profile', () => {
    const current = { ...emptyState(), version: 1, profile: { name: 'Aarav', avatar: '🦁', createdAt: 1 }, attempts: [{ itemId: 'later', skill: 'm.add', d: 1, correct: true, ts: 9, mode: 'skill' }], growth: { sessions: [newerSession], observations: [] } };
    const backup = { ...emptyState(), version: 3, profile: { name: 'old', avatar: '🐱', createdAt: 1 }, attempts: [], growth: { sessions: [oldSession], observations: [{ id: 'obs', sessionId: 'old', ts: 2, stage: 'Exploration', support: 'together', note: 'Tried together' }] } };
    const result = upgradeState(current, backup);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.profile?.name).toBe('Aarav');
    expect(result.state.attempts).toEqual(current.attempts);
    expect(result.state.growth.sessions).toEqual([oldSession, newerSession]);
    expect(result.state.growth.observations).toEqual(backup.growth.observations);
    expect(upgradeState(result.state, backup)).toEqual(result);
  });
  it('prefers a current edited session on collision and ignores a corrupt backup', () => {
    const current = { ...emptyState(), version: 1, growth: { sessions: [{ ...oldSession, reflection: 'Edited' }], observations: [] } };
    const backup = { ...emptyState(), version: 3, growth: { sessions: [oldSession], observations: [] } };
    const merged = upgradeState(current, backup);
    expect(merged.ok && merged.state.growth.sessions[0].reflection).toBe('Edited');
    const ignored = upgradeState(current, { version: 3 });
    expect(ignored.ok && ignored.state.growth.sessions[0].reflection).toBe('Edited');
  });
});

it('loads an archive without replacing active progress or rewriting the archive', async () => {
  const { loadState } = await import('../src/engine/progress');
  const active = { ...emptyState(), version: 1, growth: undefined, attempts: [{ itemId: 'later', skill: 'm.add', d: 1, correct: true, ts: 9, mode: 'skill' }] };
  const archived = JSON.stringify({ ...emptyState(), version: 3, growth: { sessions: [oldSession], observations: [] } });
  const values = new Map([['learning-quest:v1', JSON.stringify(active)], ['learning-quest:v1:before-rollback', archived]]);
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  try {
    const loaded = loadState();
    expect(loaded.attempts).toEqual(active.attempts);
    expect(loaded.growth.sessions).toEqual([oldSession]);
    expect(values.get('learning-quest:v1:before-rollback')).toBe(archived);
  } finally { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: previous }); }
});

it('does not import a portfolio from a different known profile', () => {
  const active = { ...emptyState(), version: 1, profile: { name: 'Aarav', avatar: '🦁', createdAt: 1 } };
  const backup = { ...emptyState(), version: 3, profile: { name: 'Other', avatar: '🐱', createdAt: 2 }, growth: { sessions: [oldSession], observations: [] } };
  const result = upgradeState(active, backup);
  expect(result.ok && result.state.growth.sessions).toEqual([]);
});
