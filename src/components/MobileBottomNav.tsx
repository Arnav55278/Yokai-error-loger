import React from "react";
import {
  Layers,
  Folder,
  Play,
  Zap,
  Plus,
  Filter,
  Download,
} from "lucide-react";
import { WorkspaceView } from "../types/vault";

interface MobileBottomNavProps {
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  onOpenIngestion: () => void;
  onOpenPractice: () => void;
  onOpenFilters: () => void;
  onOpenApkModal: () => void;
  filteredCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenIngestion,
  onOpenPractice,
  onOpenFilters,
  onOpenApkModal,
  filteredCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070a10]/95 backdrop-blur-xl border-t border-white/[0.08] px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none w-full max-w-full shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
      {/* 1. Cards View */}
      <button
        onClick={() => onViewChange("gallery")}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "gallery" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="mt-0.5">Cards</span>
      </button>

      {/* 2. Practice CBT Mode (Direct trigger with question count badge) */}
      <button
        onClick={onOpenPractice}
        disabled={filteredCount === 0}
        className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors relative disabled:opacity-40"
      >
        <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
        <span className="mt-0.5">Drill ({filteredCount})</span>
      </button>

      {/* 3. Primary Center Log Mistake Action */}
      <div className="flex-1 flex items-center justify-center -mt-5">
        <button
          onClick={onOpenIngestion}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-sky-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.5)] active:scale-95 transition-transform flex items-center justify-center border-2 border-[#070a10]"
          title="Log new mistake from camera or photo"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>
      </div>

      {/* 4. Rapid Flashcards */}
      <button
        onClick={() => onViewChange("flashcards")}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "flashcards" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Zap className="w-4 h-4" />
        <span className="mt-0.5">Flash</span>
      </button>

      {/* 5. Mobile Filters & Syllabus Drawer */}
      <button
        onClick={onOpenFilters}
        className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="mt-0.5">Syllabus</span>
      </button>
    </nav>
  );
};
