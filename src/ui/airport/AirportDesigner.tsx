import React, { useEffect, useState } from "react";
import {
  Plane,
  Route,
  Building2,
  Flag,
  Eraser,
  Undo2,
  Play,
  Lightbulb,
  ArrowLeft,
} from "lucide-react";
import type { AppState } from "../../engine/progress";
import {
  CHALLENGES,
  SIZE,
  EXIT,
  challengeById,
  newDraft,
  emptyAirport,
  changeDesign,
  undoDesign,
  testDesign,
  testLayout,
} from "../../games/airport";
import type {
  AirportDraft,
  Challenge,
  Layout,
  Tool,
} from "../../games/airport";
import { SpeakButton } from "../SpeakButton";
import { soundEngine } from "../../utils/audio";
import { MissionArt } from "../growth/MissionArt";

type Update = (fn: (s: AppState) => AppState) => void;
const TOOLS = [
  {
    id: "taxi" as Tool,
    label: "Taxi path",
    Icon: Route,
    help: "Tap grass to build a path. Planes follow touching tiles, one at a time.",
  },
  {
    id: "runway" as Tool,
    label: "Extend runway",
    Icon: Plane,
    help: "Tap the leftmost column to add joined runway tiles.",
  },
  {
    id: "gate-a" as Tool,
    label: "Gate A",
    Icon: Flag,
    help: "Tap the column just beside the terminal to place or move Gate A.",
  },
  {
    id: "gate-b" as Tool,
    label: "Gate B",
    Icon: Flag,
    help: "Tap the column just beside the terminal to place or move Gate B.",
  },
  {
    id: "erase" as Tool,
    label: "Remove tile",
    Icon: Eraser,
    help: "Tap a path, gate or extra runway tile to remove it. The runway exit stays.",
  },
];
const cellName = (n: number, l: Layout, c: Challenge) =>
  c.rocks.includes(n)
    ? "pond"
    : n % SIZE === 5
      ? "terminal"
      : l.runway.includes(n)
        ? n === EXIT
          ? "runway exit"
          : "runway"
        : l.gates[0] === n
          ? "Gate A"
          : l.gates[1] === n
            ? "Gate B"
            : l.taxi.includes(n)
              ? "taxi path"
              : "grass";

export function AirportHome({
  state,
  onPlay,
  onJournal,
}: {
  state: AppState;
  onPlay: () => void;
  onJournal: () => void;
}) {
  const airport = state.airport ?? emptyAirport();
  const selected = challengeById(airport.selected) ?? CHALLENGES[0];
  return (
    <section
      className="growth-feature grid items-center gap-4 md:grid-cols-[1fr_280px]"
      aria-labelledby="airport-home-heading"
    >
      <div>
        <p className="growth-eyebrow">Create · Test · Think again</p>
        <span className="growth-pill">Play entirely on screen</span>
        <h2
          id="airport-home-heading"
          className="mt-4 font-kid text-4xl font-semibold text-teal-950"
        >
          Airport Designer
        </h2>
        <p className="mt-3 max-w-md text-slate-600">
          You’re in charge. Build a runway, connect your gates, and watch your
          planes try the route.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="growth-primary" onClick={onPlay}>
            <Play size={18} className="mr-2" />
            Design my airport
          </button>
          <button className="growth-secondary" onClick={onJournal}>
            My airport designs
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          {airport.drafts[selected.id] ? "Continue:" : "Start with:"}{" "}
          {selected.title} · No timer. Try your own ideas.
        </p>
      </div>
      <div className="h-44 text-teal-700 md:h-56">
        <MissionArt theme="airport" />
      </div>
    </section>
  );
}

