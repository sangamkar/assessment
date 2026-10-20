import React from 'react';
import type { AppState, GameId } from '../../engine/progress';
import { gameState } from '../../engine/progress';

export const GAMES: { id: GameId; title: string; emoji: string; kid: string; builds: string; color: string; soft: string }[] = [
  {
    id: 'mystery-word',
    title: 'Mystery Word',
    emoji: '🔤',
    kid: 'Look at the picture. Spell the word before the flower loses its petals!',
    builds: 'Phonics: hearing each sound and matching it to a letter (spelling CVC → blends → 5-letter words).',
    color: '#db2777',
    soft: '#fce7f3',
  },
  {
    id: 'number-path',
    title: 'Number Path',
    emoji: '🔢',
    kid: 'Draw one path through every square, and visit the numbers in order!',
    builds: 'Number order, planning ahead and spatial reasoning (like LinkedIn Zip; grids grow 3×3 → 5×5).',
    color: '#7c3aed',
    soft: '#ede9fe',
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    emoji: '✍️',
    kid: 'Listen to the sentence, then build it word by word!',
    builds: 'Writing: word order, capital at the start, end punctuation; level 3 adds grammar traps (ran/run, mice/mouses).',
    color: '#0891b2',
    soft: '#cffafe',
  },
];

export function Games({ state, onPlay, onBack }: { state: AppState; onPlay: (id: GameId) => void; onBack: () => void }) {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <button onClick={onBack} aria-label="Back" className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow">
          ←
        </button>
        <span className="text-5xl">🎮</span>
        <h1 className="font-kid text-3xl font-bold text-slate-800">Brain Games</h1>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g) => {
          const st = gameState(state, g.id);
          return (
            <button key={g.id} onClick={() => onPlay(g.id)} className="flex flex-col items-center gap-3 rounded-[2.5rem] p-6 text-center shadow-lg transition active:scale-95" style={{ background: g.soft }}>
              <span className="text-8xl">{g.emoji}</span>
              <span className="font-kid text-3xl font-bold" style={{ color: g.color }}>
                {g.title}
              </span>
              <span className="font-kid text-lg text-slate-600">{g.kid}</span>
              <span className="rounded-full bg-white px-4 py-1 font-kid text-sm font-bold text-slate-600">Level {'⭐'.repeat(st.level)}</span>
              <span className="mt-1 inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow" style={{ background: g.color }}>
                ▶
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
