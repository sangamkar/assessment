import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';

/** Shared top bar for games: exit, title, round dots and level stars. */
export function GameBar({ title, round, rounds, level, color, onExit }: { title: string; round: number; rounds: number; level: number; color: string; onExit: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          soundEngine.stopSpeech();
          onExit();
        }}
        aria-label="Leave game"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow"
      >
        ✕
      </button>
      <div className="flex-1">
        <div className="font-kid text-xl font-bold" style={{ color }}>
          {title}
        </div>
        <div className="mt-1 flex gap-1.5">
          {Array.from({ length: rounds }, (_, i) => (
            <span key={i} className={`h-3 w-8 rounded-full ${i < round ? '' : 'bg-white'}`} style={i < round ? { background: color } : undefined} />
          ))}
        </div>
      </div>
      <div className="rounded-full bg-white px-3 py-1 font-kid text-sm font-bold text-slate-600 shadow" aria-label={`Level ${level}`}>
        Level {'⭐'.repeat(level)}
      </div>
    </div>
  );
}

export function GameOver({ wins, rounds, onAgain, onExit }: { wins: number; rounds: number; onAgain: () => void; onExit: () => void }) {
  useEffect(() => {
    soundEngine.playCorrectChime();
    soundEngine.speak(wins ? `Great playing! You earned ${wins} star${wins > 1 ? 's' : ''}!` : 'Good try! Every puzzle makes your brain stronger.');
    if (wins) confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, [wins]);
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <div className="text-8xl">{wins ? '🏆' : '💪'}</div>
      <h1 className="font-kid text-5xl font-bold text-slate-800">{wins ? 'Great playing!' : 'Good try!'}</h1>
      <p className="font-kid text-2xl text-slate-600">
        {wins} of {rounds} solved · +{wins} ⭐
      </p>
      <div className="flex gap-4">
        <button onClick={onAgain} className="rounded-full bg-white px-8 py-4 font-kid text-2xl font-bold text-slate-700 shadow-lg">
          ↻ Play again
        </button>
        <button onClick={onExit} className="rounded-full bg-emerald-500 px-8 py-4 font-kid text-2xl font-bold text-white shadow-lg">
          🎮 Games
        </button>
      </div>
    </div>
  );
}

export type RoundResult = 'win' | 'assisted' | 'loss';
