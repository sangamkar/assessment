import React, { useState, useRef } from 'react';
import {
  StudentProfile,
  AssessmentQuestion,
  CompleteDiagnosticResult,
  QuestionResponse,
  AssessmentDomain,
  AssessmentSubject,
} from './types/assessment';
import { AdaptiveEngine } from './utils/adaptiveEngine';
import { StudentProfileSetup } from './components/StudentProfileSetup';
import { StudentAssessmentView } from './components/StudentAssessmentView';
import { DiagnosticReportView } from './components/DiagnosticReportView';
import { PracticeModeView } from './components/PracticeModeView';
import { AARAV_BENCHMARK } from './data/aaravBenchmark';
import {
  Sparkles,
  Calculator,
  BookOpen,
  RotateCcw,
  Target,
  GraduationCap,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundEngine } from './utils/audio';

type AppView = 'setup' | 'assessing' | 'report' | 'practice';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('setup');
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    studentName: 'Aarav Sangamkar',
    studentId: '210668',
    grade: 'Kindergarten',
    assessmentDate: new Date().toISOString().split('T')[0],
    subject: 'math',
    assessmentScope: 'comprehensive',
  });

  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [diagnosticResult, setDiagnosticResult] = useState<CompleteDiagnosticResult | null>(null);

  // Practice mode params
  const [practiceSubject, setPracticeSubject] = useState<AssessmentSubject>('math');
  const [practiceDomain, setPracticeDomain] = useState<AssessmentDomain>('measurement_and_data');

  const engineRef = useRef<AdaptiveEngine | null>(null);

  // Start Assessment
  const handleStartAssessment = (profile: StudentProfile) => {
    setStudentProfile(profile);
    const engine = new AdaptiveEngine(
      profile.subject || 'math',
      profile.assessmentScope || 'comprehensive',
      profile.targetModuleDomain,
      profile.levelMode || 'comprehensive',
      profile.adaptiveDifficultyPolicy || 'dynamic'
    );
    engineRef.current = engine;

    const firstQ = engine.getNextQuestion();
    if (firstQ) {
      setCurrentQuestion(firstQ);
      setQuestionNumber(1);
      setCurrentView('assessing');
    } else {
      // Fallback
      const report = engine.generateReport(profile);
      setDiagnosticResult(report);
      setCurrentView('report');
    }
  };

  // Handle Response from Student
  const handleAnswer = (response: QuestionResponse) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    engine.recordResponse(response);

    const nextQ = engine.getNextQuestion();
    if (nextQ) {
      setCurrentQuestion(nextQ);
      setQuestionNumber((prev) => prev + 1);
    } else {
      // Complete!
      const report = engine.generateReport(studentProfile);
      setDiagnosticResult(report);
      setCurrentView('report');
      soundEngine.speak('Congratulations! Assessment complete! Loading your full diagnostic report.');
    }
  };

  // Early exit from assessment
  const handleExitDiagnostic = () => {
    if (!engineRef.current) {
      setCurrentView('setup');
      return;
    }
    const report = engineRef.current.generateReport(studentProfile);
    setDiagnosticResult(report);
    setCurrentView('report');
  };

  // Quick Demo: Load Aarav's Math Baseline Report
  const handleQuickMathDemo = () => {
    const profile: StudentProfile = {
      studentName: 'Aarav Sangamkar',
      studentId: '210668',
      grade: 'Kindergarten',
      assessmentDate: '08/31/2026',
      subject: 'math',
      assessmentScope: 'comprehensive',
    };
    setStudentProfile(profile);

    const engine = new AdaptiveEngine('math', 'comprehensive');
    // Pre-populate with realistic responses reflecting Aarav's 360 score (Measurement/Geometry needs)
    engine.recordResponse({
      questionId: 'md_length_pencils',
      domain: 'measurement_and_data',
      difficulty: 1,
      isCorrect: false,
      responseTimeMs: 3800,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      errorClass: 'measurement_comparison_error',
      timestamp: Date.now() - 60000,
    });
    engine.recordResponse({
      questionId: 'md_balance_scale',
      domain: 'measurement_and_data',
      difficulty: 2,
      isCorrect: true,
      responseTimeMs: 4200,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 1,
      timestamp: Date.now() - 50000,
    });
    engine.recordResponse({
      questionId: 'md_picture_graph_apples',
      domain: 'measurement_and_data',
      difficulty: 2,
      isCorrect: false,
      responseTimeMs: 5100,
      readAloudUsageCount: 1,
      answerChangeCount: 1,
      selectedOptionPosition: 2,
      errorClass: 'graph_reading_error',
      timestamp: Date.now() - 40000,
    });
    engine.recordResponse({
      questionId: 'sr_circle_basic',
      domain: 'geometry',
      difficulty: 1,
      isCorrect: true,
      responseTimeMs: 2500,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 35000,
    });
    engine.recordResponse({
      questionId: 'geo_3d_faces_cube',
      domain: 'geometry',
      difficulty: 3,
      isCorrect: false,
      responseTimeMs: 6200,
      readAloudUsageCount: 2,
      answerChangeCount: 1,
      selectedOptionPosition: 2,
      errorClass: 'attribute_misunderstanding',
      timestamp: Date.now() - 30000,
    });
    engine.recordResponse({
      questionId: 'num_count_by_10s',
      domain: 'number_and_operations',
      difficulty: 2,
      isCorrect: true,
      responseTimeMs: 3100,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 1,
      timestamp: Date.now() - 25000,
    });
    engine.recordResponse({
      questionId: 'num_decompose_teen',
      domain: 'number_and_operations',
      difficulty: 3,
      isCorrect: true,
      responseTimeMs: 4400,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 20000,
    });
    engine.recordResponse({
      questionId: 'alg_make_10_frame',
      domain: 'algebra_and_algebraic_thinking',
      difficulty: 2,
      isCorrect: true,
      responseTimeMs: 3200,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 15000,
    });

    const report = engine.generateReport(profile);
    report.scaleScore = 360;
    report.overallLevel = 'Approaching Grade K';
    report.nationalPercentile = 83;
    report.lowestMissingPrerequisite = 'Measurement and Data';
    setDiagnosticResult(report);
    setCurrentView('report');
  };

  // Quick Demo: Load Aarav's Reading Baseline Report
  const handleQuickReadingDemo = () => {
    const profile: StudentProfile = {
      studentName: 'Aarav Sangamkar',
      studentId: '210668',
      grade: 'Kindergarten',
      assessmentDate: '08/27/2026',
      subject: 'reading',
      assessmentScope: 'comprehensive',
    };
    setStudentProfile(profile);

    const engine = new AdaptiveEngine('reading', 'comprehensive');
    // Pre-populate with realistic responses reflecting Aarav's 407 score (High-Frequency Words needs)
    engine.recordResponse({
      questionId: 'hfw_the_cloze',
      domain: 'high_frequency_words',
      difficulty: 1,
      isCorrect: true,
      responseTimeMs: 2900,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 60000,
    });
    engine.recordResponse({
      questionId: 'hfw_was_they',
      domain: 'high_frequency_words',
      difficulty: 2,
      isCorrect: false,
      responseTimeMs: 5800,
      readAloudUsageCount: 2,
      answerChangeCount: 1,
      selectedOptionPosition: 1,
      errorClass: 'sight_word_confusion',
      timestamp: Date.now() - 50000,
    });
    engine.recordResponse({
      questionId: 'pa_rhyme_cat',
      domain: 'phonological_awareness',
      difficulty: 1,
      isCorrect: true,
      responseTimeMs: 2100,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 40000,
    });
    engine.recordResponse({
      questionId: 'ph_cvc_sun',
      domain: 'phonics',
      difficulty: 1,
      isCorrect: true,
      responseTimeMs: 2400,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 30000,
    });
    engine.recordResponse({
      questionId: 'ph_digraph_ship',
      domain: 'phonics',
      difficulty: 3,
      isCorrect: true,
      responseTimeMs: 3500,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 25000,
    });
    engine.recordResponse({
      questionId: 'voc_category_animals',
      domain: 'vocabulary',
      difficulty: 1,
      isCorrect: true,
      responseTimeMs: 2800,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 20000,
    });
    engine.recordResponse({
      questionId: 'comp_lit_puppy',
      domain: 'comprehension_literature',
      difficulty: 2,
      isCorrect: true,
      responseTimeMs: 4200,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 15000,
    });
    engine.recordResponse({
      questionId: 'comp_info_honeybees',
      domain: 'comprehension_informational',
      difficulty: 2,
      isCorrect: true,
      responseTimeMs: 4400,
      readAloudUsageCount: 1,
      answerChangeCount: 0,
      selectedOptionPosition: 0,
      timestamp: Date.now() - 10000,
    });

    const report = engine.generateReport(profile);
    report.scaleScore = 407;
    report.overallLevel = 'At Grade K';
    report.nationalPercentile = 97;
    report.lexileMeasure = 'BR165L';
    report.lowestMissingPrerequisite = 'High-Frequency Words*';
    setDiagnosticResult(report);
    setCurrentView('report');
  };

  const handleEnterPracticeMode = (domain?: AssessmentDomain) => {
    if (domain) {
      setPracticeDomain(domain);
      const isReadDomain = [
        'high_frequency_words',
        'phonological_awareness',
        'phonics',
        'vocabulary',
        'comprehension_literature',
        'comprehension_informational',
      ].includes(domain);
      setPracticeSubject(isReadDomain ? 'reading' : 'math');
    } else {
      setPracticeSubject(studentProfile.subject || 'math');
      setPracticeDomain(
        studentProfile.subject === 'reading' ? 'high_frequency_words' : 'measurement_and_data'
      );
    }
    setCurrentView('practice');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col font-sans selection:bg-indigo-100">
      {/* Bento Grid Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            onClick={() => setCurrentView('setup')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 leading-none">
                Assessment Hub
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Prep Portal: All Subjects &amp; Comprehensive Readiness • Aarav (Grade K)
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200 hidden lg:block">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Next Test Target
              </span>
              <span className="text-slate-700 font-semibold text-xs">
                Oct 2026 • 385+ Math / 435+ Read
              </span>
            </div>

            <button
              onClick={() => setCurrentView('setup')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'setup'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Assessment Hub</span>
            </button>

            <button
              onClick={() => handleEnterPracticeMode()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'practice'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Practice Modules</span>
            </button>

            {diagnosticResult && (
              <button
                onClick={() => setCurrentView('report')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'report'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Diagnostic Report</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('setup')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {currentView === 'setup' && (
          <StudentProfileSetup
            onStartAssessment={handleStartAssessment}
            onQuickMathDemo={handleQuickMathDemo}
            onQuickReadingDemo={handleQuickReadingDemo}
          />
        )}

        {currentView === 'assessing' && currentQuestion && (
          <StudentAssessmentView
            question={currentQuestion}
            questionNumber={questionNumber}
            onAnswer={handleAnswer}
            onExitDiagnostic={handleExitDiagnostic}
          />
        )}

        {currentView === 'report' && diagnosticResult && (
          <DiagnosticReportView
            result={diagnosticResult}
            onEnterPracticeMode={handleEnterPracticeMode}
            onRetakeAssessment={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'practice' && (
          <PracticeModeView
            initialSubject={practiceSubject}
            initialDomain={practiceDomain}
            onExit={() => setCurrentView(diagnosticResult ? 'report' : 'setup')}
          />
        )}
      </main>

      {/* Bento Grid Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-3.5 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Literacy Ready (97th %ile)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Math Trending Up (83rd %ile)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Adaptive ZPD Calibration Active
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-medium tracking-widest">
            PrepEdge Assessment Engine v4.2.0 • Kindergarten Suite
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
