import { describe, expect, it } from 'vitest';
import { GRADE1_FOUNDATION_SKILLS, GRADE2_FOUNDATION_SKILLS } from '../src/content/readingGrade12';
import { ALL_SKILLS, skillsFor } from '../src/content';
import { MOCK_ONLY_ITEMS } from '../src/content/mockOnly';
import { catalogue, poolItems } from '../src/engine/itemPools';
import { itemFingerprint } from '../src/engine/exposures';
import { createRng } from '../src/engine/rng';
import { PIC, mentions } from '../src/content/grade12/util';
import { classify, entriesOf } from '../src/content/grade12/wordEngine';
import { PHONICS_WORD_SPECS } from '../src/content/grade12/phonicsWords';
import { _hfwRows } from '../src/content/grade12/sightWords';
import { _test as syl } from '../src/content/grade12/phonicsParts';
import type { Item } from '../src/content/types';

const SKILLS = [...GRADE1_FOUNDATION_SKILLS, ...GRADE2_FOUNDATION_SKILLS];
const READING_IS_THE_SKILL = new Set(['phonics', 'hfw']);
const choiceWord = (c: Item['choices'][number]) => c.text ?? c.say ?? '';

describe('Grade 1–2 foundational reading skills', () => {
  it('registers at least 12 skills in the i-Ready reading strands with valid grades', () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(12);
    for (const s of SKILLS) {
      expect(skillsFor('reading')).toContain(s);
      expect(['phonological', 'phonics', 'hfw', 'vocab']).toContain(s.strand);
      expect(['1', '2']).toContain(s.grade);
      for (const p of s.prereqs) expect(ALL_SKILLS.some((x) => x.id === p)).toBe(true);
    }
    // Registered after the existing reading skills, before science.
    const ids = ALL_SKILLS.map((s) => s.id);
    expect(ids.indexOf(SKILLS[0].id)).toBeGreaterThan(ids.indexOf('r1.sight-spell'));
    expect(ids.indexOf(SKILLS[SKILLS.length - 1].id)).toBeLessThan(ids.findIndex((x) => ALL_SKILLS.find((s) => s.id === x)!.subject === 'science'));
  });

  it.each(SKILLS.map((s) => [s.id, s] as const))('%s: many distinct practice items at every difficulty, each with one right answer', (_id, skill) => {
    const all = catalogue(skill);
    for (const d of [1, 2, 3] as const) {
      const level = all.filter((i) => i.difficulty === d);
      expect(level.length).toBeGreaterThanOrEqual(10);
      expect(new Set(level.map(itemFingerprint)).size).toBe(level.length);
      expect(poolItems(skill, 'practice').filter((i) => i.difficulty === d).length).toBeGreaterThanOrEqual(5);
    }
    for (const item of all) {
      expect(item.choices.filter((c) => c.correct)).toHaveLength(1);
      expect(item.choices.length).toBeGreaterThanOrEqual(3);
      expect(item.choices.length).toBeLessThanOrEqual(4);
      for (const c of item.choices) if (!c.correct) expect(c.why).toMatch(/^[a-z][a-z_]+$/);
      const shown = item.choices.map((c) => `${c.text ?? ''}|${c.visual?.kind === 'emoji' ? c.visual.emoji : ''}`);
      expect(new Set(shown).size).toBe(shown.length);
      expect(item.explain.length).toBeGreaterThan(10);
      // Every picture choice must be a known, single-meaning picture.
      for (const c of item.choices) if (c.visual?.kind === 'emoji') expect(Object.values(PIC)).toContain(c.visual.emoji);
    }
  });

  it.each(SKILLS.filter((s) => READING_IS_THE_SKILL.has(s.strand)).map((s) => [s.id, s] as const))('%s: reading items never say the answer word and never read the choices aloud', (_id, skill) => {
    for (const item of catalogue(skill)) {
      const answer = item.choices.find((c) => c.correct)!;
      const isNumber = /^\d+$/.test(answer.text ?? '');
      if (!isNumber) expect(item.speakChoices).toBe(false);
      const target = choiceWord(answer);
      // A sight-word item names the word to find; everything else must not say or show the answer.
      if (skill.strand !== 'hfw' && !isNumber) expect(mentions(item.say, target)).toBe(false);
      if (item.visual?.kind === 'emoji') expect(item.visual.label).toBeUndefined();
      // Wrong choices never appear in the spoken prompt either.
      for (const c of item.choices) if (!c.correct && c.text && !/^\d+$/.test(c.text)) expect(mentions(item.say, c.text)).toBe(false);
    }
  });

  it('vocabulary prompts never contain the answer', () => {
    for (const skill of SKILLS.filter((s) => s.strand === 'vocab')) {
      for (const item of catalogue(skill)) {
        const answer = choiceWord(item.choices.find((c) => c.correct)!);
        expect(mentions(item.say, answer), `${item.id}: ${item.say}`).toBe(false);
      }
    }
  });

  it('generators are deterministic for a seed and difficulty really changes the items', () => {
    for (const skill of SKILLS) {
      const a = skill.generate!(createRng(42), 2);
      const b = skill.generate!(createRng(42), 2);
      expect(itemFingerprint(a)).toBe(itemFingerprint(b));
      const easy = new Set(catalogue(skill).filter((i) => i.difficulty === 1).map(itemFingerprint));
      const hard = catalogue(skill).filter((i) => i.difficulty === 3);
      expect(hard.some((i) => !easy.has(itemFingerprint(i)))).toBe(true);
    }
  });

  it('picture-word phonics: every sentence has one blank and no distractor is the target', () => {
    for (const spec of PHONICS_WORD_SPECS) for (const e of entriesOf(spec)) {
      if (e.sentence) expect(e.sentence.split('___')).toHaveLength(2);
      expect(e.alts.map((a) => a.w)).not.toContain(e.w);
      expect(e.alts.length).toBeGreaterThanOrEqual(2);
    }
    expect(classify('kite', 'kit', 'x')).toBe('silent_e_confusion');
    expect(classify('corn', 'con', 'x')).toBe('r_controlled_as_short');
    expect(classify('crab', 'cab', 'x')).toBe('blend_missing_letter');
    expect(classify('boat', 'bat', 'vowel_team_confusion')).toBe('vowel_team_ignored');
    expect(classify('ship', 'chip', 'x')).toBe('digraph_confusion');
    expect(classify('rode', 'road', 'x')).toBe('homophone_confusion');
  });

  it('sight words: look-alikes are never homophones and sentences do not contain distractors', () => {
    const homophones = [['there', 'their'], ['by', 'buy'], ['where', 'wear'], ['which', 'witch'], ['would', 'wood'], ['to', 'two'], ['for', 'four'], ['right', 'write'], ['read', 'reed'], ['hear', 'here']];
    for (const r of _hfwRows()) {
      for (const [a, b] of homophones) if (r.w === a || r.w === b) expect(r.like).not.toContain(r.w === a ? b : a);
      if (r.sentence) {
        expect(mentions(r.sentence, r.w)).toBe(true);
        for (const x of [...r.like, ...r.homo]) expect(mentions(r.sentence, x), `${r.w}: ${x}`).toBe(false);
      }
    }
  });

  it('held-out mock words are not practice targets', () => {
    const held = new Set(MOCK_ONLY_ITEMS.filter((i) => i.skill === 'r.high-frequency' || i.skill === 'r.sight').map((i) => i.choices.find((c) => c.correct)!.text));
    for (const skill of SKILLS.filter((s) => s.strand === 'hfw')) for (const item of catalogue(skill)) expect(held.has(item.choices.find((c) => c.correct)!.text)).toBe(false);
  });

  it('syllable data: every listed syllable has a vowel', () => {
    for (const s of syl.SYL) for (const part of s.split('-')) expect(part).toMatch(/[aeiouy]/);
  });
});
