export const CROPS = ['carrot', 'tomato', 'corn'] as const;
export type Crop = typeof CROPS[number];
export type Plot = { crop: Crop; grown: boolean } | null;
export type Basket = Record<Crop, number>;
export interface GardenState {
  plots: Plot[];
  basket: Basket;
  selected: Crop;
  order: number;
  delivered: boolean;
  free: boolean;
  hints: number;
  corrections: number;
}
export const emptyBasket = (): Basket => ({ carrot: 0, tomato: 0, corn: 0 });
export const emptyGarden = (): GardenState => ({ plots: Array(6).fill(null), basket: emptyBasket(), selected: 'carrot', order: 0, delivered: false, free: false, hints: 0, corrections: 0 });
export function gardenOrder(order: number): Basket {
  const target = emptyBasket();
  const crop = CROPS[order % 3];
  target[crop] = order < 3 ? 2 + order : 2 + (Math.floor(order / 3) % 3);
  if (order >= 3) target[CROPS[(order + 1) % 3]] = 1 + (order % 2);
  return target;
}
export function basketMatches(basket: Basket, target: Basket) {
  return CROPS.every(crop => basket[crop] === target[crop]);
}
export type GardenAction = { type: 'plot'; index: number } | { type: 'select'; crop: Crop } | { type: 'remove'; crop: Crop } | { type: 'next' } | { type: 'mode' } | { type: 'hint' };
export function gardenAction(state: GardenState, action: GardenAction): GardenState {
  if (action.type === 'select') return { ...state, selected: action.crop };
  if (action.type === 'hint') return { ...state, hints: state.hints + 1 };
  if (action.type === 'mode') return { ...state, free: !state.free, hints: state.hints + 1, delivered: state.delivered || (state.free && basketMatches(state.basket, gardenOrder(state.order))) };
  if (action.type === 'next') return state.delivered ? { ...state, order: state.order + 1, basket: emptyBasket(), delivered: false, hints: 0, corrections: 0 } : state;
  if (state.delivered && !state.free) return state;
  let next: GardenState;
  if (action.type === 'remove') {
    if (!state.basket[action.crop]) return state;
    next = { ...state, basket: { ...state.basket, [action.crop]: state.basket[action.crop] - 1 }, corrections: state.corrections + 1 };
  } else {
    if (!Number.isInteger(action.index) || action.index < 0 || action.index >= 6) return state;
    const plot = state.plots[action.index], plots = [...state.plots], basket = { ...state.basket };
    if (!plot) plots[action.index] = { crop: state.selected, grown: false };
    else if (!plot.grown) plots[action.index] = { ...plot, grown: true };
    else {
      if (basket[plot.crop] >= 12) return state;
      basket[plot.crop]++;
      plots[action.index] = null;
    }
    next = { ...state, plots, basket };
  }
  if (!next.free && basketMatches(next.basket, gardenOrder(next.order))) next.delivered = true;
  return next;
}
export function normalizeGarden(data: unknown): GardenState {
  const base = emptyGarden();
  if (!data || typeof data !== 'object') return base;
  const s = data as Partial<GardenState>;
  const integer = (n: unknown, max: number) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= max;
  const plots = Array.from({ length: 6 }, (_, i): Plot => {
    const p = Array.isArray(s.plots) ? s.plots[i] : null;
    return p && CROPS.includes(p.crop) && typeof p.grown === 'boolean' ? { crop: p.crop, grown: p.grown } : null;
  });
  const basket = emptyBasket();
  CROPS.forEach(c => { if (integer(s.basket?.[c], 12)) basket[c] = s.basket![c]; });
  return { ...base, plots, basket, selected: CROPS.includes(s.selected!) ? s.selected! : 'carrot', order: integer(s.order, 100000) ? s.order! : 0, delivered: s.delivered === true, free: s.free === true, hints: integer(s.hints, 100000) ? s.hints! : 0, corrections: integer(s.corrections, 100000) ? s.corrections! : 0 };
}
