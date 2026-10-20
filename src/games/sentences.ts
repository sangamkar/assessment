/**
 * Sentence Builder bank. The child hears the sentence and builds it from word
 * tiles in order, capital first, end mark last. Level 3 adds one tricky
 * distractor tile (wrong tense, plural or homophone).
 */
export interface BuildSentence {
  words: string[];
  emoji: string;
  /** Level 3 only: a tempting wrong tile */
  trap?: string;
}

const s = (text: string, emoji: string, trap?: string): BuildSentence => ({ words: text.match(/[A-Za-z’']+|[.?!]/g)!, emoji, trap });

export const SENTENCES: Record<1 | 2 | 3, BuildSentence[]> = {
  1: [
    s('The cat sat.', '🐱'),
    s('I can run.', '🏃'),
    s('We like dogs.', '🐶'),
    s('The sun is hot.', '☀️'),
    s('Look at me!', '🙋'),
    s('Is it big?', '🐘'),
    s('My bus is red.', '🚌'),
    s('A bee can fly.', '🐝'),
  ],
  2: [
    s('The frog jumped into the pond.', '🐸'),
    s('Can you see the moon?', '🌙'),
    s('My sister reads a book.', '📖'),
    s('We went to the park today.', '🌳'),
    s('The fish swims very fast.', '🐟'),
    s('Where is my blue hat?', '🧢'),
    s('I love my little puppy!', '🐶'),
    s('Grandma makes yummy roti.', '🫓'),
  ],
  3: [
    s('Yesterday we ran to the big hill.', '⛰️', 'run'),
    s('The two mice ate some cheese.', '🧀', 'mouses'),
    s('They went to their friend’s house.', '🏠', 'there'),
    s('My dad and I built a sandcastle.', '🏰', 'build'),
    s('Why did the bird fly away?', '🐦', 'flied'),
    s('She has three red apples.', '🍎', 'apple'),
    s('The children played in the rain.', '🌧️', 'childs'),
    s('Wow, that rocket is so fast!', '🚀', 'fastly'),
  ],
};

/** Tiles: every word once per occurrence (keyed by index), plus the trap at level 3. */
export function sentenceTiles(b: BuildSentence, level: 1 | 2 | 3, shuffle: <T>(l: readonly T[]) => T[]): { id: string; word: string }[] {
  const tiles = b.words.map((word, i) => ({ id: `w${i}`, word }));
  if (level === 3 && b.trap) tiles.push({ id: 'trap', word: b.trap });
  return shuffle(tiles);
}
