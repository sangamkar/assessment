/** Portfolio records from the earlier app remain readable even when their activity is retired. */
export interface GrowthSession {
  id: string;
  activityId: string;
  startedAt: number;
  triedAt?: number;
  reflection: string;
  drawing: string[];
  strategies: string[];
  pieces?: string[];
}
export interface GrowthObservation {
  id: string;
  sessionId: string;
  ts: number;
  support: 'trying' | 'assisted' | 'independent' | 'together' | 'reminders';
  note: string;
  stage?: string;
}
export interface GrowthState {
  sessions: GrowthSession[];
  observations: GrowthObservation[];
  [key: string]: unknown;
}

export const emptyGrowth = (): GrowthState => ({ sessions: [], observations: [] });

/** Keep unknown legacy fields and current edits. The original backup stays untouched. */
export function mergeGrowth(current: unknown, backup?: unknown): GrowthState {
  const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
  const now = obj(current), old = obj(backup);
  const merge = (key: string) => {
    const out = new Map<string, unknown>();
    for (const source of [old[key], now[key]]) {
      if (!Array.isArray(source)) continue;
      for (const entry of source) {
        const item = obj(entry);
        if (typeof item.id === 'string' && item.id) out.set(item.id, entry);
      }
    }
    return [...out.values()];
  };
  return { ...old, ...now, sessions: merge('sessions') as GrowthSession[], observations: merge('observations') as GrowthObservation[] };
}
