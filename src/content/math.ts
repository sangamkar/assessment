import type { Difficulty, Rng, Skill, Visual } from './types';
import { COUNT_EMOJI, COUNT_NAMES, countUp, items, makeItem, noun, num, numberChoices, pic, txt, vis } from './helpers';

const C = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  orange: '#f97316',
};

const pickThing = (rng: Rng) => {
  const emoji = rng.pick(COUNT_EMOJI);
  return { emoji, name: COUNT_NAMES[emoji] };
};

const range = (d: Difficulty, spans: [number, number][]) => spans[d - 1];

/* ------------------------------------------------------------------------ */
/* NUMBERS & COUNTING                                                       */
/* ------------------------------------------------------------------------ */

const count10: Skill = {
  id: 'm.count10',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Count objects to 10 (cardinality)',
  kidTitle: 'Count to 10',
  icon: '🍎',
  standards: ['K.NR.1'],
  prereqs: [],
  parentTip: 'Count snacks, stairs or toys together. Touch each one, then ask "So how many?" — the last number tells how many.',
  intro: [
    { say: 'When we count, we touch each thing one time and say one number.', visual: { kind: 'objects', emoji: '🍎', count: 3, arrange: 'line' } },
    { say: 'One, two, three. The last number we say tells how many. There are three apples!', visual: { kind: 'number', value: 3 } },
  ],
  generate: (rng, d) => {
    const [lo, hi] = range(d, [[1, 5], [6, 8], [7, 10]]);
    const n = rng.int(lo, hi);
    const t = pickThing(rng);
    return makeItem('m.count10', `${n}${t.emoji}${d}`, d, {
      say: `How many ${t.name}? Count them carefully.`,
      show: `How many ${t.name}?`,
      visual: { kind: 'objects', emoji: t.emoji, count: n, arrange: d === 3 ? 'scatter' : 'line' },
      choices: numberChoices(rng, n, [
        { n: n - 1, why: 'count_skipped_one' },
        { n: n + 1, why: 'count_double_tap' },
      ], { min: 1, max: 12 }),
      hint: 'Touch each one as you count. Say one number for each.',
      explain: `Let's count together: ${countUp(n)}. The last number tells how many. There are ${n} ${t.name}.`,
    });
  },
};

const count20: Skill = {
  id: 'm.count20',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Count objects 11–20',
  kidTitle: 'Count to 20',
  icon: '🐞',
  standards: ['K.NR.1'],
  prereqs: ['m.count10'],
  parentTip: 'Line up 11–20 small objects (coins, beans). Count, then move 10 into a pile and count on: "ten… eleven, twelve…".',
  intro: [
    { say: 'Big numbers work the same way. Touch each one and keep counting after ten: eleven, twelve, thirteen!', visual: { kind: 'objects', emoji: '⭐', count: 13, arrange: 'line' } },
  ],
  generate: (rng, d) => {
    const [lo, hi] = range(d, [[11, 13], [14, 17], [17, 20]]);
    const n = rng.int(lo, hi);
    const t = pickThing(rng);
    return makeItem('m.count20', `${n}${t.emoji}${d}`, d, {
      say: `How many ${t.name}? Count them carefully.`,
      show: `How many ${t.name}?`,
      visual: { kind: 'objects', emoji: t.emoji, count: n, arrange: d === 3 ? 'scatter' : 'line' },
      choices: numberChoices(rng, n, [
        { n: n - 1, why: 'count_skipped_one' },
        { n: n + 1, why: 'count_double_tap' },
        { n: n - 10, why: 'teen_counted_extras_only' },
      ], { min: 1, max: 22 }),
      hint: 'Count the first ten, then keep going: eleven, twelve…',
      explain: `Let's count: ${countUp(n)}. There are ${n} ${t.name}.`,
    });
  },
};

const subitize: Skill = {
  id: 'm.subitize',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Recognize small quantities at a glance (dot patterns, ten frames)',
  kidTitle: 'Quick look',
  icon: '🎲',
  standards: ['K.NR.1'],
  prereqs: ['m.count10'],
  parentTip: 'Play dice games (Chutes & Ladders, Trouble) and ask him to say the number without counting the dots.',
  intro: [
    { say: 'Some numbers make patterns. This is the five pattern on a die. You can know it without counting!', visual: { kind: 'objects', emoji: '🔴', count: 5, arrange: 'dice' } },
    { say: 'A ten frame holds ten. A full top row is five.', visual: { kind: 'tenFrame', filled: 5 } },
  ],
  generate: (rng, d) => {
    // Level 2 mixes dice patterns 4–6 with small ten frames, so it is not the same two pictures.
    const frame = d === 3 || (d === 2 && rng.next() < 0.5);
    const n = d === 1 ? rng.int(1, 4) : d === 2 ? (frame ? rng.int(3, 5) : rng.int(4, 6)) : rng.int(6, 10);
    const dot = rng.pick(['🔴', '🔵', '🟢']);
    const visual: Visual = frame ? { kind: 'tenFrame', filled: n } : { kind: 'objects', emoji: dot, count: n, arrange: 'dice' };
    return makeItem('m.subitize', `${frame ? 'f' : dot}${n}${d}`, d, {
      say: 'Quick look! How many dots?',
      show: 'How many dots?',
      visual,
      choices: numberChoices(rng, n, [
        { n: n - 1, why: 'count_skipped_one' },
        { n: n + 1, why: 'count_double_tap' },
        ...(frame ? [{ n: 10 - n, why: 'counted_empty_boxes' }] : []),
      ], { min: 1, max: 10 }),
      explain: frame && n > 5 ? `The top row has 5. Then count on: ${countUp(n).split(', ').slice(5).join(', ') || 'none more'}. That makes ${n}.` : frame ? `Count the dots in the frame: ${countUp(n)}. There are ${n}.` : `This is the ${n} pattern. There are ${n} dots.`,
    });
  },
};

const numerals: Skill = {
  id: 'm.numerals',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Match numerals 0–20 to quantities',
  kidTitle: 'Numbers and groups',
  icon: '🔢',
  standards: ['K.NR.4'],
  prereqs: ['m.count10'],
  parentTip: 'Write numbers on sticky notes and have him put that many blocks on each one.',
  intro: [
    { say: 'This number is seven. Seven means this many.', visual: { kind: 'row', items: [{ kind: 'number', value: 7 }, { kind: 'objects', emoji: '🐟', count: 7, arrange: 'line' }] } },
  ],
  generate: (rng, d) => {
    const [lo, hi] = range(d, [[1, 5], [6, 10], [11, 18]]);
    const n = rng.int(lo, hi);
    const emoji = rng.pick(COUNT_EMOJI);
    // One picture style per item, so the style itself never hints at the answer.
    const visual = (k: number): Visual =>
      n > 10 ? { kind: 'tenFrame', filled: k, frames: 2 } : { kind: 'objects', emoji, count: k, arrange: 'line' };
    return makeItem('m.numerals', `${n}${d}`, d, {
      say: `Find the group that shows ${n}.`,
      show: 'Find the group that shows this number.',
      visual: { kind: 'number', value: n },
      choices: numberChoices(rng, n, [
        { n: n - 1, why: 'count_skipped_one' },
        { n: n + 1, why: 'count_double_tap' },
        ...(n > 10 ? [{ n: n - 10, why: 'teen_counted_extras_only' }] : []),
      ], { min: 1, max: 20, size: 3, visual }),
      speakChoices: false,
      explain: `${n} means ${n} things. Count to check: ${countUp(n)}.`,
    });
  },
};

const seqNext: Skill = {
  id: 'm.seqnext',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Count forward from any number (within 100)',
  kidTitle: 'What comes next?',
  icon: '➡️',
  standards: ['K.NR.2'],
  prereqs: ['m.count10'],
  parentTip: 'In the car, start counting from a random number ("Start at 27!") and take turns saying the next number.',
  intro: [
    { say: 'We can start counting from any number. Twenty seven, twenty eight, twenty nine… what comes after twenty nine? Thirty!', visual: { kind: 'sequence', items: ['27', '28', '29', '30'], blank: -1 } },
  ],
  generate: (rng, d) => {
    let start: number;
    let blank = 3;
    if (d === 1) start = rng.int(1, 7);
    else if (d === 2) {
      start = rng.int(11, 27);
      blank = rng.pick([1, 2, 3]);
    } else {
      start = rng.pick([17, 27, 37, 47, 57, 67, 77, 87]);
    }
    const seq = [start, start + 1, start + 2, start + 3];
    const ans = seq[blank];
    const wrong = [
      { n: ans + 1, why: 'skipped_a_number' },
      { n: seq[blank === 0 ? 1 : blank - 1], why: 'repeated_previous' },
    ];
    if (d === 3) wrong.unshift({ n: ans - 10, why: 'decade_transition' });
    return makeItem('m.seqnext', `${start}-${blank}`, d, {
      say: blank === 3 ? `Count forward: ${seq.slice(0, 3).join(', ')}. What number comes next?` : 'Which number is missing?',
      show: blank === 3 ? 'What comes next?' : 'Which number is missing?',
      visual: { kind: 'sequence', items: seq.map(String), blank },
      choices: numberChoices(rng, ans, wrong, { min: 0, max: 100 }),
      explain: `Count with me: ${seq.join(', ')}. The missing number is ${ans}.`,
    });
  },
};

const countBack: Skill = {
  id: 'm.countback',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Count backward (within 30)',
  kidTitle: 'Count back',
  icon: '🚀',
  standards: ['K.NR.2'],
  prereqs: ['m.seqnext'],
  parentTip: 'Do rocket countdowns from 10, then from 20: "20, 19, 18… blast off!"',
  intro: [
    { say: 'Counting back is like a rocket countdown. Five, four, three, two, one, blast off!', visual: { kind: 'sequence', items: ['5', '4', '3', '2', '1'], blank: -1 } },
  ],
  generate: (rng, d) => {
    const start = d === 1 ? rng.int(5, 10) : d === 2 ? rng.int(13, 20) : rng.pick([22, 23, 32, 31, 21, 41]);
    const seq = [start, start - 1, start - 2, start - 3];
    const ans = seq[3];
    return makeItem('m.countback', `${start}`, d, {
      say: `Count back: ${seq.slice(0, 3).join(', ')}. What number comes next?`,
      show: 'Count back. What comes next?',
      visual: { kind: 'sequence', items: seq.map(String), blank: 3 },
      choices: numberChoices(rng, ans, [
        { n: seq[0] + 1, why: 'counted_forward' },
        { n: ans - 1, why: 'skipped_a_number' },
        { n: seq[2], why: 'repeated_previous' },
      ], { min: 0, max: 100 }),
      explain: `Counting back goes down by one each time: ${seq.join(', ')}.`,
    });
  },
};

