export type Rating = "forgot" | "hard" | "good" | "easy";
export type ProgressStatus = "new" | "learning" | "mastered";

export interface VocabularyWord {
  id: string;
  lemma: string;
  rank: number;
  sfi: number;
  frequencyPerMillion: number;
  definitionEn: string;
  ipa: string | null;
}

export interface WordProgress {
  wordId: string;
  status: Exclude<ProgressStatus, "new">;
  reviewCount: number;
  lastReviewedAt: string | null;
  nextReviewDate: string | null;
  latestRating: Rating | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewLog {
  id?: number;
  wordId: string;
  rating: Rating;
  reviewedAt: string;
  nextReviewDate: string;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  progress: WordProgress[];
  reviewLogs: ReviewLog[];
}

export interface StudyStats {
  totalWords: number;
  learnedWords: number;
  learningWords: number;
  masteredWords: number;
  dueToday: number;
  reviewedToday: number;
  reviewHistoryCount: number;
}
