import React from 'react';
import { getSkill } from '../content';
import type { MockResult, MockSubject } from '../engine/mock';
import { mockTotal } from '../engine/mock';
import { evidenceLabel } from '../engine/evidence';
import { isVisible } from '../engine/planner';
import type { AppState } from '../engine/progress';

export const PREP_FOCUS = [
  'm.timepatterns',
  'm1.time',
  'm2.time5',
  'm1.coins',
  'm2.money',
  'm.pattern',
  'm1.patternrule',
  'm1.growpattern',
];
export function IReadyPrep({
  state,
  setState,
  onStartMock,
}: {
  state: AppState;
  setState: (s: AppState) => void;
  onStartMock: (s: MockSubject) => void;
}) {
  const pinned = state.settings.focus ?? [];
  const pin = (ids: string[]) =>
    setState({ ...state, settings: { ...state.settings, focus: [...new Set([...pinned, ...ids])] } });
  return (
    <div className="space-y-5">
      <section className="growth-card">
        <h2 className="text-xl font-bold text-slate-800">School preparation</h2>
        <p className="mt-3 text-sm text-slate-600">
          These independent practice checks use this app’s questions. They do not reproduce i-Ready, predict a school
          score, or establish a grade placement. Use the evidence to choose what to practise next.
        </p>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          School test date (optional)
          <input
            type="date"
            aria-label="School test date"
            className="growth-input mt-2 max-w-xs"
            value={state.settings.iReadyDate ?? ''}
            onChange={(e) =>
              setState({ ...state, settings: { ...state.settings, iReadyDate: e.target.value || undefined } })
            }
          />
        </label>
      </section>
      <section className="growth-card">
        <h2 className="text-lg font-bold text-slate-800">Independent practice checks</h2>
        <p className="mt-3 text-sm text-slate-600">
          Questions adjust in difficulty. No hints or answer feedback during the check. Unseen questions are preferred;
          familiar questions may repeat when a suitable fresh question cannot be found. Repeats are identified in the
          results. Take a break every 12 questions or stop sooner.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(['math', 'reading'] as const).map((subject) => (
            <button key={subject} className="growth-primary" onClick={() => onStartMock(subject)}>
              {state.mockRun?.subject === subject
                ? `Resume ${subject} (${state.mockRun.answers.length}/${mockTotal(subject)})`
                : `Start ${subject} check (${mockTotal(subject)} questions)`}
            </button>
          ))}
        </div>
      </section>
      <section className="growth-card">
        <h2 className="text-lg font-bold text-slate-800">Practice focus</h2>
        <p className="mt-2 text-sm text-slate-600">
          Pinned skills lead Today’s learning. Choose from results, the summary, or the skill map.
        </p>
        <button
          className="growth-secondary mt-3"
          onClick={() =>
            pin(
              PREP_FOCUS.filter((id) => {
                const s = getSkill(id);
                return s && isVisible(state, s);
              }),
            )
          }
        >
          Pin time, money &amp; patterns
        </button>
        <div className="mt-3 flex flex-wrap gap-2">
          {pinned.map((id) => (
            <button
              key={id}
              className="growth-secondary"
              aria-label={`Unpin ${getSkill(id)?.title}`}
              onClick={() =>
                setState({ ...state, settings: { ...state.settings, focus: pinned.filter((x) => x !== id) } })
              }
            >
              {getSkill(id)?.title} ×
            </button>
          ))}
        </div>
      </section>
      {(['math', 'reading'] as const).map((subject) => {
        const history = (state.mocks ?? []).filter((m) => m.subject === subject);
        const latest = history.at(-1);
        return latest && <Report key={subject} latest={latest} history={history} onPin={(id) => pin([id])} />;
      })}
    </div>
  );
}
function Report({
  latest,
  history,
  onPin,
}: {
  latest: MockResult;
  history: MockResult[];
  onPin: (id: string) => void;
}) {
  return (
    <section className="growth-card">
      <h2 className="text-lg font-bold text-slate-800">
        {latest.subject === 'math' ? 'Math' : 'Reading'} · {new Date(latest.ts).toLocaleDateString()}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Performance on this app’s questions. Different checks may cover different skills and difficulties, so raw
        accuracy is not a standardized growth score.
      </p>
      <p className="mt-3 text-sm font-semibold text-amber-900">
        {latest.repeated === undefined || !!latest.untracked
          ? 'Older result: question familiarity was not recorded.'
          : `${latest.repeated} familiar question(s). Familiar answers are weaker evidence of independent transfer.`}
      </p>
      <div className="mt-4 space-y-3">
        {latest.domains.map((d) => (
          <div key={d.strand} className="rounded-xl bg-slate-50 p-3 text-sm">
            <div className="font-semibold text-slate-800">{d.title}</div>
            <p className="mt-1 text-slate-600">
              {d.correct} of {d.total} correct ·{' '}
              {d.untracked
                ? 'Limited evidence: familiarity not fully recorded'
                : evidenceLabel(d.correct, d.total, d.repeated ?? 0)}
            </p>
            {d.ceiling && (
              <p className="mt-1 text-xs text-slate-500">
                Reached this app’s available content limit. No higher ability or grade placement is inferred.
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {latest.practice.map((id) => (
          <button key={id} className="growth-secondary" onClick={() => onPin(id)}>
            Pin practice: {getSkill(id)?.title}
          </button>
        ))}
      </div>
      {history.length > 1 && (
        <details className="mt-5">
          <summary className="cursor-pointer font-semibold text-teal-800">
            Earlier checks ({history.length - 1})
          </summary>
          {history
            .slice(0, -1)
            .reverse()
            .map((m) => (
              <p key={m.id} className="mt-2 text-sm text-slate-600">
                {new Date(m.ts).toLocaleDateString()} · {m.domains.reduce((n, d) => n + d.correct, 0)} of{' '}
                {m.domains.reduce((n, d) => n + d.total, 0)} correct ·{' '}
                {m.repeated === undefined ? 'familiarity not recorded' : `${m.repeated} familiar`}
              </p>
            ))}
        </details>
      )}
    </section>
  );
}
