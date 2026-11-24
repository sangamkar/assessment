import type { Choice, Difficulty, Item, PiecesPreset, Rng, ShapeKind, ShapeSpec, Skill, Visual } from './types';
import { makeItem, numberChoices } from './helpers';

/*
 * Grade 1–2 depth for the i-Ready domains that were thin: Geometry and
 * Measurement & Data first, then gaps in Number and Algebraic Thinking.
 * Georgia K-12 Mathematics Standards (2023) codes, checked with the
 * Learning Commons standards service; CCSS codes where Georgia has none.
 * Every skill is a generator whose output grows with the difficulty.
 */

type Draft = Omit<Choice, 'id'>;
const right = (c: Omit<Draft, 'correct' | 'why'>): Draft => ({ ...c, correct: true });
const wrong = (c: Omit<Draft, 'correct' | 'why'>, why: string): Draft => ({ ...c, why });
/** Correct choice first; drops repeats (same text and picture) and keeps at most `max`. */
function dedupe(list: Draft[], max = 4): Draft[] {
  const seen = new Set<string>();
  const out: Draft[] = [];
  for (const c of list) {
    const key = JSON.stringify({ t: c.text, v: c.visual });
    if (seen.has(key) || out.length >= max) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}
const t = (text: string, why?: string, say?: string): Draft => (why ? wrong({ text, say: say ?? text }, why) : right({ text, say: say ?? text }));
const v = (visual: Visual, say: string | undefined, why?: string): Draft => (why ? wrong({ visual, say }, why) : right({ visual, say }));
/** Numeric choices with a unit word added to text and speech (e.g. "7 in", "7 inches"). */
const withUnit = (cs: Choice[], short: string, long: string) => cs.map((c) => ({ ...c, text: `${c.text}${short}`, say: `${c.say} ${long}` }));
const cents = (cs: Choice[]) => withUnit(cs, '¢', 'cents');
const dollars = (cs: Choice[]) => cs.map((c) => ({ ...c, text: `$${c.text}`, say: `${c.say} dollars` }));

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
const NAMES = ['Mia', 'Leo', 'Ava', 'Sam', 'Zoe', 'Raj', 'Ella', 'Ben', 'Nora', 'Omar', 'Lily', 'Jay'];
const twoNames = (rng: Rng) => {
  const [a, b] = rng.shuffle(NAMES);
  return [a, b] as const;
};
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/* ======================================================================== */
/* GEOMETRY                                                                 */
/* ======================================================================== */

type Family = 'triangle' | 'quadrilateral' | 'pentagon' | 'hexagon' | 'octagon' | 'circle';
const FAMILY: Record<Family, { sides: number; kinds: ShapeKind[] }> = {
  triangle: { sides: 3, kinds: ['triangle', 'right-triangle', 'scalene-triangle', 'obtuse-triangle'] },
  quadrilateral: { sides: 4, kinds: ['square', 'rectangle', 'trapezoid', 'rhombus', 'parallelogram', 'kite', 'irregular-quad'] },
  pentagon: { sides: 5, kinds: ['pentagon', 'irregular-pentagon'] },
  hexagon: { sides: 6, kinds: ['hexagon', 'irregular-hexagon', 'concave-hexagon'] },
  octagon: { sides: 8, kinds: ['octagon'] },
  circle: { sides: 0, kinds: ['circle'] },
};
const familyOf = (k: ShapeKind): Family | undefined => (Object.keys(FAMILY) as Family[]).find((f) => FAMILY[f].kinds.includes(k));
const ROT = [0, 30, 45, 90, 135, 180, 210, 270, 315];
const randomSpec = (rng: Rng, shape: ShapeKind, color?: string): ShapeSpec => ({
  shape,
  color: color ?? rng.pick(COLORS),
  rotate: shape === 'circle' ? undefined : rng.pick(ROT),
  scale: rng.pick([0.7, 0.85, 1]),
  ...(shape === 'rectangle' ? { stretch: rng.pick([1.5, 1.8, 2.4]) } : {}),
});
const shapeVis = (s: ShapeSpec): Visual => ({ kind: 'shape', ...s });

const sortShapes: Skill = {
  id: 'm1.sortshapes',
  subject: 'math',
  strand: 'geometry',
  grade: '1',
  title: 'Name and sort shapes by defining attributes (not color, size or turn)',
  kidTitle: 'Shape sorter',
  icon: '🔺',
  standards: ['1.GSR.4.1'],
  prereqs: ['m.shapeattr'],
  parentTip: 'Cut paper triangles that are long, skinny, tiny and upside down. Ask: “Is it still a triangle? How do you know?” (3 straight sides, 3 corners, closed).',
  intro: [
    {
      say: 'A triangle has three straight sides and three corners, and it is closed. Big, small, turned or any color, it is still a triangle!',
      visual: { kind: 'shapeRow', shapes: [{ shape: 'triangle', color: '#ef4444' }, { shape: 'scalene-triangle', color: '#3b82f6', rotate: 90 }, { shape: 'obtuse-triangle', color: '#10b981', scale: 0.7 }] },
    },
  ],
  generate: (rng, d) => {
    const targets: Family[] = d === 1 ? ['triangle', 'quadrilateral', 'hexagon', 'circle', 'pentagon'] : ['triangle', 'quadrilateral', 'pentagon', 'hexagon'];
    const fam = rng.pick(targets);
    const name = fam === 'quadrilateral' ? 'shape with 4 sides' : fam;
    const others = (Object.keys(FAMILY) as Family[]).filter((f) => f !== fam && f !== 'octagon');
    if (d === 1) {
      const kinds = fam === 'circle' ? ['circle' as ShapeKind] : FAMILY[fam].kinds.slice(0, fam === 'quadrilateral' ? 4 : 2);
      const choices = [
        v(shapeVis(randomSpec(rng, rng.pick(kinds))), undefined),
        ...(fam === 'circle' ? [v(shapeVis(randomSpec(rng, 'oval')), undefined, 'oval_circle_confusion')] : []),
        ...rng.shuffle(others).slice(0, fam === 'circle' ? 2 : 3).map((f) => v(shapeVis(randomSpec(rng, rng.pick(FAMILY[f].kinds.slice(0, 2)))), undefined, f === 'circle' ? 'curved_vs_straight_sides' : 'side_count_confusion')),
      ];
      return makeItem('m1.sortshapes', `find-${fam}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: fam === 'quadrilateral' ? 'Which shape has exactly 4 straight sides?' : `Which shape is a ${fam}?`,
        show: fam === 'quadrilateral' ? 'Which has 4 sides?' : `Find the ${fam}`,
        choices,
        speakChoices: false,
        explain:
          fam === 'circle'
            ? 'A circle is round all the way around. It has no straight sides and no corners.'
            : fam === 'quadrilateral'
              ? 'Count the sides of each shape. The right one has 4 straight sides and 4 corners.'
              : `A ${name} has ${FAMILY[fam].sides} straight sides and ${FAMILY[fam].sides} corners. Count the sides of each shape.`,
      });
    }
    if (d === 2) {
      // A sample shape, then a look-alike trap: same color and size but the wrong shape.
      const sample = randomSpec(rng, rng.pick(FAMILY[fam].kinds));
      const answerKind = rng.pick(FAMILY[fam].kinds.filter((k) => k !== sample.shape));
      const answer = { ...randomSpec(rng, answerKind, rng.pick(COLORS.filter((c) => c !== sample.color))), scale: sample.scale === 1 ? 0.7 : 1 };
      const trapFams = rng.shuffle(others.filter((f) => f !== 'circle')).slice(0, 2);
      const choices = [
        v(shapeVis(answer), undefined),
        ...trapFams.map((f) => v(shapeVis({ ...randomSpec(rng, rng.pick(FAMILY[f].kinds), sample.color), rotate: sample.rotate, scale: sample.scale }), undefined, 'sorted_by_color_or_size')),
        v(shapeVis({ shape: fam === 'triangle' ? rng.pick(['open-triangle', 'curvy-triangle'] as ShapeKind[]) : 'oval', color: sample.color }), undefined, fam === 'triangle' ? 'non_example_accepted' : 'curved_vs_straight_sides'),
      ];
      return makeItem('m1.sortshapes', `same-${JSON.stringify(sample)}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: fam === 'quadrilateral' ? 'This shape has 4 sides. Which other shape also has 4 sides?' : `This is a ${name}. Which other shape is also a ${name}?`,
        show: fam === 'quadrilateral' ? 'Which also has 4 sides?' : `Which is also a ${name}?`,
        visual: shapeVis(sample),
        choices,
        speakChoices: false,
        hint: 'Color and size do not matter. Count the sides and corners.',
        explain: `Count the straight sides: a ${name} has ${FAMILY[fam].sides}. The answer looks different, but it has ${FAMILY[fam].sides} sides and ${FAMILY[fam].sides} corners too. Shapes with the same color or size are not always the same shape.`,
      });
    }
    // d3: which one is NOT? Three different-looking members, one close non-example.
    const members = rng.shuffle(FAMILY[fam].kinds).concat(rng.shuffle(FAMILY[fam].kinds)).slice(0, 3);
    const nonExample: { kind: ShapeKind; why: string } =
      fam === 'triangle'
        ? rng.pick([{ kind: 'open-triangle', why: 'open' }, { kind: 'curvy-triangle', why: 'curved' }, { kind: 'trapezoid', why: 'four' }] as const)
        : fam === 'quadrilateral'
          ? rng.pick([{ kind: 'pentagon', why: 'five' }, { kind: 'irregular-pentagon', why: 'five' }, { kind: 'triangle', why: 'three' }] as const)
          : fam === 'pentagon'
            ? rng.pick([{ kind: 'hexagon', why: 'six' }, { kind: 'irregular-hexagon', why: 'six' }, { kind: 'irregular-quad', why: 'four' }] as const)
            : rng.pick([{ kind: 'pentagon', why: 'five' }, { kind: 'octagon', why: 'eight' }, { kind: 'irregular-pentagon', why: 'five' }] as const);
    const reason = nonExample.why === 'open' ? 'it is not closed: there is a gap' : nonExample.why === 'curved' ? 'its sides are curved, not straight' : `it has ${nonExample.why} sides`;
    const choices = dedupe([
      v(shapeVis(randomSpec(rng, nonExample.kind)), undefined),
      ...members.map((k) => v(shapeVis(randomSpec(rng, k)), undefined, 'orientation_or_proportion_changes_shape')),
    ]);
    return makeItem('m1.sortshapes', `not-${fam}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
      say: fam === 'quadrilateral' ? 'Three of these have 4 sides. Which shape does NOT have 4 sides?' : `Which shape is NOT a ${fam}?`,
      show: fam === 'quadrilateral' ? 'Which does NOT have 4 sides?' : `Which is NOT a ${fam}?`,
      choices,
      speakChoices: false,
      hint: 'Skinny, turned or tilted shapes still count. Check sides, corners, and if it is closed.',
      explain: `${fam === 'quadrilateral' ? 'The odd one out' : `The odd one out is not a ${name} because`} ${fam === 'quadrilateral' ? reason.replace('it has', 'has') : reason}. The others all have ${FAMILY[fam].sides} straight sides, even the turned and stretched ones.`,
    });
  },
};

const SIDES_NAME: Record<number, string> = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' };
const art = (w: string) => `${/^[aeiou]/.test(w) ? 'an' : 'a'} ${w}`;
const KIND_FOR: Record<number, ShapeKind> = { 3: 'triangle', 4: 'kite', 5: 'pentagon', 6: 'hexagon', 8: 'octagon' };
const polygons: Skill = {
  id: 'm2.polygons',
  subject: 'math',
  strand: 'geometry',
  grade: '2',
  title: 'Polygons: count sides and vertices, name triangles, quadrilaterals, pentagons, hexagons',
  kidTitle: 'Sides and vertices',
  icon: '⬡',
  standards: ['2.GSR.7.1'],
  prereqs: ['m1.sortshapes', 'm2.shapes'],
  parentTip: 'Draw a wiggly closed shape with straight sides. Count sides and vertices (corners) together, then name it by its number of sides.',
  intro: [
    {
      say: 'A vertex is a corner. A polygon is named by how many sides it has: three is a triangle, four is a quadrilateral, five is a pentagon, six is a hexagon.',
      visual: { kind: 'shapeRow', shapes: [{ shape: 'scalene-triangle', color: '#ef4444' }, { shape: 'kite', color: '#3b82f6' }, { shape: 'irregular-pentagon', color: '#10b981' }, { shape: 'concave-hexagon', color: '#f59e0b' }] },
    },
  ],
  generate: (rng, d) => {
    const regular: ShapeKind[] = ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'trapezoid', 'rhombus'];
    const odd: ShapeKind[] = ['scalene-triangle', 'obtuse-triangle', 'parallelogram', 'kite', 'irregular-quad', 'irregular-pentagon', 'irregular-hexagon', 'concave-hexagon', 'octagon'];
    const mode = d === 3 ? rng.pick(['more', 'total', 'fromVertices'] as const) : rng.pick(['sides', 'vertices', 'name'] as const);
    if (d <= 2) {
      const spec = randomSpec(rng, rng.pick(d === 1 ? regular : odd));
      const n = FAMILY[familyOf(spec.shape)!].sides;
      if (mode === 'name') {
        const choices = dedupe([
          t(SIDES_NAME[n]),
          ...[3, 4, 5, 6].filter((k) => k !== n).map((k) => t(SIDES_NAME[k], Math.abs(k - n) === 1 ? 'miscounted_sides' : 'shape_name_confusion')),
        ]);
        return makeItem('m2.polygons', `name-${JSON.stringify(spec)}`, d, {
          say: 'What is the name of this shape?',
          show: 'Name this shape',
          visual: shapeVis(spec),
          choices,
          hint: 'Count the straight sides first.',
          explain: `It has ${n} straight sides and ${n} vertices, so it is a ${SIDES_NAME[n]}, even though it looks ${d === 2 ? 'unusual' : 'turned'}.`,
        });
      }
      const word = mode === 'sides' ? 'sides' : 'vertices';
      return makeItem('m2.polygons', `${mode}-${JSON.stringify(spec)}`, d, {
        say: mode === 'sides' ? 'How many sides does this shape have?' : 'How many vertices, or corners, does this shape have?',
        show: `How many ${word}?`,
        visual: shapeVis(spec),
        choices: numberChoices(rng, n, [
          { n: n - 1, why: 'missed_a_side' },
          { n: n + 1, why: 'counted_a_side_twice' },
          { n: n * 2, why: 'counted_sides_and_vertices' },
        ], { min: 1, max: 20 }),
        hint: 'Put your finger on one corner and go around. Count each one once.',
        explain: `Go around the shape and count: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. It has ${n} ${word}. A polygon always has as many vertices as sides.`,
      });
    }
    if (mode === 'more') {
      const [a, b] = rng.shuffle([3, 4, 5, 6, 8]).slice(0, 2).sort((x, y) => y - x);
      const ans = a - b;
      return makeItem('m2.polygons', `more${a}-${b}`, d, {
        say: `How many more sides does ${art(SIDES_NAME[a])} have than ${art(SIDES_NAME[b])}?`,
        show: `${SIDES_NAME[a]} vs ${SIDES_NAME[b]}: how many more sides?`,
        visual: { kind: 'shapeRow', shapes: [a, b].map((k) => randomSpec(rng, rng.pick(FAMILY[familyOf(KIND_FOR[k])!].kinds))) },
        choices: numberChoices(rng, ans, [
          { n: a + b, why: 'added_instead' },
          { n: a, why: 'answered_one_part' },
          { n: ans + 1, why: 'near_miss' },
        ], { min: 0, max: 20 }),
        explain: `${cap(art(SIDES_NAME[a]))} has ${a} sides. ${cap(art(SIDES_NAME[b]))} has ${b} sides. ${a} minus ${b} is ${ans}.`,
      });
    }
    if (mode === 'total') {
      const kinds = rng.shuffle([...odd, ...regular]).slice(0, rng.pick([2, 3]));
      const specs = kinds.map((k) => randomSpec(rng, k));
      const ns = kinds.map((k) => FAMILY[familyOf(k)!].sides);
      const ans = ns.reduce((x, y) => x + y, 0);
      const what = rng.pick(['sides', 'vertices']);
      return makeItem('m2.polygons', `total-${what}-${JSON.stringify(specs)}`, d, {
        say: `How many ${what} do these shapes have in all?`,
        show: `Total ${what}`,
        visual: { kind: 'shapeRow', shapes: specs },
        choices: numberChoices(rng, ans, [
          { n: ans - ns[0], why: 'missed_a_shape' },
          { n: ans - 1, why: 'missed_a_side' },
          { n: ans + 1, why: 'counted_a_side_twice' },
        ], { min: 1, max: 40 }),
        explain: `Count each shape: ${ns.join(' + ')} = ${ans} ${what}.`,
      });
    }
    const n = rng.pick([3, 4, 5, 6]);
    const what = rng.pick(['vertices', 'sides']);
    const choices = dedupe([
      v(shapeVis(randomSpec(rng, rng.pick(FAMILY[familyOf(KIND_FOR[n])!].kinds))), undefined),
      ...rng.shuffle([3, 4, 5, 6, 8].filter((k) => k !== n)).slice(0, 3).map((k) => v(shapeVis(randomSpec(rng, rng.pick(FAMILY[familyOf(KIND_FOR[k])!].kinds))), undefined, Math.abs(k - n) === 1 ? 'miscounted_sides' : 'side_count_confusion')),
    ]);
    return makeItem('m2.polygons', `has${n}${what}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
      say: `Which shape has exactly ${n} ${what}?`,
      show: `Exactly ${n} ${what}`,
      choices,
      speakChoices: false,
      explain: `Count the ${what} of each shape. Only one has ${n}: it is a ${SIDES_NAME[n]}.`,
    });
  },
};

type Solid = 'cube' | 'rect-prism' | 'pyramid' | 'tri-prism' | 'cylinder' | 'cone' | 'sphere';
const SOLID: Record<Solid, { name: string; faces: number; vertices: number; edges: number; rolls: boolean; stacks: boolean; face: ShapeKind | null; thing?: string; thingName?: string }> = {
  cube: { name: 'cube', faces: 6, vertices: 8, edges: 12, rolls: false, stacks: true, face: 'square', thing: '🎲', thingName: 'a game die' },
  'rect-prism': { name: 'rectangular prism', faces: 6, vertices: 8, edges: 12, rolls: false, stacks: true, face: 'rectangle', thing: '📦', thingName: 'a box' },
  pyramid: { name: 'pyramid', faces: 5, vertices: 5, edges: 8, rolls: false, stacks: false, face: null },
  'tri-prism': { name: 'triangular prism', faces: 5, vertices: 6, edges: 9, rolls: false, stacks: true, face: null },
  cylinder: { name: 'cylinder', faces: 2, vertices: 0, edges: 0, rolls: true, stacks: true, face: 'circle', thing: '🥫', thingName: 'a can' },
  cone: { name: 'cone', faces: 1, vertices: 1, edges: 0, rolls: true, stacks: false, face: 'circle' },
  sphere: { name: 'sphere', faces: 0, vertices: 0, edges: 0, rolls: true, stacks: false, face: null, thing: '⚽', thingName: 'a ball' },
};
const solidVis = (rng: Rng, s: Solid): Visual => ({ kind: 'shape', shape: s, color: rng.pick(COLORS) });

