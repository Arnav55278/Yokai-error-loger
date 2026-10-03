import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Eraser,
  PenTool,
  Trash2,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { QuestionMistake } from "../types/vault";
import { SRSGrade } from "../utils/srsEngine";
import { MathRenderer } from "./MathRenderer";
import { MobileHaptics } from "../utils/mobileHaptics";

interface BlindPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionMistake[];
  onGradeQuestion: (question: QuestionMistake, grade: SRSGrade, solveTimeSeconds: number) => Promise<void>;
}

export const BlindPracticeModal: React.FC<BlindPracticeModalProps> = ({
  isOpen,
  onClose,
  questions,
  onGradeQuestion,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"question" | "scratchpad">("question");

  // Live Timer State
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Scratchpad Canvas State
  const [penColor, setPenColor] = useState<string>("#2563eb");
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const currentQ = questions[currentIndex];

  // Keep phone screen awake during CBT practice
  useEffect(() => {
    if (isOpen) {
      MobileHaptics.requestWakeLock();
    }
    return () => {
      MobileHaptics.releaseWakeLock();
    };
  }, [isOpen]);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isOpen && isTimerRunning && !isRevealed) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning, isRevealed]);

  // Reset state when current question changes
  useEffect(() => {
    setIsRevealed(false);
    setSeconds(0);
    setIsTimerRunning(true);
    clearCanvas();
  }, [currentIndex]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Canvas drawing handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = isEraser ? penWidth * 5 : penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
    }

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  // Canvas touch handlers for smartphones
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = isEraser ? penWidth * 5 : penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
    }

    ctx.lineTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    ctx.stroke();
  };

  const handleTouchEnd = () => {
    isDrawingRef.current = false;
  };

  const handleReveal = () => {
    MobileHaptics.tapLight();
    setIsRevealed(true);
    setIsTimerRunning(false);
  };

  const handleGrade = async (grade: SRSGrade) => {
    if (!currentQ) return;
    try {
      if (grade === "easy" || grade === "good") {
        MobileHaptics.success();
      } else {
        MobileHaptics.warning();
      }
      setIsGrading(true);
      await onGradeQuestion(currentQ, grade, seconds);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // Completed session
        alert("CBT Blind Revision Session Complete! All spaced repetition intervals updated.");
        onClose();
      }
    } finally {
      setIsGrading(false);
    }
  };

  if (!isOpen || !currentQ) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 flex flex-col select-none overflow-hidden animate-in fade-in duration-150 w-full max-w-full">
      {/* Top Exam Header */}
      <div className="h-13 sm:h-14 px-3 sm:px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 min-w-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-4 truncate min-w-0 pr-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-900 tracking-wider hidden sm:inline">
              CBT BLIND RE-ATTEMPT
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 sm:hidden">
              CBT
            </span>
          </div>

          <div className="text-[11px] sm:text-xs font-mono text-slate-500 pl-2 sm:pl-4 border-l border-slate-200 shrink-0">
            Q <span className="text-blue-600 font-bold">{currentIndex + 1}</span>/{questions.length}
          </div>
        </div>

        {/* Center: Live Stopwatch Timer */}
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-1.5 bg-blue-50 border border-blue-200 rounded-lg shrink-0">
          <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 tabular-nums tracking-wider">
            {formatTimer(seconds)}
          </span>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-slate-500 hover:text-blue-700 transition-colors"
            title={isTimerRunning ? "Pause timer" : "Resume timer"}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={() => setSeconds(0)}
            className="text-slate-500 hover:text-blue-700 hidden sm:inline-block transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 hidden sm:block transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Exit Practice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher (Question vs Scratchpad) */}
      <div className="lg:hidden flex items-center bg-slate-100 border-b border-slate-200 p-1 shrink-0">
        <button
          onClick={() => setMobileTab("question")}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === "question"
              ? "bg-white text-blue-700 border border-slate-200 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Question &amp; Solution</span>
        </button>
        <button
          onClick={() => setMobileTab("scratchpad")}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === "scratchpad"
              ? "bg-white text-blue-700 border border-slate-200 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Touch Scratchpad</span>
        </button>
      </div>

      {/* Main Viewport: Question on left, Interactive Scratchpad on right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-200 overflow-hidden">
        {/* Left Column: Blind Question Image & Reveal Panel */}
        <div className={`bg-white flex flex-col overflow-y-auto custom-scrollbar p-3.5 sm:p-6 space-y-4 sm:space-y-5 ${mobileTab === "question" ? "flex" : "hidden lg:flex"}`}>
          {/* Blind Banner */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-md flex items-center justify-between text-xs">
            <span className="text-blue-900 font-mono text-[11px] font-medium">
              BLIND MODE: Chapter, error root cause, and hints strictly hidden.
            </span>
            <span className="font-mono text-[11px] text-slate-500 font-bold">ID: {currentQ.id}</span>
          </div>

          {/* Question Image */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center min-h-[320px]">
            <img
              src={currentQ.questionImage}
              alt="CBT Practice Question"
              className="max-h-[500px] w-auto object-contain"
            />
          </div>

          {/* If NOT revealed: Big Reveal Button */}
          {!isRevealed ? (
            <div className="pt-4 text-center">
              <button
                onClick={handleReveal}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Reveal Solution &amp; My Past Mistake</span>
              </button>
              <div className="text-[11px] font-mono text-slate-500 mt-2">
                Attempt on the scratchpad first before revealing!
              </div>
            </div>
          ) : (
            /* If REVEALED: Solution image, past note, RAR formula, and 4 SRS grading buttons */
            <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Revealed Metadata */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
                <div className="text-[11px] font-mono text-blue-700 font-semibold">
                  CONCEPT REVEALED: {currentQ.subject} &gt; {currentQ.chapter} &gt; {currentQ.subtopic}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Original Error:</span> {currentQ.errorType} · {currentQ.source}
                </div>
              </div>

              {/* RAR Formula Box */}
              {currentQ.keyConcept && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-700 font-semibold">
                    <Lightbulb className="w-3.5 h-3.5 text-orange-500" />
                    <span>REMEMBER AS RESULT (RAR)</span>
                  </div>
                  <div className="text-xs text-blue-950 font-mono">
                    <MathRenderer content={currentQ.keyConcept} />
                  </div>
                </div>
              )}

              {/* Student Past Mistake Trap */}
              {currentQ.studentNote && (
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-md space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-orange-700 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                    <span>MY PAST MISTAKE TRAP</span>
                  </div>
                  <p className="text-xs text-slate-800 italic leading-relaxed">"{currentQ.studentNote}"</p>
                </div>
              )}

              {/* Solution Image if available */}
              {currentQ.solutionImage && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[10px] font-mono text-slate-600 mb-2 font-bold">CANONICAL SOLUTION DERIVATION</div>
                  <img
                    src={currentQ.solutionImage}
                    alt="Solution"
                    className="max-h-[350px] w-auto object-contain mx-auto"
                  />
                </div>
              )}

              {/* 4 SRS Grading Buttons */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-mono text-slate-600 text-center font-semibold">
                  GRADE YOUR RECALL &amp; RE-CALCULATE SRS SCHEDULE:
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* 1. Again */}
                  <button
                    onClick={() => handleGrade("again")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="font-bold text-xs">Again</span>
                    <span className="text-[10px] font-mono text-rose-600">Review in 1d</span>
                  </button>

                  {/* 2. Hard */}
                  <button
                    onClick={() => handleGrade("hard")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="font-bold text-xs">Hard</span>
                    <span className="text-[10px] font-mono text-amber-700">Review in 3d</span>
                  </button>

                  {/* 3. Good */}
                  <button
                    onClick={() => handleGrade("good")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="font-bold text-xs">Good</span>
                    <span className="text-[10px] font-mono text-blue-600">Stage +1</span>
                  </button>

                  {/* 4. Easy / Mastered */}
                  <button
                    onClick={() => handleGrade("easy")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex flex-col items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <span className="font-bold text-xs">Mastered</span>
                    <span className="text-[10px] font-mono text-emerald-700">Stage 4 (60d)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Whiteboard / Rough Work Scratchpad */}
        <div className={`bg-slate-100 flex flex-col relative overflow-hidden ${mobileTab === "scratchpad" ? "flex" : "hidden lg:flex"}`}>
          {/* Scratchpad Toolbar */}
          <div className="h-11 px-3 sm:px-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar shadow-xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700">SCRATCHPAD</span>

              {/* Color swatches */}
              <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-slate-200">
                {["#2563eb", "#ea580c", "#059669", "#0f172a"].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setPenColor(color);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full transition-transform ${
                      penColor === color && !isEraser ? "ring-2 ring-blue-600 scale-110 shadow-xs" : "opacity-75 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>

              {/* Stroke width */}
              <div className="flex items-center gap-1 pl-2 sm:pl-3 border-l border-slate-200">
                {[1.5, 3, 5].map((w) => (
                  <button
                    key={w}
                    onClick={() => setPenWidth(w)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      penWidth === w ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-1.5 rounded transition-colors ${
                  isEraser ? "bg-orange-500 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearCanvas}
                className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Clear Scratchpad"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas viewport */}
          <div className="flex-1 relative bg-white">
            <canvas
              ref={canvasRef}
              width={900}
              height={800}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
