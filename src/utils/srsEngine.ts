import { QuestionMistake, SRSStage, AppSettings } from "../types/vault";

export type SRSGrade = "again" | "hard" | "good" | "easy";

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function addDaysToDate(baseDate: string | Date, days: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function isDueToday(nextReviewDate: string): boolean {
  const today = getTodayDateString();
  return nextReviewDate <= today;
}

export function isNemesisQuestion(q: QuestionMistake): boolean {
  return q.attemptCount >= 2 && q.status === 1;
}

export function isSillyMistake(q: QuestionMistake): boolean {
  return q.errorType === "Silly / Calculation" || q.errorType === "Question Misread";
}

export function calculateSRSUpdate(
  current: QuestionMistake,
  grade: SRSGrade,
  solveTimeSeconds?: number,
  settings?: AppSettings
): {
  status: SRSStage;
  nextReviewDate: string;
  attemptCount: number;
  lastReviewedAt: string;
  bestSolveTimeSeconds?: number;
  lastSolveTimeSeconds?: number;
} {
  const intervals = settings?.srsIntervals || {
    stage1: 3,
    stage2: 7,
    stage3: 21,
    stage4: 60,
  };

  let newStatus: SRSStage = current.status;
  let daysToAdd = 1;

  switch (grade) {
    case "again":
      // Reset to Stage 1, review tomorrow
      newStatus = 1;
      daysToAdd = 1;
      break;

    case "hard":
      // Demote or keep at Stage 1/2, review in 3 days
      newStatus = current.status > 1 ? ((current.status - 1) as SRSStage) : 1;
      daysToAdd = intervals.stage1; // 3 days
      break;

    case "good":
      // Promote stage up to Stage 4
      newStatus = current.status < 4 ? ((current.status + 1) as SRSStage) : 4;
      if (newStatus === 2) daysToAdd = intervals.stage2;
      else if (newStatus === 3) daysToAdd = intervals.stage3;
      else daysToAdd = intervals.stage4;
      break;

    case "easy":
      // Direct jump to Stage 4: Mastered
      newStatus = 4;
      daysToAdd = intervals.stage4;
      break;
  }

  const now = new Date();
  const nextReviewDate = addDaysToDate(now, daysToAdd);

  let bestSolveTime = current.bestSolveTimeSeconds;
  if (solveTimeSeconds !== undefined && solveTimeSeconds > 0) {
    if (!bestSolveTime || solveTimeSeconds < bestSolveTime) {
      bestSolveTime = solveTimeSeconds;
    }
  }

  return {
    status: newStatus,
    nextReviewDate,
    attemptCount: current.attemptCount + 1,
    lastReviewedAt: now.toISOString(),
    bestSolveTimeSeconds: bestSolveTime,
    lastSolveTimeSeconds: solveTimeSeconds,
  };
}
