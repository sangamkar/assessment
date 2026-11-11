import React, { useEffect, useMemo, useState } from 'react';
import { createRng } from '../../engine/rng';
import { MYSTERY_WORDS, letterTiles } from '../../games/words';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import { GameBar, GameOver } from './GameFrame';
import type { RoundResult } from './GameFrame';

const ROUNDS = 5;
const PETALS = 6;
const COLOR = '#db2777';

/**
 * Mystery Word: a kind hangman. The picture is the clue; spell the word
 * left to right by its sounds. Wrong letters cost a petal, never a "hanging".
 */
export function MysteryWord({ level, onRound, onExit }: { level: 1 | 2 | 3; onRound: (r: RoundResult) => void; onExit: () => void }) {
  const [seed, setSeed] = useState(() => Date.now());
  const rng = useMemo(() => createRng(seed), [seed]);
  const words = useMemo(() => rng.shuffle(MYSTERY_WORDS[level]).slice(0, ROUNDS), [rng, level]);
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [filled, setFilled] = useState(0);
  const [petals, setPetals] = useState(PETALS);
  const [shake, setShake] = useState<string | null>(null);
  const [hinted, setHinted] = useState(0);
  const [status, setStatus] = useState<'play' | 'won' | 'lost'>('play');

  const current = words[round];
  const tiles = useMemo(() => (current ? letterTiles(current.word, level === 1 ? 3 : 4, rng.shuffle) : []), [current, level, rng]);
  const prompt = current ? `Spell the word ${current.word}. Say the sounds slowly, and tap the letters in order.` : '';

  const goTo = (r: number) => {
    setFilled(0);
    setPetals(PETALS);
    setHinted(0);
    setStatus('play');
    setRound(r);
  };

  useEffect(() => {
    if (current) soundEngine.speak(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, words]);

  if (round >= ROUNDS || !current) {
    return (
      <Wrap>
        <GameOver
          wins={wins}
          rounds={ROUNDS}
          onAgain={() => {
            setSeed(Date.now());
            setWins(0);
            goTo(0);
          }}
          onExit={onExit}
        />
      </Wrap>
    );
  }

  const word = current.word;

  const end = (won: boolean, hintsUsed: number) => {
    const result: RoundResult = won ? (hintsUsed <= 1 ? 'win' : 'assisted') : 'loss';
    if (result === 'win') setWins((w) => w + 1);
    onRound(result);
    setStatus(won ? 'won' : 'lost');
    if (won) {
      soundEngine.playCorrectChime();
      soundEngine.speak(`${word}! You spelled ${word}!`);
    } else {
      soundEngine.speak(`The word is ${word}. ${word.split('').join(', ')}. ${word}!`);
    }
  };

  const tap = (letter: string) => {
    if (status !== 'play') return;
    if (letter === word[filled]) {
      soundEngine.speak(letter);
      const next = filled + 1;
      setFilled(next);
      if (next === word.length) end(true, hinted);
    } else {
      soundEngine.playGentleBuzzer();
      setShake(letter);
      setTimeout(() => setShake(null), 400);
      const left = petals - 1;
      setPetals(left);
      if (left === 0) {
        setFilled(word.length);
        end(false, hinted);
      }
    }
  };

  const hint = () => {
    if (status !== 'play') return;
    const used = hinted + 1;
    setHinted(used);
    soundEngine.speak(`The next letter is ${word[filled]}.`);
    const next = filled + 1;
    setFilled(next);
    if (next === word.length) end(true, used);
  };

  return (
    <Wrap>
      <GameBar title="🔤 Mystery Word" round={round} rounds={ROUNDS} level={level} color={COLOR} onExit={onExit} />

      <div className="mt-5 flex flex-col items-center gap-4" data-word={word}>
        <div className="flex items-center gap-4">
          <span className="text-[7rem] leading-none" role="img" aria-label="picture clue">
            {current.emoji}
          </span>
          <SpeakButton text={prompt} big label="Hear the word" />
        </div>

        <div className="flex items-center gap-1 text-3xl" aria-label={`${petals} petals left`}>
          <span className="mr-1">🌼</span>
          {Array.from({ length: PETALS }, (_, i) => (
            <span key={i} className={`transition-all duration-500 ${i < petals ? '' : 'translate-y-3 opacity-10 grayscale'}`}>
              🌸
            </span>
          ))}
        </div>

        <div className="flex gap-2 sm:gap-3">
          {word.split('').map((ch, i) => (
            <div
              key={i}
              className={`flex h-16 w-14 items-center justify-center rounded-2xl border-4 font-reader text-4xl font-bold sm:h-20 sm:w-16 sm:text-5xl ${
                i < filled ? (status === 'lost' ? 'border-slate-300 bg-slate-100 text-slate-500' : 'border-emerald-400 bg-emerald-50 text-slate-800') : i === filled && status === 'play' ? 'border-dashed border-pink-400 bg-pink-50' : 'border-slate-200 bg-white'
              }`}
            >
              {i < filled ? ch : ''}
            </div>
          ))}
        </div>

        {status === 'play' ? (
          <>
            <div className="mt-2 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {tiles.map((l) => (
                <button
                  key={l}
                  onClick={() => tap(l)}
                  aria-label={`letter ${l}`}
                  className={`h-16 w-16 rounded-2xl bg-white font-reader text-4xl font-bold text-slate-800 shadow-md ring-2 ring-slate-200 transition active:scale-90 sm:h-20 sm:w-20 ${shake === l ? 'animate-bounce bg-rose-100 ring-rose-300' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button onClick={hint} className="mt-2 rounded-full bg-amber-100 px-6 py-3 font-kid text-xl font-bold text-amber-800 shadow">
              💡 Show next letter
            </button>
          </>
        ) : (
          <>
            <div className={`rounded-3xl px-6 py-3 text-center font-kid text-2xl font-bold ${status === 'won' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {status === 'won' ? `You spelled “${word}”!` : `The word is “${word}”. Let’s try another!`}
            </div>
            <button onClick={() => goTo(round + 1)} className="rounded-full px-10 py-4 font-kid text-2xl font-bold text-white shadow-lg" style={{ background: COLOR }}>
              Next ▶
            </button>
          </>
        )}
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-8 pt-4">{children}</div>;
}
