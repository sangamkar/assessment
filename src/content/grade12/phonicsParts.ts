import type { Difficulty, Item, Rng } from '../types';
import { assemble, choiceCount, fromPlans, makeItem, no, ok, skill, spell, words } from './util';

/* Inflectional endings (G1), spelling changes with endings (G2), and syllables in printed words (G1). */

const TAGS: Record<string, string> = {
  t: 'wrong_ending_for_time', n: 'ending_missing', p: 'plural_spelling_error', d: 'no_doubling', e: 'kept_silent_e',
  y: 'y_not_changed', x: 'extra_doubling', r: 'dropped_wrong_letter', h: 'homophone_confusion', w: 'wrong_word_form',
};
/** "answer wrong!t wrong!n | sentence ___ ." */
function parseRow(line: string) {
  const [head, sentence] = line.split('|').map((s) => s.trim());
  const [answer, ...rest] = head.split(/\s+/);
  return { answer, sentence, wrongs: rest.map((r) => { const [w, t] = r.split('!'); return { w, why: TAGS[t] ?? t }; }) };
}

function sentencePlans(id: string, levels: string[][], explain: (answer: string, sentence: string, plural: boolean) => string) {
  const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
  levels.forEach((lines, i) => {
    const d = (i + 1) as Difficulty;
    for (const line of lines) {
      const r = parseRow(line);
      plans[d].push((rng) => makeItem(id, `${r.answer}-${r.sentence}`, d, {
        say: 'Read the sentence. Which word fits in the blank?', show: 'Which word fits?', visual: words(r.sentence), speakChoices: false,
        choices: assemble(ok(r.answer), rng.shuffle(r.wrongs).map((x) => no(x.w, x.why)), choiceCount(d)),
        explain: explain(r.answer, r.sentence, r.wrongs.some((x) => x.why === 'ending_missing')),
      }));
    }
  });
  return plans;
}

/* ---------------------------------------------------------------- Grade 1: endings -s, -es, -ed, -ing */
const ENDING_ROWS: string[][] = [[
  'jumped jumps!t jumping!t | Yesterday the frog ___ into the pond.',
  'playing plays!t played!t | Right now we are ___ tag.',
  'cats cat!n cates!p | I have two ___ at home.',
  'looked looks!t looking!t | Last night I ___ at the stars.',
  'helps helped!t helping!t | Every day Sam ___ his dad cook.',
  'dogs dog!n doges!p | Three ___ ran in the park.',
  'kicked kicks!t kicking!t | Yesterday Mia ___ the ball very far.',
  'reading reads!t readed!w | Look! Dad is ___ the paper.',
  'books book!n bookes!p | I got five ___ from the library.',
  'walks walked!t walking!t | Each morning Ana ___ to school.',
  'eating eats!t eated!w | The puppy is ___ its food now.',
  'packed packs!t packing!t | Last week we ___ our bags for the trip.',
], [
  'boxes box!n boxs!p | We put the toys in two ___.',
  'wishes wish!n wishs!p | Blow out the candles and make three ___.',
  'buses bus!n buss!p | Two yellow ___ stopped at the school.',
  'dishes dish!n dishs!p | After dinner I help wash the ___.',
  'foxes fox!n foxs!p | We saw two ___ in the woods.',
  'lunches lunch!n lunchs!p | Mom packed our ___ in the morning.',
  'fixes fixed!t fixing!t | When my bike breaks, Dad always ___ it.',
  'rested rests!t resting!t | After the race last week, we ___ in the shade.',
  'mixing mixes!t mixed!t | Look, Grandma is ___ the cake batter right now.',
  'planted plants!t planting!t | Last spring we ___ beans in the garden.',
  'catches catched!w catching!t | Every time I throw the ball, my dog ___ it.',
  'brushes brushs!p brushed!t | Every night Leo ___ his teeth.',
], [
  'melted melts!t melting!t | The snowman ___ when the sun came out yesterday.',
  'landing lands!t landed!t | Look up! The plane is ___ right now.',
  'glasses glass!n glasss!p | Grandpa needs his ___ to read.',
  'crashed crashes!t crashing!t | Last night the waves ___ on the rocks.',
  'peaches peach!n peachs!p | We picked a basket of ___.',
  'buzzes buzzs!p buzzed!t | Every summer a bee ___ around our flowers.',
  'dressing dresses!t dressed!t | Shh, the baby is ___ up for the party now.',
  'shouted shouts!t shouting!t | At the game last week, the fans ___ and cheered.',
  'benches bench!n benchs!p | The park has four ___ by the pond.',
  'wanted wants!t wanting!t | Yesterday I ___ to stay up late.',
  'splashing splashes!t splashed!t | Watch out! The kids are ___ in the puddles.',
  'branches branch!n branchs!p | The bird sat on one of the ___.',
]];

