import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Copy,
  Check,
  Printer,
  ExternalLink,
  BookOpen,
  Folder,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { QuestionMistake, SubjectType } from "../types/vault";
import { MathRenderer } from "./MathRenderer";
import { ERROR_TYPE_COLORS } from "../constants/jeeSyllabus";

interface FormulaVaultViewProps {
  questions: QuestionMistake[];
  onSelectQuestion: (question: QuestionMistake) => void;
}

export const FormulaVaultView: React.FC<FormulaVaultViewProps> = ({
  questions,
  onSelectQuestion,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter questions that have a non-empty keyConcept
  const formulaItems = useMemo(() => {
    return questions.filter((q) => {
      if (!q.keyConcept || q.keyConcept.trim().length === 0) return false;
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const qStr = searchQuery.toLowerCase();
        return (
          q.keyConcept.toLowerCase().includes(qStr) ||
          q.chapter.toLowerCase().includes(qStr) ||
          q.subtopic.toLowerCase().includes(qStr) ||
          q.id.toLowerCase().includes(qStr)
        );
      }
      return true;
    });
  }, [questions, selectedSubject, searchQuery]);

  // Group formulas by Subject -> Chapter
  const groupedFormulas = useMemo(() => {
    const map = new Map<string, { subject: SubjectType; chapter: string; items: QuestionMistake[] }>();
    for (const q of formulaItems) {
      const key = `${q.subject}___${q.chapter}`;
      if (!map.has(key)) {
        map.set(key, { subject: q.subject, chapter: q.chapter, items: [] });
      }
      map.get(key)!.items.push(q);
    }
    return Array.from(map.values()).sort((a, b) => a.subject.localeCompare(b.subject) || a.chapter.localeCompare(b.chapter));
  }, [formulaItems]);

  const handleCopyFormula = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none text-xs w-full max-w-full text-slate-900">
      {/* Top Controls Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white/95 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shrink-0 w-full max-w-full shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
              JEE FORMULA &amp; RAR CHEATSHEET
            </h1>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 font-mono truncate">
            Auto-compiled golden results &amp; formulas ({formulaItems.length} Formulas Active)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Subject Pills */}
          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg overflow-x-auto custom-scrollbar shrink-0">
            {(["ALL", "Physics", "Chemistry", "Mathematics"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                  selectedSubject === s
                    ? "bg-white text-blue-700 font-bold border border-slate-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas..."
                className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans shadow-xs"
              />
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer font-semibold text-xs shrink-0 shadow-xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar w-full max-w-full bg-slate-50">
        {groupedFormulas.length > 0 ? (
          groupedFormulas.map((group) => (
            <div key={`${group.subject}-${group.chapter}`} className="space-y-3">
              {/* Group Chapter Title */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-xs tracking-wide">
                    {group.subject} &gt; {group.chapter}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    {group.items.length} {group.items.length === 1 ? "Formula" : "Formulas"}
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.items.map((q) => {
                  const errorStyle = ERROR_TYPE_COLORS[q.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];
                  const isCopied = copiedId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="group relative bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-blue-300 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md"
                    >
                      <div>
                        {/* Top Card Info */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="font-mono text-blue-700 font-bold text-[11px]">
                            {q.id}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                            {q.errorType}
                          </span>
                        </div>

                        {/* Subtopic */}
                        <h4 className="font-semibold text-slate-900 text-xs mb-3 truncate">
                          {q.subtopic}
                        </h4>

                        {/* LaTeX Formula Highlight Card */}
                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg mb-3 shadow-xs">
                          <MathRenderer
                            content={q.keyConcept}
                            className="text-blue-950 font-mono text-sm leading-relaxed"
                            block
                          />
                        </div>

                        {/* Student Note / Why it went wrong */}
                        {q.studentNote && (
                          <p className="text-[11px] text-slate-600 italic line-clamp-2 mb-3 bg-orange-50/50 px-2 py-1 rounded border border-orange-200 text-slate-700">
                            "{q.studentNote}"
                          </p>
                        )}
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleCopyFormula(q.id, q.keyConcept)}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 font-mono transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied LaTeX</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Formula</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onSelectQuestion(q)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-bold transition-colors cursor-pointer group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Inspect Problem</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              No Formulas or Key Concepts Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              When logging or editing mistakes, add golden formulas into the "Key Concept (RAR)" field. They will automatically be indexed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
