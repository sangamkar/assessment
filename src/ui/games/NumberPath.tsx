import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRng } from '../../engine/rng';
import type { Cell, PathPuzzle } from '../../games/numberPath';
import { canStep, hintPath, isSolved, key, makePuzzle } from '../../games/numberPath';
import { soundEngine } from '../../utils/audio';
import { SpeakButton } from '../SpeakButton';
import { GameBar, GameOver } from './GameFrame';
import type { RoundResult } from './GameFrame';

const ROUNDS = 3;
const COLOR = '#7c3aed';
const RULES = 'Start at number 1. Draw one path through every square. Go through the numbers in order: 1, 2, 3!';

export function NumberPath({ level, onRound, onExit }: { level: 1 | 2 | 3; onRound: (r: RoundResult) => void; onExit: () => void }) {
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [seed, setSeed] = useState(() => Date.now());
  const puzzle = useMemo(() => makePuzzle(level, createRng(seed + round)), [level, seed, round]);
  const [path, setPathState] = useState<Cell[]>([]);
  // Pointer moves can arrive faster than React re-renders, so the live path is kept in a ref too.
  const pathRef = useRef<Cell[]>([]);
  const setPath = (next: Cell[]) => {
    pathRef.current = next;
    setPathState(next);
  };
  const [hints, setHints] = useState(0);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const drawing = useRef(false);

  const goTo = (r: number) => {
    setPath([]);
    setHints(0);
    setSolved(false);
    setMessage('');
    setRound(r);
  };

  useEffect(() => {
    if (round < ROUNDS) soundEngine.speak(RULES);
  }, [puzzle, round]);

  if (round >= ROUNDS) {
    return (
      <Wrap>
        <GameOver
          wins={wins}
          rounds={ROUNDS}
          onAgain={() => {
            setSeed(Date.now());
            setWins(0);
            goTo(0);
          }}
          onExit={onExit}
        />
      </Wrap>
    );
  }

  const finish = (next: Cell[], hintsUsed = hints) => {
    if (!isSolved(puzzle, next)) return;
    setSolved(true);
    const result: RoundResult = hintsUsed <= 1 ? 'win' : 'assisted';
    if (result === 'win') setWins((w) => w + 1);
    onRound(result);
    soundEngine.playCorrectChime();
    const msg = result === 'win' ? 'You did it! Every square, every number!' : 'You finished it! Next time, try with fewer hints.';
    setMessage(msg);
    soundEngine.speak(msg);
  };

  const step = (cell: Cell, fromTap: boolean) => {
    if (solved) return;
    const path = pathRef.current;
    const idx = path.findIndex((q) => q.r === cell.r && q.c === cell.c);
    if (idx >= 0) {
      // Touching your own path goes back to that square.
      if (idx < path.length - 1) setPath(path.slice(0, idx + 1));
      return;
    }
    if (!canStep(puzzle, path, cell)) {
      if (fromTap) {
        soundEngine.playGentleBuzzer();
        const reached = path.filter((q) => puzzle.numbers.has(key(q))).length;
        const n = puzzle.numbers.get(key(cell));
        setMessage(
          !path.length
            ? 'Start on number 1!'
            : n && n !== reached + 1
              ? `Go to number ${reached + 1} first!`
              : n === puzzle.numbers.size
                ? `Number ${n} is the very last square. Fill the others first!`
                : 'Move to a square right next to the end of your path.',
        );
      }
      return;
    }
    soundEngine.playCountPip(Math.min(path.length, 5));
    const next = [...path, cell];
    setPath(next);
    setMessage('');
    finish(next);
  };

  const cellAt = (x: number, y: number): Cell | null => {
    const el = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-r]') as HTMLElement | null;
    return el ? { r: Number(el.dataset.r), c: Number(el.dataset.c) } : null;
  };

  const n = puzzle.size;
  const px = Math.min(88, Math.floor(Math.min(440, (typeof window !== 'undefined' ? window.innerWidth : 440) - 48) / n));
  const center = (q: Cell) => `${q.c * px + px / 2},${q.r * px + px / 2}`;
  const order = new Map(path.map((q, i) => [key(q), i]));

  return (
    <Wrap>
      <GameBar title="🔢 Number Path" round={round} rounds={ROUNDS} level={level} color={COLOR} onExit={onExit} />
      <div className="mt-4 flex items-center gap-3 rounded-[2rem] bg-white p-4 shadow-md">
        <SpeakButton text={RULES} />
        <p className="font-kid text-lg font-bold leading-snug text-slate-700">Start at 1 and fill every square. Visit the numbers in order!</p>
      </div>

      <div className="mt-5 flex justify-center">
        <div
          className="relative touch-none select-none rounded-2xl bg-white p-0 shadow-lg ring-4 ring-violet-200"
          style={{ width: px * n, height: px * n }}
          onPointerDown={(e) => {
            const cell = cellAt(e.clientX, e.clientY);
            if (!cell) return;
            drawing.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            step(cell, true);
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const cell = cellAt(e.clientX, e.clientY);
            const path = pathRef.current;
            if (!cell || !path.length) return;
            const last = path[path.length - 1];
            if (cell.r === last.r && cell.c === last.c) return;
            const prev = path[path.length - 2];
            if (prev && prev.r === cell.r && prev.c === cell.c) setPath(path.slice(0, -1));
            else step(cell, false);
          }}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        >
          <Grid puzzle={puzzle} px={px} order={order} total={n * n} />
          <svg className="pointer-events-none absolute inset-0" width={px * n} height={px * n}>
            {path.length > 1 && <polyline points={path.map(center).join(' ')} fill="none" stroke={COLOR} strokeOpacity={0.55} strokeWidth={px * 0.32} strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
          {[...puzzle.numbers.entries()].map(([k, num]) => {
            const [r, c] = k.split(',').map(Number);
            const done = order.has(k);
            return (
              <div
                key={k}
                className={`pointer-events-none absolute flex items-center justify-center rounded-full font-kid font-bold text-white shadow ${done ? 'bg-violet-700' : 'bg-slate-800'}`}
                style={{ left: c * px + px * 0.18, top: r * px + px * 0.18, width: px * 0.64, height: px * 0.64, fontSize: px * 0.34 }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center font-kid text-lg font-bold text-slate-500">
        {path.length} / {n * n} squares
      </div>
      {message && <div className={`mx-auto mt-3 max-w-xl rounded-3xl px-5 py-3 text-center font-kid text-xl font-bold ${solved ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-900'}`}>{message}</div>}

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {solved ? (
          <button onClick={() => goTo(round + 1)} className="rounded-full px-10 py-4 font-kid text-2xl font-bold text-white shadow-lg" style={{ background: COLOR }}>
            Next ▶
          </button>
        ) : (
          <>
            <button onClick={() => setPath([])} className="rounded-full bg-white px-6 py-3 font-kid text-xl font-bold text-slate-700 shadow">
              ↺ Start over
            </button>
            <button
              onClick={() => {
                const next = hintPath(puzzle, pathRef.current);
                const used = hints + 1;
                setHints(used);
                setPath(next);
                setMessage(used === 1 ? 'Here is a hint: look where the path goes next.' : 'Another hint!');
                finish(next, used);
              }}
              className="rounded-full bg-amber-100 px-6 py-3 font-kid text-xl font-bold text-amber-800 shadow"
            >
              💡 Hint
            </button>
            <button
              onClick={() => {
                onRound('loss');
                goTo(round + 1);
              }}
              className="rounded-full bg-white/70 px-6 py-3 font-kid text-xl font-bold text-slate-500"
            >
              Skip
            </button>
          </>
        )}
      </div>
    </Wrap>
  );
}

function Grid({ puzzle, px, order, total }: { puzzle: PathPuzzle; px: number; order: Map<string, number>; total: number }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${puzzle.size}, ${px}px)` }}>
      {Array.from({ length: puzzle.size * puzzle.size }, (_, i) => {
        const r = Math.floor(i / puzzle.size);
        const c = i % puzzle.size;
        const at = order.get(`${r},${c}`);
        return (
          <div
            key={i}
            data-r={r}
            data-c={c}
            className="border border-violet-100"
            style={{ height: px, background: at === undefined ? '#ffffff' : `hsl(265 85% ${92 - (at / total) * 22}%)` }}
          />
        );
      })}
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-8 pt-4">{children}</div>;
}
