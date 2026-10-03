import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { AuthUser } from "../types/auth";
import {
  loginUser,
  registerUser,
  hasAnyRegisteredAccounts,
  getRegisteredAccountsList,
} from "../services/authService";

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(!hasAnyRegisteredAccounts());
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetYear, setTargetYear] = useState("JEE Advanced 2026");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredAccounts, setRegisteredAccounts] = useState<
    { email: string; username: string; avatarColor?: string }[]
  >([]);

  useEffect(() => {
    setRegisteredAccounts(getRegisteredAccountsList());
  }, []);

  const handleSelectQuickAccount = (quickEmail: string) => {
    setEmail(quickEmail);
    setIsRegisterMode(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // First-time Registration: Requires Username, Email, Password
        const user = await registerUser({
          username,
          email,
          password,
          targetYear,
        });
        onAuthenticated(user);
      } else {
        // Returning User Login: Requires ONLY Email and Password
        const user = await loginUser(email, password);
        onAuthenticated(user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo / Fast-Track entry
  const handleDemoAccess = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const demoEmail = "aspirant.air1@apexvault.jee";
      const demoPass = "aspirant100";
      try {
        const user = await loginUser(demoEmail, demoPass);
        onAuthenticated(user);
      } catch {
        const user = await registerUser({
          username: "Air 1 Aspirant",
          email: demoEmail,
          password: demoPass,
          targetYear: "JEE Advanced 2026",
        });
        onAuthenticated(user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05070c] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Cyber Ambient Backing Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-sky-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-sky-500/08 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-purple-500/08 rounded-full blur-3xl" />
      </div>

      {/* Main Ultra Pro Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <span className="text-[11px] font-mono text-sky-300 font-semibold tracking-wide">
              APEXVAULT · JEE ADVANCED
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Aspirant Error Vault
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-Leak Spaced Repetition &amp; Mistake Diagnosis System
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-[#090d16]/90 border border-white/[0.12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-6 backdrop-blur-xl relative overflow-hidden">
          {/* Top Mode Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-black/60 border border-white/[0.08] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                !isRegisterMode
                  ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.1]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                isRegisterMode
                  ? "bg-sky-500/20 text-sky-300 shadow-sm border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Quick-select pill for saved accounts on machine */}
          {!isRegisterMode && registeredAccounts.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                SAVED ACCOUNTS ON THIS DEVICE:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {registeredAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectQuickAccount(acc.email)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                      email.toLowerCase() === acc.email.toLowerCase()
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "bg-white/[0.03] text-slate-300 border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: acc.avatarColor || "#38bdf8" }}
                    />
                    <span>{acc.username}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-tight">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Username Field (ONLY for Register Mode) */}
            {isRegisterMode && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 font-medium flex items-center justify-between">
                  <span>ASPIRANT USERNAME</span>
                  <span className="text-[10px] text-sky-400">First-time only</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Aditya Khari / Rank1Target"
                    className="w-full bg-[#05070a] border border-white/[0.1] focus:border-sky-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            {/* 2. Email Field (Always required for both login and signup) */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-300 font-medium">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aspirant@gmail.com"
                  className="w-full bg-[#05070a] border border-white/[0.1] focus:border-sky-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* 3. Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-medium">PASSWORD</span>
                {isRegisterMode && (
                  <span className="text-[10px] text-slate-500">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#05070a] border border-white/[0.1] focus:border-sky-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Target Exam Year (Only for Register Mode) */}
            {isRegisterMode && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-300 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                  <span>TARGET EXAM GOAL</span>
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full bg-[#05070a] border border-white/[0.1] focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="JEE Advanced 2026">JEE Advanced 2026 (Class 12 / Dropper)</option>
                  <option value="JEE Advanced 2027">JEE Advanced 2027 (Class 11)</option>
                  <option value="JEE Advanced 2028">JEE Advanced 2028 (Foundation)</option>
                  <option value="JEE Main 2026">JEE Main 2026 Target</option>
                  <option value="NEET 2026">NEET 2026 Target</option>
                </select>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-xs shadow-[0_4px_20px_rgba(56,189,248,0.25)] hover:shadow-[0_6px_24px_rgba(56,189,248,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isRegisterMode ? (
                <>
                  <span>Create Aspirant Account &amp; Enter Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <span className="relative bg-[#090d16] px-3 text-[10px] font-mono text-slate-500 uppercase">
              OR QUICK EXPLORE
            </span>
          </div>

          {/* 1-Click Fast-Track Demo Button */}
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Demo Aspirant Mode</span>
          </button>
        </div>

        {/* Security & Offline Notice */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted local authentication · Works 100% offline</span>
          </p>
        </div>
      </div>
    </div>
  );
};
