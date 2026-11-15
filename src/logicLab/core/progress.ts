import type { Completion } from './types';
export const STORAGE_KEY = 'logic-lab:progress:v1';
export interface LevelProgress { completed: boolean; hintsUsed: number; stars: 0 | 1 | 2 | 3 }
export type Progress = Record<string, Record<string, LevelProgress>>;
export interface StorageLike { getItem(key:string): string|null; setItem(key:string,value:string):void }
export class ProgressStore {
  private progress: Progress = {};
  readonly warning: string | null;
  constructor(private readonly storage?: StorageLike) {
    let warning: string | null = null;
    try {
      const parsed: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [game, levels] of Object.entries(parsed)) {
          if (['__proto__','constructor','prototype'].includes(game)) continue;
          if (!levels || typeof levels !== 'object' || Array.isArray(levels)) continue;
          for (const [level, value] of Object.entries(levels)) {
            if (['__proto__','constructor','prototype'].includes(level)) continue;
            if (!value || typeof value !== 'object') continue;
            const entry = value as Record<string,unknown>;
            if (typeof entry.completed !== 'boolean' || !Number.isInteger(entry.hintsUsed) || (entry.hintsUsed as number) < 0 || ![0,1,2,3].includes(entry.stars as number)) continue;
            (this.progress[game] ??= {})[level] = {completed:entry.completed,hintsUsed:entry.hintsUsed as number,stars:entry.stars as LevelProgress['stars']};
          }
        }
      }
    } catch { warning = 'Saved progress could not be read.'; }
    this.warning = warning;
  }
  get(game:string, level:string): LevelProgress { return this.progress[game]?.[level] ?? {completed:false,hintsUsed:0,stars:0}; }
  save(game:string, level:string, hintsUsed:number, result:Completion): boolean {
    const old = this.get(game,level);
    const next = {completed:true, hintsUsed: old.completed ? Math.min(old.hintsUsed,hintsUsed) : hintsUsed, stars:Math.max(old.stars,result.stars) as LevelProgress['stars']};
    this.progress = {...this.progress,[game]:{...this.progress[game],[level]:next}};
    try { this.storage?.setItem(STORAGE_KEY,JSON.stringify(this.progress)); return !!this.storage; } catch { return false; }
  }
}
export function browserStorage():StorageLike|undefined { try { return window.localStorage; } catch { return undefined; } }
