import { useRef, useState, type ReactNode } from "react";

/** Drag follows the finger; a short touch still selects for tap-to-place. */
export function DragPiece({
  children,
  selected,
  highlighted,
  label,
  onSelect,
  onDrop,
}: {
  children: ReactNode;
  selected: boolean;
  highlighted?: boolean;
  label: string;
  onSelect(): void;
  onDrop(x: number, y: number): void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  return (
    <>
      <button
        aria-label={label}
        aria-pressed={selected}
        className={`drag-piece ${selected ? "selected" : ""} ${highlighted ? "hint-piece" : ""}`}
        onPointerDown={(e) => {
          start.current = { x: e.clientX, y: e.clientY };
          moved.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
          onSelect();
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          if (
            Math.hypot(
              e.clientX - start.current.x,
              e.clientY - start.current.y,
            ) > 7
          )
            moved.current = true;
          if (moved.current) setPoint({ x: e.clientX, y: e.clientY });
        }}
        onPointerUp={(e) => {
          if (start.current && moved.current) onDrop(e.clientX, e.clientY);
          start.current = null;
          setPoint(null);
        }}
        onPointerCancel={() => {
          start.current = null;
          moved.current = false;
          setPoint(null);
        }}
        onClick={(e) => {
          if (e.detail === 0) onSelect();
        }}
      >
        {children}
      </button>
      {point && (
        <div
          aria-hidden="true"
          className="piece-under-finger"
          style={{ left: point.x, top: point.y }}
        >
          {children}
        </div>
      )}
    </>
  );
}

/** Magnetic selection only inside the play board and near a target. */
export function dropTarget(
  x: number,
  y: number,
  boardSelector: string,
  targetSelector: string,
): string | null {
  const board = document.querySelector(boardSelector);
  if (!board) return null;
  const bounds = board.getBoundingClientRect();
  if (
    x < bounds.left - 12 ||
    x > bounds.right + 12 ||
    y < bounds.top - 12 ||
    y > bounds.bottom + 12
  )
    return null;
  let closest: string | null = null,
    distance = 42;
  board.querySelectorAll<HTMLElement>(targetSelector).forEach((el) => {
    const r = el.getBoundingClientRect(),
      d = Math.hypot(x - r.left - r.width / 2, y - r.top - r.height / 2);
    if (d < distance) {
      distance = d;
      closest = el.dataset.target ?? null;
    }
  });
  return closest;
}
