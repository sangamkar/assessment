import type { Choice, ShapeKind, ShapeSpec, Skill, Visual } from './types';
import { items, makeItem, num, numberChoices, pic, vis } from './helpers';

/*
 * Puzzle Cave builds the reasoning skills behind gifted screeners
 * (classification, analogies, matrices, series, quantitative relations,
 * spatial thinking) using varied formats with explanations. It is a thinking
 * gym, not a CogAT/NNAT simulator — see docs/VISION.md §6.
 */

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const COLOR_NAMES: Record<string, string> = { '#ef4444': 'red', '#3b82f6': 'blue', '#10b981': 'green', '#f59e0b': 'yellow', '#8b5cf6': 'purple' };
const SHAPES: ShapeKind[] = ['circle', 'triangle', 'square', 'hexagon', 'pentagon'];
const sv = (s: ShapeSpec): Visual => ({ kind: 'shape', ...s });

const oddOne: Skill = {
  id: 'q.oddone',
  subject: 'reasoning',
  strand: 'figural',
  grade: 'K',
  title: 'Classification: which one does not belong?',
  kidTitle: 'Odd one out',
  icon: '🕵️',
  standards: ['reasoning:classification'],
  prereqs: [],
  parentTip: 'Play "Which one doesn’t belong?" with any 4 objects — and accept any answer he can justify. Explaining the rule is the real skill.',
  intro: [{ say: 'Three of these go together. One does not belong. Find the rule that the three share!', visual: { kind: 'shapeRow', shapes: [{ shape: 'circle', color: COLORS[0] }, { shape: 'circle', color: COLORS[1] }, { shape: 'square', color: COLORS[2] }, { shape: 'circle', color: COLORS[3] }] } }],
  generate: (rng, d) => {
    const byShape = d === 1 ? true : d === 2 ? false : rng.next() < 0.5;
    const [common, odd] = rng.shuffle(byShape ? SHAPES : COLORS).slice(0, 2);
        const others = rng.shuffle(byShape ? COLORS : SHAPES).slice(0, 4);
    // Level 3 adds size/turn noise, always split 2–2 so noise never singles one out.
    const scales = rng.shuffle([0.6, 0.6, 1, 1]);
    const turns = rng.shuffle([0, 0, 30, 30]);
    const make = (key: string, i: number): ShapeSpec => {
      const other = others[i];
      const spec: ShapeSpec = byShape ? { shape: key as ShapeKind, color: other as string } : { shape: other as ShapeKind, color: key };
      if (d === 3) {
        spec.scale = scales[i];
        spec.rotate = turns[i];
      }
      return spec;
    };
    const oddIndex = rng.int(0, 3);
    const specs = [0, 1, 2, 3].map((i) => make(i === oddIndex ? odd : common, i));
    const rule = byShape ? `they are all ${common}s` : `they are all ${COLOR_NAMES[common]}`;
    return makeItem('q.oddone', `${byShape ? 's' : 'c'}${common}${odd}${oddIndex}${d}`, d, {
      say: 'Three of these go together. Which one does NOT belong?',
      show: 'Which one does NOT belong?',
      choices: specs.map((s, i) =>
        i === oddIndex ? { visual: sv(s), correct: true as const } : { visual: sv(s), why: 'distracted_by_irrelevant_attribute' },
      ),
      keepOrder: true,
      speakChoices: false,
      explain: `Three go together because ${rule}. The odd one out is different.${d > 1 ? ' The other differences do not matter here.' : ''}`,
    });
  },
  items: items('q.oddone', [
    { difficulty: 2, say: 'Which one does NOT belong? Apple, banana, carrot, grapes.', show: 'Which does NOT belong?', choices: [pic('🍎', 'apple', 'rule_not_found'), pic('🍌', 'banana', 'rule_not_found'), pic('🥕', 'carrot'), pic('🍇', 'grapes', 'rule_not_found')], keepOrder: true, explain: 'Apple, banana and grapes are fruits. A carrot is a vegetable.' },
    { difficulty: 2, say: 'Which one does NOT belong? Cow, pig, lion, chicken.', show: 'Which does NOT belong?', choices: [pic('🐄', 'cow', 'rule_not_found'), pic('🐖', 'pig', 'rule_not_found'), pic('🐔', 'chicken', 'distracted_by_irrelevant_attribute'), pic('🦁', 'lion')], keepOrder: true, explain: 'A cow, pig and chicken live on a farm. A lion is a wild animal. (The chicken is a bird, but it still lives on the farm!)' },
    { difficulty: 3, say: 'Which one does NOT belong? Fish, dolphin, octopus, eagle.', show: 'Which does NOT belong?', choices: [pic('🐟', 'fish', 'distracted_by_irrelevant_attribute'), pic('🐬', 'dolphin', 'distracted_by_irrelevant_attribute'), pic('🐙', 'octopus', 'distracted_by_irrelevant_attribute'), pic('🦅', 'eagle')], keepOrder: true, explain: 'Fish, dolphins and octopuses live in water. An eagle lives in the sky and trees.' },
    { difficulty: 3, say: 'Which one does NOT belong? Pencil, crayon, scissors, marker.', show: 'Which does NOT belong?', choices: [pic('✏️', 'pencil', 'rule_not_found'), pic('🖍️', 'crayon', 'rule_not_found'), pic('✂️', 'scissors'), pic('🖊️', 'pen', 'rule_not_found')], keepOrder: true, explain: 'Pencils, crayons and pens are for drawing and writing. Scissors are for cutting.' },
  ]),
};

