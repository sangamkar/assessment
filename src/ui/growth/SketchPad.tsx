import React, { useRef, useState } from "react";

/** Small, device-local sketch. A text reflection provides a keyboard alternative. */
export function SketchPad({
  drawing,
  onChange,
}: {
  drawing: string[];
  onChange: (paths: string[]) => void;
}) {
  const [stroke, setStroke] = useState("");
  const current = useRef("");
  const pointer = useRef<number | null>(null);
  const point = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return `${Math.max(0, Math.min(600, ((e.clientX - box.left) * 600) / box.width)).toFixed(1)},${Math.max(0, Math.min(300, ((e.clientY - box.top) * 300) / box.height)).toFixed(1)}`;
  };
  const finish = () => {
    if (current.current) onChange([...drawing, current.current]);
    current.current = "";
    pointer.current = null;
    setStroke("");
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-600">
          Sketch an idea · optional
        </p>
        <button
          type="button"
          disabled={!drawing.length}
          onClick={() => onChange(drawing.slice(0, -1))}
          className="rounded-xl bg-teal-100 px-3 py-2 text-sm font-bold text-teal-800 disabled:opacity-40"
        >
          Undo last line
        </button>
      </div>
      <svg
        role="img"
        aria-label="Drawing area. Use a finger or pointer to sketch, or describe your idea in the text box below."
        viewBox="0 0 600 300"
        className="w-full touch-none rounded-2xl border-2 border-dashed border-teal-200 bg-white"
        onPointerDown={(e) => {
          if (drawing.length >= 40) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          pointer.current = e.pointerId;
          current.current = `M${point(e)} L${point(e)}`;
          setStroke(current.current);
        }}
        onPointerMove={(e) => {
          if (pointer.current !== e.pointerId || current.current.length > 5900)
            return;
          current.current += ` L${point(e)}`;
          setStroke(current.current);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={() => {
          if (pointer.current !== null) finish();
        }}
      >
        {[...drawing, ...(stroke ? [stroke] : [])].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#136f78"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {drawing.length >= 40 && (
        <p className="mt-2 text-sm text-slate-500">
          Your sketch is full. Undo a line to make room.
        </p>
      )}
    </div>
  );
}
