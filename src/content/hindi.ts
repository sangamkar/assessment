import type { Choice, Difficulty, Rng, Skill, Visual } from './types';
import { makeItem } from './helpers';

/*
 * Hindi Garden: a listening-first Hindi starter track for a child who may move
 * to India (CBSE schools teach Hindi from Class 1). Instructions are in English;
 * the Hindi letter or word is spoken by a Hindi (hi-IN) voice.
 */
const HI = 'hi-IN';
const REGIONS: Skill['regions'] = ['in-cbse'];

const SWAR = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
/** Vowel pairs children confuse (short/long). */
const SWAR_PAIR: Record<string, string> = { अ: 'आ', आ: 'अ', इ: 'ई', ई: 'इ', उ: 'ऊ', ऊ: 'उ', ए: 'ऐ', ऐ: 'ए', ओ: 'औ', औ: 'ओ' };

/** Classic varnamala picture words: "क से कबूतर". */
const VYANJAN: { l: string; w: string; e: string; en: string }[] = [
  { l: 'क', w: 'कबूतर', e: '🕊️', en: 'pigeon' },
  { l: 'ख', w: 'खरगोश', e: '🐰', en: 'rabbit' },
  { l: 'ग', w: 'गमला', e: '🪴', en: 'flower pot' },
  { l: 'घ', w: 'घड़ी', e: '⌚', en: 'watch' },
  { l: 'च', w: 'चम्मच', e: '🥄', en: 'spoon' },
  { l: 'छ', w: 'छतरी', e: '☂️', en: 'umbrella' },
  { l: 'ज', w: 'जहाज़', e: '🚢', en: 'ship' },
  { l: 'झ', w: 'झंडा', e: '🚩', en: 'flag' },
  { l: 'ट', w: 'टमाटर', e: '🍅', en: 'tomato' },
  { l: 'त', w: 'तरबूज़', e: '🍉', en: 'watermelon' },
  { l: 'ध', w: 'धनुष', e: '🏹', en: 'bow' },
  { l: 'न', w: 'नल', e: '🚰', en: 'tap' },
  { l: 'प', w: 'पतंग', e: '🪁', en: 'kite' },
  { l: 'फ', w: 'फूल', e: '🌸', en: 'flower' },
  { l: 'ब', w: 'बतख़', e: '🦆', en: 'duck' },
  { l: 'भ', w: 'भालू', e: '🐻', en: 'bear' },
  { l: 'म', w: 'मछली', e: '🐟', en: 'fish' },
  { l: 'र', w: 'रस्सी', e: '🪢', en: 'rope' },
  { l: 'श', w: 'शेर', e: '🦁', en: 'lion' },
  { l: 'स', w: 'साँप', e: '🐍', en: 'snake' },
  { l: 'ह', w: 'हाथी', e: '🐘', en: 'elephant' },
];
/** Unaspirated/aspirated pairs that sound alike to English speakers. */
const ASPIRATE: Record<string, string> = { क: 'ख', ख: 'क', ग: 'घ', घ: 'ग', च: 'छ', छ: 'च', ज: 'झ', झ: 'ज', प: 'फ', फ: 'प', ब: 'भ', भ: 'ब', त: 'ध', ध: 'त' };

const WORDS: { w: string; e: string; en: string; group: string }[] = [
  { w: 'सेब', e: '🍎', en: 'apple', group: 'food' },
  { w: 'आम', e: '🥭', en: 'mango', group: 'food' },
  { w: 'केला', e: '🍌', en: 'banana', group: 'food' },
  { w: 'दूध', e: '🥛', en: 'milk', group: 'food' },
  { w: 'रोटी', e: '🫓', en: 'roti', group: 'food' },
  { w: 'बिल्ली', e: '🐱', en: 'cat', group: 'animal' },
  { w: 'कुत्ता', e: '🐶', en: 'dog', group: 'animal' },
  { w: 'गाय', e: '🐄', en: 'cow', group: 'animal' },
  { w: 'हाथी', e: '🐘', en: 'elephant', group: 'animal' },
  { w: 'मछली', e: '🐟', en: 'fish', group: 'animal' },
  { w: 'आँख', e: '👁️', en: 'eye', group: 'body' },
  { w: 'नाक', e: '👃', en: 'nose', group: 'body' },
  { w: 'कान', e: '👂', en: 'ear', group: 'body' },
  { w: 'हाथ', e: '✋', en: 'hand', group: 'body' },
  { w: 'पेड़', e: '🌳', en: 'tree', group: 'world' },
  { w: 'फूल', e: '🌸', en: 'flower', group: 'world' },
  { w: 'सूरज', e: '☀️', en: 'sun', group: 'world' },
  { w: 'चाँद', e: '🌙', en: 'moon', group: 'world' },
  { w: 'पानी', e: '💧', en: 'water', group: 'world' },
  { w: 'घर', e: '🏠', en: 'house', group: 'world' },
  { w: 'किताब', e: '📖', en: 'book', group: 'world' },
];

