import React, { useEffect, useState } from "react";
import {
  GROWTH_DOMAINS,
  MISSIONS,
  getActivity,
  getMission,
  missionForActivity,
} from "../../content/missions";
import type { Mission } from "../../content/missions";
import type { AppState } from "../../engine/progress";
import {
  chooseMission,
  editSession,
  markTried,
  useStrategy,
} from "../../engine/growth";
import type { Strategy } from "../../engine/growth";
import { soundEngine } from "../../utils/audio";
import { SpeakButton } from "../SpeakButton";
import { MissionArt } from "./MissionArt";
import { SketchPad } from "./SketchPad";

type Update = (fn: (s: AppState) => AppState) => void;
const triedCount = (state: AppState, mission: Mission) =>
  mission.activities.filter((a) =>
    state.growth.sessions.some((s) => s.activityId === a.id && s.triedAt),
  ).length;

export function MissionHome({
  state,
  onMissions,
  onActivity,
  onPassport,
}: {
  state: AppState;
  onMissions: (id?: string) => void;
  onActivity: (id: string) => void;
  onPassport: () => void;
}) {
  const active = getMission(state.growth.activeMissionId ?? "");
  const next = active?.activities.find(
    (a) =>
      !state.growth.sessions.some((s) => s.activityId === a.id && s.triedAt),
  );
  return (
    <section aria-labelledby="mission-home-title" className="growth-home">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="growth-eyebrow">A little curiosity. A big world.</p>
          <h2
            id="mission-home-title"
            className="font-kid text-3xl font-semibold text-teal-950"
          >
            {active ? "Your next discovery" : "What will you explore?"}
          </h2>
        </div>
        <button onClick={onPassport} className="growth-text-button">
          My discoveries ↗
        </button>
      </div>
      {active ? (
        <div
          className="growth-feature grid items-center gap-4 md:grid-cols-[1fr_280px]"
          style={{ color: active.color }}
        >
          <div>
            <span className="growth-pill">
              Your chosen mission · {triedCount(state, active)} of{" "}
              {active.activities.length} activities tried
            </span>
            <h3 className="mt-4 font-kid text-4xl font-semibold text-teal-950">
              {active.title}
            </h3>
            <p className="mt-3 max-w-md text-slate-600">{active.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="growth-primary"
                onClick={() => (next ? onActivity(next.id) : onMissions())}
              >
                {next ? "Continue my mission →" : "Choose another mission →"}
              </button>
              <button onClick={() => onMissions()} className="growth-secondary">
                All missions
              </button>
            </div>
          </div>
          <div className="h-44 md:h-56">
            <MissionArt theme={active.id} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {MISSIONS.slice(0, 2).map((m) => (
            <button
              onClick={() => onMissions(m.id)}
              key={m.id}
              className="growth-mission-card group text-left"
              style={{ color: m.color }}
            >
              <div className="h-36">
                <MissionArt theme={m.id} />
              </div>
              <h3 className="font-kid text-2xl font-semibold text-teal-950">
                {m.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{m.subtitle}</p>
              <span className="mt-4 inline-block font-semibold">
                Explore this mission →
              </span>
            </button>
          ))}
        </div>
      )}
      {!active && (
        <button
          className="growth-text-button mt-4"
          onClick={() => onMissions()}
        >
          See all 3 missions, including Pretend Café →
        </button>
      )}
    </section>
  );
}

export function GrowthHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  useEffect(() => () => soundEngine.stopSpeech(), []);
  return (
    <header className="mb-7 flex items-start gap-4">
      <button
        className="growth-back"
        aria-label="Back"
        onClick={() => {
          soundEngine.stopSpeech();
          onBack();
        }}
      >
        ←
      </button>
      <div>
        <p className="growth-eyebrow">Learning Quest · Grow your way</p>
        <h1 className="font-kid text-3xl font-semibold text-teal-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-slate-600">{subtitle}</p>
      </div>
    </header>
  );
}

export function Missions({
  state,
  update,
  onBack,
  onActivity,
}: {
  state: AppState;
  update: Update;
  onBack: () => void;
  onActivity: (id: string) => void;
}) {
  const active = getMission(state.growth.activeMissionId ?? "");
  return (
    <main className="growth-page">
      <GrowthHeader
        title="Choose your next adventure"
        subtitle="Pick what sparks your curiosity. You can change your mind anytime."
        onBack={onBack}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {MISSIONS.map((m) => (
          <article
            className={`growth-mission-card ${active?.id === m.id ? "ring-2 ring-teal-600" : ""}`}
            key={m.id}
            style={{ color: m.color }}
          >
            <div className="h-36">
              <MissionArt theme={m.id} />
            </div>
            <div className="flex flex-wrap gap-2">
              {m.interests.map((i) => (
                <span key={i} className="growth-pill">
                  {i}
                </span>
              ))}
            </div>
            <h2 className="mt-4 font-kid text-2xl font-semibold text-teal-950">
              {m.title}
            </h2>
            <p className="mt-2 min-h-12 text-sm text-slate-600">{m.subtitle}</p>
            <p className="mt-4 text-xs text-slate-500">
              4 short activities · mostly away from the screen
            </p>
            <button
              onClick={() => update((s) => chooseMission(s, m.id))}
              className={`mt-5 w-full ${active?.id === m.id ? "growth-secondary" : "growth-primary"}`}
            >
              {active?.id === m.id
                ? "My chosen mission ✓"
                : `Choose ${m.title.toLowerCase()}`}
            </button>
          </article>
        ))}
      </div>
      {active && (
        <section className="mt-9" aria-labelledby="activities-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2
              id="activities-title"
              className="font-kid text-2xl font-semibold text-teal-950"
            >
              Inside: {active.title}
            </h2>
            <span className="text-sm text-slate-500">
              Try these in any order. One is enough for today.
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.activities.map((a) => {
              const sessions = state.growth.sessions.filter(
                (s) => s.activityId === a.id,
              );
              const tried = sessions.some((s) => s.triedAt);
              const ongoing = sessions.some((s) => !s.triedAt);
              const domain = GROWTH_DOMAINS[a.domain];
              return (
                <button
                  key={a.id}
                  onClick={() => onActivity(a.id)}
                  className="growth-activity-card text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="growth-pill">
                      {domain.icon} {domain.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {a.minutes} min
                    </span>
                  </div>
                  <h3 className="mt-4 font-kid text-2xl font-semibold text-teal-950">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{a.prompt}</p>
                  <span className="mt-4 inline-block text-sm font-bold text-teal-800">
                    {ongoing
                      ? "Continue →"
                      : tried
                        ? "Try it another way →"
                        : "Let’s try it →"}
                  </span>
                  {tried && (
                    <p className="mt-2 text-xs text-slate-500">
                      You have tried this. Revisit whenever you like.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export function ActivityPlayer({
  state,
  activityId,
  update,
  onBack,
  onPassport,
  onAgain,
  onPractice,
}: {
  state: AppState;
  activityId: string;
  update: Update;
  onBack: () => void;
  onPassport: () => void;
  onAgain: () => void;
  onPractice?: (id: string) => void;
}) {
  const activity = getActivity(activityId);
  const session = [...state.growth.sessions]
    .reverse()
    .find((s) => s.activityId === activityId);
  const [coach, setCoach] = useState<Strategy | null>(null);
  useEffect(() => setCoach(null), [session?.id]);
  if (!activity || !session)
    return (
      <main className="growth-page">
        <GrowthHeader
          title="Choose an activity"
          subtitle="Your missions are ready when you are."
          onBack={onBack}
        />
      </main>
    );
  const mission = missionForActivity(activityId)!;
  const coaching = {
    example: activity.example,
    clue: activity.clue,
    "another-way": activity.anotherWay,
  };
  const draft = (patch: Parameters<typeof editSession>[2]) =>
    update((s) => editSession(s, session.id, patch));
  const speakText = [
    activity.prompt,
    "You will need:",
    ...activity.materials,
    ...activity.steps,
  ].join(" ");
  return (
    <main className="growth-page max-w-4xl">
      <GrowthHeader
        title={activity.title}
        subtitle={`${mission.title} · ${activity.minutes} minutes · ${GROWTH_DOMAINS[activity.domain].title}`}
        onBack={onBack}
      />
      {session.triedAt ? (
        <section className="growth-feature mb-6" aria-live="polite">
          <p className="growth-eyebrow">A discovery to keep</p>
          <h2 className="mt-2 font-kid text-3xl font-semibold text-teal-950">
            You gave your idea a try.
          </h2>
          <p className="mt-3 text-slate-600">
            Your sketch and words are in My discoveries. What would you like to
            explore next?
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="growth-primary" onClick={onPassport}>
              See my discoveries →
            </button>
            <button className="growth-secondary" onClick={onAgain}>
              Try this again
            </button>
            <button className="growth-text-button" onClick={onBack}>
              Back to mission
            </button>
          </div>
        </section>
      ) : (
        <section className="growth-feature mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="growth-pill">Your challenge</span>
              <h2 className="mt-4 font-kid text-2xl font-semibold text-teal-950">
                {activity.prompt}
              </h2>
            </div>
            <SpeakButton text={speakText} label="Read the activity aloud" />
          </div>
          <p className="mt-5 text-sm text-slate-600">
            <strong>Gather:</strong> {activity.materials.join(" · ")}
          </p>
          <ol className="mt-6 flex flex-col gap-4">
            {activity.steps.map((step, i) => (
              <li className="flex items-start gap-3" key={step}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-900">
                  {i + 1}
                </span>
                <span className="pt-1 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
            <strong>With a grown-up:</strong> {activity.safety}
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Take this idea away from the screen. Come back when you want to
            share.
          </p>
        </section>
      )}
      {!session.triedAt && (
        <section className="growth-card mb-6">
          <h2 className="font-kid text-xl font-semibold text-teal-950">
            Need a little help?
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["example", "Show me an example"],
                ["clue", "Give me a clue"],
                ["another-way", "Try another way"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                aria-pressed={coach === id}
                className={coach === id ? "growth-primary" : "growth-secondary"}
                onClick={() => {
                  setCoach(id);
                  update((s) => useStrategy(s, session.id, id));
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {coach && (
            <div
              className="mt-4 flex items-start gap-3 rounded-2xl bg-teal-50 p-4"
              aria-live="polite"
            >
              <p className="flex-1 text-slate-700">{coaching[coach]}</p>
              <SpeakButton
                text={coaching[coach]}
                label="Read the coaching prompt"
              />
            </div>
          )}
        </section>
      )}
      <section className="growth-card">
        <h2 className="font-kid text-2xl font-semibold text-teal-950">
          My idea or discovery
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sketch, tell a grown-up, or write a few words. Saving a picture is
          optional.
        </p>
        <div className="mt-5">
          <SketchPad
            key={session.id}
            drawing={session.drawing}
            onChange={(drawing) => draft({ drawing })}
          />
        </div>
        <label className="mt-5 block text-sm font-semibold text-slate-700">
          {activity.reflection}
          <textarea
            maxLength={500}
            value={session.reflection}
            onChange={(e) => draft({ reflection: e.target.value })}
            placeholder="My words, or a grown-up can write what I say…"
            className="growth-input mt-2 min-h-24"
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          Saved on this device. Words and sketches travel with your progress
          backup.
        </p>
        {!session.triedAt && (
          <button
            className="growth-primary mt-5"
            onClick={() => update((s) => markTried(s, session.id))}
          >
            I tried it · save my discovery ✓
          </button>
        )}
      </section>
      <details className="growth-card mt-6">
        <summary className="cursor-pointer font-semibold text-slate-700">
          Grown-up guide · help without taking over
        </summary>
        <dl className="mt-4 space-y-4 text-sm text-slate-600">
          <div>
            <dt className="font-bold text-slate-800">Your role</dt>
            <dd>{activity.parentRole}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-800">Let your child attempt</dt>
            <dd>{activity.independent}</dd>
          </div>
          <div>
            <dt className="font-bold text-slate-800">Notice</dt>
            <dd>{activity.observe}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-500">
          Use Grown-ups → Growth review to record an observation. Trying an
          activity does not automatically mark a skill as mastered.
        </p>
      </details>
      {activity.practiceSkill && onPractice && (
        <button
          className="growth-text-button mt-5"
          onClick={() => onPractice(activity.practiceSkill!)}
        >
          Optional related academic practice →
        </button>
      )}
    </main>
  );
}
