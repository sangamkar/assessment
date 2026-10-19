import React, { useMemo, useState } from 'react';
import { ALL_SKILLS, SUBJECTS } from '../content';
import type { Difficulty, Item, SubjectId } from '../content/types';
import { describeMisconception } from '../content/misconceptions';
import { createRng } from '../engine/rng';
import { SpeakButton } from './SpeakButton';
import { Visual } from './Visual';

/** Parent/teacher review of every question: prompt, picture, correct answer, and what each wrong answer reveals. */
export function QuestionBank() {
  const [subject, setSubject] = useState<SubjectId>('math');
  const skills = ALL_SKILLS.filter((s) => s.subject === subject);
  const [skillId, setSkillId] = useState(skills[0].id);
  const [seed, setSeed] = useState(1);
  const skill = ALL_SKILLS.find((s) => s.id === skillId) ?? skills[0];

  const list = useMemo(() => {
    const out: { item: Item; generated: boolean }[] = (skill.items ?? []).map((item) => ({ item, generated: false }));
    if (skill.generate) {
      const rng = createRng(seed);
      ([1, 2, 3] as Difficulty[]).forEach((d) => {
        for (let tries = 0, added = 0; added < 2 && tries < 10; tries++) {
          const item = skill.generate!(rng, d);
          if (out.some((x) => x.item.id === item.id)) continue;
          out.push({ item, generated: true });
          added++;
        }
      });
    }
    return out.sort((a, b) => a.item.difficulty - b.item.difficulty);
  }, [skill, seed]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <label className="text-sm font-semibold text-slate-600">
          Subject
          <select
            value={subject}
            onChange={(e) => {
              const next = e.target.value as SubjectId;
              setSubject(next);
              setSkillId(ALL_SKILLS.find((s) => s.subject === next)!.id);
            }}
            className="mt-1 block rounded-lg border border-slate-300 px-2 py-1.5"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-600">
          Skill
          <select value={skill.id} onChange={(e) => setSkillId(e.target.value)} className="mt-1 block max-w-xs rounded-lg border border-slate-300 px-2 py-1.5">
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.regions ? '🇮🇳 ' : ''}
                {s.grade === 'K' ? '' : `[G${s.grade}] `}
                {s.title}
              </option>
            ))}
          </select>
        </label>
        {skill.generate && (
          <button onClick={() => setSeed((x) => x + 1)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            ↻ New generated samples
          </button>
        )}
        <div className="ml-auto text-xs text-slate-500">
          {skill.standards.join(', ')} · {skill.items?.length ?? 0} written{skill.generate ? ' + unlimited generated' : ''}
        </div>
      </div>

      {list.map(({ item, generated }) => (
        <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-white">Level {item.difficulty}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{generated ? 'Generated' : 'Written'}</span>
            {item.speakChoices === false && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Choices not read aloud</span>}
            <span className="text-slate-400">{item.id}</span>
          </div>
          <div className="flex items-start gap-3">
            <SpeakButton text={item.say} extra={item.voice} />
            <div>
              <div className="font-semibold text-slate-800">
                🔊 “{item.say}”{item.voice && <span className="ml-1 text-teal-700"> + {item.voice.lang === 'hi-IN' ? 'Hindi' : item.voice.lang} voice: “{item.voice.text}”</span>}
              </div>
              {item.show && <div className="text-sm text-slate-500">On screen: {item.show}</div>}
            </div>
          </div>
          {item.visual && (
            <div className="mt-3 flex justify-center overflow-x-auto rounded-xl bg-slate-50 p-3">
              <Visual v={item.visual} size="md" />
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {item.choices.map((c) => (
              <div key={c.id} className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center ring-2 ${c.correct ? 'bg-emerald-50 ring-emerald-400' : 'bg-white ring-slate-200'}`}>
                <div className="flex min-h-[64px] items-center">
                  {c.visual ? <Visual v={c.visual} size="sm" /> : <span className="font-reader text-2xl font-bold">{c.text}</span>}
                </div>
                <div className={`text-xs font-semibold ${c.correct ? 'text-emerald-700' : 'text-slate-500'}`}>{c.correct ? '✓ Correct' : describeMisconception(c.why ?? '').title}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-amber-50 p-2 text-sm text-amber-900">
            <span className="font-semibold">Feedback: </span>
            {item.hint && <span>Hint “{item.hint}” · </span>}
            {item.explain}
          </div>
        </div>
      ))}
    </div>
  );
}
