import type { Difficulty, Item, Rng } from '../types';
import { assemble, choiceCount, fromPlans, makeItem, no, ok, skill, spell } from './util';

/*
 * High-frequency words, Grade 1 (Dolch first grade + Fry 1–100) and Grade 2 (Dolch second grade + Fry 100–300).
 * Line format:  "word look alike words | homophones | sentence using the word"
 * Look-alikes are visually similar real words and are NEVER homophones, so "Find the word ___" has one answer.
 * Homophones (buy/by) are only offered in the sentence version, where the sentence says which word is meant.
 * Words held out for the mock (src/content/mockOnly.ts, wordSkills.ts testWords) are not used as targets.
 */

interface Row { w: string; like: string[]; homo: string[]; sentence?: string }
const parse = (line: string): Row => {
  const [a, b = '', c = ''] = line.split('|').map((x) => x.trim());
  const [w, ...like] = a.split(/\s+/);
  return { w, like, homo: b ? b.split(/\s+/) : [], sentence: c || undefined };
};

function plansFor(id: string, levels: string[][]) {
  const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
  levels.forEach((lines, i) => {
    const d = (i + 1) as Difficulty;
    for (const r of lines.map(parse)) {
      const explain = `This word is ${r.w}, spelled ${spell(r.w)}. ${r.like[0] ? `It looks a bit like ${r.like[0]}, so check every letter.` : ''}`.trim();
      if (!r.homo.length) {
        plans[d].push((rng) => makeItem(id, r.w, d, {
          say: `Find the word ${r.w}.`, show: 'Find the word.', speakChoices: false,
          choices: assemble(ok(r.w), rng.shuffle(r.like).map((x) => no(x, 'lookalike_sight_word')), choiceCount(d)),
          explain,
        }));
      }
      if (r.sentence) {
        const sd = Math.min(3, d + 1) as Difficulty;
        plans[sd].push((rng) => makeItem(id, `${r.w}-sentence`, sd, {
          say: `Find the word ${r.w}, as in: ${r.sentence}`, show: 'Find the word.', speakChoices: false,
          choices: assemble(ok(r.w), [...rng.shuffle(r.homo).map((x) => no(x, 'homophone_confusion')), ...rng.shuffle(r.like).map((x) => no(x, 'lookalike_sight_word'))], choiceCount(sd)),
          explain: r.homo.length ? `${explain} ${r.homo.join(' and ')} sound${r.homo.length === 1 ? 's' : ''} the same but mean${r.homo.length === 1 ? 's' : ''} something different.` : explain,
        }));
      }
    }
  });
  return plans;
}

export const HFW1_LEVELS: string[][] = [[
  'an and on can', 'as is has ask', 'had has hat hid', 'has had his was', 'her here hen he', 'him his hum hem', 'his has him this',
  'of off if or', 'let lit get lot', 'put but pot pit', 'did dad dig kid', 'get got gut jet', 'day dry dad bay', 'now no new own',
  'she shoe he see', 'out our cut oat',
  'by my be boy | buy bye | The cat sat by the door.',
  'so to no go | sew | I am so glad!',
], [
  'any many an and', 'ask as mask ash', 'fly fry try flu', 'how who now hot', 'just must dust jest', 'may way my man', 'old odd cold hold',
  'stop step spot top', 'take tale make took', 'them then they hem', 'then than them ten | | First we eat, then we play.',
  'live life love liver', 'call tall cell cool', 'find fine kind mind', 'long lung song log', 'more move mare mole',
  'time tame tide item', 'part port park pat',
  'made mad make mud | maid | Dad made pancakes for us.',
  'been bent seen bee | bean | I have been to the zoo.',
], [
  'going doing gone gong', 'open upon oven often', 'round ground sound rind', 'thank think than tank', 'walk wall talk wake',
  'these those theme three', 'each reach ache beach', 'into onto unto info', 'than then that thin | | My dog is bigger than your cat.',
  'who how why whom', 'will well wall wild | | I will help you.',
]];

