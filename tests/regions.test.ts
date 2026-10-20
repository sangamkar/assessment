import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, getSkill } from '../src/content';
import { localize, localizeDeep } from '../src/content/curricula';
import type { Item } from '../src/content/types';
import type { AppState } from '../src/engine/progress';
import { emptyState, markKnown } from '../src/engine/progress';
import { buildQuest, buildSkillSession, isVisible, pickItem, skillStatus } from '../src/engine/planner';

const india = (): AppState => {
  const s = emptyState();
  return { ...s, settings: { ...s.settings, curricula: ['in-cbse'], primary: 'in-cbse', languages: [] } };
};
const us = (): AppState => {
  const s = emptyState();
  return { ...s, settings: { ...s.settings, curricula: ['us-ga'], primary: 'us-ga', languages: [] } };
};

describe('curriculum regions', () => {
  it('an India-only profile does not see US-only topics', () => {
    for (const id of ['ss.symbols', 'ss.holidays', 'ss1.home']) {
      expect(isVisible(india(), getSkill(id)!), id).toBe(false);
      expect(isVisible(us(), getSkill(id)!), id).toBe(true);
    }
  });

  it('never serves a Georgia-only question to an India profile', () => {
    const skill = getSkill('ss1.continents')!;
    const usOnly = (skill.items ?? []).filter((i) => i.regions?.includes('us-ga')).map((i) => i.id);
    expect(usOnly.length).toBeGreaterThan(0);
    for (let n = 0; n < 50; n++) {
      const ids = buildSkillSession(india(), skill).map((x) => x.item.id);
      expect(ids.some((id) => usOnly.includes(id))).toBe(false);
    }
    expect(pickItem(us(), skill, 2, new Set()).id).toBeTruthy();
  });

  it('a prerequisite from another curriculum does not lock a topic', () => {
    // ss1.continents needs ss1.home, which is Georgia-only.
    const s = { ...india(), settings: { ...india().settings, showStretch: true } };
    expect(skillStatus(s, getSkill('ss1.continents')!)).toBe('ready');
    expect(skillStatus({ ...us(), settings: { ...us().settings, showStretch: true } }, getSkill('ss1.continents')!)).toBe('locked');
  });

  it('the Quest never reviews a hidden topic', () => {
    // Mastered while Kannada was on, then Kannada switched off.
    let s = markKnown({ ...india(), settings: { ...india().settings, languages: ['kn'] } }, ['kn.swar'], 'parent');
    s = { ...s, settings: { ...s.settings, languages: [] } };
    for (let day = 0; day < 20; day++) {
      const quest = buildQuest(s, Date.UTC(2026, 9, 1 + day));
      expect(quest.every((x) => isVisible(s, x.skill))).toBe(true);
    }
  });
});

describe('India English', () => {
  it('keeps plurals and converts money, grades and seasons', () => {
    expect(localize('5 meters long', 'en-IN')).toBe('5 metres long');
    expect(localize('1 meter', 'en-IN')).toBe('1 metre');
    expect(localize('It costs ten dollars.', 'en-IN')).toBe('It costs ten rupees.');
    expect(localize('Next year you will go to first grade.', 'en-IN')).toBe('Next year you will go to Class 1.');
    expect(localize('fall', 'en-IN')).toBe('autumn');
    expect(localize('When fall comes, leaves drop.', 'en-IN')).toBe('When autumn comes, leaves drop.');
    expect(localize('The tower does not fall.', 'en-IN')).toBe('The tower does not fall.');
    expect(localize('Favorite colors', 'en-US')).toBe('Favorite colors');
  });

  it('localizes choices, pictures and passages, but not codes or emoji', () => {
    const item = {
      id: 'x.1',
      difficulty: 1,
      say: 'Pick a color',
      visual: { kind: 'graph', title: 'Favorite pets', rows: [{ emoji: '🐶', label: 'dog', count: 2 }] },
      choices: [
        { id: 'a', text: 'gray', say: 'gray', correct: true },
        { id: 'b', text: 'fall', say: 'fall', why: 'color_confusion' },
      ],
      explain: 'Gray is a color.',
    } as unknown as Item;
    const out = localizeDeep(item, 'en-IN') as unknown as Record<string, any>;
    expect(out.say).toBe('Pick a colour');
    expect(out.visual.title).toBe('Favourite pets');
    expect(out.visual.rows[0].emoji).toBe('🐶');
    expect(out.choices[0].text).toBe('grey');
    expect(out.choices[1].why).toBe('color_confusion');
    expect(out.choices[1].text).toBe('autumn');
    expect(localizeDeep(item, 'en-US')).toBe(item);
  });

  it('no written question still says dollars or first grade to an India profile', () => {
    const s = india();
    for (const skill of ALL_SKILLS.filter((k) => isVisible(s, k))) {
      for (const item of (skill.items ?? []).filter((i) => !i.regions || i.regions.includes('in-cbse'))) {
        const text = JSON.stringify(localizeDeep(item, 'en-IN'));
        expect(text, item.id).not.toMatch(/\b(dollars?|first grade|second grade|pennies)\b/i);
      }
    }
  });
});
