import React, { useEffect } from "react";
import type { AppState } from "../../engine/progress";
import { recordGame } from "../../engine/progress";
import {
  newBrainRun,
  nextBrainRound,
  finishBrainRound,
  puzzleSeed,
} from "../../games/brain";
import {
  WORKSHOP_TITLES,
  shapePuzzle,
  clockPuzzle,
  patternPuzzle,
  soundPuzzle,
  pipePuzzle,
  traceWater,
  rotateMask,
  PATTERN_TILES,
  DIRECTIONS,
} from "../../games/workshop";
import type { WorkshopId } from "../../games/workshop";
import { GameBar } from "../games/GameFrame";
import { SpeakButton } from "../SpeakButton";
import { soundEngine } from "../../utils/audio";

type Props = {
  id: WorkshopId;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  onExit: () => void;
};
const wordPictures: Record<string, string> = {
  cat: "🐈",
  sat: "🪑",
  map: "🗺️",
  tap: "🚰",
  pig: "🐖",
  dig: "⛏️",
  hen: "🐔",
  pen: "🖊️",
  fan: "🪭",
  man: "👨",
  log: "🪵",
  dog: "🐕",
  cap: "🧢",
  mat: "▧",
  pin: "📍",
  hem: "🧵",
  bag: "👜",
  bat: "🦇",
  bed: "🛏️",
  beg: "🙏",
  cot: "🛏️",
  pan: "🍳",
  big: "🐘",
  pet: "🐈",
  pot: "🍲",
  bug: "🐞",
};
function WordScene({
  from,
  to,
  revealed,
  spoken,
}: {
  from: string;
  to: string;
  revealed: boolean;
  spoken: string;
}) {
  useEffect(() => {
    soundEngine.speak(spoken);
    return () => soundEngine.stopSpeech();
  }, [spoken]);
  return (
    <div
      className="word-scene"
      role="img"
      aria-label={
        revealed
          ? from + " became " + to
          : "Start with " + from + ". Make " + to
      }
    >
      <span className={revealed ? "word-reveal" : "word-cargo"}>
        {wordPictures[revealed ? to : from]}
      </span>
      <span className="scene-arrow">{revealed ? "✓" : "→"}</span>
      <span className="word-goal">{wordPictures[to]}</span>
    </div>
  );
}

