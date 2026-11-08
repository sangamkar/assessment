import { contentIssue } from '../engine/contentIssues';
import React, { useState } from 'react';
import { SUBJECTS, getSkill } from '../content';
import type { AppState, Mode } from '../engine/progress';
import { learningSummary } from '../engine/insights';
import { focusSkills } from '../engine/planner';
import { Visual } from './Visual';
import { SpeakButton } from './SpeakButton';

const MODES: Record<Mode, string> = {
  quest: 'Today’s learning',
  skill: 'Skill practice',
  checkup: 'Check-up',
  placement: 'Starting-point check',
  skip: 'Skip-ahead check',
  mock: 'Independent practice check',
};
export function LearningSummary({
  state,
  setState,
  onPractice,
  onStartingPoint,
}: {
  state: AppState;
  setState: (s: AppState) => void;
  onPractice: (id: string) => void;
  onStartingPoint: () => void;
}) {
  const summary = learningSummary(state);
  const [reviewSkill, setReviewSkill] = useState('all');
  const next = summary.revisit[0]?.skill ?? focusSkills(state).find((s) => ['math', 'reading'].includes(s.subject));
  const pin = (id: string) =>
    setState({ ...state, settings: { ...state.settings, focus: [...new Set([...(state.settings.focus ?? []), id])] } });
  return (
    <div className="space-y-5">
      <section className="growth-feature">
        <p className="growth-eyebrow">School foundations · Last 14 days</p>
        <h2 className="font-kid text-3xl text-teal-950">What to do next</h2>
        {next ? (
          <>
            <p className="mt-3 text-slate-700">
              {summary.revisit.length ? 'Revisit' : 'Start with'} <strong>{next.title}</strong>.{' '}
              {summary.revisit[0]
                ? `Missed ${summary.revisit[0].misses} of the latest ${summary.revisit[0].attempts.length} questions in this skill.`
                : 'We need more evidence before drawing conclusions.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="growth-primary" onClick={() => onPractice(next.id)}>
                Practise {next.kidTitle} →
              </button>
              <button
                className="growth-secondary"
                disabled={(state.settings.focus ?? []).includes(next.id)}
                onClick={() => pin(next.id)}
              >
                {(state.settings.focus ?? []).includes(next.id)
                  ? 'Pinned for daily learning'
                  : 'Pin for daily learning'}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-3 text-slate-600">
            Try a starting-point check or revisit a subject to gather fresh evidence.
          </p>
        )}
        <button className="growth-text-button mt-3" onClick={onStartingPoint}>
          Find or revisit the starting point →
        </button>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="growth-card">
          <h3 className="text-lg font-bold text-slate-800">Demonstrated across days</h3>
          <p className="mt-2 text-xs text-slate-500">
            At least six fresh first-attempt successes, four distinct questions, three days, and no misses in the recent
            sample. Evidence within this app, not a school readiness verdict.
          </p>
          {summary.demonstrated.length ? (
            summary.demonstrated.map((r) => (
              <p key={r.skill.id} className="mt-3 text-sm text-teal-900">
                {r.skill.title} · {r.fresh.length} fresh answers across {r.days} days
              </p>
            ))
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Not enough fresh evidence across days yet. One strong session is encouraging but does not establish
              retention.
            </p>
          )}
        </section>
        <section className="growth-card">
          <h3 className="text-lg font-bold text-slate-800">Revisit with support</h3>
          {summary.revisit.length ? (
            summary.revisit.map((r) => (
              <div key={r.skill.id} className="mt-4 border-t border-slate-100 pt-3">
                <p className="font-semibold text-slate-700">{r.skill.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {r.misses} missed in {r.attempts.length} recent attempts. A miss may reflect a misunderstanding,
                  attention, or an accidental tap.
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button className="growth-text-button" onClick={() => onPractice(r.skill.id)}>
                    Practise →
                  </button>
                  <button className="growth-text-button" onClick={() => setReviewSkill(r.skill.id)}>
                    Review missed questions ↓
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No recent misses recorded. Use unfamiliar questions before assuming a skill is secure.
            </p>
          )}
        </section>
      </div>
      <p className="text-sm text-slate-600">
        {summary.established} skills met the app’s practice rule · {summary.markedKnown} marked known or tested out
        (separate from sustained practice) · {summary.developing} recently sampled skills still building evidence.
      </p>
      <QuestionReview key={reviewSkill} state={state} initialSkill={reviewSkill} />
      {!!state.gameReviews?.length && (
        <details className="growth-card">
          <summary className="cursor-pointer font-semibold text-teal-900">Game coaching details</summary>
          <p className="mt-2 text-sm text-slate-500">
            Game rounds are kept separate from academic mastery. Most recent 100 completed rounds.
          </p>
          {state.gameReviews
            .slice()
            .reverse()
            .slice(0, 20)
            .map((r, i) => (
              <details key={`${r.ts}-${i}`} className="mt-3 rounded-xl bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  {r.prompt} ·{' '}
                  {r.result === 'win'
                    ? 'Independent'
                    : r.result === 'loss'
                      ? 'Skipped or unfinished'
                      : 'Completed with support'}
                </summary>
                <p className="mt-2 text-sm">
                  Answer: {r.answer} · {r.hints} hints
                </p>
                {r.mistakes.map((m, j) => (
                  <p key={j} className="mt-1 text-sm text-slate-600">
                    {m}
                  </p>
                ))}
              </details>
            ))}
        </details>
      )}
    </div>
  );
}

export function QuestionReview({ state, initialSkill = 'all' }: { state: AppState; initialSkill?: string }) {
  const [subject, setSubject] = useState('all');
  const [mode, setMode] = useState('all');
  const [days, setDays] = useState('30');
  const [skill, setSkill] = useState(initialSkill);
  const [page, setPage] = useState(0);
  const matches = state.attempts
    .filter(
      (a) =>
        !a.correct &&
        (days === 'all' || a.ts >= Date.now() - Number(days) * 86400000) &&
        (subject === 'all' || getSkill(a.skill)?.subject === subject) &&
        (skill === 'all' || a.skill === skill) &&
        (mode === 'all' || a.mode === mode),
    )
    .slice()
    .sort((a, b) => b.ts - a.ts);
  const offset = Math.min(page, Math.max(0, Math.ceil(matches.length / 20) - 1)) * 20;
  return (
    <section className="growth-card" aria-labelledby="question-review-heading">
      <h2 id="question-review-heading" className="text-xl font-bold text-slate-800">
        Review missed questions
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Shows the first answer selected, even if the child corrected it after a hint. Exact questions and answer order
        are saved for the most recent 200 misses from this update onward. Older attempts remain in the history but
        cannot be reconstructed reliably.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-sm font-semibold">
          Subject
          <select
            className="growth-input mt-1"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Activity
          <select
            className="growth-input mt-1"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All activities</option>
            {Object.entries(MODES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Period
          <select
            className="growth-input mt-1"
            value={days}
            onChange={(e) => {
              setDays(e.target.value);
              setPage(0);
            }}
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="all">All saved history</option>
          </select>
        </label>
        {skill !== 'all' && (
          <button
            className="growth-secondary self-end"
            onClick={() => {
              setSkill('all');
              setPage(0);
            }}
          >
            Clear skill filter: {getSkill(skill)?.kidTitle}
          </button>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        {matches.length} missed {matches.length === 1 ? 'answer matches' : 'answers match'} these filters.
      </p>
      {matches.slice(offset, offset + 20).map((a, index) => (
        <details key={`${a.ts}-${a.itemId}-${index}`} className="mt-3 rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold text-slate-800">
            {getSkill(a.skill)?.title ?? a.skill} · {new Date(a.ts).toLocaleString()} · {MODES[a.mode]}
          </summary>
          {a.repeated !== undefined && (
            <p className="mt-2 text-xs text-amber-900">
              {a.repeated
                ? 'Familiar question: previously answered in this app.'
                : 'No prior answer to this question was recorded.'}
            </p>
          )}
          {contentIssue(a) && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-950">{contentIssue(a)}</p>}
          {a.question ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <p className="flex-1 font-semibold text-slate-800">{a.question.show ?? a.question.say}</p>
                <SpeakButton text={a.question.say} extra={a.question.voice} />
              </div>
              {a.question.show && a.question.show !== a.question.say && (
                <p className="text-sm text-slate-600">Spoken question: {a.question.say}</p>
              )}
              {a.question.voice && <p className="text-sm text-slate-600">Audio stimulus: {a.question.voice.text}</p>}
              {a.question.visual && (
                <div className="flex justify-center rounded-xl bg-slate-50 p-3">
                  <Visual v={a.question.visual} />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {a.question.choices.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border-2 p-3 ${c.correct ? 'border-emerald-500 bg-emerald-50' : c.id === a.selectedChoiceId ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}
                  >
                    <p className="mb-2 text-xs font-bold text-slate-700">
                      {c.id === a.selectedChoiceId
                        ? 'Child’s first answer'
                        : c.correct
                          ? (contentIssue(a) ? 'Original answer key (wording issue)' : 'Correct answer')
                          : 'Other option'}
                    </p>
                    {c.visual ? (
                      <Visual v={c.visual} size="md" />
                    ) : (
                      <p className="font-reader text-lg">{c.text ?? c.say}</p>
                    )}
                    {c.visual && c.say && <p className="mt-1 text-sm">{c.say}</p>}
                  </div>
                ))}
              </div>
              <p className="rounded-xl bg-sky-50 p-3 text-sm text-slate-700">
                <strong>{contentIssue(a) ? "Original explanation:" : "Explanation:"}</strong> {a.question.explain}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Exact question and selected answer were not saved for this older attempt. No answer has been inferred.
            </p>
          )}
        </details>
      ))}
      {matches.length > 20 && (
        <div className="mt-4 flex items-center gap-4">
          <button
            className="growth-secondary disabled:opacity-40"
            disabled={offset === 0}
            onClick={() => setPage(Math.max(0, page - 1))}
          >
            Previous
          </button>
          <span className="text-sm">
            {offset + 1}–{Math.min(offset + 20, matches.length)}
          </span>
          <button
            className="growth-secondary disabled:opacity-40"
            disabled={offset + 20 >= matches.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