const ROOTS: [string, string, string[]][] = [
  // [word with ending, root, look-alike wrong roots]
  ['jumping', 'jump', ['jum!cut_into_root', 'jumped!picked_other_form', 'ping!picked_the_ending']],
  ['looked', 'look', ['loo!cut_into_root', 'looking!picked_other_form', 'lock!lookalike_word']],
  ['wishes', 'wish', ['wis!cut_into_root', 'wishe!cut_ending_wrong', 'wished!picked_other_form']],
  ['helps', 'help', ['hel!cut_into_root', 'helped!picked_other_form', 'held!lookalike_word']],
  ['playing', 'play', ['pla!cut_into_root', 'played!picked_other_form', 'plan!lookalike_word']],
  ['boxes', 'box', ['boxe!cut_ending_wrong', 'bo!cut_into_root', 'boxed!picked_other_form']],
  ['filled', 'fill', ['fil!cut_into_root', 'fille!cut_ending_wrong', 'filling!picked_other_form']],
  ['reads', 'read', ['rea!cut_into_root', 'red!lookalike_word', 'reading!picked_other_form']],
  ['hopping', 'hop', ['hopp!kept_double_letter', 'hope!wrong_root_silent_e', 'hopped!picked_other_form']],
  ['baked', 'bake', ['bak!missed_dropped_e', 'back!lookalike_word', 'baking!picked_other_form']],
  ['riding', 'ride', ['rid!missed_dropped_e', 'ridin!cut_ending_wrong', 'rode!picked_other_form']],
  ['stopped', 'stop', ['stopp!kept_double_letter', 'stope!wrong_root_silent_e', 'stopping!picked_other_form']],
  ['cries', 'cry', ['crie!y_not_restored', 'cri!y_not_restored', 'cried!picked_other_form']],
  ['smiling', 'smile', ['smil!missed_dropped_e', 'smell!lookalike_word', 'smiled!picked_other_form']],
  ['running', 'run', ['runn!kept_double_letter', 'rune!wrong_root_silent_e', 'ran!picked_other_form']],
  ['babies', 'baby', ['babie!y_not_restored', 'babi!y_not_restored', 'bab!cut_into_root']],
];
const ROOT_LEVEL = (w: string): Difficulty => (ROOTS.findIndex((r) => r[0] === w) < 8 ? 2 : 3);

