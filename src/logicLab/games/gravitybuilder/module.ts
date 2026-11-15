import type {Completion,Hint,MiniGameModule,Unsubscribe} from '../../core/types';
import type {GravityLevel,GravityState,PhysicsState,Point} from './types';
import {accepts,begin,simulate,step} from './physics';
const kinds=['ramp-left','ramp-right','trampoline','fan','switch-gate'];
function validLevel(input:unknown):input is GravityLevel {
 if(!input||typeof input!=='object')return false;const l=input as GravityLevel;
 if(typeof l.id!=='string'||!l.id||typeof l.title!=='string'||!l.spawn||!l.goal||!Array.isArray(l.zones)||!Array.isArray(l.inventory)||!Array.isArray(l.solution))return false;
 if(![l.spawn.x,l.spawn.y,l.spawn.vx,l.spawn.vy,l.goal.x,l.goal.y,l.goal.r,l.floor].every(Number.isFinite)||l.goal.r<=0||l.goal.r>50||l.floor<100||l.floor>230||(l.gateX!==undefined&&!Number.isFinite(l.gateX)))return false;
 if(!l.zones.every(z=>z&&typeof z.id==='string'&&z.id&&Number.isFinite(z.x)&&Number.isFinite(z.y)&&z.x>=0&&z.x<=360&&z.y>=0&&z.y<=240&&Array.isArray(z.accept)&&z.accept.every(k=>kinds.includes(k))))return false;
 if(!l.inventory.every(p=>p&&typeof p.id==='string'&&p.id&&kinds.includes(p.kind)))return false;
 if(new Set(l.zones.map(z=>z.id)).size!==l.zones.length||new Set(l.inventory.map(p=>p.id)).size!==l.inventory.length)return false;
 if(!l.solution.every(m=>{const p=l.inventory.find(p=>p.id===m.pieceId),z=l.zones.find(z=>z.id===m.zoneId);return !!p&&!!z&&accepts(p.kind,z);})||new Set(l.solution.map(m=>m.pieceId)).size!==l.solution.length||new Set(l.solution.map(m=>m.zoneId)).size!==l.solution.length)return false;
 return simulate(l,Object.fromEntries(l.solution.map(m=>[m.pieceId,m.zoneId]))).success;
}
export class GravityBuilder implements MiniGameModule<GravityState>{
 private level!:GravityLevel;private placed:Record<string,string>={};private history:Record<string,string>[]=[];private physics:PhysicsState|null=null;private ghost:Point[]=[];private mode:GravityState['mode']='edit';private hints=0;
 private listeners=new Set<()=>void>();private completeListeners=new Set<(c:Completion)=>void>();
 loadLevel(json:unknown):void {if(!validLevel(json))throw Error('This level is invalid or its supplied solution does not reach the goal.');this.level=structuredClone(json);this.reset();}
 reset():void{this.placed={};this.history=[];this.physics=null;this.ghost=[];this.mode='edit';this.hints=0;this.emit();}
 getState():GravityState{return {level:structuredClone(this.level),placed:{...this.placed},mode:this.mode,physics:this.physics?structuredClone(this.physics):null,ghost:this.ghost.map(p=>({...p}))};}
 subscribe(fn:()=>void):Unsubscribe{this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 onComplete(fn:(c:Completion)=>void):Unsubscribe{this.completeListeners.add(fn);return()=>this.completeListeners.delete(fn);}
 private emit(){this.listeners.forEach(f=>f());}
 place(pieceId:string,zoneId:string):boolean{if(this.mode!=='edit')return false;const piece=this.level.inventory.find(p=>p.id===pieceId),zone=this.level.zones.find(z=>z.id===zoneId);if(!piece||!zone||!accepts(piece.kind,zone)||Object.entries(this.placed).some(([id,z])=>id!==pieceId&&z===zoneId)||this.placed[pieceId]===zoneId)return false;this.history.push({...this.placed});this.placed={...this.placed,[pieceId]:zoneId};this.emit();return true;}
 undo():void{if(this.mode!=='edit')return;const previous=this.history.pop();if(previous){this.placed=previous;this.emit();}}
 getHint(tier:1|2):Hint|null{if(this.mode!=='edit')return null;const move=this.level.solution.find(m=>this.placed[m.pieceId]!==m.zoneId);if(!move)return null;this.hints++;return {pieceId:move.pieceId,...(tier===2?{pegId:move.zoneId}:{})};}
 launch():boolean{if(this.mode!=='edit')return false;this.physics=begin(this.level);this.mode='running';this.emit();return true;}
 tick():void{if(this.mode!=='running'||!this.physics)return;this.physics=step(this.level,this.placed,this.physics);if(this.physics.finished){if(this.physics.success){this.mode='complete';this.completeListeners.forEach(f=>f({stars:(this.hints===0?3:this.hints===1?2:1)}));}else{this.ghost=this.physics.trail;this.mode='edit';}}this.emit();}
 retry():void{if(this.mode==='running'&&this.physics)this.ghost=this.physics.trail;this.mode='edit';this.physics=null;this.emit();}
}
