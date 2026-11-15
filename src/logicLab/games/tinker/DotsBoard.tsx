import { useEffect, useRef, useState } from "react";
import { edgesFor, edgeBetween, type DotsState } from "./dots";
import { TutorialHandOverlay } from "../../components/TutorialHandOverlay";
export function DotsBoard({
  state,
  hint,
  onLine,
}: {
  state: DotsState;
  hint?: string;
  onLine(id: string): void;
}) {
  const board = useRef<HTMLDivElement>(null),
    start = useRef<number | null>(null),
    moved = useRef(false);
  const [anchor, setAnchor] = useState<number | null>(null),
    [preview, setPreview] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (Object.keys(state.edges).length === 0) {
      setAnchor(null);
      setPreview(null);
      start.current = null;
    }
  }, [Object.keys(state.edges).length]);
  const size = state.level.size,
    locked =
      state.complete || (state.level.mode === "computer" && state.turn === 2),
    step = 4 / size;
  const point = (i: number) => ({
    x: (i % (size + 1)) * step,
    y: Math.floor(i / (size + 1)) * step,
  });
  const join = (a: number, b: number) => {
    const line = edgeBetween(size, a, b);
    if (line && !state.edges[line]) onLine(line);
    setAnchor(null);
  };
  const select = (i: number) => {
    if (anchor === null) setAnchor(i);
    else join(anchor, i);
  };
  const nearest = (x: number, y: number) => {
    const rect = board.current!.getBoundingClientRect();
    let found: number | null = null,
      distance = 36;
    for (let i = 0; i < (size + 1) ** 2; i++) {
      const p = point(i),
        d = Math.hypot(
          x - (rect.left + ((p.x + 0.4) / 4.8) * rect.width),
          y - (rect.top + ((p.y + 0.4) / 4.8) * rect.height),
        );
      if (d < distance) {
        distance = d;
        found = i;
      }
    }
    return found;
  };
  return (
    <div
      ref={board}
      className="dots-board"
      aria-label="Dots and Boxes board"
      style={{ aspectRatio: "1" }}
    >
      <svg viewBox="-0.4 -0.4 4.8 4.8" aria-hidden="true">
        {Object.entries(state.boxes).map(([key, player]) => {
          const [r, c] = key.split("-").map(Number);
          return (
            <g key={key}>
              <rect
                x={c * step + 0.08}
                y={r * step + 0.08}
                width={step - 0.16}
                height={step - 0.16}
                rx=".12"
                fill={player === 1 ? "#bfdbfe" : "#fed7aa"}
              />
              <text
                x={(c + 0.5) * step}
                y={(r + 0.5) * step + 0.13}
                fontSize=".4"
                textAnchor="middle"
                fill="#20304e"
              >
                {player}
              </text>
            </g>
          );
        })}
        {edgesFor(size).map((e) => {
          const x = e.col * step,
            y = e.row * step;
          return (
            <line
              key={e.id}
              x1={x}
              y1={y}
              x2={x + (e.vertical ? 0 : step)}
              y2={y + (e.vertical ? step : 0)}
              stroke={
                state.edges[e.id] === 1
                  ? "#2563eb"
                  : state.edges[e.id] === 2
                    ? "#ea580c"
                    : "#b9c6d9"
              }
              strokeWidth={state.edges[e.id] ? 0.09 : 0.025}
              strokeDasharray={state.edges[e.id] ? undefined : ".07 .06"}
            />
          );
        })}
        {preview && start.current !== null && (
          <line
            x1={point(start.current).x}
            y1={point(start.current).y}
            x2={preview.x}
            y2={preview.y}
            stroke={state.turn === 1 ? "#2563eb" : "#ea580c"}
            strokeWidth=".07"
            strokeDasharray=".08 .04"
          />
        )}
        {Array.from({ length: (size + 1) ** 2 }, (_, i) => {
          const p = point(i);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={anchor === i ? ".12" : ".07"}
              fill={anchor === i ? "#8b5cf6" : "#20304e"}
            />
          );
        })}
      </svg>
      {edgesFor(size).map((e) => (
        <button
          key={e.id}
          className={`line-target ${hint === e.id ? "hint-piece" : ""}`}
          style={{
            left: `${((e.col + (e.vertical ? 0 : 0.5)) * 100) / size / 1.2 + 100 / 12}%`,
            top: `${((e.row + (e.vertical ? 0.5 : 0)) * 100) / size / 1.2 + 100 / 12}%`,
          }}
          aria-label={`${e.vertical ? "Vertical" : "Horizontal"} line row ${e.row + 1} column ${e.col + 1}${state.edges[e.id] ? ", drawn" : ""}`}
          disabled={!!state.edges[e.id] || locked}
          onClick={() => {
            setAnchor(null);
            onLine(e.id);
          }}
        />
      ))}
      {Array.from({ length: (size + 1) ** 2 }, (_, i) => {
        const p = point(i);
        return (
          <button
            key={i}
            className="dot-target"
            aria-label={`Dot row ${Math.floor(i / (size + 1)) + 1} column ${(i % (size + 1)) + 1}`}
            aria-pressed={anchor === i}
            disabled={locked}
            style={{
              left: `${((p.x + 0.4) / 4.8) * 100}%`,
              top: `${((p.y + 0.4) / 4.8) * 100}%`,
            }}
            onPointerDown={(e) => {
              start.current = i;
              moved.current = false;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (start.current === null) return;
              const r = board.current!.getBoundingClientRect(),
                p = point(start.current);
              const x = ((e.clientX - r.left) / r.width) * 4.8 - 0.4,
                y = ((e.clientY - r.top) / r.height) * 4.8 - 0.4;
              if (Math.hypot(x - p.x, y - p.y) > 0.1) moved.current = true;
              if (moved.current) setPreview({ x, y });
            }}
            onPointerUp={(e) => {
              if (start.current === null) return;
              const origin = start.current,
                target = nearest(e.clientX, e.clientY);
              if (moved.current) {
                if (target !== null) join(origin, target);
              } else select(i);
              start.current = null;
              setPreview(null);
            }}
            onPointerCancel={() => {
              start.current = null;
              setPreview(null);
            }}
            onClick={(e) => {
              if (e.detail === 0) select(i);
            }}
          />
        );
      })}
      <TutorialHandOverlay
        visible={Object.keys(state.edges).length === 0}
        from={{ x: 100 / 12, y: 100 / 12 }}
        to={{ x: 100 / 12 + 100 / size / 1.2, y: 100 / 12 }}
      />
    </div>
  );
}
