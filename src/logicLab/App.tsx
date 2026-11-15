import { useEffect, useMemo, useRef, useState } from 'react';
import { browserStorage, ProgressStore } from './core/progress';
import { GameSession } from './core/session';
import type { DifficultyTier, Hint } from './core/types';
import { GEAR_WORKS } from './games/gearworks';
import { GearWorks } from './games/gearworks/module';
import { GearBoard } from './games/gearworks/GearBoard';
import type { GearState } from './games/gearworks/types';
import raw from './games/gearworks/levels.json';
import gravityRaw from './games/gravitybuilder/levels.json';
import { GRAVITY_BUILDER } from './games/gravitybuilder';
import { GravityBuilder } from './games/gravitybuilder/module';
import { GravityScreen } from './games/gravitybuilder/GravityScreen';

export function App(){
  const store=useMemo(()=>new ProgressStore(browserStorage()),[]);
  const session=useRef(new GameSession([GEAR_WORKS, GRAVITY_BUILDER],store));
  const [gravityGame,setGravityGame]=useState<GravityBuilder|null>(null);
  const [editorKind,setEditorKind]=useState<'gearworks'|'gravitybuilder'>('gearworks');
  const [game,setGame]=useState<GearWorks|null>(null),[state,setState]=useState<GearState|null>(null);
  const [selected,setSelected]=useState<string|null>(null),[firstPeg,setFirstPeg]=useState<string|null>(null),[hint,setHint]=useState<Hint|null>(null);
  const [muted,setMuted]=useState(false),[message,setMessage]=useState(''),[editor,setEditor]=useState(false),[json,setJson]=useState(()=>JSON.stringify(raw[0],null,2)),[custom,setCustom]=useState(false);
  useEffect(()=>()=>session.current.dispose(),[]);
  useEffect(()=>{if(!game)return;setState(game.getState());return game.subscribe(()=>setState(game.getState()));},[game]);
  const open=(id:string)=>{try{const next=session.current.start('gearworks',id) as GearWorks;setCustom(false);setGame(next);setState(next.getState());setSelected(next.getState().level.inventory[0]?.id??null);setFirstPeg(null);setHint(null);setMessage('');}catch(e){setMessage((e as Error).message);}};
  const openGravity=(id:string)=>{try{const next=session.current.start('gravitybuilder',id) as GravityBuilder;setCustom(false);setGravityGame(next);setMessage('');}catch(e){setMessage((e as Error).message);}};
  const tryJson=()=>{try{const data:unknown=JSON.parse(json);if(editorKind==='gravitybuilder'){const next=new GravityBuilder();next.loadLevel(data);session.current.dispose();setCustom(true);setGravityGame(next);setEditor(false);setMessage('');return;}const next=new GearWorks();next.loadLevel(data);session.current.dispose();setCustom(true);setGame(next);setState(next.getState());setSelected(next.getState().level.inventory[0]?.id??null);setFirstPeg(null);setHint(null);setEditor(false);setMessage('');}catch(e){setMessage((e as Error).message);}};
  const download=()=>{try{const data:unknown=JSON.parse(json);(editorKind==='gearworks'?new GearWorks():new GravityBuilder()).loadLevel(data);const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${editorKind}-level.json`;a.click();URL.revokeObjectURL(url);setMessage('Level exported.');}catch(e){setMessage((e as Error).message);}};
  const tapPeg=(id:string)=>{if(!game||!selected||!state)return;const belt=state.level.belts.find(b=>b.id===selected);if(belt){if(!firstPeg){setFirstPeg(id);return;}const ok=game.connect(selected,firstPeg,id);setFirstPeg(null);setMessage(ok?'':'Choose two different pegs with gears.');}else{const ok=game.place(selected,id);setMessage(ok?'':'Choose an empty peg.');}setHint(null);};
  const askHint=(tier:1|2)=>{if(!game)return;const result=custom?game.getHint(tier):session.current.hint(tier);setHint(result);if(result)setSelected(result.pieceId);setFirstPeg(null);};
  const reset=()=>{if(custom)game?.reset();else session.current.reset();setHint(null);setFirstPeg(null);setMessage('');};
  const goHome=()=>{session.current.dispose();setGravityGame(null);setGame(null);setState(null);setHint(null);setMessage('');};
  if(gravityGame)return <GravityScreen key={gravityGame.getState().level.id} game={gravityGame} session={session.current} custom={custom} onBack={goHome}/>;
  if(game&&state)return <main className="shell"><header className="top"><button onClick={goHome}>← Levels</button><h1>⚙️ {state.level.title}</h1><button onClick={()=>setMuted(!muted)} aria-pressed={muted}>{muted?'🔇 Sound off':'🔊 Sound on'}</button></header>
    <section className="play-card"><GearBoard state={state} onPeg={tapPeg} hint={hint} muted={muted} tutorial={state.level.id==='first-link'&&Object.keys(state.placed).length===0}/>
      <div className="inventory" aria-label="Pieces">{state.level.inventory.map(piece=><button key={piece.id} className={`${selected===piece.id?'selected':''} ${hint?.pieceId===piece.id?'hint-piece':''}`} onClick={()=>{setSelected(piece.id);setFirstPeg(null);}} aria-pressed={selected===piece.id}>⚙️ {piece.teeth} teeth</button>)}{state.level.belts.map(belt=><button key={belt.id} className={`${selected===belt.id?'selected':''} ${hint?.pieceId===belt.id?'hint-piece':''}`} onClick={()=>{setSelected(belt.id);setFirstPeg(null);}} aria-pressed={selected===belt.id}>➰ Belt {state.belts.some(b=>b.id===belt.id)?'✓':''}</button>)}</div>
      {firstPeg&&<p className="feedback">Now tap the other gear.</p>}<div className="actions"><button onClick={reset}>↻ Reset</button><button onClick={()=>{game.undo();setHint(null);setFirstPeg(null);}}>↶ Undo</button><button onClick={()=>askHint(1)}>💡 Hint 1</button><button onClick={()=>askHint(2)}>✨ Hint 2</button></div>
      {state.complete&&<div className="success" role="status">🎉 All gears are turning! {session.current.saveWarning&&<span>{session.current.saveWarning}</span>}</div>}{message&&<p className="feedback" role="status">{message}</p>}
    </section></main>;
  return <main className="shell"><header className="hero"><div><span className="eyebrow">A LITTLE LOGIC LAB</span><h1>Make things move.</h1><p>Choose a GearWorks puzzle and connect the gears.</p></div><span className="hero-icon" aria-hidden="true">⚙️</span></header>
    <section><div className="section-title"><div><span className="eyebrow">YOUR WORKSHOP</span><h2>⚙️ GearWorks</h2></div><button onClick={()=>{setEditor(!editor||editorKind!=='gearworks');setEditorKind('gearworks');setJson(JSON.stringify(raw[0],null,2));setMessage('');}}>{editor&&editorKind==='gearworks'?'Close editor':'Level editor'}</button></div>
      {(['Starter','Explorer','Master'] as DifficultyTier[]).map(tier=><section className="tier" key={tier}><h3>{tier}</h3><div className="levels">{GEAR_WORKS.levels.filter(l=>l.tier===tier).map((level,i)=>{const p=store.get('gearworks',level.id);return <button key={level.id} className="level" onClick={()=>open(level.id)}><span className="level-num">{i+1}</span><strong>{level.title}</strong><span>{p.completed?`✓ ${'★'.repeat(p.stars)}`:'Ready to explore'}</span></button>})}{!GEAR_WORKS.levels.some(l=>l.tier===tier)&&<p className="empty">More puzzles coming soon.</p>}</div></section>)}
    </section><section><div className="section-title"><div><span className="eyebrow">BUILD AND TEST</span><h2>🟠 GravityBuilder</h2></div><button onClick={()=>{setEditor(!editor||editorKind!=='gravitybuilder');setEditorKind('gravitybuilder');setJson(JSON.stringify(gravityRaw[0],null,2));setMessage('');}}>{editor&&editorKind==='gravitybuilder'?'Close editor':'Level editor'}</button></div>
      {(['Starter','Explorer','Master'] as DifficultyTier[]).map(tier=><section className="tier" key={tier}><h3>{tier}</h3><div className="levels">{GRAVITY_BUILDER.levels.filter(l=>l.tier===tier).map((level,i)=>{const p=store.get('gravitybuilder',level.id);return <button key={level.id} className="level" onClick={()=>openGravity(level.id)}><span className="level-num">{i+1}</span><strong>{level.title}</strong><span>{p.completed?`✓ ${'★'.repeat(p.stars)}`:'Ready to explore'}</span></button>})}{!GRAVITY_BUILDER.levels.some(l=>l.tier===tier)&&<p className="empty">More puzzles coming soon.</p>}</div></section>)}
    </section>{editor&&<section className="editor"><h2>Level JSON</h2><p>Edit the level, try it, or export it as JSON. The supplied solution must solve the level.</p><textarea aria-label="Level JSON" value={json} onChange={e=>setJson(e.target.value)} spellCheck={false}/><div className="actions"><button onClick={tryJson}>Try level</button><button onClick={download}>Export JSON</button></div></section>}{(message||store.warning)&&<p role="status">{message||store.warning}</p>}</main>;
}
