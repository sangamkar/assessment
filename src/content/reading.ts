import type { Skill, Visual } from './types';
import { items, makeItem, num, pic, txt, vis } from './helpers';

/* ------------------------------------------------------------------------ */
/* Shared word bank. `s` is the first SOUND (c/k share /k/), so sound items  */
/* never offer two letters that make the same sound.                         */
/* ------------------------------------------------------------------------ */
interface Word {
  w: string;
  e: string;
  s: string;
}
const WORDS: Word[] = [
  { w: 'bear', e: '🐻', s: 'b' }, { w: 'bus', e: '🚌', s: 'b' }, { w: 'banana', e: '🍌', s: 'b' }, { w: 'bee', e: '🐝', s: 'b' },
  { w: 'cat', e: '🐱', s: 'k' }, { w: 'car', e: '🚗', s: 'k' }, { w: 'cake', e: '🎂', s: 'k' }, { w: 'cow', e: '🐮', s: 'k' },
  { w: 'dog', e: '🐶', s: 'd' }, { w: 'duck', e: '🦆', s: 'd' }, { w: 'drum', e: '🥁', s: 'd' },
  { w: 'fish', e: '🐟', s: 'f' }, { w: 'fox', e: '🦊', s: 'f' }, { w: 'frog', e: '🐸', s: 'f' },
  { w: 'goat', e: '🐐', s: 'g' }, { w: 'gift', e: '🎁', s: 'g' }, { w: 'grapes', e: '🍇', s: 'g' },
  { w: 'hat', e: '🎩', s: 'h' }, { w: 'horse', e: '🐴', s: 'h' }, { w: 'house', e: '🏠', s: 'h' },
  { w: 'kite', e: '🪁', s: 'k' }, { w: 'key', e: '🔑', s: 'k' }, { w: 'king', e: '🤴', s: 'k' },
  { w: 'lion', e: '🦁', s: 'l' }, { w: 'leaf', e: '🍃', s: 'l' }, { w: 'lemon', e: '🍋', s: 'l' },
  { w: 'moon', e: '🌙', s: 'm' }, { w: 'mouse', e: '🐭', s: 'm' }, { w: 'monkey', e: '🐵', s: 'm' },
  { w: 'nest', e: '🪺', s: 'n' }, { w: 'nose', e: '👃', s: 'n' }, { w: 'nut', e: '🥜', s: 'n' },
  { w: 'pig', e: '🐷', s: 'p' }, { w: 'pizza', e: '🍕', s: 'p' }, { w: 'pear', e: '🍐', s: 'p' },
  { w: 'rabbit', e: '🐰', s: 'r' }, { w: 'rocket', e: '🚀', s: 'r' }, { w: 'ring', e: '💍', s: 'r' },
  { w: 'sun', e: '☀️', s: 's' }, { w: 'sock', e: '🧦', s: 's' }, { w: 'snake', e: '🐍', s: 's' },
  { w: 'tiger', e: '🐯', s: 't' }, { w: 'tent', e: '⛺', s: 't' }, { w: 'turtle', e: '🐢', s: 't' },
  { w: 'van', e: '🚐', s: 'v' }, { w: 'violin', e: '🎻', s: 'v' },
  { w: 'web', e: '🕸️', s: 'w' }, { w: 'watch', e: '⌚', s: 'w' }, { w: 'worm', e: '🪱', s: 'w' },
  { w: 'yarn', e: '🧶', s: 'y' }, { w: 'yo-yo', e: '🪀', s: 'y' },
  { w: 'zebra', e: '🦓', s: 'z' }, { w: 'zero', e: '0️⃣', s: 'z' },
];
/** Letters whose sounds are easy to confuse (voicing pairs). */
const VOICING: Record<string, string> = { b: 'p', p: 'b', d: 't', t: 'd', f: 'v', v: 'f', g: 'k', k: 'g', s: 'z', z: 's' };
const letterFor = (w: Word) => w.w[0];

/* ------------------------------------------------------------------------ */
/* PHONICS                                                                  */
/* ------------------------------------------------------------------------ */

const CONFUSABLE_LOWER: string[][] = [['b', 'd', 'p', 'q'], ['m', 'n', 'u', 'h'], ['f', 't', 'l', 'i'], ['g', 'q', 'y', 'j'], ['a', 'o', 'e', 'c'], ['v', 'w', 'y', 'x'], ['r', 'n', 'h', 'm']];
const CONFUSABLE_UPPER: string[][] = [['B', 'D', 'P', 'R'], ['M', 'N', 'W', 'H'], ['E', 'F', 'L', 'T'], ['O', 'Q', 'C', 'G'], ['V', 'W', 'Y', 'X'], ['K', 'X', 'Y', 'Z'], ['I', 'J', 'L', 'T']];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const letters: Skill = {
  id: 'r.letters',
  subject: 'reading',
  strand: 'phonics',
  grade: 'K',
  title: 'Name upper- and lowercase letters',
  kidTitle: 'Letters',
  icon: '🔤',
  standards: ['RF.K.1d'],
  prereqs: [],
  parentTip: 'Play "I spy a letter" on signs and cereal boxes. Practice tricky pairs b/d with "the bat comes before the ball".',
  intro: [
    { say: 'Every letter has a big letter and a small letter. This is big B and small b.', visual: { kind: 'row', items: [{ kind: 'text', text: 'B', size: 'xl' }, { kind: 'text', text: 'b', size: 'xl' }] } },
  ],
  generate: (rng, d) => {
    if (d === 3) {
      const set = rng.pick(CONFUSABLE_LOWER);
      const target = rng.pick(set);
      return makeItem('r.letters', `match-${target}`, d, {
        say: `This is big ${target.toUpperCase()}. Find small ${target}.`,
        show: 'Find the matching small letter.',
        visual: { kind: 'text', text: target.toUpperCase(), size: 'xl' },
        choices: rng.shuffle(set).map((l) => (l === target ? { text: l, correct: true as const } : { text: l, why: 'letter_reversal_or_lookalike' })),
        speakChoices: false,
        explain: `Big ${target.toUpperCase()} and small ${target} go together.`,
      });
    }
    const set = d === 1 ? rng.shuffle(ALPHA).slice(0, 4) : rng.pick(d === 2 ? CONFUSABLE_UPPER : CONFUSABLE_LOWER);
    const target = rng.pick(set);
    return makeItem('r.letters', `${d}-${target}`, d, {
      say: `Find the letter ${target}.`,
      show: 'Find the letter.',
      choices: set.map((l) => (l === target ? { text: l, correct: true as const } : { text: l, why: d === 1 ? 'letter_name_unknown' : 'letter_reversal_or_lookalike' })),
      speakChoices: false,
      explain: `This is the letter ${target}.`,
    });
  },
};

