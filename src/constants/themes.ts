import { AppTheme } from "../types/vault";

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  subtitle: string;
  accentHex: string;
  dotColor: string;
  bgHex: string;
  cardBgHex: string;
  borderHex: string;
  glowRgba: string;
}

export const APP_THEMES: ThemeConfig[] = [
  {
    id: "obsidian",
    name: "Obsidian Space",
    subtitle: "Linear default with cyan neon glow",
    accentHex: "#38bdf8",
    dotColor: "bg-sky-400",
    bgHex: "#05070c",
    cardBgHex: "#090d16",
    borderHex: "rgba(56, 189, 248, 0.25)",
    glowRgba: "rgba(56, 189, 248, 0.15)",
  },
  {
    id: "tokyo",
    name: "Tokyo Cyberpunk",
    subtitle: "Deep indigo with electric purple & magenta",
    accentHex: "#a855f7",
    dotColor: "bg-purple-500",
    bgHex: "#07060f",
    cardBgHex: "#0d0c1c",
    borderHex: "rgba(168, 85, 247, 0.3)",
    glowRgba: "rgba(168, 85, 247, 0.18)",
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    subtitle: "Stealth dark pine with bright mint terminal",
    accentHex: "#10b981",
    dotColor: "bg-emerald-400",
    bgHex: "#040907",
    cardBgHex: "#08130e",
    borderHex: "rgba(16, 185, 129, 0.3)",
    glowRgba: "rgba(16, 185, 129, 0.16)",
  },
  {
    id: "amber",
    name: "Molten Amber",
    subtitle: "Warm dark espresso with golden embers",
    accentHex: "#f59e0b",
    dotColor: "bg-amber-400",
    bgHex: "#090704",
    cardBgHex: "#140f08",
    borderHex: "rgba(245, 158, 11, 0.3)",
    glowRgba: "rgba(245, 158, 11, 0.16)",
  },
  {
    id: "crimson",
    name: "Crimson Apex",
    subtitle: "High-intensity carbon with ruby laser accents",
    accentHex: "#f43f5e",
    dotColor: "bg-rose-500",
    bgHex: "#0a0406",
    cardBgHex: "#14080c",
    borderHex: "rgba(244, 63, 94, 0.3)",
    glowRgba: "rgba(244, 63, 94, 0.18)",
  },
  {
    id: "monochrome",
    name: "Pitch Minimalist",
    subtitle: "Pure pitch black with stark platinum contrast",
    accentHex: "#f8fafc",
    dotColor: "bg-white",
    bgHex: "#000000",
    cardBgHex: "#080808",
    borderHex: "rgba(255, 255, 255, 0.25)",
    glowRgba: "rgba(255, 255, 255, 0.1)",
  },
];
