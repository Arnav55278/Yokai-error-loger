import React, { useState } from "react";
import {
  X,
  Cloud,
  HardDrive,
  FolderCheck,
  Download,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  FolderSync,
  Key,
  Sparkles,
  Palette,
} from "lucide-react";
import { AppSettings, QuestionMistake, SyncState, AppTheme } from "../types/vault";
import { APP_THEMES } from "../constants/themes";
import {
  initiateDriveAuth,
  disconnectDrive,
  syncVaultToGoogleDrive,
} from "../services/googleDriveSync";
import {
  mountLocalDirectory,
  unmountLocalDirectory,
  syncToMountedDirectory,
  isFileSystemAccessSupported,
} from "../services/localDirectorySync";
import { exportVaultZip, downloadBlob, importVaultZip } from "../services/backupZip";
import { testGeminiApiKey } from "../services/geminiClient";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => Promise<void>;
  syncState: SyncState;
  setSyncState: React.Dispatch<React.SetStateAction<SyncState>>;
  questions: QuestionMistake[];
  onImportQuestions: (imported: QuestionMistake[], importedSettings?: AppSettings) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  syncState,
  setSyncState,
  questions,
  onImportQuestions,
}) => {
  const [clientId, setClientId] = useState(settings.googleDriveClientId || "");
  const [userApiKey, setUserApiKey] = useState(settings.userApiKey || "");
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel || "gemini-3.8-flash");
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(settings.theme || "obsidian");
  const [srs1, setSrs1] = useState(settings.srsIntervals.stage1);
  const [srs2, setSrs2] = useState(settings.srsIntervals.stage2);
  const [srs3, setSrs3] = useState(settings.srsIntervals.stage3);
  const [srs4, setSrs4] = useState(settings.srsIntervals.stage4);
  const [autoAi, setAutoAi] = useState(settings.autoAiAnalyzeOnPaste ?? true);

  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [isDriveConnecting, setIsDriveConnecting] = useState(false);
  const [isLocalMounting, setIsLocalMounting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleTestApiKey = async () => {
    try {
      setIsTestingApiKey(true);
      setApiKeyTestResult(null);
      const res = await testGeminiApiKey(userApiKey.trim(), geminiModel.trim());
      if (res.success) {
        setApiKeyTestResult({ success: true, msg: `Verified: ${res.model} is operational and ready!` });
      } else {
        setApiKeyTestResult({ success: false, msg: res.error || "Failed to verify key" });
      }
    } finally {
      setIsTestingApiKey(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      const updated: AppSettings = {
        ...settings,
        theme: selectedTheme,
        googleDriveClientId: clientId.trim(),
        userApiKey: userApiKey.trim(),
        geminiModel: geminiModel.trim() || "gemini-3.8-flash",
        autoAiAnalyzeOnPaste: autoAi,
        srsIntervals: {
          stage1: Number(srs1) || 3,
          stage2: Number(srs2) || 7,
          stage3: Number(srs3) || 21,
          stage4: Number(srs4) || 60,
        },
      };
      await onSaveSettings(updated);
      setStatusMessage({ type: "success", text: "Settings saved successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleConnectDrive = async () => {
    try {
      setIsDriveConnecting(true);
      setStatusMessage(null);
      const res = await initiateDriveAuth(clientId);
      setSyncState((prev) => ({
        ...prev,
        isDriveConnected: true,
        driveUserEmail: res.email,
        lastSyncTime: new Date().toLocaleTimeString(),
      }));
      // Auto initial sync
      await syncVaultToGoogleDrive(res.accessToken, questions);
      setStatusMessage({
        type: "success",
        text: `Connected to Google Drive (${res.email}) and synced to 'ApexVault_JEE_DB'.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsDriveConnecting(false);
    }
  };

  const handleDisconnectDrive = () => {
    disconnectDrive();
    setSyncState((prev) => ({
      ...prev,
      isDriveConnected: false,
      driveUserEmail: undefined,
    }));
    setStatusMessage({ type: "success", text: "Google Drive disconnected." });
  };

  const handleForceDriveSync = async () => {
    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const res = await syncVaultToGoogleDrive(undefined, questions);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString(),
      }));
      setStatusMessage({
        type: "success",
        text: `Force Sync Complete: ${res.syncedCount} questions synced to Google Drive folder!`,
      });
    } catch (err: any) {
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
      setStatusMessage({ type: "error", text: err.message });
    }
  };

  const handleMountLocal = async () => {
    try {
      setIsLocalMounting(true);
      setStatusMessage(null);
      const dirName = await mountLocalDirectory();
      setSyncState((prev) => ({
        ...prev,
        isLocalDirMounted: true,
        localDirName: dirName,
      }));
      // Write initial mirror
      const res = await syncToMountedDirectory(questions);
      setStatusMessage({
        type: "success",
        text: `Mounted folder '${dirName}'. Mirrored ${res.writtenCount} questions and vault_index.json.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsLocalMounting(false);
    }
  };

  const handleUnmountLocal = () => {
    unmountLocalDirectory();
    setSyncState((prev) => ({
      ...prev,
      isLocalDirMounted: false,
      localDirName: undefined,
    }));
    setStatusMessage({ type: "success", text: "Local directory unmounted." });
  };

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      const blob = await exportVaultZip(questions, settings);
      const filename = `ApexVault_JEE_Backup_${new Date().toISOString().split("T")[0]}.zip`;
      downloadBlob(blob, filename);
      setStatusMessage({ type: "success", text: `Exported full backup ZIP with ${questions.length} questions.` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setIsImporting(true);
      setStatusMessage(null);
      const file = e.target.files[0];
      const result = await importVaultZip(file);
      await onImportQuestions(result.questions, result.settings);
      setStatusMessage({
        type: "success",
        text: `Restored ${result.questions.length} questions from ${file.name}!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold font-mono text-slate-900">STORAGE &amp; ZERO-DATA-LOSS SYNC</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs shadow-xs ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}
            >
              {statusMessage.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Visual Theme & Accent Palette Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-mono">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>VISUAL THEMES &amp; COLOR PALETTES</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                White/Blue/Orange &amp; Themes
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Select your preferred color theme. Changes take effect instantly and persist across reloads.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {APP_THEMES.map((t) => {
                const isSelected = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: t.accentHex }}
                        />
                        <span className="font-bold text-xs text-slate-900">{t.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {t.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tier 1: Google Drive REST API v3 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 font-bold font-mono">
                <Cloud className="w-4 h-4" />
                <span>TIER 1 — GOOGLE DRIVE CLOUD SYNC (OAUTH2)</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                syncState.isDriveConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                  : "bg-white border-slate-200 text-slate-500"
              }`}>
                {syncState.isDriveConnected ? "CONNECTED" : "NOT CONNECTED"}
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              Automatically creates or updates <code className="text-blue-700 font-mono font-semibold">ApexVault_JEE_DB</code> in your Google Drive. Images and the master <code className="text-blue-700 font-mono font-semibold">vault_index.json</code> are synced seamlessly.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-600 font-semibold">
                GOOGLE CLOUD OAUTH CLIENT ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g. 1234567890-abc...apps.googleusercontent.com"
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              {!syncState.isDriveConnected ? (
                <button
                  type="button"
                  onClick={handleConnectDrive}
                  disabled={isDriveConnecting || !clientId.trim()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isDriveConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                  <span>Connect Google Drive</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleForceDriveSync}
                    disabled={syncState.isSyncing}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {syncState.isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderSync className="w-3.5 h-3.5" />}
                    <span>Force Cloud Sync Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectDrive}
                    className="px-3 py-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tier 2: Live Local Folder Mirror */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 font-bold font-mono">
                <FolderCheck className="w-4 h-4" />
                <span>TIER 2 — LIVE LOCAL / G-DRIVE DESKTOP FOLDER MIRROR</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                syncState.isLocalDirMounted
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                  : "bg-white border-slate-200 text-slate-500"
              }`}>
                {syncState.isLocalDirMounted ? `MOUNTED: ${syncState.localDirName}` : "UNMOUNTED"}
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              Mount any local directory on your PC (or your local Google Drive Desktop folder). Writes <code className="text-blue-700 font-mono font-semibold">/images/[Subject]/[Chapter]/*.webp</code> and <code className="text-blue-700 font-mono font-semibold">vault_index.json</code> directly to your hard drive on every change.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {!syncState.isLocalDirMounted ? (
                <button
                  type="button"
                  onClick={handleMountLocal}
                  disabled={isLocalMounting || !isFileSystemAccessSupported()}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isLocalMounting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5 text-blue-600" />}
                  <span>Mount Local / G-Drive Desktop Folder</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await syncToMountedDirectory(questions);
                        setStatusMessage({ type: "success", text: `Mirrored ${res.writtenCount} questions to local disk!` });
                      } catch (err: any) {
                        setStatusMessage({ type: "error", text: err.message });
                      }
                    }}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sync to Local Disk Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleUnmountLocal}
                    className="px-3 py-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Unmount
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tier 3: 1-Click ZIP Backup */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="text-blue-700 font-bold font-mono">
              TIER 3 — 1-CLICK ZIP EXPORT / IMPORT BACKUP
            </div>
            <p className="text-slate-600 text-[11px]">
              Full standalone offline backup containing all WebP question images, solutions, and full-text OCR database.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportZip}
                disabled={isExporting}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
                <span>Export Full Backup (.zip)</span>
              </button>

              <label className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-blue-600" />}
                <span>Restore Backup (.zip)</span>
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleImportZip}
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {/* SRS Spaced Repetition Intervals */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="text-slate-800 font-bold font-mono">
              SPACED REPETITION (SRS) INTERVALS (DAYS)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">STAGE 1 (CRITICAL)</label>
                <input
                  type="number"
                  value={srs1}
                  onChange={(e) => setSrs1(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">STAGE 2 (LEARNING)</label>
                <input
                  type="number"
                  value={srs2}
                  onChange={(e) => setSrs2(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">STAGE 3 (FAMILIAR)</label>
                <input
                  type="number"
                  value={srs3}
                  onChange={(e) => setSrs3(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1 font-semibold">STAGE 4 (MASTERED)</label>
                <input
                  type="number"
                  value={srs4}
                  onChange={(e) => setSrs4(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* AI Vision Model & API Key Configuration */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 font-bold font-mono">
                <Key className="w-4 h-4" />
                <span>GEMINI API KEY &amp; CUSTOM MODEL ENGINE</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                {userApiKey.trim() ? "Custom Key Configured" : "Using Server Key (Default)"}
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Add your Google Gemini API key directly to the application and write any custom Gemini model name. If left blank, ApexVault will automatically fall back to the environment API key.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-700 mb-1 font-semibold">
                  GEMINI API KEY (ENTER DIRECTLY IN WEBSITE)
                </label>
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="AIzaSy... (paste your API key here)"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono text-slate-700 font-semibold">
                    MODEL NAME (WRITE YOUR OWN)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Any valid @google/genai model
                  </span>
                </div>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  placeholder="e.g. gemini-3.8-flash, gemini-3.1-pro-preview, gemini-2.5-flash"
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-500 shadow-xs"
                />

                {/* Quick Model Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "gemini-3.8-flash",
                    "gemini-2.5-flash",
                    "gemini-2.0-flash",
                    "gemini-1.5-flash",
                    "gemini-1.5-pro",
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setGeminiModel(m)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                        geminiModel === m
                          ? "bg-blue-600 border-blue-600 text-white font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Test Button & Status */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="text-[11px]">
                  {apiKeyTestResult && (
                    <span className={apiKeyTestResult.success ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                      {apiKeyTestResult.msg}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={isTestingApiKey}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {isTestingApiKey ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>Test API Key &amp; Model</span>
                </button>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAi}
                    onChange={(e) => setAutoAi(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <span className="text-slate-700 text-xs font-medium">
                    Auto-analyze question screenshot with AI on paste
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 rounded transition-colors font-medium cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSaveGeneral}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
