export type SubjectType = "Physics" | "Chemistry" | "Mathematics";

export type ExamLevel = "JEE Main" | "JEE Advanced" | "Olympiad";

export type ErrorType =
  | "Conceptual Gap"
  | "Silly / Calculation"
  | "Formula Forgotten"
  | "Question Misread"
  | "Lengthy / Approach Issue"
  | "Unattempted / Tough";

export type QuestionSource =
  | "Coaching Test"
  | "JEE Adv PYQ"
  | "JEE Main PYQ"
  | "Irodov / SBT / Pathfinder"
  | "Cengage / PG"
  | "Vikas Gupta / N. Avasthi / Neeraj Kumar"
  | "Class Notes";

export type SRSStage = 1 | 2 | 3 | 4;

export interface QuestionMistake {
  id: string; // e.g. "VAULT-2026-0042"
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  subject: SubjectType;
  unit: string;
  chapter: string;
  subtopic: string;
  level: ExamLevel;
  errorType: ErrorType;
  source: QuestionSource;
  tags: string[]; // e.g. ["#Rotation+Electrostatics", "#GraphTrap"]
  
  // OCR & Core concepts
  ocrText: string;
  keyConcept: string; // LaTeX enabled Remember As Result (RAR)
  studentNote: string; // "I missed the fictitious centrifugal term in non-inertial frame"
  correctAnswer?: string; // e.g. "Option C (4.5 J)"

  // Images stored as WebP Data URLs or cloud storage path IDs
  questionImage: string; // compressed webp data url
  solutionImage?: string; // optional solution/rough work image

  // Spaced Repetition System (SRS)
  status: SRSStage; // 1: Critical (3d), 2: Learning (7d), 3: Familiar (21d), 4: Mastered (60d)
  attemptCount: number;
  lastReviewedAt?: string;
  nextReviewDate: string; // YYYY-MM-DD
  bestSolveTimeSeconds?: number;
  lastSolveTimeSeconds?: number;
  starred?: boolean;
}

export type WorkspaceView = "gallery" | "folders" | "table" | "analytics" | "formulas" | "flashcards";

export interface FilterState {
  searchQuery: string;
  subject: SubjectType | "ALL";
  unit: string | "ALL";
  chapter: string | "ALL";
  errorTypes: ErrorType[];
  sources: QuestionSource[];
  levels: ExamLevel[];
  srsStages: SRSStage[];
  tags: string[];
  smartPreset: "all" | "due_today" | "nemesis" | "silly_checklist" | "starred";
}

export interface SyncState {
  isIndexedDbReady: boolean;
  isDriveConnected: boolean;
  driveUserEmail?: string;
  isLocalDirMounted: boolean;
  localDirName?: string;
  isSyncing: boolean;
  lastSyncTime?: string;
  syncError?: string;
}

export type AppTheme = "solar" | "obsidian" | "tokyo" | "emerald" | "amber" | "crimson" | "monochrome";

export interface AppSettings {
  googleDriveClientId: string;
  geminiModel: string;
  userApiKey?: string;
  theme?: AppTheme;
  srsIntervals: {
    stage1: number; // default 3 days
    stage2: number; // default 7 days
    stage3: number; // default 21 days
    stage4: number; // default 60 days
  };
  autoAiAnalyzeOnPaste: boolean;
}
