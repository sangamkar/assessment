import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

export function Results({ correct, total, mode, onHome, onAgain }: { correct: number; total: number; mode: 'quest' | 'skill' | 'checkup'; onHome: () => void; onAgain?: () => void }) {
  const stars = mode === 'checkup' ? 0 : correct + (mode === 'quest' ? 3 : 1);
  useEffect(() => {
    soundEngine.playCorrectChime();
    soundEngine.speak(mode === 'checkup' ? 'All done! Thank you for trying your best!' : `Hooray! You earned ${stars} stars!`);
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  }, [mode, stars]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl">{mode === 'checkup' ? '🏅' : '🏆'}</div>
      <h1 className="font-kid text-5xl font-bold text-slate-800">{mode === 'checkup' ? 'All done!' : 'Hooray!'}</h1>
      {mode === 'checkup' ? (
        <p className="max-w-md font-kid text-xl text-slate-600">Thank you for trying your best. A grown-up can see what to practice next.</p>
      ) : (
        <>
          <div className="font-kid text-6xl font-bold text-amber-500">+{stars} ⭐</div>
          <p className="font-kid text-xl text-slate-600">
            {correct} of {total} right on the first try
          </p>
        </>
      )}
      <div className="flex gap-4">
        {onAgain && (
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
