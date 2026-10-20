import type { Choice, Skill, Visual } from './types';
import { items, makeItem, num, numberChoices, txt, vis } from './helpers';

/* Grade 2 math (Georgia K-12 Mathematics Standards, 2nd grade). */

const tensOnes = (n: number) => ({ h: Math.floor(n / 100), t: Math.floor((n % 100) / 10), o: n % 10 });

const placeValue: Skill = {
  id: 'm2.placevalue',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: 'Place value to 1,000 (hundreds, tens, ones)',
  kidTitle: 'Hundreds, tens, ones',
  icon: '🧱',
  standards: ['2.NR.1'],
  prereqs: ['m1.tenmore'],
  parentTip: 'Use coins as place value: ₹/$1 = ones, 10 = tens, 100 = hundreds. Build 347 and ask what each digit is worth.',
  intro: [{ say: 'A big square is one hundred. A long stick is ten. A little cube is one. This shows one hundred, two tens and three ones: one hundred twenty three!', visual: { kind: 'baseTen', hundreds: 1, tens: 2, ones: 3 } }],
  generate: (rng, d) => {
    if (d === 1) {
      const n = rng.int(21, 99);
      const { t, o } = tensOnes(n);
      return makeItem('m2.placevalue', `blocks${n}`, d, {
        say: 'What number do the blocks show?',
        show: 'What number is this?',
        visual: { kind: 'baseTen', hundreds: 0, tens: t, ones: o },
        choices: numberChoices(rng, n, [
          { n: o * 10 + t, why: 'tens_ones_reversed' },
          { n: t + o, why: 'counted_blocks_not_value' },
          { n: n + 10, why: 'miscounted_tens' },
        ], { min: 1, max: 200 }),
        explain: `${t} tens is ${t * 10}, and ${o} ones. ${t * 10} and ${o} make ${n}.`,
      });
    }
    if (d === 2) {
      const n = rng.int(102, 989);
      const { h, t, o } = tensOnes(n);
      const which = rng.pick(['hundreds', 'tens'] as const);
      const digit = which === 'hundreds' ? h : t;
      if (digit === 0 || digit === o || (which === 'tens' && t === h)) return placeValue.generate!(rng, d);
      const value = which === 'hundreds' ? h * 100 : t * 10;
      return makeItem('m2.placevalue', `value${n}${which}`, d, {
        say: `In the number ${n}, what is the ${digit} worth?`,
        show: `${n}: what is the ${digit} worth?`,
        visual: { kind: 'number', value: n },
        choices: numberChoices(rng, value, [
          { n: digit, why: 'digit_not_value' },
          { n: which === 'hundreds' ? digit * 10 : digit * 100, why: 'wrong_place' },
          { n: n, why: 'whole_number_not_digit' },
        ], { min: 1, max: 1000 }),
        explain: `The ${digit} is in the ${which} place, so it is worth ${value}.`,
      });
    }
    const h = rng.int(1, 9);
    const o = rng.int(1, 9);
    const n = h * 100 + o;
    return makeItem('m2.placevalue', `zero${n}`, d, {
      say: `Which number has ${h} hundreds, 0 tens, and ${o} ones?`,
      show: `${h} hundreds, 0 tens, ${o} ones`,
      choices: numberChoices(rng, n, [
        { n: h * 10 + o, why: 'zero_placeholder_dropped' },
        { n: h * 100 + o * 10, why: 'wrong_place' },
        { n: h * 1000 + o, why: 'zero_placeholder_added' },
      ], { min: 1, max: 10000 }),
      explain: `${h} hundreds is ${h * 100}. Zero tens holds the tens place. Then ${o} ones. The number is ${n}.`,
    });
  },
};

