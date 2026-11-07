import { WORKSHOP_TITLES } from "../../games/workshop";
import React, { useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bot,
  Package,
  Flag,
  Undo2,
  Lightbulb,
} from "lucide-react";
import type { AppState } from "../../engine/progress";
import { recordGame } from "../../engine/progress";
import {
  LAB_ROUNDS,
  brainCompletion,
  newBrainRun,
  nextBrainRound,
  finishBrainRound,
  combineTiles,
  matchingGroup,
  moveRobot,
  robotDelivery,
  puzzleSeed,
  targetPuzzle,
  balancePuzzle,
  wordPuzzle,
  connectionPuzzle,
  robotPuzzle,
} from "../../games/brain";
import type { BrainRun, NewGameId } from "../../games/brain";
import { GameBar } from "../games/GameFrame";
import { SpeakButton } from "../SpeakButton";
import { soundEngine } from "../../utils/audio";
export const LAB_TITLES: Record<NewGameId, string> = {
  ...WORKSHOP_TITLES,
  "word-detective": "Word Detective",
  "target-number": "Target Number",
  "connections-junior": "Connections Junior",
  "balance-lab": "Balance Lab",
  "robot-delivery": "Robot Delivery",
};
type Update = (fn: (s: AppState) => AppState) => void;
export function BrainLab({
  id,
  state,
  update,
  onExit,
}: {
  id: NewGameId;
  state: AppState;
  update: Update;
  onExit: () => void;
}) {
  const run = state.brainRuns?.[id];
  const guard = useRef(false);
  const promptRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const text = promptRef.current?.textContent;
    if (text && run && run.round < LAB_ROUNDS) soundEngine.speak(text);
    return () => soundEngine.stopSpeech();
  }, [id, run?.seed, run?.round]);
  useEffect(() => {
    guard.current = false;
  }, [run?.round, run?.seed]);
  useEffect(() => () => soundEngine.stopSpeech(), []);
  useEffect(() => {
    if (!run) return;
    const message = brainCompletion(id, run);
    if (!message) return;
    update(state => {
      const current = state.brainRuns?.[id];
      if (!current || current.seed !== run.seed || current.round !== run.round) return state;
      const result = brainCompletion(id,current);
      if (!result) return state;
      const next = finishBrainRound(current,true,result);
      return {...recordGame(state,id,next.clean>current.clean?'win':'assisted',Date.now(),{
        prompt: promptRef.current?.textContent ?? LAB_TITLES[id],
        answer: result,
        hints: current.board.hints,
        mistakes: current.board.misses ? [current.board.misses+' unsuccessful attempts'] : [],
      }),brainRuns:{...state.brainRuns,[id]:next}};
    });
    soundEngine.speak(message);
  }, [id,run?.seed,run?.round,run?.board]);
  if (!run)
    return (
      <main className="growth-page">
        <button onClick={onExit} className="growth-primary">
          Back to games
        </button>
      </main>
    );
  const b = run.board,
    level = run.level,
    seed = puzzleSeed(run);
  const alter = (fn: (r: BrainRun) => BrainRun) =>
    update((s) => {
      const r = s.brainRuns?.[id];
      return !r ? s : { ...s, brainRuns: { ...s.brainRuns, [id]: fn(r) } };
    });
  const patch = (p: Partial<typeof b>) =>
    alter((r) => ({ ...r, board: { ...r.board, ...p } }));
  const fail = (message: string) =>
    alter((r) => ({
      ...r,
      board: { ...r.board, misses: r.board.misses + 1, feedback: message },
    }));
  const finish = (won: boolean, message: string) => {
    if (guard.current || b.status !== "playing") return;
    guard.current = true;
    update((s) => {
      const r = s.brainRuns?.[id];
      if (!r || r.board.status !== "playing") return s;
      const next = finishBrainRound(r, won, message);
      const result = won ? (next.clean > r.clean ? "win" : "assisted") : "loss";
      return {
        ...recordGame(s, id, result, Date.now(), {
          prompt,
          answer: message,
          mistakes: r.board.misses
            ? [r.board.misses + " incorrect check(s) before this result"]
            : [],
          hints: r.board.hints,
        }),
        brainRuns: { ...s.brainRuns, [id]: next },
      };
    });
    soundEngine.speak(message);
  };
  const hint = (message: string) => {
    alter((r) => ({
      ...r,
      board: {
        ...r.board,
        hints: Math.min(1000, r.board.hints + 1),
        feedback: message,
      },
    }));
    soundEngine.speak(message);
  };
  if (run.round >= LAB_ROUNDS)
    return (
      <main className="growth-page max-w-3xl">
        <GameBar
          title={LAB_TITLES[id]}
          round={4}
          rounds={4}
          level={level}
          color="#136f78"
          onExit={onExit}
        />
        <section className="growth-feature mt-8 text-center">
          <h1 className="font-kid text-4xl text-teal-950">
            A few good puzzles.
          </h1>
          <p className="mt-4 text-slate-600">
            {run.clean + run.assisted} of {LAB_ROUNDS} solved · {run.assisted}{" "}
            with help or another try · {run.skipped} explored and skipped
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              className="growth-primary"
              onClick={() =>
                update((s) => ({
                  ...s,
                  brainRuns: {
                    ...s.brainRuns,
                    [id]: newBrainRun(id, s.games[id]?.level ?? level),
                  },
                }))
              }
            >
              Play a new set
            </button>
            <button className="growth-secondary" onClick={onExit}>
              Back to Brain Games
            </button>
          </div>
        </section>
      </main>
    );
  const playing = b.status === "playing";
  let prompt = "",
    content: React.ReactNode = null,
    clue = "",
    solution = "";
  if (id === "word-detective") {
    const p = wordPuzzle(level, run.seed, run.round);
    prompt = p.context
      ? `Which word fits? ${p.word.context}`
      : p.word.clues.join(" ");
    clue = `${p.word.meaning} The word starts with the letter ${p.word.word[0].toUpperCase()}.`;
    solution = `${p.word.word}: ${p.word.meaning} ${p.word.example}`;
    content = (
      <>
        <p className="mb-4 text-sm text-teal-700">
          {p.context
            ? "Use a word you met earlier in a new sentence."
            : "Listen to the clues. Work out the word."}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {p.choices.map((w) => (
            <button
              key={w.word}
              disabled={!playing}
              className="lab-choice"
              onClick={() => {
                if (w.word === p.word.word) finish(true, solution);
                else
                  fail(
                    `That word does not fit these clues. ${b.hints ? clue : "Reveal another clue if you want help."}`,
                  );
              }}
            >
              {w.word}
            </button>
          ))}
        </div>
        {!playing && (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-slate-700">
            <strong>{p.word.word}</strong>
            <p className="mt-2">{p.word.meaning}</p>
            <p className="mt-2">{p.word.example}</p>
          </div>
        )}
      </>
    );
  } else if (id === "target-number") {
    const p = targetPuzzle(level, seed);
    prompt = `Make ${p.target}. Use every number tile exactly once. Choose two tiles in order, then add or subtract them.`;
    clue = `One way starts with ${p.values[0]} ${p.ops[0]} ${p.values[1]}. You can use a different solution.`;
    solution = `One solution: ${p.values.reduce((s, n, i) => (i ? `(${s} ${p.ops[i - 1]} ${n})` : String(n)), "")} = ${p.target}.`;
    content = (
      <>
        <div className="mb-5 text-center">
          <span className="growth-eyebrow">Your target</span>
          <div className="font-kid text-6xl text-teal-800">{p.target}</div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {b.cards.map((n, i) => (
            <button
              key={n.id}
              aria-pressed={b.selection.includes(i)}
              disabled={!playing}
              className={`lab-number ${b.selection.includes(i) ? "lab-selected" : ""}`}
              onClick={() =>
                patch({
                  selection: b.selection.includes(i)
                    ? b.selection.filter((k) => k !== i)
                    : b.selection.length < 2
                      ? [...b.selection, i]
                      : [i],
                  feedback: "",
                })
              }
            >
              <span className="block text-3xl">{n.value}</span>
              {n.expression !== String(n.value) && (
                <span className="mt-2 block text-xs">{n.expression}</span>
              )}
              {b.selection.includes(i) && (
                <span className="mt-2 block text-xs">
                  {b.selection.indexOf(i) === 0 ? "First" : "Second"}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            disabled={!playing}
            aria-pressed={b.operator === "+"}
            className={
              b.operator === "+" ? "growth-primary" : "growth-secondary"
            }
            onClick={() => patch({ operator: "+" })}
          >
            Add +
          </button>
          <button
            disabled={!playing}
            aria-pressed={b.operator === "-"}
            className={
              b.operator === "-" ? "growth-primary" : "growth-secondary"
            }
            onClick={() => patch({ operator: "-" })}
          >
            Subtract −
          </button>
          <button
            disabled={!playing || b.selection.length !== 2}
            className="growth-primary disabled:opacity-40"
            onClick={() => alter(r => {
              const next = combineTiles(r);
              const final = next.board.cards.length === 1;
              if (!final || brainCompletion(id,next)) return next;
              return {...next,board:{...next.board,misses:Math.min(1000,next.board.misses+1),feedback:`Your result is ${next.board.cards[0].value}. Undo a combination to try for ${p.target}.`}};
            })}
          >
            Combine tiles
          </button>
          <button
            disabled={!playing || !b.history.length}
            className="growth-secondary disabled:opacity-40"
            onClick={() =>
              patch({
                cards: b.history[b.history.length - 1],
                history: b.history.slice(0, -1),
                selection: [],
                feedback: "",
              })
            }
          >
            <Undo2 size={18} className="mr-2" />
            Undo combination
          </button>
        </div>

      </>
    );
  } else if (id === "connections-junior") {
    const p = connectionPuzzle(level, run.seed, run.round);
    const done = new Set(b.groups.flat());
    prompt =
      "Find four words that belong together. Tap four tiles to make a group. There are two groups.";
    const remaining = p.tiles.findIndex((_, i) => !done.has(i));
    clue =
      remaining < 0
        ? "You found both groups."
        : `Think about ${p.set.groups[p.tiles[remaining].group].label.toLowerCase()}. ${p.tiles[remaining].word} belongs in that group.`;
    solution = `The groups are ${p.set.groups.map((g) => `${g.label}: ${g.words.join(", ")}`).join(". ")}. ${p.set.explanation}`;
    content = (
      <>
        <div className="mb-4 flex flex-wrap gap-2">
          {b.groups.map((indices, i) => (
            <span className="growth-pill" key={i}>
              {p.set.groups[p.tiles[indices[0]].group].label} ✓
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {p.tiles.map((t, i) => (
            <button
              key={t.word}
              className={`lab-choice ${b.selection.includes(i) ? "lab-selected" : ""} ${done.has(i) ? "opacity-40" : ""}`}
              disabled={!playing || done.has(i)}
              aria-pressed={b.selection.includes(i)}
              onClick={() => {
                const selected = b.selection.includes(i)
                  ? b.selection.filter(n => n !== i) : [...b.selection, i];
                if (selected.length < 4) patch({selection:selected,feedback:""});
                else {
                  const group = matchingGroup(selected,level,run.seed,run.round);
                  if (group === null) patch({selection:[],misses:Math.min(1000,b.misses+1),feedback:"Those words do not share our category. Try another group."});
                  else patch({selection:[],groups:[...b.groups,selected],feedback:`You found ${p.set.groups[group].label.toLowerCase()}!`});
                }
                soundEngine.speak(t.word);
              }}
            >
              {t.word}
            </button>
          ))}
        </div>

      </>
    );
  } else if (id === "balance-lab") {
    const p = balancePuzzle(level, seed);
    const lhs = p.a + (b.answer ?? 0);
    const rhs = p.total;
    const tilt = b.answer === null ? 0 : lhs > rhs ? -9 : lhs < rhs ? 9 : 0;
    prompt = `Make both sides equal. ${p.a} plus what equals ${p.b}${level === 1 ? "" : ` ${p.operator === "+" ? "plus" : "minus"} ${p.c}`}?`;
    clue = `The right side equals ${p.total}. How many more than ${p.a} is that?`;
    solution = `${p.a} + ${p.answer} = ${p.total}. Both sides have the same value.`;
    content = (
      <>
        <div className="mx-auto max-w-md">
          <svg
            role="img"
            aria-label={
              b.answer === null
                ? "Balance waiting for a number"
                : lhs === rhs
                  ? "Both sides balance"
                  : lhs > rhs
                    ? "Left side is heavier"
                    : "Right side is heavier"
            }
            viewBox="0 0 400 210"
            className="w-full"
          >
            <path d="M200 65 L170 185 L230 185Z" fill="#8cb6a5" />
            <g
              transform={`rotate(${tilt} 200 65)`}
              style={{ transition: "transform .3s" }}
            >
              <path
                d="M55 65 H345 M70 65 V130 M330 65 V130"
                stroke="#2b6970"
                strokeWidth="6"
              />
              <path
                d="M25 130 Q70 190 115 130Z M285 130 Q330 190 375 130Z"
                fill="#f2c879"
              />
            </g>
          </svg>
          <div className="-mt-6 mb-6 flex justify-between gap-4 text-center font-kid text-2xl text-teal-950">
            <span className="rounded-xl bg-white p-3">
              {p.a} + {b.answer ?? "?"}
            </span>
            <span className="rounded-xl bg-white p-3">
              {p.b}
              {level > 1 ? ` ${p.operator === "+" ? "+" : "−"} ${p.c}` : ""}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {p.choices.map((n) => (
            <button
              disabled={!playing}
              key={n}
              className={`lab-number ${b.answer === n ? "lab-selected" : ""}`}
              aria-pressed={b.answer === n}
              onClick={() => patch({answer:n,feedback:n===p.answer?"":`${p.a+n} and ${p.total} are not equal. Try another number.`,misses:Math.min(1000,b.misses+(n===p.answer?0:1))})}
            >
              {n}
            </button>
          ))}
        </div>

      </>
    );
  } else {
    const p = robotPuzzle(level, seed);
    prompt = p.instruction;
    clue = `You need ${p.blue} blue and ${p.red} red. The correct station is at row ${Math.floor(p.goal / p.size) + 1}, column ${(p.goal % p.size) + 1}.`;
    solution = `Deliver ${p.blue} blue and ${p.red} red parcels to row ${Math.floor(p.goal / p.size) + 1}, column ${(p.goal % p.size) + 1}.`;
    const delivery = robotDelivery(run);
    const here = p.parcels.find(
      (x) => x.cell === b.position && !b.collected.includes(x.cell),
    );
    content = (
      <>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="growth-pill">Blue: {delivery.blue}</span>
          <span className="growth-pill">Red: {delivery.red}</span>
          <span className="growth-pill">START is the top-left square</span>
        </div>
        <div
          className="mx-auto grid max-w-lg gap-1 rounded-xl bg-teal-100 p-2"
          style={{ gridTemplateColumns: `repeat(${p.size},minmax(0,1fr))` }}
          role="group"
          aria-label="Robot delivery map"
        >
          {Array.from({ length: p.size * p.size }, (_, n) => {
            const parcel = p.parcels.find(
              (x) => x.cell === n && !b.collected.includes(n),
            );
            const robot = n === b.position;
            const station = p.stations.includes(n);
            const label = `Row ${Math.floor(n / p.size) + 1}, column ${(n % p.size) + 1}: ${robot ? "robot. " : ""}${parcel ? `${parcel.color} parcel` : station ? "station" : n === 0 ? "START" : "empty"}`;
            return (
              <div
                key={n}
                aria-label={label}
                role="img"
                className="lab-robot-cell"
              >
                {robot ? (
                  <Bot size={30} aria-hidden />
                ) : parcel ? (
                  <span className={`lab-parcel lab-parcel-${parcel.color}`}>
                    <Package size={22} />
                    <span className="text-[10px] font-bold">
                      {parcel.color === "blue" ? "B" : "R"}
                    </span>
                  </span>
                ) : station ? (
                  <Flag size={25} aria-hidden />
                ) : n === 0 ? (
                  <span className="text-[10px] font-bold">START</span>
                ) : (
                  <span aria-hidden>·</span>
                )}
              </div>
            );
          })}
        </div>
        <div
          role="group"
          aria-label="Robot movement"
          className="mt-4 flex flex-wrap justify-center gap-2"
        >
          {(
            [
              ["up", ArrowUp],
              ["left", ArrowLeft],
              ["down", ArrowDown],
              ["right", ArrowRight],
            ] as const
          ).map(([direction, Icon]) => (
            <button
              key={direction}
              disabled={!playing}
              aria-label={`Move ${direction}`}
              className="growth-secondary"
              onClick={() => alter((r) => moveRobot(r, direction))}
            >
              <Icon />
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            disabled={!playing || !here}
            className="growth-primary disabled:opacity-40"
            onClick={() => {
              if (here)
                patch({ collected: [...b.collected, here.cell], feedback: "" });
            }}
          >
            Pick up parcel
          </button>
          <button
            disabled={!playing || !b.collected.length}
            className="growth-secondary disabled:opacity-40"
            onClick={() =>
              patch({
                collected: b.collected.slice(0, -1),
                feedback: "The last parcel is back at its original square.",
              })
            }
          >
            Return last parcel
          </button>
          {playing && p.stations.includes(b.position) && !delivery.ok && <p role="status">{delivery.message}</p>}
        </div>
      </>
    );
  }
  return (
    <main className="growth-page max-w-4xl">
      <GameBar
        title={LAB_TITLES[id]}
        round={run.round}
        rounds={LAB_ROUNDS}
        level={level}
        color="#136f78"
        onExit={onExit}
      />
      <section className="growth-feature mt-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex-1">
            <p className="growth-eyebrow">
              Round {run.round + 1} of {LAB_ROUNDS} · Take your time
            </p>
            <h1
              ref={promptRef}
              className="font-kid text-2xl font-semibold text-teal-950"
            >
              {prompt}
            </h1>
          </div>
          <SpeakButton text={prompt} label="Hear the puzzle" />
        </div>
        {content}
        <div aria-live="polite" className="mt-5">
          {b.feedback && (
            <p
              className={`rounded-xl p-4 text-slate-700 ${b.status === "solved" ? "bg-teal-50" : "bg-amber-50"}`}
            >
              {b.feedback}
            </p>
          )}
        </div>
        {playing ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="growth-secondary" onClick={() => hint(clue)}>
              <Lightbulb size={18} className="mr-2" />
              Give me a hint
            </button>
            <button
              className="growth-text-button"
              onClick={() => finish(false, `Let’s learn this one. ${solution}`)}
            >
              Show solution and skip
            </button>
          </div>
        ) : (
          <button
            className="growth-primary mt-5"
            onClick={() => {
              guard.current = false;
              alter((r) => nextBrainRound(id, r));
            }}
          >
            {run.round === LAB_ROUNDS - 1
              ? "See my puzzle summary"
              : "Next puzzle →"}
          </button>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Progress saves on this device. Hints and another try are welcome.
        </p>
      </section>
    </main>
  );
}
