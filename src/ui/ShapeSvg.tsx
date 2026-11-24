import React, { useId } from 'react';
import type { CompositePreset, PiecesPreset, ShapeSpec } from '../content/types';

const INK = '#1f2937';

const poly = (n: number, r: number, start = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((start + (360 / n) * i) * Math.PI) / 180;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');

function Shape2D({ spec, fill, stroke }: { spec: ShapeSpec; fill: string; stroke: string }) {
  const common = { fill, stroke, strokeWidth: spec.outline ? 6 : 3, strokeLinejoin: 'round' as const };
  const divider = { stroke: '#ffffff', strokeWidth: 3 };
  switch (spec.shape) {
    case 'circle':
      return <circle cx={50} cy={50} r={40} {...common} />;
    case 'oval':
      return <ellipse cx={50} cy={50} rx={45} ry={27} {...common} />;
    case 'triangle':
      return <polygon points="50,10 90,82 10,82" {...common} />;
    case 'right-triangle':
      // Legs of different length, so a flipped copy can never be matched by turning.
      return <polygon points="25,12 25,85 70,85" {...common} />;
    case 'square':
      return <rect x={15} y={15} width={70} height={70} {...common} />;
    case 'rectangle': {
      const w = 86;
      const h = w / (spec.stretch ?? 1.8);
      return <rect x={50 - w / 2} y={50 - h / 2} width={w} height={h} {...common} />;
    }
    case 'hexagon':
      return <polygon points={poly(6, 42, 0)} {...common} />;
    case 'pentagon':
      return <polygon points={poly(5, 42)} {...common} />;
    case 'trapezoid':
      return <polygon points="30,25 70,25 92,78 8,78" {...common} />;
    case 'rhombus':
      return <polygon points="50,8 82,50 50,92 18,50" {...common} />;
    case 'open-triangle':
      return <path d="M 38,32 L 50,10 L 90,82 L 10,82 L 30,46" {...common} fill="none" />;
    case 'curvy-triangle':
      return <path d="M 50,10 Q 82,38 90,82 Q 50,64 10,82 Q 18,38 50,10 Z" {...common} />;
    case 'circle-halves':
      return (
        <g>
          <circle cx={50} cy={50} r={40} {...common} />
          <line x1={50} y1={10} x2={50} y2={90} {...divider} stroke={INK} />
        </g>
      );
    case 'circle-fourths':
      return (
        <g>
          <circle cx={50} cy={50} r={40} {...common} />
          <line x1={50} y1={10} x2={50} y2={90} {...divider} stroke={INK} />
          <line x1={10} y1={50} x2={90} y2={50} {...divider} stroke={INK} />
        </g>
      );
    case 'circle-unequal':
      return (
        <g>
          <circle cx={50} cy={50} r={40} {...common} />
          <line x1={28} y1={17} x2={28} y2={83} {...divider} stroke={INK} />
        </g>
      );
    case 'rect-halves':
      return (
        <g>
          <rect x={8} y={25} width={84} height={50} {...common} />
          <line x1={50} y1={25} x2={50} y2={75} {...divider} stroke={INK} />
        </g>
      );
    case 'rect-fourths':
      return (
        <g>
          <rect x={8} y={25} width={84} height={50} {...common} />
          <line x1={50} y1={25} x2={50} y2={75} {...divider} stroke={INK} />
          <line x1={8} y1={50} x2={92} y2={50} {...divider} stroke={INK} />
        </g>
      );
    case 'rect-unequal':
      return (
        <g>
          <rect x={8} y={25} width={84} height={50} {...common} />
          <line x1={30} y1={25} x2={30} y2={75} {...divider} stroke={INK} />
          <line x1={62} y1={25} x2={62} y2={75} {...divider} stroke={INK} />
          <line x1={78} y1={25} x2={78} y2={75} {...divider} stroke={INK} />
        </g>
      );
    case 'scalene-triangle':
      return <polygon points="12,80 88,80 35,18" {...common} />;
    case 'obtuse-triangle':
      return <polygon points="6,70 94,70 24,40" {...common} />;
    case 'parallelogram':
      return <polygon points="28,25 92,25 72,75 8,75" {...common} />;
    case 'kite':
      return <polygon points="50,8 78,38 50,92 22,38" {...common} />;
    case 'irregular-quad':
      return <polygon points="15,20 75,12 88,80 25,70" {...common} />;
    case 'irregular-pentagon':
      return <polygon points="50,8 90,40 72,88 20,80 10,35" {...common} />;
    case 'irregular-hexagon':
      return <polygon points="30,10 75,15 92,50 70,88 25,85 8,45" {...common} />;
    case 'concave-hexagon':
      return <polygon points="10,15 50,40 90,15 90,62 50,88 10,62" {...common} />;
    case 'octagon':
      return <polygon points={poly(8, 42, -67.5)} {...common} />;
    case 'semicircle':
      return <path d="M 8,68 A 42,42 0 0 1 92,68 Z" {...common} />;
    case 'quarter-circle':
      return <path d="M 15,85 L 15,15 A 70,70 0 0 1 85,85 Z" {...common} />;
    default:
      return null;
  }
}

function Shape3D({ spec, fill, gid }: { spec: ShapeSpec; fill: string; gid: string }) {
  const s = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const };
  switch (spec.shape) {
    case 'cube':
      return (
        <g>
          <polygon points="50,12 86,30 50,48 14,30" fill={fill} {...s} style={{ filter: 'brightness(1.2)' }} />
          <polygon points="14,30 50,48 50,88 14,70" fill={fill} {...s} />
          <polygon points="50,48 86,30 86,70 50,88" fill={fill} {...s} style={{ filter: 'brightness(0.75)' }} />
        </g>
      );
    case 'rect-prism':
      return (
        <g>
          <polygon points="50,6 80,18 50,30 20,18" fill={fill} {...s} style={{ filter: 'brightness(1.2)' }} />
          <polygon points="20,18 50,30 50,94 20,82" fill={fill} {...s} />
          <polygon points="50,30 80,18 80,82 50,94" fill={fill} {...s} style={{ filter: 'brightness(0.75)' }} />
        </g>
      );
    case 'sphere':
      return (
        <g>
          <defs>
            <radialGradient id={gid} cx="35%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="35%" stopColor={fill} />
              <stop offset="100%" stopColor={fill} style={{ filter: 'brightness(0.6)' }} />
            </radialGradient>
          </defs>
          <circle cx={50} cy={50} r={40} fill={`url(#${gid})`} {...s} />
        </g>
      );
    case 'cylinder':
      return (
        <g>
          <path d="M 18,22 L 18,78 A 32,11 0 0 0 82,78 L 82,22" fill={fill} {...s} />
          <ellipse cx={50} cy={22} rx={32} ry={11} fill={fill} {...s} style={{ filter: 'brightness(1.25)' }} />
        </g>
      );
    case 'cone':
      return (
        <g>
          <path d="M 50,8 L 82,78 A 32,11 0 0 1 18,78 Z" fill={fill} {...s} />
          <path d="M 18,78 A 32,11 0 0 0 82,78" fill="none" {...s} strokeDasharray="4 4" />
        </g>
      );
    case 'pyramid':
      return (
        <g>
          <polygon points="12,74 58,88 50,10" fill={fill} {...s} />
          <polygon points="58,88 90,68 50,10" fill={fill} {...s} style={{ filter: 'brightness(0.75)' }} />
          <path d="M 12,74 L 44,58 L 90,68 M 44,58 L 50,10" fill="none" {...s} strokeDasharray="4 4" />
        </g>
      );
    case 'tri-prism':
      return (
        <g>
          <polygon points="28,50 76,26 94,58 46,82" fill={fill} {...s} style={{ filter: 'brightness(0.8)' }} />
          <polygon points="10,82 46,82 28,50" fill={fill} {...s} style={{ filter: 'brightness(1.15)' }} />
          <path d="M 10,82 L 58,58 L 94,58 M 58,58 L 76,26" fill="none" {...s} strokeDasharray="4 4" />
        </g>
      );
    default:
      return null;
  }
}

