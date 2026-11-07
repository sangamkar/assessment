import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import type { Mode } from '../engine/progress';

export interface DoneToday {
  streak: number;
  stars: number;
  onStickers?: () => void;
  onGames?: () => void;
}

/** Primitive identity of a finished session, so parent rerenders with fresh prop objects don't replay the celebration. */
export const celebrationKey = (mode: Mode, stars: number, note: string | undefined, doneToday: boolean) => `${mode}|${stars}|${doneToday ? 1 : 0}|${note ?? ''}`;

export function Results({ correct, total, mode, note, onHome, onAgain, doneToday }: { correct: number; total: number; mode: Mode; note?: string; onHome: () => void; onAgain?: () => void; doneToday?: DoneToday }) {
  const tested = mode === 'checkup' || mode === 'placement' || mode === 'skip' || mode === 'mock';
  const stars = tested ? 0 : correct + (mode === 'quest' ? 3 : 1);
  const celebrate = celebrationKey(mode, stars, note, !!doneToday);
  useEffect(() => {
    soundEngine.playCorrectChime();
    soundEngine.speak(note ?? (tested ? 'All done! Thank you for trying your best!' : doneToday ? `Hooray! You earned ${stars} stars. You finished today’s learning!` : `Hooray! You earned ${stars} stars!`));
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  }, [celebrate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl">{mode === 'skip' && correct === total ? '⚡' : tested ? '🏅' : '🏆'}</div>
      <h1 className="font-kid text-5xl font-bold text-slate-800">{tested ? 'All done!' : 'Hooray!'}</h1>
      {tested ? (
        <p className="max-w-md font-kid text-xl text-slate-600">{note ?? 'Thank you for trying your best. A grown-up can see what to practice next.'}</p>
      ) : (
        <>
          <div className="font-kid text-6xl font-bold text-amber-500">+{stars} ⭐</div>
          <p className="font-kid text-xl text-slate-600">
            {correct} of {total} right on the first try
          </p>
          {doneToday && (
            <section className="w-full max-w-md rounded-[2rem] bg-emerald-50 p-5 shadow" aria-label="Done for today">
              <h2 className="font-kid text-3xl font-bold text-emerald-800">🌟 Done for today!</h2>
              <p className="mt-1 font-kid text-lg text-emerald-900">{doneToday.streak > 1 ? `${doneToday.streak} days of learning in a row. ` : ''}You have {doneToday.stars} ⭐ to spend.</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {doneToday.onStickers && <button onClick={doneToday.onStickers} className="rounded-full bg-white px-5 py-3 font-kid text-xl font-bold text-amber-600 shadow">📒 Sticker book</button>}
                {doneToday.onGames && <button onClick={doneToday.onGames} className="rounded-full bg-violet-500 px-5 py-3 font-kid text-xl font-bold text-white shadow">🎮 Pick a game</button>}
              </div>
            </section>
          )}
        </>
      )}
      <div className="flex gap-4">
        {onAgain && !doneToday && (
          <button onClick={onAgain} className="rounded-full bg-white px-8 py-4 font-kid text-2xl font-bold text-slate-700 shadow-lg">
            ↻ Again
          </button>
        )}
        <button onClick={onHome} className="rounded-full bg-emerald-500 px-8 py-4 font-kid text-2xl font-bold text-white shadow-lg">
          🏠 Home
        </button>
      </div>
    </div>
  );
}
