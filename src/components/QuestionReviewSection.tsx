import React, { useState, useMemo } from 'react';
import { QuestionResponse, AssessmentQuestion, QuestionChoice } from '../types/assessment';
import { BASE_QUESTIONS } from '../data/questionBank';
import { ShapeRenderer } from './ShapeRenderer';
import { MathVisualRenderer } from './MathVisualRenderer';
import { LiteracyVisualRenderer } from './LiteracyVisualRenderer';
import { soundEngine } from '../utils/audio';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface QuestionReviewSectionProps {
  responses: QuestionResponse[];
}

type StatusFilter = 'all' | 'correct' | 'incorrect';

export const QuestionReviewSection: React.FC<QuestionReviewSectionProps> = ({ responses }) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const items = useMemo(() => {
    return responses.map((resp, index) => {
      const question =
        BASE_QUESTIONS.find((q) => q.id === resp.questionId) ||
        ({
          id: resp.questionId,
          domain: resp.domain,
          subskill: resp.domain.replace(/_/g, ' '),
          difficulty: resp.difficulty as 1 | 2 | 3 | 4 | 5,
          format: 'multiple_choice' as const,
          promptText: `Assessment item for ${resp.domain.replace(/_/g, ' ')}`,
          audioPrompt: `Assessment item for ${resp.domain.replace(/_/g, ' ')}`,
          choices: [],
        } as AssessmentQuestion);

      let studentChoice: QuestionChoice | undefined;
      if (resp.selectedChoiceId && question.choices) {
        studentChoice = question.choices.find((c) => c.id === resp.selectedChoiceId);
      }
      if (!studentChoice && question.choices && typeof resp.selectedOptionPosition === 'number') {
        studentChoice = question.choices[resp.selectedOptionPosition];
      }

      const correctChoice = question.choices?.find((c) => c.isCorrect);

      return {
        index: index + 1,
        response: resp,
        question,
        studentChoice,
        correctChoice,
      };
    });
  }, [responses]);

  const totalCount = items.length;
  const correctCount = items.filter((it) => it.response.isCorrect).length;
  const incorrectCount = totalCount - correctCount;
  const overallAccuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const availableDomains = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.question.domain));
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (statusFilter === 'correct' && !it.response.isCorrect) return false;
      if (statusFilter === 'incorrect' && it.response.isCorrect) return false;
      if (domainFilter !== 'all' && it.question.domain !== domainFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPrompt = it.question.promptText.toLowerCase().includes(query);
        const matchesSubskill = it.question.subskill?.toLowerCase().includes(query);
        const matchesDomain = it.question.domain.toLowerCase().includes(query);
        return matchesPrompt || matchesSubskill || matchesDomain;
      }
      return true;
    });
  }, [items, statusFilter, domainFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    items.forEach((it) => {
      allExpanded[it.response.questionId] = true;
    });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const handlePlayAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    soundEngine.speak(text);
  };

  const formatDomainName = (domain: string) => {
    return domain
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatErrorClass = (errorClass?: string) => {
    if (!errorClass) return 'Incorrect response';
    return errorClass
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Question-by-Question Diagnostic Review
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review each item assessed, student selections, correct responses, and instructional takeaways.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Total:</span>
            <span className="text-slate-900">{totalCount} items</span>
          </div>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-1.5 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{correctCount} Correct</span>
          </div>
          <div className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1.5 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{incorrectCount} Needs Practice</span>
          </div>
          <div className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold">
            {overallAccuracy}% Accuracy
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="pt-5 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('correct')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'correct'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Correct ({correctCount})
          </button>
          <button
            onClick={() => setStatusFilter('incorrect')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'incorrect'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <XCircle className="w-3 h-3" />
            Incorrect ({incorrectCount})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Domains</option>
            {availableDomains.map((dom) => (
              <option key={dom} value={dom}>
                {formatDomainName(dom)}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-44"
            />
          </div>

          <button
            onClick={Object.keys(expandedIds).length > 0 ? collapseAll : expandAll}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            {Object.keys(expandedIds).length > 0 ? 'Collapse' : 'Expand All'}
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
          No questions match the selected filter.
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {filteredItems.map((item) => {
            const isCorrect = item.response.isCorrect;
            const isExpanded = expandedIds[item.response.questionId] ?? !isCorrect;

            return (
              <div
                key={item.response.questionId}
                className={`rounded-2xl border transition overflow-hidden ${
                  isCorrect
                    ? 'border-slate-200 hover:border-slate-300 bg-white'
                    : 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                }`}
              >
                <div
                  onClick={() => toggleExpand(item.response.questionId)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-2xs ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          Item #{item.index}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {formatDomainName(item.question.domain)}
                        </span>
                        {item.question.targetStandard && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.question.targetStandard}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isCorrect ? 'Correct' : 'Needs Practice'}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-2">
                        <span>{item.question.promptText}</span>
                        <button
                          onClick={(e) =>
                            handlePlayAudio(e, item.question.audioPrompt || item.question.promptText)
                          }
                          title="Listen to question"
                          className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto text-xs text-slate-500">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{(item.response.responseTimeMs / 1000).toFixed(1)}s</span>
                    </div>
                    {item.response.readAloudUsageCount > 1 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                        Heard {item.response.readAloudUsageCount}x
                      </span>
                    )}
                    <button type="button" className="text-slate-400 hover:text-slate-700 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 border-t border-slate-100/80 pt-4 bg-slate-50/40">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Assessed subskill & error description */}
                      <div className="lg:col-span-4 flex flex-col justify-between p-3.5 bg-white rounded-xl border border-slate-200">
                        <div>
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Assessed Subskill
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            {item.question.subskill}
                          </div>

                          {item.question.targetShape && (
                            <div className="mt-3 flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 mb-1">Target Shape</span>
                              <ShapeRenderer shape={item.question.targetShape} sizeOverride={70} />
                            </div>
                          )}

                          {item.question.sightWord && (
                            <div className="mt-2 text-sm font-black text-center p-2 bg-amber-50 rounded-lg text-amber-900 border border-amber-200">
                              Sight Word: &quot;{item.question.sightWord}&quot;
                            </div>
                          )}
                        </div>

                        {!isCorrect && (
                          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                            <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                              <span>Diagnosis:</span>
                            </div>
                            <div className="text-rose-900 font-semibold mb-0.5">
                              {formatErrorClass(item.response.errorClass)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Choices & Answer Breakdown */}
                      <div className="lg:col-span-8 space-y-3">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Choices &amp; Selection Breakdown
                        </div>

                        {item.question.choices && item.question.choices.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {item.question.choices.map((choice, cIdx) => {
                              const isChoiceCorrect = choice.isCorrect;
                              const isStudentSelection =
                                item.studentChoice?.id === choice.id ||
                                item.response.selectedChoiceId === choice.id ||
                                (typeof item.response.selectedOptionPosition === 'number' &&
                                  item.response.selectedOptionPosition === cIdx);

                              let borderClass = 'border-slate-200 bg-white';
                              let badgeColor = 'hidden';
                              let badgeText = '';

                              if (isChoiceCorrect && isStudentSelection) {
                                borderClass = 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/30';
                                badgeColor = 'bg-emerald-600 text-white';
                                badgeText = 'Student Selected (Correct)';
                              } else if (isChoiceCorrect) {
                                borderClass = 'border-emerald-400 bg-emerald-50/30';
                                badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                                badgeText = 'Correct Answer';
                              } else if (isStudentSelection) {
                                borderClass = 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-400/30';
                                badgeColor = 'bg-rose-600 text-white';
                                badgeText = 'Student Selected';
                              }

                              return (
                                <div
                                  key={choice.id || cIdx}
                                  className={`p-3 rounded-xl border flex flex-col items-center justify-between min-h-[100px] text-center relative transition ${borderClass}`}
                                >
                                  {badgeText && (
                                    <span
                                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full mb-1 ${badgeColor}`}
                                    >
                                      {badgeText}
                                    </span>
                                  )}
                                  {choice.shape ? (
                                    <div className="my-auto py-1">
                                      <ShapeRenderer shape={choice.shape} sizeOverride={52} />
                                    </div>
                                  ) : (
                                    <div className="my-auto text-sm font-bold text-slate-800">
                                      {choice.label || `Option ${cIdx + 1}`}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800">Next Step: </strong>
                            {isCorrect
                              ? 'Concept securely demonstrated. Ready for higher grade-level extensions.'
                              : 'Targeted practice in this specific skill is recommended before the upcoming test.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
