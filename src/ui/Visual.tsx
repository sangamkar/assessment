import React from 'react';
import type { Place, Visual as V } from '../content/types';
import { CompositeSvg, ShapeSvg } from './ShapeSvg';

export type VSize = 'lg' | 'md' | 'sm';

const EMOJI_PX: Record<VSize, number> = { lg: 64, md: 40, sm: 26 };
const SHAPE_PX: Record<VSize, number> = { lg: 190, md: 96, sm: 60 };

/** Deterministic jitter so scattered objects don't move between renders. */
function scatterCells(n: number) {
  const cols = Math.ceil(Math.sqrt(n * 1.6));
  const rows = Math.ceil(n / cols) + 1;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  let seed = n * 9301 + 49297;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { cols, rows, picks: cells.slice(0, n).map((c) => ({ c: c % cols, r: Math.floor(c / cols), dx: rand() * 0.4 - 0.2, dy: rand() * 0.4 - 0.2 })) };
}

// 3×3 pip positions for dot patterns 1–9.
const DICE: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
  7: [0, 2, 3, 4, 5, 6, 8],
  8: [0, 1, 2, 3, 5, 6, 7, 8],
  9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};

function Objects({ emoji, count, arrange = 'line', size }: { emoji: string; count: number; arrange?: 'line' | 'scatter' | 'dice'; size: VSize }) {
  const px = count > 12 ? EMOJI_PX[size] * 0.75 : EMOJI_PX[size];
  if (arrange === 'dice' && count <= 9) {
    const cell = px * 1.1;
    return (
      <div className="grid grid-cols-3 rounded-2xl bg-white/70 p-2 ring-2 ring-slate-200" style={{ width: cell * 3 + 16 }}>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="flex items-center justify-center" style={{ height: cell, fontSize: px * 0.8 }}>
            {DICE[count].includes(i) ? emoji : ''}
          </span>
        ))}
      </div>
    );
  }
  if (arrange === 'scatter') {
    const { cols, rows, picks } = scatterCells(count);
    const cell = px * 1.25;
    return (
      <div className="relative" style={{ width: cols * cell, height: rows * cell }}>
        {picks.map((p, i) => (
          <span key={i} className="absolute leading-none" style={{ left: (p.c + 0.5 + p.dx) * cell - px / 2, top: (p.r + 0.5 + p.dy) * cell - px / 2, fontSize: px }}>
            {emoji}
          </span>
        ))}
      </div>
    );
  }
  // line: rows of five make counting and checking easier
  const rows: number[][] = [];
  for (let i = 0; i < count; i += 5) rows.push(Array.from({ length: Math.min(5, count - i) }, (_, k) => i + k));
  return (
    <div className="flex flex-col items-start gap-1">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-1">
          {r.map((k) => (
            <span key={k} className="leading-none" style={{ fontSize: px }}>
              {emoji}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function TenFrame({ filled, frames = 1, color = '#ef4444', size }: { filled: number; frames?: 1 | 2; color?: string; size: VSize }) {
  const cell = size === 'lg' ? 46 : size === 'md' ? 24 : 16;
  const n = Math.max(frames, filled > 10 ? 2 : 1);
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: n }, (_, f) => (
        <div key={f} className="grid grid-cols-5 border-2 border-slate-700 bg-white" style={{ width: cell * 5 + 4 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const on = f * 10 + i < filled;
            return (
              <div key={i} className="flex items-center justify-center border border-slate-400" style={{ height: cell }}>
                {on && <div className="rounded-full" style={{ width: cell * 0.7, height: cell * 0.7, background: color }} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Tally({ count, size }: { count: number; size: VSize }) {
  const h = size === 'lg' ? 70 : 40;
  const groups: number[] = [];
  for (let i = 0; i < count; i += 5) groups.push(Math.min(5, count - i));
  return (
    <div className="flex gap-4">
      {groups.map((g, i) => (
        <svg key={i} width={h * 0.9} height={h} viewBox="0 0 54 60">
          {Array.from({ length: Math.min(g, 4) }, (_, k) => (
            <line key={k} x1={8 + k * 12} y1={6} x2={8 + k * 12} y2={54} stroke="#1f2937" strokeWidth={4} strokeLinecap="round" />
          ))}
          {g === 5 && <line x1={0} y1={44} x2={52} y2={14} stroke="#1f2937" strokeWidth={4} strokeLinecap="round" />}
        </svg>
      ))}
    </div>
  );
}

function Clock({ hour, minute, size }: { hour: number; minute: number; size: VSize }) {
  const px = size === 'lg' ? 220 : 100;
  const hA = (((hour % 12) + minute / 60) * 30 * Math.PI) / 180;
  const mA = (minute * 6 * Math.PI) / 180;
  return (
    <svg width={px} height={px} viewBox="0 0 100 100" role="img" aria-label="clock">
      <circle cx={50} cy={50} r={46} fill="#fff" stroke="#1f2937" strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) * 30 * Math.PI) / 180;
        return (
          <text key={i} x={50 + 37 * Math.sin(a)} y={50 - 37 * Math.cos(a) + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1f2937">
            {i + 1}
          </text>
        );
      })}
      <line x1={50} y1={50} x2={50 + 22 * Math.sin(hA)} y2={50 - 22 * Math.cos(hA)} stroke="#1f2937" strokeWidth={5} strokeLinecap="round" />
      <line x1={50} y1={50} x2={50 + 34 * Math.sin(mA)} y2={50 - 34 * Math.cos(mA)} stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
      <circle cx={50} cy={50} r={3} fill="#1f2937" />
    </svg>
  );
}

function Balance({ left, right, tilt, leftCount = 1, rightCount = 1, size }: { left: string; right: string; tilt: 'left' | 'right' | 'level'; leftCount?: number; rightCount?: number; size: VSize }) {
  const w = size === 'lg' ? 320 : 160;
  const angle = tilt === 'left' ? -10 : tilt === 'right' ? 10 : 0;
  const pan = (emoji: string, count: number) => (
    <div className="flex min-h-[1.2em] flex-wrap items-end justify-center" style={{ fontSize: size === 'lg' ? (count > 2 ? 30 : 44) : 20, width: w * 0.36 }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="leading-none">
          {emoji}
        </span>
      ))}
    </div>
  );
  return (
    <div className="flex flex-col items-center" style={{ width: w }}>
      <div className="flex w-full items-end justify-between transition-transform" style={{ transform: `rotate(${angle}deg)` }}>
        <div className="flex flex-col items-center">
          {pan(left, leftCount)}
          <div className="h-2 rounded-full bg-amber-700" style={{ width: w * 0.36 }} />
        </div>
        <div className="flex flex-col items-center">
          {pan(right, rightCount)}
          <div className="h-2 rounded-full bg-amber-700" style={{ width: w * 0.36 }} />
        </div>
      </div>
      <div className="-mt-0.5 h-1.5 rounded bg-slate-700" style={{ width: w * 0.9, transform: `rotate(${angle}deg)` }} />
      <div className="h-0 w-0 border-x-[18px] border-b-[34px] border-x-transparent border-b-slate-700" />
    </div>
  );
}

function Lengths({ mode, items, size }: { mode: 'length' | 'height'; items: { emoji: string; size: number; color: string; offset?: number }[]; size: VSize }) {
  const unit = size === 'lg' ? 26 : 12;
  if (mode === 'height') {
    return (
      <div className="flex items-end gap-6 border-b-4 border-slate-700 px-4">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="rounded-t-md border-2 border-slate-700" style={{ width: unit * 1.6, height: it.size * unit, background: it.color }} />
            <span style={{ fontSize: unit }}>{it.emoji}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ fontSize: unit }}>{it.emoji}</span>
          <div style={{ width: (it.offset ?? 0) * unit }} />
          <div className="rounded-full border-2 border-slate-700" style={{ width: it.size * unit, height: unit * 0.8, background: it.color }} />
        </div>
      ))}
    </div>
  );
}