const SOLIDS = new Set(['cube', 'rect-prism', 'sphere', 'cylinder', 'cone', 'pyramid', 'tri-prism']);

export function ShapeSvg({ spec, size = 120 }: { spec: ShapeSpec; size?: number }) {
  const gid = useId().replace(/:/g, '');
  const fill = spec.color ?? '#3b82f6';
  const scale = spec.scale ?? 1;
  const transform = `rotate(${spec.rotate ?? 0} 50 50) translate(50 50) scale(${(spec.flip ? -1 : 1) * scale} ${scale}) translate(-50 -50)`;
  return (
    <svg viewBox="-4 -4 108 108" width={size} height={size} role="img" aria-label={spec.shape}>
      <g transform={transform}>
        {SOLIDS.has(spec.shape) ? (
          <Shape3D spec={spec} fill={fill} gid={gid} />
        ) : (
          <Shape2D spec={spec} fill={spec.outline ? 'none' : fill} stroke={spec.outline ? fill : INK} />
        )}
      </g>
    </svg>
  );
}

export function CompositeSvg({ preset, size = 200 }: { preset: CompositePreset; size?: number }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const };
  const body = (() => {
    switch (preset) {
      case 'house':
        return (
          <g>
            <rect x={25} y={50} width={50} height={45} fill="#3b82f6" {...s} />
            <polygon points="20,50 50,12 80,50" fill="#ef4444" {...s} />
          </g>
        );
      case 'two-squares':
        return (
          <g>
            <rect x={10} y={30} width={40} height={40} fill="#10b981" {...s} />
            <rect x={50} y={30} width={40} height={40} fill="#34d399" {...s} />
          </g>
        );
      case 'square-from-triangles':
        return (
          <g>
            <polygon points="15,15 85,15 15,85" fill="#3b82f6" {...s} />
            <polygon points="85,15 85,85 15,85" fill="#60a5fa" {...s} />
          </g>
        );
      case 'hexagon-from-trapezoids':
        return (
          <g>
            <polygon points="8,50 29,14 71,14 92,50" fill="#ef4444" {...s} />
            <polygon points="8,50 92,50 71,86 29,86" fill="#f87171" {...s} />
          </g>
        );
      case 'ice-cream':
        return (
          <g>
            <polygon points="28,45 72,45 50,96" fill="#f59e0b" {...s} />
            <circle cx={50} cy={30} r={24} fill="#ec4899" {...s} />
          </g>
        );
      case 'triangle-split':
        return (
          <g>
            <polygon points="50,10 50,85 8,85" fill="#8b5cf6" {...s} />
            <polygon points="50,10 92,85 50,85" fill="#a78bfa" {...s} />
          </g>
        );
      default:
        return null;
    }
  })();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={preset}>
      {body}
    </svg>
  );
}

