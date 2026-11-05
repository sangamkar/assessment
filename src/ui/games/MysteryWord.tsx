import React, { useEffect, useMemo, useState } from 'react';
import { createRng } from '../../engine/rng';
import type { GameEvidence } from '../../engine/progress';
import { MYSTERY_WORDS, letterTiles } from '../../games/words';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import { GameBar, GameOver } from './GameFrame';
import type { RoundResult } from './GameFrame';
const ROUNDS = 5;

export function MysteryWord({
  level,
  onRound,
  onExit,
}: {
  level: 1 | 2 | 3;
  onRound: (r: RoundResult, evidence?: GameEvidence) => void;
  onExit: () => void;
}) {
  const [seed, setSeed] = useState(Date.now);
  const rng = useMemo(() => createRng(seed), [seed]);
  const words = useMemo(() => rng.shuffle(MYSTERY_WORDS[level]).slice(0, ROUNDS), [rng, level]);
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [filled, setFilled] = useState(0);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [solved, setSolved] = useState(false);
  const current = words[round];
  const tiles = useMemo(
    () => (current ? letterTiles(current.word, level === 1 ? 3 : 4, rng.shuffle) : []),
    [current, level, rng],
  );
  const prompt = current ? `Listen to the word ${current.word}. Build it with letters, from left to right.` : '';
  useEffect(() => {
    if (current) soundEngine.speak(prompt);
    return () => soundEngine.stopSpeech();
  }, [prompt]);
  const reset = (r: number) => {
    setRound(r);
    setFilled(0);
    setHints(0);
    setMistakes([]);
    setMessage('');
    setSolved(false);
  };
  if (!current || round >= ROUNDS)
    return (
      <Wrap>
        <GameOver
          wins={wins}
          rounds={ROUNDS}
          onAgain={() => {
            setSeed(Date.now());
            setWins(0);
            reset(0);
          }}
          onExit={onExit}
        />
      </Wrap>
    );
  const word = current.word;
  const place = (help: number) => {
    const next = filled + 1;
    setFilled(next);
    if (next === word.length) {
      const clean = help === 0 && mistakes.length === 0;
      setSolved(true);
      if (clean) setWins((n) => n + 1);
      onRound(clean ? 'win' : 'assisted', { prompt: `Spell ${word}`, answer: word, hints: help, mistakes });
      setMessage(
        `You built “${word}”! ${help || mistakes.length ? 'You used help or tried again, and finished it.' : 'You placed every letter independently.'}`,
      );
      soundEngine.playCorrectChime();
      soundEngine.speak(`You built ${word}. ${word.split('').join(', ')}. ${word}.`);
    } else {
      const feedback = `That letter fits. ${next} of ${word.length} letters placed.`;
      setMessage(feedback);
      soundEngine.playTap();
    }
  };
  const tap = (letter: string) => {
    if (solved) return;
    if (letter === word[filled]) {
      place(hints);
      return;
    }
    setMistakes((m) => [...m, `Position ${filled + 1}: selected ${letter}; expected ${word[filled]}.`]);
    const feedback = `That letter does not fit this space. Listen to “${word}” again, or ask to see the next letter.`;
    setMessage(feedback);
    soundEngine.speak(feedback);
  };
  const hint = () => {
    if (solved) return;
    const n = hints + 1;
    setHints(n);
    soundEngine.speak(`The next letter is ${word[filled]}.`);
    place(n);
  };
  return (
    <Wrap>
      <GameBar title="Mystery Word" round={round} rounds={ROUNDS} level={level} color="#db2777" onExit={onExit} />
      <div className="mt-6 flex flex-col items-center gap-5" data-word={word}>
        <p className="text-center text-slate-600">
          Build the word you hear. Take your time; mistakes do not end the round.
        </p>
        <div className="flex items-center gap-4">
          <span aria-hidden className="text-8xl">
            {current.emoji}
          </span>
          <SpeakButton text={prompt} big label="Hear the word" />
        </div>
        <div
          className="flex w-full flex-wrap justify-center gap-2"
          aria-label={`${filled} of ${word.length} letters placed`}
        >
          {word.split('').map((l, i) => (
            <span
              key={i}
              className={`flex h-16 w-14 items-center justify-center rounded-xl border-4 font-reader text-4xl font-bold ${i < filled ? 'border-emerald-400 bg-white' : 'border-pink-200 bg-white/70'}`}
            >
              {i < filled ? l : ''}
            </span>
          ))}
        </div>
        <p role="status" className="min-h-12 max-w-xl text-center font-semibold text-teal-900">
          {message || 'Listen, choose a letter, and try your idea.'}
        </p>
        {!solved ? (
          <>
            <div className="flex max-w-lg flex-wrap justify-center gap-3">
              {tiles.map((l) => (
                <button
                  key={l}
                  aria-label={`letter ${l}`}
                  onClick={() => tap(l)}
                  className="h-16 w-16 rounded-2xl bg-white font-reader text-4xl font-bold text-slate-800 shadow ring-2 ring-slate-200"
                >
                  {l}
                </button>
              ))}
            </div>
            <button className="growth-secondary" onClick={hint}>
              Show next letter
            </button>
          </>
        ) : (
          <button className="growth-primary" onClick={() => reset(round + 1)}>
            Next word →
          </button>
        )}
      </div>
    </Wrap>
  );
}
function Wrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-4">{children}</main>;
}
