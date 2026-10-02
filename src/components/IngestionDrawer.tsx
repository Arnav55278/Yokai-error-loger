import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Key,
  Star,
  Search,
  BookOpen,
  Edit3,
} from "lucide-react";
import {
  QuestionMistake,
  SubjectType,
  ErrorType,
  QuestionSource,
  ExamLevel,
  SRSStage,
  AppSettings,
} from "../types/vault";
import {
  JEE_SYLLABUS,
  ERROR_TYPES,
  QUESTION_SOURCES,
  EXAM_LEVELS,
  POPULAR_TAGS,
  ALL_JEE_CHAPTERS,
} from "../constants/jeeSyllabus";
import { compressImageToWebP } from "../services/imageCompression";
import { analyzeQuestionWithVision, testGeminiApiKey } from "../services/geminiClient";
import { getTodayDateString } from "../utils/srsEngine";

interface IngestionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestion: (question: QuestionMistake) => Promise<void>;
  initialPastedImage?: string | null;
  settings?: AppSettings;
  onSaveSettings?: (newSettings: AppSettings) => Promise<void>;
}

export const IngestionDrawer: React.FC<IngestionDrawerProps> = ({
  isOpen,
  onClose,
  onSaveQuestion,
  initialPastedImage,
  settings,
  onSaveSettings,
}) => {
  // Form State
  const [subject, setSubject] = useState<SubjectType>("Physics");
  const [unit, setUnit] = useState<string>("General & Mechanics");
  const [chapter, setChapter] = useState<string>("Rotational Dynamics");
  const [customChapterMode, setCustomChapterMode] = useState<boolean>(false);
  const [customChapterName, setCustomChapterName] = useState<string>("");
  const [subtopic, setSubtopic] = useState<string>("");
  const [level, setLevel] = useState<ExamLevel>("JEE Advanced");
  const [errorType, setErrorType] = useState<ErrorType>("Conceptual Gap");
  const [source, setSource] = useState<QuestionSource>("Coaching Test");
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [starred, setStarred] = useState<boolean>(false);

  const [ocrText, setOcrText] = useState<string>("");
  const [keyConcept, setKeyConcept] = useState<string>("");
  const [studentNote, setStudentNote] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [status, setStatus] = useState<SRSStage>(1);

  // Quick Chapter Search / Filter
  const [chapterSearch, setChapterSearch] = useState<string>("");

  // AI & Key Configuration (Enter key & model directly on website)
  const [customApiKey, setCustomApiKey] = useState<string>(settings?.userApiKey || "");
  const [customModel, setCustomModel] = useState<string>(settings?.geminiModel || "gemini-3.8-flash");
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Images
  const [questionImage, setQuestionImage] = useState<string>("");
  const [questionImgSizeKb, setQuestionImgSizeKb] = useState<number>(0);
  const [solutionImage, setSolutionImage] = useState<string>("");
  const [solutionImgSizeKb, setSolutionImgSizeKb] = useState<number>(0);

  // AI & Processing Status
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync settings when opened
  useEffect(() => {
    if (settings) {
      if (settings.userApiKey) setCustomApiKey(settings.userApiKey);
      if (settings.geminiModel) setCustomModel(settings.geminiModel);
    }
  }, [settings, isOpen]);

  // Initialize with pasted image if supplied
  useEffect(() => {
    if (initialPastedImage && isOpen) {
      handleProcessImage(initialPastedImage, "question");
    }
  }, [initialPastedImage, isOpen]);

  // All chapters for selected subject (Exhaustive list of all 30+ chapters)
  const subjectObj = JEE_SYLLABUS.find((s) => s.subject === subject);
  const availableUnits = subjectObj?.units || [];
  const allSubjectChapters = availableUnits.flatMap((u) =>
    u.chapters.map((c) => ({
      name: c.name,
      unitName: u.name,
      subtopics: c.subtopics,
    }))
  );

  const currentChapterObj = allSubjectChapters.find((c) => c.name === chapter);
  const availableSubtopics = currentChapterObj?.subtopics || [];

  const handleSubjectChange = (newSubj: SubjectType) => {
    setSubject(newSubj);
    setCustomChapterMode(false);
    const newSubjectObj = JEE_SYLLABUS.find((s) => s.subject === newSubj);
    if (newSubjectObj && newSubjectObj.units.length > 0) {
      const firstUnit = newSubjectObj.units[0];
      setUnit(firstUnit.name);
      if (firstUnit.chapters.length > 0) {
        setChapter(firstUnit.chapters[0].name);
        setSubtopic(firstUnit.chapters[0].subtopics[0] || "");
      }
    }
  };

  const handleSelectChapterDirectly = (selectedChapterName: string) => {
    setChapter(selectedChapterName);
    const matched = allSubjectChapters.find((c) => c.name === selectedChapterName);
    if (matched) {
      setUnit(matched.unitName);
      if (matched.subtopics && matched.subtopics.length > 0) {
        setSubtopic(matched.subtopics[0]);
      }
    }
  };

  // Direct selection from search across all 85+ JEE chapters
  const handleSelectFromAllChapters = (item: { subject: SubjectType; unit: string; chapter: string; subtopics: string[] }) => {
    setSubject(item.subject);
    setUnit(item.unit);
    setChapter(item.chapter);
    setCustomChapterMode(false);
    if (item.subtopics && item.subtopics.length > 0) {
      setSubtopic(item.subtopics[0]);
    }
    setChapterSearch("");
  };

  const handleProcessImage = async (fileOrDataUrl: File | string, target: "question" | "solution") => {
    try {
      setIsCompressing(true);
      const res = await compressImageToWebP(fileOrDataUrl, 1600, 0.82);
      if (target === "question") {
        setQuestionImage(res.dataUrl);
        setQuestionImgSizeKb(res.sizeKb);
        // Automatically trigger AI Vision if question image just arrived
        runAiVisionAnalysis(res.dataUrl, solutionImage);
      } else {
        setSolutionImage(res.dataUrl);
        setSolutionImgSizeKb(res.sizeKb);
      }
    } catch (err: any) {
      console.error("Compression error:", err);
      alert("Failed to process image: " + err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const runAiVisionAnalysis = async (qImg: string, sImg?: string) => {
    if (!qImg) return;
    try {
      setIsAnalyzingAi(true);
      setAiError(null);
      setAiSuccessMsg(null);

      const result = await analyzeQuestionWithVision(
        qImg,
        sImg,
        customModel.trim() || undefined,
        customApiKey.trim() || undefined
      );

      // Auto-populate 6 dimensions
      if (result.subject && ["Physics", "Chemistry", "Mathematics"].includes(result.subject)) {
        setSubject(result.subject as SubjectType);
      }
      if (result.unit) setUnit(result.unit);
      if (result.chapter) {
        setChapter(result.chapter);
        setCustomChapterMode(false);
      }
      if (result.subtopic) setSubtopic(result.subtopic);
      if (result.level && ["JEE Main", "JEE Advanced", "Olympiad"].includes(result.level)) {
        setLevel(result.level as ExamLevel);
      }
      if (result.ocrText) setOcrText(result.ocrText);
      if (result.keyConcept) setKeyConcept(result.keyConcept);

      if (
        result.suggestedErrorType &&
        ERROR_TYPES.includes(result.suggestedErrorType as ErrorType)
      ) {
        setErrorType(result.suggestedErrorType as ErrorType);
      }

      if (result.suggestedTags && result.suggestedTags.length > 0) {
        setTags((prev) => Array.from(new Set([...prev, ...result.suggestedTags])));
      }

      setAiSuccessMsg(
        `AI Vision Extraction Complete (${customModel}): Classified as ${result.subject} > ${result.chapter}`
      );
    } catch (err: any) {
      console.error("AI Vision Analysis failed:", err);
      setAiError(err.message || "Failed to analyze question with AI Vision");
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleTestKey = async () => {
    try {
      setIsTestingKey(true);
      setKeyTestStatus(null);
      const res = await testGeminiApiKey(customApiKey.trim(), customModel.trim());
      if (res.success) {
        setKeyTestStatus({ success: true, msg: `Verified: ${res.model} is responsive and working!` });
        // Save to app settings if callback provided
        if (onSaveSettings && settings) {
          await onSaveSettings({
            ...settings,
            userApiKey: customApiKey.trim(),
            geminiModel: customModel.trim(),
          });
        }
      } else {
        setKeyTestStatus({ success: false, msg: res.error || "Failed to verify key" });
      }
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.trim();
    if (!clean) return;
    const formatted = clean.startsWith("#") ? clean : `#${clean}`;
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setCustomTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionImage) {
      alert("Please upload or paste a question screenshot.");
      return;
    }

    const finalChapter = customChapterMode ? customChapterName.trim() : chapter.trim();
    if (!finalChapter) {
      alert("Please select or enter a chapter name.");
      return;
    }

    try {
      setIsSaving(true);
      const newQuestion: QuestionMistake = {
        id: `VAULT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subject,
        unit: customChapterMode ? "Custom" : unit,
        chapter: finalChapter,
        subtopic: subtopic.trim() || finalChapter,
        level,
        errorType,
        source,
        tags,
        ocrText,
        keyConcept,
        studentNote,
        correctAnswer: correctAnswer.trim() || undefined,
        questionImage,
        solutionImage: solutionImage || undefined,
        status,
        attemptCount: 1,
        nextReviewDate: getTodayDateString(),
        starred,
      };

      await onSaveQuestion(newQuestion);
      onClose();
    } catch (err: any) {
      alert("Failed to save question: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Filtered chapters for autocomplete
  const allChaptersFiltered = chapterSearch.trim()
    ? ALL_JEE_CHAPTERS.filter((item) =>
        item.chapter.toLowerCase().includes(chapterSearch.toLowerCase()) ||
        item.unit.toLowerCase().includes(chapterSearch.toLowerCase())
      ).slice(0, 12)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-2xl bg-[#090d16] border-l border-white/[0.1] h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="h-14 px-6 border-b border-white/[0.08] bg-[#06080e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              LOG NEW JEE MISTAKE
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Star Toggle */}
            <button
              type="button"
              onClick={() => setStarred(!starred)}
              className={`p-1.5 rounded-md border transition-all ${
                starred
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-white"
              }`}
              title={starred ? "Starred Question" : "Mark as Starred"}
            >
              <Star className={`w-4 h-4 ${starred ? "fill-amber-400" : ""}`} />
            </button>

            {/* Custom Gemini API Key & Model Configuration Toggle */}
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`px-2.5 py-1.5 rounded-md border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                showKeyConfig || customApiKey.trim()
                  ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                  : "bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-white"
              }`}
              title="Enter your custom Gemini API Key & Model Name directly in the website"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {customApiKey.trim() ? "Custom Key: Active" : "AI Key & Model"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom API Key & Model Bar (collapsible or toggleable) */}
        {showKeyConfig && (
          <div className="p-4 bg-[#0d121f] border-b border-white/[0.12] space-y-3 animate-in slide-in-from-top-2 duration-150 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-sky-400">
              <span className="font-semibold">SET YOUR GEMINI API KEY &amp; MODEL (CLIENT-SIDE)</span>
              <span className="text-slate-400">Configured directly in website</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                  GEMINI API KEY (ENTER DIRECTLY IN WEBSITE)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to use server key)"
                  className="w-full bg-[#05070a] border border-white/[0.1] rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                  MODEL NAME (WRITE YOUR OWN)
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. gemini-3.8-flash, gemini-2.5-flash"
                  className="w-full bg-[#05070a] border border-white/[0.1] rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:border-sky-500"
                />
              </div>
            </div>

            {/* Quick Model Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-mono">Quick Models:</span>
              {["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCustomModel(m)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                    customModel === m
                      ? "bg-sky-500/25 border-sky-500/50 text-sky-200"
                      : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
              <div className="text-[11px]">
                {keyTestStatus && (
                  <span className={keyTestStatus.success ? "text-emerald-400 font-medium" : "text-rose-400"}>
                    {keyTestStatus.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey}
                className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-medium rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isTestingKey && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Test &amp; Save Key</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* AI Banner / Status */}
          {isAnalyzingAi && (
            <div className="p-3 bg-sky-950/40 border border-sky-500/40 rounded-lg flex items-center gap-3 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
              <span>Analyzing image with Gemini Vision ({customModel}): extracting OCR, chapter, and formulas...</span>
            </div>
          )}

          {aiSuccessMsg && !isAnalyzingAi && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center justify-between text-emerald-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{aiSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiSuccessMsg(null)}
                className="text-emerald-400 hover:text-emerald-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {aiError && !isAnalyzingAi && (
            <div className="p-3 bg-rose-950/25 border border-rose-500/40 rounded-lg flex items-center justify-between text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">{aiError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(true)}
                  className="text-xs text-sky-400 hover:underline"
                >
                  Configure Key &amp; Model
                </button>
                <button
                  type="button"
                  onClick={() => runAiVisionAnalysis(questionImage, solutionImage)}
                  className="text-xs text-rose-300 underline font-mono hover:text-rose-100"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Section 1: Dual Image Dropzones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Question Image Dropzone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span className="font-semibold text-white">1. QUESTION IMAGE *</span>
                {questionImgSizeKb > 0 && (
                  <span className="text-emerald-400 font-mono text-[10px]">
                    WebP: {questionImgSizeKb} KB
                  </span>
                )}
              </div>

              {questionImage ? (
                <div className="relative group aspect-[16/11] bg-black/70 border border-white/[0.12] rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-inner">
                  <img src={questionImage} alt="Question" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => runAiVisionAnalysis(questionImage, solutionImage)}
                      className="px-2.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded text-xs flex items-center gap-1.5 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Re-Analyze</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionImage("");
                        setQuestionImgSizeKb(0);
                      }}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-[16/11] border-2 border-dashed border-white/[0.12] hover:border-sky-500/50 bg-white/[0.02] hover:bg-sky-500/[0.03] rounded-lg flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessImage(e.target.files[0], "question");
                      }
                    }}
                  />
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-sky-400 mb-2 transition-colors" />
                  <span className="font-semibold text-slate-200">Drop or Paste Screenshot</span>
                  <span className="text-[10px] text-slate-500 mt-1">Ctrl + V / Auto WebP Compressed</span>
                </label>
              )}
            </div>

            {/* Solution Image Dropzone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span>2. SOLUTION / WHITEBOARD (OPTIONAL)</span>
                {solutionImgSizeKb > 0 && (
                  <span className="text-emerald-400 font-mono text-[10px]">
                    WebP: {solutionImgSizeKb} KB
                  </span>
                )}
              </div>

              {solutionImage ? (
                <div className="relative group aspect-[16/11] bg-black/70 border border-white/[0.12] rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-inner">
                  <img src={solutionImage} alt="Solution" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionImage("");
                        setSolutionImgSizeKb(0);
                      }}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-[16/11] border-2 border-dashed border-white/[0.08] hover:border-white/[0.18] bg-white/[0.01] hover:bg-white/[0.02] rounded-lg flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessImage(e.target.files[0], "solution");
                      }
                    }}
                  />
                  <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-slate-300 mb-2 transition-colors" />
                  <span className="text-slate-400">Add Solution / Rough Work</span>
                  <span className="text-[10px] text-slate-500 mt-1">Useful for Blind Re-Attempt</span>
                </label>
              )}
            </div>
          </div>

          {/* Section 2: COMPLETE EXHAUSTIVE JEE CHAPTERS SELECTION */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span className="text-[11px] font-mono text-slate-300 font-bold tracking-wide">
                  EXHAUSTIVE JEE CHAPTERS &amp; SYLLABUS ({allSubjectChapters.length} CHAPTERS FOR {subject.toUpperCase()})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCustomChapterMode(!customChapterMode)}
                className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>{customChapterMode ? "Select from Syllabus" : "+ Enter Custom Chapter"}</span>
              </button>
            </div>

            {/* Quick All-Chapters Instant Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                placeholder="Search across all 85+ JEE chapters (e.g. 'Rotational', 'Thermodynamics', 'Definite', 'Aldehydes')..."
                className="w-full bg-[#05070a] border border-white/[0.09] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />

              {/* Autocomplete Dropdown */}
              {allChaptersFiltered.length > 0 && (
                <div className="absolute left-0 right-0 top-9 bg-[#0e1320] border border-sky-500/40 rounded-lg shadow-xl z-20 max-h-56 overflow-y-auto custom-scrollbar p-1">
                  {allChaptersFiltered.map((item) => (
                    <button
                      key={`${item.subject}-${item.chapter}`}
                      type="button"
                      onClick={() => handleSelectFromAllChapters(item)}
                      className="w-full px-3 py-1.5 text-left rounded hover:bg-sky-500/20 flex items-center justify-between group transition-colors"
                    >
                      <span className="text-slate-200 font-medium">{item.chapter}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.subject} &gt; {item.unit}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(["Physics", "Chemistry", "Mathematics"] as SubjectType[]).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => handleSubjectChange(subj)}
                  className={`py-2 text-center font-medium rounded-lg border transition-all ${
                    subject === subj
                      ? "bg-sky-500/20 border-sky-500/50 text-white font-semibold shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Chapter Selection (Syllabus or Custom) */}
            {customChapterMode ? (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CUSTOM CHAPTER / MODULE NAME (WRITE YOUR OWN)
                </label>
                <input
                  type="text"
                  value={customChapterName}
                  onChange={(e) => setCustomChapterName(e.target.value)}
                  placeholder="e.g. Allen Sheet 4, Pathfinder Problem Set, Advanced Mechanics Booster"
                  className="w-full bg-[#05070a] border border-white/[0.1] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Master Chapter Dropdown listing ALL chapters of the selected subject */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-300 font-semibold">
                      SELECT CHAPTER (ALL {allSubjectChapters.length} {subject.toUpperCase()} CHAPTERS)
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      Unit: {unit}
                    </span>
                  </div>
                  <select
                    value={chapter}
                    onChange={(e) => handleSelectChapterDirectly(e.target.value)}
                    className="w-full bg-[#05070a] border border-white/[0.1] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
                  >
                    {availableUnits.map((u) => (
                      <optgroup key={u.name} label={`── ${u.name} ──`}>
                        {u.chapters.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Micro Subtopic with both canonical suggestions & custom input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-slate-400">
                MICRO-SUBTOPIC (SPECIFIC TRAP / MECHANISM) *
              </label>

              {availableSubtopics.length > 0 && !customChapterMode && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {availableSubtopics.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSubtopic(st)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                        subtopic === st
                          ? "bg-sky-500/25 border-sky-500/50 text-sky-200"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Variable Mass Moment of Inertia, Aldol Stereochemistry"
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          {/* Section 3: Root Cause, Level & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">ERROR ROOT CAUSE</label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as ErrorType)}
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {ERROR_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">QUESTION SOURCE</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as QuestionSource)}
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {QUESTION_SOURCES.map((qs) => (
                  <option key={qs} value={qs}>
                    {qs}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">EXAM LEVEL</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ExamLevel)}
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {EXAM_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Key Concept & Personal Mistakes */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono text-slate-400">
                  KEY CONCEPT / FORMULA (LaTeX ENABLED $...$)
                </label>
                <span className="text-[10px] font-mono text-sky-400">
                  RAR: Remember As Result
                </span>
              </div>
              <input
                type="text"
                value={keyConcept}
                onChange={(e) => setKeyConcept(e.target.value)}
                placeholder="e.g. $I_{total} = \\int r^2 dm$, or $\\Delta H = \\Delta U + \\Delta n_g RT$"
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                STUDENT NOTE / WHY DID I MESS UP?
              </label>
              <textarea
                rows={2}
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder="e.g. I forgot the non-inertial pseudo force term when switching to the accelerated trolley frame."
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                FULL OCR TEXT (AUTOMATICALLY EXTRACTED FOR SEARCH)
              </label>
              <textarea
                rows={3}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Question text transcribed verbatim for instant search after 1.5+ years..."
                className="w-full bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-sky-500 custom-scrollbar"
              />
            </div>
          </div>

          {/* Section 5: Cross-Topic Tags */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono text-slate-400">
              CROSS-CONCEPT TAGS (#Rotation+Electrostatics, etc.)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    tags.includes(tag)
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                      : "bg-white/[0.02] text-slate-400 border border-white/[0.06] hover:text-slate-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Type custom tag (e.g. #NegativeSignTrap)..."
                className="flex-1 bg-[#05070a] border border-white/[0.08] rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded text-xs"
              >
                + Add Tag
              </button>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="h-16 px-6 border-t border-white/[0.08] bg-[#06080e] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white rounded transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isCompressing}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-md shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Question to Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
