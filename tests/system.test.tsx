import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { emptyState, upgradeState, recordAttempt } from '../src/engine/progress';
import { startPlacement, placementNext, placementAnswer, applyPlacement, buildQuest } from '../src/engine/planner';
import { questionFingerprint } from '../src/engine/evidence';
import { learningSummary } from '../src/engine/insights';
import { QuestionReview } from '../src/ui/LearningSummary';
import { newMockRun, nextMockStep, mockTotal, scoreMock } from '../src/engine/mock';

describe('connected system regression', () => {
  it.each(['math', 'reading'] as const)('preserves migrated progress through %s startup, practice, backup and parent review', subject => {
    const now = Date.now();
    const migrated = upgradeState({...emptyState(), version: 2, profile: {name:'Test learner', avatar:'🦁', createdAt:now}});
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) throw Error('Migration failed');
    let state = migrated.state;
    const run = startPlacement(state, subject);
    run.cap = 12;
    run.perStrandCap = Math.max(2, Math.floor(12 / run.strands.length));
    const strands = new Set<string>();
    for (let q = placementNext(state, run); q; q = placementNext(state, run)) {
      strands.add(q.strand);
      placementAnswer(run, true);
      expect(run.asked).toBeLessThanOrEqual(12);
    }
    expect(strands.size).toBe(run.strands.length);
    state = {...applyPlacement(state, run, now), startupCheck:{finished:true, [subject]:now}};
    const quest = buildQuest(state, now);
    expect(quest).toHaveLength(8);
    const q = quest.find(q => q.skill.subject === subject)!;
    expect(q).toBeTruthy();
    const wrong = q.item.choices.find(c => !c.correct)!;
    state = recordAttempt(state, {itemId:q.item.id, skill:q.skill.id, d:q.item.difficulty, correct:false, ts:now, mode:'quest', repeated:false, fingerprint:questionFingerprint(q.item), selectedChoiceId:wrong.id, question:q.item});
    const restored = upgradeState(JSON.parse(JSON.stringify(state)));
    if (!restored.ok) throw Error('Restore failed');
    expect(restored.state.startupCheck?.finished).toBe(true);
    expect(restored.state.profile?.name).toBe('Test learner');
    expect(learningSummary(restored.state, now).revisit.some(x => x.skill.id === q.skill.id)).toBe(true);
    expect(restored.state.attempts.at(-1)?.question).toEqual(q.item);
    const html = renderToStaticMarkup(<QuestionReview state={restored.state}/>);
    expect(html).toContain('Correct answer');
    expect(html).toContain('Child’s first answer');
  });
  it.each(['math', 'reading'] as const)('completes and resumes a %s check with fresh-evidence metadata intact', subject => {
    let state = emptyState();
    let run = newMockRun(subject);
    for (let q = nextMockStep(state, run); q; q = nextMockStep(state, run)) {
      const answer = {strand:q.strand, skill:q.skill.id, itemId:q.item.id, level:q.level, target:q.target, correct:run.answers.length % 3 !== 0, ts:Date.now(), fingerprint:questionFingerprint(q.item), repeated:q.repeated ?? false};
      run.answers.push(answer);
      state = recordAttempt(state, {...answer, d:q.item.difficulty, mode:'mock'});
      expect(run.answers.length).toBeLessThanOrEqual(mockTotal(subject));
      if (run.answers.length === 10) {
        const restored = upgradeState(JSON.parse(JSON.stringify({...state, mockRun:run})));
        if (!restored.ok) throw Error('Restore failed');
        state = restored.state;
        run = state.mockRun!;
      }
    }
    const result = scoreMock(run);
    expect(run.answers).toHaveLength(mockTotal(subject));
    expect(result.untracked).toBe(0);
    expect(result.overallLabel).toBe('Performance on this app’s questions');
  });
});
