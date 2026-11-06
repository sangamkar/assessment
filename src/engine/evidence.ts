import type { Item } from '../content/types';
import type { AppState, Attempt } from './progress';

/** Ignores answer order/IDs so shuffling a question is never called fresh evidence. */
export function questionFingerprint(item: Item): string {
  const stable = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
    if (value && typeof value === 'object')
      return `{${Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${stable(v)}`)
        .join(',')}}`;
    return JSON.stringify(value);
  };
  const canonical = stable({
    say: item.say,
    show: item.show,
    visual: item.visual,
    voice: item.voice,
    choices: item.choices
      .map((c) => stable({ text: c.text, say: c.say, visual: c.visual, correct: !!c.correct }))
      .sort(),
  });
  let a = 2166136261,
    b = 2246822519;
  for (let i = 0; i < canonical.length; i++) {
    a = Math.imul(a ^ canonical.charCodeAt(i), 16777619);
    b = Math.imul(b ^ canonical.charCodeAt(i), 3266489917);
  }
  return `q:${(a >>> 0).toString(16).padStart(8, '0')}${(b >>> 0).toString(16).padStart(8, '0')}`;
}
export function seenQuestion(
  state: AppState,
  item: Item,
  extra: Pick<Attempt, 'itemId' | 'fingerprint'>[] = [],
): boolean {
  const fingerprint = questionFingerprint(item);
  return [...state.attempts, ...extra].some((a) => a.itemId === item.id || a.fingerprint === fingerprint);
}

export function evidenceLabel(correct: number, total: number, repeated = 0): string {
  if (total < 4) return 'Limited evidence';
  if (repeated > 0) return 'Includes familiar questions';
  return correct / total >= 0.8 ? 'Successful on this sample' : 'More practice suggested';
}
