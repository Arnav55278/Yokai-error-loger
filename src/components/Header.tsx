import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Play,
  Search,
  Settings,
  Star,
  Palette,
  Check,
  ChevronDown,
  Layers,
  Folder,
  BarChart3,
  Zap,
  BookOpen,
  Printer,
  LogOut,
  User,
  Smartphone,
  Download,
} from "lucide-react";
import { WorkspaceView, SyncState, AppSettings, AppTheme } from "../types/vault";
import { AuthUser } from "../types/auth";
import { APP_THEMES } from "../constants/themes";

interface HeaderProps {
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  filteredCount: number;
  totalCount: number;
  starredCount?: number;
  syncState: SyncState;
  settings?: AppSettings;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenIngestion: () => void;
  onOpenPractice: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onQuickFilterStarred?: () => void;
  onOpenPrintDpp?: () => void;
  onOpenApkModal?: () => void;
  onSelectTheme?: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  filteredCount,
  starredCount = 0,
  settings,
  currentUser,
  onLogout,
  onOpenIngestion,
  onOpenPractice,
  onOpenCommandPalette,
  onOpenSettings,
  onQuickFilterStarred,
  onOpenPrintDpp,
  onOpenApkModal,
  onSelectTheme,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const currentTheme = settings?.theme || "obsidian";
  const currentThemeObj = APP_THEMES.find((t) => t.id === currentTheme) || APP_THEMES[0];

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isToolActive = currentView === "formulas" || currentView === "flashcards";

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#07090e]/95 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewChange("gallery");
          }}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 group"
        >
          <div
            className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
            style={{ backgroundColor: currentThemeObj.accentHex, color: currentThemeObj.accentHex }}
          />
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-bold">
            ApexVault
          </span>
        </a>
      </div>

      {/* Streamlined View Navigation (Only 3 primary + Tools dropdown) */}
      <nav className="hidden md:flex items-center gap-1 p-0.5 bg-black/50 border border-white/[0.08] rounded-lg text-xs font-medium">
        <button
          onClick={() => onViewChange("gallery")}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            currentView === "gallery"
              ? "bg-white/[0.12] text-white font-semibold shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cards</span>
        </button>

        <button
          onClick={() => onViewChange("folders")}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            currentView === "folders"
              ? "bg-white/[0.12] text-white font-semibold shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Folders</span>
        </button>

        <button
          onClick={() => onViewChange("analytics")}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            currentView === "analytics"
              ? "bg-white/[0.12] text-white font-semibold shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>

        {/* Tools Dropdown (Flashcards, Formulas, Table, Print) */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              isToolActive || currentView === "table"
                ? "bg-white/[0.12] text-white font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            }`}
          >
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute left-0 top-9 w-48 bg-[#0b0e17] border border-white/[0.12] rounded-xl shadow-2xl p-1 z-50 space-y-0.5 animate-in fade-in duration-100 text-xs">
              <button
                onClick={() => {
                  onViewChange("flashcards");
                  setIsToolsMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left transition-colors ${
                  currentView === "flashcards" ? "bg-white/[0.1] text-white font-medium" : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Rapid Flashcards</span>
              </button>

              <button
                onClick={() => {
                  onViewChange("formulas");
                  setIsToolsMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left transition-colors ${
                  currentView === "formulas" ? "bg-white/[0.1] text-white font-medium" : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Formulas &amp; RAR</span>
              </button>

              <button
                onClick={() => {
                  onViewChange("table");
                  setIsToolsMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left transition-colors ${
                  currentView === "table" ? "bg-white/[0.1] text-white font-medium" : "text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Data Grid View</span>
              </button>

              {onOpenPrintDpp && (
                <button
                  onClick={() => {
                    onOpenPrintDpp();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left text-slate-300 hover:bg-white/[0.05] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print JEE DPP Paper</span>
                </button>
              )}

              {onOpenApkModal && (
                <button
                  onClick={() => {
                    onOpenApkModal();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left text-slate-300 hover:bg-white/[0.05] transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Android APK</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Streamlined Right Actions */}
      <div className="flex items-center gap-2">
        {/* Android APK Downloader Button */}
        {onOpenApkModal && (
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-colors cursor-pointer"
            title="Download Android APK / Install App on Phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install APK</span>
          </button>
        )}
        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs text-slate-400 hover:text-slate-200 transition-all font-mono"
          title="Search OCR text & tags (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline font-sans text-xs">Search</span>
          <kbd className="hidden sm:inline px-1 py-0.2 bg-white/[0.06] border border-white/[0.1] rounded text-[10px] text-slate-400">
            Ctrl K
          </kbd>
        </button>

        {/* Starred Filter Button */}
        {starredCount > 0 && onQuickFilterStarred && (
          <button
            onClick={onQuickFilterStarred}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-mono transition-colors"
            title="Filter to Starred Questions"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{starredCount}</span>
          </button>
        )}

        {/* Theme Switcher Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            title={`Switch Theme (${currentThemeObj.name})`}
          >
            <Palette className="w-4 h-4" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-[#0b0e17] border border-white/[0.12] rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 animate-in fade-in duration-100 text-xs">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider border-b border-white/[0.06] mb-1">
                COLOR THEMES
              </div>
              {APP_THEMES.map((t) => {
                const isActive = t.id === currentTheme;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (onSelectTheme) onSelectTheme(t.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                      isActive ? "bg-white/[0.1] text-white font-semibold" : "text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accentHex }} />
                      <span>{t.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Dropdown */}
        {currentUser && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all cursor-pointer"
              title={`${currentUser.username} (${currentUser.email})`}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-slate-950 shadow-inner"
                style={{ backgroundColor: currentUser.avatarColor || "#38bdf8" }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-10 w-64 bg-[#0a0d16] border border-white/[0.12] rounded-xl shadow-2xl p-3 z-50 space-y-2.5 animate-in fade-in duration-100 text-xs">
                {/* User Summary */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/[0.08]">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-slate-950 shrink-0"
                    style={{ backgroundColor: currentUser.avatarColor || "#38bdf8" }}
                  >
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs truncate">
                      {currentUser.username}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                {/* Target Goal */}
                <div className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-slate-300 flex items-center justify-between">
                  <span className="text-slate-500">GOAL:</span>
                  <span className="text-sky-300 font-semibold truncate pl-2">
                    {currentUser.targetYear || "JEE Advanced 2026"}
                  </span>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Practice Button */}
        <button
          onClick={onOpenPractice}
          disabled={filteredCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white font-medium text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-sky-400" />
          <span>Practice ({filteredCount})</span>
        </button>

        {/* Primary Log Mistake Button */}
        <button
          onClick={onOpenIngestion}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Log</span>
        </button>
      </div>
    </header>
  );
};
