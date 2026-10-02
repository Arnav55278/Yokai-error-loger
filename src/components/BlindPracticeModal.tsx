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

  // Live Timer State
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Scratchpad Canvas State
  const [penColor, setPenColor] = useState<string>("#38bdf8");
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const currentQ = questions[currentIndex];

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

  // Canvas drawing handlers
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

  const handleReveal = () => {
    setIsRevealed(true);
    setIsTimerRunning(false);
  };

  const handleGrade = async (grade: SRSGrade) => {
    if (!currentQ) return;
    try {
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
    <div className="fixed inset-0 z-50 bg-[#06070a] text-slate-100 flex flex-col select-none overflow-hidden animate-in fade-in duration-150">
      {/* Top Exam Header */}
      <div className="h-14 px-6 border-b border-white/[0.08] bg-[#090c12] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">CBT BLIND RE-ATTEMPT SIMULATOR</span>
          </div>

          <div className="text-xs font-mono text-slate-400 pl-4 border-l border-white/[0.08]">
            Question <span className="text-white font-bold">{currentIndex + 1}</span> of{" "}
            <span className="text-slate-400">{questions.length}</span>
          </div>
        </div>

        {/* Center: Live Stopwatch Timer */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-black/60 border border-white/[0.1] rounded-lg">
          <span className="font-mono text-sm font-bold text-sky-400 tabular-nums tracking-wider">
            {formatTimer(seconds)}
          </span>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-slate-400 hover:text-white"
            title={isTimerRunning ? "Pause timer" : "Resume timer"}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={() => setSeconds(0)}
            className="text-slate-400 hover:text-white"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.05]"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/[0.05]"
            title="Exit Practice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport: Question on left, Interactive Scratchpad on right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.05] overflow-hidden">
        {/* Left Column: Blind Question Image & Reveal Panel */}
        <div className="bg-[#090c12] flex flex-col overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Blind Banner */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-md flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              BLIND MODE: Chapter, error root cause, and hints strictly hidden.
            </span>
            <span className="font-mono text-[11px] text-slate-500">ID: {currentQ.id}</span>
          </div>

          {/* Question Image */}
          <div className="bg-[#05070a] border border-white/[0.08] rounded-lg p-3 flex items-center justify-center min-h-[320px]">
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
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-sm rounded-lg shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
            <div className="space-y-4 pt-2 border-t border-white/[0.08] animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Revealed Metadata */}
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-md text-xs space-y-1">
                <div className="text-[11px] font-mono text-sky-400 font-semibold">
                  CONCEPT REVEALED: {currentQ.subject} &gt; {currentQ.chapter} &gt; {currentQ.subtopic}
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-500">Original Error:</span> {currentQ.errorType} · {currentQ.source}
                </div>
              </div>

              {/* RAR Formula Box */}
              {currentQ.keyConcept && (
                <div className="p-3 bg-sky-950/20 border border-sky-500/30 rounded-md space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-sky-400 font-semibold">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>REMEMBER AS RESULT (RAR)</span>
                  </div>
                  <div className="text-xs text-white">
                    <MathRenderer content={currentQ.keyConcept} />
                  </div>
                </div>
              )}

              {/* Student Past Mistake Trap */}
              {currentQ.studentNote && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-md space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>MY PAST MISTAKE TRAP</span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">"{currentQ.studentNote}"</p>
                </div>
              )}

              {/* Solution Image if available */}
              {currentQ.solutionImage && (
                <div className="bg-[#05070a] border border-white/[0.08] rounded-lg p-3">
                  <div className="text-[10px] font-mono text-slate-400 mb-2">CANONICAL SOLUTION DERIVATION</div>
                  <img
                    src={currentQ.solutionImage}
                    alt="Solution"
                    className="max-h-[350px] w-auto object-contain mx-auto"
                  />
                </div>
              )}

              {/* 4 SRS Grading Buttons */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 text-center">
                  GRADE YOUR RECALL &amp; RE-CALCULATE SRS SCHEDULE:
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* 1. Again */}
                  <button
                    onClick={() => handleGrade("again")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 flex flex-col items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-xs">Again</span>
                    <span className="text-[10px] font-mono text-rose-400/80">Review in 1d</span>
                  </button>

                  {/* 2. Hard */}
                  <button
                    onClick={() => handleGrade("hard")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 flex flex-col items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-xs">Hard</span>
                    <span className="text-[10px] font-mono text-amber-400/80">Review in 3d</span>
                  </button>

                  {/* 3. Good */}
                  <button
                    onClick={() => handleGrade("good")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 flex flex-col items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-xs">Good</span>
                    <span className="text-[10px] font-mono text-sky-400/80">Stage +1 (7-21d)</span>
                  </button>

                  {/* 4. Easy / Mastered */}
                  <button
                    onClick={() => handleGrade("easy")}
                    disabled={isGrading}
                    className="p-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex flex-col items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-xs">Mastered</span>
                    <span className="text-[10px] font-mono text-emerald-400/80">Stage 4 (60d)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Whiteboard / Rough Work Scratchpad */}
        <div className="bg-[#05070a] flex flex-col relative overflow-hidden">
          {/* Scratchpad Toolbar */}
          <div className="h-11 px-4 border-b border-white/[0.08] bg-[#0a0d14] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-slate-300">ROUGH SCRATCHPAD</span>

              {/* Color swatches */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-white/[0.08]">
                {["#38bdf8", "#f43f5e", "#10b981", "#ffffff"].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setPenColor(color);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      penColor === color && !isEraser ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>

              {/* Stroke width */}
              <div className="flex items-center gap-1 pl-3 border-l border-white/[0.08]">
                {[1.5, 3, 5].map((w) => (
                  <button
                    key={w}
                    onClick={() => setPenWidth(w)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      penWidth === w ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-1.5 rounded transition-colors ${
                  isEraser ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={clearCanvas}
                className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Clear Scratchpad"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas viewport */}
          <div className="flex-1 relative bg-[#06080d]">
            <canvas
              ref={canvasRef}
              width={900}
              height={800}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