export const ENDINGS_1 = skill({
  id: 'r1.word-endings', strand: 'phonics', grade: '1', title: 'Read words with endings -s, -es, -ed, -ing', kidTitle: '-s, -ed and -ing', icon: '🔚',
  standards: ['RF.1.3f', 'L.1.4c'], prereqs: ['r1.sentence'],
  parentTip: 'Act it out: "I jump" (now), "I jumped" (already done), "I am jumping" (happening now). Point to the ending each time.',
  intro: [{ say: 'Endings change a word. Jumped means it already happened. Jumping means it is happening now. Boxes means more than one box.', visual: { kind: 'text', text: 'jump  jumped  jumping', size: 'lg' } }],
  generate: (() => {
    const plans = sentencePlans('r1.word-endings', ENDING_ROWS, (a, s, plural) => {
      const clue = plural ? 'There is more than one, so the word needs an ending that means more than one.' : /yesterday|last|ago/i.test(s) ? 'The sentence tells about the past, so we add e d.' : /now|look|watch|shh/i.test(s) ? 'It is happening right now, so we use i n g.' : /every|each|always/i.test(s) ? 'It happens again and again, so the word ends with s.' : 'Read the whole sentence to find the clue.';
      return `${a.charAt(0).toUpperCase() + a.slice(1)} fits. ${clue}${/[sxz]es$|[cs]hes$/.test(a) ? ' Words ending in s, x, z, ch or sh add e s.' : ''}`;
    });
    for (const [word, root, wrong] of ROOTS) {
      const d = ROOT_LEVEL(word);
      plans[d].push((rng) => makeItem('r1.word-endings', `root-${word}`, d, {
        say: 'What is the root word, without the ending?', show: 'Find the root word.', visual: words(word, 'xl'), speakChoices: false,
        choices: assemble(ok(root), rng.shuffle(wrong).map((x) => { const [w, t] = x.split('!'); return no(w, t); }), choiceCount(d)),
        explain: `${word} is ${root} plus an ending. The root word is ${root}, spelled ${spell(root)}.${['s', 'es', 'ed', 'ing'].some((e) => root + e === word) ? '' : ' The spelling of the root changed a little when the ending was added.'}`,
      }));
    }
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- Grade 2: doubling, drop e, y to i */
const SPELL_ROWS: string[][] = [[
  'hopping hoping!d hopeing!e | The bunny is ___ in the grass.',
  'hoping hopping!x hopeing!e | I am ___ for a sunny day.',
  'running runing!d runned!w | The dog is ___ after the ball.',
  'baking bakeing!e backing!w | Mom is ___ bread in the oven.',
  'sitting siting!d sittng!w | The cat is ___ on the mat.',
  'riding rideing!e ridding!x | Lee is ___ his bike to school.',
  'stopped stoped!d stopt!w | The bus ___ at the corner.',
  'liked likeed!e licked!w | I ___ the funny movie.',
  'swimming swiming!d swimmming!x | The fish are ___ in the tank.',
  'making makeing!e makking!x | We are ___ a card for Grandma.',
], [
  'babies babys!y babyes!y | The ___ are sleeping in their cribs.',
  'puppies puppys!y puppyes!y | Our dog had three ___.',
  'cried cryed!y cride!w | The baby ___ when she was hungry.',
  'tried tryed!y tride!w | I ___ my best on the test.',
  'clapped claped!d clapt!w | Everyone ___ at the end of the show.',
  'smiled smilled!x smileed!e | She ___ when she saw her friend.',
  'planned planed!d plannd!w | We ___ a picnic for Saturday.',
  'shining shineing!e shinning!x | The sun is ___ brightly.',
  'dropped droped!d dropt!w | Oops! I ___ my ice cream.',
  'skated skatted!x skateed!e | We ___ on the frozen pond.',
  'pennies pennys!y penneys!y | I have five ___ in my pocket.',
  'hugged huged!d huggd!w | Grandpa ___ me when I got home.',
], [
  'stories storys!y storyes!y | Grandpa tells the best ___.',
  'cities citys!y cityes!y | We visited two big ___ on our trip.',
  'ponies ponys!y ponyes!y | The ___ ate hay in the barn.',
  'carried carryed!y caried!w | Dad ___ the heavy box upstairs.',
  'shopping shoping!d shoppping!x | We went ___ for new shoes.',
  'chased chassed!x chaseed!e | The cat ___ the mouse around the house.',
  'grabbed grabed!d grabd!w | He ___ his coat and ran outside.',
  'waving waveing!e wavving!x | Look, the girl is ___ at us.',
  'spotted spoted!d spottd!w | I ___ a deer in the woods.',
  'hurried hurryed!y huried!w | We ___ so we would not miss the bus.',
  'slipped sliped!d slipt!w | He ___ on the wet floor.',
  'writing writeing!e writting!x | Mia is ___ a letter to her aunt.',
]];
export const ENDINGS_2 = skill({
  id: 'r2.ending-spelling', strand: 'phonics', grade: '2', title: 'Spelling changes with endings: double, drop e, y to i', kidTitle: 'Ending spelling rules', icon: '✂️',
  standards: ['RF.2.3d', 'L.2.2d'], prereqs: ['r1.word-endings'],
  parentTip: 'Three rules: hop → hopping (short vowel: double), hope → hoping (drop the e), baby → babies (y to i). Sort word cards into the three rules.',
  intro: [{ say: 'Short vowel words double the last letter: hop, hopping. Silent e words drop the e: hope, hoping. Words ending in y change y to i: baby, babies.', visual: { kind: 'text', text: 'hopping  hoping  babies', size: 'lg' } }],
  generate: fromPlans(sentencePlans('r2.ending-spelling', SPELL_ROWS, (a) => {
    const rule = /ies$|ied$/.test(a) ? 'The y changes to i before the ending.'
      : /([bcdfglmnprstvz])\1(ing|ed)$/.test(a) ? 'The word has a short vowel, so we double the last letter before the ending.'
      : /[^aeiou](ing|ed)$/.test(a) ? 'The silent e is dropped before the ending.' : 'Look carefully at every letter.';
    return `${a.charAt(0).toUpperCase() + a.slice(1)} is spelled ${spell(a)}. ${rule}`;
  })),
});

/* ---------------------------------------------------------------- Grade 1: syllables in printed words */
// Hyphens mark syllable breaks (dictionary-style, as taught in Grade 1–2 phonics).
const SYL: string[] = [
  // 1 syllable (many have two vowel letters — the trap is counting vowel letters)
  'cake', 'boat', 'school', 'bridge', 'cheese', 'smile', 'sleep', 'train', 'fruit', 'straight', 'clown', 'night', 'house', 'stripe',
  // 2
  'nap-kin', 'sun-set', 'rab-bit', 'pic-nic', 'bas-ket', 'kit-ten', 'muf-fin', 'cac-tus', 'pump-kin', 'mag-net', 'hot-dog', 'cup-cake', 'in-sect',
  'ti-ger', 'ro-bot', 'pa-per', 'mu-sic', 'ba-by', 'ze-ro', 'tu-lip', 'ba-con', 'cam-el', 'wag-on', 'lim-it', 'rob-in', 'sev-en', 'cab-in',
  'ta-ble', 'pur-ple', 'can-dle', 'bub-ble', 'ap-ple', 'tur-tle', 'puz-zle', 'lit-tle', 'rain-coat', 'tea-pot', 'pea-nut',
  // 3
  'bas-ket-ball', 'el-e-phant', 'but-ter-fly', 'fan-tas-tic', 'yes-ter-day', 'hos-pi-tal', 'to-ma-to', 'ba-na-na', 'pa-ja-mas', 'won-der-ful',
  'un-hap-py', 'cu-cum-ber', 'an-i-mal', 'grass-hop-per', 'di-no-saur', 'oc-to-pus',
  // 4
  'wa-ter-mel-on', 'al-li-ga-tor', 'hel-i-cop-ter', 'kin-der-gar-ten', 'mac-a-ro-ni', 'cat-er-pil-lar', 'av-o-ca-do',
];
const sylCount = (s: string) => s.split('-').length;
const plain = (s: string) => s.replace(/-/g, '');
const vowelLetters = (w: string) => (w.match(/[aeiouy]/g) ?? []).length;
const SPLIT_OK = SYL.filter((s) => s.includes('-') && s.split('-').length <= 3);

function countLevel(s: string): Difficulty {
  const n = sylCount(s), w = plain(s);
  if (n === 1) return vowelLetters(w) >= 3 || w.length >= 6 ? 3 : 2;
  if (n === 2) return splitLevel(s);
  return n === 3 ? 2 : 3;
}

/** Closed syllables (nap·kin) are level 1; open (ti·ger) and consonant-le (ta·ble) are level 2; three parts level 3. */
function splitLevel(s: string): Difficulty {
  const parts = s.split('-');
  if (parts.length >= 3) return 3;
  const closed = !/[aeiouy]$/.test(parts[0]) && !/^[aeiouy]/.test(parts[1]) && !/le$/.test(s);
  return closed ? 1 : 2;
}

function countItem(s: string) {
  const d = countLevel(s), w = plain(s), n = sylCount(s), v = vowelLetters(w);
  return (_rng: Rng) => makeItem('r1.syllable-words', `count-${w}`, d, {
    say: 'Read the word. How many syllables does it have?', show: 'How many syllables?', visual: words(w, 'xl'), speakChoices: true, keepOrder: true,
    choices: [1, 2, 3, 4].map((k) => (k === n ? ok(String(k)) : no(String(k), k === v ? 'counted_vowel_letters' : k < n ? 'syllables_undercount' : 'syllables_overcount'))),
    explain: n === 1 ? `${w} has 1 syllable.${v > 1 ? ` It has ${v} vowel letters, but they make just one vowel sound.` : ''}` : `${w} has ${n} syllables: ${s.split('-').join(', ')}. Each syllable has one vowel sound.`,
  });
}

function whichItem(n: number, d: Difficulty, s: string) {
  const w = plain(s);
  return (rng: Rng) => {
    const others = rng.shuffle(SYL.filter((x) => sylCount(x) !== n));
    const wrongs = others.map((x) => {
      const xw = plain(x);
      return no(xw, xw.length >= w.length && sylCount(x) < n ? 'judged_by_word_length' : sylCount(x) < n ? 'syllables_undercount' : 'syllables_overcount');
    });
    // Level 3 puts a long one-syllable word and a short many-syllable word side by side.
    const ordered = d === 3 ? [...wrongs.filter((c) => c.why === 'judged_by_word_length'), ...wrongs] : wrongs;
    const counts = new Set<number>();
    const picked = ordered.filter((c) => { const k = sylCount(SYL.find((x) => plain(x) === c.text)!); if (counts.has(k)) return false; counts.add(k); return true; });
    return makeItem('r1.syllable-words', `which-${n}-${w}`, d, {
      say: `${d === 3 ? 'Careful: long words can have few syllables. ' : ''}Read the words. Which word has ${n} syllable${n === 1 ? '' : 's'}?`, show: `Which has ${n} syllable${n === 1 ? '' : 's'}?`, speakChoices: false,
      choices: assemble(ok(w), picked, choiceCount(d)),
      explain: n === 1 ? `${w} has just one vowel sound, so it has 1 syllable.` : `${w} has ${n} syllables: ${s.split('-').join(', ')}.`,
    });
  };
}

function splitItem(s: string) {
  const parts = s.split('-'), w = plain(s);
  const d = splitLevel(s);
  const show = (ps: string[]) => ps.join(' · ');
  return (rng: Rng) => {
    const cuts: number[] = [];
    let at = 0;
    for (const p of parts.slice(0, -1)) cuts.push((at += p.length));
    const wrongs = [];
    for (let i = 0; i < cuts.length; i++) for (const delta of [-2, -1, 1, 2]) {
      const c = [...cuts];
      c[i] += delta;
      if (c.some((x, k) => x <= 0 || x >= w.length || (k > 0 && x <= c[k - 1]))) continue;
      const pieces = [0, ...c, w.length].slice(0, -1).map((x, k) => w.slice(x, [...c, w.length][k]));
      const why = pieces.some((p) => !/[aeiouy]/.test(p)) ? 'syllable_without_vowel' : /le$/.test(w) && i === cuts.length - 1 ? 'consonant_le_split' : 'split_in_wrong_place';
      wrongs.push(no(show(pieces), why));
    }
    return makeItem('r1.syllable-words', `split-${w}`, d, {
      say: 'Read the word. Which shows the word broken into syllables the right way?', show: 'Break it into syllables.', visual: words(w, 'xl'), speakChoices: false,
      choices: assemble(ok(show(parts)), rng.shuffle(wrongs), choiceCount(d)),
      explain: `${w} breaks into ${show(parts)}. Every syllable needs a vowel sound.${/le$/.test(w) ? ' A consonant plus l e stays together at the end.' : ''}`,
    });
  };
}

export const SYLLABLE_WORDS = skill({
  id: 'r1.syllable-words', strand: 'phonics', grade: '1', title: 'Count and split syllables in printed words', kidTitle: 'Word chunks', icon: '🍰',
  standards: ['RF.1.3d', 'RF.1.3e', 'RF.2.3c'], prereqs: ['r1.syllable-spell'],
  parentTip: 'Write a long word, draw a line under each vowel sound, then clap it. "Straight" has many vowel letters but one clap.',
  intro: [{ say: 'Every syllable has one vowel sound. Count the vowel sounds, not the vowel letters. Rab, bit. Rabbit has two syllables.', visual: { kind: 'text', text: 'rab · bit', size: 'xl' } }],
  generate: (() => {
    const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
    for (const s of SYL) plans[countLevel(s)].push(countItem(s));
    for (const s of SYL) {
      const n = sylCount(s);
      const d: Difficulty = n <= 2 ? 1 : n === 3 ? 2 : 3;
      plans[d].push(whichItem(n, d, s));
      if (n === 1 || n === 2) plans[3].push(whichItem(n, 3, s));
    }
    for (const s of SPLIT_OK) plans[splitLevel(s)].push(splitItem(s));
    return fromPlans(plans);
  })(),
});

export const PHONICS_PART_SKILLS = [ENDINGS_1, ENDINGS_2, SYLLABLE_WORDS];
export const _test = { SYL, sylCount, plain };
