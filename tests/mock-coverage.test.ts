import { describe, expect, it } from 'vitest';
import { itemFingerprint } from '../src/engine/exposures';
import { MOCK_DOMAINS, mockTotal, newMockRun, nextMockStep } from '../src/engine/mock';
import type { MockSubject } from '../src/engine/mock';
import { emptyState, upgradeState } from '../src/engine/progress';
import type { AppState } from '../src/engine/progress';

/** Plays a whole mock and returns the distinct topics asked per domain. */
function topicsPerDomain(state: AppState, subject: MockSubject, correct: (i: number) => boolean) {
  const run = newMockRun(subject, 4, 12345);
  for (let i = 0; i < mockTotal(subject); i++) {
    const step = nextMockStep(state, run)!;
    run.answers.push({ strand: step.strand, skill: step.skill.id, itemId: step.item.id, fingerprint: itemFingerprint(step.item), repeated: step.repeated, level: step.level, target: step.target, correct: correct(i), ts: i });
  }
  return Object.fromEntries(MOCK_DOMAINS[subject].map((d) => [d.strand, new Set(run.answers.filter((a) => a.strand === d.strand).map((a) => a.skill)).size]));
}

/** Progress saved before questions had fingerprints (like a child who used the app in October). */
function olderProgress(): AppState {
  const legacy = { ...emptyState(), version: 1, attempts: [{ itemId: 'm.count10.3', skill: 'm.count10', d: 1, correct: true, ts: 1, mode: 'quest' }, { itemId: 'r.letters.2', skill: 'r.letters', d: 1, correct: true, ts: 2, mode: 'quest' }] } as Record<string, unknown>;
  delete legacy.exposures;
  const up = upgradeState(JSON.parse(JSON.stringify(legacy)));
  if (!up.ok) throw new Error(up.reason);
  return up.state;
}

describe('mock i-Ready covers each domain, not one topic', () => {
  const cases: [string, () => AppState, (i: number) => boolean][] = [
    ['a new profile answering everything right', emptyState, () => true],
    ['a new profile answering about 70% right', emptyState, (i) => (i * 7) % 10 < 7],
    ['older progress answering everything right', olderProgress, () => true],
  ];
  it.each(cases)('math: %s', (_, state, correct) => {
    const topics = topicsPerDomain(state(), 'math', correct);
    expect(topics.number).toBeGreaterThanOrEqual(4);
    expect(topics.algebra).toBeGreaterThanOrEqual(4);
    expect(topics.measure).toBeGreaterThanOrEqual(4);
    expect(topics.geometry).toBeGreaterThanOrEqual(2);
  });
  it.each(cases)('reading: %s', (_, state, correct) => {
    const topics = topicsPerDomain(state(), 'reading', correct);
    for (const d of MOCK_DOMAINS.reading) expect(topics[d.strand], d.strand).toBeGreaterThanOrEqual(2);
    expect(topics.phonics + topics.lit + topics.info).toBeGreaterThanOrEqual(10);
  });
});