const compare1000: Skill = {
  id: 'm2.compare1000',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: 'Compare three-digit numbers',
  kidTitle: 'Compare to 1,000',
  icon: '🐊',
  standards: ['2.NR.1'],
  prereqs: ['m2.placevalue', 'm1.compare100'],
  parentTip: 'Write two 3-digit numbers. Ask: “Which has more hundreds? If the same, which has more tens?”',
  intro: [{ say: 'To compare big numbers, look at the hundreds first. If they are the same, look at the tens, then the ones.' }],
  generate: (rng, d) => {
    const h = rng.int(2, 8);
    const t = rng.int(1, 8);
    const o = rng.int(1, 8);
    const base = h * 100 + t * 10 + o;
    const swapped = o * 100 + t * 10 + h;
    const options = d === 1 ? [base, base - 100, base - 200] : d === 2 ? [base, base - 10, base - 20] : [base, swapped, base - 1];
    const uniq = [...new Set(options)].filter((x) => x > 0);
    if (uniq.length < 3) return compare1000.generate!(rng, d);
    const target = Math.max(...uniq);
    return makeItem('m2.compare1000', uniq.join('-'), d, {
      say: 'Which number is the greatest?',
      show: 'Which is the greatest?',
      choices: rng.shuffle(uniq).map((x) => (x === target ? { text: String(x), say: String(x), correct: true as const } : { text: String(x), say: String(x), why: x === swapped ? 'digit_order_ignored' : 'compared_wrong_place' })),
      explain: `Compare hundreds first, then tens, then ones. ${target} is the greatest.`,
    });
  },
};

const add2d: Skill = {
  id: 'm2.add2d',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Add two- and three-digit numbers (with regrouping)',
  kidTitle: 'Big adding',
  icon: '➕',
  standards: ['2.NR.2'],
  prereqs: ['m1.add20', 'm2.placevalue'],
  parentTip: 'Add the tens, then the ones: 38 + 47 → 30 + 40 = 70, 8 + 7 = 15, 70 + 15 = 85. Ask him to explain the “extra ten”.',
  intro: [{ say: 'Thirty eight plus forty seven. Add the tens: thirty plus forty is seventy. Add the ones: eight plus seven is fifteen. Seventy and fifteen make eighty five!' }],
  generate: (rng, d) => {
    let a: number;
    let b: number;
    if (d === 1) {
      a = rng.int(2, 6) * 10 + rng.int(1, 4);
      b = rng.int(1, 3) * 10 + rng.int(1, 5);
    } else if (d === 2) {
      a = rng.int(2, 6) * 10 + rng.int(5, 9);
      b = rng.int(1, 3) * 10 + rng.int(10 - (a % 10), 9);
    } else {
      a = rng.int(1, 5) * 100 + rng.int(1, 6) * 10 + rng.int(5, 9);
      b = rng.int(1, 3) * 100 + rng.int(1, 2) * 10 + rng.int(10 - (a % 10), 9);
    }
    const sum = a + b;
    const carry = (a % 10) + (b % 10) >= 10;
    const story = d === 3 && rng.next() < 0.5;
    return makeItem('m2.add2d', `${a}+${b}`, d, {
      say: story ? `A library has ${a} picture books and ${b} chapter books. How many books in all?` : `What is ${a} plus ${b}?`,
      show: story ? `${a} picture books + ${b} chapter books` : `${a} + ${b} = ?`,
      visual: story ? undefined : { kind: 'number', value: `${a} + ${b}` },
      choices: numberChoices(rng, sum, [
        ...(carry ? [{ n: sum - 10, why: 'forgot_carry' }] : []),
        { n: sum + 10, why: 'extra_ten' },
        { n: Math.abs(a - b), why: 'subtracted_instead' },
        { n: sum + 1, why: 'near_miss' },
      ], { min: 0, max: 2000 }),
      hint: 'Add the tens. Add the ones. Then put them together.',
      explain: `Tens: ${a - (a % 10)} + ${b - (b % 10)} = ${a - (a % 10) + b - (b % 10)}. Ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}. Together: ${sum}.${carry ? ' The ones made an extra ten!' : ''}`,
    });
  },
};