function Measure({ emoji, units, unit, size }: { emoji: string; units: number; unit: string; size: VSize }) {
  const u = size === 'lg' ? 34 : 18;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center rounded-full border-2 border-slate-700 bg-amber-200" style={{ width: units * u, height: u * 1.1 }}>
        <span style={{ fontSize: u * 0.8 }} className="pl-1 leading-none">
          {emoji}
        </span>
      </div>
      <div className="flex">
        {Array.from({ length: units }, (_, i) => (
          <span key={i} className="flex items-center justify-center leading-none" style={{ width: u, fontSize: u * 0.8 }}>
            {unit}
          </span>
        ))}
      </div>
    </div>
  );
}

function Bond({ whole, a, b, size }: { whole: number | '?'; a: number | '?'; b: number | '?'; size: VSize }) {
  const px = size === 'lg' ? 220 : 110;
  const circle = (cx: number, cy: number, v: number | '?') => (
    <g>
      <circle cx={cx} cy={cy} r={17} fill={v === '?' ? '#fef3c7' : '#fff'} stroke="#1f2937" strokeWidth={2.5} strokeDasharray={v === '?' ? '4 3' : undefined} />
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1f2937">
        {v}
      </text>
    </g>
  );
  return (
    <svg width={px} height={px * 0.8} viewBox="0 0 100 80">
      <line x1={50} y1={22} x2={25} y2={58} stroke="#1f2937" strokeWidth={2.5} />
      <line x1={50} y1={22} x2={75} y2={58} stroke="#1f2937" strokeWidth={2.5} />
      {circle(50, 20, whole)}
      {circle(25, 60, a)}
      {circle(75, 60, b)}
    </svg>
  );
}

