import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  QuestionMistake,
  FilterState,
  WorkspaceView,
  SyncState,
  AppSettings,
  AppTheme,
} from "./types/vault";
import {
  getAllQuestions,
  saveQuestion,
  deleteQuestion as dbDeleteQuestion,
  getSettings,
  saveSettings as dbSaveSettings,
  bulkSaveQuestions,
} from "./services/indexedDb";
import { syncToMountedDirectory } from "./services/localDirectorySync";
import { syncVaultToGoogleDrive } from "./services/googleDriveSync";
import { Header } from "./components/Header";
import { SidebarFilters } from "./components/SidebarFilters";
import { GalleryView } from "./components/GalleryView";
import { TableView } from "./components/TableView";
import { AnalyticsView } from "./components/AnalyticsView";
import { FolderExplorerView } from "./components/FolderExplorerView";
import { FormulaVaultView } from "./components/FormulaVaultView";
import { RapidFlashcardsView } from "./components/RapidFlashcardsView";
import { PrintableDppModal } from "./components/PrintableDppModal";
import { IngestionDrawer } from "./components/IngestionDrawer";
import { BlindPracticeModal } from "./components/BlindPracticeModal";
import { CommandPalette } from "./components/CommandPalette";
import { SettingsModal } from "./components/SettingsModal";
import { DetailModal } from "./components/DetailModal";
import { AuthScreen } from "./components/AuthScreen";
import { ApkDownloaderModal } from "./components/ApkDownloaderModal";
import { MobileApkBanner } from "./components/MobileApkBanner";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { X } from "lucide-react";
import { AuthUser } from "./types/auth";
import { getCurrentUser, logoutUser } from "./services/authService";
import { SRSGrade, calculateSRSUpdate, isDueToday, isNemesisQuestion, isSillyMistake } from "./utils/srsEngine";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [questions, setQuestions] = useState<QuestionMistake[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    googleDriveClientId: "",
    geminiModel: "gemini-3.8-flash",
    srsIntervals: { stage1: 3, stage2: 7, stage3: 21, stage4: 60 },
    autoAiAnalyzeOnPaste: true,
  });

  const [currentView, setCurrentView] = useState<WorkspaceView>("gallery");

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>({
    isIndexedDbReady: false,
    isDriveConnected: false,
    isLocalDirMounted: false,
    isSyncing: false,
  });

  // 6-Dimensional Filter State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: "",
    subject: "ALL",
    unit: "ALL",
    chapter: "ALL",
    errorTypes: [],
    sources: [],
    levels: [],
    srsStages: [],
    tags: [],
    smartPreset: "all",
  });

  // Modals & Drawers
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [practiceQueue, setPracticeQueue] = useState<QuestionMistake[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDetailQuestion, setSelectedDetailQuestion] = useState<QuestionMistake | null>(null);
  const [isPrintDppOpen, setIsPrintDppOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Initial Load from IndexedDB
  useEffect(() => {
    async function init() {
      try {
        const loadedQuestions = await getAllQuestions();
        const loadedSettings = await getSettings();
        setQuestions(loadedQuestions);
        setSettings(loadedSettings);
        setSyncState((prev) => ({ ...prev, isIndexedDbReady: true }));
      } catch (err) {
        console.error("Failed to load initial data from IndexedDB:", err);
      }
    }
    init();
  }, []);

  // Global Clipboard Paste Listener (Ctrl + V anywhere)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing into an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                setPastedImage(dataUrl);
                setIsIngestionOpen(true);
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Keyboard Shortcuts: Ctrl + K (Command Palette), Ctrl + / or Ctrl + I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync active theme to document body & html data-theme
  useEffect(() => {
    const activeTheme = settings.theme || "obsidian";
    document.documentElement.setAttribute("data-theme", activeTheme);
    document.body.setAttribute("data-theme", activeTheme);
  }, [settings.theme]);

  const handleSelectTheme = async (newTheme: AppTheme) => {
    const updatedSettings: AppSettings = {
      ...settings,
      theme: newTheme,
    };
    setSettings(updatedSettings);
    document.documentElement.setAttribute("data-theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
    await dbSaveSettings(updatedSettings);
  };

  // Auto-background sync helper
  const triggerBackgroundSync = useCallback(async (allQuestions: QuestionMistake[]) => {
    // 1. Local disk sync if mounted
    if (syncState.isLocalDirMounted) {
      try {
        await syncToMountedDirectory(allQuestions);
      } catch (err) {
        console.warn("Local disk sync deferred:", err);
      }
    }

    // 2. Google drive sync if connected
    if (syncState.isDriveConnected) {
      try {
        await syncVaultToGoogleDrive(undefined, allQuestions);
        setSyncState((prev) => ({
          ...prev,
          lastSyncTime: new Date().toLocaleTimeString(),
        }));
      } catch (err) {
        console.warn("Drive sync deferred:", err);
      }
    }
  }, [syncState.isLocalDirMounted, syncState.isDriveConnected]);

  // Save new mistake handler
  const handleSaveQuestion = async (newQuestion: QuestionMistake) => {
    await saveQuestion(newQuestion);
    const updated = [newQuestion, ...questions.filter((q) => q.id !== newQuestion.id)];
    setQuestions(updated);
    setPastedImage(null);
    triggerBackgroundSync(updated);
  };

  // Update existing mistake
  const handleUpdateQuestion = async (updatedQ: QuestionMistake) => {
    await saveQuestion(updatedQ);
    const updated = questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
    setQuestions(updated);
    setSelectedDetailQuestion(updatedQ);
    triggerBackgroundSync(updated);
  };

  // Delete mistake
  const handleDeleteQuestion = async (id: string) => {
    await dbDeleteQuestion(id);
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    if (selectedDetailQuestion?.id === id) {
      setSelectedDetailQuestion(null);
    }
    triggerBackgroundSync(updated);
  };

  // Save settings
  const handleSaveSettings = async (newSettings: AppSettings) => {
    await dbSaveSettings(newSettings);
    setSettings(newSettings);
  };

  // Restore imported backup
  const handleImportQuestions = async (imported: QuestionMistake[], importedSettings?: AppSettings) => {
    await bulkSaveQuestions(imported);
    if (importedSettings) {
      await dbSaveSettings(importedSettings);
      setSettings(importedSettings);
    }
    setQuestions(imported);
    triggerBackgroundSync(imported);
  };

  // Filter computation
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const qStr = filter.searchQuery.toLowerCase();
        const match =
          q.id.toLowerCase().includes(qStr) ||
          q.subtopic.toLowerCase().includes(qStr) ||
          q.chapter.toLowerCase().includes(qStr) ||
          q.subject.toLowerCase().includes(qStr) ||
          q.ocrText.toLowerCase().includes(qStr) ||
          q.keyConcept.toLowerCase().includes(qStr) ||
          q.studentNote.toLowerCase().includes(qStr) ||
          q.tags.some((t) => t.toLowerCase().includes(qStr));
        if (!match) return false;
      }

      // 2. Smart Preset
      if (filter.smartPreset === "due_today" && !isDueToday(q.nextReviewDate)) {
        return false;
      }
      if (filter.smartPreset === "nemesis" && !isNemesisQuestion(q)) {
        return false;
      }
      if (filter.smartPreset === "silly_checklist" && !isSillyMistake(q)) {
        return false;
      }
      if (filter.smartPreset === "starred" && !q.starred) {
        return false;
      }

      // 3. Subject & Chapter
      if (filter.subject !== "ALL" && q.subject !== filter.subject) return false;
      if (filter.chapter !== "ALL" && q.chapter !== filter.chapter) return false;

      // 4. Error Types
      if (filter.errorTypes.length > 0 && !filter.errorTypes.includes(q.errorType)) {
        return false;
      }

      // 5. Sources
      if (filter.sources.length > 0 && !filter.sources.includes(q.source)) {
        return false;
      }

      // 6. Levels
      if (filter.levels.length > 0 && !filter.levels.includes(q.level)) {
        return false;
      }

      // 7. SRS Stages
      if (filter.srsStages.length > 0 && !filter.srsStages.includes(q.status)) {
        return false;
      }

      return true;
    });
  }, [questions, filter]);

  // Practice session starter
  const handleStartPractice = () => {
    if (filteredQuestions.length === 0) return;
    setPracticeQueue(filteredQuestions);
    setIsPracticeOpen(true);
  };

  const handleStartSinglePractice = (q: QuestionMistake) => {
    setPracticeQueue([q]);
    setIsPracticeOpen(true);
  };

  const handleToggleStar = async (q: QuestionMistake, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedQuestion: QuestionMistake = {
      ...q,
      starred: !q.starred,
      updatedAt: new Date().toISOString(),
    };
    await saveQuestion(updatedQuestion);
    const updated = questions.map((item) => (item.id === q.id ? updatedQuestion : item));
    setQuestions(updated);
    if (selectedDetailQuestion?.id === q.id) {
      setSelectedDetailQuestion(updatedQuestion);
    }
    triggerBackgroundSync(updated);
  };

  // Grade question in CBT practice
  const handleGradeQuestion = async (
    q: QuestionMistake,
    grade: SRSGrade,
    solveTimeSeconds: number
  ) => {
    const srsUpdate = calculateSRSUpdate(q, grade, solveTimeSeconds, settings);
    const updatedQuestion: QuestionMistake = {
      ...q,
      ...srsUpdate,
      updatedAt: new Date().toISOString(),
    };
    await saveQuestion(updatedQuestion);
    const updated = questions.map((item) => (item.id === q.id ? updatedQuestion : item));
    setQuestions(updated);
    triggerBackgroundSync(updated);
  };

  const handleQuickPreset = (preset: FilterState["smartPreset"]) => {
    setFilter({
      ...filter,
      smartPreset: preset,
      subject: "ALL",
      chapter: "ALL",
      errorTypes: [],
      sources: [],
      levels: [],
      srsStages: [],
    });
  };

  // If user is not authenticated, show the Ultra Pro Auth Gate
  if (!currentUser) {
    return <AuthScreen onAuthenticated={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col font-sans">
      {/* Strict Top Bar Contract Navigation */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        filteredCount={filteredQuestions.length}
        totalCount={questions.length}
        starredCount={questions.filter((q) => q.starred).length}
        syncState={syncState}
        settings={settings}
        currentUser={currentUser}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
        }}
        onOpenIngestion={() => {
          setPastedImage(null);
          setIsIngestionOpen(true);
        }}
        onOpenPractice={handleStartPractice}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickFilterStarred={() => handleQuickPreset("starred")}
        onOpenPrintDpp={() => setIsPrintDppOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onSelectTheme={handleSelectTheme}
      />

      {/* Mobile Phone Floating APK Installation Banner */}
      <MobileApkBanner onOpenApkModal={() => setIsApkModalOpen(true)} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop 6-Dimensional Left Sidebar */}
        <div className="hidden md:flex shrink-0">
          <SidebarFilters
            filter={filter}
            onChangeFilter={setFilter}
            questions={questions}
            onQuickPreset={handleQuickPreset}
          />
        </div>

        {/* Mobile Slide-Over Filter Drawer for Phone Screens */}
        {isMobileFiltersOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex animate-in fade-in duration-150"
            onClick={() => setIsMobileFiltersOpen(false)}
          >
            <div
              className="w-4/5 max-w-xs h-full bg-[#070a10] border-r border-white/[0.1] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 px-4 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">FILTERS &amp; SYLLABUS</span>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarFilters
                  filter={filter}
                  onChangeFilter={setFilter}
                  questions={questions}
                  onQuickPreset={(p) => {
                    handleQuickPreset(p);
                    setIsMobileFiltersOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Viewport Content (with bottom padding for mobile navigation dock) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#07090e] pb-14 md:pb-0">
          {currentView === "gallery" && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <GalleryView
                questions={filteredQuestions}
                onSelectQuestion={setSelectedDetailQuestion}
                onPracticeSingle={handleStartSinglePractice}
                onToggleStar={handleToggleStar}
                onDeleteQuestion={handleDeleteQuestion}
                onOpenIngestion={() => {
                  setPastedImage(null);
                  setIsIngestionOpen(true);
                }}
              />
            </div>
          )}

          {currentView === "folders" && (
            <FolderExplorerView
              questions={filteredQuestions}
              onSelectQuestion={setSelectedDetailQuestion}
              onPracticeSingle={handleStartSinglePractice}
              onToggleStar={handleToggleStar}
              onDeleteQuestion={handleDeleteQuestion}
              onOpenIngestion={() => {
                setPastedImage(null);
                setIsIngestionOpen(true);
              }}
            />
          )}

          {currentView === "table" && (
            <TableView
              questions={filteredQuestions}
              onSelectQuestion={setSelectedDetailQuestion}
              onPracticeSingle={handleStartSinglePractice}
              onToggleStar={handleToggleStar}
              onDeleteQuestion={handleDeleteQuestion}
            />
          )}

          {currentView === "analytics" && (
            <AnalyticsView
              questions={questions}
              onSelectQuestion={setSelectedDetailQuestion}
            />
          )}

          {currentView === "formulas" && (
            <FormulaVaultView
              questions={filteredQuestions}
              onSelectQuestion={setSelectedDetailQuestion}
            />
          )}

          {currentView === "flashcards" && (
            <RapidFlashcardsView
              questions={filteredQuestions}
              onGradeQuestion={handleGradeQuestion}
              onSelectQuestion={setSelectedDetailQuestion}
              onToggleStar={handleToggleStar}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <IngestionDrawer
        isOpen={isIngestionOpen}
        onClose={() => {
          setIsIngestionOpen(false);
          setPastedImage(null);
        }}
        onSaveQuestion={handleSaveQuestion}
        initialPastedImage={pastedImage}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <BlindPracticeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        questions={practiceQueue}
        onGradeQuestion={handleGradeQuestion}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        questions={questions}
        onSelectQuestion={setSelectedDetailQuestion}
        onOpenIngestion={() => {
          setPastedImage(null);
          setIsIngestionOpen(true);
        }}
        onOpenPractice={handleStartPractice}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onFilterDueToday={() => handleQuickPreset("due_today")}
        onFilterNemesis={() => handleQuickPreset("nemesis")}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        syncState={syncState}
        setSyncState={setSyncState}
        questions={questions}
        onImportQuestions={handleImportQuestions}
      />

      <DetailModal
        question={selectedDetailQuestion}
        onClose={() => setSelectedDetailQuestion(null)}
        onUpdateQuestion={handleUpdateQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        settings={settings}
        onPracticeQuestion={(q) => {
          setSelectedDetailQuestion(null);
          handleStartSinglePractice(q);
        }}
      />

      <PrintableDppModal
        isOpen={isPrintDppOpen}
        onClose={() => setIsPrintDppOpen(false)}
        questions={filteredQuestions}
      />

      {/* Mobile Phone Bottom Navigation Dock */}
      <MobileBottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenIngestion={() => {
          setPastedImage(null);
          setIsIngestionOpen(true);
        }}
        onOpenPractice={handleStartPractice}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        filteredCount={filteredQuestions.length}
      />

      {/* Android APK Package Downloader & Mobile Installer Modal */}
      <ApkDownloaderModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
