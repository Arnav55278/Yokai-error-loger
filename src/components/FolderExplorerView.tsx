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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none text-xs">
      {/* Top Header Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        {/* Subject Folder Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg">
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
                    ? "bg-white text-blue-700 font-bold border border-slate-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Folder className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600 fill-blue-500/20" : "text-slate-400"}`} />
                <span>{subj}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  count > 0 ? "bg-blue-50 text-blue-700 border-blue-200 font-bold" : "bg-slate-200/50 text-slate-500 border-slate-300"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Layout Toggle & Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px]">
            <button
              onClick={() => setViewLayout("split")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewLayout === "split"
                  ? "bg-white text-blue-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Dual-Pane Tree &amp; Photos View"
            >
              Split Tree
            </button>
            <button
              onClick={() => setViewLayout("accordion")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewLayout === "accordion"
                  ? "bg-white text-blue-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Expanded Accordion Folders"
            >
              Accordion
            </button>
          </div>

          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chapters in folders..."
              className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Mode A: Split Tree Explorer (Left Tree + Right Photos & Questions) */}
      {viewLayout === "split" ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Nested Folder Tree */}
          <div className="w-80 sm:w-96 border-r border-slate-200 bg-white flex flex-col overflow-y-auto custom-scrollbar">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="font-bold uppercase tracking-wider text-slate-700">
                {selectedSubject} CHAPTERS ({allChaptersForSubject.length})
              </span>
              <span className="text-slate-400">
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
                      className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnitExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-600" />
                        )}
                        <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800 text-xs truncate">{unit.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        totalUnitMistakes > 0
                          ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}>
                        {totalUnitMistakes}
                      </span>
                    </button>

                    {/* Chapters inside Unit */}
                    {isUnitExpanded && (
                      <div className="pl-4 pr-1 space-y-0.5 border-l border-slate-200 ml-4">
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
                                  ? "bg-blue-50 border border-blue-200 text-blue-800 font-bold shadow-xs"
                                  : "hover:bg-slate-50 text-slate-700 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <Folder
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive
                                      ? "text-blue-600 fill-blue-500/30"
                                      : hasMistakes
                                      ? "text-blue-500"
                                      : "text-slate-400"
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
                                        className="w-4 h-4 rounded-full border border-white bg-slate-100 overflow-hidden shadow-xs shrink-0"
                                      >
                                        <img src={q.questionImage} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                    hasMistakes
                                      ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                                      : "text-slate-400 border-transparent"
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
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50">
            {/* Folder Header Banner */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white/95 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
              <div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <span>{selectedSubject}</span>
                  <span>&gt;</span>
                  <span>{activeChapterObj?.unitName || "Unit"}</span>
                  <span>&gt;</span>
                  <span className="text-blue-600 font-bold">Active Folder</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {activeChapterName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold">
                    {activeChapterQuestions.length} {activeChapterQuestions.length === 1 ? "Photo Log" : "Photo Logs"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeChapterQuestions.length > 0 && (
                  <button
                    onClick={() => onPracticeSingle(activeChapterQuestions[0])}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Practice Folder ({activeChapterQuestions.length})</span>
                  </button>
                )}
                <button
                  onClick={onOpenIngestion}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
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
                        className="group relative bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-blue-400 rounded-xl overflow-hidden transition-all duration-200 flex flex-col cursor-pointer shadow-xs hover:shadow-md"
                      >
                        {/* Card Header */}
                        <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-700 font-bold text-xs">{q.id}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                              {q.errorType}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Star Toggle */}
                            <button
                              type="button"
                              onClick={(e) => onToggleStar(q, e)}
                              className="p-1 rounded hover:bg-slate-200 transition-transform active:scale-125"
                              title={q.starred ? "Unstar" : "Star"}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  q.starred
                                    ? "text-orange-500 fill-orange-500"
                                    : "text-slate-300 hover:text-slate-500"
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPracticeSingle(q);
                              }}
                              className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                              title="Practice blind"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        </div>

                        {/* Dual Photo Viewport */}
                        <div className="relative aspect-[16/10] bg-slate-100 p-2 flex items-center justify-center overflow-hidden border-b border-slate-100">
                          <img
                            src={q.questionImage}
                            alt="Question Photo"
                            className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform"
                          />

                          {/* If Solution Photo exists, show a mini indicator */}
                          {q.solutionImage && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-[10px] text-slate-700 font-mono shadow-xs">
                              <ImageIcon className="w-3 h-3 text-blue-600" />
                              <span>Solution Photo Included</span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex items-center gap-1 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-700 shadow-xs font-semibold">
                              {q.source}
                            </span>
                          </div>
                        </div>

                        {/* Subtopic & Concept Details */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="font-semibold text-slate-900 text-xs line-clamp-1 group-hover:text-blue-700">
                              {q.subtopic}
                            </div>
                            {q.keyConcept && (
                              <div className="mt-1 text-[11px] text-blue-800 font-mono line-clamp-1 bg-blue-50/70 border border-blue-200 px-2 py-0.5 rounded">
                                <MathRenderer content={q.keyConcept} />
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span className={`font-semibold ${srs.badgeColor}`}>
                              Stage {q.status} ({srs.name.split(":")[1]})
                            </span>
                            <span className={due ? "text-orange-600 font-bold" : "text-slate-500"}>
                              {due ? "⚠ Due Today" : `Next: ${q.nextReviewDate}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  <Folder className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">
                    No Mistake Photos in "{activeChapterName}"
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                    Take a screenshot from your test paper or problem set and log it into this folder.
                  </p>
                  <button
                    onClick={onOpenIngestion}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50">
          {units.map((unit) => {
            const filteredChapters = unit.chapters.filter((ch) =>
              !searchFilter || ch.name.toLowerCase().includes(searchFilter.toLowerCase())
            );

            if (filteredChapters.length === 0) return null;

            return (
              <div key={unit.name} className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] uppercase tracking-wider px-1">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">{unit.name}</span>
                </div>

                <div className="space-y-2 pl-2 border-l border-slate-200">
                  {filteredChapters.map((ch) => {
                    const chapterQuestions = questions.filter(
                      (q) => q.subject === selectedSubject && q.chapter === ch.name
                    );
                    const hasQuestions = chapterQuestions.length > 0;

                    return (
                      <div
                        key={ch.name}
                        className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 transition-all shadow-xs"
                      >
                        {/* Folder Info */}
                        <div className="flex items-center gap-2.5 min-w-[240px]">
                          <Folder
                            className={`w-4 h-4 shrink-0 ${
                              hasQuestions ? "text-blue-600 fill-blue-500/20" : "text-slate-400"
                            }`}
                          />
                          <span className="font-semibold text-slate-800 text-xs">{ch.name}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              hasQuestions
                                ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                          >
                            {chapterQuestions.length} {chapterQuestions.length === 1 ? "photo" : "photos"}
                          </span>
                        </div>

                        {/* Respective Photos Preview Strip right next to folder */}
                        {hasQuestions ? (
                          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 mr-1">
                              PHOTOS:
                            </span>
                            {chapterQuestions.map((q) => (
                              <div
                                key={q.id}
                                onClick={() => onSelectQuestion(q)}
                                className="relative group w-16 h-12 rounded-lg border border-slate-200 hover:border-blue-500 overflow-hidden bg-slate-100 shrink-0 cursor-pointer shadow-xs transition-all hover:scale-105"
                                title={`${q.id}: ${q.subtopic}`}
                              >
                                <img
                                  src={q.questionImage}
                                  alt={q.id}
                                  className="w-full h-full object-cover"
                                />
                                {q.starred && (
                                  <div className="absolute top-0.5 right-0.5 bg-white/90 rounded p-0.5 shadow-xs">
                                    <Star className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 font-mono italic">
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
