import { useAutoAdvance } from "../../utils/useAutoAdvance";
import React, { useEffect, useMemo, useState } from 'react';
import { createRng } from '../../engine/rng';
import type { GameEvidence } from '../../engine/progress';
import { SENTENCES, sentenceTiles } from '../../games/sentences';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import { GameBar, GameOver } from './GameFrame';
import type { RoundResult } from './GameFrame';
const ROUNDS = 5;

export function SentenceBuilder({
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
  const rounds = useMemo(() => rng.shuffle(SENTENCES[level]).slice(0, ROUNDS), [rng, level]);
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [used, setUsed] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [solved, setSolved] = useState(false);
  const current = rounds[round];
  const tiles = useMemo(() => (current ? sentenceTiles(current, level, rng.shuffle) : []), [current, level, rng]);
  const spoken = current ? current.words.join(' ').replace(/\s+([.!?])/g, '$1') : '';
  const prompt = current ? `Build the sentence you hear: ${spoken}` : '';
  useEffect(() => {
    if (current) soundEngine.speak(prompt);
    return () => soundEngine.stopSpeech();
  }, [prompt]);
  const reset = (r: number) => {
    setRound(r);
    setUsed([]);
    setHints(0);
    setMistakes([]);
    setMessage('');
    setSolved(false);
  };
  const auto = useAutoAdvance(solved, seed + ":" + round, () => reset(round + 1));
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
  const place = (id: string, help: number) => {
    const next = [...used, id];
    setUsed(next);
    if (next.length === current.words.length) {
      const clean = help === 0 && mistakes.length === 0;
      setSolved(true);
      if (clean) setWins((w) => w + 1);
      onRound(clean ? 'win' : 'assisted', {
        prompt: `Build the sentence: ${spoken}`,
        answer: spoken,
        hints: help,
        mistakes,
      });
      const feedback = `You matched the sentence! Notice the capital at the start and the end mark. ${spoken}`;
      setMessage(feedback);
      soundEngine.playCorrectChime();
      soundEngine.speak(feedback);
    } else {
      setMessage('That word fits the sentence you heard. What comes next?');
      soundEngine.playTap();
    }
  };
  const tap = (tile: { id: string; word: string }) => {
    if (solved || used.includes(tile.id)) return;
    if (tile.word === current.words[used.length]) {
      place(tile.id, hints);
      return;
    }
    setMistakes((m) => [
      ...m,
      `Position ${used.length + 1}: selected “${tile.word}”; expected “${current.words[used.length]}”.`,
    ]);
    const feedback =
      used.length === 0
        ? 'Listen for the first word. It starts with a capital letter.'
        : `Listen for what comes after “${current.words[used.length - 1]}” in this sentence. You can hear the whole sentence again.`;
    setMessage(feedback);
    soundEngine.speak(feedback);
  };
  const hint = () => {
    const tile = tiles.find((t) => !used.includes(t.id) && t.word === current.words[used.length]);
    if (!tile || solved) return;
    const n = hints + 1;
    setHints(n);
    soundEngine.speak(`Next comes ${tile.word}.`);
    place(tile.id, n);
  };
  return (
    <Wrap>
      <GameBar title="Sentence Builder" round={round} rounds={ROUNDS} level={level} color="#0891b2" onExit={onExit} />
      <div className="mt-6 flex flex-col items-center gap-5" data-sentence={spoken}>
        <p className="text-center text-slate-600">
          Build the sentence you hear. Other sentences may make sense; this puzzle follows the spoken one.
        </p>
        <div className="flex items-center gap-4">
          <span aria-hidden className="text-8xl">
            {current.emoji}
          </span>
          <SpeakButton text={prompt} big label="Hear the sentence" />
        </div>
        <div className="flex min-h-20 w-full flex-wrap items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-cyan-200 bg-white p-3">
          {current.words.slice(0, used.length).map((w, i) => (
            <span key={i} className="font-reader text-3xl font-bold text-slate-800">
              {w}
            </span>
          ))}
          {!solved && <span className="h-10 w-16 rounded-lg bg-cyan-50" />}
        </div>
        <p role="status" className="min-h-12 max-w-xl text-center font-semibold text-teal-900">
          {message || 'Hear the sentence, then choose its first word.'}
        </p>
        {!solved ? (
          <>
            <div className="flex flex-wrap justify-center gap-3">
              {tiles
                .filter((t) => !used.includes(t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    aria-label={`word ${t.word}`}
                    onClick={() => tap(t)}
                    className="min-w-16 rounded-xl bg-white px-4 py-3 font-reader text-3xl font-bold text-slate-800 shadow ring-2 ring-slate-200"
                  >
                    {t.word}
                  </button>
                ))}
            </div>
            <button className="growth-secondary" onClick={hint}>
              Show next word
            </button>
          </>
        ) : (
          <div className="flex flex-wrap gap-3"><button className="growth-secondary" onClick={() => auto.setPaused(!auto.paused)}>{auto.paused ? "Resume auto-next" : "Pause auto-next"}</button><button className="growth-primary" onClick={() => reset(round + 1)}>
            Next sentence →
          </button></div>
        )}
      </div>
    </Wrap>
  );
}
function Wrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-4">{children}</main>;
}
