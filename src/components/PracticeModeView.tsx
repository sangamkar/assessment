import React, { useState, useEffect } from 'react';
import { AssessmentQuestion, AssessmentDomain, AssessmentSubject } from '../types/assessment';
import { BASE_QUESTIONS } from '../data/questionBank';
import { ShapeRenderer } from './ShapeRenderer';
import { EnvironmentPicture } from './EnvironmentPicture';
import { CompositionTarget } from './CompositionViewer';
import { SortingExercise } from './SortingExercise';
import { MathVisualRenderer } from './MathVisualRenderer';
import { LiteracyVisualRenderer } from './LiteracyVisualRenderer';
import { soundEngine } from '../utils/audio';
import { sessionHistory } from '../utils/sessionHistory';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Flame,
  Award,
} from 'lucide-react';

interface PracticeModeViewProps {
  initialSubject?: AssessmentSubject;
  initialDomain?: AssessmentDomain;
  onExit: () => void;
}

export const PracticeModeView: React.FC<PracticeModeViewProps> = ({
  initialSubject = 'math',
  initialDomain = 'measurement_and_data',
  onExit,
}) => {
  const [currentSubject, setCurrentSubject] = useState<AssessmentSubject>(initialSubject);
  const [selectedDomain, setSelectedDomain] = useState<AssessmentDomain>(initialDomain);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isSetCompleted, setIsSetCompleted] = useState<boolean>(false);

  const mathDomains: { id: AssessmentDomain; label: string; priority?: boolean }[] = [
    { id: 'measurement_and_data', label: 'Measurement & Data', priority: true },
    { id: 'geometry', label: 'Geometry (2D & 3D)', priority: true },
    { id: 'number_and_operations', label: 'Number & Operations' },
    { id: 'algebra_and_algebraic_thinking', label: 'Algebra & Addition' },
  ];

  const readingDomains: { id: AssessmentDomain; label: string; priority?: boolean }[] = [
    { id: 'high_frequency_words', label: 'High-Frequency Words*', priority: true },
    { id: 'phonics', label: 'Phonics & Decoding' },
    { id: 'phonological_awareness', label: 'Phonological Awareness' },
    { id: 'vocabulary', label: 'Vocabulary Categories' },
    { id: 'comprehension_literature', label: 'Comprehension: Literature' },
    { id: 'comprehension_informational', label: 'Comprehension: Informational' },
  ];

  const activeDomainList = currentSubject === 'math' ? mathDomains : readingDomains;

  useEffect(() => {
    let filtered = BASE_QUESTIONS.filter(
      (q) => (q.subject || 'math') === currentSubject && q.domain === selectedDomain
    );
    if (filtered.length === 0) {
      filtered = BASE_QUESTIONS.filter((q) => (q.subject || 'math') === currentSubject);
    }
    // Partition questions by those unseen in the current session vs already practiced
    const unseen = filtered.filter((q) => !sessionHistory.hasSeen(q.id));
    const seen = filtered.filter((q) => sessionHistory.hasSeen(q.id));

    // Prioritize unseen questions so students never experience repetition in the same session
    const orderedPool = unseen.length > 0
      ? [...unseen.sort(() => Math.random() - 0.5), ...seen.sort(() => Math.random() - 0.5)]
      : [...filtered.sort(() => Math.random() - 0.5)];

    setQuestions(orderedPool);
    setCurrentIndex(0);
    setIsSetCompleted(false);
    setSelectedChoiceId(null);
    setShowFeedback(false);
  }, [currentSubject, selectedDomain]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (currentQ && !isMuted) {
      soundEngine.speak(currentQ.audioPrompt || currentQ.promptText);
    }
    setSelectedChoiceId(null);
    setShowFeedback(false);
  }, [currentIndex, currentQ?.id]);

  const handleSelectChoice = (choiceId: string) => {
    if (showFeedback || !currentQ) return;
    setSelectedChoiceId(choiceId);
    soundEngine.playTap();

    // Mark question as seen in session immediately
    sessionHistory.markSeen(currentQ.id);

    const choice = currentQ.choices?.find((c) => c.id === choiceId);
    const correct = !!choice?.isCorrect;
    setIsCorrect(correct);
    setShowFeedback(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    if (correct) {
      soundEngine.playCorrectChime();
      soundEngine.speak('Awesome! That is correct!');
    } else {
      soundEngine.playGentleBuzzer();
      soundEngine.speak('Good try! Let us look at why the correct answer is right.');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all items in set - do not loop!
      setIsSetCompleted(true);
      soundEngine.speak('Module practice complete! Excellent work practicing all items.');
    }
  };

  const handleNextDomain = () => {
    const currentIdx = activeDomainList.findIndex((d) => d.id === selectedDomain);
    const nextDomain = activeDomainList[(currentIdx + 1) % activeDomainList.length].id;
    setSelectedDomain(nextDomain);
    setIsSetCompleted(false);
  };

  const handleRestartPractice = () => {
    let filtered = BASE_QUESTIONS.filter(
      (q) => (q.subject || 'math') === currentSubject && q.domain === selectedDomain
    );
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setIsSetCompleted(false);
    setSelectedChoiceId(null);
    setShowFeedback(false);
  };

  const handleSwitchSubject = (sub: AssessmentSubject) => {
    setCurrentSubject(sub);
    if (sub === 'math') {
      setSelectedDomain('measurement_and_data');
    } else {
      setSelectedDomain('high_frequency_words');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 font-sans text-slate-900">
      {/* Top Header Bento Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
              currentSubject === 'math' ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {currentSubject === 'math' ? <Calculator className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interactive Prep Lab</span>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Practice Mode
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              {currentSubject === 'math' ? 'Mathematics Module Drills' : 'Reading / Literacy Module Drills'}
            </h1>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            Score: {score.correct} / {score.total}
          </div>

          <button
            onClick={() => handleSwitchSubject(currentSubject === 'math' ? 'reading' : 'math')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
          >
            Switch to {currentSubject === 'math' ? 'Reading' : 'Math'}
          </button>

          <button
            onClick={onExit}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Exit to Hub
          </button>
        </div>
      </div>

      {/* Module Pill Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {activeDomainList.map((d) => {
          const isSelected = selectedDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {d.priority && <Flame className="w-3.5 h-3.5 text-amber-500" />}
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Practice Stage Bento Card */}
      {isSetCompleted ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-9 h-9" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Module Complete • Zero Repetitions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Terrific Effort!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              You worked through all {questions.length} distinct questions for{' '}
              <span className="font-bold text-slate-800">
                {activeDomainList.find((d) => d.id === selectedDomain)?.label || 'this module'}
              </span>{' '}
              without any repeats in this session.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-slate-900">{score.correct}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Correct Answers</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-indigo-600">
                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 100}%
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleNextDomain}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Next Skill Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleRestartPractice}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Review Practice Again</span>
            </button>
          </div>
        </div>
      ) : currentQ ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 text-xs text-slate-400 font-medium">
            <span>
              Practice Item {currentIndex + 1} of {questions.length} • Standard: {currentQ.targetStandard || 'Kindergarten'}
            </span>
            <button
              onClick={() => soundEngine.speak(currentQ.audioPrompt || currentQ.promptText)}
              className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer flex items-center gap-1.5 px-3 border border-amber-200/60"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-xs">Hear Prompt</span>
            </button>
          </div>

          <div className="my-6 flex flex-col items-center text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 max-w-2xl mb-6">
              {currentQ.promptText}
            </h2>

            {/* Reading visuals */}
            {(currentQ.passage || currentQ.literacyVisual?.passage || currentQ.sightWord || currentQ.phonicsFocus) && (
              <div className="mb-6">
                <LiteracyVisualRenderer
                  passage={currentQ.passage || currentQ.literacyVisual?.passage}
                  sightWord={currentQ.sightWord}
                  phonicsFocus={currentQ.phonicsFocus}
                />
              </div>
            )}

            {/* Math visuals */}
            {currentQ.mathVisual && (
              <div className="mb-6">
                <MathVisualRenderer visual={currentQ.mathVisual} />
              </div>
            )}

            {/* Target shape / picture */}
            {currentQ.referenceImage && (
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                <EnvironmentPicture type={currentQ.referenceImage as any} />
              </div>
            )}

            {currentQ.targetShape && !currentQ.referenceImage && (
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
                <ShapeRenderer shape={currentQ.targetShape} sizeOverride={130} />
              </div>
            )}

            {/* Choices */}
            {currentQ.choices && (
              <div
                className={`grid gap-3.5 w-full max-w-3xl ${
                  currentQ.choices.length === 2
                    ? 'grid-cols-2'
                    : currentQ.choices.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}
              >
                {currentQ.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  let cardStyle = 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs';

                  if (showFeedback) {
                    if (choice.isCorrect) {
                      cardStyle = 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-100 shadow-sm';
                    } else if (isSelected) {
                      cardStyle = 'bg-rose-50 border-rose-500 ring-4 ring-rose-100 shadow-sm';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-100 shadow-sm';
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice.id)}
                      className={`min-h-[130px] p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition cursor-pointer ${cardStyle}`}
                    >
                      {choice.shape && <ShapeRenderer shape={choice.shape} sizeOverride={80} />}
                      {choice.label && (
                        <span className="font-bold text-base sm:text-lg text-slate-900 mt-1">
                          {choice.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback & Next Button */}
          {showFeedback && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in ${
                isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <HelpCircle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {isCorrect ? 'Correct! Fantastic job!' : 'Learning Feedback:'}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {isCorrect
                      ? 'You successfully mastered this standard item.'
                      : currentQ.choices?.find((c) => c.isCorrect)?.label
                      ? `The correct answer is "${currentQ.choices.find((c) => c.isCorrect)?.label}".`
                      : 'Keep practicing this concept to build automaticity for the test!'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
          No questions found for this module.
        </div>
      )}
    </div>
  );
};
