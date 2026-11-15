import { useEffect, useMemo, useState } from "react";
import "../../style.css";
import "./tinker.css";
import { ProgressStore, browserStorage } from "../../core/progress";
import { gameFeedback, gameMute, gameSpeak } from "../../core/feedback";
import { DragPiece, dropTarget } from "../../components/DragPiece";
import { TutorialHandOverlay } from "../../components/TutorialHandOverlay";
import { DotsBoard } from "./DotsBoard";
import { DotsAndBoxes, computerMove, type DotsLevel } from "./dots";
import { ShapeBuilder, SHAPE_LEVELS } from "./shapes";
import { WaterRescue, WATER_LEVELS } from "./water";
import {
  createGame,
  loadRun,
  saveRun,
  type TinkerGame,
  type TinkerId,
} from "./storage";
import type { Hint } from "../../core/types";

const titles: Record<TinkerId, string> = {
  "dots-boxes": "Dots and Boxes",
  "water-pipes": "Water Rescue",
  "shape-builder": "Shape Builder",
};
const instructions: Record<TinkerId, string> = {
  "dots-boxes":
    "Draw a line between nearby dots, or tap the space between them. Close a box to keep it and take another turn!",
  "water-pipes":
    "Tap a pipe to turn it. Bring water from the tap to your thirsty friend!",
  "shape-builder":
    "Make the little picture. Drag a shape to the board, or tap a shape and a square. Tap Turn to turn your triangle.",
};
export function ShapeIcon({
  code,
  ghost = false,
}: {
  code: number;
  ghost?: boolean;
}) {
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true" className="shape-icon">
      {code === 5 ? (
        <rect
          x="3"
          y="3"
          width="44"
          height="44"
          rx="3"
          fill={ghost ? "none" : "#3b82f6"}
          stroke="#2563eb"
          strokeDasharray={ghost ? "4 3" : undefined}
        />
      ) : code > 0 ? (
        <path
          d="M3 47 L47 47 L47 3 Z"
          transform={`rotate(${(code - 1) * 90} 25 25)`}
          fill={ghost ? "none" : "#f59e0b"}
          stroke="#b45309"
          strokeDasharray={ghost ? "4 3" : undefined}
        />
      ) : null}
    </svg>
  );
}
function Pipe({
  mask,
  wet = false,
  ghost = false,
}: {
  mask: number;
  wet?: boolean;
  ghost?: boolean;
}) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <g
        stroke={ghost ? "#8b5cf6" : wet ? "#0284c7" : "#94a3b8"}
        strokeWidth={ghost ? 3 : 13}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={ghost ? "4 3" : undefined}
      >
        {[0, 1, 2, 3]
          .filter((d) => mask & (1 << d))
          .map((d) => (
            <path
              key={d}
              d={["M30 30V0", "M30 30H60", "M30 30V60", "M30 30H0"][d]}
            />
          ))}
      </g>
      <circle cx="30" cy="30" r="6" fill={wet ? "#38bdf8" : "#e2e8f0"} />
    </svg>
  );
}

