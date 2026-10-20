import type { Choice, LanguageCode, Rng, Skill, SubjectId, Visual } from './types';
import { makeItem } from './helpers';

/**
 * Listening-first starter track for an Indian language (Hindi, Kannada, …).
 * Instructions are in English; the letter or word being taught is spoken by a
 * voice for that language. Every native string carries a romanization, used as a
 * spoken/printed fallback when the device has no voice for the language.
 */
export interface Term {
  /** Native script */
  n: string;
  /** Romanized pronunciation for grown-ups and the English-voice fallback */
  r: string;
}
export interface PictureWord extends Term {
  e: string;
  en: string;
}

export interface LanguagePack {
  code: LanguageCode;
  /** BCP-47 voice language, e.g. 'hi-IN' */
  lang: string;
  name: string;
  subject: SubjectId;
  /** Skill-id prefix (kept stable so saved progress survives refactors) */
  prefix: string;
  standard: string;
  vowels: Term[];
  /** Short/long vowel partners that look and sound alike */
  vowelPairs: Record<string, string>;
  consonants: (PictureWord & { l: Term })[];
  /** Sound-alike consonant partners (e.g. unaspirated/aspirated) */
  consonantPairs: Record<string, string>;
  words: (PictureWord & { group: string })[];
  numbers: Term[];
  colours: PictureWord[];
  intro: { vowel: [string, string]; consonant: string; word: string; number: string; colour: string };
  tips: { vowel: string; consonant: string; word: string; number: string; colour: string };
}

const emoji = (e: string): Visual => ({ kind: 'emoji', emoji: e });
const letter = (l: string): Visual => ({ kind: 'text', text: l, size: 'xl' });
const others = <T,>(rng: Rng, pool: T[], skip: (x: T) => boolean, n: number) => rng.shuffle(pool.filter((x) => !skip(x))).slice(0, n);

