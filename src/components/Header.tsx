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
    <header className="h-13 sm:h-14 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs w-full max-w-full overflow-hidden">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onViewChange("gallery");
          }}
          className="text-sm sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-2 group"
        >
          <div
            className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.5)] shrink-0"
            style={{ backgroundColor: currentThemeObj.accentHex }}
          />
          <span className="font-extrabold tracking-tight">
            Apex<span className="text-blue-600">Vault</span>
          </span>
        </a>
        <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          {filteredCount}
        </span>
      </div>

      {/* Streamlined View Navigation (Only 3 primary + Tools dropdown) */}
      <nav className="hidden md:flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium">
        <button
          onClick={() => onViewChange("gallery")}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            currentView === "gallery"
              ? "bg-white text-blue-600 font-bold shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cards</span>
        </button>

        <button
          onClick={() => onViewChange("folders")}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            currentView === "folders"
              ? "bg-white text-blue-600 font-bold shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Folders</span>
        </button>

        <button
          onClick={() => onViewChange("analytics")}
          className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
            currentView === "analytics"
              ? "bg-white text-blue-600 font-bold shadow-xs border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
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
                ? "bg-white text-blue-600 font-bold shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute left-0 top-9 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 space-y-0.5 animate-in fade-in duration-100 text-xs text-slate-800">
              <button
                onClick={() => {
                  onViewChange("flashcards");
                  setIsToolsMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left transition-colors ${
                  currentView === "flashcards" ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Rapid Flashcards</span>
              </button>

              <button
                onClick={() => {
                  onViewChange("formulas");
                  setIsToolsMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left transition-colors ${
                  currentView === "formulas" ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                <span>Formulas &amp; RAR</span>
              </button>

              <button
                onClick={() => {
                  onViewChange("table");
                  setIsToolsMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left transition-colors ${
                  currentView === "table" ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Data Grid View</span>
              </button>

              {onOpenPrintDpp && (
                <button
                  onClick={() => {
                    onOpenPrintDpp();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-orange-500" />
                  <span>Print JEE DPP Paper</span>
                </button>
              )}

              {onOpenApkModal && (
                <button
                  onClick={() => {
                    onOpenApkModal();
                    setIsToolsMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Android APK</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Streamlined Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Android APK Downloader Button */}
        {onOpenApkModal && (
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-mono transition-colors cursor-pointer"
            title="Download Android APK / Install App on Phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">APK App</span>
          </button>
        )}

        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition-all font-mono"
          title="Search OCR text & tags (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline font-sans text-xs font-medium">Search</span>
          <kbd className="hidden lg:inline px-1 py-0.2 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Starred Filter Button (Energetic Orange Accent) */}
        {starredCount > 0 && onQuickFilterStarred && (
          <button
            onClick={onQuickFilterStarred}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 text-xs font-mono transition-colors font-bold"
            title="Filter to Starred Questions"
          >
            <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span className="font-bold text-[11px] sm:text-xs">{starredCount}</span>
          </button>
        )}

        {/* Theme Switcher Dropdown (desktop only, available in user menu on mobile) */}
        <div className="relative hidden sm:block" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title={`Switch Theme (${currentThemeObj.name})`}
          >
            <Palette className="w-4 h-4 text-orange-500" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in duration-100 text-xs text-slate-800">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 mb-1">
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
                      isActive ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/60" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accentHex }} />
                      <span>{t.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings (desktop only, available in user menu on mobile) */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:block"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Avatar Dropdown */}
        {currentUser && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-0.5 sm:p-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
              title={`${currentUser.username} (${currentUser.email})`}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-white shadow-xs"
                style={{ backgroundColor: currentUser.avatarColor || "#2563eb" }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-10 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2.5 animate-in fade-in duration-100 text-xs text-slate-800">
                {/* User Summary */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: currentUser.avatarColor || "#2563eb" }}
                  >
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {currentUser.username}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                {/* Target Goal */}
                <div className="px-2 py-1.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] font-mono text-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">GOAL:</span>
                  <span className="text-blue-700 font-bold truncate pl-2">
                    {currentUser.targetYear || "JEE Advanced 2026"}
                  </span>
                </div>

                {/* Mobile Extra Menu Actions */}
                <div className="sm:hidden space-y-1 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-600" />
                    <span>App Settings</span>
                  </button>

                  <div className="pt-1 text-[10px] font-mono text-slate-500 font-bold uppercase">
                    Theme
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {APP_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (onSelectTheme) onSelectTheme(t.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`px-1.5 py-1 rounded text-[10px] truncate border text-center transition-colors ${
                          t.id === currentTheme
                            ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {t.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Practice Button (Hidden on phone, accessible via Bottom Nav) */}
        <button
          onClick={onOpenPractice}
          disabled={filteredCount === 0}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
          <span>Practice ({filteredCount})</span>
        </button>

        {/* Primary Log Mistake Button (Hidden on phone, accessible via center FAB) */}
        <button
          onClick={onOpenIngestion}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Log</span>
        </button>
      </div>
    </header>
  );
};