const analogy: Skill = {
  id: 'q.analogy',
  subject: 'reasoning',
  strand: 'verbal',
  grade: 'K',
  title: 'Picture analogies (A is to B as C is to ?)',
  kidTitle: 'Goes together',
  icon: '🔗',
  standards: ['reasoning:analogy'],
  prereqs: ['q.oddone'],
  parentTip: 'Make silly analogies at dinner: "Bird is to nest as bee is to…?" Always ask: what is the connection?',
  intro: [{ say: 'Dog goes with bone because a dog eats a bone. Find the SAME kind of connection for the next pair!', visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🐶' }, { kind: 'emoji', emoji: '🦴' }, { kind: 'emoji', emoji: '🐰' }, { kind: 'emoji', emoji: '🥕' }] } }],
  items: items('q.analogy', [
    {
      difficulty: 1,
      say: 'A dog goes with a bone. A rabbit goes with what?',
      show: 'Dog → bone. Rabbit → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🐶' }, { kind: 'emoji', emoji: '🦴' }, { kind: 'emoji', emoji: '🐰' }, null] },
      choices: [pic('🐇', 'another rabbit', 'association_not_relation'), pic('🥕', 'carrot'), pic('🦴', 'bone', 'copied_first_pair'), pic('🏠', 'house', 'association_not_relation')],
      explain: 'A dog eats a bone. A rabbit eats a carrot. Same connection: what the animal eats.',
    },
    {
      difficulty: 2,
      say: 'A glove goes on a hand. A sock goes on what?',
      show: 'Glove → hand. Sock → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🧤' }, { kind: 'emoji', emoji: '✋' }, { kind: 'emoji', emoji: '🧦' }, null] },
      choices: [pic('👟', 'shoe', 'association_not_relation'), pic('✋', 'hand', 'copied_first_pair'), pic('🦶', 'foot'), pic('👖', 'pants', 'association_not_relation')],
      explain: 'A glove covers a hand. A sock covers a foot. A shoe goes with a sock, but it is not a body part!',
    },
    {
      difficulty: 2,
      say: 'A cow gives us milk. A chicken gives us what?',
      show: 'Cow → milk. Chicken → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🐄' }, { kind: 'emoji', emoji: '🥛' }, { kind: 'emoji', emoji: '🐔' }, null] },
      choices: [pic('🥚', 'egg'), pic('🐣', 'chick', 'association_not_relation'), pic('🥛', 'milk', 'copied_first_pair'), pic('🌽', 'corn', 'association_not_relation')],
      explain: 'A cow gives us milk. A chicken gives us eggs. Same connection: food the animal gives us.',
    },
    {
      difficulty: 3,
      say: 'A small circle goes with a big circle. A small triangle goes with what?',
      show: 'Small → big',
      visual: { kind: 'matrix', cols: 2, cells: [sv({ shape: 'circle', color: COLORS[1], scale: 0.5 }), sv({ shape: 'circle', color: COLORS[1], scale: 1 }), sv({ shape: 'triangle', color: COLORS[0], scale: 0.5 }), null] },
      choices: [
        vis(sv({ shape: 'triangle', color: COLORS[0], scale: 0.5 }), undefined, 'copied_c_term'),
        vis(sv({ shape: 'triangle', color: COLORS[0], scale: 1 }), undefined),
        vis(sv({ shape: 'circle', color: COLORS[0], scale: 1 }), undefined, 'copied_first_pair'),
        vis(sv({ shape: 'triangle', color: COLORS[1], scale: 1 }), undefined, 'changed_wrong_attribute'),
      ],
      speakChoices: false,
      explain: 'Small circle became a BIG circle with the same color. So the small red triangle becomes a big red triangle.',
    },
    {
      difficulty: 3,
      say: 'When it rains you use an umbrella. When it is very sunny, you use what?',
      show: 'Rain → umbrella. Sunny → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🌧️' }, { kind: 'emoji', emoji: '☂️' }, { kind: 'emoji', emoji: '☀️' }, null] },
      choices: [pic('⛄', 'snowman', 'opposite_not_relation'), pic('😎', 'sunglasses'), pic('☂️', 'umbrella', 'copied_first_pair'), pic('🌈', 'rainbow', 'association_not_relation')],
      explain: 'An umbrella protects you from rain. Sunglasses protect your eyes from bright sun.',
    },
    {
      difficulty: 1,
      say: 'A car goes on a road. A boat goes on what?',
      show: 'Car → road. Boat → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🚗' }, { kind: 'emoji', emoji: '🛣️' }, { kind: 'emoji', emoji: '⛵' }, null] },
      choices: [pic('🛣️', 'road', 'copied_first_pair'), pic('🌊', 'water'), pic('⚓', 'anchor', 'association_not_relation'), pic('✈️', 'airplane', 'association_not_relation')],
      explain: 'A car moves along a road. A boat moves along the water. Same connection: where it travels.',
    },
    {
      difficulty: 1,
      say: 'We clean our teeth with a toothbrush. We clean our hands with what?',
      show: 'Teeth → toothbrush. Hands → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🦷' }, { kind: 'emoji', emoji: '🪥' }, { kind: 'emoji', emoji: '🙌' }, null] },
      choices: [pic('🪥', 'toothbrush', 'copied_first_pair'), pic('🧤', 'gloves', 'association_not_relation'), pic('🧼', 'soap'), pic('🍎', 'apple', 'association_not_relation')],
      explain: 'A toothbrush cleans teeth. Soap cleans hands. Gloves go on hands, but they do not clean them!',
    },
    {
      difficulty: 2,
      say: 'A seed grows into a flower. An egg grows into what?',
      show: 'Seed → flower. Egg → ?',
      visual: { kind: 'matrix', cols: 2, cells: [{ kind: 'emoji', emoji: '🌱' }, { kind: 'emoji', emoji: '🌻' }, { kind: 'emoji', emoji: '🥚' }, null] },
      choices: [pic('🌻', 'flower', 'copied_first_pair'), pic('🍳', 'fried egg', 'association_not_relation'), pic('🐣', 'chick'), pic('🧺', 'basket', 'association_not_relation')],
      explain: 'A little seed grows into a flower. A little egg hatches and grows into a chick. Same connection: what it grows into.',
    },
    {
      difficulty: 2,
      say: 'A red circle goes with a blue circle. A red square goes with what?',
      show: 'Red circle → blue circle. Red square → ?',
      visual: { kind: 'matrix', cols: 2, cells: [sv({ shape: 'circle', color: COLORS[0] }), sv({ shape: 'circle', color: COLORS[1] }), sv({ shape: 'square', color: COLORS[0] }), null] },
      choices: [
        vis(sv({ shape: 'square', color: COLORS[0] }), undefined, 'copied_c_term'),
        vis(sv({ shape: 'circle', color: COLORS[1] }), undefined, 'copied_first_pair'),
        vis(sv({ shape: 'square', color: COLORS[1] }), undefined),
        vis(sv({ shape: 'square', color: COLORS[2] }), undefined, 'changed_wrong_attribute'),
      ],
      speakChoices: false,
      explain: 'The circle stayed a circle but changed from red to blue. So the red square stays a square and changes to blue.',
    },
    {
      difficulty: 3,
      say: 'A flat square goes with a solid cube. A flat circle goes with what?',
      show: 'Square → cube. Circle → ?',
      visual: { kind: 'matrix', cols: 2, cells: [sv({ shape: 'square', color: COLORS[3] }), sv({ shape: 'cube', color: COLORS[3] }), sv({ shape: 'circle', color: COLORS[1] }), null] },
      choices: [
        vis(sv({ shape: 'circle', color: COLORS[1] }), undefined, 'copied_c_term'),
        vis(sv({ shape: 'cube', color: COLORS[1] }), undefined, 'copied_first_pair'),
        vis(sv({ shape: 'sphere', color: COLORS[1] }), undefined),
        vis(sv({ shape: 'rect-prism', color: COLORS[1] }), undefined, 'solid_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A cube is like a square made solid: every side you look at is a square. A sphere is like a circle made solid: from every side it looks like a circle.',
    },
  ]),
};

