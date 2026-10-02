import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Star,
  Play,
  ExternalLink,
  Trash2,
  FileQuestion,
  Search,
  Plus,
  Layers,
  Sparkles,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import { QuestionMistake, SubjectType } from "../types/vault";
import { JEE_SYLLABUS, ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";
import { MathRenderer } from "./MathRenderer";
import { isDueToday, isNemesisQuestion } from "../utils/srsEngine";

interface FolderExplorerViewProps {
  questions: QuestionMistake[];
  onSelectQuestion: (question: QuestionMistake) => void;
  onPracticeSingle: (question: QuestionMistake) => void;
  onToggleStar: (question: QuestionMistake, e: React.MouseEvent) => void;
  onDeleteQuestion: (id: string) => void;
  onOpenIngestion: () => void;
}

export const FolderExplorerView: React.FC<FolderExplorerViewProps> = ({
  questions,
  onSelectQuestion,
  onPracticeSingle,
  onToggleStar,
  onDeleteQuestion,
  onOpenIngestion,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>("Physics");
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [viewLayout, setViewLayout] = useState<"split" | "accordion">("split");
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    "General & Mechanics": true,
    "Physical Chemistry": true,
    "Calculus": true,
  });

  const subjectData = JEE_SYLLABUS.find((s) => s.subject === selectedSubject);
  const units = subjectData?.units || [];

  // Toggle unit expansion in tree
  const toggleUnit = (unitName: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitName]: !prev[unitName],
    }));
  };

  // Find all chapters for this subject
  const allChaptersForSubject = units.flatMap((u) =>
    u.chapters.map((c) => ({
      ...c,
      unitName: u.name,
      questionsCount: questions.filter((q) => q.subject === selectedSubject && q.chapter === c.name).length,
    }))
  );

  // Default active chapter to the first one with questions or first available
  const activeChapterName =
    selectedChapter ||
    allChaptersForSubject.find((c) => c.questionsCount > 0)?.name ||
    allChaptersForSubject[0]?.name ||
    "";

  // Active chapter questions
  const activeChapterQuestions = questions.filter(
    (q) => q.subject === selectedSubject && q.chapter === activeChapterName
  );

  const activeChapterObj = allChaptersForSubject.find((c) => c.name === activeChapterName);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#05070c] select-none text-xs">
      {/* Top Header Bar */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#080b12]/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Subject Folder Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/60 border border-white/[0.08] rounded-lg">
          {(["Physics", "Chemistry", "Mathematics"] as SubjectType[]).map((subj) => {
            const count = questions.filter((q) => q.subject === subj).length;
            const isSelected = selectedSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => {
                  setSelectedSubject(subj);
                  setSelectedChapter(null); // Reset to first with questions
                }}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-2 transition-all ${
                  isSelected
                    ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Folder className={`w-3.5 h-3.5 ${isSelected ? "text-sky-400 fill-sky-400/30" : "text-slate-500"}`} />
                <span>{subj}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  count > 0 ? "bg-sky-500/20 text-sky-300 border-sky-500/30" : "bg-white/[0.03] text-slate-500 border-white/[0.06]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Layout Toggle & Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-black/40 border border-white/[0.08] rounded-md text-[11px]">
            <button
              onClick={() => setViewLayout("split")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewLayout === "split"
                  ? "bg-white/[0.1] text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Dual-Pane Tree &amp; Photos View"
            >
              Split Tree
            </button>
            <button
              onClick={() => setViewLayout("accordion")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewLayout === "accordion"
                  ? "bg-white/[0.1] text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Expanded Accordion Folders"
            >
              Accordion
            </button>
          </div>

          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chapters in folders..."
              className="w-full bg-[#05070a] border border-white/[0.08] focus:border-sky-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mode A: Split Tree Explorer (Left Tree + Right Photos & Questions) */}
      {viewLayout === "split" ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Nested Folder Tree */}
          <div className="w-80 sm:w-96 border-r border-white/[0.07] bg-[#070a12] flex flex-col overflow-y-auto custom-scrollbar">
            <div className="p-3 border-b border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                {selectedSubject} CHAPTERS ({allChaptersForSubject.length})
              </span>
              <span className="text-slate-500">
                {questions.filter((q) => q.subject === selectedSubject).length} photos logged
              </span>
            </div>

            <div className="p-2 space-y-1">
              {units.map((unit) => {
                const isUnitExpanded = expandedUnits[unit.name] ?? true;
                const unitChapters = unit.chapters.filter(
                  (c) => !searchFilter || c.name.toLowerCase().includes(searchFilter.toLowerCase())
                );

                if (unitChapters.length === 0) return null;

                const totalUnitMistakes = unitChapters.reduce((acc, c) => {
                  return acc + questions.filter((q) => q.subject === selectedSubject && q.chapter === c.name).length;
                }, 0);

                return (
                  <div key={unit.name} className="space-y-0.5">
                    {/* Unit Accordion Toggle */}
                    <button
                      onClick={() => toggleUnit(unit.name)}
                      className="w-full px-2.5 py-1.5 rounded flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnitExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:text-slate-300" />
                        )}
                        <FolderOpen className="w-3.5 h-3.5 text-sky-400/80 shrink-0" />
                        <span className="font-medium text-slate-200 text-xs truncate">{unit.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        totalUnitMistakes > 0
                          ? "bg-sky-500/15 text-sky-300 border-sky-500/30 font-bold"
                          : "bg-white/[0.02] text-slate-500 border-white/[0.05]"
                      }`}>
                        {totalUnitMistakes}
                      </span>
                    </button>

                    {/* Chapters inside Unit */}
                    {isUnitExpanded && (
                      <div className="pl-4 pr-1 space-y-0.5 border-l border-white/[0.06] ml-4">
                        {unitChapters.map((ch) => {
                          const chMistakes = questions.filter(
                            (q) => q.subject === selectedSubject && q.chapter === ch.name
                          );
                          const isActive = activeChapterName === ch.name;
                          const hasMistakes = chMistakes.length > 0;

                          return (
                            <button
                              key={ch.name}
                              onClick={() => setSelectedChapter(ch.name)}
                              className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-all ${
                                isActive
                                  ? "bg-sky-500/15 border border-sky-500/35 text-white font-medium shadow-[0_0_12px_rgba(56,189,248,0.12)]"
                                  : "hover:bg-white/[0.04] text-slate-300 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <Folder
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive
                                      ? "text-sky-400 fill-sky-400/40"
                                      : hasMistakes
                                      ? "text-sky-400/70"
                                      : "text-slate-600"
                                  }`}
                                />
                                <span className="text-xs truncate">{ch.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Thumbnail dots if has photos */}
                                {hasMistakes && (
                                  <div className="flex -space-x-1 overflow-hidden">
                                    {chMistakes.slice(0, 3).map((q) => (
                                      <div
                                        key={q.id}
                                        className="w-4 h-4 rounded-full border border-black/80 bg-black overflow-hidden shadow-xs shrink-0"
                                      >
                                        <img src={q.questionImage} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                    hasMistakes
                                      ? "bg-sky-500/20 border-sky-500/40 text-sky-300 font-bold"
                                      : "text-slate-600 border-transparent"
                                  }`}
                                >
                                  {chMistakes.length}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Respective Photos & Questions of Selected Folder */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[#05070a]">
            {/* Folder Header Banner */}
            <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-[#0a0d16]/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <span>{selectedSubject}</span>
                  <span>&gt;</span>
                  <span>{activeChapterObj?.unitName || "Unit"}</span>
                  <span>&gt;</span>
                  <span className="text-sky-400 font-bold">Active Folder</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {activeChapterName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono text-xs font-semibold">
                    {activeChapterQuestions.length} {activeChapterQuestions.length === 1 ? "Photo Log" : "Photo Logs"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeChapterQuestions.length > 0 && (
                  <button
                    onClick={() => onPracticeSingle(activeChapterQuestions[0])}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-md text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Practice Folder ({activeChapterQuestions.length})</span>
                  </button>
                )}
                <button
                  onClick={onOpenIngestion}
                  className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white font-medium rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Log Into This Folder</span>
                </button>
              </div>
            </div>

            {/* Questions Grid with Respective Photos */}
            <div className="p-5">
              {activeChapterQuestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {activeChapterQuestions.map((q) => {
                    const errorStyle = ERROR_TYPE_COLORS[q.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];
                    const srs = SRS_CONFIG[q.status];
                    const due = isDueToday(q.nextReviewDate);
                    const isNemesis = isNemesisQuestion(q);

                    return (
                      <div
                        key={q.id}
                        onClick={() => onSelectQuestion(q)}
                        className="group relative bg-[#0c101a] hover:bg-[#101524] border border-white/[0.08] hover:border-sky-500/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                      >
                        {/* Card Header */}
                        <div className="p-3 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sky-400 font-semibold text-xs">{q.id}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                              {q.errorType}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Star Toggle */}
                            <button
                              type="button"
                              onClick={(e) => onToggleStar(q, e)}
                              className="p-1 rounded hover:bg-white/[0.08] transition-transform active:scale-125"
                              title={q.starred ? "Unstar" : "Star"}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  q.starred
                                    ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPracticeSingle(q);
                              }}
                              className="p-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded"
                              title="Practice blind"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Dual Photo Viewport */}
                        <div className="relative aspect-[16/10] bg-[#030508] p-2 flex items-center justify-center overflow-hidden border-b border-white/[0.04]">
                          <img
                            src={q.questionImage}
                            alt="Question Photo"
                            className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform"
                          />

                          {/* If Solution Photo exists, show a mini indicator */}
                          {q.solutionImage && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 border border-white/[0.1] text-[10px] text-slate-300 font-mono shadow">
                              <ImageIcon className="w-3 h-3 text-sky-400" />
                              <span>Solution Photo Included</span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex items-center gap-1 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-black/80 border border-white/[0.1] text-slate-300">
                              {q.source}
                            </span>
                          </div>
                        </div>

                        {/* Subtopic & Concept Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="font-semibold text-slate-100 text-xs line-clamp-1 group-hover:text-sky-200">
                              {q.subtopic}
                            </div>
                            {q.keyConcept && (
                              <div className="mt-1 text-[11px] text-sky-300/90 font-mono line-clamp-1 bg-sky-950/20 border border-sky-500/20 px-2 py-0.5 rounded">
                                <MathRenderer content={q.keyConcept} />
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className={`font-semibold ${srs.badgeColor}`}>
                              Stage {q.status} ({srs.name.split(":")[1]})
                            </span>
                            <span className={due ? "text-amber-400 font-bold" : "text-slate-500"}>
                              {due ? "⚠ Due Today" : `Next: ${q.nextReviewDate}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
                  <Folder className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">
                    No Mistake Photos in "{activeChapterName}"
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    Take a screenshot from your test paper or problem set and log it into this folder.
                  </p>
                  <button
                    onClick={onOpenIngestion}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-md text-xs shadow-md transition-all"
                  >
                    + Log First Mistake in {activeChapterName}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: Accordion View (Folder strip with respective photos next to it) */
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {units.map((unit) => {
            const filteredChapters = unit.chapters.filter((ch) =>
              !searchFilter || ch.name.toLowerCase().includes(searchFilter.toLowerCase())
            );

            if (filteredChapters.length === 0) return null;

            return (
              <div key={unit.name} className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] uppercase tracking-wider px-1">
                  <FolderOpen className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-slate-200">{unit.name}</span>
                </div>

                <div className="space-y-2 pl-2 border-l border-white/[0.08]">
                  {filteredChapters.map((ch) => {
                    const chapterQuestions = questions.filter(
                      (q) => q.subject === selectedSubject && q.chapter === ch.name
                    );
                    const hasQuestions = chapterQuestions.length > 0;

                    return (
                      <div
                        key={ch.name}
                        className="bg-[#0b0f19] border border-white/[0.07] hover:border-white/[0.14] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 transition-all"
                      >
                        {/* Folder Info */}
                        <div className="flex items-center gap-2.5 min-w-[240px]">
                          <Folder
                            className={`w-4 h-4 shrink-0 ${
                              hasQuestions ? "text-sky-400 fill-sky-400/30" : "text-slate-600"
                            }`}
                          />
                          <span className="font-semibold text-slate-100 text-xs">{ch.name}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              hasQuestions
                                ? "bg-sky-500/15 border-sky-500/30 text-sky-300 font-bold"
                                : "bg-white/[0.02] border-white/[0.05] text-slate-500"
                            }`}
                          >
                            {chapterQuestions.length} {chapterQuestions.length === 1 ? "photo" : "photos"}
                          </span>
                        </div>

                        {/* Respective Photos Preview Strip right next to folder */}
                        {hasQuestions ? (
                          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5 shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 shrink-0 mr-1">
                              PHOTOS:
                            </span>
                            {chapterQuestions.map((q) => (
                              <div
                                key={q.id}
                                onClick={() => onSelectQuestion(q)}
                                className="relative group w-16 h-12 rounded border border-white/[0.12] hover:border-sky-400 overflow-hidden bg-black/70 shrink-0 cursor-pointer shadow transition-all hover:scale-105"
                                title={`${q.id}: ${q.subtopic}`}
                              >
                                <img
                                  src={q.questionImage}
                                  alt={q.id}
                                  className="w-full h-full object-cover"
                                />
                                {q.starred && (
                                  <div className="absolute top-0.5 right-0.5 bg-black/80 rounded p-0.5">
                                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-600 font-mono italic">
                            Empty folder
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
