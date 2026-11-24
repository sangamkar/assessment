import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A fake of Chrome's speechSynthesis with its known failure modes:
 * speech queued in the same instant as cancel() is dropped, an utterance can
 * silently never start, and speech before the first tap is refused.
 */
type Voice = { name: string; lang: string; localService: boolean };
class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  voice: Voice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function fakeChrome(opts: { dropAfterCancel?: boolean; stuckVoice?: string; refuseUntilTap?: boolean } = {}) {
  const listeners: Record<string, (() => void)[]> = {};
  const voices: Voice[] = [
    { name: 'Google US English', lang: 'en-US', localService: false },
    { name: 'Microsoft Zira - English (United States)', lang: 'en-US', localService: true },
  ];
  const spoken: { text: string; voice?: string }[] = [];
  let lastCancel = -1;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const active: FakeUtterance[] = [];
  let tapped = false;
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => voices,
    addEventListener: (type: string, fn: () => void) => (listeners[type] ??= []).push(fn),
    cancel: () => {
      // Only a cancel that interrupts speech triggers Chrome's drop bug.
      if (synth.speaking) lastCancel = Date.now();
      synth.speaking = false;
      timers.splice(0).forEach(clearTimeout);
      const current = active.splice(0);
      current.forEach((u) => u.onerror?.({ error: 'interrupted' }));
    },
    pause: () => {},
    resume: () => {},
    speak: (u: FakeUtterance) => {
      if (opts.refuseUntilTap && !tapped) {
        setTimeout(() => u.onerror?.({ error: 'not-allowed' }), 5);
        return;
      }
      if (opts.dropAfterCancel && Date.now() - lastCancel < 50) return; // silently dropped
      if (opts.stuckVoice && u.voice?.name === opts.stuckVoice) return; // never starts
      synth.speaking = true;
      active.push(u);
      timers.push(
        setTimeout(() => {
          u.onstart?.();
          spoken.push({ text: u.text, voice: u.voice?.name });
        }, 10),
        setTimeout(() => {
          synth.speaking = false;
          active.splice(active.indexOf(u), 1);
          u.onend?.();
        }, 200),
      );
    },
  };
  const winListeners: Record<string, ((e?: unknown) => void)[]> = {};
  const win = {
    speechSynthesis: synth,
    addEventListener: (type: string, fn: () => void) => (winListeners[type] ??= []).push(fn),
  };
  const tap = () => {
    tapped = true;
    (winListeners.pointerdown ?? []).forEach((fn) => fn());
  };
  return { win, spoken, tap };
}

async function load(env: ReturnType<typeof fakeChrome>) {
  vi.resetModules();
  vi.stubGlobal('window', env.win);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  const { soundEngine } = await import('../src/utils/audio');
  return soundEngine;
}

describe('speech on Chrome', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('prefers a voice installed on the device over an online Google voice', async () => {
    const env = fakeChrome();
    const sound = await load(env);
    sound.speak('How many apples?');
    await vi.advanceTimersByTimeAsync(400);
    expect(env.spoken).toEqual([{ text: 'How many apples?', voice: 'Microsoft Zira - English (United States)' }]);
  });

  it('still speaks when new speech interrupts old speech (Chrome drops speech queued right after cancel)', async () => {
    const env = fakeChrome({ dropAfterCancel: true });
    const sound = await load(env);
    sound.speak('First question');
    await vi.advanceTimersByTimeAsync(50); // still speaking
    const done = vi.fn();
    sound.speak('You tapped the cat', done);
    await vi.advanceTimersByTimeAsync(600);
    expect(env.spoken.map((s) => s.text)).toEqual(['First question', 'You tapped the cat']);
    expect(done).toHaveBeenCalledOnce();
  });

  it('retries with the default voice when the chosen voice never starts', async () => {
    const env = fakeChrome({ stuckVoice: 'Microsoft Zira - English (United States)' });
    const sound = await load(env);
    const done = vi.fn();
    sound.speak('Which is longer?', done);
    await vi.advanceTimersByTimeAsync(3200);
    expect(env.spoken).toEqual([{ text: 'Which is longer?', voice: undefined }]);
    expect(done).toHaveBeenCalledOnce();
  });

  it('plays speech refused before the first tap as soon as the child taps', async () => {
    const env = fakeChrome({ refuseUntilTap: true });
    const sound = await load(env);
    sound.speak('Welcome back, Aarav!');
    await vi.advanceTimersByTimeAsync(400);
    expect(env.spoken).toEqual([]);
    env.tap();
    await vi.advanceTimersByTimeAsync(400);
    expect(env.spoken.map((s) => s.text)).toEqual(['Welcome back, Aarav!']);
  });

  it('a newer line replaces an older one that never finished', async () => {
    const env = fakeChrome();
    const sound = await load(env);
    const first = vi.fn();
    sound.speak('Old question', first);
    sound.speak('New question');
    await vi.advanceTimersByTimeAsync(800);
    expect(env.spoken.map((s) => s.text)).toEqual(['New question']);
    expect(first).not.toHaveBeenCalled();
  });

  it('stays silent when muted but still reports the line as finished', async () => {
    const env = fakeChrome();
    const sound = await load(env);
    sound.setMuted(true);
    const done = vi.fn();
    sound.speak('Hello', done);
    await vi.advanceTimersByTimeAsync(400);
    expect(env.spoken).toEqual([]);
    expect(done).toHaveBeenCalledOnce();
  });
});