export function TinkerApp({
  id,
  onExit,
  muted,
  onMutedChange,
}: {
  id: TinkerId;
  onExit(): void;
  muted: boolean;
  onMutedChange(m: boolean): void;
}) {
  const store = useMemo(() => new ProgressStore(browserStorage()), []);
  const [saved, setSaved] = useState(() => loadRun(id));
  const [game, setGame] = useState<TinkerGame | null>(null),
    [, render] = useState(0);
  const [warning, setWarning] = useState(saved.warning),
    [hint, setHint] = useState<Hint | null>(null),
    [tool, setTool] = useState(5);
  const [size, setSize] = useState<2 | 3 | 4 | 5>(2),
    [mode, setMode] = useState<DotsLevel["mode"]>("computer"),
    [difficulty, setDifficulty] = useState<DotsLevel["difficulty"]>("gentle");
  const refresh = () => render((n) => n + 1);
  const persist = (g: TinkerGame) => {
    if (!saveRun(id, g))
      setWarning(
        "This game could not be saved on this device. You can keep playing.",
      );
  };
  useEffect(() => {
    if (!game) return;
    const off = game.subscribe(() => {
      persist(game);
      refresh();
    });
    const done = game.onComplete((result) => {
      if (!(game instanceof DotsAndBoxes)) {
        const descriptor = id === "water-pipes" ? WATER_LEVELS : SHAPE_LEVELS;
        if (!store.save(id, descriptor[game.index].id, game.hints, result))
          setWarning("Progress could not be saved on this device.");
      }
    });
    return () => {
      off();
      done();
    };
  }, [game, id, store]);
  const dots = game instanceof DotsAndBoxes ? game.getState() : null;
  useEffect(() => {
    if (
      !(game instanceof DotsAndBoxes) ||
      !dots ||
      dots.complete ||
      dots.level.mode !== "computer" ||
      dots.turn !== 2
    )
      return;
    const timer = window.setTimeout(() => {
      const before = game.getState();
      const line = computerMove(before);
      if (line) {
        game.play(line);
        gameFeedback(game.getState().complete ? "complete" : "tap");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [
    game,
    dots?.turn,
    dots?.complete,
    dots ? Object.keys(dots.edges).length : 0,
  ]);
  const start = (index = 0) => {
    const next = createGame(id);
    next.loadLevel(
      id === "dots-boxes" ? { size, mode, difficulty } : { index },
    );
    persist(next);
    setGame(next);
    setHint(null);
    setTool(5);
    gameFeedback();
    gameSpeak(instructions[id]);
  };
  const leave = () => {
    setSaved(loadRun(id));
    setGame(null);
    setHint(null);
  };
  const action = (fn: () => void) => {
    if (!game) return;
    const was = game.getState().complete;
    fn();
    const now = game.getState().complete;
    gameFeedback(now && !was ? "complete" : "tap");
    setHint(null);
  };
  const ask = (tier: 1 | 2) => {
    if (!game) return;
    setHint(game.getHint(tier));
    persist(game);
    gameFeedback();
    refresh();
  };
  const sound = (
    <button
      aria-label={muted ? "Turn game sound on" : "Mute game sound"}
      aria-pressed={muted}
      onClick={() => {
        gameMute(!muted);
        onMutedChange(!muted);
        if (muted) gameFeedback();
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
  const header = (
    <header className="top">
      <button onClick={game ? leave : onExit}>
        ← {game ? "Choose" : "Brain Games"}
      </button>
      <h1>{titles[id]}</h1>
      {sound}
    </header>
  );
  if (!game)
    return (
      <main className="shell">
        {header}
        <section className="play-card">
          <p>{instructions[id]}</p>
          <button onClick={() => gameSpeak(instructions[id])}>
            🔊 Hear how to play
          </button>
          {saved.game && (
            <button
              className="continue-game"
              onClick={() => {
                setGame(saved.game);
                gameFeedback();
              }}
            >
              ▶ Continue saved game
            </button>
          )}
          {id === "dots-boxes" ? (
            <>
              <div className="actions" role="group" aria-label="Opponent">
                <button
                  aria-pressed={mode === "computer"}
                  onClick={() => setMode("computer")}
                >
                  🧒 vs 🤖 Computer
                </button>
                <button
                  aria-pressed={mode === "friend"}
                  onClick={() => setMode("friend")}
                >
                  🧒 vs 🧒 Two players
                </button>
              </div>
              <div className="actions" role="group" aria-label="Board size">
                {([2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    aria-pressed={size === n}
                    onClick={() => setSize(n)}
                  >
                    {n} × {n} boxes
                  </button>
                ))}
              </div>
              {mode === "computer" && (
                <div
                  className="actions"
                  role="group"
                  aria-label="Computer difficulty"
                >
                  <button
                    aria-pressed={difficulty === "gentle"}
                    onClick={() => setDifficulty("gentle")}
                  >
                    🌱 Gentle
                  </button>
                  <button
                    aria-pressed={difficulty === "thinking"}
                    onClick={() => setDifficulty("thinking")}
                  >
                    💡 Thinking
                  </button>
                </div>
              )}
              <button className="big-play" onClick={() => start()}>
                ▶ Play
              </button>
            </>
          ) : (
            (["Starter", "Explorer", "Master"] as const).map((tier) => (
              <section className="tier" key={tier}>
                <h2>{tier}</h2>
                <div className="levels">
                  {(id === "water-pipes" ? WATER_LEVELS : SHAPE_LEVELS).map(
                    (l, index) =>
                      l.tier === tier ? (
                        <button
                          key={l.id}
                          className="level"
                          onClick={() => start(index)}
                        >
                          <span className="level-num">{index + 1}</span>
                          <strong>{l.title}</strong>
                          <span>
                            {"★".repeat(store.get(id, l.id).stars) || "▶ Play"}
                          </span>
                        </button>
                      ) : null,
                  )}
                </div>
              </section>
            ))
          )}
          {(warning || store.warning) && (
            <p role="status">{warning || store.warning}</p>
          )}
        </section>
      </main>
    );
  const complete = game.getState().complete;
  const controls = (
    <div className="actions">
      <button onClick={() => action(() => game.reset())}>↻ Reset</button>
      <button
        disabled={!game.moves.length}
        onClick={() =>
          action(() =>
            game instanceof DotsAndBoxes ? game.undoTurn() : game.undo(),
          )
        }
      >
        ↶ Undo
      </button>
      <button
        disabled={
          complete ||
          (!!dots && dots.level.mode === "computer" && dots.turn === 2)
        }
        onClick={() => ask(1)}
      >
        💡 Hint
      </button>
      {!(game instanceof DotsAndBoxes) && (
        <button disabled={complete} onClick={() => ask(2)}>
          👻 Show me
        </button>
      )}
      <button onClick={() => gameSpeak(instructions[id])}>🔊 Hear help</button>
    </div>
  );
  return (
    <main className="shell">
      {header}
      <section className="play-card">
        {game instanceof DotsAndBoxes && dots && (
          <>
            <div className="scoreboard" aria-live="polite">
              <span className={dots.turn === 1 ? "active-player" : ""}>
                🔵 {dots.level.mode === "computer" ? "You" : "Player 1"}:{" "}
                {dots.score[0]}
              </span>
              <span className={dots.turn === 2 ? "active-player" : ""}>
                🟠 {dots.level.mode === "computer" ? "Computer" : "Player 2"}:{" "}
                {dots.score[1]}
              </span>
            </div>
            <p className="board-note" role="status">
              {dots.complete
                ? "All the boxes are filled!"
                : dots.level.mode === "computer" && dots.turn === 2
                  ? "🤖 Computer is choosing…"
                  : `${dots.turn === 1 ? "🔵" : "🟠"} ${dots.level.mode === "computer" ? "Your" : `Player ${dots.turn}’s`} turn. Close a box for another turn!`}
            </p>
            <DotsBoard
              key={dots.level.size}
              state={dots}
              hint={hint?.pieceId}
              onLine={(id) =>
                action(() => {
                  game.play(id);
                })
              }
            />
            {dots.complete && (
              <div className="success" role="status">
                {dots.score[0] === dots.score[1]
                  ? "You shared the boxes equally!"
                  : `${dots.score[0] > dots.score[1] ? "🔵" : "🟠"} ${dots.level.mode === "computer" ? (dots.score[0] > dots.score[1] ? "You collected" : "The computer collected") : `Player ${dots.score[0] > dots.score[1] ? 1 : 2} collected`} more boxes.`}{" "}
                Great building!{" "}
                <button onClick={() => action(() => game.reset())}>
                  Play again
                </button>
              </div>
            )}
          </>
        )}
        {game instanceof WaterRescue && (
          <WaterBoard
            game={game}
            hint={hint}
            onRotate={(cell) =>
              action(() => {
                game.rotate(cell);
              })
            }
          />
        )}
        {game instanceof ShapeBuilder && (
          <ShapeBoard
            game={game}
            hint={hint}
            tool={tool}
            setTool={(n) => {
              setTool(n);
              gameFeedback();
            }}
            onPlace={(cell, code) =>
              action(() => {
                game.place(cell, code);
              })
            }
          />
        )}
        {controls}
        {complete && !(game instanceof DotsAndBoxes) && (
          <div className="success" role="status">
            {id === "water-pipes"
              ? "💧 Your friend has water!"
              : "✨ You made the picture!"}{" "}
            {game.index < (id === "water-pipes" ? 23 : 17) ? (
              <button onClick={() => start(game.index + 1)}>
                Next puzzle →
              </button>
            ) : (
              <button onClick={leave}>Choose a puzzle</button>
            )}
          </div>
        )}
        {warning && <p role="status">{warning}</p>}
      </section>
    </main>
  );
}
function WaterBoard({
  game,
  hint,
  onRotate,
}: {
  game: WaterRescue;
  hint: Hint | null;
  onRotate(cell: number): void;
}) {
  const s = game.getState(),
    size = s.puzzle.size;
  return (
    <>
      <div className="water-story">
        <span>🚰</span>
        <span>→ 💧 →</span>
        <span>
          {["🌻", "🐰", "🐢", "🦆"][s.index % 4]} {s.complete ? "💙" : "💧"}
        </span>
      </div>
      <p className="board-note">Tap a pipe. Watch the water move!</p>
      <div
        className="tile-board water-board"
        style={{ gridTemplateColumns: `repeat(${size},1fr)` }}
        aria-label="Water Rescue board"
      >
        {s.masks.map((mask, i) => (
          <button
            key={i}
            aria-label={`Pipe row ${Math.floor(i / size) + 1} column ${(i % size) + 1}${i === 0 ? ", tap" : i === s.masks.length - 1 ? ", thirsty friend" : ""}`}
            className={`${s.flow.reached.includes(i) ? "wet" : ""} ${hint?.pieceId === String(i) ? "hint-piece" : ""}`}
            disabled={i === 0 || i === s.masks.length - 1 || s.complete}
            onClick={() => onRotate(i)}
          >
            <Pipe mask={mask} wet={s.flow.reached.includes(i)} />
            {hint?.pieceId === String(i) && hint.pegId && (
              <span className="ghost-pipe">
                <Pipe mask={Number(hint.pegId)} ghost />
              </span>
            )}
            {i === 0 && <span className="tile-badge">🚰</span>}
            {i === s.masks.length - 1 && (
              <span className="tile-badge">
                {["🌻", "🐰", "🐢", "🦆"][s.index % 4]}
              </span>
            )}
          </button>
        ))}
        <TutorialHandOverlay
          visible={game.moves.length === 0}
          from={{
            x: (((s.puzzle.path[1] % size) + 0.5) / size) * 100,
            y: ((Math.floor(s.puzzle.path[1] / size) + 0.5) / size) * 100,
          }}
        />
      </div>
    </>
  );
}
function ShapeBoard({
  game,
  hint,
  tool,
  setTool,
  onPlace,
}: {
  game: ShapeBuilder;
  hint: Hint | null;
  tool: number;
  setTool(n: number): void;
  onPlace(cell: number, code: number): void;
}) {
  const s = game.getState(),
    size = s.puzzle.size;
  return (
    <>
      <div className="shape-reference">
        <div>
          <strong>{s.puzzle.name}</strong>
          <p>Make this picture ↓</p>
        </div>
        <div
          className="mini-mosaic"
          style={{ gridTemplateColumns: `repeat(${size},1fr)` }}
          aria-label="Picture to build"
        >
          {s.puzzle.cells.map((code, i) => (
            <ShapeIcon key={i} code={code} />
          ))}
        </div>
      </div>
      <div className="inventory">
        {[5, tool >= 1 && tool <= 4 ? tool : 1, 0].map((code) => (
          <DragPiece
            key={code === 5 ? "square" : code === 0 ? "eraser" : "triangle"}
            label={code === 5 ? "Square" : code === 0 ? "Eraser" : "Triangle"}
            selected={tool === code}
            highlighted={
              hint?.pieceId === String(code) ||
              (code > 0 &&
                code < 5 &&
                Number(hint?.pieceId) > 0 &&
                Number(hint?.pieceId) < 5)
            }
            onSelect={() => setTool(code)}
            onDrop={(x, y) => {
              const cell = dropTarget(x, y, ".shape-board", "[data-target]");
              if (cell !== null) onPlace(Number(cell), code);
            }}
          >
            {code === 0 ? "🧽" : <ShapeIcon code={code} />}
            <span>
              {code === 5 ? "Square" : code === 0 ? "Eraser" : "Triangle"}
            </span>
          </DragPiece>
        ))}
        <button
          aria-label="Turn triangle"
          onClick={() => setTool(tool >= 1 && tool <= 4 ? (tool % 4) + 1 : 2)}
        >
          ↻ Turn
        </button>
      </div>
      <div
        className="tile-board shape-board"
        aria-label="Shape building board"
        style={{ gridTemplateColumns: `repeat(${size},1fr)` }}
      >
        {s.cells.map((code, i) => (
          <button
            key={i}
            data-target={i}
            className={hint?.pegId === String(i) ? "hint-piece" : ""}
            aria-label={`Shape row ${Math.floor(i / size) + 1} column ${(i % size) + 1}`}
            disabled={s.complete}
            onClick={() => onPlace(i, tool)}
          >
            {(s.puzzle.guide || hint?.pegId === String(i)) && (
              <span className="shape-guide">
                <ShapeIcon code={s.puzzle.cells[i]} ghost />
              </span>
            )}
            <ShapeIcon code={code} />
          </button>
        ))}
        <TutorialHandOverlay
          visible={game.moves.length === 0}
          from={{ x: 50, y: 100 }}
          to={{ x: 50, y: 50 }}
        />
      </div>
      <p className="board-note">
        {hint?.pegId !== undefined
          ? `Use ${Number(hint.pieceId) === 0 ? "the eraser" : Number(hint.pieceId) === 5 ? "a square" : "a triangle"} in the glowing square.`
          : "Drag a shape, or tap a shape and a square."}
      </p>
    </>
  );
}
