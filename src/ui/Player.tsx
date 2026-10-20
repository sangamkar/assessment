import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Choice } from '../content/types';
import type { QuestStep } from '../engine/planner';
import type { Mode } from '../engine/progress';
import { soundEngine } from '../utils/audio';
import { localize, localizeDeep } from '../content/curricula';
import { Intro } from './Intro';
import { SpeakButton } from './SpeakButton';
import { Visual } from './Visual';

const PRAISE = ['You got it!', 'Great thinking!', 'Awesome!', 'Super smart!', 'Way to go!', 'Yes! Nice work!'];
const NEUTRAL = ['Thank you!', 'Okay, next one!', 'Here comes another!'];

export interface AnswerEvent {
  step: QuestStep;
  correct: boolean;
  why?: string;
}

interface Props {
  locale: 'en-US' | 'en-IN';
  mode: Mode;
  title: string;
  color: string;
  total: number;
  first: QuestStep | null;
  getNext: () => QuestStep | null;
  introSeen: (skill: string) => boolean;
  onIntroDone: (skill: string) => void;
  onAnswer: (e: AnswerEvent) => void;
  onFinish: (summary: { correct: number; total: number }) => void;
  onExit: () => void;
  /** Question number to start at (resuming a paused mock test). */
  startAt?: number;
  /** Offer a stretch break after this many questions (mock test). */
  breakEvery?: number;
}

type Phase = 'intro' | 'ask' | 'retry' | 'right' | 'explain' | 'moving' | 'break';

