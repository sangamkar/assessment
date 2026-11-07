import React, { useEffect, useRef, useState } from 'react';
import { CROPS, emptyGarden, gardenAction, gardenOrder } from '../../games/garden';
import type { Crop, GardenAction } from '../../games/garden';
import type { AppState } from '../../engine/progress';
import { recordGame } from '../../engine/progress';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import './garden.css';

const icons: Record<Crop, string> = { carrot: '🥕', tomato: '🍅', corn: '🌽' };
const names: Record<Crop, string> = { carrot: 'carrots', tomato: 'tomatoes', corn: 'ears of corn' };
const friends = ['Bunny', 'Fox', 'Bear'];
const faces = ['🐰', '🦊', '🐻'];
export function GardenKitchen({ state, update, onExit }: { state: AppState; update: (fn: (s: AppState) => AppState) => void; onExit: () => void }) {
  const garden = state.garden ?? emptyGarden();
  const [message, setMessage] = useState('Tap soil to plant. Tap a sprout to water. Tap a vegetable to pick!');
  const visited = useRef<Set<number> | null>(null);
  const target = gardenOrder(garden.order);
  const orderWords = CROPS.filter(c => target[c]).map(c => `${target[c]} ${names[c]}`).join(' and ');
  const mission = garden.free ? 'Your garden. Grow and pick anything you like.' : garden.delivered ? `Lunch is ready! You grew ${orderWords}.` : `${friends[garden.order % 3]} needs ${orderWords} for lunch.`;
  useEffect(() => { soundEngine.speak(mission); return () => soundEngine.stopSpeech(); }, [mission]);
  useEffect(() => {
    const stop = () => { visited.current = null; };
    window.addEventListener('pointerup', stop); window.addEventListener('pointercancel', stop);
    return () => { window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); };
  }, []);
  const act = (action: GardenAction) => {
    update(s => {
      const previous = s.garden ?? emptyGarden();
      const next = gardenAction(previous, action);
      const delivered = !previous.delivered && next.delivered;
      const recorded = delivered ? recordGame(s, 'garden-kitchen', next.hints || next.corrections ? 'assisted' : 'win', Date.now(), {
        prompt: `Harvest ${CROPS.filter(c => gardenOrder(previous.order)[c]).map(c => `${gardenOrder(previous.order)[c]} ${names[c]}`).join(' and ')}`,
        answer: CROPS.map(c => `${next.basket[c]} ${names[c]}`).join(', '), hints: next.hints,
        mistakes: next.corrections ? [`Removed ${next.corrections} vegetables from the basket while adjusting quantities.`] : [],
      }) : s;
      return { ...recorded, garden: next, lastGame: 'garden-kitchen' };
    });
  };
  const touchPlot = (index: number) => {
    if (visited.current?.has(index)) return;
    visited.current?.add(index);
    const plot = garden.plots[index];
    setMessage(!plot ? `Planted ${garden.selected}. Now add water!` : !plot.grown ? `It grew! Pick your ${plot.crop}.` : garden.basket[plot.crop] >= 12 ? 'Your basket is full. Tap a vegetable below to put one back.' : `Picked one ${plot.crop}. Count your basket!`);
    act({ type: 'plot', index });
  };
  const hint = () => {
    act({ type: 'hint' });
    const extra = CROPS.find(c => garden.basket[c] > target[c]);
    const needed = CROPS.find(c => garden.basket[c] < target[c]);
    const text = extra ? `Tap ${names[extra]} in the basket to put one back.` : needed ? `We need ${target[needed] - garden.basket[needed]} more ${names[needed]}. Pick a ripe one, or plant and water one.` : 'Try planting a different vegetable.';
    setMessage(text); soundEngine.speak(text);
  };
  return <main className="garden-page">
    <header className="garden-header"><button className="growth-secondary" aria-label="Leave garden" onClick={onExit}>← Games</button><h1 className="font-kid text-2xl font-bold">Garden Kitchen</h1><button className="growth-secondary" onClick={() => act({ type: 'mode' })}>{garden.free ? 'Lunch missions' : 'Free play'}</button></header>
    <section className="garden-mission" aria-label="Lunch order">
      <span className="garden-friend" aria-hidden>{faces[garden.order % 3]}</span>
      <div><p className="growth-eyebrow">{garden.free ? 'Make something grow' : garden.delivered ? 'Lunch delivered' : 'A hungry friend'}</p><h2 className="font-kid text-xl font-bold">{mission}</h2>
      {!garden.free && <div className="garden-order">{CROPS.filter(c => target[c]).map(c => <span key={c} aria-label={`${target[c]} ${names[c]}`}>{Array.from({ length: target[c] }, (_, i) => <span key={i} aria-hidden>{icons[c]}</span>)}</span>)}</div>}</div><SpeakButton text={mission} label="Hear the lunch order" />
    </section>
    <section className="garden-world" aria-label="Vegetable garden">
      <div className="garden-sky" aria-hidden><span>☁</span><span className="garden-sign">Plant · Water · Pick</span><span>☀</span></div>
      <div className="garden-plots" onPointerMove={e => {
        if (!visited.current) return;
        const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-plot]');
        if (target) touchPlot(Number(target.getAttribute('data-plot')));
      }}>
        {garden.plots.map((plot, i) => <button key={i} data-plot={i} className={`garden-plot ${plot?.grown ? 'garden-ripe' : ''}`} disabled={garden.delivered && !garden.free}
          aria-label={`Plot ${i + 1}: ${!plot ? `plant ${garden.selected}` : !plot.grown ? `water ${plot.crop}` : `pick ${plot.crop}`}`}
          onPointerDown={e => { if (e.button !== 0) return; e.preventDefault(); visited.current = new Set(); touchPlot(i); }}
          onClick={e => { if (e.detail === 0) touchPlot(i); }}>
          <svg viewBox="0 0 160 120" aria-hidden><ellipse cx="80" cy="91" rx="70" ry="23" fill="#79513e"/><ellipse cx="80" cy="86" rx="65" ry="20" fill="#97664a"/>{[40,65,95,120].map(x=><path key={x} d={`M${x} 84l5 5`} stroke="#bf9270" strokeWidth="3" strokeLinecap="round"/>)}
          {plot && !plot.grown && <g><path d="M80 82V49" stroke="#416f31" strokeWidth="6"/><path d="M80 66Q44 66 48 39Q77 36 80 66M81 58Q108 58 113 32Q84 28 81 58" fill="#72b64c"/></g>}
          {plot?.grown && <text x="80" y="82" textAnchor="middle" fontSize="68">{icons[plot.crop]}</text>}
          {!plot && <path d="M73 66h14m-7-7v14" stroke="#f2d6aa" strokeWidth="3" strokeLinecap="round"/>}</svg>
          <span className="garden-plot-action">{!plot ? 'Plant' : !plot.grown ? '💧 Water' : '🧺 Pick'}</span>
        </button>)}
      </div>
      <div className="garden-seeds" role="group" aria-label="Choose a seed">{CROPS.map(c => <button key={c} className={garden.selected === c ? 'garden-seed selected' : 'garden-seed'} aria-pressed={garden.selected === c} onClick={() => act({ type: 'select', crop: c })}><span aria-hidden>{icons[c]}</span><span>{c}</span></button>)}</div>
    </section>
    <section className="garden-basket" aria-label="Harvest basket"><h2 className="font-kid text-xl font-bold">🧺 Your basket</h2><div className="garden-basket-items">{CROPS.map(c => <button key={c} disabled={!garden.basket[c] || (garden.delivered && !garden.free)} aria-label={`${garden.basket[c]} ${names[c]}. Put one back`} onClick={() => act({ type: 'remove', crop: c })}><span aria-hidden>{icons[c]}</span><strong>{garden.basket[c]}</strong>{!garden.free && <small> / {target[c]}</small>}</button>)}</div><p className="text-sm">{garden.delivered && !garden.free ? 'Your friend has exactly enough!' : 'Too many? Tap a basket vegetable to put one back.'}</p></section>
    <p role="status" className="garden-feedback">{garden.delivered && !garden.free ? 'Lunch is ready! Your next friend can visit when you are ready.' : message}</p>
    <div className="flex flex-wrap gap-3">{garden.delivered && !garden.free ? <button className="growth-primary" onClick={() => act({ type: 'next' })}>Next hungry friend →</button> : !garden.free && <button className="growth-secondary" onClick={hint}>Give me a hint</button>}<SpeakButton text={message} label="Hear what to do" /></div>
    <p className="mt-4 text-xs text-slate-500">Tap or swipe across plots. This pretend garden grows straight away. Your garden saves on this device.</p>
  </main>;
}
