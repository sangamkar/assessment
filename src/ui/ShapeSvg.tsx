import React, { useId } from 'react';
import type { CompositePreset, ShapeSpec } from '../content/types';

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
    default:
      return null;
  }
}

const SOLIDS = new Set(['cube', 'rect-prism', 'sphere', 'cylinder', 'cone']);

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
