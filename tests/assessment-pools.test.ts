import { describe, expect, it } from 'vitest';
import { ALL_SKILLS, getSkill } from '../src/content';
import { makeItem, num } from '../src/content/helpers';
import { emptyState, recordAttempt } from '../src/engine/progress';
import { itemFingerprint } from '../src/engine/exposures';
import { isAssessed, isNewReserve, poolItems } from '../src/engine/itemPools';
import { chooseMockCandidate, newMockRun, scoreMock } from '../src/engine/mock';

const skill = getSkill('m.count10')!;
const question = (id: string, n: number) => makeItem(skill.id, id, 1, { say: `Count ${n} moons.`, visual: { kind: 'objects', emoji: '🌙', count: n }, choices: [num(n), num(n+1, 'near_miss'), num(n+2, 'near_miss')], explain: `There are ${n}.` });

describe('assessment question pools', () => {
  it('never places the same visible and spoken question in both catalogues', () => {
    const practice = new Set<string>(), mock = new Set<string>();
    for (const s of ALL_SKILLS.filter(isAssessed)) {
      const p = poolItems(s, 'practice'), m = poolItems(s, 'mock');
      expect(p.length, `${s.id} practice`).toBeGreaterThan(0);
      expect(m.length, `${s.id} mock`).toBeGreaterThan(0);
      p.forEach(i => practice.add(itemFingerprint(i)));
      m.forEach(i => mock.add(itemFingerprint(i)));
    }
    expect([...practice].filter(fp => mock.has(fp))).toEqual([]);
  });
  it('does not move an exposed practice question into the mock even if its ID changes', () => {
    const a = question('a', 3), renamed = { ...a, id: 'different-id' }, other = question('b', 4);
    const state = recordAttempt(emptyState(), { itemId: a.id, fingerprint: itemFingerprint(a), repeated: false, skill: a.skill, d: 1, correct: true, ts: 1, mode: 'skill' });
    const selected = chooseMockCandidate(state, [], [{ skill, item: renamed }, { skill, item: other }]);
    expect(selected?.candidate.item.id).toBe(other.id);
  });
  it('uses unseen eligible questions before repeats, then repeats when exhausted', () => {
    const a = question('a', 3), b = question('b', 4);
    const answers = [{ strand: 'number', skill: skill.id, itemId: a.id, fingerprint: itemFingerprint(a), repeated: false, level: 0, correct: true, ts: 1 }];
    const state = emptyState();
    expect(chooseMockCandidate(state, answers, [{skill,item:a},{skill,item:b}])?.candidate.item.id).toBe(b.id);
    answers.push({ ...answers[0], itemId: b.id, fingerprint: itemFingerprint(b), ts: 2 });
    expect(chooseMockCandidate(state, answers, [{skill,item:a},{skill,item:b}])?.repeated).toBe(true);
  });
  it('quarantines unreconstructable older practice except new reserved questions', () => {
    const state = recordAttempt(emptyState(), { itemId: 'old', skill: skill.id, d: 1, correct: true, ts: 1, mode: 'skill' });
    const reserved = poolItems(skill, 'mock').find(isNewReserve)!;
    const selected = chooseMockCandidate(state, [], [{ skill, item: question('candidate', 3) }, { skill, item: reserved }]);
    expect(selected?.candidate.item.id).toBe(reserved.id);
    expect(selected?.repeated).toBe(false);
  });
  it('does not treat familiar or untracked mock answers as fresh independent evidence', () => {
    const run = newMockRun('math');
    run.answers = [{ strand: 'number', skill: skill.id, itemId: 'x', level: 2, correct: true, repeated: true, ts: 1 }, { strand: 'number', skill: skill.id, itemId: 'y', level: 2, correct: true, ts: 2 }];
    const domain = scoreMock(run).domains.find(d => d.strand === 'number')!;
    expect(domain.freshTotal).toBe(0);
    expect(domain.repeated).toBe(1);
    expect(domain.untracked).toBe(1);
    expect(domain.label).toBe('Limited evidence');
  });
});