const letterSound: Skill = {
  id: 'r.lettersound',
  subject: 'reading',
  strand: 'phonics',
  grade: 'K',
  title: 'Letter–sound correspondence (consonants)',
  kidTitle: 'Letter sounds',
  icon: '🅱️',
  standards: ['RF.K.3a'],
  prereqs: ['r.letters', 'r.firstsound'],
  parentTip: 'Make a "sound bag": put toys in a bag and sort them by the letter their name starts with.',
  intro: [
    { say: 'Letters make sounds. Bear starts with the buh sound. The letter B makes that sound.', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🐻' }, { kind: 'text', text: 'B b', size: 'xl' }] } },
  ],
  generate: (rng, d) => {
    const target = rng.pick(WORDS);
    const letter = letterFor(target);
    // c, k and q can all spell /k/, so none of them may be a distractor for a /k/ word.
    const sameSound = target.s === 'k' ? ['c', 'k', 'q'] : [letter];
    const pool: { l: string; why: string }[] = [];
    if (d === 3 && VOICING[target.s]) pool.push({ l: VOICING[target.s], why: 'voicing_confusion' });
    while (pool.length < 3) {
      const l = letterFor(rng.pick(WORDS));
      if (sameSound.includes(l) || pool.some((p) => p.l === l)) continue;
      pool.push({ l, why: 'letter_sound_unknown' });
    }
    return makeItem('r.lettersound', `${target.w}-${d}`, d, {
      say: `${target.w}. Which letter does ${target.w} start with?`,
      show: 'Which letter does it start with?',
      visual: { kind: 'emoji', emoji: target.e, size: 'xl', label: target.w },
      choices: [
        { text: letter, correct: true as const },
        ...pool.map((p) => ({ text: p.l, why: p.why })),
      ],
      speakChoices: false,
      explain: `${target.w} starts with the letter ${letter.toUpperCase()}.`,
    });
  },
};

const cvc: Skill = {
  id: 'r.cvc',
  subject: 'reading',
  strand: 'phonics',
  grade: 'K',
  title: 'Decode CVC words (short vowels)',
  kidTitle: 'Read words',
  icon: '📖',
  standards: ['RF.K.3b', 'RF.K.3d'],
  prereqs: ['r.lettersound', 'r.blend'],
  parentTip: 'Write CVC words on cards (cat, pig, sun). He taps each letter while saying its sound, then sweeps to blend.',
  intro: [
    { say: 'To read a word, say each sound, then put them together. C, a, t. Cat!', visual: { kind: 'text', text: 'c a t', size: 'xl' } },
  ],
  items: items('r.cvc', [
    { difficulty: 1, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'cat', size: 'xl' }, choices: [pic('🐱', 'cat'), pic('🐶', 'dog', 'guessed_from_category'), pic('🐷', 'pig', 'guessed_from_category')], explain: 'c, a, t. The word is cat.' },
    { difficulty: 1, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'sun', size: 'xl' }, choices: [pic('🌙', 'moon', 'guessed_from_category'), pic('☀️', 'sun'), pic('⭐', 'star', 'guessed_from_category')], explain: 's, u, n. The word is sun.' },
    { difficulty: 2, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'pin', size: 'xl' }, choices: [pic('🍳', 'pan', 'vowel_confusion'), pic('🖊️', 'pen', 'vowel_confusion'), pic('📌', 'pin')], explain: 'p, i, n. The middle sound is i, like in itch. The word is pin.' },
    { difficulty: 2, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'bug', size: 'xl' }, choices: [pic('🐛', 'bug'), pic('🚌', 'bus', 'final_sound_ignored'), pic('🛏️', 'bed', 'used_first_letter_only')], explain: 'b, u, g. The word is bug.' },
    { difficulty: 2, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'box', size: 'xl' }, choices: [pic('🦊', 'fox', 'first_sound_ignored'), pic('📦', 'box'), pic('🐝', 'bee', 'used_first_letter_only')], explain: 'b, o, x. The word is box.' },
    { difficulty: 3, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'cap', size: 'xl' }, choices: [pic('🐱', 'cat', 'final_sound_ignored'), pic('🥫', 'can', 'final_sound_ignored'), pic('🧢', 'cap')], explain: 'c, a, p. The last sound is p. The word is cap.' },
    { difficulty: 3, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'net', size: 'xl' }, choices: [pic('🥜', 'nut', 'vowel_confusion'), pic('🥅', 'net'), pic('✈️', 'jet', 'first_sound_ignored')], explain: 'n, e, t. The middle sound is e, like in egg. The word is net.' },
    { difficulty: 3, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'hen', size: 'xl' }, choices: [pic('🎩', 'hat', 'vowel_confusion'), pic('🖊️', 'pen', 'first_sound_ignored'), pic('🐔', 'hen')], explain: 'h, e, n. The word is hen.' },
    { difficulty: 1, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'dog', size: 'xl' }, speakChoices: false, choices: [pic('🐱', 'cat', 'guessed_from_category'), pic('🐶', 'dog'), pic('🦆', 'duck', 'used_first_letter_only')], explain: 'd, o, g. The word is dog.' },
    { difficulty: 2, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'pen', size: 'xl' }, speakChoices: false, choices: [pic('🐷', 'pig', 'used_first_letter_only'), pic('🐔', 'hen', 'first_sound_ignored'), pic('🖊️', 'pen')], explain: 'p, e, n. The first sound is p. The word is pen.' },
  ]),
};

/* ------------------------------------------------------------------------ */
/* PHONOLOGICAL AWARENESS (listening only — no reading needed)              */
/* ------------------------------------------------------------------------ */

