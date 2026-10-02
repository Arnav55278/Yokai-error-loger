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
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
          <ImageIcon className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">No Mistakes in View</h3>
        <p className="text-xs text-slate-500 max-w-sm mb-4">
          Adjust your filters on the left or log a new question screenshot to your vault.
        </p>
        <button
          onClick={onOpenIngestion}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
        >
          + Log First Mistake
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5 select-none">
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
            className="group relative bg-[#0b0e17] hover:bg-[#101422] border border-white/[0.07] hover:border-sky-500/40 rounded-xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          >
            {/* Clean Card Header */}
            <div className="px-3.5 py-2.5 flex items-center justify-between text-xs border-b border-white/[0.04] bg-white/[0.01]">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate pr-2">
                <span className="font-semibold text-slate-200">{q.subject}</span>
                <span className="text-slate-600">/</span>
                <span className="truncate text-slate-300">{q.chapter}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Star Button */}
                <button
                  type="button"
                  onClick={(e) => onToggleStar(q, e)}
                  className="p-1 rounded hover:bg-white/[0.08] transition-transform active:scale-125"
                  title={q.starred ? "Starred (Click to unstar)" : "Click to star"}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      q.starred
                        ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                        : "text-slate-600 hover:text-slate-300"
                    }`}
                  />
                </button>

                {due && (
                  <span className="text-amber-400 text-[10px] font-mono font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    DUE
                  </span>
                )}
                {isNemesis && (
                  <span className="text-rose-400 text-[10px] font-mono font-semibold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                    NEMESIS
                  </span>
                )}
                <span className={`text-[10px] font-mono font-medium ${srs.badgeColor}`}>
                  S{q.status}
                </span>
              </div>
            </div>

            {/* Subtopic */}
            <div className="px-3.5 py-2 flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                {q.subtopic}
              </h4>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}
              >
                {q.errorType}
              </span>
            </div>

            {/* Photo Viewport */}
            <div className="relative aspect-[16/10] bg-[#04060a] border-y border-white/[0.04] overflow-hidden flex items-center justify-center p-2">
              <img
                src={currentTab === "question" ? q.questionImage : q.solutionImage || q.questionImage}
                alt={q.id}
                className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-200"
                referrerPolicy="no-referrer"
              />

              {/* Dual image switcher only if solution exists */}
              {q.solutionImage && (
                <div
                  className="absolute bottom-2 left-2 flex items-center gap-0.5 p-0.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-md text-[10px] font-medium z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => toggleTab(q.id, "question", e)}
                    className={`px-1.5 py-0.5 rounded ${
                      currentTab === "question" ? "bg-white/20 text-white font-semibold" : "text-slate-400"
                    }`}
                  >
                    Question
                  </button>
                  <button
                    onClick={(e) => toggleTab(q.id, "solution", e)}
                    className={`px-1.5 py-0.5 rounded ${
                      currentTab === "solution" ? "bg-sky-500/30 text-sky-200 font-semibold" : "text-slate-400"
                    }`}
                  >
                    Solution
                  </button>
                </div>
              )}

              {/* Hover Quick Actions */}
              <div
                className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onPracticeSingle(q)}
                  className="p-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-md shadow-md transition-colors"
                  title="Practice blind"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => onSelectQuestion(q)}
                  className="p-1.5 bg-black/80 hover:bg-black text-slate-200 rounded-md border border-white/10 transition-colors"
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
                  className="p-1.5 bg-black/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-md border border-white/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Key Concept (RAR formula box - if exists) */}
            {q.keyConcept && (
              <div className="px-3.5 py-2 bg-[#06080e] border-b border-white/[0.03]">
                <div className="text-[11px] text-sky-300 font-mono line-clamp-1">
                  <MathRenderer content={q.keyConcept} />
                </div>
              </div>
            )}

            {/* Clean Card Footer */}
            <div className="px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{q.source}</span>
              <span className={due ? "text-amber-400 font-semibold" : "text-slate-500"}>
                {due ? "Due Today" : q.nextReviewDate}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
