import type { Choice, Skill, Visual } from './types';
import { items, makeItem, num, numberChoices, pic, txt } from './helpers';

/*
 * Extra depth for time, money and patterns, which i-Ready tests in
 * Measurement & Data and Algebraic Thinking and which need more practice.
 */

const timePatterns: Skill = {
  id: 'm.timepatterns',
  subject: 'math',
  strand: 'measure',
  grade: 'K',
  title: 'Patterns in time: daily routine, days of the week, months',
  kidTitle: 'Day and week',
  icon: '📅',
  standards: ['K.PAR.6'],
  prereqs: [],
  parentTip: 'Make a picture schedule of his day. Each morning ask: “What day is it? What day was yesterday? What comes tomorrow?”',
  intro: [
    { say: 'Every day has a pattern: we wake up, eat breakfast, go to school, and go to bed at night.', visual: { kind: 'sequence', items: ['🛏️', '🍳', '🚌', '🌙'], blank: -1 } },
    { say: 'The days of the week repeat too: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, and then Monday again!' },
  ],
  items: items('m.timepatterns', [
    { difficulty: 1, say: 'You wake up, then you eat breakfast. What do you do at night?', show: 'What do you do at night?', choices: [pic('😴', 'sleep'), pic('🍳', 'eat breakfast', 'time_of_day_confusion'), pic('🚌', 'ride the school bus', 'time_of_day_confusion')], explain: 'At night it is dark and we go to sleep.' },
    { difficulty: 1, say: 'What comes next? Wake up, brush teeth, eat breakfast, then…', show: 'What comes next?', visual: { kind: 'sequence', items: ['🛏️', '🪥', '🍳', '?'], blank: 3 }, choices: [pic('🚌', 'go to school'), pic('😴', 'go to sleep', 'sequence_error'), pic('🛏️', 'wake up', 'sequence_error')], explain: 'After breakfast, we go to school. Bedtime is at the end of the day.' },
    { difficulty: 2, say: 'What day comes after Monday?', show: 'What day comes after Monday?', choices: [txt('Tuesday'), txt('Sunday', 'before_after_confusion'), txt('Friday', 'days_order_unknown')], explain: 'Monday, Tuesday. Tuesday comes after Monday.' },
    { difficulty: 2, say: 'What day comes before Friday?', show: 'What day comes before Friday?', choices: [txt('Saturday', 'before_after_confusion'), txt('Thursday'), txt('Monday', 'days_order_unknown')], explain: 'Thursday, Friday. Thursday comes just before Friday.' },
    { difficulty: 2, say: 'How many days are in one week?', show: 'Days in a week', choices: [num(5, 'school_days_only'), num(7), num(10, 'days_order_unknown'), num(12, 'months_vs_days')], keepOrder: true, explain: 'A week has 7 days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.' },
    { difficulty: 3, say: 'Today is Wednesday. What day was yesterday?', show: 'Today is Wednesday. Yesterday was…', choices: [txt('Thursday', 'before_after_confusion'), txt('Tuesday'), txt('Monday', 'days_order_unknown')], explain: 'Yesterday is the day before. The day before Wednesday is Tuesday.' },
    { difficulty: 3, say: 'Which month comes right after January?', show: 'After January comes…', choices: [txt('February'), txt('December', 'before_after_confusion'), txt('June', 'days_order_unknown')], explain: 'January, February, March… February comes after January.' },
    { difficulty: 3, say: 'Which takes the longest time?', show: 'Which takes the longest?', choices: [pic('🦷', 'brushing your teeth', 'duration_confusion'), pic('😴', 'a night of sleep'), pic('👏', 'clapping your hands', 'duration_confusion')], explain: 'A night of sleep takes many hours. Brushing teeth takes about two minutes, and a clap takes less than a second.' },
  ]),
};

const US = { 1: 'penny', 5: 'nickel', 10: 'dime', 25: 'quarter' } as const;
type Cent = keyof typeof US;
const coins = (values: Cent[]): Visual => ({ kind: 'coins', values, symbol: '¢', labels: values.map((v) => US[v]) });

