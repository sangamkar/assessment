import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, CURRICULA, LANGUAGES, localize } from '../src/content';
import type { Difficulty } from '../src/content/types';
import { createRng } from '../src/engine/rng';
import { adjacent, canStep, hintPath, isSolved, makePuzzle } from '../src/games/numberPath';
import { MYSTERY_WORDS, letterTiles } from '../src/games/words';

describe('content invariants beyond the validator', () => {
  it('every generator is deterministic for a given seed', () => {
    for (const s of ALL_SKILLS.filter((k) => k.generate)) {
      for (const d of [1, 2, 3] as Difficulty[]) {
        const a = s.generate!(createRng(99), d);
        const b = s.generate!(createRng(99), d);
        expect(a).toEqual(b);
      }
    }
  });

  it('generators produce variety (not the same question every time)', () => {
    for (const s of ALL_SKILLS.filter((k) => k.generate)) {
      const ids = new Set(Array.from({ length: 30 }, (_, i) => s.generate!(createRng(i + 1), 2).id));
      expect(ids.size, s.id).toBeGreaterThan(2);
    }
  });

  it('language skills carry a romanization for every spoken native word', () => {
    for (const s of ALL_SKILLS.filter((k) => k.language)) {
      for (const d of [1, 2, 3] as Difficulty[]) {
        for (let seed = 1; seed < 40; seed++) {
          const item = s.generate!(createRng(seed), d);
          expect(item.voice?.roman, item.id).toBeTruthy();
          if (item.choiceLang) item.choices.forEach((c) => expect(c.roman, item.id).toBeTruthy());
        }
      }
    }
    expect(LANGUAGES.map((l) => l.code)).toEqual(['hi', 'kn']);
  });

  it('every skill has a reference in its curricula', () => {
    for (const s of ALL_SKILLS) {
      const curricula = s.regions ?? ['us-ga'];
      expect(curricula.some((c) => CURRICULA[c].codes(s).length > 0), s.id).toBe(true);
    }
  });
});

describe('Indian English locale', () => {
  it('converts spelling and vocabulary but leaves US English alone', () => {
    expect(localize('What color is your favorite cookie?', 'en-IN')).toBe('What colour is your favourite biscuit?');
    expect(localize('Math is fun', 'en-IN')).toBe('Maths is fun');
    expect(localize('What color?', 'en-US')).toBe('What color?');
    expect(localize('Colors', 'en-IN')).toBe('Colours');
  });
});

describe('Number Path', () => {
  it('every generated puzzle is solvable and the hint always leads to the solution', () => {
    for (const level of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 100; seed++) {
        const p = makePuzzle(level, createRng(seed));
        for (let i = 1; i < p.solution.length; i++) expect(adjacent(p.solution[i - 1], p.solution[i])).toBe(true);
        let path = hintPath(p, []);
        for (let i = 0; i < p.size * p.size + 2 && !isSolved(p, path); i++) path = hintPath(p, path);
        expect(isSolved(p, path)).toBe(true);
      }
    }
  });

  it('rejects illegal moves', () => {
    const p = makePuzzle(2, createRng(5));
    const start = p.solution[0];
    const notOne = p.solution[1];
    expect(canStep(p, [], notOne)).toBe(false); // must start on 1
    expect(canStep(p, [start], start)).toBe(false); // no revisits
    const far = p.solution.find((c) => Math.abs(c.r - start.r) + Math.abs(c.c - start.c) > 1)!;
    expect(canStep(p, [start], far)).toBe(false); // no jumps
    const last = p.solution[p.solution.length - 1];
    if (Math.abs(last.r - start.r) + Math.abs(last.c - start.c) === 1) expect(canStep(p, [start], last)).toBe(false); // last number must be last
  });
});

describe('Mystery Word', () => {
  it('tiles always include every letter, plus distractors, without duplicates', () => {
    for (const level of [1, 2, 3] as const) {
      for (const w of MYSTERY_WORDS[level]) {
        const tiles = letterTiles(w.word, 4, (l) => createRng(3).shuffle(l));
        expect(new Set(tiles).size).toBe(tiles.length);
        w.word.split('').forEach((ch) => expect(tiles).toContain(ch));
        expect(tiles.length).toBeGreaterThan(new Set(w.word).size);
      }
    }
  });
});
