import React from 'react';
import { SUBJECTS } from '../content';
import type { SubjectId } from '../content/types';
import { subjectSummary } from '../engine/planner';
import type { AppState } from '../engine/progress';
import { AirportPicture } from './airport/AirportArt';

interface Props {
  state: AppState;
  onQuest: () => void;
  onExplore: () => void;
  onGames: () => void;
  onIsland: (id: SubjectId) => void;
  onGrownUps: () => void;
}

export function Home({ state, onQuest, onGames, onIsland, onGrownUps, onExplore }: Props) {
  const name = state.profile?.name?.trim() || 'Explorer';
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-md">{state.profile?.avatar ?? '🦁'}</div>
        <div className="flex-1">
          <h1 className="font-kid text-3xl font-bold text-slate-800 sm:text-4xl">Hi, {name}!</h1>
          <p className="font-kid text-lg text-slate-500">A new day. A new discovery.</p>
        </div>

      </header>


      <div className="mt-2"><p className="growth-eyebrow">Start here</p><h2 className="font-kid text-2xl font-semibold text-teal-950">A little learning, every day</h2></div>
      <div className="grid gap-4 sm:grid-cols-3">
      <button
        onClick={onQuest}
        className="group relative overflow-hidden rounded-[2.5rem] sm:col-span-2 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-left shadow-xl transition active:scale-[0.98] sm:p-8"
      >
        <div className="absolute -right-6 -top-6 text-[9rem] opacity-30 transition group-hover:rotate-12">🗺️</div>
        <div className="font-kid text-sm font-bold uppercase tracking-widest text-white/80">Math, reading & discovery · 8 questions</div>
        <div className="mt-1 font-kid text-4xl font-bold text-white sm:text-5xl">Today’s learning</div>
        <div className="mt-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg">▶</div>
      </button>
        <button
          onClick={onGames}
          className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 p-6 text-left shadow-xl transition active:scale-[0.98]"
        >
          <div className="absolute -bottom-4 -right-4 text-[7rem] opacity-30">🧩</div>
          <div className="font-kid text-sm font-bold uppercase tracking-widest text-white/80">Brain Games</div>
          <div className="mt-1 font-kid text-3xl font-bold leading-tight text-white">Word, number &amp; sentence puzzles</div>
          <div className="mt-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-lg">🎮</div>
        </button>
      </div>

      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${SUBJECTS.filter((x) => subjectSummary(state, x.id).total).length > 5 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
        {SUBJECTS.map((s) => {
          const sum = subjectSummary(state, s.id);
          if (!sum.total) return null;
          const pct = sum.total ? Math.round((sum.mastered / sum.total) * 100) : 0;
          return (
            <button key={s.id} onClick={() => onIsland(s.id)} className="flex flex-col items-center gap-2 rounded-[2rem] p-4 shadow-md transition active:scale-95" style={{ background: s.soft }}>
              <span className="text-6xl">{s.icon}</span>
              <span className="text-center font-kid text-lg font-bold leading-tight" style={{ color: s.color }}>
                {s.kidTitle}
              </span>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 4)}%`, background: s.color }} />
              </div>
              <span className="font-kid text-xs font-bold text-slate-500">
                {sum.mastered} of {sum.total} ⭐
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={onExplore} className="explore-entry text-left" aria-label="Open Build and Explore">
        <div className="explore-entry-art"><AirportPicture /></div>
        <div><p className="growth-eyebrow">Create &amp; discover</p><h2 className="font-kid text-2xl font-semibold text-teal-950">Build &amp; Explore</h2>
          <p className="mt-1 text-sm text-slate-600">Design an airport. Test your ideas.</p><span className="mt-3 inline-block font-bold text-teal-800">Let’s build →</span></div>
      </button>
      <div className="mt-auto flex justify-end">
        <button onClick={onGrownUps} className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 shadow">
          🔒 Grown-ups
        </button>
      </div>
    </div>
  );
}
