import type { Item } from '../content/types';
import { getSkill } from '../content';
import { KINDERGARTEN_NUMBER_SKILLS } from '../content/kindergartenNumbers';
import { KINDERGARTEN_VISUAL_SKILLS } from '../content/kindergartenVisual';
import { localizeDeep } from '../content/curricula';

export interface ExposureLog {
  practiceIds: string[];
  mockIds: string[];
  practiceFingerprints: string[];
  mockFingerprints: string[];
  untrackedPracticeSkills: string[];
  untrackedMockSkills: string[];
}
export const LEGACY_AMBIGUOUS_ITEMS = new Set(['m2.shapes.4', 'm2.shapes.8']);
export const isFreshEvidence = (a: { itemId: string; repeated?: boolean; fingerprint?: string }) => a.repeated === false && !!a.fingerprint?.startsWith('fp2:') && !LEGACY_AMBIGUOUS_ITEMS.has(a.itemId);
export interface ExposureAttempt { itemId: string; skill: string; mode: string; fingerprint?: string }
export const emptyExposures = (): ExposureLog => ({ practiceIds: [], mockIds: [], practiceFingerprints: [], mockFingerprints: [], untrackedPracticeSkills: [], untrackedMockSkills: [] });
const add = (xs: string[], x: string) => xs.includes(x) ? xs : [...xs, x];
export function trackExposure(log: ExposureLog, a: ExposureAttempt): ExposureLog {
  const mock = a.mode === 'mock';
  const known = typeof a.fingerprint === 'string' && a.fingerprint.startsWith('fp2:');
  const ids = mock ? 'mockIds' : 'practiceIds';
  const fingerprints = mock ? 'mockFingerprints' : 'practiceFingerprints';
  const unknown = mock ? 'untrackedMockSkills' : 'untrackedPracticeSkills';
  return { ...log, [ids]: add(log[ids], a.itemId), [fingerprints]: known ? add(log[fingerprints], a.fingerprint!) : log[fingerprints], [unknown]: known ? log[unknown] : add(log[unknown], a.skill) };
}
export function migrateExposures(attempts: ExposureAttempt[], existing?: Partial<ExposureLog>, mockHistory?: unknown): ExposureLog {
  const base = emptyExposures();
  const sets = Object.fromEntries((Object.keys(base) as (keyof ExposureLog)[]).map(key => [key, new Set(Array.isArray(existing?.[key]) ? existing![key]!.filter((s): s is string => typeof s === 'string') : [])])) as Record<keyof ExposureLog, Set<string>>;
  for (const a of attempts) {
    if (!a || typeof a !== 'object' || typeof a.itemId !== 'string' || typeof a.skill !== 'string' || typeof a.mode !== 'string') { sets.untrackedPracticeSkills.add('__unknown__'); continue; }
    const mock = a.mode === 'mock', known = typeof a.fingerprint === 'string' && a.fingerprint.startsWith('fp2:');
    sets[mock ? 'mockIds' : 'practiceIds'].add(a.itemId);
    if (known) sets[mock ? 'mockFingerprints' : 'practiceFingerprints'].add(a.fingerprint!);
    else sets[mock ? 'untrackedMockSkills' : 'untrackedPracticeSkills'].add(a.skill);
  }
  if (Array.isArray(mockHistory)) for (const entry of mockHistory) {
    if (!entry || typeof entry !== 'object') { sets.untrackedMockSkills.add('__unknown__'); continue; }
    const subject = entry.subject;
    if ((subject === 'math' || subject === 'reading') && (typeof entry.untracked !== 'number' || entry.untracked > 0)) sets.untrackedMockSkills.add(`__subject_${subject}__`);
  }
  for (const key of Object.keys(base) as (keyof ExposureLog)[]) base[key] = [...sets[key]];
  return base;
}

const fingerprints = new WeakMap<Item, string>();
/** Visible and spoken task identity, independent of IDs, answer order and distractors. */
export function itemFingerprint(item: Item): string {
  const cached = fingerprints.get(item);
  if (cached) return cached;
  const canonical = (x: unknown): unknown => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : x;
  const text = (s?: string) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  const normalized = localizeDeep(item, 'en-IN');
  const answer = normalized.choices.find(c => c.correct);
  const fingerprint = 'fp2:' + JSON.stringify(canonical([text(normalized.say), normalized.voice ?? null, normalized.visual ?? null, answer?.visual ?? text(answer?.text ?? answer?.say)]));
  fingerprints.set(item, fingerprint);
  return fingerprint;
}
const newlyAuthored = new Set([...KINDERGARTEN_NUMBER_SKILLS, ...KINDERGARTEN_VISUAL_SKILLS].map(s => s.id));
export function wasExposed(log: ExposureLog, item: Item): boolean {
  const fp = itemFingerprint(item);
  const subject = getSkill(item.skill)?.subject;
  return (!newlyAuthored.has(item.skill) && log.untrackedMockSkills.includes(`__subject_${subject}__`)) || log.practiceFingerprints.includes(fp) || log.mockFingerprints.includes(fp) || log.untrackedPracticeSkills.includes('__unknown__') || log.untrackedMockSkills.includes('__unknown__') || log.untrackedPracticeSkills.includes(item.skill) || log.untrackedMockSkills.includes(item.skill);
}
