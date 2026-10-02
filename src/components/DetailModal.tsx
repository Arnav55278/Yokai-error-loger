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
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0a0d16] border border-white/[0.12] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="h-14 px-6 border-b border-white/[0.08] bg-[#07090e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-sky-400 font-bold">{question.id}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-medium">
              {question.subject} &gt; {question.chapter}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                const updated = { ...question, starred: !question.starred };
                await onUpdateQuestion(updated);
              }}
              className={`p-1.5 rounded transition-all border ${
                question.starred
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
              title={question.starred ? "Unstar question" : "Star question"}
            >
              <Star className={`w-4 h-4 ${question.starred ? "fill-amber-400" : ""}`} />
            </button>
            <button
              onClick={() => onPracticeQuestion(question)}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Practice Blind</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.05]"
              title={isEditing ? "Cancel Edit" : "Edit Details"}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete question ${question.id}?`)) {
                  onDeleteQuestion(question.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              title="Delete Question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Status Row */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                {question.errorType}
              </span>
              <span className="text-slate-400">Source: {question.source}</span>
              <span className="text-slate-400">Target: {question.level}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`font-semibold ${srs.badgeColor}`}>{srs.name}</span>
              <span className="text-slate-500">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <RotateCw className="w-3 h-3 text-slate-500" />
                <span>{question.attemptCount} attempts</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span className={due ? "text-amber-400 font-bold" : ""}>
                  Due: {question.nextReviewDate}
                </span>
              </span>
            </div>
          </div>

          {/* Subtopic */}
          <div>
            {isEditing ? (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">SUBTOPIC</label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/[0.08] rounded p-2 text-xs text-white"
                />
              </div>
            ) : (
              <h3 className="text-base font-bold text-white tracking-tight">{question.subtopic}</h3>
            )}
          </div>

          {/* Dual High-Res Image Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Image */}
            <div className="bg-[#05070a] border border-white/[0.08] rounded-xl p-3 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 font-semibold">QUESTION SCREENSHOT</div>
              <div className="aspect-[16/10] flex items-center justify-center overflow-hidden">
                <img
                  src={question.questionImage}
                  alt="Question"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Solution Image */}
            <div className="bg-[#05070a] border border-white/[0.08] rounded-xl p-3 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 font-semibold">SOLUTION / WHITEBOARD</div>
              <div className="aspect-[16/10] flex items-center justify-center overflow-hidden">
                {question.solutionImage ? (
                  <img
                    src={question.solutionImage}
                    alt="Solution"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-500 text-center text-xs">
                    No solution image uploaded for this question.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Coach Multi-Tier Hint Dissection */}
          <div className="p-4 bg-gradient-to-r from-sky-950/30 to-purple-950/20 border border-sky-500/30 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-200 text-xs tracking-wide">
                  AI MASTER COACH DISSECTION ({settings?.geminiModel || "gemini-3.8-flash"})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRequestHint(1)}
                  disabled={isLoadingHint}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                    activeHintTier === 1
                      ? "bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-sm"
                      : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:text-white"
                  }`}
                >
                  💡 Tier 1: Micro-Hint
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestHint(2)}
                  disabled={isLoadingHint}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                    activeHintTier === 2
                      ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm"
                      : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:text-white"
                  }`}
                >
                  ⚠️ Tier 2: Trap Warning
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestHint(3)}
                  disabled={isLoadingHint}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                    activeHintTier === 3
                      ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm"
                      : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:text-white"
                  }`}
                >
                  ✨ Tier 3: Master Solution
                </button>
              </div>
            </div>

            {isLoadingHint && (
              <div className="p-4 bg-black/40 border border-white/[0.06] rounded-lg flex items-center gap-3 text-sky-300">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                <span>Consulting AI Coach ({settings?.geminiModel || "gemini-3.8-flash"})...</span>
              </div>
            )}

            {hintError && !isLoadingHint && (
              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
                {hintError}
              </div>
            )}

            {generatedHint && !isLoadingHint && (
              <div className="p-4 bg-[#030509] border border-sky-500/30 rounded-lg text-slate-100 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 pb-1 border-b border-white/[0.06]">
                  <span>
                    {activeHintTier === 1
                      ? "TIER 1 MICRO-HINT (NUDGE WITHOUT SPOILERS)"
                      : activeHintTier === 2
                      ? "TIER 2 EXAMINER'S TRAP & CORE THEOREM"
                      : "TIER 3 STEP-BY-STEP MATHEMATICAL MASTERCLASS"}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedHint)}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-xs leading-relaxed">
                  <MathRenderer content={generatedHint} />
                </div>
              </div>
            )}
          </div>

          {/* Remember As Result (RAR) Formula Box */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-400 font-semibold">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>REMEMBER AS RESULT (RAR) — LATEX FORMULA</span>
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={keyConcept}
                onChange={(e) => setKeyConcept(e.target.value)}
                className="w-full bg-[#05070a] border border-white/[0.08] rounded p-2 font-mono text-xs text-white"
              />
            ) : (
              <div className="p-3 bg-sky-950/20 border border-sky-500/20 rounded-lg text-xs">
                <MathRenderer content={question.keyConcept || "No formula specified"} />
              </div>
            )}
          </div>

          {/* Student Mistake Note */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-rose-400 font-semibold">
              MY PAST MISTAKE / TRAP ENCOUNTERED
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                className="w-full bg-[#05070a] border border-white/[0.08] rounded p-2 text-xs text-white"
              />
            ) : (
              <div className="p-3 bg-rose-950/15 border border-rose-500/20 rounded-lg text-slate-200 italic leading-relaxed">
                "{question.studentNote || "No note recorded."}"
              </div>
            )}
          </div>

          {/* OCR Full Text */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400">
              EXTRACTED OCR TEXT (FOR ZERO-LATENCY RETRIEVAL)
            </div>
            {isEditing ? (
              <textarea
                rows={3}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full bg-[#05070a] border border-white/[0.08] rounded p-2 text-xs text-white"
              />
            ) : (
              <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
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
                  className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono"
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
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5"
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
