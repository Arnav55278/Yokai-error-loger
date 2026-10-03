import React from "react";
import { X, Printer, Download, FileText, CheckCircle2 } from "lucide-react";
import { QuestionMistake } from "../types/vault";

interface PrintableDppModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionMistake[];
}

export const PrintableDppModal: React.FC<PrintableDppModalProps> = ({
  isOpen,
  onClose,
  questions,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-150 w-full max-w-full"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Printer className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
              PRINTABLE JEE DPP ({questions.length} QUESTIONS)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100 custom-scrollbar flex justify-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-xl p-5 sm:p-8 shadow-md border border-slate-200 space-y-6 print:p-0 print:shadow-none print:w-full print:border-none">
            {/* Authentic JEE Test Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-950">
                ApexVault — JEE Advanced Target Revision Paper
              </h1>
              <p className="text-xs text-slate-600 font-mono">
                Active Recall &amp; Blind Re-Attempt System · Date: {new Date().toLocaleDateString()}
              </p>
              <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-bold text-slate-800">
                <span>Total Questions: {questions.length}</span>
                <span>Max Marks: {questions.length * 4}</span>
                <span>Marking Scheme: +4 / -2 / 0</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8 divide-y divide-slate-200">
              {questions.map((q, idx) => (
                <div key={q.id} className="pt-6 first:pt-0 space-y-3 break-inside-avoid">
                  {/* Question Number & Tags */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      Question {idx + 1} [{q.subject} · {q.chapter}]
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      ID: {q.id} | Level: {q.level}
                    </span>
                  </div>

                  {/* Subtopic */}
                  <div className="text-xs font-semibold text-slate-700">
                    Topic: {q.subtopic}
                  </div>

                  {/* Question Image */}
                  <div className="max-w-xl mx-auto p-2 border border-slate-300 rounded bg-slate-50 flex items-center justify-center">
                    <img
                      src={q.questionImage}
                      alt={`Question ${idx + 1}`}
                      className="max-h-72 max-w-full object-contain"
                    />
                  </div>

                  {/* Ruled space for student rough work on printed sheet */}
                  <div className="h-28 border border-dashed border-slate-300 rounded p-2 text-[10px] text-slate-400 font-mono flex items-end justify-between">
                    <span>Rough Work &amp; Calculations:</span>
                    <span>Student Answer: [ &nbsp; &nbsp; &nbsp; &nbsp; ]</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Page Break for Answer Key */}
            <div className="pt-8 border-t-2 border-slate-900 break-before-page space-y-4">
              <h2 className="text-base font-black uppercase text-center text-slate-900">
                Answer Key &amp; Core RAR Formula Index
              </h2>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="p-2 border-r border-slate-300">Q#</th>
                    <th className="p-2 border-r border-slate-300">Subject / Chapter</th>
                    <th className="p-2 border-r border-slate-300">Correct Answer</th>
                    <th className="p-2">Key Formula / RAR Principle</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="border-b border-slate-200">
                      <td className="p-2 font-bold font-mono border-r border-slate-300">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300">{q.chapter}</td>
                      <td className="p-2 font-bold border-r border-slate-300">{q.correctAnswer || "Refer Solution"}</td>
                      <td className="p-2 font-mono text-[11px]">{q.keyConcept || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
