import type { Choice, Difficulty, Item, Rng, Visual } from './types';

/**
 * Choice shorthands used by the hand-written item files.
 * Convention: a choice WITHOUT a `why` (misconception tag) is the correct answer.
 * The validator guarantees every item has exactly one.
 */
function finish(c: Omit<Choice, 'id'>, why?: string): Omit<Choice, 'id'> {
  return why ? { ...c, why } : { ...c, correct: true };
}

/** Picture choice: emoji + spoken name. */
export const pic = (emoji: string, say: string, why?: string) =>
  finish({ visual: { kind: 'emoji', emoji }, say }, why);

/** Printed-word / short-text choice. */
export const txt = (text: string, why?: string, say?: string) => finish({ text, say: say ?? text }, why);

/** Number choice. */
export const num = (n: number | string, why?: string) => finish({ text: String(n), say: String(n) }, why);

/** Any visual as a choice. */
export const vis = (visual: Visual, say: string | undefined, why?: string) => finish({ visual, say }, why);

type ItemDraft = Omit<Item, 'id' | 'skill' | 'choices'> & { choices: Omit<Choice, 'id'>[] };

/**
 * Builds the item list for one skill. Ids are `${skill}.${index}`, so new items
 * must be APPENDED (never reordered) to keep progress history meaningful.
 */
export function items(skill: string, drafts: ItemDraft[]): Item[] {
  return drafts.map((d, i) => ({
    ...d,
    id: `${skill}.${i + 1}`,
    skill,
    choices: d.choices.map((c, j) => ({ ...c, id: String.fromCharCode(97 + j) })),
  }));
}

/**
 * Numeric choices for generators: the correct value plus misconception-driven
 * distractors, de-duplicated, kept in range, padded with near misses to `size`.
 */
export function numberChoices(
  rng: Rng,
  correct: number,
  wrong: { n: number; why: string }[],
  opts: { min?: number; max?: number; size?: number; visual?: (n: number) => Visual } = {},
): Choice[] {
  const { min = 0, max = 120, size = 4, visual } = opts;
  const seen = new Set<number>([correct]);
  const out: Omit<Choice, 'id'>[] = [{ text: String(correct), say: String(correct), correct: true }];
  const push = (n: number, why: string) => {
    if (out.length >= size || seen.has(n) || n < min || n > max || !Number.isInteger(n)) return;
    seen.add(n);
    out.push({ text: String(n), say: String(n), why });
  };
  wrong.forEach((w) => push(w.n, w.why));
  for (let d = 1; out.length < size && d < 30; d++) {
    push(correct + (rng.next() < 0.5 ? d : -d), 'near_miss');
    push(correct - d, 'near_miss');
    push(correct + d, 'near_miss');
  }
  return out.map((c, i) => {
    const withVisual = visual ? { ...c, visual: visual(Number(c.text)), text: undefined } : c;
    return { ...withVisual, id: String.fromCharCode(97 + i) };
  });
}

/** Item factory for generators. Choices get ids a, b, c… in the given order. */
export function makeItem(
  skill: string,
  key: string,
  difficulty: Difficulty,
  rest: Omit<Item, 'id' | 'skill' | 'difficulty' | 'choices'> & { choices: Omit<Choice, 'id'>[] },
): Item {
  return {
    id: `${skill}#${key}`,
    skill,
    difficulty,
    ...rest,
    choices: rest.choices.map((c, i) => ({ ...c, id: String.fromCharCode(97 + i) })),
  };
}

/** Number words for TTS-friendly explanations. */
export const countUp = (n: number) => Array.from({ length: n }, (_, i) => i + 1).join(', ');

export const COUNT_EMOJI = ['🍎', '⭐', '🐟', '🦆', '🚗', '🌸', '🐞', '🍪', '🎈', '🐢', '🍓', '⚽'] as const;
const COUNT_ONE: Record<string, string> = {
  '🍎': 'apple', '⭐': 'star', '🐟': 'fish', '🦆': 'duck', '🚗': 'car', '🌸': 'flower',
  '🐞': 'ladybug', '🍪': 'cookie', '🎈': 'balloon', '🐢': 'turtle', '🍓': 'strawberry', '⚽': 'ball',
};
/** "1 duck", "3 ducks" */
export const noun = (emoji: string, n: number) => (n === 1 ? COUNT_ONE[emoji] : COUNT_NAMES[emoji]);

export const COUNT_NAMES: Record<string, string> = {
  '🍎': 'apples',
  '⭐': 'stars',
  '🐟': 'fish',
  '🦆': 'ducks',
  '🚗': 'cars',
  '🌸': 'flowers',
  '🐞': 'ladybugs',
  '🍪': 'cookies',
  '🎈': 'balloons',
  '🐢': 'turtles',
  '🍓': 'strawberries',
  '⚽': 'balls',
};
