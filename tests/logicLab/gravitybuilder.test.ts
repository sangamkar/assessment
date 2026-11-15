import {describe,it,expect,vi} from 'vitest';
import raw from '../../src/logicLab/games/gravitybuilder/levels.json';
import type {GravityLevel} from '../../src/logicLab/games/gravitybuilder/types';
import {begin,simulate,step} from '../../src/logicLab/games/gravitybuilder/physics';
import {GravityBuilder} from '../../src/logicLab/games/gravitybuilder/module';
import {snapZone} from '../../src/logicLab/games/gravitybuilder/snap';
describe('GravityBuilder',()=>{
 it.each(raw)('$id is solvable and requires a contraption',rawLevel=>{
  const level=rawLevel as GravityLevel,placed=Object.fromEntries(level.solution.map(m=>[m.pieceId,m.zoneId]));
  expect(simulate(level,placed).success).toBe(true);expect(simulate(level,{}).success).toBe(false);
  expect(simulate(level,placed)).toEqual(simulate(level,placed));
 });
 it('locks edits while running and retains the missed trajectory and pieces',()=>{
  const game=new GravityBuilder();game.loadLevel(raw[0]);expect(game.place('ramp','z2')).toBe(true);expect(game.launch()).toBe(true);expect(game.place('ramp','z1')).toBe(false);
  for(let i=0;i<600&&game.getState().mode==='running';i++)game.tick();
  expect(game.getState().mode).toBe('edit');expect(game.getState().ghost.length).toBeGreaterThan(0);expect(game.getState().placed.ramp).toBe('z2');
  game.retry();expect(game.getState().placed.ramp).toBe('z2');expect(game.place('ramp','z1')).toBe(true);
 });
 it('fires completion once after a fixed-step success and supports hints and undo',()=>{
  const game=new GravityBuilder(),done=vi.fn();game.loadLevel(raw[0]);game.onComplete(done);
  expect(game.getHint(1)).toEqual({pieceId:'ramp'});expect(game.getHint(2)).toEqual({pieceId:'ramp',pegId:'z1'});
  game.place('ramp','z1');game.undo();expect(game.getState().placed).toEqual({});game.place('ramp','z1');game.launch();
  for(let i=0;i<600&&game.getState().mode==='running';i++)game.tick();expect(game.getState().mode).toBe('complete');expect(done).toHaveBeenCalledOnce();
 });
 it('advances identically when stepped from the same state',()=>{const level=raw[2] as GravityLevel;const a=begin(level),b=begin(level);expect(step(level,{fan:'z1'},a)).toEqual(step(level,{fan:'z1'},b));});
 it('snaps to the nearest compatible open zone within tolerance',()=>{const level=raw[0] as GravityLevel;expect(snapZone(level,{},'ramp',80,125)).toBe('z1');expect(snapZone(level,{},'ramp',250,50)).toBeNull();expect(snapZone(level,{},'missing',60,120)).toBeNull();});
 it('rejects malformed or unsolvable levels',()=>{const game=new GravityBuilder();expect(()=>game.loadLevel({id:'bad'})).toThrow();});
});
