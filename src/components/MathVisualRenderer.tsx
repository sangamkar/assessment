import React from 'react';

interface MathVisualRendererProps {
  visual: {
    type: 'ten_frame' | 'counter_dots' | 'measurement_compare' | 'clock' | 'bar_graph' | 'balance_scale' | 'tally_chart' | 'paper_clips' | 'height_compare';
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

    case 'counter_dots': {
      const count = visual.details?.count || 5;
      const color = visual.details?.color || 'blue';
      
      const bgColor = color === 'red' ? 'bg-red-500' : 
                      color === 'green' ? 'bg-green-500' : 
                      color === 'yellow' ? 'bg-yellow-400' : 'bg-blue-500';
                      
      const borderColor = color === 'red' ? 'border-red-600' : 
                          color === 'green' ? 'border-green-600' : 
                          color === 'yellow' ? 'border-yellow-500' : 'border-blue-600';

      return (
        <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Count the dots
          </div>
          <div className="flex flex-wrap justify-center max-w-[280px] gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full ${bgColor} border-2 ${borderColor} shadow-sm animate-scale-in`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      );
    }

    case 'measurement_compare': {
      return (
        <div className="flex flex-col items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs w-full max-w-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Length Comparison
          </div>
          <div className="w-full flex flex-col gap-6 relative px-2 py-4">
            {/* Alignment dashed line */}
            <div className="absolute left-[70px] top-0 bottom-0 border-l-2 border-dashed border-slate-300" />
            
            {/* Long Yellow Pencil */}
            <div className="flex items-center gap-4 relative z-10 w-full">
              <span className="w-12 text-right text-sm font-bold text-slate-600">Pencil</span>
              <svg viewBox="0 0 240 30" className="h-10 w-full drop-shadow-sm">
                 {/* Eraser */}
                 <rect x="0" y="5" width="20" height="20" rx="3" fill="#f472b6" stroke="#334155" strokeWidth="2" />
                 {/* Metal */}
                 <rect x="18" y="5" width="10" height="20" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
                 {/* Body */}
                 <rect x="28" y="5" width="160" height="20" fill="#fbbf24" stroke="#334155" strokeWidth="2" />
                 <line x1="28" y1="12" x2="188" y2="12" stroke="#d97706" strokeWidth="1" opacity="0.5" />
                 <line x1="28" y1="18" x2="188" y2="18" stroke="#d97706" strokeWidth="1" opacity="0.5" />
                 {/* Wood Tip */}
                 <polygon points="188,5 220,15 188,25" fill="#fef3c7" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
                 {/* Graphite */}
                 <polygon points="210,12 220,15 210,18" fill="#334155" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Short Red Crayon */}
            <div className="flex items-center gap-4 relative z-10 w-full">
              <span className="w-12 text-right text-sm font-bold text-slate-600">Crayon</span>
              <svg viewBox="0 0 240 30" className="h-10 w-full drop-shadow-sm">
                 {/* Flat end */}
                 <rect x="0" y="5" width="8" height="20" rx="2" fill="#e11d48" stroke="#334155" strokeWidth="2" />
                 {/* Wrapper */}
                 <rect x="6" y="5" width="80" height="20" fill="#f43f5e" stroke="#334155" strokeWidth="2" />
                 {/* Wrapper details */}
                 <path d="M 12 5 Q 16 15 12 25 M 78 5 Q 74 15 78 25" fill="none" stroke="#be123c" strokeWidth="2" />
                 <text x="45" y="19" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#881337" opacity="0.6">CRAYON</text>
                 {/* Tip */}
                 <path d="M 86 6 L 100 11 L 100 19 L 86 24 Z" fill="#e11d48" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    case 'height_compare': {
      return (
        <div className="flex flex-col items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs w-full max-w-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Height Comparison
          </div>
          <div className="w-full relative px-6 pt-4 pb-2 flex justify-around items-end h-56 border-b-4 border-slate-300">
            {/* Tall Pine Tree */}
            <div className="flex flex-col items-center gap-2 z-10">
              <svg viewBox="0 0 100 160" className="w-20 h-40 drop-shadow-md">
                {/* Trunk */}
                <rect x="42" y="120" width="16" height="40" fill="#78350f" rx="2" />
                {/* Leaves */}
                <path d="M 50 10 L 90 70 L 65 70 L 100 130 L 0 130 L 35 70 L 10 70 Z" fill="#15803d" stroke="#166534" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold text-slate-600">Pine Tree</span>
            </div>

            {/* Small Flower */}
            <div className="flex flex-col items-center gap-2 z-10">
              <svg viewBox="0 0 100 160" className="w-20 h-40 drop-shadow-md">
                {/* Stem */}
                <rect x="47" y="100" width="6" height="60" fill="#22c55e" rx="3" />
                {/* Leaves */}
                <path d="M 47 130 Q 30 110 20 120 Q 30 140 47 135" fill="#4ade80" />
                <path d="M 53 140 Q 70 120 80 130 Q 70 150 53 145" fill="#4ade80" />
                {/* Petals */}
                <circle cx="50" cy="85" r="10" fill="#fbbf24" />
                <circle cx="35" cy="85" r="12" fill="#ec4899" />
                <circle cx="65" cy="85" r="12" fill="#ec4899" />
                <circle cx="50" cy="70" r="12" fill="#ec4899" />
                <circle cx="50" cy="100" r="12" fill="#ec4899" />
                <circle cx="38" cy="73" r="12" fill="#ec4899" />
                <circle cx="62" cy="73" r="12" fill="#ec4899" />
                <circle cx="38" cy="97" r="12" fill="#ec4899" />
                <circle cx="62" cy="97" r="12" fill="#ec4899" />
                {/* Center again to overlap correctly */}
                <circle cx="50" cy="85" r="8" fill="#f59e0b" />
              </svg>
              <span className="text-xs font-bold text-slate-600">Sprout</span>
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
      const hour = visual.details?.hour || 3;
      const minute = visual.details?.minute || 0;
      
      const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
      const minuteAngle = minute * 6;

      // We start pointing up (12) which is angle 0 in clock terms, but in SVG 12 is (70, 10).
      // A standard math rotation from the center (70, 70).
      
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
            
            {/* Hands */}
            <g transform={`rotate(${hourAngle}, 70, 70)`}>
              <line x1="70" y1="70" x2="70" y2="45" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g transform={`rotate(${minuteAngle}, 70, 70)`}>
              <line x1="70" y1="70" x2="70" y2="30" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            
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

    case 'paper_clips': {
      const count = visual.details?.count || 6;
      const objectName = visual.details?.objectName || 'Marker';
      
      return (
        <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs w-full max-w-2xl">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Measure with Paper Clips
          </div>
          <div className="w-full flex flex-col gap-4 relative px-4 py-4 items-center overflow-x-auto">
            {/* The Object */}
            <div className="flex items-center gap-4 relative z-10">
              <span className="w-16 text-right text-base font-bold text-slate-600">{objectName}</span>
              <div 
                className="h-12 bg-indigo-500 rounded-lg border-2 border-indigo-700 shadow-sm flex items-center justify-center relative"
                style={{ width: `${count * 3.5}rem` }}
              >
                 <div className="absolute left-1.5 w-4 h-7 bg-indigo-300 rounded-sm" />
                 <div className="absolute right-0 w-10 h-10 bg-indigo-400 rounded-r-md border-l-2 border-indigo-700" />
                 <span className="text-white font-bold tracking-widest opacity-50 uppercase text-sm">MARKER</span>
              </div>
            </div>
            {/* The Paper Clips */}
            <div className="flex items-center gap-4 relative z-10">
               <span className="w-16 text-right text-base font-bold text-slate-600">Clips</span>
               <div className="flex">
                 {Array.from({ length: count }).map((_, i) => (
                   <div key={i} className="flex justify-center items-center" style={{ width: '3.5rem' }}>
                      {/* Horizontal paper clip, tight viewBox so they touch end-to-end */}
                      <svg viewBox="0 2 37 16" className="w-full h-8 text-slate-400 drop-shadow-sm">
                        <path 
                          d="M 10 15 L 30 15 A 5 5 0 0 0 30 5 L 5 5 A 3 3 0 0 0 5 11 L 25 11 A 1 1 0 0 0 25 9 L 10 9" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                        />
                      </svg>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
