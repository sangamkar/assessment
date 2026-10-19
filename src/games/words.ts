/** Mystery Word bank, by level: 1 = CVC, 2 = blends/digraphs/long vowels, 3 = five letters. */
export interface MysteryWord {
  word: string;
  emoji: string;
}

export const MYSTERY_WORDS: Record<1 | 2 | 3, MysteryWord[]> = {
  1: [
    { word: 'cat', emoji: '🐱' },
    { word: 'dog', emoji: '🐶' },
    { word: 'sun', emoji: '☀️' },
    { word: 'pig', emoji: '🐷' },
    { word: 'bus', emoji: '🚌' },
    { word: 'hat', emoji: '🎩' },
    { word: 'bed', emoji: '🛏️' },
    { word: 'cup', emoji: '☕' },
    { word: 'fox', emoji: '🦊' },
    { word: 'hen', emoji: '🐔' },
    { word: 'net', emoji: '🥅' },
    { word: 'van', emoji: '🚐' },
    { word: 'web', emoji: '🕸️' },
    { word: 'bug', emoji: '🐛' },
    { word: 'box', emoji: '📦' },
    { word: 'map', emoji: '🗺️' },
  ],
  2: [
    { word: 'fish', emoji: '🐟' },
    { word: 'frog', emoji: '🐸' },
    { word: 'duck', emoji: '🦆' },
    { word: 'ship', emoji: '🚢' },
    { word: 'star', emoji: '⭐' },
    { word: 'moon', emoji: '🌙' },
    { word: 'tree', emoji: '🌳' },
    { word: 'cake', emoji: '🎂' },
    { word: 'bike', emoji: '🚲' },
    { word: 'kite', emoji: '🪁' },
    { word: 'sock', emoji: '🧦' },
    { word: 'milk', emoji: '🥛' },
    { word: 'bell', emoji: '🔔' },
    { word: 'nest', emoji: '🪺' },
    { word: 'drum', emoji: '🥁' },
    { word: 'crab', emoji: '🦀' },
  ],
  3: [
    { word: 'apple', emoji: '🍎' },
    { word: 'snake', emoji: '🐍' },
    { word: 'horse', emoji: '🐴' },
    { word: 'train', emoji: '🚆' },
    { word: 'house', emoji: '🏠' },
    { word: 'mouse', emoji: '🐭' },
    { word: 'zebra', emoji: '🦓' },
    { word: 'tiger', emoji: '🐯' },
    { word: 'robot', emoji: '🤖' },
    { word: 'pizza', emoji: '🍕' },
    { word: 'clock', emoji: '⏰' },
    { word: 'plant', emoji: '🪴' },
  ],
};

/** Letters a beginner confuses with each letter — used as tricky extra tiles. */
const LOOKALIKE: Record<string, string> = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', u: 'n', e: 'a', a: 'e', i: 'e', o: 'u', t: 'f', f: 't', s: 'z', g: 'q' };

/** Unique letters of the word plus `extra` distractors (one look-alike when possible), shuffled. */
export function letterTiles(word: string, extra: number, shuffle: <T>(l: readonly T[]) => T[]): string[] {
  const own = [...new Set(word.split(''))];
  const pool = 'abcdefghijklmnoprstuvwy'.split('').filter((l) => !own.includes(l));
  const tricky = own.map((l) => LOOKALIKE[l]).filter((l) => l && !own.includes(l));
  const extras = [...new Set([...shuffle(tricky).slice(0, 1), ...shuffle(pool)])].slice(0, extra);
  return shuffle([...own, ...extras]);
}
