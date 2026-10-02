import React, { useState } from "react";
import {
  Filter,
  RotateCcw,
  Star,
  Clock,
  Flame,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  FilterState,
  QuestionMistake,
  SubjectType,
  ErrorType,
  SRSStage,
  QuestionSource,
  ExamLevel,
} from "../types/vault";
import {
  ERROR_TYPES,
  ERROR_TYPE_COLORS,
  QUESTION_SOURCES,
  EXAM_LEVELS,
  SRS_CONFIG,
  JEE_SYLLABUS,
} from "../constants/jeeSyllabus";
import { isDueToday, isNemesisQuestion } from "../utils/srsEngine";

interface SidebarFiltersProps {
  filter: FilterState;
  onChangeFilter: (newFilter: FilterState) => void;
  questions: QuestionMistake[];
  onQuickPreset: (preset: FilterState["smartPreset"]) => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filter,
  onChangeFilter,
  questions,
  onQuickPreset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Counts
  const dueTodayCount = questions.filter((q) => isDueToday(q.nextReviewDate)).length;
  const nemesisCount = questions.filter((q) => isNemesisQuestion(q)).length;
  const starredCount = questions.filter((q) => q.starred).length;

  const countBySubject: Record<SubjectType, number> = {
    Physics: questions.filter((q) => q.subject === "Physics").length,
    Chemistry: questions.filter((q) => q.subject === "Chemistry").length,
    Mathematics: questions.filter((q) => q.subject === "Mathematics").length,
  };

  // Available chapters for selected subject
  const availableChapters =
    filter.subject !== "ALL"
      ? (JEE_SYLLABUS.find((s) => s.subject === filter.subject)?.units || []).flatMap((u) =>
          u.chapters.map((c) => c.name)
        )
      : [];

  const hasActiveFilters =
    filter.subject !== "ALL" ||
    filter.chapter !== "ALL" ||
    filter.errorTypes.length > 0 ||
    filter.sources.length > 0 ||
    filter.levels.length > 0 ||
    filter.srsStages.length > 0 ||
    filter.tags.length > 0 ||
    filter.smartPreset !== "all";

  const advancedFiltersActiveCount =
    filter.errorTypes.length +
    filter.srsStages.length +
    filter.sources.length +
    filter.levels.length +
    filter.tags.length;

  const resetFilters = () => {
    onChangeFilter({
      searchQuery: "",
      subject: "ALL",
      unit: "ALL",
      chapter: "ALL",
      errorTypes: [],
      sources: [],
      levels: [],
      srsStages: [],
      tags: [],
      smartPreset: "all",
    });
  };

  const toggleErrorType = (et: ErrorType) => {
    const next = filter.errorTypes.includes(et)
      ? filter.errorTypes.filter((t) => t !== et)
      : [...filter.errorTypes, et];
    onChangeFilter({ ...filter, errorTypes: next });
  };

