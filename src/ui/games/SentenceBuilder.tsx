import React, { useEffect, useMemo, useState } from 'react';
import { createRng } from '../../engine/rng';
import { SENTENCES, sentenceTiles } from '../../games/sentences';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import { GameBar, GameOver } from './GameFrame';
import type { RoundResult } from './GameFrame';

const ROUNDS = 5;
const PETALS = 5;
const COLOR = '#0891b2';

/**
 * Sentence Builder: hear a sentence, build it from word tiles in order.
 * Practises word order, the capital at the start and the right end mark.
 */
export function SentenceBuilder({ level, onRound, onExit }: { level: 1 | 2 | 3; onRound: (r: RoundResult) => void; onExit: () => void }) {
  const [seed, setSeed] = useState(() => Date.now());
  const rng = useMemo(() => createRng(seed), [seed]);
  const rounds = useMemo(() => rng.shuffle(SENTENCES[level]).slice(0, ROUNDS), [rng, level]);
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [used, setUsed] = useState<string[]>([]);
  const [petals, setPetals] = useState(PETALS);
  const [shake, setShake] = useState<string | null>(null);
  const [hinted, setHinted] = useState(0);
  const [status, setStatus] = useState<'play' | 'won' | 'lost'>('play');

  const current = rounds[round];
  const tiles = useMemo(() => (current ? sentenceTiles(current, level, rng.shuffle) : []), [current, level, rng]);
  const spoken = current ? current.words.filter((w) => /[A-Za-z]/.test(w)).join(' ') : '';
  const prompt = current ? `Build this sentence: ${spoken}.` : '';

  const goTo = (r: number) => {
    setUsed([]);
    setPetals(PETALS);
    setHinted(0);
    setStatus('play');
    setRound(r);
  };

  useEffect(() => {
    if (current) soundEngine.speak(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, rounds]);

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

  const words = current.words;
  const filled = used.length;

  const end = (won: boolean, hintsUsed: number) => {
    const result: RoundResult = won ? (hintsUsed <= 1 ? 'win' : 'assisted') : 'loss';
    if (result === 'win') setWins((w) => w + 1);
    onRound(result);
    setStatus(won ? 'won' : 'lost');
    if (won) soundEngine.playCorrectChime();
    soundEngine.speak(won ? `You built it! ${spoken}.` : `The sentence is: ${spoken}.`);
  };

  const place = (tileId: string, hintsUsed: number) => {
    const next = [...used, tileId];
    setUsed(next);
    if (next.length === words.length) end(true, hintsUsed);
  };

  const tap = (tile: { id: string; word: string }) => {
    if (status !== 'play' || used.includes(tile.id)) return;
    if (tile.word === words[filled]) {
      soundEngine.playTap();
      place(tile.id, hinted);
    } else {
      soundEngine.playGentleBuzzer();
      setShake(tile.id);
      setTimeout(() => setShake(null), 400);
      const left = petals - 1;
      setPetals(left);
      if (left === 0) {
        setUsed(words.map((_, i) => `w${i}`));
        end(false, hinted);
      }
    }
  };

  const hint = () => {
    if (status !== 'play') return;
    const tile = tiles.find((t) => !used.includes(t.id) && t.word === words[filled]);
    if (!tile) return;
    const n = hinted + 1;
    setHinted(n);
    soundEngine.speak(`Next comes: ${words[filled]}`);
    place(tile.id, n);
  };

  const placedWords = words.slice(0, filled);

  return (
    <Wrap>
      <GameBar title="✍️ Sentence Builder" round={round} rounds={ROUNDS} level={level} color={COLOR} onExit={onExit} />
      <div className="mt-5 flex flex-col items-center gap-4" data-sentence={words.join(' ')}>
        <div className="flex items-center gap-4">
          <span className="text-[6rem] leading-none" role="img" aria-label="picture clue">
            {current.emoji}
          </span>
          <SpeakButton text={prompt} big label="Hear the sentence" />
        </div>
        <div className="flex items-center gap-1 text-3xl" aria-label={`${petals} petals left`}>
          <span className="mr-1">🌻</span>
          {Array.from({ length: PETALS }, (_, i) => (
            <span key={i} className={`transition-all duration-500 ${i < petals ? '' : 'translate-y-3 opacity-10 grayscale'}`}>
              🌼
            </span>
          ))}
        </div>

        <div className="flex min-h-[4.5rem] w-full max-w-2xl flex-wrap items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-cyan-300 bg-white/70 p-3">
          {placedWords.map((w, i) => (
            <span key={i} className={`font-reader text-3xl font-bold ${status === 'lost' ? 'text-slate-400' : 'text-slate-800'}`}>
              {w}
            </span>
          ))}
          {status === 'play' && <span className="h-10 w-16 animate-pulse rounded-xl bg-cyan-100" />}
        </div>

        {status === 'play' ? (
          <>
            <div className="flex max-w-2xl flex-wrap justify-center gap-3">
              {tiles
                .filter((t) => !used.includes(t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => tap(t)}
                    aria-label={`word ${t.word}`}
                    className={`min-w-16 rounded-2xl bg-white px-4 py-3 font-reader text-3xl font-bold text-slate-800 shadow-md ring-2 ring-slate-200 transition active:scale-90 ${shake === t.id ? 'animate-bounce bg-rose-100 ring-rose-300' : ''}`}
                  >
                    {t.word}
                  </button>
                ))}
            </div>
            <button onClick={hint} className="mt-1 rounded-full bg-amber-100 px-6 py-3 font-kid text-xl font-bold text-amber-800 shadow">
              💡 Show next word
            </button>
          </>
        ) : (
          <>
            <div className={`rounded-3xl px-6 py-3 text-center font-kid text-2xl font-bold ${status === 'won' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {status === 'won' ? 'Great sentence! Capital at the start, mark at the end. ✓' : 'Here is the sentence. Let’s try another!'}
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
