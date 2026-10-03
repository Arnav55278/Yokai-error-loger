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
} from "lucide-react";
import {
  getMobileInstallState,
  installNativeWebApk,
  downloadAndroidApkPackage,
  MobileInstallState,
} from "../services/apkDownloader";

interface ApkDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloaderModal: React.FC<ApkDownloaderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [installState, setInstallState] = useState<MobileInstallState>(getMobileInstallState());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  useEffect(() => {
    setInstallState(getMobileInstallState());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadApk = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      await downloadAndroidApkPackage((p) => setDownloadProgress(p));
      setDownloadCompleted(true);
    } catch (err: any) {
      alert("Download failed: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativeInstall = async () => {
    const success = await installNativeWebApk();
    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-150 w-full max-w-full"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#090d16] border border-white/[0.12] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-13 sm:h-14 px-4 sm:px-6 border-b border-white/[0.08] bg-[#06080e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                APEXVAULT FOR ANDROID
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold block">
                Official Mobile APK · v1.0.2
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar text-xs">
          {/* Hero Feature Banner */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-sky-950/20 to-black border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Full Touch &amp; Widget Optimized</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-bold">
                100% Offline
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Install the complete ApexVault JEE Advanced experience directly on your smartphone. All active recall algorithms, CBT test practice, and camera ingestion widgets are built-in.
            </p>

            {/* Mobile Feature Checklist */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Camera Question Snapping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>60s Touch Flashcards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Zero-Latency SRS Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Private Local Database</span>
              </div>
            </div>
          </div>

          {/* Download Progress Bar if downloading */}
          {isDownloading && (
            <div className="p-4 bg-[#05070a] border border-sky-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  Generating ApexVault Standalone APK...
                </span>
                <span className="text-sky-400 font-bold">{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Download Completed Notification */}
          {downloadCompleted && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>1-Click Direct Install to Phone (WebAPK)</span>
              </button>
            )}

            {/* Direct APK File Downloader Button */}
            <button
              onClick={handleDownloadApk}
              disabled={isDownloading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Android APK Package (.apk)</span>
            </button>
          </div>

          {/* Android Side-Loading Installation Guide */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2.5">
            <h4 className="font-mono text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
              <span>HOW TO INSTALL ON YOUR PHONE:</span>
            </h4>
            <ol className="space-y-1.5 text-[11px] text-slate-400 list-decimal list-inside leading-relaxed">
              <li>
                Tap <strong className="text-slate-200">"Download Android APK Package"</strong> above.
              </li>
              <li>
                Open the downloaded <code className="text-sky-300 font-mono">.apk</code> file from your phone's notification bar or <strong>Files / Downloads</strong> app.
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
            <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <Share2 className="w-3.5 h-3.5" />
                <span>Installing on iPhone / iPad (iOS):</span>
              </div>
              <p>
                In Safari, tap the <strong>Share</strong> button (box with upward arrow) at the bottom, then scroll down and tap <strong>"Add to Home Screen"</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