const rhyme: Skill = {
  id: 'r.rhyme',
  subject: 'reading',
  strand: 'phonological',
  grade: 'K',
  title: 'Recognize rhyming words',
  kidTitle: 'Rhymes',
  icon: '🎵',
  standards: ['RF.K.2a'],
  prereqs: [],
  parentTip: 'Read Dr. Seuss and pause before the rhyming word so he can fill it in.',
  intro: [
    { say: 'Rhyming words sound the same at the end. Cat, hat. Cat and hat rhyme!', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🐱' }, { kind: 'emoji', emoji: '🎩' }] } },
  ],
  items: items('r.rhyme', [
    { difficulty: 1, say: 'Which picture rhymes with cat?', show: 'Rhymes with cat', visual: { kind: 'emoji', emoji: '🐱', label: 'cat' }, choices: [pic('🎩', 'hat'), pic('🐶', 'dog', 'no_rhyme_awareness'), pic('🚗', 'car', 'same_start_not_rhyme')], explain: 'Cat, hat. They both end with at. Cat and hat rhyme.' },
    { difficulty: 1, say: 'Which picture rhymes with mouse?', show: 'Rhymes with mouse', visual: { kind: 'emoji', emoji: '🐭', label: 'mouse' }, choices: [pic('🌙', 'moon', 'same_start_not_rhyme'), pic('🏠', 'house'), pic('🐱', 'cat', 'no_rhyme_awareness')], explain: 'Mouse, house. They both end with ouse.' },
    { difficulty: 2, say: 'Which picture rhymes with goat?', show: 'Rhymes with goat', visual: { kind: 'emoji', emoji: '🐐', label: 'goat' }, choices: [pic('🍇', 'grapes', 'same_start_not_rhyme'), pic('🐴', 'horse', 'meaning_not_sound'), pic('🧥', 'coat')], explain: 'Goat, coat. They both end with oat.' },
    { difficulty: 2, say: 'Which picture rhymes with king?', show: 'Rhymes with king', visual: { kind: 'emoji', emoji: '🤴', label: 'king' }, choices: [pic('💍', 'ring'), pic('👑', 'crown', 'meaning_not_sound'), pic('🔑', 'key', 'same_start_not_rhyme')], explain: 'King, ring. They both end with ing.' },
    { difficulty: 2, say: 'Which picture rhymes with clock?', show: 'Rhymes with clock', visual: { kind: 'emoji', emoji: '⏰', label: 'clock' }, choices: [pic('⌚', 'watch', 'meaning_not_sound'), pic('🧦', 'sock'), pic('🦀', 'crab', 'same_start_not_rhyme')], explain: 'Clock, sock. They both end with ock.' },
    { difficulty: 3, say: 'Three of these rhyme. Which one does NOT rhyme? Cake, snake, rake, bike.', show: 'Which does NOT rhyme?', choices: [pic('🎂', 'cake', 'no_rhyme_awareness'), pic('🐍', 'snake', 'no_rhyme_awareness'), pic('🚲', 'bike'), pic('🧹', 'rake', 'no_rhyme_awareness')], explain: 'Cake, snake and rake all end with ake. Bike ends with ike, so it does not rhyme.' },
    { difficulty: 3, say: 'Which picture rhymes with spoon?', show: 'Rhymes with spoon', visual: { kind: 'emoji', emoji: '🥄', label: 'spoon' }, choices: [pic('🍴', 'fork', 'meaning_not_sound'), pic('🌙', 'moon'), pic('🕷️', 'spider', 'same_start_not_rhyme'), pic('🌞', 'sun', 'no_rhyme_awareness')], explain: 'Spoon, moon. They both end with oon.' },
    { difficulty: 1, say: 'Which picture rhymes with car?', show: 'Rhymes with car', visual: { kind: 'emoji', emoji: '🚗', label: 'car' }, choices: [pic('🐱', 'cat', 'same_start_not_rhyme'), pic('⭐', 'star'), pic('🍎', 'apple', 'no_rhyme_awareness')], explain: 'Car, star. They both end with ar.' },
    { difficulty: 2, say: 'Which picture rhymes with fox?', show: 'Rhymes with fox', visual: { kind: 'emoji', emoji: '🦊', label: 'fox' }, choices: [pic('📦', 'box'), pic('🐸', 'frog', 'same_start_not_rhyme'), pic('🐺', 'wolf', 'meaning_not_sound')], explain: 'Fox, box. They both end with ox.' },
    { difficulty: 3, say: 'Which picture rhymes with bear?', show: 'Rhymes with bear', visual: { kind: 'emoji', emoji: '🐻', label: 'bear' }, choices: [pic('🐼', 'panda', 'meaning_not_sound'), pic('🍌', 'banana', 'same_start_not_rhyme'), pic('🪑', 'chair'), pic('🦁', 'lion', 'no_rhyme_awareness')], explain: 'Bear, chair. They both end with air. Panda is a kind of bear, but it does not rhyme.' },
  ]),
};

const SYLLABLE_BANK: { w: string; e: string; n: number }[] = [
  { w: 'dog', e: '🐶', n: 1 }, { w: 'sun', e: '☀️', n: 1 }, { w: 'frog', e: '🐸', n: 1 }, { w: 'cake', e: '🎂', n: 1 },
  { w: 'apple', e: '🍎', n: 2 }, { w: 'rabbit', e: '🐰', n: 2 }, { w: 'pencil', e: '✏️', n: 2 }, { w: 'rocket', e: '🚀', n: 2 }, { w: 'tiger', e: '🐯', n: 2 },
  { w: 'banana', e: '🍌', n: 3 }, { w: 'butterfly', e: '🦋', n: 3 }, { w: 'elephant', e: '🐘', n: 3 }, { w: 'dinosaur', e: '🦕', n: 3 }, { w: 'tomato', e: '🍅', n: 3 },
  { w: 'watermelon', e: '🍉', n: 4 }, { w: 'alligator', e: '🐊', n: 4 }, { w: 'helicopter', e: '🚁', n: 4 }, { w: 'caterpillar', e: '🐛', n: 4 },
];

const syllables: Skill = {
  id: 'r.syllables',
  subject: 'reading',
  strand: 'phonological',
  grade: 'K',
  title: 'Count syllables (word parts)',
  kidTitle: 'Clap the parts',
  icon: '👏',
  standards: ['RF.K.2b'],
  prereqs: [],
  parentTip: 'Clap family names together: "Aa-rav" is 2 claps, "Grand-ma" is 2. Put a hand under the chin — each chin drop is a syllable.',
  intro: [{ say: 'Words have parts we can clap. Ba, na, na. Banana has three claps!', visual: { kind: 'emoji', emoji: '🍌', size: 'xl' } }],
  generate: (rng, d) => {
    const pool = SYLLABLE_BANK.filter((s) => (d === 1 ? s.n <= 2 : d === 2 ? s.n === 3 : s.n === 4));
    const t = rng.pick(pool);
    return makeItem('r.syllables', t.w, d, {
      say: `Say the word and clap the parts: ${t.w}. How many claps?`,
      show: 'How many claps?',
      visual: { kind: 'emoji', emoji: t.e, size: 'xl', label: t.w },
      choices: [1, 2, 3, 4].map((n) => (n === t.n ? { text: String(n), say: String(n), correct: true as const } : { text: String(n), say: String(n), why: n < t.n ? 'syllables_undercount' : 'syllables_overcount' })),
      keepOrder: true,
      explain: `${t.w} has ${t.n} ${t.n === 1 ? 'part' : 'parts'}. Put your hand under your chin. Each time your chin drops is one clap.`,
    });
  },
};

const firstSound: Skill = {
  id: 'r.firstsound',
  subject: 'reading',
  strand: 'phonological',
  grade: 'K',
  title: 'Identify beginning sounds',
  kidTitle: 'First sounds',
  icon: '👂',
  standards: ['RF.K.2d'],
  prereqs: [],
  parentTip: 'Play "I spy something that starts with mmm" around the house.',
  intro: [{ say: 'Listen to the first sound. Mmmoon. Mmmouse. Moon and mouse start the same!', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🌙' }, { kind: 'emoji', emoji: '🐭' }] } }],
  generate: (rng, d) => {
    const target = rng.pick(WORDS);
    const same = rng.pick(WORDS.filter((w) => w.s === target.s && w.w !== target.w));
    const wrongs: { w: Word; why: string }[] = [];
    if (d === 3 && VOICING[target.s]) {
      const v = WORDS.filter((w) => w.s === VOICING[target.s]);
      if (v.length) wrongs.push({ w: rng.pick(v), why: 'voicing_confusion' });
    }
    const used = new Set([target.s]);
    while (wrongs.length < (d === 1 ? 2 : 3)) {
      const w = rng.pick(WORDS);
      if (used.has(w.s) || wrongs.some((x) => x.w.s === w.s)) continue;
      wrongs.push({ w, why: 'first_sound_not_isolated' });
    }
    return makeItem('r.firstsound', `${target.w}-${same.w}-${d}`, d, {
      say: `Which picture starts with the same sound as ${target.w}?`,
      show: `Starts like ${target.w}`,
      visual: { kind: 'emoji', emoji: target.e, size: 'xl', label: target.w },
      choices: [
        { visual: { kind: 'emoji', emoji: same.e } as Visual, say: same.w, correct: true as const },
        ...wrongs.map(({ w, why }) => ({ visual: { kind: 'emoji', emoji: w.e } as Visual, say: w.w, why })),
      ],
      explain: `${target.w} and ${same.w} start with the same sound.`,
    });
  },
};

const lastSound: Skill = {
  id: 'r.lastsound',
  subject: 'reading',
  strand: 'phonological',
  grade: 'K',
  title: 'Identify ending sounds',
  kidTitle: 'Last sounds',
  icon: '🔚',
  standards: ['RF.K.2d'],
  prereqs: ['r.firstsound'],
  parentTip: 'Stretch words slowly — "cuuup" — and ask what sound he hears at the very end.',
  intro: [{ say: 'Now listen to the END of the word. Bus ends with sss. Dress ends with sss too!' }],
  items: items('r.lastsound', [
    { difficulty: 1, say: 'Which picture ends with the same sound as cat?', show: 'Ends like cat', visual: { kind: 'emoji', emoji: '🐱', label: 'cat' }, choices: [pic('🥜', 'nut'), pic('🐄', 'cow', 'matched_first_sound'), pic('🐟', 'fish', 'last_sound_not_isolated')], explain: 'Cat ends with t. Nut ends with t too.' },
    { difficulty: 2, say: 'Which picture ends with the same sound as bus?', show: 'Ends like bus', visual: { kind: 'emoji', emoji: '🚌', label: 'bus' }, choices: [pic('🍌', 'banana', 'matched_first_sound'), pic('👗', 'dress'), pic('🐶', 'dog', 'last_sound_not_isolated')], explain: 'Bus ends with sss. Dress ends with sss too.' },
    { difficulty: 2, say: 'Which picture ends with the same sound as drum?', show: 'Ends like drum', visual: { kind: 'emoji', emoji: '🥁', label: 'drum' }, choices: [pic('🦆', 'duck', 'matched_first_sound'), pic('🧹', 'broom'), pic('🐝', 'bee', 'last_sound_not_isolated')], explain: 'Drum ends with mmm. Broom ends with mmm too.' },
    { difficulty: 3, say: 'Which picture ends with the same sound as frog?', show: 'Ends like frog', visual: { kind: 'emoji', emoji: '🐸', label: 'frog' }, choices: [pic('🦊', 'fox', 'matched_first_sound'), pic('🐷', 'pig'), pic('🦆', 'duck', 'voicing_confusion'), pic('🌙', 'moon', 'last_sound_not_isolated')], explain: 'Frog ends with g. Pig ends with g too.' },
    { difficulty: 3, say: 'Which picture ends with the same sound as leaf?', show: 'Ends like leaf', visual: { kind: 'emoji', emoji: '🍃', label: 'leaf' }, choices: [pic('🦁', 'lion', 'matched_first_sound'), pic('🧣', 'scarf'), pic('🚐', 'van', 'voicing_confusion'), pic('🐝', 'bee', 'last_sound_not_isolated')], explain: 'Leaf ends with fff. Scarf ends with fff too.' },
    { difficulty: 1, say: 'Which picture ends with the same sound as sun?', show: 'Ends like sun', visual: { kind: 'emoji', emoji: '☀️', label: 'sun' }, choices: [pic('🍳', 'pan'), pic('🧦', 'sock', 'matched_first_sound'), pic('🐶', 'dog', 'last_sound_not_isolated')], explain: 'Sun ends with nnn. Pan ends with nnn too.' },
    { difficulty: 1, say: 'Which picture ends with the same sound as bed?', show: 'Ends like bed', visual: { kind: 'emoji', emoji: '🛏️', label: 'bed' }, choices: [pic('🐝', 'bee', 'matched_first_sound'), pic('☁️', 'cloud'), pic('🐟', 'fish', 'last_sound_not_isolated')], explain: 'Bed ends with d. Cloud ends with d too.' },
    { difficulty: 2, say: 'Which picture ends with the same sound as dog?', show: 'Ends like dog', visual: { kind: 'emoji', emoji: '🐶', label: 'dog' }, choices: [pic('🦆', 'duck', 'matched_first_sound'), pic('🌙', 'moon', 'last_sound_not_isolated'), pic('🐛', 'bug')], explain: 'Dog ends with g. Bug ends with g too.' },
    { difficulty: 2, say: 'Which picture ends with the same sound as cup?', show: 'Ends like cup', visual: { kind: 'emoji', emoji: '☕', label: 'cup' }, choices: [pic('🗺️', 'map'), pic('🐱', 'cat', 'matched_first_sound'), pic('🐝', 'bee', 'last_sound_not_isolated')], explain: 'Cup ends with p. Map ends with p too.' },
    { difficulty: 3, say: 'Which picture ends with the same sound as book?', show: 'Ends like book', visual: { kind: 'emoji', emoji: '📖', label: 'book' }, choices: [pic('🍌', 'banana', 'matched_first_sound'), pic('🐷', 'pig', 'voicing_confusion'), pic('🦆', 'duck'), pic('🐟', 'fish', 'last_sound_not_isolated')], explain: 'Book ends with k. Duck ends with k too. Pig ends with g, which sounds close but is different.' },
  ]),
};

const blend: Skill = {
  id: 'r.blend',
  subject: 'reading',
  strand: 'phonological',
  grade: 'K',
  title: 'Blend sounds into words',
  kidTitle: 'Blend sounds',
  icon: '🧩',
  standards: ['RF.K.2c', 'RF.K.2d'],
  prereqs: ['r.firstsound'],
  parentTip: 'Talk like a robot: "Get your s-o-ck." He blends it and fetches it.',
  intro: [{ say: 'Robot talk! Sss, uh, nnn. Push the sounds together fast. Sun!', visual: { kind: 'emoji', emoji: '☀️', size: 'xl' } }],
  items: items('r.blend', [
    { difficulty: 1, say: 'Robot talk! Listen: sss… uh… nnn. Which picture is it?', show: 'Blend the sounds.', choices: [pic('☀️', 'sun'), pic('🧦', 'sock', 'used_first_sound_only'), pic('🥜', 'nut', 'sound_order_confusion')], explain: 'Sss, uh, nnn. Push them together: sun.' },
    { difficulty: 1, say: 'Robot talk! Listen: mmm… ooo… nnn. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🐭', 'mouse', 'used_first_sound_only'), pic('🌙', 'moon'), pic('🥄', 'spoon', 'rhyme_not_blend')], explain: 'Mmm, ooo, nnn. Push them together: moon.' },
    { difficulty: 2, say: 'Robot talk! Listen: fff… ih… shh. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🦊', 'fox', 'used_first_sound_only'), pic('🍽️', 'dish', 'rhyme_not_blend'), pic('🐟', 'fish')], explain: 'Fff, ih, shh. Push them together: fish.' },
    { difficulty: 2, say: 'Robot talk! Listen: vvv… aa… nnn. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🚐', 'van'), pic('🎻', 'violin', 'used_first_sound_only'), pic('🍳', 'pan', 'rhyme_not_blend')], explain: 'Vvv, aa, nnn. Push them together: van.' },
    { difficulty: 3, say: 'Robot talk! Listen: nnn… eh… sss… t. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🥅', 'net', 'dropped_a_sound'), pic('🪺', 'nest'), pic('👃', 'nose', 'used_first_sound_only')], explain: 'Nnn, eh, sss, t. Four sounds make nest.' },
    { difficulty: 3, say: 'Robot talk! Listen: fff… rrr… aw… g. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🦊', 'fox', 'used_first_sound_only'), pic('🐶', 'dog', 'rhyme_not_blend'), pic('🐸', 'frog')], explain: 'Fff, rrr, aw, g. Push them together: frog.' },
    { difficulty: 1, say: 'Robot talk! Listen: nnn… ohh… zzz. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🥜', 'nut', 'used_first_sound_only'), pic('👃', 'nose'), pic('🌹', 'rose', 'rhyme_not_blend')], explain: 'Nnn, ohh, zzz. Push them together: nose.' },
    { difficulty: 2, say: 'Robot talk! Listen: rrr… ay… nnn. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🌧️', 'rain'), pic('🚀', 'rocket', 'used_first_sound_only'), pic('🚆', 'train', 'rhyme_not_blend')], explain: 'Rrr, ay, nnn. Push them together: rain.' },
    { difficulty: 2, say: 'Robot talk! Listen: shh… ih… p. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🐑', 'sheep', 'used_first_sound_only'), pic('🐟', 'fish', 'sound_order_confusion'), pic('🚢', 'ship')], explain: 'Shh, ih, p. Push them together: ship.' },
    { difficulty: 3, say: 'Robot talk! Listen: d… rrr… uh… mmm. Which picture is it?', show: 'Blend the sounds.', choices: [pic('🐶', 'dog', 'used_first_sound_only'), pic('🥁', 'drum'), pic('👍', 'thumb', 'rhyme_not_blend')], explain: 'D, rrr, uh, mmm. Four sounds make drum.' },
  ]),
};

