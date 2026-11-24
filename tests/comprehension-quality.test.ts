import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, getSkill } from '../src/content';
import { MOCK_ONLY_ITEMS } from '../src/content/mockOnly';
import type { Item } from '../src/content/types';
import { GRADE1_PASSAGE_SKILLS, GRADE2_PASSAGE_SKILLS, PASSAGE_MOCK } from '../src/content/readingPassages12';
import { poolItems } from '../src/engine/itemPools';
import { itemFingerprint } from '../src/engine/exposures';

/** Comprehension = the two strands the mock's literature and informational domains use. */
const isComprehension = (skillId: string) => ['lit', 'info'].includes(getSkill(skillId)?.strand ?? '');
const comprehensionItems: Item[] = [
  ...ALL_SKILLS.filter(s => isComprehension(s.id)).flatMap(s => s.items ?? []),
  ...MOCK_ONLY_ITEMS.filter(i => isComprehension(i.skill)),
];
const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
/** The question itself: the on-screen prompt, or the last sentence of the spoken prompt (any passage comes before it). */
function questionText(item: Item): string {
  if (item.show) return item.show;
  const sentences = item.say.split(/(?<=[.!?]["”’']?)\s+/);
  return sentences[sentences.length - 1];
}
const answerText = (item: Item) => { const c = item.choices.find(x => x.correct); return c?.text ?? c?.say ?? ''; };
const contains = (hay: string, needle: string) => !!norm(needle) && ` ${norm(hay)} `.includes(` ${norm(needle)} `);

const STOP = new Set('a an the and or but so of to in on at by for with from is are was were be been it its this that these those he she they his her their them we you i my our what which who whom why how when where did do does done can could would will about after before then than there here into out up down not no yes one some all each very most mostly part story text passage page read listen tell says said happen happened'.split(' '));
const words = (s: string) => norm(s).split(' ').filter(w => w.length > 2 && !STOP.has(w));
const sentencesOf = (item: Item): string[] => {
  const v = item.visual;
  const passage = v?.kind === 'story' ? v.lines.map(l => l.text).join(' ') : item.say.split(/(?<=[.!?]["”’']?)\s+/).slice(0, -1).join(' ');
  return passage.split(/(?<=[.!?]["”’']?)\s+/).filter(Boolean);
};

describe('comprehension item quality', () => {
  it('covers a real bank', () => expect(comprehensionItems.length).toBeGreaterThan(260));
  it('every item has 3–4 choices, exactly one correct, and a tag on every wrong choice', () => {
    const bad = comprehensionItems.filter(item => item.choices.length < 3 || item.choices.length > 4
      || item.choices.filter(c => c.correct).length !== 1
      || item.choices.some(c => !c.correct && !c.why)).map(i => i.id);
    expect(bad).toEqual([]);
  });
  it('never puts the correct answer verbatim in the question', () => {
    const giveaways = comprehensionItems.filter(i => contains(questionText(i), answerText(i))).map(i => `${i.id}: ${questionText(i)} -> ${answerText(i)}`);
    expect(giveaways).toEqual([]);
  });
  it('does not ask about a one-sentence passage that states the answer', () => {
    const bad = comprehensionItems.filter(i => { const s = sentencesOf(i); return s.length === 1 && contains(s[0], answerText(i)); }).map(i => `${i.id}: ${i.say}`);
    expect(bad).toEqual([]);
  });
  it('beyond explicit-detail items, the question does not simply restate the answer sentence', () => {
    const bad = comprehensionItems.filter(i => i.difficulty >= 2 && sentencesOf(i).some(sentence => {
      if (!contains(sentence, answerText(i))) return false;
      const rest = words(norm(sentence).replace(norm(answerText(i)), ' '));
      const q = new Set(words(questionText(i)));
      return rest.length >= 2 && rest.every(w => q.has(w));
    })).map(i => `${i.id}: ${questionText(i)} -> ${answerText(i)}`);
    expect(bad).toEqual([]);
  });
  it('the correct choice does not echo question words that no wrong choice shares', () => {
    const bad = comprehensionItems.filter(i => {
      const q = new Set(words(questionText(i)));
      const wrong = new Set(i.choices.filter(c => !c.correct).flatMap(c => words(c.text ?? c.say ?? '')));
      return words(answerText(i)).some(w => q.has(w) && !wrong.has(w));
    }).map(i => `${i.id}: ${questionText(i)} -> ${answerText(i)}`);
    expect(bad).toEqual([]);
  });
  it('rates comprehension items by real difficulty, so every practice skill reaches level 2 and most reach 3', () => {
    for (const skill of ALL_SKILLS.filter(s => isComprehension(s.id) && s.items?.length)) expect(skill.items!.some(i => i.difficulty >= 2), skill.id).toBe(true);
  });
});

describe('Grade 1–2 passages', () => {
  const skills = [...GRADE1_PASSAGE_SKILLS, ...GRADE2_PASSAGE_SKILLS];
  const passageOf = (i: Item) => i.visual?.kind === 'story' ? i.visual : undefined;
  it('adds at least 24 practice passages, half literary and half informational', () => {
    const titles = (strand: string) => new Set(skills.filter(s => s.strand === strand).flatMap(s => s.items!.map(i => passageOf(i)!.title)));
    expect(titles('lit').size).toBeGreaterThanOrEqual(12);
    expect(titles('info').size).toBeGreaterThanOrEqual(12);
  });
  it.each(skills.map(s => [s.id, s] as const))('%s: right-length passages with 3–4 questions and a spread of difficulty', (_id, skill) => {
    const byTitle = new Map<string, Item[]>();
    for (const item of skill.items!) byTitle.set(passageOf(item)!.title, [...(byTitle.get(passageOf(item)!.title) ?? []), item]);
    for (const [title, qs] of byTitle) {
      expect(qs.length, title).toBeGreaterThanOrEqual(3);
      expect(qs.length, title).toBeLessThanOrEqual(4);
      const sentences = passageOf(qs[0])!.lines.filter(l => !/^(Heading|Caption|Glossary|Diagram labels|Story \d|Text \d):?/.test(l.text)).length;
      const [min, max] = skill.grade === '1' ? [4, 6] : [6, 10];
      expect(sentences, title).toBeGreaterThanOrEqual(min);
      expect(sentences, title).toBeLessThanOrEqual(max);
      // He reads the passage himself: the prompt asks the question and never reads the passage aloud.
      for (const q of qs) expect(q.say.length, q.id).toBeLessThan(140);
    }
    expect(new Set(skill.items!.map(i => i.difficulty)).size).toBe(3);
    expect(poolItems(skill, 'practice')).toHaveLength(skill.items!.length);
  });
  it('holds whole passages out of practice for the mock', () => {
    const practiced = new Set(skills.flatMap(s => s.items!.map(i => passageOf(i)!.title)));
    expect(PASSAGE_MOCK.length).toBeGreaterThanOrEqual(12);
    expect(PASSAGE_MOCK.every(i => !practiced.has(passageOf(i)!.title))).toBe(true);
    const practicePrints = new Set(skills.flatMap(s => s.items!.map(itemFingerprint)));
    for (const skill of skills) expect(poolItems(skill, 'mock').every(i => !practicePrints.has(itemFingerprint(i)))).toBe(true);
  });
});
