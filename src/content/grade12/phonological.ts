import type { Difficulty, Item, Rng, Visual } from '../types';
import { PIC, assemble, big, choiceCount, fromPlans, makeItem, no, noPic, ok, okPic, skill } from './util';

/*
 * Grade 1 phonological awareness. Speech engines cannot say an isolated sound cleanly (Q10),
 * so every sound is named through a picture word: "the first sound in 🐟 fish".
 */

/** One picture per sound, chosen so the sound is the clear first sound of the word. */
const SOUND: Record<string, [string, string]> = {
  b: ['🐻', 'bear'], d: ['🐶', 'dog'], f: ['🐟', 'fish'], g: ['🐐', 'goat'], h: ['🎩', 'hat'], k: ['🔑', 'key'], l: ['🦁', 'lion'],
  m: ['🌙', 'moon'], n: ['👃', 'nose'], p: ['🐷', 'pig'], r: ['🚀', 'rocket'], s: ['☀️', 'sun'], t: ['🐯', 'tiger'], v: ['🚐', 'van'],
  w: ['🕸️', 'web'], z: ['🦓', 'zebra'], a: ['🍎', 'apple'], e: ['🥚', 'egg'], o: ['🐙', 'octopus'], u: ['☂️', 'umbrella'],
};
const row = (items: Visual[]): Visual => ({ kind: 'row', items });
const emo = (e: string): Visual => ({ kind: 'emoji', emoji: e });

/* ---------------------------------------------------------------- blend and segment 3–6 sounds */
// word: sounds (letters of SOUND) | wrong picture words with tags
const BLEND: [Difficulty, string, string, string][] = [
  [1, 'tent', 'tent', 'ten!dropped_a_sound tiger!used_first_sound_only hand!changed_a_sound'],
  [1, 'hand', 'hand', 'hat!changed_a_sound horse!used_first_sound_only tent!changed_a_sound'],
  [1, 'vest', 'vest', 'van!used_first_sound_only web!changed_a_sound dress!changed_a_sound'],
  [1, 'frog', 'frog', 'fish!used_first_sound_only dog!dropped_a_sound flag!changed_a_sound'],
  [1, 'drum', 'drum', 'duck!used_first_sound_only dress!changed_a_sound crab!changed_a_sound'],
  [1, 'bus', 'bus', 'bed!changed_a_sound bear!used_first_sound_only sun!sound_order_confusion'],
  [1, 'bed', 'bed', 'bus!changed_a_sound bee!dropped_a_sound web!changed_a_sound'],
  [2, 'flag', 'flag', 'frog!changed_a_sound fish!used_first_sound_only hat!dropped_a_sound'],
  [2, 'crab', 'krab', 'cat!dropped_a_sound cow!used_first_sound_only drum!changed_a_sound'],
  [2, 'sled', 'sled', 'sun!used_first_sound_only bed!dropped_a_sound flag!changed_a_sound'],
  [2, 'dress', 'dres', 'duck!used_first_sound_only drum!changed_a_sound bus!changed_a_sound'],
  [2, 'glove', 'gluv', 'goat!used_first_sound_only frog!changed_a_sound clown!changed_a_sound'],
  [2, 'truck', 'truk', 'tiger!used_first_sound_only duck!dropped_a_sound drum!changed_a_sound'],
  [3, 'plant', 'plant', 'pants!sound_order_confusion pig!used_first_sound_only plane!changed_a_sound'],
  [3, 'pants', 'pants', 'plant!sound_order_confusion ant!dropped_a_sound pan!dropped_a_sound'],
  [3, 'sunset', 'sunset', 'sun!dropped_a_sound sled!changed_a_sound sandwich!changed_a_sound'],
  [3, 'hotdog', 'hotdog', 'hat!dropped_a_sound dog!dropped_a_sound hand!changed_a_sound'],
  [3, 'laptop', 'laptop', 'lion!used_first_sound_only lock!changed_a_sound lemon!changed_a_sound'],
];