const solids: Skill = {
  id: 'm1.solids',
  subject: 'math',
  strand: 'geometry',
  grade: '1',
  title: '3-D shapes: names, flat faces, vertices, edges; roll, stack, slide',
  kidTitle: 'Faces, edges and vertices',
  icon: '🧊',
  standards: ['1.GSR.4.1', '2.GSR.7.1'],
  prereqs: ['m.shapes3d'],
  parentTip: 'Collect a can, a box, a ball and an ice-cream cone. Test which ones roll, stack and slide, and trace a flat face of each on paper.',
  intro: [
    {
      say: 'Solid shapes have flat faces, edges and corners called vertices. A cube has six square faces. A cylinder has two flat circle faces and can roll.',
      visual: { kind: 'shapeRow', shapes: [{ shape: 'cube', color: '#f59e0b' }, { shape: 'cylinder', color: '#3b82f6' }, { shape: 'pyramid', color: '#10b981' }] },
    },
  ],
  generate: (rng, d) => {
    const all = Object.keys(SOLID) as Solid[];
    if (d === 1) {
      const mode = rng.pick(['name', 'name', 'object'] as const);
      if (mode === 'object') {
        const s = rng.pick(all.filter((k) => SOLID[k].thing));
        const choices = dedupe([
          t(SOLID[s].name),
          ...rng.shuffle(all.filter((k) => k !== s && !(s === 'cube' && k === 'rect-prism') && !(s === 'rect-prism' && k === 'cube'))).slice(0, 3).map((k) => t(SOLID[k].name, 'solid_name_confusion')),
        ]);
        return makeItem('m1.solids', `object-${s}-${choices.map((c) => c.text).join('|')}`, d, {
          say: `What solid shape is ${SOLID[s].thingName}?`,
          show: `${SOLID[s].thingName}: what shape?`,
          visual: { kind: 'emoji', emoji: SOLID[s].thing!, size: 'xl' },
          choices,
          explain: `${SOLID[s].thingName![0].toUpperCase()}${SOLID[s].thingName!.slice(1)} is shaped like a ${SOLID[s].name}.`,
        });
      }
      const s = rng.pick(all);
      const choices = dedupe([t(SOLID[s].name), ...rng.shuffle(all.filter((k) => k !== s)).slice(0, 3).map((k) => t(SOLID[k].name, (s === 'cube' && k === 'rect-prism') || (s === 'cone' && k === 'pyramid') || (s === 'pyramid' && k === 'cone') ? 'similar_solid_confusion' : 'solid_name_confusion'))]);
      const vis = solidVis(rng, s);
      return makeItem('m1.solids', `name-${JSON.stringify(vis)}-${choices.map((c) => c.text).join('|')}`, d, {
        say: 'What is the name of this solid shape?',
        show: 'Name this solid',
        visual: vis,
        choices,
        explain: `This is a ${SOLID[s].name}. ${s === 'cube' ? 'All 6 faces are squares.' : s === 'rect-prism' ? 'Its faces are rectangles, like a box.' : s === 'cylinder' ? 'It has 2 flat circle faces and a curved side.' : s === 'cone' ? 'It has 1 flat circle face and comes to a point.' : s === 'sphere' ? 'It is round everywhere, like a ball.' : s === 'pyramid' ? 'Its sides are triangles that meet at a point.' : 'Its two ends are triangles.'}`,
      });
    }
    if (d === 2) {
      const mode = rng.pick(['faces', 'faces', 'roll', 'nofaces', 'stackroll'] as const);
      if (mode === 'faces') {
        const s = rng.pick(['cube', 'rect-prism', 'pyramid', 'tri-prism', 'cylinder', 'cone'] as Solid[]);
        const f = SOLID[s].faces;
        const vis = solidVis(rng, s);
        return makeItem('m1.solids', `faces-${JSON.stringify(vis)}`, d, {
          say: `How many flat faces does a ${SOLID[s].name} have?`,
          show: `Flat faces on a ${SOLID[s].name}`,
          visual: vis,
          choices: numberChoices(rng, f, [
            { n: s === 'cube' || s === 'rect-prism' ? 3 : s === 'pyramid' || s === 'tri-prism' ? f - 2 : f + 1, why: 'counted_visible_faces' },
            { n: SOLID[s].vertices, why: 'faces_vertices_confusion' },
            { n: s === 'cylinder' ? 3 : s === 'cone' ? 0 : f + 1, why: s === 'cylinder' || s === 'cone' ? 'curved_surface_counted_as_face' : 'near_miss' },
          ], { min: 0, max: 12 }),
          hint: 'Some faces are hiding at the back and the bottom.',
          explain:
            s === 'cylinder'
              ? 'A cylinder has 2 flat faces: the circle on top and the circle on the bottom. The curved side is not flat.'
              : s === 'cone'
                ? 'A cone has 1 flat face, the circle on the bottom. The rest is curved.'
                : `A ${SOLID[s].name} has ${f} flat faces. In the picture some are hidden at the back and bottom.`,
        });
      }
      const pickWhere = (pred: (k: Solid) => boolean, n: number) => rng.shuffle(all.filter(pred)).slice(0, n);
      const [ask, test, why] =
        mode === 'roll'
          ? ['Which solid shape can roll?', (k: Solid) => SOLID[k].rolls, 'roll_needs_curved_surface']
          : mode === 'nofaces'
            ? ['Which solid shape has no flat faces at all?', (k: Solid) => SOLID[k].faces === 0, 'curved_surface_counted_as_face']
            : ['Which solid shape can roll AND stack?', (k: Solid) => SOLID[k].rolls && SOLID[k].stacks, 'only_checked_one_rule'];
      const ans = rng.pick(all.filter(test));
      const others = pickWhere((k) => !test(k) && k !== ans, 3);
      const choices = [v(solidVis(rng, ans), SOLID[ans].name), ...others.map((k) => v(solidVis(rng, k), SOLID[k].name, why))];
      return makeItem('m1.solids', `${mode}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: ask,
        show: ask,
        choices,
        explain:
          mode === 'roll'
            ? `A shape with a curved surface can roll. The ${SOLID[ans].name} rolls; shapes with only flat faces slide instead.`
            : mode === 'nofaces'
              ? 'A sphere is curved all over, so it has no flat faces.'
              : 'A cylinder rolls on its curved side and stacks on its flat circle faces.',
      });
    }
    const mode = rng.pick(['vertices', 'edges', 'faceShape'] as const);
    if (mode === 'faceShape') {
      const s = rng.pick(['cube', 'rect-prism', 'cylinder', 'cone'] as Solid[]);
      const face = SOLID[s].face!;
      const pool: ShapeKind[] = ['square', 'rectangle', 'circle', 'triangle', 'hexagon'].filter((k) => k !== face && !(face === 'square' && k === 'rectangle') && !(face === 'rectangle' && k === 'square')) as ShapeKind[];
      const choices = [v(shapeVis({ shape: face, color: '#94a3b8', ...(face === 'rectangle' ? { stretch: 1.8 } : {}) }), face), ...rng.shuffle(pool).slice(0, 3).map((k) => v(shapeVis({ shape: k, color: '#94a3b8' }), k, 'face_shape_confusion'))];
      const vis = solidVis(rng, s);
      return makeItem('m1.solids', `trace-${JSON.stringify(vis)}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: `You trace around a flat face of this ${SOLID[s].name}. What shape do you draw?`,
        show: 'Trace a flat face. What shape?',
        visual: vis,
        choices,
        explain: `Every flat face of a ${SOLID[s].name} is ${face === 'circle' ? 'a circle' : `a ${face}`}, so tracing it draws ${face === 'circle' ? 'a circle' : `a ${face}`}.`,
      });
    }
    const s = rng.pick(mode === 'vertices' ? (['cube', 'rect-prism', 'pyramid', 'tri-prism', 'cone'] as Solid[]) : (['cube', 'rect-prism', 'pyramid', 'tri-prism'] as Solid[]));
    const n = SOLID[s][mode];
    const vis = solidVis(rng, s);
    return makeItem('m1.solids', `${mode}-${JSON.stringify(vis)}`, d, {
      say: mode === 'vertices' ? `How many vertices, or corners, does a ${SOLID[s].name} have?` : `How many edges does a ${SOLID[s].name} have? An edge is where two faces meet.`,
      show: `${mode === 'vertices' ? 'Vertices' : 'Edges'} on a ${SOLID[s].name}`,
      visual: vis,
      choices: numberChoices(rng, n, [
        { n: SOLID[s].faces, why: 'faces_vertices_confusion' },
        { n: mode === 'vertices' ? n - 1 : n - 3, why: 'counted_visible_only' },
        { n: n + 2, why: 'near_miss' },
      ], { min: 0, max: 16 }),
      hint: 'The dashed lines show the hidden parts.',
      explain:
        s === 'cone'
          ? 'A cone has 1 vertex: the point at the top.'
          : mode === 'vertices'
            ? `A ${SOLID[s].name} has ${n} vertices. ${s === 'cube' || s === 'rect-prism' ? '4 on top and 4 on the bottom.' : s === 'pyramid' ? '4 around the square bottom and 1 at the top.' : '3 on each triangle end.'}`
            : `A ${SOLID[s].name} has ${n} edges. ${s === 'cube' || s === 'rect-prism' ? '4 on top, 4 on the bottom and 4 going up and down.' : s === 'pyramid' ? '4 around the bottom and 4 going up to the point.' : '3 on each triangle end and 3 joining them.'}`,
    });
  },
};

/* ---- Equal shares: halves, thirds, fourths ---- */

const ONE: Record<number, string> = { 2: 'half', 3: 'third', 4: 'fourth' };
const MANY: Record<number, string> = { 2: 'halves', 3: 'thirds', 4: 'fourths' };
const WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const fracName = (k: number, n: number) => `${WORD[k]} ${k === 1 ? ONE[n] : MANY[n]}`;
type PartsShape = 'circle' | 'rect' | 'square';
type Cut = 'v' | 'h' | 'grid' | 'diag';
const partsVis = (shape: PartsShape, n: number, equal: boolean, cut: Cut, color: string, shaded?: number): Visual => ({ kind: 'parts', shape, n, equal, cut: shape === 'circle' || !equal ? (cut === 'h' && shape !== 'circle' ? 'h' : 'v') : cut, color, ...(shaded === undefined ? {} : { shaded }) });
// Diagonal cuts only on squares and circles: a long rectangle cut corner to corner gives
// triangles of different shapes, which a young child reasonably reads as unfair shares.
const randomCut = (rng: Rng, n: number, grade: 1 | 2, shape: PartsShape): Cut => {
  const diag: Cut[] = shape === 'rect' ? [] : ['diag'];
  return rng.pick<Cut>(n === 2 ? ['v', 'h', ...diag] : n === 4 ? (grade === 2 ? ['v', 'h', 'grid', ...diag] : ['v', 'h', 'grid', 'grid']) : ['v', 'h']);
};

function sharesGenerator(id: string, grade: 1 | 2) {
  const counts = grade === 1 ? [2, 4] : [2, 3, 4];
  return (rng: Rng, d: Difficulty): Item => {
    const shape = rng.pick<PartsShape>(['circle', 'rect', 'square']);
    const color = rng.pick(COLORS);
    const n = rng.pick(counts);
    if (d === 1) {
      const cut = randomCut(rng, n, grade, shape);
      const otherNs = counts.filter((k) => k !== n);
      const choices = dedupe([
        v(partsVis(shape, n, true, cut, color), undefined),
        v(partsVis(shape, n, false, rng.pick<Cut>(['v', 'h']), color), undefined, 'unequal_parts_accepted'),
        ...otherNs.map((k) => v(partsVis(shape, k, true, randomCut(rng, k, grade, shape), color), undefined, n === 3 || k === 3 ? 'counted_parts_wrong' : 'halves_fourths_confusion')),
        v(partsVis(shape, rng.pick(otherNs), false, 'v', color), undefined, 'unequal_parts_accepted'),
      ]);
      return makeItem(id, `which${n}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: `Which shape shows ${MANY[n]}? ${cap(MANY[n])} are ${WORD[n]} equal parts.`,
        show: `Which shows ${MANY[n]}?`,
        choices,
        speakChoices: false,
        hint: 'Count the parts. Then check: are they all the same size?',
        explain: `${cap(MANY[n])} means ${WORD[n]} parts that are all the same size. Parts that are different sizes are not ${MANY[n]}.`,
      });
    }
    if (d === 2) {
      const mode = rng.pick(grade === 2 ? (['name', 'name', 'pick', 'count'] as const) : (['name', 'pick', 'count'] as const));
      const cut = randomCut(rng, n, grade, shape);
      if (mode === 'name') {
        const k = grade === 2 ? rng.int(1, n - 1) : 1;
        const partToPart = n - k > 1 && counts.includes(n - k) && k < n - k ? [t(fracName(k, n - k), 'compared_shaded_to_unshaded')] : [];
        const choices = dedupe([
          t(fracName(k, n)),
          ...(k > 1 ? [t(fracName(1, n), 'counted_one_part_only')] : []),
          ...(n - k !== k ? [t(fracName(n - k, n), 'named_unshaded_part')] : []),
          ...partToPart,
          ...counts.filter((c) => c !== n).map((c) => t(fracName(Math.min(k, c - 1), c), 'fraction_name_confusion')),
          t('one whole', 'part_whole_confusion'),
        ]);
        return makeItem(id, `name${k}of${n}-${shape}-${cut}-${color}`, d, {
          say: 'The shape is cut into equal parts. What part is shaded?',
          show: 'What part is shaded?',
          visual: partsVis(shape, n, true, cut, color, k),
          choices,
          hint: 'How many equal parts in all? How many are shaded?',
          explain: `There are ${n} equal parts, so each part is one ${ONE[n]}. ${k === 1 ? 'One part is' : `${cap(WORD[k])} parts are`} shaded: ${fracName(k, n)}.`,
        });
      }
      if (mode === 'count') {
        return makeItem(id, `count${n}-${shape}-${cut}-${color}`, d, {
          say: 'How many equal parts is this shape cut into, and what are they called?',
          show: 'How many equal parts? What are they called?',
          visual: partsVis(shape, n, true, cut, color),
          choices: dedupe([
            t(`${n} ${MANY[n]}`, undefined, `${WORD[n]} ${MANY[n]}`),
            ...counts.filter((c) => c !== n).map((c) => t(`${n} ${MANY[c]}`, 'fraction_name_confusion', `${WORD[n]} ${MANY[c]}`)),
            t(`${n - 1} ${MANY[n]}`, 'counted_lines_not_parts', `${WORD[n - 1]} ${MANY[n]}`),
            t(`${n + 1} ${MANY[n]}`, 'count_double_tap', `${WORD[n + 1]} ${MANY[n]}`),
          ]),
          explain: `Count the parts: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. ${cap(WORD[n])} equal parts are called ${MANY[n]}.`,
        });
      }
      const choices = dedupe([
        v(partsVis(shape, n, true, cut, color, 1), undefined),
        v(partsVis(shape, n, false, rng.pick<Cut>(['v', 'h']), color, 1), undefined, 'unequal_parts_accepted'),
        ...counts.filter((c) => c !== n).map((c) => v(partsVis(shape, c, true, randomCut(rng, c, grade, shape), color, 1), undefined, 'fraction_name_confusion')),
        v(partsVis(shape, n, true, cut, color, n - 1), undefined, 'shaded_vs_unshaded'),
      ]);
      return makeItem(id, `pick1of${n}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: `Which shape has one ${ONE[n]} shaded?`,
        show: `Which shows one ${ONE[n]} shaded?`,
        choices,
        speakChoices: false,
        hint: `One ${ONE[n]} is 1 of ${WORD[n]} EQUAL parts.`,
        explain: `One ${ONE[n]} means the whole is cut into ${WORD[n]} equal parts and 1 part is shaded.`,
      });
    }
    // d3: reasoning about the size of parts and wholes
    const mode = rng.pick(grade === 2 ? (['bigger', 'whole', 'story', 'sameSize', 'bigger'] as const) : (['bigger', 'whole', 'story'] as const));
    if (mode === 'whole') {
      const thing = rng.pick(['pizza', 'sandwich', 'pie', 'tortilla', 'cake']);
      const thingShape: PartsShape = thing === 'sandwich' ? 'square' : thing === 'cake' ? 'rect' : 'circle';
      return makeItem(id, `whole${n}-${thing}-${color}`, d, {
        say: `A ${thing} is cut into ${MANY[n]}. How many ${MANY[n]} make the whole ${thing}?`,
        show: `How many ${MANY[n]} make a whole?`,
        visual: partsVis(thingShape, n, true, randomCut(rng, n, grade, thingShape), color),
        choices: numberChoices(rng, n, [
          { n: 1, why: 'one_part_is_whole' },
          { n: n - 1, why: 'counted_lines_not_parts' },
          { n: n * 2, why: 'fraction_name_confusion' },
        ], { min: 1, max: 10 }),
        explain: `${cap(MANY[n])} are ${WORD[n]} equal parts, so ${WORD[n]} ${MANY[n]} make one whole.`,
      });
    }
    const [a, b] = rng.shuffle(counts).slice(0, 2);
    if (mode === 'bigger') {
      const askBig = rng.next() < 0.6;
      const target = askBig ? Math.min(a, b) : Math.max(a, b);
      const other = target === a ? b : a;
      return makeItem(id, `size${a}v${b}${askBig ? 'big' : 'small'}-${shape}-${color}`, d, {
        say: `These shapes are the same size. Which shaded part is ${askBig ? 'bigger' : 'smaller'}: one ${ONE[a]} or one ${ONE[b]}?`,
        show: `Which is ${askBig ? 'bigger' : 'smaller'}?`,
        choices: [
          v(partsVis(shape, target, true, randomCut(rng, target, grade, shape), color, 1), `one ${ONE[target]}`),
          v(partsVis(shape, other, true, randomCut(rng, other, grade, shape), color, 1), `one ${ONE[other]}`, 'more_parts_bigger_pieces'),
          t('They are the same size', 'all_parts_same_size'),
        ],
        hint: 'Cutting the same whole into more parts makes each part smaller.',
        explain: `One ${ONE[Math.max(a, b)]} is smaller than one ${ONE[Math.min(a, b)]}. When the same whole is cut into more equal parts, each part is smaller.`,
      });
    }
    if (mode === 'story') {
      const [p, q] = twoNames(rng);
      const thing = rng.pick(['pizza', 'pie', 'cake', 'pancake']);
      const pBig = a < b;
      return makeItem(id, `story${a}v${b}-${p}${q}${thing}`, d, {
        say: `${p} and ${q} each have the same size ${thing}. ${p} cuts it into ${WORD[a]} equal pieces. ${q} cuts it into ${WORD[b]} equal pieces. Whose pieces are bigger?`,
        show: `${p}: ${a} pieces. ${q}: ${b} pieces. Whose are bigger?`,
        choices: [t(pBig ? p : q), t(pBig ? q : p, 'more_parts_bigger_pieces'), t('Both the same', 'all_parts_same_size')],
        keepOrder: true,
        explain: `${pBig ? p : q} cut the ${thing} into fewer pieces, so each piece is bigger. More equal parts means smaller parts.`,
      });
    }
    // Equal shares of identical wholes can have different shapes (2.GSR.7.4).
    const sq = rng.pick<PartsShape>(['square', 'rect']);
    const m = rng.pick([2, 4]);
    return makeItem(id, `samesize${sq}${m}-${color}`, d, {
      say: `Both ${sq === 'square' ? 'squares' : 'rectangles'} are the same size. Each one is cut into ${MANY[m]} a different way. Which is true?`,
      show: 'Which is true?',
      visual: { kind: 'row', items: [partsVis(sq, m, true, 'diag', color, 1), partsVis(sq, m, true, m === 4 ? 'grid' : 'v', color, 1)] },
      choices: [
        t(`Each shaded part is one ${ONE[m]}`),
        t('The triangle part is bigger', 'different_shape_means_different_size'),
        t('Only one shape shows fair shares', 'equal_parts_must_look_same'),
      ],
      explain: `Both wholes are cut into ${WORD[m]} equal parts, so each part is one ${ONE[m]}. Equal parts can have different shapes and still be the same size.`,
    });
  };
}

const equalParts: Skill = {
  id: 'm1.equalparts',
  subject: 'math',
  strand: 'geometry',
  grade: '1',
  title: 'Partition circles and rectangles into halves and fourths',
  kidTitle: 'Fair shares',
  icon: '🥪',
  standards: ['1.GSR.4.3'],
  prereqs: ['m1.halves'],
  parentTip: 'Fold paper squares into halves and fourths in different ways (long strips, small squares, triangles). Ask: “Is each piece fair? How many make the whole?”',
  intro: [{ say: 'Fair shares are equal parts. Two equal parts are halves. Four equal parts are fourths. More parts means smaller parts!', visual: { kind: 'row', items: [partsVis('circle', 2, true, 'v', '#f59e0b'), partsVis('rect', 4, true, 'grid', '#3b82f6')] } }],
  generate: sharesGenerator('m1.equalparts', 1),
};

const fractions: Skill = {
  id: 'm2.fractions',
  subject: 'math',
  strand: 'geometry',
  grade: '2',
  title: 'Halves, thirds and fourths: name the parts; more parts, smaller parts',
  kidTitle: 'Halves, thirds, fourths',
  icon: '🍕',
  standards: ['2.GSR.7.3', '2.GSR.7.4'],
  prereqs: ['m1.equalparts'],
  parentTip: 'Share a pancake three ways and four ways. Ask which share is bigger and why. Fold a square into halves two different ways: are the halves still equal?',
  intro: [{ say: 'Three equal parts are thirds. If two of the three parts are shaded, two thirds are shaded.', visual: partsVis('circle', 3, true, 'v', '#ec4899', 2) }],
  generate: sharesGenerator('m2.fractions', 2),
};

/* ---- Compose shapes ---- */

