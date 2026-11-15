import {useEffect,useRef,useState} from 'react';
import type {PointerEvent} from 'react';
import type {GameSession} from '../../core/session';
import type {Hint} from '../../core/types';
import {TutorialHandOverlay} from '../../components/TutorialHandOverlay';
import type {GravityState,PieceKind} from './types';
import {GravityBuilder} from './module';
import {snapZone} from './snap';
const icon:Record<PieceKind,string>={'ramp-left':'↙️','ramp-right':'↘️','trampoline':'🟠','fan':'💨','switch-gate':'🔘'};
const label:Record<PieceKind,string>={'ramp-left':'Left ramp','ramp-right':'Right ramp','trampoline':'Trampoline','fan':'Fan','switch-gate':'Switch'};
export function GravityScreen({game,session,custom,onBack}:{game:GravityBuilder;session:GameSession;custom:boolean;onBack:()=>void}){
 const [state,setState]=useState<GravityState>(()=>game.getState()),[selected,setSelected]=useState<string|null>(()=>game.getState().level.inventory[0]?.id??null),[hint,setHint]=useState<Hint|null>(null),[message,setMessage]=useState('');
 const board=useRef<HTMLDivElement>(null);
 const hintZone=state.level.zones.find(z=>z.id===hint?.pegId),hintPiece=state.level.inventory.find(p=>p.id===hint?.pieceId);
 useEffect(()=>game.subscribe(()=>setState(game.getState())),[game]);
 useEffect(()=>{if(state.mode!=='running')return;let frame=0,last=0,acc=0;const draw=(t:number)=>{if(last)acc+=Math.min(t-last,100);last=t;while(acc>=1000/60){game.tick();acc-=1000/60;if(game.getState().mode!=='running')return;}frame=requestAnimationFrame(draw);};frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);},[game,state.mode]);
 const place=(piece:string,zone:string)=>{const ok=game.place(piece,zone);setMessage(ok?'':'Choose an open matching spot.');if(ok)setHint(null);};
 const onDrop=(e:PointerEvent<HTMLButtonElement>,id:string)=>{const rect=board.current?.getBoundingClientRect();if(!rect||state.mode!=='edit')return;const x=(e.clientX-rect.left)*360/rect.width,y=(e.clientY-rect.top)*240/rect.height;if(x<0||x>360||y<0||y>240)return;const zone=snapZone(state.level,state.placed,id,x,y);if(zone)place(id,zone);};
 const ask=(tier:1|2)=>{const result=custom?game.getHint(tier):session.hint(tier);setHint(result);if(result)setSelected(result.pieceId);};
 const reset=()=>{if(custom)game.reset();else session.reset();setHint(null);setMessage('');};
 return <main className="shell"><header className="top"><button onClick={onBack}>← Levels</button><h1>🟠 {state.level.title}</h1></header><section className="play-card">
 <div className="board-wrap"><div className="board" ref={board} aria-label="GravityBuilder board"><svg className="board-svg" viewBox="0 0 360 240" aria-hidden="true">
  <line x1="0" y1={state.level.floor} x2="360" y2={state.level.floor} stroke="#687996" strokeWidth="4"/>
  {state.level.gateX!==undefined&&!state.physics?.gateOpen&&<line x1={state.level.gateX} y1={state.level.floor-70} x2={state.level.gateX} y2={state.level.floor} stroke="#b45309" strokeWidth="7"/>}
  <rect x={state.level.spawn.x-10} y={state.level.spawn.y-20} width="20" height="12" rx="3" fill="#7587a5"/>
  <circle cx={state.level.goal.x} cy={state.level.goal.y} r={state.level.goal.r} fill="#86efac" fillOpacity=".6" stroke="#15803d" strokeWidth="2"/>
  <path d={`M${state.level.goal.x-10} ${state.level.goal.y+5} l3 9 h14 l3 -9`} fill="none" stroke="#15803d" strokeWidth="3"/>
  {state.ghost.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2" fill="#94a3b8"/>)}
  {state.level.zones.map(z=><circle key={z.id} cx={z.x} cy={z.y} r="20" fill="#fff8" stroke={hint?.pegId===z.id?'#7c3aed':'#99aacc'} strokeWidth={hint?.pegId===z.id?3:1} strokeDasharray="4 3"/>)}
  {hintZone&&hintPiece&&<g transform={`translate(${hintZone.x} ${hintZone.y})`} opacity="0.65">{hintPiece.kind.startsWith('ramp')?<line x1="-40" y1={hintPiece.kind==='ramp-right'?-20:20} x2="40" y2={hintPiece.kind==='ramp-right'?20:-20} stroke="#7c3aed" strokeWidth="4" strokeDasharray="5 4"/>:<rect x="-20" y="-8" width="40" height="16" rx="5" fill="none" stroke="#7c3aed" strokeWidth="3" strokeDasharray="5 4"/>}</g>}
  {Object.entries(state.placed).map(([id,z])=>{const p=state.level.inventory.find(x=>x.id===id)!,zone=state.level.zones.find(x=>x.id===z)!;return <g key={id} transform={`translate(${zone.x} ${zone.y})`}>{p.kind.startsWith('ramp')?<line x1="-40" y1={p.kind==='ramp-right'?-20:20} x2="40" y2={p.kind==='ramp-right'?20:-20} stroke="#3159b2" strokeWidth="7" strokeLinecap="round"/>:p.kind==='trampoline'?<><line x1="-28" y1="0" x2="28" y2="0" stroke="#db6c2c" strokeWidth="8"/><path d="M-18 4 l6 10 6 -10 6 10 6 -10 6 10" fill="none" stroke="#b45309" strokeWidth="2"/></>:p.kind==='fan'?<><rect x="-20" y="-7" width="40" height="14" rx="6" fill="#5b7bbd"/><path d="M0 -12 v-35 M-8 -38 l8 -10 8 10" fill="none" stroke="#5b7bbd" strokeWidth="3"/></>:<><rect x="-47" y="-6" width="24" height="6" rx="3" fill="#eab308"/><text x="0" y="-8" fontSize="16">🔘</text></>}</g>})}
  <circle cx={state.physics?.x??state.level.spawn.x} cy={state.physics?.y??state.level.spawn.y} r="6" fill="#ef644f" stroke="#8f2d26" strokeWidth="1"/>
 </svg>{state.level.zones.map(z=><button key={z.id} className="peg-hit" style={{left:`${z.x/360*100}%`,top:`${z.y/240*100}%`}} aria-label={`Snap zone ${z.id}`} disabled={state.mode!=='edit'} onClick={()=>selected&&place(selected,z.id)}/>)}
 <TutorialHandOverlay visible={state.level.id==='roll-down'&&state.mode==='edit'&&!Object.keys(state.placed).length} from={{x:state.level.zones[0].x/360*100,y:state.level.zones[0].y/240*100}}/>
 </div><p className="board-note" aria-live="polite">{state.mode==='running'?'Watch the ball!':state.mode==='complete'?'The ball reached the goal!':state.ghost.length?'Follow the dotted trail and try another spot.':'Drag a piece to a dotted spot, or select it and tap a spot.'}</p></div>
 <div className="inventory" aria-label="Pieces">{state.level.inventory.map(p=><button key={p.id} disabled={state.mode!=='edit'} className={`${selected===p.id?'selected':''} ${hint?.pieceId===p.id?'hint-piece':''}`} aria-pressed={selected===p.id} onPointerDown={e=>{setSelected(p.id);e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={e=>onDrop(e,p.id)} onClick={()=>setSelected(p.id)}>{icon[p.kind]} {label[p.kind]}</button>)}</div>
 <div className="actions"><button onClick={reset}>↻ Reset</button><button disabled={state.mode!=='edit'} onClick={()=>game.undo()}>↶ Undo</button><button disabled={state.mode!=='edit'} onClick={()=>ask(1)}>💡 Hint 1</button><button disabled={state.mode!=='edit'} onClick={()=>ask(2)}>✨ Hint 2</button>{state.mode==='edit'?<button onClick={()=>{setHint(null);game.launch();}}>▶ Launch</button>:<button onClick={()=>game.retry()}>✎ Edit / Retry</button>}</div>
 {state.mode==='complete'&&<div className="success" role="status">🎉 You made it! {session.saveWarning}</div>}{message&&<p className="feedback" role="status">{message}</p>}</section></main>;
}
