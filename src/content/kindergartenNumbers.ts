import type { Difficulty, Item, Rng, Skill, Visual } from './types';
import { makeItem, numberChoices, txt } from './helpers';

const base = (id: string, title: string, kidTitle: string): Omit<Skill, 'generate'> => ({
  id, subject: 'math', strand: 'number', grade: 'K', title, kidTitle, icon: '🔢', standards: ['IXL Skill Plan: Numbers and Operations'], prereqs: [],
  parentTip: 'Ask your child to explain how the numbers go in order.',
  intro: [{ say: 'Numbers grow by one as we count forward.', visual: { kind: 'sequence', items: ['98', '99', '100', '101'], blank: -1 } }],
});
const generator = (id: string, mode: 'sequence' | 'line' | 'chart') => (rng: Rng, d: Difficulty): Item => {
  const start = mode === 'chart' ? rng.int(0, 9) * 10 + rng.int(1, 8) : rng.int(d === 1 ? 1 : d === 2 ? 40 : 96, d === 1 ? 36 : d === 2 ? 95 : mode === 'line' ? 116 : 117);
  const blank = mode === 'chart' ? rng.int(0, 8) : rng.int(1, mode === 'line' ? 4 : 3);
  const values = mode === 'chart' ? Array.from({ length: 9 }, (_, i) => start + Math.floor(i / 3) * 10 + i % 3) : Array.from({ length: mode === 'line' ? 5 : 4 }, (_, i) => start + i);
  const answer = values[blank];
  const visual: Visual = mode === 'chart' ? { kind: 'matrix', cols: 3, cells: values.map((value, i) => i === blank ? null : { kind: 'number', value }) } : mode === 'line' ? { kind: 'numberLine', start, blank } : { kind: 'sequence', items: values.map(String), blank };
  return makeItem(id, `${start}-${blank}`, d, {
    say: mode === 'chart' ? 'Look at this part of a number chart. Numbers go up by one across and ten down. What number belongs in the empty box?' : mode === 'line' ? 'Count forward along the number line. What number belongs at the question mark?' : 'Count forward. What number belongs in the empty box?',
    show: 'Which number is missing?', visual,
    choices: numberChoices(rng, answer, [{ n: answer - 1, why: 'repeated_previous' }, { n: answer + 1, why: 'skipped_a_number' }, { n: answer - 10, why: 'decade_transition' }], { min: 1, max: 120 }),
    explain: mode === 'chart' ? `Across the chart we add one, and down we add ten. The missing number is ${answer}.` : `Count by ones: ${values.join(', ')}. The missing number is ${answer}.`,
  });
};
const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens = ['', '', 'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function words(n: number): string {
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? `-${ones[n % 10]}` : '');
  return 'one hundred' + (n % 100 ? ` ${words(n % 100)}` : '');
}
const wordSkill = (direction: 'words-digits' | 'digits-words'): Skill => {
  const id = `m.${direction}`;
  return { ...base(id, direction === 'words-digits' ? 'Convert number words to digits' : 'Convert digits to number words', direction === 'words-digits' ? 'Words to numbers' : 'Numbers to words'),
    intro: [{ say: 'A number can be written in digits or in words.', visual: { kind: 'row', items: [{ kind: 'number', value: 12 }, { kind: 'text', text: 'twelve' }], sep: ' = ' } }],
    generate: (rng, d) => {
      const n = rng.int(d === 1 ? 0 : d === 2 ? 20 : 100, d === 1 ? 19 : d === 2 ? 99 : 120);
      const wrong = [n === 120 ? n - 1 : n + 1, n >= 10 ? n - 10 : n + 2, n > 0 ? n - 1 : n + 3].filter((v, i, all) => v >= 0 && v <= 120 && v !== n && all.indexOf(v) === i);
      for (let i = 0; wrong.length < 3; i++) if (i !== n && !wrong.includes(i)) wrong.push(i);
      return makeItem(id, `${n}`, d, { say: direction === 'words-digits' ? 'Which number matches the number words?' : 'Which number words match these digits?', show: direction === 'words-digits' ? 'Choose the digits.' : 'Choose the number words.', visual: direction === 'words-digits' ? { kind: 'text', text: words(n) } : { kind: 'number', value: n }, choices: direction === 'words-digits' ? numberChoices(rng, n, wrong.map((v) => ({ n: v, why: 'number_word_confusion' })), { min: 0, max: 120 }) : [txt(words(n)), ...wrong.map((v) => txt(words(v), 'number_word_confusion'))], explain: `${n} is written ${words(n)}.` });
    } };
};
export const KINDERGARTEN_NUMBER_SKILLS: Skill[] = [
  { ...base('m.sequence120', 'Count forward in sequences to 120', 'Count to 120'), generate: generator('m.sequence120', 'sequence') },
  { ...base('m.line120', 'Count forward on number lines to 120', 'Number line to 120'), generate: generator('m.line120', 'line') },
  { ...base('m.chart120', 'Count on a number chart to 120', 'Number chart to 120'), generate: generator('m.chart120', 'chart') },
  wordSkill('words-digits'), wordSkill('digits-words'),
];
