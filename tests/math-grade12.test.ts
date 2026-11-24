import { describe, expect, it } from 'vitest';
import { getSkill } from '../src/content';
import { MATH_GRADE1_EXTRA, MATH_GRADE2_EXTRA } from '../src/content/mathGrade12';
import type { Difficulty, Item, Visual } from '../src/content/types';
import { createRng } from '../src/engine/rng';
import { catalogue, poolItems } from '../src/engine/itemPools';

const NEW = [...MATH_GRADE1_EXTRA, ...MATH_GRADE2_EXTRA];
const DS: Difficulty[] = [1, 2, 3];
const sample = (id: string, d: Difficulty, n = 150) => Array.from({ length: n }, (_, i) => getSkill(id)!.generate!(createRng(i * 7919 + d), d));
const answer = (item: Item) => item.choices.find((c) => c.correct)!;
const answerNum = (item: Item) => Number((answer(item).text ?? '').replace(/[^\d]/g, ''));
const nums = (s: string) => (s.match(/\d+/g) ?? []).map(Number);

// Independent tables (not imported from the content file).
const SIDES: Record<string, number> = {
  triangle: 3, 'right-triangle': 3, 'scalene-triangle': 3, 'obtuse-triangle': 3,
  square: 4, rectangle: 4, trapezoid: 4, rhombus: 4, parallelogram: 4, kite: 4, 'irregular-quad': 4,
  pentagon: 5, 'irregular-pentagon': 5, hexagon: 6, 'irregular-hexagon': 6, 'concave-hexagon': 6, octagon: 8,
};
const COIN: Record<string, number> = { penny: 1, nickel: 5, dime: 10, quarter: 25 };
/** Evaluates "300 + 50 + 7", "4 hundreds 2 ones", "39 tens" or a plain number. */
function value(expr: string): number {
  const e = expr.trim();
  if (/hundred|ten|one/.test(e)) {
    let v = 0;
    for (const [, n, unit] of e.matchAll(/(\d+) (hundred|ten|one)s?/g)) v += Number(n) * (unit === 'hundred' ? 100 : unit === 'ten' ? 10 : 1);
    return v;
  }
  return e.split(/\s*([+−])\s*/).reduce<{ total: number; op: string }>((acc, tok) => (tok === '+' || tok === '−' ? { ...acc, op: tok } : { total: acc.op === '+' ? acc.total + Number(tok) : acc.total - Number(tok), op: '+' }), { total: 0, op: '+' }).total;
}
const textOf = (v?: Visual) => (v && v.kind === 'text' ? v.text : '');