/* ---- Shapes cut into pieces (composing and decomposing) ---- */

type Piece = { d: string; c: [number, number] };
const P = (pts: string): Piece => {
  const xy = pts.trim().split(/\s+/).map((p) => p.split(',').map(Number) as [number, number]);
  const c: [number, number] = [xy.reduce((a, p) => a + p[0], 0) / xy.length, xy.reduce((a, p) => a + p[1], 0) / xy.length];
  return { d: `M ${xy.map((p) => p.join(',')).join(' L ')} Z`, c };
};
const HEX = [[92, 50], [71, 86], [29, 86], [8, 50], [29, 14], [71, 14]].map((p) => p.join(','));
export const PIECES: Record<PiecesPreset, Piece[]> = {
  'square-2tri': [P('15,15 85,15 15,85'), P('85,15 85,85 15,85')],
  'square-2rect': [P('15,15 50,15 50,85 15,85'), P('50,15 85,15 85,85 50,85')],
  'square-4tri': [P('15,15 85,15 50,50'), P('85,15 85,85 50,50'), P('85,85 15,85 50,50'), P('15,85 15,15 50,50')],
  'square-4sq': [P('15,15 50,15 50,50 15,50'), P('50,15 85,15 85,50 50,50'), P('15,50 50,50 50,85 15,85'), P('50,50 85,50 85,85 50,85')],
  'rect-2sq': [P('8,29 50,29 50,71 8,71'), P('50,29 92,29 92,71 50,71')],
  'rect-2tri': [P('8,29 92,29 8,71'), P('92,29 92,71 8,71')],
  'rect-3sq': [P('5,35 35,35 35,65 5,65'), P('35,35 65,35 65,65 35,65'), P('65,35 95,35 95,65 65,65')],
  'hex-2trap': [P(`${HEX[3]} ${HEX[4]} ${HEX[5]} ${HEX[0]}`), P(`${HEX[0]} ${HEX[1]} ${HEX[2]} ${HEX[3]}`)],
  'hex-6tri': HEX.map((v, i) => P(`50,50 ${v} ${HEX[(i + 1) % 6]}`)),
  'hex-3rhom': [0, 2, 4].map((i) => P(`50,50 ${HEX[i]} ${HEX[i + 1]} ${HEX[(i + 2) % 6]}`)),
  'hex-trap-3tri': [P(`${HEX[3]} ${HEX[4]} ${HEX[5]} ${HEX[0]}`), P(`${HEX[3]} ${HEX[2]} 50,50`), P(`50,50 ${HEX[2]} ${HEX[1]}`), P(`50,50 ${HEX[1]} ${HEX[0]}`)],
  'trap-3tri': [P('4,80 50,80 27,40'), P('27,40 50,80 73,40'), P('50,80 96,80 73,40')],
  'trap-tri-rhom': [P('4,80 50,80 73,40 27,40'), P('50,80 96,80 73,40')],
  'rhom-2tri': [P('16,70 62,70 39,30'), P('39,30 62,70 85,30')],
  'tri-4tri': [P('4,88 50,88 27,48'), P('50,88 96,88 73,48'), P('27,48 73,48 50,8'), P('27,48 50,88 73,48')],
  'circle-2semi': [{ d: 'M 10,50 A 40,40 0 0 1 90,50 Z', c: [50, 33] }, { d: 'M 90,50 A 40,40 0 0 1 10,50 Z', c: [50, 67] }],
  'circle-4quarter': [
    { d: 'M 50,50 L 50,10 A 40,40 0 0 1 90,50 Z', c: [67, 33] },
    { d: 'M 50,50 L 90,50 A 40,40 0 0 1 50,90 Z', c: [67, 67] },
    { d: 'M 50,50 L 50,90 A 40,40 0 0 1 10,50 Z', c: [33, 67] },
    { d: 'M 50,50 L 10,50 A 40,40 0 0 1 50,10 Z', c: [33, 33] },
  ],
  'rect-tri-trap': [P('8,29 40,29 8,71'), P('40,29 92,29 92,71 8,71')],
  'house-sq-tri': [P('25,45 75,45 50,10'), P('25,45 75,45 75,95 25,95')],
};

