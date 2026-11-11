import React from 'react';
import { getSkill } from '../content';
import { describeMisconception } from '../content/misconceptions';
import type { MockResult, MockSubject } from '../engine/mock';
import { mockTotal } from '../engine/mock';
import { isVisible } from '../engine/planner';
import type { AppState } from '../engine/progress';

const DAY = 24 * 60 * 60 * 1000;
/** Skills behind the areas he still needs: time, money, patterns. */
export const PREP_FOCUS = ['m.timepatterns', 'm1.time', 'm2.time5', 'm1.coins', 'm2.money', 'm.pattern', 'm1.patternrule', 'm1.growpattern'];

const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export function IReadyPrep({ state, setState, onStartMock }: { state: AppState; setState: (s: AppState) => void; onStartMock: (s: MockSubject) => void }) {
  const set = (patch: Partial<AppState['settings']>) => setState({ ...state, settings: { ...state.settings, ...patch } });
  const testDate = state.settings.iReadyDate ? new Date(`${state.settings.iReadyDate}T09:00:00`) : null;
  const daysLeft = testDate ? Math.ceil((testDate.getTime() - Date.now()) / DAY) : null;
  const pinned = state.settings.focus ?? [];
  const run = state.mockRun;
  const mocks = state.mocks ?? [];

  const schedule = testDate
    ? [
        { when: new Date(), what: 'Baseline mock (Math one day, Reading another)' },
        { when: new Date(testDate.getTime() - 21 * DAY), what: 'Mid-point mock: check time, money, patterns' },
        { when: new Date(testDate.getTime() - 7 * DAY), what: 'Final mock, then light practice only' },
        { when: new Date(testDate.getTime() - 1 * DAY), what: 'Rest day: no tests, early bedtime' },
      ].filter((x) => x.when.getTime() >= Date.now() - DAY || x.what.startsWith('Baseline'))
    : [];

  return (
    <div className="flex flex-col gap-4">
      <Card title="📅 School i-Ready date">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            aria-label="i-Ready test date"
            value={state.settings.iReadyDate ?? ''}
            onChange={(e) => set({ iReadyDate: e.target.value || undefined })}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          {daysLeft !== null && <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-800">{daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? 'Today!' : 'Date has passed'}</span>}
        </div>
        {schedule.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
            {schedule.map((s) => (
              <li key={s.what}>
                <span className="inline-block w-28 font-semibold text-slate-500">{fmt(s.when)}</span> {s.what}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Keep it light: one subject per sitting, stop at any stretch break, and keep daily Quests to about 10 minutes. Calm practice beats cramming at this age.
        </p>
      </Card>

      <Card title="📝 Mock i-Ready test">
        <p className="mb-3 text-sm text-slate-600">
          This app's practice check reads questions aloud without hints or feedback and adjusts difficulty within each area. About {mockTotal('math')} Math or {mockTotal('reading')} Reading questions, with a stretch break every 12. He can stop at a break and continue another day. Results describe this small sample of app questions; they do not predict an i-Ready score or readiness.
        </p>
        <div className="flex flex-wrap gap-2">
          {(['math', 'reading'] as const).map((subject) => {
            const resume = run && run.subject === subject;
            return (
              <button key={subject} onClick={() => onStartMock(subject)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
                {resume ? `▶ Resume ${subject === 'math' ? 'Math' : 'Reading'} (${run!.answers.length}/${mockTotal(subject)})` : `Start ${subject === 'math' ? 'Math' : 'Reading'} mock`}
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        title="📌 Focus pins"
        right={
          <button
            onClick={() => set({ focus: [...new Set([...pinned, ...PREP_FOCUS.filter((id) => { const k = getSkill(id); return k && isVisible(state, k); })])] })}
            className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900"
          >
            📌 Focus: time, money, patterns
          </button>
        }
      >
        <p className="mb-2 text-sm text-slate-600">One pinned skill leads every daily Quest (rotating each day). Pin from here, from mock results, or in the Skill map.</p>
        {pinned.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing pinned yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pinned.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-900 ring-1 ring-amber-200">
                {getSkill(id)?.icon} {getSkill(id)?.title}
                <button aria-label={`Unpin ${getSkill(id)?.title}`} onClick={() => set({ focus: pinned.filter((p) => p !== id) })} className="ml-1 font-bold">
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {(['math', 'reading'] as const).map((subject) => {
        const list = mocks.filter((m) => m.subject === subject);
        if (!list.length) return null;
        const latest = list[list.length - 1];
        return <MockReport key={subject} latest={latest} history={list} pinned={pinned} onPin={(id) => set({ focus: [...new Set([...pinned, id])] })} />;
      })}
    </div>
  );
}

function MockReport({ latest, history, pinned, onPin }: { latest: MockResult; history: MockResult[]; pinned: string[]; onPin: (id: string) => void }) {
  return <Card title={`${latest.subject === 'math' ? '🔢 Math' : '📚 Reading'} mock · ${new Date(latest.ts).toLocaleDateString()}`}>
    <p className="mb-3 text-sm text-slate-600">These results describe questions in this app, not an i-Ready score or a readiness prediction.</p>
    <div className="flex flex-col gap-2">{latest.domains.map(d => <div key={d.strand} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{d.title}</strong><div>{d.freshTotal === undefined ? 'Question familiarity was not tracked for this result.' : `${d.freshCorrect}/${d.freshTotal} correct on fresh questions · ${d.repeated ?? 0} familiar or uncertain · ${d.untracked ?? 0} untracked`}</div></div>)}</div>
    <p className="mt-2 text-xs text-slate-500">Familiar and untracked questions are not counted as fresh independent evidence.</p>
    {latest.misconceptions.length > 0 && <p className="mt-3 text-sm text-slate-700"><strong>Mistake patterns: </strong>{latest.misconceptions.slice(0, 4).map(m => describeMisconception(m.tag).title).join(' · ')}</p>}
    {latest.practice.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700"><span className="font-semibold">Practise next:</span>{latest.practice.map(id => <button key={id} onClick={() => onPin(id)} disabled={pinned.includes(id)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:bg-amber-50 disabled:text-amber-800">{pinned.includes(id) ? '📌' : '+ 📌'} {getSkill(id)?.title}</button>)}</div>}
    {history.length > 1 && <div className="mt-4 space-y-2 text-xs text-slate-600"><strong>Previous checks</strong>{history.slice(0, -1).map(m => <div key={m.id}><p>{new Date(m.ts).toLocaleDateString()} · {m.repeated === undefined ? 'familiarity not tracked' : `${m.repeated} familiar or uncertain, ${m.untracked ?? 0} untracked`}</p><p>{m.domains.map(d => `${d.title}: ${d.correct}/${d.total} correct (all questions)`).join(' · ')}</p></div>)}</div>}
  </Card>;
}