const segment: Skill = {
  id: 'r.segment',
  subject: 'reading',
  strand: 'phonological',
  grade: 'K',
  title: 'Count the sounds (phonemes) in a word',
  kidTitle: 'Count the sounds',
  icon: '🔊',
  standards: ['RF.K.2d'],
  prereqs: ['r.blend'],
  parentTip: 'Use 3–4 coins. Say a word slowly and push one coin forward for each sound you hear.',
  intro: [{ say: 'Cat has three sounds. C, a, t. One, two, three!', visual: { kind: 'emoji', emoji: '🐱', size: 'xl' } }],
  items: items('r.segment', [
    { difficulty: 1, say: 'Say it slowly: bee. How many sounds do you hear in bee?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🐝', label: 'bee' }, choices: [num(1, 'phoneme_undercount'), num(2), num(3, 'counted_letters_not_sounds')], keepOrder: true, explain: 'B, ee. Bee has 2 sounds, even though it has 3 letters.' },
    { difficulty: 2, say: 'Say it slowly: cup. How many sounds do you hear in cup?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '☕', label: 'cup' }, choices: [num(1, 'phoneme_undercount'), num(2, 'phoneme_undercount'), num(3), num(4, 'phoneme_overcount')], keepOrder: true, explain: 'C, u, p. Cup has 3 sounds.' },
    { difficulty: 2, say: 'Say it slowly: fish. How many sounds do you hear in fish?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🐟', label: 'fish' }, choices: [num(2, 'phoneme_undercount'), num(3), num(4, 'counted_letters_not_sounds')], keepOrder: true, explain: 'Fff, ih, shh. Fish has 3 sounds. S and H work together to make one sound.' },
    { difficulty: 3, say: 'Say it slowly: frog. How many sounds do you hear in frog?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🐸', label: 'frog' }, choices: [num(2, 'phoneme_undercount'), num(3, 'blend_counted_as_one'), num(4)], keepOrder: true, explain: 'Fff, rrr, aw, g. Frog has 4 sounds.' },
    { difficulty: 1, say: 'Say it slowly: sun. How many sounds do you hear in sun?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '☀️', label: 'sun' }, choices: [num(2, 'phoneme_undercount'), num(3), num(4, 'phoneme_overcount')], keepOrder: true, explain: 'Sss, uh, nnn. Sun has 3 sounds.' },
    { difficulty: 1, say: 'Say it slowly: pig. How many sounds do you hear in pig?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🐷', label: 'pig' }, choices: [num(1, 'phoneme_undercount'), num(2, 'phoneme_undercount'), num(3), num(4, 'phoneme_overcount')], keepOrder: true, explain: 'P, ih, g. Pig has 3 sounds.' },
    { difficulty: 2, say: 'Say it slowly: egg. How many sounds do you hear in egg?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🥚', label: 'egg' }, choices: [num(1, 'phoneme_undercount'), num(2), num(3, 'counted_letters_not_sounds')], keepOrder: true, explain: 'Eh, g. Egg has 2 sounds. The two g letters make just one sound.' },
    { difficulty: 2, say: 'Say it slowly: moon. How many sounds do you hear in moon?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🌙', label: 'moon' }, choices: [num(2, 'phoneme_undercount'), num(3), num(4, 'counted_letters_not_sounds')], keepOrder: true, explain: 'Mmm, ooo, nnn. Moon has 3 sounds. The two o letters make one sound together.' },
    { difficulty: 3, say: 'Say it slowly: stop. How many sounds do you hear in stop?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🛑', label: 'stop' }, choices: [num(3, 'blend_counted_as_one'), num(4), num(5, 'phoneme_overcount')], keepOrder: true, explain: 'Sss, t, aw, p. Stop has 4 sounds. Listen for both s and t at the start.' },
    { difficulty: 3, say: 'Say it slowly: sheep. How many sounds do you hear in sheep?', show: 'How many sounds?', visual: { kind: 'emoji', emoji: '🐑', label: 'sheep' }, choices: [num(2, 'phoneme_undercount'), num(3), num(4, 'phoneme_overcount'), num(5, 'counted_letters_not_sounds')], keepOrder: true, explain: 'Shh, ee, p. Sheep has 3 sounds, even though it has 5 letters.' },
  ]),
};

