import { completeDailyQuest, gamesUnlocked } from './engine/dailyQuest';
import { dayKey } from './engine/progress';
import { GardenKitchen } from './ui/games/GardenKitchen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CURRICULA, getSkill, getSubject } from './content';
import type { SubjectId } from './content/types';
import type { CheckupAnswer, CheckupPlan, QuestStep } from './engine/planner';
import { PLACEMENT_CAP, applyPlacement, buildQuest, buildSkillSession, buildSkipChallenge, creditFromCheckup, nextCheckupItem, placementAnswer, placementNext, planCheckup, scoreCheckup, startPlacement } from './engine/planner';
import type { PlacementRun } from './engine/planner';
import type { MockRun, MockSubject } from './engine/mock';
import { MOCK_BREAK_EVERY, mockTitle, mockTotal, newMockRun, nextMockStep, scoreMock } from './engine/mock';
import type { AppState, Attempt, GameId, GameEvidence, Mode } from './engine/progress';
import { gameState, loadState, markIntroSeen, markKnown, recordAttempt, recordGame, saveState, skillState } from './engine/progress';
import { Games } from './ui/games/Games';
import { MysteryWord } from './ui/games/MysteryWord';
import { NumberPath } from './ui/games/NumberPath';
import { SentenceBuilder } from './ui/games/SentenceBuilder';
import { PasscodeLock } from './components/PasscodeLock';
import { soundEngine } from './utils/audio';
import { Gate } from './ui/Gate';
import { Home } from './ui/Home';
import { StartingPoint } from './ui/StartingPoint';
import { questionFingerprint, seenQuestion } from './engine/evidence';
import { BuildExplore } from './ui/BuildExplore';
import { Island } from './ui/Island';
import { Parent } from './ui/Parent';
import type { AnswerEvent } from './ui/Player';
import { Player } from './ui/Player';
import { Results } from './ui/Results';
import { Setup } from './ui/Setup';
import { AirportDesigner, AirportJournal } from './ui/airport/AirportDesigner';
import { emptyAirport } from './games/airport';
import { Workshop } from './ui/brain/Workshop';
import { isWorkshop } from './games/workshop';
import { BrainLab } from './ui/brain/BrainLab';
import { isNewGame, newBrainRun } from './games/brain';
import { itemFingerprint } from './engine/itemPools';
import { addScreenTime, claimStreakStickers, gentleStreak, goalMet, playLocked, recordQuestDone, starsToSpend } from './engine/engagement';
import { StickerBook } from './ui/StickerBook';
import type { DoneToday } from './ui/Results';

type View =
  | { name: 'home' }
  | { name: 'starting-point' }
  | { name: 'explore' }
  | { name: 'airport' }
  | { name: 'portfolio' }
  | { name: 'island'; subject: SubjectId }
  | { name: 'play'; mode: Mode; title: string; color: string; total: number; first: QuestStep | null; again?: () => void; startAt?: number }
  | { name: 'results'; mode: Mode; correct: number; total: number; note?: string; again?: () => void; doneToday?: boolean }
  | { name: 'stickers' }
  | { name: 'games' }
  | { name: 'game'; id: GameId; level: 1 | 2 | 3; run: number }
  | { name: 'gate' }
  | { name: 'parent' };