describe('Grade 1–2 math generators', () => {
  it('registers every new skill with a known strand, grade and standard', () => {
    for (const s of NEW) {
      expect(getSkill(s.id), s.id).toBe(s);
      expect(['number', 'algebra', 'measure', 'geometry']).toContain(s.strand);
      expect(['1', '2']).toContain(s.grade);
      expect(s.standards.length).toBeGreaterThan(0);
      expect(s.intro.length).toBe(1);
    }
  });

  it('yields many distinct practice items at every difficulty', () => {
    let total = 0;
    for (const s of NEW) {
      const practice = poolItems(s, 'practice');
      for (const d of DS) {
        const n = practice.filter((i) => i.difficulty === d).length;
        expect(n, `${s.id} d${d}`).toBeGreaterThanOrEqual(18);
      }
      expect(catalogue(s).length, s.id).toBeGreaterThanOrEqual(80);
      total += practice.length;
    }
    expect(total).toBeGreaterThan(2500);
  });

  it('never speaks a numeric answer in the prompt', () => {
    for (const s of NEW) for (const d of DS) for (const item of sample(s.id, d, 120)) {
      const a = answer(item);
      const t = a.text ?? '';
      if (/^\$?\d+(¢| in| cm| inches| feet| centimeters| meters)?$/.test(t)) {
        expect(nums(item.say), `${item.id}: ${item.say}`).not.toContain(answerNum(item));
      }
      if (t && !/^\$?\d/.test(t) && !['m1.order3', 'm1.equalparts', 'm2.fractions'].includes(s.id)) {
        expect(item.say.toLowerCase().includes(t.toLowerCase()), `${item.id}: "${t}" in "${item.say}"`).toBe(false);
      }
    }
  });

  it('keys side and vertex counts to the drawn shape', () => {
    for (const d of [1, 2] as Difficulty[]) for (const item of sample('m2.polygons', d)) {
      const v = item.visual;
      if (v?.kind !== 'shape') continue;
      const n = SIDES[v.shape];
      if (/name of this shape/.test(item.say)) expect(answer(item).text).toBe({ 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' }[n]);
      else expect(answerNum(item), item.id).toBe(n);
    }
    for (const item of sample('m2.polygons', 3)) {
      if (item.visual?.kind === 'shapeRow' && /in all/.test(item.say)) expect(answerNum(item)).toBe(item.visual.shapes.reduce((a, s) => a + SIDES[s.shape], 0));
      if (/^Which shape has exactly/.test(item.say)) {
        const want = nums(item.say)[0];
        for (const c of item.choices) if (c.visual?.kind === 'shape') expect(SIDES[c.visual.shape] === want, item.id).toBe(!!c.correct);
      }
    }
    for (const d of DS) for (const item of sample('m1.sortshapes', d)) {
      const want = d === 2 && item.visual?.kind === 'shape' ? SIDES[item.visual.shape] : /triangle/.test(item.say) ? 3 : /4|shape with 4/.test(item.say) ? 4 : /pentagon/.test(item.say) ? 5 : /hexagon/.test(item.say) ? 6 : 0;
      const sidesOf = (c: Item['choices'][number]) => (c.visual?.kind === 'shape' ? SIDES[c.visual.shape] ?? -1 : -1);
      if (/NOT/.test(item.say)) for (const c of item.choices) expect(sidesOf(c) === want, item.id).toBe(!c.correct);
      else if (want) for (const c of item.choices) expect(sidesOf(c) === want, item.id).toBe(!!c.correct);
    }
  });

  it('keys grids, arrays, rulers and line plots to their pictures', () => {
    for (const id of ['m2.gridsquares', 'm2.arrays']) for (const d of DS) for (const item of sample(id, d)) {
      const v = item.visual;
      if (v?.kind === 'grid' && /How many/.test(item.say)) expect(answerNum(item), item.id).toBe(v.rows * v.cols);
      if (v?.kind === 'grid' && /addition/.test(item.say)) expect(value(answer(item).text!)).toBe(v.rows * v.cols);
    }
    for (const d of DS) for (const item of sample('m2.ruler', d)) {
      const v = item.visual;
      if (v?.kind !== 'ruler') throw Error('expected ruler');
      const [a, b] = v.objects.map((o) => o.to - o.from);
      expect(answerNum(item), item.id).toBe(v.objects.length === 1 ? a : a - b);
    }
    for (const d of DS) for (const item of sample('m2.lineplot', d)) {
      const v = item.visual;
      if (v?.kind !== 'lineplot') throw Error('expected line plot');
      if (/measured in all/.test(item.say)) expect(answerNum(item)).toBe(v.counts.reduce((x, y) => x + y, 0));
      const m = item.say.match(/are (\d+) \w+ long\?/);
      if (m) expect(answerNum(item)).toBe(v.counts[Number(m[1]) - v.start]);
      const longer = item.say.match(/longer than (\d+)/);
      if (longer) expect(answerNum(item)).toBe(v.counts.reduce((acc, c, i) => acc + (v.start + i > Number(longer[1]) ? c : 0), 0));
    }
  });

  it('keys graphs, coins and clocks to their pictures', () => {
    for (const [id, d] of [['m1.graphs', 1], ['m2.bargraph', 1], ['m1.graphs', 3], ['m2.bargraph', 3]] as const) for (const item of sample(id, d)) {
      const v = item.visual!;
      const rows = v.kind === 'graph' ? v.rows.map((r) => ({ emoji: r.emoji, n: r.count })) : v.kind === 'bars' ? v.bars.map((b) => ({ emoji: b.emoji, n: b.value })) : [];
      if (/in all\?$/.test(item.say) && /shown on the graph/.test(item.say)) expect(answerNum(item)).toBe(rows.reduce((a, r) => a + r.n, 0));
      const one = item.show?.match(/^How many (.+)\?$/u);
      if (one && rows.some((r) => r.emoji === one[1])) expect(answerNum(item)).toBe(rows.find((r) => r.emoji === one[1])!.n);
      if (/most\?$|fewest\?$/.test(item.say)) {
        const best = /most/.test(item.say) ? Math.max(...rows.map((r) => r.n)) : Math.min(...rows.map((r) => r.n));
        expect(rows.find((r) => r.emoji === (answer(item).visual as { emoji: string }).emoji)!.n).toBe(best);
      }
    }
    for (const item of sample('m2.moneyword', 1)) {
      const v = item.visual;
      if (v?.kind !== 'coins') throw Error('expected coins');
      expect(answerNum(item)).toBe(v.labels!.reduce((a, l) => a + COIN[l], 0));
    }
    for (const item of sample('m2.moneyword', 2)) {
      const target = item.say.match(/exactly (\d+) cents/);
      if (target) for (const c of item.choices) if (c.visual?.kind === 'coins') expect(c.visual.values.reduce((a, b) => a + b, 0) === Number(target[1])).toBe(!!c.correct);
    }
    for (const item of sample('m1.clockmatch', 3)) {
      const v = item.visual;
      if (v?.kind !== 'clock') throw Error('expected clock');
      const k = nums(item.say)[0];
      const want = ((v.hour + (/ago/.test(item.say) ? -k : k) + 23) % 12) + 1;
      expect(answer(item).text).toBe(`${want}:00`);
    }
    for (const d of [1, 2] as Difficulty[]) for (const item of sample('m1.clockmatch', d)) {
      const c = answer(item).visual;
      if (c?.kind !== 'clock') throw Error('expected clock choice');
      expect(item.show!.includes(`${c.hour}:${String(c.minute).padStart(2, '0')}`) || item.say.includes(`${c.hour}`), item.id).toBe(true);
      expect(c.minute).toBe(d === 1 ? 0 : 30);
    }
  });

  it('keys number forms, comparisons and equations', () => {
    for (const d of DS) for (const item of sample('m2.comparesign', d)) {
      const [l, r] = textOf(item.visual).split(/\s+\?\s+/);
      const want = value(l) > value(r) ? '>' : value(l) < value(r) ? '<' : '=';
      expect(textOf(answer(item).visual), item.id).toBe(want);
    }
    for (const id of ['m1.equations', 'm2.missing']) for (const d of DS) for (const item of sample(id, d)) {
      if (item.visual) {
        const [l, r] = textOf(item.visual).replace('?', String(answerNum(item))).split(' = ');
        expect(value(l), item.id).toBe(value(r));
      } else {
        for (const c of item.choices) {
          const [l, r] = textOf(c.visual).split(' = ');
          expect(value(l) === value(r), `${item.id} ${textOf(c.visual)}`).toBe(!!c.correct);
        }
      }
    }
    for (const d of [1, 3] as Difficulty[]) for (const item of sample('m2.expanded', d)) {
      if (/hundreds, (\d+) tens/.test(item.say)) {
        const [h, t, o] = nums(item.say);
        expect(answerNum(item)).toBe(h * 100 + t * 10 + o);
      } else expect(answerNum(item), item.id).toBe(nums(item.say).reduce((a, b) => a + b, 0));
    }
    for (const d of DS) for (const item of sample('m1.tensones', d)) {
      if (/tens and (\d+) ones\?/.test(item.say)) {
        const [t, o] = nums(item.say);
        expect(answerNum(item)).toBe(t * 10 + o);
      }
      if (/another way/.test(item.say)) expect(value(answer(item).text!.replace(' and ', ' '))).toBe(nums(item.say)[0]);
    }
    for (const d of [1, 2] as Difficulty[]) for (const item of sample('m2.tenmore100', d)) {
      const [step, n] = nums(item.say);
      expect(answerNum(item)).toBe(/more/.test(item.say) ? n + step : n - step);
    }
  });

  it('names fractions and fair shares correctly', () => {
    const ONE: Record<number, string> = { 2: 'half', 3: 'third', 4: 'fourth' };
    const MANY: Record<number, string> = { 2: 'halves', 3: 'thirds', 4: 'fourths' };
    const W = ['', 'one', 'two', 'three'];
    for (const id of ['m1.equalparts', 'm2.fractions']) for (const d of DS) for (const item of sample(id, d)) {
      const v = item.visual;
      if (/What part is shaded/.test(item.say) && v?.kind === 'parts') expect(answer(item).text).toBe(`${W[v.shaded!]} ${v.shaded === 1 ? ONE[v.n] : MANY[v.n]}`);
      const which = item.say.match(/^Which shape shows (\w+)\?/);
      if (which) for (const c of item.choices) if (c.visual?.kind === 'parts') expect(c.visual.equal !== false && MANY[c.visual.n] === which[1]).toBe(!!c.correct);
      const bigger = item.say.match(/Which shaded part is (bigger|smaller)/);
      if (bigger) {
        const ns = item.choices.filter((c) => c.visual?.kind === 'parts').map((c) => (c.visual as { n: number }).n);
        const want = bigger[1] === 'bigger' ? Math.min(...ns) : Math.max(...ns);
        expect((answer(item).visual as { n: number }).n).toBe(want);
      }
    }
  });

  it('orders lengths by the whole bar, not by where it ends', () => {
    for (const d of [1, 2] as Difficulty[]) for (const item of sample('m1.order3', d)) {
      const v = item.visual;
      if (v?.kind !== 'lengths') throw Error('expected lengths');
      const m = item.say.match(/the (longest|shortest|tallest)\?/);
      if (!m) continue;
      const sizes = v.items.map((x) => x.size);
      const want = m[1] === 'shortest' ? Math.min(...sizes) : Math.max(...sizes);
      const emoji = (answer(item).visual as { emoji: string }).emoji;
      expect(v.items.find((x) => x.emoji === emoji)!.size).toBe(want);
    }
  });
});