export function PiecesSvg({ preset, apart, color = '#3b82f6', size = 200 }: { preset: PiecesPreset; apart?: boolean; color?: string; size?: number }) {
  const pieces = PIECES[preset];
  const k = apart ? 0.45 : 0;
  return (
    <svg viewBox={apart ? '-22 -22 144 144' : '0 0 100 100'} width={size} height={size} role="img" aria-label="shape made of pieces">
      {pieces.map((p, i) => (
        <path
          key={i}
          d={p.d}
          transform={`translate(${(p.c[0] - 50) * k} ${(p.c[1] - 50) * k})`}
          fill={color}
          stroke={INK}
          strokeWidth={2.5}
          strokeLinejoin="round"
          style={{ filter: `brightness(${i % 2 ? 1.25 : 1})` }}
        />
      ))}
    </svg>
  );
}

/* ---- Circles and rectangles cut into equal or unequal parts ---- */

const UNEQUAL: Record<number, number[]> = { 2: [0.3, 0.7], 3: [0.18, 0.32, 0.5], 4: [0.12, 0.2, 0.3, 0.38], 6: [0.08, 0.1, 0.14, 0.18, 0.22, 0.28], 8: [0.05, 0.07, 0.09, 0.11, 0.13, 0.15, 0.18, 0.22] };

