import { describe, expect, it } from 'vitest';
import { emptyState } from '../src/engine/progress';
import { itemFingerprint } from '../src/engine/exposures';
import { newMockRun, nextMockStep, mockTotal } from '../src/engine/mock';
import { MOCK_ONLY_ITEMS } from '../src/content/mockOnly';

const categories = ['m.timepatterns.reserved-calendar.', 'm1.time.reserved-clock.', 'm.shapeattr.reserved-attributes.'];
describe('math mock topic coverage', () => {
  for (const old of [false, true]) for (const correct of [false, true]) it(`covers calendar, clock and attributes with ${old ? 'legacy' : 'new'} history and ${correct ? 'correct' : 'incorrect'} answers`, () => {
    const state = emptyState();
    if (old) state.exposures.untrackedPracticeSkills = ['m.add', 'm1.time'];
    const run = newMockRun('math', 2, 100);
    for (let i = 0; i < mockTotal('math'); i++) {
      const step = nextMockStep(state, run)!;
      expect(step).toBeTruthy();
      run.answers.push({ strand:step.strand, skill:step.skill.id, itemId:step.item.id, fingerprint:itemFingerprint(step.item), repeated:step.repeated, level:step.level, correct, ts:i });
      if (i === 5) run.answers = JSON.parse(JSON.stringify(run.answers));
    }
    for (const prefix of categories) expect(run.answers.some(a => a.itemId.startsWith(prefix)), prefix).toBe(true);
    expect(new Set(run.answers.map(a => a.fingerprint)).size).toBe(run.answers.length);
    expect(nextMockStep(state, run)).toBeNull();
  });
  it('provides varied and distinct reserved prompts for each topic', () => {
    for (const prefix of categories) {
      const questions = MOCK_ONLY_ITEMS.filter(i => i.id.startsWith(prefix));
      expect(questions.length).toBeGreaterThanOrEqual(8);
      expect(new Set(questions.map(itemFingerprint)).size).toBe(questions.length);
    }
  });
});
