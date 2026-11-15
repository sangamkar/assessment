import type { Completion, MiniGameModule } from "../../core/types";

/** Common headless lifecycle; renderers only send actions and observe snapshots. */
export abstract class PuzzleModule<S> implements MiniGameModule<S> {
  protected listeners = new Set<() => void>();
  protected completions = new Set<(result: Completion) => void>();
  hints = 0;
  protected announced = false;
  abstract loadLevel(json: unknown): void;
  abstract reset(): void;
  abstract getState(): S;
  abstract undo(): void;
  abstract getHint(tier: 1 | 2): { pieceId: string; pegId?: string } | null;
  subscribe(f: () => void) {
    this.listeners.add(f);
    return () => {
      this.listeners.delete(f);
    };
  }
  onComplete(f: (result: Completion) => void) {
    this.completions.add(f);
    return () => {
      this.completions.delete(f);
    };
  }
  protected emit(complete = false) {
    if (complete && !this.announced) {
      this.announced = true;
      this.completions.forEach((f) =>
        f({ stars: this.hints === 0 ? 3 : this.hints < 3 ? 2 : 1 }),
      );
    }
    if (!complete) this.announced = false;
    this.listeners.forEach((f) => f());
  }
}
