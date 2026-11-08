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
const start=()=>vi.advanceTimersByTime(0);
const fail=(u:SpeechSynthesisUtterance,error:string)=>u.onerror?.({error} as SpeechSynthesisErrorEvent);
describe('Chrome speech recovery',()=>{
 it('queues after cancellation and prefers a local voice',()=>{
  soundEngine.speak('Read the question');expect(spoken).toHaveLength(0);expect(soundEngine.isSpeaking()).toBe(true);start();
  expect(spoken[0].text).toBe('Read the question');expect(spoken[0].voice).toBe(local);
 });
 it('resumes a paused speech service',()=>{
  synth.paused=true;soundEngine.speak('Hello');start();expect(synth.resume).toHaveBeenCalledOnce();
 });
 it('retries a failed selected voice with the default device voice',()=>{
  soundEngine.speak('Question');start();fail(spoken[0],'synthesis-failed');vi.advanceTimersByTime(80);
  expect(spoken).toHaveLength(2);expect(spoken[1].voice).toBeUndefined();expect(spoken[1].text).toBe('Question');
 });
 it('does not let stale cancellation errors restart old narration',()=>{
  soundEngine.speak('Home');start();const old=spoken[0];soundEngine.speak('Question');start();fail(old,'interrupted');vi.advanceTimersByTime(100);
  expect(spoken.map(u=>u.text)).toEqual(['Home','Question']);
 });
 it('recovers from a voice that never starts and reports persistent failure',()=>{
  const notice=vi.fn();window.addEventListener('learning-quest:speech-status',notice);
  const done=vi.fn();soundEngine.speak('Question',done);start();vi.advanceTimersByTime(5080);expect(spoken).toHaveLength(2);
  vi.advanceTimersByTime(5000);expect(synth.cancel).toHaveBeenCalledTimes(3);expect(done).toHaveBeenCalledOnce();expect(notice).toHaveBeenCalled();expect((notice.mock.calls.at(-1)![0] as CustomEvent).detail).toContain('could not play');
  window.removeEventListener('learning-quest:speech-status',notice);
 });
 it('keeps multilingual parts in order and cancels pending speech on exit',()=>{
  const done=vi.fn();soundEngine.speakParts([{text:'Question'},{text:'Answer',lang:'hi-IN',roman:'answer'}],done);start();spoken[0].onend?.(new Event('end') as SpeechSynthesisEvent);start();
  expect(spoken.map(u=>u.text)).toEqual(['Question','answer']);soundEngine.stopSpeech();fail(spoken[1],'canceled');vi.advanceTimersByTime(10000);expect(done).not.toHaveBeenCalled();expect(spoken).toHaveLength(2);
 });
 it('honors mute and allows a later speaker-button request after Chrome blocks autoplay',()=>{
  const notice=vi.fn();window.addEventListener('learning-quest:speech-status',notice);
  soundEngine.speak('Automatic greeting');start();fail(spoken[0],'not-allowed');expect((notice.mock.calls.at(-1)![0] as CustomEvent).detail).toContain('Tap the blue speaker');
  soundEngine.speak('Question');start();spoken[1].onstart?.(new Event('start') as SpeechSynthesisEvent);expect((notice.mock.calls.at(-1)![0] as CustomEvent).detail).toBe('');
  soundEngine.setMuted(true);soundEngine.speak('Muted');vi.advanceTimersByTime(10000);expect(spoken).toHaveLength(2);
  window.removeEventListener('learning-quest:speech-status',notice);
 });
});
