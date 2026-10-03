import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Play,
  CalendarClock,
  Flame,
  Cloud,
  X,
  Star,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { QuestionMistake } from "../types/vault";
import { ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionMistake[];
  onSelectQuestion: (question: QuestionMistake) => void;
  onOpenIngestion: () => void;
  onOpenPractice: () => void;
  onOpenSettings: () => void;
  onFilterDueToday: () => void;
  onFilterNemesis: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  questions,
  onSelectQuestion,
  onOpenIngestion,
  onOpenPractice,
  onOpenSettings,
  onFilterDueToday,
  onFilterNemesis,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Search questions across all 6 dimensions + OCR text
  const matchedQuestions = questions
    .filter((q) => {
      if (!normalizedQuery) return true;
      return (
        q.id.toLowerCase().includes(normalizedQuery) ||
        q.subtopic.toLowerCase().includes(normalizedQuery) ||
        q.chapter.toLowerCase().includes(normalizedQuery) ||
        q.subject.toLowerCase().includes(normalizedQuery) ||
        q.ocrText.toLowerCase().includes(normalizedQuery) ||
        q.keyConcept.toLowerCase().includes(normalizedQuery) ||
        q.studentNote.toLowerCase().includes(normalizedQuery) ||
        q.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
      );
    })
    .slice(0, 10);

  // Quick system actions
  const systemActions = [
    {
      id: "act-ingest",
      title: "+ Log New JEE Mistake (Ctrl + V / Paste Image)",
      category: "Action",
      icon: Plus,
      run: () => {
        onClose();
        onOpenIngestion();
      },
    },
    {
      id: "act-practice-due",
      title: "Practice Questions Due Today (Active Recall)",
      category: "Revision Preset",
      icon: CalendarClock,
      run: () => {
        onClose();
        onFilterDueToday();
        onOpenPractice();
      },
    },
    {
      id: "act-practice-nemesis",
      title: "Practice Nemesis (High-Failure) Questions",
      category: "Revision Preset",
      icon: Flame,
      run: () => {
        onClose();
        onFilterNemesis();
        onOpenPractice();
      },
    },
    {
      id: "act-settings",
      title: "Settings (Gemini API Key, Custom Model & Google Drive)",
      category: "Settings",
      icon: Cloud,
      run: () => {
        onClose();
        onOpenSettings();
      },
    },
  ].filter((act) => !normalizedQuery || act.title.toLowerCase().includes(normalizedQuery));

  const totalItems = systemActions.length + matchedQuestions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < systemActions.length) {
        systemActions[selectedIndex]?.run();
      } else {
        const qIndex = selectedIndex - systemActions.length;
        const q = matchedQuestions[qIndex];
        if (q) {
          onClose();
          onSelectQuestion(q);
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-16 px-2.5 sm:px-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search questions by OCR text, equation, chapter, subtopic, or ID..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-500 bg-white border border-slate-300 px-2 py-0.5 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-white">
          {/* System Actions */}
          {systemActions.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 pt-1 pb-1 text-[10px] font-mono text-slate-400 font-semibold tracking-wider">
                COMMANDS &amp; ACTIONS
              </div>
              {systemActions.map((act, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={act.run}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 border border-blue-200 shadow-xs"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                      <span className="font-medium text-xs">{act.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{act.category}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matched Questions with PROMINENT IMAGE PREVIEWS */}
          {matchedQuestions.length > 0 && (
            <div className="pt-2">
              <div className="px-2 pb-1.5 text-[10px] font-mono text-slate-500 font-semibold tracking-wider flex items-center justify-between">
                <span>QUESTIONS &amp; OCR MATCHES ({matchedQuestions.length})</span>
                <span className="text-blue-600 font-medium">Click question to open deep-dive</span>
              </div>

              <div className="space-y-2">
                {matchedQuestions.map((q, idx) => {
                  const globalIdx = systemActions.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  const errorStyle = ERROR_TYPE_COLORS[q.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        onClose();
                        onSelectQuestion(q);
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between gap-3 sm:gap-4 cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 shadow-sm"
                          : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 shadow-xs"
                      }`}
                    >
                      {/* Left: Dual / Question Photo Preview */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Question Image Preview Thumbnail */}
                        <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 shadow-xs flex items-center justify-center p-1">
                          <img
                            src={q.questionImage}
                            alt={q.id}
                            className="max-w-full max-h-full object-contain"
                          />
                          {q.solutionImage && (
                            <div
                              className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-[8px] font-mono text-white px-1 py-0.2 rounded"
                              title="Solution photo available"
                            >
                              +Sol
                            </div>
                          )}
                          {q.starred && (
                            <div className="absolute top-0.5 left-0.5 bg-white/90 p-0.5 rounded shadow-xs">
                              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            </div>
                          )}
                        </div>

                        {/* Text / Concept / OCR */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono text-slate-500">
                            <span className="text-blue-600 font-bold">{q.id}</span>
                            <span>·</span>
                            <span className="font-semibold text-slate-800">{q.subject}</span>
                            <span>/</span>
                            <span className="truncate">{q.chapter}</span>
                            {q.starred && (
                              <span className="text-amber-600 font-bold ml-1 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-current inline text-amber-500" />
                                <span>Priority</span>
                              </span>
                            )}
                          </div>

                          <div className="font-semibold text-slate-900 text-xs truncate">
                            {q.subtopic}
                          </div>

                          {q.ocrText && (
                            <div className="text-[11px] text-slate-600 line-clamp-1 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              "{q.ocrText}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Badges & Status */}
                      <div className="text-right shrink-0 space-y-1">
                        <span
                          className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}
                        >
                          {q.errorType}
                        </span>
                        <div className="text-[10px] font-mono text-slate-500">
                          Stage {q.status} · {q.source}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalItems === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No matching questions or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="h-10 px-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px]">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <span className="text-blue-600 font-medium">ApexVault Vision Search</span>
        </div>
      </div>
    </div>
  );
};