const tens: Skill = {
  id: 'm.tens',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Count by tens to 100',
  kidTitle: 'Count by tens',
  icon: '🔟',
  standards: ['K.NR.2'],
  prereqs: ['m.seqnext'],
  parentTip: 'Bundle 10 straws or popsicle sticks with a rubber band. Count the bundles: "10, 20, 30…".',
  intro: [
    { say: 'Each full ten frame has ten. We can count them fast by tens: ten, twenty, thirty!', visual: { kind: 'row', items: [{ kind: 'tenFrame', filled: 10 }, { kind: 'tenFrame', filled: 10 }, { kind: 'tenFrame', filled: 10 }] } },
  ],
  generate: (rng, d) => {
    if (d === 3) {
      const k = rng.int(3, 6);
      return makeItem('m.tens', `frames${k}`, d, {
        say: 'Each ten frame is full. Count by tens. How many dots in all?',
        show: 'How many dots in all?',
        visual: { kind: 'row', items: Array.from({ length: k }, () => ({ kind: 'tenFrame', filled: 10 }) as Visual) },
        choices: numberChoices(rng, k * 10, [
          { n: k, why: 'tens_counted_as_ones' },
          { n: k * 10 + 10, why: 'skipped_a_ten' },
          { n: k * 10 - 10, why: 'count_skipped_one' },
        ], { min: 1, max: 100 }),
        explain: `Count by tens: ${Array.from({ length: k }, (_, i) => (i + 1) * 10).join(', ')}. There are ${k * 10} dots.`,
      });
    }
    const startTen = d === 1 ? rng.int(1, 3) : rng.int(4, 6);
    const seq = [0, 1, 2, 3].map((i) => (startTen + i) * 10);
    const blank = d === 1 ? 3 : rng.pick([1, 2, 3]);
    const ans = seq[blank];
    return makeItem('m.tens', `${startTen}-${blank}`, d, {
      say: blank === 3 ? `Count by tens: ${seq.slice(0, 3).join(', ')}. What comes next?` : 'Count by tens. Which number is missing?',
      show: 'Count by tens.',
      visual: { kind: 'sequence', items: seq.map(String), blank },
      choices: numberChoices(rng, ans, [
        { n: seq[blank === 0 ? 1 : blank - 1] + 1, why: 'ones_instead_of_tens' },
        { n: ans + 10, why: 'skipped_a_ten' },
        { n: ans / 10, why: 'tens_counted_as_ones' },
      ], { min: 1, max: 110 }),
      explain: `Counting by tens: ${seq.join(', ')}. Each jump adds ten.`,
    });
  },
};

const compare: Skill = {
  id: 'm.compare',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Compare groups and numbers (more, fewer, greatest)',
  kidTitle: 'More or fewer',
  icon: '⚖️',
  standards: ['K.NR.4'],
  prereqs: ['m.count10'],
  parentTip: 'Make two piles of crackers and ask "Who has more? How do you know?" Match them one-to-one to check.',
  intro: [
    { say: 'To find which group has more, count each group. The bigger number has more.', visual: { kind: 'groups', groups: [{ emoji: '🍪', count: 5 }, { emoji: '🍪', count: 2 }], sep: '|' } },
  ],
  generate: (rng, d) => {
    if (d === 3) {
      const nums = rng.shuffle([rng.int(2, 6), rng.int(7, 12), rng.int(13, 20)]);
      const max = Math.max(...nums);
      const min = Math.min(...nums);
      return makeItem('m.compare', `num${nums.join('-')}`, d, {
        say: 'Which number is the greatest?',
        show: 'Which number is the greatest?',
        choices: nums.map((n) =>
          n === max ? { text: String(n), say: String(n), correct: true as const } : { text: String(n), say: String(n), why: n === min ? 'chose_smallest' : 'near_miss' },
        ),
        explain: `Greatest means the most. ${max} comes later when we count, so ${max} is the greatest.`,
      });
    }
    const emoji = rng.pick(COUNT_EMOJI);
    const askMore = d === 1 || rng.next() < 0.5;
    const base = rng.int(2, 7);
    const counts = d === 1 ? [base, base + rng.int(3, 4), Math.max(1, base - rng.int(1, 1))] : [base, base + 1, base + 2];
    const shuffled = rng.shuffle(counts);
    const target = askMore ? Math.max(...counts) : Math.min(...counts);
    const opposite = askMore ? Math.min(...counts) : Math.max(...counts);
    const word = askMore ? 'the most' : 'the fewest';
    return makeItem('m.compare', `${shuffled.join('-')}${askMore ? 'm' : 'f'}`, d, {
      say: `Which group has ${word}?`,
      show: `Which group has ${word}?`,
      choices: shuffled.map((c) =>
        c === target
          ? { visual: { kind: 'objects', emoji, count: c, arrange: 'line' } as Visual, correct: true as const }
          : { visual: { kind: 'objects', emoji, count: c, arrange: 'line' } as Visual, why: c === opposite ? 'more_fewer_confusion' : 'near_miss' },
      ),
      speakChoices: false,
      explain: `Count each group: ${shuffled.join(', ')}. ${target} is ${askMore ? 'the most' : 'the fewest'}.`,
    });
  },
};

const teens: Skill = {
  id: 'm.teens',
  subject: 'math',
  strand: 'number',
  grade: 'K',
  title: 'Teen numbers are ten and some ones (11–19)',
  kidTitle: 'Ten and more',
  icon: '🧮',
  standards: ['K.NR.3'],
  prereqs: ['m.count20', 'm.subitize'],
  parentTip: 'Use two egg cartons cut to 10 spaces. Fill one, then add a few to the second: "Ten and four more is fourteen."',
  intro: [
    { say: 'Fourteen is a full ten and four more ones. Ten and four makes fourteen!', visual: { kind: 'tenFrame', filled: 14, frames: 2 } },
  ],
  generate: (rng, d) => {
    const k = rng.int(1, 9);
    const n = 10 + k;
    const wrong = [
      { n: k, why: 'teen_counted_extras_only' },
      { n: k * 10 + 1, why: 'teen_digit_reversal' },
      { n: n + 1, why: 'count_double_tap' },
      { n: n - 1, why: 'count_skipped_one' },
    ];
    if (d === 3) {
      return makeItem('m.teens', `pick${n}`, d, {
        say: `Which one shows ${n}?`,
        show: `Which one shows ${n}?`,
        choices: numberChoices(rng, n, [
          { n: n + 1, why: 'count_double_tap' },
          { n: k, why: 'teen_counted_extras_only' },
          { n: n - 1, why: 'count_skipped_one' },
        ], { min: 1, max: 20, visual: (x) => ({ kind: 'tenFrame', filled: x, frames: 2 }) }),
        speakChoices: false,
        explain: `${n} is one full ten and ${k} more ones.`,
      });
    }
    return makeItem('m.teens', `${n}-${d}`, d, {
      say: d === 1 ? 'One ten frame is full. How many dots in all?' : `Ten and ${k} more. What number is that?`,
      show: d === 1 ? 'How many dots in all?' : `10 and ${k} more`,
      visual: d === 1 ? { kind: 'tenFrame', filled: n, frames: 2 } : { kind: 'row', items: [{ kind: 'number', value: 10 }, { kind: 'number', value: `+ ${k}` }] },
      choices: numberChoices(rng, n, wrong, { min: 1, max: 99 }),
      explain: `A full ten is 10. Then count on: ${Array.from({ length: k }, (_, i) => 11 + i).join(', ')}. Ten and ${k} is ${n}.`,
    });
  },
};

/* ------------------------------------------------------------------------ */
/* ADD & SUBTRACT (i-Ready: Algebra & Algebraic Thinking)                   */
/* ------------------------------------------------------------------------ */

const add: Skill = {
  id: 'm.add',
  subject: 'math',
  strand: 'algebra',
  grade: 'K',
  title: 'Addition within 10 (put together, add to)',
  kidTitle: 'Adding',
  icon: '➕',
  standards: ['K.NR.5'],
  prereqs: ['m.count10'],
  parentTip: 'Act out stories with toys: "3 cars are parked. 2 more drive in. How many now?" Let him move the toys.',
  intro: [
    { say: 'Adding means putting groups together. Three ducks and two more ducks make five ducks!', visual: { kind: 'groups', groups: [{ emoji: '🦆', count: 3 }, { emoji: '🦆', count: 2 }], sep: '+' } },
  ],
  generate: (rng, d) => {
    const total = d === 1 ? rng.int(3, 5) : rng.int(6, 10);
    const a = rng.int(1, total - 1);
    const b = total - a;
    const t = pickThing(rng);
    const wrong = [
      { n: Math.abs(a - b), why: 'subtracted_instead' },
      { n: total + 1, why: 'count_double_tap' },
      { n: Math.max(a, b), why: 'answered_one_part' },
      { n: total - 1, why: 'count_skipped_one' },
    ];
    return makeItem('m.add', `${a}+${b}-${d}`, d, {
      say:
        d === 3
          ? `What is ${a} plus ${b}?`
          : `${a} ${noun(t.emoji, a)}. ${b} more ${noun(t.emoji, b)} ${b === 1 ? 'comes' : 'come'}. How many ${t.name} now?`,
      show: d === 3 ? `${a} + ${b} = ?` : `${a} and ${b} more. How many now?`,
      visual: d === 3 ? { kind: 'number', value: `${a} + ${b}` } : { kind: 'groups', groups: [{ emoji: t.emoji, count: a }, { emoji: t.emoji, count: b }], sep: '+' },
      choices: numberChoices(rng, total, wrong, { min: 0, max: 12 }),
      hint: d === 3 ? `Start at ${Math.max(a, b)} and count on ${Math.min(a, b)} more.` : 'Count all of them together.',
      explain: `Start with ${a}, then count on ${b} more: ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')}. ${a} plus ${b} is ${total}.`,
    });
  },
};

