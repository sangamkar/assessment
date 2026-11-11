import type { Item, Skill } from '../content/types';
import { MOCK_ONLY_ITEMS } from '../content/mockOnly';
import { createRng } from './rng';
import { itemFingerprint, LEGACY_AMBIGUOUS_ITEMS } from './exposures';

/** A deterministic finite catalogue makes exhaustion observable, including generated items. */
const cache = new Map<string, Item[]>();
const exclusive = new Set(MOCK_ONLY_ITEMS.map(itemFingerprint));
const fallbackIds = new Set(MOCK_ONLY_ITEMS.filter(i => i.id.includes('.reserved.') || i.id.includes('.museum.')).map(i => i.id));
export const isExclusiveMock = (item: Item) => exclusive.has(itemFingerprint(item));
export const isNewReserve = (item: Item) => fallbackIds.has(item.id);
export const isAssessed = (s: Skill) => (s.subject === 'math' || s.subject === 'reading') && s.strand !== 'writing' && !s.language && (!s.regions || s.regions.includes('us-ga'));
export function isMockItem(item: Item): boolean {
  const fingerprint = itemFingerprint(item);
  if (exclusive.has(fingerprint)) return true;
  let hash = 2166136261;
  for (let i = 0; i < fingerprint.length; i++) hash = Math.imul(hash ^ fingerprint.charCodeAt(i), 16777619);
  return (hash >>> 0) % 3 === 0;
}
export function catalogue(skill: Skill): Item[] {
  const previous = cache.get(skill.id);
  if (previous) return previous;
  const byFingerprint = new Map<string, Item>();
  for (const item of skill.items ?? []) if (!LEGACY_AMBIGUOUS_ITEMS.has(item.id)) byFingerprint.set(itemFingerprint(item), item);
  if (skill.generate) for (const d of [1, 2, 3] as const) for (let seed = 1; seed <= 192; seed++) {
    const item = skill.generate(createRng(seed * 7919 + d), d);
    const fp = itemFingerprint(item);
    if (!byFingerprint.has(fp)) byFingerprint.set(fp, item);
  }
  const list = [...byFingerprint.values()];
  cache.set(skill.id, list);
  return list;
}
export function poolItems(skill: Skill, pool: 'practice' | 'mock'): Item[] {
  const items = catalogue(skill).filter(item => !isAssessed(skill) || isMockItem(item) === (pool === 'mock'));
  const all = pool === 'mock' && isAssessed(skill) ? [...items, ...MOCK_ONLY_ITEMS.filter(i => i.skill === skill.id)] : items;
  return [...new Map(all.map(item => [itemFingerprint(item), item])).values()];
}
