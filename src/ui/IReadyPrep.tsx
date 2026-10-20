import React from 'react';
import { getSkill } from '../content';
import { describeMisconception } from '../content/misconceptions';
import type { MockResult, MockSubject } from '../engine/mock';
import { LADDER_MAX, MOCK_DOMAINS, expectedLevel, levelLabel, mockTotal } from '../engine/mock';
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

function Bar({ value, expected }: { value: number; expected: number }) {
  return (
    <div className="relative h-3 rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(Math.max(value, 0.2) / LADDER_MAX) * 100}%` }} />
      <div className="absolute -top-1 h-5 w-0.5 bg-rose-500" style={{ left: `${(expected / LADDER_MAX) * 100}%` }} title="Expected for Kindergarten at test time" />
    </div>
  );
}

function verdict(est: number, expected: number) {
  const gap = est - expected;
  if (gap >= 1.5) return { text: 'Above grade level', cls: 'bg-emerald-100 text-emerald-800' };
  if (gap >= -0.75) return { text: 'On grade level', cls: 'bg-sky-100 text-sky-800' };
  return { text: 'Needs practice', cls: 'bg-rose-100 text-rose-800' };
}

export function IReadyPrep({ state, setState, onStartMock }: { state: AppState; setState: (s: AppState) => void; onStartMock: (s: MockSubject) => void }) {
  const set = (patch: Partial<AppState['settings']>) => setState({ ...state, settings: { ...state.settings, ...patch } });
  const testDate = state.settings.iReadyDate ? new Date(`${state.settings.iReadyDate}T09:00:00`) : null;
  const daysLeft = testDate ? Math.ceil((testDate.getTime() - Date.now()) / DAY) : null;
  const expected = expectedLevel('K', testDate ?? new Date());
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
          Works like the real diagnostic: read aloud, no hints or feedback, and adaptive within each i-Ready area (harder after right answers, easier after misses). About {mockTotal('math')} Math or {mockTotal('reading')} Reading questions, with a stretch break every 12. He can stop at a break and continue another day. The result is an estimated level from this app’s questions, not an official i-Ready score.
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
        return <MockReport key={subject} latest={latest} history={list} expected={expected} pinned={pinned} onPin={(id) => set({ focus: [...new Set([...pinned, id])] })} />;
      })}
    </div>
  );
}

function MockReport({ latest, history, expected, pinned, onPin }: { latest: MockResult; history: MockResult[]; expected: number; pinned: string[]; onPin: (id: string) => void }) {
  const v = verdict(latest.overall, expected);
  return (
    <Card
      title={`${latest.subject === 'math' ? '🔢 Math' : '📚 Reading'} mock · ${new Date(latest.ts).toLocaleDateString()}`}
      right={
        <span className="text-sm font-semibold text-slate-700">
          Overall: {latest.overallLabel} <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${v.cls}`}>{v.text}</span>
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        {latest.domains.map((d) => {
          const dv = verdict(d.estimate, expected);
          return (
            <div key={d.strand} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-sm sm:grid-cols-[16rem_minmax(0,1fr)_12rem]">
              <span className="font-medium text-slate-800">{d.title}</span>
              <div className="order-3 col-span-2 sm:order-none sm:col-span-1">
                <Bar value={d.estimate} expected={expected} />
              </div>
              <span className="text-right text-xs text-slate-600">
                {d.label}
                {d.ceiling ? '+' : ''} · <span className={`rounded-full px-1.5 ${dv.cls}`}>{dv.text}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Red line = where a Kindergartner is expected to be at test time ({levelLabel(expected)}). “+” means he answered the hardest questions the app has for that area, so his real level may be higher.
      </p>
      {latest.misconceptions.length > 0 && (
        <div className="mt-3 text-sm text-slate-700">
          <span className="font-semibold">Mistake patterns: </span>
          {latest.misconceptions.slice(0, 4).map((m) => describeMisconception(m.tag).title).join(' · ')}
        </div>
      )}
      {latest.practice.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span className="font-semibold">Practise next:</span>
          {latest.practice.map((id) => (
            <button key={id} onClick={() => onPin(id)} disabled={pinned.includes(id)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 disabled:bg-amber-50 disabled:text-amber-800">
              {pinned.includes(id) ? '📌' : '+ 📌'} {getSkill(id)?.title}
            </button>
          ))}
        </div>
      )}
      {history.length > 1 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="text-slate-400">
              <tr>
                <th className="py-1 pr-2">Date</th>
                {MOCK_DOMAINS[latest.subject].map((d) => (
                  <th key={d.strand} className="pr-2">
                    {d.title.replace('Comprehension: ', '').replace(' and ', ' & ')}
                  </th>
                ))}
                <th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {history.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{new Date(m.ts).toLocaleDateString()}</td>
                  {m.domains.map((d) => (
                    <td key={d.strand} className="pr-2">
                      {d.label}
                    </td>
                  ))}
                  <td className="font-semibold">{m.overallLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
