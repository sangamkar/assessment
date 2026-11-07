import { useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio';

/** Wait for both the minimum reading time and any queued/replayed speech. */
export function afterFeedback(advance: () => void, speaking: () => boolean, delay = 1600) {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;
  const ready = () => {
    if (cancelled) return;
    if (speaking()) timer = setTimeout(ready, 150);
    else advance();
  };
  timer = setTimeout(ready, delay);
  return () => { cancelled = true; clearTimeout(timer); };
}

export function useAutoAdvance(enabled: boolean, questionKey: string, advance: () => void) {
  const [paused, setPaused] = useState(false);
  const latest = useRef(advance);
  latest.current = advance;
  useEffect(() => {
    if (!enabled || paused) return;
    return afterFeedback(() => latest.current(), () => soundEngine.isSpeaking());
  }, [enabled, paused, questionKey]);
  return { paused, setPaused };
}
