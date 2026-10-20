import React, { useEffect, useState } from 'react';
import type { Skill } from '../content/types';
import { soundEngine } from '../utils/audio';
import { Visual } from './Visual';
import { SpeakButton } from './SpeakButton';
import { localizeDeep } from '../content/curricula';

/** "Let's learn" slides shown the first time a skill comes up. */
export function Intro({ skill, color, locale, onDone }: { skill: Skill; color: string; locale: 'en-US' | 'en-IN'; onDone: () => void }) {
  const [i, setI] = useState(0);
  const raw = skill.intro[i];
  const slide = localizeDeep(raw, locale);
  const last = i === skill.intro.length - 1;

  useEffect(() => {
    soundEngine.speak(`${i === 0 ? `Let's learn: ${skill.kidTitle}! ` : ''}${slide.say}`);
    return () => soundEngine.stopSpeech();
  }, [i, skill, slide.say]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full px-5 py-2 font-kid text-lg font-bold text-white" style={{ background: color }}>
        {skill.icon} Let’s learn: {skill.kidTitle}
      </div>
      <div className="flex min-h-[220px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-[2rem] bg-white p-6 shadow-lg">
        {slide.visual && <Visual v={slide.visual} />}
        {slide.caption && <div className="font-kid text-lg font-bold text-rose-500">{slide.caption}</div>}
        <p className="max-w-xl font-kid text-xl text-slate-700">{slide.say}</p>
      </div>
      <div className="flex items-center gap-4">
        <SpeakButton text={slide.say} />
        <button
          onClick={() => (last ? onDone() : setI(i + 1))}
          className="rounded-full px-8 py-4 font-kid text-2xl font-bold text-white shadow-lg transition active:scale-95"
          style={{ background: color }}
        >
          {last ? (locale === 'en-IN' ? 'Let’s practise! ▶' : 'Let’s practice! ▶') : 'Next ▶'}
        </button>
      </div>
      <div className="flex gap-2">
        {skill.intro.map((_, k) => (
          <span key={k} className={`h-2.5 w-2.5 rounded-full ${k === i ? 'bg-slate-700' : 'bg-slate-300'}`} />
        ))}
      </div>
    </div>
  );
}