function Garden({ flowers }: { flowers: number }) {
  return (
    <svg
      className="pipe-garden"
      viewBox="0 0 400 94"
      role="img"
      aria-label={`${flowers} flowers watered this set`}
    >
      <path fill="#d9f2fc" d="M0 0H400V94H0z" />
      <circle cx="350" cy="22" r="14" fill="#ffd984" />
      <path fill="#afdcbe" d="M0 65Q65 32 140 61T288 55T400 50V94H0z" />
      <path fill="#71b497" d="M0 77Q80 60 160 74T320 68T400 70V94H0z" />
      {[0, 1, 2, 3].map((i) => {
        const grown = i < flowers;
        return (
          <g key={i} transform={`translate(${56 + i * 94} 78)`}>
            <path
              d={grown ? "M0 0 Q-4 -18 0 -35" : "M0 0 Q-3 -6 0 -12"}
              fill="none"
              stroke="#257551"
              strokeWidth="4"
            />
            <path
              d="M0 -7 Q-16 -6 -17 -18 Q-3 -18 0 -7 M0 -12 Q9 -25 17 -21 Q15 -12 0 -12"
              fill="#378d60"
            />
            {grown && (
              <g transform="translate(0 -38)">
                <g className="garden-bloom">
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <ellipse
                      key={angle}
                      rx="6"
                      ry="10"
                      cy="-8"
                      transform={`rotate(${angle})`}
                      fill={["#ffba45", "#f082a4", "#e7a3fc", "#ff8d66"][i]}
                    />
                  ))}
                  <circle r="6" fill="#8c4f28" />
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
function Shape({ code, ghost = false }: { code: number; ghost?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className="h-full w-full">
      <g
        transform={`rotate(${code === 5 ? 0 : (code - 1) * 90} 50 50)`}
        fill={ghost ? "#dce8ee" : "#0f766e"}
        stroke={ghost ? "#8297a4" : "#065f46"}
        strokeWidth="2"
        strokeDasharray={ghost ? "5 4" : undefined}
      >
        {code === 5 ? (
          <rect x="3" y="3" width="94" height="94" />
        ) : code > 0 ? (
          <path d="M3 97 L97 97 L97 3Z" />
        ) : null}
      </g>
    </svg>
  );
}
function Clock({ total }: { total: number }) {
  const point = (angle: number, length: number) => ({
    x: 100 + Math.sin(angle) * length,
    y: 100 - Math.cos(angle) * length,
  });
  const m = point(((total % 60) / 60) * Math.PI * 2, 72),
    h = point((total / 720) * Math.PI * 2, 48);
  return (
    <svg
      role="img"
      aria-label={`Clock showing ${Math.floor(total / 60) || 12}:${String(total % 60).padStart(2, "0")}`}
      viewBox="0 0 200 200"
      className="mx-auto w-full max-w-xs"
    >
      <circle
        cx="100"
        cy="100"
        r="97"
        fill="white"
        stroke="#aac8cb"
        strokeWidth="4"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const p = point(((i + 1) / 12) * Math.PI * 2, 82);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y + 5}
            textAnchor="middle"
            fontSize="14"
            fill="#134e4a"
          >
            {i + 1}
          </text>
        );
      })}
      <line
        x1="100"
        y1="100"
        x2={h.x}
        y2={h.y}
        stroke="#a8551c"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="100"
        x2={m.x}
        y2={m.y}
        stroke="#0369a1"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="100" cy="100" r="5" fill="#134e4a" />
    </svg>
  );
}
export function Workshop({ id, state, update, onExit }: Props) {
  const run = state.brainRuns?.[id];
  useEffect(() => () => soundEngine.stopSpeech(), []);
  useEffect(() => {
    if (id !== "pattern-machine" || !run || run.round >= 4) return;
    const puzzle = patternPuzzle(run.level, puzzleSeed(run));
    const complete = run.board.work?.length === 2 &&
      run.board.work.every((value, index) => value === puzzle.answer[index]);
    if (run.board.status === "playing" && complete) {
      update(state => {
        const current = state.brainRuns?.[id];
        if (!current || current.seed !== run.seed || current.round !== run.round ||
            current.board.status !== "playing") return state;
        const message = "You fixed it! " + puzzle.explanation;
        const next = finishBrainRound(current, true, message);
        return {...recordGame(state, id, next.clean > current.clean ? "win" : "assisted", Date.now(), {
          prompt: puzzle.shown.map(n => PATTERN_TILES[n]).join(" ") + " — fill the next two shapes",
          answer: puzzle.answer.map(n => PATTERN_TILES[n]).join(" "),
          hints: current.board.hints,
          mistakes: current.board.misses ? [current.board.misses + " incorrect shape selections"] : [],
        }), brainRuns: {...state.brainRuns, [id]: next}};
      });
      soundEngine.playCorrectChime();
    }
    if (run.board.status !== "solved" || run.round === 3) return;
    const timer = setTimeout(() => update(state => {
      const current = state.brainRuns?.[id];
      if (!current || current.seed !== run.seed || current.round !== run.round ||
          current.board.status !== "solved") return state;
      return {...state, brainRuns: {...state.brainRuns, [id]: nextBrainRound(id,current)}};
    }), 1400);
    return () => clearTimeout(timer);
  }, [id, run?.seed, run?.round, run?.board.status, run?.board.work]);
  if (!run) return <button onClick={onExit}>Back to games</button>;
  const b = run.board,
    level = run.level,
    seed = puzzleSeed(run),
    playing = b.status === "playing";
  const work = b.work ?? [];
  const patch = (data: Partial<typeof b>) =>
    update((s) => {
      const r = s.brainRuns?.[id];
      return !r || r.board.status !== "playing"
        ? s
        : {
            ...s,
            brainRuns: {
              ...s.brainRuns,
              [id]: { ...r, board: { ...r.board, ...data } },
            },
          };
    });
  const edit = (values: number[]) =>
    patch({ work: values, feedback: "", answer: null });
  let narration = "",
    prompt = "",
    instructions = "",
    clue = "",
    solution = "",
    answer = "",
    content: React.ReactNode = null;
  const finish = (won: boolean, message: string, response?: string) => {
    update((s) => {
      const r = s.brainRuns?.[id];
      if (!r || r.board.status !== "playing") return s;
      const next = finishBrainRound(r, won, message);
      return {
        ...recordGame(
          s,
          id,
          won ? (next.clean > r.clean ? "win" : "assisted") : "loss",
          Date.now(),
          {
            prompt: narration || prompt,
            answer: response || answer || message,
            mistakes: r.board.misses
              ? [`${r.board.misses} unsuccessful check(s)`]
              : [],
            hints: r.board.hints,
          },
        ),
        brainRuns: { ...s.brainRuns, [id]: next },
      };
    });
    soundEngine.speak(message);
  };
  const check = (ok: boolean, message: string) =>
    ok
      ? finish(true, message)
      : patch({ misses: Math.min(1000, b.misses + 1), feedback: message });
  const choice = (label: string, fn: () => void, selected = false) => (
    <button
      key={label}
      disabled={!playing}
      className={selected ? "growth-primary" : "growth-secondary"}
      aria-pressed={selected}
      onClick={fn}
    >
      {label}
    </button>
  );
  if (run.round >= 4)
    return (
      <main className="growth-page workshop-page max-w-3xl">
        <GameBar
          title={WORKSHOP_TITLES[id]}
          round={4}
          rounds={4}
          level={level}
          color="#0f766e"
          onExit={onExit}
        />
        <section className="growth-feature mt-6">
          <h1 className="font-kid text-3xl">Thanks for exploring!</h1>
          <p className="mt-4">
            {run.clean} independent · {run.assisted} with help or another try ·{" "}
            {run.skipped} skipped
          </p>
          <button
            className="growth-primary mt-5"
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
          <button className="growth-secondary mt-3" onClick={onExit}>
            Back to Brain Games
          </button>
        </section>
      </main>
    );
  if (id === "shape-builder") {
    const p = shapePuzzle(level, seed),
      tool = work[16] ?? 1,
      board = Array.from({ length: 16 }, (_, i) => work[i] ?? 0);
    prompt = `Build the ${p.name} with triangles and squares.`;
    instructions =
      "Choose a shape. Turn the triangle if needed. Tap a grid square to place it. Use Eraser to remove a piece. Match the small picture.";
    clue =
      "A square has four equal sides. Turn a triangle until its sloping side matches the picture.";
    solution = `The ${p.name} is made of squares and triangles. Compare each grid square with the model.`;
    answer = board
      .map((n) => (n === 5 ? "square" : n ? `triangle turn ${n - 1}` : "empty"))
      .join(", ");
    content = (
      <>
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="w-28">
            <p className="mb-1 text-center text-sm">Your model</p>
            <div className="grid grid-cols-4">
              {p.cells.map((c, i) => (
                <div className="aspect-square" key={i}>
                  <Shape code={c} />
                </div>
              ))}
            </div>
          </div>
          <p className="max-w-40 text-sm text-slate-600">
            Triangles can point in different directions. Squares stay the same
            when turned.
          </p>
        </div>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {choice(
            "Triangle",
            () => edit([...board, 1]),
            tool >= 1 && tool <= 4,
          )}
          {choice("Square", () => edit([...board, 5]), tool === 5)}
          {choice("Eraser", () => edit([...board, 0]), tool === 0)}
          {choice("Turn triangle ↻", () =>
            edit([...board, tool >= 1 && tool <= 4 ? (tool % 4) + 1 : 1]),
          )}
          <div aria-label="Selected shape" className="h-12 w-12">
            <Shape code={tool} />
          </div>
        </div>
        <div
          role="group"
          aria-label="Shape building grid"
          className="mx-auto grid max-w-sm grid-cols-4 gap-1"
        >
          {board.map((c, i) => (
            <button
              key={i}
              disabled={!playing}
              aria-label={`Row ${Math.floor(i / 4) + 1}, column ${(i % 4) + 1}: ${c === 0 ? "empty" : c === 5 ? "square" : `triangle turn ${c - 1}`}`}
              className="relative aspect-square rounded-lg border border-slate-300 bg-white"
              onClick={() => {
                const next = [...board];
                next[i] = tool;
                edit([...next, tool]);
              }}
            >
              {p.guide && (level === 1 || p.cells[i] === 5) && (
                <span className="absolute inset-1">
                  <Shape code={p.cells[i]} ghost />
                </span>
              )}
              <span className="absolute inset-1">
                <Shape code={c} />
              </span>
            </button>
          ))}
        </div>
        <button
          disabled={!playing}
          className="growth-primary mt-5 w-full"
          onClick={() =>
            check(
              board.every((c, i) => c === p.cells[i]),
              board.every((c, i) => c === p.cells[i])
                ? `You built the ${p.name}! You matched the shapes and their directions.`
                : "Compare with the model. Check for empty squares, extra pieces, and triangles that need a turn.",
            )
          }
        >
          Check my picture
        </button>
      </>
    );
  } else if (id === "clock-quest") {
    const p = clockPuzzle(level, seed),
      total = work[0] ?? 0;
    prompt = `Set the clock to ${p.label} for the rocket launch.`;
    instructions =
      "The short brown hand shows the hour. The long blue hand shows minutes. Choose an hour, then minutes. The short hand moves between numbers as minutes pass.";
    clue = `Put the long hand on ${p.minute === 0 ? "12" : p.minute === 15 ? "3" : p.minute === 30 ? "6" : "9"}. The short hand ${p.minute ? `moves past ${p.hour}` : `points to ${p.hour}`}.`;
    solution = `${p.label}: ${p.minute} minutes past ${p.hour}.`;
    answer = `Set clock to ${Math.floor(total / 60) || 12}:${String(total % 60).padStart(2, "0")}`;
    content = (
      <>
        <Clock total={total} />
        <p className="mt-3 text-center font-bold">
          Your clock: {Math.floor(total / 60) || 12}:
          {String(total % 60).padStart(2, "0")}
        </p>
        <fieldset className="mt-4">
          <legend className="mb-2 font-bold">Hour</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) =>
              choice(
                `Hour ${i + 1}`,
                () => edit([((i + 1) % 12) * 60 + (total % 60)]),
                Math.floor(total / 60) === (i + 1) % 12,
              ),
            )}
          </div>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="mb-2 font-bold">Minutes</legend>
          <div className="flex flex-wrap gap-2">
            {(level === 1 ? [0] : level === 2 ? [0, 30] : [0, 15, 30, 45]).map(
              (n) =>
                choice(
                  `${n} minutes`,
                  () => edit([Math.floor(total / 60) * 60 + n]),
                  total % 60 === n,
                ),
            )}
          </div>
        </fieldset>
        <button
          disabled={!playing}
          className="growth-primary mt-5 w-full"
          onClick={() =>
            check(
              total === p.total,
              total === p.total
                ? `Ready for launch! ${solution}`
                : "Check both hands. The short hand shows the hour; the long hand shows minutes.",
            )
          }
        >
          Launch rocket
        </button>
      </>
    );
  } else if (id === "pattern-machine") {
    const p = patternPuzzle(level, seed);
    const filled: number[] = [];
    for (let i = 0; i < 2 && work[i] === p.answer[i]; i++) filled.push(work[i]);
    prompt = "What comes next?";
    instructions =
      "Tap the next shape. Then add one more.";
    clue = p.explanation;
    solution = `${p.explanation} The next two shapes are ${p.answer.map((n) => PATTERN_TILES[n]).join(" ")}.`;
    answer = work.map((n) => PATTERN_TILES[n]).join(" ");
    const tile = (n: number, i: number) => (
      <span
        key={i}
        className={`pattern-tile pattern-${n}`}
        aria-label={["circle", "triangle", "square", "star"][n]}
      >
        {PATTERN_TILES[n]}
      </span>
    );
    content = (
      <>
        <div
          aria-label="Pattern sequence"
          className="flex flex-wrap justify-center gap-2 rounded-2xl bg-slate-100 p-4"
        >
          {p.shown.map(tile)}
          {[0, 1].map((i) => (
            <span
              key={`a${i}`}
              className={`pattern-tile border-2 border-dashed border-teal-600 ${i === filled.length && playing ? "pattern-active-slot" : ""}`}
            >
              {filled[i] === undefined ? "?" : PATTERN_TILES[filled[i]]}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {PATTERN_TILES.map((symbol, value) =>
            choice(["Circle", "Triangle", "Square", "Star"][value] + " " + symbol, () => {
              if (value === p.answer[filled.length]) edit([...filled, value]);
              else check(false, "Try another shape in the glowing space.");
            }),
          )}
        </div>
      </>
    );
  } else if (id === "sound-switch") {
    const p = soundPuzzle(level, seed);
    prompt = "Switch one letter to make the new picture.";
    instructions = "Tap a letter to put it in the glowing space.";
    const spoken = `Start with ${p.from}. Make ${p.to}. Change the ${p.position} sound.`;
    narration = spoken;
    clue = `Listen: ${p.from}, ${p.to}. Change the ${p.position} sound to the sound written with ${p.answer}.`;
    solution = `${p.from} becomes ${p.to}. Only the ${p.position} sound changes.`;
    const built = p.from.split("");
    if (work.length) built[p.at] = p.choices[work[0]];
    answer = `Built ${built.join("")}`;
    content = (
      <>
        <WordScene
          from={p.from}
          to={p.to}
          revealed={!playing}
          spoken={spoken}
        />
        <details className="mt-2 text-center text-sm">
          <summary>Read the mission</summary>
          {spoken}
        </details>
        <div aria-label="Word tiles" className="my-4 flex justify-center gap-3">
          {built.map((letter, i) => (
            <span
              key={i}
              className={`lab-number ${i === p.at ? "sound-slot" : ""}`}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {p.choices.map((letter, i) =>
            choice(
              letter,
              () => {
                const changed = p.from.split("");
                changed[p.at] = letter;
                edit([i]);
                if (letter === p.answer)
                  finish(true, solution, `Changed ${p.from} to ${p.to}`);
                else {
                  const message = `That makes ${changed.join("")}. Try another letter to make ${p.to}.`;
                  check(false, message);
                  soundEngine.speak(message);
                }
              },
              work[0] === i,
            ),
          )}
        </div>
      </>
    );
  } else {
    const p = pipePuzzle(level, seed),
      intro = level === 1 && run.round === 0,
      starter = intro
        ? p.solved.map((mask, i) =>
            i === p.path[1] ? rotateMask(mask, 3) : mask,
          )
        : p.initial,
      masks = starter.map((m, i) => work[i] ?? m),
      flow = traceWater(p.size, masks);
    prompt = "Grow a garden. Turn a pipe.";
    instructions =
      intro && !work.length
        ? "Tap the glowing pipe. Watch where the water goes."
        : "Follow the blue water. Tap a pipe to turn it.";
    clue =
      "Start at the tap in the top-left. Follow one connected pipe at a time. Turn the next pipe so its opening meets yours.";
    solution =
      "Follow the highlighted example route from the tap to the flower. Every touching pipe opening must match.";
    answer = `Pipe masks: ${masks.join(", ")}. Water reached ${flow.reached.length} squares.`;
    const shown = b.status === "skipped" ? p.solved : masks,
      wet = b.status === "skipped" ? p.path : flow.reached;
    content = (
      <>
        <Garden flowers={run.clean + run.assisted} />
        <div
          role="group"
          aria-label="Water pipe grid"
          className="mx-auto grid max-w-md gap-1"
          style={{ gridTemplateColumns: `repeat(${p.size},minmax(0,1fr))` }}
        >
          {shown.map((mask, i) => {
            const fixed = i === 0 || i === shown.length - 1;
            const active = wet.includes(i);
            return (
              <button
                key={i}
                disabled={!playing || fixed}
                className={`pipe-cell ${active ? "pipe-wet" : ""} ${intro && !work.length && playing && p.path[1] === i ? "pipe-guide" : ""}`}
                aria-label={`Pipe row ${Math.floor(i / p.size) + 1}, column ${(i % p.size) + 1}, openings ${DIRECTIONS.filter((_, d) => mask & (1 << d)).join(" and ")}${fixed ? ", fixed" : ""}`}
                onClick={() => {
                  const next = [...masks];
                  next[i] = rotateMask(mask, 1);
                  if (intro && !work.length)
                    patch({ hints: Math.max(1, b.hints) });
                  edit(next);
                  const result = traceWater(p.size, next);
                  if (result.ok)
                    finish(
                      true,
                      "The flower has water! Your garden grew.",
                      `Connected ${result.reached.length} pipe squares from tap to flower.`,
                    );
                }}
              >
                <svg aria-hidden viewBox="0 0 100 100">
                  <g
                    fill="none"
                    stroke={active ? "#0284c7" : "#94a3b8"}
                    strokeWidth="15"
                    strokeLinecap="round"
                  >
                    {[0, 1, 2, 3]
                      .filter((d) => mask & (1 << d))
                      .map((d) => (
                        <path
                          key={d}
                          d={`M50 50 L${[50, 100, 50, 0][d]} ${[0, 50, 100, 50][d]}`}
                        />
                      ))}
                  </g>
                  <circle
                    cx="50"
                    cy="50"
                    r={fixed ? 18 : 7}
                    fill={active ? "#0284c7" : "#64748b"}
                  />
                  {fixed && (
                    <text x="50" y="57" textAnchor="middle" fontSize="23">
                      {i === 0 ? "💧" : b.status === "solved" ? "🌻" : "🌱"}
                    </text>
                  )}
                </svg>
              </button>
            );
          })}
        </div>
        {playing && flow.ok && (
          <button
            className="growth-primary mt-4"
            onClick={() => finish(true, "Water reached the flower!", answer)}
          >
            Water the flower
          </button>
        )}
      </>
    );
  }
  return (
    <main className="growth-page workshop-page max-w-3xl">
      <GameBar
        title={WORKSHOP_TITLES[id]}
        round={run.round}
        rounds={4}
        level={level}
        color="#0f766e"
        onExit={onExit}
      />
      <section className="growth-feature mt-6">
        <p className="growth-eyebrow">
          Round {run.round + 1} of 4 · Take your time
        </p>
        <div className="mt-2 flex items-start gap-2">
          <h1 className="font-kid flex-1 text-2xl text-teal-950">{prompt}</h1>
          <SpeakButton text={narration || prompt} label="Hear the puzzle" />
        </div>
        <p className="my-4 text-slate-600">{instructions}</p>
        {content}
        {(b.feedback || (id !== "sound-switch" && id !== "water-pipes")) && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 rounded-xl bg-teal-50 p-3"
          >
            {b.feedback || "Explore, then check when you are ready."}
          </div>
        )}
        {playing ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="growth-secondary"
              onClick={() => {
                patch({ hints: Math.min(1000, b.hints + 1), feedback: clue });
                soundEngine.speak(clue);
              }}
            >
              Give me a hint
            </button>
            <button
              className="growth-text-button"
              onClick={() => {
                if (id === "shape-builder")
                  patch({ work: shapePuzzle(level, seed).cells });
                if (id === "clock-quest")
                  patch({ work: [clockPuzzle(level, seed).total] });
                if (id === "pattern-machine")
                  patch({ work: patternPuzzle(level, seed).answer });
                if (id === "sound-switch") {
                  const p = soundPuzzle(level, seed);
                  patch({ work: [p.choices.indexOf(p.answer)] });
                }
                finish(false, `Let's learn this one. ${solution}`);
              }}
            >
              Show solution and skip
            </button>
          </div>
        ) : id === "pattern-machine" && b.status === "solved" && run.round < 3 ? (
          <p className="mt-4 text-center text-teal-700">Next pattern…</p>
        ) : (
          <button
            className="growth-primary mt-5"
            onClick={() =>
              update((s) => {
                const r = s.brainRuns?.[id];
                return !r
                  ? s
                  : {
                      ...s,
                      brainRuns: {
                        ...s.brainRuns,
                        [id]: nextBrainRound(id, r),
                      },
                    };
              })
            }
          >
            {run.round === 3 ? "See my puzzle summary" : "Next puzzle →"}
          </button>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Progress saves on this device. Hints and another try are welcome.
        </p>
      </section>
    </main>
  );
}
