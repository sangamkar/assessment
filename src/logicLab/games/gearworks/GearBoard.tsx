import { useEffect, useRef, useState } from 'react';
import type { Hint } from '../../core/types';
import type { GearState, Teeth } from './types';
import { radius } from './solver';
import { TutorialHandOverlay } from '../../components/TutorialHandOverlay';
function gearPoints(teeth:Teeth,r:number){const n=teeth*4;return Array.from({length:n},(_,i)=>{const a=i*Math.PI*2/n,rr=r*(i%4===1||i%4===2?1:0.84);return `${Math.cos(a)*rr},${Math.sin(a)*rr}`}).join(' ');}
function rattle(){try {const C=window.AudioContext;if(!C)return;const ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(145,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(95,ctx.currentTime+0.12);gain.gain.setValueAtTime(0.018,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+0.16);osc.onended=()=>{void ctx.close();};}catch{/* Sound is optional and never blocks play. */}}
export function GearBoard({state,onPeg,hint,muted,tutorial,onJam,beltStart,beltReach}:{state:GearState;onPeg:(id:string)=>void;hint:Hint|null;muted:boolean;tutorial:boolean;onJam?:()=>void;beltStart?:string|null;beltReach?:number}) {
  const previous=useRef(false);const jam=state.solution.jammed.length>0;
  useEffect(()=>{if(jam&&!previous.current&&!muted)(onJam??rattle)();previous.current=jam;},[jam,muted,onJam]);
  const pegs=state.level.pegs;const fixed=[state.level.motor,...state.level.goals];
  const gears=[...fixed,...Object.entries(state.placed).map(([id,pegId])=>({pegId,teeth:state.level.inventory.find(p=>p.id===id)!.teeth}))];
  const first=state.level.solution[0],source=pegs.find(p=>p.id===first?.pegId);
  return <div className="board-wrap"><div className="gear-viewport"><div className="board gear-board" aria-label="Gear board">
    <svg viewBox="0 0 360 240" className="board-svg" aria-hidden="true">
      {beltStart&&pegs.filter(p=>p.id===beltStart).map(p=><g key={p.id}><circle cx={p.x} cy={p.y} r={beltReach??360} fill="#7c3aed0c" stroke="#7c3aed" strokeDasharray="4 4"/><circle cx={p.x} cy={p.y} r="7" fill="#7c3aed"/></g>)}
      {state.belts.map(b=>{const a=pegs.find(p=>p.id===b.a)!,c=pegs.find(p=>p.id===b.b)!;return <line key={b.id} x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#684e9c" strokeWidth="5"/>;})}
      {pegs.map(p=><circle key={p.id} cx={p.x} cy={p.y} r="5" fill="#94a3b8"/>)}
      {gears.map(g=>{const p=pegs.find(x=>x.id===g.pegId)!,motion=state.solution.motion[g.pegId],conflict=state.solution.jammed.includes(g.pegId);return <g key={g.pegId} transform={`translate(${p.x} ${p.y})`}><g className={`${motion&&!jam?'rotating':''} ${conflict?'jammed':''}`} style={motion&&!jam?{animationDuration:`${60/motion.rpm}s`,animationDirection:motion.direction===1?'normal':'reverse'}:undefined}><polygon points={gearPoints(g.teeth,radius(g.teeth))} fill={conflict?'#ef4444':g.pegId===state.level.motor.pegId?'#0f766e':state.level.goals.some(x=>x.pegId===g.pegId)?'#d97706':'#4f77dc'} stroke="#263453" strokeWidth="1.5"/><circle r="5" fill="white"/></g></g>;})}
      {state.level.goals.map(g=>{const p=pegs.find(p=>p.id===g.pegId)!;const m=state.solution.motion[g.pegId];return <text key={g.pegId} x={p.x} y={p.y+5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#172554">{g.direction===undefined?'★':g.direction===1?'↻':'↺'}{m&&(!g.direction||m.direction===g.direction)&&!jam?'✓':''}</text>})}
      {hint?.pegId&&pegs.filter(p=>p.id===hint.pegId||p.id===hint.targetPegId).map(p=><g key={p.id} transform={`translate(${p.x} ${p.y})`}><polygon points={gearPoints(state.level.inventory.find(x=>x.id===hint.pieceId)?.teeth??8,radius(state.level.inventory.find(x=>x.id===hint.pieceId)?.teeth??8))} fill="#7c3aed22" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 3"/></g>)}
    </svg>
    {pegs.map(p=><button key={p.id} className="peg-hit" style={{left:`${p.x/360*100}%`,top:`${p.y/240*100}%`}} onClick={()=>onPeg(p.id)} aria-label={`Peg ${p.id}${state.level.motor.pegId===p.id?', motor':state.level.goals.some(g=>g.pegId===p.id)?`, goal${state.level.goals.find(g=>g.pegId===p.id)?.direction===1?' clockwise':state.level.goals.find(g=>g.pegId===p.id)?.direction===-1?' counterclockwise':''}`:''}`} />)}
    <TutorialHandOverlay visible={tutorial&&!!source} from={{x:source?source.x/360*100:50,y:source?source.y/240*100:50}} />
  </div></div><p className="board-note" aria-live="polite">{jam?'These gears are pushing against each other. Try moving one.':state.complete?'All goals are turning!':state.level.goals.some(g=>g.direction)?'Make every goal turn in its arrow direction.':'Choose a piece, then tap a peg.'}</p></div>;
}
