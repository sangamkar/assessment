import type { Difficulty, Item, Rng } from '../types';
import { assemble, choiceCount, fromPlans, makeItem, no, ok, skill, words } from './util';

/* Grade 1–2 vocabulary, part 2: shades of meaning, compound words, word parts, categories. */

type Plans = Record<Difficulty, ((rng: Rng) => Item)[]>;
const emptyPlans = (): Plans => ({ 1: [], 2: [], 3: [] });

/* ---------------------------------------------------------------- shades of meaning (G2) */
// weakest middle strongest | "most" phrase | "least" phrase  (phrases never contain the answer word)
const SHADES: string[] = [
  'warm hot boiling|the hottest|just a little heat', 'cool cold freezing|the coldest|just a little chill',
  'whisper talk shout|the loudest way to speak|the quietest way to speak', 'walk jog sprint|the fastest way to move|the slowest way to move',
  'sip drink gulp|drinking the most at once|drinking the least at once', 'tap knock pound|hitting the door the hardest|hitting the door the softest',
  'glance look stare|looking for the longest time|looking for the shortest time', 'good great amazing|the very best|the least wonderful',
  'big huge gigantic|the largest|the least large', 'glad happy overjoyed|the most joyful|the least joyful', 'unhappy sad heartbroken|the most sorrowful|the least sorrowful',
  'drizzle rain downpour|the most water falling|the least water falling', 'toss throw hurl|throwing the hardest|throwing the most gently',
  'like love adore|caring about something the most|caring about something the least', 'dim bright blinding|giving off the most light|giving off the least light',
  'nervous scared terrified|the most afraid|the least afraid',
];
export const SHADES_OF_MEANING = skill({
  id: 'r2.shades-of-meaning', strand: 'vocab', grade: '2', title: 'Shades of meaning among related words', kidTitle: 'Word strength', icon: '🌡️',
  standards: ['L.2.5b', 'L.1.5d'], prereqs: ['r1.synonyms-antonyms'],
  parentTip: 'Line up word cards like a thermometer: warm, hot, boiling. Then try walk, jog, sprint. Act each one out.',
  intro: [{ say: 'Some words mean almost the same thing but are stronger or weaker. Warm, hot, boiling: each one is hotter!', visual: { kind: 'text', text: 'warm → hot → boiling', size: 'lg' } }],
  generate: (() => {
    const plans = emptyPlans();
    for (const line of SHADES) {
      const [scale, most, least] = line.split('|');
      const [lo, mid, hi] = scale.split(' ');
      const order = `In order from weakest to strongest: ${lo}, ${mid}, ${hi}.`;
      plans[1].push(() => makeItem('r2.shades-of-meaning', `most-${hi}`, 1, {
        say: `Which word means ${most}?`, show: `Which means ${most}?`,
        choices: [ok(hi), no(mid, 'chose_weaker_word'), no(lo, 'chose_weaker_word')],
        explain: `${order} ${hi} is the strongest.`,
      }));
      plans[2].push(() => makeItem('r2.shades-of-meaning', `least-${lo}`, 2, {
        say: `Which word means ${least}?`, show: `Which means ${least}?`,
        choices: [ok(lo), no(mid, 'chose_stronger_word'), no(hi, 'chose_stronger_word')],
        explain: `${order} ${lo} is the weakest.`,
      }));
      plans[3].push(() => makeItem('r2.shades-of-meaning', `middle-${mid}`, 3, {
        say: 'Put these words in order from weakest to strongest. Which word goes in the middle?', show: 'Which goes in the middle?',
        choices: [ok(mid), no(lo, 'chose_end_of_scale'), no(hi, 'chose_end_of_scale')],
        explain: `${order} ${mid} goes in the middle.`,
      }));
    }
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- compound words (G2) */
// compound | meaning | wrong meaning:tag; … | other compound words that share a part
const COMPOUNDS: [Difficulty, string][] = [
  [1, 'birdhouse|a house for a bird|a bird shaped like a house:parts_reversed;a kind of bird:used_one_part_only|birdbath doghouse treehouse'],
  [1, 'doghouse|a little house for a dog|a dog that guards a house:parts_reversed;a kind of dog:used_one_part_only|birdhouse greenhouse dogsled'],
  [1, 'raincoat|a coat that keeps the rain off|rain that falls on a coat:parts_reversed;a cloud full of rain:used_one_part_only|rainbow raindrop overcoat'],
  [1, 'toothbrush|a brush for cleaning teeth|a tooth shaped like a brush:parts_reversed;a brush for your hair:used_one_part_only|toothpaste hairbrush paintbrush'],
  [1, 'snowball|a ball made of snow|snow that falls on a ball:parts_reversed;a ball for soccer:used_one_part_only|snowman football snowflake'],
  [1, 'cupcake|a small cake about the size of a cup|a cup made of cake:parts_reversed;a cup for drinking:used_one_part_only|pancake cupboard teacup'],
  [1, 'bedroom|a room where you sleep|a bed with lots of room:parts_reversed;a kind of bed:used_one_part_only|bathroom bedtime classroom'],
  [2, 'houseboat|a boat that people live in|a building where boats are kept:parts_reversed;a kind of house:used_one_part_only|boathouse houseplant sailboat'],
  [2, 'boathouse|a building where boats are kept|a boat that people live in:parts_reversed;a kind of boat:used_one_part_only|houseboat sailboat doghouse'],
  [2, 'starfish|a sea animal shaped like a star|a star shaped like a fish:parts_reversed;a bright star in the sky:used_one_part_only|jellyfish starlight goldfish'],
  [2, 'footprint|a mark left by a foot|a foot covered in ink:too_literal;a printed picture:used_one_part_only|footstep football fingerprint'],
  [2, 'seashell|a shell found by the sea|the sea inside a shell:parts_reversed;a turtle’s shell:used_one_part_only|seaweed seahorse eggshell'],
  [2, 'bookshelf|a shelf that holds books|a book about shelves:parts_reversed;a kind of book:used_one_part_only|bookmark cookbook notebook'],
  [2, 'mailbox|a box where mail is put|mail that comes in a box:parts_reversed;a person who brings mail:used_one_part_only|lunchbox sandbox mailman'],
  [3, 'sandbox|a box filled with sand for playing|sand at the beach:used_one_part_only;a box made out of sand:too_literal|sandcastle sandpaper lunchbox'],
  [3, 'headache|a pain in your head|a head that hurts other people:too_literal;a hat for your head:used_one_part_only|toothache headband earache'],
  [3, 'firefighter|a person who puts out fires|a fire that fights:too_literal;a fire in a fireplace:used_one_part_only|fireplace fireworks firefly'],
  [3, 'earring|jewelry you wear on your ear|an ear shaped like a ring:parts_reversed;a ring for your finger:used_one_part_only|earmuffs keyring earache'],
  [3, 'skateboard|a board with wheels that you ride|a skate made from a board:parts_reversed;a board for writing on:used_one_part_only|snowboard surfboard chalkboard'],
  [3, 'grasshopper|a jumping insect that lives in grass|grass that hops:too_literal;a kind of grass:used_one_part_only|grassland hopscotch shopper'],
  [3, 'backpack|a bag you carry on your back|a pack of backs:too_literal;a pain in your back:used_one_part_only|backyard backbone lunchbox'],
];
export const COMPOUND_WORDS = skill({
  id: 'r2.compound-words', strand: 'vocab', grade: '2', title: 'Use the two small words to understand a compound word', kidTitle: 'Word pairs', icon: '🏠',
  standards: ['L.2.4d'], prereqs: ['r1.syllable-join'],
  parentTip: 'Draw compound words: bird + house = birdhouse. Then try a silly reversed one (housebird) and talk about why order matters.',
  intro: [{ say: 'A compound word is two words stuck together. Bird plus house makes birdhouse: a house for a bird. The last word tells what it is.', visual: { kind: 'text', text: 'bird + house = birdhouse', size: 'lg' } }],
  generate: (() => {
    const plans = emptyPlans();
    for (const [d, line] of COMPOUNDS) {
      const [word, meaning, wrong, others] = line.split('|');
      const wrongs = wrong.split(';').map((x) => { const [t, k] = x.split(':'); return no(t, k); });
      plans[d].push(() => makeItem('r2.compound-words', `meaning-${word}`, d, {
        say: `What does the word ${word} mean?`, show: `What is a ${word}?`, visual: words(word, 'xl'),
        choices: [ok(meaning), ...wrongs],
        explain: `${word} is a compound word. It means ${meaning}. The last small word tells what kind of thing it is.`,
      }));
      plans[d].push((rng) => makeItem('r2.compound-words', `word-${word}`, d, {
        say: `Which compound word means ${meaning}?`, show: 'Which word?', speakChoices: false,
        choices: assemble(ok(word), rng.shuffle(others.split(' ')).map((x) => no(x, 'wrong_word_part')), choiceCount(d)),
        explain: `${word} means ${meaning}. Check both small words inside it.`,
      }));
    }
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- prefixes, suffixes and root words (G2) */
// base: word:affix=meaning, …  Each base has three related words, so every wrong choice is a real word-part mix-up.
const PARTS: [Difficulty, string][] = [
  [1, 'care: careful:ful=full of care, careless:less=without care, carefully:ly=in a careful way'],
  [1, 'help: helpful:ful=happy to help others, helpless:less=not able to help yourself, helper:er=a person who helps'],
  [1, 'play: replay:re=play again, player:er=a person who plays, playful:ful=full of fun and play'],
  [1, 'use: reuse:re=use again, useful:ful=full of use, useless:less=of no use'],
  [1, 'happy: unhappy:un=not happy, happily:ly=in a happy way, happiness:ness=the feeling of being happy'],
  [1, 'kind: unkind:un=not kind, kindly:ly=in a kind way, kindness:ness=being kind'],
  [2, 'paint: repaint:re=paint again, painter:er=a person who paints, unpainted:un=not painted'],
  [2, 'read: reread:re=read again, reader:er=a person who reads, unread:un=not read yet'],
  [2, 'fear: fearful:ful=full of fear, fearless:less=without fear, fearfully:ly=in a scared way'],
  [2, 'color: colorful:ful=full of colors, colorless:less=without any color, recolor:re=color again'],
  [2, 'write: rewrite:re=write again, writer:er=a person who writes, unwritten:un=not written down'],
  [2, 'pain: painful:ful=full of pain, painless:less=without pain, painfully:ly=in a way that hurts'],
  [3, 'slow: slowly:ly=in a slow way, slower:er=more slow, slowest:est=the most slow'],
  [3, 'loud: loudly:ly=in a loud way, louder:er=more loud, loudest:est=the most loud'],
  [3, 'heat: reheat:re=heat again, heater:er=a machine that heats, preheat:pre=heat before'],
  [3, 'harm: harmful:ful=able to hurt, harmless:less=not able to hurt, unharmed:un=not hurt'],
  [3, 'fair: unfair:un=not fair, fairly:ly=in a fair way, fairness:ness=being fair'],
  [3, 'lock: unlock:un=open the lock, relock:re=lock again, locked:ed=already shut with a lock'],
];
const PREFIX = new Set(['un', 're', 'pre']);
const partTag = (a: string, b: string) => (PREFIX.has(a) !== PREFIX.has(b) ? 'prefix_suffix_confusion' : `confused_${[a, b].sort().join('_')}`);
const AFFIX_NOTE: Record<string, string> = {
  un: 'U N means not', re: 'R E means again', pre: 'P R E means before', ful: 'F U L means full of', less: 'L E S S means without', ly: 'L Y means in a certain way',
  er: 'E R can mean a person or thing that does something, or more', est: 'E S T means the most', ness: 'N E S S means being something', ed: 'E D means it already happened',
};
export const WORD_PARTS = skill({
  id: 'r2.word-parts', strand: 'vocab', grade: '2', title: 'Prefixes (un-, re-, pre-) and suffixes (-ful, -less, -ly, -er) with root words', kidTitle: 'Word part puzzles', icon: '🔧',
  standards: ['L.2.4b', 'L.2.4c', 'RF.2.3d'], prereqs: ['r1.prefixes', 'r1.suffixes'],
  parentTip: 'Make word-part cards (un, re, ful, less, ly, er) and a root card like "help". Build words and say what each one means.',
  intro: [{ say: 'Word parts change a word’s meaning. R E means again, so repaint means paint again. L E S S means without, so fearless means without fear.', visual: { kind: 'text', text: 're + paint   fear + less', size: 'lg' } }],
  generate: (() => {
    const plans = emptyPlans();
    for (const [d, line] of PARTS) {
      const [base, rest] = line.split(': ');
      const forms = rest.split(', ').map((f) => { const [wa, meaning] = f.split('='); const [w, affix] = wa.split(':'); return { w, affix, meaning }; });
      for (const f of forms) {
        const sibs = forms.filter((x) => x !== f);
        plans[d].push(() => makeItem('r2.word-parts', `meaning-${f.w}`, d, {
          say: `What does ${f.w} mean?`, show: `What does ${f.w} mean?`, visual: words(f.w, 'xl'),
          choices: [ok(f.meaning), ...sibs.map((x) => no(x.meaning, partTag(f.affix, x.affix)))],
          explain: `${f.w} is ${base} with ${f.affix}. ${AFFIX_NOTE[f.affix]}, so ${f.w} means ${f.meaning}.`,
        }));
        plans[d].push((rng) => makeItem('r2.word-parts', `word-${f.w}`, d, {
          say: `Which word means ${f.meaning}?`, show: 'Which word?', speakChoices: false,
          choices: assemble(ok(f.w), [...rng.shuffle(sibs).map((x) => no(x.w, partTag(f.affix, x.affix))), no(base, 'ignored_word_part')], choiceCount(d)),
          explain: `${f.w} means ${f.meaning}. ${AFFIX_NOTE[f.affix]}.`,
        }));
      }
    }
    return fromPlans(plans);
  })(),
});

/* ---------------------------------------------------------------- categories (G1) */
// category | members | words from a close category that do not belong
const CATS: [string, string, string, Difficulty][] = [
  ['fruits', 'apple banana grape peach cherry pear plum lemon', 'carrot corn pea onion potato', 3],
  ['vegetables', 'carrot corn pea onion potato lettuce celery', 'apple banana grape peach cherry', 3],
  ['birds', 'robin eagle owl duck parrot crow penguin', 'bat bee butterfly moth', 3],
  ['insects', 'ant bee fly moth beetle ladybug cricket', 'spider worm snail robin', 3],
  ['vehicles', 'car bus truck train van boat plane', 'road garage driver wheel', 2],
  ['clothes', 'shirt coat sock hat dress boot scarf', 'closet button needle soap', 2],
  ['furniture', 'chair table bed couch desk dresser', 'door window wall roof', 2],
  ['tools', 'hammer saw wrench drill shovel', 'nail board paint glue', 2],
  ['instruments', 'drum piano guitar violin flute trumpet', 'song radio speaker music', 2],
  ['body parts', 'arm leg nose ear knee elbow', 'glove sock hat ring', 2],
  ['kinds of weather', 'rain snow wind fog hail sleet', 'umbrella coat puddle boots', 2],
  ['shapes', 'circle square triangle oval rectangle', 'line dot ruler pencil', 2],
];
export const CATEGORIES = skill({
  id: 'r1.word-categories', strand: 'vocab', grade: '1', title: 'Sort words into categories', kidTitle: 'Word groups', icon: '🗂️',
  standards: ['L.1.5a', 'L.1.5b'], prereqs: ['r.vocab'],
  parentTip: 'Play "Name three": he names three fruits, three tools, three vehicles. Then you name three and sneak in one that does not belong.',
  intro: [{ say: 'Words can belong to groups. Apple, banana and grape are all fruits. A carrot is food too, but it is a vegetable!', visual: { kind: 'text', text: 'apple  banana  grape', size: 'lg' } }],
  generate: (() => {
    const plans = emptyPlans();
    for (const [cat, mem, close, oddLevel] of CATS) {
      const members = mem.split(' ');
      const near = close.split(' ');
      for (const odd of near) {
        plans[oddLevel].push((rng) => makeItem('r1.word-categories', `odd-${cat}-${odd}`, oddLevel, {
          say: 'Which word does not belong with the others?', show: 'Which does not belong?',
          choices: [ok(odd), ...rng.shuffle(members).slice(0, 3).map((m) => no(m, 'missed_category_rule'))],
          explain: `The other words are all ${cat}. ${odd} is not.`,
        }));
      }
      for (const m of members) {
        plans[1].push((rng) => makeItem('r1.word-categories', `kind-${cat}-${m}`, 1, {
          say: `Which word names one of the ${cat}?`, show: `One of the ${cat}`,
          choices: [ok(m), ...rng.shuffle(near).slice(0, 2).map((w) => no(w, 'close_category'))],
          explain: `${m} belongs with the ${cat}. The other words are close, but they are not ${cat}.`,
        }));
      }
    }
    return fromPlans(plans);
  })(),
});

export const VOCAB2_SKILLS_1 = [CATEGORIES];
export const VOCAB2_SKILLS_2 = [SHADES_OF_MEANING, COMPOUND_WORDS, WORD_PARTS];
