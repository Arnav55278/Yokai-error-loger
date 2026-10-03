import React, { useState } from "react";
import {
  ArrowUpDown,
  Play,
  ExternalLink,
  Trash2,
  Clock,
  Flame,
  Star,
} from "lucide-react";
import { QuestionMistake } from "../types/vault";
import { ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";
import { isDueToday, isNemesisQuestion } from "../utils/srsEngine";

interface TableViewProps {
  questions: QuestionMistake[];
  onSelectQuestion: (question: QuestionMistake) => void;
  onPracticeSingle: (question: QuestionMistake) => void;
  onToggleStar: (question: QuestionMistake, e: React.MouseEvent) => void;
  onDeleteQuestion: (id: string) => void;
}

type SortField = "id" | "createdAt" | "subject" | "chapter" | "status" | "attemptCount" | "nextReviewDate";

export const TableView: React.FC<TableViewProps> = ({
  questions,
  onSelectQuestion,
  onPracticeSingle,
  onToggleStar,
  onDeleteQuestion,
}) => {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "createdAt" || sortField === "nextReviewDate") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const formatSeconds = (sec?: number) => {
    if (!sec) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  return (
    <div className="flex-1 overflow-x-auto select-none custom-scrollbar w-full max-w-full">
      <table className="min-w-[760px] w-full text-left text-xs border-collapse">
        <thead className="bg-[#0b0e14] sticky top-0 z-20 border-b border-white/[0.08] text-[11px] font-mono text-slate-400">
          <tr>
            <th
              onClick={() => handleSort("id")}
              className="py-2.5 px-4 font-medium cursor-pointer hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>ID</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
              </div>
            </th>
            <th
              onClick={() => handleSort("createdAt")}
              className="py-2.5 px-4 font-medium cursor-pointer hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>LOGGED</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
              </div>
            </th>
            <th
              onClick={() => handleSort("subject")}
              className="py-2.5 px-4 font-medium cursor-pointer hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>SUBJECT / CHAPTER / SUBTOPIC</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
              </div>
            </th>
            <th className="py-2.5 px-4 font-medium">ROOT CAUSE</th>
            <th className="py-2.5 px-4 font-medium">SOURCE</th>
            <th
              onClick={() => handleSort("status")}
              className="py-2.5 px-4 font-medium cursor-pointer hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>SRS STAGE</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
              </div>
            </th>
            <th
              onClick={() => handleSort("nextReviewDate")}
              className="py-2.5 px-4 font-medium cursor-pointer hover:text-white transition-colors text-right"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>DUE DATE</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
              </div>
            </th>
            <th
              onClick={() => handleSort("attemptCount")}
              className="py-2.5 px-4 font-medium cursor-pointer hover:text-white transition-colors text-right"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>TRIES / BEST</span>
                <ArrowUpDown className="w-3 h-3 text-slate-600" />
              </div>
            </th>
            <th className="py-2.5 px-4 font-medium text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {sortedQuestions.map((q) => {
            const isNemesis = isNemesisQuestion(q);
            const due = isDueToday(q.nextReviewDate);
            const errorStyle = ERROR_TYPE_COLORS[q.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];
            const srs = SRS_CONFIG[q.status];

            return (
              <tr
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                {/* ID & Star & Thumbnail */}
                <td className="py-2 px-4 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(q, e);
                      }}
                      className="p-0.5 rounded hover:bg-white/[0.08]"
                      title={q.starred ? "Unstar" : "Star"}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          q.starred
                            ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]"
                            : "text-slate-600 hover:text-slate-400"
                        }`}
                      />
                    </button>

                    {q.questionImage && (
                      <div className="w-8 h-6 rounded border border-white/[0.1] bg-black/60 overflow-hidden shrink-0">
                        <img src={q.questionImage} alt={q.id} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <span className="group-hover:text-sky-300 font-semibold">{q.id}</span>
                    {due && <Clock className="w-3 h-3 text-amber-400 shrink-0" />}
                    {isNemesis && <Flame className="w-3 h-3 text-rose-400 shrink-0" />}
                  </div>
                </td>

                {/* Logged Date */}
                <td className="py-2 px-4 font-mono text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                  {q.createdAt.split("T")[0]}
                </td>

                {/* Subject / Chapter / Subtopic */}
                <td className="py-2 px-4 max-w-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5 truncate">
                    <span className="font-semibold text-slate-200">{q.subject}</span>
                    <span className="text-slate-600">/</span>
                    <span className="truncate">{q.chapter}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-100 truncate">{q.subtopic}</div>
                </td>

                {/* Root Cause */}
                <td className="py-2 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block text-[11px] px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}
                  >
                    {q.errorType}
                  </span>
                </td>

                {/* Source & Level */}
                <td className="py-2 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  <div>{q.source}</div>
                  <div className="text-[10px] text-slate-500">{q.level}</div>
                </td>

                {/* SRS Stage */}
                <td className="py-2 px-4 font-mono text-[11px] whitespace-nowrap">
                  <span className={`font-semibold ${srs.badgeColor}`}>{srs.name}</span>
                </td>

                {/* Due Date */}
                <td className="py-2 px-4 font-mono text-[11px] text-right tabular-nums whitespace-nowrap">
                  <span className={due ? "text-amber-400 font-bold" : "text-slate-400"}>
                    {q.nextReviewDate}
                  </span>
                </td>

                {/* Tries / Best */}
                <td className="py-2 px-4 font-mono text-[11px] text-right tabular-nums whitespace-nowrap">
                  <span className="text-slate-300 font-semibold">{q.attemptCount}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-slate-400">{formatSeconds(q.bestSolveTimeSeconds)}</span>
                </td>

                {/* Actions */}
                <td
                  className="py-2 px-4 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPracticeSingle(q)}
                      className="p-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 transition-colors"
                      title="Practice this question"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => onSelectQuestion(q)}
                      className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
                      title="View details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete question ${q.id}?`)) {
                          onDeleteQuestion(q.id);
                        }
                      }}
                      className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
