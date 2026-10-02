import React, { useState, useEffect } from "react";
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Zap,
  Star,
  Layers,
  ArrowRight,
} from "lucide-react";
import { QuestionMistake, AppSettings } from "../types/vault";
import { SRSGrade } from "../utils/srsEngine";
import { MathRenderer } from "./MathRenderer";
import { ERROR_TYPE_COLORS, SRS_CONFIG } from "../constants/jeeSyllabus";

interface RapidFlashcardsViewProps {
  questions: QuestionMistake[];
  onGradeQuestion: (question: QuestionMistake, grade: SRSGrade, solveTime: number) => Promise<void>;
  onSelectQuestion: (question: QuestionMistake) => void;
  onToggleStar: (question: QuestionMistake, e: React.MouseEvent) => void;
}

export const RapidFlashcardsView: React.FC<RapidFlashcardsViewProps> = ({
  questions,
  onGradeQuestion,
  onSelectQuestion,
  onToggleStar,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  const currentQ = questions[currentIndex] || null;

  // Reset timer on slide change
  useEffect(() => {
    setIsFlipped(false);
    setStartTime(Date.now());
    setElapsedSec(0);
  }, [currentIndex]);

  // Tick timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleGrade("good");
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleGrade("again");
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped, currentQ, elapsedSec]);

  const handleGrade = async (grade: SRSGrade) => {
    if (!currentQ) return;
    await onGradeQuestion(currentQ, grade, elapsedSec);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      alert("Flashcard Sprint Completed! Great job reinforcing your weak spots.");
      setCurrentIndex(0);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
        <Zap className="w-12 h-12 text-sky-400 mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-white mb-1">No Questions in Current Filter</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Select all questions or reset your filters on the left sidebar to practice flashcards.
        </p>
      </div>
    );
  }

  const srs = SRS_CONFIG[currentQ.status];
  const errorStyle = ERROR_TYPE_COLORS[currentQ.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#05070c] select-none text-xs">
      {/* Top Bar for Flashcard Session */}
      <div className="p-4 border-b border-white/[0.08] bg-[#080b12]/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                RAPID ACTIVE RECALL SPRINT
              </h2>
              <span className="font-mono text-[11px] text-sky-400 font-bold">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Press [Space] to flip card · [← Again / Hard] · [→ Mastered / Good]
            </p>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-[11px]">
            <span className="text-slate-400">Timer: </span>
            <span className="text-sky-300 font-bold">{elapsedSec}s</span>
          </div>

          <div className="w-32 h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentIndex < questions.length - 1 && setCurrentIndex((i) => i + 1)}
              disabled={currentIndex === questions.length - 1}
              className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-3xl flex flex-col space-y-4">
          {/* Card Top Info */}
          <div className="flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sky-400 font-bold">{currentQ.id}</span>
              <span className="text-slate-600">·</span>
              <span className="font-semibold text-slate-200">{currentQ.subject}</span>
              <span className="text-slate-600">&gt;</span>
              <span className="text-slate-300 truncate max-w-xs">{currentQ.chapter}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onToggleStar(currentQ, e)}
                className="p-1 rounded hover:bg-white/[0.08] transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    currentQ.starred ? "text-amber-400 fill-amber-400" : "text-slate-500"
                  }`}
                />
              </button>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${errorStyle.bg} ${errorStyle.border} ${errorStyle.text}`}>
                {currentQ.errorType}
              </span>
            </div>
          </div>

          {/* 3D Flip Card Frame */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative w-full aspect-[16/10] min-h-[360px] bg-[#090d16] border border-white/[0.12] hover:border-sky-500/40 rounded-2xl overflow-hidden cursor-pointer shadow-[0_16px_40px_rgba(0,0,0,0.8)] transition-all flex flex-col"
          >
            {/* Front View: Question Image & Subtopic */}
            {!isFlipped ? (
              <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-white/[0.06]">
                  <span className="font-semibold text-slate-200 truncate">{currentQ.subtopic}</span>
                  <span className="text-sky-400 flex items-center gap-1 font-sans">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click or [Space] to Reveal Solution</span>
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center p-3 overflow-hidden">
                  <img
                    src={currentQ.questionImage}
                    alt="Question Screenshot"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-2 text-center text-slate-500 text-[11px] font-mono border-t border-white/[0.04]">
                  Can you recall the first principles and key formula needed to solve this?
                </div>
              </div>
            ) : (
              /* Back View: Solution, Golden RAR Formula & Notes */
              <div className="flex-1 flex flex-col p-4 bg-[#0a0f1d] animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>REVEALED SOLUTION &amp; KEY RAR CONCEPT</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">Click to flip back</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-2 overflow-y-auto custom-scrollbar">
                  {/* Left: Solution Photo or Question */}
                  <div className="flex items-center justify-center bg-black/60 rounded-xl p-2 border border-white/[0.06] overflow-hidden min-h-[180px]">
                    <img
                      src={currentQ.solutionImage || currentQ.questionImage}
                      alt="Solution"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Right: Golden Formula & Reflection */}
                  <div className="flex flex-col justify-center space-y-3">
                    {currentQ.keyConcept && (
                      <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl shadow-inner">
                        <div className="text-[10px] font-mono text-sky-400 font-bold mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>REMEMBER AS RESULT (RAR):</span>
                        </div>
                        <MathRenderer
                          content={currentQ.keyConcept}
                          className="text-white font-mono text-sm leading-relaxed"
                          block
                        />
                      </div>
                    )}

                    {currentQ.studentNote && (
                      <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-slate-300 text-xs">
                        <span className="font-mono text-[10px] text-rose-400 font-bold block mb-1">
                          PAST MISTAKE REFLECTION:
                        </span>
                        <p className="italic">"{currentQ.studentNote}"</p>
                      </div>
                    )}

                    {currentQ.correctAnswer && (
                      <div className="text-[11px] font-mono text-emerald-300">
                        Correct Answer: <span className="font-bold">{currentQ.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Grading Bar */}
          <div className="p-3 bg-[#080b12] border border-white/[0.08] rounded-xl flex items-center justify-between gap-3">
            <button
              onClick={() => onSelectQuestion(currentQ)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs transition-colors"
            >
              Full Question Deep-Dive
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGrade("again")}
                className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Again (Hard) [←]</span>
              </button>
              <button
                onClick={() => handleGrade("good")}
                className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Good (Retained)</span>
              </button>
              <button
                onClick={() => handleGrade("easy")}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mastered [→]</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