const sub: Skill = {
  id: 'm.sub',
  subject: 'math',
  strand: 'algebra',
  grade: 'K',
  title: 'Subtraction within 10 (take from)',
  kidTitle: 'Taking away',
  icon: '➖',
  standards: ['K.NR.5'],
  prereqs: ['m.add'],
  parentTip: 'Put 8 grapes on a plate, let him eat 3, and ask how many are left before he counts.',
  intro: [
    { say: 'Taking away means some go away. Five cookies, two get eaten. Three are left!', visual: { kind: 'crossed', emoji: '🍪', total: 5, crossed: 2 } },
  ],
  generate: (rng, d) => {
    const total = d === 1 ? rng.int(3, 5) : rng.int(6, 10);
    const gone = rng.int(1, total - 1);
    const left = total - gone;
    const t = pickThing(rng);
    return makeItem('m.sub', `${total}-${gone}-${d}`, d, {
      say: d === 3 ? `What is ${total} minus ${gone}?` : `There were ${total} ${t.name}. ${gone} went away. How many ${t.name} are left?`,
      show: d === 3 ? `${total} − ${gone} = ?` : 'How many are left?',
      visual: d === 3 ? { kind: 'number', value: `${total} − ${gone}` } : { kind: 'crossed', emoji: t.emoji, total, crossed: gone },
      choices: numberChoices(rng, left, [
        { n: total + gone, why: 'added_instead' },
        { n: gone, why: 'answered_part_taken' },
        { n: left + 1, why: 'count_double_tap' },
        { n: left - 1, why: 'count_skipped_one' },
      ], { min: 0, max: 20 }),
      hint: d === 3 ? `Start at ${total} and count back ${gone}.` : 'Count only the ones that are NOT crossed out.',
      explain: `${total} take away ${gone}. Count back: ${Array.from({ length: gone }, (_, i) => total - i - 1).join(', ')}. ${left} are left.`,
    });
  },
};

const bonds: Skill = {
  id: 'm.bonds',
  subject: 'math',
  strand: 'algebra',
  grade: 'K',
  title: 'Decompose numbers to 10 (number bonds / partners)',
  kidTitle: 'Number partners',
  icon: '🤝',
  standards: ['K.NR.5'],
  prereqs: ['m.add'],
  parentTip: 'Hide some of 6 coins under a cup. Show the rest: "There are 6 in all. You see 4. How many are hiding?"',
  intro: [
    { say: 'Numbers can be split into two parts. Six can be four and two. Four and two are partners that make six!', visual: { kind: 'bond', whole: 6, a: 4, b: 2 } },
  ],
  generate: (rng, d) => {
    const whole = d === 1 ? rng.int(3, 5) : rng.int(6, 10);
    const a = rng.int(1, whole - 1);
    const b = whole - a;
    if (d === 3) {
      const pairs = [
        { x: a, y: b + 1, why: 'near_miss' },
        { x: a + 1, y: b, why: 'near_miss' },
        { x: a - 1, y: b, why: 'near_miss' },
        { x: whole, y: b, why: 'added_parts_to_whole' },
      ].filter((p, i, all) => p.x >= 1 && p.y >= 1 && all.findIndex((q) => q.x === p.x && q.y === p.y) === i);
      const wrong = rng.shuffle(pairs).slice(0, 3);
      return makeItem('m.bonds', `pair${whole}-${a}`, d, {
        say: `Which two numbers make ${whole}?`,
        show: `Which two numbers make ${whole}?`,
        choices: [
          { text: `${a} and ${b}`, say: `${a} and ${b}`, correct: true as const },
          ...wrong.map((p) => ({ text: `${p.x} and ${p.y}`, say: `${p.x} and ${p.y}`, why: p.why })),
        ],
        explain: `${a} and ${b} make ${whole}. Count on from ${a}: ${Array.from({ length: b }, (_, i) => a + i + 1).join(', ')}.`,
      });
    }
    return makeItem('m.bonds', `${whole}-${a}`, d, {
      say: `The whole is ${whole}. One part is ${a}. What is the other part?`,
      show: `${whole} is ${a} and ?`,
      visual: { kind: 'bond', whole, a, b: '?' },
      choices: numberChoices(rng, b, [
        { n: whole, why: 'gave_whole' },
        { n: whole + a, why: 'added_parts_to_whole' },
        { n: b + 1, why: 'near_miss' },
      ], { min: 0, max: 20 }),
      hint: `Start at ${a}. Count up until you reach ${whole}.`,
      explain: `${a} and ${b} make ${whole}. So the missing part is ${b}.`,
    });
  },
};

const make10: Skill = {
  id: 'm.make10',
  subject: 'math',
  strand: 'algebra',
  grade: 'K',
  title: 'Find the number that makes 10',
  kidTitle: 'Make ten',
  icon: '🔟',
  standards: ['K.NR.5'],
  prereqs: ['m.bonds', 'm.subitize'],
  parentTip: 'Play "Ten Friends": you hold up some fingers, he shows how many more make ten.',
  intro: [
    { say: 'Seven dots. Three empty boxes. Seven and three make ten!', visual: { kind: 'tenFrame', filled: 7 } },
  ],
  generate: (rng, d) => {
    const k = rng.int(1, 9);
    const ans = 10 - k;
    if (d === 3) {
      const opts = rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== k)).slice(0, 3);
      const choices = [
        { text: `${k} and ${ans}`, say: `${k} and ${ans}`, correct: true as const },
        ...opts.map((x) => {
          const y = 10 - x + (rng.next() < 0.5 ? 1 : -1);
          return { text: `${x} and ${y}`, say: `${x} and ${y}`, why: 'near_miss' };
        }),
      ];
      return makeItem('m.make10', `pair${k}`, d, {
        say: 'Which two numbers make ten?',
        show: 'Which two numbers make 10?',
        choices,
        explain: `${k} and ${ans} make ten. On a ten frame, ${k} filled leaves ${ans} empty.`,
      });
    }
    return makeItem('m.make10', `${k}-${d}`, d, {
      say: d === 1 ? 'How many more dots do we need to fill the ten frame?' : `${k} and what number make ten?`,
      show: d === 1 ? 'How many more to make 10?' : `${k} + ? = 10`,
      visual: d === 1 ? { kind: 'tenFrame', filled: k } : { kind: 'bond', whole: 10, a: k, b: '?' },
      choices: numberChoices(rng, ans, [
        { n: k, why: 'counted_filled_not_empty' },
        { n: 10, why: 'gave_whole' },
        { n: ans + 1, why: 'near_miss' },
      ], { min: 0, max: 10 }),
      hint: d === 1 ? 'Count the empty boxes.' : `Start at ${k} and count up to ten.`,
      explain: `${k} and ${ans} make ten. Count on from ${k}: ${Array.from({ length: ans }, (_, i) => k + i + 1).join(', ')}.`,
    });
  },
};

const PATTERN_SETS = [
  ['🔴', '🔵', '🟡'],
  ['🐶', '🐱', '🐭'],
  ['⭐', '🌙', '☀️'],
  ['🍎', '🍌', '🍇'],
  ['🟥', '🟦', '🟩'],
];
const PATTERN_CORES: { core: number[]; name: string; d: Difficulty }[] = [
  { core: [0, 1], name: 'AB', d: 1 },
  { core: [0, 0, 1], name: 'AAB', d: 2 },
  { core: [0, 1, 1], name: 'ABB', d: 2 },
  { core: [0, 1, 2], name: 'ABC', d: 2 },
  { core: [0, 1, 1, 2], name: 'ABBC', d: 3 },
  { core: [0, 0, 1, 1], name: 'AABB', d: 3 },
];

const pattern: Skill = {
  id: 'm.pattern',
  subject: 'math',
  strand: 'algebra',
  grade: 'K',
  title: 'Extend repeating patterns (AB, AAB, ABC…)',
  kidTitle: 'Patterns',
  icon: '🔁',
  standards: ['K.PAR.6'],
  prereqs: [],
  parentTip: 'Make clap-stomp patterns ("clap, clap, stomp…") or bead necklaces and ask what comes next.',
  intro: [
    { say: 'A pattern repeats. Red, blue, red, blue, red, blue. The part that repeats is red, blue!', visual: { kind: 'sequence', items: ['🔴', '🔵', '🔴', '🔵', '🔴', '🔵'], blank: -1 } },
  ],
  generate: (rng, d) => {
    const cores = PATTERN_CORES.filter((c) => c.d === d);
    const { core, name } = rng.pick(cores);
    const set = rng.shuffle(rng.pick(PATTERN_SETS));
    const len = core.length * 2 + (d === 3 ? 1 : 2);
    const seq = Array.from({ length: len + 1 }, (_, i) => set[core[i % core.length]]);
    const blank = d === 3 && rng.next() < 0.5 ? rng.int(core.length, len - 1) : len;
    const ans = seq[blank];
    const used = [...new Set(core.map((i) => set[i]))];
    const extra = set.find((e) => !used.includes(e)) ?? '⬛';
    const wrongs = used.filter((e) => e !== ans);
    const choices = [
      { visual: { kind: 'emoji', emoji: ans } as Visual, correct: true as const },
      ...wrongs.map((e) => ({ visual: { kind: 'emoji', emoji: e } as Visual, why: 'pattern_core_not_found' })),
      { visual: { kind: 'emoji', emoji: extra } as Visual, why: 'ignores_pattern' },
    ].slice(0, 4);
    return makeItem('m.pattern', `${name}-${set.join('')}-${blank}`, d, {
      say: blank === len ? 'What comes next in the pattern?' : 'What is missing from the pattern?',
      show: blank === len ? 'What comes next?' : 'What is missing?',
      visual: { kind: 'sequence', items: seq.slice(0, len + (blank === len ? 1 : 0)), blank },
      choices,
      speakChoices: false,
      hint: 'Find the part that repeats. Say it out loud.',
      explain: `The part that repeats is ${core.map((i) => set[i]).join(' ')}. So the answer is ${ans}.`,
    });
  },
};

/* ------------------------------------------------------------------------ */
/* MEASUREMENT & DATA                                                       */
/* ------------------------------------------------------------------------ */

const COLORS = [
  { emoji: '🟥', name: 'red', hex: C.red },
  { emoji: '🟦', name: 'blue', hex: C.blue },
  { emoji: '🟩', name: 'green', hex: C.green },
  { emoji: '🟨', name: 'yellow', hex: C.yellow },
  { emoji: '🟪', name: 'purple', hex: C.purple },
];

