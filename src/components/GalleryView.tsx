import React, { useState } from "react";
import {
  Play,
  RotateCw,
  Calendar,
  ExternalLink,
  Trash2,
  Lightbulb,
  Clock,
  Flame,
  Star,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { QuestionMistake } from "../types/vault";
import { ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";
import { MathRenderer } from "./MathRenderer";
import { isDueToday, isNemesisQuestion } from "../utils/srsEngine";

interface GalleryViewProps {
  questions: QuestionMistake[];
  onSelectQuestion: (question: QuestionMistake) => void;
  onPracticeSingle: (question: QuestionMistake) => void;
  onToggleStar: (question: QuestionMistake, e: React.MouseEvent) => void;
  onDeleteQuestion: (id: string) => void;
  onOpenIngestion: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  questions,
  onSelectQuestion,
  onPracticeSingle,
  onToggleStar,
  onDeleteQuestion,
  onOpenIngestion,
}) => {
  const [activeTabs, setActiveTabs] = useState<Record<string, "question" | "solution">>({});

  const toggleTab = (id: string, tab: "question" | "solution", e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTabs((prev) => ({ ...prev, [id]: tab }));
  };

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center text-slate-500 select-none bg-slate-50/50">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-3">
          <ImageIcon className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">No Mistakes in View</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
          Adjust your filters or log a new JEE question screenshot to your vault.
        </p>
        <button
          onClick={onOpenIngestion}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log First Mistake</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-5 select-none w-full max-w-full">
      {questions.map((q) => {
        const isNemesis = isNemesisQuestion(q);
        const due = isDueToday(q.nextReviewDate);
        const currentTab = activeTabs[q.id] || "question";
        const errorStyle = ERROR_TYPE_COLORS[q.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];
        const srs = SRS_CONFIG[q.status];

        return (
          <div
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            className="group relative bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-blue-500/60 rounded-xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-xs hover:shadow-md w-full max-w-full"
          >
            {/* Clean Card Header */}
            <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center justify-between text-xs border-b border-slate-100 bg-slate-50/50 min-w-0">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate min-w-0 pr-2">
                <span className="font-bold text-slate-900 shrink-0">{q.subject}</span>
                <span className="text-slate-400 shrink-0">/</span>
                <span className="truncate text-slate-600 font-medium">{q.chapter}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Star Button */}
                <button
                  type="button"
                  onClick={(e) => onToggleStar(q, e)}
                  className="p-1 rounded hover:bg-slate-100 transition-transform active:scale-125"
                  title={q.starred ? "Starred (Click to unstar)" : "Click to star"}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      q.starred
                        ? "text-orange-500 fill-orange-500 filter drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  />
                </button>

                {due && (
                  <span className="text-orange-700 text-[10px] font-mono font-bold bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                    DUE
                  </span>
                )}
                {isNemesis && (
                  <span className="text-rose-700 text-[10px] font-mono font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    NEMESIS
                  </span>
                )}
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                  q.status === 4 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  q.status === 3 ? "bg-blue-50 text-blue-700 border-blue-200" :
                  q.status === 2 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-rose-50 text-rose-700 border-rose-200"
                }`}>
                  S{q.status}
                </span>
              </div>
            </div>

            {/* Subtopic */}
            <div className="px-3 sm:px-3.5 py-2 flex items-center justify-between gap-2 min-w-0 w-full">
              <h4 className="text-xs font-bold text-slate-900 truncate min-w-0 flex-1 group-hover:text-blue-600 transition-colors">
                {q.subtopic}
              </h4>
              <span
                className={`text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border shrink-0 font-medium ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}
              >
                {q.errorType}
              </span>
            </div>

            {/* Photo Viewport */}
            <div className="relative aspect-[16/10] bg-slate-50 border-y border-slate-100 overflow-hidden flex items-center justify-center p-2">
              <img
                src={currentTab === "question" ? q.questionImage : q.solutionImage || q.questionImage}
                alt={q.id}
                className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-200"
                referrerPolicy="no-referrer"
              />

              {/* Dual image switcher only if solution exists */}
              {q.solutionImage && (
                <div
                  className="absolute bottom-2 left-2 flex items-center gap-0.5 p-0.5 bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-md text-[10px] font-medium z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => toggleTab(q.id, "question", e)}
                    className={`px-1.5 py-0.5 rounded ${
                      currentTab === "question" ? "bg-blue-600 text-white font-semibold" : "text-slate-600"
                    }`}
                  >
                    Question
                  </button>
                  <button
                    onClick={(e) => toggleTab(q.id, "solution", e)}
                    className={`px-1.5 py-0.5 rounded ${
                      currentTab === "solution" ? "bg-orange-500 text-white font-semibold" : "text-slate-600"
                    }`}
                  >
                    Solution
                  </button>
                </div>
              )}

              {/* Quick Actions (visible on mobile, hover on desktop) */}
              <div
                className="absolute top-2 right-2 flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onPracticeSingle(q)}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                  title="Practice blind"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => onSelectQuestion(q)}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
                  title="Deep-dive details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete question ${q.id}?`)) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-1.5 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Key Concept (RAR formula box - if exists) */}
            {q.keyConcept && (
              <div className="px-3.5 py-2 bg-blue-50/70 border-b border-blue-100/60">
                <div className="text-[11px] text-blue-900 font-mono line-clamp-1">
                  <MathRenderer content={q.keyConcept} />
                </div>
              </div>
            )}

            {/* Clean Card Footer */}
            <div className="px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500 bg-white">
              <span className="font-medium text-slate-600">{q.source}</span>
              <span className={due ? "text-orange-600 font-bold" : "text-slate-500"}>
                {due ? "Due Today" : q.nextReviewDate}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