const COUNT: [string, number][] = [
  ['fish', 3], ['ship', 3], ['sheep', 3], ['chick', 3], ['duck', 3], ['sock', 3], ['cheese', 3], ['thumb', 3], ['knife', 3], ['light', 3], ['bus', 3], ['bed', 3],
  ['frog', 4], ['drum', 4], ['crab', 4], ['flag', 4], ['tent', 4], ['hand', 4], ['sled', 4], ['glove', 4], ['truck', 4], ['train', 4], ['snail', 4],
  ['spoon', 4], ['cloud', 4], ['clock', 4], ['bread', 4], ['ghost', 4], ['bridge', 4], ['box', 4], ['fox', 4], ['six', 4],
  ['plant', 5], ['pants', 5], ['skunk', 5], ['shrimp', 5], ['squid', 5], ['robot', 5], ['lemon', 5], ['rabbit', 5], ['tulip', 5], ['panda', 5], ['camel', 5],
  ['basket', 6], ['sunset', 6], ['hotdog', 6], ['laptop', 6], ['magnet', 6], ['cactus', 6],
];
const BLENDS = /^(fr|dr|cr|fl|sl|gl|tr|pl|sn|sp|cl|br|sk|squ|shr)|(nt|nd|st|mp|nk)$/;

function blendItem(d: Difficulty, w: string, sounds: string, wrong: string): (rng: Rng) => Item {
  const keys = [...sounds];
  const names = keys.map((k) => SOUND[k][1]);
  return (rng) => makeItem('r1.phonemes', `blend-${w}`, d, {
    say: `Say the first sound of each picture, then blend the sounds together: ${names.join(', ')}. Which word do the sounds make?`,
    show: 'Blend the first sounds.', visual: row(keys.map((k) => emo(SOUND[k][0]))),
    choices: assemble(okPic(PIC[w], w), rng.shuffle(wrong.split(' ')).map((x) => { const [n, t] = x.split('!'); return noPic(PIC[n], n, t); }), choiceCount(d)),
    explain: `${names.join(', ')}. Say just the first sound of each picture and push the ${keys.length} sounds together: ${w}.`,
  });
}

function countItem(w: string, n: number): (rng: Rng) => Item {
  const d: Difficulty = n <= 3 ? 1 : n === 4 ? 2 : 3;
  const options = n <= 3 ? [2, 3, 4, 5] : n === 4 ? [3, 4, 5, 6] : [3, 4, 5, 6, 7].filter((k) => Math.abs(k - n) <= 2).slice(0, 4);
  const letters = w.length;
  return () => makeItem('r1.phonemes', `count-${w}`, d, {
    say: `Say the word slowly: ${w}. How many sounds do you hear?`, show: 'How many sounds?', visual: big(PIC[w]), keepOrder: true,
    choices: options.map((k) => (k === n ? ok(String(k)) : no(String(k), k === letters ? 'counted_letters_not_sounds' : k < n ? (BLENDS.test(w) ? 'blend_counted_as_one' : 'phoneme_undercount') : 'phoneme_overcount'))),
    explain: `${w} has ${n} sounds${letters !== n ? `, even though it has ${letters} letters` : ''}. Stretch it out and touch a finger for each sound.`,
  });
}