const usCoins: Skill = {
  id: 'm1.coins',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Coin names, values, and counting same coins',
  kidTitle: 'Coin names',
  icon: '🪙',
  standards: ['1.MDR.6'],
  prereqs: ['m.tens'],
  regions: ['us-ga'],
  parentTip: 'Give him a handful of one kind of coin. Count nickels by 5s and dimes by 10s together. Ask why the small dime is worth more than the big nickel.',
  intro: [{ say: 'Penny is one cent. Nickel is five cents. Dime is ten cents. Quarter is twenty five cents. Count nickels by fives and dimes by tens!', visual: coins([1, 5, 10, 25]) }],
  generate: (rng, d) => {
    if (d === 1) {
      const v = rng.pick([1, 5, 10, 25] as Cent[]);
      return makeItem('m1.coins', `value${v}`, d, {
        say: `How many cents is a ${US[v]} worth?`,
        show: `A ${US[v]} is worth…`,
        visual: coins([v]),
        choices: ([1, 5, 10, 25] as Cent[]).map((c) => (c === v ? { text: `${c}¢`, say: `${c} cents`, correct: true as const } : { text: `${c}¢`, say: `${c} cents`, why: (v === 10 && c === 5) || (v === 5 && c === 10) ? 'coin_size_means_value' : 'coin_value_unknown' })),
        keepOrder: true,
        explain: `A ${US[v]} is worth ${v} cent${v > 1 ? 's' : ''}.`,
      });
    }
    if (d === 2) {
      const kind = rng.pick([1, 5, 10] as Cent[]);
      const n = rng.int(3, kind === 1 ? 9 : 6);
      const total = kind * n;
      return makeItem('m1.coins', `count${kind}x${n}`, d, {
        say: `How many cents are these ${US[kind] === 'penny' ? 'pennies' : `${US[kind]}s`} worth?`,
        show: 'How many cents?',
        visual: coins(Array.from({ length: n }, () => kind)),
        choices: numberChoices(rng, total, [
          { n, why: 'counted_coins_not_value' },
          { n: total + kind, why: 'count_double_tap' },
          { n: kind === 5 ? n * 10 : n * 5, why: 'wrong_coin_value' },
        ], { min: 1, max: 100 }).map((c) => ({ ...c, text: `${c.text}¢`, say: `${c.say} cents` })),
        explain: kind === 1 ? `Each penny is 1 cent: count ${n}. That is ${total} cents.` : `Count by ${kind}s: ${Array.from({ length: n }, (_, i) => (i + 1) * kind).join(', ')}. That is ${total} cents.`,
      });
    }
    const pairs: [Cent[], Cent[]][] = [
      [[10, 10], [5, 5, 5]],
      [[25], [10, 10]],
      [[5, 5, 5, 5], [10, 1, 1]],
      [[10, 10, 5], [25, 1]],
    ];
    const [a, b] = rng.pick(pairs);
    const va = a.reduce<number>((x, y) => x + y, 0);
    const vb = b.reduce<number>((x, y) => x + y, 0);
    const choices: Omit<Choice, 'id'>[] = [
      va > vb ? { visual: coins(a), say: `group with ${a.length} coins`, correct: true } : { visual: coins(a), say: `group with ${a.length} coins`, why: a.length > b.length ? 'more_coins_means_more_money' : 'coin_value_unknown' },
      vb > va ? { visual: coins(b), say: `group with ${b.length} coins`, correct: true } : { visual: coins(b), say: `group with ${b.length} coins`, why: b.length > a.length ? 'more_coins_means_more_money' : 'coin_value_unknown' },
      { text: 'They are the same', say: 'they are the same', why: 'coin_value_unknown' },
    ];
    return makeItem('m1.coins', `compare${va}-${vb}`, d, {
      say: 'Which group of coins is worth more money?',
      show: 'Which is worth more?',
      choices,
      keepOrder: true,
      explain: `Add each group: ${va} cents and ${vb} cents. ${Math.max(va, vb)} cents is more. More coins does not always mean more money!`,
    });
  },
};