type PieceInfo = { whole: ShapeSpec | null; wholeName: string; pieces: ShapeKind[] };
const PIECE_INFO: Record<PiecesPreset, PieceInfo> = {
  'square-2tri': { whole: { shape: 'square' }, wholeName: 'square', pieces: ['right-triangle', 'right-triangle'] },
  'square-2rect': { whole: { shape: 'square' }, wholeName: 'square', pieces: ['rectangle', 'rectangle'] },
  'square-4tri': { whole: { shape: 'square' }, wholeName: 'square', pieces: ['triangle', 'triangle', 'triangle', 'triangle'] },
  'square-4sq': { whole: { shape: 'square' }, wholeName: 'square', pieces: ['square', 'square', 'square', 'square'] },
  'rect-2sq': { whole: { shape: 'rectangle', stretch: 2 }, wholeName: 'rectangle', pieces: ['square', 'square'] },
  'rect-2tri': { whole: { shape: 'rectangle', stretch: 2 }, wholeName: 'rectangle', pieces: ['right-triangle', 'right-triangle'] },
  'rect-3sq': { whole: { shape: 'rectangle', stretch: 3 }, wholeName: 'rectangle', pieces: ['square', 'square', 'square'] },
  'hex-2trap': { whole: { shape: 'hexagon' }, wholeName: 'hexagon', pieces: ['trapezoid', 'trapezoid'] },
  'hex-6tri': { whole: { shape: 'hexagon' }, wholeName: 'hexagon', pieces: ['triangle', 'triangle', 'triangle', 'triangle', 'triangle', 'triangle'] },
  'hex-3rhom': { whole: { shape: 'hexagon' }, wholeName: 'hexagon', pieces: ['rhombus', 'rhombus', 'rhombus'] },
  'hex-trap-3tri': { whole: { shape: 'hexagon' }, wholeName: 'hexagon', pieces: ['trapezoid', 'triangle', 'triangle', 'triangle'] },
  'trap-3tri': { whole: { shape: 'trapezoid' }, wholeName: 'trapezoid', pieces: ['triangle', 'triangle', 'triangle'] },
  'trap-tri-rhom': { whole: { shape: 'trapezoid' }, wholeName: 'trapezoid', pieces: ['rhombus', 'triangle'] },
  'rhom-2tri': { whole: null, wholeName: 'rhombus', pieces: ['triangle', 'triangle'] },
  'tri-4tri': { whole: { shape: 'triangle' }, wholeName: 'triangle', pieces: ['triangle', 'triangle', 'triangle', 'triangle'] },
  'circle-2semi': { whole: { shape: 'circle' }, wholeName: 'circle', pieces: ['semicircle', 'semicircle'] },
  'circle-4quarter': { whole: { shape: 'circle' }, wholeName: 'circle', pieces: ['quarter-circle', 'quarter-circle', 'quarter-circle', 'quarter-circle'] },
  'rect-tri-trap': { whole: { shape: 'rectangle', stretch: 2 }, wholeName: 'rectangle', pieces: ['right-triangle', 'trapezoid'] },
  'house-sq-tri': { whole: null, wholeName: 'house', pieces: ['square', 'triangle'] },
};
const PIECE_WORD: Partial<Record<ShapeKind, [string, string]>> = {
  'right-triangle': ['triangle', 'triangles'], triangle: ['triangle', 'triangles'], rectangle: ['rectangle', 'rectangles'], square: ['square', 'squares'],
  trapezoid: ['trapezoid', 'trapezoids'], rhombus: ['rhombus', 'rhombuses'], semicircle: ['half circle', 'half circles'], 'quarter-circle': ['quarter circle', 'quarter circles'],
};
const wordOf = (k: ShapeKind) => PIECE_WORD[k]!;
const pieceSpec = (k: ShapeKind, color: string): ShapeSpec => ({ shape: k, color, ...(k === 'rectangle' ? { stretch: 2 } : {}) });
const pieceRow = (kinds: ShapeKind[], color: string): Visual => ({ kind: 'shapeRow', shapes: kinds.map((k) => pieceSpec(k, color)) });
const describe = (kinds: ShapeKind[]) => {
  const counts = new Map<string, { n: number; many: string }>();
  kinds.forEach((k) => {
    const [one, many] = wordOf(k);
    counts.set(one, { n: (counts.get(one)?.n ?? 0) + 1, many });
  });
  return [...counts.entries()].map(([one, { n, many }]) => `${WORD[n] ?? n} ${n === 1 ? one : many}`).join(' and ');
};
const SWAP: Partial<Record<ShapeKind, ShapeKind[]>> = {
  'right-triangle': ['square', 'rectangle'], triangle: ['square', 'rhombus'], square: ['triangle', 'rectangle'], rectangle: ['square', 'triangle'],
  trapezoid: ['rectangle', 'triangle'], rhombus: ['square', 'triangle'], semicircle: ['quarter-circle', 'triangle'], 'quarter-circle': ['semicircle', 'square'],
};

const compose: Skill = {
  id: 'm1.compose',
  subject: 'math',
  strand: 'geometry',
  grade: '1',
  title: 'Compose and decompose shapes (which shapes make this shape?)',
  kidTitle: 'Shape builder',
  icon: '🧩',
  standards: ['1.GSR.4.2'],
  prereqs: ['m.compose', 'm1.sortshapes'],
  parentTip: 'Use pattern blocks or paper cut-outs: make a hexagon from triangles, a square from two triangles, a rectangle from two squares. Ask “What else could make it?”',
  intro: [{ say: 'Shapes can be put together to make new shapes. Two triangles make a square. Six triangles make a hexagon!', visual: { kind: 'row', items: [{ kind: 'pieces', preset: 'square-2tri', color: '#3b82f6' }, { kind: 'pieces', preset: 'hex-6tri', color: '#10b981' }] } }],
  generate: (rng, d) => {
    const all = Object.keys(PIECE_INFO) as PiecesPreset[];
    const size = (p: PiecesPreset) => PIECE_INFO[p].pieces.length;
    const preset = rng.pick(all.filter((p) => (d === 1 ? size(p) === 2 : d === 2 ? size(p) <= 4 : size(p) >= 3)));
    const info = PIECE_INFO[preset];
    const color = rng.pick(COLORS);
    const mode = d === 1 ? rng.pick(['pieces', 'whole'] as const) : d === 2 ? rng.pick(['pieces', 'whole', 'count'] as const) : rng.pick(['pieces', 'count', 'count'] as const);
    if (mode === 'whole' && info.whole) {
      const wholes: ShapeSpec[] = [{ shape: 'square' }, { shape: 'rectangle', stretch: 2 }, { shape: 'hexagon' }, { shape: 'trapezoid' }, { shape: 'triangle' }, { shape: 'circle' }, { shape: 'pentagon' }];
      const others = rng.shuffle(wholes.filter((w) => w.shape !== info.whole!.shape)).slice(0, 3);
      const choices = [v(shapeVis({ ...info.whole, color }), info.wholeName), ...others.map((w) => v(shapeVis({ ...w, color }), w.shape, info.pieces.some((k) => wordOf(k)[0] === w.shape) ? 'named_a_part_not_whole' : 'composed_shape_confusion'))];
      return makeItem('m1.compose', `whole-${preset}-${color}-${others.map((o) => o.shape).join('')}`, d, {
        say: 'These shapes slide together with no gaps and no overlaps. What new shape do they make?',
        show: 'Put them together. What shape?',
        visual: { kind: 'pieces', preset, apart: true, color },
        choices,
        speakChoices: false,
        hint: 'Imagine pushing the pieces together until they touch.',
        explain: `${cap(describe(info.pieces))} fit together to make a ${info.wholeName}.`,
      });
    }
    if (mode === 'count' && size(preset) >= 3) {
      const [one, many] = wordOf(rng.pick(info.pieces));
      const n = info.pieces.filter((k) => wordOf(k)[0] === one).length;
      return makeItem('m1.compose', `count-${preset}-${one}-${color}`, d, {
        say: `This ${info.wholeName} is made of smaller shapes. How many ${many} are in it?`,
        show: `How many ${many}?`,
        visual: { kind: 'pieces', preset, color },
        choices: numberChoices(rng, n, [
          { n: info.pieces.length, why: 'counted_all_pieces' },
          { n: n - 1, why: 'count_skipped_one' },
          { n: n + 1, why: 'count_double_tap' },
        ], { min: 1, max: 10 }),
        hint: 'Touch each piece as you count it.',
        explain: `Count the ${many} one at a time: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. There ${n === 1 ? 'is 1' : `are ${n}`}.`,
      });
    }
    const kinds = info.pieces;
    const swapTo = SWAP[kinds[0]]!.filter((k) => !kinds.includes(k));
    const first = wordOf(kinds[0])[0];
    const wrongShape = kinds.map((k) => (wordOf(k)[0] === first ? swapTo[0] : k));
    const more = [...kinds, kinds[kinds.length - 1]].slice(0, 7);
    const fewer = kinds.length > 2 ? kinds.slice(0, -1) : [kinds[0]];
    const choices = dedupe([
      v(pieceRow(kinds, color), describe(kinds)),
      v(pieceRow(wrongShape, color), describe(wrongShape), 'pieces_wrong_shape'),
      v(pieceRow(more, color), describe(more), 'pieces_wrong_count'),
      v(pieceRow(fewer, color), describe(fewer), 'pieces_wrong_count'),
    ]);
    return makeItem('m1.compose', `pieces-${preset}-${color}`, d, {
      say: `Which shapes were put together to make this ${info.wholeName}?`,
      show: 'Which shapes make it?',
      visual: { kind: 'pieces', preset, color },
      choices,
      speakChoices: false,
      hint: 'Look at the lines inside. Count each piece and name its shape.',
      explain: `The lines split it into ${describe(kinds)}.`,
    });
  },
};

/* ---- Rows and columns of squares ---- */

const gridSquares: Skill = {
  id: 'm2.gridsquares',
  subject: 'math',
  strand: 'geometry',
  grade: '2',
  title: 'Partition a rectangle into rows and columns of same-size squares',
  kidTitle: 'Square tiles',
  icon: '🟦',
  standards: ['2.NR.3.2', '2.G.A.2'],
  prereqs: ['m2.shapes', 'm2.groups'],
  parentTip: 'Cover a cereal box face with sticky notes or crackers in rows. Count by rows: “3, 6, 9, 12.” Then draw the rows and columns yourselves.',
  intro: [{ say: 'This rectangle is covered by squares in 2 rows. Each row has 3 squares. 3 plus 3 is 6 squares.', visual: { kind: 'grid', rows: 2, cols: 3 } }],
  generate: (rng, d) => {
    const rows = d === 1 ? rng.int(2, 3) : rng.int(2, 5);
    const cols = d === 1 ? rng.int(2, 4) : rng.int(3, 5);
    const total = rows * cols;
    const color = rng.pick(['#60a5fa', '#fca5a5', '#86efac', '#fcd34d', '#c4b5fd']);
    const skip = (k: number, times: number) => Array.from({ length: times }, (_, i) => (i + 1) * k).join(', ');
    if (d === 2 && rng.next() < 0.5) {
      const byRows = rng.next() < 0.5;
      const [g, k] = byRows ? [rows, cols] : [cols, rows];
      const sum = (a: number, b: number) => Array.from({ length: a }, () => String(b)).join(' + ');
      const spoken = (s: string) => s.replace(/\+/g, 'plus');
      const choices = dedupe([
        t(sum(g, k), undefined, spoken(sum(g, k))),
        t(`${rows} + ${cols}`, 'added_rows_and_columns', `${rows} plus ${cols}`),
        t(sum(g - 1, k), 'missed_a_row', spoken(sum(g - 1, k))),
        t(sum(g, k + 1), 'miscounted_row_length', spoken(sum(g, k + 1))),
      ]);
      return makeItem('m2.gridsquares', `sum${rows}x${cols}${byRows ? 'r' : 'c'}-${color}`, d, {
        say: `Which addition matches the squares, adding one ${byRows ? 'row' : 'column'} at a time?`,
        show: `Add by ${byRows ? 'rows' : 'columns'}`,
        visual: { kind: 'grid', rows, cols, color },
        choices,
        explain: `There are ${g} ${byRows ? 'rows' : 'columns'} with ${k} squares in each, so add ${k} ${g} times. That makes ${total} squares.`,
      });
    }
    if (d === 3) {
      if (rng.next() < 0.35) {
        return makeItem('m2.gridsquares', `story${rows}x${cols}`, d, {
          say: `A rectangle is split into ${rows} rows of same-size squares. Each row has ${cols} squares. How many squares in all?`,
          show: `${rows} rows, ${cols} squares in each row`,
          choices: numberChoices(rng, total, [
            { n: rows + cols, why: 'added_rows_and_columns' },
            { n: total - cols, why: 'missed_a_row' },
            { n: total + cols, why: 'extra_row' },
          ], { min: 1, max: 40 }),
          explain: `Add ${cols} for each of the ${rows} rows: ${skip(cols, rows)}. That is ${total} squares.`,
        });
      }
      return makeItem('m2.gridsquares', `partial${rows}x${cols}-${color}`, d, {
        say: 'Same-size squares will cover the whole rectangle. Only the first row and column are drawn. How many squares will cover it?',
        show: 'How many squares cover the rectangle?',
        visual: { kind: 'grid', rows, cols, partial: true, color },
        choices: numberChoices(rng, total, [
          { n: rows + cols - 1, why: 'counted_only_drawn' },
          { n: rows + cols, why: 'added_rows_and_columns' },
          { n: total - cols, why: 'missed_a_row' },
        ], { min: 1, max: 40 }),
        hint: 'The top row shows how many squares fit in each row. The first column shows how many rows.',
        explain: `Each row holds ${cols} squares and there are ${rows} rows: ${skip(cols, rows)}. ${total} squares.`,
      });
    }
    return makeItem('m2.gridsquares', `count${rows}x${cols}-${color}`, d, {
      say: 'How many same-size squares cover this rectangle?',
      show: 'How many squares?',
      visual: { kind: 'grid', rows, cols, color },
      choices: numberChoices(rng, total, [
        { n: rows + cols, why: 'added_rows_and_columns' },
        { n: cols, why: 'counted_one_row' },
        { n: total - 1, why: 'count_skipped_one' },
      ], { min: 1, max: 40 }),
      explain: `There are ${rows} rows of ${cols}. Count by ${cols}s: ${skip(cols, rows)}. ${total} squares.`,
    });
  },
};

/* ======================================================================== */
/* MEASUREMENT AND DATA                                                     */
/* ======================================================================== */

const THINGS: { emoji: string; name: string }[] = [
  { emoji: '✏️', name: 'pencil' }, { emoji: '🖍️', name: 'crayon' }, { emoji: '🥕', name: 'carrot' }, { emoji: '🐛', name: 'caterpillar' },
  { emoji: '🥖', name: 'bread' }, { emoji: '🐍', name: 'snake' }, { emoji: '🔑', name: 'key' }, { emoji: '🖌️', name: 'paintbrush' },
  { emoji: '🍌', name: 'banana' }, { emoji: '🥒', name: 'cucumber' }, { emoji: '🧣', name: 'scarf' }, { emoji: '🚂', name: 'train' },
];
const BAR = ['#fca5a5', '#93c5fd', '#86efac', '#fcd34d', '#c4b5fd', '#f9a8d4'];

const order3: Skill = {
  id: 'm1.order3',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Order three objects by length; compare lengths indirectly',
  kidTitle: 'Longest and shortest',
  icon: '📏',
  standards: ['1.MDR.6.1'],
  prereqs: ['m.measure', 'm1.units'],
  parentTip: 'Line up three spoons or shoes from shortest to longest, ends together. Then play “If the spoon is longer than the fork, and the fork is longer than the key…”',
  intro: [{ say: 'Line things up at the same starting line. Then look at where each one ends. The one that goes farthest is the longest.', visual: { kind: 'lengths', mode: 'length', items: [{ emoji: '🥕', size: 5, color: '#fdba74' }, { emoji: '✏️', size: 8, color: '#fcd34d' }, { emoji: '🖍️', size: 3, color: '#93c5fd' }] } }],
  generate: (rng, d) => {
    const things = rng.shuffle(THINGS).slice(0, 3);
    const sizes = rng.shuffle(d === 1 ? [3, 6, 9] : [rng.int(2, 4), rng.int(5, 6), rng.int(7, 9)]);
    const colors = rng.shuffle(BAR);
    const byLen = [0, 1, 2].sort((a, b) => sizes[a] - sizes[b]);
    if (d === 3) {
      const mode = rng.pick(['chain', 'chain', 'units'] as const);
      if (mode === 'units') {
        const lens = rng.shuffle([rng.int(3, 6), rng.int(7, 10), rng.int(11, 15)]);
        const unit = rng.pick([{ emoji: '📎', word: 'paper clips' }, { emoji: '🟩', word: 'cubes' }, { emoji: '👣', word: 'footsteps' }]);
        const ordered = [0, 1, 2].sort((a, b) => lens[a] - lens[b]);
        const ask = rng.pick(['longest', 'shortest'] as const);
        const target = ask === 'longest' ? ordered[2] : ordered[0];
        return makeItem('m1.order3', `units-${things.map((x) => x.name).join('')}-${lens.join('-')}-${unit.word}-${ask}`, d, {
          say: `Measured in ${unit.word}: the ${things[0].name} is ${lens[0]}, the ${things[1].name} is ${lens[1]}, and the ${things[2].name} is ${lens[2]}. Which is the ${ask}?`,
          show: `${things.map((x, i) => `${x.emoji} ${lens[i]}`).join(', ')} ${unit.emoji}. Which is the ${ask}?`,
          choices: things.map((x, i) => (i === target ? right({ visual: { kind: 'emoji', emoji: x.emoji }, say: x.name }) : wrong({ visual: { kind: 'emoji', emoji: x.emoji }, say: x.name }, ask === 'longest' && i === ordered[0] ? 'longest_shortest_confusion' : ask === 'shortest' && i === ordered[2] ? 'longest_shortest_confusion' : 'compared_wrong_pair'))),
          explain: `More units means longer. ${lens[target]} is the ${ask === 'longest' ? 'most' : 'fewest'} ${unit.word}, so the ${things[target].name} is the ${ask}.`,
        });
      }
      // Transitivity: A longer than B, B longer than C.
      const [L, M, S] = things;
      const ask = rng.pick(['longest', 'shortest', 'compareEnds'] as const);
      const flip = rng.next() < 0.5;
      const clue = flip
        ? `The ${S.name} is shorter than the ${M.name}. The ${M.name} is shorter than the ${L.name}.`
        : `The ${L.name} is longer than the ${M.name}. The ${M.name} is longer than the ${S.name}.`;
      if (ask === 'compareEnds') {
        return makeItem('m1.order3', `chain-ends-${L.name}${M.name}${S.name}-${flip}`, d, {
          say: `${clue} Is the ${L.name} longer or shorter than the ${S.name}?`,
          show: `${clue} ${cap(L.name)} vs ${S.name}?`,
          choices: [t('longer'), t('shorter', 'transitivity_reversed'), t('the same length', 'transitivity_not_used')],
          keepOrder: true,
          explain: `The ${L.name} is longer than the ${M.name}, and the ${M.name} is longer than the ${S.name}. So the ${L.name} must be longer than the ${S.name}.`,
        });
      }
      const target = ask === 'longest' ? L : S;
      return makeItem('m1.order3', `chain-${ask}-${L.name}${M.name}${S.name}-${flip}`, d, {
        say: `${clue} Which is the ${ask}?`,
        show: `${clue} Which is the ${ask}?`,
        choices: [L, M, S].map((x) => (x === target ? right({ visual: { kind: 'emoji', emoji: x.emoji }, say: x.name }) : wrong({ visual: { kind: 'emoji', emoji: x.emoji }, say: x.name }, x === M ? 'picked_middle_item' : 'longest_shortest_confusion'))),
        hint: 'Put them in order: longest, middle, shortest.',
        explain: `In order from longest to shortest: ${L.name}, ${M.name}, ${S.name}. The ${target.name} is the ${ask}.`,
      });
    }
    const height = rng.next() < 0.3;
    if (d === 2 && rng.next() < 0.5) {
      const order = [...byLen];
      const asc = rng.next() < 0.5;
      const seq = (o: number[]) => ({ kind: 'sequence' as const, items: o.map((i) => things[i].emoji), blank: -1 });
      const correct = asc ? order : [...order].reverse();
      const choices = dedupe([
        v(seq(correct), undefined),
        v(seq([...correct].reverse()), undefined, 'ordered_backwards'),
        v(seq([correct[1], correct[0], correct[2]]), undefined, 'order_partly_wrong'),
        v(seq([correct[0], correct[2], correct[1]]), undefined, 'order_partly_wrong'),
      ]);
      const word = height ? (asc ? 'shortest to tallest' : 'tallest to shortest') : asc ? 'shortest to longest' : 'longest to shortest';
      return makeItem('m1.order3', `order-${height ? 'h' : 'l'}-${things.map((x) => x.emoji).join('')}-${sizes.join('')}-${asc}`, d, {
        say: `Which row puts them in order from ${word}?`,
        show: `Order: ${word}`,
        visual: { kind: 'lengths', mode: height ? 'height' : 'length', items: things.map((x, i) => ({ emoji: x.emoji, size: sizes[i], color: colors[i] })) },
        choices,
        speakChoices: false,
        explain: `From ${word}: ${correct.map((i) => things[i].name).join(', ')}.`,
      });
    }
    const ask = height ? rng.pick(['tallest', 'shortest'] as const) : rng.pick(['longest', 'shortest'] as const);
    const target = ask === 'shortest' ? byLen[0] : byLen[2];
    // d2 lengths do not start at the same line: the one that reaches farthest is not always the longest.
    const offsets = !height && d === 2 ? (() => {
      const o = [0, 0, 0];
      o[byLen[0]] = rng.int(4, 6);
      o[byLen[1]] = rng.int(0, 2);
      return o;
    })() : [0, 0, 0];
    const reach = [0, 1, 2].map((i) => offsets[i] + sizes[i]);
    const farthest = reach.indexOf(Math.max(...reach));
    return makeItem('m1.order3', `${ask}-${things.map((x) => x.emoji).join('')}-${sizes.join('')}-${offsets.join('')}`, d, {
      say: `Which one is the ${ask}?`,
      show: `Which is the ${ask}?`,
      visual: { kind: 'lengths', mode: height ? 'height' : 'length', items: things.map((x, i) => ({ emoji: x.emoji, size: sizes[i], color: colors[i], ...(offsets[i] ? { offset: offsets[i] } : {}) })) },
      choices: things.map((x, i) => (i === target ? right({ visual: { kind: 'emoji', emoji: x.emoji }, say: x.name }) : wrong({ visual: { kind: 'emoji', emoji: x.emoji }, say: x.name }, i === farthest && farthest !== target ? 'compared_ends_not_length' : 'longest_shortest_confusion'))),
      hint: offsets.some(Boolean) ? 'They do not start at the same place. Compare the whole length of each bar.' : 'Look where each one ends.',
      explain: `The ${things[target].name} is the ${ask}.${offsets.some(Boolean) ? ' Look at the whole bar, not just where it ends: they start in different places.' : ''}`,
    });
  },
};

