import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Camera,
  Layers,
  ArrowRight,
  Loader2,
  Sparkles,
  Share2,
  Cpu,
  QrCode,
  LayoutGrid,
  Sliders,
  Vibrate,
  Eye,
  Maximize2,
  Flame,
  BookOpen,
  Play,
  RotateCw,
} from "lucide-react";
import {
  getMobileInstallState,
  installNativeWebApk,
  downloadAndroidApkPackage,
  MobileInstallState,
} from "../services/apkDownloader";
import { QuestionMistake } from "../types/vault";
import { isDueToday } from "../utils/srsEngine";
import { MobileHaptics } from "../utils/mobileHaptics";
import { MathRenderer } from "./MathRenderer";

interface ApkDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions?: QuestionMistake[];
  onStartPractice?: () => void;
  onOpenIngestion?: () => void;
}

export const ApkDownloaderModal: React.FC<ApkDownloaderModalProps> = ({
  isOpen,
  onClose,
  questions = [],
  onStartPractice,
  onOpenIngestion,
}) => {
  const [activeTab, setActiveTab] = useState<"apk" | "widgets" | "hardware">("apk");
  const [installState, setInstallState] = useState<MobileInstallState>(getMobileInstallState());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [formulaIndex, setFormulaIndex] = useState(0);
  const [hapticTested, setHapticTested] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(MobileHaptics.isFullscreenActive());

  const dueQuestions = questions.filter((q) => isDueToday(q.nextReviewDate));
  const formulasList = questions.filter((q) => q.keyConcept).map((q) => ({
    formula: q.keyConcept,
    subject: q.subject,
    chapter: q.chapter,
    subtopic: q.subtopic,
  }));

  const currentFormula = formulasList[formulaIndex % (formulasList.length || 1)] || {
    formula: "W = -\\int P_{ext} dV = -nRT \\ln\\left(\\frac{V_2}{V_1}\\right)",
    subject: "Chemistry",
    chapter: "Thermodynamics",
    subtopic: "Isothermal Reversible Work",
  };

  useEffect(() => {
    setInstallState(getMobileInstallState());
    setIsFullscreen(MobileHaptics.isFullscreenActive());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadApk = async () => {
    try {
      MobileHaptics.tapMedium();
      setIsDownloading(true);
      setDownloadProgress(10);
      await downloadAndroidApkPackage((p) => setDownloadProgress(p));
      MobileHaptics.success();
      setDownloadCompleted(true);
    } catch (err: any) {
      alert("Download failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeInstall = async () => {
    MobileHaptics.tapMedium();
    const success = await installNativeWebApk();
    if (success) {
      MobileHaptics.success();
      onClose();
    }
  };

  const handleTestHaptic = () => {
    MobileHaptics.success();
    setHapticTested(true);
    setTimeout(() => setHapticTested(false), 1500);
  };

  const handleToggleFullscreen = async () => {
    MobileHaptics.tapLight();
    const active = await MobileHaptics.toggleFullscreen();
    setIsFullscreen(active);
  };

  // URL for QR Code
  const currentAppUrl = typeof window !== "undefined" ? window.location.href : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentAppUrl
  )}&color=2563eb`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-150 w-full max-w-full"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide truncate">
                APEXVAULT ANDROID CENTER
              </h2>
              <span className="text-[10px] font-mono text-blue-700 font-bold block">
                Mobile APK · PWA WebAPK · Touch Widgets
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Mode Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-50/70 border-b border-slate-200 flex items-center gap-1 text-xs">
          <button
            onClick={() => {
              MobileHaptics.tapLight();
              setActiveTab("apk");
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "apk"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install APK</span>
          </button>

          <button
            onClick={() => {
              MobileHaptics.tapLight();
              setActiveTab("widgets");
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "widgets"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-orange-500" />
            <span>Android Widgets</span>
          </button>

          <button
            onClick={() => {
              MobileHaptics.tapLight();
              setActiveTab("hardware");
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "hardware"
                ? "bg-white text-blue-600 shadow-xs border border-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Hardware &amp; Haptics</span>
          </button>
        </div>

        {/* Tab 1: APK & Installation */}
        {activeTab === "apk" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar text-xs">
            {/* Hero Feature Banner */}
            <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-orange-50/60 border border-blue-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span>Full Touch &amp; Widget Optimized</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-[10px] font-mono text-blue-800 font-bold">
                  100% Offline
                </span>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                Install ApexVault as a standalone Android app with full hardware acceleration, camera question snapping, zero-latency spaced repetition, and interactive home screen widgets.
              </p>

              {/* Mobile Feature Checklist */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Camera Question Snapping</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>60s Touch Flashcards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Zero-Latency SRS Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Private Local Database</span>
                </div>
              </div>
            </div>

            {/* Download Progress Bar if downloading */}
            {isDownloading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-blue-900 font-bold flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Generating ApexVault Standalone APK...
                  </span>
                  <span className="text-blue-700 font-bold">{downloadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-orange-500 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Download Completed Notification */}
            {downloadCompleted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs shadow-xs animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>ApexVault_v1.0.2_JEE_Advanced.apk</strong> downloaded! Open your phone Downloads folder or notification bar to install.
                </span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2.5">
              {/* Native Android WebAPK button if supported */}
              {installState.canPromptNativeInstall && (
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>1-Click Direct Install to Phone (WebAPK)</span>
                </button>
              )}

              {/* Direct APK File Downloader Button */}
              <button
                onClick={handleDownloadApk}
                disabled={isDownloading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download Android APK Package (.apk)</span>
              </button>

              {/* QR Code Phone Scan Button */}
              <button
                onClick={() => {
                  MobileHaptics.tapLight();
                  setShowQrCode(!showQrCode);
                }}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>{showQrCode ? "Hide QR Code" : "Scan QR Code with Phone Camera to Install"}</span>
              </button>
            </div>

            {/* QR Code Container */}
            {showQrCode && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-200">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="Scan to open on phone"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-xs block">
                    Scan with your Android camera
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Point your smartphone camera at this QR code to instantly open and install ApexVault directly on your device.
                  </p>
                </div>
              </div>
            )}

            {/* Android Side-Loading Installation Guide */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
              <h4 className="font-mono text-[11px] text-slate-800 font-bold flex items-center gap-1.5">
                <span>HOW TO INSTALL ON YOUR PHONE:</span>
              </h4>
              <ol className="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
                <li>
                  Tap <strong className="text-slate-900">"Download Android APK Package"</strong> above.
                </li>
                <li>
                  Open the downloaded <code className="text-blue-700 font-mono font-semibold">.apk</code> file from your phone's notification bar or <strong>Files / Downloads</strong> app.
                </li>
                <li>
                  If your phone asks to <em>"Allow installation from this source"</em>, toggle it on.
                </li>
                <li>
                  Tap <strong>Install</strong>. ApexVault will appear directly on your home screen and app drawer!
                </li>
              </ol>
            </div>

            {/* iOS Safari Info if on iPhone/iPad */}
            {installState.isIOS && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5 text-purple-900 text-[11px] shadow-xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-800">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Installing on iPhone / iPad (iOS):</span>
                </div>
                <p className="text-purple-700">
                  In Safari, tap the <strong>Share</strong> button (box with upward arrow) at the bottom, then scroll down and tap <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Android Home Screen Widgets */}
        {activeTab === "widgets" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-orange-500" />
                <span>Simulated Android Home Screen Widgets</span>
              </h3>
              <p className="text-slate-500 text-xs">
                When installed as an APK, ApexVault integrates directly with your mobile launcher. Test the live interactive widgets below:
              </p>
            </div>

            {/* Widget 1: Daily CBT Due & Quick Drill (4x2 Widget) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500 font-bold uppercase">WIDGET 1: CBT ACTIVE REVISION (4x2)</span>
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Live Sync
                </span>
              </div>

              {/* Simulated Android Widget Card */}
              <div className="p-4 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-2 border-slate-300 rounded-2xl shadow-md space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      AV
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Due for Review</div>
                      <div className="text-[10px] font-mono text-slate-500">ApexVault CBT Drill</div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
                    {dueQuestions.length} Questions
                  </span>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Class 12 / Dropper SRS Queue</span>
                    <span className="font-bold text-blue-700">
                      {dueQuestions.length > 0 ? "Drill Ready" : "All Caught Up"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Physics: {questions.filter((q) => q.subject === "Physics" && isDueToday(q.nextReviewDate)).length} ·
                    Chemistry: {questions.filter((q) => q.subject === "Chemistry" && isDueToday(q.nextReviewDate)).length} ·
                    Math: {questions.filter((q) => q.subject === "Mathematics" && isDueToday(q.nextReviewDate)).length}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      MobileHaptics.success();
                      onClose();
                      if (onStartPractice) onStartPractice();
                    }}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch CBT Drill ({dueQuestions.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      MobileHaptics.tapLight();
                      onClose();
                      if (onOpenIngestion) onOpenIngestion();
                    }}
                    className="py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    + Log
                  </button>
                </div>
              </div>
            </div>

            {/* Widget 2: Formula & RAR Principle of the Day (4x1 Widget) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500 font-bold uppercase">WIDGET 2: FORMULA OF THE DAY (4x1)</span>
                <button
                  onClick={() => {
                    MobileHaptics.tapLight();
                    setFormulaIndex((i) => i + 1);
                  }}
                  className="text-orange-600 hover:text-orange-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Next</span>
                </button>
              </div>

              {/* Simulated Formula Widget */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50/70 via-white to-orange-50/50 border-2 border-slate-300 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="font-bold text-blue-700">{currentFormula.subject}</span>
                  <span className="truncate">{currentFormula.chapter}</span>
                  <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 font-bold">RAR</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 overflow-x-auto text-xs font-mono text-slate-900">
                  <MathRenderer content={currentFormula.formula} />
                </div>
              </div>
            </div>

            {/* Widget 3: Quick App Shortcuts */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500 font-bold uppercase block">
                ANDROID LONG-PRESS APP SHORTCUTS:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Snap Mistake</div>
                    <div className="text-[10px] text-slate-500">Camera OCR</div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                    <Play className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Daily Drill</div>
                    <div className="text-[10px] text-slate-500">Blind Practice</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hardware & Mobile Controls */}
        {activeTab === "hardware" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar text-xs">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Mobile Hardware &amp; Performance</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Fine-tune hardware settings for your smartphone when running the APK or installed WebAPK:
              </p>
            </div>

            {/* Vibration Haptic Feedback Setting */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Vibrate className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Tactile Vibration Haptics</span>
                    <span className="text-[11px] text-slate-500 block">
                      Subtle tactile buzz on CBT grading, buttons &amp; timer alerts
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleTestHaptic}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {hapticTested ? "Buzzing!" : "Test Buzz"}
                </button>
              </div>
            </div>

            {/* Screen Wake Lock Setting */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Screen Keep-Awake (WakeLock)</span>
                    <span className="text-[11px] text-slate-500 block">
                      Prevents phone display from sleeping while solving questions
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-mono text-[10px] font-bold">
                  Active in CBT
                </span>
              </div>
            </div>

            {/* Fullscreen Immersive Mode */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Immersive Full-Screen Mode</span>
                    <span className="text-[11px] text-slate-500 block">
                      Hides phone system navigation and status bars
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleFullscreen}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs transition-colors cursor-pointer active:scale-95"
                >
                  {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