export const PHONEMES = skill({
  id: 'r1.phonemes', strand: 'phonological', grade: '1', title: 'Blend and segment words with 3–6 sounds', kidTitle: 'Sound detective', icon: '🕵️‍♂️',
  standards: ['RF.1.2b', 'RF.1.2d'], prereqs: ['r.segment'],
  parentTip: 'Use pennies: say "frog" slowly and push a penny for each sound (4). Then lay out pennies and blend them back into a word.',
  intro: [{ say: 'Fish, rocket, octopus, goat. Say just the first sound of each one and push them together. You get frog!', visual: row(['🐟', '🚀', '🐙', '🐐'].map(emo)) }],
  generate: (() => {
    const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
    for (const [d, w, s, wrong] of BLEND) plans[d].push(blendItem(d, w, s, wrong));
    for (const [w, n] of COUNT) { const f = countItem(w, n); plans[n <= 3 ? 1 : n === 4 ? 2 : 3].push(f); }
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- delete and substitute sounds */
// delete: base>result | wrong:tag …  (K kept whole word, F kept the first sound, C changed instead of removed, W removed the wrong sound)
const DTAG: Record<string, string> = { K: 'kept_whole_word', F: 'kept_first_sound', C: 'changed_instead_of_removed', W: 'removed_wrong_sound', N: 'no_change', H: 'said_helper_word', V: 'changed_wrong_sound' };
const DELETE_FIRST = [
  'clock>lock clock:K cow:F sock:C', 'train>rain train:K tiger:F chain:C', 'spear>pear spoon:F bear:C ear:W', 'year>ear yarn:F bear:C pear:C', 'howl>owl horse:F bowl:C cow:W', 'spy>pie spider:F tie:C fly:C', 'ski>key skunk:F bee:C tree:C',
  'scan>can skunk:F pan:C van:C', 'price>rice pig:F dice:C', 'peg>egg pig:F leg:C', 'bring>ring bear:F king:C',
  'block>lock bear:F clock:C sock:C', 'scar>car star:C sun:F',
];
const DELETE_LAST = [
  'cart>car cat:W star:C', 'card>car cat:W star:C', 'beet>bee bear:F tree:C', 'bead>bee bear:F tree:C', 'keep>key king:F bee:C',
  'tent>ten tent:K pen:C', 'shoot>shoe boot:C sheep:F', 'pine>pie pig:F tie:C', 'tied>tie tiger:F pie:C',
];
const DELETE_MIDDLE = [
  'bread>bed bread:K web:C', 'clap>cap cat:V map:C', 'plan>pan plane:V van:C', 'stock>sock clock:C duck:V',
  'try>tie tree:V pie:C', 'brook>book boot:V hook:C',
];
// substitute: base>result helper | wrong:tag … (N kept the old word, H said the helper word, V changed the wrong sound)
const SUB_FIRST = [
  'cat>bat bear | cat:N bear:H hat:V', 'cat>hat horse | cat:N horse:H rat:V', 'bat>cat cow | bat:N cow:H rat:V', 'hat>rat rocket | hat:N rocket:H bat:V',
  'bear>pear pig | bear:N pig:H chair:V', 'pear>bear bus | pear:N bus:H chair:V', 'fox>box bus | fox:N bus:H ox:V', 'box>fox fish | box:N fish:H ox:V',
  'goat>boat bear | goat:N bear:H coat:V', 'goat>coat cow | goat:N cow:H boat:V', 'coat>boat bee | coat:N bee:H goat:V', 'sock>lock lion | sock:N lion:H clock:V',
  'lock>sock sun | lock:N sun:H clock:V', 'king>ring rocket | king:N rocket:H', 'mouse>house hat | mouse:N hat:H', 'house>mouse moon | house:N moon:H',
  'shell>bell bus | shell:N bus:H', 'bell>shell sheep | bell:N sheep:H', 'van>pan pig | van:N pig:H can:V', 'pan>van violin | pan:N violin:H can:V',
  'pan>can cat | pan:N cat:H van:V', 'nut>hut horse | nut:N horse:H', 'hut>nut nose | hut:N nose:H', 'tie>pie pig | tie:N pig:H fly:V', 'pie>tie tiger | pie:N tiger:H fly:V',
  'pen>ten tiger | pen:N tiger:H', 'ten>pen pig | ten:N pig:H',
];
const SUB_LAST = [
  'cat>cap map | cat:N map:H hat:V', 'cap>can pan | cap:N pan:H map:V', 'can>cat hat | can:N hat:H pan:V', 'pin>pig dog | pin:N dog:H pen:V', 'pig>pin sun | pig:N sun:H pen:V',
  'bed>bell snail | bed:N snail:H web:V', 'bell>bed sled | bell:N sled:H shell:V', 'boat>bone sun | boat:N sun:H goat:V', 'bone>boat cat | bone:N cat:H phone:V',
  'nose>note hat | nose:N hat:H rose:V', 'note>nose cheese | note:N cheese:H boat:V',
];
const SUB_MIDDLE = [
  'pin>pen bed | pin:N bed:H pan:V', 'pen>pan cat | pen:N cat:H pin:V', 'pan>pin fish | pan:N fish:H pen:V', 'hat>hut bus | hat:N bus:H',
  'hut>hat cat | hut:N cat:H', 'kite>coat goat | kite:N goat:H cat:V', 'coat>kite bike | coat:N bike:H cat:V', 'cat>kite five | cat:N five:H coat:V',
  'cat>coat boat | cat:N boat:H kite:V',
];

function changeItem(kind: 'del-first' | 'del-last' | 'del-mid' | 'sub-first' | 'sub-last' | 'sub-mid', line: string, d: Difficulty): (rng: Rng) => Item {
  const [head, tail = ''] = line.includes('|') ? line.split('|').map((s) => s.trim()) : [line.split(' ')[0], line.split(' ').slice(1).join(' ')];
  const [pair, helper] = head.split(' ');
  const [base, result] = pair.split('>');
  const wrongs = tail.split(/\s+/).filter(Boolean).map((x) => { const [w, t] = x.split(':'); return { w, why: DTAG[t] }; });
  const where = kind.endsWith('first') ? 'first' : kind.endsWith('last') ? 'last' : kind === 'del-mid' ? 'second' : 'middle';
  const say = kind.startsWith('del')
    ? `Say ${base}. Now say ${base} without its ${where} sound. Which picture shows the new word?`
    : `Say ${base}. Change the ${where} sound to the ${where} sound in ${helper}. Which picture shows the new word?`;
  const visual = kind.startsWith('sub') ? row([emo(PIC[base]), { kind: 'text', text: '→' }, emo(PIC[helper])]) : PIC[base] ? big(PIC[base]) : undefined;
  return (rng) => makeItem('r1.sound-change', `${kind}-${base}-${result}`, d, {
    say, show: kind.startsWith('del') ? `Take away the ${where} sound.` : `Change the ${where} sound.`, visual,
    choices: assemble(okPic(PIC[result], result), rng.shuffle(wrongs).map((x) => noPic(PIC[x.w], x.w, x.why)), choiceCount(d)),
    explain: kind.startsWith('del') ? `${base} without its ${where} sound is ${result}.` : `${base} with the ${where} sound from ${helper} becomes ${result}.`,
  });
}

export const SOUND_CHANGE = skill({
  id: 'r1.sound-change', strand: 'phonological', grade: '1', title: 'Delete and change sounds to make new words', kidTitle: 'Sound switch', icon: '🔄',
  standards: ['RF.1.2', 'RF.K.2e'], prereqs: ['r1.phonemes'],
  parentTip: 'Car games: "Say train. Now say it without the t." (rain). "Say cat. Change the c to the first sound in bear." (bat).',
  intro: [{ say: 'Say clock. Now say clock without its first sound. Lock! Taking away or changing one sound makes a new word.', visual: { kind: 'row', items: [emo('⏰'), { kind: 'text', text: '→' }, emo('🔒')] } }],
  generate: (() => {
    const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
    DELETE_FIRST.forEach((l) => plans[1].push(changeItem('del-first', l, 1)));
    SUB_FIRST.forEach((l) => plans[1].push(changeItem('sub-first', l, 1)));
    DELETE_LAST.forEach((l) => plans[2].push(changeItem('del-last', l, 2)));
    SUB_LAST.forEach((l) => plans[2].push(changeItem('sub-last', l, 2)));
    DELETE_MIDDLE.forEach((l) => plans[3].push(changeItem('del-mid', l, 3)));
    SUB_MIDDLE.forEach((l) => plans[3].push(changeItem('sub-mid', l, 3)));
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- syllables with real multi-syllable choices */
const BEATS: Record<number, string[]> = {
  1: ['cat', 'dog', 'fish', 'frog', 'bus', 'cake', 'kite', 'boat', 'sheep', 'chair', 'drum', 'crab', 'cloud', 'crown', 'ghost', 'knife', 'house', 'tree'],
  2: ['rabbit', 'tiger', 'pencil', 'apple', 'robot', 'lemon', 'cactus', 'panda', 'camel', 'magnet', 'tulip', 'basket', 'pumpkin', 'dolphin', 'turtle',
    'spider', 'ladder', 'hammer', 'monkey', 'giraffe', 'zebra', 'carrot', 'cookie', 'pizza', 'penguin', 'parrot', 'peacock', 'sandwich', 'window',
    'rainbow', 'snowman', 'mountain', 'castle', 'island', 'dragon', 'trophy', 'guitar', 'candy'],
  3: ['banana', 'elephant', 'dinosaur', 'tomato', 'potato', 'kangaroo', 'butterfly', 'flamingo', 'octopus', 'unicorn', 'strawberry',
    'pineapple', 'astronaut', 'umbrella', 'broccoli', 'violin', 'calendar'],
  4: ['watermelon', 'alligator', 'helicopter', 'avocado'],
};
const beatsOf = (w: string) => Number(Object.keys(BEATS).find((k) => BEATS[+k].includes(w)));

function whichBeats(n: number, w: string, d: Difficulty): (rng: Rng) => Item {
  return (rng) => {
    const counts = rng.shuffle([1, 2, 3, 4].filter((k) => k !== n));
    // Hard items keep the near counts (n±1) so a quick guess by length fails.
    const ordered = d === 1 ? counts : [...counts.filter((k) => Math.abs(k - n) === 1), ...counts.filter((k) => Math.abs(k - n) > 1)];
    const wrongs = ordered.map((k) => { const x = rng.pick(BEATS[k]); return noPic(PIC[x], x, k < n ? 'syllables_undercount' : 'syllables_overcount'); });
    return makeItem('r1.syllable-count', `which-${n}-${w}`, d, {
      say: `Say each picture name and clap the parts. Which one has ${n} syllable${n === 1 ? '' : 's'}?`, show: `Which has ${n} claps?`,
      choices: assemble(okPic(PIC[w], w), wrongs, choiceCount(d)),
      explain: `${w} has ${n} syllable${n === 1 ? '' : 's'}. Put your hand under your chin: it drops ${n} time${n === 1 ? '' : 's'}.`,
    });
  };
}
function sameBeats(ref: string, w: string): (rng: Rng) => Item {
  const n = beatsOf(ref);
  return (rng) => {
    const wrongs = [1, 2, 3, 4].filter((k) => k !== n).map((k) => { const x = rng.pick(BEATS[k].filter((y) => y !== ref)); return noPic(PIC[x], x, k < n ? 'syllables_undercount' : 'syllables_overcount'); });
    return makeItem('r1.syllable-count', `same-${ref}-${w}`, 3, {
      say: `Clap the parts in ${ref}. Which picture has the same number of syllables as ${ref}?`, show: `Same claps as ${ref}`, visual: big(PIC[ref]),
      choices: assemble(okPic(PIC[w], w), rng.shuffle(wrongs), 4),
      explain: `${ref} and ${w} both have ${n} syllables.`,
    });
  };
}

export const SYLLABLE_COUNT = skill({
  id: 'r1.syllable-count', strand: 'phonological', grade: '1', title: 'Count syllables in 1- to 4-syllable words', kidTitle: 'Clap long words', icon: '👏',
  standards: ['RF.1.2', 'RF.K.2b'], prereqs: ['r.syllables'],
  parentTip: 'Clap animal names at the zoo or in a book: "al-li-ga-tor" is 4 claps. Ask him to find an animal with 3 claps.',
  intro: [{ say: 'Wa, ter, mel, on. Watermelon has four claps! Long words can have many syllables.', visual: big('🍉') }],
  generate: (() => {
    const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
    for (const w of [...BEATS[1], ...BEATS[2]]) plans[1].push(whichBeats(beatsOf(w), w, 1));
    for (const w of BEATS[3]) plans[2].push(whichBeats(3, w, 2));
    for (const w of BEATS[2].slice(0, 12)) plans[2].push(whichBeats(2, w, 2));
    for (const w of BEATS[4]) plans[3].push(whichBeats(4, w, 3));
    for (const w of BEATS[3]) plans[3].push(whichBeats(3, w, 3));
    const refs: [string, string][] = [['banana', 'tomato'], ['elephant', 'octopus'], ['rabbit', 'pencil'], ['tiger', 'zebra'], ['frog', 'drum'], ['dinosaur', 'butterfly'],
      ['watermelon', 'alligator'], ['umbrella', 'kangaroo'], ['robot', 'camel'], ['potato', 'unicorn'], ['helicopter', 'avocado'], ['monkey', 'penguin']];
    for (const [r, w] of refs) plans[3].push(sameBeats(r, w));
    return fromPlans(plans);
  })(),
});

export const PHONOLOGICAL_SKILLS = [PHONEMES, SOUND_CHANGE, SYLLABLE_COUNT];