const hourWord = (h: number) => ((h + 11) % 12) + 1;
const timeText = (h: number, m: number) => `${hourWord(h)}:${String(m).padStart(2, '0')}`;
const timeSay = (h: number, m: number) => (m === 0 ? `${hourWord(h)} o'clock` : m < 10 ? `${hourWord(h)} oh ${m}` : `${hourWord(h)} ${m}`);
const clock = (h: number, m: number): Visual => ({ kind: 'clock', hour: hourWord(h), minute: m });
const clockChoices = (opts: { h: number; m: number; why?: string }[]) => {
  const seen = new Set<string>();
  return opts.filter((o) => o.m >= 0 && o.m < 60).filter((o) => {
    const k = timeText(o.h, o.m);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 4).map((o) => (o.why ? wrong({ visual: clock(o.h, o.m) }, o.why) : right({ visual: clock(o.h, o.m) })));
};

const clockMatch: Skill = {
  id: 'm1.clockmatch',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Match times to clocks (hour, half hour) and elapsed whole hours',
  kidTitle: 'Clock match',
  icon: '🕰️',
  standards: ['1.MDR.6.2'],
  prereqs: ['m1.time'],
  parentTip: 'Say a time (“half past 4”) and let him set a toy clock. Point out that at half past, the short hand is halfway between two numbers.',
  intro: [{ say: 'At half past four, the long hand points to six, and the short hand is halfway between four and five.', visual: { kind: 'clock', hour: 4, minute: 30 } }],
  generate: (rng, d) => {
    const h = rng.int(1, 12);
    if (d <= 2) {
      const m = d === 1 ? 0 : 30;
      const phrase = rng.pick(d === 1 ? ['digital', 'words', 'event'] : ['digital', 'words', 'half past', 'event']);
      const event = rng.pick([['Lunch', '🥪'], ['Recess', '🛝'], ['The party', '🎉'], ['Swim class', '🏊'], ['Story time', '📚'], ['The bus', '🚌']]);
      const spoken = phrase === 'digital' ? timeText(h, m) : phrase === 'half past' ? `half past ${h}` : timeSay(h, m);
      const say = phrase === 'event' ? `${event[0]} starts at ${spoken}. Which clock shows ${spoken}?` : `Which clock shows ${spoken}?`;
      const choices = clockChoices(
        m === 0
          ? [{ h, m: 0 }, { h: 12, m: (h % 12) * 5, why: 'hands_swapped' }, { h: h + 1, m: 0, why: 'near_miss' }, { h, m: 30, why: 'minute_hand_misread' }]
          : [{ h, m: 30 }, { h: h + 1, m: 30, why: 'half_hour_next_hour' }, { h, m: 0, why: 'ignored_minute_hand' }, { h: 6, m: (h % 12) * 5, why: 'hands_swapped' }],
      );
      return makeItem('m1.clockmatch', `${h}:${m}-${phrase}-${phrase === 'event' ? event[0] : ''}`, d, {
        say,
        show: phrase === 'event' ? `${event[1]} ${event[0]} at ${timeText(h, m)}` : `Which clock shows ${phrase === 'digital' ? timeText(h, m) : spoken}?`,
        choices,
        speakChoices: false,
        hint: m === 0 ? 'At o’clock, the long hand points straight up to 12.' : 'At half past, the long hand points down to 6.',
        explain: m === 0 ? `At ${h} o'clock the long hand points to 12 and the short hand points to ${h}.` : `At half past ${h} the long hand points to 6, and the short hand is halfway between ${h} and ${hourWord(h + 1)}.`,
      });
    }
    // Elapsed whole hours on the hour.
    const k = rng.int(1, 4);
    const later = rng.next() < 0.75;
    const ans = later ? h + k : h - k;
    const choices = dedupe([
      t(timeText(ans, 0), undefined, timeSay(ans, 0)),
      t(timeText(later ? ans + 1 : ans - 1, 0), 'counted_start_hour', timeSay(later ? ans + 1 : ans - 1, 0)),
      t(timeText(later ? h - k : h + k, 0), later ? 'counted_back_not_on' : 'counted_on_not_back', timeSay(later ? h - k : h + k, 0)),
      t(timeText(h, k), 'added_to_minutes', timeSay(h, k)),
    ]);
    return makeItem('m1.clockmatch', `elapsed${h}${later ? '+' : '-'}${k}`, d, {
      say: later ? `The clock shows the time now. What time will it be in ${k} ${plural(k, 'hour', 'hours')}?` : `The clock shows the time now. What time was it ${k} ${plural(k, 'hour', 'hours')} ago?`,
      show: later ? `${k} ${plural(k, 'hour', 'hours')} later` : `${k} ${plural(k, 'hour', 'hours')} ago`,
      visual: clock(h, 0),
      choices,
      hint: `Move the short hand ${later ? 'forward' : 'back'} one number for each hour.`,
      explain: `It is ${h} o'clock now. Count ${later ? 'on' : 'back'} ${k}: ${Array.from({ length: k }, (_, i) => hourWord(later ? h + i + 1 : h - i - 1)).join(', ')}. It ${later ? 'will be' : 'was'} ${hourWord(ans)} o'clock.`,
    });
  },
};

const ACTIVITIES: { what: string; h: number; pm: boolean; emoji: string }[] = [
  { what: 'eat breakfast', h: 7, pm: false, emoji: '🥣' }, { what: 'catch the school bus', h: 8, pm: false, emoji: '🚌' },
  { what: 'have morning recess', h: 10, pm: false, emoji: '🛝' }, { what: 'watch the sun rise', h: 6, pm: false, emoji: '🌅' },
  { what: 'leave school for home', h: 3, pm: true, emoji: '🎒' }, { what: 'go to soccer practice', h: 5, pm: true, emoji: '⚽' },
  { what: 'eat dinner', h: 6, pm: true, emoji: '🍝' }, { what: 'go to bed', h: 8, pm: true, emoji: '🛏️' },
  { what: 'look at the stars', h: 9, pm: true, emoji: '🌙' }, { what: 'eat an after-school snack', h: 4, pm: true, emoji: '🍎' },
];
const ampm = (h: number, pm: boolean) => `${h}:00 ${pm ? 'p.m.' : 'a.m.'}`;
const ampmSay = (h: number, pm: boolean) => `${h} ${pm ? 'P M' : 'A M'}`;
/** Adds minutes to a 12-hour time, tracking a.m./p.m. */
function addTime(h: number, m: number, pm: boolean, add: number) {
  const total = ((h % 12) + (pm ? 12 : 0)) * 60 + m + add;
  const day = ((total % 1440) + 1440) % 1440;
  const H = Math.floor(day / 60);
  return { h: hourWord(H), m: day % 60, pm: H >= 12 };
}
/** Ends a sentence that may finish with "a.m." without doubling the period. */
const dot = (s: string) => (s.endsWith('.') ? s : `${s}.`);
const fmtT = (x: { h: number; m: number; pm: boolean }) => `${x.h}:${String(x.m).padStart(2, '0')} ${x.pm ? 'p.m.' : 'a.m.'}`;
const sayT = (x: { h: number; m: number; pm: boolean }) => `${x.m === 0 ? `${x.h} o'clock` : `${x.h} ${x.m}`} ${x.pm ? 'P M' : 'A M'}`;

const elapsed: Skill = {
  id: 'm2.elapsed',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'a.m. and p.m.; clocks to 5 minutes; elapsed time in hours and half hours',
  kidTitle: 'a.m., p.m. and how long',
  icon: '⌛',
  standards: ['2.MDR.6.1'],
  prereqs: ['m2.time5', 'm1.clockmatch'],
  parentTip: 'At breakfast and dinner ask “a.m. or p.m.?” On a trip ask: “We left at 2:30. It is 4:30 now. How long did we drive?”',
  intro: [{ say: 'a.m. is from midnight to noon, the morning. p.m. is from noon to midnight, the afternoon and night. Breakfast is a.m. Dinner is p.m.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🌅' }, { kind: 'emoji', emoji: '🌙' }] } }],
  generate: (rng, d) => {
    if (d === 1 && rng.next() < 0.5) {
      const pm = rng.next() < 0.6;
      const h = pm ? rng.pick([1, 2, 3, 4, 8, 9, 10, 11]) : rng.int(6, 11);
      const m = rng.pick([0, 15, 30, 45]);
      const part = !pm ? 'in the morning' : h <= 4 ? 'in the afternoon' : 'at night';
      const parts = ['in the morning', 'in the afternoon', 'at night'];
      const time = { h, m, pm };
      return makeItem('m2.elapsed', `part-${fmtT(time)}`, d, {
        say: `The time is ${sayT(time)}. When is that?`,
        show: `${fmtT(time)}: when is it?`,
        choices: parts.map((x) => (x === part ? t(x) : t(x, 'am_pm_confusion'))),
        keepOrder: true,
        explain: pm ? `p.m. means after noon. ${hourWord(h)} p.m. is ${part}.` : `a.m. means before noon, so ${hourWord(h)} a.m. is in the morning.`,
      });
    }
    if (d === 1) {
      const a = rng.pick(ACTIVITIES);
      const otherH = rng.pick([1, 2, 11, 12].filter((x) => x !== a.h));
      return makeItem('m2.elapsed', `ampm-${a.what}`, d, {
        say: `What is the best time to ${a.what}?`,
        show: `${a.emoji} When do you ${a.what}?`,
        choices: [
          right({ text: ampm(a.h, a.pm), say: ampmSay(a.h, a.pm) }),
          wrong({ text: ampm(a.h, !a.pm), say: ampmSay(a.h, !a.pm) }, 'am_pm_confusion'),
          wrong({ text: ampm(otherH, !a.pm), say: ampmSay(otherH, !a.pm) }, 'am_pm_confusion'),
        ],
        explain: `a.m. times are in the morning, before noon. p.m. times are after noon. People ${a.what} at about ${a.h} ${a.pm ? 'in the afternoon or evening, so it is p.m.' : 'in the morning, so it is a.m.'}`,
      });
    }
    if (d === 2) {
      const h = rng.int(1, 12);
      const m = rng.pick([5, 10, 20, 25, 35, 40, 50, 55]);
      const opts: { h: number; m: number; why?: string }[] = [{ h, m }];
      if (m / 5 !== h % 12) opts.push({ h: m / 5, m: (h % 12) * 5, why: 'hands_swapped' });
      opts.push({ h: h + 1, m, why: 'read_next_hour' }, { h, m: m + 5 < 60 ? m + 5 : m - 10, why: 'counted_fives_wrong' }, { h, m: m - 5, why: 'counted_fives_wrong' });
      return makeItem('m2.elapsed', `clock${h}:${m}`, d, {
        say: `Which clock shows ${timeText(h, m)}?`,
        show: `Which clock shows ${timeText(h, m)}?`,
        choices: clockChoices(opts),
        speakChoices: false,
        hint: 'Count by fives to find where the long hand points. The short hand is just past the hour.',
        explain: `${m} minutes means the long hand points to the ${m / 5} (count by fives). The short hand is ${m < 30 ? 'just past' : 'more than halfway past'} ${hourWord(h)}.`,
      });
    }
    const mode = rng.pick(['end', 'end', 'howlong', 'cross'] as const);
    const [p] = twoNames(rng);
    const event = rng.pick(['The movie', 'The soccer game', 'The field trip', 'The art class', 'The library visit', 'The party']);
    if (mode === 'howlong') {
      const sh = rng.int(1, 6);
      const sm = rng.pick([0, 30]);
      const len = rng.pick([60, 90, 120, 150, 180]);
      const end = addTime(sh, sm, true, len);
      const word = (mins: number) => (mins % 60 === 0 ? `${mins / 60} ${plural(mins / 60, 'hour', 'hours')}` : mins < 60 ? '30 minutes' : `${Math.floor(mins / 60)} and a half hours`);
      const choices = dedupe([t(word(len)), t(word(len - 30 > 0 ? len - 30 : len + 60), 'half_hour_missed'), t(word(len + 60), 'counted_start_hour'), t(word(len + 30), 'half_hour_missed')]);
      return makeItem('m2.elapsed', `howlong${sh}:${sm}+${len}-${event}`, d, {
        say: `${event} starts at ${sayT({ h: sh, m: sm, pm: true })} and ends at ${sayT(end)}. How long is it?`,
        show: `${fmtT({ h: sh, m: sm, pm: true })} to ${fmtT(end)}. How long?`,
        choices,
        hint: 'Count the hours first, then any half hour.',
        explain: `From ${fmtT({ h: sh, m: sm, pm: true })}, count hours: ${Array.from({ length: Math.floor(len / 60) }, (_, i) => fmtT(addTime(sh, sm, true, (i + 1) * 60))).join(', ')}${len % 60 ? `, then 30 more minutes to ${fmtT(end)}` : ''}. That is ${word(len)}.`.replace('..', '.'),
      });
    }
    const pm = mode === 'cross' ? false : rng.next() < 0.7;
    const sh = mode === 'cross' ? rng.int(9, 11) : pm ? rng.int(1, 7) : rng.int(7, 9);
    const sm = rng.pick([0, 30]);
    const k = mode === 'cross' ? rng.int(2, 4) : rng.int(1, 3);
    const start = { h: sh, m: sm, pm };
    const end = addTime(sh, sm, pm, k * 60);
    const choices = dedupe([
      right({ text: fmtT(end), say: sayT(end) }),
      ...(end.pm !== pm ? [wrong({ text: fmtT({ ...end, pm }), say: sayT({ ...end, pm }) }, 'am_pm_not_switched')] : []),
      wrong({ text: fmtT(addTime(sh, sm, pm, (k + 1) * 60)), say: sayT(addTime(sh, sm, pm, (k + 1) * 60)) }, 'counted_start_hour'),
      ...(sm === 30 ? [wrong({ text: fmtT({ ...end, m: 0 }), say: sayT({ ...end, m: 0 }) }, 'dropped_half_hour')] : []),
      wrong({ text: fmtT({ h: sh, m: Math.min(sm + k, 59), pm }), say: sayT({ h: sh, m: Math.min(sm + k, 59), pm }) }, 'added_to_minutes'),
      wrong({ text: fmtT(addTime(sh, sm, pm, (k - 1) * 60 || 30)), say: sayT(addTime(sh, sm, pm, (k - 1) * 60 || 30)) }, 'near_miss'),
    ]);
    return makeItem('m2.elapsed', `end-${fmtT(start)}+${k}-${p}-${event}`, d, {
      say: `${event} starts at ${sayT(start)}. It lasts ${k} ${plural(k, 'hour', 'hours')}. What time does it end?`,
      show: `Starts ${fmtT(start)}, lasts ${k} ${plural(k, 'hour', 'hours')}`,
      choices,
      hint: 'Count on one hour at a time. Watch for noon: after 11 a.m. comes 12 p.m.',
      explain: `Count on ${k} ${plural(k, 'hour', 'hours')} from ${fmtT(start)}: ${dot(Array.from({ length: k }, (_, i) => fmtT(addTime(sh, sm, pm, (i + 1) * 60))).join(', '))} It ends at ${dot(fmtT(end))}${end.pm !== pm ? ' After noon the time changes from a.m. to p.m.' : ''}`,
    });
  },
};

const RULER_THINGS = THINGS.filter((x) => !['🚂', '🧣'].includes(x.emoji));
const ruler: Skill = {
  id: 'm2.ruler',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Measure length with a ruler (inches, centimeters); how much longer',
  kidTitle: 'Ruler reader',
  icon: '📐',
  standards: ['2.MDR.5.2', '2.MDR.5.3'],
  prereqs: ['m1.units', 'm1.order3'],
  parentTip: 'Measure crayons and spoons with a real ruler. Start some objects at 2 instead of 0 and ask him to count the spaces, not read the end number.',
  intro: [{ say: 'Line up one end of the object with the zero. The number at the other end tells how long it is.', visual: { kind: 'ruler', unit: 'in', max: 6, objects: [{ emoji: '✏️', color: '#fcd34d', from: 0, to: 4 }] } }],
  generate: (rng, d) => {
    const unit = rng.pick(['in', 'cm'] as const);
    const max = unit === 'in' ? rng.pick([8, 10, 12]) : rng.pick([12, 15]);
    const [long, short] = unit === 'in' ? ['inches', 'in'] : ['centimeters', 'cm'];
    const [a, b] = rng.shuffle(RULER_THINGS);
    const [ca, cb] = rng.shuffle(BAR);
    if (d <= 2) {
      const from = d === 1 ? 0 : rng.int(1, 4);
      const len = rng.int(2, max - from);
      const choices = numberChoices(rng, len, [
        ...(from ? [{ n: from + len, why: 'read_end_not_length' }, { n: from, why: 'read_start_mark' }] : []),
        { n: len + 1, why: 'counted_marks_not_spaces' },
        { n: len - 1, why: 'started_count_at_one' },
      ], { min: 1, max: 20 });
      return makeItem('m2.ruler', `${unit}${max}-${a.emoji}${from}-${len}-${ca}`, d, {
        say: `How long is the ${a.name}?`,
        show: `How many ${long} long?`,
        visual: { kind: 'ruler', unit, max, objects: [{ emoji: a.emoji, color: ca, from, to: from + len }] },
        choices: withUnit(choices, ` ${short}`, long),
        hint: from ? `The ${a.name} does not start at 0. Count the spaces from one end to the other.` : 'Read the number where the end lines up.',
        explain: from ? `The ${a.name} goes from ${from} to ${from + len}. Count the spaces: ${from + len} minus ${from} is ${len} ${long}.` : `The ${a.name} starts at 0 and ends at ${len}. It is ${len} ${long} long.`,
      });
    }
    const la = rng.int(4, max - 1);
    const lb = rng.int(1, la - 1);
    const fb = rng.next() < 0.5 ? 0 : rng.int(1, max - lb);
    const diff = la - lb;
    const choices = numberChoices(rng, diff, [
      { n: la, why: 'gave_one_length' },
      { n: la + lb, why: 'added_lengths' },
      ...(fb ? [{ n: Math.abs(la - (fb + lb)), why: 'read_end_not_length' }] : []),
      { n: diff + 1, why: 'counted_marks_not_spaces' },
    ], { min: 0, max: 30 });
    return makeItem('m2.ruler', `diff-${unit}${max}-${a.emoji}${la}-${b.emoji}${fb}-${lb}`, d, {
      say: `How much longer is the ${a.name} than the ${b.name}?`,
      show: `How much longer is the ${a.emoji} than the ${b.emoji}?`,
      visual: { kind: 'ruler', unit, max, objects: [{ emoji: a.emoji, color: ca, from: 0, to: la }, { emoji: b.emoji, color: cb, from: fb, to: fb + lb }] },
      choices: withUnit(choices, ` ${short}`, long),
      hint: 'Find each length first. Then subtract.',
      explain: `The ${a.name} is ${la} ${long}. The ${b.name} is ${lb} ${long}${fb ? ` (from ${fb} to ${fb + lb})` : ''}. ${la} minus ${lb} is ${diff}, so it is ${diff} ${long} longer.`,
    });
  },
};

