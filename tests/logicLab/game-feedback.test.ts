import { afterEach, describe, expect, it, vi } from "vitest";
import {
  gameFeedback,
  gameMute,
  gameSpeak,
} from "../../src/logicLab/core/feedback";
import { dropTarget } from "../../src/logicLab/components/DragPiece";
afterEach(() => {
  vi.unstubAllGlobals();
  gameMute(false);
});
describe("Shared game audio", () => {
  it("never creates audio or speaks while the shared mute is set", () => {
    const AudioContext = vi.fn(),
      speak = vi.fn();
    vi.stubGlobal("window", {
      AudioContext,
      speechSynthesis: { speak, cancel: vi.fn() },
    });
    gameMute(true);
    gameFeedback();
    gameFeedback("jam");
    gameFeedback("complete");
    gameSpeak("Turn a pipe.");
    expect(AudioContext).not.toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });
  it("restricted audio cannot block game interaction", () => {
    vi.stubGlobal("window", {
      AudioContext: class {
        constructor() {
          throw Error("restricted");
        }
      },
    });
    expect(() => gameFeedback()).not.toThrow();
    expect(() => gameFeedback("complete")).not.toThrow();
    expect(() => gameSpeak("Try a gear.")).not.toThrow();
  });
});
describe("Magnetic drop targets", () => {
  it("accepts a near drop, rejects a distant drop and ignores another board", () => {
    vi.stubGlobal("document", {
      querySelector: () => ({
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          right: 200,
          bottom: 200,
        }),
        querySelectorAll: () => [
          {
            dataset: { target: "peg-b" },
            getBoundingClientRect: () => ({
              left: 76,
              top: 76,
              width: 48,
              height: 48,
            }),
          },
        ],
      }),
    });
    expect(dropTarget(130, 110, ".board", "button")).toBe("peg-b");
    expect(dropTarget(190, 190, ".board", "button")).toBeNull();
    expect(dropTarget(250, 100, ".board", "button")).toBeNull();
  });
});
