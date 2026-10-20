import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, SUBJECTS, getSkill } from '../src/content';
import type { Difficulty } from '../src/content/types';
import type { AppState, Attempt } from '../src/engine/progress';
import { dayKey, dayStreak, emptyState, gameState, markIntroSeen, meetsMastery, recordAttempt, recordGame, skillState } from '../src/engine/progress';
import { buildQuest, buildSkillSession, creditFromCheckup, isVisible, nextCheckupItem, planCheckup, present, QUEST_LENGTH, scoreCheckup, skillStatus } from '../src/engine/planner';
import type { CheckupAnswer } from '../src/engine/planner';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 1, 15);

const attempt = (skill: string, correct: boolean, ts: number, d: Difficulty = 2, mode: Attempt['mode'] = 'quest'): Attempt => ({ itemId: `${skill}#x${ts}`, skill, d, correct, ts, mode });
const play = (s: AppState, list: Attempt[]) => list.reduce(recordAttempt, s);

describe('mastery', () => {
  it('needs ≥85% over recent tries, enough level-2 work, and 3 different days', () => {
    const oneDay = Array.from({ length: 8 }, (_, i) => attempt('m.count10', true, T0 + i * 1000));
    expect(meetsMastery(oneDay)).toBe(false); // all on one day

    const threeDays = Array.from({ length: 8 }, (_, i) => attempt('m.count10', true, T0 + Math.floor(i / 3) * DAY + i));
    expect(meetsMastery(threeDays)).toBe(true);

    const tooEasy = threeDays.map((a) => ({ ...a, d: 1 as Difficulty }));
    expect(meetsMastery(tooEasy)).toBe(false);

    const sloppy = threeDays.map((a, i) => ({ ...a, correct: i % 3 !== 0 }));
    expect(meetsMastery(sloppy)).toBe(false);
  });

  it('marks the skill mastered and schedules a review', () => {
    const s = play(emptyState(), Array.from({ length: 9 }, (_, i) => attempt('m.add', true, T0 + Math.floor(i / 3) * DAY + i)));
    const st = skillState(s, 'm.add');
    expect(st.mastered).toBe(true);
    expect(st.nextReview).toBeGreaterThan(st.masteredAt!);
    expect(skillStatus(s, getSkill('m.add')!, st.masteredAt! + 2 * DAY)).toBe('review');
  });

  it('spaced review pushes the next review further out on success', () => {
    let s = play(emptyState(), Array.from({ length: 9 }, (_, i) => attempt('m.add', true, T0 + Math.floor(i / 3) * DAY + i)));
    const due = skillState(s, 'm.add').nextReview!;
    s = recordAttempt(s, attempt('m.add', true, due + 1));
    const st = skillState(s, 'm.add');
    expect(st.reviewStep).toBe(1);
    expect(st.nextReview! - (due + 1)).toBe(3 * DAY);
  });
});

describe('adaptive level', () => {
  it('two correct in a row → harder; a miss → easier; never outside 1–3', () => {
    let s = emptyState();
    s = play(s, [attempt('m.sub', true, T0), attempt('m.sub', true, T0 + 1)]);
    expect(skillState(s, 'm.sub').level).toBe(2);
    s = play(s, [attempt('m.sub', true, T0 + 2), attempt('m.sub', true, T0 + 3), attempt('m.sub', true, T0 + 4), attempt('m.sub', true, T0 + 5)]);
    expect(skillState(s, 'm.sub').level).toBe(3);
    s = recordAttempt(s, attempt('m.sub', false, T0 + 6));
    expect(skillState(s, 'm.sub').level).toBe(2);
    for (let i = 0; i < 5; i++) s = recordAttempt(s, attempt('m.sub', false, T0 + 10 + i));
    expect(skillState(s, 'm.sub').level).toBe(1);
  });

  it('check-up answers do not change the practice level or give stars', () => {
    const s = play(emptyState(), [attempt('m.sub', true, T0, 2, 'checkup'), attempt('m.sub', true, T0 + 1, 2, 'checkup')]);
    expect(skillState(s, 'm.sub').level).toBe(1);
    expect(s.stars).toBe(0);
  });

  it('stars and practice days are counted', () => {
    const s = play(emptyState(), [attempt('m.sub', true, T0), attempt('m.sub', false, T0 + 1), attempt('m.sub', true, T0 + DAY)]);
    expect(s.stars).toBe(2);
    expect(s.days).toEqual([dayKey(T0), dayKey(T0 + DAY)]);
    expect(dayStreak(s, T0 + DAY)).toBe(2);
    expect(dayStreak(s, T0 + 3 * DAY)).toBe(0);
  });
});