const matrix: Skill = {
  id: 'q.matrix',
  subject: 'reasoning',
  strand: 'figural',
  grade: 'K',
  title: 'Figure matrices (rows and columns follow rules)',
  kidTitle: 'Picture grid',
  icon: '🔲',
  standards: ['reasoning:matrices'],
  prereqs: ['q.oddone'],
  parentTip: 'Make a 2×2 grid with toys (big/small × red/blue) and remove one. Ask him to say BOTH rules before choosing.',
  intro: [{ say: 'In a picture grid, each row follows a rule and each column follows a rule. Look across, then look down!' }],
  generate: (rng, d) => {
    const n = d === 3 ? 3 : 2;
    const shapes = rng.shuffle(SHAPES).slice(0, n + 1);
    const colors = rng.shuffle(COLORS).slice(0, n + 1);
    const scaled = d === 2;
    const cell = (r: number, c: number): Visual => sv({ shape: shapes[r], color: colors[c], scale: scaled && c === 1 ? 0.55 : 1 });
    const last = n - 1;
    const cells: (Visual | null)[] = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push(r === last && c === last ? null : cell(r, c));
    const answer = cell(last, last);
    const choices = [
      { visual: answer, correct: true as const },
      { visual: cell(last - 1, last), why: 'copied_cell_above' },
      { visual: cell(last, last - 1), why: 'copied_cell_left' },
      { visual: sv({ shape: shapes[n], color: colors[last], scale: scaled ? 0.55 : 1 }), why: 'partial_rule' },
    ];
    return makeItem('q.matrix', `${n}-${shapes.join('')}-${colors.join('')}`, d, {
      say: 'Which picture goes in the empty box?',
      show: 'What goes in the empty box?',
      visual: { kind: 'matrix', cols: n as 2 | 3, cells },
      choices,
      speakChoices: false,
      hint: 'Look across the bottom row. Then look down the last column.',
      explain: `Across each row the shape stays the same. Down each column the color${scaled ? ' and size stay' : ' stays'} the same. So the empty box is a ${COLOR_NAMES[colors[last]]} ${shapes[last]}${scaled ? ' that is small' : ''}.`,
    });
  },
};

