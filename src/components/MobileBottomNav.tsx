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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-1 pt-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none w-full max-w-full shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      {/* 1. Cards View */}
      <button
        onClick={() => onViewChange("gallery")}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "gallery" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span className="mt-0.5">Cards</span>
      </button>

      {/* 2. Practice CBT Mode (Direct trigger with question count badge) */}
      <button
        onClick={onOpenPractice}
        disabled={filteredCount === 0}
        className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:text-blue-600 transition-colors relative disabled:opacity-40"
      >
        <Play className="w-4 h-4 text-blue-600 fill-blue-600/20" />
        <span className="mt-0.5 font-semibold">Drill ({filteredCount})</span>
      </button>

      {/* 3. Primary Center Log Mistake Action (Vibrant Orange Button) */}
      <div className="flex-1 flex items-center justify-center -mt-5">
        <button
          onClick={onOpenIngestion}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold shadow-[0_4px_16px_rgba(249,115,22,0.4)] active:scale-95 transition-transform flex items-center justify-center border-2 border-white"
          title="Log new mistake from camera or photo"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      {/* 4. Rapid Flashcards */}
      <button
        onClick={() => onViewChange("flashcards")}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "flashcards" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Zap className="w-4 h-4" />
        <span className="mt-0.5">Flash</span>
      </button>

      {/* 5. Mobile Filters & Syllabus Drawer */}
      <button
        onClick={onOpenFilters}
        className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="mt-0.5">Syllabus</span>
      </button>
    </nav>
  );
};
