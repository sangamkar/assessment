import { dayKey } from './progress';
import type { AppState } from './progress';
export function gamesUnlocked(state: AppState, now = Date.now()) {
  return state.questCompletedDay === dayKey(now);
}
/** Completion, regardless of accuracy, unlocks games. Partial or empty sessions do not. */
export function completeDailyQuest(state: AppState, answered: number, expected: number, startedDay: string | undefined, now = Date.now()): AppState {
  if (expected <= 0 || answered !== expected || startedDay !== dayKey(now)) return state;
  return { ...state, questCompletedDay: dayKey(now) };
}