const series: Skill = {
  id: 'q.series',
  subject: 'reasoning',
  strand: 'figural',
  grade: 'K',
  title: 'Series: what comes next? (turning, growing, number rules)',
  kidTitle: 'What comes next?',
  icon: '🔄',
  standards: ['reasoning:series'],
  prereqs: ['m.pattern'],
  parentTip: 'Turn a toy a quarter-turn each step and ask him to predict the next position before you move it.',
  intro: [{ say: 'Look at how each picture changes. Does it turn? Does it grow? Do the same change one more time!' }],
  generate: (rng, d) => {
    if (d === 1) {
      const start = rng.int(1, 3);
      const e = rng.pick(['⭐', '🔴', '🍎']);
      const seq = [0, 1, 2].map((i) => start + i);
      const ans = start + 3;
      return makeItem('q.series', `grow${start}${e}`, d, {
        say: 'What comes next?',
        show: 'What comes next?',
        visual: { kind: 'row', items: [...seq.map((n) => ({ kind: 'objects', emoji: e, count: n, arrange: 'dice' }) as Visual), { kind: 'emoji', emoji: '❓' }], sep: '→' },
        choices: numberChoices(rng, ans, [{ n: ans - 1, why: 'repeated_previous' }, { n: ans + 1, why: 'skipped_a_step' }], {
          min: 1,
          max: 9,
          size: 3,
          visual: (n) => ({ kind: 'objects', emoji: e, count: n, arrange: 'dice' }),
        }),
        speakChoices: false,
        explain: `Each picture has one more: ${seq.join(', ')}. Next is ${ans}.`,
      });
    }
    if (d === 2) {
      const step = rng.pick([90, 45]);
      const start = rng.pick([0, 90]);
      const color = rng.pick(COLORS);
      const at = (k: number) => sv({ shape: 'right-triangle', color, rotate: start + k * step, scale: 0.8 });
      return makeItem('q.series', `rot${start}-${step}`, d, {
        say: 'The shape is turning. What comes next?',
        show: 'What comes next?',
        visual: { kind: 'row', items: [at(0), at(1), at(2), { kind: 'emoji', emoji: '❓' }], sep: '→' },
        choices: [
          { visual: at(3), correct: true as const },
          { visual: at(2), why: 'repeated_previous' },
          { visual: at(1), why: 'reversed_direction' },
          { visual: sv({ shape: 'right-triangle', color, rotate: start + 3 * step, scale: 0.8, flip: true }), why: 'mirror_vs_turn' },
        ],
        speakChoices: false,
        explain: 'Each time, the shape turns the same amount in the same direction. Turn it one more time.',
      });
    }
    const a = rng.int(1, 4);
    const steps = rng.pick([[1, 2], [2, 1], [1, 3]]);
    const seq = [a];
    for (let i = 0; i < 4; i++) seq.push(seq[i] + steps[i % 2]);
    const ans = seq[4];
    return makeItem('q.series', `alt${a}-${steps.join('')}`, d, {
      say: `${seq.slice(0, 4).join(', ')}. What number comes next?`,
      show: 'What comes next?',
      visual: { kind: 'sequence', items: seq.map(String), blank: 4 },
      choices: numberChoices(rng, ans, [
        { n: seq[3] + steps[0], why: 'single_step_rule' },
        { n: seq[3] + 1, why: 'counting_not_rule' },
        { n: ans + 1, why: 'near_miss' },
      ], { min: 0, max: 30 }),
      explain: `The jumps take turns: plus ${steps[0]}, plus ${steps[1]}, plus ${steps[0]}, plus ${steps[1]}. Next is plus ${steps[1]}: ${seq[3]} plus ${steps[1]} is ${ans}.`,
    });
  },
};

