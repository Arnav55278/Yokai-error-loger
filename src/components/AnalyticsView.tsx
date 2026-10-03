import React from "react";
import {
  Flame,
  Award,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { QuestionMistake, ErrorType, SubjectType } from "../types/vault";
import { ERROR_TYPES, ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";
import { isNemesisQuestion, isSillyMistake } from "../utils/srsEngine";

interface AnalyticsViewProps {
  questions: QuestionMistake[];
  onSelectQuestion: (question: QuestionMistake) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ questions, onSelectQuestion }) => {
  const total = questions.length;
  if (total === 0) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No questions logged yet. Log mistakes to generate weakness intelligence.</p>
      </div>
    );
  }

  // 1. Subject Counts
  const physicsCount = questions.filter((q) => q.subject === "Physics").length;
  const chemistryCount = questions.filter((q) => q.subject === "Chemistry").length;
  const mathCount = questions.filter((q) => q.subject === "Mathematics").length;

  const physicsPct = Math.round((physicsCount / total) * 100);
  const chemistryPct = Math.round((chemistryCount / total) * 100);
  const mathPct = Math.round((mathCount / total) * 100);

  // 2. Error Type Breakdown
  const errorCounts = ERROR_TYPES.map((et) => {
    const count = questions.filter((q) => q.errorType === et).length;
    const pct = Math.round((count / total) * 100);
    return { type: et, count, pct, colors: ERROR_TYPE_COLORS[et] };
  }).sort((a, b) => b.count - a.count);

  // 3. SRS Mastery Distribution
  const stage1Count = questions.filter((q) => q.status === 1).length;
  const stage2Count = questions.filter((q) => q.status === 2).length;
  const stage3Count = questions.filter((q) => q.status === 3).length;
  const stage4Count = questions.filter((q) => q.status === 4).length;

  // 4. Silly vs Conceptual ratio
  const sillyTotal = questions.filter(isSillyMistake).length;
  const sillyPct = Math.round((sillyTotal / total) * 100);
  const nemesisQuestions = questions.filter(isNemesisQuestion);

  // 5. Chapter Error Density Heatmap
  const chapterMap: Record<string, { subject: SubjectType; count: number; criticalCount: number }> = {};
  questions.forEach((q) => {
    if (!chapterMap[q.chapter]) {
      chapterMap[q.chapter] = { subject: q.subject, count: 0, criticalCount: 0 };
    }
    chapterMap[q.chapter].count += 1;
    if (q.status === 1) {
      chapterMap[q.chapter].criticalCount += 1;
    }
  });

  const topWeakChapters = Object.entries(chapterMap)
    .map(([chapter, data]) => ({ chapter, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 select-none max-w-6xl mx-auto custom-scrollbar w-full max-w-full bg-slate-50 text-slate-900">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Logged */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 mb-1 font-semibold">TOTAL LOGGED MISTAKES</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 3 JEE subjects</div>
        </div>

        {/* Silly Rate */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-mono text-orange-600 mb-1 flex items-center justify-between font-semibold">
            <span>PREVENTABLE SILLY LOSS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-600 tabular-nums">{sillyPct}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{sillyTotal} questions misread or miscalculated</div>
        </div>

        {/* Nemesis */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-mono text-rose-600 mb-1 flex items-center justify-between font-semibold">
            <span>NEMESIS QUESTIONS</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">{nemesisQuestions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Failed 2+ times in practice</div>
        </div>

        {/* Mastered */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-mono text-emerald-600 mb-1 flex items-center justify-between font-semibold">
            <span>MASTERED (STAGE 4)</span>
            <Award className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {Math.round((stage4Count / total) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{stage4Count} verified retained concepts</div>
        </div>
      </div>

      {/* Row 2: Subject Bifurcation & SRS Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject Bifurcation */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800">SUBJECT DISTRIBUTION</h3>
            <span className="text-[11px] font-mono text-slate-500">Relative Mistake Volume</span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex mb-4">
            <div
              style={{ width: `${physicsPct}%` }}
              className="bg-blue-600 h-full transition-all"
              title={`Physics: ${physicsCount} (${physicsPct}%)`}
            />
            <div
              style={{ width: `${chemistryPct}%` }}
              className="bg-orange-500 h-full transition-all"
              title={`Chemistry: ${chemistryCount} (${chemistryPct}%)`}
            />
            <div
              style={{ width: `${mathPct}%` }}
              className="bg-indigo-600 h-full transition-all"
              title={`Mathematics: ${mathCount} (${mathPct}%)`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Physics</span>
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">{physicsCount}</div>
              <div className="text-[10px] font-mono text-slate-500">{physicsPct}% of vault</div>
            </div>

            <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-lg">
              <div className="flex items-center gap-1.5 text-orange-700 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Chemistry</span>
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">{chemistryCount}</div>
              <div className="text-[10px] font-mono text-slate-500">{chemistryPct}% of vault</div>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Math</span>
              </div>
              <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">{mathCount}</div>
              <div className="text-[10px] font-mono text-slate-500">{mathPct}% of vault</div>
            </div>
          </div>
        </div>

        {/* SRS Mastery Funnel */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800">SPACED REPETITION FUNNEL</h3>
            <span className="text-[11px] font-mono text-slate-500">Mastery Retention Stages</span>
          </div>

          <div className="space-y-3">
            {[
              { stage: 1, count: stage1Count, ...SRS_CONFIG[1] },
              { stage: 2, count: stage2Count, ...SRS_CONFIG[2] },
              { stage: 3, count: stage3Count, ...SRS_CONFIG[3] },
              { stage: 4, count: stage4Count, ...SRS_CONFIG[4] },
            ].map((s) => {
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-bold ${s.badgeColor}`}>{s.name}</span>
                    <span className="font-mono text-slate-600 tabular-nums font-semibold">
                      {s.count} <span className="text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        s.stage === 1
                          ? "bg-rose-500"
                          : s.stage === 2
                          ? "bg-amber-500"
                          : s.stage === 3
                          ? "bg-blue-600"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Mistake Root Cause Analysis & Top Weak Chapters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Error Types */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800">ROOT CAUSE BREAKDOWN</h3>
            <span className="text-[11px] font-mono text-slate-500">% Silly vs Conceptual</span>
          </div>

          <div className="space-y-2.5">
            {errorCounts.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${item.colors.text}`}>{item.type}</span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {item.count} <span className="text-slate-400">({item.pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Weak Chapters Heatmap */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800">HIGH ERROR CHAPTERS</h3>
            <span className="text-[11px] font-mono text-slate-500">Error Density Heatmap</span>
          </div>

          <div className="space-y-2">
            {topWeakChapters.map((ch) => (
              <div
                key={ch.chapter}
                className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900">{ch.chapter}</div>
                  <div className="text-[10px] font-mono text-blue-600 font-medium">{ch.subject}</div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {ch.criticalCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-600 border border-rose-200 font-bold">
                      {ch.criticalCount} Critical
                    </span>
                  )}
                  <span className="text-slate-700 font-bold tabular-nums">{ch.count} mistakes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nemesis Spotlight Table */}
      {nemesisQuestions.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-rose-800 text-xs font-mono font-bold">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>CRITICAL NEMESIS LIST (IMMEDIATE RE-PRACTICE REQUIRED)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nemesisQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="p-3 bg-white hover:bg-rose-50/50 border border-rose-200 rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-rose-700 font-bold mb-1">
                  <span>{q.id} · {q.subject}</span>
                  <span>{q.attemptCount} failed attempts</span>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate mb-1">{q.subtopic}</div>
                <div className="text-[11px] text-slate-600 line-clamp-1 italic">{q.studentNote}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable JEE Strategic Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-start gap-3 shadow-xs">
        <Lightbulb className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-blue-900">System Strategic Recommendation</div>
          <p className="text-slate-700 leading-relaxed">
            {sillyPct > 35
              ? `Warning: ${sillyPct}% of your logged errors are calculation slips or misread questions. Before working on hard multi-concept problems, run the "Pre-Test Silly Checklist" filter before every mock test.`
              : "Strong concept-to-execution discipline. Keep practicing Due For Review questions daily to convert Stage 2 & 3 questions into Stage 4 permanent memory."}
          </p>
        </div>
      </div>
    </div>
  );
};
