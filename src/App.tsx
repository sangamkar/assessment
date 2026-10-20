import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CURRICULA, getSkill, getSubject } from './content';
import type { SubjectId } from './content/types';
import type { CheckupAnswer, CheckupPlan, QuestStep } from './engine/planner';
import { PLACEMENT_CAP, buildQuest, buildSkillSession, buildSkipChallenge, creditFromCheckup, nextCheckupItem, placementAnswer, placementNext, planCheckup, scoreCheckup, startPlacement } from './engine/planner';
import type { PlacementRun } from './engine/planner';
import type { MockRun, MockSubject } from './engine/mock';
import { MOCK_BREAK_EVERY, mockTitle, mockTotal, newMockRun, nextMockStep, scoreMock } from './engine/mock';
import type { AppState, Attempt, GameId, Mode } from './engine/progress';
import { gameState, loadState, markIntroSeen, markKnown, recordAttempt, recordGame, saveState, skillState } from './engine/progress';
import { Games } from './ui/games/Games';
import { MysteryWord } from './ui/games/MysteryWord';
import { NumberPath } from './ui/games/NumberPath';
import { SentenceBuilder } from './ui/games/SentenceBuilder';
import { PasscodeLock } from './components/PasscodeLock';
import { soundEngine } from './utils/audio';
import { Gate } from './ui/Gate';
import { Home } from './ui/Home';
import { Island } from './ui/Island';
import { Parent } from './ui/Parent';
import type { AnswerEvent } from './ui/Player';
import { Player } from './ui/Player';
import { Results } from './ui/Results';
import { Setup } from './ui/Setup';

type View =
  | { name: 'home' }
  | { name: 'island'; subject: SubjectId }
  | { name: 'play'; mode: Mode; title: string; color: string; total: number; first: QuestStep | null; again?: () => void; startAt?: number }
  | { name: 'results'; mode: Mode; correct: number; total: number; note?: string; again?: () => void }
  | { name: 'games' }
  | { name: 'game'; id: GameId; level: 1 | 2 | 3; run: number }
  | { name: 'gate' }
  | { name: 'parent' };

interface Session {
  queue: QuestStep[];
  index: number;
  plan?: CheckupPlan;
  placement?: PlacementRun;
  mock?: MockRun;
  answers: (CheckupAnswer & Attempt)[];
}

