// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SpeakButton } from '../src/ui/SpeakButton';
import { AudioGuide } from '../src/ui/AudioGuide';
import { Player } from '../src/ui/Player';
import { getSkill } from '../src/content';
import { soundEngine } from '../src/utils/audio';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let active: SpeechSynthesisUtterance | null;
let root: ReturnType<typeof createRoot>;
let host: HTMLDivElement;
let spoken: SpeechSynthesisUtterance[];
beforeEach(() => {
 vi.stubGlobal('ResizeObserver', class {observe(){} unobserve(){} disconnect(){}});
 vi.useFakeTimers(); active=null; spoken=[];
 vi.stubGlobal('speechSynthesis',{speak:vi.fn(u=>{active=u;spoken.push(u);}),cancel:vi.fn(()=>{active=null;}),resume:vi.fn(),getVoices:()=>[],paused:false,speaking:false,pending:false});
 vi.stubGlobal('SpeechSynthesisUtterance',class {text:string;constructor(text:string){this.text=text;}});
 host=document.createElement('div');document.body.appendChild(host);root=createRoot(host);soundEngine.setMuted(false);
});
afterEach(()=>{act(()=>root.unmount());soundEngine.stopSpeech();vi.useRealTimers();vi.unstubAllGlobals();host.remove();});
// Use the first authored skill with a real intro/item so the route behaves like the app.
const selected=getSkill('m2.shapes')!;
const step={skill:selected,item:selected.items![0],role:'focus' as const};
function Study({intro=false}:{intro?:boolean}){
 return <Player locale="en-US" mode="quest" title="Today’s learning" color="#123456" total={1} first={step} getNext={()=>null} introSeen={()=>!intro} onIntroDone={()=>{}} onAnswer={()=>{}} onFinish={()=>{}} onExit={()=>{}} />;
}
describe('narration lifecycle',()=>{
 it('does not autoplay guidance on load and speaks directly when its button is clicked',()=>{
  act(()=>root.render(<AudioGuide text="Home guidance"/>));vi.runAllTimers();expect(spoken).toHaveLength(0);
  let gesture=false;
  vi.mocked(window.speechSynthesis.speak).mockImplementation(u=>{expect(gesture).toBe(true);active=u;spoken.push(u);});
  act(()=>{gesture=true;host.querySelector('button')!.click();gesture=false;});
  expect(active?.text).toBe('Home guidance');expect(spoken).toHaveLength(1);
 });
 it('reads the question after moving from Home to the Player',()=>{
  act(()=>root.render(<AudioGuide text="Home guidance"/>));act(()=>host.querySelector("button")!.click());act(()=>vi.advanceTimersByTime(0));
  act(()=>root.render(<Study/>));act(()=>vi.advanceTimersByTime(0));
  expect(active?.text).toBe(step.item.say);
 });
 it('reads the question after leaving its skill intro',()=>{
  act(()=>root.render(<Study intro/>));act(()=>vi.advanceTimersByTime(0));
  const next=Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.includes('Let’s practice'))!;
  expect(next).toBeTruthy();act(()=>next.click());act(()=>vi.advanceTimersByTime(0));expect(active?.text).toBe(step.item.say);
 });
 it('does not let an old guidance cleanup cancel newer question speech',()=>{
  act(()=>root.render(<AudioGuide text="Home guidance"/>));act(()=>host.querySelector("button")!.click());act(()=>vi.advanceTimersByTime(0));
  act(()=>soundEngine.speak('A new question'));act(()=>vi.advanceTimersByTime(0));
  act(()=>root.render(<div/>));
  expect(active?.text).toBe('A new question');
 });
 it('stops manual replay on exit without stopping a newer request',()=>{
  act(()=>root.render(<SpeakButton text="Replay this question"/>));
  act(()=>host.querySelector('button')!.click());act(()=>vi.advanceTimersByTime(0));expect(active?.text).toBe('Replay this question');
  act(()=>root.render(<div/>));expect(active).toBeNull();
  act(()=>root.render(<SpeakButton text="Old replay"/>));act(()=>host.querySelector('button')!.click());act(()=>vi.advanceTimersByTime(0));
  act(()=>soundEngine.speak('New question'));act(()=>vi.advanceTimersByTime(0));act(()=>root.render(<div/>));expect(active?.text).toBe('New question');
 });
});
