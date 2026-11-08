import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ALL_SKILLS, getSkill } from '../src/content';
import { newMockRun, nextMockStep, mockTotal, type MockSubject } from '../src/engine/mock';
import { emptyState, attemptsFor } from '../src/engine/progress';
import { itemFingerprint, isMockItem, poolItems } from '../src/engine/itemPools';
import * as pools from '../src/engine/itemPools';
import { questionFingerprint } from '../src/engine/evidence';
import { pickAssessmentItem, topMisconceptions, startPlacement, placementNext, placementAnswer } from '../src/engine/planner';
import { contentIssue } from '../src/engine/contentIssues';
import { learningSummary } from '../src/engine/insights';
import { QuestionReview } from '../src/ui/LearningSummary';

afterEach(()=>vi.restoreAllMocks());
describe('assessment question variety',()=>{
 it.each(['math','reading'] as MockSubject[])('does not repeat tasks in a strong-child %s run, including after reload',subject=>{
  for(let seed=0;seed<8;seed++){
   const state=emptyState();let run=newMockRun(subject,2,2000+seed);const seen=new Set<string>();
   for(let q=nextMockStep(state,run);q;q=nextMockStep(state,run)){
    const fp=itemFingerprint(q.item);expect(seen.has(fp),`${seed}: ${q.item.id}`).toBe(false);expect(q.repeated).toBe(false);expect(isMockItem(q.item)).toBe(true);seen.add(fp);
    run.answers.push({strand:q.strand,skill:q.skill.id,itemId:q.item.id,poolFingerprint:fp,fingerprint:questionFingerprint(q.item),repeated:q.repeated,level:q.level,target:q.target,correct:true,ts:run.answers.length});
    if(run.answers.length===16)run=JSON.parse(JSON.stringify(run));
   }
   expect(run.answers).toHaveLength(mockTotal(subject));
  }
 });
 it('keeps a finite mock going with flagged, balanced repeats only after the bank really runs out',()=>{
  const real=poolItems, only=getSkill('m2.shapes')!.items!.filter(i=>['m2.shapes.3','m2.shapes.8'].includes(i.id));
  // Exercise true exhaustion rather than relying on the production bank being thin.
  vi.spyOn(pools,'poolItems').mockImplementation((skill,pool)=>skill.subject==='math'&&skill.strand==='geometry' ? (skill.id==='m2.shapes'?only:[]) : real(skill,pool));
  const state=emptyState(),run=newMockRun('math',2,2000);
  for(let q=nextMockStep(state,run);q;q=nextMockStep(state,run)){
   const count=run.answers.filter(a=>a.itemId===q.item.id).length;
   if(count)expect(q.repeated).toBe(true);
   run.answers.push({strand:q.strand,skill:q.skill.id,itemId:q.item.id,level:q.level,repeated:q.repeated,correct:true,ts:run.answers.length});
  }
  expect(run.answers).toHaveLength(mockTotal('math'));expect(run.answers.filter(a=>a.strand==='geometry'&&a.repeated)).toHaveLength(6);
  for(const item of only)expect(run.answers.filter(a=>a.itemId===item.id)).toHaveLength(4);
 });
 it('does not credit a placement skill when fallback questions are easier than the hard level',()=>{
  const state=emptyState(),skill=getSkill('m2.shapes')!;
  const run=startPlacement(state,'math');
  run.strands=[{strand:'geometry',title:'Geometry',skills:[skill]}];run.strandIndex=0;run.idx=0;
  // All hard questions have been used; the picker should use different easier
  // questions, and those cannot establish the two-hard-pass skip criterion.
  for(const item of skill.items!.filter(i=>i.difficulty===3))run.seen.add(item.id);
  const first=placementNext(state,run)!;expect(first.item.difficulty).toBeLessThan(3);placementAnswer(run,true);
  const second=placementNext(state,run)!;expect(second.item.difficulty).toBeLessThan(3);placementAnswer(run,true);
  expect(run.known).not.toContain(skill.id);
 });
 it('uses other difficulty items before repeating a check-up item',()=>{
  const state=emptyState(),skill=getSkill('m2.shapes')!,answered:{itemId:string;fingerprint:string}[]=[];
  for(let n=0;n<skill.items!.length;n++){
   const q=pickAssessmentItem(state,skill,2,answered);expect(q.repeated).toBe(false);expect(answered.some(a=>a.itemId===q.item.id)).toBe(false);
   answered.push({itemId:q.item.id,fingerprint:questionFingerprint(q.item)});
  }
  expect(pickAssessmentItem(state,skill,2,answered).repeated).toBe(true);
 });
});
describe('unambiguous small-square counting',()=>{
 const skill=getSkill('m2.shapes')!;
 const oldSay='This rectangle is split into rows and columns of equal squares. How many squares are there?';
 it('keeps corrected items in their original pools and makes spoken and visible instructions explicit',()=>{
  for(const id of ['m2.shapes.4','m2.shapes.8']){
   const item=skill.items!.find(i=>i.id===id)!;
   expect(item.say).toContain('only the small squares');expect(item.say).toContain('Do not count larger squares');expect(item.show).toBe('How many small squares?');
   expect(isMockItem(item)).toBe(id==='m2.shapes.8');expect(item.visual?.kind).toBe('map');
   if(item.visual?.kind==='map')expect(item.choices.find(c=>c.correct)?.text).toBe(String(item.visual.rows*item.visual.cols));
   expect(contentIssue({itemId:id,question:item})).toBeUndefined();
  }
 });
 it('preserves and flags the old ambiguous response without treating it as a learning or counting misconception',()=>{
  const now=Date.now(),corrected=skill.items!.find(i=>i.id==='m2.shapes.8')!;
  const old={...corrected,say:oldSay,show:'How many squares?'};
  const state=emptyState();state.attempts=[0,1].map(n=>({itemId:old.id,question:old,poolFingerprint:itemFingerprint(old),skill:skill.id,d:old.difficulty,correct:false,why:'count_double_tap',selectedChoiceId:old.choices.find(c=>c.text==='10')!.id,ts:now+n,mode:'mock' as const}));
  expect(contentIssue(state.attempts[0])).toContain('reasonable interpretation');
  expect(contentIssue({...state.attempts[0],question:undefined})).toBeTruthy();
  expect(attemptsFor(state,skill.id)).toHaveLength(0);expect(learningSummary(state,now).revisit).toHaveLength(0);expect(topMisconceptions(state)).toHaveLength(0);
  const html=renderToStaticMarkup(<QuestionReview state={state}/>);expect(html).toContain('Question wording issue');expect(html).toContain('Original answer key');expect(html).toContain('Child’s first answer');expect(state.attempts).toHaveLength(2);
 });
 it('holds the expanded geometry tasks out of ordinary practice',()=>{
  expect(poolItems(skill,'mock').filter(i=>i.id.startsWith('m2.shapes.mock.'))).toHaveLength(12);
  expect(poolItems(skill,'practice').some(i=>i.id.startsWith('m2.shapes.mock.'))).toBe(false);
  for(const s of ALL_SKILLS){const practice=new Set(poolItems(s,'practice').map(itemFingerprint));for(const item of poolItems(s,'mock'))expect(practice.has(itemFingerprint(item))).toBe(false);}
 });
});
