import React from 'react';

interface MathVisualRendererProps {
  visual: {
    type: 'ten_frame' | 'counter_dots' | 'measurement_compare' | 'clock' | 'bar_graph' | 'balance_scale' | 'tally_chart';
    details?: any;
  };
}

export const MathVisualRenderer: React.FC<MathVisualRendererProps> = ({ visual }) => {
  switch (visual.type) {
    case 'ten_frame': {
      const fullFrame = visual.details?.fullFrame || 10;
      const extraDots = visual.details?.extraDots || 0;
      const filled = visual.details?.filled ?? (visual.details?.fullFrame ? 10 : 7);

      return (
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Ten-Frame Representation
          </div>
          {/* Main 2x5 Grid */}
          <div className="grid grid-cols-5 grid-rows-2 gap-1.5 p-2 bg-slate-100 rounded-xl border-2 border-slate-300">
            {Array.from({ length: 10 }).map((_, i) => {
              const isFilled = i < (filled ?? 10);
              return (
                <div
                  key={i}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-white border border-slate-300 flex items-center justify-center"
                >
                  {isFilled && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 border border-blue-600 shadow-xs animate-scale-in" />
                  )}
                </div>
              );
            })}
          </div>
          {extraDots > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-600">Extra Ones:</span>
              <div className="flex gap-1.5">
                {Array.from({ length: extraDots }).map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-emerald-500 border border-emerald-600 shadow-xs"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case 'measurement_compare': {
      return (
        <div className="flex flex-col items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs w-full max-w-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Length Comparison
          </div>
          <div className="w-full flex flex-col gap-3">
            {/* Long Yellow Pencil */}
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs font-bold text-slate-600">Pencil:</span>
              <div className="flex-1 bg-amber-100 rounded-xl p-1.5 flex items-center">
                <div className="h-6 w-full max-w-[240px] bg-amber-400 rounded-lg border-2 border-amber-500 flex items-center justify-between px-2 shadow-xs">
                  <span className="text-[10px] font-black text-amber-800 uppercase">Longer</span>
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                </div>
              </div>
            </div>
            {/* Short Red Crayon */}
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs font-bold text-slate-600">Crayon:</span>
              <div className="flex-1 bg-rose-100 rounded-xl p-1.5 flex items-center">
                <div className="h-6 w-[95px] bg-rose-500 rounded-lg border-2 border-rose-600 flex items-center justify-between px-2 shadow-xs">
                  <span className="text-[10px] font-black text-white uppercase">Shorter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'balance_scale': {
      return (
        <div className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Balance Scale
          </div>
          <svg viewBox="0 0 240 140" className="w-60 h-36">
            {/* Base */}
            <polygon points="120,130 95,138 145,138" fill="#475569" />
            <line x1="120" y1="50" x2="120" y2="130" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <circle cx="120" cy="50" r="7" fill="#0f172a" />
            {/* Tilted Beam (Left side heavy / pushed down) */}
            <line x1="35" y1="75" x2="205" y2="25" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
            {/* Left Pan (Heavy Bowling Ball) */}
            <line x1="45" y1="75" x2="45" y2="95" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="45" cy="98" rx="30" ry="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <circle cx="45" cy="85" r="14" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <text x="45" y="120" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
              Bowling Ball (Down)
            </text>
            {/* Right Pan (Light Feather) */}
            <line x1="195" y1="25" x2="195" y2="45" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="195" cy="48" rx="30" ry="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <path d="M 190,36 Q 195,30 202,38" stroke="#38bdf8" strokeWidth="3" fill="none" />
            <text x="195" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0369a1">
              Feather (Up)
            </text>
          </svg>
        </div>
      );
    }

    case 'bar_graph': {
      const categories: Array<{ name: string; count: number; color?: string }> = visual.details?.categories || [
        { name: 'Dogs', count: 5, color: '#3b82f6' },
        { name: 'Cats', count: 3, color: '#10b981' },
        { name: 'Fish', count: 2, color: '#f59e0b' },
      ];
      const maxVal = Math.max(...categories.map((c) => c.count || 1), 5);
      const yTicks = Array.from({ length: maxVal + 1 }, (_, i) => maxVal - i);

      return (
        <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs w-full max-w-md">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
            📊 {visual.details?.title || 'Class Survey Bar Graph'}
          </div>

          <div className="w-full flex items-stretch gap-2 pt-2 px-2">
            {/* Y-Axis scale numbers */}
            <div className="flex flex-col justify-between items-end pr-2 text-[10px] font-extrabold text-slate-400 select-none pb-7 pt-1">
              {yTicks.map((val) => (
                <span key={val} className="leading-none">{val}</span>
              ))}
            </div>

            {/* Graph area with horizontal guide lines and bars */}
            <div className="flex-1 relative flex items-end justify-around h-44 border-l-2 border-b-2 border-slate-400 pb-2 px-3">
              {/* Horizontal guide lines */}
              <div className="absolute inset-0 pb-2 flex flex-col justify-between pointer-events-none">
                {yTicks.map((val) => (
                  <div key={val} className="w-full border-t border-slate-100/90" />
                ))}
              </div>

              {/* Bars */}
              {categories.map((cat, i) => {
                const heightPercent = Math.max(8, Math.round((cat.count / maxVal) * 100));
                return (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-1.5 flex-1 max-w-[76px] h-full justify-end">
                    <span className="text-xs font-black text-slate-800 bg-white/90 px-1.5 py-0.5 rounded-md shadow-2xs border border-slate-200">
                      {cat.count}
                    </span>
                    <div
                      className="w-full rounded-t-xl transition-all duration-300 shadow-sm border-t-2 border-x-2 border-black/10 flex items-end justify-center"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: cat.color || '#3b82f6',
                        minHeight: '22px',
                      }}
                    />
                    <span className="text-[11px] font-bold text-slate-700 truncate w-full text-center mt-0.5">
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    case 'clock': {
      return (
        <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <svg viewBox="0 0 140 140" className="w-32 h-32 drop-shadow-sm">
            <circle cx="70" cy="70" r="60" fill="#f8fafc" stroke="#1e293b" strokeWidth="5" />
            <circle cx="70" cy="70" r="50" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
            {/* Clock numbers marks */}
            <text x="70" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">12</text>
            <text x="112" y="74" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">3</text>
            <text x="70" y="118" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">6</text>
            <text x="28" y="74" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">9</text>
            {/* Short Hour Hand pointing at 3 */}
            <line x1="70" y1="70" x2="98" y2="70" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
            {/* Long Minute Hand pointing at 12 */}
            <line x1="70" y1="70" x2="70" y2="35" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="70" cy="70" r="5" fill="#0f172a" />
          </svg>
          <span className="text-xs font-bold text-slate-700">Analog Clock</span>
        </div>
      );
    }

    case 'tally_chart': {
      return (
        <div className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            {visual.details?.title || 'Tally Mark Bundle'}
          </div>
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-center">
            <svg viewBox="0 0 120 70" className="w-32 h-20">
              <line x1="25" y1="15" x2="25" y2="55" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
              <line x1="45" y1="15" x2="45" y2="55" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
              <line x1="65" y1="15" x2="65" y2="55" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
              <line x1="85" y1="15" x2="85" y2="55" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
              <line x1="15" y1="50" x2="95" y2="20" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
