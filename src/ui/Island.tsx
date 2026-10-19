import React from 'react';
import { getSubject, skillsFor } from '../content';
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

export function Island({ state, subject, onBack, onPlay }: { state: AppState; subject: SubjectId; onBack: () => void; onPlay: (skill: Skill) => void }) {
  const meta = getSubject(subject);
  const skills = skillsFor(subject).filter((s) => isVisible(state, s));

  const tap = (skill: Skill, status: SkillStatus) => {
    if (status === 'locked') {
      soundEngine.speak('This one is still locked. Practice the stones before it first!');
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
        <h1 className="font-kid text-3xl font-bold" style={{ color: meta.color }}>
          {meta.kidTitle}
        </h1>
      </header>

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
                  return (
                    <button key={skill.id} onClick={() => tap(skill, status)} className="flex w-28 flex-col items-center gap-1.5">
                      <span
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-md transition active:scale-90 ${STATUS_STYLE[status]}`}
                        style={status === 'learning' ? ({ '--tw-ring-color': meta.color } as React.CSSProperties) : undefined}
                      >
                        {status === 'locked' ? '🔒' : skill.icon}
                        {skill.grade !== 'K' && <span className="absolute -left-1 -top-1 rounded-full bg-slate-700 px-1.5 text-[10px] font-bold text-white">G{skill.grade}</span>}
                        {status === 'mastered' && <span className="absolute -bottom-1 -right-1 text-2xl">⭐</span>}
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
