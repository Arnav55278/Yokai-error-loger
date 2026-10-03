import React, { useState } from "react";
import {
  X,
  Play,
  RotateCw,
  Calendar,
  Trash2,
  Check,
  Lightbulb,
  Edit2,
  Clock,
  Star,
  Sparkles,
  Loader2,
  AlertTriangle,
  HelpCircle,
  Copy,
} from "lucide-react";
import { QuestionMistake, SRSStage, ErrorType, AppSettings } from "../types/vault";
import { ERROR_TYPES, ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";
import { MathRenderer } from "./MathRenderer";
import { isDueToday, isNemesisQuestion } from "../utils/srsEngine";
import { generateAiHint } from "../services/geminiClient";

interface DetailModalProps {
  question: QuestionMistake | null;
  onClose: () => void;
  onUpdateQuestion: (updated: QuestionMistake) => Promise<void>;
  onDeleteQuestion: (id: string) => void;
  onPracticeQuestion: (question: QuestionMistake) => void;
  settings?: AppSettings;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  question,
  onClose,
  onUpdateQuestion,
  onDeleteQuestion,
  onPracticeQuestion,
  settings,
}) => {
  if (!question) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [studentNote, setStudentNote] = useState(question.studentNote);
  const [keyConcept, setKeyConcept] = useState(question.keyConcept);
  const [ocrText, setOcrText] = useState(question.ocrText);
  const [errorType, setErrorType] = useState<ErrorType>(question.errorType);
  const [status, setStatus] = useState<SRSStage>(question.status);
  const [subtopic, setSubtopic] = useState(question.subtopic);
  const [isSaving, setIsSaving] = useState(false);

  // AI Coach state
  const [activeHintTier, setActiveHintTier] = useState<1 | 2 | 3 | null>(null);
  const [generatedHint, setGeneratedHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const due = isDueToday(question.nextReviewDate);
  const isNemesis = isNemesisQuestion(question);
  const errorStyle = ERROR_TYPE_COLORS[question.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];
  const srs = SRS_CONFIG[question.status];

  const handleRequestHint = async (tier: 1 | 2 | 3) => {
    try {
      setActiveHintTier(tier);
      setIsLoadingHint(true);
      setHintError(null);
      const hint = await generateAiHint({
        questionImage: question.questionImage,
        ocrText: question.ocrText,
        subtopic: question.subtopic,
        chapter: question.chapter,
        tier,
        model: settings?.geminiModel,
        apiKey: settings?.userApiKey,
      });
      setGeneratedHint(hint);
    } catch (err: any) {
      setHintError(err.message || "Failed to generate AI hint");
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated: QuestionMistake = {
        ...question,
        studentNote,
        keyConcept,
        ocrText,
        errorType,
        status,
        subtopic,
        updatedAt: new Date().toISOString(),
      };
      await onUpdateQuestion(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="h-13 sm:h-14 px-3 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 truncate min-w-0 pr-2">
            <span className="font-mono text-xs text-blue-700 font-bold shrink-0">{question.id}</span>
            <span className="text-slate-400 shrink-0">·</span>
            <span className="text-xs text-slate-700 font-semibold truncate">
              {question.subject} &gt; {question.chapter}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={async () => {
                const updated = { ...question, starred: !question.starred };
                await onUpdateQuestion(updated);
              }}
              className={`p-1.5 rounded transition-all border ${
                question.starred
                  ? "bg-orange-50 border-orange-300 text-orange-600 shadow-xs"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
              }`}
              title={question.starred ? "Unstar question" : "Star question"}
            >
              <Star className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${question.starred ? "fill-orange-500 text-orange-500" : ""}`} />
            </button>
            <button
              onClick={() => onPracticeQuestion(question)}
              className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Practice Blind</span>
              <span className="sm:hidden">Drill</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title={isEditing ? "Cancel Edit" : "Edit Details"}
            >
              <Edit2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete question ${question.id}?`)) {
                  onDeleteQuestion(question.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              title="Delete Question"
            >
              <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar text-xs">
          {/* Status Row */}
          <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px]">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className={`px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                {question.errorType}
              </span>
              <span className="text-slate-500">Src: {question.source}</span>
              <span className="text-slate-500">Lvl: {question.level}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`font-bold ${srs.badgeColor}`}>{srs.name}</span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 text-slate-700">
                <RotateCw className="w-3 h-3 text-slate-400" />
                <span>{question.attemptCount} att</span>
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className={due ? "text-orange-600 font-bold" : ""}>
                  Due: {question.nextReviewDate}
                </span>
              </span>
            </div>
          </div>

          {/* Subtopic */}
          <div>
            {isEditing ? (
              <div>
                <label className="block text-[11px] font-mono text-slate-600 font-bold mb-1">SUBTOPIC</label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : (
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{question.subtopic}</h3>
            )}
          </div>

          {/* Dual High-Res Image Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Image */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 font-bold">QUESTION SCREENSHOT</div>
              <div className="aspect-[16/10] flex items-center justify-center overflow-hidden bg-white rounded-lg border border-slate-100 p-2">
                <img
                  src={question.questionImage}
                  alt="Question"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Solution Image */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 font-bold">SOLUTION / WHITEBOARD</div>
              <div className="aspect-[16/10] flex items-center justify-center overflow-hidden bg-white rounded-lg border border-slate-100 p-2">
                {question.solutionImage ? (
                  <img
                    src={question.solutionImage}
                    alt="Solution"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-center text-xs">
                    No solution image uploaded for this question.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Coach Multi-Tier Hint Dissection */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-orange-50/40 border border-blue-200 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-xs tracking-wide">
                  AI MASTER COACH DISSECTION ({settings?.geminiModel || "gemini-3.8-flash"})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRequestHint(1)}
                  disabled={isLoadingHint}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                    activeHintTier === 1
                      ? "bg-blue-600 text-white font-bold border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  💡 Tier 1: Micro-Hint
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestHint(2)}
                  disabled={isLoadingHint}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                    activeHintTier === 2
                      ? "bg-orange-500 text-white font-bold border-orange-500 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ⚠️ Tier 2: Trap Warning
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestHint(3)}
                  disabled={isLoadingHint}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                    activeHintTier === 3
                      ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ✨ Tier 3: Master Solution
                </button>
              </div>
            </div>

            {isLoadingHint && (
              <div className="p-4 bg-white border border-blue-200 rounded-lg flex items-center gap-3 text-blue-700 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>Consulting AI Coach ({settings?.geminiModel || "gemini-3.8-flash"})...</span>
              </div>
            )}

            {hintError && !isLoadingHint && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {hintError}
              </div>
            )}

            {generatedHint && !isLoadingHint && (
              <div className="p-4 bg-white border border-blue-200 rounded-lg text-slate-900 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-blue-700 font-bold pb-1 border-b border-slate-100">
                  <span>
                    {activeHintTier === 1
                      ? "TIER 1 MICRO-HINT (NUDGE WITHOUT SPOILERS)"
                      : activeHintTier === 2
                      ? "TIER 2 EXAMINER'S TRAP & CORE THEOREM"
                      : "TIER 3 STEP-BY-STEP MATHEMATICAL MASTERCLASS"}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedHint)}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs leading-relaxed text-slate-800">
                  <MathRenderer content={generatedHint} />
                </div>
              </div>
            )}
          </div>

          {/* Remember As Result (RAR) Formula Box */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-blue-700 font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-orange-500" />
              <span>REMEMBER AS RESULT (RAR) — LATEX FORMULA</span>
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={keyConcept}
                onChange={(e) => setKeyConcept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-blue-50/70 border border-blue-200 text-blue-950 rounded-lg text-xs font-mono">
                <MathRenderer content={question.keyConcept || "No formula specified"} />
              </div>
            )}
          </div>

          {/* Student Mistake Note */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-orange-700 font-bold">
              MY PAST MISTAKE / TRAP ENCOUNTERED
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-lg text-slate-800 italic leading-relaxed text-xs">
                "{question.studentNote || "No note recorded."}"
              </div>
            )}
          </div>

          {/* OCR Full Text */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-500 font-bold">
              EXTRACTED OCR TEXT (FOR ZERO-LATENCY RETRIEVAL)
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {question.ocrText || "No OCR transcription."}
              </div>
            )}
          </div>

          {/* Tags */}
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {question.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Edit Mode Save Button */}
          {isEditing && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
