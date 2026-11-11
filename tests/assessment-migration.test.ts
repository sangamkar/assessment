import { describe, expect, it } from 'vitest';
import { emptyState, upgradeState } from '../src/engine/progress';

describe('assessment exposure migration', () => {
  it('preserves active academic and portfolio data and retains legacy unknown exposure', () => {
    const state = { ...emptyState(), version: 4, profile: { name: 'Aarav', avatar: '🦁', createdAt: 1 }, attempts: [{ itemId: 'm.add#2+3-2', skill: 'm.add', d: 2, correct: true, ts: 7, mode: 'skill' }], growth: { sessions: [{ id: 's', activityId: 'old', startedAt: 1, reflection: 'idea', drawing: [], strategies: [] }], observations: [] } };
    const result = upgradeState(state);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.version).toBe(5);
    expect(result.state.attempts).toEqual(state.attempts);
    expect(result.state.profile).toEqual(state.profile);
    expect(result.state.growth).toEqual(state.growth);
    expect(result.state.exposures.practiceIds).toContain('m.add#2+3-2');
    expect(result.state.exposures.untrackedPracticeSkills).toContain('m.add');
    expect(upgradeState(result.state)).toEqual(result);
  });
});

it('treats fingerprints from the old hash format as untracked', () => {
  const old = { ...emptyState(), version: 4, attempts: [{ itemId: 'old-hash', fingerprint: 'q:123456789', skill: 'm.add', d: 1, correct: true, ts: 1, mode: 'skill' }] };
  const result = upgradeState(old);
  expect(result.ok && result.state.exposures.untrackedPracticeSkills).toContain('m.add');
  expect(result.ok && result.state.attempts).toEqual(old.attempts);
});

it('does not discard a saved state when an old attempt is malformed', () => {
  const saved = { ...emptyState(), version: 4, attempts: [null, { itemId: 'valid', skill: 'm.add', d: 1, correct: true, ts: 1, mode: 'skill' }] };
  const result = upgradeState(saved);
  expect(result.ok).toBe(true);
  expect(result.ok && result.state.attempts).toEqual(saved.attempts);
  expect(result.ok && result.state.exposures.untrackedPracticeSkills).toContain('__unknown__');
});

it('marks older aggregate mock results as untracked even if their attempts are no longer retained', () => {
  const saved = { ...emptyState(), version: 4, attempts: [], mocks: [{ id:'old', subject:'math', ts:1, overall:2, overallLabel:'Mid K', domains:[], misconceptions:[], practice:[] }] };
  const result = upgradeState(saved);
  expect(result.ok && result.state.exposures.untrackedMockSkills).toContain('__subject_math__');
  expect(result.ok && result.state.mocks).toEqual(saved.mocks);
});