const sub2d: Skill = {
  id: 'm2.sub2d',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Subtract two- and three-digit numbers (with regrouping)',
  kidTitle: 'Big taking away',
  icon: '➖',
  standards: ['2.NR.2'],
  prereqs: ['m1.sub20', 'm2.add2d'],
  parentTip: 'Count up to subtract: for 52 − 27, start at 27, jump +3 to 30, +22 to 52. 3 + 22 = 25.',
  intro: [{ say: 'Fifty two minus twenty seven. Count up from twenty seven: three more makes thirty, then twenty two more makes fifty two. Three and twenty two is twenty five!' }],
  generate: (rng, d) => {
    let a: number;
    let b: number;
    if (d === 1) {
      a = rng.int(4, 9) * 10 + rng.int(5, 9);
      b = rng.int(1, 3) * 10 + rng.int(1, a % 10);
    } else if (d === 2) {
      a = rng.int(4, 9) * 10 + rng.int(0, 4);
      b = rng.int(1, 3) * 10 + rng.int((a % 10) + 1, 9);
    } else {
      a = rng.int(3, 9) * 100 + rng.int(2, 9) * 10 + rng.int(0, 4);
      b = rng.int(1, 2) * 100 + rng.int(1, 5) * 10 + rng.int((a % 10) + 1, 9);
    }
    const diff = a - b;
    const borrow = a % 10 < b % 10;
    // Classic error: subtracting the smaller digit from the larger in each place.
    const smallFromLarge = Number(String(a).padStart(3, '0').split('').map((x, i) => Math.abs(Number(x) - Number(String(b).padStart(3, '0')[i]))).join(''));
    return makeItem('m2.sub2d', `${a}-${b}`, d, {
      say: `What is ${a} minus ${b}?`,
      show: `${a} − ${b} = ?`,
      visual: { kind: 'number', value: `${a} − ${b}` },
      choices: numberChoices(rng, diff, [
        ...(borrow ? [{ n: smallFromLarge, why: 'smaller_from_larger_digit' }] : []),
        ...(borrow ? [{ n: diff + 10, why: 'forgot_borrow' }] : []),
        { n: a + b, why: 'added_instead' },
        { n: diff - 1, why: 'near_miss' },
      ], { min: 0, max: 2000 }),
      hint: `Try counting up from ${b} to ${a}.`,
      explain: `Count up from ${b} to ${a}: that is ${diff}. Check: ${b} + ${diff} = ${a}.`,
    });
  },
};

const skipCount: Skill = {
  id: 'm2.skipcount',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: 'Skip count by 2s, 5s, 10s and 100s',
  kidTitle: 'Skip counting',
  icon: '🦘',
  standards: ['2.NR.1'],
  prereqs: ['m.tens'],
  parentTip: 'Skip count while jumping: by 2s on stairs, by 5s with high-fives, by 100s while clapping.',
  intro: [{ say: 'Skip counting jumps over numbers. By fives: five, ten, fifteen, twenty!', visual: { kind: 'sequence', items: ['5', '10', '15', '20'], blank: -1 } }],
  generate: (rng, d) => {
    const step = d === 1 ? rng.pick([2, 5]) : d === 2 ? rng.pick([5, 10, 100]) : rng.pick([2, 5, 10, 100]);
    const start = d === 3 ? rng.int(1, 9) * step + (step === 100 ? rng.pick([0, 50]) : 0) : step * rng.int(1, 4);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const blank = d === 1 ? 3 : rng.int(1, 3);
    const ans = seq[blank];
    return makeItem('m2.skipcount', `${step}-${start}-${blank}`, d, {
      say: blank === 3 ? `Count by ${step}s: ${seq.slice(0, 3).join(', ')}. What comes next?` : `Count by ${step}s. Which number is missing?`,
      show: `Count by ${step}s`,
      visual: { kind: 'sequence', items: seq.map(String), blank },
      choices: numberChoices(rng, ans, [
        { n: seq[blank - 1] + 1, why: 'counted_by_ones' },
        { n: ans + step, why: 'skipped_a_step' },
        { n: seq[blank - 1] + (step === 2 ? 5 : 2), why: 'wrong_step' },
      ], { min: 0, max: 2000 }),
      explain: `Each jump adds ${step}. ${seq[blank - 1]} plus ${step} is ${ans}.`,
    });
  },
};

