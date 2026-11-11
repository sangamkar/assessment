import { describe, expect, it } from 'vitest';
import { getSkill } from '../src/content';
import { createRng } from '../src/engine/rng';

describe('kindergarten visual questions', () => {
  it('keys width and capacity to the visible comparison', () => {
    for (const id of ['m.width', 'm.capacity']) for (let seed = 1; seed <= 100; seed++) {
      const item = getSkill(id)!.generate!(createRng(seed), 2);
      const values = item.choices.map(c => c.visual?.kind === 'ribbon' ? c.visual.width : c.visual?.kind === 'capacityBox' ? c.visual.cubes : NaN);
      const correct = values[item.choices.findIndex(c => c.correct)];
      const more = /widest|most/.test(item.say);
      expect(correct).toBe(more ? Math.max(...values) : Math.min(...values));
    }
  });
  it('counts the overlap in Venn questions', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const item = getSkill('m.venn-count')!.generate!(createRng(seed), 2);
      const v = item.visual;
      if (!v || v.kind !== 'venn') throw Error('expected Venn diagram');
      const answer = item.show?.includes(`${v.colorName ?? 'red'} shapes`) ? v.redOnly + v.both : v.circleOnly + v.both;
      expect(item.choices.find(c => c.correct)?.text).toBe(String(answer));
    }
  });
  it('keys picture sums and take-away models to their pictures', () => {
    for (const id of ['m.put-together', 'm.take-apart', 'm.picture-story']) for (let seed = 1; seed <= 100; seed++) {
      const item = getSkill(id)!.generate!(createRng(seed), 2);
      const v = item.visual;
      if (!v || !['groups', 'crossed'].includes(v.kind)) throw Error('expected picture model');
      const answer = v.kind === 'groups' ? v.groups.reduce((sum, g) => sum + g.count, 0) : v.kind === 'crossed' ? v.total - v.crossed : NaN;
      expect(item.choices.find(c => c.correct)?.text).toBe(String(answer));
    }
  });
});