export const HFW2_LEVELS: string[][] = [[
  'best bust beast nest', 'both bath moth booth', 'cold could cloud gold', 'fast last feast fist', 'five fire fine dive',
  'gave give game have', 'sit set sat spit', 'sing song sign sting', 'tell tall till yell', 'us as use up', 'wash wish wasp cash',
  'wish wash with dish', 'off of odd oft', 'pull pill full pal', 'far fur fat fear', 'face fact fake lace', 'took look tool talk',
  'soon son noon moon', 'list lost last lift', 'song sing sang long',
  'or our on of | oar | Do you want milk or juice?',
], [
  'found fund fond sound', 'goes does toes gets', 'green grain greed queen', 'those these chose hose', 'use us sue used',
  'why who way whip', 'work worn worm fork', "don't done didn't won't", 'upon open spoon upset', 'few new fee flew',
  'until unit untie uncle', 'near neat hear bear', 'never ever newer nerve', 'start smart stare star', 'city pity kitty cite',
  'eyes yes eggs dyes', 'head heard hand held', 'left lift loft felt', 'might night mint mitt', 'next nest text neat',
  'hard herd card hand', 'life like line lift', 'side slide site said', 'grow grew glow grown', 'later letter layer water',
  'talk walk tall task', 'leave leaf live sleeve',
  'buy bury boy busy | by bye | I will buy a new book.',
  'read road ready real | reed | I like to read books at night.',
  'right night eight fight | write | Turn right at the corner.',
  'write white wrote wire | right | I can write my name.',
  'its it is sit | it\'s | The dog wagged its tail.',
  'seem seen stem sees | seam | You seem tired today.',
  'feet meet fleet felt | feat | My feet are cold.',
  'night right might nine | knight | The owl hunts at night.',
  'hear heard near heat | here | I can hear the birds sing.',
], [
  'through though thought tough', 'though through thought tough', 'thought though through bought', 'enough rough enjoy enter',
  'different difficult difference distant', 'while white whale whole', 'above about alone glove', 'below elbow blow bellow',
  'together gather other tougher', 'often offer after soften', 'earth early earn north', 'story store sorry stormy',
  'along alone among belong', 'close chose lose closet', 'something sometime someone nothing', 'begin began being begun',
  'paper pepper proper pager', 'group grape grip grow', 'important impatient import imprint', 'children chicken chilled childish',
  'white write while wide', 'river rover diver liver', 'carry curry marry carrot', 'without within witness outing',
  'second secret sacred sound', 'idea ideal idle aide', 'really rally ready rarely', 'almost always also alone',
  'sometimes something someone sometime', 'young your yearn yawn', 'family finally familiar famous',
]];

export const HFW_1 = skill({
  id: 'r1.sight-words', strand: 'hfw', grade: '1', title: 'Read Grade 1 high-frequency words (Dolch first grade, Fry 1–100)', kidTitle: 'First grade words', icon: '🔍',
  standards: ['RF.1.3g'], prereqs: ['r.sight'],
  parentTip: 'Write five of the week’s words on sticky notes around the house. Call one out; he races to touch it and reads it back.',
  intro: [{ say: 'Listen to the word, then find it. Some words look almost the same, like then and than. Check every letter!', visual: { kind: 'text', text: 'then   than', size: 'xl' } }],
  generate: fromPlans(plansFor('r1.sight-words', HFW1_LEVELS)),
});

export const HFW_2 = skill({
  id: 'r2.sight-words', strand: 'hfw', grade: '2', title: 'Read Grade 2 high-frequency words (Dolch second grade, Fry 100–300)', kidTitle: 'Second grade words', icon: '🔎',
  standards: ['RF.2.3f'], prereqs: ['r1.sight-words'],
  parentTip: 'Make a "look-alike" card for tricky trios: though / through / thought. Read them fast, then mixed up.',
  intro: [{ say: 'Some words look a lot alike, like though, through and thought. Look at the whole word, from the first letter to the last.', visual: { kind: 'text', text: 'though  through  thought', size: 'lg' } }],
  generate: fromPlans(plansFor('r2.sight-words', HFW2_LEVELS)),
});

export const SIGHT_SKILLS = [HFW_1, HFW_2];
export const _hfwRows = () => [...HFW1_LEVELS, ...HFW2_LEVELS].flat().map(parse);