it('keeps different pictures with the same generator ID eligible', () => {
  const a = question('same', 3), b = { ...question('same', 4), id: a.id };
  const answers = [{ strand: 'number', skill: skill.id, itemId: a.id, fingerprint: itemFingerprint(a), repeated: false, level: 0, correct: true, ts: 1 }];
  const selected = chooseMockCandidate(emptyState(), answers, [{skill,item:a},{skill,item:b}]);
  expect(itemFingerprint(selected!.candidate.item)).toBe(itemFingerprint(b));
  expect(selected!.repeated).toBe(false);
});

it('repeats reserved questions to finish when legacy exposure exhausts a domain', async () => {
  const { nextMockStep, mockTotal } = await import('../src/engine/mock');
  const state = emptyState();
  state.exposures.untrackedPracticeSkills = ALL_SKILLS.filter(isAssessed).map(s => s.id);
  state.exposures.practiceFingerprints = [...new Set(ALL_SKILLS.filter(isAssessed).flatMap(s => poolItems(s, 'mock').filter(i => !i.id.includes('.reserved.')).map(itemFingerprint)))];
  for (const subject of ['math', 'reading'] as const) {
    const run = newMockRun(subject, 2, 123);
    for (let guard = 0; guard < mockTotal(subject); guard++) {
      const step = nextMockStep(state, run);
      expect(step).not.toBeNull();
      run.answers.push({ strand: step!.strand, skill: step!.skill.id, itemId: step!.item.id, fingerprint: itemFingerprint(step!.item), repeated: step!.repeated, level: step!.level, correct: true, ts: guard });
    }
    expect(nextMockStep(state, run)).toBeNull();
    expect(run.answers.filter(a => !a.repeated)).toHaveLength(subject === 'math' ? 4 : 6);
    expect(run.answers.some(a => a.repeated)).toBe(true);
    expect(scoreMock(run).domains.every(d => d.freshTotal === 1)).toBe(true);
  }
});

it('preserves all existing attempts and excludes familiar answers from mastery', () => {
  const state = emptyState();
  state.attempts = Array.from({length: 6000}, (_, i) => ({ itemId: `old${i}`, skill: 'm.add', d: 2 as const, correct: true, ts: i, mode: 'skill' as const }));
  const next = recordAttempt(state, { itemId: 'familiar', fingerprint: 'familiar', repeated: true, skill: 'm.add', d: 3, correct: true, ts: 7000, mode: 'skill' });
  expect(next.attempts).toHaveLength(6001);
  expect(next.attempts[0].itemId).toBe('old0');
  expect(next.skills['m.add'].mastered).toBe(false);
});

it('keeps reserved prompts distinct from the existing authored and generated catalogue', async () => {
  const { MOCK_ONLY_ITEMS } = await import('../src/content/mockOnly');
  const { catalogue } = await import('../src/engine/itemPools');
  const reserve = new Set(MOCK_ONLY_ITEMS.map(itemFingerprint));
  const collisions = ALL_SKILLS.flatMap(s => catalogue(s).filter(i => reserve.has(itemFingerprint(i))).map(i => i.id));
  expect(collisions).toEqual([]);
});

it('uses another eligible skill before repeating in a check-up', async () => {
  const { nextCheckupItem } = await import('../src/engine/planner');
  const { isMockItem } = await import('../src/engine/itemPools');
  const practiceItem = (id: string) => {
    for (let n = id === 'b' ? 20 : 1; n < 100; n++) { const item = question(`${id}-${n}`, n); if (!isMockItem(item)) return item; }
    throw Error('no practice item');
  };
  const a = { ...skill, id: 'test.a', items: [practiceItem('a')], generate: undefined };
  const b = { ...skill, id: 'test.b', items: [practiceItem('b')], generate: undefined };
  const plan = { subject: 'math' as const, perStrand: 3, strands: [{ strand: 'number', title: 'Numbers', skills: [a, b] }] };
  const state = emptyState();
  const first = nextCheckupItem(state, plan, [])!;
  const answer = { skill: first.skill.id, itemId: first.item.id, fingerprint: itemFingerprint(first.item), d: first.item.difficulty, correct: false, strand: 'number' };
  const second = nextCheckupItem(state, plan, [answer])!;
  expect(second.skill.id).toBe('test.b');
  expect(itemFingerprint(second.item)).not.toBe(answer.fingerprint);
});

