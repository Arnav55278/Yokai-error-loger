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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#05070c] select-none text-xs">
      {/* Top Controls Header */}
      <div className="p-4 border-b border-white/[0.08] bg-[#080b12]/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              MASTER JEE ADVANCED FORMULA &amp; RAR CHEATSHEET
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Auto-compiled golden results, traps &amp; formulas extracted from your mistakes ({formulaItems.length} Formulas Active)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Subject Pills */}
          <div className="flex items-center p-1 bg-black/60 border border-white/[0.08] rounded-lg">
            {(["ALL", "Physics", "Chemistry", "Mathematics"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedSubject === s
                    ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formula, equation..."
              className="w-full bg-[#05070a] border border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {groupedFormulas.length > 0 ? (
          groupedFormulas.map((group) => (
            <div key={`${group.subject}-${group.chapter}`} className="space-y-3">
              {/* Group Chapter Title */}
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-slate-200 text-xs tracking-wide">
                    {group.subject} &gt; {group.chapter}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
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
                      className="group relative bg-[#0b0e17] hover:bg-[#101422] border border-white/[0.08] hover:border-sky-500/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                    >
                      <div>
                        {/* Top Card Info */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="font-mono text-sky-400 font-semibold text-[11px]">
                            {q.id}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                            {q.errorType}
                          </span>
                        </div>

                        {/* Subtopic */}
                        <h4 className="font-semibold text-slate-200 text-xs mb-3 truncate">
                          {q.subtopic}
                        </h4>

                        {/* LaTeX Formula Highlight Card */}
                        <div className="p-3 bg-[#030509] border border-sky-500/25 rounded-lg mb-3 shadow-inner">
                          <MathRenderer
                            content={q.keyConcept}
                            className="text-sky-300 font-mono text-sm leading-relaxed"
                            block
                          />
                        </div>

                        {/* Student Note / Why it went wrong */}
                        {q.studentNote && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-3 bg-white/[0.01] px-2 py-1 rounded border border-white/[0.04]">
                            "{q.studentNote}"
                          </p>
                        )}
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleCopyFormula(q.id, q.keyConcept)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-300 font-mono transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied LaTeX</span>
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
                          className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer group-hover:translate-x-0.5 transition-transform"
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
          <div className="p-16 text-center border-2 border-dashed border-white/[0.08] rounded-2xl bg-white/[0.01]">
            <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
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
