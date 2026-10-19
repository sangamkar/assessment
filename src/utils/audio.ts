/**
 * Audio synthesis and text-to-speech engine for kindergarten assessment
 */
class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Lazy initialize on first interaction
  }

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

  /** English accent for the active curriculum (en-US or en-IN). */
  public setLocale(locale: string) {
    this.locale = locale;
  }

  private pickVoice(lang: string): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    const prefix = lang.split('-')[0];
    const friendly = (v: SpeechSynthesisVoice) => /Natural|Samantha|Google|Karen|Victoria|Lekha|Veena|Rishi/.test(v.name);
    return (
      voices.find((v) => v.lang.replace('_', '-') === lang && friendly(v)) ||
      voices.find((v) => v.lang.replace('_', '-') === lang) ||
      (prefix === 'en' ? voices.find((v) => v.lang.startsWith('en') && friendly(v)) : undefined) ||
      voices.find((v) => v.lang.startsWith(prefix))
    );
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

  /** Speaks several parts in a row, each in its own language (English prompt, then a Hindi word). */
  public speakParts(parts: { text: string; lang?: string; roman?: string }[], onEnd?: () => void) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    this.stopSpeech();
    const run = ++this.sequence;
    const next = (i: number) => {
      if (run !== this.sequence) return;
      if (i >= parts.length) {
        this.currentUtterance = null;
        if (onEnd) onEnd();
        return;
      }
      let lang = parts[i].lang ?? this.locale;
      let text = parts[i].text;
      // No voice for this language (common for Kannada): say the romanized form in English instead.
      if (!lang.startsWith('en') && !this.hasVoice(lang.split('-')[0]) && parts[i].roman) {
        text = parts[i].roman!;
        lang = this.locale;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = lang.startsWith('hi') ? 0.8 : 0.88;
      utterance.pitch = 1.05;
      const voice = this.pickVoice(lang);
      if (voice) utterance.voice = voice;
      utterance.onend = () => next(i + 1);
      utterance.onerror = () => next(i + 1);
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    };
    next(0);
  }

  public stopSpeech() {
    this.sequence++;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

export const soundEngine = new SoundEngine();