// Abstract blocks, so "1 apple = 3 watermelons" style nonsense can never appear.
const BLOCKS = [
  { e: '🟦', n: 'blue blocks', one: 'blue block' },
  { e: '🟨', n: 'yellow blocks', one: 'yellow block' },
  { e: '🟩', n: 'green blocks', one: 'green block' },
  { e: '🟥', n: 'red blocks', one: 'red block' },
];

const balance: Skill = {
  id: 'q.balance',
  subject: 'reasoning',
  strand: 'quantitative',
  grade: 'K',
  title: 'Quantitative reasoning with balances (equal, trade)',
  kidTitle: 'Balance puzzles',
  icon: '⚖️',
  standards: ['reasoning:quantitative', 'K.NR.5'],
  prereqs: ['m.add', 'm.measure'],
  parentTip: 'Use a coat hanger with two cups as a balance. Find how many pennies balance one marker, then two markers.',
  intro: [{ say: 'When a balance is level, both sides weigh the same. If one banana balances two apples, then two bananas balance four apples!', visual: { kind: 'balance', left: '🍌', right: '🍎', tilt: 'level', leftCount: 1, rightCount: 2 } }],
  generate: (rng, d) => {
    if (d === 1) {
      const left = rng.int(3, 6);
      const right = rng.int(1, left - 1);
      const need = left - right;
      return makeItem('q.balance', `fill${left}-${right}`, d, {
        say: `The left side has ${left} apples. The right side has ${right}. How many more apples go on the right to make it level?`,
        show: 'How many more to make it level?',
        visual: { kind: 'balance', left: '🍎', right: '🍎', tilt: 'left', leftCount: left, rightCount: right },
        choices: numberChoices(rng, need, [{ n: left, why: 'gave_whole' }, { n: left + right, why: 'added_instead' }, { n: need + 1, why: 'near_miss' }], { min: 0, max: 12 }),
        explain: `Level means the same on both sides. ${right} and ${need} more make ${left}.`,
      });
    }
    const [a, b, c] = rng.shuffle(BLOCKS);
    const r = rng.pick([2, 3]);
    if (d === 2) {
      const k = rng.pick([2, 3]);
      return makeItem('q.balance', `trade${r}-${k}`, d, {
        say: `One ${a.one} balances ${r} ${b.n}. How many ${b.n} balance ${k} ${a.n}?`,
        show: `1 ${a.e} = ${r} ${b.e}. ${k} ${a.e} = ? ${b.e}`,
        visual: { kind: 'balance', left: a.e, right: b.e, tilt: 'level', leftCount: 1, rightCount: r },
        choices: numberChoices(rng, r * k, [{ n: r, why: 'ignored_multiple' }, { n: r + k, why: 'added_instead_of_grouped' }, { n: r * k + 1, why: 'near_miss' }], { min: 1, max: 15 }),
        explain: `Each ${a.one} is worth ${r} ${b.n}. For ${k} of them: ${Array.from({ length: k }, () => r).join(' plus ')} is ${r * k}.`,
      });
    }
    const s = rng.pick([2, 3]);
    return makeItem('q.balance', `chain${r}-${s}`, d, {
      say: `One ${a.one} balances ${r} ${b.n}. One ${b.one} balances ${s} ${c.n}. How many ${c.n} balance one ${a.one}?`,
      show: `1 ${a.e} = ${r} ${b.e}, 1 ${b.e} = ${s} ${c.e}. 1 ${a.e} = ? ${c.e}`,
      visual: {
        kind: 'row',
        items: [
          { kind: 'balance', left: a.e, right: b.e, tilt: 'level', leftCount: 1, rightCount: r },
          { kind: 'balance', left: b.e, right: c.e, tilt: 'level', leftCount: 1, rightCount: s },
        ],
      },
      choices: numberChoices(rng, r * s, [{ n: r + s, why: 'added_instead_of_grouped' }, { n: s, why: 'ignored_multiple' }, { n: r, why: 'ignored_multiple' }], { min: 1, max: 12 }),
      explain: `One ${a.one} is ${r} ${b.n}. Each of those is ${s} ${c.n}. ${Array.from({ length: r }, () => s).join(' plus ')} is ${r * s}.`,
    });
  },
};

