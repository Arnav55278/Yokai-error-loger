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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070a10]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1 flex items-center justify-around select-none">
      {/* 1. Cards View */}
      <button
        onClick={() => onViewChange("gallery")}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "gallery" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Cards</span>
      </button>

      {/* 2. Folders View */}
      <button
        onClick={() => onViewChange("folders")}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "folders" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Folder className="w-4 h-4" />
        <span>Folders</span>
      </button>

      {/* 3. Primary Center Log Mistake Action */}
      <button
        onClick={onOpenIngestion}
        className="flex flex-col items-center justify-center -mt-4 w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-sky-400 text-slate-950 font-bold shadow-[0_0_16px_rgba(56,189,248,0.5)] active:scale-95 transition-transform"
        title="Log new mistake from camera or photo"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 4. Rapid Flashcards / Practice */}
      <button
        onClick={() => onViewChange("flashcards")}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
          currentView === "flashcards" ? "text-sky-400 font-bold" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Zap className="w-4 h-4" />
        <span>Flash</span>
      </button>

      {/* 5. Mobile Filters & APK Trigger */}
      <button
        onClick={onOpenFilters}
        className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </button>
    </div>
  );
};
