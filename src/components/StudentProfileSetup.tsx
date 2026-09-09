import React, { useState } from 'react';
import {
  StudentProfile,
  AdaptiveDifficultyPolicy,
  AssessmentSubject,
  AssessmentScope,
  AssessmentDomain,
} from '../types/assessment';
import {
  Sparkles,
  User,
  GraduationCap,
  Calculator,
  BookOpen,
  Layers,
  TrendingUp,
  Target,
  Flame,
  FileText,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { AARAV_BENCHMARK } from '../data/aaravBenchmark';
import { sessionHistory } from '../utils/sessionHistory';

interface StudentProfileSetupProps {
  onStartAssessment: (profile: StudentProfile) => void;
  onQuickMathDemo: () => void;
  onQuickReadingDemo: () => void;
}

export const StudentProfileSetup: React.FC<StudentProfileSetupProps> = ({
  onStartAssessment,
  onQuickMathDemo,
  onQuickReadingDemo,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [studentName, setStudentName] = useState('Aarav Sangamkar');
  const [studentId, setStudentId] = useState('210668');
  const [grade, setGrade] = useState('Kindergarten');
  const [assessmentDate, setAssessmentDate] = useState(today);
  const [assessorName, setAssessorName] = useState('');
  const [sessionSeenCount, setSessionSeenCount] = useState(() => sessionHistory.getSeenCount());

  const handleClearSessionHistory = () => {
    sessionHistory.clear();
    setSessionSeenCount(0);
  };

  // Subject: math or reading
  const [subject, setSubject] = useState<AssessmentSubject>('math');

  // Scope: comprehensive or single module
  const [assessmentScope, setAssessmentScope] = useState<AssessmentScope>('comprehensive');
  const [targetModuleDomain, setTargetModuleDomain] = useState<AssessmentDomain>('measurement_and_data');

  const [levelMode, setLevelMode] = useState<'kindergarten_core' | 'above_kindergarten' | 'comprehensive'>('comprehensive');
  const [adaptiveDifficultyPolicy, setAdaptiveDifficultyPolicy] = useState<AdaptiveDifficultyPolicy>('dynamic');

  const mathModules: { id: AssessmentDomain; label: string; priority?: boolean; desc: string; status: 'ready' | 'review' | 'start' }[] = [
    {
      id: 'number_and_operations',
      label: 'Numerical Operations',
      desc: 'Counting to 100, teen numbers, forward counting sequence',
      status: 'ready',
    },
    {
      id: 'algebra_and_algebraic_thinking',
      label: 'Algebraic Reasoning',
      desc: 'Part-part-whole bonds, make-10 partners, addition & subtraction',
      status: 'start',
    },
    {
      id: 'geometry',
      label: 'Geometry & Spatial',
      priority: true,
      desc: '2D & 3D shapes, vertices, faces, composite shape breakdown',
      status: 'review',
    },
    {
      id: 'measurement_and_data',
      label: 'Data & Measurement',
      priority: true,
      desc: 'Length/height comparisons, balance scales, picture graphs',
      status: 'review',
    },
  ];

  const readingModules: { id: AssessmentDomain; label: string; priority?: boolean; desc: string; status: 'ready' | 'complete' | 'review' | 'start' }[] = [
    {
      id: 'high_frequency_words',
      label: 'High-Frequency Words*',
      priority: true,
      desc: 'Key sight words (the, see, you, was, they, have, said, were)',
      status: 'review',
    },
    {
      id: 'phonics',
      label: 'Phonics & Word Study',
      desc: 'CVC decoding, short/long vowels, consonant blends & digraphs',
      status: 'complete',
    },
    {
      id: 'phonological_awareness',
      label: 'Phonological Awareness',
      desc: 'Rhyme recognition, syllables, onset-rime, phoneme blending',
      status: 'ready',
    },
    {
      id: 'vocabulary',
      label: 'Vocabulary & Language',
      desc: 'Classification, category sorting, opposite pairs, context clues',
      status: 'start',
    },
    {
      id: 'comprehension_literature',
      label: 'Comprehension: Literature',
      desc: 'Story sequencing, character & setting, problem-solution',
      status: 'start',
    },
    {
      id: 'comprehension_informational',
      label: 'Comprehension: Informational',
      desc: 'Main idea, text features, informational recall, facts vs opinions',
      status: 'ready',
    },
  ];

  const handleSubjectChange = (newSubject: AssessmentSubject) => {
    setSubject(newSubject);
    if (newSubject === 'math') {
      setTargetModuleDomain('measurement_and_data');
    } else {
      setTargetModuleDomain('high_frequency_words');
    }
  };

  const handleLaunchModule = (subj: AssessmentSubject, domain: AssessmentDomain) => {
    setSubject(subj);
    setAssessmentScope('single_module');
    setTargetModuleDomain(domain);
    onStartAssessment({
      studentName: studentName.trim() || 'Aarav Sangamkar',
      studentId: studentId.trim(),
      grade,
      assessmentDate,
      assessorName: assessorName.trim(),
      subject: subj,
      assessmentScope: 'single_module',
      targetModuleDomain: domain,
      levelMode,
      adaptiveDifficultyPolicy,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    onStartAssessment({
      studentName: studentName.trim(),
      studentId: studentId.trim(),
      grade,
      assessmentDate,
      assessorName: assessorName.trim(),
      subject,
      assessmentScope,
      targetModuleDomain: assessmentScope === 'single_module' ? targetModuleDomain : undefined,
      levelMode,
      adaptiveDifficultyPolicy,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 font-sans text-slate-900">
      {/* 12-Column Bento Grid Container */}
      <div className="grid grid-cols-12 gap-4">
        {/* TILE 1: Primary Exam Launcher / Hero Bento (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-sm relative overflow-hidden">
          {/* Subtle Background Watermark SVG */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none select-none">
            <svg className="w-40 h-40 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block">
                Adaptive Assessment Mode
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Student ID: {AARAV_BENCHMARK.studentId}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-2">
              Comprehensive Mastery Test
            </h2>
            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
              Full-length diagnostic covering both Literacy and Math to simulate the actual test environment,
              evaluate prerequisite readiness, and calibrate scale scores for Kindergarten.
            </p>

            {/* Subject Selector Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSubjectChange('math')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  subject === 'math'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    subject === 'math' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900">Mathematics</div>
                  <div className="text-[11px] text-slate-500">Geometry, Measurement, Numbers, Algebra</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSubjectChange('reading')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  subject === 'reading'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    subject === 'reading' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-900">Reading / Literacy</div>
                  <div className="text-[11px] text-slate-500">Sight Words, Phonics, Comprehension</div>
                </div>
              </button>
            </div>

            {/* Scope Selector: Comprehensive vs Single Module */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAssessmentScope('comprehensive')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  assessmentScope === 'comprehensive'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span className="font-bold text-xs sm:text-sm">Full Test Simulation</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    assessmentScope === 'comprehensive' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All Domains
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAssessmentScope('single_module')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  assessmentScope === 'single_module'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="font-bold text-xs sm:text-sm">Single Module Deep-Dive</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    assessmentScope === 'single_module' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Focused
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Readiness & Action Row */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-xs text-slate-600">Kindergarten Prep Readiness</span>
                <span className="text-indigo-600 font-bold text-sm">82%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: '82%' }}></div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base shrink-0 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Launch Full Exam</span>
            </button>
          </div>
        </div>

        {/* TILE 2: Last Test Analysis Bento Card (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-indigo-900 font-bold flex items-center gap-2 text-base">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Last Test Analysis
              </h3>
              <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Official Baseline
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm p-3 bg-white/70 rounded-xl border border-indigo-100">
                <span className="text-indigo-700 font-medium">Literacy Component</span>
                <span className="font-extrabold text-indigo-950">407 / 800 (97th %ile)</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-white/70 rounded-xl border border-indigo-100">
                <span className="text-indigo-700 font-medium">Math Component</span>
                <span className="font-extrabold text-indigo-950">360 / 800 (83rd %ile)</span>
              </div>

              <div className="pt-3 border-t border-indigo-200">
                <p className="text-xs text-indigo-600 uppercase font-bold tracking-widest mb-1">
                  Key Insight
                </p>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  Aarav is just <strong>2 points</strong> away from on-grade Math (362). Prioritize{' '}
                  <strong>Geometry</strong>, <strong>Measurement &amp; Data</strong>, and{' '}
                  <strong>High-Frequency Words</strong> in upcoming sessions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-200/80 flex gap-2">
            <button
              type="button"
              onClick={onQuickMathDemo}
              className="flex-1 px-3 py-2 bg-white hover:bg-indigo-100/50 rounded-xl text-xs font-bold text-indigo-900 transition flex items-center justify-center gap-1 border border-indigo-200 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span>Math Report</span>
            </button>
            <button
              type="button"
              onClick={onQuickReadingDemo}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reading Report</span>
            </button>
          </div>
        </div>

        {/* TILE 3: Literacy Modules Bento Box (col-span-12 md:col-span-6 lg:col-span-4) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Literacy Modules</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Grade K</span>
            </div>

            <div className="space-y-2.5">
              {readingModules.map((mod) => {
                const isComplete = mod.status === 'complete';
                const isReview = mod.status === 'review';

                return (
                  <div
                    key={mod.id}
                    className={`p-3 rounded-xl border flex justify-between items-center transition ${
                      isComplete
                        ? 'bg-emerald-50 border-emerald-100'
                        : isReview
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isComplete ? 'text-emerald-900' : isReview ? 'text-amber-900' : 'text-slate-700'
                        }`}
                      >
                        {mod.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{mod.desc}</div>
                    </div>

                    {isComplete ? (
                      <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-bold shrink-0">
                        Complete
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLaunchModule('reading', mod.id)}
                        className={`text-xs px-3 py-1 rounded-md font-bold shadow-2xs shrink-0 cursor-pointer ${
                          isReview
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {isReview ? 'Review' : 'Start'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Goal Dark Box */}
          <div className="mt-5 p-4 bg-slate-900 rounded-2xl text-white">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
              Weekly Goal
            </p>
            <p className="text-xs font-semibold">3 Literacy modules per week</p>
            <div className="mt-2.5 flex gap-1.5">
              <div className="h-1.5 flex-1 bg-indigo-400 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-indigo-400 rounded-full"></div>
              <div className="h-1.5 flex-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* TILE 4: Math Modules Bento Box (col-span-12 md:col-span-6 lg:col-span-4) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                <span>Math Modules</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400">Grade K</span>
            </div>

            <div className="space-y-2.5">
              {mathModules.map((mod) => {
                const isReview = mod.status === 'review';

                return (
                  <div
                    key={mod.id}
                    className={`p-3 rounded-xl border flex justify-between items-center transition ${
                      isReview ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div
                        className={`text-sm font-semibold truncate ${
                          isReview ? 'text-amber-900' : 'text-slate-700'
                        }`}
                      >
                        {mod.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{mod.desc}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchModule('math', mod.id)}
                      className={`text-xs px-3 py-1 rounded-md font-bold shadow-2xs shrink-0 cursor-pointer ${
                        isReview
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isReview ? 'In Review' : 'Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Average Accuracy Widget */}
          <div className="mt-5 p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-wider">
                Average Accuracy
              </p>
              <p className="text-2xl font-black text-slate-800 leading-none">91%</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Approaching Mastered</p>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="#E2E8F0"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="#10B981"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 * (1 - 0.91)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-700">91%</span>
            </div>
          </div>
        </div>

        {/* TILE 5: Student Details & Adaptive Configuration (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Student Configuration</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Adaptive CAT</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Kindergarten">Grade K (Aarav)</option>
                    <option value="Pre-K">Pre-K</option>
                    <option value="Grade 1">Grade 1</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Adaptive Policy
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setAdaptiveDifficultyPolicy('dynamic')}
                    className={`w-full p-2 rounded-xl text-left border transition text-xs flex justify-between items-center cursor-pointer ${
                      adaptiveDifficultyPolicy === 'dynamic'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Dynamic Scaling (L1-L5)</span>
                    {adaptiveDifficultyPolicy === 'dynamic' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdaptiveDifficultyPolicy('foundational_scaffold')}
                    className={`w-full p-2 rounded-xl text-left border transition text-xs flex justify-between items-center cursor-pointer ${
                      adaptiveDifficultyPolicy === 'foundational_scaffold'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Foundational Focus (L1-L3)</span>
                    {adaptiveDifficultyPolicy === 'foundational_scaffold' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdaptiveDifficultyPolicy('advanced_extension')}
                    className={`w-full p-2 rounded-xl text-left border transition text-xs flex justify-between items-center cursor-pointer ${
                      adaptiveDifficultyPolicy === 'advanced_extension'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Advanced Extension (L3-L5)</span>
                    {adaptiveDifficultyPolicy === 'advanced_extension' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Audio Read-Aloud &amp; Neutral Transitions Active</span>
          </div>
        </div>

        {/* TILE 6: Detailed PDF Report / Archive Access Bar (col-span-12) */}
        <div className="col-span-12 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-700 block">
                Detailed Diagnostic &amp; Growth Archive
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Baseline calibration loaded from August 2026 i-Ready Diagnostic reports (Math 360 &amp; Reading 407).
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {sessionSeenCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">{sessionSeenCount} items seen (0 repeats)</span>
                <button
                  type="button"
                  onClick={handleClearSessionHistory}
                  title="Reset session question tracker"
                  className="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer flex items-center gap-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[10px] underline font-bold">Reset</span>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onQuickMathDemo}
              className="text-xs text-indigo-600 font-bold border-b-2 border-indigo-600 border-opacity-30 pb-0.5 hover:border-opacity-100 cursor-pointer"
            >
              Review Math History
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={onQuickReadingDemo}
              className="text-xs text-indigo-600 font-bold border-b-2 border-indigo-600 border-opacity-30 pb-0.5 hover:border-opacity-100 cursor-pointer"
            >
              Review Reading History
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
