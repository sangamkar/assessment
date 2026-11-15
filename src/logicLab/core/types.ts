export type DifficultyTier = 'Starter' | 'Explorer' | 'Master';
export type Hint = { pieceId: string; action?: 'remove'; pegId?: string; targetPegId?: string };
export type Completion = { stars: 1 | 2 | 3 };
export type Unsubscribe = () => void;
/** Pure rule engines implement this contract without importing React or touching storage. */
export interface MiniGameModule<State = unknown> {
  loadLevel(json: unknown): void;
  reset(): void;
  getHint(tier: 1 | 2): Hint | null;
  undo(): void;
  onComplete(listener: (result: Completion) => void): Unsubscribe;
  getState(): State;
  subscribe(listener: () => void): Unsubscribe;
}
export interface LevelDescriptor { id: string; title: string; tier: DifficultyTier; data: unknown }
export interface GameDescriptor { id: string; title: string; levels: readonly LevelDescriptor[]; create(): MiniGameModule }