const GINTI = ['एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस'];

const RANG: { w: string; e: string; en: string }[] = [
  { w: 'लाल', e: '🟥', en: 'red' },
  { w: 'नीला', e: '🟦', en: 'blue' },
  { w: 'हरा', e: '🟩', en: 'green' },
  { w: 'पीला', e: '🟨', en: 'yellow' },
  { w: 'काला', e: '⬛', en: 'black' },
  { w: 'सफ़ेद', e: '⬜', en: 'white' },
  { w: 'नारंगी', e: '🟧', en: 'orange' },
  { w: 'बैंगनी', e: '🟪', en: 'purple' },
  { w: 'भूरा', e: '🟫', en: 'brown' },
];

const emoji = (e: string): Visual => ({ kind: 'emoji', emoji: e });
const letterVisual = (l: string): Visual => ({ kind: 'text', text: l, size: 'xl' });

function others<T>(rng: Rng, pool: T[], not: (x: T) => boolean, n: number): T[] {
  return rng.shuffle(pool.filter((x) => !not(x))).slice(0, n);
}

const swar: Skill = {
  id: 'h.swar',
  subject: 'hindi',
  strand: 'varnamala',
  grade: 'K',
  title: 'Hindi vowels (स्वर) अ–औ',
  kidTitle: 'Hindi vowels',
  icon: 'अ',
  standards: ['NCERT Sarangi-1 (Hindi): वर्णमाला'],
  prereqs: [],
  regions: REGIONS,
  parentTip: 'Sing a स्वर (vowel) song on YouTube together, then point to अ, आ, इ in Hindi signs, books or packets.',
  intro: [
    { say: 'Hindi has its own letters! This is the first one. It sounds like the start of "about".', visual: letterVisual('अ') },
    { say: 'Some letters come in pairs: a short sound and a long sound. Short, then long!', visual: { kind: 'row', items: [letterVisual('अ'), letterVisual('आ')] } },
  ],
  generate: (rng, d) => {
    const target = rng.pick(SWAR);
    const pair = SWAR_PAIR[target];
    const pool = d === 1 ? others(rng, SWAR, (x) => x === target || x === pair, 2) : [pair, ...others(rng, SWAR, (x) => x === target || x === pair, d === 2 ? 1 : 2)];
    return makeItem('h.swar', `${target}-${d}`, d, {
      say: 'Listen, and find this Hindi letter.',
      show: 'Find the Hindi letter you hear.',
      voice: { text: target, lang: HI },
      choices: [{ text: target, correct: true as const }, ...pool.map((l) => ({ text: l, why: l === pair ? 'hindi_short_long_vowel' : 'hindi_letter_unknown' }))],
      speakChoices: false,
      explain: `This letter is ${target}.${pair ? ' Its partner looks almost the same, with an extra line.' : ''}`,
    });
  },
};

const vyanjan: Skill = {
  id: 'h.vyanjan',
  subject: 'hindi',
  strand: 'varnamala',
  grade: 'K',
  title: 'Hindi consonants (व्यंजन) with picture words',
  kidTitle: 'Hindi letter pictures',
  icon: 'क',
  standards: ['NCERT Sarangi-1 (Hindi): वर्णमाला'],
  prereqs: ['h.swar'],
  regions: REGIONS,
  parentTip: 'Make a “क से कबूतर” chart for the fridge. Each day, say three letters with their picture words together.',
  intro: [{ say: 'Every Hindi letter has a picture word. Ka, kabootar! A pigeon starts with this letter.', visual: { kind: 'row', items: [letterVisual('क'), emoji('🕊️')] } }],
  generate: (rng, d) => {
    const t = rng.pick(VYANJAN);
    const sound = ASPIRATE[t.l] ? VYANJAN.find((v) => v.l === ASPIRATE[t.l]) : undefined;
    const wrong: { v: (typeof VYANJAN)[number]; why: string }[] = [];
    if (d === 3 && sound) wrong.push({ v: sound, why: 'hindi_aspirate_confusion' });
    for (const v of others(rng, VYANJAN, (x) => x.l === t.l || wrong.some((w) => w.v.l === x.l), (d === 1 ? 2 : 3) - wrong.length)) wrong.push({ v, why: 'hindi_letter_sound_unknown' });
    const choices: Omit<Choice, 'id'>[] = [{ visual: emoji(t.e), say: t.w, correct: true }, ...wrong.map(({ v, why }) => ({ visual: emoji(v.e), say: v.w, why }))];
    return makeItem('h.vyanjan', `${t.l}-${d}`, d, {
      say: 'Which picture starts with this Hindi letter?',
      show: 'Which picture starts with this letter?',
      visual: letterVisual(t.l),
      voice: { text: t.l, lang: HI },
      choices,
      choiceLang: HI,
      explain: `${t.l} से ${t.w}. ${t.w} means ${t.en}.`,
    });
  },
};