describe('unlocking and visibility', () => {
  it('skills with no prerequisites start ready; others start locked', () => {
    const s = emptyState();
    expect(skillStatus(s, getSkill('m.count10')!)).toBe('ready');
    expect(skillStatus(s, getSkill('m.add')!)).toBe('locked');
  });

  it('solid practice on a prerequisite unlocks the next skill', () => {
    const s = play(emptyState(), Array.from({ length: 6 }, (_, i) => attempt('m.count10', true, T0 + i)));
    expect(skillStatus(s, getSkill('m.add')!)).toBe('ready');
  });

  it('"unlock every skill" opens everything', () => {
    const s = { ...emptyState(), settings: { ...emptyState().settings, unlockAll: true } };
    expect(ALL_SKILLS.filter((k) => isVisible(s, k)).every((k) => skillStatus(s, k) === 'ready')).toBe(true);
  });

  it('India-only and language skills follow the curriculum and language settings', () => {
    const us = emptyState();
    expect(isVisible(us, getSkill('in.money')!)).toBe(false);
    expect(isVisible(us, getSkill('h.swar')!)).toBe(false);
    const india = { ...us, settings: { ...us.settings, curricula: ['us-ga', 'in-cbse'] as AppState['settings']['curricula'] } };
    expect(isVisible(india, getSkill('in.money')!)).toBe(true);
    expect(isVisible(india, getSkill('h.swar')!)).toBe(true);
    expect(isVisible(india, getSkill('kn.swar')!)).toBe(false);
    const kannada = { ...india, settings: { ...india.settings, languages: ['kn'] as AppState['settings']['languages'] } };
    expect(isVisible(kannada, getSkill('kn.swar')!)).toBe(true);
    expect(isVisible(kannada, getSkill('h.swar')!)).toBe(false);
  });

  it('stretch skills hide when the setting is off', () => {
    const s = { ...emptyState(), settings: { ...emptyState().settings, showStretch: false } };
    expect(isVisible(s, getSkill('m1.add20')!)).toBe(false);
    expect(isVisible(s, getSkill('m.add')!)).toBe(true);
  });
});

describe("Today's Quest", () => {
  const states: [string, AppState][] = [
    ['brand new', emptyState()],
    ['everything unlocked + India', { ...emptyState(), settings: { ...emptyState().settings, unlockAll: true, curricula: ['us-ga', 'in-cbse'], languages: ['hi', 'kn'] } }],
  ];
  for (const [name, s] of states) {
    it(`builds ${QUEST_LENGTH} visible, valid, non-repeating questions (${name})`, () => {
      for (let day = 0; day < 10; day++) {
        const q = buildQuest(s, T0 + day * DAY);
        expect(q).toHaveLength(QUEST_LENGTH);
        expect(new Set(q.map((x) => x.item.id)).size).toBe(QUEST_LENGTH);
        for (const step of q) {
          expect(isVisible(s, step.skill)).toBe(true);
          expect(step.item.choices.filter((c) => c.correct)).toHaveLength(1);
        }
      }
    });
  }

  it('rotates beyond math and reading over a week', () => {
    const s = { ...emptyState(), settings: { ...emptyState().settings, unlockAll: true } };
    const subjects = new Set<string>();
    for (let day = 0; day < 7; day++) buildQuest(s, T0 + day * DAY).forEach((x) => subjects.add(x.skill.subject));
    expect([...subjects]).toEqual(expect.arrayContaining(['math', 'reading', 'science', 'social', 'reasoning']));
  });

  it('skill sessions stay on one skill', () => {
    const q = buildSkillSession(emptyState(), getSkill('r.cvc')!);
    expect(q.every((x) => x.skill.id === 'r.cvc')).toBe(true);
  });
});