/* ------------------------------------------------------------------------ */
/* HIGH-FREQUENCY WORDS                                                     */
/* ------------------------------------------------------------------------ */
// Distractors are visually similar but NEVER homophones (no to/two/too, for/four, see/sea).
const SIGHT: { w: string; easy: string[]; hard: string[] }[] = [
  { w: 'the', easy: ['and', 'is'], hard: ['then', 'they', 'he'] },
  { w: 'and', easy: ['the', 'my'], hard: ['an', 'end', 'can'] },
  { w: 'is', easy: ['we', 'go'], hard: ['it', 'in', 'as'] },
  { w: 'see', easy: ['and', 'my'], hard: ['she', 'seed', 'bee'] },
  { w: 'was', easy: ['go', 'the'], hard: ['saw', 'has', 'way'] },
  { w: 'said', easy: ['look', 'come'], hard: ['sad', 'sand', 'paid'] },
  { w: 'you', easy: ['the', 'is'], hard: ['your', 'yes', 'out'] },
  { w: 'he', easy: ['go', 'and'], hard: ['she', 'her', 'hi'] },
  { w: 'we', easy: ['is', 'look'], hard: ['me', 'were', 'wet'] },
  { w: 'my', easy: ['the', 'come'], hard: ['me', 'by', 'may'] },
  { w: 'like', easy: ['and', 'you'], hard: ['look', 'lake', 'little'] },
  { w: 'have', easy: ['the', 'is'], hard: ['has', 'had', 'here'] },
  { w: 'come', easy: ['my', 'he'], hard: ['came', 'some', 'cone'] },
  { w: 'here', easy: ['and', 'go'], hard: ['there', 'her', 'have'] },
  { w: 'where', easy: ['is', 'you'], hard: ['there', 'were', 'when'] },
  { w: 'what', easy: ['go', 'my'], hard: ['that', 'want', 'when'] },
  { w: 'play', easy: ['is', 'he'], hard: ['pay', 'plan', 'clay'] },
  { w: 'with', easy: ['my', 'go'], hard: ['will', 'wish', 'what'] },
  { w: 'this', easy: ['we', 'go'], hard: ['his', 'the', 'thin'] },
  { w: 'look', easy: ['and', 'he'], hard: ['book', 'like', 'took'] },
];

const sight: Skill = {
  id: 'r.sight',
  subject: 'reading',
  strand: 'hfw',
  grade: 'K',
  title: 'Read high-frequency (sight) words',
  kidTitle: 'Sight words',
  icon: '👀',
  standards: ['RF.K.3c'],
  prereqs: ['r.letters'],
  parentTip: 'Put 5 sight words on the fridge each week. Play "slap it": you say a word, he slaps the card.',
  intro: [{ say: 'Some words we see so often that we learn them by heart. This word is said. S, a, i, d. Said!', visual: { kind: 'text', text: 'said', size: 'xl' } }],
  generate: (rng, d) => {
    const t = rng.pick(SIGHT);
    const dist = d === 1 ? [...t.easy, t.hard[0]].slice(0, 2) : d === 2 ? [t.hard[0], t.easy[0], t.hard[1]] : t.hard;
    return makeItem('r.sight', `${t.w}-${d}`, d, {
      say: `Find the word ${t.w}.`,
      show: 'Find the word.',
      choices: [{ text: t.w, correct: true as const }, ...dist.map((w) => ({ text: w, why: t.hard.includes(w) ? 'lookalike_sight_word' : 'sight_word_unknown' }))],
      speakChoices: false,
      explain: `This is the word ${t.w}: ${t.w.split('').join(', ')}.`,
    });
  },
};

/* ------------------------------------------------------------------------ */
/* VOCABULARY                                                               */
/* ------------------------------------------------------------------------ */

const vocab: Skill = {
  id: 'r.vocab',
  subject: 'reading',
  strand: 'vocab',
  grade: 'K',
  title: 'Word meanings, categories and opposites',
  kidTitle: 'Word power',
  icon: '💬',
  standards: ['L.K.5a', 'L.K.5b'],
  prereqs: [],
  parentTip: 'Use one "fancy word" a day at dinner (enormous, curious, exhausted) and ask him to use it in a sentence.',
  intro: [{ say: 'Words can belong to groups. Apple, banana and grapes are all fruit!', visual: { kind: 'row', items: [{ kind: 'emoji', emoji: '🍎' }, { kind: 'emoji', emoji: '🍌' }, { kind: 'emoji', emoji: '🍇' }] } }],
  items: items('r.vocab', [
    { difficulty: 1, say: 'Which one is a vegetable?', show: 'Which is a vegetable?', choices: [pic('🍎', 'apple', 'category_near_miss'), pic('🥕', 'carrot'), pic('🍪', 'cookie', 'category_confusion'), pic('🧸', 'teddy bear', 'category_confusion')], explain: 'A carrot is a vegetable. It grows in the ground. An apple is a fruit.' },
    { difficulty: 1, say: 'Which one does NOT belong? Dog, cat, rabbit, car.', show: 'Which does NOT belong?', choices: [pic('🐶', 'dog', 'category_confusion'), pic('🐱', 'cat', 'category_confusion'), pic('🚗', 'car'), pic('🐰', 'rabbit', 'category_confusion')], explain: 'Dog, cat and rabbit are animals. A car is not an animal.' },
    { difficulty: 1, say: 'What is the opposite of hot?', show: 'Opposite of hot', visual: { kind: 'emoji', emoji: '🔥' }, choices: [pic('🧊', 'cold'), pic('☀️', 'sunny', 'related_not_opposite'), pic('🌶️', 'spicy', 'synonym_not_opposite')], explain: 'Hot and cold are opposites. Ice is cold.' },
    { difficulty: 2, say: 'Which one goes with a sock?', show: 'Goes with a sock', visual: { kind: 'emoji', emoji: '🧦' }, choices: [pic('🍝', 'spaghetti', 'no_association'), pic('👟', 'shoe'), pic('🧢', 'cap', 'category_near_miss')], explain: 'We wear a sock inside a shoe. They go together.' },
    { difficulty: 2, speakChoices: false, say: 'A chef cooks food. Which picture shows a chef?', show: 'Find the chef', choices: [pic('👩‍🚀', 'astronaut', 'word_meaning_unknown'), pic('👩‍🍳', 'chef'), pic('👨‍🚒', 'firefighter', 'word_meaning_unknown'), pic('👩‍🏫', 'teacher', 'word_meaning_unknown')], explain: 'A chef wears a tall white hat and cooks food.' },
    { difficulty: 3, say: 'Enormous means very, very big. Which animal is enormous?', show: 'Which is enormous?', choices: [pic('🐜', 'ant', 'word_meaning_reversed'), pic('🐁', 'mouse', 'word_meaning_reversed'), pic('🐋', 'whale'), pic('🐇', 'rabbit', 'word_meaning_unknown')], explain: 'A whale is enormous. It is one of the biggest animals in the world.' },
    { difficulty: 3, speakChoices: false, say: 'When you shiver, your body shakes because you are cold. Which one is shivering?', show: 'Who is shivering?', choices: [pic('🥵', 'hot face', 'word_meaning_reversed'), pic('🥶', 'cold face'), pic('😴', 'sleepy face', 'word_meaning_unknown'), pic('😂', 'laughing face', 'word_meaning_unknown')], explain: 'The cold, blue face is shivering. We shiver when we are cold.' },
    { difficulty: 3, say: 'Which word means almost the same as happy?', show: 'Almost the same as happy', choices: [txt('glad'), txt('sad', 'antonym_for_synonym'), txt('mad', 'word_meaning_unknown'), txt('tired', 'word_meaning_unknown')], explain: 'Glad means happy. Sad is the opposite of happy.' },
    { difficulty: 2, say: 'Which one does NOT belong? Car, bus, train, house.', show: 'Which does NOT belong?', choices: [pic('🚗', 'car', 'category_confusion'), pic('🚌', 'bus', 'category_confusion'), pic('🚆', 'train', 'category_confusion'), pic('🏠', 'house')], explain: 'A car, a bus and a train can take you places. A house does not move.' },
    { difficulty: 2, say: 'What is the opposite of day?', show: 'Opposite of day', visual: { kind: 'emoji', emoji: '☀️' }, choices: [pic('🌅', 'morning', 'related_not_opposite'), pic('🌙', 'night'), pic('🌈', 'rainbow', 'related_not_opposite')], explain: 'Day and night are opposites. The sun shines in the day, and the moon comes out at night.' },
  ]),
};

/* ------------------------------------------------------------------------ */
/* COMPREHENSION (listening)                                                */
/* ------------------------------------------------------------------------ */