const oddEven: Skill = {
  id: 'm2.oddeven',
  subject: 'math',
  strand: 'number',
  grade: '2',
  title: 'Odd and even numbers',
  kidTitle: 'Odd or even',
  icon: '👯',
  standards: ['2.NR.3'],
  prereqs: ['m2.skipcount'],
  parentTip: 'Pair up socks or crackers: if every one has a partner, the number is even.',
  intro: [{ say: 'Even numbers can make pairs with none left over. Six is even: three pairs! Seven is odd: one is left out.', visual: { kind: 'groups', groups: [{ emoji: '🧦', count: 6 }, { emoji: '🧦', count: 7 }], sep: '|' } }],
  generate: (rng, d) => {
    const wantEven = rng.next() < 0.5;
    const max = d === 1 ? 10 : d === 2 ? 30 : 200;
    const pool = new Set<number>();
    const target = (() => {
      let n = rng.int(2, max);
      if ((n % 2 === 0) !== wantEven) n++;
      return n;
    })();
    while (pool.size < 3) {
      let n = rng.int(1, max);
      if ((n % 2 === 0) === wantEven) n++;
      if (n !== target) pool.add(n);
    }
    const word = wantEven ? 'even' : 'odd';
    return makeItem('m2.oddeven', `${word}${target}-${[...pool].join('-')}`, d, {
      say: `Which number is ${word}?`,
      show: `Which number is ${word}?`,
      choices: [{ text: String(target), say: String(target), correct: true as const }, ...[...pool].map((n) => ({ text: String(n), say: String(n), why: 'odd_even_confusion' }))],
      explain: `Look at the ones digit. Even numbers end in 0, 2, 4, 6 or 8. ${target} ends in ${target % 10}, so it is ${word}.`,
    });
  },
};

const groups: Skill = {
  id: 'm2.groups',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Equal groups and arrays (foundations of multiplication)',
  kidTitle: 'Equal groups',
  icon: '🍱',
  standards: ['2.NR.3'],
  prereqs: ['m1.add20'],
  parentTip: 'Set the table: 4 plates with 3 grapes each. “How many grapes? Can you count by 3s?”',
  intro: [{ say: 'Three groups of four. Four, eight, twelve. Twelve in all!', visual: { kind: 'groups', groups: [{ emoji: '🍓', count: 4 }, { emoji: '🍓', count: 4 }, { emoji: '🍓', count: 4 }], sep: '|' } }],
  generate: (rng, d) => {
    const g = d === 1 ? rng.int(2, 3) : rng.int(3, 5);
    const k = d === 1 ? rng.int(2, 3) : rng.int(2, 5);
    const total = g * k;
    const emoji = rng.pick(['🍓', '🐞', '⭐', '🍪', '🎈']);
    const visual: Visual | undefined = d === 3 ? undefined : { kind: 'groups', groups: Array.from({ length: g }, () => ({ emoji, count: k })), sep: '|' };
    return makeItem('m2.groups', `${g}x${k}-${d}`, d, {
      say: d === 3 ? `There are ${g} boxes. Each box has ${k} crayons. How many crayons in all?` : `There are ${g} groups. Each group has ${k}. How many in all?`,
      show: d === 3 ? `${g} boxes, ${k} crayons in each` : `${g} groups of ${k}`,
      visual,
      choices: numberChoices(rng, total, [
        { n: g + k, why: 'added_groups_and_size' },
        { n: k, why: 'counted_one_group' },
        { n: total + k, why: 'extra_group' },
      ], { min: 1, max: 60 }),
      explain: `Count by ${k}s, ${g} times: ${Array.from({ length: g }, (_, i) => (i + 1) * k).join(', ')}. ${g} groups of ${k} is ${total}.`,
    });
  },
};

