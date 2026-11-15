import type { Completion, Hint, MiniGameModule, Unsubscribe } from '../../core/types';
import type { Belt, GearLevel, GearState, Teeth } from './types';
import { radius, solve } from './solver';
function validLevel(input:unknown): input is GearLevel {
  if (!input || typeof input !== 'object') return false;
  const l=input as GearLevel;
  if(typeof l.id!=='string'||!l.id||typeof l.title!=='string'||!Array.isArray(l.pegs)||!Array.isArray(l.goals)||!l.goals.length||!Array.isArray(l.inventory)||!Array.isArray(l.belts)||!Array.isArray(l.solution)) return false;
  if(!l.pegs.every(p=>p&&typeof p.id==='string'&&p.id&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=32&&p.x<=328&&p.y>=32&&p.y<=208)) return false;
  const ids=l.pegs.map(p=>p.id), gear=(g:unknown)=>{const x=g as {pegId?:string;teeth?:number};return !!x&&ids.includes(x.pegId??'')&&[8,12,16].includes(x.teeth??0);};
  if(new Set(ids).size!==ids.length||!gear(l.motor)||!l.goals.every(gear)) return false;
  const fixed=[l.motor.pegId,...l.goals.map(g=>g.pegId)];
  if(new Set(fixed).size!==fixed.length||!l.inventory.every(p=>p&&typeof p.id==='string'&&p.id&&[8,12,16].includes(p.teeth))||new Set(l.inventory.map(p=>p.id)).size!==l.inventory.length) return false;
  if(!l.belts.every(b=>b&&typeof b.id==='string'&&b.id&&ids.includes(b.a)&&ids.includes(b.b)&&b.a!==b.b)||new Set(l.belts.map(b=>b.id)).size!==l.belts.length) return false;
  if(!l.solution.every(s=>s&&l.inventory.some(p=>p.id===s.pieceId)&&ids.includes(s.pegId)&&!fixed.includes(s.pegId))||new Set(l.solution.map(s=>s.pieceId)).size!==l.solution.length||new Set(l.solution.map(s=>s.pegId)).size!==l.solution.length) return false;
  const placedGears=[l.motor,...l.goals,...l.solution.map(s=>({pegId:s.pegId,teeth:l.inventory.find(p=>p.id===s.pieceId)!.teeth}))];
  for(let i=0;i<placedGears.length;i++) for(let j=i+1;j<placedGears.length;j++) {
    const a=l.pegs.find(p=>p.id===placedGears[i].pegId)!,b=l.pegs.find(p=>p.id===placedGears[j].pegId)!;
    if(Math.hypot(a.x-b.x,a.y-b.y)<radius(placedGears[i].teeth)+radius(placedGears[j].teeth)-1)return false;
  }
  return solve(l,Object.fromEntries(l.solution.map(s=>[s.pieceId,s.pegId])),l.belts).complete;
}
export class GearWorks implements MiniGameModule<GearState> {
  private level!:GearLevel; private placed:Record<string,string>={}; private belts:Belt[]=[]; private history:{placed:Record<string,string>;belts:Belt[]}[]=[];
  private listeners=new Set<()=>void>(); private completion=new Set<(result:Completion)=>void>(); private announced=false; private hints=0;
  loadLevel(json:unknown):void { if(!validLevel(json)) throw new Error('This level is invalid or its supplied solution does not power every goal.'); this.level=structuredClone(json); this.reset(); }
  reset():void { this.placed={};this.belts=[];this.history=[];this.announced=false;this.hints=0;this.emit(); }
  getState():GearState { const solution=solve(this.level,this.placed,this.belts);return {level:structuredClone(this.level),placed:{...this.placed},belts:this.belts.map(b=>({...b})),solution,complete:solution.complete}; }
  subscribe(listener:()=>void):Unsubscribe {this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  onComplete(listener:(result:Completion)=>void):Unsubscribe {this.completion.add(listener);return()=>this.completion.delete(listener);}
  private emit(){this.listeners.forEach(f=>f());}
  private checkpoint(){this.history.push({placed:{...this.placed},belts:[...this.belts]});}
  private changed(){const result=solve(this.level,this.placed,this.belts);this.emit();if(result.complete&&!this.announced){this.announced=true;const stars=(this.hints===0?3:this.hints===1?2:1) as 1|2|3;this.completion.forEach(f=>f({stars}));} if(!result.complete)this.announced=false;}
  place(pieceId:string,pegId:string):boolean {
    if(!this.level.inventory.some(p=>p.id===pieceId)||!this.level.pegs.some(p=>p.id===pegId)||this.level.motor.pegId===pegId||this.level.goals.some(g=>g.pegId===pegId)||Object.entries(this.placed).some(([id,p])=>p===pegId&&id!==pieceId))return false;
    if(this.placed[pieceId]===pegId)return false;
    const peg=this.level.pegs.find(p=>p.id===pegId)!, piece=this.level.inventory.find(p=>p.id===pieceId)!;
    const occupied=[this.level.motor,...this.level.goals,...Object.entries(this.placed).filter(([id])=>id!==pieceId).map(([id,where])=>({pegId:where,teeth:this.level.inventory.find(p=>p.id===id)!.teeth}))];
    if(occupied.some(g=>{const other=this.level.pegs.find(p=>p.id===g.pegId)!;return Math.hypot(peg.x-other.x,peg.y-other.y)<radius(piece.teeth)+radius(g.teeth)-1;}))return false;
    this.checkpoint();const old=this.placed[pieceId];if(old)this.belts=this.belts.filter(b=>b.a!==old&&b.b!==old);this.placed={...this.placed,[pieceId]:pegId};this.changed();return true;
  }
  connect(beltId:string,a:string,b:string):boolean {
    const belt=this.level.belts.find(x=>x.id===beltId);
    const occupied=new Set([this.level.motor.pegId,...this.level.goals.map(g=>g.pegId),...Object.values(this.placed)]);
    if(!belt||this.belts.some(x=>x.id===beltId)||!occupied.has(a)||!occupied.has(b)||a===b)return false;
    this.checkpoint();this.belts=[...this.belts,{id:beltId,a,b}];this.changed();return true;
  }
  undo():void {const previous=this.history.pop();if(previous){this.placed=previous.placed;this.belts=previous.belts;this.changed();}}
  getHint(tier:1|2):Hint|null {const next=this.level.solution.find(x=>this.placed[x.pieceId]!==x.pegId);if(next){this.hints++;return {pieceId:next.pieceId,...(tier===2?{pegId:next.pegId}:{})};}const belt=this.level.belts.find(b=>!this.belts.some(x=>x.id===b.id));if(belt){this.hints++;return {pieceId:belt.id,...(tier===2?{pegId:belt.a,targetPegId:belt.b}:{})};}return null;}
}
export const isTeeth=(n:number):n is Teeth=>[8,12,16].includes(n);
