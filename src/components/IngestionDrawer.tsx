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
  Camera,
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
import { MobileHaptics } from "../utils/mobileHaptics";

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-2xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="h-13 sm:h-14 px-3.5 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 truncate pr-2">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-600 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide truncate">
              LOG NEW JEE MISTAKE
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Star Toggle */}
            <button
              type="button"
              onClick={() => setStarred(!starred)}
              className={`p-1.5 rounded-md border transition-all ${
                starred
                  ? "bg-orange-50 border-orange-300 text-orange-600 shadow-xs"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
              }`}
              title={starred ? "Starred Question" : "Mark as Starred"}
            >
              <Star className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${starred ? "fill-orange-500 text-orange-500" : ""}`} />
            </button>

            {/* Custom Gemini API Key & Model Configuration Toggle */}
            <button
              type="button"
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                showKeyConfig || customApiKey.trim()
                  ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
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
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom API Key & Model Bar (collapsible or toggleable) */}
        {showKeyConfig && (
          <div className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-3 animate-in slide-in-from-top-2 duration-150 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-700">
              <span className="font-bold">SET YOUR GEMINI API KEY &amp; MODEL (CLIENT-SIDE)</span>
              <span className="text-slate-500">Configured directly in website</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-600 mb-1 font-semibold">
                  GEMINI API KEY (ENTER DIRECTLY IN WEBSITE)
                </label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to use server key)"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-600 mb-1 font-semibold">
                  MODEL NAME (WRITE YOUR OWN)
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. gemini-3.8-flash, gemini-2.5-flash"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            {/* Quick Model Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-mono font-medium">Quick Models:</span>
              {["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCustomModel(m)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                    customModel === m
                      ? "bg-blue-600 border-blue-600 text-white font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-blue-100">
              <div className="text-[11px]">
                {keyTestStatus && (
                  <span className={keyTestStatus.success ? "text-emerald-700 font-medium" : "text-rose-600"}>
                    {keyTestStatus.msg}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isTestingKey && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Test &amp; Save Key</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar text-xs w-full max-w-full">
          {/* AI Banner / Status */}
          {isAnalyzingAi && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-blue-700 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span>Analyzing image with Gemini Vision ({customModel}): extracting OCR, chapter, and formulas...</span>
            </div>
          )}

          {aiSuccessMsg && !isAnalyzingAi && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800 shadow-xs">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{aiSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {aiError && !isAnalyzingAi && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-700 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">{aiError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(true)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Configure Key &amp; Model
                </button>
                <button
                  type="button"
                  onClick={() => runAiVisionAnalysis(questionImage, solutionImage)}
                  className="text-xs text-rose-700 underline font-mono hover:text-rose-900"
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
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-semibold">
                <span>1. QUESTION IMAGE *</span>
                {questionImgSizeKb > 0 && (
                  <span className="text-emerald-600 font-mono text-[10px] font-bold">
                    WebP: {questionImgSizeKb} KB
                  </span>
                )}
              </div>

              {questionImage ? (
                <div className="relative group aspect-[16/11] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-xs">
                  <img src={questionImage} alt="Question" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => runAiVisionAnalysis(questionImage, solutionImage)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
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
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/11] border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                  <Upload className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="font-bold text-slate-800 text-xs">Question Image</span>
                  <span className="text-[10px] text-slate-500 mb-2.5">Auto WebP Compressed / OCR Ready</span>

                  {/* Dual Camera / Gallery Options for Mobile */}
                  <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                    <label className="py-2 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            MobileHaptics.tapMedium();
                            handleProcessImage(e.target.files[0], "question");
                          }
                        }}
                      />
                    </label>

                    <label className="py-2 px-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            MobileHaptics.tapLight();
                            handleProcessImage(e.target.files[0], "question");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1.5">Or paste with Ctrl+V</span>
                </div>
              )}
            </div>

            {/* Solution Image Dropzone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 font-semibold">
                <span>2. SOLUTION / WHITEBOARD (OPTIONAL)</span>
                {solutionImgSizeKb > 0 && (
                  <span className="text-emerald-600 font-mono text-[10px] font-bold">
                    WebP: {solutionImgSizeKb} KB
                  </span>
                )}
              </div>

              {solutionImage ? (
                <div className="relative group aspect-[16/11] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-xs">
                  <img src={solutionImage} alt="Solution" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionImage("");
                        setSolutionImgSizeKb(0);
                      }}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="aspect-[16/11] border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 rounded-lg flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-all group">
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
                  <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-600 mb-2 transition-colors" />
                  <span className="text-slate-600 font-medium">Add Solution / Rough Work</span>
                  <span className="text-[10px] text-slate-400 mt-1">Useful for Blind Re-Attempt</span>
                </label>
              )}
            </div>
          </div>

          {/* Section 2: COMPLETE EXHAUSTIVE JEE CHAPTERS SELECTION */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-mono text-slate-800 font-bold tracking-wide">
                  EXHAUSTIVE JEE CHAPTERS &amp; SYLLABUS ({allSubjectChapters.length} CHAPTERS FOR {subject.toUpperCase()})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCustomChapterMode(!customChapterMode)}
                className="text-[10px] font-mono text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{customChapterMode ? "Select from Syllabus" : "+ Enter Custom Chapter"}</span>
              </button>
            </div>

            {/* Quick All-Chapters Instant Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                placeholder="Search across all 85+ JEE chapters (e.g. 'Rotational', 'Thermodynamics', 'Definite', 'Aldehydes')..."
                className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
              />

              {/* Autocomplete Dropdown */}
              {allChaptersFiltered.length > 0 && (
                <div className="absolute left-0 right-0 top-9 bg-white border border-blue-400 rounded-lg shadow-xl z-20 max-h-56 overflow-y-auto custom-scrollbar p-1">
                  {allChaptersFiltered.map((item) => (
                    <button
                      key={`${item.subject}-${item.chapter}`}
                      type="button"
                      onClick={() => handleSelectFromAllChapters(item)}
                      className="w-full px-3 py-1.5 text-left rounded hover:bg-blue-50 flex items-center justify-between group transition-colors"
                    >
                      <span className="text-slate-800 font-medium">{item.chapter}</span>
                      <span className="text-[10px] font-mono text-blue-600 font-semibold">
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
                  className={`py-2 text-center font-semibold rounded-lg border transition-all cursor-pointer ${
                    subject === subj
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Chapter Selection (Syllabus or Custom) */}
            {customChapterMode ? (
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">
                  CUSTOM CHAPTER / MODULE NAME (WRITE YOUR OWN)
                </label>
                <input
                  type="text"
                  value={customChapterName}
                  onChange={(e) => setCustomChapterName(e.target.value)}
                  placeholder="e.g. Allen Sheet 4, Pathfinder Problem Set, Advanced Mechanics Booster"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                  required
                />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Master Chapter Dropdown listing ALL chapters of the selected subject */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-slate-700 font-bold">
                      SELECT CHAPTER (ALL {allSubjectChapters.length} {subject.toUpperCase()} CHAPTERS)
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      Unit: {unit}
                    </span>
                  </div>
                  <select
                    value={chapter}
                    onChange={(e) => handleSelectChapterDirectly(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans shadow-xs"
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
              <label className="block text-[11px] font-mono text-slate-600 font-semibold">
                MICRO-SUBTOPIC (SPECIFIC TRAP / MECHANISM) *
              </label>

              {availableSubtopics.length > 0 && !customChapterMode && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {availableSubtopics.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSubtopic(st)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                        subtopic === st
                          ? "bg-blue-600 border-blue-600 text-white font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
                required
              />
            </div>
          </div>

          {/* Section 3: Root Cause, Level & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">ERROR ROOT CAUSE</label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as ErrorType)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
              >
                {ERROR_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">QUESTION SOURCE</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as QuestionSource)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
              >
                {QUESTION_SOURCES.map((qs) => (
                  <option key={qs} value={qs}>
                    {qs}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">EXAM LEVEL</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as ExamLevel)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
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
                <label className="block text-[11px] font-mono text-blue-700 font-bold">
                  KEY CONCEPT / FORMULA (LaTeX ENABLED $...$)
                </label>
                <span className="text-[10px] font-mono text-orange-600 font-bold">
                  RAR: Remember As Result
                </span>
              </div>
              <input
                type="text"
                value={keyConcept}
                onChange={(e) => setKeyConcept(e.target.value)}
                placeholder="e.g. $I_{total} = \\int r^2 dm$, or $\\Delta H = \\Delta U + \\Delta n_g RT$"
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-orange-700 mb-1 font-bold">
                STUDENT NOTE / WHY DID I MESS UP?
              </label>
              <textarea
                rows={2}
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder="e.g. I forgot the non-inertial pseudo force term when switching to the accelerated trolley frame."
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">
                FULL OCR TEXT (AUTOMATICALLY EXTRACTED FOR SEARCH)
              </label>
              <textarea
                rows={3}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Question text transcribed verbatim for instant search after 1.5+ years..."
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 custom-scrollbar shadow-xs"
              />
            </div>
          </div>

          {/* Section 5: Cross-Topic Tags */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono text-slate-600 font-semibold">
              CROSS-CONCEPT TAGS (#Rotation+Electrostatics, etc.)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    tags.includes(tag)
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
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
                className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer shadow-xs"
              >
                + Add Tag
              </button>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="h-14 sm:h-16 px-3.5 sm:px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isCompressing}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Question to Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