const PIP = {
  title: "Pip's Big Day",
  lines: [
    { emoji: '🐶', text: 'Pip the puppy woke up early.' },
    { emoji: '⚽', text: 'He ran to the park with his red ball.' },
    { emoji: '🦆', text: 'At the park, Pip saw a duck in the pond.' },
    { emoji: '💦', text: 'Pip dropped his ball and splashed into the water!' },
    { emoji: '🏠', text: 'Then Pip went home, wet and happy.' },
  ],
};
const SEED = {
  title: "Maya's Seed",
  lines: [
    { emoji: '👧', text: 'Maya planted a tiny seed.' },
    { emoji: '💧', text: 'Every day, she gave it water.' },
    { emoji: '🌱', text: 'Soon, a green sprout popped up.' },
    { emoji: '🌻', text: 'At last, a big yellow sunflower grew taller than Maya!' },
  ],
};
const MITTEN = {
  title: 'The Lost Mitten',
  lines: [
    { emoji: '👦', text: 'Leo lost his blue mitten in the snow.' },
    { emoji: '🛝', text: 'He looked under the slide. It was not there.' },
    { emoji: '🌲', text: 'He looked behind the tree. There it was!' },
    { emoji: '🐰', text: 'A little bunny was sleeping inside it, warm and cozy.' },
  ],
};
const BLOCKS = {
  title: 'The Block Tower',
  lines: [
    { emoji: '🧒', text: 'Ben built a tower of blocks on the table.' },
    { emoji: '🐱', text: 'His cat, Tiger, jumped up on the table.' },
    { emoji: '💥', text: 'Crash! The tower fell down.' },
    { emoji: '😟', text: 'Ben felt upset.' },
    { emoji: '🧱', text: 'Then he built a new tower on the floor.' },
  ],
};
const storyText = (s: { lines: { text: string }[] }) => s.lines.map((l) => l.text).join(' ');

const lit: Skill = {
  id: 'r.lit',
  subject: 'reading',
  strand: 'lit',
  grade: 'K',
  title: 'Story comprehension: characters, setting, events',
  kidTitle: 'Story time',
  icon: '📚',
  standards: ['RL.K.1', 'RL.K.3'],
  prereqs: [],
  parentTip: 'After reading, ask: Who was in the story? Where did it happen? What happened first, next, last?',
  intro: [{ say: 'Good listeners make a movie in their mind. Who is in the story? Where are they? What happens first, next and last?' }],
  items: items('r.lit', [
    { difficulty: 1, say: `Listen to the story. ${storyText(PIP)} Who is this story about?`, show: 'Who is the story about?', visual: { kind: 'story', ...PIP }, choices: [pic('🐶', 'Pip the puppy'), pic('🦆', 'the duck', 'minor_detail_as_main'), pic('🐱', 'a cat', 'not_in_story')], explain: 'The story is about Pip the puppy. The duck is only in one part.' },
    { difficulty: 2, say: `Where did Pip go FIRST? Listen again. ${storyText(PIP)}`, show: 'Where did Pip go first?', visual: { kind: 'story', ...PIP }, choices: [pic('🏠', 'home', 'sequence_error'), pic('🌳', 'the park'), pic('🏫', 'school', 'not_in_story')], explain: 'First Pip ran to the park. He went home at the end.' },
    { difficulty: 3, say: `How did Pip feel at the end? ${storyText(PIP)}`, show: 'How did Pip feel at the end?', visual: { kind: 'story', ...PIP }, choices: [pic('😢', 'sad', 'inference_from_wrong_detail'), pic('😊', 'happy'), pic('😠', 'angry', 'not_in_story')], explain: 'The story says Pip went home wet and happy. Being wet did not make him sad!' },
    { difficulty: 1, say: `Listen to the story. ${storyText(SEED)} What grew at the end?`, show: 'What grew at the end?', visual: { kind: 'story', ...SEED }, choices: [pic('🌹', 'a rose', 'detail_error'), pic('🌳', 'a tree', 'detail_error'), pic('🌻', 'a sunflower')], explain: 'A big yellow sunflower grew at the end.' },
    { difficulty: 2, say: `What did Maya do FIRST? ${storyText(SEED)}`, show: 'What did Maya do first?', visual: { kind: 'story', ...SEED }, choices: [pic('💧', 'gave it water', 'sequence_error'), pic('🫘', 'planted a seed'), pic('🌻', 'picked a flower', 'sequence_error')], explain: 'First, Maya planted a tiny seed. Then she watered it.' },
    { difficulty: 3, say: `Why did the seed grow into a sunflower? ${storyText(SEED)}`, show: 'Why did it grow?', visual: { kind: 'story', ...SEED }, choices: [pic('🎵', 'Maya sang to it', 'not_in_story'), pic('💧', 'Maya watered it every day'), pic('🌙', 'It was nighttime', 'irrelevant_detail')], explain: 'Maya gave it water every day. Plants need water to grow.' },
    { difficulty: 1, say: `Listen to the story. ${storyText(MITTEN)} What did Leo lose?`, show: 'What did Leo lose?', visual: { kind: 'story', ...MITTEN }, choices: [pic('🧤', 'a mitten'), pic('🧢', 'a hat', 'detail_error'), pic('🧣', 'a scarf', 'detail_error')], explain: 'Leo lost his blue mitten.' },
    { difficulty: 2, say: `Where did Leo find his mitten? ${storyText(MITTEN)}`, show: 'Where was the mitten?', visual: { kind: 'story', ...MITTEN }, choices: [pic('🛝', 'under the slide', 'detail_error'), pic('🌲', 'behind the tree'), pic('🏠', 'in his house', 'not_in_story')], explain: 'He looked under the slide first, but it was not there. It was behind the tree.' },
    { difficulty: 3, say: `Why did the bunny sleep in the mitten? ${storyText(MITTEN)}`, show: 'Why did the bunny sleep there?', visual: { kind: 'story', ...MITTEN }, choices: [pic('🔥', 'It was warm and cozy'), pic('🔵', 'It was blue', 'irrelevant_detail'), pic('🍎', 'It had food inside', 'not_in_story')], explain: 'It was cold and snowy. The mitten was warm and cozy for the bunny.' },
    { difficulty: 1, say: `Listen to the story. ${storyText(BLOCKS)} What did Ben build?`, show: 'What did Ben build?', visual: { kind: 'story', ...BLOCKS }, choices: [pic('🚗', 'a car', 'not_in_story'), pic('🧱', 'a block tower'), pic('🏰', 'a castle', 'not_in_story')], explain: 'Ben built a tower of blocks.' },
    { difficulty: 2, say: `What happened right after Tiger jumped on the table? ${storyText(BLOCKS)}`, show: 'What happened next?', visual: { kind: 'story', ...BLOCKS }, choices: [pic('💥', 'the tower fell down'), pic('🧱', 'Ben built a new tower', 'sequence_error'), pic('😴', 'Tiger went to sleep', 'not_in_story')], explain: 'Tiger jumped on the table, and then crash! The tower fell down. Ben built a new one later.' },
    { difficulty: 3, say: `Why do you think Ben built his new tower on the floor? ${storyText(BLOCKS)}`, show: 'Why on the floor?', visual: { kind: 'story', ...BLOCKS }, choices: [pic('🛏️', 'he was sleepy', 'not_in_story'), pic('🐱', 'so Tiger would not knock it down'), pic('🎨', 'the floor is a pretty color', 'irrelevant_detail')], explain: 'Tiger knocked the first tower off the table. On the floor, it is safer from the cat.' },
  ]),
};

const BEES = {
  title: 'Busy Bees',
  lines: [
    { emoji: '🐝', text: 'Bees are insects.' },
    { emoji: '🌸', text: 'Bees fly from flower to flower.' },
    { emoji: '💧', text: 'They drink a sweet juice called nectar.' },
    { emoji: '🏠', text: 'Bees carry the nectar back to their hive.' },
    { emoji: '🍯', text: 'In the hive, bees make honey.' },
  ],
};
const PENGUINS = {
  title: 'Penguins',
  lines: [
    { emoji: '🐧', text: 'Penguins are birds, but they cannot fly.' },
    { emoji: '🌊', text: 'Penguins are great swimmers.' },
    { emoji: '❄️', text: 'Many penguins live where it is very cold.' },
    { emoji: '🪶', text: 'Thick feathers keep them warm.' },
  ],
};

const OWLS = {
  title: 'Owls at Night',
  lines: [
    { emoji: '🦉', text: 'Owls are birds that hunt at night.' },
    { emoji: '👀', text: 'Their big eyes help them see in the dark.' },
    { emoji: '👂', text: 'Owls can hear very well, too.' },
    { emoji: '🪶', text: 'Soft feathers let owls fly without making a sound.' },
    { emoji: '🐭', text: 'Owls eat mice, bugs and other small animals.' },
  ],
};