const PLACE_POS: Record<Place, { x: number; y: number; z: number; s: number }> = {
  above: { x: 50, y: 14, z: 2, s: 0.7 },
  below: { x: 50, y: 92, z: 2, s: 0.5 },
  beside: { x: 86, y: 58, z: 2, s: 0.7 },
  inside: { x: 50, y: 42, z: 0, s: 0.62 },
  behind: { x: 66, y: 38, z: 0, s: 0.8 },
  'in-front': { x: 42, y: 66, z: 2, s: 0.7 },
};

function PlaceScene({ thing, refEmoji, where, size }: { thing: string; refEmoji: string; where: Place; size: VSize }) {
  const box = size === 'lg' ? 220 : 120;
  const p = PLACE_POS[where];
  const refSize = box * 0.48;
  return (
    <div className="relative" style={{ width: box, height: box }}>
      <span className="absolute leading-none" style={{ left: box / 2 - refSize / 2, top: box * 0.58 - refSize / 2, fontSize: refSize, zIndex: 1 }}>
        {refEmoji}
      </span>
      <span className="absolute leading-none" style={{ left: (p.x / 100) * box - (refSize * p.s) / 2, top: (p.y / 100) * box - (refSize * p.s) / 2, fontSize: refSize * p.s, zIndex: p.z }}>
        {thing}
      </span>
    </div>
  );
}