it('uses new math concepts in actual check-up and placement runs', async () => {
  const { planCheckup, nextCheckupItem, startPlacement, placementNext, placementAnswer } = await import('../src/engine/planner');
  const state = emptyState(), plan = planCheckup(state, 'math');
  const answers: { itemId: string; fingerprint: string; skill: string; d: 1|2|3; correct: boolean; strand: string }[] = [];
  for (;;) {
    const step = nextCheckupItem(state, plan, answers);
    if (!step) break;
    answers.push({itemId:step.item.id, fingerprint:itemFingerprint(step.item), skill:step.skill.id, d:step.item.difficulty, correct:true, strand:step.strand});
  }
  expect(answers.some(a => ['m.sequence120', 'm.put-together', 'm.width'].includes(a.skill))).toBe(true);
  const run = startPlacement(state, 'math'), visited: string[] = [];
  for (;;) { const step = placementNext(state, run); if (!step) break; visited.push(step.skill.id); placementAnswer(run, true); }
  expect(visited.some(id => ['m.sequence120', 'm.chart120', 'm.put-together'].includes(id))).toBe(true);
});

it('can select each new skill from the held-out mock pool', async () => {
  const { KINDERGARTEN_NUMBER_SKILLS } = await import('../src/content/kindergartenNumbers');
  const { KINDERGARTEN_VISUAL_SKILLS } = await import('../src/content/kindergartenVisual');
  for (const s of [...KINDERGARTEN_NUMBER_SKILLS, ...KINDERGARTEN_VISUAL_SKILLS]) {
    const candidates = poolItems(s, 'mock').map(item => ({skill:s,item}));
    expect(candidates.length, s.id).toBeGreaterThan(0);
    const chosen = chooseMockCandidate(emptyState(), [], candidates);
    expect(chosen?.candidate.skill.id).toBe(s.id);
    expect(chosen?.repeated).toBe(false);
  }
});

it('excludes old ambiguous grid wording and old fingerprint formats from fresh evidence', async () => {
  const { isFreshEvidence } = await import('../src/engine/exposures');
  expect(isFreshEvidence({itemId:'m2.shapes.4', fingerprint:'fp2:example', repeated:false})).toBe(false);
  expect(isFreshEvidence({itemId:'m.add#old', fingerprint:'q:oldhash', repeated:false})).toBe(false);
  expect(isFreshEvidence({itemId:'m2.shapes.4-small-squares', fingerprint:'fp2:example', repeated:false})).toBe(true);
});

it('can serve every new kindergarten topic through the mock selector', async () => {
  const { KINDERGARTEN_NUMBER_SKILLS } = await import('../src/content/kindergartenNumbers');
  const { KINDERGARTEN_VISUAL_SKILLS } = await import('../src/content/kindergartenVisual');
  const { nextMockStep, MOCK_DOMAINS, MOCK_PER_DOMAIN } = await import('../src/engine/mock');
  const wanted = [...KINDERGARTEN_NUMBER_SKILLS, ...KINDERGARTEN_VISUAL_SKILLS];
  const seen = new Set<string>();
  for (const domain of MOCK_DOMAINS.math) {
    const count = ALL_SKILLS.filter(s => s.subject === 'math' && s.strand === domain.strand && (!s.regions || s.regions.includes('us-ga'))).length;
    for (let offset = 0; offset < count; offset++) {
      const run = newMockRun('math', 2, offset);
      for (const other of MOCK_DOMAINS.math.filter(d => d.strand !== domain.strand)) for (let i = 0; i < MOCK_PER_DOMAIN.math; i++) run.answers.push({ strand: other.strand, skill: 'placeholder', itemId: `${other.strand}-${i}`, fingerprint: `fp2:${other.strand}-${i}`, repeated: false, level: 2, correct: true, ts: i });
      const step = nextMockStep(emptyState(), run);
      if (step) seen.add(step.skill.id);
    }
  }
  expect(wanted.filter(s => !seen.has(s.id)).map(s => s.id)).toEqual([]);
});

