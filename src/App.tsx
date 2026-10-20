import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CURRICULA, getSkill, getSubject } from './content';
import type { SubjectId } from './content/types';
import type { CheckupAnswer, CheckupPlan, QuestStep } from './engine/planner';
import { buildQuest, buildSkillSession, creditFromCheckup, nextCheckupItem, planCheckup, scoreCheckup } from './engine/planner';
import type { AppState, Attempt, GameId, Mode } from './engine/progress';
import { gameState, loadState, markIntroSeen, recordAttempt, recordGame, saveState, skillState } from './engine/progress';
import { Games } from './ui/games/Games';
import { MysteryWord } from './ui/games/MysteryWord';
import { NumberPath } from './ui/games/NumberPath';
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
  | { name: 'play'; mode: Mode; title: string; color: string; total: number; first: QuestStep | null; again?: () => void }
  | { name: 'results'; mode: Mode; correct: number; total: number; again?: () => void }
  | { name: 'games' }
  | { name: 'game'; id: GameId; level: 1 | 2 | 3; run: number }
  | { name: 'gate' }
  | { name: 'parent' };

interface Session {
  queue: QuestStep[];
  index: number;
  plan?: CheckupPlan;
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

  const getNext = (): QuestStep | null => {
    const s = session.current;
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
      return view.id === 'mystery-word' ? <MysteryWord key={view.run} {...props} /> : <NumberPath key={view.run} {...props} />;
    }
    case 'island':
      return <Island state={state} subject={view.subject} onBack={() => setView({ name: 'home' })} onPlay={(skill) => startSkill(skill.id)} />;
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
          onExit={() => setView(view.mode === 'checkup' ? { name: 'parent' } : { name: 'home' })}
        />
      );
    case 'results':
      return <Results correct={view.correct} total={view.total} mode={view.mode} onHome={() => setView({ name: 'home' })} onAgain={view.again} />;
    case 'gate':
      return <Gate onPass={() => setView({ name: 'parent' })} onCancel={() => setView({ name: 'home' })} />;
    case 'parent':
      return <Parent state={state} setState={(s) => update(() => s)} onClose={() => setView({ name: 'home' })} onStartCheckup={startCheckup} />;
  }
}

function getSkillOrThrow(id: string) {
  const s = getSkill(id);
  if (!s) throw new Error(`Unknown skill ${id}`);
  return s;
}