describe('answer order (no position bias)', () => {
  it('numeric choices are sorted; others are shuffled across presentations', () => {
    const numeric = getSkill('m.count10')!.generate!({ next: () => 0.3, int: (a) => a + 2, pick: (l) => l[0], shuffle: (l) => [...l] }, 2);
    const shown = present(numeric).choices.map((c) => Number(c.text));
    expect(shown).toEqual([...shown].sort((a, b) => a - b));

    const item = getSkill('r.rhyme')!.items![0];
    const firstPositions = new Set(Array.from({ length: 40 }, () => present(item).choices.findIndex((c) => c.correct)));
    expect(firstPositions.size).toBeGreaterThan(1);
  });
});

describe('Check-up', () => {
  for (const subject of SUBJECTS) {
    it(`runs to completion and scores every strand (${subject.id})`, () => {
      const s = { ...emptyState(), settings: { ...emptyState().settings, curricula: ['us-ga', 'in-cbse'] as AppState['settings']['curricula'], languages: ['hi', 'kn'] as AppState['settings']['languages'] } };
      const plan = planCheckup(s, subject.id);
      const answers: (CheckupAnswer & Attempt)[] = [];
      for (let i = 0; i < 60; i++) {
        const step = nextCheckupItem(s, plan, answers);
        if (!step) break;
        const correct = i % 3 !== 2;
        const wrong = step.item.choices.find((c) => !c.correct);
        answers.push({ itemId: step.item.id, skill: step.skill.id, d: step.item.difficulty, correct, why: correct ? undefined : wrong?.why, ts: T0 + i, mode: 'checkup', strand: step.strand });
      }
      expect(answers.length).toBe(plan.strands.length * plan.perStrand);
      const result = scoreCheckup(plan, answers);
      expect(result.strands).toHaveLength(plan.strands.length);
      result.strands.forEach((st) => expect(['Strong', 'On track', 'Growing', 'Needs practice']).toContain(st.band));
      const credited = creditFromCheckup(s, answers);
      answers.filter((a) => a.correct && a.d === 3).forEach((a) => expect(skillState(credited, a.skill).credited).toBe(true));
    });
  }

  it('gets harder after correct answers and easier after misses', () => {
    const s = emptyState();
    const plan = planCheckup(s, 'math');
    const first = nextCheckupItem(s, plan, [])!;
    expect(first.item.difficulty).toBe(2);
    const afterRight = nextCheckupItem(s, plan, [{ itemId: first.item.id, skill: first.skill.id, d: 2, correct: true, strand: first.strand }])!;
    expect(afterRight.item.difficulty).toBe(3);
    const afterWrong = nextCheckupItem(s, plan, [{ itemId: first.item.id, skill: first.skill.id, d: 2, correct: false, strand: first.strand }])!;
    expect(afterWrong.item.difficulty).toBe(1);
  });
});

describe('games progress', () => {
  it('two clean wins level up, a loss levels down, assisted changes nothing', () => {
    let s = emptyState();
    s = recordGame(s, 'number-path', 'win', T0);
    s = recordGame(s, 'number-path', 'win', T0);
    expect(gameState(s, 'number-path').level).toBe(2);
    s = recordGame(s, 'number-path', 'assisted', T0);
    expect(gameState(s, 'number-path').level).toBe(2);
    s = recordGame(s, 'number-path', 'loss', T0);
    expect(gameState(s, 'number-path')).toMatchObject({ level: 1, played: 4, won: 2 });
    expect(s.stars).toBe(2);
  });
});

describe('intro slides', () => {
  it('are remembered per skill', () => {
    const s = markIntroSeen(emptyState(), 'm.add');
    expect(skillState(s, 'm.add').introSeen).toBe(true);
    expect(skillState(s, 'm.sub').introSeen).toBe(false);
  });
});