const measure: Skill = {
  id: 'm.measure',
  subject: 'math',
  strand: 'measure',
  grade: 'K',
  title: 'Compare length, height, weight and capacity',
  kidTitle: 'Longer, taller, heavier',
  icon: '📏',
  standards: ['K.MDR.7'],
  prereqs: [],
  parentTip: 'Line up shoes or spoons from shortest to longest. Remind him to start them all at the same line.',
  intro: [
    { say: 'To see which is longer, line them up at the same start. The one that sticks out farther is longer.', visual: { kind: 'lengths', mode: 'length', items: [{ emoji: '✏️', size: 8, color: C.yellow }, { emoji: '🖍️', size: 4, color: C.red }] } },
    { say: 'On a balance, the heavier side goes down.', visual: { kind: 'balance', left: '🍉', right: '🍓', tilt: 'left' } },
  ],
  generate: (rng, d) => {
    const mode = rng.pick(['length', 'height'] as const);
    const askBig = rng.next() < 0.5;
    const cols = rng.shuffle(COLORS).slice(0, 3);
    const sizes = d === 1 ? rng.shuffle([3, 6, 9]) : rng.shuffle([5, 6, 7]);
    const offsets = d === 3 && mode === 'length' ? sizes.map((s) => (s === Math.min(...sizes) ? 4 : rng.int(0, 1))) : [0, 0, 0];
    const target = askBig ? Math.max(...sizes) : Math.min(...sizes);
    const word = mode === 'length' ? (askBig ? 'longest' : 'shortest') : askBig ? 'tallest' : 'shortest';
    const thing = mode === 'length' ? 'ribbon' : 'tower';
    return makeItem('m.measure', `${mode}${sizes.join('')}${askBig ? 'b' : 's'}${d}`, d, {
      say: `Which ${thing} is the ${word}?`,
      show: `Which ${thing} is the ${word}?`,
      visual: { kind: 'lengths', mode, items: cols.map((c, i) => ({ emoji: c.emoji, size: sizes[i], color: c.hex, offset: offsets[i] })) },
      choices: cols.map((c, i) =>
        sizes[i] === target
          ? { visual: { kind: 'emoji', emoji: c.emoji } as Visual, say: `the ${c.name} ${thing}`, correct: true as const }
          : { visual: { kind: 'emoji', emoji: c.emoji } as Visual, say: `the ${c.name} ${thing}`, why: offsets[i] > 0 ? 'compared_ends_not_length' : 'longer_shorter_confusion' },
      ),
      hint: offsets.some((o) => o > 0) ? 'Look where each one starts AND ends.' : undefined,
      explain: `The ${cols[sizes.indexOf(target)].name} ${thing} is the ${word}.${offsets.some((o) => o > 0) ? ' They do not all start at the same place, so look at the whole length.' : ''}`,
    });
  },
  items: items('m.measure', [
    {
      difficulty: 1,
      say: 'Look at the balance. Which one is heavier?',
      show: 'Which is heavier?',
      visual: { kind: 'balance', left: '🍉', right: '🍒', tilt: 'left' },
      choices: [pic('🍉', 'watermelon'), pic('🍒', 'cherries', 'heavier_lighter_confusion'), pic('⚖️', 'they weigh the same', 'balance_misread')],
      explain: 'The heavier side goes down. The watermelon side is down, so the watermelon is heavier.',
    },
    {
      difficulty: 2,
      say: 'Look at the balance. Which one is lighter?',
      show: 'Which is lighter?',
      visual: { kind: 'balance', left: '🧸', right: '📚', tilt: 'right' },
      choices: [pic('🧸', 'teddy bear'), pic('📚', 'books', 'heavier_lighter_confusion'), pic('⚖️', 'they weigh the same', 'balance_misread')],
      explain: 'The lighter side goes up. The teddy bear side is up, so the teddy bear is lighter.',
    },
    {
      difficulty: 2,
      say: 'Which one holds the most water?',
      show: 'Which holds the most?',
      choices: [pic('🛁', 'bathtub'), pic('🥤', 'cup', 'capacity_confusion'), pic('🥄', 'spoon', 'capacity_confusion'), pic('🪣', 'bucket', 'capacity_near_miss')],
      explain: 'A bathtub is the biggest container, so it holds the most water.',
    },
    {
      difficulty: 3,
      say: 'The balance is level. That means both sides weigh the same. One apple weighs the same as how many strawberries?',
      show: '1 apple = ? strawberries',
      visual: { kind: 'balance', left: '🍎', right: '🍓', tilt: 'level', leftCount: 1, rightCount: 3 },
      choices: [num(3), num(1, 'balance_misread'), num(4, 'near_miss'), num(2, 'near_miss')],
      explain: 'The balance is level, so both sides weigh the same. One apple weighs the same as 3 strawberries.',
    },
    {
      difficulty: 3,
      say: 'Which animal is the heaviest?',
      show: 'Which is the heaviest?',
      choices: [pic('🐘', 'elephant'), pic('🐕', 'dog', 'heavier_lighter_confusion'), pic('🐁', 'mouse', 'heavier_lighter_confusion'), pic('🐈', 'cat', 'heavier_lighter_confusion')],
      explain: 'An elephant is much bigger and heavier than a dog, a cat or a mouse.',
    },
  ]),
};

const DATA_SETS = [
  { title: 'Favorite pets', rows: [['🐶', 'dogs'], ['🐱', 'cats'], ['🐟', 'fish']] },
  { title: 'Favorite fruit', rows: [['🍎', 'apples'], ['🍌', 'bananas'], ['🍇', 'grapes']] },
  { title: 'Weather this week', rows: [['☀️', 'sunny days'], ['🌧️', 'rainy days'], ['☁️', 'cloudy days']] },
  { title: 'Toys in the box', rows: [['🚗', 'cars'], ['⚽', 'balls'], ['🧸', 'teddy bears']] },
];

const data: Skill = {
  id: 'm.data',
  subject: 'math',
  strand: 'measure',
  grade: 'K',
  title: 'Read picture graphs and tally charts',
  kidTitle: 'Picture graphs',
  icon: '📊',
  standards: ['K.MDR.7'],
  prereqs: ['m.count10', 'm.compare'],
  parentTip: 'Make a family vote chart (pizza vs. pasta) with sticky notes. Ask which has more and how many more.',
  intro: [
    { say: 'A picture graph shows how many. Each picture is one. Count the pictures in each row.', visual: { kind: 'graph', title: 'Favorite pets', rows: [{ emoji: '🐶', count: 4 }, { emoji: '🐱', count: 2 }] } },
  ],
  generate: (rng, d) => {
    const set = rng.pick(DATA_SETS);
    const counts = rng.shuffle([rng.int(1, 2), rng.int(3, 4), rng.int(5, 7)]);
    const rows = set.rows.map(([emoji], i) => ({ emoji, count: counts[i] }));
    const visual: Visual = { kind: 'graph', title: set.title, rows };
    if (d === 1) {
      const max = Math.max(...counts);
      const min = Math.min(...counts);
      return makeItem('m.data', `most-${set.title}-${counts.join('')}`, d, {
        say: `Look at the graph. Which has the most?`,
        show: 'Which has the most?',
        visual,
        choices: set.rows.map(([emoji, name], i) =>
          counts[i] === max ? { visual: { kind: 'emoji', emoji } as Visual, say: name, correct: true as const } : { visual: { kind: 'emoji', emoji } as Visual, say: name, why: counts[i] === min ? 'more_fewer_confusion' : 'graph_misread' },
        ),
        explain: `Count each row: ${set.rows.map(([, n], i) => `${counts[i]} ${n}`).join(', ')}. ${set.rows[counts.indexOf(max)][1]} has the most.`,
      });
    }
    const i = rng.int(0, 2);
    if (d === 2) {
      return makeItem('m.data', `howmany-${set.title}-${counts.join('')}-${i}`, d, {
        say: `Look at the graph. How many ${set.rows[i][1]}?`,
        show: `How many ${set.rows[i][0]}?`,
        visual,
        choices: numberChoices(rng, counts[i], [
          { n: counts[(i + 1) % 3], why: 'graph_wrong_row' },
          { n: counts[i] + 1, why: 'count_double_tap' },
        ], { min: 0, max: 10 }),
        explain: `Find the ${set.rows[i][0]} row and count: ${countUp(counts[i])}. There are ${counts[i]}.`,
      });
    }
    const sorted = [...counts].sort((a, b) => b - a);
    const big = counts.indexOf(sorted[0]);
    const small = counts.indexOf(sorted[2]);
    const diff = sorted[0] - sorted[2];
    return makeItem('m.data', `diff-${set.title}-${counts.join('')}`, d, {
      say: `How many more ${set.rows[big][1]} than ${set.rows[small][1]}?`,
      show: `How many more ${set.rows[big][0]} than ${set.rows[small][0]}?`,
      visual,
      choices: numberChoices(rng, diff, [
        { n: sorted[0] + sorted[2], why: 'added_instead' },
        { n: sorted[0], why: 'answered_one_part' },
        { n: diff + 1, why: 'near_miss' },
      ], { min: 0, max: 15 }),
      hint: 'Match them up. Count the extra ones.',
      explain: `${sorted[0]} ${set.rows[big][1]} and ${sorted[2]} ${set.rows[small][1]}. Match them up and ${diff} are extra. ${sorted[0]} minus ${sorted[2]} is ${diff}.`,
    });
  },
  items: items('m.data', [
    {
      difficulty: 2,
      say: 'Each tally mark is one. A line across means five. How many tally marks?',
      show: 'How many?',
      visual: { kind: 'tally', count: 7 },
      choices: [num(7), num(6, 'tally_bundle_as_four'), num(2, 'tally_bundle_as_one'), num(8, 'count_double_tap')],
      explain: 'The bundle with a line across is 5. Then 6, 7. There are 7.',
    },
    {
      difficulty: 3,
      say: 'How many tally marks?',
      show: 'How many?',
      visual: { kind: 'tally', count: 12 },
      choices: [num(12), num(10, 'tally_bundle_as_four'), num(4, 'tally_bundle_as_one'), num(11, 'count_skipped_one')],
      explain: 'Two bundles of five make 10. Then 11, 12. There are 12.',
    },
  ]),
};

/* ------------------------------------------------------------------------ */
/* GEOMETRY                                                                 */
/* ------------------------------------------------------------------------ */

