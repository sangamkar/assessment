/**
 * Audio synthesis and text-to-speech engine for kindergarten assessment
 */
class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play gentle tap sound on button or choice click
   */
  public playTap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Neutral pleasant transition chime ("Let's try the next one")
   */
  public playNeutralTransition() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Tone 1: E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2: G5 (783.99Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  /**
   * Play step counting tone for vertices or sides (pitch goes up with count)
   */
  public playCountPip(countIndex: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const baseFreqs = [440, 523.25, 587.33, 659.25, 698.46, 783.99];
      const freq = baseFreqs[Math.min(countIndex, baseFreqs.length - 1)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  /**
   * Celebratory chime for Practice Mode success
   */
  public playPracticeCelebration() {
    this.playCorrectChime();
  }

  public playCorrectChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const time = ctx.currentTime + i * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.35);
      });
    } catch {
      // ignore
    }
  }

  public playGentleBuzzer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  private locale = 'en-US';
  private sequence = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private keepAlive: ReturnType<typeof setInterval> | null = null;
  /** Chrome refuses speech until the page has had a tap or key press. */
  private unlocked = false;
  /** Speech that was refused before the first tap; it plays on that tap. */
  private waiting: { parts: SpeechPart[]; onEnd?: () => void } | null = null;
  private voicesReady = false;

  constructor() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.unlocked = true;
      this.getContext();
      const waiting = this.waiting;
      this.waiting = null;
      if (waiting) this.speakParts(waiting.parts, waiting.onEnd);
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    if ('speechSynthesis' in window) {
      const ready = () => {
        if (window.speechSynthesis.getVoices().length) this.voicesReady = true;
      };
      ready();
      window.speechSynthesis.addEventListener?.('voiceschanged', ready);
    }
  }

  /** English accent for the active curriculum (en-US or en-IN). */
  public setLocale(locale: string) {
    this.locale = locale;
  }

  /**
   * Prefers voices installed on the device. Chrome's online "Google" voices fail silently
   * on a weak connection and stop mid-sentence after about 15 seconds.
   */
  private pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    const prefix = lang.split('-')[0];
    const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-');
    const friendly = (v: SpeechSynthesisVoice) => /Natural|Samantha|Karen|Victoria|Lekha|Veena|Rishi|Aria|Jenny|Zira|Ava|Allison/.test(v.name);
    const ranked = (list: SpeechSynthesisVoice[]) =>
      list.find((v) => v.localService && friendly(v)) || list.find((v) => v.localService) || list.find(friendly) || list[0];
    const exact = voices.filter((v) => norm(v) === lang);
    if (exact.length) return ranked(exact);
    const sameLanguage = voices.filter((v) => norm(v).startsWith(prefix));
    return sameLanguage.length ? ranked(sameLanguage) : undefined;
  }

  /** True when the device has a voice for this language (e.g. 'hi' for Hindi). */
  public hasVoice(prefix: string): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.getVoices().some((v) => v.lang.startsWith(prefix));
  }

  /**
   * Text-To-Speech with Kindergarten-friendly tempo and friendly voice
   */
  public speak(text: string, onEnd?: () => void, lang?: string) {
    this.speakParts([{ text, lang }], onEnd);
  }

  /**
   * Speaks several parts in a row, each in its own language (English prompt, then a Hindi word).
   * Works around Chrome's speech bugs: speech started right after cancel() is dropped, the
   * queue can be left paused, the first speech before any tap is refused, and an utterance can
   * silently never start. Each part gets one retry with the browser's default voice.
   */
  public speakParts(parts: SpeechPart[], onEnd?: () => void) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    const synth = window.speechSynthesis;
    const busy = synth.speaking || synth.pending;
    this.stopSpeech(busy);
    const run = this.sequence;
    const later = (fn: () => void, ms: number) => this.timers.push(setTimeout(() => run === this.sequence && fn(), ms));
    const finish = () => {
      this.clearKeepAlive();
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    const say = (i: number, attempt: number) => {
      if (run !== this.sequence) return;
      if (i >= parts.length) return finish();
      let lang = parts[i].lang ?? this.locale;
      let text = parts[i].text;
      // No voice for this language (common for Kannada): say the romanized form in English instead.
      if (!lang.startsWith('en') && !this.hasVoice(lang.split('-')[0]) && parts[i].roman) {
        text = parts[i].roman!;
        lang = this.locale;
      }
      if (!text.trim()) return say(i + 1, 0);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = lang.startsWith('hi') ? 0.8 : 0.88;
      utterance.pitch = 1.05;
      // The retry leaves the voice to the browser, in case the chosen voice is broken.
      const voice = attempt === 0 ? this.pickVoice(lang) : undefined;
      try {
        if (voice) utterance.voice = voice;
      } catch {
        // A voice the browser no longer accepts: speak with its default.
      }
      let started = false;
      let settled = false;
      const done = (ok: boolean, error?: string) => {
        if (settled || run !== this.sequence) return;
        settled = true;
        this.clearKeepAlive();
        if (error === 'not-allowed' && !this.unlocked) {
          // Refused before the first tap: play it all as soon as the child touches the screen.
          this.waiting = { parts: parts.slice(i), onEnd };
          return;
        }
        if (!ok && !started && attempt === 0) {
          synth.cancel();
          later(() => say(i, 1), 120);
          return;
        }
        say(i + 1, 0);
      };
      utterance.onstart = () => {
        started = true;
        // Online voices stop after ~15 s in Chrome unless nudged.
        if (voice && !voice.localService) this.startKeepAlive();
      };
      utterance.onend = () => done(true);
      utterance.onerror = (e) => done(false, (e as SpeechSynthesisErrorEvent).error);
      this.currentUtterance = utterance;
      synth.resume();
      synth.speak(utterance);
      // Chrome sometimes never starts an utterance and never fires an event: retry it.
      later(() => {
        if (!started) done(false);
      }, 2500);
    };

    const begin = () => say(0, 0);
    // Chrome drops speech queued in the same instant as cancel(), and has no voices
    // until they finish loading; give both a moment.
    const delay = busy ? 120 : this.voicesReady ? 0 : 300;
    if (delay) later(begin, delay);
    else begin();
  }

  private startKeepAlive() {
    this.clearKeepAlive();
    this.keepAlive = setInterval(() => {
      const synth = window.speechSynthesis;
      if (!synth.speaking) return this.clearKeepAlive();
      synth.pause();
      synth.resume();
    }, 10000);
  }

  private clearKeepAlive() {
    if (this.keepAlive) clearInterval(this.keepAlive);
    this.keepAlive = null;
  }

  /** Stops current speech. `cancel` false skips Chrome's cancel() when nothing is playing. */
  public stopSpeech(cancel = true) {
    this.sequence++;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.clearKeepAlive();
    this.waiting = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (cancel) window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

type SpeechPart = { text: string; lang?: string; roman?: string };

export const soundEngine = new SoundEngine();
