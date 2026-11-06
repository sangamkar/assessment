import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { emptyState } from '../src/engine/progress';
import type { AppState } from '../src/engine/progress';
import { QuestionReview } from '../src/ui/LearningSummary';

function saved(state: AppState, authed = true) {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (key === 'classroom_auth' ? (authed ? 'true' : null) : JSON.stringify(state)),
  });
}
afterEach(() => vi.unstubAllGlobals());
const profile = { name: 'Learner', avatar: '🦁', createdAt: 1 };
describe('startup journey', () => {
  it('retains the existing access gate', () => {
    saved({ ...emptyState(), profile }, false);
    expect(renderToStaticMarkup(<App />)).toContain('Classroom Passcode');
  });
  it('offers starting checks for an existing profile without losing its name', () => {
    saved({ ...emptyState(), profile });
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Find a comfortable starting point');
    expect(html).toContain('Math starting point');
    expect(html).toContain('Reading starting point');
    expect(html).toContain('Start with basics for now');
  });
  it('returns directly to daily learning after the startup choice has been made', () => {
    saved({ ...emptyState(), profile, startupCheck: { finished: true, math: 1 } });
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Today’s learning');
    expect(html).not.toContain('Find a comfortable starting point');
  });
  it('labels old missed answers as unavailable instead of regenerating a different question', () => {
    const state = {
      ...emptyState(),
      attempts: [
        { itemId: 'old', skill: 'm.count10', d: 2 as const, correct: false, ts: Date.now(), mode: 'quest' as const },
      ],
    };
    const html = renderToStaticMarkup(<QuestionReview state={state} />);
    expect(html).toContain('were not saved for this older attempt');
    expect(html).not.toContain('Correct answer');
  });
});