export default function App() {
  const [authed, setAuthed] = useState(() => {
    try {
      return localStorage.getItem('classroom_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [state, setStateRaw] = useState<AppState>(loadState);
  const [view, setView] = useState<View>({ name: 'home' });
  const session = useRef<Session>({ queue: [], index: 0, answers: [] });
  const stateRef = useRef(state);
  stateRef.current = state;

  const update = useCallback((fn: (s: AppState) => AppState) => setStateRaw((s) => fn(s)), []);
  useEffect(() => saveState(state), [state]);
  useEffect(() => soundEngine.setMuted(state.settings.muted), [state.settings.muted]);
  const locale = CURRICULA[state.settings.primary].locale;
  useEffect(() => soundEngine.setLocale(locale), [locale]);

  if (!authed) {
    return (
      <PasscodeLock
        onUnlock={() => {
          try {
            localStorage.setItem('classroom_auth', 'true');
          } catch {
            // private mode: stay unlocked for this visit only
          }
          setAuthed(true);
        }}
      />
    );
  }

  if (!state.profile) {
    return <Setup onSave={(name, avatar) => update((s) => ({ ...s, profile: { name, avatar, createdAt: Date.now() } }))} />;
  }

  const startQuest = () => {
    const queue = buildQuest(stateRef.current);
    session.current = { queue, index: 0, answers: [] };
    setView({ name: 'play', mode: 'quest', title: 'Today’s Quest', color: '#f97316', total: queue.length, first: queue[0] ?? null, again: startQuest });
  };

  const startSkill = (skillId: string) => {
    const skill = buildSkillSession(stateRef.current, getSkillOrThrow(skillId));
    session.current = { queue: skill, index: 0, answers: [] };
    const subject = getSubject(skill[0].skill.subject);
    setView({ name: 'play', mode: 'skill', title: `${skill[0].skill.icon} ${skill[0].skill.kidTitle}`, color: subject.color, total: skill.length, first: skill[0], again: () => startSkill(skillId) });
  };

  const startCheckup = (subjectId: SubjectId) => {
    const plan = planCheckup(stateRef.current, subjectId);
    session.current = { queue: [], index: 0, plan, answers: [] };
    const first = nextCheckupItem(stateRef.current, plan, []);
    if (first) session.current.queue.push(first);
    const subject = getSubject(subjectId);
    const total = plan.strands.length * plan.perStrand;
    setView({ name: 'play', mode: 'checkup', title: `Check-up · ${subject.kidTitle}`, color: subject.color, total, first });
  };

  const startPlacementRun = (subjectId: SubjectId) => {
    const run = startPlacement(stateRef.current, subjectId);
    session.current = { queue: [], index: 0, placement: run, answers: [] };
    const first = placementNext(stateRef.current, run);
    const subject = getSubject(subjectId);
    setView({ name: 'play', mode: 'placement', title: `Find your level · ${subject.kidTitle}`, color: subject.color, total: PLACEMENT_CAP, first });
  };

  const startSkip = (skillId: string) => {
    const queue = buildSkipChallenge(stateRef.current, getSkillOrThrow(skillId));
    session.current = { queue, index: 0, answers: [] };
    const subject = getSubject(queue[0].skill.subject);
    setView({ name: 'play', mode: 'skip', title: `⚡ Skip ahead · ${queue[0].skill.kidTitle}`, color: subject.color, total: queue.length, first: queue[0] });
  };

  const startMock = (subject: MockSubject) => {
    const saved = stateRef.current.mockRun;
    const run: MockRun = saved && saved.subject === subject ? { ...saved, answers: [...saved.answers] } : newMockRun(subject);
    session.current = { queue: [], index: 0, mock: run, answers: [] };
    if (!saved || saved.subject !== subject) update((s) => ({ ...s, mockRun: run }));
    const first = nextMockStep(stateRef.current, run);
    if (!first) {
      // Every question was already answered before a pause: just score it.
      const result = scoreMock(run);
      update((s) => ({ ...s, mocks: [...(s.mocks ?? []), result], mockRun: undefined }));
      setView({ name: 'parent' });
      return;
    }
    setView({ name: 'play', mode: 'mock', title: mockTitle(subject), color: '#4f46e5', total: mockTotal(subject), first, startAt: run.answers.length + 1 });
  };

  const getNext = (): QuestStep | null => {
    const s = session.current;
    if (s.mock) return nextMockStep(stateRef.current, s.mock);
    if (s.placement) return placementNext(stateRef.current, s.placement);
    if (s.plan) {
      const next = nextCheckupItem(stateRef.current, s.plan, s.answers);
      if (next) s.queue.push(next);
      return next;
    }
    s.index++;
    return s.queue[s.index] ?? null;
  };

  const onAnswer = (e: AnswerEvent, mode: Mode) => {
    const attempt: Attempt = { itemId: e.step.item.id, skill: e.step.skill.id, d: e.step.item.difficulty, correct: e.correct, why: e.why, ts: Date.now(), mode };
    if (mode === 'placement' && session.current.placement) placementAnswer(session.current.placement, e.correct);
    if (mode === 'mock' && session.current.mock) {
      const run = session.current.mock;
      const step = e.step as QuestStep & { strand: string; level: number; target: number };
      run.answers.push({ strand: step.strand, skill: step.skill.id, itemId: step.item.id, level: step.level, target: step.target, correct: e.correct, why: e.why, ts: attempt.ts });
      const snapshot = { ...run, answers: [...run.answers] };
      update((s) => ({ ...s, mockRun: snapshot })); // saved after every answer, so a paused test resumes
    }
    if (mode === 'checkup') {
      const strand = (e.step as QuestStep & { strand?: string }).strand ?? e.step.skill.strand;
      session.current.answers.push({ ...attempt, strand, skill: attempt.skill, itemId: attempt.itemId });
    }
    update((s) => recordAttempt(s, attempt));
  };

  const onFinish = (mode: Mode, summary: { correct: number; total: number }, again?: () => void) => {
    if (mode === 'checkup' && session.current.plan) {
      const result = scoreCheckup(session.current.plan, session.current.answers);
      update((s) => creditFromCheckup({ ...s, checkups: [...s.checkups, result] }, session.current.answers));
    } else if (mode === 'mock' && session.current.mock) {
      const result = scoreMock(session.current.mock);
      update((s) => ({ ...s, mocks: [...(s.mocks ?? []), result], mockRun: undefined }));
      setView({ name: 'results', mode, ...summary, note: 'All done! You worked so hard. A grown-up can see your results.' });
      return;
    } else if (mode === 'placement' && session.current.placement) {
      const known = session.current.placement.known;
      update((s) => markKnown(s, known, 'tested'));
      const note = known.length
        ? `Amazing! You can skip ${known.length} thing${known.length > 1 ? 's' : ''} you already know.`
        : 'Thank you! Now we know where to start.';
      setView({ name: 'results', mode, ...summary, note });
      return;
    } else if (mode === 'skip') {
      const skill = session.current.queue[0]?.skill;
      const passed = summary.correct === summary.total;
      if (passed && skill) update((s) => markKnown(s, [skill.id], 'tested'));
      setView({
        name: 'results',
        mode,
        ...summary,
        note: passed ? 'You already know this one! Skipped ahead. ⚡' : `${summary.correct} of ${summary.total} right. Let’s practise this one together!`,
      });
      return;
    } else {
      update((s) => ({ ...s, stars: s.stars + (mode === 'quest' ? 3 : 1) }));
    }
    setView({ name: 'results', mode, ...summary, again });
  };

  switch (view.name) {
    case 'home':
      return <Home state={state} onQuest={startQuest} onGames={() => setView({ name: 'games' })} onIsland={(subject) => setView({ name: 'island', subject })} onGrownUps={() => setView({ name: 'gate' })} />;
    case 'games':
      return <Games state={state} onBack={() => setView({ name: 'home' })} onPlay={(id) => setView({ name: 'game', id, level: gameState(stateRef.current, id).level, run: Date.now() })} />;
    case 'game': {
      // Level is fixed for a session; the next session starts at the updated level.
      const props = { level: view.level, onRound: (r: 'win' | 'assisted' | 'loss') => update((s) => recordGame(s, view.id, r)), onExit: () => setView({ name: 'games' }) };
      if (view.id === 'mystery-word') return <MysteryWord key={view.run} {...props} />;
      if (view.id === 'sentence-builder') return <SentenceBuilder key={view.run} {...props} />;
      return <NumberPath key={view.run} {...props} />;
    }
    case 'island':
      return <Island state={state} subject={view.subject} onBack={() => setView({ name: 'home' })} onPlay={(skill) => startSkill(skill.id)} onSkip={(skill) => startSkip(skill.id)} />;
    case 'play':
      return (
        <Player
          locale={locale}
          key={`${view.mode}-${view.first?.item.id}`}
          mode={view.mode}
          title={view.title}
          color={view.color}
          total={view.total}
          first={view.first}
          getNext={getNext}
          introSeen={(id) => skillState(stateRef.current, id).introSeen}
          onIntroDone={(id) => update((s) => markIntroSeen(s, id))}
          onAnswer={(e) => onAnswer(e, view.mode)}
          onFinish={(summary) => onFinish(view.mode, summary, view.again)}
          startAt={view.startAt}
          breakEvery={view.mode === 'mock' ? MOCK_BREAK_EVERY : undefined}
          onExit={() => setView(view.mode === 'checkup' || view.mode === 'placement' || view.mode === 'mock' ? { name: 'parent' } : { name: 'home' })}
        />
      );
    case 'results':
      return <Results correct={view.correct} total={view.total} mode={view.mode} note={view.note} onHome={() => setView({ name: 'home' })} onAgain={view.again} />;
    case 'gate':
      return <Gate onPass={() => setView({ name: 'parent' })} onCancel={() => setView({ name: 'home' })} />;
    case 'parent':
      return <Parent state={state} setState={(s) => update(() => s)} onClose={() => setView({ name: 'home' })} onStartCheckup={startCheckup} onStartPlacement={startPlacementRun} onStartMock={startMock} />;
  }
}

function getSkillOrThrow(id: string) {
  const s = getSkill(id);
  if (!s) throw new Error(`Unknown skill ${id}`);
  return s;
}