const info: Skill = {
  id: 'r.info',
  subject: 'reading',
  strand: 'info',
  grade: 'K',
  title: 'Informational text: main topic and key details',
  kidTitle: 'Fact finder',
  icon: '🔎',
  standards: ['RI.K.1', 'RI.K.2'],
  prereqs: [],
  parentTip: 'Read a nonfiction animal book. Ask: "What is this book mostly about? Tell me one fact you learned."',
  intro: [{ say: 'Some books teach us true facts. Ask yourself: what is this mostly about? What did I learn?' }],
  items: items('r.info', [
    { difficulty: 1, say: `Listen. ${storyText(BEES)} What is this mostly about?`, show: 'Mostly about…', visual: { kind: 'story', ...BEES }, choices: [pic('🌸', 'flowers', 'detail_as_main_topic'), pic('🐝', 'bees'), pic('🐻', 'bears', 'not_in_text')], explain: 'Every sentence tells about bees. So it is mostly about bees.' },
    { difficulty: 2, say: `Where do bees make honey? ${storyText(BEES)}`, show: 'Where do bees make honey?', visual: { kind: 'story', ...BEES }, choices: [pic('🌸', 'in a flower', 'detail_error'), pic('🌊', 'in the sea', 'not_in_text'), pic('🏠', 'in the hive')], explain: 'The text says: in the hive, bees make honey.' },
    { difficulty: 3, say: `What do bees drink? ${storyText(BEES)}`, show: 'What do bees drink?', visual: { kind: 'story', ...BEES }, choices: [pic('🍯', 'honey', 'detail_error'), pic('🌸', 'nectar from flowers'), pic('🥛', 'milk', 'not_in_text')], explain: 'Bees drink nectar. They MAKE honey from it later.' },
    { difficulty: 1, say: `Listen. ${storyText(PENGUINS)} What kind of animal is a penguin?`, show: 'A penguin is a…', visual: { kind: 'story', ...PENGUINS }, choices: [pic('🐟', 'fish', 'inference_from_wrong_detail'), pic('🐦', 'bird'), pic('🐻', 'bear', 'not_in_text')], explain: 'The text says penguins are birds. They swim, but they are not fish.' },
    { difficulty: 2, say: `What keeps penguins warm? ${storyText(PENGUINS)}`, show: 'What keeps penguins warm?', visual: { kind: 'story', ...PENGUINS }, choices: [pic('🧥', 'coats', 'not_in_text'), pic('🪶', 'thick feathers'), pic('☀️', 'the sun', 'not_in_text')], explain: 'Thick feathers keep penguins warm.' },
    { difficulty: 3, say: `Penguins cannot fly. What can they do very well? ${storyText(PENGUINS)}`, show: 'What can penguins do well?', visual: { kind: 'story', ...PENGUINS }, choices: [pic('🏊', 'swim'), pic('🧗', 'climb', 'not_in_text'), pic('🕊️', 'fly', 'contradicts_text')], explain: 'Penguins are great swimmers. The text says they cannot fly.' },
    { difficulty: 1, say: `Listen. ${storyText(OWLS)} What is this mostly about?`, show: 'Mostly about…', visual: { kind: 'story', ...OWLS }, choices: [pic('🦉', 'owls'), pic('🐭', 'mice', 'detail_as_main_topic'), pic('🦇', 'bats', 'not_in_text')], explain: 'Every sentence tells about owls. So it is mostly about owls.' },
    { difficulty: 2, say: `When do owls hunt? ${storyText(OWLS)}`, show: 'When do owls hunt?', visual: { kind: 'story', ...OWLS }, choices: [pic('☀️', 'at lunchtime', 'not_in_text'), pic('🌙', 'at night'), pic('🌧️', 'when it rains', 'not_in_text')], explain: 'The text says owls are birds that hunt at night.' },
    { difficulty: 2, say: `What helps owls see in the dark? ${storyText(OWLS)}`, show: 'What helps owls see?', visual: { kind: 'story', ...OWLS }, choices: [pic('👂', 'good ears', 'detail_error'), pic('🔦', 'a flashlight', 'not_in_text'), pic('👀', 'big eyes')], explain: 'The text says their big eyes help them see in the dark. Their ears help them hear.' },
    { difficulty: 3, say: `Why can a mouse not hear an owl flying close? ${storyText(OWLS)}`, show: 'Why can the mouse not hear it?', visual: { kind: 'story', ...OWLS }, choices: [pic('🪶', 'soft feathers'), pic('👀', 'big eyes', 'detail_error'), pic('🌙', 'it is dark', 'inference_from_wrong_detail')], explain: 'Soft feathers let owls fly without making a sound, so the mouse cannot hear them coming.' },
  ]),
};

/* ------------------------------------------------------------------------ */
/* GRADE 1 STRETCH                                                          */
/* ------------------------------------------------------------------------ */

const digraphs: Skill = {
  id: 'r1.digraphs',
  subject: 'reading',
  strand: 'phonics',
  grade: '1',
  title: 'Digraphs sh, ch, th',
  kidTitle: 'Letter teams',
  icon: '🤫',
  standards: ['RF.1.3a'],
  prereqs: ['r.lettersound'],
  parentTip: 'Make "sh" the quiet sound (finger on lips) and "ch" the train sound. Sort toys by which one they start with.',
  intro: [{ say: 'Some letters work as a team to make one sound. S and H together say shh, like when a baby is sleeping.', visual: { kind: 'text', text: 'sh', size: 'xl' } }],
  items: items('r1.digraphs', [
    { difficulty: 1, say: 'These letters say shh. Which picture starts with this sound?', show: 'Starts with…', visual: { kind: 'text', text: 'sh', size: 'xl' }, choices: [pic('🐑', 'sheep'), pic('🐍', 'snake', 'single_letter_not_team'), pic('🧀', 'cheese', 'digraph_confusion')], explain: 'Sheep starts with shh. S and H make that sound together.' },
    { difficulty: 2, say: 'Which picture starts with these letters?', show: 'Starts with…', visual: { kind: 'text', text: 'ch', size: 'xl' }, choices: [pic('👞', 'shoe', 'digraph_confusion'), pic('🍒', 'cherries'), pic('🐱', 'cat', 'single_letter_not_team')], speakChoices: true, explain: 'C and H together say ch, like a train: ch, ch. Cherries starts with ch.' },
    { difficulty: 2, say: 'Which picture starts with these letters?', show: 'Starts with…', visual: { kind: 'text', text: 'th', size: 'xl' }, choices: [pic('🌳', 'tree', 'single_letter_not_team'), pic('👍', 'thumb'), pic('🦈', 'shark', 'digraph_confusion')], explain: 'T and H together say th — stick your tongue out a little! Thumb starts with th.' },
    { difficulty: 3, say: 'Which letters does this picture start with?', show: 'Which letters?', visual: { kind: 'emoji', emoji: '🦈', size: 'xl', label: 'shark' }, choices: [txt('sh'), txt('ch', 'digraph_confusion'), txt('th', 'digraph_confusion'), txt('s', 'single_letter_not_team')], speakChoices: false, explain: 'Shark starts with shh, spelled S H.' },
    { difficulty: 1, say: 'These letters say shh. Which picture starts with this sound?', show: 'Starts with…', visual: { kind: 'text', text: 'sh', size: 'xl' }, choices: [pic('🐶', 'dog', 'letter_sound_unknown'), pic('👞', 'shoe'), pic('🍒', 'cherries', 'digraph_confusion')], explain: 'Shoe starts with shh. S and H make that sound together.' },
    { difficulty: 1, say: 'Which picture starts with these letters?', show: 'Starts with…', visual: { kind: 'text', text: 'ch', size: 'xl' }, choices: [pic('🐔', 'chicken'), pic('🐟', 'fish', 'letter_sound_unknown'), pic('🐑', 'sheep', 'digraph_confusion')], explain: 'C and H together say ch, like a train. Chicken starts with ch.' },
    { difficulty: 2, say: 'Which picture starts with these letters?', show: 'Starts with…', visual: { kind: 'text', text: 'sh', size: 'xl' }, choices: [pic('🐍', 'snake', 'single_letter_not_team'), pic('🧀', 'cheese', 'digraph_confusion'), pic('🐚', 'shell')], explain: 'S and H together say shh. Shell starts with shh. Snake starts with just s.' },
    { difficulty: 2, say: 'Which picture ENDS with these letters?', show: 'Ends with…', visual: { kind: 'text', text: 'sh', size: 'xl' }, choices: [pic('🐟', 'fish'), pic('⌚', 'watch', 'digraph_confusion'), pic('🚌', 'bus', 'single_letter_not_team')], explain: 'Fish ends with shh, spelled S H. Bus ends with just s.' },
    { difficulty: 3, say: 'Which picture ENDS with these letters?', show: 'Ends with…', visual: { kind: 'text', text: 'th', size: 'xl' }, choices: [pic('⌚', 'watch', 'digraph_confusion'), pic('🎩', 'hat', 'single_letter_not_team'), pic('🦷', 'tooth'), pic('🐟', 'fish', 'digraph_confusion')], explain: 'Tooth ends with th, spelled T H. Hat ends with just t.' },
    { difficulty: 3, say: 'Which letters does this picture start with?', show: 'Which letters?', visual: { kind: 'emoji', emoji: '🧀', size: 'xl', label: 'cheese' }, choices: [txt('sh', 'digraph_confusion'), txt('ch'), txt('th', 'digraph_confusion'), txt('c', 'single_letter_not_team')], speakChoices: false, explain: 'Cheese starts with ch, spelled C H.' },
  ]),
};

