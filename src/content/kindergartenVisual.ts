import type { Difficulty, Rng, Skill, ShapeKind, Visual } from './types';
import { makeItem, numberChoices, pic, txt, vis } from './helpers';

const base = (id: string, strand: 'number' | 'algebra' | 'measure' | 'geometry', title: string, kidTitle: string, say: string, visual: Visual): Omit<Skill, 'generate'> => ({
  id, subject: 'math', strand, grade: 'K', title, kidTitle, icon: '🧩', standards: [`IXL Skill Plan: ${strand === 'algebra' ? 'Algebra and Algebraic Thinking' : strand === 'geometry' ? 'Geometry' : 'Measurement and Data'}`], prereqs: [], parentTip: 'Ask your child to explain what they notice.', intro: [{ say, visual }],
});
const colors = [{ name: 'red', hex: '#ef4444' }, { name: 'blue', hex: '#2563eb' }, { name: 'green', hex: '#16a34a' }] as const;
const shapes: ShapeKind[] = ['circle', 'square', 'triangle'];
const shape = (s: ShapeKind, color: string): Visual => ({ kind: 'shape', shape: s, color });
const width: Skill = { ...base('m.width', 'measure', 'Compare wide and narrow objects', 'Wide or narrow?', 'Wide means more room from side to side.', { kind: 'ribbon', width: 70, color: '#ef4444' }), generate: (rng, d) => {
  const narrow = rng.int(12, 26); const widths = [narrow, narrow + 20, narrow + 50]; const wide = rng.pick([true, false]); const target = wide ? widths[2] : widths[0];
  return makeItem('m.width', `${widths.join('-')}-${wide}`, d, { say: `These ribbons are the same height. Which ribbon is ${wide ? 'widest' : 'narrowest'} from side to side?`, show: `Which is ${wide ? 'widest' : 'narrowest'}?`, choices: widths.map((w) => vis({ kind: 'ribbon', width: w, color: '#3b82f6' }, undefined, w === target ? undefined : 'width_confusion')), speakChoices: false, explain: `${wide ? 'Wide' : 'Narrow'} tells how much room there is from side to side. Compare the ribbons across.` });
} };
const capacity: Skill = { ...base('m.capacity', 'measure', 'Compare capacity with equal cube models', 'Which holds more?', 'These boxes are filled with same-size cubes. Count the cubes that fit.', { kind: 'capacityBox', cubes: 3 }), generate: (rng, d) => {
  const columns = rng.pick([1, 2] as const); const sizes = columns === 2 ? [2, 4, 6] : rng.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b); const more = rng.pick([true, false]); const answer = more ? sizes[2] : sizes[0];
  return makeItem('m.capacity', `${columns}-${sizes.join('-')}-${more}`, d, { say: `Each box is full of cubes that are all the same size. Which box holds the ${more ? 'most' : 'fewest'} cubes?`, show: `Which holds the ${more ? 'most' : 'fewest'} cubes?`, choices: sizes.map((cubes) => vis({ kind: 'capacityBox', cubes, columns }, undefined, cubes === answer ? undefined : 'capacity_confusion')), speakChoices: false, explain: `The ${more ? 'most' : 'fewest'} is ${answer} cubes. Count the same-size cubes in each full box.` });
} };
const compare: Skill = { ...base('m.same-different', 'measure', 'Identify same and different attributes', 'Same and different', 'Shapes can match in color, shape, both, or neither.', { kind: 'shapeRow', shapes: [{ shape: 'circle', color: '#ef4444' }, { shape: 'circle', color: '#ef4444' }] }), generate: (rng, d) => {
  const a = rng.int(0, 2), b = rng.int(0, 2), kind = rng.int(0, 3);
  const secondShape = kind === 0 || kind === 1 ? a : (a + 1) % 3; const secondColor = kind === 0 || kind === 2 ? b : (b + 1) % 3;
  const answers = ['Same color and shape', 'Same shape only', 'Same color only', 'Different color and shape'];
  return makeItem('m.same-different', `${a}-${b}-${kind}`, d, { say: 'Look at both shapes. How are their color and shape alike or different?', show: 'How do they match?', visual: { kind: 'shapeRow', shapes: [{ shape: shapes[a], color: colors[b].hex }, { shape: shapes[secondShape], color: colors[secondColor].hex }] }, choices: answers.map((x, i) => txt(x, i === kind ? undefined : 'attribute_confusion')), explain: `${answers[kind]}. Look at the color and then the shape.` });
} };
const sorter = (by: 'color' | 'shape'): Skill => {
  const id = `m.sort-${by}`;
  return { ...base(id, 'measure', `Sort shapes by ${by}`, `Sort by ${by}`, `Look at ${by} to sort shapes.`, shape('circle', colors[0].hex)), generate: (rng, d) => {
    const s = rng.int(0, 2), c = rng.int(0, 2); const another = (s+1)%3, third = (s+2)%3, next = (c+1)%3, last = (c+2)%3;
    const options = by === 'color' ? [[another,c],[s,next],[third,last]] : [[s,next],[another,c],[third,last]];
    return makeItem(id, `${s}-${c}`, d, { say: `Find the shape with the same ${by} as this one.`, show: `Same ${by}`, visual: shape(shapes[s], colors[c].hex), choices: options.map(([ss, cc], i) => vis(shape(shapes[ss], colors[cc].hex), undefined, i === 0 ? undefined : 'attribute_confusion')), speakChoices: false, explain: by === 'color' ? `The matching shape is ${colors[c].name}. Its shape can be different.` : `Both matching shapes are ${shapes[s]}s. Their colors can be different.` });
  } };
};
const vennShapes = ['circle', 'square', 'triangle'] as const;
const vennContext = (rng: Rng) => {
  const c = rng.int(0, 2), s = rng.int(0, 2);
  return { colorName: colors[c].name, color: colors[c].hex, otherColor: colors[(c + 1) % 3].hex, otherColorName: colors[(c + 1) % 3].name, targetShape: vennShapes[s], otherShape: vennShapes[(s + 1) % 3] };
};
const vennCount: Skill = { ...base('m.venn-count', 'measure', 'Count shapes in Venn diagrams', 'Count in circles', 'A shape in the overlap belongs to both groups.', { kind: 'venn', redOnly: 1, both: 1, circleOnly: 1, neither: 1 }), generate: (rng, d) => {
  const context = vennContext(rng); const redOnly = rng.int(1, 2), both = rng.int(1, 2), circleOnly = rng.int(1, 2), neither = rng.int(0, 1), colorGroup = rng.pick([true, false]); const count = (colorGroup ? redOnly : circleOnly) + both;
  const group = colorGroup ? `${context.colorName} shapes` : `${context.targetShape}s`;
  return makeItem('m.venn-count', `${context.colorName}-${context.targetShape}-${redOnly}-${both}-${circleOnly}-${neither}-${colorGroup}`, d, { say: `Count all the ${group} in the diagram. Remember the shapes in both groups. How many are there?`, show: `How many ${group}?`, visual: { kind: 'venn', ...context, redOnly, both, circleOnly, neither }, choices: numberChoices(rng, count, [{n: count - both, why: 'missed_overlap'}, {n: count + 1, why: 'count_double_tap'}], { min: 0, max: 8 }), explain: `Count the ${group} in their circle, including the overlap. There are ${count}.` });
} };
const vennSort: Skill = { ...base('m.venn-sort', 'measure', 'Sort shapes into a Venn diagram', 'Sort into circles', 'The overlap is for shapes that belong to both groups.', { kind: 'venn', redOnly: 1, both: 1, circleOnly: 1, neither: 1 }), generate: (rng, d) => {
  const context = vennContext(rng); const choices = [`${context.colorName} shapes only`, 'Both groups', `${context.targetShape}s only`, 'Outside both']; const names = [`${context.colorName} ${context.otherShape}`, `${context.colorName} ${context.targetShape}`, `${context.otherColorName} ${context.targetShape}`, `${context.otherColorName} ${context.otherShape}`]; const answer = rng.int(0, 3);
  return makeItem('m.venn-sort', `${context.colorName}-${context.targetShape}-${answer}`, d, { say: `Where would a ${names[answer]} go in this diagram?`, show: `Where does the ${names[answer]} go?`, visual: { kind: 'venn', ...context, redOnly: 0, both: 0, circleOnly: 0, neither: 0 }, choices: choices.map((x, i) => txt(x, i === answer ? undefined : 'venn_region_confusion')), explain: `A ${names[answer]} belongs in ${choices[answer].toLowerCase()}.`, hint: `Check whether the shape is ${context.colorName} and whether it is a ${context.targetShape}.` });
} };
const grid: Skill = { ...base('m.grid-location', 'geometry', 'Locate objects in grids', 'Find it on the grid', 'A grid has rows and columns. Look across and then down.', { kind: 'map', rows: 3, cols: 3, cells: [{ r: 0, c: 0, emoji: '🐟' }] }), generate: (rng, d) => {
  const all = [{ emoji: '🐟', name: 'fish' }, { emoji: '🐱', name: 'cat' }, { emoji: '🐸', name: 'frog' }, { emoji: '🚗', name: 'car' }, { emoji: '⭐', name: 'star' }, { emoji: '🍎', name: 'apple' }, { emoji: '🐢', name: 'turtle' }, { emoji: '🌼', name: 'flower' }, { emoji: '🦋', name: 'butterfly' }];
  const things = rng.shuffle(all); const r = rng.int(0, 2), c = rng.int(0, 2); const index = r*3+c; const wrong = things.filter((_, i) => i !== index).slice(0, 2); const pos = `${['top', 'middle', 'bottom'][r]} row and ${['left', 'middle', 'right'][c]} column`;
  return makeItem('m.grid-location', `${things.map(x=>x.name).join('-')}-${r}-${c}`, d, { say: `Look at the grid. What is in the ${pos}?`, show: `Find the ${pos}.`, visual: { kind: 'map', rows: 3, cols: 3, cells: things.map((x, i) => ({ r: Math.floor(i/3), c: i%3, emoji: x.emoji })) }, choices: [pic(things[index].emoji, things[index].name), ...wrong.map(x => pic(x.emoji, x.name, 'grid_location_confusion'))], explain: `Find the ${pos}. It has the ${things[index].name}.` });
} };
const model = (kind: 'put-together' | 'take-apart' | 'picture-story'): Skill => {
  const id = `m.${kind}`;
  return { ...base(id, 'algebra', kind === 'put-together' ? 'Put groups together with pictures and cubes' : kind === 'take-apart' ? 'Take apart a group with pictures and cubes' : 'Solve addition and subtraction picture stories', kind === 'put-together' ? 'Put together' : kind === 'take-apart' ? 'Take apart' : 'Picture stories', 'Pictures can help us count groups.', { kind: 'groups', groups: [{ emoji: '🟦', count: 2 }, { emoji: '🟩', count: 3 }] }), generate: (rng, d) => {
    const a = rng.int(1, 5), b = rng.int(1, Math.min(5, 10-a)); const total = a+b; const take = kind === 'take-apart' || (kind === 'picture-story' && rng.pick([true,false])); const symbol = rng.pick([{ emoji: '🧊', name: 'cubes' }, { emoji: '🍎', name: 'apples' }, { emoji: '⭐', name: 'stars' }, { emoji: '🐸', name: 'frogs' }]);
    const result = take ? a : total;
    const visual: Visual = take ? { kind: 'crossed', emoji: symbol.emoji, total, crossed: b } : { kind: 'groups', groups: [{ emoji: symbol.emoji, count: a }, { emoji: symbol.emoji, count: b }] };
    return makeItem(id, `${a}-${b}-${symbol.name}-${take}`, d, { say: take ? `There are ${total} ${symbol.name}. ${b} go away. How many are left?` : `There are ${a} ${symbol.name}. ${b} more join them. How many are there altogether?`, show: take ? 'How many are left?' : 'How many altogether?', visual, choices: numberChoices(rng, result, [{ n: take ? b : a, why: 'answered_one_part' }, { n: take ? total : total - 1, why: take ? 'gave_whole' : 'count_skipped_one' }, { n: result + 1, why: 'count_double_tap' }], { min: 0, max: 10 }), explain: take ? `Start with ${total} and take away ${b}. ${a} are left.` : `Count both groups: ${a} and ${b} make ${total}.` });
  } };
};
export const KINDERGARTEN_VISUAL_SKILLS: Skill[] = [width, capacity, compare, sorter('color'), sorter('shape'), vennCount, vennSort, grid, model('put-together'), model('take-apart'), model('picture-story')];
