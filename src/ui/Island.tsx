import React, { useState } from 'react';
import { CURRICULA, getSubject, skillsFor } from '../content';
import type { Skill, SubjectId } from '../content/types';
import { isVisible, skillStatus } from '../engine/planner';
import type { SkillStatus } from '../engine/planner';
import type { AppState } from '../engine/progress';
import { skillState } from '../engine/progress';
import { soundEngine } from '../utils/audio';

const STATUS_STYLE: Record<SkillStatus, string> = {
  locked: 'bg-slate-200 grayscale opacity-60',
  ready: 'bg-white ring-4 ring-amber-300 animate-[pulse_2.5s_ease-in-out_infinite]',
  learning: 'bg-white ring-4',
  mastered: 'bg-amber-200 ring-4 ring-amber-400',
  review: 'bg-amber-100 ring-4 ring-sky-400',
};

export function Island({ state, subject, onBack, onPlay, onSkip }: { state: AppState; subject: SubjectId; onBack: () => void; onPlay: (skill: Skill) => void; onSkip: (skill: Skill) => void }) {
  const [skipMode, setSkipMode] = useState(false);
  const meta = getSubject(subject);
  const skills = skillsFor(subject).filter((s) => isVisible(state, s));
  const curriculum = CURRICULA[state.settings.primary];

  const tap = (skill: Skill, status: SkillStatus) => {
    // In skip-ahead mode even locked stones can be tried: proving it unlocks the path.
    // Stones already done can't be skipped, and must not fall through to practice.
    if (skipMode) {
      if (status === 'mastered' || status === 'review') {
        soundEngine.speak('You already know this one! Tap a different stone to skip.');
        return;
      }
      soundEngine.playTap();
      onSkip(skill);
      return;
    }
    if (status === 'locked') {
      soundEngine.speak('This one is still locked. Practice the stones before it first, or use Skip ahead!');
      return;
    }
    soundEngine.playTap();
    onPlay(skill);
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center gap-4">
        <button onClick={onBack} aria-label="Back" className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow">
          ←
        </button>
        <span className="text-5xl">{meta.icon}</span>
        <h1 className="flex-1 font-kid text-3xl font-bold" style={{ color: meta.color }}>
          {meta.kidTitle}
        </h1>
        <button
          onClick={() => {
            const next = !skipMode;
            setSkipMode(next);
            if (next) soundEngine.speak('Skip ahead! Tap something you already know. Get three hard questions right, and you can skip it!');
          }}
          aria-pressed={skipMode}
          className={`rounded-full px-4 py-2 font-kid text-lg font-bold shadow transition ${skipMode ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200' : 'bg-white text-slate-600'}`}
        >
          ⚡ {skipMode ? 'Skip-ahead on' : 'Skip ahead'}
        </button>
      </header>
      {skipMode && (
        <div className="mb-4 rounded-2xl bg-amber-100 px-4 py-2 text-center font-kid text-lg font-bold text-amber-900">
          Tap a stone you already know. Get 3 hard questions right to skip it!
        </div>
      )}

      <div className="flex flex-col gap-6">
        {meta.strands.map((strand) => {
          const list = skills.filter((s) => s.strand === strand.id);
          if (!list.length) return null;
          return (
            <section key={strand.id} className="rounded-[2rem] p-4 shadow-sm" style={{ background: meta.soft }}>
              <h2 className="mb-3 font-kid text-lg font-bold text-slate-600">{strand.title}</h2>
              <div className="flex flex-wrap gap-4">
                {list.map((skill) => {
                  const status = skillStatus(state, skill);
                  const level = skillState(state, skill.id).level;
                  const done = status === 'mastered' || status === 'review';
                  return (
                    <button key={skill.id} onClick={() => tap(skill, status)} className={`flex w-28 flex-col items-center gap-1.5 transition ${skipMode && done ? 'opacity-35' : ''}`}>
                      <span
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-md transition active:scale-90 ${STATUS_STYLE[status]}`}
                        style={status === 'learning' ? ({ '--tw-ring-color': meta.color } as React.CSSProperties) : undefined}
                      >
                        {status === 'locked' && !skipMode ? '🔒' : skill.icon}
                        {skill.grade !== 'K' && <span className="absolute -left-1 -top-1 rounded-full bg-slate-700 px-1.5 text-[10px] font-bold text-white">{curriculum.gradeBadge[skill.grade]}</span>}
                        {skill.regions?.includes('in-cbse') && <span className="absolute -right-1 -top-1 text-sm">🇮🇳</span>}
                        {(state.settings.focus ?? []).includes(skill.id) && <span className="absolute -right-2 top-5 text-lg">📌</span>}
                        {status === 'mastered' && <span className="absolute -bottom-1 -right-1 text-2xl">{skillState(state, skill.id).known ? '⚡' : '⭐'}</span>}
                        {status === 'review' && <span className="absolute -bottom-1 -right-1 rounded-full bg-sky-500 px-1 text-sm text-white">↻</span>}
                      </span>
                      <span className="text-center font-kid text-sm font-bold leading-tight text-slate-700">{skill.kidTitle}</span>
                      {status === 'learning' && (
                        <span className="text-xs">
                          {[1, 2, 3].map((l) => (
                            <span key={l} className={l <= level ? '' : 'opacity-25'}>
                              ⭐
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
