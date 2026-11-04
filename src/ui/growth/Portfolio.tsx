import React, { useState } from "react";
import {
  GROWTH_DOMAINS,
  getActivity,
  missionForActivity,
} from "../../content/missions";
import type { AppState } from "../../engine/progress";
import { STAGES, addObservation } from "../../engine/growth";
import type {
  ActivitySession,
  GrowthStage,
  Support,
} from "../../engine/growth";
import { GrowthHeader } from "./Missions";

const supportLabel: Record<Support, string> = {
  together: "Did it together",
  reminders: "Some reminders",
  independent: "Without prompts",
};
const date = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function Discovery({
  session,
  state,
  parent,
}: {
  session: ActivitySession;
  state: AppState;
  parent: boolean;
}) {
  const activity = getActivity(session.activityId);
  if (!activity) return null;
  const observation = [...state.growth.observations]
    .reverse()
    .find((o) => o.sessionId === session.id);
  return (
    <article className="growth-card break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="growth-pill">
          {GROWTH_DOMAINS[activity.domain].icon}{" "}
          {GROWTH_DOMAINS[activity.domain].title}
        </span>
        <time
          className="text-xs text-slate-500"
          dateTime={new Date(session.triedAt!).toISOString()}
        >
          {date(session.triedAt!)}
        </time>
      </div>
      <h3 className="mt-4 font-kid text-2xl font-semibold text-teal-950">
        {activity.title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {missionForActivity(activity.id)?.title} · I tried it
      </p>
      {!!session.drawing.length && (
        <svg
          role="img"
          aria-label={`Sketch from ${activity.title}`}
          viewBox="0 0 600 300"
          className="mt-4 w-full rounded-2xl bg-teal-50"
        >
          {session.drawing.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#136f78"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      )}
      {session.reflection ? (
        <blockquote className="mt-4 whitespace-pre-wrap border-l-2 border-amber-300 pl-4 text-slate-700 [overflow-wrap:anywhere]">
          “{session.reflection}”
        </blockquote>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          A hands-on discovery. No written reflection needed.
        </p>
      )}
      {parent && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold">Capability: {activity.capability}</p>
          <p className="mt-1">
            Coaching opened:{" "}
            {session.strategies.length
              ? session.strategies
                  .map((s) => (s === "another-way" ? "another way" : s))
                  .join(", ")
              : "none"}
            . This does not measure adult help.
          </p>
          {observation ? (
            <>
              <p className="mt-3 font-semibold text-teal-900">
                Latest observation · {observation.stage}
              </p>
              <p>
                {supportLabel[observation.support]} · {date(observation.ts)}
              </p>
              <p className="mt-1 whitespace-pre-wrap [overflow-wrap:anywhere]">
                {observation.note}
              </p>
            </>
          ) : (
            <p className="mt-3">
              No parent observation yet. Activity completion is self-reported.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export function Portfolio({
  state,
  onBack,
  onMissions,
}: {
  state: AppState;
  onBack: () => void;
  onMissions: () => void;
}) {
  const sessions = [...state.growth.sessions]
    .filter((s) => s.triedAt)
    .reverse();
  return (
    <main className="growth-page">
      <GrowthHeader
        title="My discoveries"
        subtitle="Ideas I tried. Things I made. New ways to do things."
        onBack={onBack}
      />
      {!sessions.length ? (
        <div className="growth-feature text-center">
          <div className="font-kid text-6xl text-amber-500">✦</div>
          <h2 className="mt-4 font-kid text-2xl text-teal-950">
            Your next idea belongs here.
          </h2>
          <p className="mt-3 text-slate-600">
            Try a mission activity, then keep a sketch or a few words if you
            like.
          </p>
          <button className="growth-primary mt-6" onClick={onMissions}>
            Find a mission →
          </button>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-slate-500">
            Each discovery is something you tried. There is always more to
            explore.
          </p>
          <div className="grid items-start gap-4 md:grid-cols-2">
            {sessions.map((s) => (
              <Discovery key={s.id} session={s} state={state} parent={false} />
            ))}
          </div>
          <button className="growth-primary mt-6" onClick={onMissions}>
            Explore another idea →
          </button>
        </>
      )}
    </main>
  );
}

function ObservationForm({
  state,
  setState,
}: {
  state: AppState;
  setState: (state: AppState) => void;
}) {
  const sessions = [...state.growth.sessions]
    .filter((s) => s.triedAt)
    .reverse();
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [stage, setStage] = useState<GrowthStage>("Exploration");
  const [support, setSupport] = useState<Support>("together");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const selected = sessions.find((s) => s.id === sessionId);
  const activity = selected && getActivity(selected.activityId);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = addObservation(state, sessionId, { stage, support, note });
    if (next !== state) {
      setState(next);
      setNote("");
      setSaved(true);
    }
  };
  if (!sessions.length)
    return (
      <p className="text-sm text-slate-600">
        After your child tries an activity, you can record what you actually
        observed here.
      </p>
    );
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="growth-label">
        Activity
        <select
          className="growth-input mt-1"
          value={sessionId}
          onChange={(e) => {
            setSessionId(e.target.value);
            setSaved(false);
          }}
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {getActivity(s.activityId)?.title} · {date(s.triedAt!)}
            </option>
          ))}
        </select>
      </label>
      {activity && (
        <div className="rounded-xl bg-teal-50 p-3 text-sm text-teal-950">
          <p className="font-semibold">{activity.capability}</p>
          <p className="mt-1">{activity.observe}</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="growth-label">
          Stage observed
          <select
            className="growth-input mt-1"
            value={stage}
            onChange={(e) => {
              setStage(e.target.value as GrowthStage);
              setSaved(false);
            }}
          >
            {STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="growth-label">
          Support needed
          <select
            className="growth-input mt-1"
            value={support}
            onChange={(e) => {
              setSupport(e.target.value as Support);
              setSaved(false);
            }}
          >
            {Object.entries(supportLabel).map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="growth-label">
        What did you see?{" "}
        <span className="font-normal">Required · concrete evidence</span>
        <textarea
          required
          maxLength={500}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          className="growth-input mt-1 min-h-24"
          placeholder="Packed three items from his picture list. Needed one reminder to check the bag."
        />
      </label>
      <p className="text-xs text-slate-500">
        Exposure = encountered it; exploration = tried it; foundational
        competence = can do the basics; independent application = used it
        without prompts in a real context. Reserve mastery for repeated, varied
        evidence when it matters. One observation is a snapshot.
      </p>
      <button
        disabled={!note.trim()}
        className="growth-primary self-start disabled:opacity-40"
      >
        Save observation
      </button>
      {saved && (
        <p role="status" className="text-sm font-semibold text-teal-800">
          Observation added to the portfolio.
        </p>
      )}
    </form>
  );
}

export function GrowthReview({
  state,
  setState,
}: {
  state: AppState;
  setState: (state: AppState) => void;
}) {
  const sessions = [...state.growth.sessions]
    .filter((s) => s.triedAt)
    .reverse();
  const [domain, setDomain] = useState("all");
  const now = Date.now();
  const recent = sessions.filter((s) => now - s.triedAt! <= 30 * 86400000);
  const capabilities = [
    ...new Set(
      state.growth.observations
        .map((o) => {
          const session = sessions.find((s) => s.id === o.sessionId);
          return session && getActivity(session.activityId)?.capability;
        })
        .filter((x): x is string => !!x),
    ),
  ];
  return (
    <div className="space-y-5">
      <section className="growth-card">
        <h2 className="text-lg font-bold text-slate-800">
          Growth beyond questions
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Last 30 days: {recent.length}{" "}
          {recent.length === 1 ? "activity" : "activities"} tried. These are
          opportunities experienced, not a score of your child’s development.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(GROWTH_DOMAINS).map(([id, d]) => (
            <span className="growth-pill" key={id}>
              {d.title}:{" "}
              {
                recent.filter((s) => getActivity(s.activityId)?.domain === id)
                  .length
              }{" "}
              tried
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          A zero means no app record. Real-world play, friendships and routines
          may be happening without being logged.
        </p>
      </section>
      <section className="growth-card">
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Add an observation
        </h2>
        <ObservationForm state={state} setState={setState} />
      </section>
      {!!capabilities.length && (
        <section className="growth-card">
          <h2 className="text-lg font-bold text-slate-800">
            Things we have seen
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Latest observation per specific capability. Stages can change with
            the context and support needed.
          </p>
          <div className="mt-4 space-y-4">
            {capabilities.map((capability) => {
              const observations = state.growth.observations.filter(
                (o) =>
                  getActivity(
                    sessions.find((s) => s.id === o.sessionId)?.activityId ??
                      "",
                  )?.capability === capability,
              );
              const latest = observations[observations.length - 1];
              return (
                <div
                  key={capability}
                  className="border-l-2 border-teal-300 pl-4"
                >
                  <p className="font-semibold text-slate-800">{capability}</p>
                  <p className="mt-1 text-sm text-teal-800">
                    {latest.stage} · {supportLabel[latest.support]} ·{" "}
                    {date(latest.ts)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600 [overflow-wrap:anywhere]">
                    {latest.note}
                  </p>
                  {observations.length > 1 && (
                    <details className="mt-2 text-sm text-slate-500">
                      <summary className="cursor-pointer">
                        Earlier observations ({observations.length - 1})
                      </summary>
                      {observations
                        .slice(0, -1)
                        .reverse()
                        .map((o) => (
                          <p
                            key={o.id}
                            className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]"
                          >
                            {date(o.ts)} · {o.stage} · {supportLabel[o.support]}
                            : {o.note}
                          </p>
                        ))}
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="growth-card">
        <h2 className="text-lg font-bold text-slate-800">
          Monthly conversation · five minutes
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          What is becoming easier without help? What does your child choose to
          revisit? How are friendships, movement, school and well-being going?
          Use real observations and school feedback. Pick one thing to continue
          and one small adjustment. Reconsider commitments each quarter.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Keep logging optional and brief. Use Settings → Backup to keep a copy
          of the full portfolio, including sketches.
        </p>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-800">Discovery journal</h2>
        <label className="text-sm text-slate-600">
          Filter by area{" "}
          <select
            className="growth-input mt-1"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            <option value="all">All areas</option>
            {Object.entries(GROWTH_DOMAINS).map(([id, d]) => (
              <option key={id} value={id}>
                {d.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        {sessions
          .filter(
            (s) =>
              domain === "all" || getActivity(s.activityId)?.domain === domain,
          )
          .map((s) => (
            <Discovery key={s.id} state={state} session={s} parent />
          ))}
      </div>
    </div>
  );
}
