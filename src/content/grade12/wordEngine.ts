import type { Difficulty, Grade, Item, Rng, Skill, Slide } from '../types';
import { PIC, assemble, big, choiceCount, fromPlans, makeItem, no, noPic, ok, okPic, skill, words } from './util';

/*
 * Picture-word phonics engine. Each entry is one line:
 *   "kite kit bite kits | I can fly my ___ in the wind."
 * target word, look-alike distractors (real words unless the skill is about spelling), and an optional
 * sentence with a blank that ONLY the target fits. One entry yields up to three items:
 *   A  picture → which printed word names it        (needs a picture of the target)
 *   B  printed word → which picture matches it        (needs a picture of the target and of a look-alike)
 *   C  read a sentence → which word fits the blank   (needs a sentence)
 * Choices are never read aloud: reading is the skill (Q3). A distractor can carry its own tag: "kit!tag".
 */

export interface WordSkillSpec {
  id: string;
  grade: Grade;
  title: string;
  kidTitle: string;
  icon: string;
  standards: string[];
  prereqs: string[];
  parentTip: string;
  intro: Slide[];
  /** Tag for a distractor that differs only in its vowel spelling. */
  vowelTag: string;
  /** Tag for every distractor (spelling skills: misspellings) unless it carries its own. */
  tagAll?: string;
  /** Where the skill's spelling pattern sits in a word (a vowel change elsewhere is plain vowel confusion). */
  pattern?: RegExp;
  /** Teaching note about the target word. */
  note: (w: string) => string;
  levels: [string[], string[], string[]];
}

interface Entry { w: string; alts: { w: string; why: string }[]; sentence?: string }

const VOWELS = /[aeiou]/g;
const consonants = (s: string) => s.replace(/[aeiouy]/g, '');
const vowelCount = (s: string) => (s.match(VOWELS) ?? []).length;
const deletes = (long: string, short: string) => [...long].some((_, i) => long.slice(0, i) + long.slice(i + 1) === short);

/** Name the mistake a look-alike represents, from how its spelling differs from the target. */
const HOMOPHONES = ['rode road', 'made maid', 'night knight', 'horse hoarse', 'morning mourning', 'weather whether', 'flower flour', 'around aloud', 'blew blue', 'new knew', 'two too', 'one won', 'four for', 'eight ate', 'knot not', 'write rite right', 'heart hart', 'tea tee', 'sea see', 'pear pair', 'hole whole'];
const homophones = (a: string, b: string) => HOMOPHONES.some((h) => { const ws = h.split(' '); return ws.includes(a) && ws.includes(b) && a !== b; });

export function classify(target: string, alt: string, vowelTag: string, pattern?: RegExp): string {
  if (homophones(target, alt)) return 'homophone_confusion';
  if (alt + 'e' === target || target + 'e' === alt) return 'silent_e_confusion';
  if (/[aeiou]r/.test(target) && target.replace(/([aeiou])r/, '$1') === alt) return 'r_controlled_as_short';
  for (const dg of ['sh', 'ch', 'th', 'wh', 'ph']) {
    if (!target.includes(dg)) continue;
    for (const other of ['sh', 'ch', 'th', 'wh', 's', 'c', 't', 'h', 'w', 'p']) if (other !== dg && target.replace(dg, other) === alt) return 'digraph_confusion';
  }
  if (consonants(target) === consonants(alt)) {
    const tv = vowelCount(target), av = vowelCount(alt);
    let a = 0;
    while (target[a] === alt[a]) a++;
    let b = 0;
    while (b < Math.min(target.length, alt.length) - a && target[target.length - 1 - b] === alt[alt.length - 1 - b]) b++;
    const m = pattern ? target.match(pattern) : null;
    const inPattern = !pattern || (m && m.index! < target.length - b && m.index! + m[0].length > a);
    if (!inPattern) return 'vowel_confusion';
    return tv > av && tv >= 2 && !/e$/.test(target) ? 'vowel_team_ignored' : vowelTag;
  }
  if (alt.length === target.length) {
    const diff = [...target].map((c, i) => (c !== alt[i] ? i : -1)).filter((i) => i >= 0);
    if (diff.length === 1 && diff[0] === 0) return 'first_letter_misread';
    if (diff.length === 1 && diff[0] === target.length - 1) return 'final_sound_ignored';
    if ([...target].sort().join('') === [...alt].sort().join('')) return 'letter_order_confusion';
  }
  if (alt.length === target.length - 1 && deletes(target, alt)) {
    const i = [...target].findIndex((_, k) => target.slice(0, k) + target.slice(k + 1) === alt);
    const isCons = (c?: string) => !!c && !/[aeiou]/.test(c);
    return isCons(target[i]) && (isCons(target[i - 1]) || isCons(target[i + 1])) ? 'blend_missing_letter' : 'dropped_letter';
  }
  if (alt.length === target.length + 1 && deletes(alt, target)) return 'added_letter';
  return 'lookalike_word';
}

