import React from 'react';
import { VisualShapeConfig } from '../types/assessment';

interface ShapeRendererProps {
  shape: VisualShapeConfig;
  sizeOverride?: number; // px
  showCorners?: boolean;
  showSides?: boolean;
  activeCornerIndex?: number;
  activeSideIndex?: number;
  className?: string;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  shape,
  sizeOverride,
  showCorners = shape.highlightCorners,
  showSides = shape.highlightSides,
  activeCornerIndex,
  activeSideIndex,
  className = '',
}) => {
  let baseDimension = 140;
  if (shape.size === 'small') baseDimension = 90;
  if (shape.size === 'large') baseDimension = 190;
  if (sizeOverride) baseDimension = sizeOverride;

  const color = shape.color || '#3b82f6';
  const rotation = shape.rotation || 0;
  const viewBoxSize = 200;
  const center = viewBoxSize / 2;

  const coordDimension = shape.size === 'small' ? 105 : shape.size === 'large' ? 160 : 135;

  let pathD = '';
  const corners: { x: number; y: number }[] = [];
  const sides: { d: string }[] = [];

  switch (shape.type) {
    case 'cube': {
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-md"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <polygon
              points="100,45 155,75 100,105 45,75"
              fill={color}
              filter="brightness(1.15)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <polygon
              points="45,75 100,105 100,165 45,135"
              fill={color}
              filter="brightness(0.9)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <polygon
              points="100,105 155,75 155,135 100,165"
              fill={color}
              filter="brightness(0.75)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            {showCorners && (
              <>
                {[[100, 45], [155, 75], [100, 105], [45, 75], [45, 135], [100, 165], [155, 135]].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="6" fill="#fbbf24" stroke="#0f172a" strokeWidth="2" />
                ))}
              </>
            )}
          </svg>
        </div>
      );
    }
    case 'sphere': {
      const gradId = `sphere-grad-${shape.id.replace(/[^a-zA-Z0-9]/g, '')}`;
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-md"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <defs>
              <radialGradient id={gradId} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="30%" stopColor={color} />
                <stop offset="90%" stopColor="#0f172a" stopOpacity="0.75" />
              </radialGradient>
            </defs>
            <circle
              cx={center}
              cy={center}
              r={62}
              fill={`url(#${gradId})`}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      );
    }
    case 'cylinder': {
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-md"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <path
              d="M 52 70 L 52 135 A 48 20 0 0 0 148 135 L 148 70 Z"
              fill={color}
              filter="brightness(0.9)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <ellipse cx="100" cy="135" rx="48" ry="18" fill="none" stroke="#0f172a" strokeWidth="2" />
            <ellipse
              cx="100"
              cy="70"
              rx="48"
              ry="18"
              fill={color}
              filter="brightness(1.15)"
              stroke="#0f172a"
              strokeWidth="3"
            />
          </svg>
        </div>
      );
    }
    case 'cone': {
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-md"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <path
              d="M 100 45 L 48 140 A 52 18 0 0 0 152 140 Z"
              fill={color}
              filter="brightness(0.9)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <ellipse cx="100" cy="140" rx="52" ry="16" fill={color} filter="brightness(0.8)" stroke="#0f172a" strokeWidth="2" />
            <circle cx="100" cy="45" r="4.5" fill="#fbbf24" stroke="#0f172a" strokeWidth="2" />
          </svg>
        </div>
      );
    }
    case 'rectangular_prism': {
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-md"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <polygon
              points="100,38 165,65 100,92 35,65"
              fill={color}
              filter="brightness(1.18)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <polygon
              points="35,65 100,92 100,165 35,138"
              fill={color}
              filter="brightness(0.9)"
              stroke="#0f172a"
              strokeWidth="3"
            />
            <polygon
              points="100,92 165,65 165,138 100,165"
              fill={color}
              filter="brightness(0.75)"
              stroke="#0f172a"
              strokeWidth="3"
            />
          </svg>
        </div>
      );
    }
    case 'circle': {
      const r = coordDimension * 0.44;
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-sm"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <circle
              cx={center}
              cy={center}
              r={r}
              fill={color}
              stroke={showSides ? '#0f172a' : 'rgba(0,0,0,0.15)'}
              strokeWidth={showSides ? 6 : 3}
            />
          </svg>
        </div>
      );
    }
    case 'square': {
      const s = coordDimension * 0.78;
      const half = s / 2;
      const x1 = center - half;
      const y1 = center - half;
      const x2 = center + half;
      const y2 = center + half;
      corners.push({ x: x1, y: y1 });
      corners.push({ x: x2, y: y1 });
      corners.push({ x: x2, y: y2 });
      corners.push({ x: x1, y: y2 });
      pathD = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
      sides.push({ d: `M ${x1} ${y1} L ${x2} ${y1}` });
      sides.push({ d: `M ${x2} ${y1} L ${x2} ${y2}` });
      sides.push({ d: `M ${x2} ${y2} L ${x1} ${y2}` });
      sides.push({ d: `M ${x1} ${y2} L ${x1} ${y1}` });
      break;
    }
    case 'rectangle': {
      const ratio = shape.customRatio || 1.8;
      const w = Math.min(170, coordDimension * 0.95);
      const h = Math.max(38, Math.min(110, w / ratio));
      const halfW = w / 2;
      const halfH = h / 2;
      const x1 = center - halfW;
      const y1 = center - halfH;
      const x2 = center + halfW;
      const y2 = center + halfH;
      corners.push({ x: x1, y: y1 });
      corners.push({ x: x2, y: y1 });
      corners.push({ x: x2, y: y2 });
      corners.push({ x: x1, y: y2 });
      pathD = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${x1} ${y2} Z`;
      sides.push({ d: `M ${x1} ${y1} L ${x2} ${y1}` });
      sides.push({ d: `M ${x2} ${y1} L ${x2} ${y2}` });
      sides.push({ d: `M ${x2} ${y2} L ${x1} ${y2}` });
      sides.push({ d: `M ${x1} ${y2} L ${x1} ${y1}` });
      break;
    }
    case 'triangle': {
      const triType = shape.triangleType || (shape.isUnusual ? 'scalene' : 'equilateral');
      const s = baseDimension * 0.82;
      if (triType === 'right') {
        const x1 = center - s * 0.45;
        const y1 = center - s * 0.45;
        const x2 = center - s * 0.45;
        const y2 = center + s * 0.45;
        const x3 = center + s * 0.45;
        const y3 = center + s * 0.45;
        corners.push({ x: x1, y: y1 });
        corners.push({ x: x2, y: y2 });
        corners.push({ x: x3, y: y3 });
        pathD = `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
        sides.push({ d: `M ${x1} ${y1} L ${x2} ${y2}` });
        sides.push({ d: `M ${x2} ${y2} L ${x3} ${y3}` });
        sides.push({ d: `M ${x3} ${y3} L ${x1} ${y1}` });
      } else if (triType === 'scalene' || shape.isUnusual) {
        const x1 = center - s * 0.48;
        const y1 = center + s * 0.38;
        const x2 = center - s * 0.15;
        const y2 = center - s * 0.48;
        const x3 = center + s * 0.52;
        const y3 = center + s * 0.22;
        corners.push({ x: x1, y: y1 });
        corners.push({ x: x2, y: y2 });
        corners.push({ x: x3, y: y3 });
        pathD = `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
        sides.push({ d: `M ${x1} ${y1} L ${x2} ${y2}` });
        sides.push({ d: `M ${x2} ${y2} L ${x3} ${y3}` });
        sides.push({ d: `M ${x3} ${y3} L ${x1} ${y1}` });
      } else {
        const h = s * (Math.sqrt(3) / 2);
        const p1 = { x: center, y: center - h * 0.58 };
        const p2 = { x: center - s / 2, y: center + h * 0.42 };
        const p3 = { x: center + s / 2, y: center + h * 0.42 };
        corners.push(p1);
        corners.push(p2);
        corners.push(p3);
        pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`;
        sides.push({ d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}` });
        sides.push({ d: `M ${p2.x} ${p2.y} L ${p3.x} ${p3.y}` });
        sides.push({ d: `M ${p3.x} ${p3.y} L ${p1.x} ${p1.y}` });
      }
      break;
    }
    case 'hexagon': {
      const hexPoints: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const rad = ((i * 60 - 30) * Math.PI) / 180;
        const px = center + 72 * Math.cos(rad);
        const py = center + 72 * Math.sin(rad);
        corners.push({ x: px, y: py });
        hexPoints.push({ x: px, y: py });
      }
      pathD = `M ${hexPoints[0].x} ${hexPoints[0].y} ` + hexPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z';
      for (let i = 0; i < 6; i++) {
        const next = hexPoints[(i + 1) % 6];
        sides.push({ d: `M ${hexPoints[i].x} ${hexPoints[i].y} L ${next.x} ${next.y}` });
      }
      break;
    }
    case 'trapezoid': {
      const topHalf = 44;
      const bottomHalf = 78;
      const yTop = center - 38;
      const yBottom = center + 38;
      const pts = [
        { x: center - topHalf, y: yTop },
        { x: center + topHalf, y: yTop },
        { x: center + bottomHalf, y: yBottom },
        { x: center - bottomHalf, y: yBottom },
      ];
      pts.forEach((p) => corners.push(p));
      pathD = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y} L ${pts[3].x} ${pts[3].y} Z`;
      for (let i = 0; i < 4; i++) {
        const next = pts[(i + 1) % 4];
        sides.push({ d: `M ${pts[i].x} ${pts[i].y} L ${next.x} ${next.y}` });
      }
      break;
    }
    case 'rhombus': {
      const wHalf = 60;
      const hHalf = 74;
      const pts = [
        { x: center, y: center - hHalf },
        { x: center + wHalf, y: center },
        { x: center, y: center + hHalf },
        { x: center - wHalf, y: center },
      ];
      pts.forEach((p) => corners.push(p));
      pathD = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y} L ${pts[3].x} ${pts[3].y} Z`;
      for (let i = 0; i < 4; i++) {
        const next = pts[(i + 1) % 4];
        sides.push({ d: `M ${pts[i].x} ${pts[i].y} L ${next.x} ${next.y}` });
      }
      break;
    }
    case 'pentagon': {
      const pentPoints: { x: number; y: number }[] = [];
      for (let i = 0; i < 5; i++) {
        const rad = ((-90 + i * 72) * Math.PI) / 180;
        const px = center + 74 * Math.cos(rad);
        const py = center + 74 * Math.sin(rad);
        corners.push({ x: px, y: py });
        pentPoints.push({ x: px, y: py });
      }
      pathD = `M ${pentPoints[0].x} ${pentPoints[0].y} ` + pentPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') + ' Z';
      for (let i = 0; i < 5; i++) {
        const next = pentPoints[(i + 1) % 5];
        sides.push({ d: `M ${pentPoints[i].x} ${pentPoints[i].y} L ${next.x} ${next.y}` });
      }
      break;
    }
    case 'open_shape': {
      const pTopLeft = { x: center - 20, y: center - 50 };
      const pTopRight = { x: center + 20, y: center - 50 };
      const pBottomLeft = { x: center - 68, y: center + 46 };
      const pBottomRight = { x: center + 68, y: center + 46 };
      corners.push(pTopRight);
      corners.push(pBottomRight);
      corners.push(pBottomLeft);
      corners.push(pTopLeft);
      pathD = `M ${pTopRight.x} ${pTopRight.y} L ${pBottomRight.x} ${pBottomRight.y} L ${pBottomLeft.x} ${pBottomLeft.y} L ${pTopLeft.x} ${pTopLeft.y}`;
      sides.push({ d: `M ${pTopRight.x} ${pTopRight.y} L ${pBottomRight.x} ${pBottomRight.y}` });
      sides.push({ d: `M ${pBottomRight.x} ${pBottomRight.y} L ${pBottomLeft.x} ${pBottomLeft.y}` });
      sides.push({ d: `M ${pBottomLeft.x} ${pBottomLeft.y} L ${pTopLeft.x} ${pTopLeft.y}` });
      break;
    }
    case 'partitioned_circle': {
      const r = 74;
      const partType = shape.partitionType || 'halves_equal';
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-sm overflow-visible"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <circle cx={center} cy={center} r={r} fill={color} stroke="#0f172a" strokeWidth={3} />
            {partType === 'halves_equal' && (
              <line x1={center} y1={center - r} x2={center} y2={center + r} stroke="#ffffff" strokeWidth={5} strokeDasharray="4 2" />
            )}
            {partType === 'halves_unequal' && (
              <line x1={center + 38} y1={center - Math.sqrt(r * r - 38 * 38)} x2={center + 38} y2={center + Math.sqrt(r * r - 38 * 38)} stroke="#ffffff" strokeWidth={5} strokeDasharray="4 2" />
            )}
            {partType === 'fourths_equal' && (
              <>
                <line x1={center} y1={center - r} x2={center} y2={center + r} stroke="#ffffff" strokeWidth={4} strokeDasharray="4 2" />
                <line x1={center - r} y1={center} x2={center + r} y2={center} stroke="#ffffff" strokeWidth={4} strokeDasharray="4 2" />
              </>
            )}
          </svg>
        </div>
      );
    }
    case 'partitioned_rectangle': {
      const w = 150;
      const h = 88;
      const x1 = center - w / 2;
      const y1 = center - h / 2;
      const partType = shape.partitionType || 'halves_equal';
      return (
        <div
          className={`inline-flex items-center justify-center transition-transform ${className}`}
          style={{ width: baseDimension, height: baseDimension }}
        >
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-full h-full drop-shadow-sm overflow-visible"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <rect x={x1} y={y1} width={w} height={h} rx={6} fill={color} stroke="#0f172a" strokeWidth={3} />
            {partType === 'halves_equal' && (
              <line x1={center} y1={y1} x2={center} y2={y1 + h} stroke="#ffffff" strokeWidth={5} strokeDasharray="5 3" />
            )}
            {partType === 'halves_unequal' && (
              <line x1={x1 + 36} y1={y1} x2={x1 + 36} y2={y1 + h} stroke="#ffffff" strokeWidth={5} strokeDasharray="5 3" />
            )}
            {partType === 'fourths_equal' && (
              <>
                <line x1={x1 + w * 0.25} y1={y1} x2={x1 + w * 0.25} y2={y1 + h} stroke="#ffffff" strokeWidth={4} strokeDasharray="4 2" />
                <line x1={x1 + w * 0.5} y1={y1} x2={x1 + w * 0.5} y2={y1 + h} stroke="#ffffff" strokeWidth={4} strokeDasharray="4 2" />
                <line x1={x1 + w * 0.75} y1={y1} x2={x1 + w * 0.75} y2={y1 + h} stroke="#ffffff" strokeWidth={4} strokeDasharray="4 2" />
              </>
            )}
          </svg>
        </div>
      );
    }
  }

  return (
    <div
      className={`inline-flex items-center justify-center transition-transform ${className}`}
      style={{ width: baseDimension, height: baseDimension }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="w-full h-full drop-shadow-sm overflow-visible"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <path
          d={pathD}
          fill={shape.type === 'open_shape' ? 'none' : color}
          stroke={shape.type === 'open_shape' ? color : 'rgba(0,0,0,0.18)'}
          strokeWidth={shape.type === 'open_shape' ? 6 : 3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {shape.type === 'open_shape' && (
          <g>
            <circle cx={center} cy={center - 50} r={6} fill="#ef4444" />
            <text
              x={center}
              y={center - 60}
              textAnchor="middle"
              className="text-[10px] font-bold fill-rose-600 uppercase"
              style={{ fontSize: 11, fontWeight: 700 }}
            >
              Open Gap
            </text>
          </g>
        )}
        {showSides &&
          sides.map((side, idx) => {
            const isActive = activeSideIndex === idx;
            return (
              <path
                key={`side-${idx}`}
                d={side.d}
                fill="none"
                stroke={isActive ? '#ef4444' : '#0f172a'}
                strokeWidth={isActive ? '8' : '5'}
                strokeLinecap="round"
                className={isActive ? 'animate-pulse' : ''}
              />
            );
          })}
        {showCorners &&
          corners.map((corner, idx) => {
            const isActive = activeCornerIndex === idx;
            return (
              <g key={`corner-${idx}`}>
                <circle
                  cx={corner.x}
                  cy={corner.y}
                  r={isActive ? 12 : 9}
                  fill={isActive ? '#ef4444' : '#fbbf24'}
                  stroke="#1e293b"
                  strokeWidth="3"
                  className={isActive ? 'animate-bounce' : ''}
                />
                <circle cx={corner.x} cy={corner.y} r={4} fill="#ffffff" />
              </g>
            );
          })}
      </svg>
    </div>
  );
};
