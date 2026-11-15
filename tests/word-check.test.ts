import { describe, expect, it } from 'vitest';
import { WORD_SKILLS } from '../src/content/wordSkills';
import { skillsFor } from '../src/content';
import { isVisible, nextCheckupItem, planWordCheckup, scoreCheckup } from '../src/engine/planner';
import type { CheckupAnswer } from '../src/engine/planner';
import { emptyState, recordAttempt } from '../src/engine/progress';
import type { Attempt } from '../src/engine/progress';
import { itemFingerprint } from '../src/engine/exposures';
import { poolItems } from '../src/engine/itemPools';

describe('focused word check', () => {
  it('keeps the word skills accessible with separate practice and held-out prompts', () => {
    for (const skill of WORD_SKILLS) {
      expect(skillsFor('reading')).toContain(skill);
      expect(isVisible(emptyState(),skill)).toBe(true);
      const practice=poolItems(skill,'practice'), test=poolItems(skill,'mock');
      expect(practice.length).toBeGreaterThanOrEqual(16);
      expect(test.length).toBeGreaterThanOrEqual(16);
      const fingerprints=new Set(practice.map(itemFingerprint));
      expect(test.every(i=>!fingerprints.has(itemFingerprint(i)))).toBe(true);
      if (skill.strand==='hfw') expect([...practice,...test].every(i=>i.speakChoices===false)).toBe(true);
    }
  });
  it('asks six held-out items per topic, tracks familiarity and completes', () => {
    let state=emptyState();
    const plan=planWordCheckup(), answers:(CheckupAnswer & Attempt)[]=[];
    for(let i=0;i<12;i++){
      const step=nextCheckupItem(state,plan,answers)!;
      expect(step).toBeTruthy();
      expect(step.item.id).toContain('.reserved-words.');
      const attempt:CheckupAnswer & Attempt={skill:step.skill.id,itemId:step.item.id,fingerprint:itemFingerprint(step.item),d:step.item.difficulty,correct:true,strand:step.strand,mode:'checkup',ts:i,repeated:step.repeated};
      answers.push(attempt);
      state=recordAttempt(state,attempt);
    }
    expect(answers.filter(a=>a.strand==='hfw')).toHaveLength(6);
    expect(answers.filter(a=>a.strand==='vocab')).toHaveLength(6);
    expect(new Set(answers.map(a=>a.fingerprint)).size).toBe(12);
    expect(nextCheckupItem(state,plan,answers)).toBeNull();
    expect(scoreCheckup(plan,answers).strands.every(s=>s.freshTotal===6)).toBe(true);
    expect(nextCheckupItem(state,plan,[])?.repeated).toBe(false);
  });
  it('allows newly authored questions for older subject-level history', () => {
    const state=emptyState();
    state.exposures.untrackedMockSkills=['__subject_reading__'];
    expect(nextCheckupItem(state,planWordCheckup(),[])?.repeated).toBe(false);
  });
  it('repeats when exhausted and excludes familiar questions from fresh evidence', () => {
    let state=emptyState();
    const original=planWordCheckup(), plan={...original,perStrand:25,strands:[original.strands[0]]};
    const answers:(CheckupAnswer & Attempt)[]=[];
    for(let i=0;i<25;i++){
      const step=nextCheckupItem(state,plan,answers)!;
      const attempt:CheckupAnswer & Attempt={skill:step.skill.id,itemId:step.item.id,fingerprint:itemFingerprint(step.item),d:step.item.difficulty,correct:true,strand:step.strand,mode:'checkup',ts:i,repeated:step.repeated};
      answers.push(attempt); state=recordAttempt(state,attempt);
    }
    expect(new Set(answers.slice(0,24).map(a=>a.fingerprint)).size).toBe(24);
    expect(answers[24].repeated).toBe(true);
    expect(scoreCheckup(plan,answers).strands[0].freshTotal).toBe(24);
    expect(nextCheckupItem(state,plan,answers)).toBeNull();
  });
});
