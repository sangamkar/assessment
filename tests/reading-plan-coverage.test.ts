import { describe, expect, it } from 'vitest';
import { getSkill, skillsFor } from '../src/content';
import { isVisible } from '../src/engine/planner';
import { emptyState } from '../src/engine/progress';
import { itemFingerprint } from '../src/engine/exposures';
import { isNewReserve, poolItems } from '../src/engine/itemPools';
import { chooseMockCandidate } from '../src/engine/mock';

const ids = ['r.vowelsounds', 'r1.rcontrolled', 'r1.prefixes', 'r1.suffixes', 'r.inference-k', 'r1.inference'];
describe('new reading skills', () => {
  it.each(ids)('%s is visible for individual practice and has separate legacy-safe mock items', id => {
    const skill = getSkill(id)!;
    const state = emptyState();
    expect(skillsFor('reading')).toContain(skill);
    expect(isVisible(state, skill)).toBe(true);
    const practice = poolItems(skill, 'practice');
    const mock = poolItems(skill, 'mock').filter(isNewReserve);
    expect(practice.length).toBeGreaterThanOrEqual(3);
    expect(mock.length).toBeGreaterThanOrEqual(4);
    const fingerprints = new Set(practice.map(itemFingerprint));
    expect(mock.every(q => !fingerprints.has(itemFingerprint(q)))).toBe(true);
    state.exposures.untrackedPracticeSkills = [id];
    expect(chooseMockCandidate(state, [], mock.map(item => ({skill,item})))?.repeated).toBe(false);
  });
});