export function Visual({ v, size = 'lg' }: { v: V; size?: VSize }) {
  switch (v.kind) {
    case 'emoji': {
      const px = v.size === 'xl' ? EMOJI_PX[size] * 1.8 : v.size === 'md' ? EMOJI_PX[size] * 0.8 : EMOJI_PX[size] * 1.2;
      return (
        <span role="img" aria-label={v.label} className="leading-none" style={{ fontSize: px }}>
          {v.emoji}
        </span>
      );
    }
    case 'objects':
      return <Objects emoji={v.emoji} count={v.count} arrange={v.arrange} size={size} />;
    case 'groups':
      return (
        <div className="flex items-center gap-3">
          {v.groups.map((g, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-4xl font-black text-slate-500">{v.sep === '|' ? '' : v.sep ?? '+'}</span>}
              <div className="rounded-2xl bg-white/80 p-2 ring-2 ring-slate-200">
                <Objects emoji={g.emoji} count={g.count} size={size} />
              </div>
            </React.Fragment>
          ))}
        </div>
      );
    case 'crossed':
      return (
        <div className="flex flex-wrap gap-1" style={{ maxWidth: EMOJI_PX[size] * 6 }}>
          {Array.from({ length: v.total }, (_, i) => {
            const gone = i >= v.total - v.crossed;
            return (
              <span key={i} className="relative leading-none" style={{ fontSize: EMOJI_PX[size], opacity: gone ? 0.45 : 1 }}>
                {v.emoji}
                {gone && <span className="absolute inset-0 flex items-center justify-center font-black text-red-600" style={{ fontSize: EMOJI_PX[size] * 1.1 }}>✕</span>}
              </span>
            );
          })}
        </div>
      );
    case 'tenFrame':
      return <TenFrame filled={v.filled} frames={v.frames} color={v.color} size={size} />;
    case 'number':
      return <span className="font-kid font-bold text-slate-800" style={{ fontSize: size === 'lg' ? 84 : size === 'md' ? 44 : 28 }}>{v.value}</span>;
    case 'sequence':
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {v.items.map((it, i) => (
            <div
              key={i}
              className={`flex items-center justify-center rounded-2xl border-4 font-kid font-bold ${i === v.blank ? 'border-dashed border-amber-400 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-800'}`}
              style={{ minWidth: size === 'lg' ? 72 : 44, height: size === 'lg' ? 72 : 44, fontSize: size === 'lg' ? 36 : 22, padding: '0 6px' }}
            >
              {i === v.blank ? '?' : it}
            </div>
          ))}
        </div>
      );
    case 'text':
      return (
        <span className="font-reader font-bold tracking-wide text-slate-900" style={{ fontSize: (v.size === 'xl' ? 72 : v.size === 'lg' ? 44 : 30) * (size === 'lg' ? 1 : 0.6) }}>
          {v.text}
        </span>
      );
    case 'shape':
      return <ShapeSvg spec={v} size={SHAPE_PX[size]} />;
    case 'shapeRow':
      return (
        <div className="flex items-center gap-2">
          {v.shapes.map((s, i) => (i === v.blank ? <span key={i} className="text-5xl text-amber-500">?</span> : <ShapeSvg key={i} spec={s} size={SHAPE_PX[size] * 0.6} />))}
        </div>
      );
    case 'lengths':
      return <Lengths mode={v.mode} items={v.items} size={size} />;
    case 'balance':
      return <Balance {...v} size={size} />;
    case 'graph':
      return (
        <div className="rounded-2xl bg-white p-3 ring-2 ring-slate-200">
          {v.title && <div className="mb-2 text-center text-sm font-bold text-slate-500">{v.title}</div>}
          {v.rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2 border-b border-slate-100 py-1 last:border-0">
              <span className="w-10 text-center" style={{ fontSize: EMOJI_PX[size] * 0.6 }}>
                {r.emoji}
              </span>
              <div className="flex gap-1 border-l-2 border-slate-300 pl-2">
                {Array.from({ length: r.count }, (_, k) => (
                  <span key={k} className="flex items-center justify-center rounded-md bg-slate-50" style={{ width: EMOJI_PX[size] * 0.6, fontSize: EMOJI_PX[size] * 0.45 }}>
                    {r.emoji}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case 'tally':
      return <Tally count={v.count} size={size} />;
    case 'clock':
      return <Clock hour={v.hour} minute={v.minute} size={size} />;
    case 'matrix': {
      const cell = size === 'lg' ? (v.cols === 3 ? 92 : 120) : 56;
      return (
        <div className="grid gap-1.5 rounded-2xl bg-slate-200 p-1.5" style={{ gridTemplateColumns: `repeat(${v.cols}, ${cell}px)` }}>
          {v.cells.map((c, i) => (
            <div key={i} className={`flex items-center justify-center rounded-xl ${c ? 'bg-white' : 'border-4 border-dashed border-amber-400 bg-amber-50'}`} style={{ height: cell }}>
              {c ? <Visual v={c} size="sm" /> : <span className="font-kid text-4xl font-bold text-amber-500">?</span>}
            </div>
          ))}
        </div>
      );
    }
    case 'map': {
      const cell = size === 'lg' ? 72 : 36;
      return (
        <div className="grid gap-0 rounded-xl border-4 border-emerald-700 bg-emerald-50" style={{ gridTemplateColumns: `repeat(${v.cols}, ${cell}px)` }}>
          {Array.from({ length: v.rows * v.cols }, (_, i) => {
            const r = Math.floor(i / v.cols);
            const c = i % v.cols;
            const hit = v.cells.find((x) => x.r === r && x.c === c);
            return (
              <div key={i} className="flex items-center justify-center border border-emerald-200" style={{ height: cell, fontSize: cell * 0.6 }}>
                {hit?.emoji}
              </div>
            );
          })}
        </div>
      );
    }
    case 'story':
      return (
        <div className="w-full max-w-xl rounded-3xl bg-amber-50 p-4 ring-2 ring-amber-200">
          <div className="mb-2 font-kid text-xl font-bold text-amber-800">{v.title}</div>
          {v.lines.map((l, i) => (
            <div key={i} className="flex items-start gap-3 py-1">
              <span className="text-3xl leading-none">{l.emoji}</span>
              <span className="font-reader text-lg text-slate-800">{l.text}</span>
            </div>
          ))}
        </div>
      );
    case 'measure':
      return <Measure {...v} size={size} />;
    case 'bond':
      return <Bond {...v} size={size} />;
    case 'place':
      return <PlaceScene thing={v.thing} refEmoji={v.ref} where={v.where} size={size} />;
    case 'composite':
      return <CompositeSvg preset={v.preset} size={size === 'lg' ? 200 : 96} />;
    case 'coins': {
      const base = (size === 'lg' ? 64 : size === 'md' ? 48 : 30) * (v.values.length === 1 ? 1.5 : 1);
      // US coins keep their real relative sizes (a dime is smaller than a penny!) and show names, not values.
      const US: Record<number, { scale: number; gold: boolean }> = { 1: { scale: 0.95, gold: true }, 5: { scale: 1.05, gold: false }, 10: { scale: 0.88, gold: false }, 25: { scale: 1.2, gold: false } };
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {v.values.map((value, i) => {
            const us = v.labels ? US[value] : undefined;
            const d = us ? base * us.scale : base * (0.8 + Math.min(value, 10) * 0.03);
            const gold = us ? us.gold : value >= 10 || value === 2;
            return (
              <div
                key={i}
                className={`flex items-center justify-center rounded-full border-4 text-center font-kid font-bold leading-none shadow ${gold ? 'border-amber-600 bg-amber-300 text-amber-900' : 'border-slate-400 bg-slate-200 text-slate-800'}`}
                style={{ width: d, height: d, fontSize: d * (v.labels ? 0.2 : 0.32) }}
              >
                {v.labels ? v.labels[i] : `${v.symbol}${value}`}
              </div>
            );
          })}
        </div>
      );
    }
    case 'baseTen': {
      const u = size === 'lg' ? 9 : size === 'md' ? 6 : 4;
      const cell = (k: number) => <div key={k} className="border border-sky-700 bg-sky-300" style={{ width: u, height: u }} />;
      return (
        <div className="flex flex-wrap items-end justify-center gap-3">
          {Array.from({ length: v.hundreds }, (_, h) => (
            <div key={`h${h}`} className="grid grid-cols-10 border-2 border-sky-800" aria-label="hundred">
              {Array.from({ length: 100 }, (_, k) => cell(k))}
            </div>
          ))}
          {v.tens > 0 && (
            <div className="flex gap-1">
              {Array.from({ length: v.tens }, (_, t) => (
                <div key={`t${t}`} className="grid grid-cols-1 border-2 border-sky-800" aria-label="ten">
                  {Array.from({ length: 10 }, (_, k) => cell(k))}
                </div>
              ))}
            </div>
          )}
          {v.ones > 0 && (
            <div className="grid grid-cols-3 gap-1" aria-label="ones">
              {Array.from({ length: v.ones }, (_, k) => (
                <div key={k} className="border-2 border-sky-800 bg-sky-300" style={{ width: u * 1.4, height: u * 1.4 }} />
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'row':
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {v.items.map((it, i) => (
            <React.Fragment key={i}>
              {i > 0 && v.sep && <span className="text-3xl font-black text-slate-400">{v.sep}</span>}
              <Visual v={it} size={size === 'lg' ? 'md' : 'sm'} />
            </React.Fragment>
          ))}
        </div>
      );
  }
}
