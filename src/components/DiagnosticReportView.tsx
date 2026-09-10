import React from 'react';
import { CompleteDiagnosticResult, MasteryLevel, DomainDiagnosticReport, AssessmentDomain } from '../types/assessment';
import { QuestionReviewSection } from './QuestionReviewSection';
import { AdaptiveTrajectoryView } from './AdaptiveTrajectoryView';
import { GRADE_K_BENCHMARK } from '../data/gradeBenchmark';
import {
  Printer,
  RotateCcw,
  Sparkles,
  BookOpen,
  TrendingUp,
  Brain,
  Layers,
  Compass,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Target,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DiagnosticReportViewProps {
  result: CompleteDiagnosticResult;
  onEnterPracticeMode: (domain?: AssessmentDomain) => void;
  onRetakeAssessment: () => void;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({
  result,
  onEnterPracticeMode,
  onRetakeAssessment,
}) => {
  const {
    studentProfile,
    subject,
    assessmentScope,
    overallLevel,
    scaleScore,
    nationalPercentile,
    lexileMeasure,
    summaryNarrative,
    lowestMissingPrerequisite,
    domainReports,
    errorPatterns,
    averageResponseTimeSeconds,
    recommendedPracticeSequence,
    suggestedReassessmentDate,
    responses,
  } = result;

  const isReading = subject === 'reading';
  const baselineInfo = isReading ? GRADE_K_BENCHMARK.reading : GRADE_K_BENCHMARK.math;

  const getLevelBadgeColor = (level: MasteryLevel) => {
    switch (level) {
      case 'KNOWS':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'DEVELOPING':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'NEEDS_SUPPORT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'NOT_YET_DEMONSTRATED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getOverallLevelColor = () => {
    switch (overallLevel) {
      case 'Above Grade Level':
      case 'Early Grade 1 Extension':
      case 'Kindergarten Secure':
        return 'bg-emerald-600 text-white';
      case 'At Grade K':
      case 'Kindergarten Ready':
        return 'bg-indigo-600 text-white';
      case 'Approaching Grade K':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-900 text-white';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 font-sans text-slate-900 print:space-y-4">
      {/* Top Action Bento Bar */}
      <div className="no-print bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">
              Diagnostic Evaluation: {isReading ? 'Reading / Literacy' : 'Mathematics'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Calibrated for Kindergarten Benchmark Standards • Adaptive Diagnostic
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => onEnterPracticeMode()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice Drills</span>
          </button>
          <button
            type="button"
            onClick={onRetakeAssessment}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* 12-Column Bento Grid Container */}
      <div className="grid grid-cols-12 gap-4">
        {/* TILE 1: Score & Placement Hero Bento (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 px-2.5 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                    {isReading ? 'Literacy Assessment Report' : 'Math Assessment Report'}
                  </span>
                  {assessmentScope === 'single_module' && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 px-2.5 py-0.5 bg-purple-50 rounded-md border border-purple-100">
                      Module Deep-Dive
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mt-2">
                  {studentProfile.studentName || 'Kindergarten Learner'}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-400 mt-1 font-medium">
                  <span>Grade: <strong className="text-slate-700">{studentProfile.grade}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-slate-700">{studentProfile.assessmentDate}</strong></span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Diagnostic Placement
                </span>
                <div className={`px-4 py-1.5 rounded-xl font-bold text-sm shadow-xs ${getOverallLevelColor()}`}>
                  {overallLevel}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-semibold">
                  <span>Scale Score: <strong className="text-slate-900">{scaleScore}</strong></span>
                  <span>•</span>
                  <span>{nationalPercentile}th Percentile</span>
                  {lexileMeasure && (
                    <>
                      <span>•</span>
                      <span>Lexile: <strong>{lexileMeasure}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Narrative & Gap Alert Row */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span>Diagnostic Summary &amp; Learning Profile</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {summaryNarrative}
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>Priority Growth Area</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">Target for next test:</p>
                  <div className="font-bold text-sm text-amber-950">
                    {lowestMissingPrerequisite ? lowestMissingPrerequisite : 'Foundations Secure'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onEnterPracticeMode()}
                  className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Practice Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TILE 2: Grade K Benchmark Standard Norms Bento (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-indigo-900 font-bold flex items-center gap-2 text-base">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Grade K Benchmark Standards
              </h3>
              <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Standard Norm
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-xs text-indigo-800 font-medium">On-Grade Threshold</span>
                <span className="text-sm font-extrabold text-indigo-950">
                  362 Scale Score
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-xs text-indigo-800 font-medium">Current Evaluation</span>
                <span className="text-sm font-extrabold text-emerald-600">
                  {scaleScore}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({scaleScore >= 362 ? 'On-Grade K Met' : `${362 - scaleScore} pts to On-Grade`})
                  </span>
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span className="text-xs text-indigo-800 font-medium">On-Grade Level Range</span>
                <span className="text-sm font-extrabold text-indigo-600">
                  {baselineInfo.onGradeLevelRange}
                </span>
              </div>

              <div className="pt-3 border-t border-indigo-200">
                <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 mb-1">
                  Instructional Guidance
                </p>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  {baselineInfo.actionPlanSummary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TILE 3: Domain-by-Domain Diagnostic Profile (col-span-12 lg:col-span-7) */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Domain Diagnostic Profile</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Mastery Matrix</span>
          </div>

          <div className="space-y-3">
            {(Object.values(domainReports) as DomainDiagnosticReport[]).map((report) => (
              <div
                key={report.domain}
                className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{report.domainTitle}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getLevelBadgeColor(
                        report.level
                      )}`}
                    >
                      {report.level.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-0.5">
                    {report.strengths.slice(0, 1).map((s, idx) => (
                      <div key={`s-${idx}`} className="text-[11px] text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{s}</span>
                      </div>
                    ))}
                    {report.growthAreas.slice(0, 1).map((g, idx) => (
                      <div key={`g-${idx}`} className="text-[11px] text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      {report.correctQuestions} / {report.totalQuestions}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{report.accuracyRate}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEnterPracticeMode(report.domain)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TILE 4: Next-Test Preparation Roadmap & Error Analysis (col-span-12 lg:col-span-5) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Next-Test Roadmap</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Step-by-Step</span>
            </div>

            <div className="space-y-2.5">
              {recommendedPracticeSequence.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.focusTitle}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.instructionalActivity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Weekly Target Box */}
          <div className="mt-5 p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
              Reassessment Timeline
            </p>
            <p className="text-xs font-semibold">
              Suggested Reassessment Date: <strong>{suggestedReassessmentDate}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Average item response time: {averageResponseTimeSeconds}s (Healthy kindergarten pacing)
            </p>
          </div>
        </div>

        {/* TILE 5: Adaptive Trajectory Graph (col-span-12) */}
        <div className="col-span-12">
          <AdaptiveTrajectoryView
            adaptiveProfile={result.adaptiveProfile}
            studentName={studentProfile.studentName}
          />
        </div>

        {/* TILE 6: Question Review Section (col-span-12) */}
        <div className="col-span-12">
          <QuestionReviewSection responses={responses} />
        </div>
      </div>
    </div>
  );
};
