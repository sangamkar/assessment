import React, { useState } from 'react';
import type { AppState, GameId } from '../../engine/progress';
import { gameState } from '../../engine/progress';
import { isNewGame } from '../../games/brain';

export const GAMES: { id: GameId; title: string; emoji: string; kid: string; builds: string; color: string; soft: string }[] = [
  {
    id: 'mystery-word',
    title: 'Mystery Word',
    emoji: '🔤',
    kid: 'Listen to the word, build its spelling, and ask for a clue whenever you need one.',
    builds: 'Listening, letter order and spelling: short words, blends and longer words.',
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
    builds: 'Listening and sentence reconstruction, word order, capitals and end punctuation.',
    color: '#0891b2',
    soft: '#cffafe',
  },
  {id:'word-detective',title:'Word Detective',emoji:'🔎',kid:'Follow clues, discover a word, then use it in a new sentence.',builds:'Word meaning, inference and vocabulary in context.',color:'#a35a19',soft:'#fff0d5'},
  {id:'target-number',title:'Target Number',emoji:'🎯',kid:'Combine all your number tiles to hit the target. There is more than one way!',builds:'Addition, subtraction, number relationships and planning.',color:'#0f766e',soft:'#dcf5ee'},
  {id:'connections-junior',title:'Connections Junior',emoji:'🧩',kid:'Find four words that belong together. Can you discover both groups?',builds:'Vocabulary, categories, synonyms and word parts.',color:'#8b468f',soft:'#f5e7f6'},
  {id:'balance-lab',title:'Balance Lab',emoji:'⚖️',kid:'Choose the missing number and make both sides balance.',builds:'Equality, missing numbers and flexible arithmetic.',color:'#315aa2',soft:'#e5edff'},
  {id:'robot-delivery',title:'Robot Delivery',emoji:'🤖',kid:'Move your robot, collect the right parcels, and find the correct station.',builds:'Quantities, comparison words and spatial directions.',color:'#9a4b31',soft:'#ffeadf'},

];

export function Games({ state, onPlay, onBack }: { state: AppState; onPlay: (id: GameId) => void; onBack: () => void }) {
  const [filter, setFilter] = useState<'all' | 'words' | 'numbers'>('all');
  const wordGames = ['mystery-word', 'sentence-builder', 'word-detective', 'connections-junior', 'robot-delivery'];
  const numberGames = ['number-path', 'target-number', 'balance-lab', 'robot-delivery'];
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <button onClick={onBack} aria-label="Back" className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow">
          ←
        </button>
        <span className="text-5xl">🎮</span>
        <h1 className="font-kid text-3xl font-bold text-slate-800">Brain Games</h1>
      </header>
      <nav aria-label="Game categories" className="mb-5 flex flex-wrap gap-2">{([['all','All games'],['words','Words & vocabulary'],['numbers','Numbers & maths']] as const).map(([id,label]) => <button key={id} aria-pressed={filter === id} className={filter === id ? 'growth-primary' : 'growth-secondary'} onClick={() => setFilter(id)}>{label}</button>)}</nav>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.filter((g) => filter === 'all' || (filter === 'words' ? wordGames : numberGames).includes(g.id)).map((g) => {
          const st = gameState(state, g.id);
          const saved = isNewGame(g.id) ? state.brainRuns?.[g.id] : undefined;
          const shownLevel = saved && saved.round < 4 ? saved.level : st.level;
          return (
            <button key={g.id} onClick={() => onPlay(g.id)} className="flex flex-col items-center gap-3 rounded-[2.5rem] p-6 text-center shadow-lg transition active:scale-95" style={{ background: g.soft }}>
              <span className="text-8xl">{g.emoji}</span>
              <span className="font-kid text-3xl font-bold" style={{ color: g.color }}>
                {g.title}
              </span>
              <span className="font-kid text-lg text-slate-600">{g.kid}</span>
              <span className="rounded-full bg-white px-4 py-1 font-kid text-sm font-bold text-slate-600">{saved && saved.round < 4 ? 'Continue · ' : ''}Level {'⭐'.repeat(shownLevel)}</span>
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