const shp = (shape: Visual & { kind: 'shape' }) => shape;

const shapes2d: Skill = {
  id: 'm.shapes2d',
  subject: 'math',
  strand: 'geometry',
  grade: 'K',
  title: 'Name 2-D shapes in any size or orientation',
  kidTitle: 'Flat shapes',
  icon: '🔺',
  standards: ['K.GSR.8'],
  prereqs: [],
  parentTip: 'Go on a shape hunt at home. Turn a triangle cracker upside down and ask "Is it still a triangle?"',
  intro: [
    { say: 'A triangle has three straight sides. Big or small, turned any way, it is still a triangle!', visual: { kind: 'shapeRow', shapes: [{ shape: 'triangle', color: C.blue }, { shape: 'triangle', color: C.red, rotate: 180, scale: 0.6 }, { shape: 'right-triangle', color: C.green, rotate: 90 }] } },
    { say: 'Shapes must be closed, with no gaps, and triangles need straight sides.', visual: { kind: 'shapeRow', shapes: [{ shape: 'open-triangle', color: C.orange, outline: true }, { shape: 'curvy-triangle', color: C.purple, outline: true }] }, caption: 'Not triangles' },
  ],
  items: items('m.shapes2d', [
    {
      difficulty: 1,
      say: 'Find the circle.',
      show: 'Find the circle.',
      choices: [
        vis(shp({ kind: 'shape', shape: 'circle', color: C.blue }), undefined),
        vis(shp({ kind: 'shape', shape: 'square', color: C.red }), undefined, 'shape_name_confusion'),
        vis(shp({ kind: 'shape', shape: 'triangle', color: C.green }), undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A circle is perfectly round with no corners.',
    },
    {
      difficulty: 1,
      say: 'Find the square.',
      show: 'Find the square.',
      choices: [
        vis(shp({ kind: 'shape', shape: 'rectangle', color: C.purple, stretch: 2 }), undefined, 'square_rectangle_confusion'),
        vis(shp({ kind: 'shape', shape: 'square', color: C.orange }), undefined),
        vis(shp({ kind: 'shape', shape: 'circle', color: C.teal }), undefined, 'shape_name_confusion'),
        vis(shp({ kind: 'shape', shape: 'triangle', color: C.yellow }), undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A square has four straight sides that are all the same length.',
    },
    {
      difficulty: 2,
      say: 'Find the triangle.',
      show: 'Find the triangle.',
      choices: [
        vis(shp({ kind: 'shape', shape: 'triangle', color: C.blue, rotate: 180, outline: true }), undefined),
        vis(shp({ kind: 'shape', shape: 'open-triangle', color: C.red, outline: true }), undefined, 'accepts_open_shape'),
        vis(shp({ kind: 'shape', shape: 'curvy-triangle', color: C.green, outline: true }), undefined, 'accepts_curved_sides'),
        vis(shp({ kind: 'shape', shape: 'rhombus', color: C.yellow, outline: true }), undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      hint: 'A triangle is closed and has three STRAIGHT sides.',
      explain: 'The upside-down one is still a triangle: three straight sides, closed, no gaps. The others have a gap or curvy sides.',
    },
    {
      difficulty: 2,
      say: 'Find the rectangle.',
      show: 'Find the rectangle.',
      choices: [
        vis(shp({ kind: 'shape', shape: 'trapezoid', color: C.pink }), undefined, 'shape_name_confusion'),
        vis(shp({ kind: 'shape', shape: 'oval', color: C.teal }), undefined, 'shape_name_confusion'),
        vis(shp({ kind: 'shape', shape: 'rectangle', color: C.blue, stretch: 1.6, rotate: 90 }), undefined),
        vis(shp({ kind: 'shape', shape: 'hexagon', color: C.orange }), undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A rectangle has four straight sides and four square corners. Standing up tall, it is still a rectangle.',
    },
    {
      difficulty: 2,
      say: 'Find the hexagon.',
      show: 'Find the hexagon.',
      choices: [
        vis(shp({ kind: 'shape', shape: 'pentagon', color: C.green }), undefined, 'side_count_confusion'),
        vis(shp({ kind: 'shape', shape: 'hexagon', color: C.yellow }), undefined),
        vis(shp({ kind: 'shape', shape: 'circle', color: C.red }), undefined, 'shape_name_confusion'),
        vis(shp({ kind: 'shape', shape: 'square', color: C.purple }), undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A hexagon has six straight sides, like a honeycomb.',
    },
    {
      difficulty: 3,
      say: 'Which one is NOT a triangle?',
      show: 'Which is NOT a triangle?',
      choices: [
        vis(shp({ kind: 'shape', shape: 'right-triangle', color: C.blue, rotate: 45 }), undefined, 'orientation_dependence'),
        vis(shp({ kind: 'shape', shape: 'triangle', color: C.red, scale: 0.55 }), undefined, 'size_dependence'),
        vis(shp({ kind: 'shape', shape: 'curvy-triangle', color: C.green }), undefined),
        vis(shp({ kind: 'shape', shape: 'triangle', color: C.orange, rotate: 200 }), undefined, 'orientation_dependence'),
      ],
      speakChoices: false,
      explain: 'Triangles need three STRAIGHT sides. The one with curvy sides is not a triangle. Tilted or tiny triangles are still triangles.',
    },
    {
      difficulty: 3,
      say: 'Which one is a circle?',
      show: 'Which is a circle?',
      choices: [
        vis(shp({ kind: 'shape', shape: 'oval', color: C.blue }), undefined, 'circle_oval_confusion'),
        vis(shp({ kind: 'shape', shape: 'circle', color: C.purple, scale: 0.55 }), undefined),
        vis(shp({ kind: 'shape', shape: 'hexagon', color: C.green }), undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A circle is round the same all the way around. The oval is stretched, so it is not a circle. Small circles are still circles!',
    },
    {
      difficulty: 1,
      say: 'What shape is this clock?',
      show: 'What shape is it?',
      visual: { kind: 'emoji', emoji: '🕐', size: 'xl' },
      choices: [txt('circle'), txt('square', 'shape_name_confusion'), txt('triangle', 'shape_name_confusion')],
      explain: 'The clock is round like a circle.',
    },
    {
      difficulty: 2,
      say: 'What shape is a slice of pizza?',
      show: 'What shape is it?',
      visual: { kind: 'emoji', emoji: '🍕', size: 'xl' },
      choices: [txt('triangle'), txt('circle', 'shape_name_confusion'), txt('rectangle', 'shape_name_confusion')],
      explain: 'A pizza slice has three sides and three corners, like a triangle.',
    },
  ]),
};

const shapeAttr: Skill = {
  id: 'm.shapeattr',
  subject: 'math',
  strand: 'geometry',
  grade: 'K',
  title: 'Describe shapes by sides and corners (vertices)',
  kidTitle: 'Sides and corners',
  icon: '📐',
  standards: ['K.GSR.8'],
  prereqs: ['m.shapes2d'],
  parentTip: 'Trace shapes with a finger and count sides out loud. Put a sticker on each corner and count the stickers.',
  intro: [
    { say: 'Sides are the straight lines. Corners are where two sides meet. A square has four sides and four corners.', visual: { kind: 'shape', shape: 'square', color: C.blue } },
  ],
  items: items('m.shapeattr', [
    {
      difficulty: 1,
      say: 'How many sides does this shape have?',
      show: 'How many sides?',
      visual: { kind: 'shape', shape: 'triangle', color: C.blue },
      choices: [num(3), num(4, 'side_count_confusion'), num(2, 'side_count_confusion'), num(5, 'side_count_confusion')],
      explain: 'Trace and count: one, two, three. A triangle has 3 sides.',
    },
    {
      difficulty: 1,
      say: 'How many corners does this shape have?',
      show: 'How many corners?',
      visual: { kind: 'shape', shape: 'rectangle', color: C.green, stretch: 2 },
      choices: [num(4), num(2, 'corner_count_confusion'), num(3, 'corner_count_confusion'), num(6, 'corner_count_confusion')],
      explain: 'Count the corners: one, two, three, four. A rectangle has 4 corners.',
    },
    {
      difficulty: 2,
      say: 'How many sides does this shape have?',
      show: 'How many sides?',
      visual: { kind: 'shape', shape: 'hexagon', color: C.yellow, rotate: 30 },
      choices: [num(6), num(5, 'side_count_confusion'), num(8, 'side_count_confusion'), num(4, 'side_count_confusion')],
      explain: 'Count around the shape: 1, 2, 3, 4, 5, 6. A hexagon has 6 sides.',
    },
    {
      difficulty: 2,
      say: 'Which shape has no corners?',
      show: 'Which has no corners?',
      choices: [
        vis({ kind: 'shape', shape: 'square', color: C.red }, undefined, 'corner_count_confusion'),
        vis({ kind: 'shape', shape: 'triangle', color: C.blue }, undefined, 'corner_count_confusion'),
        vis({ kind: 'shape', shape: 'circle', color: C.green }, undefined),
        vis({ kind: 'shape', shape: 'pentagon', color: C.purple }, undefined, 'corner_count_confusion'),
      ],
      speakChoices: false,
      explain: 'A circle is round all the way around, so it has no corners and no straight sides.',
    },
    {
      difficulty: 3,
      say: 'Which shape has exactly five sides?',
      show: 'Which has 5 sides?',
      choices: [
        vis({ kind: 'shape', shape: 'hexagon', color: C.orange }, undefined, 'side_count_confusion'),
        vis({ kind: 'shape', shape: 'pentagon', color: C.teal, rotate: 36 }, undefined),
        vis({ kind: 'shape', shape: 'trapezoid', color: C.pink }, undefined, 'side_count_confusion'),
        vis({ kind: 'shape', shape: 'square', color: C.blue }, undefined, 'side_count_confusion'),
      ],
      speakChoices: false,
      explain: 'A pentagon has 5 sides. Count each straight side one time.',
    },
    {
      difficulty: 3,
      say: 'I have four sides, and all my sides are the same length. I am standing on one corner. Which shape am I?',
      show: '4 equal sides, standing on a corner',
      choices: [
        vis({ kind: 'shape', shape: 'square', color: C.purple, rotate: 45 }, undefined),
        vis({ kind: 'shape', shape: 'rectangle', color: C.green, stretch: 2 }, undefined, 'square_rectangle_confusion'),
        vis({ kind: 'shape', shape: 'trapezoid', color: C.orange }, undefined, 'attribute_mismatch'),
        vis({ kind: 'shape', shape: 'triangle', color: C.red }, undefined, 'side_count_confusion'),
      ],
      speakChoices: false,
      explain: 'A square turned on its corner is still a square. It has four sides that are all the same length.',
    },
  ]),
};

const shapes3d: Skill = {
  id: 'm.shapes3d',
  subject: 'math',
  strand: 'geometry',
  grade: 'K',
  title: 'Name 3-D shapes and find them in the real world',
  kidTitle: 'Solid shapes',
  icon: '🧊',
  standards: ['K.GSR.8'],
  prereqs: ['m.shapes2d'],
  parentTip: 'Raid the pantry: cans (cylinders), boxes (rectangular prisms), oranges (spheres). Test which ones roll, stack or slide.',
  intro: [
    { say: 'Solid shapes are not flat. A ball is a sphere. A can is a cylinder. A block is a cube.', visual: { kind: 'shapeRow', shapes: [{ shape: 'sphere', color: C.red }, { shape: 'cylinder', color: C.blue }, { shape: 'cube', color: C.green }] } },
  ],
  items: items('m.shapes3d', [
    {
      difficulty: 1,
      say: 'Find the sphere. It is shaped like a ball.',
      show: 'Find the sphere.',
      choices: [
        vis({ kind: 'shape', shape: 'cube', color: C.blue }, undefined, 'solid_name_confusion'),
        vis({ kind: 'shape', shape: 'sphere', color: C.red }, undefined),
        vis({ kind: 'shape', shape: 'cone', color: C.yellow }, undefined, 'solid_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A sphere is round all over, like a ball.',
    },
    {
      difficulty: 1,
      say: 'Find the cube.',
      show: 'Find the cube.',
      choices: [
        vis({ kind: 'shape', shape: 'cylinder', color: C.teal }, undefined, 'solid_name_confusion'),
        vis({ kind: 'shape', shape: 'square', color: C.purple }, undefined, 'flat_vs_solid_confusion'),
        vis({ kind: 'shape', shape: 'cube', color: C.orange }, undefined),
      ],
      speakChoices: false,
      explain: 'A cube is a solid shape with six square faces, like a block. The flat square is only one face.',
    },
    {
      difficulty: 2,
      say: 'Which one is shaped like a cylinder?',
      show: 'Which is a cylinder?',
      choices: [pic('🥫', 'a can of soup'), pic('⚽', 'a soccer ball', 'solid_name_confusion'), pic('🎲', 'a dice', 'solid_name_confusion'), pic('🍦', 'an ice cream cone', 'solid_name_confusion')],
      explain: 'A can has two flat circles on the ends and a curved side. That is a cylinder.',
    },
    {
      difficulty: 2,
      say: 'Which one is shaped like a cone?',
      show: 'Which is a cone?',
      choices: [pic('🥳', 'a party hat'), pic('📦', 'a box', 'solid_name_confusion'), pic('🏀', 'a basketball', 'solid_name_confusion'), pic('🥫', 'a can', 'solid_name_confusion')],
      explain: 'A party hat has a circle at the bottom and a point at the top. That is a cone.',
    },
    {
      difficulty: 2,
      say: 'Which shape can roll but can NOT stack?',
      show: 'Rolls but cannot stack',
      choices: [
        vis({ kind: 'shape', shape: 'sphere', color: C.blue }, undefined),
        vis({ kind: 'shape', shape: 'cube', color: C.red }, undefined, 'roll_stack_confusion'),
        vis({ kind: 'shape', shape: 'cylinder', color: C.green }, undefined, 'roll_stack_partial'),
        vis({ kind: 'shape', shape: 'rect-prism', color: C.yellow }, undefined, 'roll_stack_confusion'),
      ],
      speakChoices: false,
      explain: 'A sphere is curved everywhere, so it rolls but has no flat face to stack on. A cylinder can roll AND stack.',
    },
    {
      difficulty: 3,
      say: 'A can has a flat face on the top and on the bottom. What shape are those flat faces?',
      show: 'What shape are the flat faces of a can?',
      visual: { kind: 'shape', shape: 'cylinder', color: C.purple },
      choices: [
        vis({ kind: 'shape', shape: 'circle', color: C.purple }, 'circle'),
        vis({ kind: 'shape', shape: 'square', color: C.purple }, 'square', 'face_shape_confusion'),
        vis({ kind: 'shape', shape: 'rectangle', color: C.purple }, 'rectangle', 'face_shape_confusion'),
      ],
      explain: 'If you trace the bottom of a can, you draw a circle. A cylinder has two circle faces.',
    },
    {
      difficulty: 3,
      say: 'Is this shape flat or solid?',
      show: 'Flat or solid?',
      visual: { kind: 'shape', shape: 'rect-prism', color: C.orange },
      choices: [txt('solid'), txt('flat', 'flat_vs_solid_confusion'), txt('both', 'flat_vs_solid_confusion')],
      explain: 'This is a rectangular prism, like a cereal box. You can hold it, so it is solid.',
    },
  ]),
};

const position: Skill = {
  id: 'm.position',
  subject: 'math',
  strand: 'geometry',
  grade: 'K',
  title: 'Position words (above, below, beside, in front of, behind)',
  kidTitle: 'Where is it?',
  icon: '📦',
  standards: ['K.GSR.8'],
  prereqs: [],
  parentTip: 'Play "Simon Says" with a stuffed animal: "Put bear BEHIND the chair. Put bear BESIDE the lamp."',
  intro: [
    { say: 'The cat is above the box. Above means higher up.', visual: { kind: 'place', thing: '🐱', ref: '📦', where: 'above' } },
    { say: 'The cat is beside the box. Beside means next to.', visual: { kind: 'place', thing: '🐱', ref: '📦', where: 'beside' } },
  ],
  items: items('m.position', [
    {
      difficulty: 1,
      say: 'Find the picture where the bird is ABOVE the tree.',
      show: 'Bird ABOVE the tree',
      choices: [
        vis({ kind: 'place', thing: '🐦', ref: '🌳', where: 'above' }, undefined),
        vis({ kind: 'place', thing: '🐦', ref: '🌳', where: 'below' }, undefined, 'above_below_confusion'),
        vis({ kind: 'place', thing: '🐦', ref: '🌳', where: 'beside' }, undefined, 'position_word_confusion'),
      ],
      speakChoices: false,
      explain: 'Above means higher up. The bird flying over the tree is above it.',
    },
    {
      difficulty: 1,
      say: 'Find the picture where the ball is BELOW the chair.',
      show: 'Ball BELOW the chair',
      choices: [
        vis({ kind: 'place', thing: '⚽', ref: '🪑', where: 'beside' }, undefined, 'position_word_confusion'),
        vis({ kind: 'place', thing: '⚽', ref: '🪑', where: 'above' }, undefined, 'above_below_confusion'),
        vis({ kind: 'place', thing: '⚽', ref: '🪑', where: 'below' }, undefined),
      ],
      speakChoices: false,
      explain: 'Below means lower down, underneath.',
    },
    {
      difficulty: 2,
      say: 'Find the picture where the dog is BESIDE the house.',
      show: 'Dog BESIDE the house',
      choices: [
        vis({ kind: 'place', thing: '🐕', ref: '🏠', where: 'above' }, undefined, 'position_word_confusion'),
        vis({ kind: 'place', thing: '🐕', ref: '🏠', where: 'beside' }, undefined),
        vis({ kind: 'place', thing: '🐕', ref: '🏠', where: 'inside' }, undefined, 'position_word_confusion'),
      ],
      speakChoices: false,
      explain: 'Beside means right next to. The dog standing next to the house is beside it.',
    },
    {
      difficulty: 2,
      say: 'Find the picture where the teddy bear is INSIDE the box.',
      show: 'Bear INSIDE the box',
      choices: [
        vis({ kind: 'place', thing: '🧸', ref: '📦', where: 'beside' }, undefined, 'position_word_confusion'),
        vis({ kind: 'place', thing: '🧸', ref: '📦', where: 'above' }, undefined, 'position_word_confusion'),
        vis({ kind: 'place', thing: '🧸', ref: '📦', where: 'inside' }, undefined),
      ],
      speakChoices: false,
      explain: 'Inside means in it. The bear is peeking out from inside the box.',
    },
    {
      difficulty: 3,
      say: 'Find the picture where the cat is BEHIND the box. Only part of the cat can be seen.',
      show: 'Cat BEHIND the box',
      choices: [
        vis({ kind: 'place', thing: '🐈', ref: '📦', where: 'in-front' }, undefined, 'front_behind_confusion'),
        vis({ kind: 'place', thing: '🐈', ref: '📦', where: 'behind' }, undefined),
        vis({ kind: 'place', thing: '🐈', ref: '📦', where: 'beside' }, undefined, 'position_word_confusion'),
      ],
      speakChoices: false,
      explain: 'Behind means at the back. The box hides part of the cat, so the cat is behind the box.',
    },
  ]),
};

const compose: Skill = {
  id: 'm.compose',
  subject: 'math',
  strand: 'geometry',
  grade: 'K',
  title: 'Compose larger shapes from smaller shapes',
  kidTitle: 'Build with shapes',
  icon: '🏠',
  standards: ['K.GSR.8'],
  prereqs: ['m.shapes2d'],
  parentTip: 'Use pattern blocks or cut paper shapes. "Can you make a square from two triangles? A hexagon from two trapezoids?"',
  intro: [
    { say: 'Small shapes can join to make big shapes. A triangle on top of a square makes a house!', visual: { kind: 'composite', preset: 'house' } },
  ],
  items: items('m.compose', [
    {
      difficulty: 1,
      say: 'Which two shapes make this house?',
      show: 'Which shapes make the house?',
      visual: { kind: 'composite', preset: 'house' },
      choices: [
        vis({ kind: 'shapeRow', shapes: [{ shape: 'triangle', color: C.red }, { shape: 'square', color: C.blue }] }, 'a triangle and a square'),
        vis({ kind: 'shapeRow', shapes: [{ shape: 'circle', color: C.red }, { shape: 'square', color: C.blue }] }, 'a circle and a square', 'composition_part_mismatch'),
        vis({ kind: 'shapeRow', shapes: [{ shape: 'triangle', color: C.red }, { shape: 'circle', color: C.blue }] }, 'a triangle and a circle', 'composition_part_mismatch'),
      ],
      explain: 'The roof is a triangle and the bottom is a square. Together they make the house.',
    },
    {
      difficulty: 2,
      say: 'Two squares are pushed together. What new shape do they make?',
      show: '2 squares make…',
      visual: { kind: 'composite', preset: 'two-squares' },
      choices: [
        vis({ kind: 'shape', shape: 'rectangle', color: C.green, stretch: 2 }, 'a rectangle'),
        vis({ kind: 'shape', shape: 'square', color: C.green }, 'a square', 'composition_whole_mismatch'),
        vis({ kind: 'shape', shape: 'hexagon', color: C.green }, 'a hexagon', 'composition_whole_mismatch'),
      ],
      explain: 'Two squares side by side make a long shape with four square corners. That is a rectangle.',
    },
    {
      difficulty: 2,
      say: 'Which two shapes make this ice cream cone?',
      show: 'Which shapes make it?',
      visual: { kind: 'composite', preset: 'ice-cream' },
      choices: [
        vis({ kind: 'shapeRow', shapes: [{ shape: 'square', color: C.pink }, { shape: 'triangle', color: C.yellow, rotate: 180 }] }, 'a square and a triangle', 'composition_part_mismatch'),
        vis({ kind: 'shapeRow', shapes: [{ shape: 'circle', color: C.pink }, { shape: 'triangle', color: C.yellow, rotate: 180 }] }, 'a circle and a triangle'),
        vis({ kind: 'shapeRow', shapes: [{ shape: 'circle', color: C.pink }, { shape: 'rectangle', color: C.yellow }] }, 'a circle and a rectangle', 'composition_part_mismatch'),
      ],
      explain: 'The scoop is a circle and the cone is a triangle pointing down.',
    },
    {
      difficulty: 3,
      say: 'Two triangles are put together. What shape do they make?',
      show: '2 triangles make…',
      visual: { kind: 'composite', preset: 'square-from-triangles' },
      choices: [
        vis({ kind: 'shape', shape: 'triangle', color: C.blue }, 'a triangle', 'composition_whole_mismatch'),
        vis({ kind: 'shape', shape: 'square', color: C.blue }, 'a square'),
        vis({ kind: 'shape', shape: 'circle', color: C.blue }, 'a circle', 'composition_whole_mismatch'),
        vis({ kind: 'shape', shape: 'pentagon', color: C.blue }, 'a pentagon', 'composition_whole_mismatch'),
      ],
      explain: 'The two triangles share their long side. Together they make a square with four equal sides.',
    },
    {
      difficulty: 3,
      say: 'Two of the same shape make this hexagon. Which shape is it?',
      show: 'Which shape, used twice, makes the hexagon?',
      visual: { kind: 'composite', preset: 'hexagon-from-trapezoids' },
      choices: [
        vis({ kind: 'shape', shape: 'trapezoid', color: C.red }, 'trapezoid'),
        vis({ kind: 'shape', shape: 'triangle', color: C.red }, 'triangle', 'composition_part_mismatch'),
        vis({ kind: 'shape', shape: 'square', color: C.red }, 'square', 'composition_part_mismatch'),
        vis({ kind: 'shape', shape: 'rhombus', color: C.red }, 'rhombus', 'composition_part_mismatch'),
      ],
      explain: 'Cut a hexagon across the middle and you get two trapezoids.',
    },
  ]),
};

/* ------------------------------------------------------------------------ */
/* GRADE 1 STRETCH                                                          */
/* ------------------------------------------------------------------------ */

const add20: Skill = {
  id: 'm1.add20',
  subject: 'math',
  strand: 'algebra',
  grade: '1',
  title: 'Add within 20 (make-ten strategy)',
  kidTitle: 'Adding to 20',
  icon: '➕',
  standards: ['1.NR.2'],
  prereqs: ['m.add', 'm.make10', 'm.teens'],
  parentTip: 'For 8 + 5, show "8 needs 2 to make 10, then 3 more is 13" with two egg cartons.',
  intro: [
    { say: 'Eight plus five. Eight needs two more to make ten. Five is two and three. Ten and three is thirteen!', visual: { kind: 'tenFrame', filled: 13, frames: 2 } },
  ],
  generate: (rng, d) => {
    const a = d === 1 ? rng.int(10, 14) : rng.int(6, 9);
    const b = d === 1 ? rng.int(1, 5) : rng.int(11 - a, 9);
    const s = a + b;
    return makeItem('m1.add20', `${a}+${b}`, d, {
      say: d === 3 ? `Mia has ${a} stickers. She gets ${b} more. How many stickers does she have now?` : `What is ${a} plus ${b}?`,
      show: d === 3 ? `${a} stickers and ${b} more` : `${a} + ${b} = ?`,
      visual: d === 3 ? undefined : { kind: 'number', value: `${a} + ${b}` },
      choices: numberChoices(rng, s, [
        { n: s - 1, why: 'count_skipped_one' },
        { n: s + 1, why: 'count_double_tap' },
        { n: s - 10, why: 'lost_the_ten' },
        { n: Math.abs(a - b), why: 'subtracted_instead' },
      ], { min: 0, max: 30 }),
      explain: a < 10 ? `${a} needs ${10 - a} to make ten. ${b} is ${10 - a} and ${b - (10 - a)}. Ten and ${b - (10 - a)} is ${s}.` : `${a} is ten and ${a - 10}. Add ${b}: ten and ${a - 10 + b} is ${s}.`,
    });
  },
};

const sub20: Skill = {
  id: 'm1.sub20',
  subject: 'math',
  strand: 'algebra',
  grade: '1',
  title: 'Subtract within 20',
  kidTitle: 'Taking away to 20',
  icon: '➖',
  standards: ['1.NR.2'],
  prereqs: ['m.sub', 'm1.add20'],
  parentTip: 'Use "think addition": for 13 − 5, ask "5 plus what makes 13?"',
  intro: [{ say: 'Thirteen minus five. Think: five plus what makes thirteen? Five plus eight is thirteen, so the answer is eight!' }],
  generate: (rng, d) => {
    const a = d === 1 ? rng.int(11, 19) : rng.int(11, 18);
    const b = d === 1 ? rng.int(1, a - 10) : rng.int(a - 9, 9);
    const r = a - b;
    return makeItem('m1.sub20', `${a}-${b}`, d, {
      say: d === 3 ? `There are ${a} birds. ${b} fly away. How many birds are left?` : `What is ${a} minus ${b}?`,
      show: d === 3 ? `${a} birds, ${b} fly away` : `${a} − ${b} = ?`,
      visual: d === 3 ? undefined : { kind: 'number', value: `${a} − ${b}` },
      choices: numberChoices(rng, r, [
        { n: a + b, why: 'added_instead' },
        { n: r + 1, why: 'count_double_tap' },
        { n: r - 1, why: 'count_skipped_one' },
        { n: Math.abs((a % 10) - b), why: 'smaller_from_larger_digit' },
      ], { min: 0, max: 40 }),
      explain: `Think addition: ${b} plus ${r} is ${a}. So ${a} minus ${b} is ${r}.`,
    });
  },
};

const tenMore: Skill = {
  id: 'm1.tenmore',
  subject: 'math',
  strand: 'number',
  grade: '1',
  title: '10 more and 10 less than a number',
  kidTitle: 'Ten more, ten less',
  icon: '🔟',
  standards: ['1.NR.1'],
  prereqs: ['m.tens', 'm.teens'],
  parentTip: 'On a 100 chart, show that 10 more is "one row down" and 10 less is "one row up".',
  intro: [{ say: 'Ten more than thirty four is forty four. The tens go up by one. The ones stay the same!', visual: { kind: 'row', items: [{ kind: 'number', value: 34 }, { kind: 'number', value: '→ 44' }] } }],
  generate: (rng, d) => {
    const n = rng.int(12, 88);
    const more = d !== 2;
    const ans = more ? n + 10 : n - 10;
    return makeItem('m1.tenmore', `${n}${more ? '+' : '-'}`, d, {
      say: `What number is ten ${more ? 'more' : 'less'} than ${n}?`,
      show: `10 ${more ? 'more' : 'less'} than ${n}`,
      choices: numberChoices(rng, ans, [
        { n: more ? n + 1 : n - 1, why: 'one_instead_of_ten' },
        { n: more ? n - 10 : n + 10, why: 'more_less_confusion' },
        { n: more ? n + 11 : n - 11, why: 'near_miss' },
      ], { min: 0, max: 110 }),
      explain: `${n} has ${Math.floor(n / 10)} tens. Ten ${more ? 'more' : 'less'} has ${Math.floor(ans / 10)} tens. The ones stay ${n % 10}. The answer is ${ans}.`,
    });
  },
};

const compare100: Skill = {
  id: 'm1.compare100',
  subject: 'math',
  strand: 'number',
  grade: '1',
  title: 'Compare two-digit numbers (place value)',
  kidTitle: 'Big number compare',
  icon: '🐊',
  standards: ['1.NR.1'],
  prereqs: ['m.compare', 'm.tens'],
  parentTip: 'Play "War" with two cards making a two-digit number. Whoever has more tens wins; if tied, compare ones.',
  intro: [{ say: 'To compare big numbers, look at the tens first. Seventy four has seven tens. Forty seven has only four tens. So seventy four is greater.' }],
  generate: (rng, d) => {
    let t = rng.int(2, 8);
    let o = rng.int(1, 9);
    if (t === o) o = o === 9 ? 1 : o + 1;
    const big = Math.max(t * 10 + o, o * 10 + t);
    const small = Math.min(t * 10 + o, o * 10 + t);
    const near = big - 1 === small ? big - 2 : big - 1;
    const askGreatest = d !== 2;
    const nums = rng.shuffle([big, small, near]);
    const target = askGreatest ? big : small;
    return makeItem('m1.compare100', `${nums.join('-')}${askGreatest ? 'g' : 'l'}`, d, {
      say: `Which number is the ${askGreatest ? 'greatest' : 'least'}?`,
      show: `Which is the ${askGreatest ? 'greatest' : 'least'}?`,
      choices: nums.map((n) =>
        n === target ? { text: String(n), say: String(n), correct: true as const } : { text: String(n), say: String(n), why: (n === small || n === big) ? 'digit_order_ignored' : 'near_miss' },
      ),
      explain: askGreatest
        ? `Look at the tens first. ${small} has only ${Math.floor(small / 10)} tens. ${near} and ${big} both have ${Math.floor(big / 10)} tens, so compare the ones. ${big} is the greatest.`
        : `Look at the tens first. ${small} has only ${Math.floor(small / 10)} tens. The others have ${Math.floor(big / 10)} tens. So ${small} is the least.`,
    });
  },
};

const time: Skill = {
  id: 'm1.time',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Tell time to the hour and half hour',
  kidTitle: 'Tell time',
  icon: '🕒',
  standards: ['1.MDR.6'],
  prereqs: ['m.numerals'],
  parentTip: 'Use a real analog clock at bedtime and lunch: "The short hand is on 7 — it is 7 o\'clock!"',
  intro: [{ say: 'The short hand tells the hour. When the long hand points straight up to twelve, it is something o clock.', visual: { kind: 'clock', hour: 3, minute: 0 } }],
  generate: (rng, d) => {
    const h = rng.int(1, 12);
    const half = d === 3;
    const wrap = (x: number) => ((x + 11) % 12) + 1;
    const label = (hh: number, mm: number) => `${wrap(hh)}:${mm === 0 ? '00' : String(mm).padStart(2, '0')}`;
    const spoken = (hh: number, mm: number) => (mm === 0 ? `${wrap(hh)} o'clock` : mm === 30 ? `${wrap(hh)} thirty` : `${wrap(hh)} ${mm}`);
    const options: { hh: number; mm: number; why?: string }[] = half
      ? [{ hh: h, mm: 30 }, { hh: h + 1, mm: 30, why: 'half_hour_next_hour' }, { hh: h, mm: 0, why: 'ignored_minute_hand' }, { hh: h - 1, mm: 30, why: 'near_miss' }]
      : [{ hh: h, mm: 0 }, { hh: 12, mm: (h % 12) * 5, why: 'hands_swapped' }, { hh: h + 1, mm: 0, why: 'near_miss' }, { hh: h - 1, mm: 0, why: 'near_miss' }];
    const seen = new Set<string>();
    const choices = options
      .filter((o) => {
        const key = label(o.hh, o.mm);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((o) => (o.why ? { text: label(o.hh, o.mm), say: spoken(o.hh, o.mm), why: o.why } : { text: label(o.hh, o.mm), say: spoken(o.hh, o.mm), correct: true as const }));
    return makeItem('m1.time', `${h}:${half ? 30 : 0}`, d, {
      say: 'What time does the clock show?',
      show: 'What time is it?',
      visual: { kind: 'clock', hour: h, minute: half ? 30 : 0 },
      choices,
      explain: half
        ? `The long hand points to six, so it is half past. The short hand is just past ${h}. It is ${spoken(h, 30)}.`
        : `The long hand points to twelve. The short hand points to ${h}. It is ${h} o'clock.`,
    });
  },
};

const units: Skill = {
  id: 'm1.units',
  subject: 'math',
  strand: 'measure',
  grade: '1',
  title: 'Measure length with same-size units',
  kidTitle: 'Measure it',
  icon: '📎',
  standards: ['1.MDR.6'],
  prereqs: ['m.measure', 'm.count10'],
  parentTip: 'Measure a book with paper clips or Lego bricks. Check: no gaps, no overlaps.',
  intro: [{ say: 'To measure, line up units end to end with no gaps. Then count them.', visual: { kind: 'measure', emoji: '✏️', units: 5, unit: '📎' } }],
  generate: (rng, d) => {
    const n = d === 1 ? rng.int(2, 5) : d === 2 ? rng.int(5, 8) : rng.int(8, 12);
    const thing = rng.pick(['✏️', '🖍️', '🥕', '🐛', '🥖']);
    return makeItem('m1.units', `${thing}${n}`, d, {
      say: 'How many paper clips long is it?',
      show: 'How many paper clips long?',
      visual: { kind: 'measure', emoji: thing, units: n, unit: '📎' },
      choices: numberChoices(rng, n, [
        { n: n - 1, why: 'count_skipped_one' },
        { n: n + 1, why: 'count_double_tap' },
      ], { min: 1, max: 15 }),
      explain: `Count the paper clips under it: ${countUp(n)}. It is ${n} paper clips long.`,
    });
  },
};

const halves: Skill = {
  id: 'm1.halves',
  subject: 'math',
  strand: 'geometry',
  grade: '1',
  title: 'Equal shares: halves and fourths',
  kidTitle: 'Halves and fourths',
  icon: '🍕',
  standards: ['1.GSR.4'],
  prereqs: ['m.shapes2d'],
  parentTip: 'Cut sandwiches or tortillas into halves and fourths. Ask: "Are the pieces fair? Same size?"',
  intro: [{ say: 'Halves means two EQUAL parts. Both parts must be the same size.', visual: { kind: 'shapeRow', shapes: [{ shape: 'circle-halves', color: C.orange }, { shape: 'rect-halves', color: C.blue }] } }],
  items: items('m1.halves', [
    {
      difficulty: 1,
      say: 'Which shape shows halves? Halves are two equal parts.',
      show: 'Which shows halves?',
      choices: [
        vis({ kind: 'shape', shape: 'circle-halves', color: C.orange }, undefined),
        vis({ kind: 'shape', shape: 'circle-unequal', color: C.orange }, undefined, 'unequal_parts_accepted'),
        vis({ kind: 'shape', shape: 'circle-fourths', color: C.orange }, undefined, 'halves_fourths_confusion'),
      ],
      speakChoices: false,
      explain: 'Halves are two parts that are the same size. Only one circle is cut into two equal parts.',
    },
    {
      difficulty: 2,
      say: 'Which shape shows fourths? Fourths are four equal parts.',
      show: 'Which shows fourths?',
      choices: [
        vis({ kind: 'shape', shape: 'rect-halves', color: C.blue }, undefined, 'halves_fourths_confusion'),
        vis({ kind: 'shape', shape: 'rect-unequal', color: C.blue }, undefined, 'unequal_parts_accepted'),
        vis({ kind: 'shape', shape: 'rect-fourths', color: C.blue }, undefined),
      ],
      speakChoices: false,
      explain: 'Fourths are four parts that are all the same size.',
    },
    {
      difficulty: 3,
      say: 'A pizza is cut into fourths. Is one fourth bigger or smaller than one half?',
      show: 'Is one fourth bigger or smaller than one half?',
      visual: { kind: 'shapeRow', shapes: [{ shape: 'circle-halves', color: C.yellow }, { shape: 'circle-fourths', color: C.yellow }] },
      choices: [txt('smaller'), txt('bigger', 'more_parts_bigger_pieces'), txt('the same', 'more_parts_bigger_pieces')],
      explain: 'Cutting into more parts makes each part smaller. A fourth is smaller than a half.',
    },
    {
      difficulty: 1,
      say: 'Which rectangle is cut into two equal parts?',
      show: 'Two equal parts',
      choices: [
        vis({ kind: 'shape', shape: 'rect-unequal', color: C.green }, undefined, 'unequal_parts_accepted'),
        vis({ kind: 'shape', shape: 'rect-halves', color: C.green }, undefined),
        vis({ kind: 'shape', shape: 'rect-fourths', color: C.green }, undefined, 'halves_fourths_confusion'),
      ],
      speakChoices: false,
      explain: 'Two equal parts are called halves. Only one rectangle has two parts that are the same size.',
    },
    {
      difficulty: 2,
      say: 'This circle is cut into equal parts. How many equal parts are there?',
      show: 'How many equal parts?',
      visual: { kind: 'shape', shape: 'circle-fourths', color: C.purple },
      choices: [num(2, 'halves_fourths_confusion'), num(3, 'count_skipped_one'), num(4)],
      explain: 'Count the parts: 1, 2, 3, 4. Four equal parts are called fourths, or quarters.',
    },
    {
      difficulty: 3,
      say: 'This rectangle is cut into four equal parts. What is one part called?',
      show: 'One of four equal parts is a…',
      visual: { kind: 'shape', shape: 'rect-fourths', color: C.teal },
      choices: [txt('a fourth'), txt('a half', 'halves_fourths_confusion'), txt('a whole', 'part_whole_confusion')],
      explain: 'When a whole is cut into four equal parts, each part is one fourth. Four fourths make the whole.',
    },
  ]),
};

const growPattern: Skill = {
  id: 'm1.growpattern',
  subject: 'math',
  strand: 'algebra',
  grade: '1',
  title: 'Growing and shrinking patterns',
  kidTitle: 'Growing patterns',
  icon: '📈',
  standards: ['1.PAR.3'],
  prereqs: ['m.pattern', 'm.seqnext'],
  parentTip: 'Build stair steps with blocks (1, 2, 3…) and ask how many blocks the next step needs.',
  intro: [{ say: 'Some patterns grow. Two, four, six, eight. Each time we add two more!', visual: { kind: 'sequence', items: ['2', '4', '6', '8'], blank: -1 } }],
  generate: (rng, d) => {
    const step = d === 1 ? 1 : d === 2 ? 2 : rng.pick([3, 5, -2]);
    const start = step < 0 ? rng.int(14, 20) : rng.int(1, 5);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const ans = seq[3];
    return makeItem('m1.growpattern', `${start}${step}`, d, {
      say: `${seq.slice(0, 3).join(', ')}. What number comes next?`,
      show: 'What comes next?',
      visual: { kind: 'sequence', items: seq.map(String), blank: 3 },
      choices: numberChoices(rng, ans, [
        { n: seq[2] + (step > 0 ? 1 : -1), why: 'used_step_of_one' },
        { n: seq[2], why: 'repeated_previous' },
        { n: ans + step, why: 'skipped_a_number' },
      ], { min: 0, max: 40 }),
      explain: `Each number ${step > 0 ? 'grows' : 'shrinks'} by ${Math.abs(step)}. ${seq[2]} ${step > 0 ? 'plus' : 'minus'} ${Math.abs(step)} is ${ans}.`,
    });
  },
};

export const MATH_SKILLS: Skill[] = [
  count10,
  subitize,
  numerals,
  count20,
  seqNext,
  countBack,
  tens,
  compare,
  teens,
  add,
  sub,
  bonds,
  make10,
  pattern,
  measure,
  data,
  shapes2d,
  shapeAttr,
  shapes3d,
  position,
  compose,
  add20,
  sub20,
  tenMore,
  compare100,
  time,
  units,
  halves,
  growPattern,
];