const shabd: Skill = {
  id: 'h.shabd',
  subject: 'hindi',
  strand: 'shabd',
  grade: 'K',
  title: 'Everyday Hindi words (listening)',
  kidTitle: 'Hindi words',
  icon: '🗣️',
  standards: ['NCERT Sarangi-1 (Hindi): listening & speaking'],
  prereqs: [],
  regions: REGIONS,
  parentTip: 'Pick one room a week and name things only in Hindi: पानी, दूध, किताब. Grandparents on video calls are perfect teachers.',
  intro: [{ say: 'Let’s learn Hindi words! Seb means apple.', visual: emoji('🍎') }],
  generate: (rng, d) => {
    const t = rng.pick(WORDS);
    const pool = d === 3 ? WORDS.filter((w) => w.group === t.group && w.w !== t.w) : WORDS.filter((w) => w.group !== t.group);
    const wrong = rng.shuffle(pool).slice(0, d === 1 ? 2 : 3);
    return makeItem('h.shabd', `${t.w}-${d}`, d, {
      say: 'Listen to the Hindi word. Which picture is it?',
      show: 'Which picture is the Hindi word?',
      voice: { text: t.w, lang: HI },
      choices: [{ visual: emoji(t.e), correct: true as const }, ...wrong.map((w) => ({ visual: emoji(w.e), why: d === 3 ? 'hindi_word_same_group' : 'hindi_word_unknown' }))],
      speakChoices: false,
      explain: `${t.w} means ${t.en}.`,
    });
  },
};

const ginti: Skill = {
  id: 'h.ginti',
  subject: 'hindi',
  strand: 'ginti',
  grade: 'K',
  title: 'Hindi numbers 1–10 (गिनती)',
  kidTitle: 'Hindi counting',
  icon: '🔢',
  standards: ['NCERT Sarangi-1 (Hindi): गिनती'],
  prereqs: ['m.count10'],
  regions: REGIONS,
  parentTip: 'Count stairs in Hindi: एक, दो, तीन… Then count snacks in Hindi at the table.',
  intro: [{ say: 'Let’s count in Hindi! Ek, do, teen. One, two, three!', visual: { kind: 'objects', emoji: '🥭', count: 3, arrange: 'line' } }],
  generate: (rng: Rng, d: Difficulty) => {
    const n = d === 1 ? rng.int(1, 5) : rng.int(6, 10);
    const near = rng.shuffle([n - 1, n + 1, n + 2, n - 2].filter((x) => x >= 1 && x <= 10)).slice(0, d === 1 ? 2 : 3);
    const vis = (k: number): Visual => (d === 3 ? { kind: 'objects', emoji: '🥭', count: k, arrange: 'line' } : { kind: 'number', value: k });
    return makeItem('h.ginti', `${n}-${d}`, d, {
      say: d === 3 ? 'Listen to the Hindi number. Find the group with that many mangoes.' : 'Listen to the Hindi number. Which number is it?',
      show: d === 3 ? 'Find that many mangoes.' : 'Which number do you hear?',
      voice: { text: GINTI[n - 1], lang: HI },
      choices: [{ visual: vis(n), correct: true as const }, ...near.map((k) => ({ visual: vis(k), why: 'hindi_number_word_unknown' }))],
      speakChoices: false,
      explain: `${GINTI[n - 1]} means ${n}.`,
    });
  },
};

const rang: Skill = {
  id: 'h.rang',
  subject: 'hindi',
  strand: 'ginti',
  grade: 'K',
  title: 'Hindi colour words (रंग)',
  kidTitle: 'Hindi colours',
  icon: '🎨',
  standards: ['NCERT Sarangi-1 (Hindi): listening & speaking'],
  prereqs: [],
  regions: REGIONS,
  parentTip: 'Play “I spy” in Hindi: “मुझे कुछ लाल दिख रहा है” (I see something red).',
  intro: [{ say: 'Laal means red. Neela means blue!', visual: { kind: 'row', items: [emoji('🟥'), emoji('🟦')] } }],
  generate: (rng, d) => {
    const t = rng.pick(RANG);
    const wrong = others(rng, RANG, (x) => x.w === t.w, d === 1 ? 2 : 3);
    return makeItem('h.rang', `${t.w}-${d}`, d, {
      say: 'Listen to the Hindi colour. Which colour is it?',
      show: 'Which colour do you hear?',
      voice: { text: t.w, lang: HI },
      choices: [{ visual: emoji(t.e), correct: true as const }, ...wrong.map((w) => ({ visual: emoji(w.e), why: 'hindi_word_unknown' }))],
      speakChoices: false,
      explain: `${t.w} means ${t.en}.`,
    });
  },
};

export const HINDI_SKILLS: Skill[] = [swar, vyanjan, shabd, ginti, rang];