const silentE: Skill = {
  id: 'r1.silente',
  subject: 'reading',
  strand: 'phonics',
  grade: '1',
  title: 'Silent-e (long vowel) words',
  kidTitle: 'Magic e',
  icon: '✨',
  standards: ['RF.1.3c'],
  prereqs: ['r.cvc'],
  parentTip: 'Write "pin" then add an "e" to make "pine". Let him wave a "magic wand" over the e.',
  intro: [{ say: 'Magic e is quiet, but it makes the vowel say its name. Pin becomes pine!', visual: { kind: 'row', items: [{ kind: 'text', text: 'pin', size: 'lg' }, { kind: 'text', text: 'pine', size: 'lg' }] } }],
  items: items('r1.silente', [
    { difficulty: 1, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'pine', size: 'xl' }, choices: [pic('📌', 'pin', 'ignored_silent_e'), pic('🌲', 'pine tree'), pic('🐷', 'pig', 'used_first_letter_only')], explain: 'The e makes i say its name: p, eye, n. Pine, like a pine tree.' },
    { difficulty: 2, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'cape', size: 'xl' }, choices: [pic('🧢', 'cap', 'ignored_silent_e'), pic('🦸', 'superhero cape'), pic('🐱', 'cat', 'used_first_letter_only')], explain: 'The e makes a say its name: c, ay, p. Cape.' },
    { difficulty: 2, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'rose', size: 'xl' }, choices: [pic('🌹', 'rose'), pic('🎣', 'fishing rod', 'ignored_silent_e'), pic('🚀', 'rocket', 'used_first_letter_only')], explain: 'The e makes o say its name: r, oh, z. Rose.' },
    { difficulty: 3, speakChoices: false, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'bike', size: 'xl' }, choices: [pic('🐝', 'bee', 'used_first_letter_only'), pic('🚲', 'bike'), pic('🪁', 'kite', 'rhyme_guess')], explain: 'The e makes i say its name: b, eye, k. Bike.' },
    { difficulty: 1, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'cake', size: 'xl' }, speakChoices: false, choices: [pic('🐱', 'cat', 'used_first_letter_only'), pic('🎂', 'cake'), pic('🐍', 'snake', 'rhyme_guess')], explain: 'The e makes a say its name: c, ay, k. Cake.' },
    { difficulty: 1, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'bone', size: 'xl' }, speakChoices: false, choices: [pic('🦴', 'bone'), pic('🐶', 'dog', 'guessed_from_category'), pic('📱', 'phone', 'rhyme_guess')], explain: 'The e makes o say its name: b, oh, n. Bone.' },
    { difficulty: 2, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'cube', size: 'xl' }, speakChoices: false, choices: [pic('🐻', 'bear cub', 'ignored_silent_e'), pic('🧊', 'ice cube'), pic('🎂', 'cake', 'used_first_letter_only')], explain: 'The e makes u say its name: c, you, b. Cube. Without the e, it would say cub.' },
    { difficulty: 2, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'tube', size: 'xl' }, speakChoices: false, choices: [pic('🛁', 'tub', 'ignored_silent_e'), pic('🐯', 'tiger', 'used_first_letter_only'), pic('🧪', 'tube')], explain: 'The e makes u say its name: t, oo, b. Tube. Without the e, it would say tub.' },
    { difficulty: 3, say: 'Read the words. Which word has the long i sound, like in ice?', show: 'Which has the long i sound?', choices: [txt('rid', 'ignored_silent_e'), txt('ride'), txt('red', 'vowel_confusion'), txt('rod', 'vowel_confusion')], speakChoices: false, explain: 'Ride ends with a magic e, so the i says its name: r, eye, d. Rid has a short i.' },
    { difficulty: 3, say: 'Read the word. Which picture matches?', show: 'Read the word.', visual: { kind: 'text', text: 'globe', size: 'xl' }, speakChoices: false, choices: [pic('🧤', 'glove', 'lookalike_word'), pic('🌎', 'globe'), pic('🐐', 'goat', 'used_first_letter_only')], explain: 'g, l, oh, b. The e makes o say its name. Globe. Look closely: glove has a v, globe has a b.' },
  ]),
};

const sentences: Skill = {
  id: 'r1.sentence',
  subject: 'reading',
  strand: 'phonics',
  grade: '1',
  title: 'Read a simple sentence and show understanding',
  kidTitle: 'Read a sentence',
  icon: '📝',
  standards: ['RF.1.4a'],
  prereqs: ['r.cvc', 'r.sight', 'm.position'],
  parentTip: 'Write a silly sentence on a whiteboard ("The cat is on the dog") and have him draw it.',
  intro: [{ say: 'Read every word, then picture it in your mind. Does the picture match ALL the words?' }],
  items: items('r1.sentence', [
    { difficulty: 1, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The cat is on the box.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🐈', ref: '📦', where: 'above' }, undefined), vis({ kind: 'place', thing: '🐈', ref: '📦', where: 'inside' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🐕', ref: '📦', where: 'above' }, undefined, 'noun_misread')], speakChoices: false, explain: 'The cat is ON the box, sitting on top.' },
    { difficulty: 2, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The dog is in the box.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🐕', ref: '📦', where: 'beside' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🐈', ref: '📦', where: 'inside' }, undefined, 'noun_misread'), vis({ kind: 'place', thing: '🐕', ref: '📦', where: 'inside' }, undefined)], speakChoices: false, explain: 'The DOG is IN the box. Both words matter!' },
    { difficulty: 3, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'A big bug sat by the bed.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🐛', ref: '🛏️', where: 'beside' }, undefined), vis({ kind: 'place', thing: '🐛', ref: '🛏️', where: 'above' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🐝', ref: '🛏️', where: 'beside' }, undefined, 'noun_misread')], speakChoices: false, explain: 'By the bed means next to the bed. The bug is beside the bed.' },
    { difficulty: 1, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The bee is on the cake.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🐝', ref: '🎂', where: 'beside' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🐝', ref: '🎂', where: 'above' }, undefined), vis({ kind: 'place', thing: '🐞', ref: '🎂', where: 'above' }, undefined, 'noun_misread')], speakChoices: false, explain: 'The bee is ON the cake, on top of it.' },
    { difficulty: 1, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The ball is under the bed.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '⚽', ref: '🛏️', where: 'above' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🧸', ref: '🛏️', where: 'below' }, undefined, 'noun_misread'), vis({ kind: 'place', thing: '⚽', ref: '🛏️', where: 'below' }, undefined)], speakChoices: false, explain: 'Under means below. The ball is under the bed.' },
    { difficulty: 2, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The red car is next to the house.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🚗', ref: '🏠', where: 'beside' }, undefined), vis({ kind: 'place', thing: '🚙', ref: '🏠', where: 'beside' }, undefined, 'describing_word_missed'), vis({ kind: 'place', thing: '🚗', ref: '🏠', where: 'above' }, undefined, 'position_word_misread')], speakChoices: false, explain: 'The car is red, and it is next to the house, at its side.' },
    { difficulty: 2, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'A fox sat on a big rock.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🐶', ref: '🪨', where: 'above' }, undefined, 'noun_misread'), vis({ kind: 'place', thing: '🦊', ref: '🪨', where: 'beside' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🦊', ref: '🪨', where: 'above' }, undefined)], speakChoices: false, explain: 'It is a fox, and it sat ON the rock.' },
    { difficulty: 2, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The duck is in the tub.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🦆', ref: '🛁', where: 'inside' }, undefined), vis({ kind: 'place', thing: '🦆', ref: '🛁', where: 'beside' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🐸', ref: '🛁', where: 'inside' }, undefined, 'noun_misread')], speakChoices: false, explain: 'The duck is IN the tub.' },
    { difficulty: 3, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'The cat is not on the bed. It is under the bed.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '🐈', ref: '🛏️', where: 'above' }, undefined, 'missed_not'), vis({ kind: 'place', thing: '🐈', ref: '🛏️', where: 'below' }, undefined), vis({ kind: 'place', thing: '🐕', ref: '🛏️', where: 'below' }, undefined, 'noun_misread')], speakChoices: false, explain: 'The word not tells us the cat is NOT on the bed. It is under the bed.' },
    { difficulty: 3, say: 'Read the sentence. Which picture matches?', show: 'Read the sentence.', visual: { kind: 'text', text: 'Tom has a hat. He put it in the box.', size: 'lg' }, choices: [vis({ kind: 'place', thing: '👦', ref: '📦', where: 'inside' }, undefined, 'pronoun_misread'), vis({ kind: 'place', thing: '🎩', ref: '📦', where: 'above' }, undefined, 'position_word_misread'), vis({ kind: 'place', thing: '🎩', ref: '📦', where: 'inside' }, undefined)], speakChoices: false, explain: 'It means the hat. Tom put the hat in the box.' },
  ]),
};

export const READING_SKILLS: Skill[] = [
  letters,
  rhyme,
  syllables,
  firstSound,
  letterSound,
  lastSound,
  blend,
  segment,
  cvc,
  sight,
  vocab,
  lit,
  info,
  digraphs,
  silentE,
  sentences,
];