export function Player({ locale, mode, title, color, total, first, getNext, introSeen, onIntroDone, onAnswer, onFinish, onExit, startAt = 1, breakEvery }: Props) {
  const [step, setStep] = useState<QuestStep | null>(first);
  const [n, setN] = useState(startAt);
  const [phase, setPhase] = useState<Phase>(first && (mode === 'quest' || mode === 'skill') && !introSeen(first.skill.id) ? 'intro' : 'ask');
  const [selected, setSelected] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [confirmExit, setConfirmExit] = useState(false);
  const score = useRef({ correct: 0, total: 0 });
  // Check-ups, placement and skip-ahead challenges give no hints or feedback.
  const practice = mode === 'quest' || mode === 'skill';

  // Every word on screen and in speech follows the curriculum's English (choices and pictures too).
  const item = useMemo(() => (step?.item ? localizeDeep(step.item, locale) : undefined), [step?.item, locale]);
  const L = (t: string) => localize(t, locale);
  const speakItem = () => item && soundEngine.speakParts(item.voice ? [{ text: L(item.say) }, item.voice] : [{ text: L(item.say) }]);

  // Read the question aloud whenever a new one appears.
  useEffect(() => {
    if (phase === 'ask' && item) speakItem();
    return () => soundEngine.stopSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, phase === 'intro']);

  const advance = useCallback(() => {
    const next = getNext();
    if (!next) {
      onFinish(score.current);
      return;
    }
    setStep(next);
    setN((x) => x + 1);
    setSelected(null);
    setEliminated([]);
    setMessage('');
    if (breakEvery && n % breakEvery === 0) {
      setPhase('break');
      soundEngine.speak('Great work! Time for a stretch break. Stand up, reach for the sky, and wiggle!');
      return;
    }
    setPhase(practice && !introSeen(next.skill.id) ? 'intro' : 'ask');
  }, [getNext, introSeen, onFinish, practice, breakEvery, n]);

  if (!step || !item) return null;

  const choose = (c: Choice) => {
    if (phase !== 'ask' && phase !== 'retry') return;
    if (eliminated.includes(c.id)) return;
    soundEngine.playTap();
    setSelected(c.id);
    if (item.speakChoices !== false && c.say) soundEngine.speakParts([{ text: item.choiceLang ? c.say : L(c.say), lang: item.choiceLang, roman: c.roman }]);
  };

  const submit = () => {
    const choice = item.choices.find((c) => c.id === selected);
    if (!choice) return;
    const correct = !!choice.correct;
    const firstTry = phase === 'ask';
    if (firstTry) {
      score.current.total++;
      if (correct) score.current.correct++;
      onAnswer({ step, correct, why: choice.why });
    }

    if (!practice) {
      soundEngine.playNeutralTransition();
      const msg = NEUTRAL[Math.floor(Math.random() * NEUTRAL.length)];
      setMessage(msg);
      setPhase('moving');
      setTimeout(advance, 900);
      return;
    }

    if (correct) {
      soundEngine.playCorrectChime();
      const msg = PRAISE[Math.floor(Math.random() * PRAISE.length)];
      setMessage(msg);
      setPhase('right');
      soundEngine.speak(msg);
      setTimeout(advance, 1500);
    } else if (firstTry) {
      soundEngine.playGentleBuzzer();
      const msg = L(item.hint ?? 'Not quite. Look again and try one more time!');
      setMessage(msg);
      setEliminated([choice.id]);
      setSelected(null);
      setPhase('retry');
      soundEngine.speak(`Hmm. ${msg}`);
    } else {
      setEliminated((e) => [...e, choice.id]);
      setMessage(L(item.explain));
      setPhase('explain');
      soundEngine.speak(`Let's learn it. ${L(item.explain)}`);
    }
  };

  const correctId = item.choices.find((c) => c.correct)?.id;
  const reveal = phase === 'right' || phase === 'explain';
  const textOnly = item.choices.every((c) => !c.visual);
  const longest = Math.max(...item.choices.map((c) => (c.visual ? 0 : (c.text ?? '').length)));
  // Phones: three long words or wide pictures don't fit side by side, so stack them.
  const wideVisual = item.choices.some((c) => c.visual && WIDE_KINDS.has(c.visual.kind));
  const cols =
    item.choices.length === 4
      ? textOnly
        ? 'grid-cols-2 sm:grid-cols-4'
        : 'grid-cols-2 lg:grid-cols-4'
      : (textOnly && longest > 7) || wideVisual
        ? 'grid-cols-1 min-[480px]:grid-cols-3'
        : 'grid-cols-3';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-8 pt-4">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button onClick={() => setConfirmExit(true)} aria-label="Stop" className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow">
          ✕
        </button>
        <div className="flex-1">
          <div className="mb-1 font-kid text-sm font-bold text-slate-500">{title}</div>
          <div className="h-4 overflow-hidden rounded-full bg-white shadow-inner">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(Math.min(n - (reveal || phase === 'moving' ? 0 : 1), total) / total) * 100}%`, background: color }} />
          </div>
        </div>
        <div className="font-kid text-lg font-bold text-slate-600">
          {Math.min(n, total)}/{total}
        </div>
      </div>

      {phase === 'break' ? (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
          <div className="text-8xl">🧘</div>
          <h2 className="font-kid text-4xl font-bold text-slate-800">Stretch break!</h2>
          <p className="max-w-md font-kid text-xl text-slate-600">
            You answered {n - 1} questions. Stand up, reach for the sky, and wiggle!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setPhase('ask');
                soundEngine.speak(L(item.say));
              }}
              className="rounded-full px-10 py-4 font-kid text-2xl font-bold text-white shadow-lg"
              style={{ background: color }}
            >
              Keep going ▶
            </button>
            <button
              onClick={() => {
                soundEngine.stopSpeech();
                onExit();
              }}
              className="rounded-full bg-white px-8 py-4 font-kid text-2xl font-bold text-slate-700 shadow-lg"
            >
              Stop for today 💾
            </button>
          </div>
        </div>
      ) : phase === 'intro' ? (
        <Intro
          skill={step.skill}
          color={color}
          locale={locale}
          onDone={() => {
            onIntroDone(step.skill.id);
            setPhase('ask');
          }}
        />
      ) : (
        <>
          {mode === 'skip' && (
            <div className="mt-4 rounded-2xl bg-amber-100 px-4 py-2 text-center font-kid text-lg font-bold text-amber-900">
              ⚡ Skip test · get all {total} right to skip {step.skill.kidTitle}
            </div>
          )}
          {/* Prompt */}
          <div className="mt-5 flex items-center gap-4 rounded-[2rem] bg-white p-4 shadow-md">
            <SpeakButton text={L(item.say)} extra={item.voice} big />
            <div className="flex-1">
              <div className="font-kid text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">{L(item.show ?? item.say)}</div>
              {practice && <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{step.skill.icon} {step.skill.kidTitle}</div>}
            </div>
          </div>

          {item.voice && !soundEngine.hasVoice(item.voice.lang.split('-')[0]) && (
            <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
              Grown-up: this device has no voice for this language. Please say “{item.voice.roman ?? item.voice.text}” ({item.voice.text}) aloud.
            </div>
          )}

          {/* Stimulus */}
          {item.visual && (
            <div className="mt-4 flex justify-center rounded-[2rem] bg-white/70 p-4">
              <Visual v={item.visual} />
            </div>
          )}

          {/* Choices */}
          <div className={`mt-5 grid gap-3 sm:gap-4 ${cols}`}>
            {item.choices.map((c) => {
              const isSel = selected === c.id;
              const isGone = eliminated.includes(c.id);
              const isRight = reveal && c.id === correctId;
              return (
                <button
                  key={c.id}
                  onClick={() => choose(c)}
                  disabled={isGone || reveal || phase === 'moving'}
                  aria-label={c.say ?? c.text ?? 'choice'}
                  lang={item.choiceLang}
                  className={`relative flex min-h-[110px] min-w-0 items-center justify-center rounded-[1.75rem] bg-white p-3 shadow-md transition-all duration-200 ${
                    isRight ? 'scale-105 ring-8 ring-emerald-400' : isSel ? 'scale-105 ring-8 ring-sky-400' : 'ring-2 ring-slate-200 hover:ring-sky-200'
                  } ${isGone ? 'opacity-25 grayscale' : ''}`}
                >
                  {c.visual && <Visual v={c.visual} size="md" />}
                  {c.text && !c.visual && (
                    <span className={`${choiceTextClass(c.text)} min-w-0 font-bold text-slate-800 [overflow-wrap:anywhere]`}>{c.text}</span>
                  )}
                  {isRight && <span className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">✓</span>}
                  {isGone && <span className="absolute inset-0 flex items-center justify-center text-6xl text-rose-400">✕</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback + Done */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {message && (
              <div
                className={`max-w-2xl rounded-3xl px-6 py-4 text-center font-kid text-xl font-bold ${
                  phase === 'right' ? 'bg-emerald-100 text-emerald-800' : phase === 'explain' ? 'bg-amber-100 text-amber-900' : phase === 'moving' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-900'
                }`}
              >
                {phase === 'explain' && <div className="mb-1 text-sm uppercase tracking-wide text-amber-600">Let’s learn it</div>}
                {message}
              </div>
            )}
            {phase === 'explain' ? (
              <div className="flex gap-3">
                <SpeakButton text={L(item.explain)} />
                <button onClick={advance} className="rounded-full px-10 py-4 font-kid text-2xl font-bold text-white shadow-lg active:scale-95" style={{ background: color }}>
                  Next ▶
                </button>
              </div>
            ) : (
              (phase === 'ask' || phase === 'retry') && (
                <button
                  onClick={submit}
                  disabled={!selected}
                  className="rounded-full bg-emerald-500 px-14 py-4 font-kid text-3xl font-bold text-white shadow-lg transition active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                >
                  ✓ Done
                </button>
              )
            )}
          </div>
        </>
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
            <div className="font-kid text-2xl font-bold text-slate-800">Stop playing?</div>
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={() => setConfirmExit(false)} className="rounded-full bg-emerald-500 px-6 py-3 font-kid text-xl font-bold text-white">
                Keep going
              </button>
              <button
                onClick={() => {
                  soundEngine.stopSpeech();
                  onExit();
                }}
                className="rounded-full bg-slate-200 px-6 py-3 font-kid text-xl font-bold text-slate-700"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Pictures that are wide (rows of objects, charts): stacked on phones when there are 3 choices. */
const WIDE_KINDS = new Set(['objects', 'groups', 'row', 'crossed', 'tenFrame', 'tally', 'lengths', 'measure', 'coins', 'baseTen', 'sequence', 'shapeRow', 'balance', 'graph']);

/** Text size by length so a word always fits its card, smaller on phones. */
function choiceTextClass(text: string) {
  if (/^[\d: ]+$/.test(text)) return text.length > 5 ? 'font-kid text-3xl sm:text-5xl' : 'font-kid text-5xl';
  const n = text.length;
  if (n <= 4) return 'font-reader text-4xl';
  if (n <= 7) return 'font-reader text-3xl sm:text-4xl';
  if (n <= 10) return 'font-reader text-2xl sm:text-3xl';
  if (n <= 14) return 'font-reader text-xl sm:text-3xl';
  return 'font-reader text-lg sm:text-xl';
}