const time5: Skill = {
  id: 'm2.time5',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'Tell time to the nearest five minutes',
  kidTitle: 'Time to 5 minutes',
  icon: '⏰',
  standards: ['2.MDR.6'],
  prereqs: ['m1.time', 'm2.skipcount'],
  parentTip: 'On an analog clock, count by 5s around the numbers: the 1 is 5 minutes, the 2 is 10…',
  intro: [{ say: 'The long hand counts minutes by fives. Each number is five more minutes. Pointing at four means twenty minutes.', visual: { kind: 'clock', hour: 3, minute: 20 } }],
  generate: (rng, d) => {
    const h = rng.int(1, 12);
    const m = d === 1 ? rng.pick([15, 30, 45]) : d === 2 ? rng.pick([5, 10, 20, 25, 35, 40]) : rng.pick([40, 45, 50, 55]);
    const fmt = (hh: number, mm: number) => `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
    const seen = new Set<string>();
    const options: Omit<Choice, 'id'>[] = [];
    const add = (hh: number, mm: number, why?: string) => {
      const t = fmt(hh, mm);
      if (seen.has(t) || mm > 59) return;
      seen.add(t);
      options.push(why ? { text: t, say: t, why } : { text: t, say: t, correct: true });
    };
    add(h, m);
    if (m >= 30) add(h + 1, m, 'read_next_hour');
    add(h, m / 5, 'minute_hand_as_number');
    add(h, (m + 5) % 60, 'near_miss');
    add(h, m - 5, 'near_miss');
    return makeItem('m2.time5', `${h}:${m}`, d, {
      say: 'What time does the clock show?',
      show: 'What time is it?',
      visual: { kind: 'clock', hour: h, minute: m },
      choices: options.slice(0, 4),
      hint: 'Count by fives to the long hand.',
      explain: `The short hand is ${m >= 30 ? `past ${h}, but not yet at ${((h % 12) + 1)}` : `just past ${h}`}. The long hand points to ${m / 5}: count by fives, that is ${m} minutes. It is ${fmt(h, m)}.`,
    });
  },
};

const US = { 1: 'penny', 5: 'nickel', 10: 'dime', 25: 'quarter' } as const;
const coinVisual = (values: (keyof typeof US)[]): Visual => ({ kind: 'coins', values, symbol: '¢', labels: values.map((v) => US[v]) });

const usMoney: Skill = {
  id: 'm2.money',
  subject: 'math',
  strand: 'measure',
  grade: '2',
  title: 'US coins: values and totals',
  kidTitle: 'Coins',
  icon: '🪙',
  standards: ['2.MDR.6'],
  prereqs: ['m1.coins', 'm2.skipcount'],
  parentTip: 'Empty your pocket change and sort it. A dime is smaller than a nickel but worth more — great conversation starter!',
  intro: [{ say: 'A penny is one cent. A nickel is five cents. A dime is ten cents, even though it is small. A quarter is twenty five cents.', visual: coinVisual([1, 5, 10, 25]) }],
  regions: ['us-ga'],
  generate: (rng, d) => {
    if (d === 1) {
      const v = rng.pick([5, 10, 25] as const);
      return makeItem('m2.money', `find${v}`, d, {
        say: `Which coin is worth ${v} cents?`,
        show: `Which coin is worth ${v}¢?`,
        choices: ([1, 5, 10, 25] as const).map((c) => (c === v ? { visual: coinVisual([c]), say: US[c], correct: true as const } : { visual: coinVisual([c]), say: US[c], why: c === 5 && v === 10 ? 'coin_size_means_value' : 'coin_value_unknown' })),
        explain: `A ${US[v]} is worth ${v} cents.`,
      });
    }
    const coins = rng.shuffle([25, 10, 10, 5, 1, 1, 5, 25] as const).slice(0, d === 2 ? 3 : 4).sort((a, b) => b - a);
    const total = coins.reduce<number>((a, b) => a + b, 0);
    return makeItem('m2.money', `sum${coins.join('-')}`, d, {
      say: 'How many cents are these coins worth?',
      show: 'How many cents?',
      visual: coinVisual([...coins]),
      choices: numberChoices(rng, total, [
        { n: coins.length, why: 'counted_coins_not_value' },
        { n: total - 5, why: 'near_miss' },
        { n: coins.length * 10, why: 'coin_value_unknown' },
      ], { min: 1, max: 150 }).map((c) => ({ ...c, text: `${c.text}¢`, say: `${c.say} cents` })),
      hint: 'Start with the coin worth the most, then count on.',
      explain: `Start with the biggest value and count on: ${coins.map((_, i) => coins.slice(0, i + 1).reduce<number>((a, b) => a + b, 0)).join(', ')}. That is ${total} cents.`,
    });
  },
};

const wordProblems: Skill = {
  id: 'm2.wordprob',
  subject: 'math',
  strand: 'algebra',
  grade: '2',
  title: 'Two-step and comparison word problems within 100',
  kidTitle: 'Story problems',
  icon: '📘',
  standards: ['2.NR.2'],
  prereqs: ['m2.add2d', 'm2.sub2d'],
  parentTip: 'Ask him to draw a quick picture or bar for each story before solving. Then ask: “Does the answer make sense?”',
  intro: [{ say: 'Story problems can have two steps. Read carefully, find what happens first, then what happens next.' }],
  generate: (rng, d) => {
    if (d === 1) {
      const a = rng.int(25, 60);
      const b = rng.int(10, a - 5);
      return makeItem('m2.wordprob', `cmp${a}-${b}`, d, {
        say: `Mia read ${a} pages. Leo read ${b} pages. How many more pages did Mia read than Leo?`,
        show: `Mia ${a} pages, Leo ${b} pages. How many more did Mia read?`,
        choices: numberChoices(rng, a - b, [{ n: a + b, why: 'added_instead' }, { n: a, why: 'answered_one_part' }, { n: a - b + 1, why: 'near_miss' }], { min: 0, max: 200 }),
        explain: `Compare: ${a} minus ${b} is ${a - b}. Mia read ${a - b} more pages.`,
      });
    }
    const start = rng.int(30, 70);
    const add = rng.int(10, 25);
    const sub = rng.int(5, 20);
    const ans = start + add - sub;
    if (d === 2) {
      return makeItem('m2.wordprob', `two${start}+${add}-${sub}`, d, {
        say: `There were ${start} people on a train. At the first stop, ${add} people got on. At the next stop, ${sub} people got off. How many people are on the train now?`,
        show: `${start} on the train, ${add} get on, ${sub} get off`,
        choices: numberChoices(rng, ans, [{ n: start + add, why: 'ignored_second_step' }, { n: start + add + sub, why: 'added_all' }, { n: start - sub, why: 'ignored_first_step' }], { min: 0, max: 200 }),
        explain: `First: ${start} + ${add} = ${start + add}. Then: ${start + add} − ${sub} = ${ans}.`,
      });
    }
    const total = rng.int(60, 99);
    const part = rng.int(20, 40);
    return makeItem('m2.wordprob', `missing${total}-${part}`, d, {
      say: `Sam has some stickers. He gets ${part} more. Now he has ${total}. How many stickers did Sam have at the start?`,
      show: `Some stickers + ${part} = ${total}. How many at the start?`,
      choices: numberChoices(rng, total - part, [{ n: total + part, why: 'added_instead' }, { n: part, why: 'answered_one_part' }, { n: total - part + 10, why: 'forgot_borrow' }], { min: 0, max: 200 }),
      explain: `Something plus ${part} is ${total}. Work backwards: ${total} − ${part} = ${total - part}.`,
    });
  },
};

const shapes2: Skill = {
  id: 'm2.shapes',
  subject: 'math',
  strand: 'geometry',
  grade: '2',
  title: 'Shape attributes: angles, faces, quadrilaterals; rows and columns',
  kidTitle: 'Shape detective',
  icon: '🔷',
  standards: ['2.GSR.7'],
  prereqs: ['m.shapeattr', 'm1.halves'],
  parentTip: 'Count corners (angles) and faces on real boxes and cans. Tear a paper into 2 rows and 3 columns and count the squares.',
  intro: [{ say: 'An angle is a corner where two sides meet. A pentagon has five sides and five angles. A cube has six flat faces.', visual: { kind: 'shapeRow', shapes: [{ shape: 'pentagon', color: '#8b5cf6' }, { shape: 'cube', color: '#f59e0b' }] } }],
  items: items('m2.shapes', [
    {
      difficulty: 1,
      say: 'Which shape has exactly five angles?',
      show: 'Which has 5 angles?',
      choices: [
        vis({ kind: 'shape', shape: 'hexagon', color: '#3b82f6' }, undefined, 'side_count_confusion'),
        vis({ kind: 'shape', shape: 'pentagon', color: '#ef4444' }, undefined),
        vis({ kind: 'shape', shape: 'square', color: '#10b981' }, undefined, 'side_count_confusion'),
        vis({ kind: 'shape', shape: 'triangle', color: '#f59e0b' }, undefined, 'side_count_confusion'),
      ],
      speakChoices: false,
      explain: 'A pentagon has 5 sides and 5 angles (corners).',
    },
    {
      difficulty: 2,
      say: 'How many flat faces does a cube have?',
      show: 'Faces on a cube',
      visual: { kind: 'shape', shape: 'cube', color: '#f59e0b' },
      choices: [num(3, 'counted_visible_faces'), num(4, 'counted_visible_faces'), num(6), num(8, 'faces_vertices_confusion')],
      keepOrder: true,
      explain: 'A cube has 6 faces: top, bottom, front, back, left and right. In a picture you can only see 3 of them!',
    },
    {
      difficulty: 2,
      say: 'What do we call any shape with four straight sides?',
      show: 'Any shape with 4 sides is a…',
      choices: [txt('quadrilateral'), txt('pentagon', 'shape_name_confusion'), txt('hexagon', 'shape_name_confusion')],
      explain: 'Quad means four. Squares, rectangles, rhombuses and trapezoids are all quadrilaterals.',
    },
    {
      difficulty: 3,
      say: 'This rectangle is split into rows and columns of equal squares. How many squares are there?',
      show: 'How many squares?',
      visual: { kind: 'map', rows: 2, cols: 3, cells: [] },
      choices: [num(3, 'counted_one_row'), num(5, 'count_skipped_one'), num(6), num(2, 'counted_one_column')],
      keepOrder: true,
      explain: '2 rows of 3 squares: 3 plus 3 is 6 squares.',
    },
    {
      difficulty: 3,
      say: 'Which shape has more angles?',
      show: 'Which has more angles?',
      choices: [
        vis({ kind: 'shape', shape: 'hexagon', color: '#ec4899' }, 'hexagon'),
        vis({ kind: 'shape', shape: 'pentagon', color: '#14b8a6' }, 'pentagon', 'side_count_confusion'),
        txt('They have the same', 'side_count_confusion'),
      ],
      keepOrder: true,
      explain: 'A hexagon has 6 angles and a pentagon has 5. Six is more.',
    },
    {
      difficulty: 1,
      say: 'How many angles does this shape have?',
      show: 'How many angles?',
      visual: { kind: 'shape', shape: 'triangle', color: '#8b5cf6', rotate: 180 },
      choices: [num(2, 'corner_count_confusion'), num(3), num(4, 'corner_count_confusion'), num(6, 'corner_count_confusion')],
      explain: 'An angle is a corner where two sides meet. Count the corners: 1, 2, 3. A triangle has 3 angles, even upside down.',
    },
    {
      difficulty: 1,
      say: 'Which shape is a quadrilateral?',
      show: 'Which is a quadrilateral?',
      choices: [
        vis({ kind: 'shape', shape: 'triangle', color: '#3b82f6' }, undefined, 'side_count_confusion'),
        vis({ kind: 'shape', shape: 'trapezoid', color: '#ef4444' }, undefined),
        vis({ kind: 'shape', shape: 'pentagon', color: '#10b981' }, undefined, 'side_count_confusion'),
        vis({ kind: 'shape', shape: 'circle', color: '#f59e0b' }, undefined, 'shape_name_confusion'),
      ],
      speakChoices: false,
      explain: 'A quadrilateral has four straight sides. The trapezoid has 4 sides. The triangle has 3, the pentagon has 5, and the circle has none.',
    },
    {
      difficulty: 2,
      say: 'This rectangle is split into rows and columns of equal squares. How many squares are there?',
      show: 'How many squares?',
      visual: { kind: 'map', rows: 3, cols: 3, cells: [] },
      choices: [num(3, 'counted_one_row'), num(8, 'count_skipped_one'), num(9), num(10, 'count_double_tap')],
      explain: '3 rows with 3 squares in each row: 3 plus 3 plus 3 is 9 squares.',
    },
    {
      difficulty: 2,
      say: 'A shape has 4 angles. How many sides does it have?',
      show: '4 angles. How many sides?',
      choices: [num(3, 'side_count_confusion'), num(4), num(5, 'side_count_confusion'), num(8, 'added_sides_and_angles')],
      explain: 'In a flat shape with straight sides, every corner joins two sides, so it has the same number of sides as angles. 4 angles means 4 sides.',
    },
    {
      difficulty: 3,
      say: 'How many corners, called vertices, does a cube have? Remember the ones you cannot see.',
      show: 'Vertices on a cube',
      visual: { kind: 'shape', shape: 'cube', color: '#14b8a6' },
      choices: [num(4, 'counted_visible_faces'), num(6, 'faces_vertices_confusion'), num(7, 'counted_visible_corners'), num(8)],
      hint: 'A cube has 4 corners on the top and 4 corners on the bottom.',
      explain: 'A cube has 4 corners on top and 4 corners on the bottom. 4 plus 4 is 8 vertices. In the picture, one corner is hidden at the back.',
    },
  ]),
};

export const MATH2_SKILLS: Skill[] = [shapes2, placeValue, compare1000, skipCount, oddEven, add2d, sub2d, groups, wordProblems, time5, usMoney];