it('keeps newly authored kindergarten prompts distinct from the pre-existing catalogue', async () => {
  const { KINDERGARTEN_NUMBER_SKILLS } = await import('../src/content/kindergartenNumbers');
  const { KINDERGARTEN_VISUAL_SKILLS } = await import('../src/content/kindergartenVisual');
  const { catalogue } = await import('../src/engine/itemPools');
  const additions = [...KINDERGARTEN_NUMBER_SKILLS, ...KINDERGARTEN_VISUAL_SKILLS];
  const ids = new Set(additions.map(s => s.id));
  const old = new Set(ALL_SKILLS.filter(s => !ids.has(s.id)).flatMap(s => catalogue(s).map(itemFingerprint)));
  expect(additions.flatMap(s => catalogue(s).filter(item => old.has(itemFingerprint(item))).map(item => item.id))).toEqual([]);
});

it('provides at least a full run of new reserved questions per mock domain', async () => {
  const { MOCK_ONLY_ITEMS } = await import('../src/content/mockOnly');
  const { MOCK_DOMAINS, MOCK_PER_DOMAIN } = await import('../src/engine/mock');
  for (const subject of ['math', 'reading'] as const) for (const domain of MOCK_DOMAINS[subject]) {
    const candidates = MOCK_ONLY_ITEMS.filter(item => isNewReserve(item) && getSkill(item.skill)?.subject === subject && getSkill(item.skill)?.strand === domain.strand);
    expect(new Set(candidates.map(itemFingerprint)).size, `${subject} ${domain.strand}`).toBeGreaterThanOrEqual(MOCK_PER_DOMAIN[subject]);
  }
});

it('does not award check-up credit for repeated or untracked answers', async () => {
  const { creditFromCheckup, planCheckup, scoreCheckup } = await import('../src/engine/planner');
  const state = emptyState();
  const attempts = [
    { itemId:'one', fingerprint:'fp2:one', repeated:true, skill:'m.add', d:3 as const, correct:true, ts:1, mode:'checkup' as const, strand:'algebra' },
    { itemId:'two', skill:'m.add', d:3 as const, correct:true, ts:2, mode:'checkup' as const, strand:'algebra' },
  ];
  expect(creditFromCheckup(state, attempts).skills['m.add']?.credited).not.toBe(true);
  const result = scoreCheckup(planCheckup(state, 'math'), attempts);
  expect(result.repeated).toBe(1);
  expect(result.untracked).toBe(1);
  expect(result.strands.find(s => s.strand === 'algebra')?.freshTotal).toBe(0);
});

it('does not change unrelated science practice progression', () => {
  let state = emptyState();
  for (let i = 0; i < 8; i++) state = recordAttempt(state, { itemId:`science-${i}`, skill:'s.living', d:2, correct:true, ts:Date.UTC(2026, 0, 1 + Math.floor(i / 3)), mode:'skill', repeated:true });
  expect(state.skills['s.living']?.mastered).toBe(true);
});

it('allows new kindergarten practice to be fresh despite an older aggregate mock', async () => {
  const { wasExposed } = await import('../src/engine/exposures');
  const state = emptyState();
  state.exposures.untrackedMockSkills = ['__subject_math__'];
  const item = poolItems(getSkill('m.chart120')!, 'practice')[0];
  expect(wasExposed(state.exposures, item)).toBe(false);
  state.exposures.untrackedPracticeSkills.push('m.chart120');
  expect(wasExposed(state.exposures, item)).toBe(true);
});

it('finishes a skip challenge when its targeted practice pool has only one item', async () => {
  const { buildSkipChallenge } = await import('../src/engine/planner');
  const { isMockItem } = await import('../src/engine/itemPools');
  let item = question('single', 2);
  for (let n = 2; isMockItem(item) && n < 100; n++) item = question(`single-${n}`, n);
  const one = { ...skill, id: 'test.single-practice', items: [item], generate: undefined };
  const steps = buildSkipChallenge(emptyState(), one);
  expect(steps).toHaveLength(3);
  expect(steps.map(s => s.repeated)).toEqual([false, true, true]);
  expect(new Set(steps.map(s => s.item.id)).size).toBe(3);
  expect(new Set(steps.map(s => itemFingerprint(s.item))).size).toBe(1);
});