const REAL: { emoji: string; name: string; inch?: number; foot?: number; cm?: number; m?: number }[] = [
  { emoji: '✏️', name: 'a new pencil', inch: 7, cm: 18 }, { emoji: '🖍️', name: 'a crayon', inch: 4, cm: 9 }, { emoji: '🔑', name: 'a key', inch: 2, cm: 5 },
  { emoji: '📎', name: 'a paper clip', inch: 1, cm: 3 }, { emoji: '🥄', name: 'a spoon', inch: 6, cm: 15 }, { emoji: '🍌', name: 'a banana', inch: 7, cm: 18 },
  { emoji: '📕', name: 'a book', inch: 10, cm: 25 }, { emoji: '👟', name: 'a sneaker', inch: 9, cm: 22 },
  { emoji: '🚪', name: 'a door', foot: 7, m: 2 }, { emoji: '🛏️', name: 'a bed', foot: 6, m: 2 }, { emoji: '🚌', name: 'a school bus', foot: 40, m: 12 },
  { emoji: '🚗', name: 'a car', foot: 15, m: 5 }, { emoji: '🦒', name: 'a giraffe', foot: 18, m: 5 }, { emoji: '🛋️', name: 'a couch', foot: 7, m: 2 },
  { emoji: '🪥', name: 'a toothbrush', inch: 7, cm: 18 }, { emoji: '📱', name: 'a phone', inch: 6, cm: 15 }, { emoji: '📏', name: 'a school ruler', inch: 12, cm: 30 },
  { emoji: '🍂', name: 'a leaf', inch: 3, cm: 8 }, { emoji: '🖍️', name: 'a box of crayons', inch: 5, cm: 13 }, { emoji: '🍴', name: 'a fork', inch: 7, cm: 18 },
  { emoji: '🚒', name: 'a fire truck', foot: 35, m: 11 }, { emoji: '🏊', name: 'a swimming pool', foot: 80, m: 25 }, { emoji: '🛝', name: 'a playground slide', foot: 10, m: 3 },
  { emoji: '🚩', name: 'a flagpole', foot: 30, m: 9 }, { emoji: '🐊', name: 'an alligator', foot: 12, m: 4 }, { emoji: '🛶', name: 'a canoe', foot: 16, m: 5 },
];
const unitChoice: Skill = {
  id: 'm2.unitchoice',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Choose units (inches, feet, centimeters, meters) and estimate lengths',
  kidTitle: 'Which unit?',
  icon: '📏',
  standards: ['2.MDR.5.2', '2.MD.A.3'],
  prereqs: ['m2.ruler'],
  parentTip: 'Show him that an inch is about the width of his thumb and a foot is a long ruler. Guess the length of a spoon, a table and the car, then measure to check.',
  intro: [{ say: 'Small things are measured in inches or centimeters. Big things are measured in feet or meters. A bigger unit means you need fewer of them.' }],
  generate: (rng, d) => {
    const metric = rng.next() < 0.45;
    const thing = rng.pick(REAL);
    const small = thing.inch !== undefined;
    const [smallU, bigU] = metric ? ['centimeters', 'meters'] : ['inches', 'feet'];
    const value = metric ? (small ? thing.cm! : thing.m!) : small ? thing.inch! : thing.foot!;
    const unitWord = small ? smallU : bigU;
    const otherWord = small ? bigU : smallU;
    if (d === 1) {
      const nonLength = rng.pick(metric ? ['liters', 'kilograms'] : ['cups', 'pounds']);
      return makeItem('m2.unitchoice', `unit-${thing.name}-${metric}-${nonLength}`, d, {
        say: `Which unit is best for measuring the length of ${thing.name}?`,
        show: `${thing.emoji} Best unit for its length?`,
        choices: [t(unitWord), t(otherWord, small ? 'unit_too_big' : 'unit_too_small'), t(nonLength, 'not_a_length_unit')],
        explain: small ? `${cap(thing.name)} is small, so we use a small unit: ${unitWord}.` : `${cap(thing.name)} is big, so we use a big unit: ${unitWord}. Measuring it in ${otherWord} would take too many!`,
      });
    }
    if (d === 2) {
      const unitShort = (n: number, u: string) => `${n} ${n === 1 ? u.replace(/feet/, 'foot').replace(/inches/, 'inch').replace(/s$/, '') : u}`;
      const choices = dedupe([
        t(unitShort(value, unitWord)),
        t(unitShort(value, otherWord), 'unit_size_confusion'),
        t(unitShort(value * 10, unitWord), 'estimate_too_big'),
        ...(value >= 4 ? [t(unitShort(Math.max(1, Math.round(value / 4)), unitWord), 'estimate_too_small')] : [t(unitShort(value + 20, unitWord), 'estimate_too_big')]),
      ]);
      return makeItem('m2.unitchoice', `est-${thing.name}-${metric}`, d, {
        say: `About how long is ${thing.name}?`,
        show: `${thing.emoji} About how long?`,
        choices,
        hint: metric ? 'A centimeter is about as wide as your fingernail. A meter is about as long as a big step.' : 'An inch is about the width of your thumb. A foot is about as long as a big ruler.',
        explain: `${cap(thing.name)} is about ${unitShort(value, unitWord)} long.`,
      });
    }
    const [p] = twoNames(rng);
    const obj = rng.pick(['the rug', 'the table', 'the hallway', 'the whiteboard', 'the garden']);
    const pairs = metric ? ['centimeters', 'meters'] : rng.pick([['inches', 'feet'], ['paper clips', 'pencils'], ['cubes', 'shoes']]);
    const [tiny, big] = pairs;
    const firstBig = rng.next() < 0.5;
    return makeItem('m2.unitchoice', `count-${p}-${obj}-${tiny}-${firstBig}`, d, {
      say: `${p} measures ${obj} in ${firstBig ? big : tiny}, then in ${firstBig ? tiny : big}. Which is true?`,
      show: `${obj}: ${tiny} and ${big}. Which is true?`,
      choices: [t(`It takes more ${tiny} than ${big}`), t(`It takes more ${big} than ${tiny}`, 'bigger_unit_more_count'), t('It takes the same number of each', 'unit_size_ignored')],
      hint: 'Which unit is longer? You need fewer long ones to cover the same space.',
      explain: `${cap(tiny)} are shorter than ${big}. Shorter units fit more times, so it takes more ${tiny} to measure ${obj}.`,
    });
  },
};

const lengthWord: Skill = {
  id: 'm2.lengthword',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Length word problems: how much longer, add and subtract lengths, number line',
  kidTitle: 'Length stories',
  icon: '🪢',
  standards: ['2.MDR.5.3', '2.MDR.5.5'],
  prereqs: ['m2.ruler', 'm2.add2d'],
  parentTip: 'Use tape on the floor: jump, mark, jump again, and add the two jumps. Draw a number line and show each jump as an arrow.',
  intro: [{ say: 'Length stories use adding and subtracting. To find how much longer, subtract the shorter length from the longer one.' }],
  generate: (rng, d) => {
    const unit = rng.pick(['inches', 'feet', 'centimeters', 'meters']);
    const [p, q] = twoNames(rng);
    if (d === 1) {
      const a = rng.int(8, 19);
      const b = rng.int(2, a - 2);
      const what = rng.pick(['ribbon', 'paper chain', 'jump rope', 'string', 'train of blocks']);
      const shorter = rng.next() < 0.4;
      return makeItem('m2.lengthword', `cmp${a}-${b}-${unit}-${what}-${p}${q}-${shorter}`, d, {
        say: shorter ? `${p}'s ${what} is ${a} ${unit} long. ${q}'s ${what} is ${b} ${unit} long. How much shorter is ${q}'s ${what}?` : `${p}'s ${what} is ${a} ${unit} long. ${q}'s ${what} is ${b} ${unit} long. How much longer is ${p}'s ${what}?`,
        show: `${p}: ${a} ${unit}. ${q}: ${b} ${unit}. How much ${shorter ? 'shorter' : 'longer'}?`,
        choices: withUnit(numberChoices(rng, a - b, [{ n: a + b, why: 'added_instead' }, { n: a, why: 'answered_one_part' }, { n: a - b + 1, why: 'counted_on_wrong_start' }], { min: 0, max: 60 }), ` ${unit}`, unit).map((c) => ({ ...c, text: c.text })),
        explain: `Compare by subtracting: ${a} minus ${b} is ${a - b}. The difference is ${a - b} ${unit}.`,
      });
    }
    if (d === 2) {
      const a = rng.int(24, 65);
      const b = rng.int(12, 34);
      const grow = rng.next() < 0.5;
      const what = rng.pick(['sunflower', 'bean plant', 'snake', 'tower of blocks']);
      const ans = grow ? a + b : a - b;
      if (!grow && b >= a) return lengthWord.generate!(rng, d);
      return makeItem('m2.lengthword', `${grow ? 'grow' : 'cut'}${a}-${b}-${unit}-${what}`, d, {
        say: grow ? `A ${what} was ${a} ${unit} tall. It grew ${b} more ${unit}. How tall is it now?` : `A rope was ${a} ${unit} long. ${p} cut off ${b} ${unit}. How long is the rope now?`,
        show: grow ? `${a} ${unit}, grows ${b} more` : `${a} ${unit}, cut off ${b}`,
        choices: numberChoices(rng, ans, [
          { n: grow ? a - b : a + b, why: grow ? 'subtracted_instead' : 'added_instead' },
          { n: grow ? ans - 10 : ans + 10, why: grow ? 'forgot_carry' : 'forgot_borrow' },
          { n: ans + 1, why: 'near_miss' },
        ], { min: 0, max: 200 }).map((c) => ({ ...c, text: `${c.text} ${unit}`, say: `${c.say} ${unit}` })),
        explain: `${a} ${grow ? 'plus' : 'minus'} ${b} is ${ans}. It is ${ans} ${unit} ${grow ? 'tall' : 'long'} now.`,
      });
    }
    const mode = rng.pick(['farther', 'twoStep', 'numberLine'] as const);
    if (mode === 'numberLine') {
      const start = rng.int(2, 8) * 5;
      const jump = rng.int(11, 35);
      const back = rng.next() < 0.4;
      const ans = back ? start + jump - rng.int(5, 15) : start + jump;
      const minus = back ? start + jump - ans : 0;
      return makeItem('m2.lengthword', `line${start}+${jump}-${minus}-${unit}`, d, {
        say: back ? `On a number line, ${p} starts at ${start}, jumps forward ${jump}, then jumps back ${minus}. Where does ${p} land?` : `On a number line, ${p} starts at ${start} and jumps forward ${jump}. Where does ${p} land?`,
        show: back ? `Start ${start}, +${jump}, −${minus}` : `Start ${start}, +${jump}`,
        choices: numberChoices(rng, ans, [
          { n: back ? start + jump : jump, why: back ? 'ignored_second_step' : 'answered_one_part' },
          { n: back ? start + jump + minus : start + jump + 10, why: back ? 'added_all' : 'extra_ten' },
          { n: ans - 1, why: 'counted_start_as_jump' },
        ], { min: 0, max: 200 }),
        explain: back ? `${start} plus ${jump} is ${start + jump}. Back ${minus} more: ${start + jump} minus ${minus} is ${ans}.` : `${start} plus ${jump} is ${ans}.`,
      });
    }
    if (mode === 'farther') {
      const a = rng.int(25, 48);
      const more = rng.int(8, 25);
      return makeItem('m2.lengthword', `farther${a}+${more}-${unit}-${p}${q}`, d, {
        say: `${p} threw a ball ${a} ${unit}. ${q} threw it ${more} ${unit} farther than ${p}. How far did they throw in all?`,
        show: `${p}: ${a} ${unit}. ${q}: ${more} more. Total?`,
        choices: numberChoices(rng, a + a + more, [
          { n: a + more, why: 'ignored_second_step' },
          { n: a + a + more - 10, why: 'forgot_carry' },
          { n: more, why: 'answered_one_part' },
        ], { min: 0, max: 200 }),
        hint: `First find how far ${q} threw. Then add both throws.`,
        explain: `${q} threw ${a} + ${more} = ${a + more} ${unit}. Together: ${a} + ${a + more} = ${a + a + more} ${unit}.`,
      });
    }
    const a = rng.int(30, 60);
    const add = rng.int(12, 30);
    const cut = rng.int(8, 25);
    const ans = a + add - cut;
    return makeItem('m2.lengthword', `two${a}+${add}-${cut}-${unit}-${p}`, d, {
      say: `${p}'s paper chain is ${a} ${unit} long. ${p} adds ${add} ${unit}, then tears off ${cut} ${unit}. How long is it now?`,
      show: `${a} ${unit}, add ${add}, tear off ${cut}`,
      choices: numberChoices(rng, ans, [
        { n: a + add, why: 'ignored_second_step' },
        { n: a + add + cut, why: 'added_all' },
        { n: a - cut, why: 'ignored_first_step' },
      ], { min: 0, max: 200 }),
      explain: `First: ${a} + ${add} = ${a + add}. Then: ${a + add} − ${cut} = ${ans} ${unit}.`,
    });
  },
};

const COIN_NAME: Record<number, string> = { 1: 'penny', 5: 'nickel', 10: 'dime', 25: 'quarter' };
const coinVis = (values: number[]): Visual => ({ kind: 'coins', values, symbol: '¢', labels: values.map((x) => (x >= 100 ? `$${x / 100}` : COIN_NAME[x])) });
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const runningTotals = (xs: number[]) => xs.map((_, i) => sum(xs.slice(0, i + 1))).join(', ');

const moneyWord: Skill = {
  id: 'm2.moneyword',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Count mixed coins and dollar bills; make amounts; money word problems',
  kidTitle: 'Money math',
  icon: '💵',
  standards: ['2.MDR.6.2'],
  prereqs: ['m2.money'],
  regions: ['us-ga'],
  parentTip: 'Play store with real coins: price toys under 99¢ and let him pay and figure out change. Ask for two different ways to make 40¢.',
  intro: [{ say: 'To count coins, start with the coin worth the most and count on. A quarter, a dime and a nickel: twenty five, thirty five, forty cents!', visual: coinVis([25, 10, 5]) }],
  generate: (rng, d) => {
    if (d === 1) {
      const n = rng.int(3, 5);
      const coins = Array.from({ length: n }, () => rng.pick([25, 10, 10, 5, 5, 1, 1])).sort((a, b) => b - a);
      const total = sum(coins);
      if (total >= 100 || new Set(coins).size < 2) return moneyWord.generate!(rng, d);
      const swapped = sum(coins.map((c) => (c === 5 ? 10 : c === 10 ? 5 : c)));
      return makeItem('m2.moneyword', `count-${coins.join('-')}`, d, {
        say: 'How much money is this?',
        show: 'How many cents?',
        visual: coinVis(coins),
        choices: cents(numberChoices(rng, total, [
          { n: coins.length, why: 'counted_coins_not_value' },
          { n: swapped, why: 'coin_size_means_value' },
          { n: total - coins[coins.length - 1], why: 'missed_a_coin' },
        ], { min: 1, max: 150 })),
        hint: 'Start with the coin worth the most and count on.',
        explain: `Count on from the biggest coin: ${runningTotals(coins)}. That is ${total}¢.`,
      });
    }
    if (d === 2) {
      if (rng.next() < 0.5) {
        const bills = Array.from({ length: rng.int(2, 4) }, () => rng.pick([100, 100, 500, 1000])).sort((a, b) => b - a);
        const total = sum(bills) / 100;
        if (new Set(bills).size < 2) return moneyWord.generate!(rng, d);
        return makeItem('m2.moneyword', `bills-${bills.join('-')}`, d, {
          say: 'How many dollars is this?',
          show: 'How many dollars?',
          visual: coinVis(bills),
          choices: dollars(numberChoices(rng, total, [
            { n: bills.length, why: 'counted_bills_not_value' },
            { n: total - bills[bills.length - 1] / 100, why: 'missed_a_bill' },
            { n: total + 1, why: 'near_miss' },
          ], { min: 1, max: 60 })),
          explain: `Count on from the biggest bill: ${bills.map((_, i) => `$${sum(bills.slice(0, i + 1)) / 100}`).join(', ')}. That is $${total}.`,
        });
      }
      const target = rng.pick([15, 20, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90]);
      const make = (amt: number) => {
        const out: number[] = [];
        let left = amt;
        for (const c of rng.shuffle([[25, 10, 5], [10, 5], [25, 5], [10, 25, 5]])[0].sort((a, b) => b - a)) while (left >= c && out.length < 6) {
          out.push(c);
          left -= c;
        }
        while (left > 0 && out.length < 8) {
          out.push(left >= 5 ? 5 : 1);
          left -= left >= 5 ? 5 : 1;
        }
        return left === 0 ? out.sort((a, b) => b - a) : null;
      };
      const good = make(target);
      const off = [make(target - 5), make(target + 5), make(target + 10)].filter((x): x is number[] => !!x && x.length > 0);
      if (!good || off.length < 2) return moneyWord.generate!(rng, d);
      const choices = dedupe([v(coinVis(good), undefined), ...off.map((o) => v(coinVis(o), undefined, sum(o) > target ? 'counted_on_wrong' : 'stopped_counting_early'))]);
      if (choices.length < 3) return moneyWord.generate!(rng, d);
      return makeItem('m2.moneyword', `make${target}-${JSON.stringify(choices.map((c) => c.visual))}`, d, {
        say: `Which group of coins makes exactly ${target} cents?`,
        show: `Which makes exactly ${target}¢?`,
        choices,
        speakChoices: false,
        hint: 'Count each group, starting with the biggest coin.',
        explain: `Count the right group: ${runningTotals(good)}. That is exactly ${target}¢.`,
      });
    }
    const mode = rng.pick(['left', 'more', 'dollars'] as const);
    const [p] = twoNames(rng);
    const item = rng.pick([['a pencil', '✏️'], ['a sticker', '⭐'], ['an eraser', '🧽'], ['a toy car', '🚗'], ['a bouncy ball', '🏀'], ['a cookie', '🍪']]);
    if (mode === 'left') {
      const have = rng.pick([50, 60, 75, 80, 90, 99]);
      const cost = rng.int(12, have - 8);
      return makeItem('m2.moneyword', `left${have}-${cost}-${item[0]}-${p}`, d, {
        say: `${p} has ${have} cents. ${p} buys ${item[0]} for ${cost} cents. How much money is left?`,
        show: `${item[1]} ${have}¢ − ${cost}¢`,
        choices: cents(numberChoices(rng, have - cost, [
          { n: have + cost, why: 'added_instead' },
          { n: have - cost + 10, why: 'forgot_borrow' },
          { n: cost, why: 'answered_one_part' },
        ], { min: 0, max: 200 })),
        explain: `${have}¢ minus ${cost}¢ is ${have - cost}¢. Check: ${cost} + ${have - cost} = ${have}.`,
      });
    }
    if (mode === 'more') {
      const q = rng.int(1, 3);
      const dimes = rng.int(0, 2);
      const have = q * 25 + dimes * 10;
      const cost = have + rng.pick([5, 10, 15, 20]);
      if (cost >= 100) return moneyWord.generate!(rng, d);
      const pocket = [...Array(q).fill(25), ...Array(dimes).fill(10)];
      return makeItem('m2.moneyword', `more${q}q${dimes}d-${cost}-${item[0]}`, d, {
        say: `${cap(item[0])} costs ${cost} cents. ${p} has these coins. How many more cents does ${p} need?`,
        show: `${item[1]} costs ${cost}¢. How much more?`,
        visual: coinVis(pocket),
        choices: cents(numberChoices(rng, cost - have, [
          { n: have, why: 'answered_one_part' },
          { n: cost - pocket.length, why: 'counted_coins_not_value' },
          { n: cost + have, why: 'added_instead' },
        ], { min: 1, max: 200 })),
        hint: 'First count the coins. Then count up to the price.',
        explain: `The coins are ${runningTotals(pocket)}: ${have}¢. Count up from ${have} to ${cost}: ${cost - have}¢ more.`,
      });
    }
    const start = rng.int(8, 30);
    const gets = rng.int(5, 20);
    const spends = rng.int(4, start + gets - 2);
    const ans = start + gets - spends;
    return makeItem('m2.moneyword', `dollars${start}+${gets}-${spends}-${p}`, d, {
      say: `${p} has ${start} dollars. Grandma gives ${p} ${gets} dollars. Then ${p} spends ${spends} dollars on a book. How many dollars does ${p} have now?`,
      show: `$${start} + $${gets} − $${spends}`,
      choices: dollars(numberChoices(rng, ans, [
        { n: start + gets, why: 'ignored_second_step' },
        { n: start + gets + spends, why: 'added_all' },
        { n: Math.abs(start - spends), why: 'ignored_first_step' },
      ], { min: 0, max: 100 })),
      explain: `First: $${start} + $${gets} = $${start + gets}. Then: $${start + gets} − $${spends} = $${ans}.`,
    });
  },
};

/* ---- Data: picture graphs, bar graphs, line plots ---- */

const CATS: { title: string; items: { emoji: string; one: string; many: string }[] }[] = [
  { title: 'Favorite fruit', items: [{ emoji: '🍎', one: 'apple', many: 'apples' }, { emoji: '🍌', one: 'banana', many: 'bananas' }, { emoji: '🍇', one: 'grapes', many: 'grapes' }, { emoji: '🍓', one: 'strawberry', many: 'strawberries' }] },
  { title: 'Our pets', items: [{ emoji: '🐶', one: 'dog', many: 'dogs' }, { emoji: '🐱', one: 'cat', many: 'cats' }, { emoji: '🐟', one: 'fish', many: 'fish' }, { emoji: '🐰', one: 'rabbit', many: 'rabbits' }] },
  { title: 'Weather this month', items: [{ emoji: '☀️', one: 'sunny day', many: 'sunny days' }, { emoji: '🌧️', one: 'rainy day', many: 'rainy days' }, { emoji: '☁️', one: 'cloudy day', many: 'cloudy days' }, { emoji: '❄️', one: 'snowy day', many: 'snowy days' }] },
  { title: 'How we get to school', items: [{ emoji: '🚌', one: 'bus', many: 'bus riders' }, { emoji: '🚗', one: 'car', many: 'car riders' }, { emoji: '🚲', one: 'bike', many: 'bike riders' }, { emoji: '🚶', one: 'walker', many: 'walkers' }] },
  { title: 'Bugs we found', items: [{ emoji: '🐞', one: 'ladybug', many: 'ladybugs' }, { emoji: '🐜', one: 'ant', many: 'ants' }, { emoji: '🦋', one: 'butterfly', many: 'butterflies' }, { emoji: '🐝', one: 'bee', many: 'bees' }] },
];

