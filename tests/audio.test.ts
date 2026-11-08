// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { soundEngine } from '../src/utils/audio';
let spoken: SpeechSynthesisUtterance[];
let synth: { speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>; resume: ReturnType<typeof vi.fn>; getVoices: ReturnType<typeof vi.fn>; paused: boolean; speaking: boolean; pending: boolean };
const local = { name:'Samantha',lang:'en-US',localService:true };
const remote = { name:'Google US English',lang:'en-US',localService:false };
beforeEach(()=>{
 vi.useFakeTimers();spoken=[];
 synth={speak:vi.fn(u=>spoken.push(u)),cancel:vi.fn(),resume:vi.fn(),getVoices:vi.fn(()=>[remote,local]),paused:false,speaking:false,pending:false};
 vi.stubGlobal('speechSynthesis',synth);
 vi.stubGlobal('SpeechSynthesisUtterance', class {text:string;constructor(text:string){this.text=text;}});
 soundEngine.setMuted(false);
});
afterEach(()=>{soundEngine.stopSpeech();vi.useRealTimers();vi.unstubAllGlobals();});
const fail=(u:SpeechSynthesisUtterance,error:string)=>u.onerror?.({error} as SpeechSynthesisErrorEvent);
describe('restored direct speech',()=>{
 it('calls speech synchronously, without waiting for a timer, using the earlier voice-selection order',()=>{
  soundEngine.speak('Read the question');
  expect(spoken).toHaveLength(1);expect(spoken[0].text).toBe('Read the question');expect(spoken[0].voice).toBe(remote);
  expect(vi.getTimerCount()).toBe(0);
 });
 it('keeps a click-authorized request inside the synchronous gesture',()=>{
  let gesture=false;
  synth.speak.mockImplementation(u=>{if(!gesture)fail(u,'not-allowed');else spoken.push(u);});
  gesture=true;soundEngine.speak('Question');gesture=false;
  expect(spoken.map(u=>u.text)).toEqual(['Question']);
  vi.runAllTimers();expect(spoken).toHaveLength(1);
 });
 it('resumes a paused speech service directly',()=>{
  synth.paused=true;soundEngine.speak('Hello');expect(synth.resume).toHaveBeenCalledOnce();expect(spoken).toHaveLength(1);
 });
 it('does not schedule automatic retries after a failure',()=>{
  const done=vi.fn();soundEngine.speak('Question',done);fail(spoken[0],'synthesis-failed');vi.advanceTimersByTime(10000);
  expect(spoken).toHaveLength(1);expect(done).toHaveBeenCalledOnce();
 });
 it('ignores errors and cleanup from an older request',()=>{
  const stopOld=soundEngine.speak('Home');const old=spoken[0];soundEngine.speak('Question');const cancels=synth.cancel.mock.calls.length;
  stopOld();fail(old,'interrupted');vi.runAllTimers();
  expect(synth.cancel).toHaveBeenCalledTimes(cancels);expect(spoken.map(u=>u.text)).toEqual(['Home','Question']);
 });
 it('keeps multilingual parts in order and honors mute',()=>{
  const done=vi.fn();soundEngine.speakParts([{text:'Question'},{text:'Answer',lang:'hi-IN',roman:'answer'}],done);
  spoken[0].onend?.(new Event('end') as SpeechSynthesisEvent);expect(spoken.map(u=>u.text)).toEqual(['Question','answer']);
  spoken[1].onend?.(new Event('end') as SpeechSynthesisEvent);expect(done).toHaveBeenCalledOnce();
  soundEngine.setMuted(true);soundEngine.speak('Muted');expect(spoken).toHaveLength(2);
 });
 it('reports a real error and clears it when the next click starts speaking',()=>{
  const notice=vi.fn();window.addEventListener('learning-quest:speech-status',notice);
  soundEngine.speak('Question');fail(spoken[0],'not-allowed');expect((notice.mock.calls.at(-1)![0] as CustomEvent).detail).toContain('browser blocked speech');
  soundEngine.speak('Question');spoken[1].onstart?.(new Event('start') as SpeechSynthesisEvent);expect((notice.mock.calls.at(-1)![0] as CustomEvent).detail).toBe('');
  window.removeEventListener('learning-quest:speech-status',notice);
 });
});