function parse(line: string, spec: WordSkillSpec): Entry {
  const [head, sentence] = line.split('|').map((s) => s.trim());
  const [w, ...rest] = head.split(/\s+/);
  const alts = rest.map((a) => {
    const [word, tag] = a.split('!');
    return { w: word, why: tag ?? spec.tagAll ?? classify(w, word, spec.vowelTag, spec.pattern) };
  });
  return { w, alts, sentence: sentence || undefined };
}

const SAY_A = 'Look at the picture. Which word names it?';
const SAY_B = 'Read the word. Which picture matches it?';
const SAY_C = 'Read the sentence. Which word fits in the blank?';

/** Every item an entry can make at its level, as builders that only use the rng to choose distractors. */
function plansFor(spec: WordSkillSpec, e: Entry, d: Difficulty, allWords: string[]): ((rng: Rng) => Item)[] {
  const n = choiceCount(d);
  const explain = spec.note(e.w);
  const textWrongs = (rng: Rng) => rng.shuffle(e.alts).map((a) => no(a.w, a.why));
  const out: ((rng: Rng) => Item)[] = [];
  const pic = PIC[e.w];
  if (pic) {
    out.push((rng) => makeItem(spec.id, `${e.w}-pic`, d, {
      say: SAY_A, show: 'Which word?', visual: big(pic), speakChoices: false,
      choices: assemble(ok(e.w), textWrongs(rng), n), explain,
    }));
    const altPics = e.alts.filter((a) => PIC[a.w] && PIC[a.w] !== pic);
    const firstLetter = allWords.filter((w) => w !== e.w && PIC[w] && PIC[w] !== pic && w[0] === e.w[0] && !e.alts.some((a) => a.w === w));
    if (altPics.length + firstLetter.length >= n - 1 && altPics.length >= 1) {
      out.push((rng) => makeItem(spec.id, `${e.w}-word`, d, {
        say: SAY_B, show: 'Read the word.', visual: words(e.w, 'xl'), speakChoices: false,
        choices: assemble(okPic(pic, e.w), [
          ...rng.shuffle(altPics).map((a) => noPic(PIC[a.w], a.w, a.why)),
          ...rng.shuffle(firstLetter).map((w) => noPic(PIC[w], w, 'used_first_letter_only')),
        ], n),
        explain,
      }));
    }
  }
  if (e.sentence) {
    out.push((rng) => makeItem(spec.id, `${e.w}-sentence`, d, {
      say: SAY_C, show: 'Which word fits?', visual: words(e.sentence!), speakChoices: false,
      choices: assemble(ok(e.w), textWrongs(rng), n), explain,
    }));
  }
  return out;
}

export function wordSkill(spec: WordSkillSpec): Skill {
  const entries = spec.levels.map((lines) => lines.map((l) => parse(l, spec)));
  const allWords = Object.keys(PIC);
  const plans = { 1: [], 2: [], 3: [] } as Record<Difficulty, ((rng: Rng) => Item)[]>;
  entries.forEach((list, i) => {
    const d = (i + 1) as Difficulty;
    for (const e of list) plans[d].push(...plansFor(spec, e, d, allWords));
  });
  return skill({
    id: spec.id, strand: 'phonics', grade: spec.grade, title: spec.title, kidTitle: spec.kidTitle, icon: spec.icon,
    standards: spec.standards, prereqs: spec.prereqs, parentTip: spec.parentTip, intro: spec.intro,
    generate: fromPlans(plans),
  });
}

/** Every target and sentence, for tests. */
export function entriesOf(spec: WordSkillSpec) {
  return spec.levels.flat().map((l) => parse(l, spec));
}
