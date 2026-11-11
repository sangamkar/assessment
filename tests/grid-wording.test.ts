import { describe, expect, it } from 'vitest';
import { getSkill } from '../src/content';

describe('grid counting questions', () => {
  it('asks for small squares when the key counts grid cells only', () => {
    const gridItems = getSkill('m2.shapes')!.items!.filter((item) =>
      item.visual?.kind === 'map' && item.visual.cells.length === 0,
    );
    expect(gridItems.length).toBe(2);
    expect(gridItems.map((item) => item.id)).toEqual(['m2.shapes.4-small-squares', 'm2.shapes.8-small-squares']);
    for (const item of gridItems) {
      expect(item.say).toMatch(/small squares in this grid/i);
      expect(item.say).toMatch(/do not count larger squares/i);
      const grid = item.visual!;
      if (grid.kind !== 'map') throw new Error('Expected a grid');
      expect(item.choices.find((choice) => choice.correct)?.text).toBe(String(grid.rows * grid.cols));
    }
  });
});
