import { soundEngine } from "../../utils/audio";

/** Game-only adapter. Keep the portal's audio engine and speech queue unchanged. */
export function gameFeedback(kind: "tap" | "complete" | "jam" = "tap") {
  try {
    if (kind === "complete") soundEngine.playCorrectChime();
    else if (kind === "jam") soundEngine.playGentleBuzzer();
    else soundEngine.playTap();
  } catch {
    /* A restricted device must never stop play. */
  }
}
export function gameSpeak(text: string) {
  try {
    soundEngine.speak(text);
  } catch {
    /* Visual instructions remain available. */
  }
}
export function gameMute(muted: boolean) {
  soundEngine.setMuted(muted);
}
