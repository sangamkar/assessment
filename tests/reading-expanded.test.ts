import { describe, expect, it } from 'vitest';
import { EXPANDED_READING_SKILLS } from '../src/content/readingExpanded';
import { COMPREHENSION_SKILLS } from '../src/content/readingComprehension';
import { INDEPENDENT_READING_SKILLS } from '../src/content/readingIndependent';
import { skillsFor } from '../src/content';
import { isVisible, skillStatus } from '../src/engine/planner';
import { emptyState } from '../src/engine/progress';
import { itemFingerprint, wasExposed } from '../src/engine/exposures';
import { isNewReserve, poolItems } from '../src/engine/itemPools';
import { chooseMockCandidate } from '../src/engine/mock';

describe('reading checklist additions', () => {
  it.each([...EXPANDED_READING_SKILLS, ...COMPREHENSION_SKILLS, ...INDEPENDENT_READING_SKILLS].map(skill => [skill.id, skill] as const))('%s offers distinct individual practice and legacy-safe assessment questions', (_id, skill) => {
    const state = emptyState();
    expect(skillsFor('reading')).toContain(skill);
    expect(isVisible(state, skill)).toBe(true);
    expect(skillStatus(state, skill)).toBe('ready');
    const practice = poolItems(skill, 'practice');
    const mock = poolItems(skill, 'mock');
    expect(practice).toHaveLength(8);
    expect(mock.filter(isNewReserve)).toHaveLength(4);
    const practiceFingerprints = new Set(practice.map(itemFingerprint));
    expect(mock.every(item => !practiceFingerprints.has(itemFingerprint(item)))).toBe(true);
    state.exposures.untrackedMockSkills = ['__subject_reading__'];
    expect(wasExposed(state.exposures, practice[0])).toBe(false);
    state.exposures.untrackedPracticeSkills = [skill.id];
    expect(wasExposed(state.exposures, practice[0])).toBe(true);
    expect(chooseMockCandidate(state, [], mock.map(item => ({skill,item})))?.repeated).toBe(false);
  });
  it('does not read choices aloud on spelling and homophone tasks', () => {
    const ids = ['r.spell-short', 'r1.spell-digraph', 'r1.spell-r', 'r1.spell-blends', 'r1.spell-vowel', 'r1.spell-variant', 'r1.soft-sounds', 'r1.syllable-spell', 'r1.sight-spell', 'r1.homophones'];
    for (const id of ids) {
      const skill = [...EXPANDED_READING_SKILLS, ...COMPREHENSION_SKILLS].find(s => s.id === id)!;
      expect([...poolItems(skill,'practice'), ...poolItems(skill,'mock')].every(i => i.speakChoices === false)).toBe(true);
    }
  });
});
