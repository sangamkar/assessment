import { describe, expect, it } from 'vitest';
import { getSkill } from '../src/content';
import { KINDERGARTEN_NUMBER_SKILLS } from '../src/content/kindergartenNumbers';
import { KINDERGARTEN_VISUAL_SKILLS } from '../src/content/kindergartenVisual';
import { buildQuest, buildSkillSession, buildSkipChallenge, planCheckup, skillStatus, startPlacement } from '../src/engine/planner';
import { emptyState } from '../src/engine/progress';
import { createRng } from '../src/engine/rng';

describe('kindergarten number additions', () => {
  it('makes each concept individually available and eligible for the existing flows', () => {
    for (const skill of [...KINDERGARTEN_NUMBER_SKILLS, ...KINDERGARTEN_VISUAL_SKILLS]) {
      const state = emptyState();
      state.settings.focus = [skill.id];
      expect(getSkill(skill.id)).toBe(skill);
      expect(skillStatus(state, skill)).toBe('ready');
      expect(buildSkillSession(state, skill).length).toBeGreaterThan(0);
      expect(buildSkipChallenge(state, skill)).toHaveLength(3);
      expect(buildQuest(state).some((step) => step.skill.id === skill.id)).toBe(true);
      expect(planCheckup(state, 'math').strands.flatMap((s) => s.skills)).toContain(skill);
      expect(startPlacement(state, 'math').strands.flatMap((s) => s.skills)).toContain(skill);
    }
  });
  it('generates consistent sequences, lines and chart answers', () => {
    for (const skill of KINDERGARTEN_NUMBER_SKILLS.slice(0, 3)) for (const d of [1, 2, 3] as const) for (let seed = 1; seed <= 200; seed++) {
      const q = skill.generate!(createRng(seed * 31), d);
      const v = q.visual!;
      const answer = Number(q.choices.find((c) => c.correct)!.text);
      if (v.kind === 'sequence') expect(answer).toBe(Number(v.items[v.blank]));
      if (v.kind === 'numberLine') expect(answer).toBe(v.start + v.blank);
      if (v.kind === 'matrix') {
        const i = v.cells.findIndex((cell) => cell === null);
        const first = v.cells.findIndex((cell) => cell !== null);
        const firstCell = v.cells[first];
        if (!firstCell || firstCell.kind !== 'number') throw Error('chart missing a number');
        const start = Number(firstCell.value) - Math.floor(first / 3) * 10 - first % 3;
        expect(answer).toBe(start + Math.floor(i / 3) * 10 + i % 3);
      }
      expect(answer).toBeLessThanOrEqual(120);
    }
  });
});
