import React, { useRef, useState } from 'react';
import { ALL_SKILLS, GRADE_LABEL, SUBJECTS, getSkill, getSubject } from '../content';
import type { SubjectId } from '../content/types';
import { describeMisconception } from '../content/misconceptions';
import { focusSkills, isVisible, skillStatus, subjectSummary, topMisconceptions, weakestSkills } from '../engine/planner';
import type { SkillStatus } from '../engine/planner';
import type { AppState, Band } from '../engine/progress';
import { MASTERY, accuracy, attemptsFor, dayKey, emptyState, skillState } from '../engine/progress';
import { AVATARS } from './Setup';
import { QuestionBank } from './QuestionBank';

type Tab = 'overview' | 'focus' | 'checkups' | 'skills' | 'bank' | 'settings';

interface Props {
  state: AppState;
  setState: (s: AppState) => void;
  onClose: () => void;
  onStartCheckup: (subject: SubjectId) => void;
}

const pct = (x: number) => `${Math.round(x * 100)}%`;
const BAND_STYLE: Record<Band, string> = {
  Strong: 'bg-emerald-100 text-emerald-800',
  'On track': 'bg-sky-100 text-sky-800',
  Growing: 'bg-amber-100 text-amber-800',
  'Needs practice': 'bg-rose-100 text-rose-800',
};
const STATUS_LABEL: Record<SkillStatus, string> = { locked: 'Locked', ready: 'Ready', learning: 'Learning', mastered: 'Mastered', review: 'Review due' };

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Overview({ state }: { state: AppState }) {
  const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = state.attempts.filter((a) => a.ts >= week && a.mode !== 'checkup');
  const daysThisWeek = new Set(recent.map((a) => dayKey(a.ts))).size;
  const mastered = ALL_SKILLS.filter((s) => skillState(state, s.id).mastered).length;
  const stats = [
    { label: 'Days practised (7d)', value: `${daysThisWeek}/7` },
    { label: 'Questions (7d)', value: recent.length },
    { label: 'First-try accuracy (7d)', value: recent.length ? pct(accuracy(recent)) : '—' },
    { label: 'Skills mastered', value: `${mastered}/${ALL_SKILLS.filter((s) => isVisible(state, s)).length}` },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
      {SUBJECTS.map((subject) => {
        const sum = subjectSummary(state, subject.id);
        return (
          <Card key={subject.id} title={`${subject.icon} ${subject.title}`} right={<span className="text-xs font-semibold text-slate-500">{sum.mastered} mastered · {sum.learning} learning · {sum.ready} ready · {sum.locked} locked</span>}>
            <div className="flex flex-col gap-2">
              {subject.strands.map((st) => {
                const skills = ALL_SKILLS.filter((s) => s.subject === subject.id && s.strand === st.id && isVisible(state, s));
                const list = skills.flatMap((s) => attemptsFor(state, s.id)).filter((a) => a.mode !== 'checkup').slice(-30);
                const done = skills.filter((s) => skillState(state, s.id).mastered).length;
                return (
                  <div key={st.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-sm sm:grid-cols-[14rem_minmax(0,1fr)_7rem]">
                    <span className="font-medium text-slate-700">{st.title}</span>
                    <div className="order-3 col-span-2 h-2.5 overflow-hidden rounded-full bg-slate-100 sm:order-none sm:col-span-1">
                      <div className="h-full rounded-full" style={{ width: `${skills.length ? (done / skills.length) * 100 : 0}%`, background: subject.color }} />
                    </div>
                    <span className="text-right text-xs text-slate-500">
                      {done}/{skills.length} · {list.length ? pct(accuracy(list)) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
      <p className="text-xs text-slate-500">
        Bars show skills mastered. Percent is first-try accuracy over the last 30 practice questions in that strand. Mastery rule: ≥{pct(MASTERY.accuracy)} over the last {MASTERY.window} tries, at least {MASTERY.minHardAttempts} at level 2+, correct on {MASTERY.minDays}+ different days.
      </p>
    </div>
  );
}

function Focus({ state }: { state: AppState }) {
  const weak = weakestSkills(state);
  const tags = topMisconceptions(state);
  const next = focusSkills(state).slice(0, 6);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Needs attention">
        {weak.length === 0 ? (
          <p className="text-sm text-slate-500">Not enough practice yet. After a few Quests, skills with low accuracy show up here.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {weak.map((w) => (
              <li key={w.skill.id} className="text-sm">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>
                    {w.skill.icon} {w.skill.title}
                  </span>
                  <span className="text-rose-600">{pct(w.accuracy)}</span>
                </div>
                <div className="text-slate-500">Try at home: {w.skill.parentTip}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Mistake patterns (last 30 days)">
        {tags.length === 0 ? (
          <p className="text-sm text-slate-500">No repeated mistake patterns yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tags.map((t) => {
              const info = describeMisconception(t.tag);
              return (
                <li key={t.tag} className="text-sm">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{info.title}</span>
                    <span className="text-slate-500">×{t.count}</span>
                  </div>
                  <div className="text-xs text-slate-500">In: {t.skills.map((s) => getSkill(s)?.kidTitle).join(', ')}</div>
                  {info.fix && <div className="text-slate-600">Fix: {info.fix}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Card title="Ready to learn next">
        <ul className="flex flex-col gap-2 text-sm">
          {next.map((s) => (
            <li key={s.id} className="flex items-start gap-2">
              <span>{s.icon}</span>
              <div>
                <div className="font-semibold text-slate-800">
                  {s.title} <span className="text-xs font-normal text-slate-400">{getSubject(s.subject).title} · {GRADE_LABEL[s.grade]}</span>
                </div>
                <div className="text-slate-500">{s.parentTip}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Checkups({ state, onStart }: { state: AppState; onStart: (s: SubjectId) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card title="Start a Check-up">
        <p className="mb-3 text-sm text-slate-600">
          About 12 adaptive questions, no hints or feedback — like the i-Ready Diagnostic format. Hand the device to your child after tapping a subject. Results are a practice signal, not an official score.
        </p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => onStart(s.id)} className="rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: s.color }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>
      </Card>
      {state.checkups.length === 0 && <p className="text-sm text-slate-500">No check-ups yet.</p>}
      {[...state.checkups].reverse().map((c) => {
        const subject = getSubject(c.subject as SubjectId);
        return (
          <Card key={c.id} title={`${subject.icon} ${subject.title} · ${new Date(c.ts).toLocaleDateString()}`} right={<span className="text-sm font-semibold text-slate-600">{c.correct}/{c.total} correct</span>}>
            <div className="flex flex-wrap gap-2">
              {c.strands.map((s) => (
                <span key={s.strand} className={`rounded-full px-3 py-1 text-xs font-bold ${BAND_STYLE[s.band]}`}>
                  {s.title}: {s.band}
                </span>
              ))}
            </div>
            {c.misconceptions.length > 0 && (
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-semibold">Patterns: </span>
                {c.misconceptions.map((m) => describeMisconception(m.tag).title).join(' · ')}
              </div>
            )}
            {c.recommend.length > 0 && (
              <div className="mt-1 text-sm text-slate-600">
                <span className="font-semibold">Practise next: </span>
                {c.recommend.map((id) => getSkill(id)?.title).join(' · ')}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function SkillMap({ state }: { state: AppState }) {
  return (
    <div className="flex flex-col gap-4">
      {SUBJECTS.map((subject) => (
        <Card key={subject.id} title={`${subject.icon} ${subject.title}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-1 pr-2">Skill</th>
                  <th className="pr-2">Grade</th>
                  <th className="pr-2">Standards</th>
                  <th className="pr-2">Status</th>
                  <th className="pr-2">Level</th>
                  <th className="pr-2">Tries</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {ALL_SKILLS.filter((s) => s.subject === subject.id).map((s) => {
                  const list = attemptsFor(state, s.id).filter((a) => a.mode !== 'checkup');
                  const st = skillState(state, s.id);
                  return (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="py-1.5 pr-2 font-medium text-slate-800">
                        {s.icon} {s.title}
                      </td>
                      <td className="pr-2 text-slate-500">{s.grade}</td>
                      <td className="pr-2 text-xs text-slate-500">{s.standards.join(', ')}</td>
                      <td className="pr-2">{STATUS_LABEL[skillStatus(state, s)]}{st.credited && !st.mastered ? ' (credited)' : ''}</td>
                      <td className="pr-2">{st.level}</td>
                      <td className="pr-2">{list.length}</td>
                      <td>{list.length ? pct(accuracy(list.slice(-10))) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Settings({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const set = (patch: Partial<AppState['settings']>) => setState({ ...state, settings: { ...state.settings, ...patch } });
  const toggle = (label: string, hint: string, key: keyof AppState['settings']) => (
    <label className="flex items-start justify-between gap-4 py-2">
      <span>
        <span className="block font-semibold text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
      <input type="checkbox" className="mt-1 h-5 w-5" checked={state.settings[key]} onChange={(e) => set({ [key]: e.target.checked })} />
    </label>
  );
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `learning-quest-backup-${dayKey(Date.now())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppState;
      if (parsed.version !== 1 || !Array.isArray(parsed.attempts)) throw new Error('not a backup');
      setState({ ...emptyState(), ...parsed });
      setMsg('Backup restored.');
    } catch {
      setMsg('That file is not a Learning Quest backup.');
    }
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Child">
        <label className="block text-sm font-semibold text-slate-600">
          Name
          <input
            value={state.profile?.name ?? ''}
            onChange={(e) => setState({ ...state, profile: { avatar: '🦁', createdAt: Date.now(), ...state.profile, name: e.target.value } })}
            className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setState({ ...state, profile: { name: 'Explorer', createdAt: Date.now(), ...state.profile, avatar: a } })}
              className={`h-12 rounded-xl text-2xl ${state.profile?.avatar === a ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-50'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Card>
      <Card title="Learning">
        {toggle('Show Grade 1–2 stretch skills', 'Stretch skills still unlock only after their prerequisites.', 'showStretch')}
        {toggle('Unlock every skill', 'Skip prerequisites (useful if he already knows earlier skills).', 'unlockAll')}
        {toggle('Mute sound', 'Turns off speech and sound effects. Not recommended for non-readers.', 'muted')}
      </Card>
      <Card title="Backup">
        <p className="mb-3 text-sm text-slate-600">Progress is saved in this browser only. Download a backup now and then, and restore it on a new device.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
            Download backup
          </button>
          <button onClick={() => fileRef.current?.click()} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
            Restore backup…
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </div>
        {msg && <p className="mt-2 text-sm font-semibold text-slate-600">{msg}</p>}
      </Card>
      <Card title="Reset">
        <p className="mb-3 text-sm text-slate-600">Erases all progress, stars and check-ups on this device.</p>
        <button
          onClick={() => {
            if (window.confirm('Erase all progress? This cannot be undone.')) setState({ ...emptyState(), profile: state.profile });
          }}
          className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700"
        >
          Reset progress
        </button>
      </Card>
    </div>
  );
}

export function Parent({ state, setState, onClose, onStartCheckup }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'focus', label: 'Focus areas' },
    { id: 'checkups', label: 'Check-ups' },
    { id: 'skills', label: 'Skill map' },
    { id: 'bank', label: 'Question bank' },
    { id: 'settings', label: 'Settings' },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="text-2xl">{state.profile?.avatar}</span>
          <h1 className="flex-1 text-lg font-bold text-slate-800">{state.profile?.name ?? 'Child'} · Parent dashboard</h1>
          <button onClick={onClose} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
            Back to kid mode
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5">
        {tab === 'overview' && <Overview state={state} />}
        {tab === 'focus' && <Focus state={state} />}
        {tab === 'checkups' && <Checkups state={state} onStart={onStartCheckup} />}
        {tab === 'skills' && <SkillMap state={state} />}
        {tab === 'bank' && <QuestionBank />}
        {tab === 'settings' && <Settings state={state} setState={setState} />}
      </main>
    </div>
  );
}
