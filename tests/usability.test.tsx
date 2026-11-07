// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyState } from '../src/engine/progress';
import { StickerBook } from '../src/ui/StickerBook';
import { Home } from '../src/ui/Home';
import { Parent } from '../src/ui/Parent';
import { soundEngine } from '../src/utils/audio';
vi.mock('../src/utils/audio', () => ({ soundEngine: { speak: vi.fn(), stopSpeech: vi.fn(), speakParts: vi.fn(), playCorrectChime: vi.fn() } }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
let dispose = () => {};
afterEach(() => { act(dispose); document.body.innerHTML = ''; vi.clearAllMocks(); });
function mount(ui: React.ReactNode) {
 const host=document.createElement('div');document.body.appendChild(host);const root=createRoot(host);
 act(()=>root.render(ui));dispose=()=>root.unmount();return host;
}
function click(host: HTMLElement, label: string) {
 const button=Array.from(host.querySelectorAll('button')).find(b=>b.getAttribute('aria-label')===label||b.textContent===label);
 expect(button, label).toBeDefined();act(()=>button!.click());
}
describe('independent use',()=>{
 it('asks before buying; cancellation preserves stars and confirmation spends only once',()=>{
  let state={...emptyState(),stars:50};let host:HTMLElement;
  const rootHost=document.createElement('div');document.body.appendChild(rootHost);const root=createRoot(rootHost);dispose=()=>root.unmount();host=rootHost;
  const render=()=>root.render(<StickerBook state={state} update={fn=>{state=fn(state);render();}} onBack={()=>{}}/>);
  act(render);click(host,'Rocket: 45 stars');expect(state.engagement?.spent).toBeUndefined();expect(host.querySelector('dialog')?.hasAttribute('open')).toBe(true);
  click(host,'No, go back');expect(state.stars).toBe(50);expect(state.engagement?.spent).toBeUndefined();
  click(host,'Rocket: 45 stars');vi.mocked(soundEngine.stopSpeech).mockClear();click(host,'Yes, buy sticker');expect(soundEngine.stopSpeech).not.toHaveBeenCalled();expect(state.engagement?.spent).toBe(45);expect(state.engagement?.stickers).toContain('rocket');expect(host.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  expect(host.textContent).toContain('You got the Rocket sticker!');
 });
 it('speaks personalized guidance and explains locked cards without opening games',()=>{
  const games=vi.fn(),explore=vi.fn();const state={...emptyState(),profile:{name:'Aarav',avatar:'🦁',createdAt:1}};
  const host=mount(<Home state={state} onQuest={()=>{}} onGames={games} onExplore={explore} onIsland={()=>{}} onGrownUps={()=>{}}/>);
  expect(soundEngine.speak).toHaveBeenCalledWith(expect.stringContaining('Hi Aarav!'));
  expect(host.textContent).toContain('Learn today to get your first');expect(host.querySelector('[aria-label="This week"]')).toBeNull();
  click(host,'Brain Games: open after today’s learning');click(host,'Build and Explore: open after today’s learning');expect(games).not.toHaveBeenCalled();expect(explore).not.toHaveBeenCalled();
  expect(soundEngine.speak).toHaveBeenCalledWith('Learning first, then games!');
  click(host,'Hear Brain Games');expect(games).not.toHaveBeenCalled();expect(host.querySelector('button button')).toBeNull();
 });
 it('keeps settings, skill map and airport designs reachable through four groups',()=>{
  const host=mount(<Parent state={emptyState()} setState={()=>{}} onClose={()=>{}} onStartCheckup={()=>{}} onStartPlacement={()=>{}} onStartMock={()=>{}} onPractice={()=>{}} onStartingPoint={()=>{}}/>);
  const select=host.querySelector('select')!;expect(Array.from(select.options).map(o=>o.text)).toEqual(['Today','Progress','Readiness','Settings']);
  act(()=>{select.value='Progress';select.dispatchEvent(new Event('change',{bubbles:true}));});expect(host.textContent).toContain('Airport designs');expect(host.textContent).not.toContain('Screen-time progress');
  act(()=>{select.value='Readiness';select.dispatchEvent(new Event('change',{bubbles:true}));});expect(host.textContent).toContain('Skill map');expect(host.textContent).toContain('Check-ups');
  act(()=>{select.value='Settings';select.dispatchEvent(new Event('change',{bubbles:true}));});expect(host.textContent).toContain('Daily routine');
 });
});
