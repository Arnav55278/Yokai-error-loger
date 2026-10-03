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
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50">
        <Zap className="w-12 h-12 text-blue-600 mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-slate-900 mb-1">No Questions in Current Filter</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Select all questions or reset your filters on the left sidebar to practice flashcards.
        </p>
      </div>
    );
  }

  const srs = SRS_CONFIG[currentQ.status];
  const errorStyle = ERROR_TYPE_COLORS[currentQ.errorType] || ERROR_TYPE_COLORS["Conceptual Gap"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 select-none text-xs w-full max-w-full text-slate-900">
      {/* Top Bar for Flashcard Session */}
      <div className="p-3 sm:p-4 border-b border-slate-200 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0 w-full max-w-full shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shadow-xs shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide truncate">
                RAPID ACTIVE RECALL SPRINT
              </h2>
              <span className="font-mono text-[10px] sm:text-[11px] text-blue-600 font-bold shrink-0">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate hidden sm:block">
              Press [Space] to flip card · [← Again / Hard] · [→ Mastered / Good]
            </p>
          </div>
        </div>

        {/* Progress Bar & Timer */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-right font-mono text-[11px] shrink-0">
            <span className="text-slate-500">Timer: </span>
            <span className="text-blue-700 font-bold">{elapsedSec}s</span>
          </div>

          <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-orange-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentIndex < questions.length - 1 && setCurrentIndex((i) => i + 1)}
              disabled={currentIndex === questions.length - 1}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar bg-slate-50">
        <div className="w-full max-w-3xl flex flex-col space-y-4">
          {/* Card Top Info */}
          <div className="flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-blue-700 font-bold">{currentQ.id}</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-800">{currentQ.subject}</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-slate-600 truncate max-w-xs">{currentQ.chapter}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => onToggleStar(currentQ, e)}
                className="p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    currentQ.starred ? "text-orange-500 fill-orange-500" : "text-slate-300 hover:text-slate-500"
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
            className="group relative w-full aspect-[16/10] min-h-[360px] bg-white border border-slate-200 hover:border-blue-400 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all flex flex-col"
          >
            {/* Front View: Question Image & Subtopic */}
            {!isFlipped ? (
              <div className="flex-1 flex flex-col p-4 bg-white">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 truncate">{currentQ.subtopic}</span>
                  <span className="text-blue-600 flex items-center gap-1 font-sans font-semibold">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Click or [Space] to Reveal Solution</span>
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center p-3 overflow-hidden bg-slate-50 rounded-xl m-2 border border-slate-100">
                  <img
                    src={currentQ.questionImage}
                    alt="Question Screenshot"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="p-2 text-center text-slate-500 text-[11px] font-mono border-t border-slate-100">
                  Can you recall the first principles and key formula needed to solve this?
                </div>
              </div>
            ) : (
              /* Back View: Solution, Golden RAR Formula & Notes */
              <div className="flex-1 flex flex-col p-4 bg-blue-50/20 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-mono text-blue-700 pb-2 border-b border-blue-100">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>REVEALED SOLUTION &amp; KEY RAR CONCEPT</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">Click to flip back</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-2 overflow-y-auto custom-scrollbar">
                  {/* Left: Solution Photo or Question */}
                  <div className="flex items-center justify-center bg-white rounded-xl p-2 border border-slate-200 overflow-hidden min-h-[180px] shadow-xs">
                    <img
                      src={currentQ.solutionImage || currentQ.questionImage}
                      alt="Solution"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Right: Golden Formula & Reflection */}
                  <div className="flex flex-col justify-center space-y-3">
                    {currentQ.keyConcept && (
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl shadow-xs">
                        <div className="text-[10px] font-mono text-blue-700 font-bold mb-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-orange-500" />
                          <span>REMEMBER AS RESULT (RAR):</span>
                        </div>
                        <MathRenderer
                          content={currentQ.keyConcept}
                          className="text-blue-950 font-mono text-sm leading-relaxed"
                          block
                        />
                      </div>
                    )}

                    {currentQ.studentNote && (
                      <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl text-slate-800 text-xs shadow-xs">
                        <span className="font-mono text-[10px] text-orange-700 font-bold block mb-1">
                          PAST MISTAKE REFLECTION:
                        </span>
                        <p className="italic">"{currentQ.studentNote}"</p>
                      </div>
                    )}

                    {currentQ.correctAnswer && (
                      <div className="text-[11px] font-mono text-emerald-700 font-bold">
                        Correct Answer: <span>{currentQ.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Grading Bar */}
          <div className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 w-full shadow-xs">
            <button
              onClick={() => onSelectQuestion(currentQ)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Full Question Deep-Dive
            </button>

            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2">
              <button
                onClick={() => handleGrade("again")}
                className="px-2 sm:px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>Again</span>
              </button>
              <button
                onClick={() => handleGrade("good")}
                className="px-2 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                <span>Good</span>
              </button>
              <button
                onClick={() => handleGrade("easy")}
                className="px-2 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Mastered</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
