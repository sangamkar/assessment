import React, { useState, useEffect, useRef } from 'react';
import { AssessmentQuestion, QuestionResponse } from '../types/assessment';
import { ShapeRenderer } from './ShapeRenderer';
import { EnvironmentPicture } from './EnvironmentPicture';
import { CompositionTarget } from './CompositionViewer';
import { SortingExercise } from './SortingExercise';
import { MathVisualRenderer } from './MathVisualRenderer';
import { LiteracyVisualRenderer } from './LiteracyVisualRenderer';
import { soundEngine } from '../utils/audio';
import { DIFFICULTY_LEVEL_INFOS } from '../utils/adaptiveEngine';
import { Volume2, VolumeX, Sparkles, TrendingUp, BookOpen, Calculator } from 'lucide-react';

interface StudentAssessmentViewProps {
  question: AssessmentQuestion;
  questionNumber: number;
  onAnswer: (response: QuestionResponse) => void;
  onExitDiagnostic?: () => void;
  reducedMotion?: boolean;
}

export const StudentAssessmentView: React.FC<StudentAssessmentViewProps> = ({
  question,
  questionNumber,
  onAnswer,
  onExitDiagnostic,
  reducedMotion = false,
}) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [readAloudCount, setReadAloudCount] = useState<number>(0);
  const [answerChangeCount, setAnswerChangeCount] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMessage, setTransitionMessage] = useState<string>("Great effort! Let's try the next one.");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  // Auto-read aloud prompt when question changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedChoiceId(null);
    setReadAloudCount(1);
    setAnswerChangeCount(0);
    setIsTransitioning(false);

    if (!isMuted) {
      setIsSpeaking(true);
      const textToSpeak = question.audioPrompt || question.promptText;
      soundEngine.speak(textToSpeak, () => {
        setIsSpeaking(false);
      });
    }

    return () => {
      soundEngine.stopSpeech();
    };
  }, [question.id]);

  const handleReadAloud = () => {
    setReadAloudCount((prev) => prev + 1);
    setIsSpeaking(true);
    soundEngine.speak(question.audioPrompt || question.promptText, () => {
      setIsSpeaking(false);
    });
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleSelectChoice = (choiceId: string, positionIndex: number) => {
    if (isTransitioning) return;
    soundEngine.playTap();

    if (selectedChoiceId && selectedChoiceId !== choiceId) {
      setAnswerChangeCount((prev) => prev + 1);
    }
    setSelectedChoiceId(choiceId);

    const choice = question.choices?.find((c) => c.id === choiceId);
    const isCorrect = !!choice?.isCorrect;
    const responseTime = Date.now() - startTimeRef.current;

    setIsTransitioning(true);
    soundEngine.playNeutralTransition();

    const neutralPhrases = [
      "Let's try the next one!",
      'Moving right along!',
      'Here comes another one!',
      'Thank you! Next question.',
      'Super focus! Next card.',
    ];
    const phrase = neutralPhrases[Math.floor(Math.random() * neutralPhrases.length)];
    setTransitionMessage(phrase);

    setTimeout(() => {
      onAnswer({
        questionId: question.id,
        domain: question.domain,
        difficulty: question.difficulty,
        selectedChoiceId: choiceId,
        isCorrect,
        responseTimeMs: responseTime,
        readAloudUsageCount: readAloudCount,
        answerChangeCount,
        selectedOptionPosition: positionIndex,
        errorClass: !isCorrect ? choice?.errorTag : undefined,
        timestamp: Date.now(),
      });
    }, 1100);
  };

  const handleSortingComplete = (isCorrect: boolean, errorDetail?: string) => {
    if (isTransitioning) return;
    const responseTime = Date.now() - startTimeRef.current;
    setIsTransitioning(true);
    soundEngine.playNeutralTransition();
    setTransitionMessage("Great sorting! Let's keep going.");
    setTimeout(() => {
      onAnswer({
        questionId: question.id,
        domain: question.domain,
        difficulty: question.difficulty,
        isCorrect,
        responseTimeMs: responseTime,
        readAloudUsageCount: readAloudCount,
        answerChangeCount,
        selectedOptionPosition: 0,
        errorClass: !isCorrect ? 'attribute_misunderstanding' : undefined,
        timestamp: Date.now(),
      });
    }, 1100);
  };

  const isReading = question.subject === 'reading';

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-12 gap-4 font-sans text-slate-900">
      {/* Primary Child Interactive Stage (col-span-12 lg:col-span-8) */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[580px]">
        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                isReading ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}
            >
              {isReading ? <BookOpen className="w-4 h-4 text-indigo-600" /> : <Calculator className="w-4 h-4 text-indigo-600" />}
              <span>
                {isReading ? 'Reading Literacy' : 'Mathematics'} – Item {questionNumber}
              </span>
            </span>

            <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>{DIFFICULTY_LEVEL_INFOS[question.difficulty]?.shortTag || `Level ${question.difficulty}`}</span>
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>
            {onExitDiagnostic && (
              <button
                onClick={onExitDiagnostic}
                className="lg:hidden text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                Exit
              </button>
            )}
          </div>
        </div>

        {/* Central Question Prompt & Media */}
        <div className="w-full flex flex-col items-center my-auto py-4">
          {/* Read Aloud Button */}
          <div className="mb-4 flex flex-col items-center text-center">
            <button
              onClick={handleReadAloud}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center justify-center ${
                isSpeaking
                  ? 'bg-amber-200 text-amber-900 ring-4 ring-amber-100 scale-105 animate-pulse'
                  : 'bg-amber-100 text-amber-800 ring-4 ring-amber-50 hover:bg-amber-200'
              }`}
              aria-label="Hear question prompt aloud"
              title="Click to hear question aloud"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5">
              Tap to Hear
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight text-center max-w-2xl leading-snug mb-5">
            {question.promptText}
          </h2>

          {/* Reading Literacy Visuals (Sight Words, Passages, Phonics Focus) */}
          {(question.passage || question.literacyVisual?.passage || question.sightWord || question.phonicsFocus) && (
            <div className="mb-5 w-full flex justify-center">
              <LiteracyVisualRenderer
                passage={question.passage || question.literacyVisual?.passage}
                sightWord={question.sightWord}
                phonicsFocus={question.phonicsFocus}
              />
            </div>
          )}

          {/* Math Visuals (Ten Frames, Balances, Graphs, Clocks) */}
          {question.mathVisual && (
            <div className="mb-5 w-full flex justify-center">
              <MathVisualRenderer visual={question.mathVisual} />
            </div>
          )}

          {/* Geometry Target Shape / Reference Image */}
          {question.referenceImage && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-center">
              <EnvironmentPicture
                type={question.referenceImage as any}
              />
            </div>
          )}

          {question.targetShape && !question.referenceImage && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center gap-2">
              <span className="px-3 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
                Shape to Match
              </span>
              <ShapeRenderer shape={question.targetShape} sizeOverride={130} />
            </div>
          )}

          {question.compositionTarget && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs">
              <CompositionTarget target={question.compositionTarget.targetShape} />
            </div>
          )}

          {/* Question Type: Sorting Exercise */}
          {question.format === 'sorting' && question.sortItems && question.sortBins && (
            <SortingExercise
              items={question.sortItems}
              bins={question.sortBins}
              onComplete={handleSortingComplete}
            />
          )}

          {/* Question Type: Multiple Choice */}
          {question.choices && question.choices.length > 0 && question.format !== 'sorting' && (
            <div
              className={`grid gap-3.5 w-full max-w-3xl px-1 ${
                question.choices.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : question.choices.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}
            >
              {question.choices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    disabled={isTransitioning}
                    onClick={() => handleSelectChoice(choice.id, index)}
                    className={`min-h-[130px] sm:min-h-[150px] p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer relative focus:outline-none ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 ring-4 ring-indigo-100 scale-102 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-sm active:scale-98'
                    }`}
                    aria-label={choice.label || `Option ${index + 1}`}
                  >
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-md w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </span>

                    {choice.shape && (
                      <ShapeRenderer
                        shape={choice.shape}
                        sizeOverride={question.choices!.length > 3 ? 80 : 96}
                      />
                    )}

                    {choice.svgIcon && (
                      <EnvironmentPicture
                        type={choice.svgIcon as any}
                      />
                    )}

                    {choice.dotCount !== undefined && (
                      <div className="flex items-center gap-1.5 my-1">
                        {choice.dotCount === 0 ? (
                          <span className="text-xs text-slate-400 font-semibold italic">zero</span>
                        ) : (
                          Array.from({ length: choice.dotCount }).map((_, dIdx) => (
                            <span
                              key={dIdx}
                              className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-indigo-600 inline-block shadow-2xs"
                            />
                          ))
                        )}
                      </div>
                    )}

                    {choice.label && (
                      <span className="font-bold text-base sm:text-lg text-slate-900 text-center mt-1">
                        {choice.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Gentle Transition Overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-fade-in">
            <div className="p-7 bg-indigo-50/90 rounded-3xl border border-indigo-200 shadow-lg flex flex-col items-center text-center max-w-sm">
              <Sparkles className="w-8 h-8 text-indigo-600 mb-2.5 animate-spin" />
              <h3 className="text-lg font-bold text-slate-900">
                {transitionMessage}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Preparing next task...</p>
            </div>
          </div>
        )}

        {/* Bottom Helper Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-3">
          <span>Tap any card to select answer • Audio prompt available</span>
          <span className="hidden sm:inline">Adaptive Computer-Based Testing</span>
        </div>
      </div>

      {/* Right / Diagnostic Monitor Bento Card (col-span-12 lg:col-span-4) */}
      <div className="col-span-12 lg:col-span-4 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-indigo-900 font-bold flex items-center gap-2 text-base">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Diagnostic Monitor
            </h3>
            <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Live CAT
            </span>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl shadow-2xs border border-indigo-100">
            <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
              Currently Assessing:
            </div>
            <div className="text-base font-bold text-slate-800 leading-tight">
              {question.domain.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              {question.subskill}
            </div>

            {/* Adaptive Difficulty Gauge */}
            <div className="mt-4 pt-3 border-t border-indigo-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Adaptive Level
                </span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 text-xs">
                  Level {question.difficulty} of 5
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 my-2">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const isActive = lvl <= question.difficulty;
                  const isCurrent = lvl === question.difficulty;
                  return (
                    <div key={lvl} className="flex flex-col items-center">
                      <div
                        className={`h-2 w-full rounded-full transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 ring-2 ring-indigo-300'
                            : isActive
                            ? 'bg-indigo-400'
                            : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-bold mt-1 ${
                          isCurrent ? 'text-indigo-700' : 'text-slate-400'
                        }`}
                      >
                        L{lvl}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs font-bold text-slate-700 mt-1.5">
                {DIFFICULTY_LEVEL_INFOS[question.difficulty]?.label}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {DIFFICULTY_LEVEL_INFOS[question.difficulty]?.focusDescription}
              </p>
            </div>

            <div className="mt-3 space-y-2 pt-3 border-t border-indigo-100">
              {question.targetStandard && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Standard</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold border border-indigo-100">
                    {question.targetStandard}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Audio Support</span>
                <span className="text-slate-700 font-semibold">
                  {readAloudCount > 1 ? `${readAloudCount}x listened` : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onExitDiagnostic && (
          <div className="mt-5 pt-3 border-t border-indigo-200/80">
            <button
              onClick={onExitDiagnostic}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-indigo-200 rounded-xl font-bold text-xs transition cursor-pointer shadow-2xs"
            >
              End Session Early
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