interface Session {
  questDay?: string;
  queue: QuestStep[];
  index: number;
  plan?: CheckupPlan;
  placement?: PlacementRun;
  startupSubject?: 'math' | 'reading';
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
  const [storageOk, setStorageOk] = useState(true);
  const [today, setToday] = useState(() => dayKey(Date.now()));
  useEffect(() => {
    const refresh = () => setToday(dayKey(Date.now()));
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const unlocked = state.questCompletedDay === today;

  stateRef.current = state;

  const update = useCallback((fn: (s: AppState) => AppState) => setStateRaw((s) => fn(s)), []);
  useEffect(() => setStorageOk(saveState(state)), [state]);
  useEffect(() => soundEngine.setMuted(state.settings.muted), [state.settings.muted]);
  useEffect(() => update(claimStreakStickers), [state.days, update]);
  useEffect(() => {
    const tick = 30_000;
    const id = window.setInterval(() => document.visibilityState === 'visible' && addScreenTime(tick), tick);
    return () => window.clearInterval(id);
  }, []);
  const locale = CURRICULA[state.settings.primary].locale;
  useEffect(() => soundEngine.setLocale(locale), [locale]);

  const startGame = (id: GameId) => {
    if (!gamesUnlocked(stateRef.current)) { setView({name:'games'}); return; }
    const level = gameState(stateRef.current, id).level;
    if (id === 'garden-kitchen') update(s => ({ ...s, lastGame: id }));
    if (isNewGame(id)) update(s => ({
      ...s, lastGame: id,
      brainRuns: {...s.brainRuns, [id]: s.brainRuns?.[id] ?? newBrainRun(id, level)},
    }));
    setView({name:'game', id, level, run:Date.now()});
  };

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
    session.current = { queue, index: 0, answers: [], questDay: dayKey(Date.now()) };
    setView({ name: 'play', mode: 'quest', title: 'Today’s learning', color: '#f97316', total: queue.length, first: queue[0] ?? null, again: startQuest });
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
    if (!first) return; // nothing visible to ask (e.g. a language that is switched off)
    session.current.queue.push(first);
    const subject = getSubject(subjectId);
    const total = plan.strands.length * plan.perStrand;
    setView({ name: 'play', mode: 'checkup', title: `Check-up · ${subject.kidTitle}`, color: subject.color, total, first });
  };

  const startPlacementRun = (subjectId: SubjectId, startup = false) => {
    const run = startPlacement(stateRef.current, subjectId);
    if (startup) { run.cap = 12; run.perStrandCap = Math.max(2, Math.floor(12 / Math.max(1, run.strands.length))); }
    session.current = { queue: [], index: 0, placement: run, answers: [], startupSubject: startup ? subjectId as 'math' | 'reading' : undefined };
    const first = placementNext(stateRef.current, run);
    const subject = getSubject(subjectId);
    if (!first) {
      if (startup) { update(s => ({ ...s, startupCheck: { ...s.startupCheck, [subjectId]: Date.now() } })); setView({ name: 'starting-point' }); return; }
      window.alert(`Nothing left to place in ${subject.title}: every skill is already mastered or marked known.`);
      return;
    }
    setView({ name: 'play', mode: 'placement', title: `Find a starting point · ${subject.kidTitle}`, color: subject.color, total: run.cap ?? PLACEMENT_CAP, first });
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
    if (!first && run.answers.length < mockTotal(subject)) { window.alert('No mock content is available in this area. Your answers are saved; no partial result has been scored.'); return; }
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
    const attempt: Attempt = { poolFingerprint: itemFingerprint(e.step.item), fingerprint: questionFingerprint(e.step.item), repeated: e.step.repeated ?? seenQuestion(stateRef.current, e.step.item), selectedChoiceId: e.selectedChoiceId, question: e.correct ? undefined : e.question, itemId: e.step.item.id, skill: e.step.skill.id, d: e.step.item.difficulty, correct: e.correct, why: e.why, ts: Date.now(), mode };
    if (mode === 'placement' && session.current.placement) placementAnswer(session.current.placement, e.correct);
    if (mode === 'mock' && session.current.mock) {
      const run = session.current.mock;
      const step = e.step as QuestStep & { strand: string; level: number; target: number };
      run.answers.push({ poolFingerprint: attempt.poolFingerprint, fingerprint: attempt.fingerprint, repeated: attempt.repeated, strand: step.strand, skill: step.skill.id, itemId: step.item.id, level: step.level, target: step.target, correct: e.correct, why: e.why, ts: attempt.ts });
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
      if (session.current.mock.answers.length < mockTotal(session.current.mock.subject)) { setView({ name: 'parent' }); window.alert('No mock content is available in this area. Your answers are saved; no partial result has been scored.'); return; }
      const result = scoreMock(session.current.mock);
      update((s) => ({ ...s, mocks: [...(s.mocks ?? []), result], mockRun: undefined }));
      setView({ name: 'results', mode, ...summary, note: 'All done! You worked so hard. A grown-up can see your results.' });
      return;
    } else if (mode === 'placement' && session.current.placement) {
      const known = session.current.placement.known;
      update((s) => ({ ...applyPlacement(s, session.current.placement!), startupCheck: session.current.startupSubject ? { ...s.startupCheck, [session.current.startupSubject]: Date.now() } : s.startupCheck }));
      if (session.current.startupSubject) { setView({ name: 'starting-point' }); return; }
      const note = known.length
        ? `Amazing! You can skip ${known.length} thing${known.length > 1 ? 's' : ''} you already know.`
        : 'Thank you! Now we know where to start.';
      setView({ name: 'results', mode, ...summary, note });
      return;
    } else if (mode === 'skip') {
      const skill = session.current.queue[0]?.skill;
      const allCorrect = summary.correct === summary.total;
      const passed = allCorrect && summary.total >= 3 && session.current.queue.every(step => !step.repeated);
      if (passed && skill) update((s) => markKnown(s, [skill.id], 'tested'));
      setView({
        name: 'results',
        mode,
        ...summary,
        note: passed ? 'You can try the next challenge! This skill will come back for review.' : allCorrect ? 'You finished the check. We’ll try fresh examples before skipping this skill.' : 'Thank you for trying. Let’s practise this one together!',
      });
      return;
    } else if (mode === 'quest') {
      const finish = (s: AppState): AppState => {
        const completed = completeDailyQuest(s, summary.total, session.current.queue.length, session.current.questDay);
        return { ...(completed === s ? s : recordQuestDone(completed)), stars: s.stars + 3 };
      };
      const before = goalMet(stateRef.current);
      const after = finish(stateRef.current);
      update(finish);
      setView({ name: 'results', mode, ...summary, again, doneToday: !before && goalMet(after) });
      return;
    } else {
      update((s) => ({ ...s, stars: s.stars + 1 }));
    }
    setView({ name: 'results', mode, ...summary, again });
  };

  const content = (() => {
    if (view.name === 'starting-point' || (view.name === 'home' && !state.startupCheck?.finished)) return <StartingPoint state={state} onStart={subject => startPlacementRun(subject, true)} onContinue={() => { update(s => ({ ...s, startupCheck: { ...s.startupCheck, finished: true } })); setView({ name: 'home' }); }} />;
    if (!unlocked && ['games', 'game', 'explore', 'airport'].includes(view.name)) return (
      <main className="growth-page max-w-xl"><button className="growth-secondary" onClick={() => setView({name:'home'})}>← Home</button><section className="growth-feature mt-6 text-center">
        <span className="text-6xl" aria-hidden>🔒</span><h1 className="font-kid text-3xl mt-4">Learning first, then games</h1>
        <p className="my-5">Finish Today’s Learning to open all games and Build &amp; Explore for today. You don’t need every answer right—just finish the session.</p>
        <button className="growth-primary" onClick={startQuest}>Start Today’s Learning →</button>
      </section></main>
    );
    switch (view.name) {
      case 'home':
        return <Home state={state} onResumeGame={startGame} onExplore={() => setView({ name: 'explore' })} onQuest={startQuest} onGames={() => setView({ name: 'games' })} onIsland={(subject) => setView({ name: 'island', subject })} onGrownUps={() => setView({ name: 'gate' })} onStickers={() => setView({ name: 'stickers' })} />;
      case 'stickers':
        return <StickerBook state={state} update={update} onBack={() => setView({ name: 'home' })} />;
      case 'explore':
        return <BuildExplore state={state} onBack={() => setView({ name: 'home' })} onAirport={() => setView({ name: 'airport' })} onPassport={() => setView({ name: 'portfolio' })} />;
      case 'airport':
        return <AirportDesigner state={state} update={update} onBack={() => setView({ name: 'explore' })} onJournal={() => setView({ name: 'portfolio' })} />;
      case 'portfolio':
        return <AirportJournal state={state} onBack={() => setView({ name: 'explore' })} onPlay={(id) => { update((s) => ({ ...s, airport: { ...(s.airport ?? emptyAirport()), selected: id } })); setView({ name: 'airport' }); }} />;
      case 'games':
        return <Games state={state} onBack={() => setView({ name: 'home' })} onPlay={startGame} />;
      case 'game': {
        if (view.id === 'garden-kitchen') return <GardenKitchen state={state} update={update} onExit={() => setView({name:'games'})} />;
        if (isWorkshop(view.id)) return <Workshop id={view.id} state={state} update={update} onExit={() => setView({ name: 'games' })} />;
        if (isNewGame(view.id)) return <BrainLab id={view.id} state={state} update={update} onExit={() => setView({ name: 'games' })} />;
        // Level is fixed for a session; the next session starts at the updated level.
        const props = { level: view.level, onRound: (r: 'win' | 'assisted' | 'loss', evidence?: GameEvidence) => update((s) => recordGame(s, view.id, r, Date.now(), evidence)), onExit: () => setView({ name: 'games' }) };
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
            onExit={() => setView(session.current.startupSubject ? { name: 'starting-point' } : view.mode === 'checkup' || view.mode === 'placement' || view.mode === 'mock' ? { name: 'parent' } : { name: 'home' })}
          />
        );
      case 'results':
      {
        const doneToday: DoneToday | undefined = view.doneToday ? { streak: gentleStreak(state), stars: starsToSpend(state), onStickers: () => setView({ name: 'stickers' }), onGames: playLocked(state) ? undefined : () => setView({ name: 'games' }) } : undefined;
        return <Results correct={view.correct} total={view.total} mode={view.mode} note={view.note} onHome={() => setView({ name: 'home' })} onAgain={view.again} doneToday={doneToday} />;
      }
      case 'gate':
        return <Gate onPass={() => setView({ name: 'parent' })} onCancel={() => setView({ name: 'home' })} />;
      case 'parent':
        return <Parent state={state} setState={(s) => update(() => s)} onClose={() => setView({ name: 'home' })} onStartCheckup={startCheckup} onStartPlacement={startPlacementRun} onPractice={startSkill} onStartingPoint={() => setView({ name: 'starting-point' })} onStartMock={startMock} />;
    }
  })();
  return <>{!storageOk && <div role="alert" className="sticky top-0 z-50 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">Recent changes could not be saved on this device. Keep this page open and use Grown-ups → Settings → Backup to keep a copy.</div>}{content}</>;
}

function getSkillOrThrow(id: string) {
  const s = getSkill(id);
  if (!s) throw new Error(`Unknown skill ${id}`);
  return s;
}
