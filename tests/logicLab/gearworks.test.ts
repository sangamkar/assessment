import {describe, expect, it, vi} from 'vitest';
import raw from '../../src/logicLab/games/gearworks/levels.json';
import {GearWorks} from '../../src/logicLab/games/gearworks/module';
import {solve} from '../../src/logicLab/games/gearworks/solver';
import type {GearLevel} from '../../src/logicLab/games/gearworks/types';
import {ProgressStore, STORAGE_KEY} from '../../src/logicLab/core/progress';
import {GameSession} from '../../src/logicLab/core/session';
import {GEAR_WORKS} from '../../src/logicLab/games/gearworks';

describe('GearWorks rules',()=>{
 it.each(raw)('level $id loads and its intended placements power all goals',level=>{
   const game=new GearWorks(),done=vi.fn();game.loadLevel(level);game.onComplete(done);
   for(const move of level.solution)expect(game.place(move.pieceId,move.pegId)).toBe(true);
   for(const belt of level.belts)expect(game.connect(belt.id,belt.a,belt.b)).toBe(true);
   expect(game.getState().complete).toBe(true);expect(done).toHaveBeenCalledTimes(1);
   game.undo();expect(game.getState().complete).toBe(false);game.reset();expect(game.getState().placed).toEqual({});
 });
 it('reverses direction on contact and scales angular speed by tooth count',()=>{
   const level=raw[1] as GearLevel;const result=solve(level,{small:'b'});
   expect(result.motion.a).toEqual({direction:1,rpm:24});
   expect(result.motion.b).toEqual({direction:-1,rpm:16});
   expect(result.motion.c).toEqual({direction:1,rpm:24});expect(result.complete).toBe(true);
 });
 it('a belt preserves direction and scales the driven gear speed',()=>{
   const level:GearLevel={id:'b',title:'Belt',pegs:[{id:'a',x:60,y:90},{id:'b',x:220,y:90}],motor:{pegId:'a',teeth:12},goals:[{pegId:'b',teeth:8}],inventory:[],belts:[{id:'belt',a:'a',b:'b'}],solution:[]};
   const result=solve(level,{},level.belts);
   expect(result.motion.b).toEqual({direction:1,rpm:36});expect(result.complete).toBe(true);
 });
 it('detects an odd meshed loop without declaring success',()=>{
   const level:GearLevel={id:'jam',title:'Jam',pegs:[{id:'a',x:60,y:80},{id:'b',x:92,y:80},{id:'c',x:76,y:107.7128}],motor:{pegId:'a',teeth:8},goals:[{pegId:'b',teeth:8},{pegId:'c',teeth:8}],inventory:[],belts:[],solution:[]};
   const result=solve(level,{});expect(result.jammed.length).toBeGreaterThan(0);expect(result.complete).toBe(false);
 });
 it('shows graduated hints, undoes moves, and rejects invalid levels',()=>{
   const game=new GearWorks();game.loadLevel(raw[0]);
   expect(game.getHint(1)).toEqual({pieceId:'small'});expect(game.getHint(2)).toEqual({pieceId:'small',pegId:'b'});
   expect(game.place('small','a')).toBe(false);expect(game.place('small','b')).toBe(true);game.undo();expect(game.getState().placed).toEqual({});
   expect(()=>game.loadLevel({id:'bad'})).toThrow();
 });
});
describe('independent progress',()=>{
 it('saves and reloads the best result without touching other keys',()=>{
   const values:Record<string,string>={'learning-quest:v1':'keep'};const storage={getItem:(k:string)=>values[k]??null,setItem:(k:string,v:string)=>{values[k]=v;}};
   const store=new ProgressStore(storage),session=new GameSession([GEAR_WORKS],store),game=session.start('gearworks','first-link') as GearWorks;
   session.hint(1);game.place('small','b');expect(values['learning-quest:v1']).toBe('keep');
   expect(new ProgressStore(storage).get('gearworks','first-link')).toEqual({completed:true,hintsUsed:1,stars:2});
   expect(values[STORAGE_KEY]).toBeTruthy();session.dispose();
 });
 it('keeps a playable in-memory result when storage fails',()=>{
   const store=new ProgressStore({getItem:()=>null,setItem:()=>{throw Error('full')}});
   expect(store.save('gearworks','x',0,{stars:3})).toBe(false);expect(store.get('gearworks','x').completed).toBe(true);
 });
});