export function languageSkills(p: LanguagePack): Skill[] {
  const base = { subject: p.subject, grade: 'K' as const, regions: ['in-cbse' as const], language: p.code };
  const voice = (t: Term) => ({ text: t.n, lang: p.lang, roman: t.r });
  const id = (s: string) => `${p.prefix}.${s}`;

  const vowels: Skill = {
    ...base,
    id: id('swar'),
    strand: 'varnamala',
    title: `${p.name} vowels`,
    kidTitle: `${p.name} vowels`,
    icon: p.vowels[0].n,
    standards: [p.standard],
    prereqs: [],
    parentTip: p.tips.vowel,
    intro: [
      { say: p.intro.vowel[0], visual: letter(p.vowels[0].n) },
      { say: p.intro.vowel[1], visual: { kind: 'row', items: [letter(p.vowels[0].n), letter(p.vowels[1].n)] } },
    ],
    generate: (rng, d) => {
      const t = rng.pick(p.vowels);
      const pair = p.vowelPairs[t.n];
      const skip = (x: Term) => x.n === t.n || x.n === pair;
      const pool = d === 1 || !pair ? others(rng, p.vowels, skip, d === 1 ? 2 : 3).map((x) => x.n) : [pair, ...others(rng, p.vowels, skip, d === 2 ? 1 : 2).map((x) => x.n)];
      return makeItem(id('swar'), `${t.n}-${d}`, d, {
        say: `Listen, and find this ${p.name} letter.`,
        show: `Find the ${p.name} letter you hear.`,
        voice: voice(t),
        choices: [{ text: t.n, correct: true as const }, ...pool.map((l) => ({ text: l, why: l === pair ? 'indic_short_long_vowel' : 'indic_letter_unknown' }))],
        speakChoices: false,
        explain: `This letter is ${t.n}. It says “${t.r}”.${pair ? ' Its partner looks almost the same but makes a longer or shorter sound.' : ''}`,
      });
    },
  };

  const consonants: Skill = {
    ...base,
    id: id('vyanjan'),
    strand: 'varnamala',
    title: `${p.name} consonants with picture words`,
    kidTitle: `${p.name} letter pictures`,
    icon: p.consonants[0].l.n,
    standards: [p.standard],
    prereqs: [id('swar')],
    parentTip: p.tips.consonant,
    intro: [{ say: p.intro.consonant, visual: { kind: 'row', items: [letter(p.consonants[0].l.n), emoji(p.consonants[0].e)] } }],
    generate: (rng, d) => {
      const t = rng.pick(p.consonants);
      const sound = p.consonantPairs[t.l.n] ? p.consonants.find((c) => c.l.n === p.consonantPairs[t.l.n]) : undefined;
      const wrong: { c: (typeof p.consonants)[number]; why: string }[] = [];
      if (d === 3 && sound) wrong.push({ c: sound, why: 'indic_aspirate_confusion' });
      for (const c of others(rng, p.consonants, (x) => x.l.n === t.l.n || wrong.some((w) => w.c.l.n === x.l.n), (d === 1 ? 2 : 3) - wrong.length)) wrong.push({ c, why: 'indic_letter_sound_unknown' });
      const choices: Omit<Choice, 'id'>[] = [
        { visual: emoji(t.e), say: t.n, roman: t.r, correct: true },
        ...wrong.map(({ c, why }) => ({ visual: emoji(c.e), say: c.n, roman: c.r, why })),
      ];
      return makeItem(id('vyanjan'), `${t.l.n}-${d}`, d, {
        say: `Which picture starts with this ${p.name} letter?`,
        show: 'Which picture starts with this letter?',
        visual: letter(t.l.n),
        voice: voice(t.l),
        choices,
        choiceLang: p.lang,
        explain: `${t.l.n} (${t.l.r}) is for ${t.n} (${t.r}), which means ${t.en}.`,
      });
    },
  };

  const words: Skill = {
    ...base,
    id: id('shabd'),
    strand: 'shabd',
    title: `Everyday ${p.name} words (listening)`,
    kidTitle: `${p.name} words`,
    icon: '🗣️',
    standards: [p.standard],
    prereqs: [],
    parentTip: p.tips.word,
    intro: [{ say: p.intro.word, visual: emoji(p.words[0].e) }],
    generate: (rng, d) => {
      const t = rng.pick(p.words);
      const pool = d === 3 ? p.words.filter((w) => w.group === t.group && w.n !== t.n) : p.words.filter((w) => w.group !== t.group);
      const wrong = rng.shuffle(pool).slice(0, d === 1 ? 2 : 3);
      return makeItem(id('shabd'), `${t.n}-${d}`, d, {
        say: `Listen to the ${p.name} word. Which picture is it?`,
        show: `Which picture is the ${p.name} word?`,
        voice: voice(t),
        choices: [{ visual: emoji(t.e), correct: true as const }, ...wrong.map((w) => ({ visual: emoji(w.e), why: d === 3 ? 'indic_word_same_group' : 'indic_word_unknown' }))],
        speakChoices: false,
        explain: `${t.n} (${t.r}) means ${t.en}.`,
      });
    },
  };

  const numbers: Skill = {
    ...base,
    id: id('ginti'),
    strand: 'ginti',
    title: `${p.name} numbers 1–10`,
    kidTitle: `${p.name} counting`,
    icon: '🔢',
    standards: [p.standard],
    prereqs: ['m.count10'],
    parentTip: p.tips.number,
    intro: [{ say: p.intro.number, visual: { kind: 'objects', emoji: '🥭', count: 3, arrange: 'line' } }],
    generate: (rng, d) => {
      const n = d === 1 ? rng.int(1, 5) : rng.int(6, 10);
      const near = rng.shuffle([n - 1, n + 1, n + 2, n - 2].filter((x) => x >= 1 && x <= 10)).slice(0, d === 1 ? 2 : 3);
      const vis = (k: number): Visual => (d === 3 ? { kind: 'objects', emoji: '🥭', count: k, arrange: 'line' } : { kind: 'number', value: k });
      return makeItem(id('ginti'), `${n}-${d}`, d, {
        say: d === 3 ? `Listen to the ${p.name} number. Find the group with that many mangoes.` : `Listen to the ${p.name} number. Which number is it?`,
        show: d === 3 ? 'Find that many mangoes.' : 'Which number do you hear?',
        voice: voice(p.numbers[n - 1]),
        choices: [{ visual: vis(n), correct: true as const }, ...near.map((k) => ({ visual: vis(k), why: 'indic_number_word_unknown' }))],
        speakChoices: false,
        explain: `${p.numbers[n - 1].n} (${p.numbers[n - 1].r}) means ${n}.`,
      });
    },
  };

  const colours: Skill = {
    ...base,
    id: id('rang'),
    strand: 'ginti',
    title: `${p.name} colour words`,
    kidTitle: `${p.name} colours`,
    icon: '🎨',
    standards: [p.standard],
    prereqs: [],
    parentTip: p.tips.colour,
    intro: [{ say: p.intro.colour, visual: { kind: 'row', items: [emoji(p.colours[0].e), emoji(p.colours[1].e)] } }],
    generate: (rng, d) => {
      const t = rng.pick(p.colours);
      const wrong = others(rng, p.colours, (x) => x.n === t.n, d === 1 ? 2 : 3);
      return makeItem(id('rang'), `${t.n}-${d}`, d, {
        say: `Listen to the ${p.name} colour. Which colour is it?`,
        show: 'Which colour do you hear?',
        voice: voice(t),
        choices: [{ visual: emoji(t.e), correct: true as const }, ...wrong.map((w) => ({ visual: emoji(w.e), why: 'indic_word_unknown' }))],
        speakChoices: false,
        explain: `${t.n} (${t.r}) means ${t.en}.`,
      });
    },
  };

  return [vowels, consonants, words, numbers, colours];
}
