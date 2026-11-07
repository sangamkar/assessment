import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { GardenState } from '../src/games/garden';
import { CROPS, emptyGarden, gardenAction, gardenOrder, normalizeGarden } from '../src/games/garden';
import { emptyState, upgradeState, dayKey } from '../src/engine/progress';
import { GardenKitchen } from '../src/ui/games/GardenKitchen';
import { Games } from '../src/ui/games/Games';
import { Home } from '../src/ui/Home';
import { pipeHint, pipePuzzle, rotateMask, traceWater } from '../src/games/workshop';
import type { Level } from '../src/games/brain';

describe('garden missions', () => {
  it('plants, waters, then harvests; only exact complete orders are delivered', () => {
    for (let order = 0; order < 24; order++) {
      let s = { ...emptyGarden(), order };
      const target = gardenOrder(order);
      for (const crop of CROPS) {
        s = gardenAction(s, { type: 'select', crop });
        for (let n = 0; n < target[crop]; n++) {
          s = gardenAction(s, { type: 'plot', index: 0 });
          expect(s.plots[0]).toEqual({ crop, grown: false });
          s = gardenAction(s, { type: 'plot', index: 0 });
          expect(s.plots[0]).toEqual({ crop, grown: true });
          expect(s.delivered).toBe(false);
          s = gardenAction(s, { type: 'plot', index: 0 });
          expect(s.basket[crop]).toBe(n + 1);
        }
      }
      expect(s.delivered).toBe(true);
      expect(s.basket).toEqual(target);
      expect(gardenAction(s, { type: 'plot', index: 1 })).toBe(s);
      s = gardenAction(s, { type: 'next' });
      expect(s.order).toBe(order + 1);
      expect(s.delivered).toBe(false);
      expect(Object.values(s.basket).every(n => n === 0)).toBe(true);
    }
  });
  it('allows correcting extra produce without counting a premature delivery', () => {
    let s: GardenState = { ...emptyGarden(), basket: { carrot: 1, tomato: 1, corn: 0 }, plots: [{ crop: 'carrot' as const, grown: true }, null, null, null, null, null] };
    s = gardenAction(s, { type: 'plot', index: 0 });
    expect(s.delivered).toBe(false);
    s = gardenAction(s, { type: 'remove', crop: 'tomato' });
    expect(s.delivered).toBe(true);
    expect(s.corrections).toBe(1);
  });
  it('free play has no automatic mission completion and preserves the garden', () => {
    let s = gardenAction(emptyGarden(), { type: 'mode' });
    for (let n = 0; n < 6; n++) s = gardenAction(s, { type: 'plot', index: 0 });
    expect(s.basket.carrot).toBe(2);
    expect(s.delivered).toBe(false);
    const back = gardenAction(s, { type: 'mode' });
    expect(back.delivered).toBe(true);
    expect(back.hints).toBeGreaterThan(0);
    expect(back.plots).toEqual(s.plots);
  });
  it('bounds baskets, rejects invalid plots and normalizes damaged saves', () => {
    const s = emptyGarden();
    expect(gardenAction(s, { type: 'plot', index: -1 })).toBe(s);
    expect(gardenAction(s, { type: 'plot', index: 8 })).toBe(s);
    expect(gardenAction(s, { type: 'remove', crop: 'corn' })).toBe(s);
    const bad = normalizeGarden({ plots: [{ crop: 'bad', grown: true }], basket: { carrot: -1, corn: 100 }, order: NaN });
    expect(bad).toEqual(emptyGarden());
    const full = { ...s, free: true, basket: { carrot: 12, tomato: 0, corn: 0 }, plots: [{ crop: 'carrot' as const, grown: true }, null, null, null, null, null] };
    expect(gardenAction(full, { type: 'plot', index: 0 })).toBe(full);
  });
  it('round-trips garden progress through the existing backup format', () => {
    const state = emptyState();
    state.garden = gardenAction(emptyGarden(), { type: 'plot', index: 4 });
    state.lastGame = 'garden-kitchen';
    const result = upgradeState(JSON.parse(JSON.stringify(state)));
    expect(result.ok && result.state.garden).toEqual(state.garden);
    expect(result.ok && result.state.lastGame).toBe('garden-kitchen');
  });
  it('offers accessible plots, seed selection, basket correction and home resume', () => {
    const state = { ...emptyState(), garden: emptyGarden(), lastGame: 'garden-kitchen' as const, questCompletedDay: dayKey(Date.now()) };
    const html = renderToStaticMarkup(<GardenKitchen state={state} update={() => {}} onExit={() => {}} />);
    expect(html.match(/data-plot=/g)).toHaveLength(6);
    expect(html).toContain('Plot 1: plant carrot');
    expect(html).toContain('Choose a seed');
    expect(html).toContain('Put one back');
    expect(html).toContain('Free play');
    expect(renderToStaticMarkup(<Games state={state} onPlay={() => {}} onBack={() => {}} />)).toContain('Continue your garden');
    expect(renderToStaticMarkup(<Home state={state} onResumeGame={() => {}} onQuest={() => {}} onGames={() => {}} onExplore={() => {}} onIsland={() => {}} onGrownUps={() => {}} />)).toContain('Continue playing · Garden Kitchen');
  });
});

describe('progressive pipe rescue hints', () => {
  it('repairs one rotatable route tile at a time and reaches every generated destination', () => {
    for (const level of [1, 2, 3] as Level[]) for (let seed = 0; seed < 150; seed++) {
      const p = pipePuzzle(level, seed), masks = [...p.initial];
      for (let attempts = 0; attempts < p.path.length; attempts++) {
        const hint = pipeHint(p, masks);
        if (!hint) break;
        expect(hint.cell).not.toBe(0);
        expect(hint.cell).not.toBe(masks.length - 1);
        expect(hint.turns).toBeGreaterThan(0);
        expect(hint.turns).toBeLessThan(4);
        masks[hint.cell] = rotateMask(masks[hint.cell], hint.turns);
      }
      expect(traceWater(p.size, masks).ok).toBe(true);
      expect(pipeHint(p, masks)).toBeNull();
    }
  });
});