/** Shared question bank for picture and bar graphs over category counts. */
function graphQuestion(rng: Rng, id: string, d: Difficulty, picture: boolean): Item {
  const set = rng.pick(CATS);
  const k = picture ? 3 : 4;
  const cats = rng.shuffle(set.items).slice(0, k);
  const maxV = picture ? (d === 1 ? 6 : 9) : d === 1 ? 10 : 18;
  const counts: number[] = [];
  while (counts.length < k) {
    const c = rng.int(picture ? 1 : 2, maxV);
    if (!counts.includes(c)) counts.push(c);
  }
  const visual: Visual = picture
    ? { kind: 'graph', title: set.title, rows: cats.map((c, i) => ({ emoji: c.emoji, count: counts[i] })) }
    : { kind: 'bars', title: set.title, bars: cats.map((c, i) => ({ label: c.one, emoji: c.emoji, value: counts[i] })), max: maxV > 10 ? 20 : 10 };
  const [i, j] = rng.shuffle([...Array(k).keys()]).slice(0, 2);
  const [hi, lo] = counts[i] > counts[j] ? [i, j] : [j, i];
  const modes = d === 1 ? (['howMany', 'most', 'fewest'] as const) : d === 2 ? (['more', 'fewer', 'two'] as const) : (['all', 'needMore', 'twoVsOne'] as const);
  const mode = rng.pick(modes as readonly string[]);
  const key = `${mode}-${set.title}-${cats.map((c) => c.emoji).join('')}-${counts.join('-')}-${i}${j}`;
  const base = { visual, hint: picture ? 'Count the pictures in each row.' : 'Look across from the top of each bar to the numbers.' };
  if (mode === 'most' || mode === 'fewest') {
    const target = counts.indexOf(mode === 'most' ? Math.max(...counts) : Math.min(...counts));
    return makeItem(id, key, d, {
      ...base,
      say: `Which has the ${mode === 'most' ? 'most' : 'fewest'}?`,
      show: `${set.title}: which has the ${mode}?`,
      choices: cats.map((c, n) => (n === target ? right({ visual: { kind: 'emoji', emoji: c.emoji }, say: c.many }) : wrong({ visual: { kind: 'emoji', emoji: c.emoji }, say: c.many }, counts[n] === (mode === 'most' ? Math.min(...counts) : Math.max(...counts)) ? 'most_fewest_confusion' : 'misread_graph'))),
      explain: `${cap(cats[target].many)}: ${counts[target]}. That is the ${mode === 'most' ? 'biggest' : 'smallest'} number on the graph.`,
    });
  }
  if (mode === 'howMany') {
    return makeItem(id, key, d, {
      ...base,
      say: `How many ${cats[i].many}?`,
      show: `How many ${cats[i].emoji}?`,
      choices: numberChoices(rng, counts[i], [
        { n: counts[(i + 1) % k], why: 'read_wrong_row' },
        { n: counts[i] + 1, why: 'count_double_tap' },
        { n: counts[i] - 1, why: 'count_skipped_one' },
      ], { min: 0, max: 30 }),
      explain: `${picture ? 'Count' : 'Read the top of'} the ${cats[i].emoji} ${picture ? 'row' : 'bar'}: ${counts[i]}.`,
    });
  }
  if (mode === 'more' || mode === 'fewer') {
    const diff = counts[hi] - counts[lo];
    return makeItem(id, key, d, {
      ...base,
      say: mode === 'more' ? `How many more ${cats[hi].many} than ${cats[lo].many}?` : `How many fewer ${cats[lo].many} than ${cats[hi].many}?`,
      show: mode === 'more' ? `How many more ${cats[hi].emoji} than ${cats[lo].emoji}?` : `How many fewer ${cats[lo].emoji} than ${cats[hi].emoji}?`,
      choices: numberChoices(rng, diff, [
        { n: counts[hi] + counts[lo], why: 'added_instead' },
        { n: counts[hi], why: 'answered_one_part' },
        { n: diff + 1, why: 'near_miss' },
      ], { min: 0, max: 50 }),
      explain: `${cap(cats[hi].many)}: ${counts[hi]}. ${cap(cats[lo].many)}: ${counts[lo]}. ${counts[hi]} minus ${counts[lo]} is ${diff}.`,
    });
  }
  if (mode === 'two') {
    return makeItem(id, key, d, {
      ...base,
      say: `How many ${cats[i].many} and ${cats[j].many} in all?`,
      show: `${cats[i].emoji} and ${cats[j].emoji} in all?`,
      choices: numberChoices(rng, counts[i] + counts[j], [
        { n: Math.abs(counts[i] - counts[j]), why: 'subtracted_instead' },
        { n: sum(counts), why: 'added_every_category' },
        { n: counts[i] + counts[j] - 1, why: 'near_miss' },
      ], { min: 0, max: 60 }),
      explain: `${counts[i]} plus ${counts[j]} is ${counts[i] + counts[j]}.`,
    });
  }
  if (mode === 'all') {
    const total = sum(counts);
    return makeItem(id, key, d, {
      ...base,
      say: 'How many are shown on the graph in all?',
      show: 'How many in all?',
      choices: numberChoices(rng, total, [
        { n: total - counts[k - 1], why: 'missed_a_category' },
        { n: Math.max(...counts), why: 'answered_one_part' },
        { n: total + 1, why: 'near_miss' },
      ], { min: 0, max: 90 }),
      explain: `Add every ${picture ? 'row' : 'bar'}: ${counts.join(' + ')} = ${total}.`,
    });
  }
  if (mode === 'needMore') {
    const need = counts[hi] - counts[lo];
    return makeItem(id, key, d, {
      ...base,
      say: `How many more ${cats[lo].many} are needed to have as many as ${cats[hi].many}?`,
      show: `${cats[lo].emoji} needs how many more to match ${cats[hi].emoji}?`,
      choices: numberChoices(rng, need, [
        { n: counts[hi], why: 'answered_one_part' },
        { n: counts[hi] + counts[lo], why: 'added_instead' },
        { n: need + 1, why: 'near_miss' },
      ], { min: 0, max: 50 }),
      explain: `${cap(cats[lo].many)}: ${counts[lo]}. Count up to ${counts[hi]}: ${need} more.`,
    });
  }
  const others = [...Array(k).keys()].filter((n) => n !== hi && n !== lo);
  const third = others[0];
  const together = counts[hi] + counts[lo];
  const ans = Math.abs(together - counts[third]);
  const more = together >= counts[third];
  return makeItem(id, key, d, {
    ...base,
    say: more ? `How many more ${cats[hi].many} and ${cats[lo].many} together than ${cats[third].many}?` : `How many fewer ${cats[hi].many} and ${cats[lo].many} together than ${cats[third].many}?`,
    show: `${cats[hi].emoji} + ${cats[lo].emoji} compared with ${cats[third].emoji}`,
    choices: numberChoices(rng, ans, [
      { n: together, why: 'ignored_second_step' },
      { n: together + counts[third], why: 'added_all' },
      { n: Math.abs(counts[hi] - counts[third]), why: 'ignored_first_step' },
    ], { min: 0, max: 80 }),
    explain: `Together: ${counts[hi]} + ${counts[lo]} = ${together}. Compare with ${counts[third]}: the difference is ${ans}.`,
  });
}

const pictureGraphs: Skill = {
  id: 'm1.graphs',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Picture graphs with three categories: how many, more, fewer, in all',
  kidTitle: 'Graphs and tallies',
  icon: '📊',
  standards: ['1.MDR.6.4'],
  prereqs: ['m.data'],
  parentTip: 'Make a picture graph of the family’s favorite fruit with sticky notes. Ask: “How many more like apples than bananas? How many people voted?”',
  intro: [{ say: 'A picture graph shows how many of each kind. Count the pictures in a row. Compare rows to see which has more.', visual: { kind: 'graph', title: 'Our pets', rows: [{ emoji: '🐶', count: 4 }, { emoji: '🐱', count: 2 }, { emoji: '🐟', count: 5 }] } }],
  generate: (rng, d) => graphQuestion(rng, 'm1.graphs', d, true),
};

const barGraphs: Skill = {
  id: 'm2.bargraph',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Bar graphs with four categories: compare, combine, how many more',
  kidTitle: 'Bar graphs',
  icon: '📈',
  standards: ['2.MDR.5.4'],
  prereqs: ['m1.graphs', 'm2.wordprob'],
  parentTip: 'Tally the colors of cars you pass, then draw a bar graph together. Ask two-step questions: “How many red and blue cars together? How many more than white?”',
  intro: [{ say: 'In a bar graph, read the number at the top of each bar. Then you can compare bars and add them.', visual: { kind: 'bars', title: 'Favorite fruit', max: 10, bars: [{ label: 'apple', emoji: '🍎', value: 6 }, { label: 'banana', emoji: '🍌', value: 3 }, { label: 'grapes', emoji: '🍇', value: 8 }] } }],
  generate: (rng, d) => graphQuestion(rng, 'm2.bargraph', d, false),
};

const PLOTS = [
  { what: 'pencils', label: 'Pencil length (inches)', unit: 'inches', start: [3, 4, 5] },
  { what: 'leaves', label: 'Leaf length (centimeters)', unit: 'centimeters', start: [4, 6, 8] },
  { what: 'shells', label: 'Shell length (centimeters)', unit: 'centimeters', start: [2, 3, 5] },
  { what: 'toy cars', label: 'Toy car length (inches)', unit: 'inches', start: [2, 3, 4] },
];
const linePlot: Skill = {
  id: 'm2.lineplot',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Line plots of measurements',
  kidTitle: 'Line plots',
  icon: '✖️',
  standards: ['2.MDR.5.4', '2.MD.D.9'],
  prereqs: ['m2.ruler', 'm2.bargraph'],
  parentTip: 'Measure 8 crayons to the nearest inch. Draw a number line and put an X above each length. Ask: “Which length is most common? How many are longer than 3 inches?”',
  intro: [{ say: 'A line plot shows measurements. Each X is one thing that was measured. Two Xs above five means two things are five inches long.', visual: { kind: 'lineplot', start: 3, end: 7, counts: [1, 2, 4, 2, 1], label: 'Pencil length (inches)' } }],
  generate: (rng, d) => {
    const plot = rng.pick(PLOTS);
    const start = rng.pick(plot.start);
    const n = 5;
    const counts = Array.from({ length: n }, () => rng.int(0, 5));
    const lo = counts.findIndex((c) => c > 0);
    const hi = n - 1 - [...counts].reverse().findIndex((c) => c > 0);
    if (sum(counts) < 6 || counts.filter((c) => c === Math.max(...counts)).length > 1 || hi - lo < 2) return linePlot.generate!(rng, d);
    const visual: Visual = { kind: 'lineplot', start, end: start + n - 1, counts, label: plot.label };
    const key = `${plot.what}-${start}-${counts.join('')}`;
    const mode = d === 1 ? 'howMany' : d === 2 ? rng.pick(['common', 'total'] as const) : rng.pick(['longer', 'range', 'shorterEq'] as const);
    if (mode === 'howMany') {
      const options = [...Array(n).keys()].filter((x) => counts[x] > 0 && counts[x] !== start + x);
      if (!options.length) return linePlot.generate!(rng, d);
      const i = rng.pick(options);
      return makeItem('m2.lineplot', `${mode}${i}-${key}`, d, {
        say: `How many ${plot.what} are ${start + i} ${plot.unit} long?`,
        show: `How many ${plot.what} are ${start + i} ${plot.unit} long?`,
        visual,
        choices: numberChoices(rng, counts[i], [
          { n: start + i, why: 'read_number_line_label' },
          { n: counts[(i + 1) % n], why: 'read_wrong_column' },
          { n: counts[i] + 1, why: 'near_miss' },
        ], { min: 0, max: 20 }),
        explain: `Count the Xs above ${start + i}: there ${counts[i] === 1 ? 'is 1' : `are ${counts[i]}`}.`,
      });
    }
    if (mode === 'common') {
      const top = counts.indexOf(Math.max(...counts));
      return makeItem('m2.lineplot', `${mode}-${key}`, d, {
        say: `Which length do the most ${plot.what} have?`,
        show: 'Which length is most common?',
        visual,
        choices: dedupe([
          t(`${start + top} ${plot.unit}`),
          t(`${Math.max(...counts)} ${plot.unit}`, 'read_count_as_length'),
          t(`${start + n - 1} ${plot.unit}`, 'picked_longest_length'),
          t(`${start + counts.indexOf(Math.min(...counts))} ${plot.unit}`, 'most_fewest_confusion'),
          t(`${start + ((top + 1) % n)} ${plot.unit}`, 'read_wrong_column'),
          t(`${start + ((top + n - 1) % n)} ${plot.unit}`, 'read_wrong_column'),
        ]),
        explain: `The tallest stack of Xs is above ${start + top}. So most ${plot.what} are ${start + top} ${plot.unit} long.`,
      });
    }
    if (mode === 'total') {
      const total = sum(counts);
      return makeItem('m2.lineplot', `${mode}-${key}`, d, {
        say: `How many ${plot.what} were measured in all?`,
        show: 'How many were measured?',
        visual,
        choices: numberChoices(rng, total, [
          { n: n, why: 'counted_lengths_not_marks' },
          { n: total - counts[0], why: 'missed_a_column' },
          { n: Math.max(...counts), why: 'answered_one_part' },
        ], { min: 0, max: 40 }),
        explain: `Each X is one of the ${plot.what}. Add the Xs: ${counts.join(' + ')} = ${total}.`,
      });
    }
    if (mode === 'range') {
      const [shortest, longest] = [start + lo, start + hi];
      return makeItem('m2.lineplot', `${mode}-${key}`, d, {
        say: `How much longer is the longest of the ${plot.what} than the shortest?`,
        show: 'Longest minus shortest?',
        visual,
        choices: numberChoices(rng, longest - shortest, [
          { n: longest, why: 'gave_one_length' },
          { n: start + n - 1 - start, why: hi < n - 1 || lo > 0 ? 'used_ends_of_number_line' : 'near_miss' },
          { n: longest - shortest + 1, why: 'counted_marks_not_spaces' },
          { n: Math.abs(counts[hi] - counts[lo]), why: 'subtracted_counts_not_lengths' },
        ], { min: 0, max: 30 }),
        hint: 'Find the first and last lengths that have an X above them.',
        explain: `The shortest is ${shortest} ${plot.unit} and the longest is ${longest} ${plot.unit}. ${longest} minus ${shortest} is ${longest - shortest}.`,
      });
    }
    const cut = start + rng.int(1, 3);
    const longer = mode === 'longer';
    const ans = sum(counts.filter((_, i) => (longer ? start + i > cut : start + i <= cut)));
    const close = sum(counts.filter((_, i) => (longer ? start + i >= cut : start + i < cut)));
    return makeItem('m2.lineplot', `${mode}${cut}-${key}`, d, {
      say: longer ? `How many ${plot.what} are longer than ${cut} ${plot.unit}?` : `How many ${plot.what} are ${cut} ${plot.unit} long or shorter?`,
      show: longer ? `Longer than ${cut}?` : `${cut} or shorter?`,
      visual,
      choices: numberChoices(rng, ans, [
        { n: close, why: longer ? 'included_the_boundary' : 'left_out_the_boundary' },
        { n: sum(counts) - ans, why: 'counted_other_side' },
        { n: counts[cut - start], why: 'answered_one_part' },
      ], { min: 0, max: 40 }),
      hint: longer ? `Do not count the Xs above ${cut}: they are exactly ${cut}.` : `Count the Xs above ${cut} too.`,
      explain: `Add the Xs ${longer ? `to the right of ${cut}` : `above ${cut} and to its left`}: ${ans}.`,
    });
  },
};

/* ======================================================================== */
/* NUMBER AND OPERATIONS                                                    */
/* ======================================================================== */

const tensOnes: Skill = {
  id: 'm1.tensones',
  subject: 'math',
  strand: 'number',
  grade: '1',
  title: 'Two-digit numbers as tens and ones (including regrouped forms)',
  kidTitle: 'Tens and ones',
  icon: '🥢',
  standards: ['1.NR.1.2'],
  prereqs: ['m.tens', 'm.teens'],
  parentTip: 'Bundle straws or craft sticks in tens with rubber bands. Build 34, then unbundle one ten: “Is 2 tens and 14 ones still 34?”',
  intro: [{ say: 'Forty seven is 4 tens and 7 ones. The first digit tells the tens. The last digit tells the ones.', visual: { kind: 'baseTen', hundreds: 0, tens: 4, ones: 7 } }],
  generate: (rng, d) => {
    const tn = rng.int(1, 9);
    let on = rng.int(0, 9);
    if (on === tn) on = (on + 3) % 10;
    const n = tn * 10 + on;
    if (d === 1) {
      const pictured = rng.next() < 0.5;
      return makeItem('m1.tensones', `build${tn}t${on}o${pictured ? 'p' : ''}`, d, {
        say: pictured ? 'How many tens and how many ones? What number is it?' : `What number has ${tn} ${plural(tn, 'ten', 'tens')} and ${on} ${plural(on, 'one', 'ones')}?`,
        show: pictured ? 'What number is this?' : `${tn} tens and ${on} ones`,
        visual: pictured ? { kind: 'baseTen', hundreds: 0, tens: tn, ones: on } : undefined,
        choices: numberChoices(rng, n, [
          ...(on ? [{ n: on * 10 + tn, why: 'tens_ones_reversed' }] : []),
          { n: tn + on, why: 'counted_blocks_not_value' },
          ...(on ? [{ n: tn * 100 + on, why: 'wrote_each_place_as_number' }] : []),
          { n: n + 10, why: 'miscounted_tens' },
        ], { min: 0, max: 1000 }),
        explain: `${tn} tens is ${tn * 10}. ${tn * 10} and ${on} ones is ${n}.`,
      });
    }
    if (d === 2) {
      // Only the tens digit: asking what the ones digit is worth would say the answer aloud.
      if (on === 0) return tensOnes.generate!(rng, d);
      return makeItem('m1.tensones', `value${n}t`, d, {
        say: `In the number ${n}, what is the ${tn} worth?`,
        show: `${n}: what is the ${tn} worth?`,
        visual: { kind: 'number', value: n },
        choices: numberChoices(rng, tn * 10, [
          { n: tn, why: 'digit_not_value' },
          { n: on, why: 'wrong_digit' },
          { n, why: 'whole_number_not_digit' },
        ], { min: 0, max: 100 }),
        explain: `In ${n}, the ${tn} is in the tens place and the ${on} is in the ones place. The ${tn} is worth ${tn} tens: ${tn * 10}.`,
      });
    }
    // d3: regrouped tens and ones
    const extra = rng.int(11, 19);
    const tens = rng.int(1, 7);
    const total = tens * 10 + extra;
    if (rng.next() < 0.5) {
      return makeItem('m1.tensones', `regroup${tens}t${extra}o`, d, {
        say: `What number is ${tens} tens and ${extra} ones?`,
        show: `${tens} tens and ${extra} ones`,
        visual: { kind: 'baseTen', hundreds: 0, tens, ones: extra },
        choices: numberChoices(rng, total, [
          { n: Number(`${tens}${extra}`), why: 'wrote_digits_side_by_side' },
          { n: tens * 10 + (extra % 10), why: 'ignored_extra_ten' },
          { n: tens + extra, why: 'counted_blocks_not_value' },
        ], { min: 0, max: 1000 }),
        hint: `${extra} ones is 1 ten and ${extra - 10} ones.`,
        explain: `${extra} ones make 1 more ten and ${extra - 10} ones. So it is ${tens + 1} tens and ${extra - 10} ones: ${total}.`,
      });
    }
    const T = Math.floor(total / 10);
    const O = total % 10;
    const form = (a: number, b: number) => `${a} ${plural(a, 'ten', 'tens')} and ${b} ${plural(b, 'one', 'ones')}`;
    return makeItem('m1.tensones', `other${total}`, d, {
      say: `Which is another way to make ${total}?`,
      show: `Another way to make ${total}`,
      choices: dedupe([
        t(form(T - 1, O + 10)),
        t(form(T, O + 10), 'regroup_extra_ten'),
        t(form(T - 1, O), 'regroup_forgot_ones'),
        ...(O !== T ? [t(form(O, T), 'tens_ones_reversed')] : [t(form(T + 1, O), 'miscounted_tens')]),
      ]),
      explain: `${total} is ${form(T, O)}. Break 1 ten into 10 ones: ${form(T - 1, O + 10)} is still ${total}.`,
    });
  },
};

const NUMBER_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const words = (n: number): string => {
  if (n >= 100) return `${NUMBER_WORDS[Math.floor(n / 100)]} hundred${n % 100 ? ` ${words(n % 100)}` : ''}`;
  if (n < 20) return NUMBER_WORDS[n];
  return `${TENS_WORDS[Math.floor(n / 10)]}${n % 10 ? `-${NUMBER_WORDS[n % 10]}` : ''}`;
};

const count120: Skill = {
  id: 'm1.count120',
  subject: 'math',
  strand: 'number',
  grade: '1',
  title: 'Count to 120 forward and back; read and write numbers past 100',
  kidTitle: 'Numbers past 100',
  icon: '💯',
  standards: ['1.NR.1.1'],
  prereqs: ['m.count20', 'm.tens'],
  parentTip: 'Count past 100 out loud on a walk: “…99, 100, 101…”. Write 107 together and talk about why it is not 1007.',
  intro: [{ say: 'After ninety nine comes one hundred. Then one hundred one, one hundred two, all the way to one hundred twenty!', visual: { kind: 'sequence', items: ['98', '99', '100', '101'], blank: -1 } }],
  generate: (rng, d) => {
    if (d === 1 || d === 2) {
      const back = d === 2 && rng.next() < 0.5;
      const n = d === 1 ? rng.pick([rng.int(20, 99), rng.int(2, 9) * 10 - 1, rng.int(2, 9) * 10 - 2]) : rng.pick([rng.int(96, 118), rng.int(100, 115), rng.int(2, 11) * 10 + 1]);
      const seq = back ? [n + 3, n + 2, n + 1, n] : [n - 2, n - 1, n, n + 1];
      if (seq.some((x) => x < 1 || x > 120)) return count120.generate!(rng, d);
      const ans = seq[3];
      return makeItem('m1.count120', `${back ? 'back' : 'fwd'}${seq.join('-')}`, d, {
        say: back ? `Count back: ${seq.slice(0, 3).join(', ')}. What comes next?` : `Count on: ${seq.slice(0, 3).join(', ')}. What comes next?`,
        show: back ? 'Count back. What comes next?' : 'What comes next?',
        visual: { kind: 'sequence', items: seq.map(String), blank: 3 },
        choices: numberChoices(rng, ans, [
          { n: back ? seq[2] + 1 : seq[2] - 1, why: 'counted_wrong_direction' },
          ...(ans % 10 === 0 && !back ? [{ n: Number(`${Math.floor(seq[2] / 10)}10`), why: 'decade_transition' }] : []),
          ...(ans >= 100 ? [{ n: Number(`100${ans - 100}`), why: 'wrote_extra_zeros' }] : []),
          { n: back ? ans - 1 : ans + 1, why: 'skipped_a_number' },
          { n: back ? ans - 10 : ans + 10, why: 'counted_by_tens' },
        ], { min: 0, max: 10000 }),
        explain: `${back ? 'Counting back' : 'Counting on'} by ones: ${seq.join(', ')}.`,
      });
    }
    const n = rng.int(101, 120);
    const r = n - 100;
    if (rng.next() < 0.45) {
      const swap = r < 10 ? 100 + r * 10 : 100 + (r % 10) * 10 + Math.floor(r / 10);
      return makeItem('m1.count120', `name${n}`, d, {
        say: 'Which words name this number?',
        show: 'Which words name this number?',
        visual: { kind: 'number', value: n },
        choices: dedupe([
          t(words(n)),
          t(`one thousand ${words(r)}`, 'wrote_extra_zeros'),
          t(words(r), 'dropped_the_hundred'),
          ...(swap !== n && swap <= 199 ? [t(words(swap), 'tens_ones_reversed')] : [t(words(n + 10), 'miscounted_tens')]),
        ]),
        speakChoices: false,
        explain: `${n} has 1 hundred and ${r} more: ${words(n)}.`,
      });
    }
    const choices = numberChoices(rng, n, [
      { n: Number(`100${r}`), why: 'wrote_extra_zeros' },
      { n: Number(`10${r}`), why: 'wrote_hundred_as_ten' },
      ...(r < 10 ? [{ n: 100 + r * 10, why: 'place_value_swap' }] : [{ n: 100 + (r % 10) * 10 + Math.floor(r / 10), why: 'tens_ones_reversed' }]),
      { n: r, why: 'dropped_the_hundred' },
    ], { min: 1, max: 100000 });
    return makeItem('m1.count120', `write${n}`, d, {
      say: `Which number is ${words(n)}?`,
      show: `Which is ${words(n)}?`,
      choices,
      speakChoices: false,
      explain: `${cap(words(n))} is one hundred and ${r} more. We write a 1 in the hundreds place, then ${r}: ${n}. We do not write 100 and then ${r}.`,
    });
  },
};

