import React from 'react';
import { SUBJECTS } from '../content';
import type { SubjectId } from '../content/types';
import { subjectSummary } from '../engine/planner';
import { GAMES } from './games/Games';
import { isNewGame } from '../games/brain';
import type { AppState, GameId } from '../engine/progress';
import { AirportPicture } from './airport/AirportArt';
import { dailyGoal, gentleStreak, goalMet, overScreenLimit, playLocked, questsToday, starsToSpend, weekStrip } from '../engine/engagement';
import type { DayMark } from '../engine/engagement';

const MARK: Record<DayMark, { icon: string; label: string; cls: string }> = {
  done: { icon: '⭐', label: 'learned', cls: 'bg-amber-100' },
  rest: { icon: '💤', label: 'rest day', cls: 'bg-sky-100' },
  missed: { icon: '', label: 'no learning', cls: 'bg-white/70' },
  today: { icon: '', label: 'today, not yet', cls: 'bg-white ring-2 ring-amber-400' },
};

interface Props {
  state: AppState;
  onResumeGame?: (id: GameId) => void;
  onQuest: () => void;
  onExplore: () => void;
  onGames: () => void;
  onIsland: (id: SubjectId) => void;
  onGrownUps: () => void;
  onStickers?: () => void;
}

export function Home({ state, onQuest, onGames, onIsland, onGrownUps, onExplore, onResumeGame, onStickers }: Props) {
  const saved = state.lastGame && isNewGame(state.lastGame) ? state.brainRuns?.[state.lastGame] : undefined;
  const resume = state.lastGame === 'garden-kitchen' && state.garden ? GAMES.find(game => game.id === 'garden-kitchen') : saved && saved.round < 4 && !(saved.round === 3 && saved.board.status !== 'playing')
    ? GAMES.find(game => game.id === state.lastGame) : undefined;
  const name = state.profile?.name?.trim() || 'Explorer';
  const streak = gentleStreak(state);
  const done = goalMet(state);
  const locked = playLocked(state);
  const goal = dailyGoal(state);
  const today = Math.min(questsToday(state), goal);
  const steps = [
    { label: 'Today’s learning', state: done ? 'done' : 'now' },
    { label: 'A game you pick', state: locked ? 'later' : done ? 'now' : 'open' },
    { label: 'Free play', state: locked ? 'later' : 'open' },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-md">{state.profile?.avatar ?? '🦁'}</div>
        <div className="flex-1">
          <h1 className="font-kid text-3xl font-bold text-slate-800 sm:text-4xl">Hi, {name}!</h1>
          <p className="font-kid text-lg text-slate-500">{streak > 1 ? `${streak} days of learning in a row!` : 'A new day. A new discovery.'}</p>
        </div>
        {onStickers && (
          <button onClick={onStickers} className="flex flex-col items-center rounded-2xl bg-white px-3 py-2 shadow" aria-label={`Sticker book, ${starsToSpend(state)} stars to spend`}>
            <span className="text-3xl">📒</span>
            <span className="font-kid text-sm font-bold text-amber-500">{starsToSpend(state)} ⭐</span>
          </button>
        )}

      </header>


      <ol aria-label="This week" className="flex justify-between gap-1 rounded-[2rem] bg-white/60 p-3 shadow-sm sm:justify-start sm:gap-3">
        {weekStrip(state).map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1" aria-label={`${d.label}: ${MARK[d.mark].label}`}>
            <span className="font-kid text-xs font-bold text-slate-500">{d.label}</span>
            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${MARK[d.mark].cls}`}>{MARK[d.mark].icon}</span>
          </li>
        ))}
      </ol>

      {overScreenLimit(state) && <p role="status" className="rounded-2xl bg-sky-100 px-4 py-3 font-kid text-lg font-semibold text-sky-900">🌙 That’s lots of screen time today. Time to rest your eyes and play outside!</p>}

      <div className="mt-2"><p className="growth-eyebrow">Today’s path</p>
        <ol className="flex flex-wrap items-center gap-2 font-kid text-base font-semibold">
          {steps.map((step, i) => (
            <li key={step.label} className={`rounded-full px-3 py-1 ${step.state === 'done' ? 'bg-emerald-100 text-emerald-800' : step.state === 'now' ? 'bg-amber-100 text-amber-900' : step.state === 'later' ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-600'}`}>
              {step.state === 'done' ? '✓' : step.state === 'later' ? '🔒' : `${i + 1}.`} {step.label}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
      <button
        onClick={onQuest}
        className="group relative overflow-hidden rounded-[2.5rem] sm:col-span-2 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-left shadow-xl transition active:scale-[0.98] sm:p-8"
      >
        <div className="absolute -right-6 -top-6 text-[9rem] opacity-30 transition group-hover:rotate-12">🗺️</div>
        <div className="font-kid text-sm font-bold uppercase tracking-widest text-white/80">Math, reading & discovery · 8 questions{goal > 1 ? ` · ${today} of ${goal} done` : ''}</div>
        <div className="mt-1 font-kid text-4xl font-bold text-white sm:text-5xl">Today’s learning{done ? ' ✓' : ''}</div>
        <div className="mt-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg">▶</div>
      </button>
        <button
          onClick={onGames}
          disabled={locked}
          aria-label={locked ? 'Brain Games: open after today’s learning' : undefined}
          className="relative flex disabled:opacity-60 flex-col justify-between overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 p-6 text-left shadow-xl transition active:scale-[0.98]"
        >
          <div className="absolute -bottom-4 -right-4 text-[7rem] opacity-30">🧩</div>
          <div className="font-kid text-sm font-bold uppercase tracking-widest text-white/80">Brain Games</div>
          <div className="mt-1 font-kid text-3xl font-bold leading-tight text-white">Word, number &amp; thinking puzzles</div>
          <div className="mt-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-lg">{locked ? '🔒' : '🎮'}</div>
          {locked && <div className="mt-2 font-kid text-sm font-bold text-white">Opens after today’s learning</div>}
        </button>
      </div>

      {resume && onResumeGame && !locked && <button className="growth-secondary self-start" onClick={() => onResumeGame(resume.id)}>Continue playing · {resume.title} →</button>}

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

      <button onClick={onExplore} disabled={locked} className="explore-entry text-left disabled:opacity-60" aria-label={locked ? 'Build and Explore: open after today’s learning' : 'Open Build and Explore'}>
        <div className="explore-entry-art"><AirportPicture /></div>
        <div><p className="growth-eyebrow">Create &amp; discover</p><h2 className="font-kid text-2xl font-semibold text-teal-950">Build &amp; Explore</h2>
          <p className="mt-1 text-sm text-slate-600">Design an airport. Test your ideas.</p><span className="mt-3 inline-block font-bold text-teal-800">{locked ? '🔒 Opens after today’s learning' : 'Let’s build →'}</span></div>
      </button>
      <div className="mt-auto flex justify-end">
        <button onClick={onGrownUps} className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-500 shadow">
          🔒 Grown-ups
        </button>
      </div>
    </div>
  );
}
