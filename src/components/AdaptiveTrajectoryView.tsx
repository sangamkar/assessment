import React, { useState } from 'react';
import { AdaptiveProfile, DifficultyStepRecord } from '../types/assessment';
import { DIFFICULTY_LEVEL_INFOS } from '../utils/adaptiveEngine';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Compass,
} from 'lucide-react';

interface AdaptiveTrajectoryViewProps {
  adaptiveProfile?: AdaptiveProfile;
  studentName: string;
}

export const AdaptiveTrajectoryView: React.FC<AdaptiveTrajectoryViewProps> = ({
  adaptiveProfile,
  studentName,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  if (!adaptiveProfile || !adaptiveProfile.trajectory || adaptiveProfile.trajectory.length === 0) {
    return null;
  }

  const trajectory = adaptiveProfile.trajectory;
  const totalItems = trajectory.length;
  const selectedStep: DifficultyStepRecord | null =
    selectedPointIndex !== null && trajectory[selectedPointIndex]
      ? trajectory[selectedPointIndex]
      : trajectory[trajectory.length - 1] || null;

  const svgWidth = 800;
  const svgHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (totalItems <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (totalItems - 1)) * chartWidth;
  };

  const getY = (difficulty: number) => {
    const clamped = Math.max(1, Math.min(5, difficulty));
    return paddingTop + chartHeight - ((clamped - 1) / 4) * chartHeight;
  };

  const points = trajectory.map((step, idx) => ({
    x: getX(idx),
    y: getY(step.difficulty),
    ...step,
  }));

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const levels = [5, 4, 3, 2, 1];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Adaptive Difficulty Trajectory &amp; Calibration
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Computer-Adaptive Testing tracking {studentName}&apos;s Zone of Proximal Development.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <div className="text-xs font-bold text-indigo-900">
            ZPD: <span className="font-extrabold">{adaptiveProfile.zoneOfProximalDevelopment}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Peak Level Reached</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            Level {adaptiveProfile.highestDifficultyReached}
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {DIFFICULTY_LEVEL_INFOS[adaptiveProfile.highestDifficultyReached]?.shortTag}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Difficulty</div>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">
            {adaptiveProfile.averageDifficulty} <span className="text-xs font-medium text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Mean cognitive load</div>
        </div>

        <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Difficulty Promotions</span>
          </div>
          <div className="text-lg font-extrabold text-emerald-800 mt-0.5">
            {adaptiveProfile.totalPromotions} times
          </div>
          <div className="text-[11px] text-emerald-600/90 font-medium">Elevated after mastery</div>
        </div>

        <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>Scaffolded Resets</span>
          </div>
          <div className="text-lg font-extrabold text-amber-900 mt-0.5">
            {adaptiveProfile.totalScaffolds} times
          </div>
          <div className="text-[11px] text-amber-700/90 font-medium">Supported on errors</div>
        </div>
      </div>

      {/* Trajectory SVG */}
      <div className="relative mt-2 p-3 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 overflow-x-auto">
        <div className="min-w-[650px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
            {levels.map((lvl) => {
              const y = getY(lvl);
              return (
                <g key={lvl}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                  />
                  <text x={paddingLeft - 10} y={y + 3.5} textAnchor="end" fontSize="10" fontWeight="700" fill="#64748B">
                    L{lvl}
                  </text>
                  <text x={svgWidth - paddingRight + 8} y={y + 3.5} textAnchor="start" fontSize="9.5" fontWeight="600" fill="#94A3B8">
                    {DIFFICULTY_LEVEL_INFOS[lvl]?.shortTag}
                  </text>
                </g>
              );
            })}

            <path
              d={pathD}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-xs"
            />

            {points.map((p, idx) => {
              const isSelected = selectedPointIndex === idx;
              return (
                <g key={idx} onClick={() => setSelectedPointIndex(idx)} className="cursor-pointer group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 13 : 8}
                    fill={p.isCorrect ? '#10B981' : '#F43F5E'}
                    fillOpacity={isSelected ? 0.25 : 0.12}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 7 : 5}
                    fill={p.isCorrect ? '#10B981' : '#F43F5E'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight={isSelected ? '800' : '600'}
                    fill={isSelected ? '#1E293B' : '#94A3B8'}
                  >
                    #{p.questionNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between pt-2 px-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Correct Response
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Misconception Scaffold
            </span>
          </div>
          <span className="italic">Click any point to inspect adaptive reasoning</span>
        </div>
      </div>

      {selectedStep && (
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 transition-all animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-md text-xs font-extrabold">
                Item #{selectedStep.questionNumber}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {selectedStep.domain.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  selectedStep.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedStep.isCorrect ? 'Correct' : 'Needs Practice'}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Level {selectedStep.difficulty} ({DIFFICULTY_LEVEL_INFOS[selectedStep.difficulty]?.shortTag})
            </div>
          </div>
          <div className="pt-3 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
            <Compass className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900">Adaptive Decision: </strong>
              {selectedStep.reason}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