const expanded: Skill = {
  id: 'm2.expanded',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: 'Three-digit numbers: expanded form, number names, unusual groupings',
  kidTitle: 'Number forms',
  icon: '🧮',
  standards: ['2.NR.1.1'],
  prereqs: ['m2.placevalue'],
  parentTip: 'Write a number three ways: 352, 300 + 50 + 2, “three hundred fifty-two”. Then ask a tricky one: “What is 2 hundreds and 15 tens?”',
  intro: [{ say: 'Three hundred forty six is 300 plus 40 plus 6. Each digit shows how many hundreds, tens and ones.', visual: { kind: 'baseTen', hundreds: 3, tens: 4, ones: 6 } }],
  generate: (rng, d) => {
    const h = rng.int(1, 9);
    const tn = d === 1 ? rng.int(1, 9) : rng.pick([0, rng.int(1, 9), rng.int(1, 9)]);
    const on = rng.pick([0, rng.int(1, 9), rng.int(1, 9)]);
    const n = h * 100 + tn * 10 + on;
    const parts = [h * 100, tn * 10, on].filter(Boolean);
    const exp = parts.join(' + ');
    if (d === 1) {
      if (!tn || !on) return expanded.generate!(rng, d);
      return makeItem('m2.expanded', `fromexp${n}`, d, {
        say: `Which number is ${parts.join(' plus ')}?`,
        show: `${exp} = ?`,
        visual: { kind: 'number', value: `${exp}` },
        choices: numberChoices(rng, n, [
          { n: Number(`${h * 100}${tn * 10}${on}`), why: 'wrote_each_part' },
          { n: on * 100 + tn * 10 + h, why: 'digits_reversed' },
          { n: h * 100 + on * 10 + tn, why: 'tens_ones_reversed' },
        ], { min: 1, max: 10000000 }),
        explain: `${h * 100} is ${h} hundreds, ${tn * 10} is ${tn} tens, and ${on} is ${on} ones. Together: ${n}.`,
      });
    }
    if (d === 2) {
      if (rng.next() < 0.5) {
        if (!tn && !on) return expanded.generate!(rng, d);
        const choices = dedupe([
          t(exp),
          ...(tn === 0 && on ? [t(`${h * 100} + ${on * 10}`, 'zero_placeholder_ignored')] : []),
          ...(on === 0 && tn ? [t(`${h * 100} + ${tn}`, 'zero_placeholder_ignored')] : []),
          t(`${h} + ${tn} + ${on}`, 'digits_not_values'),
          ...(tn ? [t([h * 100, tn * 100, on * 10].filter(Boolean).join(' + '), 'wrong_place')] : []),
          t([h * 10, tn, on].filter(Boolean).join(' + '), 'wrong_place'),
        ]).map((c) => ({ ...c, say: c.text!.replace(/\+/g, 'plus') }));
        return makeItem('m2.expanded', `toexp${n}`, d, {
          say: `Which shows ${n} in expanded form?`,
          show: `${n} in expanded form`,
          visual: { kind: 'number', value: n },
          choices,
          explain: `${n} has ${h} hundreds, ${tn} tens and ${on} ones: ${exp}.${!tn || !on ? ' A zero digit adds nothing, so we leave that place out.' : ''}`,
        });
      }
      return makeItem('m2.expanded', `words${n}`, d, {
        say: `Which number is ${words(n)}?`,
        show: `${words(n)}`,
        choices: numberChoices(rng, n, [
          { n: Number(`${h}00${tn * 10 + on}`), why: 'wrote_extra_zeros' },
          { n: h * 100 + on * 10 + tn, why: 'tens_ones_reversed' },
          ...(tn === 0 ? [{ n: h * 100 + on * 10, why: 'zero_placeholder_dropped' }] : [{ n: h * 10 + tn, why: 'dropped_a_place' }]),
        ], { min: 1, max: 100000 }),
        speakChoices: false,
        explain: `${cap(words(n))}: ${h} hundreds, ${tn} tens and ${on} ones is ${n}.`,
      });
    }
    // d3: unusual groupings and out-of-order expanded form
    if (rng.next() < 0.5) {
      const hh = rng.int(1, 7);
      const tt = rng.int(11, 19);
      const oo = rng.int(1, 9);
      const val = hh * 100 + tt * 10 + oo;
      return makeItem('m2.expanded', `regroup${hh}h${tt}t${oo}o`, d, {
        say: `What number is ${hh} hundreds, ${tt} tens and ${oo} ones?`,
        show: `${hh} hundreds, ${tt} tens, ${oo} ones`,
        choices: numberChoices(rng, val, [
          { n: Number(`${hh}${tt}${oo}`), why: 'wrote_digits_side_by_side' },
          { n: hh * 100 + (tt % 10) * 10 + oo, why: 'ignored_extra_hundred' },
          { n: hh * 100 + tt + oo, why: 'tens_counted_as_ones' },
        ], { min: 1, max: 100000 }),
        hint: `${tt} tens is 1 hundred and ${tt - 10} tens.`,
        explain: `${tt} tens is ${tt * 10}. ${hh * 100} + ${tt * 10} + ${oo} = ${val}.`,
      });
    }
    if (!tn || !on) return expanded.generate!(rng, d);
    const shuffled = rng.shuffle([h * 100, tn * 10, on]);
    if (shuffled[0] === h * 100) shuffled.push(shuffled.shift()!);
    return makeItem('m2.expanded', `mixed${shuffled.join('-')}`, d, {
      say: `What number is ${shuffled.join(' plus ')}?`,
      show: `${shuffled.join(' + ')} = ?`,
      visual: { kind: 'number', value: shuffled.join(' + ') },
      choices: numberChoices(rng, n, [
        { n: Number(shuffled.map((x) => String(x).replace(/0+$/, '')).join('')), why: 'read_parts_in_order_given' },
        { n: Number(shuffled.join('')), why: 'wrote_each_part' },
        { n: h * 100 + on * 10 + tn, why: 'tens_ones_reversed' },
      ], { min: 1, max: 10000000 }),
      hint: 'Find the hundreds first, then the tens, then the ones.',
      explain: `The order does not matter. ${h * 100} + ${tn * 10} + ${on} = ${n}.`,
    });
  },
};

const tenMore100: Skill = {
  id: 'm2.tenmore100',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: '10 more/less and 100 more/less; skip count by 5s, 10s, 25s, 100s from any number',
  kidTitle: '10 and 100 more',
  icon: '🪜',
  standards: ['2.NR.2.2', '2.NR.1.2'],
  prereqs: ['m1.tenmore', 'm2.skipcount'],
  parentTip: 'Say a number like 487 and play “100 more, 10 less”. Watch the tricky crossings: 10 more than 595 is 605.',
  intro: [{ say: '10 more changes the tens digit. 100 more changes the hundreds digit. 10 more than 352 is 362. 100 more than 352 is 452.' }],
  generate: (rng, d) => {
    if (d === 3 && rng.next() < 0.55) {
      const step = rng.pick([10, 100, 5, 25, 10]);
      const back = step !== 25 && step !== 5 && rng.next() < 0.4;
      const start = step === 25 ? rng.pick([0, 25, 50, 75, 100]) : step === 5 ? rng.int(17, 39) * 5 : step === 10 ? rng.int(101, 970) : rng.int(101, 650);
      const seq = [0, 1, 2, 3].map((i) => start + (back ? -i : i) * step);
      if (seq.some((x) => x < 0 || x > 1000)) return tenMore100.generate!(rng, d);
      const ans = seq[3];
      return makeItem('m2.tenmore100', `skip${step}${back ? 'b' : 'f'}${start}`, d, {
        say: `Count ${back ? 'back ' : ''}by ${step}s: ${seq.slice(0, 3).join(', ')}. What comes next?`,
        show: `Count ${back ? 'back ' : ''}by ${step}s`,
        visual: { kind: 'sequence', items: seq.map(String), blank: 3 },
        choices: numberChoices(rng, ans, [
          { n: seq[2] + (back ? -1 : 1), why: 'counted_by_ones' },
          { n: seq[2] + (back ? 1 : -1) * step, why: 'counted_wrong_direction' },
          ...(step === 10 ? [{ n: back ? seq[2] - 100 : seq[2] + 100, why: 'wrong_place' }] : step === 100 ? [{ n: seq[2] + (back ? -10 : 10), why: 'wrong_place' }] : [{ n: seq[2] + (back ? -1 : 1) * (step === 5 ? 10 : 5), why: 'wrong_step' }]),
          ...(step === 10 && Math.floor(ans / 100) !== Math.floor(seq[2] / 100) ? [{ n: Math.floor(seq[2] / 100) * 100 + (ans % 100), why: 'decade_transition' }] : []),
        ], { min: 0, max: 1100 }),
        explain: `Each jump is ${back ? 'minus' : 'plus'} ${step}: ${seq.join(', ')}.`,
      });
    }
    const step = rng.pick([10, 100]);
    const more = rng.next() < 0.5;
    // d1: no crossing; d2: crossing a hundred (10 more than 596) or a zero digit; d3: two steps
    let n: number;
    if (d === 1) n = rng.int(1, 8) * 100 + rng.int(1, 8) * 10 + rng.int(0, 9);
    else if (step === 10) n = rng.int(1, 8) * 100 + (more ? 90 : 0) + rng.int(0, 9);
    else n = more ? rng.int(1, 8) * 100 + rng.int(0, 99) : rng.int(100, 199);
    if (d === 3) {
      const a = rng.pick([[100, 10], [100, -10], [-100, 10], [10, 10], [100, 100]] as const);
      const base = rng.int(210, 780);
      const ans = base + a[0] + a[1];
      const word = (x: number) => `${Math.abs(x)} ${x > 0 ? 'more' : 'less'}`;
      return makeItem('m2.tenmore100', `two${base}${a.join('')}`, d, {
        say: `Start at ${base}. Find ${word(a[0])}, then ${word(a[1])}. What number do you get?`,
        show: `${base}: ${word(a[0])}, then ${word(a[1])}`,
        choices: numberChoices(rng, ans, [
          { n: base + a[0], why: 'ignored_second_step' },
          { n: base + a[0] - a[1], why: 'more_less_confusion' },
          { n: base + a[0] / 10 + a[1] / 10, why: 'one_instead_of_ten' },
        ], { min: 0, max: 1100 }),
        explain: `${base} → ${base + a[0]} → ${ans}.`,
      });
    }
    const ans = more ? n + step : n - step;
    if (ans < 0 || ans > 1000) return tenMore100.generate!(rng, d);
    return makeItem('m2.tenmore100', `${step}${more ? '+' : '-'}${n}`, d, {
      say: `What number is ${step} ${more ? 'more' : 'less'} than ${n}?`,
      show: `${step} ${more ? 'more' : 'less'} than ${n}`,
      choices: numberChoices(rng, ans, [
        { n: more ? n + (step === 10 ? 1 : 10) : n - (step === 10 ? 1 : 10), why: step === 10 ? 'one_instead_of_ten' : 'wrong_place' },
        { n: more ? n - step : n + step, why: 'more_less_confusion' },
        ...(step === 10 && d === 2 ? [{ n: more ? Math.floor(n / 100) * 100 + ((n + 10) % 100) : n - 10 + 100, why: 'decade_transition' }] : [{ n: more ? n + step * 10 : n - step * 10, why: 'wrong_place' }]),
      ], { min: 0, max: 2000 }),
      explain: step === 10
        ? `10 ${more ? 'more' : 'less'} changes the tens. ${n} has ${Math.floor(n / 10)} tens; ${ans} has ${Math.floor(ans / 10)} tens. The ones stay ${n % 10}.`
        : `100 ${more ? 'more' : 'less'} changes the hundreds digit: ${n} → ${ans}. The tens and ones stay the same.`,
    });
  },
};

const SIGN: Record<'>' | '<' | '=', string> = { '>': 'greater than', '<': 'less than', '=': 'equal to' };
const signChoices = (answer: '>' | '<' | '=', reversedWhy: string) =>
  (['>', '<', '='] as const).map((s) => (s === answer ? right({ visual: { kind: 'text', text: s, size: 'xl' }, say: SIGN[s] }) : wrong({ visual: { kind: 'text', text: s, size: 'xl' }, say: SIGN[s] }, s === '=' || answer === '=' ? 'equal_sign_misused' : reversedWhy)));

const compareSign: Skill = {
  id: 'm2.comparesign',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: 'Compare numbers to 1,000 with >, <, = (including expanded forms)',
  kidTitle: 'Greater, less, equal',
  icon: '🐊',
  standards: ['2.NR.1.3', '1.NR.1.3'],
  prereqs: ['m2.compare1000', 'm2.expanded'],
  parentTip: 'Write two numbers and let him draw the “alligator mouth” toward the bigger one. Read it left to right: “452 is greater than 425.”',
  intro: [{ say: 'The open side of the sign faces the bigger number. 7 > 3 means seven is greater than three. 3 < 7 means three is less than seven.', visual: { kind: 'text', text: '452 > 425', size: 'xl' } }],
  generate: (rng, d) => {
    let a: number;
    let b: number;
    let left: string;
    let right2: string;
    if (d === 1) {
      const two = rng.next() < 0.4;
      a = two ? rng.int(12, 98) : rng.int(101, 999);
      b = two ? rng.pick([Number(String(a).split('').reverse().join('')), a + rng.int(-9, 9)]) : rng.pick([a + rng.int(1, 3) * 100, a - rng.int(1, 3) * 100, Number(String(a).split('').reverse().join(''))]);
      if (b < 1 || b > 999 || b === a) return compareSign.generate!(rng, d);
      left = String(a);
      right2 = String(b);
    } else if (d === 2) {
      const h = rng.int(1, 9);
      a = h * 100 + rng.int(0, 99);
      b = rng.next() < 0.15 ? a : h * 100 + rng.pick([Math.floor((a % 100) / 10) + 1, Math.floor((a % 100) / 10) - 1]) * 10 + rng.int(0, 9);
      if (b < 100 || Math.floor(b / 100) !== h || (a % 100 === b % 100 && a !== b)) return compareSign.generate!(rng, d);
      left = String(a);
      right2 = String(b);
    } else {
      const h = rng.int(1, 9);
      const tn = rng.int(0, 9);
      const on = rng.int(1, 9);
      a = h * 100 + tn * 10 + on;
      const forms = [
        () => ({ txt: [h * 100, tn * 10, on].filter(Boolean).join(' + '), val: a }),
        () => ({ txt: [h * 100, on * 10, tn].filter(Boolean).join(' + '), val: h * 100 + on * 10 + tn }),
        () => ({ txt: `${h} hundreds ${on} ones`, val: h * 100 + on }),
        () => ({ txt: `${h * 10 + tn} tens`, val: (h * 10 + tn) * 10 }),
      ];
      const f = rng.pick(forms)();
      b = f.val;
      left = String(a);
      right2 = f.txt;
      if (rng.next() < 0.5) [left, right2, a, b] = [right2, left, b, a];
    }
    const ans: '>' | '<' | '=' = a > b ? '>' : a < b ? '<' : '=';
    return makeItem('m2.comparesign', `${left}?${right2}`, d, {
      say: `Which sign makes this true? ${left} blank ${right2}.`,
      show: 'Which sign makes it true?',
      visual: { kind: 'text', text: `${left}  ?  ${right2}`, size: 'lg' },
      choices: signChoices(ans, 'sign_direction_reversed'),
      keepOrder: true,
      speakChoices: true,
      hint: 'Compare hundreds first, then tens, then ones.',
      explain: `${d === 3 ? `${left} is ${a} and ${right2} is ${b}. ` : ''}${a} is ${SIGN[ans]} ${b}, so the sign is ${ans}.${d === 3 ? '' : ' Compare the hundreds first, then the tens, then the ones.'}`,
    });
  },
};

/* ======================================================================== */
/* ALGEBRAIC THINKING                                                       */
/* ======================================================================== */

const STUFF = ['stickers', 'marbles', 'shells', 'books', 'cards', 'blocks', 'crayons', 'beads', 'rocks', 'stamps'];