  const toggleSRSStage = (stage: SRSStage) => {
    const next = filter.srsStages.includes(stage)
      ? filter.srsStages.filter((s) => s !== stage)
      : [...filter.srsStages, stage];
    onChangeFilter({ ...filter, srsStages: next });
  };

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#070a10] flex flex-col shrink-0 select-none text-xs">
      {/* Top Header */}
      <div className="h-11 px-4 border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>VAULT FILTERS</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {/* 1. Subjects Segmented Bar */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block mb-1.5 px-0.5">
            Subject Focus
          </label>
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/40 border border-white/[0.06] rounded-lg text-center">
            <button
              onClick={() => onChangeFilter({ ...filter, subject: "ALL", chapter: "ALL" })}
              className={`py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                filter.subject === "ALL"
                  ? "bg-white/[0.12] text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            {(["Physics", "Chemistry", "Mathematics"] as SubjectType[]).map((subj) => {
              const isSelected = filter.subject === subj;
              const shortName = subj === "Physics" ? "Phy" : subj === "Chemistry" ? "Chem" : "Math";
              return (
                <button
                  key={subj}
                  onClick={() => {
                    const next = filter.subject === subj ? "ALL" : subj;
                    onChangeFilter({ ...filter, subject: next, chapter: "ALL" });
                  }}
                  className={`py-1.5 rounded-md font-medium text-[11px] transition-colors ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Chapter Filter (If specific subject selected) */}
        {filter.subject !== "ALL" && availableChapters.length > 0 && (
          <div>
            <label className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block mb-1 px-0.5">
              Chapter
            </label>
            <div className="relative">
              <select
                value={filter.chapter}
                onChange={(e) => onChangeFilter({ ...filter, chapter: e.target.value })}
                className="w-full bg-[#05070a] border border-white/[0.08] focus:border-sky-500 rounded-md px-2.5 py-1.5 text-xs text-slate-200 appearance-none pr-7 focus:outline-none"
              >
                <option value="ALL">All {filter.subject} Chapters</option>
                {availableChapters.map((ch) => (
                  <option key={ch} value={ch} className="bg-[#0b0e14]">
                    {ch}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}

        {/* 3. Core Quick Presets */}
        <div>
          <label className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block mb-1.5 px-0.5">
            Quick Views
          </label>
          <div className="space-y-1">
            <button
              onClick={() => onQuickPreset("all")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                filter.smartPreset === "all" && !hasActiveFilters
                  ? "bg-white/[0.1] text-white font-semibold"
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>All Vault Items</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{questions.length}</span>
            </button>

            <button
              onClick={() => onQuickPreset("due_today")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                filter.smartPreset === "due_today"
                  ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Due for Review</span>
              </div>
              <span className={`font-mono text-[10px] font-bold ${dueTodayCount > 0 ? "text-amber-400" : "text-slate-500"}`}>
                {dueTodayCount}
              </span>
            </button>

            <button
              onClick={() => onQuickPreset("nemesis")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                filter.smartPreset === "nemesis"
                  ? "bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30"
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Nemesis (High Fails)</span>
              </div>
              <span className={`font-mono text-[10px] font-bold ${nemesisCount > 0 ? "text-rose-400" : "text-slate-500"}`}>
                {nemesisCount}
              </span>
            </button>

            <button
              onClick={() => onQuickPreset("starred")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                filter.smartPreset === "starred"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                  : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className={`w-3.5 h-3.5 ${starredCount > 0 ? "text-amber-400 fill-amber-400" : "text-slate-400"}`} />
                <span>Starred Questions</span>
              </div>
              <span className={`font-mono text-[10px] font-bold ${starredCount > 0 ? "text-amber-400" : "text-slate-500"}`}>
                {starredCount}
              </span>
            </button>
          </div>
        </div>

        {/* 4. Collapsible Advanced Filters Section */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-1 px-1 text-slate-400 hover:text-slate-200 text-[11px] font-mono transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {showAdvanced ? (
                <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>ADVANCED FILTERS</span>
            </div>
            {advancedFiltersActiveCount > 0 && (
              <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-[10px] font-bold">
                {advancedFiltersActiveCount}
              </span>
            )}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4 animate-in slide-in-from-top-1 duration-150 pl-1">
              {/* Root Cause */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  MISTAKE ROOT CAUSE
                </label>
                <div className="space-y-1">
                  {ERROR_TYPES.map((et) => {
                    const isChecked = filter.errorTypes.includes(et);
                    return (
                      <button
                        key={et}
                        onClick={() => toggleErrorType(et)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                          isChecked
                            ? "bg-white/[0.08] text-white font-medium"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="truncate pr-1 text-[11px]">{et}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {questions.filter((q) => q.errorType === et).length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mastery Stage */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  SRS MASTERY STAGE
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {([1, 2, 3, 4] as SRSStage[]).map((stage) => {
                    const isChecked = filter.srsStages.includes(stage);
                    const cfg = SRS_CONFIG[stage];
                    return (
                      <button
                        key={stage}
                        onClick={() => toggleSRSStage(stage)}
                        className={`px-2 py-1 rounded border text-[10px] font-mono transition-colors text-center ${
                          isChecked
                            ? "bg-white/[0.1] border-white/[0.3] text-white font-semibold"
                            : "bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Stage {stage}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