export function PartsSvg({ shape, n, equal = true, shaded, cut = 'v', color = '#3b82f6', size = 190 }: { shape: 'circle' | 'rect' | 'square'; n: number; equal?: boolean; shaded?: number; cut?: 'v' | 'h' | 'grid' | 'diag'; color?: string; size?: number }) {
  const on = (i: number) => (shaded === undefined ? color : i < shaded ? color : '#ffffff');
  const st = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const };
  const paths: string[] = [];
  if (shape === 'circle') {
    if (equal) {
      if (n === 1) paths.push('M 10,50 A 40,40 0 1 1 90,50 A 40,40 0 1 1 10,50 Z');
      for (let i = 0; n > 1 && i < n; i++) {
        const a0 = -Math.PI / 2 + (2 * Math.PI * i) / n;
        const a1 = a0 + (2 * Math.PI) / n;
        const p = (a: number) => `${(50 + 40 * Math.cos(a)).toFixed(2)},${(50 + 40 * Math.sin(a)).toFixed(2)}`;
        paths.push(`M 50,50 L ${p(a0)} A 40,40 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z`);
      }
    } else {
      // Parallel cuts: strips of a circle are never equal, even when they look evenly spaced.
      const xs = n === 2 ? [10, 32, 90] : Array.from({ length: n + 1 }, (_, i) => 10 + (80 * i) / n);
      for (let i = 0; i < n; i++) {
        const y = (x: number) => Math.sqrt(Math.max(0, 1600 - (x - 50) ** 2));
        const [x0, x1] = [xs[i], xs[i + 1]];
        const big = x0 < 50 && x1 > 50 ? 0 : 0;
        paths.push(`M ${x0},${50 - y(x0)} A 40,40 0 ${big} 1 ${x1},${50 - y(x1)} L ${x1},${50 + y(x1)} A 40,40 0 0 1 ${x0},${50 + y(x0)} Z`);
      }
    }
  } else {
    const [x, y, w, h] = shape === 'square' ? [15, 15, 70, 70] : [6, 25, 88, 50];
    if (cut === 'diag' && (n === 2 || n === 4)) {
      const [a, b, c, d] = [`${x},${y}`, `${x + w},${y}`, `${x + w},${y + h}`, `${x},${y + h}`];
      const m = `${x + w / 2},${y + h / 2}`;
      if (n === 2) paths.push(`M ${a} L ${b} L ${d} Z`, `M ${b} L ${c} L ${d} Z`);
      else paths.push(`M ${a} L ${b} L ${m} Z`, `M ${b} L ${c} L ${m} Z`, `M ${c} L ${d} L ${m} Z`, `M ${d} L ${a} L ${m} Z`);
    } else if (cut === 'grid' && n % 2 === 0 && n >= 4) {
      const cols = n / 2;
      for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
        const [cx, cy, cw, ch] = [x + (w * c) / cols, y + (h * r) / 2, w / cols, h / 2];
        paths.push(`M ${cx},${cy} h ${cw} v ${ch} h ${-cw} Z`);
      }
    } else {
      const weights = equal ? Array.from({ length: n }, () => 1 / n) : UNEQUAL[n] ?? Array.from({ length: n }, () => 1 / n);
      let at = 0;
      for (const wt of weights) {
        if (cut === 'h') paths.push(`M ${x},${y + h * at} h ${w} v ${h * wt} h ${-w} Z`);
        else paths.push(`M ${x + w * at},${y} h ${w * wt} v ${h} h ${-w * wt} Z`);
        at += wt;
      }
    }
  }
  return (
    <svg viewBox="-4 -4 108 108" width={size} height={size} role="img" aria-label={`${shape} in ${n} parts`}>
      {paths.map((d, i) => (
        <path key={i} d={d} fill={on(i)} {...st} />
      ))}
    </svg>
  );
}
