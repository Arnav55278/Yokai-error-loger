import React, { useState, useEffect } from "react";
import { Smartphone, Download, X, Sparkles } from "lucide-react";
import { getMobileInstallState } from "../services/apkDownloader";

interface MobileApkBannerProps {
  onOpenApkModal: () => void;
}

export const MobileApkBanner: React.FC<MobileApkBannerProps> = ({ onOpenApkModal }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const state = getMobileInstallState();
    // Only show if on mobile or small screen and not already installed as standalone
    if (state.isMobile && !state.isStandalone) {
      const dismissedTime = localStorage.getItem("apex_apk_banner_dismissed");
      if (!dismissedTime || Date.now() - Number(dismissedTime) > 1000 * 60 * 60 * 24) {
        setIsMobile(true);
      }
    }
  }, []);

  if (!isMobile || isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem("apex_apk_banner_dismissed", Date.now().toString());
  };

  return (
    <div
      onClick={onOpenApkModal}
      className="md:hidden bg-gradient-to-r from-blue-50 via-white to-orange-50 border-b border-blue-200/80 px-3.5 py-2 flex items-center justify-between gap-2 text-xs select-none cursor-pointer animate-in slide-in-from-top duration-200 sticky top-13 sm:top-14 z-20 shadow-xs"
    >
      <div className="flex items-center gap-2 truncate">
        <div className="p-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
          <Smartphone className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <span className="font-bold text-slate-900 text-[11px] block truncate">
            Install ApexVault Android App
          </span>
          <span className="text-[10px] font-mono text-blue-700 font-medium block truncate">
            Full Touch Widgets &amp; Offline APK
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenApkModal();
          }}
          className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] font-mono shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Get APK</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-700"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
