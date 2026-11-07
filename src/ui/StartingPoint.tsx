import { AudioGuide } from './AudioGuide';
import { SpeakButton } from './SpeakButton';
import React from 'react';
import type { AppState } from '../engine/progress';

export function StartingPoint({
  state,
  onStart,
  onContinue,
}: {
  state: AppState;
  onStart: (subject: 'math' | 'reading') => void;
  onContinue: () => void;
}) {
  const checks = state.startupCheck;
  return (
    <main className="growth-page max-w-3xl">
      <AudioGuide text="Let’s find your starting point. Try a short math check, or tap start with basics to begin learning." />
      <p className="growth-eyebrow">For the grown-up · First steps</p>
      <h1 className="font-kid text-4xl font-semibold text-teal-950">Find a comfortable starting point</h1>
      <p className="mt-4 text-lg text-slate-600">
        Math and reading can start at different places. Try one short check at a time, or begin with the basics.
      </p>
      <p className="mt-3 text-sm text-slate-600">
        Up to 12 questions per subject, sampling each area. A short check gives an initial starting point, refined
        through practice. No hints during the check. This guides practice in this app; it is not a school placement or
        grade-level assessment.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {(['math', 'reading'] as const).map((subject) => (
          <section key={subject} className="growth-card">
            <div aria-hidden className="text-5xl">
              {subject === 'math' ? '🔢' : '📖'}
            </div>
            <h2 className="mt-4 font-kid text-2xl font-semibold text-teal-950">
              {subject === 'math' ? 'Math' : 'Reading'} starting point
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              {checks?.[subject]
                ? 'Check completed. The skills demonstrated will guide practice.'
                : 'We’ll try a few skills and adjust the challenge.'}
            </p>
            <SpeakButton text={subject === 'math' ? 'Try a short math check to find your starting point.' : 'Try a short reading check to find your starting point.'} label={`Hear ${subject} check`} />
            <button className="growth-primary mt-5 w-full" onClick={() => onStart(subject)}>
              {checks?.[subject] ? 'Try again' : 'Start check'} →
            </button>
          </section>
        ))}
      </div>
      <button className="growth-primary mt-7" onClick={onContinue}>
        {checks?.math || checks?.reading ? 'Continue to Today’s learning' : 'Start with basics for now'} →
      </button>
      <p className="mt-3 text-sm text-slate-500">
        You can revisit these checks from Grown-ups → Summary. If you stop a check early, that subject can be restarted.
      </p>
    </main>
  );
}