function MapPreview({ layout, c }: { layout: Layout; c: Challenge }) {
  return (
    <svg
      viewBox="0 0 600 600"
      role="img"
      aria-label={`Saved airport design for ${c.title}`}
      className="w-full rounded-xl bg-emerald-50"
    >
      {Array.from({ length: 36 }, (_, n) => (
        <g key={n}>
          <rect
            x={(n % 6) * 100 + 3}
            y={Math.floor(n / 6) * 100 + 3}
            width="94"
            height="94"
            rx="10"
            fill={
              c.rocks.includes(n)
                ? "#9bd4de"
                : n % 6 === 5
                  ? "#e2caa5"
                  : layout.runway.includes(n)
                    ? "#475569"
                    : layout.gates.includes(n)
                      ? "#f6c56b"
                      : layout.taxi.includes(n)
                        ? "#adc1bc"
                        : "#dcebdc"
            }
          />
          {layout.gates.includes(n) && (
            <text
              x={(n % 6) * 100 + 50}
              y={Math.floor(n / 6) * 100 + 62}
              textAnchor="middle"
              fontSize="35"
              fill="#243e3b"
            >
              {layout.gates[0] === n ? "A" : "B"}
            </text>
          )}
          {layout.runway.includes(n) && (
            <path
              d={`M${(n % 6) * 100 + 50} ${Math.floor(n / 6) * 100 + 20} v60`}
              stroke="white"
              strokeWidth="5"
              strokeDasharray="12 8"
            />
          )}
        </g>
      ))}
    </svg>
  );
}