const spatial: Skill = {
  id: 'q.spatial',
  subject: 'reasoning',
  strand: 'figural',
  grade: 'K',
  title: 'Spatial reasoning: same shape turned vs. flipped',
  kidTitle: 'Turn it around',
  icon: '🧭',
  standards: ['reasoning:spatial', 'K.GSR.8'],
  prereqs: ['m.shapes2d'],
  parentTip: 'Tangrams and pattern-block puzzles are excellent. Ask "Do you need to turn it or flip it?"',
  intro: [{ say: 'A shape can turn around and still be the same shape. But a flipped shape is like a mirror — it can look different!' }],
  generate: (rng, d) => {
    const color = rng.pick(COLORS);
    const base = rng.pick([0, 90, 180, 270]);
    const turn = (deg: number, flip = false) => sv({ shape: 'right-triangle', color, rotate: (base + deg) % 360, flip, scale: 0.8 });
    const choices: Omit<Choice, 'id'>[] = [
      { visual: turn(rng.pick(d === 1 ? [180] : [90, 270])), correct: true },
      { visual: turn(0, true), why: 'mirror_vs_turn' },
      { visual: turn(rng.pick([90, 180]), true), why: 'mirror_vs_turn' },
    ];
    if (d === 3) choices.push({ visual: sv({ shape: 'triangle', color, rotate: base, scale: 0.8 }), why: 'shape_changed' });
    return makeItem('q.spatial', `${base}-${d}-${color}`, d, {
      say: 'Which one is the same shape, just turned? Not flipped!',
      show: 'Same shape, just turned',
      visual: turn(0),
      choices,
      speakChoices: false,
      hint: 'Imagine turning it with your finger. Can you make it match without lifting it off the table?',
      explain: 'If you slide and turn the shape on the table, you get the matching one. The others are flipped over like a mirror.',
    });
  },
};