const SYMBOLS = [
  ['🔴', '🔵', '🟡'],
  ['⭐', '🌙', '☀️'],
  ['🐶', '🐱', '🐭'],
  ['🟥', '🟦', '🟩'],
  ['🍎', '🍌', '🍇'],
];
const RULES: { core: number[]; name: string }[] = [
  { core: [0, 1], name: 'AB' },
  { core: [0, 0, 1], name: 'AAB' },
  { core: [0, 1, 1], name: 'ABB' },
  { core: [0, 1, 2], name: 'ABC' },
  { core: [0, 0, 1, 1], name: 'AABB' },
];
const build = (core: number[], set: string[], len = 6) => Array.from({ length: len }, (_, i) => set[core[i % core.length]]);
const row = (items: string[]): Visual => ({ kind: 'sequence', items, blank: -1 });

const patternRule: Skill = {
  id: 'm1.patternrule',
  subject: 'math',
  strand: 'algebra',
  grade: '1',
  title: 'Find the pattern rule (same rule, different things; number rules)',
  kidTitle: 'Pattern rules',
  icon: '🧠',
  standards: ['1.PAR.3'],
  prereqs: ['m.pattern'],
  parentTip: 'Turn a pattern into sounds: red-blue-blue becomes clap-stomp-stomp. Ask: “Is it the same rule?” Then make number patterns: 3, 6, 9… “What is the rule?”',
  intro: [{ say: 'Red, blue, blue. Star, moon, moon. They look different, but the rule is the same: one, then two of the same!', visual: { kind: 'row', items: [row(['🔴', '🔵', '🔵']), row(['⭐', '🌙', '🌙'])] } }],
  generate: (rng, d) => {
    if (d <= 2) {
      const pool = d === 1 ? RULES.filter((r) => r.core.length <= 3 && r.name !== 'ABC') : RULES;
      const rule = rng.pick(pool);
      const [setA, setB] = rng.shuffle(SYMBOLS);
      const others = rng.shuffle(RULES.filter((r) => r.name !== rule.name)).slice(0, 2);
      return makeItem('m1.patternrule', `${rule.name}-${setA[0]}${setB[0]}-${d}`, d, {
        say: 'Look at the top pattern. Which pattern below follows the same rule?',
        show: 'Which has the same rule?',
        visual: row(build(rule.core, setA)),
        choices: [
          { visual: row(build(rule.core, setB)), correct: true as const },
          ...others.map((o) => ({ visual: row(build(o.core, setB)), why: 'pattern_rule_not_transferred' })),
        ],
        speakChoices: false,
        explain: `The rule is ${rule.name.split('').join(' ')}: ${rule.core.map((i) => setA[i]).join(' ')}. The matching pattern repeats ${rule.core.map((i) => setB[i]).join(' ')} the same way.`,
      });
    }
    const step = rng.pick([2, 3, 4, 5, 10]);
    const start = rng.int(1, 9);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const options = [`add ${step}`, `add ${step === 2 ? 3 : 2}`, `add ${start}`, 'take away 2'];
    const uniq = [...new Set(options)];
    return makeItem('m1.patternrule', `num${start}+${step}`, d, {
      say: `${seq.join(', ')}. What is the rule?`,
      show: `${seq.join(', ')} … What is the rule?`,
      visual: { kind: 'sequence', items: seq.map(String), blank: -1 },
      choices: uniq.slice(0, 4).map((o, i) => (i === 0 ? { text: o, say: o, correct: true as const } : { text: o, say: o, why: o.startsWith('take') ? 'pattern_direction' : o === `add ${start}` ? 'rule_from_first_number' : 'pattern_core_not_found' })),
      explain: `Each number is ${step} more than the one before: ${seq.join(' → ')}. The rule is add ${step}.`,
    });
  },
};

export const MATH_EXTRA_SKILLS: Skill[] = [timePatterns, usCoins, patternRule];