export function AirportDesigner({
  state,
  update,
  onBack,
  onJournal,
}: {
  state: AppState;
  update: Update;
  onBack: () => void;
  onJournal: () => void;
}) {
  const airport = state.airport ?? emptyAirport();
  const c = challengeById(airport.selected) ?? CHALLENGES[0];
  const d = airport.drafts[c.id] ?? newDraft();
  const [tool, setTool] = useState<Tool>("taxi");
  const [notice, setNotice] = useState("");
  const result =
    d.lastTest?.revision === d.revision ? testLayout(d.layout, c) : undefined;
  useEffect(() => {
    setTool("taxi");
    setNotice("");
    soundEngine.stopSpeech();
  }, [c.id]);
  useEffect(() => () => soundEngine.stopSpeech(), []);
  const modify = (fn: (draft: AirportDraft) => AirportDraft) =>
    update((s) => {
      const a = s.airport ?? emptyAirport();
      return {
        ...s,
        airport: {
          ...a,
          drafts: { ...a.drafts, [c.id]: fn(a.drafts[c.id] ?? newDraft()) },
        },
      };
    });
  const choose = (id: string) => {
    update((s) => ({
      ...s,
      airport: { ...(s.airport ?? emptyAirport()), selected: id },
    }));
  };
  const place = (n: number) => {
    if (c.rocks.includes(n)) {
      setNotice("The pond stays here. Try a path around it.");
      return;
    }
    const next = changeDesign(d, c, tool, n);
    if (next === d) {
      setNotice(
        n % 6 === 5
          ? "That is the terminal. Place gates in the column just to its left."
          : n === EXIT
            ? "This is the fixed runway exit. Start your taxi path on the grass beside its arrow."
            : TOOLS.find((t) => t.id === tool)!.help,
      );
      return;
    }
    setNotice("Design updated. Test your idea when you are ready.");
    modify((draft) => changeDesign(draft, c, tool, n));
  };
  const latest = CHALLENGES.indexOf(c);
  const currentTool = TOOLS.find((t) => t.id === tool)!;
  return (
    <main className="growth-page airport-page">
      <header className="mb-5 flex items-start gap-3">
        <button
          className="growth-back"
          aria-label="Back to home"
          onClick={onBack}
        >
          <ArrowLeft />
        </button>
        <div className="flex-1">
          <p className="growth-eyebrow">The design lab</p>
          <h1 className="font-kid text-3xl font-semibold text-teal-950">
            Airport Designer
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Build it. Send a plane. Make it better.
          </p>
        </div>
        <button className="growth-text-button" onClick={onJournal}>
          My designs
        </button>
      </header>
      <nav
        aria-label="Airport challenges"
        className="mb-5 flex gap-2 overflow-x-auto pb-2"
      >
        {CHALLENGES.map((item, i) => (
          <button
            key={item.id}
            className={`${item.id === c.id ? "growth-primary" : "growth-secondary"} shrink-0 whitespace-nowrap`}
            aria-current={item.id === c.id ? "step" : undefined}
            onClick={() => choose(item.id)}
          >
            <span className="mr-2">{i + 1}</span>
            {item.title}
            {airport.drafts[item.id]?.firstSolvedAt ? " ✓" : ""}
          </button>
        ))}
      </nav>
      <section className="mb-5 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-teal-100">
        <div className="flex-1">
          <h2 className="font-kid text-2xl font-semibold text-teal-950">
            {c.title}
          </h2>
          <p className="mt-1 text-slate-700">{c.goal}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="growth-pill">
              {c.runwayLength} joined runway tiles
            </span>
            <span className="growth-pill">
              {c.gates} gate{c.gates === 1 ? "" : "s"}
            </span>
            <span className="growth-pill">
              {d.layout.taxi.length} / {c.taxiLimit} taxi tiles
            </span>
          </div>
        </div>
        <SpeakButton
          text={`${c.title}. ${c.goal}. Choose a tool, then tap a square. The runway is on the left, the terminal on the right. Start your taxi path beside the runway exit arrow. Tap Test flights when ready.`}
          label="Hear the airport challenge"
        />
      </section>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,600px)_minmax(260px,1fr)]">
        <section aria-label="Build your airport" className="min-w-0">
          <div
            role="group"
            aria-label="Building tools"
            className="mb-3 flex flex-wrap gap-2"
          >
            {TOOLS.filter((t) => c.gates === 2 || t.id !== "gate-b").map(
              ({ id, label, Icon }) => (
                <button
                  key={id}
                  aria-pressed={tool === id}
                  onClick={() => {
                    setTool(id);
                    setNotice("");
                    soundEngine.speak(TOOLS.find((t) => t.id === id)!.help);
                  }}
                  className={`airport-tool ${tool === id ? "airport-tool-selected" : ""}`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ),
            )}
          </div>
          <p id="airport-help" className="mb-3 min-h-10 text-sm text-slate-600">
            {currentTool.help}{" "}
            <span className="font-semibold">
              Choose a tool, then tap a square.
            </span>
          </p>
          <div className="mb-2 flex justify-between px-1 text-xs font-bold uppercase tracking-wider text-teal-800">
            <span>Runway ↓</span>
            <span>Build here</span>
            <span>Terminal ↓</span>
          </div>
          <div className={`airport-board-shell airport-using-${tool}`}>
            <div
              className="airport-board"
              role="group"
              aria-label="Airport building grid"
              aria-describedby="airport-help"
            >
              {Array.from({ length: 36 }, (_, n) => {
                const name = cellName(n, d.layout, c);
                const isGate = d.layout.gates.includes(n);
                const gateLabel = d.layout.gates[0] === n ? "A" : "B";
                return (
                  <button
                    key={n}
                    data-cell={n}
                    aria-label={`Row ${Math.floor(n / 6) + 1}, column ${(n % 6) + 1}: ${name}`}
                    aria-disabled={n % 6 === 5 || c.rocks.includes(n)}
                    className={`airport-cell airport-cell-${name === "pond" ? "pond" : name === "terminal" ? "terminal" : d.layout.runway.includes(n) ? "runway" : isGate ? "gate" : d.layout.taxi.includes(n) ? "taxi" : "grass"} ${n % 6 === 0 ? "airport-runway-zone" : ""} ${n % 6 === 4 ? "airport-gate-zone" : ""}`}
                    onClick={() => place(n)}
                    onKeyDown={(e) => {
                      const offset = {
                        ArrowLeft: -1,
                        ArrowRight: 1,
                        ArrowUp: -6,
                        ArrowDown: 6,
                      }[e.key];
                      if (offset === undefined) return;
                      const next = n + offset;
                      if (
                        next >= 0 &&
                        next < 36 &&
                        (Math.abs(offset) !== 1 ||
                          Math.floor(next / 6) === Math.floor(n / 6))
                      ) {
                        e.preventDefault();
                        e.currentTarget.parentElement
                          ?.querySelector<HTMLButtonElement>(
                            `[data-cell="${next}"]`,
                          )
                          ?.focus();
                      }
                    }}
                  >
                    {name === "terminal" ? (
                      <Building2 aria-hidden size={25} />
                    ) : name === "pond" ? (
                      <span aria-hidden>≈</span>
                    ) : isGate ? (
                      <span
                        aria-hidden
                        className={gateLabel === "B" ? "airport-gate-b" : ""}
                      >
                        {gateLabel}
                      </span>
                    ) : d.layout.runway.includes(n) ? (
                      <>
                        <span className="airport-runway-line" />
                        {n === EXIT && (
                          <span aria-hidden className="airport-exit">
                            →
                          </span>
                        )}
                      </>
                    ) : d.layout.taxi.includes(n) ? (
                      <span aria-hidden className="airport-taxi-dot" />
                    ) : (
                      <span aria-hidden className="airport-grass-dot">
                        ·
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {result?.ok && (
              <svg
                key={`${c.id}-${d.lastTest?.ts}`}
                className="airport-flight-overlay"
                viewBox="0 0 600 600"
                aria-label="Planes following the working routes"
                role="img"
              >
                {result.routes.map((route, i) => {
                  const path = route
                    .map(
                      (n, j) =>
                        `${j ? "L" : "M"}${(n % 6) * 100 + 50},${Math.floor(n / 6) * 100 + 50}`,
                    )
                    .join(" ");
                  return (
                    <g key={i}>
                      <path
                        d={path}
                        fill="none"
                        stroke={i ? "#c67526" : "#136f78"}
                        strokeWidth="8"
                        strokeDasharray="10 8"
                        opacity=".5"
                      />
                      <g
                        className="airport-plane"
                        opacity="0"
                        fill={i ? "#cf6c13" : "#0d6472"}
                      >
                        <set
                          attributeName="opacity"
                          to="1"
                          begin={`${result.routes.slice(0, i).reduce((n, r) => n + Math.max(2, r.length * 0.45), 0)}s`}
                          fill="freeze"
                        />
                        <animateMotion
                          path={path}
                          dur={`${Math.max(2, route.length * 0.45)}s`}
                          begin={`${result.routes.slice(0, i).reduce((n, r) => n + Math.max(2, r.length * 0.45), 0)}s`}
                          fill="freeze"
                          rotate="auto"
                        />
                        <path
                          d="M-23,-6 L-5,-6 L2,-22 L10,-22 L6,-6 L23,-2 L23,3 L6,6 L10,22 L2,22 L-5,6 L-23,6 L-17,0Z"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </g>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="growth-primary flex-1"
              onClick={() => {
                setNotice("");
                modify((draft) => testDesign(draft, c));
              }}
            >
              <Play size={18} className="mr-2" />
              Test flights
            </button>
            <button
              className="growth-secondary disabled:opacity-40"
              disabled={!d.history.length}
              onClick={() => {
                setNotice("Last change undone.");
                modify(undoDesign);
              }}
            >
              <Undo2 size={18} className="mr-2" />
              Undo
            </button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-sm text-teal-800">
            {notice}
          </p>
        </section>
        <aside className="space-y-4">
          <section className="growth-card" aria-live="polite">
            <h3 className="font-kid text-xl font-semibold text-teal-950">
              {result
                ? result.ok
                  ? "Ready for takeoff!"
                  : "Let’s try a change"
                : "Your flight check"}
            </h3>
            {result ? (
              <>
                <ul className="mt-3 space-y-3 text-sm text-slate-700">
                  {result.messages.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <SpeakButton
                  text={result.messages.join(" ")}
                  label="Hear the flight feedback"
                />
                {result.ok && latest < CHALLENGES.length - 1 && (
                  <button
                    className="growth-primary mt-4 w-full"
                    onClick={() => choose(CHALLENGES[latest + 1].id)}
                  >
                    Next challenge →
                  </button>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Place paths and gates, then press Test flights. Your planes will
                show whether the design works.
              </p>
            )}
          </section>
          <section className="growth-card">
            <h3 className="font-kid text-xl font-semibold text-teal-950">
              Need a clue?
            </h3>
            <button
              className="growth-secondary mt-3 w-full"
              onClick={() =>
                modify((draft) => ({
                  ...draft,
                  hints: Math.min(3, draft.hints + 1),
                }))
              }
            >
              <Lightbulb size={18} className="mr-2" />
              {d.hints === 0
                ? "Give me a clue"
                : d.hints < 3
                  ? "Another clue"
                  : "Read my clues"}
            </button>
            {d.hints > 0 && (
              <div className="mt-3 space-y-3">
                {c.hints.slice(0, d.hints).map((h) => (
                  <p className="text-sm text-slate-600" key={h}>
                    {h}
                  </p>
                ))}
                <SpeakButton
                  text={c.hints.slice(0, d.hints).join(" ")}
                  label="Hear the airport clues"
                />
              </div>
            )}
          </section>
          <section className="growth-card">
            <label className="growth-label">
              My design idea
              <textarea
                className="growth-input mt-2 min-h-24"
                maxLength={500}
                value={d.reflection}
                onChange={(e) =>
                  modify((draft) => ({
                    ...draft,
                    reflection: e.target.value.slice(0, 500),
                  }))
                }
                placeholder="I moved the gate because…"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Optional. Your layout and words save automatically on this device.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

export function AirportJournal({
  state,
  onBack,
  onPlay,
  parent = false,
}: {
  state: AppState;
  onBack?: () => void;
  onPlay?: (id: string) => void;
  parent?: boolean;
}) {
  const a = state.airport ?? emptyAirport();
  const designs = CHALLENGES.filter((c) => a.drafts[c.id]);
  return (
    <section className={parent ? "space-y-4" : "growth-page"}>
      {!parent && (
        <header className="mb-6 flex items-center gap-3">
          <button
            className="growth-back"
            aria-label="Back to home"
            onClick={onBack}
          >
            <ArrowLeft />
          </button>
          <h1 className="font-kid text-3xl text-teal-950">
            My airport designs
          </h1>
        </header>
      )}
      {parent && (
        <div className="growth-card">
          <h2 className="text-lg font-bold text-slate-800">
            Screen-time design practice
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Layouts, test flights, revisions and clues opened are recorded here.
            These describe play in this puzzle; they do not measure real-world
            independence, social competence or general ability.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Current designs and game progress are included in Settings → Backup.
          </p>
        </div>
      )}
      {!designs.length ? (
        <div className="growth-feature">
          <h2 className="font-kid text-2xl text-teal-950">
            Your airport is waiting to be designed.
          </h2>
          <p className="mt-3 text-slate-600">
            Build and test an airport to keep your design here.
          </p>
          {onPlay && (
            <button
              className="growth-primary mt-4"
              onClick={() => onPlay(CHALLENGES[0].id)}
            >
              Start designing
            </button>
          )}
        </div>
      ) : (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((c) => {
            const d = a.drafts[c.id];
            const checked = d.lastTest?.revision === d.revision;
            return (
              <article className="growth-card" key={c.id}>
                <h2 className="mb-3 font-kid text-2xl text-teal-950">
                  {c.title}
                </h2>
                <MapPreview layout={d.layout} c={c} />
                <p className="mt-3 text-sm font-semibold text-teal-800">
                  {checked
                    ? d.lastTest?.ok
                      ? "Flight check passed"
                      : "Still experimenting"
                    : "Design ready to test"}
                </p>
                {d.firstSolvedAt && (
                  <p className="mt-1 text-xs text-slate-500">
                    First working design:{" "}
                    {new Date(d.firstSolvedAt).toLocaleDateString()}
                  </p>
                )}
                {parent && (
                  <p className="mt-3 text-sm text-slate-600">
                    {d.tests} test flights · {d.edits} edits (including undo) ·{" "}
                    {d.hints} clues opened
                  </p>
                )}
                {d.reflection && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 [overflow-wrap:anywhere]">
                    “{d.reflection}”
                  </p>
                )}
                {onPlay && (
                  <button
                    className="growth-secondary mt-4 w-full"
                    onClick={() => onPlay(c.id)}
                  >
                    Keep designing →
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