const olympiad: Skill = {
  id: 'q.olympiad',
  subject: 'reasoning',
  strand: 'quantitative',
  grade: 'K',
  title: 'Brain teasers (Math Kangaroo-style word puzzles)',
  kidTitle: 'Brain teasers',
  icon: '🦘',
  standards: ['reasoning:problem-solving'],
  prereqs: ['m.add', 'm.sub'],
  parentTip: 'Solve one puzzle a day together. Ask him to draw it or act it out with toys — that is the strategy olympiad kids use.',
  intro: [{ say: 'Brain teasers are tricky! Listen to every word. Draw it or act it out in your head before you choose.' }],
  items: items('q.olympiad', [
    { difficulty: 1, say: 'Two ducks are swimming. Each duck has 2 legs. How many legs in all?', show: '2 ducks. How many legs?', visual: { kind: 'objects', emoji: '🦆', count: 2, arrange: 'line' }, choices: [num(2, 'counted_animals_not_legs'), num(4), num(6, 'near_miss')], explain: 'Each duck has 2 legs. 2 plus 2 is 4 legs.' },
    { difficulty: 2, say: 'Tom is taller than Ann. Ann is taller than Ben. Who is the shortest?', show: 'Who is the shortest?', choices: [pic('👦', 'Tom', 'relation_reversed'), pic('👧', 'Ann', 'middle_term'), pic('🧒', 'Ben')], explain: 'Tom is taller than Ann, and Ann is taller than Ben. So Ben is the shortest.' },
    { difficulty: 2, say: 'I am a number. I am more than 5 and less than 7. What number am I?', show: 'More than 5, less than 7', choices: [num(5, 'boundary_included'), num(6), num(7, 'boundary_included'), num(8, 'near_miss')], explain: 'Count: 5, 6, 7. The number between 5 and 7 is 6.' },
    { difficulty: 2, say: 'Sam is fifth in line. How many children are in front of him?', show: 'Sam is 5th in line', visual: { kind: 'objects', emoji: '🧒', count: 5, arrange: 'line' }, choices: [num(5, 'ordinal_off_by_one'), num(4), num(6, 'near_miss')], explain: 'If Sam is fifth, there are 4 children before him: first, second, third, fourth.' },
    { difficulty: 3, say: 'There are 5 birds on a wire. 2 fly away. Then 1 comes back. How many birds are on the wire now?', show: '5 birds, 2 fly away, 1 comes back', visual: { kind: 'objects', emoji: '🐦', count: 5, arrange: 'line' }, choices: [num(3, 'ignored_second_step'), num(4), num(2, 'subtracted_both'), num(8, 'added_all')], explain: '5 take away 2 is 3. Then 1 comes back: 3 plus 1 is 4.' },
    { difficulty: 3, say: 'A pizza is cut into 4 slices. Three friends each eat 1 slice. How many slices are left?', show: '4 slices, 3 friends eat 1 each', visual: { kind: 'shape', shape: 'circle-fourths', color: '#f59e0b' }, choices: [num(1), num(3, 'answered_part_taken'), num(0, 'near_miss'), num(7, 'added_instead')], explain: '4 slices take away 3 slices leaves 1 slice.' },
    { difficulty: 3, say: 'How many triangles can you find? Count the big one too!', show: 'How many triangles?', visual: { kind: 'composite', preset: 'triangle-split' }, choices: [num(2, 'missed_overlapping_figure'), num(3), num(4, 'overcounted_figures')], explain: 'There are 2 small triangles. Together they make 1 big triangle. 2 plus 1 is 3 triangles.' },
    { difficulty: 1, say: 'Mia has 3 balloons. Leo has 1 more balloon than Mia. How many balloons does Leo have?', show: 'Mia has 3. Leo has 1 more.', visual: { kind: 'objects', emoji: '🎈', count: 3, arrange: 'line' }, choices: [num(2, 'relation_reversed'), num(3, 'ignored_constraint'), num(4)], explain: 'Leo has the same as Mia and 1 more. 3 and 1 more is 4 balloons.' },
    { difficulty: 1, say: 'Three children stand in a line. Ana is in the middle. How many children are standing right next to Ana?', show: 'Ana is in the middle of 3', visual: { kind: 'objects', emoji: '🧒', count: 3, arrange: 'line' }, choices: [num(1, 'missed_other_side'), num(2), num(3, 'counted_self')], explain: 'The middle child has one child on each side. 1 plus 1 is 2 children next to Ana. Ana does not count herself!' },
    { difficulty: 2, say: 'A frog starts at zero. Each jump goes 2 steps forward. The frog jumps 3 times. What number does it land on?', show: 'Start at 0. Jump 2 steps, 3 times.', visual: { kind: 'sequence', items: ['0', '1', '2', '3', '4', '5', '6', '7', '8'], blank: -1 }, choices: [num(2, 'no_iteration'), num(3, 'counted_jumps_not_steps'), num(5, 'near_miss'), num(6)], explain: 'Jump 1 lands on 2. Jump 2 lands on 4. Jump 3 lands on 6.' },
  ]),
};

export const REASONING_SKILLS: Skill[] = [oddOne, analogy, matrix, series, balance, spatial, olympiad];