/** Add/subtract stories with the unknown in every position, sized for Grade 1 (≤20) or Grade 2 (≤100). */
function storyGenerator(id: string, grade: 1 | 2) {
  return (rng: Rng, d: Difficulty): Item => {
    const [p, q] = twoNames(rng);
    const thing = rng.pick(STUFF);
    const big = grade === 1 ? 20 : 99;
    const small = grade === 1 ? 2 : 11;
    const types = d === 1 ? ['addResult', 'takeResult', 'together'] : d === 2 ? ['changeAdd', 'changeTake', 'compareMore', 'compareFewer'] : grade === 1 ? ['startAdd', 'startTake', 'compareBigger', 'compareTrap', 'three'] : ['startAdd', 'startTake', 'compareBigger', 'compareTrap', 'twoStep'];
    const type = rng.pick(types);
    // a + b = c with every number in range
    const c = rng.int(grade === 1 ? 8 : 35, big);
    const a = rng.int(small, c - small);
    const b = c - a;
    // Equal parts would let a number in the story double as the answer.
    if (a === b) return storyGenerator(id, grade)(rng, d);
    const N = (n: number, why: string) => ({ n, why });
    let say: string;
    let show: string;
    let ans: number;
    let wrongs: { n: number; why: string }[];
    let explain: string;
    let hint: string | undefined;
    switch (type) {
      case 'addResult':
        say = `${p} has ${a} ${thing}. ${p} gets ${b} more. How many ${thing} does ${p} have now?`;
        show = `${a} ${thing}, gets ${b} more`;
        ans = c;
        wrongs = [N(Math.abs(a - b), 'subtracted_instead'), N(c - 1, 'counted_on_wrong_start'), N(c - 10, 'forgot_carry')];
        explain = `${a} plus ${b} is ${c}.`;
        break;
      case 'together':
        say = `${p} has ${a} red ${thing} and ${b} blue ${thing}. How many ${thing} in all?`;
        show = `${a} red + ${b} blue`;
        ans = c;
        wrongs = [N(Math.abs(a - b), 'subtracted_instead'), N(Math.max(a, b), 'answered_one_part'), N(c + 1, 'count_double_tap')];
        explain = `Put the groups together: ${a} + ${b} = ${c}.`;
        break;
      case 'takeResult':
        say = `${p} had ${c} ${thing}. ${p} gave ${b} to ${q}. How many ${thing} does ${p} have left?`;
        show = `${c} ${thing}, gave away ${b}`;
        ans = a;
        wrongs = [N(c + b, 'added_instead'), N(b, 'answered_part_taken'), N(a + 1, 'counted_on_wrong_start')];
        explain = `${c} minus ${b} is ${a}. Check: ${a} + ${b} = ${c}.`;
        break;
      case 'changeAdd':
        say = `${p} had ${a} ${thing}. ${q} gave ${p} some more. Now ${p} has ${c}. How many did ${q} give?`;
        show = `${a} + ? = ${c}`;
        ans = b;
        wrongs = [N(c, 'gave_whole'), N(a + c, 'added_all_numbers'), N(b + 1, 'counted_on_wrong_start')];
        hint = `Count up from ${a} to ${c}.`;
        explain = `${a} plus what makes ${c}? Count up from ${a} to ${c}: ${b}. So ${q} gave ${b}.`;
        break;
      case 'changeTake':
        say = `There were ${c} ${thing} on the table. ${p} took some away. Now there are ${a} left. How many did ${p} take?`;
        show = `${c} − ? = ${a}`;
        ans = b;
        wrongs = [N(a, 'answered_part_left'), N(a + c, 'added_all_numbers'), N(b - 1, 'counted_on_wrong_start')];
        explain = `${c} minus what leaves ${a}? ${c} − ${a} = ${b}. ${p} took ${b}.`;
        break;
      case 'compareMore':
      case 'compareFewer': {
        const [hi, lo] = a > b ? [a, b] : [b, a];
        if (hi === lo || hi === 2 * lo) return storyGenerator(id, grade)(rng, d);
        const more = type === 'compareMore';
        say = more ? `${p} has ${hi} ${thing}. ${q} has ${lo} ${thing}. How many more ${thing} does ${p} have than ${q}?` : `${p} has ${hi} ${thing}. ${q} has ${lo} ${thing}. How many fewer ${thing} does ${q} have than ${p}?`;
        show = `${p}: ${hi}. ${q}: ${lo}. How many ${more ? 'more' : 'fewer'}?`;
        ans = hi - lo;
        wrongs = [N(hi + lo, 'added_instead'), N(hi, 'answered_one_part'), N(lo, 'answered_one_part')];
        hint = 'Line them up: how many extra does the bigger group have?';
        explain = `Compare: ${hi} − ${lo} = ${ans}. ${p} has ${ans} more, so ${q} has ${ans} fewer.`;
        break;
      }
      case 'startAdd':
        say = `${p} had some ${thing}. ${q} gave ${p} ${b} more. Now ${p} has ${c}. How many ${thing} did ${p} have at the start?`;
        show = `? + ${b} = ${c}`;
        ans = a;
        wrongs = [N(c + b, 'added_instead'), N(c, 'gave_whole'), N(a + 1, 'counted_on_wrong_start')];
        hint = 'Work backwards: take away what was added.';
        explain = `Something plus ${b} is ${c}. Work backwards: ${c} − ${b} = ${a}.`;
        break;
      case 'startTake':
        say = `${p} had some ${thing}. ${p} gave ${b} away and has ${a} left. How many ${thing} did ${p} have at the start?`;
        show = `? − ${b} = ${a}`;
        ans = c;
        wrongs = [N(Math.abs(a - b), 'subtracted_instead'), N(a, 'answered_part_left'), N(c - 10 > 0 ? c - 10 : c + 2, c - 10 > 0 ? 'forgot_carry' : 'near_miss')];
        hint = 'Put back the ones that were given away.';
        explain = `Put the ${b} back with the ${a} left: ${a} + ${b} = ${c}.`;
        break;
      case 'compareBigger':
        say = `${q} has ${a} ${thing}. ${p} has ${b} more ${thing} than ${q}. How many ${thing} does ${p} have?`;
        show = `${q}: ${a}. ${p}: ${b} more than ${q}.`;
        ans = c;
        wrongs = [N(b, 'answered_difference'), N(Math.abs(a - b), 'subtracted_instead'), N(c + 1, 'near_miss')];
        explain = `${p} has the same as ${q} plus ${b} more: ${a} + ${b} = ${c}.`;
        break;
      case 'compareTrap':
        say = `${p} has ${c} ${thing}. ${p} has ${b} more than ${q}. How many ${thing} does ${q} have?`;
        show = `${p}: ${c}, which is ${b} more than ${q}.`;
        ans = a;
        wrongs = [N(c + b, 'keyword_more_means_add'), N(b, 'answered_difference'), N(c, 'gave_whole')];
        hint = `Who has more, ${p} or ${q}?`;
        explain = `${p} has more, so ${q} has fewer: ${c} − ${b} = ${a}. The word “more” does not always mean add!`;
        break;
      case 'three': {
        const x = rng.int(2, 7);
        const y = rng.int(2, 7);
        const z = rng.int(2, 6);
        say = `${p} picks ${x} red apples, ${y} green apples and ${z} yellow apples. How many apples in all?`;
        show = `${x} + ${y} + ${z}`;
        ans = x + y + z;
        wrongs = [N(x + y, 'missed_an_addend'), N(ans + 1, 'count_double_tap'), N(ans - 1, 'count_skipped_one')];
        hint = 'Look for two numbers that make 10, or add two first, then the third.';
        explain = `${x} + ${y} = ${x + y}. Then ${x + y} + ${z} = ${ans}.`;
        break;
      }
      default: {
        const s0 = rng.int(30, 60);
        const plus = rng.int(12, 35);
        const minus = rng.int(10, 30);
        const end = s0 + plus - minus;
        if ([s0, plus, minus].includes(end)) return storyGenerator(id, grade)(rng, d);
        say = `${p} has ${s0} ${thing}. ${p} buys ${plus} more, then gives ${minus} to ${q}. How many ${thing} does ${p} have now?`;
        show = `${s0} + ${plus} − ${minus}`;
        ans = end;
        wrongs = [N(s0 + plus, 'ignored_second_step'), N(s0 + plus + minus, 'added_all'), N(s0 - minus, 'ignored_first_step')];
        explain = `First: ${s0} + ${plus} = ${s0 + plus}. Then: ${s0 + plus} − ${minus} = ${end}.`;
      }
    }
    return makeItem(id, `${type}-${say}`, d, {
      say,
      show,
      choices: numberChoices(rng, ans, wrongs, { min: 0, max: 300 }),
      ...(hint ? { hint } : {}),
      explain,
    });
  };
}

const wordUnknown1: Skill = {
  id: 'm1.wordunknown',
  subject: 'math',
  strand: 'algebra',
  grade: '1',
  title: 'Story problems within 20 with the unknown in any position (add to, take from, compare)',
  kidTitle: 'Mystery story numbers',
  icon: '🕵️',
  standards: ['1.NR.2.1', '1.NR.2.3', '1.NR.2.6'],
  prereqs: ['m1.add20', 'm1.sub20'],
  parentTip: 'Tell stories where the start is the mystery: “I had some grapes, I ate 4 and 7 are left. How many did I have?” Ask him to act it out with toys.',
  intro: [{ say: 'Sometimes the story hides the start or the middle. Mia had some stickers. She got 3 more. Now she has 10. She must have had 7, because 7 plus 3 is 10!' }],
  generate: storyGenerator('m1.wordunknown', 1),
};

const wordUnknown2: Skill = {
  id: 'm2.wordunknown',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Story problems within 100 with the unknown in any position, compare traps, two steps',
  kidTitle: 'Tricky story problems',
  icon: '🔎',
  standards: ['2.NR.2.3'],
  prereqs: ['m2.wordprob', 'm1.wordunknown'],
  parentTip: 'Before solving, ask: “Who has more? Is the answer bigger or smaller than the numbers in the story?” This catches the “more means add” trap.',
  intro: [{ say: 'Ana has 45 cards. She has 12 more than Ben. Who has more? Ana! So Ben has fewer: 45 minus 12 is 33.' }],
  generate: storyGenerator('m2.wordunknown', 2),
};

const eq = (text: string): Visual => ({ kind: 'text', text, size: 'lg' });
const spokenEq = (s: string) => s.replace(/\+/g, 'plus').replace(/−/g, 'minus').replace(/=/g, 'equals').replace(/\?/g, 'what number');

/** True/false equations and missing numbers anywhere in an equation; Grade 1 within 20, Grade 2 within 100. */
function equationGenerator(id: string, grade: 1 | 2) {
  return (rng: Rng, d: Difficulty): Item => {
    const hi = grade === 1 ? 10 : 60;
    const lo = grade === 1 ? 1 : 11;
    const a = rng.int(lo + (grade === 1 ? 1 : 0), hi);
    const b = rng.int(lo, hi);
    const c = a + b;
    if (d === 1 || (d === 3 && rng.next() < 0.4)) {
      // Which number sentence is true?
      let correct: string;
      let wrongs: [string, string][];
      if (d === 1) {
        const form = rng.pick(['a+b=c', 'c=a+b', 'c-b=a']);
        correct = form === 'a+b=c' ? `${a} + ${b} = ${c}` : form === 'c=a+b' ? `${c} = ${a} + ${b}` : `${c} − ${b} = ${a}`;
        wrongs = [
          [form === 'c-b=a' ? `${c} − ${b} = ${a + 1}` : `${a} + ${b} = ${c + 1}`, 'computed_wrong'],
          [form === 'c-b=a' ? `${c} + ${b} = ${a}` : `${Math.max(a, b)} − ${Math.min(a, b)} = ${c}`, 'operation_ignored'],
          [form === 'c=a+b' ? `${c} = ${a} + ${b + 1}` : form === 'c-b=a' ? `${c} − ${b} = ${a - 1}` : `${c} + ${b} = ${a}`, form === 'a+b=c' ? 'equation_order_confused' : 'computed_wrong'],
        ];
      } else {
        const k = rng.int(1, Math.min(a, b) - 1 > 0 ? Math.min(a, b) - 1 : 1);
        correct = `${a} + ${b} = ${a - k} + ${b + k}`;
        wrongs = [
          [`${a} + ${b} = ${c} + ${b}`, 'equal_sign_means_answer'],
          [`${a} + ${b} = ${a} + ${b + 1}`, 'computed_wrong'],
          [`${a} + ${b} = ${Math.max(b + k, a - k)} − ${Math.min(b + k, a - k)}`, 'operation_ignored'],
        ];
      }
      if (/−\s*-|= -/.test(correct)) return equationGenerator(id, grade)(rng, d);
      const choices = dedupe([v(eq(correct), spokenEq(correct)), ...wrongs.filter(([w]) => !/(^|\s)-\d/.test(w)).map(([w, why]) => v(eq(w), spokenEq(w), why))]);
      if (choices.length < 3) return equationGenerator(id, grade)(rng, d);
      return makeItem(id, `true-${correct}-${d}`, d, {
        say: 'Which number sentence is true?',
        show: 'Which is true?',
        choices,
        hint: 'The equal sign means both sides are worth the same. Work out each side.',
        explain: `${correct}: ${d === 1 ? 'both sides have the same value' : `${a} + ${b} is ${c}, and the other side is also ${c}`}. The equal sign means “is the same as”.`,
      });
    }
    let shown: string;
    let ans: number;
    let wrongs: { n: number; why: string }[];
    let explain: string;
    if (d === 2) {
      const form = rng.pick(['a+?=c', '?+b=c', 'c-?=a', '?-b=a', 'c=a+?']);
      if (form === 'a+?=c' || form === 'c=a+?') {
        shown = form === 'a+?=c' ? `${a} + ? = ${c}` : `${c} = ${a} + ?`;
        ans = b;
        wrongs = [{ n: c + a, why: 'added_all_numbers' }, { n: c, why: 'gave_whole' }, { n: b + 1, why: 'counted_on_wrong_start' }];
        explain = `${a} plus what makes ${c}? ${c} − ${a} = ${b}.`;
      } else if (form === '?+b=c') {
        shown = `? + ${b} = ${c}`;
        ans = a;
        wrongs = [{ n: c + b, why: 'added_all_numbers' }, { n: c, why: 'gave_whole' }, { n: a - 1, why: 'counted_on_wrong_start' }];
        explain = `What plus ${b} makes ${c}? ${c} − ${b} = ${a}.`;
      } else if (form === 'c-?=a') {
        shown = `${c} − ? = ${a}`;
        ans = b;
        wrongs = [{ n: c + a, why: 'added_all_numbers' }, { n: a, why: 'copied_a_number' }, { n: b + 1, why: 'near_miss' }];
        explain = `${c} take away what leaves ${a}? ${c} − ${a} = ${b}.`;
      } else {
        shown = `? − ${b} = ${a}`;
        ans = c;
        wrongs = [{ n: Math.abs(a - b), why: 'subtracted_instead' }, { n: a, why: 'copied_a_number' }, { n: c - 1, why: 'near_miss' }];
        explain = `The missing number take away ${b} leaves ${a}, so it is ${a} + ${b} = ${c}.`;
      }
    } else {
      const k = rng.int(1, grade === 1 ? 5 : 25);
      const form = rng.pick(['a+b=?+x', 'a+b=x+?', '?+b=x+y']);
      if (form === '?+b=x+y') {
        const x = c - k;
        if (x < 1) return equationGenerator(id, grade)(rng, d);
        shown = `? + ${b} = ${x} + ${k}`;
        ans = a;
        wrongs = [{ n: c, why: 'equal_sign_means_answer' }, { n: c + b, why: 'added_all_numbers' }, { n: a + 1, why: 'near_miss' }];
        explain = `The right side is ${x} + ${k} = ${c}. So ? + ${b} must also be ${c}: ? is ${a}.`;
      } else {
        const x = rng.int(1, c - 1);
        shown = form === 'a+b=?+x' ? `${a} + ${b} = ? + ${x}` : `${a} + ${b} = ${x} + ?`;
        ans = c - x;
        wrongs = [{ n: c, why: 'equal_sign_means_answer' }, { n: c + x, why: 'added_all_numbers' }, { n: ans + 1, why: 'near_miss' }];
        explain = `The left side is ${a} + ${b} = ${c}. The right side must also make ${c}: ${x} + ${ans} = ${c}.`;
      }
    }
    // A number already in the equation must not also be the answer.
    if ((shown.match(/\d+/g) ?? []).map(Number).includes(ans)) return equationGenerator(id, grade)(rng, d);
    return makeItem(id, `missing-${shown}`, d, {
      say: `What number makes this true? ${spokenEq(shown)}`,
      show: 'What number makes it true?',
      visual: eq(shown),
      choices: numberChoices(rng, ans, wrongs, { min: 0, max: 300 }),
      hint: d === 3 ? 'Both sides of the equal sign must be worth the same. Work out the full side first.' : 'Think: what number fits in the box?',
      explain,
    });
  };
}

const equations1: Skill = {
  id: 'm1.equations',
  subject: 'math',
  strand: 'algebra',
  grade: '1',
  title: 'The equal sign: true or false equations, missing numbers within 20',
  kidTitle: 'Equal sign',
  icon: '⚖️',
  standards: ['1.NR.2.5', '1.NR.2.6'],
  prereqs: ['m1.add20', 'm1.sub20'],
  parentTip: 'Write “7 = 7”, “5 + 2 = 7” and “5 + 2 = 6 + 1” and ask which are true. The equal sign means “the same as”, not “the answer comes next”.',
  intro: [{ say: 'The equal sign means both sides are the same amount. 5 plus 2 equals 6 plus 1, because both sides make 7!', visual: eq('5 + 2 = 6 + 1') }],
  generate: equationGenerator('m1.equations', 1),
};

const missing2: Skill = {
  id: 'm2.missing',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Missing numbers and true equations within 100 (both sides of the equal sign)',
  kidTitle: 'Find the missing number',
  icon: '❓',
  standards: ['2.NR.2.4'],
  prereqs: ['m1.equations', 'm2.add2d', 'm2.sub2d'],
  parentTip: 'Play “mystery number”: “I added 27 to my number and got 63. What was my number?” Ask him to check by adding back.',
  intro: [{ say: 'What number goes with 27 to make 63? Count up from 27: 3 makes 30, 33 more makes 63. The missing number is 36!', visual: eq('27 + ? = 63') }],
  generate: equationGenerator('m2.missing', 2),
};

const ARRAY_THINGS: { emoji: string; many: string }[] = [
  { emoji: '🍪', many: 'cookies' }, { emoji: '🌷', many: 'tulips' }, { emoji: '🥕', many: 'carrots' }, { emoji: '⭐', many: 'stars' },
  { emoji: '🧁', many: 'cupcakes' }, { emoji: '🍎', many: 'apples' }, { emoji: '🚗', many: 'cars' }, { emoji: '🐞', many: 'ladybugs' },
];

const arrays: Skill = {
  id: 'm2.arrays',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Arrays and repeated addition; even numbers as two equal addends',
  kidTitle: 'Arrays and doubles',
  icon: '🧁',
  standards: ['2.NR.3.1', '2.NR.3.2'],
  prereqs: ['m2.groups', 'm2.oddeven'],
  parentTip: 'Arrange muffins or coins in rows. Ask him to write a repeated addition for the rows (4 + 4 + 4). For even numbers, split them into two equal piles: 14 = 7 + 7.',
  intro: [{ say: 'An array has equal rows. Three rows of four is four plus four plus four: twelve!', visual: { kind: 'grid', rows: 3, cols: 4, emoji: '🧁' } }],
  generate: (rng, d) => {
    const thing = rng.pick(ARRAY_THINGS);
    const rows = rng.int(2, d === 1 ? 4 : 5);
    const cols = rng.int(2, 5);
    const total = rows * cols;
    const visual: Visual = { kind: 'grid', rows, cols, emoji: thing.emoji };
    const rep = (times: number, k: number) => Array.from({ length: times }, () => String(k)).join(' + ');
    if (d === 1) {
      return makeItem('m2.arrays', `count${rows}x${cols}${thing.emoji}`, d, {
        say: `How many ${thing.many} are in this array?`,
        show: `How many ${thing.many}?`,
        visual,
        choices: numberChoices(rng, total, [
          { n: rows + cols, why: 'added_rows_and_columns' },
          { n: cols, why: 'counted_one_row' },
          { n: total + cols, why: 'extra_row' },
        ], { min: 1, max: 40 }),
        explain: `${rows} rows of ${cols}: ${Array.from({ length: rows }, (_, i) => (i + 1) * cols).join(', ')}. ${total} ${thing.many}.`,
      });
    }
    if (d === 2) {
      if (rng.next() < 0.5) {
        const choices = dedupe([
          t(rep(rows, cols), undefined, spokenEq(rep(rows, cols))),
          t(`${rows} + ${cols}`, 'added_rows_and_columns', `${rows} plus ${cols}`),
          t(rep(rows + 1, cols), 'extra_row', spokenEq(rep(rows + 1, cols))),
          t(rep(rows, cols - 1 || cols + 1), 'miscounted_row_length', spokenEq(rep(rows, cols - 1 || cols + 1))),
        ]);
        return makeItem('m2.arrays', `rowsum${rows}x${cols}${thing.emoji}`, d, {
          say: 'Which addition matches the rows of this array?',
          show: 'Add the rows',
          visual,
          choices,
          explain: `Each of the ${rows} rows has ${cols}. Add ${cols} ${rows} times: ${rep(rows, cols)} = ${total}.`,
        });
      }
      const wantEven = rng.next() < 0.5;
      const pool = new Set<number>();
      while (pool.size < 3) {
        const n = rng.int(5, 19);
        if ((n % 2 === 0) !== wantEven) pool.add(n);
      }
      let target = rng.int(4, 18);
      if ((target % 2 === 0) !== wantEven) target += 1;
      const word = wantEven ? 'an even' : 'an odd';
      const choices = [v({ kind: 'objects', emoji: thing.emoji, count: target }, undefined), ...[...pool].map((n) => v({ kind: 'objects', emoji: thing.emoji, count: n }, undefined, 'odd_even_confusion'))];
      return makeItem('m2.arrays', `evenpick${wantEven}${target}-${[...pool].join('-')}${thing.emoji}`, d, {
        say: `Which group has ${word} number of ${thing.many}?`,
        show: `Which group is ${wantEven ? 'even' : 'odd'}?`,
        choices,
        speakChoices: false,
        hint: 'Try to put them in pairs. Even groups have no one left over.',
        explain: `The group with ${target} ${thing.many} is ${wantEven ? 'even' : 'odd'}: ${wantEven ? `${target / 2} pairs and none left over` : `${(target - 1) / 2} pairs and 1 left over`}.`,
      });
    }
    if (rng.next() < 0.5) {
      const half = rng.int(3, 10);
      const n = half * 2;
      const off = rng.int(1, Math.min(3, half - 1));
      const choices = dedupe([
        t(`${half} + ${half}`, undefined, `${half} plus ${half}`),
        t(`${half - off} + ${half + off}`, 'equal_addends_not_used', `${half - off} plus ${half + off}`),
        t(`${n} + ${n}`, 'doubled_instead', `${n} plus ${n}`),
        t(`${half} + ${half + 1}`, 'odd_even_confusion', `${half} plus ${half + 1}`),
      ]);
      return makeItem('m2.arrays', `double${n}`, d, {
        say: `${n} is even. Which shows ${n} as two equal parts added together?`,
        show: `${n} = two equal parts`,
        visual: { kind: 'objects', emoji: thing.emoji, count: n },
        choices,
        explain: `Split ${n} into two equal groups: ${half} and ${half}. ${half} + ${half} = ${n}.`,
      });
    }
    const where = rng.pick(['garden', 'tray', 'box', 'parking lot', 'shelf']);
    return makeItem('m2.arrays', `story${rows}x${cols}${thing.emoji}${where}`, d, {
      say: `A ${where} has ${rows} rows of ${thing.many}. There are ${cols} ${thing.many} in each row. How many ${thing.many} in all?`,
      show: `${rows} rows, ${cols} in each row`,
      choices: numberChoices(rng, total, [
        { n: rows + cols, why: 'added_rows_and_columns' },
        { n: total - cols, why: 'missed_a_row' },
        { n: total + rows, why: 'near_miss' },
      ], { min: 1, max: 40 }),
      explain: `Add ${cols} for each row: ${rep(rows, cols)} = ${total}.`,
    });
  },
};

/** True when a numeric answer is also a number spoken in the prompt (a coincidence that gives it away). */
function leaks(item: Item): boolean {
  const text = item.choices.find((c) => c.correct)?.text ?? '';
  if (!/^\$?\d+(¢| \w+)?$/.test(text)) return false;
  return (item.say.match(/\d+/g) ?? []).map(Number).includes(Number(text.replace(/[^\d]/g, '')));
}
/** Retries a generator (same seeded stream, so still deterministic) until the prompt does not contain the answer. */
const guarded = (s: Skill): Skill => ({
  ...s,
  generate: (rng, d) => {
    for (let i = 0; i < 40; i++) {
      const item = s.generate!(rng, d);
      if (!leaks(item)) return item;
    }
    return s.generate!(rng, d);
  },
});

export const MATH_GRADE1_EXTRA: Skill[] = [count120, tensOnes, wordUnknown1, equations1, order3, clockMatch, pictureGraphs, sortShapes, solids, compose, equalParts].map(guarded);
export const MATH_GRADE2_EXTRA: Skill[] = [expanded, compareSign, tenMore100, missing2, wordUnknown2, arrays, ruler, unitChoice, lengthWord, elapsed, moneyWord, barGraphs, linePlot, polygons, fractions, gridSquares].map(guarded);
