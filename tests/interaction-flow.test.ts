import { afterEach,describe,expect,it,vi } from 'vitest';
import { afterFeedback } from '../src/utils/useAutoAdvance';
import { newBrainRun,brainCompletion,targetPuzzle,balancePuzzle,connectionPuzzle,robotPuzzle } from '../src/games/brain';

afterEach(()=>vi.useRealTimers());
describe('fewer-tap flows',()=>{
 it('waits for speech and advances once',()=>{
  vi.useFakeTimers();const next=vi.fn();let talking=true;
  afterFeedback(next,()=>talking);
  vi.advanceTimersByTime(4000);expect(next).not.toHaveBeenCalled();
  talking=false;vi.advanceTimersByTime(300);expect(next).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(5000);expect(next).toHaveBeenCalledTimes(1);
 });
 it('cancels a pending advance on pause or exit',()=>{
  vi.useFakeTimers();const next=vi.fn();const cancel=afterFeedback(next,()=>false);
  cancel();vi.advanceTimersByTime(5000);expect(next).not.toHaveBeenCalled();
 });
 it('completes valid final values but preserves unfinished or incorrect boards',()=>{
  let r=newBrainRun('target-number',1,20);
  expect(brainCompletion('target-number',r)).toBeNull();
  r.board.cards=[{id:'result',value:targetPuzzle(1,20).target,expression:'1 + 2'}];
  expect(brainCompletion('target-number',r)).toBeTruthy();
  r.board.cards[0].value++;expect(brainCompletion('target-number',r)).toBeNull();
  r=newBrainRun('balance-lab',1,20);
  r.board.answer=balancePuzzle(1,20).answer;
  expect(brainCompletion('balance-lab',r)).toBeTruthy();
  r.board.status='solved';expect(brainCompletion('balance-lab',r)).toBeNull();
 });
 it('requires two distinct correct word groups',()=>{
  const r=newBrainRun('connections-junior',1,20),p=connectionPuzzle(1,20,0);
  r.board.groups=[0,1].map(group=>p.tiles.flatMap((t,i)=>t.group===group?[i]:[]));
  expect(brainCompletion('connections-junior',r)).toBeTruthy();
  r.board.groups[1]=r.board.groups[0];expect(brainCompletion('connections-junior',r)).toBeNull();
 });
 it('delivers only at the correct station with exact quantities',()=>{
  const r=newBrainRun('robot-delivery',1,20),p=robotPuzzle(1,20);
  r.board.position=p.goal;expect(brainCompletion('robot-delivery',r)).toBeNull();
  r.board.collected=[p.parcels.find(x=>x.color==='blue')!.cell,p.parcels.find(x=>x.color==='red')!.cell];
  expect(brainCompletion('robot-delivery',r)).toBeTruthy();
  r.board.position=0;expect(brainCompletion('robot-delivery',r)).toBeNull();
 });
});
